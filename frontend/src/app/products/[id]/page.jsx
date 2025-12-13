"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fetchProductById } from "@/lib/redux/actions/productActions";
import ImageEffect from "@/components/products/ImageEffect";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { addToCart } from "../../../lib/redux/actions/cartActions";

// Mock product data (in real app, fetch from API)
// const getProduct = (id) => {
//   return {
//     id: id,
//     name: 'Wireless Bluetooth Headphones with Noise Cancellation',
//     price: 2999,
//     originalPrice: 4999,
//     rating: 4.5,
//     reviews: 1240,
//     image: '🎧',
//     discount: '40% OFF',
//     badge: 'Bestseller',
//     description: 'Experience premium sound quality with our latest wireless headphones. Featuring active noise cancellation, 30-hour battery life, and comfortable over-ear design. Perfect for music lovers, travelers, and professionals.',
//     features: [
//       'Active Noise Cancellation (ANC)',
//       '30 Hours Battery Life',
//       'Bluetooth 5.0 Connectivity',
//       'Premium Sound Quality',
//       'Comfortable Over-Ear Design',
//       'Built-in Microphone for Calls',
//       'Foldable & Portable',
//       'Quick Charge Support'
//     ],
//     specifications: {
//       'Brand': 'AudioPro',
//       'Model': 'AP-500X',
//       'Color': 'Black',
//       'Connectivity': 'Bluetooth 5.0',
//       'Battery': '30 Hours',
//       'Weight': '250g',
//       'Warranty': '1 Year'
//     },
//     inStock: true,
//     seller: 'TechStore Official',
//     images: ['🎧', '🎵', '🔊', '🎶'] // In real app, these would be actual image URLs
//   }
// }

