import * as fs from 'fs';
import * as path from 'path';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.OFFICE_DB_URL, { dialect: "mariadb"})
const modelsDirectory = path.dirname(__dirname) + '/src/models/';


// iterate over models directory and initialize each of them
const models = Object.assign({}, ...fs.readdirSync(modelsDirectory)
    .map(function(file){
        const model = require(path.join(modelsDirectory + file)).default;
        return {
            [model.name]: model.init(sequelize)
        };
    })
);
// create associations between models
for(const model of Object.keys(models)) {
    typeof models[model].associate === 'function' && models[model].associate(models);
}

models.sequelize = sequelize;

export default models;