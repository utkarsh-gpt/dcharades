'use client';

import { useState } from 'react';
import { UnoGameState, UnoPlayer, UnoCard, UnoColor } from '@/lib/uno/types';
import { getCardDisplayInfo } from '@/lib/uno/deck';
import UnoCardComponent from './UnoCard';
import Timer from '@/components/shared/Timer';

interface UnoGameBoardProps {
  gameState: UnoGameState;
  currentPlayer: UnoPlayer | null;
  onPlayCard: (cardId: string, chosenColor?: UnoColor, additionalData?: any) => void;
  onDrawCard: () => void;
  onCallUno: () => void;
  onSendChatMessage: (message: string) => void;
}

export default function UnoGameBoard({
  gameState,
  currentPlayer,
  onPlayCard,
  onDrawCard,
  onCallUno,
  onSendChatMessage,
}: UnoGameBoardProps) {
  const [selectedCard, setSelectedCard] = useState<UnoCard | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  const isCurrentPlayerTurn = currentPlayer?.id === gameState.players[gameState.currentPlayerIndex]?.id;
  const opponent = gameState.players.find(p => p.id !== currentPlayer?.id);
  const topCard = gameState.discardPile[0];

  const handleCardClick = (card: UnoCard) => {
    if (!isCurrentPlayerTurn) return;

    // Check if card requires color selection
    if (card.type === 'wild' || card.type === 'wild-draw-four') {
      setSelectedCard(card);
      setShowColorPicker(true);
      return;
    }

    // Play the card directly
    onPlayCard(card.id);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Top Section - Opponent */}
        <div className="mb-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {opponent?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{opponent?.name}</div>
                  <div className="text-sm text-gray-600">
                    {opponent?.hand.length} cards • Score: {opponent?.score}
                  </div>
                </div>
              </div>
              {opponent?.hasCalledUno && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  UNO!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section - Game Board */}
        <div className="mb-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Current Turn</div>
                <div className="font-semibold text-lg">
                  {gameState.players[gameState.currentPlayerIndex]?.name}
                </div>
                {isCurrentPlayerTurn && (
                  <div className="text-green-600 text-sm">Your turn!</div>
                )}
              </div>

              {/* Timer */}
              {gameState.settings.timePerTurn > 0 && (
                <div className="text-center">
                                     <Timer
                     totalTime={gameState.settings.timePerTurn}
                     timeRemaining={gameState.timeRemaining}
                     isActive={gameState.isActive}
                   />
                </div>
              )}

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Current Color</div>
                <div className={`w-8 h-8 rounded-full border-4 ${getCurrentColorIndicator()} mx-auto`} />
                <div className="text-sm font-medium capitalize">
                  {gameState.currentColor || 'Any'}
                </div>
              </div>
            </div>

            {/* Game Cards */}
            <div className="flex items-center justify-center gap-8">
              {/* Draw Pile */}
              <div className="text-center">
                <div 
                  className="w-24 h-36 bg-blue-900 rounded-lg border-2 border-gray-300 cursor-pointer hover:bg-blue-800 transition-colors flex items-center justify-center"
                  onClick={isCurrentPlayerTurn ? onDrawCard : undefined}
                >
                  <div className="text-white font-bold text-xl">UNO</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Draw ({gameState.drawPile.length})
                </div>
              </div>

              {/* Top Card */}
              <div className="text-center">
                <UnoCardComponent card={topCard} />
                <div className="text-sm text-gray-600 mt-1">
                  Last Played
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4 mt-4">
              {currentPlayer && currentPlayer.hand.length === 1 && !currentPlayer.hasCalledUno && (
                <button
                  onClick={onCallUno}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Call UNO!
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Current Player Hand */}
        <div className="mb-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentPlayer?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{currentPlayer?.name} (You)</div>
                  <div className="text-sm text-gray-600">
                    {currentPlayer?.hand.length} cards • Score: {currentPlayer?.score}
                  </div>
                </div>
              </div>
              {currentPlayer?.hasCalledUno && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  UNO!
                </div>
              )}
            </div>

            {/* Player's Hand */}
            <div className="flex flex-wrap gap-2 justify-center">
              {currentPlayer?.hand.map((card) => (
                <UnoCardComponent
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card)}
                  isPlayable={isCurrentPlayerTurn}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        {gameState.settings.enableChat && (
          <div className="mb-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <button
                onClick={() => setShowChat(!showChat)}
                className="w-full text-left font-semibold text-gray-800 hover:text-gray-600"
              >
                Chat {showChat ? '▲' : '▼'}
              </button>
              
              {showChat && (
                <div className="mt-4">
                  <div className="border rounded-lg p-3 h-32 overflow-y-auto bg-gray-50 mb-2">
                    {/* Chat messages would go here */}
                    <div className="text-sm text-gray-500 text-center">
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
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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