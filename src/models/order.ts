import pool from "../database";

export interface Order {
  id?: number;
  user_id: number;
  status: string;
}

export interface OrderProduct {
  id?: number;
  quantity: number;
  order_id: number;
  product_id: number;
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

  async addProduct(
    quantity: number,
    orderId: number,
    productId: number,
  ): Promise<OrderProduct> {
    const connection = await pool.connect();

    try {
      const orderResult = await connection.query(
        "SELECT id FROM orders WHERE id = $1",
        [orderId],
      );

      if (orderResult.rows.length === 0) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const productResult = await connection.query(
        "SELECT id FROM products WHERE id = $1",
        [productId],
      );

      if (productResult.rows.length === 0) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const result = await connection.query(
        "INSERT INTO order_products (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *",
        [quantity, orderId, productId],
      );

      return result.rows[0];
    } finally {
      connection.release();
    }
  }
}
