import { describe, it, expect } from 'vitest';
import { parsePgnHeaders, formatPgnHeaders, parsePgnBody, splitMultiGamePgn } from '../src/pgn';
import { GameEngine } from '../src/GameEngine';

describe('PGN Parser & Serializer', () => {
  it('parses and formats standard PGN headers', () => {
    const pgn = `[Event "FIDE World Championship"]
[Site "London ENG"]
[Date "2018.11.09"]
[Round "1"]
[White "Caruana, Fabiano"]
[Black "Carlsen, Magnus"]
[Result "1/2-1/2"]

1. e4 c5 2. Nf3 Nc6 1/2-1/2`;

    const headers = parsePgnHeaders(pgn);
    expect(headers.Event).toBe('FIDE World Championship');
    expect(headers.White).toBe('Caruana, Fabiano');
    expect(headers.Black).toBe('Carlsen, Magnus');
    expect(headers.Result).toBe('1/2-1/2');

    const formatted = formatPgnHeaders(headers);
    expect(formatted).toContain('[Event "FIDE World Championship"]');
    expect(formatted).toContain('[White "Caruana, Fabiano"]');
  });

  it('parses comments, clock [%clk], and eval [%eval] annotations', () => {
    const pgnBody = `1. e4 { [%clk 0:05:00] [%eval +0.25] Best by test } 1... e5 { [%clk 0:04:58] } 2. Nf3 $1 Nc6 *`;
    const moves = parsePgnBody(pgnBody);

    expect(moves.length).toBe(4);
    expect(moves[0]!.san).toBe('e4');
    expect(moves[0]!.clock).toBe('0:05:00');
    expect(moves[0]!.eval).toBe('+0.25');
    expect(moves[0]!.comment).toContain('Best by test');

    expect(moves[2]!.san).toBe('Nf3');
    expect(moves[2]!.nag).toBe('$1');
  });

  it('splits multi-game PGN text into individual games', () => {
    const multiPgn = `[Event "Game 1"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 1-0

[Event "Game 2"]
[White "Charlie"]
[Black "Dave"]
[Result "0-1"]

1. d4 d5 0-1`;

    const games = splitMultiGamePgn(multiPgn);
    expect(games.length).toBe(2);
    expect(games[0]).toContain('[Event "Game 1"]');
    expect(games[1]).toContain('[Event "Game 2"]');
  });

  it('loads and exports PGN round-trip on GameEngine', () => {
    const engine = new GameEngine();
    const pgnIn = `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 *`;
    const loaded = engine.loadPgn(pgnIn);
    expect(loaded).toBe(true);

    const exported = engine.toPgn();
    expect(exported).toContain('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6');
  });
});

