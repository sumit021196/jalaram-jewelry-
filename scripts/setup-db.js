const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    host: 'db.achtmpvfjzxsiadsbkhp.supabase.co',
    port: 6543,
    user: 'postgres',
    password: 'smegREG7YNijf./',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    const schemaPath = path.join(__dirname, '..', 'full_schema.sql');
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const initPath = path.join(__dirname, 'init-client.sql');

    console.log('Reading schema files...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const initSql = fs.readFileSync(initPath, 'utf8');

    console.log('Applying full_schema.sql...');
    await client.query(schemaSql);
    console.log('Full schema applied.');

    console.log('Checking for migrations...');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
      for (const file of migrationFiles) {
        console.log(`Applying migration: ${file}...`);
        const migrationSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(migrationSql);
      }
    }

    console.log('Applying init-client.sql...');
    await client.query(initSql);
    console.log('Final initialization applied.');

  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
