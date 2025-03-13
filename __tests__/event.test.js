const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/index');
const User = require('../src/models/User');
const Event = require('../src/models/Event');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Event.deleteMany({});
});

describe('Event API', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Create a test user and get token
    const response = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
      });

    token = response.body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        category: 'Meeting',
        reminder: new Date()
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(eventData.title);
      expect(response.body.user).toBe(userId);
    });
  });

  describe('GET /api/events', () => {
    it('should get all events for a user', async () => {
      // Create test events
      await Event.create([
        {
          title: 'Event 1',
          description: 'Description 1',
          date: new Date(),
          category: 'Meeting',
          reminder: new Date(),
          user: userId
        },
        {
          title: 'Event 2',
          description: 'Description 2',
          date: new Date(),
          category: 'Birthday',
          reminder: new Date(),
          user: userId
        }
      ]);

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });
});