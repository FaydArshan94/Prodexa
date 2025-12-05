const amqplib = require("amqplib");

let channel;
let connection;

async function connect() {
  try {
    if (channel) return channel; // already connected

    connection = await amqplib.connect(process.env.RABBIT_URL);
    console.log("🐇 Connected to RabbitMQ");

    channel = await connection.createChannel();
    return channel;
  } catch (err) {
    console.error("❌ RabbitMQ Connection Error:", err);
  }
}

// --------------------- PUBLISH ----------------------
async function publishToQueue(queueName, data = {}) {
  const ch = await connect();

  await ch.assertQueue(queueName, { durable: true });

  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));

  console.log("📤 Message sent →", queueName, data);
}

// --------------------- SUBSCRIBE ----------------------
async function subscribeToQueue(queueName, callback) {
  const ch = await connect();

  await ch.assertQueue(queueName, { durable: true });

  ch.consume(queueName, async (msg) => {
    if (!msg) return;

    const content = JSON.parse(msg.content.toString());  // FIXED
    console.log("📥 Message received ←", queueName, content);

    await callback(content);
    ch.ack(msg);
  });
}

module.exports = {
  connect,
  publishToQueue,
  subscribeToQueue,
};
