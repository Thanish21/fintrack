jest.mock('../src/db', () => ({ query: jest.fn() }));
const request = require('supertest');
const app = require('../src/app');

test('health returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.body.status).toBe('ok');
});

test('register without password returns 400', async () => {
  const res = await request(app).post('/register').send({ email: 'a@b.com' });
  expect(res.status).toBe(400);
});

test('/me without token returns 401', async () => {
  const res = await request(app).get('/me');
  expect(res.status).toBe(401);
});
