import React from 'react';
import { PieceType, Color, Square } from '@chess-arena/chess-core';
import { PieceRenderer } from './PieceRenderer';
import { PieceThemeId } from '../../config/themes';
import { X } from 'lucide-react';

export interface PromotionDialogProps {
  square: Square;
  color: Color;
  pieceTheme: PieceThemeId;
  onSelect: (piece: PieceType) => void;
  onCancel: () => void;
}

export const PromotionDialog: React.FC<PromotionDialogProps> = ({
  color,
  pieceTheme,
  onSelect,
  onCancel,
}) => {
  const pieces: PieceType[] = ['q', 'n', 'r', 'b'];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-arena-card border border-arena-border rounded-xl shadow-2xl p-4 flex flex-col items-center gap-3 max-w-xs w-full">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-display font-semibold text-arena-text">
            Choose Promotion
          </span>
          <button
            onClick={onCancel}
            className="p-1 text-arena-muted hover:text-arena-text rounded-md hover:bg-arena-bg transition-colors"
            title="Cancel promotion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 w-full">
          {pieces.map((p) => (
            <button
              key={p}
              onClick={() => onSelect(p)}
              className="aspect-square flex items-center justify-center p-2 rounded-lg bg-arena-bg hover:bg-arena-accent-subtle border border-arena-border hover:border-arena-accent transition-all duration-150 transform hover:scale-105 active:scale-95"
              title={`Promote to ${p.toUpperCase()}`}
            >
              <PieceRenderer type={p} color={color} set={pieceTheme} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

