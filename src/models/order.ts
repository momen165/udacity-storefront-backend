import pool from "../database";

export interface Order {
  id?: number;
  user_id: number;
  status: string;
}

export class OrderStore {
  async create(userId: number): Promise<Order> {
    const connection = await pool.connect();

    try {
      const result = await connection.query(
        "INSERT INTO orders (user_id, status) VALUES ($1, 'active') RETURNING id, user_id, status",
        [userId],
      );

      return result.rows[0];
    } finally {
      connection.release();
    }
  }

  async getCurrentByUserId(userId: string): Promise<Order | null> {
    const connection = await pool.connect();

    try {
      const result = await connection.query(
        "SELECT id, user_id, status FROM orders WHERE user_id = $1 AND status = 'active'",
        [userId],
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } finally {
      connection.release();
    }
  }

  async updateStatus(orderId: number, status: string): Promise<Order | null> {
    const connection = await pool.connect();

    try {
      const result = await connection.query(
        "UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, user_id, status",
        [status, orderId],
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } finally {
      connection.release();
    }
  }
}
