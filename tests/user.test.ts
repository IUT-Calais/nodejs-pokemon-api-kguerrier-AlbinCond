import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';
import bcrypt from 'bcrypt';
import {Prisma} from "@prisma/client";

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

    it('should return 400 if email already exists', async () => {
      const userData = { email: 'test@test.com', password: 'password' };
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, ...userData });

      const response = await request(app).post('/users').send(userData);
      expect(response.status).toBe(400);
      expect(response.text).toBe('Email déjà utilisé');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/users').send({});
      expect(response.status).toBe(400);
      expect(response.text).toBe('Veuillez remplir tous les champs: email, password');
    });

    it('should return 500 on server error', async () => {
      const userData = { email: 'test@test.com', password: 'password' };
      prismaMock.user.create.mockRejectedValue(new Error('Server error'));

      const response = await request(app).post('/users').send(userData);
      expect(response.status).toBe(500);
      expect(response.text).toBe('Erreur serveur : Error: Server error');
    });

    it('should return 502 with custom message when PrismaClientUnknownRequestError occurs', async () => {
      const userData = { email: 'test@test.com', password: 'password' };
      const error = new Prisma.PrismaClientUnknownRequestError('message original', {
        clientVersion: '5.0.0'
      });

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockRejectedValue(error);

      const response = await request(app)
          .post('/users')
          .send(userData);

      expect(response.status).toBe(502);
      expect(response.text).toBe('Une erreur est survenue : le client prisma a une request inconnu');
    });


  });

  describe('GET /users/affiche', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@test.com', password: 'hash1' },
        { id: 2, email: 'user2@test.com', password: 'hash2' }
      ];
      prismaMock.user.findMany.mockResolvedValue(mockUsers);

      const response = await request(app).get('/users/affiche');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
    });

    it('should return 400 when server error occurs during user fetch', async () => {
      const error = new Error('Database connection error');
      prismaMock.user.findUnique.mockRejectedValue(error);

      const response = await request(app).get('/users/1');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Erreur serveur : Error: Database connection error');
    });

    it('should return 400 on server error', async () => {
      prismaMock.user.findMany.mockRejectedValue(new Error('Server error'));

      const response = await request(app).get('/users/affiche');
      expect(response.status).toBe(400);
      expect(response.text).toBe('Erreur serveur : Error: Server error');
    });
  });

  describe('GET /users/:userId', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 1, email: 'test@test.com', password: 'hash' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app).get('/users/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return 404 if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/users/999');
      expect(response.status).toBe(404);
      expect(response.text).toBe('Utilisateur non trouvé');
    });

    it('should return 400 on server error', async () => {
      prismaMock.user.findMany.mockRejectedValue(new Error('Server error'));

      const response = await request(app).get('/users/affiche');
      expect(response.status).toBe(400);
      expect(response.text).toBe('Erreur serveur : Error: Server error');
    });
  });

  describe('PATCH /users/:userId', () => {
    it('should update user', async () => {
      const token = 'mockedToken';
      const updatedUser = { id: 1, email: 'updated@test.com', password: 'newhash' };
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const response = await request(app)
          .patch('/users/1')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'updated@test.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
    });

    it('should return 400 on server error', async () => {
      const token = 'mockedToken';
      prismaMock.user.update.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
          .patch('/users/1')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Erreur serveur : Error: Server error');
    });
  });

  describe('DELETE /users/:userId', () => {
    it('should delete user', async () => {
      const token = 'mockedToken';
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hash' });

      const response = await request(app)
          .delete('/users/1')
          .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 if user not found', async () => {
      const token = 'mockedToken';
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
          .delete('/users/999')
          .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe('Utilisateur non trouvé');
    });

    it('should return 400 on server error', async () => {
      const token = 'mockedToken';
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hash' });
      prismaMock.user.delete.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
          .delete('/users/1')
          .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Erreur serveur : Error: Server error');
    });
  });

  describe('POST /login', () => {
    it('should login a user and return a token', async () => {
      const user = {email : 'admin@gmail.com', password : 'admin'};
      const UserWithId = { ...user, id: 555 };
      const token = 'mockedToken';

      prismaMock.user.findUnique.mockResolvedValue(UserWithId);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app).post('/users/login').send(user);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        msg: "User connecté",
        token: token
      });
    });

    it('should return 404 if user does not exist', async () => {
      const loginData = { email: 'nonexistent@test.com', password: 'password' };
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app).post('/users/login').send(loginData);
      expect(response.status).toBe(404);
      expect(response.text).toBe('Le compte n\'existe pas');
    });

    it('should return 400 if password is incorrect', async () => {
      const loginData = { email: 'test@test.com', password: 'wrongpassword' };
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashedpassword'
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app).post('/users/login').send(loginData);
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid email or password');
    });

    it('should return 400 if JWT_SECRET is not defined', async () => {
      const loginData = { email: 'test@test.com', password: 'password' };
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashedpassword'
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const response = await request(app).post('/users/login').send(loginData);
      expect(response.status).toBe(400);
      expect(response.text).toBe('Erreur serveur : Error: JWT_SECRET is not defined');

      process.env.JWT_SECRET = originalSecret;
    });

    it('should return 400 on server error', async () => {
      const loginData = { email: 'test@test.com', password: 'password' };
      prismaMock.user.findUnique.mockRejectedValue(new Error('Server error'));

      const response = await request(app).post('/users/login').send(loginData);
      expect(response.status).toBe(400);
      expect(response.text).toBe('Erreur serveur : Error: Server error');
    });
  });
});