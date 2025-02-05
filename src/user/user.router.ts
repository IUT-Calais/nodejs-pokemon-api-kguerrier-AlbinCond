import { Router } from 'express';
import { creerUser, connectUser } from './user.controller';


export const user = Router();

user.post('/users', creerUser);
user.post('/users/login', connectUser);