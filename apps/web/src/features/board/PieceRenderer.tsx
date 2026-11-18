import React from 'react';
import { PieceType, Color } from '@chess-arena/chess-core';
import { PieceThemeId } from '../../config/themes';

export interface PieceProps {
  type: PieceType;
  color: Color;
  set?: PieceThemeId;
  className?: string;
}

export const PieceRenderer: React.FC<PieceProps> = ({
  type,
  color,
  set = 'grandmaster',
  className = 'w-full h-full select-none pointer-events-none drop-shadow-md',
}) => {
  const isWhite = color === 'w';
  const isGrandmaster = set === 'grandmaster';
  const isNeo = set === 'neo';
  const isAlpha = set === 'alpha';

  // Fill and stroke color decisions
  const bodyFill = isGrandmaster
    ? isWhite
      ? 'url(#ca-w-body)'
      : 'url(#ca-b-body)'
    : isNeo
    ? isWhite
      ? '#F8FAFC'
      : '#0F172A'
    : isAlpha
    ? isWhite
      ? '#FFFDF9'
      : '#1A1816'
    : isWhite
    ? '#FAF9F6'
    : '#1E232A';

  const strokeColor = isGrandmaster
    ? isWhite
      ? '#262E3B'
      : '#0D1117'
    : isNeo
    ? isWhite
      ? '#0F172A'
      : '#38BDF8'
    : isAlpha
    ? isWhite
      ? '#262422'
      : '#FAF8F5'
    : isWhite
    ? '#1E293B'
    : '#E2E8F0';

  const accentColor = isGrandmaster
    ? 'url(#ca-gold)'
    : isWhite
    ? strokeColor
    : '#F1F5F9';

  const innerLineColor = isGrandmaster
    ? isWhite
      ? 'rgba(38, 46, 59, 0.45)'
      : 'rgba(148, 163, 184, 0.65)'
    : isWhite
    ? 'rgba(30, 41, 59, 0.5)'
    : 'rgba(226, 232, 240, 0.7)';

  const strokeWidth = isNeo ? 2.0 : isAlpha ? 1.4 : 1.6;

  // Shared SVG Defs for rich gradients & ambient occlusion
  const renderDefs = () => (
    <defs>
      {/* White Piece Pearl Gradient */}
      <linearGradient id="ca-w-body" x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="45%" stopColor="#F6F3ED" />
        <stop offset="85%" stopColor="#E5DFD2" />
        <stop offset="100%" stopColor="#D4CCC0" />
      </linearGradient>

      {/* Black Piece Obsidian Satin Gradient */}
      <linearGradient id="ca-b-body" x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor="#384050" />
        <stop offset="40%" stopColor="#252B36" />
        <stop offset="80%" stopColor="#151A22" />
        <stop offset="100%" stopColor="#0B0E14" />
      </linearGradient>

      {/* Grandmaster Imperial Gold Luster Gradient */}
      <linearGradient id="ca-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF4BD" />
        <stop offset="35%" stopColor="#FFD371" />
        <stop offset="70%" stopColor="#D99E2E" />
        <stop offset="100%" stopColor="#9E6E16" />
      </linearGradient>

      {/* Ambient Specular Highlight */}
      <linearGradient id="ca-w-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
      </linearGradient>
    </defs>
  );

  switch (type) {
    // ==========================================
    // PAWN
    // ==========================================
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          {renderDefs()}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Base Pedestal */}
            <rect
              x="9.5"
              y="38"
              width="26"
              height="3.5"
              rx="1.5"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Base Plinth Molding */}
            <path
              d="M 12 34.5 C 12 34 33 34 33 34.5 L 34.5 38 H 10.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {isGrandmaster && (
              <line
                x1="11"
                y1="38"
                x2="34"
                y2="38"
                stroke={accentColor}
                strokeWidth="0.8"
              />
            )}

            {/* Bell Waist Body */}
            <path
              d="M 19 20 C 18 25.5 15.5 29.5 13.5 34.5 H 31.5 C 29.5 29.5 27 25.5 26 20 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Collar Ring */}
            <ellipse
              cx="22.5"
              cy="19.5"
              rx="5.5"
              ry="1.8"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Spherical Head */}
            <circle
              cx="22.5"
              cy="12.5"
              r="5.5"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Specular Highlight Sheen */}
            {isWhite && (
              <ellipse
                cx="20.5"
                cy="10.5"
                rx="2"
                ry="1.2"
                fill="#FFFFFF"
                opacity="0.75"
                transform="rotate(-25 20.5 10.5)"
              />
            )}
            {!isWhite && (
              <ellipse
                cx="20.5"
                cy="10.5"
                rx="1.8"
                ry="1"
                fill="#94A3B8"
                opacity="0.35"
                transform="rotate(-25 20.5 10.5)"
              />
            )}
          </g>
        </svg>
      );

    // ==========================================
    // KNIGHT
    // ==========================================
    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          {renderDefs()}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Base Pedestal */}
            <rect
              x="9.5"
              y="37.5"
              width="26"
              height="4"
              rx="1.5"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Plinth */}
            <path
              d="M 11 34.5 H 34 L 34.5 37.5 H 10.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Sculpted Stallion Silhouette */}
            <path
              d="M 22.5 8.5
                 C 23.5 6.5, 25 5.5, 26 6
                 C 25.5 8, 24.5 9.8, 24 10.8
                 C 27.5 11.5, 33 14, 34.5 18
                 C 33 20, 34 22, 35 24
                 C 34 26, 35 29, 35.5 34.5
                 H 11
                 C 11 32, 13.5 28.5, 14.5 25.5
                 C 13 24.5, 11 23.5, 10 22
                 C 9 20, 9.8 18.5, 12 18
                 C 14 17.5, 17 16.5, 19.5 13.5
                 C 20.5 11.5, 21.5 9.5, 22.5 8.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Left Ear Contour */}
            <path
              d="M 20.5 8.2 C 21 6.5, 22.2 5.8, 23.2 6.2 C 22.8 7.8, 21.8 9.5, 21.2 10.5"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Flowing Mane Ridge Ridges */}
            <path
              d="M 24.5 13.5 C 27.5 14.5, 30.5 17, 31 19.5"
              fill="none"
              stroke={innerLineColor}
              strokeWidth="1.2"
            />
            <path
              d="M 27 20 C 30 21.5, 32 24.5, 32.5 27"
              fill="none"
              stroke={innerLineColor}
              strokeWidth="1.2"
            />
            <path
              d="M 29.5 27 C 31.5 28.5, 32.5 31, 33 33.5"
              fill="none"
              stroke={innerLineColor}
              strokeWidth="1.2"
            />

            {/* Muzzle / Nostril */}
            <path
              d="M 11.5 19.5 C 12 20.5, 13 20.2, 13.5 19.8"
              fill="none"
              stroke={innerLineColor}
              strokeWidth="1.2"
            />

            {/* Almond Eye with Iris */}
            <path
              d="M 15 14.5 C 16 13.2, 18 13.2, 19 14.5 C 18 15.8, 16 15.8, 15 14.5 Z"
              fill={isWhite ? '#FFFFFF' : '#1E2430'}
              stroke={strokeColor}
              strokeWidth="1"
            />
            <circle
              cx="17"
              cy="14.5"
              r="1.2"
              fill={isGrandmaster ? accentColor : isWhite ? strokeColor : '#94A3B8'}
            />

            {/* Jawline Definition */}
            <path
              d="M 17.5 18 C 17 21, 14.5 23.5, 12 24"
              fill="none"
              stroke={innerLineColor}
              strokeWidth="1.2"
            />
          </g>
        </svg>
      );

    // ==========================================
    // BISHOP
    // ==========================================
    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          {renderDefs()}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Base Pedestal */}
            <rect
              x="9.5"
              y="38"
              width="26"
              height="3.5"
              rx="1.5"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Plinth */}
            <path
              d="M 11.5 34.5 H 33.5 L 34.5 38 H 10.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Flared Pillar Body */}
            <path
              d="M 17 25.5 C 16.5 29, 14.5 32, 13 34.5 H 32 C 30.5 32, 28.5 29, 28 25.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Double Collar Annulus */}
            <path
              d="M 15 25.5 H 30 L 29 23 H 16 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <ellipse
              cx="22.5"
              cy="23"
              rx="6.5"
              ry="1.8"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Mitre (Headwear) */}
            <path
              d="M 22.5 8.5
                 C 16 11, 14 16.5, 14.5 22
                 C 16.5 23.5, 28.5 23.5, 30.5 22
                 C 31 16.5, 29 11, 22.5 8.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Characteristic Mitre Cleft Cut */}
            <path
              d="M 22.5 11.5 L 18 18.5"
              fill="none"
              stroke={innerLineColor}
              strokeWidth={strokeWidth + 0.4}
            />

            {/* Cross Inset on Mitre */}
            <line
              x1="22.5"
              y1="14"
              x2="22.5"
              y2="19"
              stroke={innerLineColor}
              strokeWidth="1.2"
            />
            <line
              x1="20"
              y1="16.5"
              x2="25"
              y2="16.5"
              stroke={innerLineColor}
              strokeWidth="1.2"
            />

            {/* Top Finial Jewel Ball */}
            <circle
              cx="22.5"
              cy="6.8"
              r="2.3"
              fill={accentColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        </svg>
      );

    // ==========================================
    // ROOK
    // ==========================================
    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          {renderDefs()}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Heavy Base Pedestal */}
            <rect
              x="9.5"
              y="37.5"
              width="26"
              height="4"
              rx="1.5"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Lower Plinth */}
            <rect
              x="11.5"
              y="34"
              width="22"
              height="3.5"
              rx="0.8"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Fortress Stone Shaft Body */}
            <path
              d="M 13.5 21 H 31.5 L 32.5 34 H 12.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Subtle Masonry Lines */}
            <line
              x1="13"
              y1="27.5"
              x2="32"
              y2="27.5"
              stroke={innerLineColor}
              strokeWidth="1"
            />
            <line
              x1="22.5"
              y1="21"
              x2="22.5"
              y2="27.5"
              stroke={innerLineColor}
              strokeWidth="1"
            />
            <line
              x1="18"
              y1="27.5"
              x2="18"
              y2="34"
              stroke={innerLineColor}
              strokeWidth="1"
            />
            <line
              x1="27"
              y1="27.5"
              x2="27"
              y2="34"
              stroke={innerLineColor}
              strokeWidth="1"
            />

            {/* Cornice Parapet Band */}
            <rect
              x="10.5"
              y="18"
              width="24"
              height="3"
              rx="0.6"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {isGrandmaster && (
              <rect
                x="11.5"
                y="19"
                width="22"
                height="1"
                fill={accentColor}
              />
            )}

            {/* Crenellated Battlements (4 merlons, 3 embrasures) */}
            <path
              d="M 11.5 11 H 15.2 V 15.2 H 19.5 V 11 H 25.5 V 15.2 H 29.8 V 11 H 33.5 V 18 H 11.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        </svg>
      );

    // ==========================================
    // QUEEN
    // ==========================================
    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          {renderDefs()}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Broad Pedestal Base */}
            <rect
              x="9.5"
              y="38"
              width="26"
              height="3.5"
              rx="1.5"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Base Plinth */}
            <path
              d="M 11.5 34.5 H 33.5 L 34.5 38 H 10.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Hourglass Torso */}
            <path
              d="M 15 28 C 15 31, 13.5 32, 13.5 34.5 H 31.5 C 31.5 32, 30 31, 30 28 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Royal Tiara Headband */}
            <path
              d="M 11 25.5 C 11 24.5, 34 24.5, 34 25.5 L 32.5 28 H 12.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {isGrandmaster && (
              <line
                x1="13"
                y1="26.8"
                x2="32"
                y2="26.8"
                stroke={accentColor}
                strokeWidth="1.2"
              />
            )}

            {/* 5-Peak Radiating Coronet Crown */}
            <path
              d="M 7.5 15.5
                 L 11 25
                 L 14.5 11.5
                 L 18.5 25
                 L 22.5 9.5
                 L 26.5 25
                 L 30.5 11.5
                 L 34 25
                 L 37.5 15.5
                 C 36 21, 33 25, 22.5 25
                 C 12 25, 9 21, 7.5 15.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* 5 Coronet Jewel Pearls */}
            <circle
              cx="7.5"
              cy="15"
              r="2.1"
              fill={accentColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <circle
              cx="14.5"
              cy="11"
              r="2.1"
              fill={accentColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <circle
              cx="22.5"
              cy="9"
              r="2.4"
              fill={accentColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <circle
              cx="30.5"
              cy="11"
              r="2.1"
              fill={accentColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <circle
              cx="37.5"
              cy="15"
              r="2.1"
              fill={accentColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        </svg>
      );

    // ==========================================
    // KING
    // ==========================================
    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          {renderDefs()}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Broad Triple-Tier Pedestal Base */}
            <rect
              x="9"
              y="37.5"
              width="27"
              height="4"
              rx="1.5"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <path
              d="M 11.5 34 H 33.5 L 34.5 37.5 H 10.5 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Sovereign Column Torso */}
            <path
              d="M 14.5 24 H 30.5 L 32 34 H 13 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Regal Mantle Collar Band */}
            <rect
              x="13.5"
              y="21"
              width="18"
              height="3"
              rx="0.8"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {isGrandmaster && (
              <rect
                x="15"
                y="22"
                width="15"
                height="1"
                fill={accentColor}
              />
            )}

            {/* Arched Imperial Crown Dome */}
            <path
              d="M 14.5 18
                 C 14.5 11.5, 22.5 10.5, 22.5 10.5
                 C 22.5 10.5, 30.5 11.5, 30.5 18
                 C 27.5 19, 17.5 19, 14.5 18 Z"
              fill={bodyFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />

            {/* Ermine Crown Arch Ribs */}
            <path
              d="M 18 18 C 18.5 13.5, 22.5 11, 22.5 11"
              fill="none"
              stroke={innerLineColor}
              strokeWidth="1.3"
            />
            <path
              d="M 27 18 C 26.5 13.5, 22.5 11, 22.5 11"
              fill="none"
              stroke={innerLineColor}
              strokeWidth="1.3"
            />
            <line
              x1="22.5"
              y1="11"
              x2="22.5"
              y2="18"
              stroke={innerLineColor}
              strokeWidth="1.3"
            />

            {/* Imperial Latin Cross */}
            {/* Center Finial Ball */}
            <circle
              cx="22.5"
              cy="7.5"
              r="1.2"
              fill={accentColor}
            />
            {/* Vertical Bar */}
            <path
              d="M 21.3 4.5 H 23.7 V 10.5 H 21.3 Z"
              fill={accentColor}
              stroke={strokeColor}
              strokeWidth="1"
            />
            {/* Horizontal Crossbar */}
            <path
              d="M 19 6.5 H 26 V 8.5 H 19 Z"
              fill={accentColor}
              stroke={strokeColor}
              strokeWidth="1"
            />
          </g>
        </svg>
      );
  }
};
