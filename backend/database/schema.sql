-- SimpleData API Database Schema
-- Run this in your Aiven PostgreSQL console

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Records table (stores dynamic JSON data)
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);
CREATE INDEX IF NOT EXISTS idx_collections_project_id ON collections(project_id);
CREATE INDEX IF NOT EXISTS idx_records_collection_id ON records(collection_id);
CREATE INDEX IF NOT EXISTS idx_records_data_gin ON records USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);

-- Verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
