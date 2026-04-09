import { sql } from '@vercel/postgres';

// Initialize database schema
export const initDb = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_integrations (
        user_id UUID PRIMARY KEY,
        llm_provider TEXT,
        llm_api_key_encrypted TEXT,
        jira_config_encrypted TEXT,
        ado_config_encrypted TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `;
    console.log('✅ Postgres Database schema ensured securely.');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export default sql;
