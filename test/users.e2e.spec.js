const request = require("supertest");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");

require("dotenv").config();

const app = require("../app");
const db = require("../model/db");
const User = require("../model/user");
const Users = require("../repositories/users");

const { newTestUser } = require("./data/data");
const jestConfig = require("../jest.config");

describe("Test route users", () => {
  let token;
  beforeAll(async () => {
    await db;
    await User.deleteOne({ email: newTestUser.email });
  });

  afterAll(async () => {
    const mongo = await db;
    await User.deleteOne({ email: newTestUser.email });
    await mongo.disconnect();
  });

  it("Register User", async () => {
    const response = await request(app)
      .post("/api/users/register")
      .send({
        name: newTestUser.name,
        email: newTestUser.email,
        password: newTestUser.password,
      })
      .set("Accept", "application/json");
    expect(response.status).toEqual(201);
    expect(response.body).toBeDefined();
  });

  it("Authorization error 401 User", async () => {
    const fakeToken = "60ad371ee5c5131384447a75";
    const response = await request(app)
      .patch("/api/users/avatars")
      .set("Authorization", `Bearer ${fakeToken}`);
    expect(response.status).toEqual(401);
    expect(response.body).toBeDefined();
  });
  it("Login User", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ email: newTestUser.email, password: newTestUser.password })
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    token = response.body.data.token;
  });
  it("Authorization 200 User", async () => {
    const buffer = await fs.readFile("./test/data/avatar.jpg");
    const response = await request(app)
      .patch("/api/users/avatars")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatarUrl", buffer, "avatar.jpg");
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    // expect(response.body.data.avatarUrl).toEqual()
  });
});
