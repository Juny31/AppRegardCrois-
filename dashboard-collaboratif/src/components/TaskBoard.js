import React from 'react';

function TaskBoard({ tasks, onUpdate }) {
  const handleStatus = (id, status) => {
    onUpdate(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <div>
      <h2>Tâches</h2>
      <ul>
        {tasks.map(t => (
          <li key={t.id} style={{ color: t.status === 'Terminé' ? 'green' : t.status === 'En cours' ? 'orange' : t.status === 'Bloqué' ? 'red' : 'grey' }}>
            {t.label} — <b>{t.status}</b>
            <select value={t.status} onChange={e => handleStatus(t.id, e.target.value)}>
              <option>À faire</option>
              <option>En cours</option>
              <option>Terminé</option>
              <option>Bloqué</option>
            </select>
          </li>
        ))}
      </ul>
      <button onClick={() => onUpdate([...tasks, { id: Date.now(), label: "Nouvelle tâche", status: "À faire" }])}>Ajouter tâche</button>
    </div>
  );
}
export default TaskBoard;
