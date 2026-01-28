const connection = require("../config/db");

exports.query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// const connection = require("../config/db");

// exports.query = (sql, params = []) =>
//   new Promise((resolve, reject) => {
//     connection.query(sql, params, (err, results) => {
//       if (err) return reject(err);
//       resolve(results);
//     });
//   });

// exports.begin = () =>
//   new Promise((resolve, reject) => {
//     connection.beginTransaction(err => {
//       if (err) return reject(err);
//       resolve();
//     });
//   });

// exports.commit = () =>
//   new Promise((resolve, reject) => {
//     connection.commit(err => {
//       if (err) return reject(err);
//       resolve();
//     });
//   });

// exports.rollback = () =>
//   new Promise(resolve => {
//     connection.rollback(() => resolve());
//   });

//   const { query, begin, commit, rollback } = require("../../constants/query");

// exports.arbre = async (req, res) => {
//   try {
//     await begin();

//     // toutes tes queries ici
//     await query("update matches2 set ...");

//     await commit();
//     return res.status(200).send("Victoire validée");
//   } catch (err) {
//     await rollback();
//     console.error(err);
//     return res.status(500).send("Erreur transaction");
//   }
// };
