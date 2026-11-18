export interface OpeningInfo {
  eco: string;
  name: string;
  moves: string[]; // SAN moves
}

export const OPENINGS_DATABASE: OpeningInfo[] = [
  { eco: 'A00', name: 'Polish Opening', moves: ['b4'] },
  { eco: 'A04', name: 'Réti Opening', moves: ['Nf3'] },
  { eco: 'A10', name: 'English Opening', moves: ['c4'] },
  { eco: 'A40', name: "Queen's Pawn Opening", moves: ['d4'] },
  { eco: 'A45', name: 'Trompowsky Attack', moves: ['d4', 'Nf6', 'Bg5'] },
  { eco: 'A51', name: 'Budapest Gambit', moves: ['d4', 'Nf6', 'c4', 'e5'] },
  { eco: 'A80', name: 'Dutch Defense', moves: ['d4', 'f5'] },
  { eco: 'B01', name: 'Scandinavian Defense', moves: ['e4', 'd5'] },
  { eco: 'B02', name: "Alekhine's Defense", moves: ['e4', 'Nf6'] },
  { eco: 'B07', name: 'Pirc Defense', moves: ['e4', 'd6', 'd4', 'Nf6'] },
  { eco: 'B10', name: 'Caro-Kann Defense', moves: ['e4', 'c6'] },
  { eco: 'B20', name: 'Sicilian Defense', moves: ['e4', 'c5'] },
  { eco: 'B21', name: 'Sicilian Defense: Grand Prix Attack', moves: ['e4', 'c5', 'f4'] },
  { eco: 'B22', name: 'Sicilian Defense: Alapin Variation', moves: ['e4', 'c5', 'c3'] },
  { eco: 'B23', name: 'Sicilian Defense: Closed', moves: ['e4', 'c5', 'Nc3'] },
  { eco: 'B33', name: 'Sicilian Defense: Sveshnikov', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5'] },
  { eco: 'B50', name: 'Sicilian Defense: Classical', moves: ['e4', 'c5', 'Nf3', 'd6'] },
  { eco: 'B90', name: 'Sicilian Defense: Najdorf Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'] },
  { eco: 'C00', name: 'French Defense', moves: ['e4', 'e6'] },
  { eco: 'C10', name: 'French Defense: Paulsen', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3'] },
  { eco: 'C20', name: "King's Pawn Game", moves: ['e4', 'e5'] },
  { eco: 'C30', name: "King's Gambit", moves: ['e4', 'e5', 'f4'] },
  { eco: 'C42', name: 'Petrov Defense', moves: ['e4', 'e5', 'Nf3', 'Nf6'] },
  { eco: 'C44', name: 'Scotch Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'] },
  { eco: 'C45', name: 'Scotch Game: Classical', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'] },
  { eco: 'C46', name: 'Three Knights Opening', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3'] },
  { eco: 'C47', name: 'Four Knights Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6'] },
  { eco: 'C50', name: 'Italian Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'] },
  { eco: 'C51', name: 'Evans Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'] },
  { eco: 'C53', name: 'Italian Game: Giuoco Piano', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3'] },
  { eco: 'C55', name: 'Two Knights Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'] },
  { eco: 'C60', name: 'Ruy Lopez', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
  { eco: 'C65', name: 'Ruy Lopez: Berlin Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'] },
  { eco: 'C70', name: 'Ruy Lopez: Morphy Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'] },
  { eco: 'D00', name: "Queen's Pawn: Mason Attack", moves: ['d4', 'd5'] },
  { eco: 'D02', name: 'London System', moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'] },
  { eco: 'D06', name: "Queen's Gambit", moves: ['d4', 'd5', 'c4'] },
  { eco: 'D20', name: "Queen's Gambit Accepted", moves: ['d4', 'd5', 'c4', 'dxc4'] },
  { eco: 'D30', name: "Queen's Gambit Declined", moves: ['d4', 'd5', 'c4', 'e6'] },
  { eco: 'D80', name: 'Grünfeld Defense', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5'] },
  { eco: 'E00', name: 'Catalan Opening', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3'] },
  { eco: 'E20', name: 'Nimzo-Indian Defense', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'] },
  { eco: 'E60', name: "King's Indian Defense", moves: ['d4', 'Nf6', 'c4', 'g6'] },
];

/**
 * Identifies the closest opening from a list of SAN moves.
 */
export function identifyOpening(sanMoves: string[]): OpeningInfo | undefined {
  if (!sanMoves || sanMoves.length === 0) return undefined;

  let bestMatch: OpeningInfo | undefined;
  let maxMatched = 0;

  for (const opening of OPENINGS_DATABASE) {
    if (opening.moves.length <= sanMoves.length) {
      const matches = opening.moves.every((move, idx) => move === sanMoves[idx]);
      if (matches && opening.moves.length > maxMatched) {
        maxMatched = opening.moves.length;
        bestMatch = opening;
      }
    }
  }

  return bestMatch;
}

