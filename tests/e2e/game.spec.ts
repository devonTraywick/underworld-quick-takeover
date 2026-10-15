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
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const { page: host, roomCode } = await createRoom(hostContext, "Velvet Host");
  const guest = await joinRoom(guestContext, roomCode, "Crimson Guest");

  await expect(host.getByRole("heading", { name: "2 of 8 syndicates" })).toBeVisible();
  await host.getByRole("button", { name: "Begin takeover" }).click();
  await expect(host.getByRole("heading", { name: "Make your promises" })).toBeVisible();
  await expect(guest.getByRole("heading", { name: "Make your promises" })).toBeVisible();
  await expect(host.locator(".objective-panel article")).toHaveCount(3);
  await expect(guest.locator(".objective-panel article")).toHaveCount(3);

  expect(await guest.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await guest.getByRole("button", { name: "City" }).click();
  await expect(guest.locator(".map-shell")).toBeVisible();
  await guest.getByRole("button", { name: "Action" }).click();

  await guest.reload();
  await expect(guest.getByRole("heading", { name: "Make your promises" })).toBeVisible();
  await expect(guest.locator(".objective-panel article")).toHaveCount(3);

  await Promise.all([
    host.getByRole("button", { name: "Lock in & continue" }).click(),
    guest.getByRole("button", { name: "Lock in & continue" }).click(),
  ]);
  await expect(host.getByRole("heading", { name: "Choose your leverage" })).toBeVisible();
  await expect(guest.getByRole("heading", { name: "Choose your leverage" })).toBeVisible();

  await Promise.all([
    host.locator(".action-card").first().click(),
    guest.locator(".action-card").first().click(),
  ]);
  await expect(host.getByText("Hidden operation", { exact: true })).toBeVisible();
  await expect(guest.getByText("Hidden operation", { exact: true })).toBeVisible();

  await Promise.all([
    host.getByRole("button", { name: "Lock hidden move" }).click(),
    guest.getByRole("button", { name: "Lock hidden move" }).click(),
  ]);
  await expect(host.getByRole("heading", { name: "Operations revealed" })).toBeVisible();
  await expect(guest.getByRole("heading", { name: "Operations revealed" })).toBeVisible();
  await expect(host.locator(".reveal-list > div")).toHaveCount(2);
  await expect(guest.locator(".reveal-list > div")).toHaveCount(2);

  expect(await host.locator("body").evaluate((body) => body.textContent?.includes("Crimson Guest") ?? false)).toBe(true);
  await hostContext.close();
  await guestContext.close();
});
