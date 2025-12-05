const { subscribeToQueue } = require("../broker/broker");
const orderModel = require("../models/order.model");

async function startOrderConsumer() {

  // Order Created
  subscribeToQueue("ORDER_CREATED", async (data) => {
    console.log("📥 ORDER_CREATED received", data);
    await orderModel.findOneAndUpdate(
      { _id: data._id },
      data,
      { upsert: true, new: true }
    );
  });

  // Order Updated
  subscribeToQueue("ORDER_UPDATED", async (data) => {
    console.log("📥 ORDER_UPDATED received");
    await orderModel.findOneAndUpdate(
      { _id: data._id },
      data,
      { upsert: true }
    );
  });

  // Order Deleted / Cancelled
  subscribeToQueue("ORDER_CANCELLED", async (data) => {
    console.log("📥 ORDER_CANCELLED received");
    await orderModel.deleteOne({ _id: data._id });
  });

  console.log("📡 Seller Dashboard Order Consumer Running...");
}

module.exports = startOrderConsumer;
