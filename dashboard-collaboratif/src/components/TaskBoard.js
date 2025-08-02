import React from "react";

const priorityColor = { 'Haute': 'red', 'Moyenne': 'orange', 'Basse': 'green' };

function TaskBoard({ tasks, onAdd, onUpdate, onDelete }) {
  // --- AJOUT ---
  const addTask = async () => {
    const title = prompt("Nom de la tâche ?");
    if (title) {
      await onAdd({
        title,
        priority: 'Moyenne',
        status: 'À faire',
        notes: ''
      });
    }
  };

  // --- MODIF (priorité, statut, notes, etc) ---
  const updateTask = async (id, field, value) => {
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    await onUpdate(id, { ...t, [field]: value });
  };

  // --- SUPPRESSION ---
  const removeTask = async (id) => {
    if (window.confirm("Supprimer cette tâche ?")) {
      await onDelete(id);
    }
  };

  return (
    <div>
      <h2>Tâches</h2>
      <button onClick={addTask}>Ajouter une tâche</button>
      <ul>
        {tasks.map(t => (
          <li key={t.id} style={{ border: "1px solid #ddd", margin: 8, padding: 8 }}>
            <b>{t.title}</b>
            <span style={{
              color: priorityColor[t.priority],
              fontWeight: 'bold',
              marginLeft: 10
            }}>{t.priority}</span>
            <br />
            Statut :
            <select
              value={t.status}
              onChange={e => updateTask(t.id, "status", e.target.value)}
              style={{ marginLeft: 5 }}
            >
              <option>À faire</option>
              <option>En cours</option>
              <option>En attente</option>
              <option>Terminé</option>
            </select>
            <br />
            Priorité :
            <select
              value={t.priority}
              onChange={e => updateTask(t.id, "priority", e.target.value)}
              style={{ marginLeft: 5 }}
            >
              <option>Haute</option>
              <option>Moyenne</option>
              <option>Basse</option>
            </select>
            <br />
            Notes :
            <textarea
              value={t.notes}
              onChange={e => updateTask(t.id, "notes", e.target.value)}
              style={{ width: "95%", minHeight: 30 }}
            />
            <button onClick={() => removeTask(t.id)} style={{ color: "red" }}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskBoard;
