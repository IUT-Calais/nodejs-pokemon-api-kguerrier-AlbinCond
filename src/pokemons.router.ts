import { Router } from 'express';
import { affichePokemons, affichePokemonParId, creePokemon, miseAJourPokemon, supprimePokemon } from './pokemons/pokemons.controller';

const router = Router();

router.get('/pokemons-cards', affichePokemons);
router.get('/pokemons-cards/:pokemonCardId', affichePokemonParId);
router.post('/pokemon-cards', creePokemon);
router.patch('/pokemons-cards/:pokemonCardId', miseAJourPokemon);
router.delete('/pokemons-cards/:pokemonCardId', supprimePokemon);

export default router;