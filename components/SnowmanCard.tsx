
import React from 'react';
import { SnowmanEntry } from '../types';

interface SnowmanCardProps {
  snowman: SnowmanEntry;
  onClick: () => void;
}

const SnowmanCard: React.FC<SnowmanCardProps> = ({ snowman, onClick }) => {
  // Use stickerUrl if available (formatted as data URI), otherwise fallback to imageUrl
  const displayUrl = snowman.stickerUrl 
    ? `data:image/png;base64,${snowman.stickerUrl}` 
    : snowman.imageUrl;

  const isSticker = !!snowman.stickerUrl;

  return (
    <div 
      onClick={onClick}
      className="aspect-square w-full sketch-border bg-white overflow-hidden cursor-pointer active:scale-95 transition-transform flex items-center justify-center p-1 shadow-inner"
    >
      <img 
        src={displayUrl} 
        alt={snowman.name} 
        className={`h-full w-full ${
          isSticker 
            ? 'object-contain p-1 drop-shadow-sm' 
            : 'object-cover'
        }`}
      />
    </div>
  );
};

export default SnowmanCard;
