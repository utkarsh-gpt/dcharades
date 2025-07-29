'use client';

import { UnoCard as UnoCardType } from '@/lib/uno/types';
import { getCardDisplayInfo } from '@/lib/uno/deck';

interface UnoCardProps {
  card: UnoCardType;
  onClick?: () => void;
  isPlayable?: boolean;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
  style?: React.CSSProperties;
}

export default function UnoCard({ 
  card, 
  onClick, 
  isPlayable = false, 
  size = 'medium',
  isSelected = false,
  style
}: UnoCardProps) {
  const cardInfo = getCardDisplayInfo(card);
  
  const sizeClasses = {
    small: 'w-16 h-24 text-xs',
    medium: 'w-20 h-32 text-sm',
    large: 'w-24 h-36 text-base'
  };

  const getCardBackground = () => {
    if (card.color) {
      switch (card.color) {
        case 'red': return 'bg-red-500';
        case 'blue': return 'bg-blue-500';
        case 'green': return 'bg-green-500';
        case 'yellow': return 'bg-yellow-500';
        default: return 'bg-gray-500';
      }
    }
    // Shield and peek-pick cards should be black
    if (card.type === 'unique' && (card.uniqueType === 'shield' || card.uniqueType === 'peek-pick')) {
      return 'bg-gray-800';
    }
    return card.type === 'unique' ? 'bg-purple-500' : 'bg-gray-800';
  };

  const getCardTextColor = () => {
    if (card.color === 'yellow') return 'text-gray-800';
    return 'text-white';
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${getCardBackground()}
        ${getCardTextColor()}
        rounded-lg border-2 border-white shadow-lg
        flex flex-col items-center justify-center
        font-bold relative overflow-hidden
        transition-all duration-300 ease-in-out
        ${onClick ? 'cursor-pointer hover:shadow-xl' : ''}
        ${isSelected ? 'scale-110 shadow-2xl ring-4 ring-yellow-400 z-20' : ''}
        ${onClick && !isSelected ? 'hover:scale-105' : ''}
      `}
      onClick={onClick && isPlayable ? onClick : undefined}
      style={style}
    >
      {/* Card Content */}
      <div className="text-center p-1">
        {/* Card Symbol/Value */}
        <div className="text-2xl mb-1">
          {cardInfo.symbol}
        </div>
        
        {/* Card Type for action cards */}
        {card.type !== 'number' && (
          <div className="text-xs leading-tight">
            {card.type === 'unique' ? card.uniqueType?.toUpperCase() : card.type.toUpperCase()}
          </div>
        )}
      </div>

      {/* Corner indicators */}
      <div className="absolute top-1 left-1 text-xs">
        {cardInfo.symbol}
      </div>
      <div className="absolute bottom-1 right-1 text-xs rotate-180">
        {cardInfo.symbol}
      </div>

      {/* Special effects for unique cards */}
      {card.type === 'unique' && (
        <div className={`absolute inset-0 rounded-lg ${
          (card.uniqueType === 'shield' || card.uniqueType === 'peek-pick')
            ? 'bg-gradient-to-r from-gray-600/20 to-gray-800/20' 
            : 'bg-gradient-to-r from-purple-600/20 to-pink-600/20'
        }`}></div>
      )}


    </div>
  );
} 