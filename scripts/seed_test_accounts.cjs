const { neon } = require('@neondatabase/serverless');
const { hash } = require('@node-rs/argon2');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

async function seed() {
  console.log('Seeding admin and test accounts...');

  const adminEmail = 'admin@careercopilot.com';
  const adminPassword = 'adminpassword123';
  const adminHash = await hash(adminPassword, ARGON2_OPTIONS);

  const testEmail = 'test@careercopilot.com';
  const testPassword = 'testpassword123';
  const testHash = await hash(testPassword, ARGON2_OPTIONS);

  // Upsert admin
  await sql.query(`
    INSERT INTO "user" (id, name, email, "passwordHash", role)
    VALUES (gen_random_uuid(), 'Administrator', $1, $2, 'admin')
    ON CONFLICT (email) DO UPDATE
    SET "passwordHash" = $2, role = 'admin', name = 'Administrator'
  `, [adminEmail, adminHash]);
  console.log(`Admin account seeded: ${adminEmail} / ${adminPassword}`);

  // Upsert test user
  await sql.query(`
    INSERT INTO "user" (id, name, email, "passwordHash", role)
    VALUES (gen_random_uuid(), 'Test Student', $1, $2, 'user')
    ON CONFLICT (email) DO UPDATE
    SET "passwordHash" = $2, role = 'user', name = 'Test Student'
  `, [testEmail, testHash]);
  console.log(`Test account seeded: ${testEmail} / ${testPassword}`);

  console.log('Done!');
}

seed().catch(console.error);
