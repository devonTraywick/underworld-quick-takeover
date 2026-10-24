import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function dismissOnboarding(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog", { name: "Learn the takeover" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Skip tutorial" }).click();
  await expect(dialog).toBeHidden();
}

async function enterName(page: Page, nickname: string): Promise<void> {
  await page.getByRole("textbox", { name: "Your syndicate name" }).fill(nickname);
}

async function waitForPhaseReady(page: Page): Promise<void> {
  await expect(page.locator(".phase-announcement")).toBeHidden({ timeout: 5_000 });
}

async function acceptBriefings(...pages: Page[]): Promise<void> {
  for (const page of pages) {
    const briefing = page.getByRole("dialog", { name: "Your orders have arrived." });
    await expect(briefing).toBeVisible();
    await expect(briefing.locator(".mission-dossiers article")).toHaveCount(3);
  }
  await Promise.all(pages.map((page) => page.getByRole("button", { name: "Accept orders" }).click()));
  await Promise.all(pages.map((page) => expect(page.getByRole("dialog", { name: "Your orders have arrived." })).toBeHidden({ timeout: 8_000 })));
}

async function createRoom(context: BrowserContext, nickname: string): Promise<{ page: Page; roomCode: string }> {
  const page = await context.newPage();
  await page.goto("/");
  await dismissOnboarding(page);
  await enterName(page, nickname);
  await page.getByRole("button", { name: "Claim a table" }).click();
  await expect(page.getByRole("heading", { name: "Gather the families" })).toBeVisible();
  const roomCode = (await page.locator(".room-code-card strong").innerText()).trim();
  expect(roomCode).toMatch(/^[A-Z2-9]{6}$/);
  return { page, roomCode };
}

async function joinRoom(context: BrowserContext, roomCode: string, nickname: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`/?room=${roomCode}`);
  await dismissOnboarding(page);
  await enterName(page, nickname);
  await page.getByRole("button", { name: "Enter the room" }).click();
  await expect(page.getByRole("heading", { name: "Gather the families" })).toBeVisible();
  return page;
}

test("the guided introduction is complete and skippable", async ({ page }) => {
  await page.goto("/");
  const offer = page.getByRole("dialog", { name: "Learn the takeover" });
  await expect(offer).toContainText("without touching a live match");
  await offer.getByRole("button", { name: "Start tutorial" }).click();
  const dialog = page.locator(".tutorial-card");
  await expect(dialog).toContainText("Family briefing · 1/10");
  await page.screenshot({ path: "test-results/tutorial-desktop.png", fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/tutorial-mobile.png", fullPage: false });
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("dialog", { name: "Build your power" })).toContainText("2/10");
  await page.getByRole("button", { name: "Try it · Add 2 stakes" }).click();
  await expect(page.getByText("Done — the city reacts")).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("dialog", { name: "Take control of the city" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog", { name: "Build your power" })).toBeVisible();
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByRole("region", { name: "Enter a game room" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("sound requires explicit activation and exposes honest controls", async ({ page }) => {
  await page.goto("/");
  await dismissOnboarding(page);
  const controls = page.getByRole("region", { name: "Sound controls" });
  await expect(controls.getByRole("button", { name: "Enable sound" })).toBeVisible();
  await controls.getByRole("button", { name: "Enable sound" }).click();
  await expect(controls.getByText("Sound enabled. Did you hear the confirmation?")).toBeVisible();
  await expect(controls.getByRole("button", { name: "Test Sound" })).toBeVisible();
  await controls.getByRole("button", { name: "Test Sound" }).click();
  await expect(controls.getByText("Test sound scheduled. Did you hear it?")).toBeVisible();
  await controls.getByRole("button", { name: "Sound · On" }).click();
  await expect(controls.getByText("Sound muted.")).toBeVisible();
  await expect.poll(() => page.evaluate(() => ({ enabled: localStorage.getItem("underworld.audio.enabled"), muted: localStorage.getItem("underworld.audio.muted") }))).toEqual({ enabled: "true", muted: "true" });
});

test("release layouts avoid console failures, shifts, overflow, and undersized primary controls", async ({ browser }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(() => {
      (window as typeof window & { __releaseCLS?: number }).__releaseCLS = 0;
      new PerformanceObserver((list) => { for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) (window as typeof window & { __releaseCLS: number }).__releaseCLS += entry.value; }).observe({ type: "layout-shift", buffered: true });
    });
    const page = await context.newPage(); const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/"); await dismissOnboarding(page);
    await page.getByRole("textbox", { name: "Your syndicate name" }).focus();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(await page.evaluate(() => (window as typeof window & { __releaseCLS?: number }).__releaseCLS ?? 0)).toBeLessThan(.1);
    const enable = await page.getByRole("button", { name: "Enable sound" }).boundingBox();
    expect(enable?.height).toBeGreaterThanOrEqual(44);
    if (viewport.width <= 480) expect(await page.getByRole("textbox", { name: "Your syndicate name" }).evaluate((node) => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(16);
    const bytes = await page.evaluate(() => performance.getEntriesByType("resource").reduce((sum, entry) => sum + ((entry as PerformanceResourceTiming).encodedBodySize || 0), 0));
    expect(bytes).toBeLessThan(4_000_000);
    expect(errors).toEqual([]);
    await context.close();
  }
});

test("invite copy confirms only after success, resets, and offers a failure fallback", async ({ context }) => {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => undefined } });
  });
  const { page } = await createRoom(context, "Copy Test Family");
  const copy = page.getByRole("button", { name: "Copy invite link" });
  await copy.click(); await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await expect(page.getByText("Copy invite link copied.")).toHaveText("Copy invite link copied.");
  await expect(page.getByRole("button", { name: "Copy invite link" })).toBeVisible({ timeout: 5_000 });
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } }));
  await copy.click(); await expect(page.getByText("Couldn’t access your clipboard.")).toBeVisible();
  await expect(page.locator(".copy-fallback input")).toHaveValue(/room=/);
});

