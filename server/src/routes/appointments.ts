import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { badRequest, forbidden, notFound } from '../utils/errors.js';
import { createNotification } from '../services/notifications.js';

const createAppointmentSchema = z.object({
  caId: z.string().uuid('caId must be a valid UUID'),
  scheduledTime: z.string().min(1, 'scheduledTime is required'),
  durationMinutes: z.number().int().positive('durationMinutes must be a positive integer').optional(),
});

const updateAppointmentSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed']).optional(),
  meetingNotes: z.string().optional(),
});

const router = Router();

interface AppointmentRow {
  id: string;
  client_id: string;
  ca_id: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  meeting_notes: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
  ca_name?: string;
}

function formatAppointment(a: AppointmentRow) {
  return {
    id: a.id,
    clientId: a.client_id,
    caId: a.ca_id,
    scheduledTime: a.scheduled_time,
    durationMinutes: a.duration_minutes,
    status: a.status,
    meetingNotes: a.meeting_notes,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    clientName: a.client_name,
    caName: a.ca_name,
  };
}

// GET /api/appointments — list mine
router.get('/', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const appointments = role === 'ca'
      ? await query<AppointmentRow>`
          SELECT a.*,
            client.full_name AS client_name,
            ca.full_name AS ca_name
          FROM appointments a
          JOIN users client ON client.id = a.client_id
          JOIN users ca ON ca.id = a.ca_id
          WHERE a.ca_id = ${userId}
          ORDER BY a.scheduled_time DESC
        `
      : await query<AppointmentRow>`
          SELECT a.*,
            client.full_name AS client_name,
            ca.full_name AS ca_name
          FROM appointments a
          JOIN users client ON client.id = a.client_id
          JOIN users ca ON ca.id = a.ca_id
          WHERE a.client_id = ${userId}
          ORDER BY a.scheduled_time DESC
        `;

    res.json({ success: true, data: appointments.map(formatAppointment) });
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/:caId/slots?date=YYYY-MM-DD
router.get('/:caId/slots', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caId } = req.params;
    const dateStr = req.query.date as string;
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return next(badRequest('date query param required in YYYY-MM-DD format'));
    }

    const date = new Date(dateStr);
    const dayOfWeek = date.getUTCDay();

    // Load CA's availability for that day
    const avail = await query<{ start_time: string; end_time: string }>`
      SELECT start_time, end_time FROM availability_slots
      WHERE ca_id = ${caId} AND day_of_week = ${dayOfWeek} AND is_active = TRUE
    `;

    // Load existing bookings for that day
    const booked = await query<{ scheduled_time: string; duration_minutes: number }>`
      SELECT scheduled_time, duration_minutes FROM appointments
      WHERE ca_id = ${caId}
        AND scheduled_time::date = ${dateStr}::date
        AND status IN ('pending', 'confirmed')
    `;

    const slots: string[] = [];
    const DURATION = 60; // minutes

    for (const window of avail) {
      const [sh, sm] = window.start_time.split(':').map(Number);
      const [eh, em] = window.end_time.split(':').map(Number);
      let cursor = sh * 60 + sm;
      const endMin = eh * 60 + em;

      while (cursor + DURATION <= endMin) {
        const slotStart = new Date(`${dateStr}T${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}:00Z`);

        const isBooked = booked.some(b => {
          const bStart = new Date(b.scheduled_time).getTime();
          const bEnd = bStart + b.duration_minutes * 60_000;
          const sStart = slotStart.getTime();
          const sEnd = sStart + DURATION * 60_000;
          return sStart < bEnd && sEnd > bStart;
        });

        if (!isBooked) {
          slots.push(slotStart.toISOString());
        }
        cursor += DURATION;
      }
    }

    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments
router.post('/', requireAuth, validateBody(createAppointmentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caId, scheduledTime, durationMinutes } = req.body as z.infer<typeof createAppointmentSchema>;

    if (req.user!.role === 'ca') {
      return next(badRequest('CAs cannot book appointments'));
    }

    const [ca] = await query<{ id: string; full_name: string }>`
      SELECT id, full_name FROM users WHERE id = ${caId} AND role = 'ca'
    `;
    if (!ca) return next(notFound('CA'));

    const [appointment] = await query<AppointmentRow>`
      INSERT INTO appointments (client_id, ca_id, scheduled_time, duration_minutes)
      VALUES (${req.user!.id}, ${caId}, ${scheduledTime}, ${durationMinutes ?? 60})
      RETURNING *
    `;

    const [client] = await query<{ full_name: string }>`
      SELECT full_name FROM users WHERE id = ${req.user!.id}
    `;

    await createNotification(
      caId,
      'appointment_booked',
      'New appointment request',
      `${client.full_name} has requested an appointment`,
      appointment.id
    );

    res.status(201).json({ success: true, data: formatAppointment(appointment) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id
router.put('/:id', requireAuth, validateBody(updateAppointmentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, meetingNotes } = req.body as z.infer<typeof updateAppointmentSchema>;

    const [appt] = await query<AppointmentRow>`
      SELECT * FROM appointments WHERE id = ${id}
    `;
    if (!appt) return next(notFound('Appointment'));

    const userId = req.user!.id;
    const isCA = req.user!.role === 'ca';
    const isClient = appt.client_id === userId;
    const isApptCA = appt.ca_id === userId;

    if (!isClient && !isApptCA) {
      return next(forbidden('Not your appointment'));
    }

    // CAs can confirm/complete/cancel; clients can only cancel pending
    if (status === 'confirmed' && !isCA) {
      return next(forbidden('Only CAs can confirm appointments'));
    }
    if (status === 'completed' && !isCA) {
      return next(forbidden('Only CAs can mark appointments as completed'));
    }
    if (status === 'cancelled' && !isCA && appt.status !== 'pending') {
      return next(forbidden('Clients can only cancel pending appointments'));
    }

    const [updated] = await query<AppointmentRow>`
      UPDATE appointments SET
        status = COALESCE(${status ?? null}, status),
        meeting_notes = COALESCE(${meetingNotes ?? null}, meeting_notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // Send notification for status changes
    if (status === 'confirmed') {
      await createNotification(
        appt.client_id,
        'appointment_confirmed',
        'Appointment confirmed',
        'Your appointment has been confirmed',
        id
      );
    } else if (status === 'cancelled') {
      const notifyUserId = isCA ? appt.client_id : appt.ca_id;
      await createNotification(
        notifyUserId,
        'appointment_cancelled',
        'Appointment cancelled',
        'An appointment has been cancelled',
        id
      );
    }

    res.json({ success: true, data: formatAppointment(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
