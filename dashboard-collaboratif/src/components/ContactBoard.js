import React from 'react';

const priorityColor = { 'Haute': 'red', 'Moyenne': 'orange', 'Basse': 'green' };

function ContactBoard({ contacts, onUpdate }) {
  const updateContact = (id, field, value) => {
    onUpdate(
      contacts.map(c => c.id === id ? { ...c, [field]: value } : c)
    );
  };

  const addContact = () => {
    const name = prompt("Nom du contact ?");
    if (name) {
      onUpdate([
        ...contacts,
        {
          id: Date.now(),
          name,
          type: 'Organisation',
          priority: 'Basse',
          status: 'À contacter',
          notes: ''
        }
      ]);
    }
  };

  const removeContact = id => {
    if (window.confirm("Supprimer ce contact ?")) {
      onUpdate(contacts.filter(c => c.id !== id));
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
