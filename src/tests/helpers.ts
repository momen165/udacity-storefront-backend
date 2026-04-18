import jwt from "jsonwebtoken";

import pool from "../database";

export const resetTables = async () => {
  await pool.query(
    "TRUNCATE TABLE order_products, orders, products, users RESTART IDENTITY CASCADE",
  );
};

export const signTestToken = (payload: object) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET as string);
};

export default pool;
