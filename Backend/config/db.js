const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2" } : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 60000,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Handle connection pool errors
db.on("error", (err) => {
  console.error("MySQL Pool Error:", err);
});

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }

  console.log("MySQL Connection Pool Ready");

  connection.query("SELECT DATABASE()", (queryErr, result) => {
    if (queryErr) {
      console.error("Database test failed:", queryErr);
    } else {
      console.log("Database test result:", result);
    }

    connection.release();
  });
});

module.exports = db;
