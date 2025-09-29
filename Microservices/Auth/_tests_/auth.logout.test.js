const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/user.model');
const bcrypt = require('bcryptjs');

describe('GET /api/auth/logout', () => {
  let agent;
  let testUser;
  const testPassword = 'Secret123!';

  beforeAll(async () => {
    agent = request.agent(app);
  });

  beforeEach(async () => {
    // Create a fresh test user before each test
    const hash = await bcrypt.hash(testPassword, 10);
    testUser = await userModel.create({
      username: 'logout_user',
      email: 'logout@example.com',
      password: hash,
      fullName: { firstName: 'Logout', lastName: 'User' },
    });
  });

  afterEach(async () => {
    // Clean up test user after each test
    await userModel.deleteMany({});
  });

  it('should successfully logout and clear the auth cookie', async () => {
    // First login to get authenticated
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testPassword });
    expect(loginRes.status).toBe(200);
    expect(loginRes.headers['set-cookie']).toBeDefined();

    // Verify we're logged in by accessing /me endpoint
    const meRes = await agent
      .get('/api/auth/me')
      .send();
    expect(meRes.status).toBe(200);

    // Now logout
    const logoutRes = await agent
      .get('/api/auth/logout')
      .send();
    
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toBeDefined();
    
    // Verify cookie is cleared by checking Set-Cookie header
    const cookies = logoutRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.includes('token=;'))).toBe(true);
    
    // Verify we can't access protected routes anymore
    const afterLogoutRes = await agent
      .get('/api/auth/me')
      .send();
    expect(afterLogoutRes.status).toBe(401);
  });

  it('should return 200 even if user is not authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/logout')
      .send();
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
    
    // Should still clear any existing cookies
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.includes('token=;'))).toBe(true);
  });

  it('should handle multiple logout requests', async () => {
    // Login first
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testPassword });
    expect(loginRes.status).toBe(200);

    // First logout
    const firstLogoutRes = await agent
      .get('/api/auth/logout')
      .send();
    expect(firstLogoutRes.status).toBe(200);

    // Second logout should still work
    const secondLogoutRes = await agent
      .get('/api/auth/logout')
      .send();
    expect(secondLogoutRes.status).toBe(200);
  });

  it('should clear all auth-related cookies if present', async () => {
    // Login first to set cookies
    await agent
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testPassword });

    const logoutRes = await agent
      .get('/api/auth/logout')
      .send();
    
    expect(logoutRes.status).toBe(200);
    const cookies = logoutRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    
    // Check that token cookie is cleared
    expect(cookies.some(cookie => 
      cookie.includes('token=;') && 
      cookie.includes('Expires=') && 
      cookie.includes('HttpOnly')
    )).toBe(true);
  });
});