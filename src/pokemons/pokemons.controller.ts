import { Request, Response } from 'express';
import prisma from '../client';
import { pokemon } from './pokemons.router';

export const affichePokemons = async (_req: Request, res: Response) => {
  try {

    res.status(200).send('Liste de tous les pokemons');

  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};

export const affichePokemonParId = async (req: Request, res: Response) => {
  const { pokemonCardId } = req.params;
  try {

    const pokemon = await prisma.pokemonCard.findUnique({
      where: {id: Number(pokemonCardId),},
    });

    if (!pokemon) {
      res.status(404).send(`Pokémon n°${pokemonCardId} non trouvé`);
    }

    res.status(200).send(`Voici le pokemon que vous avez demandé ${pokemonCardId}`);

  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};

export const creePokemon = async (req: Request, res: Response) => {
  const { name, pokedexId, typeId, lifePoints, size, weight, imageUrl } = req.body;
  try {

    const pokemonType = await prisma.type.findUnique({
      where: { id: Number(typeId) },
    });

    const pokemonNom = await prisma.pokemonCard.findUnique({
      where: { name: String(name) },
    });

    const pokemonID = await prisma.pokemonCard.findUnique({
      where: { pokedexId: Number(pokedexId) },
    });

    if (!pokemonType) {
      res.status(400).send(`Type de pokemon inconnu`);
    }

    if (pokemonNom || pokemonID) {
      res.status(400).send(`Pokemon déjà existant`);
    }

    res.status(201).send('Pokemon ajouté');

    if (name === undefined || pokedexId === undefined || typeId === undefined || lifePoints === undefined) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!pokedexId) missingFields.push('pokedexId');
      if (!typeId) missingFields.push('type');
      if (!lifePoints) missingFields.push('lifePoints');
      if (!size) missingFields.push('size');
      if (!weight) missingFields.push('weight');
      if (!imageUrl) missingFields.push('imageUrl');
      res.status(400).send(`Veuillez remplir tous les champs: ${missingFields.join(', ')}`);
    }

  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};

export const miseAJourPokemon = async (req: Request, res: Response) => {
  const { pokemonCardId } = req.params;
  const { name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;
  try {

    const pokemon = await prisma.pokemonCard.findUnique({
      where: {id: Number(pokemonCardId),},
    });

    if (!pokemon) {
      res.status(404).send(`Pokémon n°${pokemonCardId} non trouvé`);
    }

    res.status(200).send(`${name} mis à jour`);

  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};

export const supprimePokemon = async (req: Request, res: Response) => {
  const { pokemonCardId } = req.params;
  try {

    const pokemon = await prisma.pokemonCard.findUnique({
      where: {id: Number(pokemonCardId),},
    });

    if (!pokemon) {
      res.status(404).send(`Pokémon n°${pokemonCardId} non trouvé`);
    }

    res.status(204).send(`Pokémon n°${pokemonCardId} supprimé `);

  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};