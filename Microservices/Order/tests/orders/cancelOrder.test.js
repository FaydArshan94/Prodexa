const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const orderModel = require("../../src/models/order.model");
const { getAuthCookie } = require("../setup/auth");

let mongoServer;

describe("POST /api/orders/:id/cancel", () => {
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

  const createOrder = async (customUserId = userId, status = "Pending") => {
    const order = await orderModel.create({
      _id: new mongoose.Types.ObjectId(),
      user: customUserId,
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          product: {
            _id: new mongoose.Types.ObjectId(),
            title: "Sample Product"
          },
          quantity: 2,
          price: { amount: 100, currency: "INR" },
          total: 200
        }
      ],
      totalPrice: { amount: 200, currency: "INR" },
      status: status,
      shippingAddress: {
        street: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India"
      },
      cancellationReason: null,
      cancelledAt: null
    });
    return order;
  };

  it("should return 401 if user is not authenticated", async () => {
    const order = await createOrder();
    const response = await request(app)
      .post(`/api/orders/${order._id}/cancel`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized: No token provided");
  });

  it("should return 404 if order is not found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .post(`/api/orders/${nonExistentId}/cancel`)
      .set("Cookie", getAuthCookie({ userId }))
      .send({ reason: "Changed my mind" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Order not found");
  });

  it("should return 403 if user is not the owner of the order", async () => {
    const order = await createOrder();
    const differentUserId = "64f8b0b077ca081c4366a250";
    
    const response = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set("Cookie", getAuthCookie({ userId: differentUserId }))
      .send({ reason: "Changed my mind" });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Not authorized to cancel this order");
  });

  it("should return 400 if cancellation reason is not provided", async () => {
    const order = await createOrder();
    
    const response = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set("Cookie", getAuthCookie({ userId }))
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Cancellation reason is required");
  });

  it("should return 400 if order is already cancelled", async () => {
    const order = await createOrder(userId, "Cancelled");
    
    const response = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set("Cookie", getAuthCookie({ userId }))
      .send({ reason: "Changed my mind" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Order is already cancelled");
  });

  it("should return 400 if order is not in cancellable state", async () => {
    const order = await createOrder(userId, "Shipped");
    
    const response = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set("Cookie", getAuthCookie({ userId }))
      .send({ reason: "Changed my mind" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Order cannot be cancelled in current status");
  });

  it("should successfully cancel a pending order", async () => {
    const order = await createOrder(userId, "Pending");
    const reason = "Changed my mind";
    
    const response = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set("Cookie", getAuthCookie({ userId }))
      .send({ reason });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Order cancelled successfully");
    expect(response.body.order).toMatchObject({
        cancellationReason: reason,
        status: "Cancelled",
    });

    // Verify database update
    const updatedOrder = await orderModel.findById(order._id);
    expect(updatedOrder.status).toBe("Cancelled");
    expect(updatedOrder.cancellationReason).toBe(reason);
    expect(updatedOrder.cancelledAt).toBeDefined();
    expect(new Date(updatedOrder.cancelledAt)).toBeInstanceOf(Date);
  });

  it("should validate cancellation reason length", async () => {
    const order = await createOrder();
    const reason = "a".repeat(501); // Assuming max length is 500
    
    const response = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set("Cookie", getAuthCookie({ userId }))
      .send({ reason });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Cancellation reason is too long");
  });
});
