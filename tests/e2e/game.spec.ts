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

test("mobile negotiation workspace supports private chat and a complete deal response", async ({ browser }) => {
  test.setTimeout(120_000);
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const { page: host, roomCode } = await createRoom(hostContext, "Velvet Host Family");
  const guest = await joinRoom(guestContext, roomCode, "Crimson Guest House");
  await host.getByRole("button", { name: /Guided Match/ }).click();
  await host.getByRole("button", { name: "Begin takeover" }).click();
  await waitForPhaseReady(host); await waitForPhaseReady(guest);

  await guest.getByRole("button", { name: "Chat" }).click();
  await host.getByRole("tab", { name: "Private" }).click();
  await host.getByRole("textbox", { name: "Private message" }).fill("A private offer is waiting.");
  await host.getByRole("button", { name: "Send message" }).click();
  const workspace = guest.getByRole("navigation", { name: "Negotiation workspace" });
  await expect(workspace.getByRole("button", { name: /Private/ }).locator("b")).toHaveText("1");
  await workspace.getByRole("button", { name: /Private/ }).click();
  await expect(guest.getByText("A private offer is waiting.")).toBeVisible();

  await workspace.getByRole("button", { name: "Deals" }).click();
  const deals = guest.getByRole("region", { name: "Deals workspace" });
  await deals.getByRole("button", { name: "Create Deal" }).click();
  await deals.getByRole("button", { name: "Continue" }).click();
  await deals.getByRole("button", { name: /Non-Aggression/ }).click();
  await deals.getByRole("button", { name: "Continue" }).click();
  await deals.getByRole("button", { name: "Continue" }).click();
  await deals.getByRole("button", { name: "Send proposal" }).click();
  await expect(deals).toContainText("Proposal sent to Velvet Host Family");
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
  test.setTimeout(process.env.PRODUCTION_URL ? 900_000 : 300_000);
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const { page: host, roomCode } = await createRoom(hostContext, "Velvet Host");
  const guest = await joinRoom(guestContext, roomCode, "Crimson Guest");

  await expect(host.getByRole("heading", { name: "2 of 8 syndicates" })).toBeVisible();
  await host.getByRole("button", { name: "Begin takeover" }).click();
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
  expect(await guest.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight)).toBe(true);

  await guest.getByRole("button", { name: "Chat" }).click();
  await expect(guest.getByRole("navigation", { name: "Negotiation workspace" })).toBeVisible();
  await expect(guest.getByRole("button", { name: "Public" })).toHaveClass(/active/);
  await host.getByRole("tab", { name: "Private" }).click();
  await host.getByRole("textbox", { name: "Private message" }).fill("The docks are quiet tonight.");
  await host.getByRole("button", { name: "Send message" }).click();
  await expect(guest.getByRole("navigation", { name: "Negotiation workspace" }).getByRole("button", { name: /Private/ }).locator("b")).toHaveText("1");
  await guest.getByRole("navigation", { name: "Negotiation workspace" }).getByRole("button", { name: /Private/ }).click();
  await expect(guest.getByText("The docks are quiet tonight.")).toBeVisible();
  await expect(guest.getByRole("navigation", { name: "Negotiation workspace" }).getByRole("button", { name: /Private/ }).locator("b")).toHaveCount(0);

  await guest.getByRole("navigation", { name: "Negotiation workspace" }).getByRole("button", { name: "Deals" }).click();
  const guestDeals = guest.getByRole("region", { name: "Deals workspace" });
  await expect(guestDeals).toBeVisible();
  await expect(guest.getByRole("navigation", { name: "Negotiation workspace" })).toBeVisible();
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
  await guest.getByRole("button", { name: "Close wire" }).click();
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
  await hostContext.close();
  await guestContext.close();
});
