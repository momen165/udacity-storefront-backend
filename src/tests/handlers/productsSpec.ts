import request from "supertest";

import app from "../../server";
import { OrderStore } from "../../models/order";
import { OrderProductStore } from "../../models/orderProduct";
import { ProductStore } from "../../models/product";
import { UserStore } from "../../models/user";
import { signTestToken, resetTables } from "../helpers";

describe("Products handlers", () => {
  const store = new ProductStore();
  const orderStore = new OrderStore();
  const orderProductStore = new OrderProductStore();
  const userStore = new UserStore();

  beforeEach(async () => {
    await resetTables();
  });

  it("GET /products returns 200", async () => {
    const product = await store.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });

    const response = await request(app).get("/products");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toEqual(product.id);
  });

  it("GET /products/:id returns one product", async () => {
    const product = await store.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });

    const response = await request(app).get(`/products/${product.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(product.id);
    expect(response.body.name).toEqual("Coffee");
  });

  it("GET /products/:id returns 400 for an invalid id", async () => {
    const response = await request(app).get("/products/not-a-number");

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Invalid product id");
  });

  it("GET /products/:id returns 404 when product does not exist", async () => {
    const response = await request(app).get("/products/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual("Product not found");
  });

  it("GET /products/popular returns the 5 most commonly ordered items", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });

    const coffee = await store.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });

    const tea = await store.create({
      name: "Tea",
      price: 9,
      category: "Beverages",
    });

    const firstOrder = await orderStore.create(user.id as number);
    const secondOrder = await orderStore.create(user.id as number);

    await orderProductStore.create(
      3,
      firstOrder.id as number,
      coffee.id as number,
    );
    await orderStore.updateStatus(firstOrder.id as number, "complete");

    await orderProductStore.create(
      5,
      secondOrder.id as number,
      tea.id as number,
    );
    await orderStore.updateStatus(secondOrder.id as number, "complete");

    const response = await request(app).get("/products/popular");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toEqual("Tea");
    expect(response.body[0].total_ordered).toBe(5);
    expect(response.body[1].name).toEqual("Coffee");
    expect(response.body[1].total_ordered).toBe(3);
  });

  it("POST /products without a token returns 401", async () => {
    const response = await request(app).post("/products").send({
      name: "Tea",
      price: 9,
      category: "Beverages",
    });

    expect(response.status).toBe(401);
  });

  it("POST /products with a token creates a product", async () => {
    const token = signTestToken({
      id: 1,
      first_name: "Jane",
      last_name: "Doe",
    });

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Tea",
        price: 9,
        category: "Beverages",
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toEqual("Tea");
  });
});
