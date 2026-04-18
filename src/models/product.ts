import pool from "../database";

export interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
}

export interface PopularProduct extends Product {
  total_ordered: number;
}

export class ProductStore {
  async index(): Promise<Product[]> {
    const connection = await pool.connect();

    try {
      const result = await connection.query("SELECT * FROM products");

      return result.rows;
    } finally {
      connection.release();
    }
  }

  async show(id: number): Promise<Product | null> {
    const connection = await pool.connect();

    try {
      const result = await connection.query(
        "SELECT * FROM products WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } finally {
      connection.release();
    }
  }

  async create(p: Product): Promise<Product> {
    const connection = await pool.connect();

    try {
      const result = await connection.query(
        "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *",
        [p.name, p.price, p.category],
      );

      return result.rows[0];
    } finally {
      connection.release();
    }
  }

  async popular(): Promise<PopularProduct[]> {
    const connection = await pool.connect();

    try {
      const result = await connection.query(
        "SELECT p.id, p.name, p.price, p.category, COALESCE(SUM(op.quantity), 0)::int AS total_ordered FROM products p JOIN order_products op ON op.product_id = p.id JOIN orders o ON o.id = op.order_id AND o.status = 'complete' GROUP BY p.id, p.name, p.price, p.category ORDER BY total_ordered DESC, p.id ASC LIMIT 5",
      );

      return result.rows;
    } finally {
      connection.release();
    }
  }
}
