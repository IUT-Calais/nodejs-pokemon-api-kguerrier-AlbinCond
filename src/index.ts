import express from 'express';
import { Request, Response } from 'express';

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

export const server = app.listen(port);

export function stopServer() {
  server.close();
}

app.get('/pokemons-cards', (_req: Request, res: Response) => {
  res.status(200).send('Liste de tous les pokemons');
});

app.get('/pokemons-cards/:pokemonCardId', (_req: Request, res: Response) => {
  res.status(200).send(`Voici le pokemon que vous avez demandé ${_req.params.pokemonCardId}`);
});

app.post('/pokemon-cards', (_req: Request, res: Response) => {
  res.status(201).send(`${_req.params.pokemonCardId} Pokemon ajouté`);
});

app.patch('/pokemons-cards/:pokemonCardId', (_req: Request, res: Response) => {
  res.status(200).send(`${_req.params.pokemonCardId} à mis a jour`);
});

app.delete('/pokemons-cards/:pokemonCardId', (_req: Request, res: Response) => {
  res.status(204).send(`${_req.params.pokemonCardId} supprimer`);
});