import { Router } from 'express';
import { affichePokemons, affichePokemonParId, creePokemon, miseAJourPokemon, supprimePokemon } from './pokemons.controller';

export const pokemon = Router();

pokemon.get('/pokemon-cards', affichePokemons);
pokemon.get('/pokemon-cards/:pokemonCardId', affichePokemonParId);
pokemon.post('/pokemon-cards', creePokemon);
pokemon.patch('/pokemon-cards/:pokemonCardId', miseAJourPokemon);
pokemon.delete('/pokemon-cards/:pokemonCardId', supprimePokemon);