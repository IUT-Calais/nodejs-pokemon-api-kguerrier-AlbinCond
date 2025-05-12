import express from 'express';
import {pokemon} from './pokemons/pokemons.router';
import {user} from './user/user.router';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

export const app = express();
const port = process.env.PORT || 3000;

// Charger le fichier swagger.yaml depuis le dossier docs
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));

app.use(express.json());
app.use(pokemon);
app.use(user);

// Route pour la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export const server = app.listen(port);

export function stopServer() {
  server.close();
}