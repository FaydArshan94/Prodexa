const userModel = require("../models/user.model")
const productModel = require("../models/product.model")
const orderModel = require("../models/order.model")



async function getMetrics(req, res) {
    try {
        const seller = req.user;

        // Get all products for this seller
        const products = await productModel.find({ seller: seller.id });
        const productIds = products.map(p => p._id);

        // Get all orders containing seller's products
        const orders = await orderModel.find({
            'items.productId': { $in: productIds },
            status: { $in: [ "CONFIRMED", "SHIPPED", "DELIVERED" ] }
        });

        // Sales: total number of items sold
        let sales = 0;
        let revenue = 0;
        const productSales = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                if (productIds.includes(item.product)) {
                    sales += item.quantity;
                    revenue += item.price.amount * item.quantity;
                    productSales[ item.product ] = (productSales[ item.product ] || 0) + item.quantity;
                }
            });
        });

        // Top products by quantity sold
        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[ 1 ] - a[ 1 ])
            .slice(0, 5)
            .map(([ productId, qty ]) => {
                const prod = products.find(p => p._id.equals(productId));
                return prod ? { id: prod._id, title: prod.title, sold: qty } : null;
            })
            .filter(Boolean);

        return res.json({
            sales,
            revenue,
            topProducts
        });
    } catch (error) {
        console.error("Error fetching metrics:", error)
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function getSellerOrders(req, res) {
    try {
        const seller = req.user;

        // Get all products for this seller
        const products = await productModel.find({ seller: seller.id });
        const productIds = products.map(p => p._id);

        // Get all orders containing seller's products
        const orders = await orderModel.find({
            'items.productId': { $in: productIds }  // ✅ Fixed: use productId
        }).populate('user', 'username email')
          .populate('items.product')  // This populates the product details
          .sort({ createdAt: -1 });

        // Filter order items to only include those from this seller
        const filteredOrders = orders.map(order => {
            const filteredItems = order.items.filter(item => 
                productIds.some(id => id.toString() === item.productId.toString())
            );
            return {
                ...order.toObject(),
                items: filteredItems
            };
        }).filter(order => order.items.length > 0);
        
        return res.json(filteredOrders);
    } catch (error) {
        console.error("Error fetching orders:", error)
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function getSellerProducts(req, res) {

    try {
        const seller = req.user;

        

        const products = await productModel.find({ seller: seller.id }).sort({ createdAt: -1 });

        
        

        return res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error)
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }

}

module.exports = {
    getMetrics,
    getSellerOrders,
    getSellerProducts
}