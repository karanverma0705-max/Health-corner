// Express REST API Server connecting to SQLite Database
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db, initDatabaseSchema } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.resolve(__dirname, '../database/campus_health.sqlite');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite Schema & Seed Data
initDatabaseSchema();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[API ${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root route - Friendly backend status & quick links
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campus Care — University Health & Wellness Portal | SQLite Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0b1120; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box; }
    .card { background: #131d31; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid #23334e; max-width: 620px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); }
    .badge { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; margin-bottom: 1.25rem; }
    .badge::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
    h1 { margin: 0 0 0.5rem 0; font-size: 1.75rem; color: #f8fafc; }
    p { color: #94a3b8; line-height: 1.6; margin: 0 0 1.25rem 0; font-size: 0.95rem; }
    .btn-group { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .launch-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: #0284c7; color: white; padding: 0.85rem 1.4rem; border-radius: 0.65rem; text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: background 0.2s, transform 0.1s; }
    .launch-btn:hover { background: #0369a1; transform: translateY(-1px); }
    .launch-btn.admin { background: #059669; }
    .launch-btn.admin:hover { background: #047857; }
    .launch-btn.db { background: #475569; }
    .launch-btn.db:hover { background: #334155; }
    .endpoints-box { background: #080d18; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem; }
    .endpoints-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 0.75rem; display: flex; justify-content: space-between; }
    ul { margin: 0; padding: 0; list-style: none; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; }
    li { padding: 0.45rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; }
    li:last-child { border-bottom: none; }
    li a { color: #38bdf8; text-decoration: none; }
    li a:hover { text-decoration: underline; }
    .meta-tag { color: #64748b; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">SQLite Backend Online & Active</div>
    <h1>🏥 Campus Care REST API & Database</h1>
    <p>The SQLite 3 Relational Database server is active on <strong>Port 3000</strong>. Access the portals below:</p>
    
    <div class="btn-group">
      <a href="http://127.0.0.1:5173" class="launch-btn">🌐 Student Web App (Port 5173) →</a>
      <a href="http://127.0.0.1:5173/login.html" class="launch-btn" style="background: #8b5cf6;">🔑 Login Portal →</a>
      <a href="http://127.0.0.1:5173/admin.html" class="launch-btn admin">⚙️ Admin Dashboard →</a>
      <a href="/api/db/download" class="launch-btn db" download>💾 Download .sqlite File</a>
    </div>
    
    <div class="endpoints-box">
      <div class="endpoints-title">
        <span>Direct API & Database Endpoints</span>
        <span style="color: #10b981;">Online</span>
      </div>
      <ul>
        <li><a href="/api/status">/api/status</a> <span class="meta-tag">Database Info & Table Counts</span></li>
        <li><a href="/api/db/viewer">/api/db/viewer</a> <span class="meta-tag">Live Table Data JSON</span></li>
        <li><a href="/api/db/download">/api/db/download</a> <span class="meta-tag">Download campus_health.sqlite</span></li>
        <li><a href="/api/admin/metrics">/api/admin/metrics</a> <span class="meta-tag">Admin KPI Metrics</span></li>
        <li><a href="/api/professionals">/api/professionals</a> <span class="meta-tag">Doctors & Counselors</span></li>
        <li><a href="/api/appointments">/api/appointments</a> <span class="meta-tag">Booked Appointments</span></li>
        <li><a href="/api/pharmacy">/api/pharmacy</a> <span class="meta-tag">Pharmacy Inventory</span></li>
        <li><a href="/api/emergency/sos">/api/emergency/sos</a> <span class="meta-tag">Emergency SOS Logs</span></li>
      </ul>
    </div>
  </div>
</body>
</html>`);
});

// Admin shortcut route
app.get('/admin', (req, res) => {
  const adminHtmlPath = path.resolve(__dirname, '../dist/admin.html');
  const srcAdminPath = path.resolve(__dirname, '../admin.html');
  if (fs.existsSync(adminHtmlPath)) {
    return res.sendFile(adminHtmlPath);
  } else if (fs.existsSync(srcAdminPath)) {
    return res.sendFile(srcAdminPath);
  }
  res.redirect('http://127.0.0.1:5173/admin.html');
});

// Login shortcut route
app.get('/login', (req, res) => {
  const loginHtmlPath = path.resolve(__dirname, '../dist/login.html');
  const srcLoginPath = path.resolve(__dirname, '../login.html');
  if (fs.existsSync(loginHtmlPath)) {
    return res.sendFile(loginHtmlPath);
  } else if (fs.existsSync(srcLoginPath)) {
    return res.sendFile(srcLoginPath);
  }
  res.redirect('http://127.0.0.1:5173/login.html');
});

// Direct Database File Download
app.get('/api/db/download', (req, res) => {
  if (fs.existsSync(dbFilePath)) {
    res.download(dbFilePath, 'campus_health.sqlite');
  } else {
    res.status(404).json({ error: 'Database file not found on server.' });
  }
});

// 1. Health & Database Status
app.get('/api/status', (req, res) => {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `).all();

    const tableCounts = {};
    for (const t of tables) {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get();
      tableCounts[t.name] = row.count;
    }

    const stats = fs.statSync(dbFilePath);

    res.json({
      status: 'online',
      database: 'SQLite 3 (Built-in Node.js Engine)',
      databaseFile: 'database/campus_health.sqlite',
      fullPath: dbFilePath,
      fileSizeBytes: stats.size,
      fileSizeKb: (stats.size / 1024).toFixed(1) + ' KB',
      tables: tableCounts,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Metrics Summary
app.get('/api/admin/metrics', (req, res) => {
  try {
    const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
    const confirmedAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Confirmed'").get().count;
    const completedAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Completed'").get().count;

    const totalDoctors = db.prepare('SELECT COUNT(*) as count FROM professionals').get().count;
    const activeDoctorsToday = db.prepare('SELECT COUNT(*) as count FROM professionals WHERE availableToday = 1').get().count;

    const totalPharmacy = db.prepare('SELECT COUNT(*) as count FROM pharmacy_inventory').get().count;
    const lowStockPharmacy = db.prepare("SELECT COUNT(*) as count FROM pharmacy_inventory WHERE stockStatus = 'Low Stock' OR stockQuantity < 50").get().count;

    const totalSos = db.prepare('SELECT COUNT(*) as count FROM emergency_logs').get().count;
    const activeSos = db.prepare("SELECT COUNT(*) as count FROM emergency_logs WHERE status != 'Resolved'").get().count;

    res.json({
      appointments: { total: totalAppointments, confirmed: confirmedAppointments, completed: completedAppointments },
      doctors: { total: totalDoctors, activeToday: activeDoctorsToday },
      pharmacy: { total: totalPharmacy, lowStock: lowStockPharmacy },
      emergency: { total: totalSos, active: activeSos },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Healthcare Professionals Endpoints
app.get('/api/professionals', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM professionals').all();
    const mapped = rows.map(r => ({
      ...r,
      availableToday: Boolean(r.availableToday),
      languages: typeof r.languages === 'string' ? JSON.parse(r.languages || '[]') : (r.languages || []),
      slotsToday: typeof r.slotsToday === 'string' ? JSON.parse(r.slotsToday || '[]') : (r.slotsToday || []),
      specialties: typeof r.specialties === 'string' ? JSON.parse(r.specialties || '[]') : (r.specialties || [])
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Doctor Availability
app.put('/api/professionals/:id/availability', (req, res) => {
  try {
    const { id } = req.params;
    const { availableToday } = req.body;
    const val = availableToday ? 1 : 0;
    db.prepare('UPDATE professionals SET availableToday = ? WHERE id = ?').run(val, id);
    const updated = db.prepare('SELECT * FROM professionals WHERE id = ?').get(id);
    res.json({ ...updated, availableToday: Boolean(updated.availableToday) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Doctor Details
app.put('/api/professionals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, department, room, schedule, slotsToday } = req.body;
    db.prepare(`
      UPDATE professionals
      SET name = COALESCE(?, name),
          title = COALESCE(?, title),
          department = COALESCE(?, department),
          room = COALESCE(?, room),
          schedule = COALESCE(?, schedule),
          slotsToday = COALESCE(?, slotsToday)
      WHERE id = ?
    `).run(
      name, title, department, room, schedule,
      slotsToday ? (typeof slotsToday === 'string' ? slotsToday : JSON.stringify(slotsToday)) : null,
      id
    );
    const doc = db.prepare('SELECT * FROM professionals WHERE id = ?').get(id);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add New Doctor
app.post('/api/professionals', (req, res) => {
  try {
    const { name, title, department, qualification, experience, room, schedule, specialties, slotsToday } = req.body;
    const id = "doc-" + Date.now();
    const avatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80";

    db.prepare(`
      INSERT INTO professionals (
        id, name, title, department, qualification, experience, room,
        availableToday, rating, reviewsCount, avatar, languages, schedule,
        slotsToday, bio, specialties
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 5.0, 1, ?, '["English"]', ?, ?, 'Campus healthcare provider.', ?)
    `).run(
      id, name, title, department, qualification || 'Board Certified', experience || '5+ Years',
      room || 'Block C, Room 101', avatar, schedule || 'Mon - Fri: 9:00 AM - 5:00 PM',
      JSON.stringify(slotsToday || ["09:00 AM", "11:00 AM", "02:00 PM"]),
      JSON.stringify(specialties || [department || "Healthcare"])
    );

    const created = db.prepare('SELECT * FROM professionals WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Doctor
app.delete('/api/professionals/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM professionals WHERE id = ?').run(id);
    res.json({ success: true, message: `Doctor ${id} removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Appointments Endpoints
app.get('/api/appointments', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM appointments ORDER BY createdAt DESC').all();
    res.json(rows.map(r => ({ ...r, isConfidential: Boolean(r.isConfidential) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    const {
      id, doctorId, doctorName, department, room,
      date, time, studentName, studentId, studentEmail,
      hostel, reason, isConfidential
    } = req.body;

    const passId = id || ("UC-" + Math.floor(100000 + Math.random() * 900000));
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO appointments (
        id, doctorId, doctorName, department, room,
        date, time, studentName, studentId, studentEmail,
        hostel, reason, isConfidential, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)
    `);

    stmt.run(
      passId, doctorId, doctorName, department, room,
      date, time, studentName, studentId, studentEmail,
      hostel || 'Dorm', reason || 'Consultation', isConfidential ? 1 : 0, now
    );

    const saved = db.prepare('SELECT * FROM appointments WHERE id = ?').get(passId);
    console.log(`[SQLite] Inserted appointment: ${passId}`);
    res.status(201).json({ ...saved, isConfidential: Boolean(saved.isConfidential) });
  } catch (err) {
    console.error('[SQLite Error] Insert appointment:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Appointment Status (e.g., 'Completed', 'Cancelled', 'Confirmed')
app.patch('/api/appointments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM appointments WHERE id = ?');
    const result = stmt.run(id);

    console.log(`[SQLite] Deleted appointment ${id}, changes: ${result.changes}`);
    res.json({ success: true, message: `Appointment ${id} removed from SQLite database.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Pharmacy & Dispensary Inventory Endpoints
app.get('/api/pharmacy', (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM pharmacy_inventory WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR indications LIKE ? OR category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const rows = db.prepare(sql).all(...params);
    res.json(rows.map(r => ({ ...r, requiresPrescription: Boolean(r.requiresPrescription) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Pharmacy Stock
app.put('/api/pharmacy/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity, stockStatus, cost } = req.body;
    
    // Auto calculate status if quantity is passed
    let computedStatus = stockStatus;
    if (stockQuantity !== undefined && !stockStatus) {
      computedStatus = Number(stockQuantity) > 40 ? 'In Stock' : (Number(stockQuantity) > 0 ? 'Low Stock' : 'Out of Stock');
    }

    db.prepare(`
      UPDATE pharmacy_inventory
      SET stockQuantity = COALESCE(?, stockQuantity),
          stockStatus = COALESCE(?, stockStatus),
          cost = COALESCE(?, cost)
      WHERE id = ?
    `).run(stockQuantity, computedStatus, cost, id);

    const updated = db.prepare('SELECT * FROM pharmacy_inventory WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add New Medicine
app.post('/api/pharmacy', (req, res) => {
  try {
    const { name, category, stockQuantity, cost, dosage, indications, requiresPrescription } = req.body;
    const id = "med-" + Date.now();
    const qty = Number(stockQuantity) || 100;
    const status = qty > 40 ? 'In Stock' : (qty > 0 ? 'Low Stock' : 'Out of Stock');

    db.prepare(`
      INSERT INTO pharmacy_inventory (
        id, name, category, type, stockStatus, stockQuantity, cost, dosage, indications, requiresPrescription
      ) VALUES (?, ?, ?, 'OTC', ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, category || 'General Health', status, qty,
      cost || 'Free with Student ID', dosage || 'As directed by physician',
      indications || 'General treatment', requiresPrescription ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM pharmacy_inventory WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Medicine
app.delete('/api/pharmacy/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM pharmacy_inventory WHERE id = ?').run(id);
    res.json({ success: true, message: `Medicine ${id} removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Fast Dispensary Token Generator
app.post('/api/pharmacy/token', (req, res) => {
  try {
    const { medName, studentId } = req.body;
    const token = "DISP-" + Math.floor(1000 + Math.random() * 9000);
    const validUntil = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO dispensary_tokens (token, medName, studentId, validUntil, status, createdAt)
      VALUES (?, ?, ?, ?, 'Ready for Pickup', ?)
    `).run(token, medName || 'Medication', studentId || 'U-88419', validUntil, createdAt);

    console.log(`[SQLite] Created dispensary token: ${token}`);
    res.json({ token, medName, validUntil, status: 'Ready for Pickup' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Emergency SOS Logging & Fetching
app.get('/api/emergency/sos', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM emergency_logs ORDER BY createdAt DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/emergency/sos', (req, res) => {
  try {
    const { location, crisisNature } = req.body;
    const id = "SOS-" + Date.now();
    const assignedUnit = "Mobile Paramedic Unit 2 (West Wing Bay)";
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO emergency_logs (id, location, crisisNature, status, assignedUnit, createdAt)
      VALUES (?, ?, ?, 'Dispatched', ?, ?)
    `).run(id, location || 'Campus Ground', crisisNature || 'Medical Trauma', assignedUnit, createdAt);

    console.log(`[SQLite] Logged SOS Dispatch: ${id}`);
    res.json({
      id,
      status: 'Dispatched',
      assignedUnit,
      etaSeconds: 170,
      location,
      crisisNature,
      timestamp: createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/emergency/sos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedUnit } = req.body;
    db.prepare(`
      UPDATE emergency_logs
      SET status = COALESCE(?, status),
          assignedUnit = COALESCE(?, assignedUnit)
      WHERE id = ?
    `).run(status, assignedUnit, id);

    const updated = db.prepare('SELECT * FROM emergency_logs WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Student Profile Endpoints
app.get('/api/student-profile', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM student_profiles LIMIT 1').get();
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/student-profile', (req, res) => {
  try {
    const { name, email, department, year, residence, bloodGroup, allergies, emergencyContact } = req.body;
    
    db.prepare(`
      UPDATE student_profiles
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          department = COALESCE(?, department),
          year = COALESCE(?, year),
          residence = COALESCE(?, residence),
          bloodGroup = COALESCE(?, bloodGroup),
          allergies = COALESCE(?, allergies),
          emergencyContact = COALESCE(?, emergencyContact)
      WHERE id = 'U-2024-88419'
    `).run(name, email, department, year, residence, bloodGroup, allergies, emergencyContact);

    const updated = db.prepare('SELECT * FROM student_profiles WHERE id = ?').get('U-2024-88419');
    console.log(`[SQLite] Updated student profile: ${name}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Health Drives Endpoints
app.get('/api/drives', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM health_drives').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drives/rsvp', (req, res) => {
  try {
    const { driveId, delta } = req.body; // delta = +1 or -1
    const change = delta || 1;
    db.prepare(`
      UPDATE health_drives
      SET registeredCount = registeredCount + ?
      WHERE id = ?
    `).run(change, driveId);

    const updated = db.prepare('SELECT * FROM health_drives WHERE id = ?').get(driveId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Authentication Endpoints (Students & Admin)
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your username/email and password.' });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();

    // Query user by email, username, or studentId
    let query = `
      SELECT id, username, email, password, role, name, studentId, department, createdAt
      FROM users
      WHERE (LOWER(email) = ? OR LOWER(username) = ? OR LOWER(COALESCE(studentId, '')) = ?)
    `;
    const params = [cleanIdentifier, cleanIdentifier, cleanIdentifier];

    if (role && (role === 'admin' || role === 'student')) {
      query += ` AND role = ?`;
      params.push(role);
    }

    const user = db.prepare(query).get(...params);

    if (!user) {
      return res.status(401).json({ 
        error: role === 'admin' 
          ? 'No administrator account found matching those credentials.' 
          : 'Invalid credentials. Please verify your Student ID or University Email.' 
      });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const { password: _, ...safeUser } = user;
    console.log(`[SQLite Auth] User logged in: ${safeUser.name} (${safeUser.role})`);

    res.json({
      success: true,
      role: safeUser.role,
      user: safeUser,
      token: `auth-token-${safeUser.id}-${Date.now()}`
    });
  } catch (err) {
    console.error('[API Auth Login Error]:', err);
    res.status(500).json({ error: 'Authentication service encountered an error.' });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, studentId, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanStudentId = studentId ? String(studentId).trim() : `U-${Math.floor(10000 + Math.random() * 90000)}`;
    const username = cleanEmail.split('@')[0];

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ? OR studentId = ?').get(cleanEmail, cleanStudentId);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email or Student ID already exists.' });
    }

    const newId = `usr-student-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, username, email, password, role, name, studentId, department, createdAt)
      VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?)
    `).run(newId, username, cleanEmail, password, name, cleanStudentId, department || 'General Studies', now);

    // Also sync to student_profiles
    db.prepare(`
      INSERT OR REPLACE INTO student_profiles (id, name, email, department, year, residence, bloodGroup, allergies, emergencyContact, insuranceStatus, vaccinationStatus)
      VALUES (?, ?, ?, ?, '1st Year', 'Campus Housing', 'O+', 'None recorded', 'Emergency Desk • 911', 'Active', 'Verified')
    `).run(cleanStudentId, name, cleanEmail, department || 'General Studies');

    const newUser = {
      id: newId,
      username,
      email: cleanEmail,
      role: 'student',
      name,
      studentId: cleanStudentId,
      department: department || 'General Studies',
      createdAt: now
    };

    console.log(`[SQLite Auth] Registered new student: ${name} (${cleanStudentId})`);
    res.json({
      success: true,
      role: 'student',
      user: newUser,
      token: `auth-token-${newId}-${Date.now()}`
    });
  } catch (err) {
    console.error('[API Auth Register Error]:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.get('/api/auth/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, email, role, name, studentId, department, createdAt FROM users').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Database Viewer / Inspector Endpoint (Allows checking raw SQL tables)
app.get('/api/db/viewer', (req, res) => {
  try {
    const tables = ['appointments', 'professionals', 'pharmacy_inventory', 'emergency_logs', 'dispensary_tokens', 'student_profiles', 'health_drives', 'users'];
    const data = {};
    for (const t of tables) {
      data[t] = db.prepare(`SELECT * FROM ${t} LIMIT 50`).all();
    }
    res.json({
      database: 'SQLite 3',
      file: 'database/campus_health.sqlite',
      fullPath: dbFilePath,
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`===================================================`);
  console.log(` Campus Health Corner SQLite REST Server Running!  `);
  console.log(` URL: http://127.0.0.1:${PORT}                      `);
  console.log(` Admin Portal: http://127.0.0.1:${PORT}/admin       `);
  console.log(` Database: database/campus_health.sqlite          `);
  console.log(` Download: http://127.0.0.1:${PORT}/api/db/download `);
  console.log(`===================================================`);
});
