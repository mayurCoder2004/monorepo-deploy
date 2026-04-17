import { prismaClient } from "db/client";

export const dynamic = "force-dynamic";

function getDatabaseErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = String((err as { code?: unknown }).code);
    if (code === "P1001") {
      return "Cannot reach PostgreSQL at localhost:5432. Start your database server and retry.";
    }

    if (code === "P2021") {
      return "Database tables are missing. Run Prisma migrations and retry.";
    }
  }

  if (err instanceof Error) {
    const nestedCause =
      typeof err.cause === "object" && err.cause instanceof Error
        ? err.cause.message
        : "";

    const combinedMessage = [err.message, nestedCause].filter(Boolean).join("\n");

    if (
      combinedMessage.includes("Can't reach database server") ||
      combinedMessage.includes("ECONNREFUSED") ||
      combinedMessage.includes("connect ECONNREFUSED")
    ) {
      return "Cannot connect to PostgreSQL. Ensure the server is running and DATABASE_URL is correct.";
    }

    const lines = combinedMessage
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const migrationLine = lines.find(
      (line) => line.includes("table") && line.includes("does not exist"),
    );
    if (migrationLine) {
      return "Database tables are missing. Run Prisma migrations and retry.";
    }

    const cleanLine = lines.find((line) => {
      const normalized = line.toLowerCase();
      return (
        !line.includes("Invalid `") &&
        !line.includes("__TURBOPACK__") &&
        !line.includes("invocation") &&
        !normalized.includes(".next\\dev\\server\\chunks") &&
        !normalized.includes(".js:") &&
        !normalized.includes("app\\page.tsx")
      );
    });

    return cleanLine ?? "Database query failed. Check database connection and migrations.";
  }

  return "Database request failed";
}

export default async function Home() {
  try {
    const users = await prismaClient.user.findMany();

    return (
      <div>
        {JSON.stringify(users)}
      </div>
    );
  } catch (err: unknown) {
    const message = getDatabaseErrorMessage(err);

    return (
      <div>
        Database is unavailable: {message}
      </div>
    );
  }
}