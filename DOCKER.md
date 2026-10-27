# Run Kafka and services with Docker

Docker Compose provides a local single-broker Kafka service and builds/runs
auth-service, user-service, and product-service. Application services use the
existing MySQL server on the host machine; Compose does not start or modify a
database container. Kafka is configured as a local development broker with
plaintext listeners; do not expose it to untrusted networks.

## Configure

1. Ensure Docker Desktop is running and the local MySQL server is accepting
   connections.
2. Configure `auth-service/.env`, `user-service/.env`, and
   `product-service/.env` with local MySQL credentials and database names. The
   Compose file overrides `DB_HOST` to `host.docker.internal` so containers
   connect to the host.
3. Set the same `JWT_SECRET` in both service environment files.
4. Start Kafka and provision the registration topic before either API:

   ```sh
   docker compose -f compose.yaml up -d kafka kafka-init
   docker compose -f compose.yaml ps kafka kafka-init
   ```

5. Create the databases and apply migrations from the host before starting the
   APIs:

   ```sh
   cd auth-service && yarn migration:run
   cd ../user-service && yarn migration:run
   cd ../product-service && yarn migration:run && yarn seed
   ```

   The product migrations create category, product, image, specification, and
   tag tables. Its seed command imports root `product.json` in one transaction.
   These commands use the database settings in each service's `.env`; use
   `DB_HOST=localhost` for host-side commands.

## Start the APIs

From this workspace directory:

```sh
docker compose -f compose.yaml up --build -d auth-service user-service product-service
```

Compose runs the APIs in Nest watch mode and bind-mounts each service's source
directory. Saving service source changes automatically rebuilds and restarts
the corresponding app. Both services wait for Kafka's health check and topic
setup. Product service is independent of Kafka and serves port `3003`.

The product container mounts root `product.json` at
`/catalog/product.json` for seeding.

Changes to `package.json` or `yarn.lock` require rebuilding the corresponding
service so its dependencies are updated:

```sh
docker compose -f compose.yaml up --build -d auth-service
docker compose -f compose.yaml up --build -d user-service
docker compose -f compose.yaml up --build -d product-service
```

To follow application startup and watch-mode rebuilds:

```sh
docker compose -f compose.yaml logs -f auth-service user-service product-service
```

The Dockerfiles also retain a production runtime image target for deployments;
the Compose setup in this guide intentionally uses the development target.
When running either API outside Docker, configure `KAFKA_BROKERS=localhost:9092`
and create the topic before starting either API:

```sh
docker compose -f compose.yaml exec -T kafka \
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 \
  --create --if-not-exists --topic user.registered.v1 \
  --partitions 1 --replication-factor 1
```

Each service writes JSON Lines logs to `logs/YYYY-MM-DD/info.log` and
`logs/YYYY-MM-DD/error.log` in its own folder, using UTC date folders. Errors
and fatal logs go to `error.log`; other levels go to `info.log`. Each line
uses the format `YYYY-MM-DD HH:mm:ss Utc : content`, with log details encoded
as JSON. Docker bind-mounts these folders from the host workspace, so logs
persist after containers stop or are recreated.

The services are available at:

- Auth: `http://localhost:3001/api/v1/auth/...`
- User profile: `http://localhost:3002/api/v1/profile` (send the auth service
  access token as `Authorization: Bearer <token>`)
- Categories: `http://localhost:3003/api/v1/categories`
- Products: `http://localhost:3003/api/v1/products`

All APIs use the `/api/v1` prefix.
To stop the services, press Ctrl+C, or run
`docker compose -f compose.yaml down` from this directory.
