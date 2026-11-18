export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlight: string;
  preview: [string, string];
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'grandmaster',
    name: 'Obsidian Grandmaster',
    lightSquare: '#E8EDF9',
    darkSquare: '#475569',
    highlight: 'rgba(255, 211, 113, 0.45)',
    preview: ['#E8EDF9', '#475569'],
  },
  {
    id: 'emerald',
    name: 'Tournament Emerald',
    lightSquare: '#EEEED2',
    darkSquare: '#769656',
    highlight: 'rgba(255, 255, 0, 0.45)',
    preview: ['#EEEED2', '#769656'],
  },
  {
    id: 'wood',
    name: 'Classic Walnut',
    lightSquare: '#F0D9B5',
    darkSquare: '#B58863',
    highlight: 'rgba(205, 133, 63, 0.45)',
    preview: ['#F0D9B5', '#B58863'],
  },
  {
    id: 'slate',
    name: 'Slate & Ink',
    lightSquare: '#DEE3E6',
    darkSquare: '#8CA2AD',
    highlight: 'rgba(56, 189, 248, 0.45)',
    preview: ['#DEE3E6', '#8CA2AD'],
  },
  {
    id: 'ice',
    name: 'Ice Blue',
    lightSquare: '#E0E8F0',
    darkSquare: '#4B7399',
    highlight: 'rgba(96, 165, 250, 0.45)',
    preview: ['#E0E8F0', '#4B7399'],
  },
  {
    id: 'sand',
    name: 'Sand & Dune',
    lightSquare: '#F4E7D3',
    darkSquare: '#BFA37E',
    highlight: 'rgba(217, 119, 6, 0.45)',
    preview: ['#F4E7D3', '#BFA37E'],
  },
  {
    id: 'rosewood',
    name: 'Rosewood',
    lightSquare: '#F2DFCE',
    darkSquare: '#9E5A44',
    highlight: 'rgba(239, 68, 68, 0.45)',
    preview: ['#F2DFCE', '#9E5A44'],
  },
  {
    id: 'midnight',
    name: 'Midnight Cyber',
    lightSquare: '#374151',
    darkSquare: '#111827',
    highlight: 'rgba(16, 185, 129, 0.45)',
    preview: ['#374151', '#111827'],
  },
  {
    id: 'contrast',
    name: 'High Contrast',
    lightSquare: '#FFFFFF',
    darkSquare: '#2D3748',
    highlight: 'rgba(234, 179, 8, 0.55)',
    preview: ['#FFFFFF', '#2D3748'],
  },
];

export type PieceThemeId = 'grandmaster' | 'staunton' | 'neo' | 'alpha';

export interface PieceTheme {
  id: PieceThemeId;
  name: string;
}

export const PIECE_THEMES: PieceTheme[] = [
  { id: 'grandmaster', name: 'Grandmaster 3D' },
  { id: 'staunton', name: 'Staunton Classic' },
  { id: 'neo', name: 'Neo Modern' },
  { id: 'alpha', name: 'Alpha Serif' },
];
