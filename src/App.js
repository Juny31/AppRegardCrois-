// src/App.js

import React, { useState, useEffect } from "react";
import {
  ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Button, Container,
  Paper, Tabs, Tab, Snackbar, Stack, CircularProgress
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import LogoutIcon from "@mui/icons-material/Logout";
import theme from "./theme";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TaskBoard from "./components/TaskBoard";
import ContactBoard from "./components/ContactBoard";

// -- UTILITAIRES LOCALSTORAGE --
const LS_KEY = "dashboard-collab-data-v1";
function saveData({ user, tasks, contacts, theme }) {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify({ user, tasks, contacts, theme })
  );
}
function loadData() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return { user: null, tasks: [], contacts: [], theme: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { user: null, tasks: [], contacts: [], theme: null };
  }
}
function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now();
}

// -- EXPORT PDF (toutes les données !) --
function exportPDF(tasks, contacts, theme) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      putOnlyUsedFonts:true
    });

    const margin = 40;
    let y = margin;

    // --- HEADER ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Rapport CR", margin, y);

    y += 30;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      margin,
      y
    );

    y += 15;
    doc.setDrawColor(41, 121, 255);
    doc.setLineWidth(2);
    doc.line(margin, y, 550, y);
    y += 25;

    // --- THEME ---
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Thème du mois :", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.text(theme?.title || "Non défini", margin + 110, y);

    y += 18;
    doc.setFontSize(11);
    let descLines = doc.splitTextToSize(theme?.description || "Aucune description.", 520);
    doc.text(descLines, margin, y);
    y += descLines.length * 14 + 8;

    // --- TABLEAU TÂCHES ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Tâches", margin, y);
    y += 10;

    autoTable(doc, {
      startY: y + 5,
      margin: { left: margin, right: margin },
      head: [[
        "Titre", "Statut", "Priorité", "Notes"
      ]],
      body: tasks.map(t => [
        t.title || "",
        t.status || "",
        t.priority || "",
        t.notes || ""
      ]),
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 121, 255], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 245, 255] },
    });

    y = doc.lastAutoTable.finalY + 20;

    // --- TABLEAU CONTACTS ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Contacts", margin, y);
    y += 10;

    autoTable(doc, {
      startY: y + 5,
      margin: { left: margin, right: margin },
      head: [[
        "Nom", "Type", "Statut", "Priorité", "Email", "Téléphone", "Site", "Adresse", "Notes"
      ]],
      body: contacts.map(c => [
        c.name || "",
        c.type || "",
        c.status || "",
        c.priority || "",
        c.email || "",
        c.phone || "",
        c.website || "",
        c.address || "",
        c.notes || ""
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [41, 121, 255], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 255] },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 48 },
        2: { cellWidth: 52 },
        3: { cellWidth: 45 },
        4: { cellWidth: 88 },
        5: { cellWidth: 65 },
        6: { cellWidth: 60 },
        7: { cellWidth: 70 },
        8: { cellWidth: 80 },
      }
    });

    y = doc.lastAutoTable.finalY + 18;

    // --- FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120,120,120);
      doc.text(
        `Regard Croise • Page ${i}/${pageCount}`,
        margin,
        doc.internal.pageSize.height - 18
      );
    }

    const fileName = `Rapport_RC_${Date.now()}.pdf`;
    doc.save(fileName);
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de la génération du PDF:', error);
    alert('Erreur export PDF. Consultez la console.');
    return false;
  }
}


// -- FORM THÈME --
function ThemeOfTheMonth({ theme, onSave }) {
  const [edit, setEdit] = useState(false);
  const [local, setLocal] = useState(theme || { title: "", description: "" });

  useEffect(() => { setLocal(theme || { title: "", description: "" }); }, [theme]);

  if (!edit)
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={1}>Thème du mois</Typography>
        <Typography fontWeight={700}>{theme?.title || "Titre du thème"}</Typography>
        <Typography color="text.secondary">{theme?.description || "Description du thème du mois."}</Typography>
        <Button variant="text" sx={{ mt: 1 }} onClick={() => setEdit(true)}>Modifier</Button>
      </Paper>
    );
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={1}>Modifier le thème</Typography>
      <input
        placeholder="Titre"
        value={local.title}
        onChange={e => setLocal({ ...local, title: e.target.value })}
        style={{ width: "100%", marginBottom: 8, padding: 8, fontSize: 15 }}
      />
      <textarea
        placeholder="Description"
        value={local.description}
        onChange={e => setLocal({ ...local, description: e.target.value })}
        rows={3}
        style={{ width: "100%", marginBottom: 8, padding: 8, fontSize: 15, resize: "vertical" }}
      />
      <Stack direction="row" spacing={2}>
        <Button variant="contained" size="small" onClick={() => { onSave(local); setEdit(false); }}>Enregistrer</Button>
        <Button variant="outlined" size="small" onClick={() => setEdit(false)}>Annuler</Button>
      </Stack>
    </Paper>
  );
}

