import React, { useState } from "react";
import {
  Stack, Button, Box, Typography, Paper, IconButton, Tooltip, Avatar, Chip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import TaskForm from "./TaskForm";
import AssignmentIcon from "@mui/icons-material/Assignment";

const priorityColor = {
  "Haute": "#b00020",
  "Moyenne": "#bf8600",
  "Basse": "#2e7d32"
};
const statusColor = {
  "Terminé": "success",
  "En cours": "info",
  "À faire": "warning"
};

export default function TaskBoard({ tasks, users, onAdd, onUpdate, onDelete }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const handleAddTask = () => { setEditTask(null); setFormOpen(true); };
  const handleEditTask = (t) => { setEditTask(t); setFormOpen(true); };
  const removeTask = (id) => {
    if (window.confirm("Supprimer cette tâche ?")) onDelete(id);
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
          Tâches
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddTask}
          startIcon={<AddIcon />}
          sx={{
            fontWeight: 600,
            minWidth: { xs: 32, sm: 120 },
            height: 40,
            fontSize: { xs: 15, sm: 16 },
            px: { xs: 1, sm: 2 },
            boxShadow: "none"
          }}
        >Nouvelle</Button>
      </Stack>
      <Stack spacing={2} sx={{ mt: 1, width: "100%" }}>
        {tasks.map(t => (
          <Paper
            key={t.id}
            sx={{
              width: "100%",
              px: { xs: 1, sm: 3 },
              py: { xs: 1.5, sm: 2.5 },
              background: "rgba(255,255,255,0.99)",
              borderLeft: `6px solid ${priorityColor[t.priority] || "#888"}`,
              borderRadius: 3,
              boxShadow: "0 2px 16px rgba(60,60,120,0.09)",
              cursor: "pointer"
            }}
            onClick={() => handleEditTask(t)}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{
              width: "100%",
              flexWrap: { xs: "wrap", sm: "nowrap" }
            }}>
              <Avatar
                sx={{
                  bgcolor: "#2979ff",
                  width: { xs: 38, sm: 48 },
                  height: { xs: 38, sm: 48 },
                  fontSize: { xs: 23, sm: 28 }
                }}
              >
                <AssignmentIcon fontSize="medium" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.3, fontSize: { xs: 15.5, sm: 19 } }}>
                  {t.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip
                    label={t.priority}
                    size="small"
                    sx={{
                      bgcolor: priorityColor[t.priority] + "22",
                      color: priorityColor[t.priority],
                      fontWeight: 700
                    }}
                  />
                  <Chip
                    label={t.status}
                    size="small"
                    color={statusColor[t.status] || "default"}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
                {t.notes && <Typography variant="body2" sx={{ color: "#666" }}>📝 {t.notes}</Typography>}
              </Box>
              <Tooltip title="Supprimer">
                <IconButton aria-label="Supprimer" color="error" size="small" onClick={e => { e.stopPropagation(); removeTask(t.id); }}>
                  <DeleteIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        ))}
        {!tasks.length &&
          <Typography sx={{ color: "#888", mt: 2, fontSize: 16 }}>Aucune tâche trouvée…</Typography>
        }
      </Stack>
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
