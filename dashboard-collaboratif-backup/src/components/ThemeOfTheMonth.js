// src/components/ThemeOfTheMonth.js
import React, { useState } from "react";
import { Paper, Typography, TextField, Button, Box } from "@mui/material";

export default function ThemeOfTheMonth({ theme, onEdit }) {
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(theme.title || "");
  const [description, setDescription] = useState(theme.description || "");

  function handleSave() {
    onEdit({ title, description });
    setEdit(false);
  }

  if (!edit)
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Thème du mois
        </Typography>
        <Typography fontWeight={600} sx={{ mb: 1 }}>
          {theme.title || <span style={{ color: "#aaa" }}>Aucun thème défini</span>}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {theme.description || <span style={{ color: "#bbb" }}>Aucune description</span>}
        </Typography>
        <Button variant="outlined" onClick={() => setEdit(true)}>
          Modifier le thème
        </Button>
      </Paper>
    );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Modifier le thème du mois
      </Typography>
      <TextField
        label="Titre"
        value={title}
        fullWidth
        sx={{ mb: 2 }}
        onChange={e => setTitle(e.target.value)}
      />
      <TextField
        label="Description"
        value={description}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 2 }}
        onChange={e => setDescription(e.target.value)}
      />
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="contained" onClick={handleSave}>
          Sauvegarder
        </Button>
        <Button onClick={() => setEdit(false)}>Annuler</Button>
      </Box>
    </Paper>
  );
}
