'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Game {
  id: string;
  title: string;
  description: string;
  emoji: string;
  players: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  route: string;
  isAvailable: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const games: Game[] = [
    {
      id: 'charades',
      title: 'Charades',
      description: 'Act out movie titles while your friend guesses! Classic charades with Hollywood and Bollywood movies.',
      emoji: '🎭',
      players: '2 Players',
      duration: '10-15 min',
      difficulty: 'Medium',
      category: 'Acting',
      route: '/charades',
      isAvailable: true,
    },
    {
      id: 'blockbuster',
      title: 'Blockbuster',
      description: 'Team-based Bollywood movie trivia! Compete in head-to-head challenges and movie guessing rounds.',
      emoji: '🎬',
      players: '4-12 Players',
      duration: '20-30 min',
      difficulty: 'Medium',
      category: 'Movie Trivia',
      route: '/blockbuster',
      isAvailable: true,
    },
    {
      id: 'uno',
      title: 'UNO',
      description: '2-player UNO with unique strategic cards! Match colors and numbers, use special cards for tactical advantage.',
      emoji: '🃏',
      players: '2 Players',
      duration: '15-30 min',
      difficulty: 'Medium',
      category: 'Card Game',
      route: '/uno',
      isAvailable: true,
    },
    {
      id: 'trivia-battle',
      title: 'Trivia Battle',
      description: 'Test your knowledge across multiple categories in this competitive trivia game.',
      emoji: '🧩',
      players: '2-6 Players',
      duration: '15-20 min',
      difficulty: 'Hard',
      category: 'Knowledge',
      route: '/trivia',
      isAvailable: false,
    },
    {
      id: 'drawing-game',
      title: 'Drawing Game',
      description: 'Draw and guess! Create drawings for others to guess in this artistic challenge.',
      emoji: '🎨',
      players: '2-8 Players',
      duration: '10-15 min',
      difficulty: 'Medium',
      category: 'Creative',
      route: '/drawing',
      isAvailable: false,
    },
    {
      id: 'story-builder',
      title: 'Story Builder',
      description: 'Collaborate to create hilarious stories! Each player adds one sentence at a time.',
      emoji: '📚',
      players: '2-6 Players',
      duration: '10-20 min',
      difficulty: 'Easy',
      category: 'Creative',
      route: '/story-builder',
      isAvailable: false,
    },
    {
      id: 'riddles',
      title: 'Riddle Master',
      description: 'Challenge your logic with mind-bending riddles and puzzles.',
      emoji: '🔍',
      players: '1-4 Players',
      duration: '15-25 min',
      difficulty: 'Hard',
      category: 'Logic',
      route: '/riddles',
      isAvailable: false,
    },
  ];

  const categories = ['All', ...Array.from(new Set(games.map(game => game.category)))];

  const filteredGames = selectedCategory === 'All' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const handleGameClick = (game: Game) => {
    if (game.isAvailable) {
      router.push(game.route);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            🎮 Game Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Choose from our collection of fun multiplayer games to play with friends!
          </p>
          
          {/* Demo Link */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/movie-demo')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
            >
              🎬 View Movie Selection Demo
            </button>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-game-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game)}
              className={`game-card transition-all duration-300 transform hover:scale-105 ${
                game.isAvailable 
                  ? 'cursor-pointer hover:shadow-xl' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{game.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {game.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {game.category}
                    </p>
                  </div>
                </div>
                {!game.isAvailable && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-400">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Game Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                {game.description}
              </p>

              {/* Game Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
                  {game.players}
                </span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full dark:bg-purple-900 dark:text-purple-200">
                  {game.duration}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                  {game.difficulty}
                </span>
              </div>

              {/* Play Button */}
              <button
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                  game.isAvailable
                    ? 'btn-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                }`}
                disabled={!game.isAvailable}
              >
                {game.isAvailable ? 'Play Now' : 'Coming Soon'}
              </button>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="game-card text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            🎯 Game Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-3xl font-bold text-game-primary mb-1">
                {games.filter(g => g.isAvailable).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Available Games
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-game-secondary mb-1">
                {games.filter(g => !g.isAvailable).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Coming Soon
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-game-warning mb-1">
                {categories.length - 1}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Categories
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-game-danger mb-1">
                ∞
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Fun Hours
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            More games coming soon! Have a suggestion? Let us know!
          </p>
        </div>
      </div>
    </div>
  );
} 