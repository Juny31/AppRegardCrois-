// src/components/ThemeOfTheMonth.js

import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, TextField, Button, Slide, Stack } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios";

export default function ThemeOfTheMonth({ user, onThemeChanged }) {
  const [theme, setTheme] = useState({ title: "", description: "" });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Récupérer le thème du backend
  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:4000/theme")
      .then(res => {
        setTheme(res.data || {});
        setForm(res.data || {});
        setLoading(false);
      });
  }, []);

  // Est-ce que l'utilisateur est admin ?
  const isAdmin = user && user.username === "admin";

  // Sauvegarder les modifs
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("http://localhost:4000/theme", form, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      setTheme(form);
      setEdit(false);
      setSaving(false);
      if (onThemeChanged) onThemeChanged();
    } catch (err) {
      setSaving(false);
      alert("Erreur lors de la sauvegarde du thème.");
    }
  };

  if (loading) {
    return (
      <Paper elevation={4} sx={{
        p: 3, mb: 4, background: "rgba(255,240,230,0.93)",
        borderLeft: "8px solid #8f5cff", borderRadius: 3, minHeight: 120,
        display: "flex", alignItems: "center"
      }}>
        <CircularProgress color="secondary" size={28} sx={{ mr: 2 }} />
        <Typography>Chargement du thème...</Typography>
      </Paper>
    );
  }

  return (
    <Slide in direction="down">
      <Paper elevation={4} sx={{
        p: 3,
        mb: 4,
        background: "rgba(255,240,230,0.93)",
        borderLeft: "8px solid #8f5cff",
        borderRadius: 3,
        boxShadow: "0 6px 40px rgba(70,50,110,0.10)",
        position: "relative"
      }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, fontFamily: 'Inter, Arial', letterSpacing: "-0.5px" }}>
            {edit ? (
              <TextField
                label="Titre du thème"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                fullWidth
                size="small"
                autoFocus
                sx={{ fontWeight: "bold", mb: 1, background: "#fff", borderRadius: 1 }}
                inputProps={{ maxLength: 80, style: { fontWeight: 700 } }}
              />
            ) : (
              theme.title || "Aucun thème défini"
            )}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, color: "#553a14" }}>
            {edit ? (
              <TextField
                label="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 1, background: "#fff", borderRadius: 1 }}
                inputProps={{ maxLength: 250 }}
              />
            ) : (
              theme.description
            )}
          </Typography>
        </Box>

        {/* Boutons admin (edit/save/cancel) */}
        {isAdmin && (
          <Box sx={{ mt: 2 }}>
            {edit ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  size="small"
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                >
                  {saving ? "Sauvegarde..." : "Enregistrer"}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<CloseIcon />}
                  size="small"
                  onClick={() => { setEdit(false); setForm(theme); }}
                  disabled={saving}
                >
                  Annuler
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<EditIcon />}
                size="small"
                onClick={() => setEdit(true)}
                sx={{ boxShadow: "none" }}
              >
                Modifier le thème
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Slide>
  );
}
