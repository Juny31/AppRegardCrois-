<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
=======
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
>>>>>>> aaa53ff (ajout des methodes requises)

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

<<<<<<< HEAD
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
=======
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const axios = require("axios");

// !!! Remplace par ton propre token GitHub et le chemin de repo cible !!!
const GITHUB_TOKEN = "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";
const GITHUB_REPO = "Juny31/AppRegardCrois-";
const GITHUB_FILEPATH = "dashboard-export.json";
const GITHUB_BRANCH = "main";

// Route POST /github-save : sauvegarder le fichier
app.post("/github-save", async (req, res) => {
  const content = Buffer.from(JSON.stringify(req.body, null, 2)).toString(
    "base64"
  );
  let sha = null;
>>>>>>> aaa53ff (ajout des methodes requises)

function hash(pwd) { return "!" + pwd.split('').reverse().join('') + "@"; }
function check(pwd, hashStr) { return hash(pwd) === hashStr; }

// Util fonction pour extraire user du token
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = auth.split(' ')[1];
  try {
<<<<<<< HEAD
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
=======
    const fileRes = await axios.get(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILEPATH}?ref=${GITHUB_BRANCH}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      }
    );
    sha = fileRes.data.sha;
  } catch (err) {
    // Si le fichier n’existe pas, pas grave, sha reste null (création)
>>>>>>> aaa53ff (ajout des methodes requises)
  }
}

<<<<<<< HEAD
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
=======
  // 2. On pousse la sauvegarde
  try {
    const commitRes = await axios.put(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILEPATH}`,
      {
        message: `Backup automatique dashboard (${new Date().toISOString()})`,
        content,
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      },
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    res.json({ ok: true, commit: commitRes.data.commit.sha });
  } catch (err) {
    // Juste avant le fallback issue
    console.error(
      "Erreur lors de la sauvegarde GitHub:",
      err?.response?.data || err
    );
    // Fallback : crée une issue avec le contenu en base64
    try {
      await axios.post(
        `https://api.github.com/repos/${GITHUB_REPO}/issues`,
        {
          title: `[Sauvegarde échouée] dashboard-export.json - ${new Date().toISOString()}`,
          body: `Contenu base64 :\n\n\`\`\`\n${content}\n\`\`\`\n\nErreur GitHub API :\n${err.message}`,
        },
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
      );
      res.json({ ok: false, fallback: "issue créée" });
    } catch (e) {
      console.error(
        "Erreur lors de la création de fallback issue:",
        e?.response?.data || e
      );
      res
        .status(500)
        .json({
          ok: false,
          error: "Impossible de créer une issue",
          details: e.message,
        });
>>>>>>> aaa53ff (ajout des methodes requises)
    }
  }

<<<<<<< HEAD
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
=======
let data = {
  // ...
  contacts: [
    {
      id: 1,
      name: "Malala Yousafzai",
      type: "Personnalité",
      priority: "Haute",
      status: "À contacter",
      notes: "",
    },
    {
      id: 2,
      name: "Denis Mukwege",
      type: "Personnalité",
      priority: "Haute",
      status: "À contacter",
      notes: "",
    },
    {
      id: 3,
      name: "Médecins Sans Frontières",
      type: "Organisation",
      priority: "Moyenne",
      status: "En contact",
      notes: "",
    },
    {
      id: 4,
      name: "Human Rights Watch",
      type: "Organisation",
      priority: "Moyenne",
      status: "En attente",
      notes: "",
    },
  ],
  // ...
};

// Créer un contact
app.post("/contacts", (req, res) => {
  const newContact = { ...req.body, id: Date.now() };
  data.contacts.push(newContact);
  io.emit("data", data); // broadcast à tous
  res.json(newContact);
});

// Modifier un contact
app.put("/contacts/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = data.contacts.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  data.contacts[idx] = { ...data.contacts[idx], ...req.body };
  io.emit("data", data);
  res.json(data.contacts[idx]);
});

// Supprimer un contact
app.delete("/contacts/:id", (req, res) => {
  const id = Number(req.params.id);
  const oldLen = data.contacts.length;
  data.contacts = data.contacts.filter((c) => c.id !== id);
  if (data.contacts.length === oldLen)
    return res.status(404).json({ error: "Not found" });
  io.emit("data", data);
  res.json({ success: true });
});

io.on("connection", (socket) => {
  socket.emit("init", data);
  socket.on("update", (newData) => {
    data = { ...data, ...newData };
    io.emit("data", data); // broadcast à tous
  });
});

app.get("/data", (req, res) => res.json(data));
app.post("/data", (req, res) => {
  data = { ...data, ...req.body };
  io.emit("data", data);
  res.json({ success: true });
});

server.listen(4000, () => console.log("Backend running on port 4000"));
>>>>>>> aaa53ff (ajout des methodes requises)
