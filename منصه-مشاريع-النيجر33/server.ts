import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// File upload setup for database restore
const upload = multer({ dest: 'uploads/' });

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jn2KOk0PsgDE@ep-purple-darkness-amnuwajo-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function initDb() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        nameAr TEXT NOT NULL,
        nameFr TEXT NOT NULL,
        quantity REAL DEFAULT 0,
        maxQuantity REAL DEFAULT 0,
        unit TEXT,
        price REAL DEFAULT 0,
        minLevel REAL DEFAULT 0,
        lastUpdated TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        nameAr TEXT NOT NULL,
        nameFr TEXT NOT NULL,
        quantity REAL DEFAULT 0,
        maxQuantity REAL DEFAULT 0,
        unit TEXT,
        minLevel REAL DEFAULT 0,
        supplier TEXT,
        price REAL DEFAULT 0,
        lastUpdated TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customerName TEXT,
        customerId TEXT,
        date TEXT,
        status TEXT,
        totalAmount REAL,
        items TEXT,
        expectedDeliveryDate TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        roleAr TEXT,
        roleFr TEXT,
        salary REAL DEFAULT 0,
        lastPaymentDate TEXT,
        advanceTaken REAL DEFAULT 0,
        password TEXT,
        allowedEntity TEXT,
        loginCount INTEGER DEFAULT 0,
        loginHistory TEXT
      )
    `);

    // Add default admin user if not exists
    const existingStaff = await pool.query('SELECT * FROM staff WHERE id = $1', ['admin-1']);
    console.log(`Checking for admin user... Found: ${existingStaff.rows.length}`);
    if (existingStaff.rows.length === 0) {
      await pool.query(`
        INSERT INTO staff (id, name, roleAr, roleFr, salary, password, allowedEntity)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['admin-1', 'زياد سليمان', 'مدير النظام', 'Admin', 0, '123', 'MASTER']);
      console.log('Default admin user created successfully');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        type TEXT,
        category TEXT,
        description TEXT,
        amount REAL,
        date TEXT,
        entityId TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gold_transactions (
        id TEXT PRIMARY KEY,
        date TEXT,
        description TEXT,
        amountRiyal REAL,
        goldWeight REAL,
        karat REAL,
        exchangeRate REAL,
        type TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        title TEXT,
        date TEXT,
        time TEXT,
        location TEXT,
        notes TEXT,
        tasks TEXT,
        isFinished INTEGER DEFAULT 0,
        summary TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS farm_data (
        id TEXT PRIMARY KEY,
        type TEXT,
        date TEXT,
        item TEXT,
        quantity REAL,
        unit TEXT,
        unitPrice REAL,
        totalPrice REAL,
        notes TEXT,
        season TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bank_partners (
        id TEXT PRIMARY KEY,
        partner_name TEXT,
        capital_amount REAL,
        deposit_date TEXT,
        withdrawals REAL,
        notes TEXT
      )
    `);

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// API Endpoints
const entities = [
  'customers', 'products', 'materials', 'orders', 'staff', 
  'expenses', 'gold_transactions', 'appointments', 'farm_data', 'bank_partners'
];

// Database Management Endpoints
app.get('/api/database/stats', async (req, res) => {
  try {
    const stats: Record<string, number> = {};
    for (const entity of entities) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${entity}`);
      stats[entity] = parseInt(result.rows[0].count, 10);
    }
    
    // Get DB Size
    const sizeResult = await pool.query('SELECT pg_database_size(current_database()) AS size');
    const dbSizeBytes = parseInt(sizeResult.rows[0].size, 10);
    const dbSizeMB = (dbSizeBytes / (1024 * 1024)).toFixed(2);
    const dbSizeGB = (dbSizeBytes / (1024 * 1024 * 1024)).toFixed(4);

    res.json({
      counts: stats,
      size: {
        bytes: dbSizeBytes,
        mb: parseFloat(dbSizeMB),
        gb: parseFloat(dbSizeGB)
      }
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/database/backup', (req, res) => {
  res.status(400).json({ error: 'Backup is handled via Neon Dashboard.' });
});

app.post('/api/database/restore', upload.single('database'), async (req, res) => {
  res.status(400).json({ error: 'Restore is handled via Neon Dashboard.' });
});

entities.forEach(entity => {
  // GET all
app.get(`/api/${entity}`, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${entity}`);
      
      const camelCaseMap: Record<string, string> = {
        namear: 'nameAr', namefr: 'nameFr', maxquantity: 'maxQuantity', minlevel: 'minLevel', lastupdated: 'lastUpdated',
        customername: 'customerName', customerid: 'customerId', totalamount: 'totalAmount', expecteddeliverydate: 'expectedDeliveryDate',
        rolear: 'roleAr', rolefr: 'roleFr', lastpaymentdate: 'lastPaymentDate', advancetaken: 'advanceTaken', allowedentity: 'allowedEntity', logincount: 'loginCount', loginhistory: 'loginHistory',
        entityid: 'entityId', amountriyal: 'amountRiyal', goldweight: 'goldWeight', exchangerate: 'exchangeRate',
        unitprice: 'unitPrice', totalprice: 'totalPrice', isfinished: 'isFinished'
      };

      const mappedRows = result.rows.map(row => {
        const mappedRow: any = {};
        for (const key of Object.keys(row)) {
          mappedRow[camelCaseMap[key] || key] = row[key];
        }
        return mappedRow;
      });

      res.json(mappedRows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // POST (Upsert)
  app.post(`/api/${entity}`, async (req, res) => {
    try {
      const data = req.body;
      const lowercaseData: any = {};
      for (const [k, v] of Object.entries(data)) {
        lowercaseData[k.toLowerCase()] = v;
      }
      const keys = Object.keys(lowercaseData);
      const values = Object.values(lowercaseData).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
      
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const updates = keys.map(k => `${k} = EXCLUDED.${k}`).join(', ');

      const sql = `INSERT INTO ${entity} (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updates}`;
      await pool.query(sql, values);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // DELETE
  app.delete(`/api/${entity}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM ${entity} WHERE id = $1`, [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
});

// Special endpoint for bulk save (e.g. when setting state)
app.post('/api/bulk/:entity', async (req, res) => {
  try {
    const { entity } = req.params;
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        const lowercaseItem: any = {};
        for (const [k, v] of Object.entries(item)) {
          lowercaseItem[k.toLowerCase()] = v;
        }
        
        const keys = Object.keys(lowercaseItem);
        const values = Object.values(lowercaseItem).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const updates = keys.map(k => `${k} = EXCLUDED.${k}`).join(', ');
        // using double quotes for columns in query safely maps to lowercase column names because we're providing lowercase keys.
        const sql = `INSERT INTO ${entity} (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updates}`;
        await client.query(sql, values);
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (err) {
      console.error('Bulk save error:', err);
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Bulk save error outer:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get(/(.*)/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
