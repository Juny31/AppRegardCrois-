const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

// Configuration pour Railway
const PORT = parseInt(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'vraiment_pas_secure_change_le';

const app = express();

// CORS configuration pour production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://juny31.github.io', // Remplacez par votre username GitHub
    /\.github\.io$/,
    /\.railway\.app$/
  ],
  credentials: true
}));

app.use(express.json());

// Configuration SQLite pour Railway
let db;
try {
  const Database = require('better-sqlite3');
  // Chemin de base de données pour Railway
  const dbPath = process.env.NODE_ENV === 'production' 
    ? '/tmp/data.sqlite' 
    : './data.sqlite';
  
  db = new Database(dbPath);
  console.log('✅ Base de données SQLite connectée:', dbPath);
} catch (error) {
  console.error('❌ Erreur connexion base de données:', error);
  process.exit(1);
}

// --- Helpers password
function hash(pwd) { return "!" + pwd.split('').reverse().join('') + "@"; }
function check(pwd, hashStr) { return hash(pwd) === hashStr; }

// --- TABLE INIT/MIGRATIONS ---
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      passwordHash TEXT,
      role TEXT DEFAULT 'user'
    )
  `).run();

  // Vérifier si la colonne role existe
  try { 
    db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run(); 
  } catch (e) {
    // Colonne existe déjà
  }

  db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      title TEXT,
      priority TEXT,
      status TEXT,
      notes TEXT,
      assignedTo INTEGER
    )
  `).run();

  // Création de base de la table contacts
  db.prepare(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      name TEXT,
      type TEXT,
      priority TEXT,
      status TEXT,
      notes TEXT
    )
  `).run();

  // === MIGRATION POUR AJOUTER LES COLONNES MANQUANTES ===
  console.log('🔧 Vérification et migration de la table contacts...');

  // Fonction pour ajouter une colonne si elle n'existe pas
  function addColumnIfNotExists(tableName, columnName, columnType) {
    try {
      db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`).run();
      console.log(`✅ Colonne ${columnName} ajoutée à ${tableName}`);
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log(`ℹ️ Colonne ${columnName} existe déjà dans ${tableName}`);
      } else {
        console.error(`❌ Erreur lors de l'ajout de ${columnName}:`, e.message);
      }
    }
  }

  // Ajouter toutes les colonnes manquantes
  addColumnIfNotExists('contacts', 'email', 'TEXT');
  addColumnIfNotExists('contacts', 'phone', 'TEXT');
  addColumnIfNotExists('contacts', 'website', 'TEXT');
  addColumnIfNotExists('contacts', 'address', 'TEXT');
  addColumnIfNotExists('contacts', 'photo', 'TEXT');
  addColumnIfNotExists('contacts', 'socials', 'TEXT');
  addColumnIfNotExists('contacts', 'notes_publiques', 'TEXT');
  addColumnIfNotExists('contacts', 'notes_privees', 'TEXT');

  db.prepare(`
    CREATE TABLE IF NOT EXISTS theme (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT
    )
  `).run();

  // Insérer le thème par défaut si inexistant
  if (!db.prepare("SELECT * FROM theme").get()) {
    db.prepare("INSERT INTO theme (title, description) VALUES (?, ?)")
      .run(
        "Les conflits vus par les opprimés",
        "Thème du mois de juillet : donner la parole à ceux qui subissent la violence, et comprendre la réalité des conflits à travers leur regard."
      );
  }

  console.log('✅ Tables créées avec succès !');

} catch (error) {
  console.error('❌ Erreur lors de la création des tables:', error);
  process.exit(1);
}

// --- AUTH MIDDLEWARE ---
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    req.username = payload.username;
    req.role = payload.role;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

// --- HEALTH CHECK pour Railway ---
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dashboard Backend is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    database: 'connected',
    port: PORT 
  });
});

// --- AUTH ROUTES ---
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "username et password requis" });
  }
  try {
    db.prepare("INSERT INTO users (username, passwordHash, role) VALUES (?, ?, 'user')")
      .run(username, hash(password));
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: "Username déjà pris" });
    }
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user || !check(password, user.passwordHash)) {
    return res.status(400).json({ error: "Identifiants invalides" });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: "2h" }
  );
  res.json({ token, role: user.role });
});

app.get('/users', authMiddleware, (req, res) => {
  const users = db.prepare("SELECT id, username, role FROM users").all();
  res.json(users);
});

