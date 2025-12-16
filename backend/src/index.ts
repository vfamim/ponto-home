import "dotenv/config";

import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./lib/env";
import { prisma } from "./lib/prisma";
import { logger } from "./lib/logger";
import { checkinRouter } from "./routes/checkins";
import { peopleRouter } from "./routes/people";

const app = express();

app.use(express.json());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(
  pinoHttp({
    logger
  })
);

app.get("/health", async (_req, res) => {
  const dbOk = await prisma
    .$queryRaw`SELECT 1`
    .then(() => true)
    .catch(() => false);
  res.json({ ok: true, db: dbOk });
});

app.use("/api/checkins", checkinRouter);
app.use("/api/people", peopleRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ message: "Internal server error" });
});

app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT}`);
});
