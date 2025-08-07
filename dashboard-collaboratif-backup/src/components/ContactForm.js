// src/components/ContactForm.js - VERSION CORRIGÉE
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Stack
} from "@mui/material";

const typeOptions = ["Organisation", "Personnalité"];
const priorityOptions = ["Haute", "Moyenne", "Basse"];
const statusOptions = ["À contacter", "En contact", "En attente", "Terminé"];

const emptyContact = {
  name: "",
  type: "Organisation",
  priority: "Basse",
  status: "À contacter",
  notes: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  photo: "",
  socials: "",
  notes_publiques: "",
  notes_privees: ""
};

function sanitizeContact(data) {
  // Remplace tous les undefined/null par ""
  const out = { ...data };
  Object.keys(out).forEach(k => {
    if (out[k] === undefined || out[k] === null) {
      out[k] = "";
    }
  });
  
  // FIX: Assurer que socials est toujours une string valide
  if (typeof out.socials !== "string") {
    out.socials = "";
  }
  
  // Si c'est une string vide, la laisser comme ça
  // Si l'utilisateur veut du JSON, il peut l'écrire manuellement
  
  return out;
}

export default function ContactForm({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(emptyContact);

  useEffect(() => {
    if (initial) {
      // FIX: S'assurer que tous les champs sont des strings
      const cleanInitial = { ...emptyContact, ...initial };
      Object.keys(cleanInitial).forEach(k => {
        if (cleanInitial[k] === undefined || cleanInitial[k] === null) {
          cleanInitial[k] = "";
        }
      });
      setForm(cleanInitial);
    } else {
      setForm(emptyContact);
    }
  }, [initial, open]);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value || "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // LOG pour debug - vous pouvez le retirer plus tard
    console.log('Données à envoyer:', sanitizeContact({ ...emptyContact, ...form }));
    
    onSave(sanitizeContact({ ...emptyContact, ...form }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initial ? "Modifier le contact" : "Ajouter un contact"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField 
              label="Nom *" 
              value={form.name || ""} 
              onChange={handleChange("name")} 
              required 
              fullWidth 
              autoFocus 
            />
            <Stack direction="row" spacing={2}>
              <TextField 
                select 
                label="Type" 
                value={form.type || "Organisation"} 
                onChange={handleChange("type")} 
                fullWidth
              >
                {typeOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                label="Priorité" 
                value={form.priority || "Basse"} 
                onChange={handleChange("priority")} 
                fullWidth
              >
                {priorityOptions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
              <TextField 
                select 
                label="Statut" 
                value={form.status || "À contacter"} 
                onChange={handleChange("status")} 
                fullWidth
              >
                {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField label="Email" value={form.email || ""} onChange={handleChange("email")} fullWidth />
            <TextField label="Téléphone" value={form.phone || ""} onChange={handleChange("phone")} fullWidth />
            <TextField label="Site web" value={form.website || ""} onChange={handleChange("website")} fullWidth />
            <TextField label="Adresse" value={form.address || ""} onChange={handleChange("address")} fullWidth />
            <TextField label="Photo (URL)" value={form.photo || ""} onChange={handleChange("photo")} fullWidth />
            <TextField 
              label="Réseaux sociaux (JSON)" 
              value={form.socials || ""} 
              onChange={handleChange("socials")} 
              fullWidth 
              placeholder='{"twitter": "@moncompte", "linkedin": "profil"}'
              helperText="Format JSON optionnel pour les réseaux sociaux"
            />
            <TextField label="Notes publiques" value={form.notes_publiques || ""} onChange={handleChange("notes_publiques")} fullWidth />
            <TextField label="Notes privées" value={form.notes_privees || ""} onChange={handleChange("notes_privees")} fullWidth />
            <TextField label="Notes" value={form.notes || ""} onChange={handleChange("notes")} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            {initial ? "Modifier" : "Ajouter"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}