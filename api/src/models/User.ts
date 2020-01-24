import {
    Sequelize,
    Model,
    DataTypes,
    BuildOptions,
    HasManyGetAssociationsMixin,
    HasManyCreateAssociationMixin
} from 'sequelize';
import * as crypto from "crypto"
import * as jwt from "jsonwebtoken"
import Contract from "./Contract";

export default class User extends Model {
    public id!: number;
    public email: string;
    public firstName: string;
    public middleName: string;
    public lastName: string;
    public passwordHash: string;
    public passwordSalt: string;
    public isAdmin: boolean;

    // public getContracts!: HasManyGetAssociationsMixin<Contract>; // Note the null assertions!
    // public createContract!: HasManyCreateAssociationMixin<Contract>;

    setPassword(password: string) {
        this.passwordSalt = crypto.randomBytes(16).toString('hex');
        this.passwordHash = crypto.pbkdf2Sync(password, this.passwordSalt, 10000, 512, 'sha512').toString('hex');
    }

    validatePassword(password: string): boolean {
        const hash = crypto.pbkdf2Sync(password, this.passwordSalt, 10000, 512, 'sha512').toString('hex');
        return this.passwordHash === hash;
    }

    generateJWT() {
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 60);

        return jwt.sign({
            email: this.email,
            id: this.id,
            isAdmin: this.isAdmin,
            exp: parseInt((expirationDate.getTime() / 1000).toString(), 10),
        }, process.env.OFFICE_JWT_SECRET);
    }

    toAuthJSON() {
        return {
            id: this.id,
            email: this.email,
            token: this.generateJWT(),
            isAdmin: this.isAdmin
        };
    }

    static init(sequelize) {
        // @ts-ignore
        return super.init({
                id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
                email: { type: DataTypes.STRING, allowNull: false },
                passwordHash: { type: DataTypes.STRING },
                passwordSalt: { type: DataTypes.STRING },
                firstName: { type: DataTypes.STRING },
                middleName: { type: DataTypes.STRING },
                lastName: { type: DataTypes.STRING },
                isAdmin: { type: DataTypes.BOOLEAN },
            },
            {
                sequelize
            })
    }

    // static associate(models) {
    //     this.hasMany(models.Contract, { foreignKey: "userId"})
    // }
}
