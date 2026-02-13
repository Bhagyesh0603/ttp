import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const addAuthTables = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('📊 Adding authentication tables...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created');

    // Add user_id column to projects table
    await client.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    `);
    console.log('✅ Added user_id to projects table');

    // Create index on user_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    `);
    console.log('✅ Index created on user_id');

    console.log('\n🎉 Authentication tables added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding auth tables:', error);
    throw error;
  } finally {
    await client.end();
  }
};

addAuthTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
