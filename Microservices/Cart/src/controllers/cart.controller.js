const cartModel = require("../models/cart.model");
const axios = require("axios");

async function getCart(req, res) {
  const userId = req.user.id;

  try {
    let cart = await cartModel.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        cart: null,
        message: "Cart is empty",
        totals: {
          itemCount: 0,
          totalQuantity: 0,
        },
      });
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
    const userId = req.user.id;
    const { productId, quantity, product } = req.body; // Accept full product object

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid productId or quantity" });
    }

    if (!product || !product.title || !product.price || !product.image) {
      return res.status(400).json({ message: "Product details required" });
    }

    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new cartModel({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity only
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item with snapshot
      cart.items.push({
        productId,
        quantity,
        productSnapshot: {
          title: product.title,
          price: product.price,
          image: product.image,
          stock: product.stock,
          discountPrice: product.discountPrice,
        },
        priceAtAdd: product.price,
        addedAt: new Date(),
      });
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

async function removeItemFromCart(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;


    let cart = await cartModel.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ cart: null, message: "Cart is empty" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    return res.status(200).json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function syncCartWithProducts(req, res) {
  const userId = req.user.id;

  try {
    let cart = await cartModel.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ cart: null, message: "Cart is empty" });
    }

    // Get all product IDs
    const productIds = cart.items.map((item) => item.productId.toString());

    // Call product service
    const productServiceUrl =
      process.env.PRODUCT_SERVICE_URL || "http://localhost:5001";
    let latestProducts = [];

    try {
      const response = await axios.post(
        `${productServiceUrl}/api/products/batch`,
        {
          productIds: productIds,
        },
        {
          timeout: 5000, // 5 second timeout
        }
      );
      latestProducts = response.data.products;
    } catch (error) {
      console.error("Product service unavailable, using cached data");
      // Continue with cached snapshot data
    }

    // Enrich cart items with sync info
    const enrichedItems = cart.items.map((cartItem) => {
      const latestProduct = latestProducts.find(
        (p) => p._id.toString() === cartItem.productId.toString()
      );

      let syncStatus = {
        available: true,
        priceChanged: false,
        priceIncrease: false,
        priceDecrease: false,
        outOfStock: false,
      };

      if (latestProduct) {
        // Check price changes
        if (latestProduct.price !== cartItem.productSnapshot.price) {
          syncStatus.priceChanged = true;
          syncStatus.priceIncrease =
            latestProduct.price > cartItem.productSnapshot.price;
          syncStatus.priceDecrease =
            latestProduct.price < cartItem.productSnapshot.price;
        }

        // Check stock
        if (
          latestProduct.stock === 0 ||
          latestProduct.stock < cartItem.quantity
        ) {
          syncStatus.outOfStock = true;
        }

        return {
          ...cartItem.toObject(),
          latestProduct, // Current product data
          syncStatus,
        };
      } else {
        // Product no longer exists
        return {
          ...cartItem.toObject(),
          syncStatus: {
            available: false,
            priceChanged: false,
            outOfStock: true,
          },
        };
      }
    });

    res.status(200).json({
      cart: {
        ...cart.toObject(),
        items: enrichedItems,
      },
      totals: {
        itemCount: cart.items.length,
        totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  syncCartWithProducts,
};