// --- MAIN APP ---
export default function App() {
  // Data states
  const [user, setUser] = useState({ username: "Utilisateur" });
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [themeObj, setThemeObj] = useState({
    title: "Les conflits vus par les opprimés",
    description: "Donner la parole à ceux qui subissent la violence, et comprendre la réalité des conflits à travers leur regard."
  });

  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  // Load from localStorage at mount
  useEffect(() => {
    const { tasks, contacts, theme } = loadData();
    setTasks(tasks || []);
    setContacts(contacts || []);
    if (theme) setThemeObj(theme);
  }, []);

  // Save to localStorage at every change
  useEffect(() => {
    saveData({ user, tasks, contacts, theme: themeObj });
  }, [user, tasks, contacts, themeObj]);

  // --- CRUD TASKS (avec id unique)
  const handleTaskAdd = (task) => {
    setTasks([...tasks, { ...task, id: genId() }]);
    setSnack("Tâche ajoutée !");
  };
  const handleTaskUpdate = (id, update) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, ...update } : t));
    setSnack("Tâche modifiée !");
  };
  const handleTaskDelete = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setSnack("Tâche supprimée !");
  };

  // --- CRUD CONTACTS (avec id unique)
  const handleContactAdd = (contact) => {
    setContacts([...contacts, { ...contact, id: genId() }]);
    setSnack("Contact ajouté !");
  };
  const handleContactUpdate = (id, update) => {
    setContacts(contacts.map((c) => c.id === id ? { ...c, ...update } : c));
    setSnack("Contact modifié !");
  };
  const handleContactDelete = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
    setSnack("Contact supprimé !");
  };

  // --- PDF EXPORT
  const handleExportPDF = () => {
    setPdfLoading(true);
    setTimeout(() => {
      exportPDF(tasks, contacts, themeObj);
      setPdfLoading(false);
      setSnack("PDF exporté avec succès !");
    }, 200);
  };

  // --- LOGOUT RESET (optionnel)
  const logout = () => {
    setUser({ username: "Utilisateur" });
    setTasks([]);
    setContacts([]);
    setThemeObj({ title: "", description: "" });
    localStorage.removeItem(LS_KEY);
    setSnack("Déconnecté et données effacées");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", background: "linear-gradient(120deg, #2979ff 0%, #8f5cff 100%)", pb: 8 }}>
        <AppBar position="static" color="primary" elevation={0} sx={{ background: "rgba(41,121,255,0.93)" }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Dashboard Collaboratif (local)
            </Typography>
            <Typography sx={{ mr: 2 }}>
              Connecté en tant que <b>{user?.username}</b>
            </Typography>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
              Réinitialiser
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <ThemeOfTheMonth theme={themeObj} onSave={setThemeObj} />
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>
              Statistiques
            </Typography>
            <Typography>
              <b>{tasks.length}</b> tâche(s) &nbsp;&nbsp;•&nbsp;&nbsp;
              <b>{contacts.length}</b> contact(s)
            </Typography>
          </Paper>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{
            mb: 3, borderRadius: 2, boxShadow: "0 2px 12px rgba(80,80,120,0.13)",
            background: "rgba(255,255,255,0.94)",
          }}>
            <Tab icon={<ListAltIcon />} iconPosition="start" label="Tâches" sx={{ fontWeight: 700 }} />
            <Tab icon={<PeopleAltIcon />} iconPosition="start" label="Contacts" sx={{ fontWeight: 700 }} />
          </Tabs>
          <Stack direction="row" spacing={2} mb={4} justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={pdfLoading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
              onClick={handleExportPDF}
              disabled={pdfLoading}
              sx={{
                background: "#fff", color: "#6c40bb", fontWeight: 700,
                border: "2px solid #8f5cff", boxShadow: "0 2px 8px 0 rgba(41,121,255,0.08)",
                textTransform: "none", borderRadius: 2, px: 3,
                "&:hover": { background: "#f3f0fb" },
                "&:disabled": { background: "#f5f5f5", color: "#999", border: "2px solid #ddd" },
              }}
            >
              {pdfLoading ? "Export en cours..." : "Exporter en PDF"}
            </Button>
          </Stack>
          {tab === 0 && (
            <TaskBoard
              tasks={tasks}
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
