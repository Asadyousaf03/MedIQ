import { query } from '../src/lib/db';

async function seed() {
  console.log('Seeding database...');

  try {
    // Enable pgvector extension if we were doing vector search, 
    // but for now we'll do simple keyword/attribute search for the mock doctors 
    // as per the requirement to "store mock doctors". 
    // pgvector would be used if we were matching symptoms embeddings to doctor specialties.
    await query('CREATE EXTENSION IF NOT EXISTS vector');

    await query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(255) NOT NULL,
        hospital VARCHAR(255) NOT NULL,
        experience INT,
        bio TEXT
      );
    `);

    // Clear existing data
    await query('TRUNCATE doctors RESTART IDENTITY');

    const doctors = [
      { name: "Dr. Sarah Plain", specialty: "General Practitioner", hospital: "City General", experience: 5, bio: "Empathetic GP with a focus on preventative care." },
      { name: "Dr. Gregory House", specialty: "Diagnostician", hospital: "Princeton-Plainsboro", experience: 15, bio: "Specializes in infectious diseases and nephrology." },
      { name: "Dr. Meredith Grey", specialty: "General Surgery", hospital: "Grey Sloan Memorial", experience: 10, bio: "General surgery with a focus on abdominal contents." },
      { name: "Dr. Derek Shepherd", specialty: "Neurosurgery", hospital: "Grey Sloan Memorial", experience: 12, bio: "Expert in brain, spine, and peripheral nerve disorders." },
      { name: "Dr. John Dorian", specialty: "Internal Medicine", hospital: "Sacred Heart", experience: 4, bio: "Caring internal medicine specialist." },
      { name: "Dr. Perry Cox", specialty: "Internal Medicine", hospital: "Sacred Heart", experience: 20, bio: "Highly experienced, though sometimes abrasive, internal medicine specialist." },
      { name: "Dr. Stephen Strange", specialty: "Neurosurgery", hospital: "Metro-General", experience: 10, bio: "Former top neurosurgeon, now focuses on holistic healing." },
      { name: "Dr. Leonard McCoy", specialty: "Space Medicine", hospital: "Starfleet Medical", experience: 25, bio: "Expert in xenobiology and space medicine." },
      { name: "Dr. Michaela Quinn", specialty: "Family Medicine", hospital: "Colorado Springs Clinic", experience: 8, bio: "Family medicine specialist serving rural communities." },
      { name: "Dr. Doogie Howser", specialty: "Pediatrics", hospital: "Eastman Medical Center", experience: 2, bio: "Young prodigy specializing in pediatric care." }
    ];

    for (const doc of doctors) {
      await query(
        'INSERT INTO doctors (name, specialty, hospital, experience, bio) VALUES ($1, $2, $3, $4, $5)',
        [doc.name, doc.specialty, doc.hospital, doc.experience, doc.bio]
      );
    }

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    process.exit(0);
  }
}

seed();
