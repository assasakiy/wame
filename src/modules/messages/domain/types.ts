import { z } from "zod";

export const MESSAGE_TYPES = ["text", "image", "video", "document", "audio", "location", "contact"] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];
export type MessageStatus = "pending" | "sending" | "sent" | "delivered" | "failed" | "received";

export const sendMessageSchema = z.object({
  deviceId: z.string().uuid().optional(),
  to: z.string().min(3).max(64),
  type: z.enum(MESSAGE_TYPES).default("text"),
  text: z.string().max(4096).optional(),
  mediaUrl: z.string().url().optional(),
  fileName: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().max(32).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const mediaMessageSchema = sendMessageSchema.extend({
  type: z.enum(["image", "video", "document", "audio"]),
  mediaUrl: z.string().url(),
});
