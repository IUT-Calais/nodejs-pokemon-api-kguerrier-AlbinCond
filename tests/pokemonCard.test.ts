import request from 'supertest';
import { app, stopServer } from '../src';
import { prismaMock } from './jest.setup';
import jwt from 'jsonwebtoken';

afterAll(() => {
  stopServer();
});

describe('PokemonCard API', () => {

  const token = jwt.sign({ email: 'test@example.com' }, "test", { expiresIn: '1h' });

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

    it('should return 400 if there is a server error', async () => {
      prismaMock.pokemonCard.findMany.mockRejectedValue(new Error('Server error'));

      const response = await request(app).get('/pokemon-cards');
      expect(response.status).toBe(400);
      expect(response.text).toEqual('\"Erreur serveur : Error: Server error\"');
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

    it('should return 400 if there is a server error', async () => {
      prismaMock.pokemonCard.findUnique.mockRejectedValue(new Error('Server error')); // Changer findMany en findUnique

      const response = await request(app).get('/pokemon-cards/1');
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Erreur serveur : Error: Server error');
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

    it('should handle server error during creation', async () => {
      const pokemonData = {
        name: "TestPokemon",
        pokedexId: 999,
        type: 1,
        lifePoints: 100,
        size: 0.7,
        weight: 6.9,
        imageUrl: "https://example.com/test.png"
      };

      // Mock du type existant
      prismaMock.type.findUnique.mockResolvedValue({ id: 1, name: 'Normal' });
      // Mock des vérifications de doublon
      prismaMock.pokemonCard.findUnique.mockResolvedValue(null);
      // Mock de l'erreur lors de la création
      prismaMock.pokemonCard.create.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
          .post('/pokemon-cards')
          .set('Authorization', `Bearer ${token}`)
          .send(pokemonData);

      expect(response.status).toBe(400);
      expect(response.text).toBe('"Erreur serveur : Error: Server error"');
    });

    it('should return 400 if pokemon type does not exist', async () => {
      const pokemonData = {
        name: 'TestPokemon',
        pokedexId: 999,
        type: 999, // Type inexistant
        lifePoints: 100
      };

      prismaMock.type.findUnique.mockResolvedValue(null);

      const response = await request(app)
          .post('/pokemon-cards')
          .set('Authorization', `Bearer ${token}`)
          .send(pokemonData);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Type de pokemon inconnu');
    });

    it('should return 400 if pokemon name already exists', async () => {
      const pokemonData = {
        name: 'ExistingPokemon',
        pokedexId: 999,
        type: 1,
        lifePoints: 100
      };

      prismaMock.type.findUnique.mockResolvedValue({ id: 1, name: 'Normal' });
      prismaMock.pokemonCard.findUnique.mockResolvedValue({
        id: 1, name: 'ExistingPokemon',
        pokedexId: 0,
        typeId: 0,
        lifePoints: 0,
        size: 0,
        weight: 0,
        imageUrl: ''
      });

      const response = await request(app)
          .post('/pokemon-cards')
          .set('Authorization', `Bearer ${token}`)
          .send(pokemonData);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Pokemon nom déjà existant');
    });

    it('should return 400 if pokedexId already exists', async () => {
      const pokemonData = {
        name: 'NewPokemon',
        pokedexId: 1, // ID existant
        type: 1,
        lifePoints: 100
      };

      prismaMock.type.findUnique.mockResolvedValue({ id: 1, name: 'Normal' });
      prismaMock.pokemonCard.findUnique
          .mockResolvedValueOnce(null) // Pour la vérification du nom
          .mockResolvedValueOnce({
            id: 1, pokedexId: 1,
            name: '',
            typeId: 0,
            lifePoints: 0,
            size: 0,
            weight: 0,
            imageUrl: ''
          }); // Pour la vérification du pokedexId

      const response = await request(app)
          .post('/pokemon-cards')
          .set('Authorization', `Bearer ${token}`)
          .send(pokemonData);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Pokemon id déjà existant');
    });

    it('should return 554 if required fields are missing', async () => {
      const pokemonData = {
        // Champs manquants
        size: 0.7,
        weight: 6.9,
      };

      const response = await request(app)
          .post('/pokemon-cards')
          .set('Authorization', `Bearer ${token}`)
          .send(pokemonData);

      expect(response.status).toBe(554);
      expect(response.text).toBe('Veuillez remplir tous les champs: name, pokedexId, type, lifePoints');

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

    it('should return 400 if pokemon name already exists', async () => {
      const updateData = {
        name: 'ExistingPokemon'
      };

      prismaMock.pokemonCard.findUnique.mockResolvedValue({
        id: 2, name: 'ExistingPokemon',
        pokedexId: 0,
        typeId: 0,
        lifePoints: 0,
        size: 0,
        weight: 0,
        imageUrl: ''
      });

      const response = await request(app)
          .patch('/pokemon-cards/1')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Le Pokémon ExistingPokemon existe déjà.');
    });

    it('should return 400 if pokedexId already exists', async () => {
      const updateData = {
        pokedexId: 999
      };

      prismaMock.pokemonCard.findUnique.mockResolvedValue({
        id: 2, pokedexId: 999,
        name: '',
        typeId: 0,
        lifePoints: 0,
        size: 0,
        weight: 0,
        imageUrl: ''
      });

      const response = await request(app)
          .patch('/pokemon-cards/1')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Le Pokémon 999 existe déjà.');
    });

    it('should return 400 if type does not exist', async () => {
      const updateData = {
        type: 999
      };

      prismaMock.type.findUnique.mockResolvedValue(null);

      const response = await request(app)
          .patch('/pokemon-cards/1')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Le type 999 n\'existe pas.');
    });

    it('should return 500 if there is a server error', async () => {
      prismaMock.pokemonCard.update.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
          .patch('/pokemon-cards/1')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'UpdatedPokemon' });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Erreur serveur : Error: Server error');
    });
  });

  describe('DELETE /pokemon-cards/:pokemonCardId', () => {
    it('try to delete without token', async () => {
      const response = await request(app).delete('/pokemon-cards/1');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({});
    });

    it('should return 404 if pokemon does not exist', async () => {
      prismaMock.pokemonCard.findUnique.mockResolvedValue(null);

      const response = await request(app)
          .delete('/pokemon-cards/999')
          .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe('Pokémon n°999 non trouvé');
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

    it('should handle server error during deletion', async () => {
      // Mock d'un pokémon existant
      prismaMock.pokemonCard.findUnique.mockResolvedValue({
        id: 1,
        name: 'Pikachu',
        pokedexId: 25,
        typeId: 1,
        lifePoints: 35,
        size: 0.4,
        weight: 6.0,
        imageUrl: 'http://example.com/pikachu.png'
      });

      // Mock d'une erreur lors de la suppression
      prismaMock.pokemonCard.delete.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
          .delete('/pokemon-cards/1')
          .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.text).toBe('"Erreur serveur : Error: Server error"');
    });
  });
});