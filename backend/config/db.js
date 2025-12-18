const mysql = require("mysql2");

const connection = mysql.createPool({
  // host: "srv2057.hstgr.io",
  // user: "u976121835_Redge7Petanque",
  // password: "Suarezbarca.9",
  // database: "u976121835_petanque",
  // port: 3306,

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

module.exports = connection;
