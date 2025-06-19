import { v4 as uuidv4 } from 'uuid';
import { UnoCard, UnoColor, UniqueCardType } from './types';

export class UnoDeck {
  private static createNumberCard(color: UnoColor, value: number): UnoCard {
    return {
      id: uuidv4(),
      type: 'number',
      color,
      value,
    };
  }

  private static createActionCard(
    color: UnoColor, 
    type: 'skip' | 'reverse' | 'draw-two'
  ): UnoCard {
    return {
      id: uuidv4(),
      type,
      color,
      value: null,
    };
  }

  private static createWildCard(type: 'wild' | 'wild-draw-four'): UnoCard {
    return {
      id: uuidv4(),
      type,
      color: null,
      value: null,
    };
  }

  private static createUniqueCard(uniqueType: UniqueCardType): UnoCard {
    return {
      id: uuidv4(),
      type: 'unique',
      color: null,
      value: null,
      uniqueType,
    };
  }

  public static generateStandardDeck(): UnoCard[] {
    const deck: UnoCard[] = [];
    const colors: UnoColor[] = ['red', 'blue', 'green', 'yellow'];

    // Add number cards (0-9)
    colors.forEach(color => {
      // One 0 card per color
      deck.push(this.createNumberCard(color, 0));
      
      // Two of each number 1-9 per color
      for (let value = 1; value <= 9; value++) {
        deck.push(this.createNumberCard(color, value));
        deck.push(this.createNumberCard(color, value));
      }
    });

    // Add action cards (2 of each per color)
    colors.forEach(color => {
      deck.push(this.createActionCard(color, 'skip'));
      deck.push(this.createActionCard(color, 'skip'));
      deck.push(this.createActionCard(color, 'reverse'));
      deck.push(this.createActionCard(color, 'reverse'));
      deck.push(this.createActionCard(color, 'draw-two'));
      deck.push(this.createActionCard(color, 'draw-two'));
    });

    // Add wild cards (4 of each)
    for (let i = 0; i < 4; i++) {
      deck.push(this.createWildCard('wild'));
      deck.push(this.createWildCard('wild-draw-four'));
    }

    return deck;
  }

  public static generateUniqueDeck(): UnoCard[] {
    const uniqueCards: UniqueCardType[] = [
      'duel',
      'mirror', 
      'swap-hands',
      'peek-pick',
      'double-down',
      'revenge',
      'shield',
      'time-bomb',
      'lucky-draw',
      'final-stand'
    ];

    // Add 2 of each unique card for strategic gameplay
    const deck: UnoCard[] = [];
    uniqueCards.forEach(uniqueType => {
      deck.push(this.createUniqueCard(uniqueType));
      deck.push(this.createUniqueCard(uniqueType));
    });

    return deck;
  }

  public static generateFullDeck(includeUniqueCards: boolean = true): UnoCard[] {
    const standardDeck = this.generateStandardDeck();
    
    if (includeUniqueCards) {
      const uniqueDeck = this.generateUniqueDeck();
      return [...standardDeck, ...uniqueDeck];
    }
    
    return standardDeck;
  }

  public static shuffleDeck(deck: UnoCard[]): UnoCard[] {
    const shuffled = [...deck];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  public static dealInitialHands(deck: UnoCard[], playerCount: number): {
    playerHands: UnoCard[][];
    remainingDeck: UnoCard[];
    startCard: UnoCard;
  } {
    const shuffledDeck = this.shuffleDeck(deck);
    const playerHands: UnoCard[][] = [];
    
    // Deal 7 cards to each player
    for (let i = 0; i < playerCount; i++) {
      playerHands.push([]);
    }
    
    let deckIndex = 0;
    for (let cardNum = 0; cardNum < 7; cardNum++) {
      for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
        playerHands[playerIndex].push(shuffledDeck[deckIndex]);
        deckIndex++;
      }
    }
    
    // Find a valid start card (not an action card or unique card)
    let startCardIndex = deckIndex;
    while (startCardIndex < shuffledDeck.length) {
      const card = shuffledDeck[startCardIndex];
      if (card.type === 'number') {
        break;
      }
      startCardIndex++;
    }
    
    // If no number card found, use the first card and handle it
    if (startCardIndex >= shuffledDeck.length) {
      startCardIndex = deckIndex;
    }
    
    const startCard = shuffledDeck[startCardIndex];
    const remainingDeck = [
      ...shuffledDeck.slice(deckIndex, startCardIndex),
      ...shuffledDeck.slice(startCardIndex + 1)
    ];
    
    return {
      playerHands,
      remainingDeck,
      startCard,
    };
  }
}

