import bcrypt from "bcrypt";

import { OrderStore } from "../../models/order";
import { ProductStore } from "../../models/product";
import { UserStore } from "../../models/user";
import pool, { resetTables } from "../helpers";

describe("UserStore", () => {
  const store = new UserStore();
  const orderStore = new OrderStore();
  const productStore = new ProductStore();

  beforeEach(async () => {
    await resetTables();
  });

  it("creates a user with a hashed password", async () => {
    const user = await store.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });

    expect(user.id).toBeDefined();
    expect(user.first_name).toEqual("Jane");
    expect(user.last_name).toEqual("Doe");

    const result = await pool.query(
      "SELECT * FROM users WHERE first_name = $1",
      ["Jane"],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].hashed_password).not.toEqual("secret123");
    expect(
      await bcrypt.compare("secret123", result.rows[0].hashed_password),
    ).toBeTrue();
  });

  it("returns a list of users", async () => {
    await pool.query(
      "INSERT INTO users (first_name, last_name, hashed_password) VALUES ($1, $2, $3)",
      ["Jane", "Doe", "hashed-password"],
    );

    const users = await store.index();

    expect(users.length).toBe(1);
    expect(users[0].first_name).toEqual("Jane");
    expect(users[0].last_name).toEqual("Doe");
  });

  it("shows a user by id", async () => {
    const result = await pool.query(
      "INSERT INTO users (first_name, last_name, hashed_password) VALUES ($1, $2, $3) RETURNING *",
      ["Jane", "Doe", "hashed-password"],
    );

    const user = await store.show(result.rows[0].id);

    expect(user).not.toBeNull();
    expect(user?.id).toEqual(result.rows[0].id);
    expect(user?.first_name).toEqual("Jane");
    expect(user?.last_name).toEqual("Doe");
  });

  it("includes the 5 most recent purchases on show", async () => {
    const user = await store.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });

    const firstProduct = await productStore.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });

    const secondProduct = await productStore.create({
      name: "Tea",
      price: 9,
      category: "Beverages",
    });

    const firstOrder = await orderStore.create(user.id as number);
    const secondOrder = await orderStore.create(user.id as number);

    await orderStore.addProduct(
      2,
      firstOrder.id as number,
      firstProduct.id as number,
    );
    await orderStore.updateStatus(firstOrder.id as number, "complete");

    await orderStore.addProduct(
      1,
      secondOrder.id as number,
      secondProduct.id as number,
    );
    await orderStore.updateStatus(secondOrder.id as number, "complete");

    const userWithPurchases = await store.show(user.id as number);

    expect(userWithPurchases).not.toBeNull();
    expect(userWithPurchases?.recentPurchases.length).toBe(2);
    expect(userWithPurchases?.recentPurchases[0].name).toEqual("Tea");
    expect(userWithPurchases?.recentPurchases[1].name).toEqual("Coffee");
  });
});
