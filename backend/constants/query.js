const pool = require("../config/db");

exports.query = (sql, params = [], conn = null) =>
  new Promise((resolve, reject) => {
    const c = conn || pool;
    c.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

exports.withTransaction = async (callback) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
