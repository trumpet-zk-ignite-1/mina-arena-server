import * as Models from '../models/index.js';
import sequelizeConnection from '../db/config.js';
import resolveGamePieceAction from './game_piece_action_resolver.js';
import { GamePhaseName } from '../models/game_phase.js';

export default async (
  gamePhase: Models.GamePhase,
  transaction
): Promise<Models.Game> => {
  // Validate that Game is in progress
  const game = await Models.Game.findByPk(gamePhase.gameId, { transaction: transaction });
  if (game.status != 'inProgress') throw new Error(`Game ${game.id} is not in progress, status: ${game.status}`);

  // Gather actions and resolve them in order
  const actions = await Models.GamePieceAction.findAll({
    where: { gamePhaseId: gamePhase.id },
    order: [['id', 'ASC']],
    transaction: transaction
  });
  for (const action of actions) {
    await resolveGamePieceAction(action, true, transaction);
  }

  // Check if any player has won
  const checkForWinnerResult = await checkForWinner(game, transaction);
  if (checkForWinnerResult.isGameDone) {
    // Game is over, mark as done
    game.status = 'completed';
    if (checkForWinnerResult.winningGamePlayer) {
      game.winningGamePlayerId = checkForWinnerResult.winningGamePlayer.id;
    }
    await game.save({ transaction: transaction });
  } else {
    // Game continues, create the next GamePhase
    const nextPhase = await createNextGamePhase(game, gamePhase, transaction);
    game.phase = nextPhase.phase;
    game.turnNumber = nextPhase.turnNumber;
    game.turnGamePlayerId = nextPhase.gamePlayerId;
    await game.save({ transaction: transaction });
  }

  return game;
}

type CheckForWinnerResult = {
  isGameDone: boolean,
  winningGamePlayer?: Models.GamePlayer
};

async function checkForWinner(
  game: Models.Game,
  transaction
): Promise<CheckForWinnerResult> {
  const gamePlayers = await Models.GamePlayer.findAll({
    where: { gameId: game.id },
    transaction: transaction
  });

  let livingGamePlayers = [];
  for (const gamePlayer of gamePlayers) {
    if (await gamePlayer.areAllGamePiecesDead()) continue;

    livingGamePlayers.push(gamePlayer);
  }

  if (livingGamePlayers.length > 1) return { isGameDone: false };

  if (livingGamePlayers.length == 1) {
    return { isGameDone: true, winningGamePlayer: livingGamePlayers[0] };
  }

  return { isGameDone: true, winningGamePlayer: null };
}

async function createNextGamePhase(
  game: Models.Game,
  currentPhase: Models.GamePhase,
  transaction
): Promise<Models.GamePhase> {
  let nextTurnNumber: number;
  let nextPhase: GamePhaseName;
  let nextGamePlayerId: number;

  switch(currentPhase.phase) {
    case 'movement':
      nextTurnNumber = currentPhase.turnNumber;
      nextPhase = 'shooting';
      nextGamePlayerId = currentPhase.gamePlayerId;
      break;
    case 'shooting':
      nextTurnNumber = currentPhase.turnNumber;
      nextPhase = 'melee';
      nextGamePlayerId = currentPhase.gamePlayerId;
      break;
    case 'melee':
      nextTurnNumber = currentPhase.turnNumber + 1;
      nextPhase = 'movement';
      nextGamePlayerId = (await game.nextGamePlayer()).id;
      break;
  }

  return await Models.GamePhase.create({
    gameId: game.id,
    gamePlayerId: nextGamePlayerId,
    turnNumber: nextTurnNumber,
    phase: nextPhase
  }, { transaction: transaction });
}
