import React, { useEffect, useState } from "react";
import axios from "axios";
import TaskBoard from "./components/TaskBoard";
import ContactBoard from "./components/ContactBoard";
import ProgressDashboard from "./components/ProgressDashboard";

<<<<<<< HEAD
// ------------------------------
// -- Helpers pour le JWT --
// ------------------------------
function getToken() {
  return localStorage.getItem('token');
}
function setToken(token) {
  localStorage.setItem('token', token);
}
function removeToken() {
  localStorage.removeItem('token');
}
function authHeaders() {
  return { Authorization: "Bearer " + getToken() };
=======
// --- Analogies : ---
// - On imagine le backend comme la "mairie" ou le "registre central".
// - Les composants TaskBoard/ContactBoard sont comme des agents qui éditent une fiche locale,
//   puis la renvoient à la mairie pour validation.

// --- Sauvegarde GitHub ---
async function saveToGitHub(data, setStatus) {
  setStatus("Envoi sur GitHub...");
  try {
    const res = await axios.post("http://localhost:4000/github-save", data);
    if (res.data.ok) {
      setStatus("Sauvegardé sur GitHub !");
    } else {
      setStatus("Erreur : fallback issue GitHub créé");
    }
  } catch (e) {
    setStatus("Erreur critique lors de la sauvegarde");
  }
>>>>>>> aaa53ff (ajout des methodes requises)
}

// ------------------------------
// -- Auth form --
// ------------------------------
function AuthForm({ setUser, setPage }) {
  const [mode, setMode] = useState("login"); // or "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "register") {
        await axios.post("http://localhost:4000/register", { username, password });
        setMode("login");
        setErr("Compte créé. Connectez-vous !");
      } else {
        const res = await axios.post("http://localhost:4000/login", { username, password });
        setToken(res.data.token);
        // fetch user data
        const me = await axios.get("http://localhost:4000/me", { headers: authHeaders() });
        setUser(me.data);
        setPage("dashboard");
      }
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur serveur");
    }
  }

  return (
    <div style={{ maxWidth: 300, margin: "40px auto", padding: 20, border: "1px solid #ddd", borderRadius: 10 }}>
      <h2>{mode === "login" ? "Connexion" : "Inscription"}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nom d'utilisateur" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: "100%", marginBottom: 8 }} />
        <input placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required type="password" style={{ width: "100%", marginBottom: 8 }} />
        <button type="submit" style={{ width: "100%", marginBottom: 8 }}>{mode === "login" ? "Se connecter" : "Créer un compte"}</button>
      </form>
      <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ width: "100%" }}>
        {mode === "login" ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
      </button>
      {err && <div style={{ color: "red", marginTop: 8 }}>{err}</div>}
    </div>
  );
}

