import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Stack,
  CircularProgress,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import LogoutIcon from "@mui/icons-material/Logout";
import ThemeOfTheMonth from "./components/ThemeOfTheMonth";
import TaskBoard from "./components/TaskBoard";
import ContactBoard from "./components/ContactBoard";
import ProgressDashboard from "./components/ProgressDashboard";
import theme from "./theme";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem("token");
}
function setToken(token) {
  localStorage.setItem("token", token);
}
function removeToken() {
  localStorage.removeItem("token");
}
function authHeaders() {
  return { Authorization: "Bearer " + getToken() };
}

function AuthForm({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  
  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "register") {
        await axios.post(`${API_URL}/register`, { // ← Changé ici
          username,
          password,
        });
        setMode("login");
        setErr("Compte créé. Connectez-vous !");
      } else {
        const res = await axios.post(`${API_URL}/login`, { // ← Changé ici
          username,
          password,
        });
        setToken(res.data.token);
        await onLogin();
      }
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur serveur");
    }
  }

  return (
    <Container
      maxWidth="xs"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Paper sx={{ width: "100%", p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={700} align="center" mb={2}>
          {mode === "login" ? "Connexion" : "Inscription"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              marginBottom: 12,
              padding: 10,
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #eaeaea",
            }}
          />
          <input
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            style={{
              width: "100%",
              marginBottom: 12,
              padding: 10,
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #eaeaea",
            }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mb: 1, fontWeight: 600 }}
          >
            {mode === "login" ? "Se connecter" : "Créer un compte"}
          </Button>
        </form>
        <Button
          color="secondary"
          fullWidth
          size="small"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
        </Button>
        {err && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {err}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

// Fonction d'export PDF robuste avec gestion d'erreurs complète
function exportPDF(tasks, contacts) {
  try {
    const doc = new jsPDF();

    // Titre général avec la date
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("Report Regard Croisé", 14, 15);
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Export du ${dateStr}`, 14, 25);

    let currentY = 40;

    // --- Section Tâches ---
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Tâches", 14, currentY);
    doc.setFont(undefined, 'normal');

    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      try {
        autoTable(doc, {
          startY: currentY + 8,
          head: [["Titre", "Statut", "Priorité", "Assigné à", "Notes"]],
          body: tasks.map((t) => [
            (t?.title || '').toString().substring(0, 30),
            (t?.status || '').toString(),
            (t?.priority || '').toString(),
            (t?.assignedTo || '').toString(),
            (t?.notes || '').toString().substring(0, 40),
          ]),
          styles: { 
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: { 
            fillColor: [41, 121, 255],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250]
          },
        });
        
        // Position après le tableau des tâches
        currentY = (doc.previousAutoTable?.finalY || currentY + 30) + 15;
      } catch (tableError) {
        console.error('Erreur lors de la création du tableau des tâches:', tableError);
        doc.setFontSize(11);
        doc.text("Erreur lors de l'export des tâches", 14, currentY + 10);
        currentY += 25;
      }
    } else {
      doc.setFontSize(11);
      doc.setTextColor(128, 128, 128);
      doc.text("Aucune tâche à afficher", 14, currentY + 10);
      doc.setTextColor(0, 0, 0);
      currentY += 30;
    }

    // Vérifier si on a besoin d'une nouvelle page
    if (currentY > doc.internal.pageSize.height - 80) {
      doc.addPage();
      currentY = 20;
    }

    // --- Section Contacts ---
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Contacts", 14, currentY);
    doc.setFont(undefined, 'normal');

    if (contacts && Array.isArray(contacts) && contacts.length > 0) {
      try {
        autoTable(doc, {
          startY: currentY + 8,
          head: [["Nom", "Type", "Statut", "Priorité", "Email", "Téléphone"]],
          body: contacts.map((c) => [
            (c?.name || '').toString().substring(0, 25),
            (c?.type || '').toString(),
            (c?.status || '').toString(),
            (c?.priority || '').toString(),
            (c?.email || '').toString().substring(0, 30),
            (c?.phone || '').toString().substring(0, 15),
          ]),
          styles: { 
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: { 
            fillColor: [143, 92, 255],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [248, 245, 255]
          },
        });
      } catch (tableError) {
        console.error('Erreur lors de la création du tableau des contacts:', tableError);
        doc.setFontSize(11);
        doc.text("Erreur lors de l'export des contacts", 14, currentY + 10);
      }
    } else {
      doc.setFontSize(11);
      doc.setTextColor(128, 128, 128);
      doc.text("Aucun contact à afficher", 14, currentY + 10);
      doc.setTextColor(0, 0, 0);
    }

    // Pied de page avec informations
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    const footerText = `Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')} | Dashboard Collaboratif`;
    doc.text(footerText, 14, pageHeight - 10);

    // Statistiques rapides
    const statsText = `${tasks.length} tâche(s) • ${contacts.length} contact(s)`;
    doc.text(statsText, doc.internal.pageSize.width - 14 - doc.getTextWidth(statsText), pageHeight - 10);

    // Sauvegarder avec un nom de fichier unique
    const fileName = `dashboard-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours()}${now.getMinutes()}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF exporté avec succès :', fileName);
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'export PDF:', error);
    alert('Une erreur est survenue lors de l\'export PDF. Consultez la console pour plus de détails.');
    return false;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("loading");
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [githubStatus, setGithubStatus] = useState("");
  const [snack, setSnack] = useState("");
  const [tab, setTab] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Nouvelle variable pour forcer le refresh du thème après édition
  const [themeKey, setThemeKey] = useState(0);

  // Load everything
  const loadUserAndData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setPage("auth");
      setTasks([]);
      setContacts([]);
      setUsers([]);
      return;
    }
    try {
      const me = await axios.get(`${API_URL}/me`, { // ← Changé ici
        headers: authHeaders(),
      });
      setUser(me.data);
      setPage("dashboard");
      const [tasksRes, contactsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/tasks`, { headers: authHeaders() }), // ← Changé ici
        axios.get(`${API_URL}/contacts`, { headers: authHeaders() }), // ← Changé ici
        axios.get(`${API_URL}/users`, { headers: authHeaders() }), // ← Changé ici
      ]);
      setTasks(tasksRes.data);
      setContacts(contactsRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      removeToken();
      setUser(null);
      setPage("auth");
      setTasks([]);
      setContacts([]);
      setUsers([]);
    }
  }, []);
  

  useEffect(() => {
    loadUserAndData();
  }, [loadUserAndData]);

  // CRUD functions
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`, {
        headers: authHeaders(),
      });
      setTasks(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      setSnack("Erreur lors du chargement des tâches");
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/contacts`, {
        headers: authHeaders(),
      });
      setContacts(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      setSnack("Erreur lors du chargement des contacts");
    }
  };

  const handleTaskAdd = async (task) => {
    try {
      await axios.post(`${API_URL}/tasks`, task, {
        headers: authHeaders(),
      });
      await fetchTasks();
      setSnack("Tâche ajoutée !");
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
      setSnack("Erreur lors de l'ajout de la tâche");
    }
  };

  const handleTaskUpdate = async (id, update) => {
    try {
      await axios.put(`${API_URL}/tasks/${id}`, update, {
        headers: authHeaders(),
      });
      await fetchTasks();
      setSnack("Tâche modifiée !");
    } catch (error) {
      console.error('Erreur lors de la modification de la tâche:', error);
      setSnack("Erreur lors de la modification de la tâche");
    }
  };

  const handleTaskDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: authHeaders(),
      });
      await fetchTasks();
      setSnack("Tâche supprimée !");
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      setSnack("Erreur lors de la suppression de la tâche");
    }
  };
  
  const handleContactAdd = async (contact) => {
    try {
      await axios.post(`${API_URL}/contacts`, contact, {
        headers: authHeaders(),
      });
      await fetchContacts();
      setSnack("Contact ajouté !");
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact:', error);
      setSnack("Erreur lors de l'ajout du contact");
    }
  };
  
  const handleContactUpdate = async (id, update) => {
    try {
      await axios.put(`${API_URL}/contacts/${id}`, update, {
        headers: authHeaders(),
      });
      await fetchContacts();
      setSnack("Contact modifié !");
    } catch (error) {
      console.error('Erreur lors de la modification du contact:', error);
      setSnack("Erreur lors de la modification du contact");
    }
  };
  
  const handleContactDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/contacts/${id}`, {
        headers: authHeaders(),
      });
      await fetchContacts();
      setSnack("Contact supprimé !");
    } catch (error) {
      console.error('Erreur lors de la suppression du contact:', error);
      setSnack("Erreur lors de la suppression du contact");
    }
  };

  // Fonction wrapper pour l'export avec feedback
  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      const success = exportPDF(tasks, contacts);
      if (success !== false) {
        setSnack("PDF exporté avec succès !");
      }
    } catch (error) {
      console.error('Erreur export PDF:', error);
      setSnack("Erreur lors de l'export PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  async function saveToGitHub(setStatus) {
    setStatus("Envoi sur GitHub...");
    try {
      const res = await axios.post(`${API_URL}/github-save`, {
        tasks,
        contacts,
      });
      setStatus(
        res.data.ok
          ? "Sauvegardé sur GitHub !"
          : "Erreur : fallback issue GitHub créé"
      );
    } catch (error) {
      console.error('Erreur sauvegarde GitHub:', error);
      setStatus("Erreur critique lors de la sauvegarde");
    }
  }

  function logout() {
    removeToken();
    setUser(null);
    setPage("auth");
    setTasks([]);
    setContacts([]);
    setUsers([]);
    setSnack("Déconnecté");
  }

  // Handler pour que ThemeOfTheMonth puisse notifier App d'une modification
  const handleThemeChanged = () => setThemeKey((k) => k + 1);

  if (page === "loading") {
    return (
      <Box 
        sx={{ 
          minHeight: "100vh", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "linear-gradient(120deg, #2979ff 0%, #8f5cff 100%)"
        }}
      >
        <CircularProgress size={60} sx={{ color: "#fff" }} />
        <Typography sx={{ ml: 2, color: "#fff", fontSize: 18 }}>
          Chargement…
        </Typography>
      </Box>
    );
  }

  if (page === "auth") return <AuthForm onLogin={loadUserAndData} />;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(120deg, #2979ff 0%, #8f5cff 100%)",
          pb: 8,
        }}
      >
        <AppBar
          position="static"
          color="primary"
          elevation={0}
          sx={{ background: "rgba(41,121,255,0.93)" }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Dashboard Collaboratif
            </Typography>
            <Typography sx={{ mr: 2 }}>
              Connecté en tant que <b>{user?.username}</b>
            </Typography>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
              Se déconnecter
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="md" sx={{ mt: 4 }}>
          {/* Thème du mois (éditable pour admin) */}
          <ThemeOfTheMonth
            key={themeKey}
            user={user}
            onThemeChanged={handleThemeChanged}
          />

          {/* Dashboard/Stats (glasscard) */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <ProgressDashboard tasks={tasks} />
          </Paper>

          {/* Tabs Navigation */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 2px 12px rgba(80,80,120,0.13)",
              background: "rgba(255,255,255,0.94)",
            }}
          >
            <Tab
              icon={<ListAltIcon />}
              iconPosition="start"
              label="Tâches"
              sx={{ fontWeight: 700 }}
            />
            <Tab
              icon={<PeopleAltIcon />}
              iconPosition="start"
              label="Contacts"
              sx={{ fontWeight: 700 }}
            />
          </Tabs>

          {/* Action buttons */}
          <Stack direction="row" spacing={2} mb={4} justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<SaveAltIcon />}
              onClick={() => saveToGitHub(setGithubStatus)}
              sx={{
                background: "linear-gradient(90deg, #2979ff 0%, #8f5cff 100%)",
                color: "#fff",
                boxShadow: "0 4px 18px 0 rgba(41,121,255,0.10)",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #2763e1 0%, #6c40bb 100%)",
                },
              }}
            >
              Sauvegarder
            </Button>
            
            <Button
              variant="contained"
              startIcon={pdfLoading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
              onClick={handleExportPDF}
              disabled={pdfLoading}
              sx={{
                background: "#fff",
                color: "#6c40bb",
                fontWeight: 700,
                border: "2px solid #8f5cff",
                boxShadow: "0 2px 8px 0 rgba(41,121,255,0.08)",
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                "&:hover": {
                  background: "#f3f0fb",
                },
                "&:disabled": {
                  background: "#f5f5f5",
                  color: "#999",
                  border: "2px solid #ddd",
                },
              }}
            >
              {pdfLoading ? "Export en cours..." : "Exporter en PDF"}
            </Button>

            <Typography sx={{ ml: 2, color: "#888", alignSelf: "center" }}>
              {githubStatus}
            </Typography>
          </Stack>

          {/* Onglets */}
          {tab === 0 && (
            <TaskBoard
              tasks={tasks}
              users={users}
              onAdd={handleTaskAdd}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
            />
          )}
          {tab === 1 && (
            <ContactBoard
              contacts={contacts}
              onAdd={handleContactAdd}
              onUpdate={handleContactUpdate}
              onDelete={handleContactDelete}
            />
          )}
        </Container>
        
        <Snackbar
          open={!!snack}
          autoHideDuration={3000}
          onClose={() => setSnack("")}
          message={snack}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </ThemeProvider>
  );
}