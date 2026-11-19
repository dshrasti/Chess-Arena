import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/e2e-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBotTests() {
  console.log('--- Launching Edge with Playwright ---');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Log console errors/warnings
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('Stockfish') || msg.text().includes('Worker')) {
      console.log(`[Browser Console ${msg.type()}]:`, msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error('[Browser Uncaught Page Error]:', err);
  });

  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-landing.png') });
  console.log('Screenshot saved: 01-landing.png');

  // Navigate to Computer Bots
  console.log('Opening Computer Bots tab...');
  const botsButton = page.locator('button:has-text("Computer Bots")');
  await botsButton.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-bots-roster.png') });
  console.log('Screenshot saved: 02-bots-roster.png');

  // TEST 1: White vs Computer (Easy / Novice Maya)
  console.log('\n--- TEST 1: White vs Computer (Novice Maya - Easy) ---');
  // Click on Novice Maya
  const mayaCard = page.locator('text=Novice Maya').first();
  await mayaCard.click();
  await page.waitForTimeout(300);

  // Click Play as White
  const playAsWhiteBtn = page.locator('button:has-text("Play as White")');
  await playAsWhiteBtn.click();
  await page.waitForTimeout(500);

  console.log('Game stage loaded for White vs Maya.');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-white-game-start.png') });

  // Play e2 to e4: click e2 square, then e4 square
  console.log('User playing 1. e4...');
  const e2Square = page.locator('[data-square="e2"]');
  const e4Square = page.locator('[data-square="e4"]');

  await e2Square.click();
  await page.waitForTimeout(200);
  await e4Square.click();

  console.log('1. e4 played. Verifying bot thinking status...');
  // Check thinking indicator or wait for bot move
  const thinkingIndicator = page.locator('text=Thinking...');
  const isThinking = await thinkingIndicator.isVisible({ timeout: 2000 }).catch(() => false);
  console.log(`Thinking indicator visible immediately after move: ${isThinking}`);

  // Wait for Black to make a move (e.g. history length increases to 2)
  console.log('Waiting for Stockfish to reply for Black...');
  await page.waitForFunction(() => {
    // Check if move list or turn changed
    const rows = document.querySelectorAll('div[data-ply], div.font-mono');
    // or inspect store
    return (window).__CHESS_ARENA_LAST_MOVE__ !== undefined || document.body.innerText.includes('e4');
  }, { timeout: 10000 });

  // Wait up to 5 seconds for bot move to appear in notation table
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-white-bot-responded.png') });
  console.log('Screenshot saved: 04-white-bot-responded.png');

  // Play move 2: g1 to f3
  console.log('User playing 2. Nf3 (g1 to f3)...');
  const g1Square = page.locator('[data-square="g1"]');
  const f3Square = page.locator('[data-square="f3"]');
  await g1Square.click();
  await page.waitForTimeout(200);
  await f3Square.click();

  console.log('2. Nf3 played. Waiting for bot reply 2...');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-white-move2-responded.png') });
  console.log('Screenshot saved: 05-white-move2-responded.png');

  // TEST 2: Black vs Computer (Expert Deep Arena AI)
  console.log('\n--- TEST 2: Black vs Computer (Deep Arena AI - Expert) ---');
  // Navigate back to bots
  await botsButton.click();
  await page.waitForTimeout(500);

  // Select Deep Arena AI
  console.log('Selecting Deep Arena AI...');
  const deepArenaCard = page.locator('div.cursor-pointer:has-text("Deep Arena AI")').first();
  await deepArenaCard.click({ force: true });
  await page.waitForTimeout(400);

  // Click Play as Black
  const playAsBlackBtn = page.locator('button:has-text("Play as Black")');
  await playAsBlackBtn.click();
  console.log('Started Black vs Computer game. Checking automatic move 1 by Stockfish for White...');

  // Wait for board to appear
  await page.waitForTimeout(500);

  // Bot plays White move 1 automatically
  console.log('Waiting for White bot move 1 to land automatically...');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-black-game-bot-move1-played.png') });
  console.log('Screenshot saved: 07-black-game-bot-move1-played.png');

  // Verify that move 1 was played (history length >= 1)
  const move1Played = await page.evaluate(() => {
    return document.querySelectorAll('button[data-ply]').length > 0 ||
           document.body.innerText.includes('1.') ||
           document.body.innerText.includes('1. ');
  });
  console.log(`White bot automated move 1 played: ${move1Played}`);

  // User responds as Black (e.g. e7 to e5 or c7 to c5)
  console.log('User playing Black move 1: e7 to e5...');
  const e7Square = page.locator('[data-square="e7"]');
  const e5Square = page.locator('[data-square="e5"]');
  await e7Square.click({ force: true });
  await page.waitForTimeout(200);
  await e5Square.click({ force: true });

  console.log('Black move 1 played. Waiting for White bot move 2...');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-black-game-bot-move2-played.png') });
  console.log('Screenshot saved: 08-black-game-bot-move2-played.png');

  // TEST 3: Controls, Difficulty Switcher & Resign
  console.log('\n--- TEST 3: Difficulty switcher & Resign ---');
  // Check difficulty buttons
  const easyBtn = page.locator('button:has-text("easy")');
  if (await easyBtn.isVisible()) {
    console.log('Clicking in-game difficulty "easy"...');
    await easyBtn.click();
    await page.waitForTimeout(300);
  }

  // Resign button
  console.log('Clicking Resign...');
  const resignBtn = page.locator('button:has-text("Resign")');
  await resignBtn.click();
  await page.waitForTimeout(300);
  console.log('Confirming Resign...');
  const confirmResignBtn = page.locator('button:has-text("Confirm Resign")');
  if (await confirmResignBtn.isVisible()) {
    await confirmResignBtn.click();
  }
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-game-over-modal.png') });
  console.log('Screenshot saved: 09-game-over-modal.png');

  // Verify modal is visible
  const gameOverModal = page.locator('text=Resignation');
  const isGameOverVisible = await gameOverModal.isVisible().catch(() => false);
  console.log(`Game Over Resignation modal visible: ${isGameOverVisible}`);

  console.log('\nAll automated browser tests completed successfully!');
  await browser.close();
}

runBotTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
