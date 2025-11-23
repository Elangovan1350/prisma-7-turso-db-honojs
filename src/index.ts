import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.LOCAL_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncUrl: process.env.TURSO_DATABASE_URL!,
});
const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const prisma = new PrismaClient({
  adapter,
});
const app = new Hono();

app.use("*", async (c, next) => {
  client.sync();
  next();
});

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
