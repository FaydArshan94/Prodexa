const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app.js');

// Mock the cart model
jest.mock('../src/models/cart.model.js', () => {
    // helper inside factory to avoid out-of-scope reference restriction
    function mockGenerateObjectId() {
        return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
    const carts = new Map();
    class CartMock {
        constructor({ user, items }) {
            this._id = mockGenerateObjectId();
            this.user = user;
            this.items = items || [];
        }
        static async findOne(query) {
            return carts.get(query.user) || null;
        }
        async save() {
            carts.set(this.user, this);
            return this;
        }
    }
    CartMock.__reset = () => carts.clear();
    return CartMock;
});

const CartModel = require('../src/models/cart.model.js');

function generateObjectId() {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const endpoint = '/api/cart/';

describe('GET /api/cart/', () => {
    const userId = generateObjectId();
    const productId1 = generateObjectId();
    const productId2 = generateObjectId();

    beforeEach(() => {
        CartModel.__reset();
    });

    test('returns empty cart when user has no cart', async () => {
        const token = signToken({ id: userId, role: 'user' });
        const res = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.cart).toBeNull();
        expect(res.body.message).toBe('Cart is empty');
    });

    test('returns cart with items when cart exists', async () => {
        const token = signToken({ id: userId, role: 'user' });

        // First create a cart by adding items
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: productId1, quantity: 2 });

        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: productId2, quantity: 3 });

        // Now get the cart
        const res = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.cart).toBeDefined();
        expect(res.body.cart.items).toHaveLength(2);
        expect(res.body.cart.user).toBe(userId);
        expect(res.body.cart.items[0]).toMatchObject({ productId: productId1, quantity: 2 });
        expect(res.body.cart.items[1]).toMatchObject({ productId: productId2, quantity: 3 });
    });

    test('returns only the authenticated users cart', async () => {
        const user1Id = generateObjectId();
        const user2Id = generateObjectId();
        const token1 = signToken({ id: user1Id, role: 'user' });
        const token2 = signToken({ id: user2Id, role: 'user' });

        // User 1 adds items
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${token1}`)
            .send({ productId: productId1, quantity: 5 });

        // User 2 adds different items
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${token2}`)
            .send({ productId: productId2, quantity: 10 });

        // User 1 gets their cart
        const res1 = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${token1}`);

        expect(res1.status).toBe(200);
        expect(res1.body.cart.items).toHaveLength(1);
        expect(res1.body.cart.items[0].productId).toBe(productId1);
        expect(res1.body.cart.items[0].quantity).toBe(5);

        // User 2 gets their cart
        const res2 = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${token2}`);

        expect(res2.status).toBe(200);
        expect(res2.body.cart.items).toHaveLength(1);
        expect(res2.body.cart.items[0].productId).toBe(productId2);
        expect(res2.body.cart.items[0].quantity).toBe(10);
    });

    test('401 when no token provided', async () => {
        const res = await request(app)
            .get(endpoint);

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/Unauthorized/);
    });

    test('403 when role not allowed', async () => {
        const token = signToken({ id: userId, role: 'admin' }); // role admin not in [user]
        const res = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    test('401 when token invalid', async () => {
        const res = await request(app)
            .get(endpoint)
            .set('Authorization', 'Bearer invalid.token.here');

        expect(res.status).toBe(401);
    });

    test('returns cart with correct structure', async () => {
        const token = signToken({ id: userId, role: 'user' });

        // Add item to cart
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: productId1, quantity: 1 });

        // Get cart
        const res = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('cart');
        expect(res.body.cart).toHaveProperty('_id');
        expect(res.body.cart).toHaveProperty('user');
        expect(res.body.cart).toHaveProperty('items');
        expect(Array.isArray(res.body.cart.items)).toBe(true);
    });
});