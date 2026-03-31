import { z } from 'zod'

export const quoteSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')).transform(v => v || undefined),
  serviceType: z.enum(['residential', 'commercial', 'automotive']).optional(),
  service: z.string().optional(),
  location: z.string().optional(),
  body: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  photoBase64: z.string().optional(),
  honeypot: z.string().optional(),
})
