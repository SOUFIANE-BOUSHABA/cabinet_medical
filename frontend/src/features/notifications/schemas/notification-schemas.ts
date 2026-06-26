import { z } from 'zod'

export const notificationChannelSchema = z.enum(['EMAIL', 'WHATSAPP'])

export const notificationStatusSchema = z.enum(['PENDING', 'SENT', 'FAILED'])

export const simulateNotificationSchema = z.object({
  appointmentId: z.number().int().positive().optional(),
  channel: notificationChannelSchema,
  recipient: z.string().trim().optional(),
  message: z.string().trim().min(1, 'Le message est obligatoire.'),
})

export type NotificationChannel = z.infer<typeof notificationChannelSchema>
export type NotificationStatus = z.infer<typeof notificationStatusSchema>
export type SimulateNotificationFormValues = z.infer<
  typeof simulateNotificationSchema
>
