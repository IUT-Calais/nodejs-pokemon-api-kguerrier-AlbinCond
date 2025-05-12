import request from 'supertest';
import { app, stopServer } from '../src';
import { prismaMock } from './jest.setup';
import jwt from 'jsonwebtoken';

afterAll(() => {
  stopServer();
});

describe('PokemonCard API', () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  const token = jwt.sign({ email: 'test@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  describe('GET /pokemon-cards', () => {
    it('should fetch all PokemonCards', async () => {
      const mockPokemonCards = [
        {
          id: 1,
          name: 'Bulbizarre',
          pokedexId: 99,
          typeId: 3,
          lifePoints: 45,
          size: 0.7,
          weight: 6.9,
          imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png'
        },
        {
          id: 2,
          name: 'Herbizarre',
          pokedexId: 2,
          typeId: 4,
          lifePoints: 60,
          size: 1,
          weight: 13,
          imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/002.png'
        }
      ];

      prismaMock.pokemonCard.findMany.mockResolvedValue(mockPokemonCards);

      const response = await request(app).get('/pokemon-cards');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPokemonCards);
    });
  });

  describe('GET /pokemon-cards/:pokemonCardId', () => {
    it('should fetch a PokemonCard by ID', async () => {
    const mockPokemonCard = {
      id: 99,
      name: 'Bulbizarre',
      pokedexId: 1,
      typeId: 3,
      lifePoints: 45,
      size: 0.7,
      weight: 6.9,
      imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png'
    };

    prismaMock.pokemonCard.findUnique.mockResolvedValue(mockPokemonCard);

    const response = await request(app).get('/pokemon-cards/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockPokemonCard);
    });

    it('should return 404 if PokemonCard is not found', async () => {
      prismaMock.pokemonCard.findUnique.mockResolvedValue(null);
      const response = await request(app).get('/pokemon-cards/5');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Pokémon non trouvé' });
    });
  });

  describe('POST /pokemon-cards', () => {
    it('should create a new PokemonCard', async () => {
      const createdPokemonCard = {
        "name": 'metamorph',
        "pokedexId": 132,
        "type": 3,
        "lifePoints": 45,
        "size": 0.7,
        "weight": 6.9,
        "imageUrl": 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/132.png'
      };

      const createdPokemonCardWithId = { ...createdPokemonCard, id: 555, typeId: 3 };

      prismaMock.type.findUnique.mockResolvedValue({ id: 3, name: 'Normal' });

      prismaMock.pokemonCard.create.mockResolvedValue(createdPokemonCardWithId);

      const response = await request(app)
        .post('/pokemon-cards')
        .set('Authorization', `Bearer ${token}`)
        .send(createdPokemonCard);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdPokemonCardWithId);
    });
  });

  describe('PATCH /pokemon-cards/:pokemonCardId', () => {
    it('should update an existing PokemonCard', async () => {
      const updatedPokemonCard = {
        id: 4,
        name: 'Salamèche',
        pokedexId: 4,
        typeId: 4,
        lifePoints: 50,
        size: 0.8,
        weight: 6.8,
        imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/004.png'
      };

      prismaMock.pokemonCard.update.mockResolvedValue(updatedPokemonCard);

      const response = await request(app)
        .patch('/pokemon-cards/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedPokemonCard);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedPokemonCard);
    });
  });

  describe('DELETE /pokemon-cards/:pokemonCardId', () => {
    it('try to delete without token', async () => {
      const response = await request(app).delete('/pokemon-cards/1');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });
  
    it('should delete a PokemonCard', async () => {
      const mockPokemonCard = {
        id: 1,
        name: 'Pikachu',
        pokedexId: 25,
        typeId: 1,
        lifePoints: 35,
        size: 0.4,
        weight: 6.0,
        imageUrl: 'http://example.com/pikachu.png'
      };
  
      prismaMock.pokemonCard.findUnique.mockResolvedValue(mockPokemonCard);
      prismaMock.pokemonCard.delete.mockResolvedValue(mockPokemonCard);
  
      const response = await request(app)
        .delete('/pokemon-cards/1')
        .set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(204);
    });
  });
});
