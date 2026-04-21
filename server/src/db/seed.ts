import 'dotenv/config';
import bcrypt from 'bcrypt';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const SALT_ROUNDS = 10;

const cas = [
  {
    email: 'priya.sharma@taxtalk.com',
    password: 'Password123',
    fullName: 'Priya Sharma',
    phone: '+91 98765 43210',
    bio: 'Experienced CA specializing in corporate taxation and GST compliance. Worked with 100+ businesses across manufacturing and retail sectors.',
    hourlyRate: 1500,
    caNumber: 'CA-MH-2015-0042',
    workExperience: 9,
    isVerified: true,
    specializations: ['GST Filing', 'Corporate Tax', 'Tax Audit'],
    availability: [
      { day: 1, start: '09:00', end: '17:00' },
      { day: 2, start: '09:00', end: '17:00' },
      { day: 3, start: '09:00', end: '17:00' },
      { day: 4, start: '09:00', end: '17:00' },
      { day: 5, start: '09:00', end: '13:00' },
    ],
  },
  {
    email: 'rahul.mehta@taxtalk.com',
    password: 'Password123',
    fullName: 'Rahul Mehta',
    phone: '+91 97654 32109',
    bio: 'CA with deep expertise in income tax planning for HNIs and startups. Former Big 4 associate with 12 years of experience.',
    hourlyRate: 2000,
    caNumber: 'CA-DL-2012-0118',
    workExperience: 12,
    isVerified: true,
    specializations: ['Income Tax Planning', 'Startup Advisory', 'Investment Tax'],
    availability: [
      { day: 1, start: '10:00', end: '18:00' },
      { day: 2, start: '10:00', end: '18:00' },
      { day: 4, start: '10:00', end: '18:00' },
      { day: 5, start: '10:00', end: '18:00' },
    ],
  },
  {
    email: 'anita.desai@taxtalk.com',
    password: 'Password123',
    fullName: 'Anita Desai',
    phone: '+91 96543 21098',
    bio: 'Specializing in GST advisory and international taxation. Fluent in handling cross-border transactions and transfer pricing.',
    hourlyRate: 1800,
    caNumber: 'CA-GJ-2016-0277',
    workExperience: 8,
    isVerified: true,
    specializations: ['GST Filing', 'International Tax', 'Transfer Pricing'],
    availability: [
      { day: 1, start: '08:00', end: '16:00' },
      { day: 3, start: '08:00', end: '16:00' },
      { day: 5, start: '08:00', end: '12:00' },
      { day: 6, start: '10:00', end: '14:00' },
    ],
  },
  {
    email: 'vikram.nair@taxtalk.com',
    password: 'Password123',
    fullName: 'Vikram Nair',
    phone: '+91 95432 10987',
    bio: 'Tax litigation specialist with 15 years of experience handling income tax assessments and appeals before CIT(A) and ITAT.',
    hourlyRate: 2500,
    caNumber: 'CA-KL-2009-0055',
    workExperience: 15,
    isVerified: true,
    specializations: ['Tax Litigation', 'Income Tax Planning', 'Tax Audit'],
    availability: [
      { day: 2, start: '11:00', end: '19:00' },
      { day: 3, start: '11:00', end: '19:00' },
      { day: 4, start: '11:00', end: '19:00' },
    ],
  },
  {
    email: 'sunita.joshi@taxtalk.com',
    password: 'Password123',
    fullName: 'Sunita Joshi',
    phone: '+91 94321 09876',
    bio: 'Focused on individual tax returns, salary structuring, and small business accounting. Friendly, approachable, and prompt with filings.',
    hourlyRate: 1000,
    caNumber: 'CA-RJ-2019-0341',
    workExperience: 5,
    isVerified: false,
    specializations: ['Individual Tax', 'Salary Structuring', 'Small Business Accounting'],
    availability: [
      { day: 1, start: '09:00', end: '17:00' },
      { day: 2, start: '09:00', end: '17:00' },
      { day: 3, start: '09:00', end: '17:00' },
      { day: 4, start: '09:00', end: '17:00' },
      { day: 5, start: '09:00', end: '17:00' },
    ],
  },
];

const clients = [
  {
    email: 'amit.kumar@example.com',
    password: 'Password123',
    fullName: 'Amit Kumar',
    phone: '+91 99887 76655',
  },
  {
    email: 'neha.singh@example.com',
    password: 'Password123',
    fullName: 'Neha Singh',
    phone: '+91 88776 65544',
  },
  {
    email: 'rohan.gupta@example.com',
    password: 'Password123',
    fullName: 'Rohan Gupta',
    phone: '+91 77665 54433',
  },
  {
    email: 'divya.patel@example.com',
    password: 'Password123',
    fullName: 'Divya Patel',
    phone: '+91 66554 43322',
  },
];

