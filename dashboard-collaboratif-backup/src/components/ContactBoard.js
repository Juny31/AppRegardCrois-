// src/components/ContactBoard.js
import React, { useState } from "react";
import {
  Stack, Button, Box, Typography, Paper, IconButton, Tooltip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import ContactForm from "./ContactForm";

const priorityColor = {
  "Haute": "#b00020",
  "Moyenne": "#bf8600",
  "Basse": "#296d25"
};

export default function ContactBoard({ contacts, onAdd, onUpdate, onDelete }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);

  // Ajout
  const handleAddContact = () => { setEditContact(null); setFormOpen(true); };
  // Modif
  const handleEditContact = (c) => { setEditContact(c); setFormOpen(true); };
  // Suppression
  const removeContact = (id) => {
    if (window.confirm("Supprimer ce contact ?")) onDelete(id);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", pb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={700} sx={{ flexGrow: 1 }}>Contacts</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddContact}
          startIcon={<AddIcon />}
          sx={{ fontWeight: 600, minWidth: 120, height: 44, fontSize: 16, boxShadow: "none" }}
        >+ Nouveau</Button>
      </Stack>

      {/* Liste des contacts */}
      <Stack spacing={3} sx={{ mt: 2 }}>
        {contacts.map(c => (
          <Paper
            key={c.id}
            sx={{
              px: 3, py: 2.5, background: "rgba(255,255,255,0.90)",
              borderLeft: `6px solid ${priorityColor[c.priority]}`,
              borderRadius: 3, boxShadow: "0 2px 12px rgba(60,60,120,0.09)",
              cursor: "pointer"
            }}
            onClick={() => handleEditContact(c)}
          >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  {c.name}
                  <Typography component="span" sx={{ fontWeight: 500, color: "#444", fontSize: 15, ml: 1 }}>
                    ({c.type})
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.2 }}>
                  Priorité : <span style={{ color: priorityColor[c.priority], fontWeight: 600 }}>{c.priority}</span> &nbsp;|&nbsp;
                  Statut : {c.status}
                </Typography>
                {c.email && <Typography variant="body2" sx={{ mt: 0.5 }}>✉️ {c.email}</Typography>}
                {c.phone && <Typography variant="body2">📱 {c.phone}</Typography>}
                {c.website && <Typography variant="body2">🔗 <a href={c.website} target="_blank" rel="noopener noreferrer">{c.website}</a></Typography>}
                {c.notes && <Typography variant="body2" sx={{ mt: 0.5 }}>Notes: {c.notes}</Typography>}
              </Box>
              <Box>
                <Tooltip title="Supprimer">
                  <IconButton aria-label="Supprimer" color="error" onClick={e => { e.stopPropagation(); removeContact(c.id); }}>
                    <DeleteIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Paper>
        ))}
        {!contacts.length &&
          <Typography sx={{ color: "#888", mt: 3 }}>Aucun contact trouvé…</Typography>
        }
      </Stack>

      {/* Formulaire Modal */}
      <ContactForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={data => {
          setFormOpen(false);
          if (editContact) onUpdate(editContact.id, data);
          else onAdd(data);
        }}
        initial={editContact}
      />
    </Box>
  );
}
