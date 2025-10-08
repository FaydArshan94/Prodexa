const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const orderModel = require("../../src/models/order.model");
const { getAuthCookie } = require("../setup/auth");

let mongoServer;

describe("PATCH /api/orders/:id/address", () => {
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
  const validAddress = {
    street: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
    isDefault: false,
  };

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
          quantity: 1,
          price: { amount: 100, currency: "INR" },
          total: 100,
        },
      ],
      totalPrice: { amount: 100, currency: "INR" },
      status: "Pending",
      shippingAddress: {
        street: "Old Street",
        city: "Old City",
        state: "Old State",
        pincode: "123456",
        country: "India",
      },
    });
    return order;
  };

  it("should return 401 if user is not authenticated", async () => {
    const order = await createOrder();
    const response = await request(app).patch(
      `/api/orders/${order._id}/address`
    );

    expect(response.status).toBe(401);
  });

  it("should return 404 if order is not found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .patch(`/api/orders/${nonExistentId}/address`)
      .set("Cookie", getAuthCookie({ userId }))
      .send(validAddress);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Order not found");
  });

  it("should return 403 if user is not the owner of the order", async () => {
    const order = await createOrder();
    const differentUserId = "64f8b0b077ca081c4366a250";

    const response = await request(app)
      .patch(`/api/orders/${order._id}/address`)
      .set("Cookie", getAuthCookie({ userId: differentUserId }))
      .send(validAddress);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Not authorized to update this order");
  });

  it("should return 400 if address data is incomplete", async () => {
    const order = await createOrder();
    const incompleteAddress = {
      street: "123 Main St",
      // missing city
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    };

    const response = await request(app)
      .patch(`/api/orders/${order._id}/address`)
      .set("Cookie", getAuthCookie({ userId }))
      .send(incompleteAddress);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid address data");
  });

  it("should return 400 if pincode is invalid", async () => {
    const order = await createOrder();
    const invalidAddress = {
      ...validAddress,
      pincode: "123", // too short
    };

    const response = await request(app)
      .patch(`/api/orders/${order._id}/address`)
      .set("Cookie", getAuthCookie({ userId }))
      .send(invalidAddress);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid pincode");
  });

  it("should not allow address update if order status is not Pending", async () => {
    const order = await createOrder();
    await orderModel.findByIdAndUpdate(order._id, { status: "Shipped" });

    const response = await request(app)
      .patch(`/api/orders/${order._id}/address`)
      .set("Cookie", getAuthCookie({ userId }))
      .send(validAddress);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Cannot update address for non-pending orders"
    );
  });

  it("should successfully update the shipping address", async () => {
    const order = await createOrder();

    const response = await request(app)
      .patch(`/api/orders/${order._id}/address`)
      .set("Cookie", getAuthCookie({ userId }))
      .send(validAddress);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Shipping address updated successfully");
    expect(response.body.order.shippingAddress).toEqual(validAddress);

    // Verify the update in database
    const updatedOrder = await orderModel.findById(order._id);
    expect(updatedOrder.shippingAddress).toEqual(
      expect.objectContaining(validAddress)
    );
  });
});
