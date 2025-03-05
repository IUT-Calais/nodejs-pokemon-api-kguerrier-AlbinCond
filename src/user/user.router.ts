import { Router } from 'express';
import { creerUser, connectUser, afficheUser } from './user.controller';

export const user = Router();

user.post('/users', creerUser);
user.post('/users/login', connectUser);
user.get('/users/affiche', afficheUser);