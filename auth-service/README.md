# Auth service

A NestJS authentication service backed by MySQL. It provides registration, login,
and single-use password reset links delivered over SMTP.

## Run locally

1. Create a MySQL database and user.
2. Copy `.env.example` to `.env` and set the database, JWT, and SMTP values.
3. Install dependencies with `yarn install`.
4. Run the database migration with `yarn migration:run`.
5. Start the service with `yarn start:dev`.

The API listens on port `3003` by default. The migration and seed commands are
separate: `yarn migration:run` creates the `users` table, while
`yarn seed` inserts the initial user configured by `SEED_USER_EMAIL` and
`SEED_USER_PASSWORD` in `.env`. Both commands are safe to rerun: migrations are
tracked by TypeORM, and the seeder skips an email that already exists.
`DB_SYNCHRONIZE` is retained for compatibility but schema synchronization is
disabled; use migrations in every environment.

## Endpoints

| Method | Path | Request body |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | `{ "name": "Person", "email": "person@example.com", "password": "a-long-password" }` |
| POST | `/api/v1/auth/login` | `{ "email": "person@example.com", "password": "a-long-password" }` |
| POST | `/api/v1/auth/password-reset/request` | `{ "email": "person@example.com" }` |
| POST | `/api/v1/auth/password-reset/confirm` | `{ "token": "token-from-email-link", "newPassword": "another-long-password" }` |

Registration requires a `name` along with email and password. On successful
registration, auth-service publishes a `user.registered.v1` event to Kafka with
the user's ID and name. `KAFKA_BROKERS` defaults to `localhost:9092`; start
Kafka and create the `user.registered.v1` topic before starting auth-service.
Registration waits for Kafka to acknowledge the event before returning a
short-lived JWT as `accessToken` and the user object. `JWT_EXPIRES_IN` is the
token lifetime in seconds. Requests are
limited to 10 per minute per client IP. Reset requests always return the same
message to avoid exposing whether an email address is registered. Reset tokens
expire after 30 minutes, are stored only as hashes, and can be used once.

Application and HTTP request logs are written under
`logs/YYYY-MM-DD/info.log` and `logs/YYYY-MM-DD/error.log` in this service
directory, using UTC date folders. Errors and fatal logs go to `error.log`;
all other levels go to `info.log`. Each line is formatted as
`YYYY-MM-DD HH:mm:ss Utc : content`, with the log details encoded as JSON.
HTTP log entries include the route, method, status code, and duration; request
bodies and query strings are not logged. In Docker, the `logs/` folder is
bind-mounted so files persist on the host.
