import React from 'react';

const priorityColor = { 'Haute': 'red', 'Moyenne': 'orange', 'Basse': 'green' };

<<<<<<< HEAD
function ContactBoard({ contacts, onAdd, onUpdate, onDelete }) {
=======
function ContactBoard({ contacts, onUpdate }) {
>>>>>>> aaa53ff (ajout des methodes requises)
  // --- AJOUT ---
  const addContact = async () => {
    const name = prompt("Nom du contact ?");
    if (name) {
<<<<<<< HEAD
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
=======
      const newContacts = [
        ...contacts,
        {
          id: Date.now(), // ou un générateur plus robuste côté back
          name,
          type: 'Organisation', // ou 'Personnalité'
          priority: 'Basse',
          status: 'À contacter',
          notes: ''
        }
      ];
      // POST sur /data
      await fetch('http://localhost:4000/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: newContacts })
      });
      onUpdate(newContacts); // onUpdate DOIT envoyer la nouvelle liste au parent
    }
  };

  // --- MODIF (pour select, textarea, etc) ---
  const updateContact = async (id, field, value) => {
    const newContacts = contacts.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    );
    await fetch('http://localhost:4000/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts: newContacts })
    });
    onUpdate(newContacts);
>>>>>>> aaa53ff (ajout des methodes requises)
  };

  // --- SUPPRESSION ---
  const removeContact = async (id) => {
    if (window.confirm("Supprimer ce contact ?")) {
<<<<<<< HEAD
      await onDelete(id);
=======
      const newContacts = contacts.filter(c => c.id !== id);
      await fetch('http://localhost:4000/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: newContacts })
      });
      onUpdate(newContacts);
>>>>>>> aaa53ff (ajout des methodes requises)
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
