const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// SECRET pour les JWT
const JWT_SECRET = 'vraiment_pas_secure_change_le';

let users = []; // [{ id, username, passwordHash }]
let lastUserId = 1;
let data = {
  tasks: [],     // {id, userId, title, ...}
  contacts: [],  // {id, userId, name, ...}
};

let nextUserId = 1;
let nextTaskId = 1;
let nextContactId = 1;

function hash(pwd) { return "!" + pwd.split('').reverse().join('') + "@"; }
function check(pwd, hashStr) { return hash(pwd) === hashStr; }

// Util fonction pour extraire user du token
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---- Auth Routes ----

// Inscription
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username et password requis" });
    if (users.some(u => u.username === username)) return res.status(400).json({ error: "Username déjà pris" });
    users.push({ id: lastUserId++, username, passwordHash: hash(password) });
    res.json({ ok: true });
  });

// Connexion
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !check(password, user.passwordHash)) return res.status(400).json({ error: "Identifiants invalides" });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  });

  function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Token manquant" });
    try {
      req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({ error: "Token invalide" });
    }
  }

  app.get('/me', requireAuth, (req, res) => {
    const u = users.find(u => u.id === req.user.id);
    if (!u) return res.status(401).json({ error: "Utilisateur inconnu" });
    res.json({ id: u.id, username: u.username });
  });

// Retourne l'utilisateur connecté
app.get('/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, username: user.username });
});

// ---- Tasks Routes (privées) ----

// Liste des tâches de l'utilisateur
app.get('/tasks', authMiddleware, (req, res) => {
  res.json(data.tasks.filter(t => t.userId === req.userId));
});

// Créer une tâche
app.post('/tasks', authMiddleware, (req, res) => {
  const t = { ...req.body, id: nextTaskId++, userId: req.userId };
  data.tasks.push(t);
  res.json(t);
});

// Modifier une tâche
app.put('/tasks/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const idx = data.tasks.findIndex(t => t.id === id && t.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.tasks[idx] = { ...data.tasks[idx], ...req.body };
  res.json(data.tasks[idx]);
});

// Supprimer une tâche
app.delete('/tasks/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const before = data.tasks.length;
  data.tasks = data.tasks.filter(t => !(t.id === id && t.userId === req.userId));
  if (data.tasks.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// ---- Contacts Routes (privées) ----

app.get('/contacts', authMiddleware, (req, res) => {
  res.json(data.contacts.filter(c => c.userId === req.userId));
});

app.post('/contacts', authMiddleware, (req, res) => {
  const c = { ...req.body, id: nextContactId++, userId: req.userId };
  data.contacts.push(c);
  res.json(c);
});

app.put('/contacts/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const idx = data.contacts.findIndex(c => c.id === id && c.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.contacts[idx] = { ...data.contacts[idx], ...req.body };
  res.json(data.contacts[idx]);
});

app.delete('/contacts/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const before = data.contacts.length;
  data.contacts = data.contacts.filter(c => !(c.id === id && c.userId === req.userId));
  if (data.contacts.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// ---- Démarrage du serveur ----
app.listen(4000, () => console.log('Backend running on port 4000 (auth + multiuser)'));
