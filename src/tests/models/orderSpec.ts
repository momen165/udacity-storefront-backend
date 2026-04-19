import { OrderStore } from "../../models/order";
import pool, { resetTables } from "../helpers";

describe("OrderStore", () => {
  const store = new OrderStore();

  beforeEach(async () => {
    await resetTables();
  });

  it("creates an active order for a user", async () => {
    const user = await pool.query(
      "INSERT INTO users (first_name, last_name, hashed_password) VALUES ($1, $2, $3) RETURNING *",
      ["Jane", "Doe", "hashed-password"],
    );

    const createdOrder = await store.create(user.rows[0].id);

    expect(createdOrder.id).toBeDefined();
    expect(createdOrder.user_id).toEqual(user.rows[0].id);
    expect(createdOrder.status).toEqual("active");
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

  it("updates an order status", async () => {
    const user = await pool.query(
      "INSERT INTO users (first_name, last_name, hashed_password) VALUES ($1, $2, $3) RETURNING *",
      ["Jane", "Doe", "hashed-password"],
    );

    const order = await store.create(user.rows[0].id);
    const updatedOrder = await store.updateStatus(
      order.id as number,
      "complete",
    );

    expect(updatedOrder).not.toBeNull();
    expect(updatedOrder?.id).toEqual(order.id);
    expect(updatedOrder?.status).toEqual("complete");
  });

  it("returns null when updating a non-existing order", async () => {
    const updatedOrder = await store.updateStatus(999, "complete");

    expect(updatedOrder).toBeNull();
  });
});
