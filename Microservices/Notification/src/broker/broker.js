const amqplib = require("amqplib");

let channel, connection;

async function connect() {
  if (connection) return connection;

  try {
    console.log('🔌 Connecting to RabbitMQ...');
    console.log('📍 URL:', process.env.RABBIT_URL ? 'Set' : 'NOT SET!');
    
    connection = await amqplib.connect(process.env.RABBIT_URL);
    console.log("✅ Connected to RabbitMQ");
    
    channel = await connection.createChannel();
    console.log("✅ Channel created");

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err);
      connection = null;
      channel = null;
    });

    connection.on('close', () => {
      console.log('⚠️ RabbitMQ connection closed. Reconnecting in 5s...');
      connection = null;
      channel = null;
      setTimeout(connect, 5000);
    });

    return connection;
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connect, 5000);
    throw error;
  }
}

async function publishToQueue(queueName, data = {}) {
  try {
    if (!channel || !connection) await connect();

    await channel.assertQueue(queueName, {
      durable: true,
    });

    // FIXED: JSON.stringify (was stringfy)
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    console.log("📤 Message sent to queue:", queueName);
  } catch (error) {
    console.error("❌ Error publishing to queue:", error);
  }
}

async function subscribeToQueue(queueName, callBack) {
  try {
    if (!channel || !connection) await connect();

    await channel.assertQueue(queueName, {
      durable: true,
    });

    console.log(`👂 Listening to queue: ${queueName}`);

    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log(`📥 Received from ${queueName}:`, JSON.stringify(data).substring(0, 100));
          
          await callBack(data);
          channel.ack(msg);
          console.log(`✅ Processed message from ${queueName}`);
        } catch (error) {
          console.error(`❌ Error processing ${queueName}:`, error);
          // Reject and requeue
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error subscribing to ${queueName}:`, error);
  }
}

module.exports = {
  channel,
  connection,
  connect,
  publishToQueue,
  subscribeToQueue
};