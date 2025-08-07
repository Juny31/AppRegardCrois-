// src/components/TaskBoard.js
import React, { useState } from "react";
import {
  Stack, Button, Box, Typography, Paper, IconButton, Tooltip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import TaskForm from "./TaskForm";

const priorityColor = {
  "Haute": "#b00020",
  "Moyenne": "#bf8600",
  "Basse": "#296d25"
};

export default function TaskBoard({ tasks, users, onAdd, onUpdate, onDelete }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // Ajout
  const handleAddTask = () => { setEditTask(null); setFormOpen(true); };
  // Modif
  const handleEditTask = (t) => { setEditTask(t); setFormOpen(true); };
  // Suppression
  const removeTask = (id) => {
    if (window.confirm("Supprimer cette tâche ?")) onDelete(id);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", pb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={700} sx={{ flexGrow: 1 }}>Tâches</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddTask}
          startIcon={<AddIcon />}
          sx={{ fontWeight: 600, minWidth: 120, height: 44, fontSize: 16, boxShadow: "none" }}
        >+ Nouvelle</Button>
      </Stack>

      {/* Liste des tâches */}
      <Stack spacing={3} sx={{ mt: 2 }}>
        {tasks.map(t => (
          <Paper
            key={t.id}
            sx={{
              px: 3, py: 2.5, background: "rgba(255,255,255,0.90)",
              borderLeft: `6px solid ${priorityColor[t.priority]}`,
              borderRadius: 3, boxShadow: "0 2px 12px rgba(60,60,120,0.09)",
              cursor: "pointer"
            }}
            onClick={() => handleEditTask(t)}
          >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  {t.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.2 }}>
                  Priorité : <span style={{ color: priorityColor[t.priority], fontWeight: 600 }}>{t.priority}</span> &nbsp;|&nbsp;
                  Statut : {t.status}
                  {t.assignedTo && users?.length &&
                    <> &nbsp;|&nbsp; <span style={{ color: "#555" }}>Assignée à : <b>
                      {(users.find(u => u.id === t.assignedTo)?.username) || "?"}
                    </b></span></>
                  }
                </Typography>
                {t.notes && <Typography variant="body2" sx={{ mt: 0.5 }}>Notes: {t.notes}</Typography>}
              </Box>
              <Box>
                <Tooltip title="Supprimer">
                  <IconButton aria-label="Supprimer" color="error" onClick={e => { e.stopPropagation(); removeTask(t.id); }}>
                    <DeleteIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Paper>
        ))}
        {!tasks.length &&
          <Typography sx={{ color: "#888", mt: 3 }}>Aucune tâche trouvée…</Typography>
        }
      </Stack>

      {/* Formulaire Modal */}
      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={data => {
          setFormOpen(false);
          if (editTask) onUpdate(editTask.id, data);
          else onAdd(data);
        }}
        initial={editTask}
        users={users}
      />
    </Box>
  );
}
