const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const orderModel = require("../../src/models/order.model");
const { getAuthCookie } = require("../setup/auth");

let mongoServer;

describe("GET /api/orders/me", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await orderModel.deleteMany({});
  });

  const createSampleOrders = async (count) => {
    const orders = Array.from({ length: count }, (_, index) => ({
      user: "68da109598d6038fb573f2b5", // Fixed user ID for test consistency
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          product: {
            _id: new mongoose.Types.ObjectId(),
            title: `Sample Product ${index + 1}`,
          },
          quantity: index + 1,
          price: { amount: 100 * (index + 1), currency: "USD" },
        },
      ],
      totalPrice: {
        amount: 100 * (index + 1),
        currency: "USD",
      },
      status: "Pending",
      shippingAddress: {
        street: "123 Main St",
        city: "Metropolis",
        state: "CA",
        pincode: "90210",
        country: "USA",
      },
      createdAt: new Date(2025, 9, index + 1), // Creating orders with different dates
    }));

    await orderModel.insertMany(orders);
  };

  it("should return 401 if user is not authenticated", async () => {
    const response = await request(app).get("/api/orders/me");

    expect(response.status).toBe(401);
  });

  it("should return empty array when user has no orders", async () => {
    const response = await request(app)
      .get("/api/orders/me")
      .set("Cookie", getAuthCookie({ userId: "68da109598d6038fb573f2b5" }));

    expect(response.status).toBe(200);
    expect(response.body.orders).toEqual([]);
    expect(response.body.meta.total).toBe(0);
    expect(response.body.currentPage).toBe(1);
    expect(response.body.totalPages).toBe(0); // Changed from 1 to 0
    expect(response.body.meta.limit).toBe(10);
  });

  it("should return first page of orders with default pagination", async () => {
    await createSampleOrders(15);

    const response = await request(app)
      .get("/api/orders/me")
      .set("Cookie", getAuthCookie());

    expect(response.status).toBe(200);
    expect(response.body.orders).toHaveLength(10); // Default page size
    expect(response.body.meta.total).toBe(15);
    expect(response.body.currentPage).toBe(1);
    expect(response.body.totalPages).toBe(2);
  });

  it("should return specified page with custom page size", async () => {
    await createSampleOrders(20);

    const response = await request(app)
      .get("/api/orders/me?page=2&limit=5")
      .set("Cookie", getAuthCookie());

    expect(response.status).toBe(200);
    expect(response.body.orders).toHaveLength(5);
    expect(response.body.meta.total).toBe(20);
    expect(response.body.currentPage).toBe(2);
    expect(response.body.totalPages).toBe(4);
  });
});
