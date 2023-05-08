import * as Models from '../../models/index.js';
import { RANGED_ATTACK_RANGE } from '../../models/unit.js';
export default async function resolveRangedAttackAction(attackingGamePiece, targetGamePieceId, commitChanges = false, transaction) {
    // Confirm target GamePiece exists and is a valid target
    const targetGamePiece = await Models.GamePiece.findByPk(targetGamePieceId, { transaction: transaction });
    if (!targetGamePiece)
        throw new Error(`No GamePiece found for targetGamePieceId ${targetGamePieceId}`);
    if (targetGamePiece.gameId != attackingGamePiece.gameId)
        throw new Error(`Target GamePiece ${targetGamePiece.id} is not in the same Game as attacking GamePiece ${attackingGamePiece.id}`);
    if (targetGamePiece.gamePlayerId == attackingGamePiece.gamePlayerId)
        throw new Error(`Target GamePiece ${targetGamePiece.id} is on the same team as attacking GamePiece ${attackingGamePiece.id}`);
    // Confirm attacking GamePiece can perform ranged attacks
    const attackingPlayerUnit = await Models.PlayerUnit.findByPk(attackingGamePiece.playerUnitId, { transaction: transaction });
    const attackingUnit = await Models.Unit.findByPk(attackingPlayerUnit.unitId, { transaction: transaction });
    // TODO: For now only Units with name "Archer" can perform ranged attacks
    if (attackingUnit.name != 'Archer')
        throw new Error(`GamePiece ${attackingGamePiece.id} of Unit "${attackingUnit.name}" cannot perform ranged attacks`);
    // Confirm target GamePiece is in range, use const range for melee for now
    const distanceToTarget = attackingGamePiece.distanceTo(targetGamePiece.coordinates());
    const attackerRange = RANGED_ATTACK_RANGE;
    if (distanceToTarget > attackerRange)
        throw new Error(`GamePiece ${attackingGamePiece.id} cannot execute a ranged attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than attacker's max range of ${attackerRange}`);
    if (commitChanges) {
        // Validations done, modify state
        if (targetGamePiece.isDead())
            return attackingGamePiece;
        const targetPlayerUnit = await Models.PlayerUnit.findByPk(targetGamePiece.playerUnitId, { transaction: transaction });
        const targetUnit = await Models.Unit.findByPk(targetPlayerUnit.unitId, { transaction: transaction });
        // TODO: Removed attackPower and armor, stub this as 1 for now.
        //   Need to implement dice rolls and attack sequence.
        // const damageSubtotal = attackingUnit.attackPower - targetUnit.armor;
        const damageSubtotal = 1;
        const damage = Math.min(damageSubtotal, 1);
        const newHealth = Math.max(targetGamePiece.health - damage, 0);
        targetGamePiece.health = newHealth;
        await targetGamePiece.save({ transaction: transaction });
    }
    else {
        // Any validation which should only be performed in dry runs
        if (targetGamePiece.isDead())
            throw new Error(`Target GamePiece ${targetGamePieceId} is already dead`);
    }
    return attackingGamePiece;
}
//# sourceMappingURL=ranged_attack_resolver.js.map