// ------------------------------
// -- Main App --
// ------------------------------
function App() {
<<<<<<< HEAD
  const [user, setUser] = useState(null); // {id, username}
  const [page, setPage] = useState("loading"); // "loading" | "auth" | "dashboard"
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [githubStatus, setGithubStatus] = useState('');

  // -------------------------------
  // Initialisation : check token/user, fetch données
  useEffect(() => {
    async function fetchMeAndData() {
      const token = getToken();
      if (!token) {
        setPage("auth");
        return;
      }
      try {
        const me = await axios.get("http://localhost:4000/me", { headers: authHeaders() });
        setUser(me.data);
        setPage("dashboard");
        // fetch tasks/contacts
        const [tasksRes, contactsRes] = await Promise.all([
          axios.get("http://localhost:4000/tasks", { headers: authHeaders() }),
          axios.get("http://localhost:4000/contacts", { headers: authHeaders() }),
        ]);
        setTasks(tasksRes.data);
        setContacts(contactsRes.data);
      } catch (e) {
        removeToken();
        setPage("auth");
      }
    }
    fetchMeAndData();
  }, []);

  // -------------------------------
  // HANDLERS pour TaskBoard/ContactBoard : CRUD via API REST
  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:4000/tasks", { headers: authHeaders() });
    setTasks(res.data);
  };
  const fetchContacts = async () => {
    const res = await axios.get("http://localhost:4000/contacts", { headers: authHeaders() });
    setContacts(res.data);
  };

  // Pour TaskBoard
  const handleTaskAdd = async (task) => {
    await axios.post("http://localhost:4000/tasks", task, { headers: authHeaders() });
    fetchTasks();
  };
  const handleTaskUpdate = async (id, update) => {
    await axios.put(`http://localhost:4000/tasks/${id}`, update, { headers: authHeaders() });
    fetchTasks();
  };
  const handleTaskDelete = async (id) => {
    await axios.delete(`http://localhost:4000/tasks/${id}`, { headers: authHeaders() });
    fetchTasks();
  };

  // Pour ContactBoard
  const handleContactAdd = async (contact) => {
    await axios.post("http://localhost:4000/contacts", contact, { headers: authHeaders() });
    fetchContacts();
  };
  const handleContactUpdate = async (id, update) => {
    await axios.put(`http://localhost:4000/contacts/${id}`, update, { headers: authHeaders() });
    fetchContacts();
  };
  const handleContactDelete = async (id) => {
    await axios.delete(`http://localhost:4000/contacts/${id}`, { headers: authHeaders() });
    fetchContacts();
  };

  // --- Sauvegarde sur GitHub (optionnel, accessible à tous les users) ---
  async function saveToGitHub(setStatus) {
    setStatus("Envoi sur GitHub...");
    try {
      const res = await axios.post("http://localhost:4000/github-save", { tasks, contacts });
      if (res.data.ok) {
        setStatus("Sauvegardé sur GitHub !");
      } else {
        setStatus("Erreur : fallback issue GitHub créé");
      }
    } catch (e) {
      setStatus("Erreur critique lors de la sauvegarde");
    }
  }

  // --- EXPORT JSON ---
  function exportJSON() {
    const blob = new Blob([JSON.stringify({ tasks, contacts }, null, 2)], {
=======
  const [data, setData] = useState({
    tasks: [],
    contacts: [],
    notes: "",
    progress: 0,
  });
  const [githubStatus, setGithubStatus] = useState('');

  // --- Au chargement, on va chercher les données actuelles ---
  useEffect(() => {
    fetch('http://localhost:4000/data')
      .then(r => r.json())
      .then(json => setData(json));
  }, []);

  // --- Sauvegarde auto sur GitHub toutes les 2 minutes ---
  useEffect(() => {
    const interval = setInterval(() => {
      saveToGitHub(data, setGithubStatus);
    }, 120000);
    return () => clearInterval(interval);
  }, [data]);

  // --- HANDLERS pour TaskBoard et ContactBoard ---
  // On met à jour sur le serveur (POST /data), puis on MAJ localement à la réponse
  const updateTasks = async (tasks) => {
    const res = await fetch('http://localhost:4000/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks })
    });
    if (res.ok) {
      setData(data0 => ({ ...data0, tasks }));
    }
    // sinon tu pourrais rajouter une gestion d'erreur ici !
  };

  const updateContacts = async (contacts) => {
    const res = await fetch('http://localhost:4000/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts })
    });
    if (res.ok) {
      setData(data0 => ({ ...data0, contacts }));
    }
  };

  // --- EXPORT JSON (copié-collé de ton code) ---
  function exportJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
>>>>>>> aaa53ff (ajout des methodes requises)
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

<<<<<<< HEAD
  // --- Déconnexion ---
  function logout() {
    removeToken();
    setUser(null);
    setPage("auth");
    setTasks([]);
    setContacts([]);
  }

  // --- Rendu ---
  if (page === "loading") return <div>Chargement…</div>;
  if (page === "auth") return <AuthForm setUser={setUser} setPage={setPage} />;

  return (
    <div>
      <h1>
        Dashboard Collaboratif
        <span style={{ fontSize: 18, color: "#888", marginLeft: 12 }}>
          Connecté en tant que {user?.username}
        </span>
        <button onClick={logout} style={{ marginLeft: 16 }}>Se déconnecter</button>
      </h1>
      <button onClick={() => saveToGitHub(setGithubStatus)}>
        Sauvegarder sur GitHub
      </button>
      <button onClick={exportJSON} style={{ marginLeft: 8 }}>
        Exporter en JSON
      </button>
      <span style={{ marginLeft: 10 }}>{githubStatus}</span>
      <ProgressDashboard tasks={tasks} />
      <TaskBoard
        tasks={tasks}
        onAdd={handleTaskAdd}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />
      <ContactBoard
        contacts={contacts}
        onAdd={handleContactAdd}
        onUpdate={handleContactUpdate}
        onDelete={handleContactDelete}
      />
=======
  // --- Affichage principal ---
  return (
    <div>
      <h1>Dashboard Collaboratif</h1>
      <button onClick={() => saveToGitHub(data, setGithubStatus)}>
        Sauvegarder sur GitHub
      </button>
      <button onClick={() => exportJSON(data)} style={{ marginLeft: 8 }}>
        Exporter en JSON
      </button>
      <span style={{ marginLeft: 10 }}>{githubStatus}</span>
      <ProgressDashboard tasks={data.tasks} />
      <TaskBoard tasks={data.tasks} onUpdate={updateTasks} />
      <ContactBoard contacts={data.contacts} onUpdate={updateContacts} />
      {/* Ajoute ici les autres composants si besoin */}
>>>>>>> aaa53ff (ajout des methodes requises)
    </div>
  );
}

export default App;
