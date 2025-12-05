const { subscribeToQueue } = require("../broker/broker"); 
const productModel = require("../models/product.model"); 

async function startProductConsumer() {

  // Listen for product created
  subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", async (data) => {
    console.log("📥 PRODUCT_CREATED received");
    await productModel.create(data);
  });

  // Listen for product updated
  subscribeToQueue("PRODUCT_UPDATED", async (data) => {
    console.log("📥 PRODUCT_UPDATED received");
    await productModel.findOneAndUpdate(
      { _id: data._id },
      data,
      { upsert: true }
    );
  });

  // Listen for product deleted
  subscribeToQueue("PRODUCT_DELETED", async (data) => {
    console.log("📥 PRODUCT_DELETED received");
    await SellerProduct.deleteOne({ _id: data._id });
  });

  console.log("📡 Seller Dashboard Product Consumer is running...");
}

module.exports = startProductConsumer;
