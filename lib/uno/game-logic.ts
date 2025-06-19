import { UnoCard, UnoGameState, UnoPlayer, UnoColor, UniqueCardType, UNO_CARD_SCORES } from './types';
import { UnoDeck } from './deck';

export class UnoGameLogic {
  // Check if a card can be played on the current discard pile
  public static canPlayCard(card: UnoCard, topCard: UnoCard, currentColor: UnoColor | null): boolean {
    // Wild cards can always be played
    if (card.type === 'wild' || card.type === 'wild-draw-four') {
      return true;
    }

    // Unique cards have special play conditions
    if (card.type === 'unique') {
      return this.canPlayUniqueCard(card, topCard, currentColor);
    }

    // Standard cards: match color, number, or symbol
    if (card.color === currentColor || card.color === topCard.color) {
      return true;
    }

    if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) {
      return true;
    }

    if (card.type === topCard.type && card.type !== 'number') {
      return true;
    }

    return false;
  }

  private static canPlayUniqueCard(
    card: UnoCard, 
    topCard: UnoCard, 
    currentColor: UnoColor | null
  ): boolean {
    switch (card.uniqueType) {
      case 'revenge':
        // Can only be played after opponent used an action card
        // This should be handled by game state tracking
        return true; // Validation will be done in game state
      
      case 'final-stand':
        // Can only be played when player has 3 or fewer cards
        // This should be validated in the game state
        return true;
      
      default:
        // Most unique cards can be played anytime
        return true;
    }
  }

  // Apply the effect of a played card
  public static applyCardEffect(
    gameState: UnoGameState,
    playedCard: UnoCard,
    playerId: string,
    chosenColor?: UnoColor,
    additionalData?: any
  ): UnoGameState {
    const newState = { ...gameState };
    const playerIndex = newState.players.findIndex(p => p.id === playerId);
    const currentPlayer = newState.players[playerIndex];

    // Remove the card from player's hand
    currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== playedCard.id);

    // Add card to discard pile
    newState.discardPile = [playedCard, ...newState.discardPile];

    // Apply card-specific effects
    switch (playedCard.type) {
      case 'number':
        newState.currentColor = playedCard.color;
        this.advanceTurn(newState);
        break;

      case 'skip':
        newState.currentColor = playedCard.color;
        newState.skipNext = true;
        this.advanceTurn(newState);
        break;

      case 'reverse':
        newState.currentColor = playedCard.color;
        // In 2-player, reverse acts as skip
        newState.skipNext = true;
        this.advanceTurn(newState);
        break;

      case 'draw-two':
        newState.currentColor = playedCard.color;
        newState.drawCount += 2;
        this.advanceTurn(newState);
        break;

      case 'wild':
        newState.currentColor = chosenColor || 'red';
        this.advanceTurn(newState);
        break;

      case 'wild-draw-four':
        newState.currentColor = chosenColor || 'red';
        newState.drawCount += 4;
        this.advanceTurn(newState);
        break;

      case 'unique':
        this.applyUniqueCardEffect(newState, playedCard, playerId, additionalData);
        break;
    }

    // Check for round end
    if (currentPlayer.hand.length === 0) {
      this.endRound(newState, playerId);
    }

    return newState;
  }

  private static applyUniqueCardEffect(
    gameState: UnoGameState,
    card: UnoCard,
    playerId: string,
    additionalData?: any
  ): void {
    const currentPlayerIndex = gameState.players.findIndex(p => p.id === playerId);
    const opponentIndex = currentPlayerIndex === 0 ? 1 : 0;
    const currentPlayer = gameState.players[currentPlayerIndex];
    const opponent = gameState.players[opponentIndex];

    switch (card.uniqueType) {
      case 'duel':
        // Both players reveal their next card, higher number wins
        this.handleDuelCard(gameState, currentPlayer, opponent);
        break;

      case 'mirror':
        // Opponent draws same number of cards as current player has
        const cardsToDraw = currentPlayer.hand.length;
        this.drawCards(gameState, opponent, cardsToDraw);
        this.advanceTurn(gameState);
        break;

      case 'swap-hands':
        // Exchange hands
        const tempHand = [...currentPlayer.hand];
        currentPlayer.hand = [...opponent.hand];
        opponent.hand = tempHand;
        this.advanceTurn(gameState);
        break;

      case 'peek-pick':
        // Look at opponent's hand and force discard
        // This requires additional client interaction
        gameState.specialEffectActive = {
          type: 'peek-pick',
          playerId: playerId,
          timeRemaining: 30, // 30 seconds to choose
        };
        break;

      case 'double-down':
        // Play two cards simultaneously, opponent draws 4
        if (additionalData?.additionalCards) {
          const additionalCard = currentPlayer.hand.find(c => 
            additionalData.additionalCards.includes(c.id)
          );
          if (additionalCard && additionalCard.type === 'number' && 
              card.type === 'number' && additionalCard.value === card.value) {
            currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== additionalCard.id);
            gameState.discardPile.unshift(additionalCard);
            this.drawCards(gameState, opponent, 4);
          }
        }
        this.advanceTurn(gameState);
        break;

      case 'revenge':
        // Double the effect of the last action card back to opponent
        if (opponent.lastActionCard) {
          this.applyCardEffect(gameState, opponent.lastActionCard, opponent.id);
          this.applyCardEffect(gameState, opponent.lastActionCard, opponent.id);
        }
        break;

      case 'shield':
        // Activate shield for next action card
        currentPlayer.shieldActive = true;
        this.advanceTurn(gameState);
        break;

      case 'time-bomb':
        // Opponent has 10 seconds to play or draws 3
        gameState.specialEffectActive = {
          type: 'time-bomb',
          playerId: opponent.id,
          timeRemaining: 10,
        };
        break;

      case 'lucky-draw':
        // Draw 3 cards, keep 1, opponent gets other 2
        const drawnCards = this.drawCards(gameState, currentPlayer, 3);
        // This requires client interaction to choose which card to keep
        gameState.specialEffectActive = {
          type: 'lucky-draw',
          playerId: playerId,
          timeRemaining: 20,
        };
        break;

      case 'final-stand':
        // Opponent draws cards equal to current player's hand size
        if (currentPlayer.hand.length <= 3) {
          this.drawCards(gameState, opponent, currentPlayer.hand.length);
          this.advanceTurn(gameState);
        }
        break;
    }
  }

  private static handleDuelCard(
    gameState: UnoGameState,
    player1: UnoPlayer,
    player2: UnoPlayer
  ): void {
    if (player1.hand.length === 0 || player2.hand.length === 0) {
      this.advanceTurn(gameState);
      return;
    }

    const card1 = player1.hand[0];
    const card2 = player2.hand[0];

    let winner: UnoPlayer | null = null;

    if (card1.type === 'number' && card2.type === 'number') {
      if (card1.value! > card2.value!) {
        winner = player1;
      } else if (card2.value! > card1.value!) {
        winner = player2;
      }
    }

    if (winner) {
      // Winner gets to play again (don't advance turn)
      const loser = winner === player1 ? player2 : player1;
      this.drawCards(gameState, loser, 2);
    } else {
      // Tie: both draw 2 cards
      this.drawCards(gameState, player1, 2);
      this.drawCards(gameState, player2, 2);
      this.advanceTurn(gameState);
    }
  }

  // Draw cards for a player
  public static drawCards(gameState: UnoGameState, player: UnoPlayer, count: number): UnoCard[] {
    const drawnCards: UnoCard[] = [];
    
    for (let i = 0; i < count; i++) {
      if (gameState.drawPile.length === 0) {
        this.reshuffleDiscardPile(gameState);
      }
      
      if (gameState.drawPile.length > 0) {
        const card = gameState.drawPile.pop()!;
        player.hand.push(card);
        drawnCards.push(card);
      }
    }
    
    return drawnCards;
  }

  // Reshuffle discard pile into draw pile when needed
  private static reshuffleDiscardPile(gameState: UnoGameState): void {
    if (gameState.discardPile.length <= 1) {
      return; // Keep at least the top card
    }

    const topCard = gameState.discardPile[0];
    const cardsToShuffle = gameState.discardPile.slice(1);
    
    gameState.drawPile = UnoDeck.shuffleDeck(cardsToShuffle);
    gameState.discardPile = [topCard];
  }

  // Advance turn to next player
  private static advanceTurn(gameState: UnoGameState): void {
    if (gameState.skipNext) {
      gameState.skipNext = false;
      // In 2-player, skip means the same player goes again
      return;
    }

    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    
    // Handle accumulated draw cards
    if (gameState.drawCount > 0) {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      this.drawCards(gameState, currentPlayer, gameState.drawCount);
      gameState.drawCount = 0;
    }

    // Reset turn timer
    gameState.timeRemaining = gameState.settings.timePerTurn;
  }

  // End the current round
  private static endRound(gameState: UnoGameState, winnerId: string): void {
    const winner = gameState.players.find(p => p.id === winnerId)!;
    gameState.roundWinner = winner;
    gameState.currentPhase = 'round-ended';

    // Calculate and award points
    const points = this.calculateRoundPoints(gameState.players, winnerId);
    winner.score += points;

    // Record round history
    gameState.gameHistory.push({
      roundNumber: gameState.gameHistory.length + 1,
      winner: winnerId,
      playerScores: gameState.players.map(p => ({
        playerId: p.id,
        score: p.score,
        cardsRemaining: p.hand.length,
      })),
      cardsPlayed: [], // This would be populated during actual gameplay
    });

    // Check for game end
    if (winner.score >= gameState.settings.targetScore) {
      gameState.currentPhase = 'game-over';
      gameState.winner = winner;
    }
  }

  // Calculate points for round winner
  private static calculateRoundPoints(players: UnoPlayer[], winnerId: string): number {
    let totalPoints = 0;

    players.forEach(player => {
      if (player.id !== winnerId) {
        player.hand.forEach(card => {
          if (card.type === 'number') {
            totalPoints += card.value!;
          } else {
            totalPoints += UNO_CARD_SCORES[card.type];
          }
        });
      }
    });

    return totalPoints;
  }

  // Validate if player can call Uno
  public static canCallUno(player: UnoPlayer): boolean {
    return player.hand.length === 1 && !player.hasCalledUno;
  }

  // Apply Uno penalty
  public static applyUnoPenalty(gameState: UnoGameState, playerId: string): void {
    const player = gameState.players.find(p => p.id === playerId);
    if (player && player.hand.length === 1 && !player.hasCalledUno) {
      this.drawCards(gameState, player, 2);
    }
  }

  // Check for valid plays in hand
  public static getValidPlays(
    hand: UnoCard[], 
    topCard: UnoCard, 
    currentColor: UnoColor | null
  ): UnoCard[] {
    return hand.filter(card => this.canPlayCard(card, topCard, currentColor));
  }

  // Initialize a new game
  public static initializeGame(
    gameId: string,
    players: UnoPlayer[],
    settings: any
  ): UnoGameState {
    const deck = UnoDeck.generateFullDeck(settings.includeUniqueCards);
    const { playerHands, remainingDeck, startCard } = UnoDeck.dealInitialHands(deck, players.length);

    // Assign hands to players
    players.forEach((player, index) => {
      player.hand = playerHands[index];
      player.score = 0;
      player.isReady = false;
      player.hasCalledUno = false;
      player.shieldActive = false;
    });

    return {
      id: gameId,
      players,
      settings,
      currentPhase: 'lobby',
      currentPlayerIndex: 0,
      direction: 1,
      drawPile: remainingDeck,
      discardPile: [startCard],
      currentColor: startCard.color,
      skipNext: false,
      drawCount: 0,
      isActive: false,
      isGameStarted: false,
      winner: null,
      roundWinner: null,
      timeRemaining: settings.timePerTurn,
      specialEffectActive: {
        type: null,
        playerId: null,
        timeRemaining: 0,
      },
      gameHistory: [],
    };
  }
} 