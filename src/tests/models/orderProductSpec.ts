import { OrderStore } from "../../models/order";
import { OrderProductStore } from "../../models/orderProduct";
import { ProductStore } from "../../models/product";
import { UserStore } from "../../models/user";
import pool, { resetTables } from "../helpers";

describe("OrderProductStore", () => {
  const orderStore = new OrderStore();
  const store = new OrderProductStore();
  const productStore = new ProductStore();
  const userStore = new UserStore();

  beforeEach(async () => {
    await resetTables();
  });

  it("creates an order_product row", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const product = await productStore.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });
    const order = await orderStore.create(user.id as number);

    const orderProduct = await store.create(
      3,
      order.id as number,
      product.id as number,
    );

    expect(orderProduct.id).toBeDefined();
    expect(orderProduct.quantity).toEqual(3);
    expect(orderProduct.order_id).toEqual(order.id as number);
    expect(orderProduct.product_id).toEqual(product.id as number);

    const result = await pool.query(
      "SELECT * FROM order_products WHERE id = $1",
      [orderProduct.id],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].quantity).toEqual(3);
  });

  it("throws ORDER_NOT_FOUND for an unknown order id", async () => {
    const product = await productStore.create({
      name: "Coffee",
      price: 12,
      category: "Beverages",
    });

    await expectAsync(
      store.create(1, 999, product.id as number),
    ).toBeRejectedWithError("ORDER_NOT_FOUND");
  });

  it("throws PRODUCT_NOT_FOUND for an unknown product id", async () => {
    const user = await userStore.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const order = await orderStore.create(user.id as number);

    await expectAsync(
      store.create(1, order.id as number, 999),
    ).toBeRejectedWithError("PRODUCT_NOT_FOUND");
  });
});
