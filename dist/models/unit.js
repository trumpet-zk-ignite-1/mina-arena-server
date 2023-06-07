import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
// TODO: Explore making different units have different base sizes (i.e. radius)
export const UNIT_RADIUS = 12;
class Unit extends Model {
    async playerUnits() {
        return await Models.PlayerUnit.findAll({ where: { unitId: this.id } });
    }
    canMakeRangedAttack() {
        if (this.rangedNumAttacks) {
            return this.rangedNumAttacks > 0;
        }
        else {
            return false;
        }
    }
}
Unit.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pointsCost: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    armorSaveRoll: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    meleeNumAttacks: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    meleeHitRoll: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    meleeWoundRoll: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    meleeArmorPiercing: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    meleeDamage: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rangedRange: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rangedNumAttacks: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rangedHitRoll: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rangedWoundRoll: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rangedArmorPiercing: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rangedDamage: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rangedAmmo: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    maxHealth: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    movementSpeed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
    },
    updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
    },
}, {
    sequelize: sequelizeConnection
});
export default Unit;
//# sourceMappingURL=unit.js.map