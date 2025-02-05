import { Request, Response } from 'express';

export const affichePokemons = async (_req: Request, res: Response) => {
  try {
    res.status(200).send('Liste de tous les pokemons');
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};

export const affichePokemonParId = async (req: Request, res: Response) => {
  try {
    const { pokemonCardId } = req.params;
    res.status(200).send(`Voici le pokemon que vous avez demandé ${pokemonCardId}`);
  } catch (error) {
    res.status(404).send('Pokémon non trouvé');
  }
};

export const creePokemon = async (req: Request, res: Response) => {
  try {
    const { name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;
    res.status(201).send('Pokemon ajouté');
  } catch (error) {
    res.status(400).send('Erreur lors de l\'ajout du Pokémon');
  }
};

export const miseAJourPokemon = async (req: Request, res: Response) => {
  try {
    const { pokemonCardId } = req.params;
    const { name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;
    res.status(200).send('Pokémon mis à jour');
  } catch (error) {
    res.status(400).send('Erreur lors de la mise à jour du Pokémon');
  }
};

export const supprimePokemon = async (req: Request, res: Response) => {
  try {
    const { pokemonCardId } = req.params;
    res.status(204).send('Pokémon supprimé');
  } catch (error) {
    res.status(404).send('Pokémon non trouvé');
  }
};