app.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare("SELECT id, username, role FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// --- THEME DU MOIS API ---
app.get('/theme', (req, res) => {
  const t = db.prepare("SELECT * FROM theme LIMIT 1").get();
  res.json(t || {});
});

app.put('/theme', authMiddleware, requireAdmin, (req, res) => {
  const { title, description } = req.body;
  db.prepare("UPDATE theme SET title = ?, description = ? WHERE id = 1")
    .run(title, description);
  res.json({ ok: true });
});

// --- TASKS ROUTES ---
app.get('/tasks', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM tasks WHERE userId = ? OR assignedTo = ?
  `).all(req.userId, req.userId);
  res.json(rows);
});

app.post('/tasks', authMiddleware, (req, res) => {
  const { title, priority, status, notes, assignedTo } = req.body;
  const info = db.prepare(`
    INSERT INTO tasks (userId, title, priority, status, notes, assignedTo)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.userId, title, priority, status, notes, assignedTo || null);
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(info.lastInsertRowid);
  res.json(row);
});

app.put('/tasks/:id', authMiddleware, (req, res) => {
  const { title, priority, status, notes, assignedTo } = req.body;
  const id = Number(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task || (task.userId !== req.userId && task.assignedTo !== req.userId)) {
    return res.status(404).json({ error: 'Not found' });
  }
  db.prepare(`
    UPDATE tasks SET title = ?, priority = ?, status = ?, notes = ?, assignedTo = ?
    WHERE id = ?
  `).run(title, priority, status, notes, assignedTo || null, id);
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  res.json(row);
});

app.delete('/tasks/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task || task.userId !== req.userId) {
    return res.status(404).json({ error: 'Not found' });
  }
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  res.json({ success: true });
});

// --- CONTACTS ROUTES ---
app.get('/contacts', authMiddleware, (req, res) => {
  const rows = db.prepare("SELECT * FROM contacts WHERE userId = ?").all(req.userId);
  res.json(rows);
});

app.post('/contacts', authMiddleware, (req, res) => {
  const {
    name, type, priority, status, notes,
    email, phone, website, address, photo, socials, notes_publiques, notes_privees
  } = req.body;

  console.log('=== POST /contacts ===');
  console.log('User ID:', req.userId);
  console.log('Data:', { name, type, priority, status });

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: "Le nom est requis" });
  }

  // Nettoyer les données
  const cleanData = {
    name: String(name || '').trim(),
    type: String(type || 'Organisation'),
    priority: String(priority || 'Basse'),
    status: String(status || 'À contacter'),
    notes: String(notes || ''),
    email: String(email || ''),
    phone: String(phone || ''),
    website: String(website || ''),
    address: String(address || ''),
    photo: String(photo || ''),
    socials: String(socials || ''),
    notes_publiques: String(notes_publiques || ''),
    notes_privees: String(notes_privees || '')
  };

  try {
    const info = db.prepare(`
      INSERT INTO contacts (userId, name, type, priority, status, notes,
        email, phone, website, address, photo, socials, notes_publiques, notes_privees)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.userId, 
      cleanData.name, cleanData.type, cleanData.priority, cleanData.status, cleanData.notes,
      cleanData.email, cleanData.phone, cleanData.website, cleanData.address, 
      cleanData.photo, cleanData.socials, cleanData.notes_publiques, cleanData.notes_privees
    );
    
    const row = db.prepare("SELECT * FROM contacts WHERE id = ?").get(info.lastInsertRowid);
    console.log('✅ Contact créé:', row.id);
    res.json(row);
  } catch (e) {
    console.error('❌ Erreur création contact:', e.message);
    return res.status(500).json({ 
      error: "Erreur serveur lors de la création du contact", 
      details: e.message 
    });
  }
});

app.put('/contacts/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const contact = db.prepare("SELECT * FROM contacts WHERE id = ? AND userId = ?").get(id, req.userId);
  if (!contact) return res.status(404).json({ error: 'Not found' });
  
  const {
    name, type, priority, status, notes,
    email, phone, website, address, photo, socials, notes_publiques, notes_privees
  } = req.body;

  db.prepare(`
    UPDATE contacts SET name = ?, type = ?, priority = ?, status = ?, notes = ?,
      email = ?, phone = ?, website = ?, address = ?, photo = ?, socials = ?, notes_publiques = ?, notes_privees = ?
    WHERE id = ?
  `).run(
    name, type, priority, status, notes,
    email, phone, website, address, photo, socials, notes_publiques, notes_privees, id
  );
  
  const row = db.prepare("SELECT * FROM contacts WHERE id = ?").get(id);
  res.json(row);
});

app.delete('/contacts/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const contact = db.prepare("SELECT * FROM contacts WHERE id = ? AND userId = ?").get(id, req.userId);
  if (!contact) return res.status(404).json({ error: 'Not found' });
  db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
  res.json({ success: true });
});

// --- Error handling ---
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend démarré sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 JWT Secret configuré: ${JWT_SECRET ? 'Oui' : 'Non'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  if (db) db.close();
  process.exit(0);
});