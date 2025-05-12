import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../client';
import { Prisma } from '@prisma/client';
import JWT from 'jsonwebtoken';

export const creerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
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
    else {
      const user = await prisma.user.create({
        data: {
          email: email,
          password: await bcrypt.hash(password, 10),
        },
      });
      res.status(201).send(user);
    }
  }

  catch (error) {

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      res.status(502).send(`Une erreur est survenue : le client prisma a une request inconnu`);
    }
    res.status(500).send(`Erreur serveur : ${error}`);
  }
}

export const connectUser = async (req: Request|any, res: Response|any) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user) {
      res.status(404).send('Le compte n\'existe pas');
    }

    else {
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(400).send('Invalid email or password');
      }

      else {
        const mysecretkey = process.env.JWT_SECRET;
        const expire = process.env.JWT_EXPIRE_IN;

        if (!mysecretkey) {
          throw new Error('JWT_SECRET is not defined');
        }

        const payload = {
          email: email,
        };

        const token = JWT.sign(payload, mysecretkey, { expiresIn: expire });

        res.status(200).json({
          msg: "User connecté",
          token: token
        });
      }
    }
  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
}

export const afficheUser = async (_req: Request, res: Response) => {
  try {
    res.status(200).json(await prisma.user.findMany());
  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};

// Récupérer un utilisateur par ID
export const afficheUserParId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      res.status(404).send('Utilisateur non trouvé');
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};

// Mettre à jour un utilisateur
export const miseAJourUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { email, password } = req.body;
  try {
    const data: any = {};
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: data,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};

// Supprimer un utilisateur
export const supprimeUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      res.status(404).send('Utilisateur non trouvé');
    } else {
      await prisma.user.delete({
        where: { id: Number(userId) },
      });
      res.status(204).send();
    }
  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};