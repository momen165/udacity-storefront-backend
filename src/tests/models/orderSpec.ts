import { OrderStore } from "../../models/order";
import pool, { resetTables } from "../helpers";

describe("OrderStore", () => {
  const store = new OrderStore();

  beforeEach(async () => {
    await resetTables();
  });

  it("returns the current active order for a user", async () => {
    const user = await pool.query(
      "INSERT INTO users (first_name, last_name, hashed_password) VALUES ($1, $2, $3) RETURNING *",
      ["Jane", "Doe", "hashed-password"],
    );

    await pool.query("INSERT INTO orders (user_id, status) VALUES ($1, $2)", [
      user.rows[0].id,
      "active",
    ]);

    const order = await store.getCurrentByUserId(String(user.rows[0].id));

    expect(order).not.toBeNull();
    expect(order?.user_id).toEqual(user.rows[0].id);
    expect(order?.status).toEqual("active");
  });

  it("adds a product to an order", async () => {
    const user = await pool.query(
      "INSERT INTO users (first_name, last_name, hashed_password) VALUES ($1, $2, $3) RETURNING *",
      ["Jane", "Doe", "hashed-password"],
    );

    const product = await pool.query(
      "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *",
      ["Coffee", 12, "Beverages"],
    );

    const order = await pool.query(
      "INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *",
      [user.rows[0].id, "active"],
    );

    const addedProduct = await store.addProduct(
      3,
      order.rows[0].id,
      product.rows[0].id,
    );

    expect(addedProduct.id).toBeDefined();
    expect(addedProduct.quantity).toEqual(3);
    expect(addedProduct.order_id).toEqual(order.rows[0].id);
    expect(addedProduct.product_id).toEqual(product.rows[0].id);

    const result = await pool.query(
      "SELECT * FROM order_products WHERE id = $1",
      [addedProduct.id],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].quantity).toEqual(3);
  });
});
