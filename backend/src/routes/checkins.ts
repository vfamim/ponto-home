import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";

const checkinBody = z.object({
  token: z.string().min(10),
  type: z.enum(["ENTRY", "EXIT", "BREAK_OUT", "BREAK_IN"]).default("ENTRY"),
  location: z
    .object({
      lat: z.number(),
      lng: z.number()
    })
    .optional(),
  userAgent: z.string().optional()
});

export const checkinRouter = Router();

checkinRouter.post("/", async (req, res) => {
  const parsed = checkinBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.format() });
  }

  const { token, type, location, userAgent } = parsed.data;

  const person = await prisma.person.findUnique({ where: { qrToken: token } });
  if (!person || !person.active) {
    return res.status(404).json({ message: "QR code inválido ou pessoa inativa" });
  }

  // Avoid duplicate entries in a short window to prevent double scans.
  const duplicate = await prisma.timeEntry.findFirst({
    where: {
      personId: person.id,
      type,
      createdAt: { gte: new Date(Date.now() - 60_000) }
    }
  });

  if (duplicate) {
    return res.status(200).json({
      message: "Batida já registrada recentemente",
      entryId: duplicate.id,
      person
    });
  }

  const timeEntry = await prisma.timeEntry.create({
    data: {
      personId: person.id,
      type,
      locationLat: location?.lat,
      locationLng: location?.lng,
      userAgent
    }
  });

  return res.status(201).json({
    message: "Ponto registrado",
    entryId: timeEntry.id,
    person: { id: person.id, name: person.name }
  });
});
