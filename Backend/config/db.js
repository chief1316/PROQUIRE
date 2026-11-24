const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2" } : undefined,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

db.query("SELECT DATABASE()", (err, result) => {
  if (err) {
    console.error("Database test query failed:", err);
  } else {
    console.log("Database test result:", result);
  }
});

module.exports = db;