// Helper function to get card display information
export function getCardDisplayInfo(card: UnoCard): {
  displayName: string;
  description?: string;
  color: string;
  symbol: string;
} {
  switch (card.type) {
    case 'number':
      return {
        displayName: `${card.color} ${card.value}`,
        color: card.color!,
        symbol: card.value!.toString(),
      };
    
    case 'skip':
      return {
        displayName: `${card.color} Skip`,
        description: 'Skip opponent\'s turn',
        color: card.color!,
        symbol: '⊘',
      };
    
    case 'reverse':
      return {
        displayName: `${card.color} Reverse`,
        description: 'Reverse direction (acts as Skip in 2-player)',
        color: card.color!,
        symbol: '⟲',
      };
    
    case 'draw-two':
      return {
        displayName: `${card.color} Draw Two`,
        description: 'Opponent draws 2 cards',
        color: card.color!,
        symbol: '+2',
      };
    
    case 'wild':
      return {
        displayName: 'Wild',
        description: 'Choose any color',
        color: 'black',
        symbol: '◆',
      };
    
    case 'wild-draw-four':
      return {
        displayName: 'Wild Draw Four',
        description: 'Choose color, opponent draws 4',
        color: 'black',
        symbol: '+4',
      };
    
    case 'unique':
      return getUniqueCardDisplayInfo(card.uniqueType!);
    
    default:
      return {
        displayName: 'Unknown Card',
        color: 'gray',
        symbol: '?',
      };
  }
}

function getUniqueCardDisplayInfo(uniqueType: UniqueCardType): {
  displayName: string;
  description: string;
  color: string;
  symbol: string;
} {
  switch (uniqueType) {
    case 'duel':
      return {
        displayName: 'Duel',
        description: 'Both players reveal next card. Higher wins and plays again.',
        color: 'purple',
        symbol: '⚔️',
      };
    
    case 'mirror':
      return {
        displayName: 'Mirror',
        description: 'Opponent draws same number of cards you have.',
        color: 'purple',
        symbol: '🪞',
      };
    
    case 'swap-hands':
      return {
        displayName: 'Swap Hands',
        description: 'Exchange your hand with opponent\'s hand.',
        color: 'purple',
        symbol: '🔄',
      };
    
    case 'peek-pick':
      return {
        displayName: 'Peek & Pick',
        description: 'Look at opponent\'s hand and force them to discard.',
        color: 'purple',
        symbol: '👁️',
      };
    
    case 'double-down':
      return {
        displayName: 'Double Down',
        description: 'Play two cards simultaneously, opponent draws 4.',
        color: 'purple',
        symbol: '2X',
      };
    
    case 'revenge':
      return {
        displayName: 'Revenge',
        description: 'Can only play after opponent\'s action. Doubles effect back.',
        color: 'purple',
        symbol: '⚡',
      };
    
    case 'shield':
      return {
        displayName: 'Shield',
        description: 'Blocks next action card and reflects it back.',
        color: 'purple',
        symbol: '🛡️',
      };
    
    case 'time-bomb':
      return {
        displayName: 'Time Bomb',
        description: 'Opponent must play within 10 seconds or draw 3.',
        color: 'purple',
        symbol: '💣',
      };
    
    case 'lucky-draw':
      return {
        displayName: 'Lucky Draw',
        description: 'Draw 3 cards, keep 1, opponent gets the other 2.',
        color: 'purple',
        symbol: '🍀',
      };
    
    case 'final-stand':
      return {
        displayName: 'Final Stand',
        description: 'Only playable with ≤3 cards. Opponent draws cards equal to your hand.',
        color: 'purple',
        symbol: '🎯',
      };
    
    default:
      return {
        displayName: 'Unknown Unique',
        description: 'Unknown unique card',
        color: 'purple',
        symbol: '?',
      };
  }
} 