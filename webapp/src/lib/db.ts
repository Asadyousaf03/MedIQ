import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
});

export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export type Appointment = {
  id: number;
  doctor_id: number;
  patient_id: string;
  patient_name: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  appointment_time: Date;
  reason: string;
  notes?: string;
  created_at: Date;
};
