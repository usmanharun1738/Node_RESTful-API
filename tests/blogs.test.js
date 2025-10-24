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

async function createUserAndToken() {
  const user = {
    first_name: "Auth",
    last_name: "User",
    email: `u${Date.now()}@x.com`,
    password: "pass",
  };
  await request(app).post("/api/auth/signup").send(user);
  const signin = await request(app)
    .post("/api/auth/signin")
    .send({ email: user.email, password: user.password });
  return signin.body.token;
}

describe("Blogs", () => {
  test("create blog (auth required) and publish", async () => {
    const token = await createUserAndToken();
    const blog = {
      title: "My Post",
      description: "desc",
      tags: ["x"],
      body: "This is body content",
    };
    const res = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blog);
    expect(res.status).toBe(201);
    expect(res.body.state).toBe("draft");
    const id = res.body._id;
    // publish
    const pub = await request(app)
      .post(`/api/blogs/${id}/publish`)
      .set("Authorization", `Bearer ${token}`);
    expect(pub.status).toBe(200);
    expect(pub.body.state).toBe("published");
  });

  test("public list shows published only", async () => {
    const token = await createUserAndToken();
    // create two blogs, one published
    const b1 = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "t1", body: "b1", tags: ["a"] });
    const b2 = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "t2", body: "b2", tags: ["b"] });
    await request(app)
      .post(`/api/blogs/${b2.body._id}/publish`)
      .set("Authorization", `Bearer ${token}`);
    const pub = await request(app).get("/api/blogs");
    expect(pub.status).toBe(200);
    expect(pub.body.items.length).toBe(1);
  });

  test("get single increments read_count and returns author", async () => {
    const token = await createUserAndToken();
    const b = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "t3", body: "body text", tags: [] });
    await request(app)
      .post(`/api/blogs/${b.body._id}/publish`)
      .set("Authorization", `Bearer ${token}`);
    const res1 = await request(app).get(`/api/blogs/${b.body._id}`);
    expect(res1.status).toBe(200);
    expect(res1.body.read_count).toBe(1);
    expect(res1.body.author.email).toBeDefined();
    // second read
    const res2 = await request(app).get(`/api/blogs/${b.body._id}`);
    expect(res2.body.read_count).toBe(2);
  });

  test("owner can update and delete", async () => {
    const token = await createUserAndToken();
    const b = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "t4", body: "b" });
    const id = b.body._id;
    const up = await request(app)
      .put(`/api/blogs/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "t4-new" });
    expect(up.status).toBe(200);
    expect(up.body.title).toBe("t4-new");
    const del = await request(app)
      .delete(`/api/blogs/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);
  });

  test("own list endpoint", async () => {
    const token = await createUserAndToken();
    await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "om1", body: "b" });
    await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "om2", body: "b" });
    const res = await request(app)
      .get("/api/blogs/me/list")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
  });
});
