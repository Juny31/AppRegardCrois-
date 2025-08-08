import React, { useState } from "react";
import {
  Stack, Button, Box, Typography, Paper, IconButton, Tooltip, Avatar, Chip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import ContactForm from "./ContactForm";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";

const priorityColor = {
  "Haute": "#b00020",
  "Moyenne": "#bf8600",
  "Basse": "#2e7d32"
};
const statusColor = {
  "Terminé": "success",
  "En contact": "primary",
  "À contacter": "warning",
  "En attente": "info"
};

export default function ContactBoard({ contacts, onAdd, onUpdate, onDelete }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);

  const handleAddContact = () => { setEditContact(null); setFormOpen(true); };
  const handleEditContact = (c) => { setEditContact(c); setFormOpen(true); };
  const removeContact = (id) => {
    if (window.confirm("Supprimer ce contact ?")) onDelete(id);
  };

  return (
    <Box sx={{
      width: "100%",
      px: { xs: 0.5, sm: 2 },
      maxWidth: "100vw",
      pb: 2
    }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{
        mb: 2,
        flexWrap: "wrap"
      }}>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1, fontSize: { xs: 21, sm: 28 } }}>
          Contacts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddContact}
          startIcon={<AddIcon />}
          sx={{
            fontWeight: 600,
            minWidth: { xs: 32, sm: 120 },
            height: 40,
            fontSize: { xs: 15, sm: 16 },
            px: { xs: 1, sm: 2 },
            boxShadow: "none"
          }}
        >Nouveau</Button>
      </Stack>
      <Stack spacing={2} sx={{ mt: 1, width: "100%" }}>
        {contacts.map(c => (
          <Paper
            key={c.id}
            sx={{
              width: "100%",
              px: { xs: 1, sm: 3 },
              py: { xs: 1.5, sm: 2.5 },
              background: "rgba(255,255,255,0.99)",
              borderLeft: `6px solid ${priorityColor[c.priority] || "#888"}`,
              borderRadius: 3,
              boxShadow: "0 2px 16px rgba(60,60,120,0.09)",
              cursor: "pointer"
            }}
            onClick={() => handleEditContact(c)}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{
              width: "100%",
              flexWrap: { xs: "wrap", sm: "nowrap" }
            }}>
              <Avatar
                sx={{
                  bgcolor: c.type === "Organisation" ? "#8f5cff" : "#2979ff",
                  width: { xs: 38, sm: 48 },
                  height: { xs: 38, sm: 48 },
                  fontSize: { xs: 23, sm: 28 }
                }}
              >
                {c.type === "Organisation" ? <BusinessIcon fontSize="medium" /> : <PersonIcon fontSize="medium" />}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.3, fontSize: { xs: 15.5, sm: 19 } }}>
                  {c.name}
                  <Chip
                    label={c.type}
                    size="small"
                    sx={{
                      ml: 1,
                      bgcolor: c.type === "Organisation" ? "#ede7f6" : "#e3f2fd",
                      color: "#333"
                    }}
                  />
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip
                    label={c.priority}
                    size="small"
                    sx={{
                      bgcolor: priorityColor[c.priority] + "22",
                      color: priorityColor[c.priority],
                      fontWeight: 700
                    }}
                  />
                  <Chip
                    label={c.status}
                    size="small"
                    color={statusColor[c.status] || "default"}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {c.email && <Typography variant="body2">✉️ {c.email}</Typography>}
                  {c.phone && <Typography variant="body2">📱 {c.phone}</Typography>}
                  {c.website && <Typography variant="body2">🔗 <a href={c.website} target="_blank" rel="noopener noreferrer">{c.website}</a></Typography>}
                </Stack>
                {c.notes && <Typography variant="body2" sx={{ mt: 0.5, color: "#666" }}>📝 {c.notes}</Typography>}
              </Box>
              <Tooltip title="Supprimer">
                <IconButton aria-label="Supprimer" color="error" size="small" onClick={e => { e.stopPropagation(); removeContact(c.id); }}>
                  <DeleteIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        ))}
        {!contacts.length &&
          <Typography sx={{ color: "#888", mt: 2, fontSize: 16 }}>Aucun contact trouvé…</Typography>
        }
      </Stack>
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
