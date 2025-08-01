const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const axios = require('axios');

// !!! Remplace par ton propre token GitHub et le chemin de repo cible !!!
const GITHUB_TOKEN = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const GITHUB_REPO = 'tonUser/tonRepo';
const GITHUB_FILEPATH = 'dashboard-export.json';
const GITHUB_BRANCH = 'main'; // ou 'master'

// Route POST /github-save : sauvegarder le fichier
app.post('/github-save', async (req, res) => {
  const content = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');
  let sha = null;

  // 1. On récupère le SHA du dernier commit pour ce fichier (si existe)
  try {
    const fileRes = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILEPATH}?ref=${GITHUB_BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    sha = fileRes.data.sha;
  } catch (err) {
    // Si le fichier n’existe pas, pas grave, sha reste null (création)
  }

  // 2. On pousse la sauvegarde
  try {
    const commitRes = await axios.put(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILEPATH}`,
      {
        message: `Backup automatique dashboard (${new Date().toISOString()})`,
        content,
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {})
      },
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    res.json({ ok: true, commit: commitRes.data.commit.sha });
  } catch (err) {
    // Fallback : crée une issue avec le contenu en base64
    try {
      await axios.post(
        `https://api.github.com/repos/${GITHUB_REPO}/issues`,
        {
          title: `[Sauvegarde échouée] dashboard-export.json - ${new Date().toISOString()}`,
          body: `Contenu base64 :\n\n\`\`\`\n${content}\n\`\`\`\n\nErreur GitHub API :\n${err.message}`
        },
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
      );
      res.json({ ok: false, fallback: 'issue créée' });
    } catch (e) {
      res.status(500).json({ ok: false, error: 'Impossible de créer une issue', details: e.message });
    }
  }
});


let data = {
    // ...
    contacts: [
      { id: 1, name: 'Malala Yousafzai', type: 'Personnalité', priority: 'Haute', status: 'À contacter', notes: '' },
      { id: 2, name: 'Denis Mukwege', type: 'Personnalité', priority: 'Haute', status: 'À contacter', notes: '' },
      { id: 3, name: 'Médecins Sans Frontières', type: 'Organisation', priority: 'Moyenne', status: 'En contact', notes: '' },
      { id: 4, name: 'Human Rights Watch', type: 'Organisation', priority: 'Moyenne', status: 'En attente', notes: '' }
    ],
    // ...
  };
  

io.on('connection', (socket) => {
  socket.emit('init', data);
  socket.on('update', (newData) => {
    data = { ...data, ...newData };
    io.emit('data', data); // broadcast à tous
  });
});

app.get('/data', (req, res) => res.json(data));
app.post('/data', (req, res) => {
  data = { ...data, ...req.body };
  io.emit('data', data);
  res.json({ success: true });
});

server.listen(4000, () => console.log('Backend running on port 4000'));
