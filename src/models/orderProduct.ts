import pool from "../database";

export interface OrderProduct {
  id?: number;
  quantity: number;
  order_id: number;
  product_id: number;
}

export class OrderProductStore {
  async create(
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
