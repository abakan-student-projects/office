import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';
import User from "./User";

export default class Periods extends Model {
    public id: number;
    public name: string;
    public path: string;
    public active: boolean;

    static init(sequelize) {
        // @ts-ignore
        return super.init({
                id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
                name: { type: DataTypes.STRING },
                path: { type: DataTypes.STRING },
                active: {type: DataTypes.BOOLEAN }
            },
            {
                sequelize
            })
    }
}
 