const app = require('../src/app');
const supertest = require('supertest');

describe('GET /', () => {
  it('should return Hello message', async () => {
    const response = await supertest(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Hello from Node.js');
  });
});
