import { Model, DataTypes, Association } from 'sequelize';
import User from "./User";

export default class Contract extends Model {
    public id: number;
    public userId: number;
    public periodId: number;
    public xml: string;

    static init(sequelize) {
        // @ts-ignore
        return super.init({
                id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
                userId: {
                    type: DataTypes.BIGINT,
                    allowNull: false
                },
                periodId: {
                    type: DataTypes.BIGINT,
                    allowNull: false
                },
                xml: { type: DataTypes.STRING }
            },
            {
                sequelize
            })
    }

    static associate(models) {
        Contract.belongsTo(User, { as: "user"})
    }

    public readonly user: User; // Note this is optional since it's only populated when explicitly requested in code

    public static associations: {
        user: Association<Contract, User>;
    };

    static findAllLatestByPeriod(period: number) {
        return Contract.findAll({
            where: { periodId: period },
            group: "userId"
        }).then(contracts => {
            let promises = contracts.map(c => Contract.findOne({
                    where: { periodId: period, userId: c.userId },
                    order: [[ "createdAt", "DESC"]],
                    include: [ { model: User, as: "user" } ]
                })
            )
            return Promise.all(promises)
        })
    }
}
