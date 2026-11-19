import React, { useEffect, useState, useRef } from 'react';
import { Color, formatClockTime } from '@chess-arena/chess-core';
import { useGameStore } from './gameStore';
import { Board } from '../board/Board';
import { EvalBar } from '../board/EvalBar';
import { PlayerCard } from './PlayerCard';
import { OpeningCard } from './OpeningCard';
import { MoveList } from './MoveList';
import { GameControls } from './GameControls';
import { ResultModal } from './ResultModal';
import { Sidebar, NavTab } from '../navigation/Sidebar';
import { Header } from '../navigation/Header';
import { ComputerBotsView, BotProfile } from '../bots/ComputerBotsView';
import { PuzzlesView } from '../puzzles/PuzzlesView';
import { AnalysisView } from '../analysis/AnalysisView';
import { TournamentsView } from '../tournaments/TournamentsView';
import { LeaderboardsView } from '../leaderboard/LeaderboardsView';
import { ProfileView } from '../profile/ProfileView';
import { DashboardView, CadencePreset } from '../dashboard/DashboardView';

export interface OpponentInfo {
  name: string;
  title: string;
  rating: number;
  isBot: boolean;
  avatarUrl?: string;
  latencyMs: number;
}

export const GameScreen: React.FC = () => {
  const {
    turn,
    status,
    capturedPieces,
    materialBalance,
    pieceTheme,
    isDark,
    isFlipped,
    flipBoard,
    history,
    isBotGame,
    botColor,
    botProfile,
    isEngineThinking,
    engineEval,
    startBotGame,
  } = useGameStore();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active opponent details (can be human or AI bot)
  const [opponent, setOpponent] = useState<OpponentInfo>({
    name: 'Alexander Morozov',
    title: 'GM',
    rating: 2518,
    isBot: false,
    latencyMs: 24,
  });

  // Clocks in milliseconds (5 min = 300,000 ms by default)
  const [whiteTimeMs, setWhiteTimeMs] = useState(300000);
  const [blackTimeMs, setBlackTimeMs] = useState(300000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Apply dark theme class to root element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  // Keyboard shortcut: F to flip board
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'f' || e.key === 'F') flipBoard();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipBoard]);

  // Active match clock countdown ticker
  useEffect(() => {
    if (status.isGameOver || history.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (turn === 'w') {
        setWhiteTimeMs((prev) => Math.max(0, prev - 100));
      } else {
        setBlackTimeMs((prev) => Math.max(0, prev - 100));
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [turn, status.isGameOver, history.length]);

  // Handle launching a live match from Dashboard with selected cadence
  const handleStartMatch = (preset: CadencePreset) => {
    const timeMs = Math.min(preset.baseMinutes * 60 * 1000, 3600000); // cap display to max 60m
    setWhiteTimeMs(timeMs);
    setBlackTimeMs(timeMs);
    setCurrentTab('play');
  };

  // Handle challenging a bot from Computer Bots view
  const handleChallengeBot = (bot: BotProfile, userColor: 'w' | 'b') => {
    setOpponent({
      name: bot.name,
      title: bot.title.split(' ')[0] || 'AI',
      rating: bot.elo,
      isBot: true,
      latencyMs: 1,
    });
    setWhiteTimeMs(300000);
    setBlackTimeMs(300000);
    startBotGame(bot, userColor);
    setCurrentTab('play');
  };

  // Board orientations: top player vs bottom player
  const topColor: Color = isFlipped ? 'w' : 'b';
  const bottomColor: Color = isFlipped ? 'b' : 'w';

  const isTopBot = isBotGame && botColor === topColor;
  const isBottomBot = isBotGame && botColor === bottomColor;

  const topName = isTopBot ? botProfile?.name || opponent.name : 'You (A. Kasparov)';
  const topTitle = isTopBot ? (botProfile?.title.split(' ')[0] || 'AI') : 'GM';
  const topRating = isTopBot ? (botProfile?.elo || opponent.rating) : 2482;

  const bottomName = isBottomBot ? botProfile?.name || opponent.name : 'You (A. Kasparov)';
  const bottomTitle = isBottomBot ? (botProfile?.title.split(' ')[0] || 'AI') : 'GM';
  const bottomRating = isBottomBot ? (botProfile?.elo || opponent.rating) : 2482;

  const topCaptured = capturedPieces[topColor];
  const bottomCaptured = capturedPieces[bottomColor];

  const getMaterialDiff = (c: Color) =>
    c === 'w' ? Math.max(0, materialBalance.diff) : Math.max(0, -materialBalance.diff);
  const topMaterialDiff = getMaterialDiff(topColor);
  const bottomMaterialDiff = getMaterialDiff(bottomColor);

  const topTimeFormatted = formatClockTime(topColor === 'w' ? whiteTimeMs : blackTimeMs);
  const bottomTimeFormatted = formatClockTime(bottomColor === 'w' ? whiteTimeMs : blackTimeMs);

  const evalScore = isBotGame && engineEval ? engineEval.scoreCp : materialBalance.diff;

  return (
    <div className="flex min-h-screen bg-surface-deep text-on-surface antialiased">
      {/* Left Grandmaster Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Stage Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Global Match Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNewGame={() => {
            setWhiteTimeMs(300000);
            setBlackTimeMs(300000);
            setCurrentTab('play');
          }}
        />

        {/* View Router based on currentTab */}
        <main className="relative pt-20 px-space-md lg:px-space-lg py-space-md flex-1 w-full bg-surface-deep overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView onStartMatch={handleStartMatch} onNavigateTab={setCurrentTab} />
          )}

          {currentTab === 'play' && (
            <div className="flex flex-col lg:flex-row gap-space-lg items-start max-w-[1720px] mx-auto w-full">
              {/* Left & Center Playing Arena Stage */}
              <div className="flex-1 w-full flex flex-col items-center">
                {/* Top Opponent Player Card */}
                <div className="w-full max-w-[760px] mb-space-sm">
                  <PlayerCard
                    color={topColor}
                    name={topName}
                    title={topTitle}
                    rating={topRating}
                    isTurn={turn === topColor}
                    isThinking={isTopBot && isEngineThinking}
                    isBot={isTopBot}
                    capturedPieces={topCaptured}
                    materialDiff={topMaterialDiff}
                    pieceTheme={pieceTheme}
                    timeRemaining={topTimeFormatted}
                    latencyMs={isTopBot ? 1 : opponent.latencyMs}
                  />
                </div>

                {/* Main Playing Field: Eval Bar + 8x8 Board Stage */}
                <div className="w-full max-w-[760px] flex gap-2 items-stretch select-none">
                  {/* Vertical Stockfish Evaluation Bar */}
                  <EvalBar score={evalScore} isFlipped={isFlipped} />

                  {/* 8x8 Chessboard Stage Container */}
                  <div className="relative flex-1 aspect-square bg-surface-deep p-1.5 rounded-xl shadow-2xl overflow-hidden border border-border-subtle">
                    <Board />
                  </div>
                </div>

                {/* Bottom User Player Card */}
                <div className="w-full max-w-[760px] mt-space-sm">
                  <PlayerCard
                    color={bottomColor}
                    name={bottomName}
                    title={bottomTitle}
                    rating={bottomRating}
                    isTurn={turn === bottomColor}
                    isThinking={isBottomBot && isEngineThinking}
                    isBot={isBottomBot}
                    capturedPieces={bottomCaptured}
                    materialDiff={bottomMaterialDiff}
                    pieceTheme={pieceTheme}
                    timeRemaining={bottomTimeFormatted}
                    latencyMs={isBottomBot ? 1 : 18}
                  />
                </div>
              </div>

              {/* Right Match Telemetry & Control Panel */}
              <div className="w-full lg:w-[410px] flex flex-col gap-space-sm flex-shrink-0">
                {/* Tournament & ECO Opening Book Info */}
                <OpeningCard />

                {/* Move Ledger / Notation Table */}
                <div className="h-[340px]">
                  <MoveList />
                </div>

                {/* In-Game Action Toolbar */}
                <GameControls />
              </div>
            </div>
          )}

          {currentTab === 'bots' && <ComputerBotsView onChallengeBot={handleChallengeBot} />}
          {currentTab === 'puzzles' && <PuzzlesView />}
          {currentTab === 'analyze' && <AnalysisView />}
          {currentTab === 'tournaments' && <TournamentsView />}
          {currentTab === 'leaderboards' && <LeaderboardsView />}
          {currentTab === 'profile' && <ProfileView />}
        </main>
      </div>

      {/* Decisive Victory / Game Over Modal */}
      <ResultModal />
    </div>
  );
};
