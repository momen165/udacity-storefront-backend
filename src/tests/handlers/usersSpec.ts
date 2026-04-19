import request from "supertest";

import app from "../../server";
import { UserStore } from "../../models/user";
import { resetTables, signTestToken } from "../helpers";

describe("Users handlers", () => {
  const store = new UserStore();

  beforeEach(async () => {
    await resetTables();
  });

  it("POST /users creates a user and returns a token", async () => {
    const response = await request(app).post("/users").send({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.first_name).toEqual("Jane");
  });

  it("GET /users requires a token", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(401);
  });

  it("GET /users returns users with a valid token", async () => {
    const user = await store.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it("GET /users/:id returns a user with a valid token", async () => {
    const user = await store.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const response = await request(app)
      .get(`/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.first_name).toEqual("Jane");
  });

  it("GET /users/:id returns 400 for an invalid id", async () => {
    const user = await store.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const response = await request(app)
      .get("/users/not-a-number")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual("Invalid user id");
  });

  it("GET /users/:id returns 404 when user does not exist", async () => {
    const user = await store.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });
    const token = signTestToken(user);

    const response = await request(app)
      .get("/users/999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual("User not found");
  });

  it("POST /users/authenticate returns a token", async () => {
    await store.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });

    const response = await request(app).post("/users/authenticate").send({
      username: "Jane",
      password: "secret123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it("POST /users/authenticate returns 401 for invalid credentials", async () => {
    await store.create({
      first_name: "Jane",
      last_name: "Doe",
      password: "secret123",
    });

    const response = await request(app).post("/users/authenticate").send({
      username: "Jane",
      password: "wrong-pass",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual(
      "The username and password do not match",
    );
  });
});
