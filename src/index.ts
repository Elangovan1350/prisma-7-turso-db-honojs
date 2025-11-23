import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const prisma = new PrismaClient({ adapter });

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/journals", async (c) => {
  const journals = await prisma.journal.findMany();
  return c.json(journals);
});

app.get("/journaladd", async (c) => {
  const newJournal = await prisma.journal.create({
    data: {
      title: "My First Journal",
      content: "This is the content of my first journal entry.",
    },
  });
  return c.json(newJournal);
});

if (process.env.NODE_ENV !== "production") {
  serve(
    {
      fetch: app.fetch,
      port: 3001,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  );
}

export default app;
