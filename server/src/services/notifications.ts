import { query } from '../db/client.js';

export type NotificationType =
  | 'message'
  | 'appointment_booked'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'rating'
  | 'document_share';

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  relatedId?: string
): Promise<void> {
  await query`
    INSERT INTO notifications (user_id, type, title, body, related_id)
    VALUES (${userId}, ${type}, ${title}, ${body}, ${relatedId ?? null})
  `;
}
