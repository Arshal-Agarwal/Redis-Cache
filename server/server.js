require('./database/connectDB');

const express = require('express');
const { mysqlPool } = require('./database/connectDB');
const cors = require("cors");
const Redis = require('ioredis');

const app = express();
const PORT = 5000;
// Connect to Redis
const redis = new Redis({
  host: '127.0.0.1', // Change if running Redis remotely
  port: 6379,
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

app.use(express.json());
app.use(cors());

// Test route
app.get('/', (req, res) => {
  res.send('User Service is running');
});

// 📌 GET all users (with Redis caching)
app.get('/users', async (req, res) => {
  try {
    // Check if cache exists
    const cachedUsers = await redis.get('users');
    if (cachedUsers) {
      console.log('📦 Serving from cache');
      return res.json(JSON.parse(cachedUsers));
    }

    console.log('💾 Cache miss — querying DB...');
    await mysqlPool.query('SELECT SLEEP(6)');
    const [rows] = await mysqlPool.query('SELECT * FROM users');


    // Store result in Redis for 30 seconds
    await redis.set('users', JSON.stringify(rows), 'EX', 300);

    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 📌 POST new user (also clears Redis cache)
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    await mysqlPool.query('SELECT SLEEP(5)');
    const [result] = await mysqlPool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );

    // Invalidate cache after new user insert
    await redis.del('users');

    res.status(201).json({ id: result.insertId, name, email });
  } catch (error) {
    console.error('❌ Error inserting user:', error);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ User service running on port ${PORT}`);
});
