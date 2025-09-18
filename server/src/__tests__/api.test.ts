import request from 'supertest';
import app from '../index';

describe('Health Check', () => {
  it('should return server status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: { status: 'Server is running' }
    });
  });
});

describe('File API', () => {
  it('should return empty files list initially', async () => {
    const response = await request(app)
      .get('/api/files')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe('Quiz API', () => {
  it('should start a quiz session', async () => {
    const response = await request(app)
      .post('/api/quiz/start')
      .send({
        tags: ['test'],
        questionCount: 5
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('sessionId');
    expect(response.body.data).toHaveProperty('totalQuestions');
    expect(response.body.data).toHaveProperty('currentQuestion');
  });
});