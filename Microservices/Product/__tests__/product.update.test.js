const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock imagekit service to avoid ESM uuid import during tests
// Mock imagekit service to avoid ESM uuid import during tests
jest.mock('../src/services/imagekit.service', () => ({
    uploadImage: jest.fn(async () => ({ url: 'https://ik.mock/x', thumbnail: 'https://ik.mock/t', id: 'file_x' })),
}));

const app = require('../src/app');
const Product = require('../src/models/product.model');

describe('PATCH /api/products/:id', () => {
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

    it('returns 400 for invalid object id', async () => {
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        const res = await request(app)
            .patch('/api/products/not-a-valid-id')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Title' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalid product id/i);
    });

    it('returns 404 when product not found', async () => {
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        const id = new mongoose.Types.ObjectId().toHexString();
        const res = await request(app)
            .patch(`/api/products/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Title' });

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    it('updates product basic fields', async () => {
        const sellerId = new mongoose.Types.ObjectId();
        const token = jwt.sign({ id: sellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        const product = await createProduct({ seller: sellerId });

        const res = await request(app)
            .patch(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Title',
                description: 'Updated Description',
                priceAmount: 199.99,
                priceCurrency: 'INR'
            });

        expect(res.status).toBe(200);
        expect(res.body?.data?.title).toBe('Updated Title');
        expect(res.body?.data?.description).toBe('Updated Description');
        expect(res.body?.data?.price?.amount).toBe(199.99);
        // expect(res.body?.data?.price?.currency).toBe('INR');
    });

    it('updates product with new images', async () => {
        const sellerId = new mongoose.Types.ObjectId();
        const token = jwt.sign({ id: sellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        const product = await createProduct({ seller: sellerId });

        const res = await request(app)
            .patch(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Updated with Image')
            .attach('images', path.join(__dirname, 'fixtures', 'sample.jpg'));

        expect(res.status).toBe(200);
        expect(res.body?.data?.title).toBe('Updated with Image');
        expect(res.body?.data?.images?.length).toBe(1);
        expect(res.body?.data?.images[0]?.url).toContain('https://ik.mock/');
    });

    it('prevents updating product by non-owner', async () => {
        const product = await createProduct({
            seller: new mongoose.Types.ObjectId() // Different seller
        });
        
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        const res = await request(app)
            .patch(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Should Not Update' });

        expect(res.status).toBe(403);
    });

    it('validates update fields', async () => {
        const sellerId = new mongoose.Types.ObjectId();
        const token = jwt.sign({ id: sellerId.toHexString(), role: 'seller' }, process.env.JWT_SECRET);
        const product = await createProduct({ seller: sellerId });

        const res = await request(app)
            .patch(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: '', // Empty title should fail validation
                priceAmount: -100 // Negative price should fail validation
            });

        expect(res.status).toBe(400);
    });
});
