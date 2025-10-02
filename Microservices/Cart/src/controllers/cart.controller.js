const cartModel = require("../models/cart.model");

async function getCart(req, res) {
  const userId = req.user.id; // Extract user ID from authenticated user

  try {
    let cart = await cartModel.findOne({ user: userId });
    
    if (!cart) {
      return res.status(200).json({ cart: null, message: "Cart is empty" });
      
    }

    res.status(200).json({
      cart,
      totals: {
        itemCount: cart.items.length,
        totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function addItemToCart(req, res) {
  try {
    const userId = req.user.id; // Extract user ID from authenticated user
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid productId or quantity" });
    }
    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new cartModel({ user: userId, items: [] });
    }
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId: productId, quantity: quantity });
    }
    await cart.save();
    return res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function updateCartItem(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return res.status(200).json({
      message: "Item quantity updated",
      cart,
    });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
};
