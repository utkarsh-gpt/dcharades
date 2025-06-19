'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { UnoGameState, UnoPlayer, UnoGameEvent, UnoCard, DEFAULT_UNO_SETTINGS } from '@/lib/uno/types';
import UnoGameBoard from '@/components/uno/UnoGameBoard';
// import UnoLobby from '@/components/uno/UnoLobby';

export default function UnoGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<UnoGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<UnoPlayer | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const playerName = localStorage.getItem('unoPlayerName');
    
    if (!playerName) {
      router.push('/uno');
      return;
    }

    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');
      
      // Join or create the game
      const gameSettings = localStorage.getItem('unoGameSettings');
      const settings = gameSettings ? JSON.parse(gameSettings) : DEFAULT_UNO_SETTINGS;
      
      newSocket.emit('join-uno-game', {
        gameId,
        playerName,
        isHost: !localStorage.getItem('isJoiningGame'),
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
      setError('Failed to connect to game server');
    });

    newSocket.on('unoGameState', (state: UnoGameState) => {
      console.log('Game state updated:', state);
      setGameState(state);
      
      // Find current player by socket ID
      const player = state.players.find(p => p.id === newSocket.id);
      setCurrentPlayer(player || null);
    });

    newSocket.on('unoPlayerJoined', (player: UnoPlayer) => {
      console.log('Player joined:', player);
    });

    newSocket.on('unoGameStarted', () => {
      console.log('UNO Game started!');
    });

    newSocket.on('unoGameEnded', (winner: UnoPlayer) => {
      console.log('UNO Game ended, winner:', winner);
    });

    newSocket.on('error', (errorMessage: string) => {
      console.error('Game error:', errorMessage);
      setError(errorMessage);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [gameId, router]);

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

  const handleStartGame = useCallback(() => {
    if (!socket) return;
    
    socket.emit('start-uno-game', { gameId });
  }, [socket, gameId]);

  const handlePlayerReady = useCallback(() => {
    if (!socket || !currentPlayer) return;
    
    socket.emit('uno-player-ready', {
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

  // Loading states
  if (connectionStatus === 'connecting') {
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

  if (connectionStatus === 'disconnected' || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to connect to the game server'}</p>
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

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-pulse h-12 w-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading Game...</h2>
        </div>
      </div>
    );
  }

  // Render appropriate component based on game phase
  if (gameState.currentPhase === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Lobby</h2>
          <p className="text-gray-600 mb-4">Players: {gameState.players.length}/2</p>
          {currentPlayer?.isHost && gameState.players.length === 2 && (
            <button 
              onClick={handleStartGame}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Start Game
            </button>
          )}
          {!currentPlayer?.isReady && (
            <button 
              onClick={handlePlayerReady}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mr-2"
            >
              Ready
            </button>
          )}
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
      onSendChatMessage={handleSendChatMessage}
    />
  );
} 