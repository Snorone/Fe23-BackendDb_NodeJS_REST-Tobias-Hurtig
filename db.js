import mysql from "mysql2/promise"

// Create a pool of database connections
const db = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'gritacademy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
 export default db;