test("unified social hub preserves unread activity, opens notifications, and completes a deal", async ({ browser }) => {
  test.setTimeout(120_000);
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const { page: host, roomCode } = await createRoom(hostContext, "Velvet Host Family");
  const guest = await joinRoom(guestContext, roomCode, "Crimson Guest House");
  await host.getByRole("button", { name: /Guided Match/ }).click();
  await host.getByRole("button", { name: "Begin takeover" }).click();
  await acceptBriefings(host, guest);
  await waitForPhaseReady(host); await waitForPhaseReady(guest);

  await guest.getByRole("button", { name: "Make Deal" }).click();
  await expect(guest.getByRole("complementary", { name: "Social hub" })).toBeVisible();
  const rivalPortrait = host.getByRole("button", { name: "Open private line with Crimson Guest House" });
  await rivalPortrait.focus(); await host.keyboard.press("Enter");
  await expect(host.getByRole("navigation", { name: "Social sections" }).getByRole("button", { name: "Private" })).toHaveClass(/active/);
  await host.getByRole("textbox", { name: "Private message" }).fill("A private offer is waiting.");
  await host.getByRole("button", { name: "Send message", exact: true }).click();
  await host.getByRole("textbox", { name: "Private message" }).fill("Two crews. Midnight.");
  await host.getByRole("button", { name: "Send message", exact: true }).click();
  const workspace = guest.getByRole("navigation", { name: "Social sections" });
  await expect(workspace.getByRole("button", { name: /Private/ }).locator("b")).toHaveText("2");
  await expect(guest.getByText("NEW PRIVATE MESSAGE")).toBeVisible();
  await expect(guest.getByText("+1 more waiting")).toBeVisible();
  await guest.reload();
  await expect(guest.getByText("NEW PRIVATE MESSAGE")).toBeVisible();
  await guest.getByRole("button", { name: "Open", exact: true }).click();
  await expect(guest.getByText("A private offer is waiting.")).toBeVisible();
  await expect(guest.getByText("Two crews. Midnight.")).toBeVisible();
  await expect(guest.getByRole("navigation", { name: "Social sections" }).getByRole("button", { name: /Private/ }).locator("b")).toHaveCount(0);

  await guest.getByRole("navigation", { name: "Social sections" }).getByRole("button", { name: "Deals" }).click();
  const deals = guest.getByRole("region", { name: "Deals workspace" });
  await deals.getByRole("button", { name: "Create Deal" }).click();
  await deals.getByRole("button", { name: "Continue" }).click();
  await deals.getByRole("button", { name: /Non-Aggression/ }).click();
  await deals.getByRole("button", { name: "Continue" }).click();
  await deals.getByRole("button", { name: "Continue" }).click();
  await deals.getByRole("button", { name: "Send proposal" }).click();
  await expect(deals).toContainText("Proposal sent to Velvet Host Family");
  await expect(host.getByText("DEAL PROPOSED")).toBeVisible();
  await host.getByRole("button", { name: "Review" }).click();
  const hostDeals = host.getByRole("region", { name: "Deals workspace" });
  await hostDeals.getByRole("button", { name: "Accept proposal" }).click();
  await expect(hostDeals).toContainText("agreement is now active");
  await deals.getByRole("tab", { name: "Active" }).click();
  await expect(deals).toContainText("Active agreement");
  expect(await guest.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight)).toBe(true);
  const createSize = await deals.getByRole("button", { name: "Create Deal" }).boundingBox();
  expect(createSize?.height).toBeGreaterThanOrEqual(40);

  await hostContext.close(); await guestContext.close();
});

