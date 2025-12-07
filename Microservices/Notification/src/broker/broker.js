const amqplib = require("amqplib");

let channel, connection;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

async function connect() {
  if (connection && !connection.closed) return connection;

  try {
    console.log('🔌 Connecting to RabbitMQ...');
    console.log('📍 URL:', process.env.RABBIT_URL ? 'Set' : 'NOT SET!');
    
    connection = await amqplib.connect(process.env.RABBIT_URL);
    console.log("✅ Connected to RabbitMQ");
    
    channel = await connection.createChannel();
    console.log("✅ Channel created");

    // Reset reconnect attempts on successful connection
    reconnectAttempts = 0;

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err);
      connection = null;
      channel = null;
      scheduleReconnect();
    });

    connection.on('close', () => {
      console.log('⚠️ RabbitMQ connection closed');
      connection = null;
      channel = null;
      scheduleReconnect();
    });

    return connection;
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error.message);
    scheduleReconnect();
    throw error;
  }
}

function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`❌ Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached`);
    return;
  }

  reconnectAttempts++;
  const delay = RECONNECT_DELAY * reconnectAttempts;
  console.log(`🔄 Scheduling reconnect in ${delay}ms (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  setTimeout(() => {
    connect().catch(err => {
      console.error('❌ Reconnection failed:', err.message);
    });
  }, delay);
}

async function publishToQueue(queueName, data = {}) {
  try {
    if (!channel || !connection || connection.closed) {
      console.log('📡 Channel not ready, reconnecting...');
      await connect();
    }

    await channel.assertQueue(queueName, {
      durable: true,
    });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    console.log("📤 Message sent to queue:", queueName);
  } catch (error) {
    console.error("❌ Error publishing to queue:", error.message);
    throw error;
  }
}

async function subscribeToQueue(queueName, callBack) {
  try {
    if (!channel || !connection || connection.closed) {
      console.log('📡 Channel not ready, reconnecting...');
      await connect();
    }

    await channel.assertQueue(queueName, {
      durable: true,
    });

    // Set prefetch to 1 for better message handling
    await channel.prefetch(1);

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
          console.error(`❌ Error processing ${queueName}:`, error.message);
          // Reject and requeue for retry
          channel.nack(msg, false, true);
        }
      }
    }, { noAck: false });
  } catch (error) {
    console.error(`❌ Error subscribing to ${queueName}:`, error.message);
    // Schedule reconnect and retry subscription
    setTimeout(() => {
      subscribeToQueue(queueName, callBack).catch(err => {
        console.error(`❌ Failed to retry subscription to ${queueName}:`, err.message);
      });
    }, RECONNECT_DELAY);
  }
}

module.exports = {
  channel,
  connection,
  connect,
  publishToQueue,
  subscribeToQueue
};