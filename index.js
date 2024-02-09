// index.js
import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const app = express();
const port = 3000;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

app.get('/', async (req, res) => {
  try {
    const response = await pool.query('SELECT book_id, name, price FROM books');
    return res.status(200).json(response.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


