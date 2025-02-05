import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../client';
import { user } from './user.router';
import { Prisma } from '@prisma/client';
import JWT from 'jsonwebtoken';

export const creerUser = async (req: Request, res: Response) => {
  const { email,password } = req.body;
  try {
    const emailExist = await prisma.user.findUnique({
      where: {
        email: email
      }
    });
    if (emailExist) {
      res.status(400).send('Email déjà utilisé');
    } 
    
    else if (email === undefined || password === undefined) {
      const missingFields = [];
      if (email === undefined) missingFields.push('email');
      if (password === undefined) missingFields.push('password');
      res.status(400).send(`Veuillez remplir tous les champs: ${missingFields.join(', ')}`);
    }

    else
    {const user = await prisma.user.create({
      data: {
        email: email,
        password: await bcrypt.hash(password, 10),
      },
    });
    res.status(201).send(`User ${user.id} créé`);}
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({message: 'Une erreur' + `$(error.code) / $(erreur.message)`});
    }

    if(error instanceof Prisma.PrismaClientUnknownRequestError){
      res.status(500).send(`Une erreur est survenue : ${error.message}`);
    }
    res.status(500).send(`Erreur serveur : ${error}`);
  }
}

export const connectUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {

    const emailExist = await prisma.user.findUnique({
      where: {
        email: email
      }
    });
    if (!emailExist) {
      res.status(400).send('Le compte n\'existe pas');
    } 

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).send('Invalid email or password');
    }

    else{
      const mysecretkey = process.env.JWT_SECRET;
      const expire = process.env.JWT_EXPIRE;

      if (!mysecretkey) {
        throw new Error('JWT_SECRET is not defined');
      }

      const payload = {
        email: email,
        password: password,
      };
    
      const token = JWT.sign(payload, mysecretkey, { expiresIn: expire });
    
      res.status(200).json({
        msg: "User connecté",
        token: token
      });};

  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }



}