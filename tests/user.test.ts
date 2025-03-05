import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';

describe('User API', () => {
  describe('POST /users', () => {
    it('should create a new user', async () => {
        const createdUser = {email : 'test@test.com', password : 'password'};
        const createdUserWithId = { ...createdUser, id: 555 };
        prismaMock.user.create.mockResolvedValue(createdUserWithId);    

      const response = await request(app).post('/users').send(createdUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdUserWithId);
    });
  });

  describe('POST /login', () => {
    it('should login a user and return a token', async () => {
      const user = {email : 'admin@gmail.com', password : 'admin'};
      const UserWithId = { ...user, id: 555 };
      const token = 'mockedToken';

      prismaMock.user.findUnique.mockResolvedValue(UserWithId);

      const response = await request(app).post('/users/login').send(user);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token,
        message: 'Connexion réussie',
      });
    });
  });
});