test("two isolated browser contexts play a contested simultaneous round and reconnect", async ({ browser }) => {
  test.setTimeout(process.env.PRODUCTION_URL ? 900_000 : 600_000);
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const { page: host, roomCode } = await createRoom(hostContext, "Velvet Host");
  const guest = await joinRoom(guestContext, roomCode, "Crimson Guest");

  await expect(host.getByRole("heading", { name: "2 of 8 syndicates" })).toBeVisible();
  await host.getByRole("button", { name: /Guided Match/ }).click();
  await host.getByRole("button", { name: "Begin takeover" }).click();
  await acceptBriefings(host, guest);
  await expect(host.getByRole("heading", { name: "Make your promises" })).toBeVisible();
  await expect(host.locator(".phase-announcement")).toContainText(/Back-room negotiations/i);
  await expect(guest.locator(".phase-guide")).toContainText("NEGOTIATION — Make a deal");
  await expect(host.locator(".game-page")).toHaveClass(/phase-negotiation/);
  await expect(host.locator(".phase-guide")).toContainText("NEGOTIATION — Make a deal");
  await host.screenshot({ path: "test-results/phase-negotiation-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-negotiation-mobile.png", fullPage: false });
  await expect(host.locator(".objective-panel .objective-item")).toHaveCount(3);
  await guest.getByRole("button", { name: "Missions" }).click();
  await expect(guest.locator(".objective-panel .objective-item")).toHaveCount(3);
  await guest.getByRole("button", { name: "Close objectives" }).click();
  await waitForPhaseReady(host); await waitForPhaseReady(guest);

  expect(await guest.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(guest.locator(".map-shell")).toBeVisible();
  await expect(guest.locator(".district-inspector")).toBeVisible();
  await expect(guest.locator(".district")).toHaveCount(3);
  expect(await guest.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight)).toBe(true);

  await guest.emulateMedia({ reducedMotion: "reduce" });
  expect(await guest.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  expect(await guest.locator(".city-art").evaluate((node) => parseFloat(getComputedStyle(node).animationDuration))).toBeLessThan(0.001);

  await guest.getByRole("button", { name: "Make Deal" }).click();
  await expect(guest.getByRole("navigation", { name: "Social sections" })).toBeVisible();
  await expect(guest.getByRole("button", { name: "Deals" })).toHaveClass(/active/);
  await host.getByRole("navigation", { name: "City actions" }).getByRole("button", { name: /Make Deal/ }).click();
  await host.getByRole("navigation", { name: "Social sections" }).getByRole("button", { name: "Private" }).click();
  await host.getByRole("textbox", { name: "Private message" }).fill("The docks are quiet tonight.");
  await host.getByRole("button", { name: "Send message", exact: true }).click();
  await host.getByRole("button", { name: "Close social hub" }).click();
  await expect(guest.getByRole("navigation", { name: "Social sections" }).getByRole("button", { name: /Private/ }).locator("b")).toHaveText("1");
  await guest.getByRole("button", { name: "Open", exact: true }).click();
  await expect(guest.getByText("The docks are quiet tonight.")).toBeVisible();
  await expect(guest.getByRole("navigation", { name: "Social sections" }).getByRole("button", { name: /Private/ }).locator("b")).toHaveCount(0);

  await guest.getByRole("navigation", { name: "Social sections" }).getByRole("button", { name: "Deals" }).click();
  const guestDeals = guest.getByRole("region", { name: "Deals workspace" });
  await expect(guestDeals).toBeVisible();
  await expect(guest.getByRole("navigation", { name: "Social sections" })).toBeVisible();
  await guestDeals.getByRole("button", { name: "Cancel" }).click();
  await guestDeals.getByRole("button", { name: "Create Deal" }).click();
  await expect(guestDeals).toContainText("Proposal step 1 of 4");
  await guest.screenshot({ path: "test-results/negotiation-deals-mobile.png", fullPage: false });
  await guestDeals.getByRole("button", { name: "Continue" }).click();
  await guestDeals.getByRole("button", { name: /Non-Aggression/ }).click();
  await guestDeals.getByRole("button", { name: "Continue" }).click();
  await expect(guestDeals).toContainText("Mutual non-aggression");
  await guestDeals.getByRole("button", { name: "Continue" }).click();
  await guestDeals.getByRole("button", { name: "Send proposal" }).click();
  await expect(guestDeals).toContainText("Proposal sent to Velvet Host");
  const createDealSize = await guestDeals.getByRole("button", { name: "Create Deal" }).boundingBox();
  expect(createDealSize?.height).toBeGreaterThanOrEqual(40);

  const hostDeals = host.getByRole("region", { name: "Deals workspace" });
  await expect(host.getByText("DEAL PROPOSED")).toBeVisible();
  await host.getByRole("button", { name: "Review" }).click();
  await expect(hostDeals).toContainText("New proposal received");
  await hostDeals.getByRole("button", { name: "Accept proposal" }).click();
  await guestDeals.getByRole("tab", { name: "Active" }).click();
  await expect(guestDeals).toContainText("Active agreement");
  await host.screenshot({ path: "test-results/negotiation-deals-desktop.png", fullPage: false });

  await hostDeals.getByRole("button", { name: "Create Deal" }).click();
  await hostDeals.getByRole("button", { name: "Continue" }).click();
  await hostDeals.getByRole("button", { name: /Non-Aggression/ }).click();
  await hostDeals.getByRole("button", { name: "Continue" }).click();
  await hostDeals.getByRole("button", { name: "Continue" }).click();
  await hostDeals.getByRole("button", { name: "Send proposal" }).click();
  await expect(guestDeals).toContainText("New proposal received");
  await guestDeals.getByRole("button", { name: "Reject proposal" }).click();
  await expect(guestDeals).toContainText("Declined");
  await expect(host.getByText("DEAL REJECTED")).toBeVisible();
  await host.getByRole("button", { name: "Dismiss notification" }).click();
  await host.getByRole("button", { name: "Close social hub" }).click();
  await guest.getByRole("button", { name: "Close social hub" }).click();
  await expect(guestDeals).toBeHidden();

  await guest.getByRole("button", { name: "Lock in & continue" }).click();
  await expect(guest.getByRole("button", { name: "Not ready yet" })).toBeVisible();
  await guest.reload();
  await expect(guest.locator(".phase-guide")).toContainText("NEGOTIATION — Make a deal");
  await expect(guest.getByRole("button", { name: "Not ready yet" })).toBeVisible();
  await guest.getByRole("button", { name: "Missions" }).click();
  await expect(guest.locator(".objective-panel .objective-item")).toHaveCount(3);
  await guest.getByRole("button", { name: "Close objectives" }).click();
  await guest.getByRole("button", { name: "Not ready yet" }).click();
  await expect(guest.getByRole("button", { name: "Lock in & continue" })).toBeVisible();

  await Promise.all([
    host.getByRole("button", { name: "Lock in & continue" }).click(),
    guest.getByRole("button", { name: "Lock in & continue" }).click(),
  ]);
  await expect(host.locator(".phase-card").getByRole("heading", { name: "Choose your leverage" })).toBeVisible();
  await expect(guest.locator(".phase-card").getByRole("heading", { name: "Choose your leverage" })).toBeVisible();
  await expect(host.locator(".game-page")).toHaveClass(/phase-draft/);
  await expect(host.locator(".submission-note")).toContainText("players ready");
  await waitForPhaseReady(host); await waitForPhaseReady(guest);
  await guest.getByRole("button", { name: "The Wire" }).click();
  await expect(guest.getByRole("complementary", { name: "Social hub" })).toBeVisible();
  await guest.getByRole("button", { name: "Close social hub" }).click();
  await host.locator(".action-card").first().getByText("More details").click();
  await expect(host.locator(".action-card").first()).toContainText("Target");
  await expect(host.locator(".action-card").first()).toContainText("Expected benefit");
  await host.screenshot({ path: "test-results/phase-draft-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-draft-mobile.png", fullPage: false });

  await host.locator(".action-card").first().click();
  await guest.locator(".action-card").first().click();
  await Promise.all([host.getByRole("button", { name: "Lock in" }).click(), guest.getByRole("button", { name: "Lock in" }).click()]);
  await expect(host.getByRole("button", { name: "Deploy operation" })).toBeVisible();
  await expect(guest.getByRole("button", { name: "Deploy operation" })).toBeVisible();
  await expect(host.locator(".game-page")).toHaveClass(/phase-operations/);
  await waitForPhaseReady(host); await waitForPhaseReady(guest);
  await host.locator(".district").first().click();
  await guest.locator(".district").first().click();
  await host.screenshot({ path: "test-results/phase-operations-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-operations-mobile.png", fullPage: false });

  await Promise.all([
    host.getByRole("button", { name: "Deploy operation" }).click(),
    guest.getByRole("button", { name: "Deploy operation" }).click(),
  ]);
  await expect(host.locator(".game-page")).toHaveClass(/phase-cinematic-reveal/);
  await waitForPhaseReady(host); await waitForPhaseReady(guest);
  await expect(host.locator(".reveal-director")).toBeVisible();
  await expect(guest.locator(".reveal-director")).toBeVisible();
  await host.getByRole("button", { name: "Skip Animation" }).click(); await guest.getByRole("button", { name: "Skip Animation" }).click();
  await expect(host.locator(".reveal-transcript p").first()).toBeVisible();
  await host.screenshot({ path: "test-results/phase-reveal-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-reveal-mobile.png", fullPage: false });

  await expect(host.getByText("Round 1 report")).toBeVisible({ timeout: 20_000 });
  await expect(host.locator(".game-page")).toHaveClass(/phase-round-results/);
  await host.screenshot({ path: "test-results/phase-results-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-results-mobile.png", fullPage: false });
  await host.getByRole("button", { name: "Replay Round" }).click();
  await expect(host.locator(".replay-backdrop .reveal-director")).toBeVisible();
  await host.getByRole("button", { name: "Close Replay" }).click();

  for (let round = 2; round <= 5; round += 1) {
    await Promise.all([host.getByRole("button", { name: /Continue/ }).click(), guest.getByRole("button", { name: /Continue/ }).click()]);
    await expect(host.locator(".phase-guide")).toContainText("NEGOTIATION", { timeout: process.env.PRODUCTION_URL ? 35_000 : 15_000 });
    await waitForPhaseReady(host); await waitForPhaseReady(guest);
    await Promise.all([host.getByRole("button", { name: "Lock in & continue" }).click(), guest.getByRole("button", { name: "Lock in & continue" }).click()]);
    await expect(host.locator(".phase-guide")).toContainText("DRAFT");
    await waitForPhaseReady(host); await waitForPhaseReady(guest);
    await host.locator(".action-card").first().click(); await guest.locator(".action-card").first().click();
    await Promise.all([host.getByRole("button", { name: "Lock in" }).click(), guest.getByRole("button", { name: "Lock in" }).click()]);
    await expect(host.locator(".phase-guide")).toContainText("OPERATIONS");
    await waitForPhaseReady(host); await waitForPhaseReady(guest);
    await host.locator(".district").first().click(); await guest.locator(".district").first().click();
    await Promise.all([host.getByRole("button", { name: "Deploy operation" }).click(), guest.getByRole("button", { name: "Deploy operation" }).click()]);
    await expect(host.locator(".phase-guide")).toContainText("REVEAL");
    await waitForPhaseReady(host); await waitForPhaseReady(guest);
    await host.getByRole("button", { name: "Skip Animation" }).click();
    await guest.getByRole("button", { name: "Skip Animation" }).click();
    await expect(host.getByText(`Round ${round} report`)).toBeVisible({ timeout: 20_000 });
  }
  await Promise.all([host.getByRole("button", { name: /Continue/ }).click(), guest.getByRole("button", { name: /Continue/ }).click()]);
  await expect(host.locator(".phase-guide")).toContainText("FINALE", { timeout: 15_000 });
  await expect(guest.locator(".finale-card")).toBeVisible();

  expect(await host.locator("body").evaluate((body) => body.textContent?.includes("Crimson Guest") ?? false)).toBe(true);
  await Promise.all([host.getByRole("button", { name: "Demand a rematch" }).click(), guest.getByRole("button", { name: "Demand a rematch" }).click()]);
  await expect(host.getByRole("dialog", { name: "Your orders have arrived." })).toBeVisible({ timeout: 10_000 });
  await expect(guest.getByRole("dialog", { name: "Your orders have arrived." })).toBeVisible();
  await hostContext.close();
  await guestContext.close();
});
