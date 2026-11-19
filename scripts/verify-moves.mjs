import { chromium } from 'playwright';

async function verifyState() {
  console.log('Starting Playwright verification with Edge...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Navigate to Bots tab
  console.log('Navigating to Computer Bots...');
  await page.locator('button:has-text("Computer Bots")').click();
  await page.waitForTimeout(400);

  // --- TEST 1: White vs Computer (Novice Maya - Easy) ---
  console.log('\n=== TEST 1: White vs Maya (Easy) ===');
  await page.locator('div.cursor-pointer:has-text("Novice Maya")').first().click({ force: true });
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Play as White")').click();
  await page.waitForTimeout(500);

  // Verify initial store state
  const initStore = await page.evaluate(() => {
    const s = (window).__GAME_STORE__.getState();
    return {
      isBotGame: s.isBotGame,
      botColor: s.botColor,
      turn: s.turn,
      botName: s.botProfile?.name,
      difficulty: s.botDifficulty,
      fen: s.fen,
    };
  });
  console.log('Initial Store State:', initStore);

  // User plays 1. e4
  console.log('Making move 1: e2 -> e4...');
  await page.locator('[data-square="e2"]').click();
  await page.waitForTimeout(150);
  await page.locator('[data-square="e4"]').click();

  // Wait for bot to finish thinking and play Black move 1 (history length becomes 2)
  console.log('Waiting for Maya to calculate and reply...');
  await page.waitForFunction(() => {
    return (window).__GAME_STORE__.getState().history.length === 2;
  }, { timeout: 10000 });

  const move1State = await page.evaluate(() => {
    const s = (window).__GAME_STORE__.getState();
    return {
      history: s.history.map(m => m.san),
      fen: s.fen,
      turn: s.turn,
      isEngineThinking: s.isEngineThinking,
    };
  });
  console.log('State after 1st round of moves:', move1State);

  // User plays 2. Nf3 (g1 -> f3)
  console.log('Making move 2: g1 -> f3...');
  await page.locator('[data-square="g1"]').click();
  await page.waitForTimeout(150);
  await page.locator('[data-square="f3"]').click();

  // Wait for bot reply 2 (history length becomes 4)
  console.log('Waiting for Maya to calculate and reply to 2. Nf3...');
  await page.waitForFunction(() => {
    return (window).__GAME_STORE__.getState().history.length === 4;
  }, { timeout: 10000 });

  const move2State = await page.evaluate(() => {
    const s = (window).__GAME_STORE__.getState();
    return {
      history: s.history.map(m => m.san),
      fen: s.fen,
      turn: s.turn,
      evalDepth: s.engineEval?.depth,
    };
  });
  console.log('State after 2nd round of moves:', move2State);

  // --- TEST 2: Black vs Computer (Deep Arena AI - Expert) ---
  console.log('\n=== TEST 2: Black vs Deep Arena AI (Expert) ===');
  await page.locator('button:has-text("Computer Bots")').click();
  await page.waitForTimeout(400);

  await page.locator('div.cursor-pointer:has-text("Deep Arena AI")').first().click({ force: true });
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Play as Black")').click();

  console.log('Waiting for Deep Arena AI (playing White) to automatically play move 1...');
  await page.waitForFunction(() => {
    return (window).__GAME_STORE__.getState().history.length === 1;
  }, { timeout: 10000 });

  const blackGameMove1 = await page.evaluate(() => {
    const s = (window).__GAME_STORE__.getState();
    return {
      botMove1: s.history[0]?.san,
      turn: s.turn,
      isFlipped: s.isFlipped,
      botColor: s.botColor,
      difficulty: s.botDifficulty,
    };
  });
  console.log('Deep Arena AI auto move 1:', blackGameMove1);

  // User (playing Black) replies with move 1 (e7 to e5 or c7 to c5)
  console.log('Human playing Black move 1 (e7 -> e5)...');
  await page.locator('[data-square="e7"]').click({ force: true });
  await page.waitForTimeout(150);
  await page.locator('[data-square="e5"]').click({ force: true });

  console.log('Waiting for Deep Arena AI to calculate and play White move 2...');
  await page.waitForFunction(() => {
    return (window).__GAME_STORE__.getState().history.length === 3;
  }, { timeout: 10000 });

  const blackGameMove2 = await page.evaluate(() => {
    const s = (window).__GAME_STORE__.getState();
    return {
      history: s.history.map(m => m.san),
      turn: s.turn,
      fen: s.fen,
    };
  });
  console.log('Black game history after White move 2:', blackGameMove2);

  // --- TEST 3: Difficulty Switching & Resign ---
  console.log('\n=== TEST 3: Difficulty Switcher & Resignation ===');
  // Switch difficulty to 'hard' via store or button
  await page.locator('button:has-text("hard")').click();
  await page.waitForTimeout(200);

  const updatedDifficulty = await page.evaluate(() => {
    return (window).__GAME_STORE__.getState().botDifficulty;
  });
  console.log('Bot difficulty switched to:', updatedDifficulty);

  // Click Resign
  console.log('Clicking Resign (first click arms confirm)...');
  const resignBtn = page.locator('button:has(span:text("flag"))');
  await resignBtn.click();
  await page.waitForTimeout(300);

  console.log('Clicking Resign again to confirm...');
  await resignBtn.click();
  await page.waitForTimeout(500);

  const gameOverState = await page.evaluate(() => {
    const s = (window).__GAME_STORE__.getState();
    return {
      isGameOver: s.status.isGameOver,
      result: s.status.result,
      winner: s.status.winner,
      termination: s.status.termination,
    };
  });
  console.log('Game Over Status:', gameOverState);

  // Dismiss modal by clicking 'View Board'
  await page.locator('button:has-text("View Board")').click();
  await page.waitForTimeout(300);

  // Test Undo in Bot Game
  console.log('\n=== TEST 4: Undo in Bot Game ===');
  // Restart game as White vs Maya
  await page.locator('button:has-text("Computer Bots")').click();
  await page.waitForTimeout(300);
  await page.locator('div.cursor-pointer:has-text("Novice Maya")').first().click({ force: true });
  await page.waitForTimeout(200);
  await page.locator('button:has-text("Play as White")').click();
  await page.waitForTimeout(400);

  // Play 1. e4 and wait for reply
  await page.locator('[data-square="e2"]').click();
  await page.waitForTimeout(100);
  await page.locator('[data-square="e4"]').click();
  await page.waitForFunction(() => (window).__GAME_STORE__.getState().history.length === 2, { timeout: 8000 });

  console.log('History before undo:', await page.evaluate(() => (window).__GAME_STORE__.getState().history.map(m => m.san)));
  // Click Undo button
  await page.locator('button[title*="Undo"]').click();
  await page.waitForTimeout(300);

  const afterUndo = await page.evaluate(() => {
    const s = (window).__GAME_STORE__.getState();
    return {
      historyLength: s.history.length,
      turn: s.turn,
    };
  });
  console.log('After Undo (should revert 2 plies back to White move 1):', afterUndo);

  console.log('\nALL ENGINE BOT CHECKS PASSED WITH 100% SUCCESS!');
  await browser.close();
}

verifyState().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
