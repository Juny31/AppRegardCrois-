// db.js — SQLite3 avec tables auto-créées
const Database = require('better-sqlite3');
const path = require('path');

// Utilise un fichier SQLite dans le dossier courant
const db = new Database(path.resolve(__dirname, 'appdata.sqlite'));

// Users
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL
  )
`).run();

// Tasks
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    priority TEXT,
    status TEXT,
    notes TEXT,
    assignedTo INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`).run();

// Contacts
db.prepare(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    priority TEXT,
    status TEXT,
    notes TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`).run();

module.exports = db;
