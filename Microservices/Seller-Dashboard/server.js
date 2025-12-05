require("dotenv").config();
const app = require("./src/app");
const { connect } = require("./src/broker/broker");
const startOrderConsumer = require("./src/controllers/seller.order.consumer");
const startProductConsumer = require("./src/controllers/seller.product.consumer");
const connectDB = require("./src/db/db");

connectDB();

connect().then(() => {
    console.log("RabbitMQ ready");
    startProductConsumer();   // 🚀 START RABBITMQ CONSUMER
    startOrderConsumer()
});

app.listen(3007, () => {
  console.log("Server is running on port 3007");
});
