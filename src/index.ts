import express from 'express';
import {pokemon} from './pokemons/pokemons.router';

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(pokemon);

export const server = app.listen(port);

export function stopServer() {
  server.close();
}