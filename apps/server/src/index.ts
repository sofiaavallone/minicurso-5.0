import cors from "cors";
import express from "express";
import { prisma } from "./lib/prisma";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { lettersRouter } from "./routes/letters.route";
import { usersRouter } from "./routes/users.route";

const app = express();

app.use(cors({ origin: process.env.WEB_URL ?? "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/users", usersRouter);
app.use("/letters", lettersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;

async function start() {
  await prisma.$connect();
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`);
    console.log(`📦 Successfully connected with database`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
