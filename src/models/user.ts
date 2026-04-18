import bcrypt from "bcrypt";

import pool from "../database";
import { Product } from "./product";

const saltRounds = 10;

export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  password: string;
}

export interface UserWithPurchases extends Omit<User, "password"> {
  recentPurchases: Product[];
}

export class UserStore {
  async index(): Promise<Omit<User, "password">[]> {
    const connection = await pool.connect();

    try {
      const result = await connection.query(
        "SELECT id, first_name, last_name FROM users",
      );

      return result.rows;
    } finally {
      connection.release();
    }
  }

  async show(id: number): Promise<UserWithPurchases | null> {
    const connection = await pool.connect();

    try {
      const result = await connection.query(
        "SELECT id, first_name, last_name FROM users WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const purchases = await connection.query(
        "SELECT p.id, p.name, p.price, p.category FROM orders o JOIN order_products op ON op.order_id = o.id JOIN products p ON p.id = op.product_id WHERE o.user_id = $1 AND o.status = 'complete' ORDER BY o.id DESC, op.id DESC LIMIT 5",
        [id],
      );

      return {
        ...result.rows[0],
        recentPurchases: purchases.rows,
      };
    } finally {
      connection.release();
    }
  }

  async create(u: User): Promise<Omit<User, "password">> {
    const connection = await pool.connect();

    try {
      const hashedPassword = await bcrypt.hash(u.password, saltRounds);

      const result = await connection.query(
        "INSERT INTO users (first_name, last_name, hashed_password) VALUES ($1, $2, $3) RETURNING id, first_name, last_name",
        [u.first_name, u.last_name, hashedPassword],
      );

      return result.rows[0];
    } finally {
      connection.release();
    }
  }

  async authenticate(
    username: string,
    password: string,
  ): Promise<Omit<User, "password"> | null> {
    const connection = await pool.connect();

    try {
      const result = await connection.query(
        "SELECT id, first_name, last_name, hashed_password FROM users WHERE first_name = $1",
        [username],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const passwordMatches = await bcrypt.compare(
        password,
        user.hashed_password,
      );

      if (!passwordMatches) {
        return null;
      }

      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
      };
    } finally {
      connection.release();
    }
  }
}
