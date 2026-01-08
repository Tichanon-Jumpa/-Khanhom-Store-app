require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3013;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const TABLE_NAME = 'Kanhom'; // ← ใช้ชื่อตารางตามที่แจ้ง
const uploadDir = '/var/www/html/std6630251296/Inventory/uploads/images';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads/images', express.static(uploadDir));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
});

pool.getConnection()
  .then((c) => { console.log('✅ DB connected'); c.release(); })
  .catch((e) => console.error('❌ DB connect error:', e.message, e.code));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${uuidv4()}.${ext}`);
  },
});
const upload = multer({ storage });

app.get('/api', (req, res) => res.json({ message: 'API is running...' }));

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ID, Name, Image, Stock, Catagory, location, status
       FROM \`${TABLE_NAME}\`
       ORDER BY ID DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /products error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await pool.query(
      `SELECT ID, Name, Image, Stock, Catagory, location, status
       FROM \`${TABLE_NAME}\`
       WHERE \`ID\` = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error('GET /products/:id error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/products', upload.single('Image'), async (req, res) => {
  try {
    const { Name, Stock, Catagory, location, status } = req.body;
    if (!Name) return res.status(400).json({ error: 'Name is required.' });

    let imageUrl = null;
    if (req.file) {
      imageUrl = `http://nindam.sytes.net/std6630251296/Inventory/uploads/images/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO \`${TABLE_NAME}\` (Name, Image, Stock, Catagory, location, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Name ?? null,
        imageUrl,
        Stock ?? null,     
        Catagory ?? null,    
        location ?? null,
        status ?? null,
      ]
    );

    res.status(201).json({ success: true, productId: result.insertId, image: imageUrl });
  } catch (e) {
    console.error('POST /products error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/products/:id', upload.single('Image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      `SELECT ID, Name, Image, Stock, Catagory, location, status
       FROM \`${TABLE_NAME}\`
       WHERE \`ID\` = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });

    const old = rows[0];

    const Name = req.body.Name ?? old.Name;
    const Stock = req.body.Stock ?? old.Stock;
    const Catagory = req.body.Catagory ?? old.Catagory;
    const location = req.body.location ?? old.location;
    const status = req.body.status ?? old.status;

    let newImageUrl = old.Image;
    if (req.file) {
      newImageUrl = `http://nindam.sytes.net/std6630251296/Inventory/uploads/images/${req.file.filename}`;
      if (old.Image) {
        const oldFileName = old.Image.split('/').pop();
        const oldPath = path.join(uploadDir, oldFileName);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    await pool.query(
      `UPDATE \`${TABLE_NAME}\`
       SET Name=?, Image=?, Stock=?, Catagory=?, location=?, status=?
       WHERE \`ID\`=?`,
      [Name, newImageUrl, Stock, Catagory, location, status, id]
    );

    res.json({ success: true, image: newImageUrl });
  } catch (e) {
    console.error('PUT /products/:id error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      `SELECT ID, Image FROM \`${TABLE_NAME}\` WHERE \`ID\` = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });

    if (rows[0].Image) {
      const fileName = rows[0].Image.split('/').pop();
      const imagePath = path.join(uploadDir, fileName);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    const [result] = await pool.query(
      `DELETE FROM \`${TABLE_NAME}\` WHERE \`ID\` = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found or already deleted' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (e) {
    console.error('DELETE /products/:id error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
