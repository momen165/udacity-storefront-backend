import request from "supertest";

import app from "../../server";
import { OrderStore } from "../../models/order";
import { ProductStore } from "../../models/product";
import { UserStore } from "../../models/user";
import pool, { resetTables, signTestToken } from "../helpers";

describe("Orders handlers", () => {
  const userStore = new UserStore();
  const productStore = new ProductStore();
  const orderStore = new OrderStore();

  beforeEach(async () => {
    await resetTables();
  });

  it("GET /orders/:user_id requires a token", async () => {
    const response = await request(app).get("/orders/1");

    expect(response.status).toBe(401);
  });

  it("POST /orders creates an active order", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const response = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: user.id });

    expect(response.status).toBe(201);
    expect(response.body.user_id).toEqual(user.id);
    expect(response.body.status).toEqual("active");
  });

  it("PATCH /orders/:id marks an order complete", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);
    const order = await orderStore.create(user.id as number);

    const response = await request(app)
      .patch(`/orders/${order.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "complete" });

    expect(response.status).toBe(200);
    expect(response.body.status).toEqual("complete");
  });

  it("PATCH /orders/:id returns 400 for an invalid order id", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const response = await request(app)
      .patch("/orders/not-a-number")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "complete" });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Invalid order id");
  });

  it("PATCH /orders/:id returns 404 when order does not exist", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const response = await request(app)
      .patch("/orders/999")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "complete" });

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual("Order not found");
  });

  it("GET /orders/:user_id returns the current order for a user", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const product = await productStore.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });

    const orderResult = await pool.query(
      "INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *",
      [user.id, "active"],
    );

    const addResponse = await request(app)
      .post(`/orders/${orderResult.rows[0].id}/products`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 1, productId: product.id });

    expect(addResponse.status).toBe(201);
    expect(addResponse.body.quantity).toBe(1);
    expect(addResponse.body.order_id).toEqual(orderResult.rows[0].id);
    expect(addResponse.body.product_id).toEqual(product.id);

    const order = await request(app)
      .get(`/orders/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(order.status).toBe(200);
    expect(order.body.user_id).toEqual(user.id);
    expect(order.body.status).toEqual("active");
  });

  it("POST /orders/:id/products requires a token", async () => {
    const response = await request(app)
      .post("/orders/1/products")
      .send({ quantity: 1, productId: 1 });

    expect(response.status).toBe(401);
  });

  it("POST /orders/:id/products adds a product with a valid token", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const product = await productStore.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });

    const orderResult = await pool.query(
      "INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *",
      [user.id, "active"],
    );

    const response = await request(app)
      .post(`/orders/${orderResult.rows[0].id}/products`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2, productId: product.id });

    expect(response.status).toBe(201);
    expect(response.body.quantity).toEqual(2);
    expect(response.body.order_id).toEqual(orderResult.rows[0].id);
    expect(response.body.product_id).toEqual(product.id);

    const currentOrder = await orderStore.getCurrentByUserId(String(user.id));

    expect(currentOrder).not.toBeNull();
    expect(currentOrder?.id).toEqual(orderResult.rows[0].id);
  });

  it("POST /orders/:id/products returns 400 for invalid payload", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const response = await request(app)
      .post("/orders/invalid/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: "not-a-number", productId: "bad" });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(
      "quantity, orderId, and productId must be valid numbers",
    );
  });

  it("POST /orders/:id/products returns 404 when order does not exist", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const product = await productStore.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });

    const response = await request(app)
      .post("/orders/999/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 1, productId: product.id });

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual("Order not found");
  });

  it("POST /orders/:id/products returns 404 when product does not exist", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const order = await orderStore.create(user.id as number);

    const response = await request(app)
      .post(`/orders/${order.id}/products`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 1, productId: 999 });

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual("Product not found");
  });
});
