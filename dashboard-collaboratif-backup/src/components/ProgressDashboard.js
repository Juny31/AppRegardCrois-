import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';

function ProgressDashboard({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Terminé').length;
  const inProgress = tasks.filter(t => t.status === 'En cours').length;
  const todo = tasks.filter(t => t.status === 'À faire').length;
  const blocked = tasks.filter(t => t.status === 'Bloqué').length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{
      border: "1px solid #2196f3",
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      background: "#f7fbff"
    }}>
      <h2>Statistiques du projet</h2>
      <div>
        <b>Total tâches :</b> {total}<br />
        <b>Terminées :</b> {done} <span style={{ color: "green" }}>✔️</span><br />
        <b>En cours :</b> {inProgress} <span style={{ color: "orange" }}>⏳</span><br />
        <b>À faire :</b> {todo} <span style={{ color: "gray" }}>🕓</span><br />
        <b>Bloquées :</b> {blocked} <span style={{ color: "red" }}>⛔</span><br />
      </div>
      <div style={{ marginTop: 16 }}>
        <b>Progression globale : {percent}%</b>
        <LinearProgress variant="determinate" value={percent} style={{ height: 10, borderRadius: 5, marginTop: 8 }} />
      </div>
    </div>
  );
}

export default ProgressDashboard;
