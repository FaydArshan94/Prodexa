import {
  setLoading,
  setError,
  setOrders,
  setCurrentOrder,
  addOrder,
  updateOrder,
} from '../slices/orderSlice';

// Fetch all orders for the current user
export const fetchOrders = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch('/api/orders', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    dispatch(setOrders(data));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Fetch a single order by ID
export const fetchOrderById = (orderId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(`/api/orders/${orderId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const data = await response.json();
    dispatch(setCurrentOrder(data));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Create a new order
export const createOrder = (orderData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    dispatch(addOrder(data));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

// Update order status
export const updateOrderStatus = (orderId, status) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    const data = await response.json();
    dispatch(updateOrder(data));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};