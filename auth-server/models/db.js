const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database instance
const db = new sqlite3.Database(path.join(__dirname, '../auth.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize the users table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'client')) DEFAULT 'client',
      password TEXT NOT NULL
    )
  `);
});

// Helper functions for database operations
const dbOperations = {
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },

  findByIds: (ids) => {
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT email, username, role, id FROM users WHERE id IN (${placeholders})`;

    return new Promise((resolve, reject) => {
      db.all(query, ids, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  },

  createUser: (user) => {
    return new Promise((resolve, reject) => {
      const { email, username, role, password } = user;
      db.run(
        'INSERT INTO users (email, username, role, password) VALUES (?, ?, ?, ?)',
        [email, username, role, password],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },

  findAdminByUsernameOrEmail: (username, email) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND role = ?',
        [username, email, 'admin'],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }
};

module.exports = dbOperations; 