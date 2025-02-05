import { Request, Response } from 'express';

export const creerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    res.status(201).send('User ajouté');
  } catch (error) {
    res.status(400).send('Erreur lors de l\'ajout de l\'utilisateur');
  }
}