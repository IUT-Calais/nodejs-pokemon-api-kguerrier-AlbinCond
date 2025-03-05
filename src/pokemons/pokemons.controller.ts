import { Request, Response } from 'express';
import prisma from '../client';
import { pokemon } from './pokemons.router';

export const affichePokemons = async (_req: Request, res: Response) => {
  try { 
    res.status(200).json(await prisma.pokemonCard.findMany());
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
    else
    {
      res.status(200).json(await prisma.pokemonCard.findUnique({where : {id : Number(pokemonCardId)}}));
    }

  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};

export const creePokemon = async (req: Request, res: Response) => {
  const { name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;
  try {

    const pokemonType = await prisma.type.findUnique({
      where: { id: Number(type) },
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


    else if (pokemonNom) {
      res.status(400).send(`Pokemon nom déjà existant`);
    }

    else if (pokemonID) {
      res.status(400).send(`Pokemon id déjà existant`);
    }

    else if (name === undefined || pokedexId === undefined || type === undefined || lifePoints === undefined) {
      const missingFields = [];
      if (name === undefined) missingFields.push('name');
      if (pokedexId === undefined) missingFields.push('pokedexId');
      if (type === undefined) missingFields.push('type');
      if (lifePoints === undefined) missingFields.push('lifePoints');
      res.status(400).send(`Veuillez remplir tous les champs: ${missingFields.join(', ')}`);
    }

    else{
      await prisma.pokemonCard.create({
        data: {
          name: name,
          pokedexId: pokedexId,
          type: { connect : {id : type} },
          lifePoints: lifePoints,
          size: size,
          weight: weight,
          imageUrl: imageUrl
        }
      });
      res.status(201).send('Pokemon ajouté');
    }

  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};


export const miseAJourPokemon = async (req: Request | any, res: Response | any) => {
  const { pokemonCardId } = req.params;
  const { name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;
  let pokemonType = null;
  try {
      const pokemonName = await prisma.pokemonCard.findUnique({
          where: {name: String(name)}
      });

      const pokeId = await prisma.pokemonCard.findUnique({
          where: {pokedexId: Number(pokedexId)}
      });

      if (type != undefined) {
          pokemonType = await prisma.type.findUnique({
              where: {id: Number(type)}
          });
      }
  
      if (pokemonName) { 
          return res.status(400).send(`Le Pokémon ${name} existe déjà.`);
      }

      if (pokeId) { 
          return res.status(400).send(`Le Pokémon ${pokedexId} existe déjà.`);
      }

      if (type != undefined && !pokemonType) {
          return res.status(400).send(`Le type ${type} n'existe pas.`);
      }

      // Construire l'objet data pour l'update
      const data: any = {};
      if (name !== undefined) data.name = name;
      if (pokedexId !== undefined) data.pokedexId = pokedexId;
      if (type !== undefined) data.type = { connect: { id: type } };
      if (lifePoints !== undefined) data.lifePoints = lifePoints;
      if (size !== undefined) data.size = size;
      if (weight !== undefined) data.weight = weight;
      if (imageUrl !== undefined) data.imageUrl = imageUrl;

      // Succès de l'update.
      await prisma.pokemonCard.update({
          where: {id: Number(pokemonCardId)},
          data: data
      });
      res.status(200).send(`Pokémon ${pokemonCardId} mis à jour avec succès.`);
       
  } catch (error) {
      res.status(404).send(`Erreur serveur : ${error}`);
  }
}

export const supprimePokemon = async (req: Request, res: Response) => {
  const { pokemonCardId } = req.params;
  try {

    const pokemon = await prisma.pokemonCard.findUnique({
      where: {id: Number(pokemonCardId),},
    });

    if (!pokemon) {
      res.status(404).send(`Pokémon n°${pokemonCardId} non trouvé`);
    }

    else
    {
      await prisma.pokemonCard.delete({
        where: {id: Number(pokemonCardId),},
      });
      res.status(204).send(`Pokémon n°${pokemonCardId} supprimé `);
    }

  } catch (error) {
    res.status(400).send(`Erreur serveur : ${error}`);
  }
};