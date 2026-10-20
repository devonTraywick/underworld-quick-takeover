import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function dismissOnboarding(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog", { name: "Choose your name" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Skip briefing" }).click();
  await expect(dialog).toBeHidden();
}

async function enterName(page: Page, nickname: string): Promise<void> {
  await page.getByRole("textbox", { name: "Your syndicate name" }).fill(nickname);
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
  const dialog = page.getByRole("dialog", { name: "Choose your name" });
  await expect(dialog).toContainText("The family briefing · 1/5");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("dialog", { name: "Take the city" })).toContainText("2/5");
  await page.getByRole("button", { name: "Skip briefing" }).click();
  await expect(page.getByRole("region", { name: "Enter a game room" })).toBeVisible();
});

test("two isolated browser contexts play a contested simultaneous round and reconnect", async ({ browser }) => {
  test.setTimeout(60_000);
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const { page: host, roomCode } = await createRoom(hostContext, "Velvet Host");
  const guest = await joinRoom(guestContext, roomCode, "Crimson Guest");

  await expect(host.getByRole("heading", { name: "2 of 8 syndicates" })).toBeVisible();
  await host.getByRole("button", { name: "Begin takeover" }).click();
  await expect(host.getByRole("heading", { name: "Make your promises" })).toBeVisible();
  await expect(guest.locator(".phase-guide")).toContainText("NEGOTIATION — Make your deals");
  await expect(host.locator(".game-page")).toHaveClass(/phase-negotiation/);
  await expect(host.locator(".phase-guide")).toContainText("NEGOTIATION — Make your deals");
  await host.screenshot({ path: "test-results/phase-negotiation-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-negotiation-mobile.png", fullPage: false });
  await expect(host.locator(".objective-panel .objective-item")).toHaveCount(3);
  await guest.getByRole("button", { name: "Missions" }).click();
  await expect(guest.locator(".objective-panel .objective-item")).toHaveCount(3);
  await guest.getByRole("button", { name: "Close objectives" }).click();

  expect(await guest.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(guest.locator(".map-shell")).toBeVisible();
  expect(await guest.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight)).toBe(true);

  await expect(guest.getByRole("tab", { name: "Public" })).toHaveAttribute("aria-selected", "true");
  await host.getByRole("tab", { name: "Private" }).click();
  await host.getByRole("textbox", { name: "Private message" }).fill("The docks are quiet tonight.");
  await host.getByRole("button", { name: "Send message" }).click();
  await expect(guest.getByRole("tab", { name: /Private/ }).locator(".attention-count")).toHaveText("1");
  await guest.getByRole("tab", { name: "Private" }).click();
  await expect(guest.getByText("The docks are quiet tonight.")).toBeVisible();
  await expect(guest.getByRole("tab", { name: /Private/ }).locator(".attention-count")).toHaveCount(0);

  await guest.reload();
  await expect(guest.locator(".phase-guide")).toContainText("NEGOTIATION — Make your deals");
  await guest.getByRole("button", { name: "Missions" }).click();
  await expect(guest.locator(".objective-panel .objective-item")).toHaveCount(3);
  await guest.getByRole("button", { name: "Close objectives" }).click();

  await Promise.all([
    host.getByRole("button", { name: "Lock in & continue" }).click(),
    guest.getByRole("button", { name: "Lock in & continue" }).click(),
  ]);
  await expect(host.getByRole("heading", { name: "Choose your leverage" })).toBeVisible();
  await expect(guest.getByRole("heading", { name: "Choose your leverage" })).toBeVisible();
  await expect(host.locator(".game-page")).toHaveClass(/phase-draft/);
  await host.screenshot({ path: "test-results/phase-draft-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-draft-mobile.png", fullPage: false });

  await host.locator(".action-card").first().click();
  await guest.locator(".action-card").first().click();
  await Promise.all([host.getByRole("button", { name: "Lock in" }).click(), guest.getByRole("button", { name: "Lock in" }).click()]);
  await expect(host.getByRole("button", { name: "Deploy operation" })).toBeVisible();
  await expect(guest.getByRole("button", { name: "Deploy operation" })).toBeVisible();
  await expect(host.locator(".game-page")).toHaveClass(/phase-operations/);
  await host.locator(".district").first().click();
  await guest.locator(".district").first().click();
  await host.screenshot({ path: "test-results/phase-operations-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-operations-mobile.png", fullPage: false });

  await Promise.all([
    host.getByRole("button", { name: "Deploy operation" }).click(),
    guest.getByRole("button", { name: "Deploy operation" }).click(),
  ]);
  await expect(host.getByRole("heading", { name: "Operations revealed" })).toBeVisible();
  await expect(guest.getByRole("heading", { name: "Operations revealed" })).toBeVisible();
  await expect(host.locator(".reveal-list > div")).toHaveCount(2);
  await expect(guest.locator(".reveal-list > div")).toHaveCount(2);
  await expect(host.locator(".game-page")).toHaveClass(/phase-cinematic-reveal/);
  await host.screenshot({ path: "test-results/phase-reveal-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-reveal-mobile.png", fullPage: false });

  await expect(host.getByText("Round 1 report")).toBeVisible({ timeout: 20_000 });
  await expect(host.locator(".game-page")).toHaveClass(/phase-round-results/);
  await host.screenshot({ path: "test-results/phase-results-desktop.png", fullPage: false });
  await guest.screenshot({ path: "test-results/phase-results-mobile.png", fullPage: false });

  expect(await host.locator("body").evaluate((body) => body.textContent?.includes("Crimson Guest") ?? false)).toBe(true);
  await hostContext.close();
  await guestContext.close();
});
