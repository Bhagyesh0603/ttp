import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const { Client } = pg;

const setupDatabase = async () => {
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

    console.log('📊 Creating tables...');

    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        api_key VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Projects table created');

    // Create collections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(project_id, name)
      );
    `);
    console.log('✅ Collections table created');

    // Create records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Records table created');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);
      CREATE INDEX IF NOT EXISTS idx_collections_project_id ON collections(project_id);
      CREATE INDEX IF NOT EXISTS idx_records_collection_id ON records(collection_id);
      CREATE INDEX IF NOT EXISTS idx_records_data_gin ON records USING GIN(data);
      CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
    `);
    console.log('✅ Indexes created');

    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await client.end();
  }
};

setupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
