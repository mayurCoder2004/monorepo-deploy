import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as dotenvConfig } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.resolve(currentFileDir, "../../.env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });

export const prismaClient = new PrismaClient({ adapter });