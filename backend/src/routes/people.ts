import crypto from "node:crypto";

import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";

const createPersonSchema = z.object({
  name: z.string().min(2),
  department: z.string().optional()
});

export const peopleRouter = Router();

peopleRouter.get("/", async (_req, res) => {
  const people = await prisma.person.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json(people);
});

peopleRouter.post("/", async (req, res) => {
  const parsed = createPersonSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.format() });
  }

  const { name, department } = parsed.data;
  const qrToken = crypto.randomUUID();

  const person = await prisma.person.create({
    data: { name, department, qrToken }
  });

  res.status(201).json(person);
});

peopleRouter.post("/:id/rotate-token", async (req, res) => {
  const { id } = req.params;

  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) {
    return res.status(404).json({ message: "Pessoa não encontrada" });
  }

  const qrToken = crypto.randomUUID();
  const updated = await prisma.person.update({
    where: { id },
    data: { qrToken }
  });

  res.json(updated);
});
