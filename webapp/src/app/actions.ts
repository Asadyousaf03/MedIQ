'use server'

import { query } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function bookAppointment(doctorId: number, reason: string) {
  const session = await auth();
  if (!session.userId) {
    return { success: false, message: 'You must be signed in to book an appointment.' };
  }

  try {
    // Check if doctor exists
    const doc = await query('SELECT name FROM doctors WHERE id = $1', [doctorId]);
    if (doc.rows.length === 0) return { success: false, message: 'Doctor not found' };
    
    const doctorName = doc.rows[0].name;

    // Create appointment for tomorrow 10 AM (mock logic)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    await query(
      `INSERT INTO appointments (doctor_id, patient_id, patient_name, status, appointment_time, reason) 
       VALUES ($1, $2, $3, 'pending', $4, $5)`,
      [doctorId, session.userId, 'Valued Patient', tomorrow, reason]
    );

    return { success: true, message: `Appointment booked with ${doctorName} for tomorrow at 10:00 AM.` };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to book appointment' };
  }
}