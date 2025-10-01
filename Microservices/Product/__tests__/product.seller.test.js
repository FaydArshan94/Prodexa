const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock imagekit service to avoid ESM uuid import during tests
jest.mock('../src/services/imagekit.service', () => ({
    uploadImage: jest.fn(async () => ({ url: 'https://ik.mock/x', thumbnail: 'https://ik.mock/t', id: 'file_x' })),
}));

const app = require('../src/app');
const Product = require('../src/models/product.model');

describe('GET /api/products/seller', () => {
    let mongo;

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();
        process.env.MONGO_URI = uri;
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
        await mongoose.connect(uri);
        await Product.syncIndexes();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongo.stop();
    });

    afterEach(async () => {
        const collections = await mongoose.connection.db.collections();
        for (const c of collections) await c.deleteMany({});
    });

    const createProduct = (overrides = {}) => {
        return Product.create({
            title: overrides.title ?? 'Sample Product',
            description: overrides.description ?? 'A great product',
            price: overrides.price ?? { amount: 100, currency: 'USD' },
            seller: overrides.seller ?? new mongoose.Types.ObjectId(),
            images: overrides.images ?? [],
        });
    };

    it('returns 401 when no token provided', async () => {
        const res = await request(app).get('/api/products/seller');
        expect(res.status).toBe(401);
    });

    it('returns 403 when user role is not seller', async () => {
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toHexString(), role: 'customer' }, process.env.JWT_SECRET);
        const res = await request(app)
            .get('/api/products/seller')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/not authorized/i);
    });

    it('returns empty array when seller has no products', async () => {
        const sellerId = new mongoose.Types.ObjectId();
        const token = jwt.sign({ id: sellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);

        const res = await request(app)
            .get('/api/products/seller')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(0);
    });

    it('returns only products belonging to the seller', async () => {
        const sellerId = new mongoose.Types.ObjectId();
        const otherSellerId = new mongoose.Types.ObjectId();
        
        // Create products for our seller
        await Promise.all([
            createProduct({ seller: sellerId, title: 'Seller Product 1' }),
            createProduct({ seller: sellerId, title: 'Seller Product 2' }),
            // Create products for other seller
            createProduct({ seller: otherSellerId, title: 'Other Seller Product' }),
        ]);

        const token = jwt.sign({ id: sellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        
        const res = await request(app)
            .get('/api/products/seller')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data.every(product => product.seller === sellerId.toHexString())).toBe(true);
    });

    it('supports pagination with skip and limit', async () => {
        const sellerId = new mongoose.Types.ObjectId();
        
        // Create 5 products for the seller
        await Promise.all([
            createProduct({ seller: sellerId, title: 'Product 1' }),
            createProduct({ seller: sellerId, title: 'Product 2' }),
            createProduct({ seller: sellerId, title: 'Product 3' }),
            createProduct({ seller: sellerId, title: 'Product 4' }),
            createProduct({ seller: sellerId, title: 'Product 5' }),
        ]);

        const token = jwt.sign({ id: sellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);

        // Test first page
        let res = await request(app)
            .get('/api/products/seller')
            .query({ limit: '2' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);

        // Test middle page
        res = await request(app)
            .get('/api/products/seller')
            .query({ skip: '2', limit: '2' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);

        // Test last page
        res = await request(app)
            .get('/api/products/seller')
            .query({ skip: '4', limit: '2' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
    });

    it('supports text search via q parameter', async () => {
        const sellerId = new mongoose.Types.ObjectId();
        
        await Promise.all([
            createProduct({ seller: sellerId, title: 'Red Shirt', description: 'Cotton' }),
            createProduct({ seller: sellerId, title: 'Blue Shirt', description: 'Wool' }),
            createProduct({ seller: sellerId, title: 'Green Pants', description: 'Linen' }),
        ]);

        const token = jwt.sign({ id: sellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);

        const res = await request(app)
            .get('/api/products/seller')
            .query({ q: 'Shirt' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);
        const titles = res.body.data.map(p => p.title).sort();
        expect(titles).toEqual(['Blue Shirt', 'Red Shirt']);
    });

    it('supports price filtering', async () => {
        const sellerId = new mongoose.Types.ObjectId();
        
        await Promise.all([
            createProduct({ seller: sellerId, title: 'Low', price: { amount: 50, currency: 'USD' } }),
            createProduct({ seller: sellerId, title: 'Mid', price: { amount: 100, currency: 'USD' } }),
            createProduct({ seller: sellerId, title: 'High', price: { amount: 150, currency: 'USD' } }),
        ]);

        const token = jwt.sign({ id: sellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);

        // Test minPrice
        let res = await request(app)
            .get('/api/products/seller')
            .query({ minprice: '75' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);

        // Test maxPrice
        res = await request(app)
            .get('/api/products/seller')
            .query({ maxprice: '120' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);

        // Test both minPrice and maxPrice
        res = await request(app)
            .get('/api/products/seller')
            .query({ minprice: '60', maxprice: '120' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].title).toBe('Mid');
    });
});