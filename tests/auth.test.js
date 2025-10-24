const request = require("supertest");
const app = require("../src/app");
const db = require("./setup");

beforeAll(async () => {
  await db.connect();
});
afterAll(async () => {
  await db.close();
});
afterEach(async () => {
  await db.clear();
});

describe("Auth", () => {
  test("signup and signin flow", async () => {
    const user = {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      password: "pass1234",
    };
    const res = await request(app).post("/api/auth/signup").send(user);
    expect(res.status).toBe(201);
    const res2 = await request(app)
      .post("/api/auth/signin")
      .send({ email: user.email, password: user.password });
    expect(res2.status).toBe(200);
    expect(res2.body.token).toBeDefined();
  });
  test("signin with wrong password fails", async () => {
    const user = {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane2@example.com",
      password: "pass1234",
    };
    await request(app).post("/api/auth/signup").send(user);
    const res = await request(app)
      .post("/api/auth/signin")
      .send({ email: user.email, password: "wrong" });
    expect(res.status).toBe(401);
  });
});
