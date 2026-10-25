import bcrypt from "bcryptjs";
import { dataSource } from "./data-source.js";
import { User } from "../users/user.entity.js";

const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
const password = process.env.SEED_USER_PASSWORD;
if (!email || !password) {
  throw new Error(
    "Set SEED_USER_EMAIL and SEED_USER_PASSWORD in .env before running the seed command",
  );
}
if (
  Buffer.byteLength(password, "utf8") < 12 ||
  Buffer.byteLength(password, "utf8") > 72
) {
  throw new Error("SEED_USER_PASSWORD must be between 12 and 72 UTF-8 bytes");
}

await dataSource.initialize();
try {
  const users = dataSource.getRepository(User);
  const existingUser = await users.findOneBy({ email });
  if (existingUser) {
    console.info(`Seed user ${email} already exists; skipping.`);
  } else {
    const user = await users.save(
      users.create({
        email,
        passwordHash: await bcrypt.hash(password, 12),
      }),
    );
    console.info(`Created seed user ${email} (${user.id}).`);
  }
} finally {
  await dataSource.destroy();
}
