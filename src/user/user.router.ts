import { Router } from 'express';
import { creerUser, connectUser, afficheUser, miseAJourUser, supprimeUser, afficheUserParId } from './user.controller';
import { verifyJWT } from '../auth.middleware';

export const user = Router();

user.post('/users', creerUser);
user.post('/users/login', connectUser);
user.get('/users/affiche', afficheUser);
user.get('/users/:userId', afficheUserParId);
user.patch('/users/:userId', verifyJWT, miseAJourUser);
user.delete('/users/:userId', verifyJWT, supprimeUser);