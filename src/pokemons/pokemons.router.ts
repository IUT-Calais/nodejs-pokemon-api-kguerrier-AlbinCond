import { Router } from 'express';
import { affichePokemons, affichePokemonParId, creePokemon, miseAJourPokemon, supprimePokemon } from './pokemons.controller';
import { verifyJWT } from '../auth.middleware';

export const pokemon = Router();

pokemon.get('/pokemon-cards', affichePokemons);
pokemon.get('/pokemon-cards/:pokemonCardId', affichePokemonParId);
pokemon.post('/pokemon-cards', verifyJWT, creePokemon);
pokemon.patch('/pokemon-cards/:pokemonCardId', verifyJWT, miseAJourPokemon);
pokemon.delete('/pokemon-cards/:pokemonCardId', verifyJWT, supprimePokemon);