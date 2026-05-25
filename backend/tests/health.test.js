const request = require('supertest');
const app = require('../src/app');

describe('Backend health check', () => {
  it('should return API health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'Pandea API',
      })
    );
  });
});
