import { OrderStore } from "../../models/order";
import { OrderProductStore } from "../../models/orderProduct";
import { ProductStore } from "../../models/product";
import { UserStore } from "../../models/user";
import pool, { resetTables } from "../helpers";

describe("ProductStore", () => {
  const store = new ProductStore();
  const orderStore = new OrderStore();
  const orderProductStore = new OrderProductStore();
  const userStore = new UserStore();

  beforeEach(async () => {
    await resetTables();
  });

  it("creates a product", async () => {
    const product = await store.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });

    expect(product.id).toBeDefined();
    expect(product.name).toEqual("Coffee");
    expect(product.price).toEqual(12);
    expect(product.category).toEqual("Beverages");
  });

  it("returns a list of products", async () => {
    await pool.query(
      "INSERT INTO products (name, price, category) VALUES ($1, $2, $3)",
      ["Coffee", 12, "Beverages"],
    );

    const products = await store.index();

    expect(products.length).toBe(1);
    expect(products[0].name).toEqual("Coffee");
    expect(products[0].price).toEqual(12);
    expect(products[0].category).toEqual("Beverages");
  });

  it("shows a product by id", async () => {
    const result = await pool.query(
      "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *",
      ["Coffee", 12, "Beverages"],
    );

    const product = await store.show(result.rows[0].id);

    expect(product).not.toBeNull();
    expect(product?.id).toEqual(result.rows[0].id);
    expect(product?.name).toEqual("Coffee");
    expect(product?.price).toEqual(12);
    expect(product?.category).toEqual("Beverages");
  });

  it("returns products ranked by total ordered quantity", async () => {
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

    const activeOrder = await orderStore.create(user.id as number);
    await orderProductStore.create(
      2,
      activeOrder.id as number,
      coffee.id as number,
    );
    await orderStore.updateStatus(activeOrder.id as number, "complete");

    const secondOrder = await orderStore.create(user.id as number);
    await orderProductStore.create(
      5,
      secondOrder.id as number,
      tea.id as number,
    );
    await orderStore.updateStatus(secondOrder.id as number, "complete");

    const popularProducts = await store.popular();

    expect(popularProducts.length).toBe(2);
    expect(popularProducts[0].name).toEqual("Tea");
    expect(popularProducts[0].total_ordered).toEqual(5);
    expect(popularProducts[1].name).toEqual("Coffee");
    expect(popularProducts[1].total_ordered).toEqual(2);
  });
});
