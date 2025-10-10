require("dotenv").config();
const app = require("./src/app");
const { connect } = require("./src/broker/broker");
const listener = require("./src/broker/listener");
const connectDB = require("./src/db/db");

connectDB();
connect().then(() => {
    listener();
})

app.listen(3007, () => {
  console.log("Server is running on port 3007");
});