// Similar products
const similarProducts = [
  {
    id: 2,
    name: "Smart Watch Pro",
    price: 5999,
    originalPrice: 9999,
    rating: 4.8,
    reviews: 856,
    image: "⌚",
    discount: "40% OFF",
    badge: "New",
  },
  {
    id: 6,
    name: "Gaming Mouse",
    price: 899,
    originalPrice: 1999,
    rating: 4.7,
    reviews: 1120,
    image: "🖱️",
    discount: "55% OFF",
    badge: "Hot",
  },
  {
    id: 9,
    name: "Bluetooth Speaker",
    price: 1999,
    originalPrice: 3999,
    rating: 4.6,
    reviews: 567,
    image: "🔊",
    discount: "50% OFF",
  },
  {
    id: 10,
    name: "Fitness Tracker",
    price: 2499,
    originalPrice: 4999,
    rating: 4.4,
    reviews: 432,
    image: "⌚",
    discount: "50% OFF",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const id = params.id;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [api, setApi] = useState(null);
  const [oldPrice, setOldPrice] = useState();

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  useEffect(() => {
    if (!api) return;

    // Update selectedImage when carousel slides
    const onSelect = () => {
      setSelectedImage(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect(); // Set initial value

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
    if (api) {
      api.scrollTo(index);
    }
  };

  const { currentProduct: product = {}, isLoading } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (product?.price?.amount) {
      setOldPrice(product.price.amount + 3000); // Update when product loads
    }
  }, [product]);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    try {
      await dispatch(
        addToCart({
          productId: params.id,
          quantity: 1,
          product: {
            title: product.title,
            price: product.price?.amount || product.price,
            image:
              product.image || product.images?.[0].url || "/placeholder.jpg",
            stock: product.stock || 0,
            discountPrice:
              product.discountPrice?.amount || product.discountPrice,
          },

          
        }),

        console.log("Added to cart")
      ).unwrap();
    } catch (error) {
      console.error("Add to cart error:", error);
      console.log(error || "Failed to add to cart");
    }
  };


  const router = useRouter();

  const handleBuyNow = async () => {
    try {
      // First add the item to cart
      await dispatch(
        addToCart({
          productId: params.id,
          quantity: quantity,
          product: {
            title: product.title,
            price: product.price?.amount || product.price,
            image: product.image || product.images?.[0].url || "/placeholder.jpg",
            stock: product.stock || 0,
            discountPrice: product.discountPrice?.amount || product.discountPrice,
          },
        })
      ).unwrap();
      
      // Then redirect to checkout
      router.push('/checkout');

      console.log("Added to cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      console.log(error || "Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-slate-900">
              Products
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium line-clamp-1">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 grid-cols-1  mb-12">
          {/* Left: Images */}
          {/* Left: Images */}
          <div className="space-y-4">
            <Card className="aspect-square bg-slate-50 p-8 relative">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
                setApi={setApi}
              >
                <CarouselContent>
                  {product.images && product.images.length > 0 ? (
                    product.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1 h-full w-full flex  items-center justify-center">
                          {/* Always render ImageEffect for ALL images */}
                          <ImageEffect
                            src={image.url}
                            alt={`${product.title} - Image ${index + 1}`}
                          />
                        </div>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <div className="flex items-center justify-center h-full">
                        <div className="text-8xl">{product.title}</div>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>

                <CarouselPrevious className="left-4 absolute" />
                <CarouselNext className="right-4 absolute" />
              </Carousel>

              {product.discount && (
                <Badge className="absolute top-4 left-4 text-lg px-3 py-1 z-10">
                  {product.discount}
                </Badge>
              )}
            </Card>

            {/* Thumbnail Navigation */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <Card
                    key={idx}
                    onClick={() => handleThumbnailClick(idx)}
                    className={`aspect-auto flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all ${
                      selectedImage === idx ? "border-2 border-blue-500" : ""
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      className="object-cover w-full h-full p-2"
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Badge */}
            {product.badge && (
              <Badge variant="secondary" className="text-sm">
                {product.badge}
              </Badge>
            )}

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-slate-900">
              {product?.title}
            </h1>

            {/* Rating & Reviews */}
            {/* <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded">
                <Star className="h-4 w-4 fill-green-600 text-green-600" />
                <span className="font-semibold text-green-600">{product.rating}</span>
              </div>
              <span className="text-slate-600">
                {product.reviews.toLocaleString()} Reviews
              </span>
            </div> */}

            {/* Price */}
            <div className="border-y py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-slate-900">
                  ₹{product?.price?.amount || product?.price || 0}
                </span>
                <span className="text-xl text-slate-400 line-through">
                  ₹{oldPrice}
                </span>
                <span className="text-green-600 font-semibold">
                  Save ₹{oldPrice - (product?.price?.amount || 0)}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Inclusive of all taxes
              </p>
            </div>

            {/* Stock Status */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded ${
                product.inStock
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  product.stock ? "bg-green-600" : "bg-red-600"
                }`}
              ></div>
              <span
                className={`font-medium ${
                  product.stock ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Seller Info */}
            <div className="text-sm text-slate-600">
              Sold by:{" "}
              <span className="text-blue-600 font-semibold">
                {product?.seller?.username}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Quantity:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementQuantity}
                    className="rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementQuantity}
                    className="rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                size="lg"
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Buy Now Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleBuyNow();
              }}
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
            >
              Buy Now
            </Button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Free Delivery</div>
                  <div className="text-xs text-slate-500">
                    On orders above ₹499
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-green-100 p-3 rounded-full">
                  <RotateCcw className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">7 Days Return</div>
                  <div className="text-xs text-slate-500">Easy returns</div>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Secure Payment</div>
                  <div className="text-xs text-slate-500">100% safe</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          {/* Tab Headers */}
          <div className="border-b flex gap-8 px-6">
            {["description", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "description" && (
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  {product.description}
                </p>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Key Features:
                  </h3>
                  {/* <ul className="grid md:grid-cols-2 gap-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul> */}
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid md:grid-cols-2 gap-4">
                {product.specifications &&
                Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between py-2 border-b"
                    >
                      <span className="font-semibold text-slate-700">
                        {key}
                      </span>
                      <span className="text-slate-600">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No specifications available</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-900">
                      {product.rating}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {product.reviews} reviews
                    </div>
                  </div>
                  <Button>Write a Review</Button>
                </div>
                <div className="text-slate-600">
                  Customer reviews will appear here...
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Similar Products */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Similar Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
