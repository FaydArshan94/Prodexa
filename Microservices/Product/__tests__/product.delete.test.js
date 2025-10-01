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

describe('DELETE /api/products/:id', () => {
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
        const product = await createProduct();
        const res = await request(app)
            .delete(`/api/products/${product._id}`);

        expect(res.status).toBe(401);
    });

    it('returns 400 for invalid object id', async () => {
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        const res = await request(app)
            .delete('/api/products/not-a-valid-id')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalid product id/i);
    });

    it('returns 404 when product not found', async () => {
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        const id = new mongoose.Types.ObjectId().toHexString();
        const res = await request(app)
            .delete(`/api/products/${id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    it('returns 403 when user is not the seller', async () => {
        // Create product with one seller
        const product = await createProduct({
            seller: new mongoose.Types.ObjectId()
        });

        // Try to delete with different seller's token
        const differentSellerId = new mongoose.Types.ObjectId();
        const token = jwt.sign({ id: differentSellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        
        const res = await request(app)
            .delete(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/not authorized/i);
    });

    it('successfully deletes product when user is the seller', async () => {
        const sellerId = new mongoose.Types.ObjectId();
        const product = await createProduct({
            seller: sellerId
        });

        const token = jwt.sign({ id: sellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        
        const res = await request(app)
            .delete(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/successfully deleted/i);

        // Verify product is actually deleted from database
        const deletedProduct = await Product.findById(product._id);
        expect(deletedProduct).toBeNull();
    });

    it('returns 403 when user role is not seller', async () => {
        const product = await createProduct();
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toHexString(), role: 'user' }, process.env.JWT_SECRET);
        
        const res = await request(app)
            .delete(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/not authorized/i);
    });
});