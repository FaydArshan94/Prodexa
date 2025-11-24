const amqp = require("amqplib");
const SellerProduct = require("../models/product.model"); // local copy

async function startProductConsumer() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange("product_events", "fanout", { durable: false });

  const q = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(q.queue, "product_events", "");

  channel.consume(q.queue, async (msg) => {
    const event = JSON.parse(msg.content.toString());
    const { eventType, data } = event;

    console.log("Received:", eventType);

    if (eventType === "PRODUCT_CREATED") {
      await SellerProduct.create(data);
    }

    if (eventType === "PRODUCT_SELLER_DASHBOARD.PRODUCT_UPDATED") {
      await SellerProduct.findOneAndUpdate(
        { _id: data._id },
        data,
        { upsert: true }
      );
    }

    if (eventType === "PRODUCT_DELETED") {
      await SellerProduct.deleteOne({ _id: data._id });
    }
  });
}

module.exports = startProductConsumer;
