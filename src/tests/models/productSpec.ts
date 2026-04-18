import { ProductStore } from "../../models/product";
import pool, { resetTables } from "../helpers";

describe("ProductStore", () => {
  const store = new ProductStore();

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
});
