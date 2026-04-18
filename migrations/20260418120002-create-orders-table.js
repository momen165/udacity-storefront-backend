const fs = require("fs");
const path = require("path");

exports.up = function (db) {
  const sql = fs.readFileSync(
    path.join(__dirname, "sqls", "20260418120002-create-orders-table-up.sql"),
  );

  return db.runSql(sql.toString());
};

exports.down = function (db) {
  const sql = fs.readFileSync(
    path.join(__dirname, "sqls", "20260418120002-create-orders-table-down.sql"),
  );

  return db.runSql(sql.toString());
};
