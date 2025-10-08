const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const orderModel = require("../../src/models/order.model");
const { getAuthCookie } = require("../setup/auth");

let mongoServer;

describe("GET /api/orders/:id", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await orderModel.deleteMany({});
  });

  const userId = "68da109598d6038fb573f2b5";
  const orderId = new mongoose.Types.ObjectId();

  const createOrder = async (customUserId = userId) => {
    const order = await orderModel.create({
      _id: new mongoose.Types.ObjectId(),
      user: customUserId,
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          product: {
            _id: new mongoose.Types.ObjectId(),
            title: "Sample Product",
          },
          quantity: 2,
          price: { amount: 100, currency: "INR" },
          total: 200,
        },
      ],
      totalPrice: { amount: 200, currency: "INR" },
      status: "Pending",
      shippingAddress: {
        street: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India",
      },
    });
    return order;
  };

  it("should return 401 if user is not authenticated", async () => {
    const order = await createOrder();
    const response = await request(app).get(`/api/orders/${order._id}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized: No token provided");
  });

  it("should return 404 if order is not found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/api/orders/${nonExistentId}`)
      .set("Cookie", getAuthCookie({ userId }));

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Order not found");
  });

  it("should return 403 if user is not the owner of the order", async () => {
    const order = await createOrder();
    const differentUserId = "64f8b0b077ca081c4366a250";

    const response = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Cookie", getAuthCookie({ userId: differentUserId }));

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Not authorized to view this order");
  });

  it("should return 400 if order id is invalid", async () => {
    const response = await request(app)
      .get("/api/orders/invalid-id")
      .set("Cookie", getAuthCookie({ userId }));

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid order ID");
  });

  it("should successfully return the order details", async () => {
    const order = await createOrder();

    const response = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Cookie", getAuthCookie({ userId }));

    expect(response.status).toBe(200);
    expect(response.body.order).toMatchObject({
      user: userId,
      items: [
        {
          productId: order.items[0].productId.toString(),
          product: {
            _id: order.items[0].product._id.toString(),
            title: "Sample Product",
          },
          quantity: 2,
          price: { amount: 100, currency: "INR" },
        },
      ],
      totalPrice: { amount: 200, currency: "INR" },
      status: "Pending",
      shippingAddress: {
        street: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India",
      },
    });
  });

  it("should include createdAt and updatedAt timestamps", async () => {
    const order = await createOrder();

    const response = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Cookie", getAuthCookie({ userId }));

    expect(response.status).toBe(200);
    expect(response.body.order.createdAt).toBeDefined();
    expect(response.body.order.updatedAt).toBeDefined();
    expect(new Date(response.body.order.createdAt)).toBeInstanceOf(Date);
    expect(new Date(response.body.order.updatedAt)).toBeInstanceOf(Date);
  });
});
