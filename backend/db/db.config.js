const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: "root",
  password: process.env.DB_PASSWORD || "",
  //   database: "userForm", // if you have already created the db then write the name here, or leave it
});

db.query("USE userForm", (err) => {
  if (err) throw err;
  db.query("CREATE DATABASE IF NOT EXISTS userForm", (err) => {
    if (err) {
      console.error("Error creating database:", err);
    } else {
      console.log("Database created or already exists.");
    }

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstName VARCHAR(50) NOT NULL,
            lastName VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            age INT CHECK (age >= 0 AND age <= 120),
            education VARCHAR(200) NOT NULL
        )`;
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error("Error creating table:", err);
      } else {
        console.log("Table created or already exists.");
      }
    });
  });
});

module.exports = db;
