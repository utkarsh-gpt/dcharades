'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/lib/shared/socket-context';
import { UnoGameStateClient, UnoPlayer, UnoGameEvent, DEFAULT_UNO_SETTINGS } from '@/lib/uno/types';
import UnoGameBoard from '@/components/uno/UnoGameBoard';

export default function UnoGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const { socket, connected } = useSocket();
  const [gameState, setGameState] = useState<UnoGameStateClient | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<UnoPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize game connection
  useEffect(() => {
    const playerName = localStorage.getItem('unoPlayerName');
    const isHost = localStorage.getItem('unoIsHost') === 'true';
    
    if (!playerName) {
      router.push('/uno');
      return;
    }

    if (socket && connected) {
      if (isHost) {
        // Create new game
        const gameSettings = localStorage.getItem('unoGameSettings');
        const settings = gameSettings ? JSON.parse(gameSettings) : DEFAULT_UNO_SETTINGS;
        
        socket.emit('create-uno-game', {
          gameId,
          playerName,
          settings,
        });
      } else {
        // Join existing game
        socket.emit('join-uno-game', {
          gameId,
          playerName,
        });
      }
    }
  }, [socket, connected, gameId, router]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleGameState = (state: UnoGameStateClient) => {
      setGameState(state);
      
      // Find current player by socket ID  
      const player = state.players.find((p: any) => p.id === socket.id);
      if (player) {
        // Create a UnoPlayer object with the hand from playerHand
        const currentPlayerData: UnoPlayer = {
          id: player.id,
          name: player.name,
          hand: state.playerHand || [],
          score: player.score,
          isReady: player.isReady,
          isHost: player.isHost,
          hasCalledUno: player.hasCalledUno,
          shieldActive: player.shieldActive,
        };
        setCurrentPlayer(currentPlayerData);
      } else {
        setCurrentPlayer(null);
      }
    };

    const handleError = (errorMessage: string) => {
      setError(errorMessage);
    };

    socket.on('unoGameState', handleGameState);
    socket.on('error', handleError);

    return () => {
      socket.off('unoGameState', handleGameState);
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleGameEvent = useCallback((event: UnoGameEvent) => {
    // Handle different game events
    switch (event.type) {
      case 'PLAYER_JOINED':
        // Show notification
        break;
      case 'PLAYER_LEFT':
        // Show notification
        break;
      case 'UNO_CALLED':
        // Play sound effect
        break;
      case 'CARD_PLAYED':
        // Play card sound
        break;
      case 'ROUND_ENDED':
        // Show round results
        break;
      case 'GAME_ENDED':
        // Show final results
        break;
      default:
        break;
    }
  }, []);

  // Socket event handlers
  const handlePlayCard = useCallback((cardId: string, chosenColor?: string, additionalData?: any) => {
    if (!socket || !currentPlayer) return;
    
    socket.emit('play-uno-card', {
      gameId,
      cardId,
      chosenColor,
      ...additionalData,
    });
  }, [socket, currentPlayer, gameId]);

  const handleDrawCard = useCallback(() => {
    if (!socket || !currentPlayer) return;
    
    socket.emit('draw-uno-card', {
      gameId,
    });
  }, [socket, currentPlayer, gameId]);

  const handleCallUno = useCallback(() => {
    if (!socket || !currentPlayer) return;
    
    socket.emit('call-uno', {
      gameId,
    });
  }, [socket, currentPlayer, gameId]);

  const handleBlockUno = useCallback(() => {
    if (!socket || !currentPlayer) return;
    
    socket.emit('block-uno', {
      gameId,
    });
  }, [socket, currentPlayer, gameId]);

  const handleSendChatMessage = useCallback((message: string) => {
    if (!socket || !currentPlayer) return;
    
    socket.emit('sendChatMessage', {
      gameId,
      playerId: currentPlayer.id,
      message,
    });
  }, [socket, currentPlayer, gameId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/uno')} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting to Game...</h2>
          <p className="text-gray-600">Game ID: {gameId}</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Game...</h2>
          <p className="text-gray-600">Game ID: {gameId}</p>
        </div>
      </div>
    );
  }

  // Render appropriate component based on game phase
  if (gameState.currentPhase === 'lobby') {
    const handleCopyGameId = () => {
      navigator.clipboard.writeText(gameId);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Lobby</h2>
          <p className="text-gray-600 mb-4">Players: {gameState.players.length}/2</p>
          
          {/* Game ID Section */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Share this code to invite a friend:</p>
            <code 
              onClick={handleCopyGameId}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg font-mono text-lg font-semibold text-gray-800 cursor-pointer transition-colors select-all"
              title="Click to copy game ID"
            >
              {gameId}
            </code>
          </div>

          <div className="text-blue-600 font-medium">
            {gameState.players.length < 2 
              ? 'Waiting for another player to join...' 
              : 'Game will start automatically!'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <UnoGameBoard
      gameState={gameState}
      currentPlayer={currentPlayer}
      onPlayCard={handlePlayCard}
      onDrawCard={handleDrawCard}
      onCallUno={handleCallUno}
      onBlockUno={handleBlockUno}
      onSendChatMessage={handleSendChatMessage}
    />
  );
} 