const ratings: { caEmail: string; clientEmail: string; rating: number; review: string }[] = [
  { caEmail: 'priya.sharma@taxtalk.com', clientEmail: 'amit.kumar@example.com', rating: 5, review: 'Priya was absolutely fantastic. She handled our GST filing quickly and explained everything clearly.' },
  { caEmail: 'priya.sharma@taxtalk.com', clientEmail: 'neha.singh@example.com', rating: 4, review: 'Very thorough and professional. Would definitely recommend for GST compliance.' },
  { caEmail: 'rahul.mehta@taxtalk.com', clientEmail: 'rohan.gupta@example.com', rating: 5, review: 'Rahul saved us lakhs in tax through smart planning. Exceptional expertise for startups.' },
  { caEmail: 'rahul.mehta@taxtalk.com', clientEmail: 'divya.patel@example.com', rating: 4, review: 'Knowledgeable and responsive. Helped structure our investments very effectively.' },
  { caEmail: 'vikram.nair@taxtalk.com', clientEmail: 'amit.kumar@example.com', rating: 5, review: 'Vikram won our appeal at ITAT. Exceptional litigation skills, highly recommended.' },
  { caEmail: 'anita.desai@taxtalk.com', clientEmail: 'neha.singh@example.com', rating: 5, review: 'Very detailed knowledge of international tax. Made our cross-border setup hassle-free.' },
];

async function seed() {
  console.log('Seeding database...');

  const caIds: Record<string, string> = {};
  const clientIds: Record<string, string> = {};

  for (const ca of cas) {
    const existing = await sql`SELECT id FROM users WHERE email = ${ca.email}`;
    if (existing.length > 0) {
      caIds[ca.email] = existing[0].id as string;
      console.log(`  CA already exists: ${ca.fullName}`);
      continue;
    }

    const hash = await bcrypt.hash(ca.password, SALT_ROUNDS);
    const [row] = await sql`
      INSERT INTO users (email, password_hash, full_name, phone, role, bio, hourly_rate, ca_number, work_experience, is_verified)
      VALUES (${ca.email}, ${hash}, ${ca.fullName}, ${ca.phone}, 'ca', ${ca.bio}, ${ca.hourlyRate}, ${ca.caNumber}, ${ca.workExperience}, ${ca.isVerified})
      RETURNING id
    `;
    const caId = row.id as string;
    caIds[ca.email] = caId;

    for (const spec of ca.specializations) {
      await sql`
        INSERT INTO ca_specializations (ca_id, specialization)
        VALUES (${caId}, ${spec})
        ON CONFLICT DO NOTHING
      `;
    }

    for (const slot of ca.availability) {
      await sql`
        INSERT INTO availability_slots (ca_id, day_of_week, start_time, end_time)
        VALUES (${caId}, ${slot.day}, ${slot.start}, ${slot.end})
      `;
    }

    console.log(`  Created CA: ${ca.fullName}`);
  }

  for (const client of clients) {
    const existing = await sql`SELECT id FROM users WHERE email = ${client.email}`;
    if (existing.length > 0) {
      clientIds[client.email] = existing[0].id as string;
      console.log(`  Client already exists: ${client.fullName}`);
      continue;
    }

    const hash = await bcrypt.hash(client.password, SALT_ROUNDS);
    const [row] = await sql`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES (${client.email}, ${hash}, ${client.fullName}, ${client.phone}, 'client')
      RETURNING id
    `;
    clientIds[client.email] = row.id as string;
    console.log(`  Created client: ${client.fullName}`);
  }

  for (const r of ratings) {
    const caId = caIds[r.caEmail];
    const clientId = clientIds[r.clientEmail];
    if (!caId || !clientId) continue;

    const existing = await sql`SELECT id FROM ratings WHERE reviewer_id = ${clientId} AND ca_id = ${caId}`;
    if (existing.length > 0) continue;

    await sql`
      INSERT INTO ratings (reviewer_id, ca_id, rating, review_text)
      VALUES (${clientId}, ${caId}, ${r.rating}, ${r.review})
    `;
    console.log(`  Added rating: ${r.clientEmail} → ${r.caEmail} (${r.rating}★)`);
  }

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
