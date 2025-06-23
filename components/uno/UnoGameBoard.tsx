'use client';

import { useState } from 'react';
import { UnoGameStateClient, UnoPlayer, UnoCard, UnoColor } from '@/lib/uno/types';
import { getCardDisplayInfo } from '@/lib/uno/deck';
import UnoCardComponent from './UnoCard';
import Timer from '@/components/shared/Timer';

interface UnoGameBoardProps {
  gameState: UnoGameStateClient;
  currentPlayer: UnoPlayer | null;
  onPlayCard: (cardId: string, chosenColor?: UnoColor, additionalData?: any) => void;
  onDrawCard: () => void;
  onCallUno: () => void;
  onBlockUno: () => void;
  onSendChatMessage: (message: string) => void;
}

export default function UnoGameBoard({
  gameState,
  currentPlayer,
  onPlayCard,
  onDrawCard,
  onCallUno,
  onBlockUno,
  onSendChatMessage,
}: UnoGameBoardProps) {
  const [selectedCard, setSelectedCard] = useState<UnoCard | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showBlockButton, setShowBlockButton] = useState(false);

  const isCurrentPlayerTurn = currentPlayer?.id === gameState.players[gameState.currentPlayerIndex]?.id;
  const opponent = gameState.players.find(p => p.id !== currentPlayer?.id);
  const topCard = gameState.topCard;

  // UNO logic - can call UNO when having exactly 1 card and haven't called yet
  const playerHandCount = gameState.playerHand?.length || 0;
  const opponentHandCount = opponent?.handCount || 0;
  const playerHasCalledUno = currentPlayer?.hasCalledUno || false;
  const opponentHasCalledUno = opponent?.hasCalledUno || false;
  
  const playerCanCallUno = playerHandCount === 1 && !playerHasCalledUno;
  const opponentCanCallUno = opponentHandCount === 1 && !opponentHasCalledUno;
  
  // Show block button when opponent can call UNO and it's current player's turn
  const shouldShowBlockButton = opponentCanCallUno && isCurrentPlayerTurn;
  
  // Check if player can stack draw cards
  const canStackDrawCards = () => {
    if (!isCurrentPlayerTurn || !topCard) return false;
    
    // Check if top card is a draw card
    const isTopCardDrawCard = topCard.type === 'draw-two' || topCard.type === 'wild-draw-four';
    if (!isTopCardDrawCard) return false;
    
    // Check if player has matching draw cards to stack
    return gameState.playerHand?.some(card => 
      card.type === 'draw-two' || card.type === 'wild-draw-four'
    ) || false;
  };

  // Client-side card validation
  const canPlayCard = (card: UnoCard): boolean => {
    if (!isCurrentPlayerTurn) return false;
    if (!topCard || !gameState.currentColor) return false;

    // Special stacking logic: if there are accumulated draw cards, only allow stacking
    if (gameState.drawCount > 0) {
      const isTopCardDrawCard = topCard.type === 'draw-two' || topCard.type === 'wild-draw-four';
      if (isTopCardDrawCard) {
        // Only allow draw cards to be played for stacking
        return card.type === 'draw-two' || card.type === 'wild-draw-four';
      }
    }

    // If top card is a draw card but no accumulated draws, allow stacking
    const isTopCardDrawCard = topCard.type === 'draw-two' || topCard.type === 'wild-draw-four';
    if (isTopCardDrawCard && (card.type === 'draw-two' || card.type === 'wild-draw-four')) {
      return true;
    }

    // Wild cards can always be played (unless we're in a draw card stacking situation)
    if (card.type === 'wild' || card.type === 'wild-draw-four') {
      return true;
    }

    // Unique cards can generally be played (with some exceptions)
    if (card.type === 'unique') {
      // Special validations for unique cards
      if (card.uniqueType === 'final-stand' && (gameState.playerHand?.length || 0) > 3) {
        return false;
      }
      
      if (card.uniqueType === 'revenge') {
        // Check if opponent used an action card recently (simplified check)
        return true; // Allow for now, server will validate properly
      }
      
      return true; // Most unique cards can be played anytime
    }

    // Standard cards: match color, number, or symbol
    if (card.color === gameState.currentColor || card.color === topCard.color) {
      return true;
    }

    if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) {
      return true;
    }

    if (card.type === topCard.type && card.type !== 'number') {
      return true;
    }

    return false;
  };

  const handleCardClick = (card: UnoCard) => {
    if (!isCurrentPlayerTurn) return;
    
    // If card is not playable, just ignore the click
    if (!canPlayCard(card)) return;

    // If clicking the same card, deselect it
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
      return;
    }

    // Select the card
    setSelectedCard(card);
  };

  const handlePlaySelectedCard = () => {
    if (!selectedCard || !isCurrentPlayerTurn) return;

    // Check if card requires color selection
    if (selectedCard.type === 'wild' || selectedCard.type === 'wild-draw-four') {
      setShowColorPicker(true);
      return;
    }

    // Play the card directly
    onPlayCard(selectedCard.id);
    setSelectedCard(null);
  };

  const handleColorChoice = (color: UnoColor) => {
    if (selectedCard) {
      onPlayCard(selectedCard.id, color);
    }
    setSelectedCard(null);
    setShowColorPicker(false);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && gameState.settings.enableChat) {
      onSendChatMessage(chatMessage.trim());
      setChatMessage('');
    }
  };

  const getCardColor = (card: UnoCard): string => {
    if (card.color) {
      switch (card.color) {
        case 'red': return 'bg-red-500';
        case 'blue': return 'bg-blue-500';
        case 'green': return 'bg-green-500';
        case 'yellow': return 'bg-yellow-500';
        default: return 'bg-gray-500';
      }
    }
    return card.type === 'unique' ? 'bg-purple-500' : 'bg-gray-800';
  };

  const getCurrentColorIndicator = () => {
    if (gameState.currentColor) {
      switch (gameState.currentColor) {
        case 'red': return 'border-red-500 bg-red-100';
        case 'blue': return 'border-blue-500 bg-blue-100';
        case 'green': return 'border-green-500 bg-green-100';
        case 'yellow': return 'border-yellow-500 bg-yellow-100';
        default: return 'border-gray-500 bg-gray-100';
      }
    }
    return 'border-gray-500 bg-gray-100';
  };

  const getCardFanStyle = (index: number, total: number, isOpponent = false) => {
    const maxRotation = 25;
    // Much smaller spacing so only left edges show
    const cardSpacing = 20; // Only show about 20px of each card
    const rotation = total > 1 ? ((index / (total - 1)) - 0.5) * maxRotation : 0;
    const translateX = index * cardSpacing - ((total - 1) * cardSpacing) / 2; // Evenly space cards with minimal overlap
    const translateY = isOpponent ? 0 : Math.abs(rotation) * 0.8;
    
    return {
      transform: `rotate(${rotation}deg) translateX(${translateX}px) translateY(${translateY}px)`,
      zIndex: selectedCard ? (selectedCard.id === gameState.playerHand?.[index]?.id ? 20 : index) : index,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Section - Opponent */}
        <div className="flex-none pt-4 px-4">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-3 bg-slate-700/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{opponent?.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-white">
                <div className="font-semibold">{opponent?.name}</div>
                <div className="text-xs text-gray-300">{opponent?.handCount} cards</div>
              </div>
              {opponent?.hasCalledUno && (
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  UNO!
                </div>
              )}
            </div>
          </div>

          {/* Opponent's Cards - Fanned */}
          <div className="flex justify-center mb-8">
            <div className="relative" style={{ width: `${Math.max(200, (opponent?.handCount || 0) * 20 + 60)}px`, height: '140px' }}>
              {Array.from({ length: opponent?.handCount || 0 }).map((_, index) => (
                <div
                  key={index}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2"
                  style={getCardFanStyle(index, opponent?.handCount || 0, true)}
                >
                  <div className="w-16 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg border-2 border-purple-400 shadow-lg flex items-center justify-center">
                    <div className="text-white text-2xl font-bold">🎮</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Section - Game Board */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="flex items-center gap-12">
            {/* Draw Pile */}
            <div className="text-center">
              <div 
                className="w-20 h-32 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg border-2 border-blue-400 cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center shadow-lg relative group"
                onClick={isCurrentPlayerTurn ? onDrawCard : undefined}
              >
                <div className="text-white font-bold text-lg">UNO</div>
                {isCurrentPlayerTurn && (
                  <div className="absolute inset-0 rounded-lg ring-2 ring-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </div>
              <div className="text-white text-xs mt-2 opacity-75">
                {gameState.drawPileCount} cards
              </div>
            </div>

            {/* Play Pile */}
            <div className="text-center">
              <div 
                className={`relative ${selectedCard ? 'cursor-pointer' : ''}`}
                onClick={selectedCard ? handlePlaySelectedCard : undefined}
              >
                <UnoCardComponent card={topCard} size="large" />
                {selectedCard && (
                  <div className="absolute inset-0 rounded-lg ring-4 ring-yellow-400 animate-pulse"></div>
                )}
              </div>
              <div className="text-white text-xs mt-2 opacity-75">
                {selectedCard ? 'Tap to play' : 'Play pile'}
              </div>
            </div>

            {/* Current Color Indicator */}
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full border-4 ${getCurrentColorIndicator()} shadow-lg`} />
              <div className="text-white text-xs mt-2 font-medium capitalize opacity-75">
                {gameState.currentColor || 'Any'}
              </div>
            </div>
          </div>

          {/* Turn Indicator */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isCurrentPlayerTurn 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-600 text-gray-300'
            }`}>
              {isCurrentPlayerTurn ? 'Your Turn' : `${gameState.players[gameState.currentPlayerIndex]?.name}'s Turn`}
            </div>
            
            {/* Stacking Indicator */}
            {isCurrentPlayerTurn && gameState.drawCount > 0 && topCard && (topCard.type === 'draw-two' || topCard.type === 'wild-draw-four') && 
             gameState.playerHand?.some(card => card.type === 'draw-two' || card.type === 'wild-draw-four') && (
              <div className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded-full animate-pulse">
                Stack or Draw {gameState.drawCount} Cards!
              </div>
            )}
          </div>



          {/* UNO Button - Show when player has exactly 1 card */}
          {playerCanCallUno && (
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <button
                onClick={onCallUno}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-200 animate-pulse"
              >
                Call UNO!
              </button>
            </div>
          )}

          {/* Block Button - Show when opponent can call UNO */}
          {shouldShowBlockButton && (
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 translate-y-20">
              <button
                onClick={onBlockUno}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-200"
              >
                Block UNO!
              </button>
            </div>
          )}


        </div>

        {/* Bottom Section - Current Player Hand */}
        <div className="flex-none pb-4 px-4">
          {/* Player Info */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-3 bg-slate-700/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{currentPlayer?.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-white">
                <div className="font-semibold">{currentPlayer?.name} (You)</div>
                <div className="text-xs text-gray-300">{gameState.playerHand?.length || 0} cards</div>
              </div>
              {currentPlayer?.hasCalledUno && (
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  UNO!
                </div>
              )}
            </div>
          </div>

          {/* Player's Hand - Fanned */}
          <div className="flex justify-center">
            <div className="relative" style={{ width: `${Math.max(200, (gameState.playerHand?.length || 0) * 20 + 60)}px`, height: '160px' }}>
              {gameState.playerHand?.map((card, index) => (
                <div
                  key={card.id}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                  style={getCardFanStyle(index, gameState.playerHand?.length || 0)}
                >
                  <UnoCardComponent
                    card={card}
                    onClick={() => handleCardClick(card)}
                    isPlayable={isCurrentPlayerTurn && canPlayCard(card)}
                    isSelected={selectedCard?.id === card.id}
                    size="medium"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Section - Hidden for now to focus on game */}
        {false && gameState.settings.enableChat && (
          <div className="absolute bottom-4 right-4 w-80">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <button
                onClick={() => setShowChat(!showChat)}
                className="w-full text-left font-semibold text-white hover:text-gray-300"
              >
                Chat {showChat ? '▲' : '▼'}
              </button>
              
              {showChat && (
                <div className="mt-4">
                  <div className="border rounded-lg p-3 h-32 overflow-y-auto bg-slate-700 mb-2">
                    <div className="text-sm text-gray-400 text-center">
                      Chat messages will appear here...
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-slate-600 text-white border border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={100}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-center">Choose a Color</h3>
            <div className="grid grid-cols-2 gap-4">
              {(['red', 'blue', 'green', 'yellow'] as UnoColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChoice(color)}
                  className={`w-20 h-20 rounded-lg border-4 border-gray-300 hover:border-gray-500 transition-colors ${
                    color === 'red' ? 'bg-red-500' :
                    color === 'blue' ? 'bg-blue-500' :
                    color === 'green' ? 'bg-green-500' :
                    'bg-yellow-500'
                  }`}
                >
                  <span className="text-white font-bold capitalize">{color}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setSelectedCard(null);
                setShowColorPicker(false);
              }}
              className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 