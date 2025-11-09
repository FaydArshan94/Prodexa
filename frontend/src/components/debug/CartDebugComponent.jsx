"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function CartDebugComponent() {
  const cart = useSelector((state) => state.cart);
  const socket = useSelector((state) => state); // Get full state for debugging
  
  useEffect(() => {
    console.log('🛒 [CART STATE CHANGED]', {
      items: cart.cart,
      itemCount: cart.totals.itemCount,
      totalQty: cart.totals.totalQuantity,
      loading: cart.isLoading,
      lastUpdated: cart.lastUpdated,
      timestamp: new Date().toISOString()
    });
  }, [cart.cart, cart.totals, cart.lastUpdated]); // Watch these specific values

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: '#1a1a1a',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '320px',
      border: '2px solid #00ff00',
      boxShadow: '0 4px 12px rgba(0,255,0,0.3)'
    }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        🛒 CART DEBUG
      </div>
      <div>📦 Items: {cart.cart?.length || 0}</div>
      <div>🔢 Item Count: {cart.totals?.itemCount || 0}</div>
      <div>🧮 Total Qty: {cart.totals?.totalQuantity || 0}</div>
      <div>⏰ Last Update: {cart.lastUpdated ? new Date(cart.lastUpdated).toLocaleTimeString() : 'Never'}</div>
      <div>🔄 Loading: {cart.isLoading ? '✅ Yes' : '❌ No'}</div>
      {cart.error && (
        <div style={{ color: '#ff0000', marginTop: '5px' }}>
          ⚠️ Error: {cart.error}
        </div>
      )}
      
      {cart.cart && cart.cart.length > 0 && (
        <div style={{ marginTop: '10px', borderTop: '1px solid #00ff00', paddingTop: '10px' }}>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Items:</div>
          {cart.cart.slice(0, 3).map((item, idx) => (
            <div key={idx} style={{ fontSize: '10px', opacity: 0.7 }}>
              • {item.productId?.slice(0, 8)}... (Qty: {item.quantity})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}