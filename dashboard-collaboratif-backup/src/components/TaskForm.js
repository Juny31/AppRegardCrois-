// src/components/TaskForm.js
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Stack
} from "@mui/material";

const statusOptions = ["À faire", "En cours", "Terminé", "Bloquée"];
const priorityOptions = ["Haute", "Moyenne", "Basse"];

const defaultTask = {
  title: "",
  priority: "Basse",
  status: "À faire",
  notes: "",
  assignedTo: ""
};

export default function TaskForm({ open, onClose, onSave, initial, users }) {
  const [form, setForm] = useState(defaultTask);

  useEffect(() => {
    if (initial) setForm({ ...defaultTask, ...initial });
    else setForm(defaultTask);
  }, [initial, open]);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initial ? "Modifier la tâche" : "Ajouter une tâche"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="Titre" value={form.title} onChange={handleChange("title")} required fullWidth autoFocus />
            <Stack direction="row" spacing={2}>
              <TextField select label="Priorité" value={form.priority} onChange={handleChange("priority")} fullWidth>
                {priorityOptions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
              <TextField select label="Statut" value={form.status} onChange={handleChange("status")} fullWidth>
                {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Assigné à"
                value={form.assignedTo || ""}
                onChange={handleChange("assignedTo")}
                fullWidth
              >
                <MenuItem value="">Non assignée</MenuItem>
                {users?.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Notes"
              value={form.notes}
              onChange={handleChange("notes")}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">Annuler</Button>
          <Button type="submit" variant="contained" color="primary">{initial ? "Modifier" : "Ajouter"}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
