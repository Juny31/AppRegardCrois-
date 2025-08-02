import React from 'react';

const priorityColor = { 'Haute': 'red', 'Moyenne': 'orange', 'Basse': 'green' };

function ContactBoard({ contacts, onAdd, onUpdate, onDelete }) {
  // --- AJOUT ---
  const addContact = async () => {
    const name = prompt("Nom du contact ?");
    if (name) {
      await onAdd({
        name,
        type: 'Organisation', // ou 'Personnalité'
        priority: 'Basse',
        status: 'À contacter',
        notes: ''
      });
    }
  };

  // --- MODIF ---
  const updateContact = async (id, field, value) => {
    const c = contacts.find(c => c.id === id);
    if (!c) return;
    await onUpdate(id, { ...c, [field]: value });
  };

  // --- SUPPRESSION ---
  const removeContact = async (id) => {
    if (window.confirm("Supprimer ce contact ?")) {
      await onDelete(id);
    }
  };

  return (
    <div>
      <h2>Contacts</h2>
      <button onClick={addContact}>Ajouter un contact</button>
      <ul>
        {contacts.map(c => (
          <li key={c.id} style={{ border: "1px solid #ddd", margin: 8, padding: 8 }}>
            <b>{c.name}</b> ({c.type})
            <span style={{
              color: priorityColor[c.priority],
              fontWeight: 'bold',
              marginLeft: 10
            }}>{c.priority}</span>
            <br />
            Statut :
            <select
              value={c.status}
              onChange={e => updateContact(c.id, "status", e.target.value)}
              style={{ marginLeft: 5 }}
            >
              <option>À contacter</option>
              <option>En contact</option>
              <option>En attente</option>
              <option>Terminé</option>
            </select>
            <br />
            Priorité :
            <select
              value={c.priority}
              onChange={e => updateContact(c.id, "priority", e.target.value)}
              style={{ marginLeft: 5 }}
            >
              <option>Haute</option>
              <option>Moyenne</option>
              <option>Basse</option>
            </select>
            <br />
            Notes :
            <textarea
              value={c.notes}
              onChange={e => updateContact(c.id, "notes", e.target.value)}
              style={{ width: "95%", minHeight: 30 }}
            />
            <button onClick={() => removeContact(c.id)} style={{ color: "red" }}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContactBoard;
