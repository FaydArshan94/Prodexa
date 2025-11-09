import { memo } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus } from "lucide-react";

const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <Link href={`/products/${item.productId}`}>
          <div className="w-24 h-24 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors flex-shrink-0">
            {item.productSnapshot?.image ? (
              <img
                src={item.productSnapshot.image}
                alt={item.productSnapshot?.title || "Product"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">📦</span>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4 mb-2">
            <div className="flex-1">
              <Link href={`/products/${item.productId}`}>
                <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                  {item.productSnapshot?.title || "Product"}
                </h3>
              </Link>
              {item.productSnapshot?.seller && (
                <p className="text-sm text-slate-500 mt-1">
                  Sold by: {item.productSnapshot.seller}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.productId)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Stock Status */}
          <div className="mb-3">
            {item.productSnapshot?.stock > 0 ? (
              <span className="text-sm text-green-600">In Stock</span>
            ) : (
              <span className="text-sm text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.productId, -1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.productId, 1)}
                disabled={item.quantity >= (item.productSnapshot?.stock || 0)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900">
                ₹{(item.productSnapshot?.price || 0) * item.quantity}
              </div>
              {item.productSnapshot?.originalPrice && (
                <div className="text-sm text-slate-500 line-through">
                  ₹{item.productSnapshot.originalPrice * item.quantity}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;