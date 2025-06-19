'use client';

import { useState } from 'react';
import { GameSettings as GameSettingsType, TIME_LIMIT_OPTIONS, ROUND_OPTIONS } from '@/lib/shared/types';

interface GameSettingsProps {
  settings: GameSettingsType;
  onUpdateSettings: (settings: GameSettingsType) => void;
  onClose: () => void;
}

export default function GameSettings({
  settings,
  onUpdateSettings,
  onClose,
}: GameSettingsProps) {
  const [localSettings, setLocalSettings] = useState<GameSettingsType>(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleCategoryChange = (category: 'hollywood' | 'bollywood', checked: boolean) => {
    const categories = checked
      ? [...localSettings.movieCategories, category]
      : localSettings.movieCategories.filter(c => c !== category);
    
    // Ensure at least one category is selected
    if (categories.length === 0) return;
    
    setLocalSettings({
      ...localSettings,
      movieCategories: categories,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Game Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Number of Rounds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Rounds
            </label>
            <select
              value={localSettings.rounds}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                rounds: parseInt(e.target.value),
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-game-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {ROUND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Limit per Round
            </label>
            <select
              value={localSettings.timeLimit}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                timeLimit: parseInt(e.target.value),
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-game-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {TIME_LIMIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Movie Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Movie Categories
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.movieCategories.includes('hollywood')}
                  onChange={(e) => handleCategoryChange('hollywood', e.target.checked)}
                  className="mr-3 rounded border-gray-300 text-game-primary focus:ring-game-primary"
                />
                <span className="text-gray-700 dark:text-gray-300">Hollywood Movies</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.movieCategories.includes('bollywood')}
                  onChange={(e) => handleCategoryChange('bollywood', e.target.checked)}
                  className="mr-3 rounded border-gray-300 text-game-primary focus:ring-game-primary"
                />
                <span className="text-gray-700 dark:text-gray-300">Bollywood Movies</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              At least one category must be selected
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
} 