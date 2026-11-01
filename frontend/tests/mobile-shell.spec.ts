import { expect, test as base, type Locator, type Page, type Route } from "@playwright/test";

type MockApi = {
  sessions: Route[];
  chats: { session_id: string; message: string; mode: string }[];
  pendingChats: Route[];
  holdSessions: boolean;
  holdChats: boolean;
  errorStatus: number;
};

const test = base.extend<{ api: MockApi }>({
  api: [async ({ page }, use) => {
    const api: MockApi = { sessions: [], chats: [], pendingChats: [], holdSessions: false, holdChats: false, errorStatus: 0 };
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (/hydration|did not match/i.test(message.text())) errors.push(message.text());
    });
    await page.route("**/*", async route => {
      const url = new URL(route.request().url());
      if (url.pathname === "/api/session/new") {
        api.sessions.push(route);
        if (!api.holdSessions) await route.fulfill({ json: { session_id: `session-${api.sessions.length}` } });
        return;
      }
      if (url.pathname === "/api/chat") {
        api.chats.push(route.request().postDataJSON());
        if (api.holdChats) { api.pendingChats.push(route); return; }
        await route.fulfill({ status: api.errorStatus || 200, json: { reply: api.errorStatus ? "Please sign in to continue." : "A mocked tutor reply." } });
        return;
      }
      if (url.origin === "http://127.0.0.1:3000") return route.continue();
      return route.abort();
    });
    await use(api);
    expect(errors).toEqual([]);
  }, { auto: true }],
});

test.use({ viewport: { width: 390, height: 844 } });
const mobileTutor = (page: Page) => page.getByRole("button", { name: "Trợ lý AI BingMCB", exact: true });
const desktopTutor = (page: Page) => page.getByRole("button", { name: "Mở BingMCB AI Chatbot", exact: true });
const settingsTrigger = (page: Page) => page.getByRole("button", { name: "Cài đặt nhanh", exact: true });
const chatDialog = (page: Page) => page.getByRole("dialog", { name: "BingMCB AI Tutor", exact: true });

async function openShell(page: Page) {
  await page.goto("/offline");
  await expect(mobileTutor(page)).toBeVisible();
}

async function openChat(page: Page) {
  await mobileTutor(page).click();
  await mobileTutor(page).click();
  await expect(chatDialog(page)).toBeVisible();
}

async function send(page: Page, message: string) {
  await chatDialog(page).getByRole("textbox").fill(message);
  await chatDialog(page).getByRole("button", { name: "Gửi tin nhắn" }).click();
}

async function expectWithinViewport(locator: Locator, page: Page) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
}

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 667, height: 375 }]) {
  test(`one mobile tutor and reachable, scrollable Settings at ${viewport.width}x${viewport.height}`, async ({ page, api }, testInfo) => {
    await page.setViewportSize(viewport);
    await openShell(page);
    await expect(desktopTutor(page)).toHaveCount(0);
    expect(api.sessions).toHaveLength(0);
    if (viewport.width === 390) await page.screenshot({ path: testInfo.outputPath("phone-shell.png") });
    await settingsTrigger(page).click();
    const settings = page.getByRole("dialog", { name: "Cài đặt nhanh", exact: true });
    await expect(settings).toBeVisible();
    await expectWithinViewport(settings.getByRole("button", { name: "Đóng cài đặt nhanh" }), page);
    if (viewport.height === 375) await page.screenshot({ path: testInfo.outputPath("landscape-settings.png") });
    const tour = settings.getByRole("button", { name: /Xem Hướng Dẫn/ });
    await tour.scrollIntoViewIfNeeded();
    await expectWithinViewport(tour, page);
    await tour.click();
    const guide = page.getByRole("dialog");
    await expect(guide).toHaveCount(1);
    await expectWithinViewport(guide.getByRole("button", { name: /Bỏ qua/ }), page);
    await expectWithinViewport(guide.getByRole("button", { name: /Tiếp theo/ }), page);
    await page.keyboard.press("Escape");
    await expect(guide).toHaveCount(0);
    await expect(settingsTrigger(page)).toBeFocused();
    expect(api.sessions).toHaveLength(0);
  });
}

for (const viewport of [{ width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
  test(`desktop owns tutor at ${viewport.width}px; resizing closes mobile dialogs`, async ({ page, api }, testInfo) => {
    await openShell(page);
    await settingsTrigger(page).click();
    await page.setViewportSize(viewport);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(mobileTutor(page)).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Thanh điều hướng di động" })).toHaveCount(0);
    await expect(desktopTutor(page)).toBeVisible();
    if (viewport.width === 1440) await page.screenshot({ path: testInfo.outputPath("desktop-shell.png") });
    expect(api.sessions).toHaveLength(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(mobileTutor(page)).toBeVisible();
    await expect(desktopTutor(page)).toHaveCount(0);
    await settingsTrigger(page).click();
    await expect(page.getByRole("dialog", { name: "Cài đặt nhanh" })).toBeVisible();
  });
}

test("keyboard activation, focus containment, Escape, and drag cancellation", async ({ page }) => {
  await openShell(page);
  await mobileTutor(page).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  const dialog = chatDialog(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox")).toBeFocused();
  const first = dialog.getByRole("button", { name: /Mới/ });
  await first.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(mobileTutor(page)).toBeFocused();
  const box = (await mobileTutor(page).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(20, 180, { steps: 8 });
  await page.mouse.up();
  await expect(dialog).toHaveCount(0);
  expect((await mobileTutor(page).boundingBox())!.x).toBe(0);
  await mobileTutor(page).dispatchEvent("pointercancel");
  await mobileTutor(page).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
});

test("Hint and Solution send different modes and preserve server error messages", async ({ page, api }) => {
  await openShell(page);
  await openChat(page);
  await send(page, "A first prompt");
  await expect(chatDialog(page).getByText("A mocked tutor reply.")).toBeVisible();
  expect(api.chats[0].mode).toBe("hint");
  await chatDialog(page).getByRole("button", { name: "Lời giải chi tiết" }).click();
  api.errorStatus = 401;
  await send(page, "A second prompt");
  await expect(chatDialog(page).getByText("Please sign in to continue.")).toBeVisible();
  expect(api.chats[1].mode).toBe("solution");
  expect(api.chats[1].session_id).toBe(api.chats[0].session_id);
});

test("composer stays inside the visual viewport when the software keyboard pans the page", async ({ page }) => {
  await openShell(page);
  await openChat(page);
  await page.evaluate(() => {
    const viewport = window.visualViewport!;
    Object.defineProperty(viewport, "height", { configurable: true, value: 340 });
    Object.defineProperty(viewport, "offsetTop", { configurable: true, value: 70 });
    viewport.dispatchEvent(new Event("resize"));
  });
  await expect.poll(async () => (await chatDialog(page).boundingBox())?.height).toBe(340);
  const composer = (await chatDialog(page).getByRole("textbox").boundingBox())!;
  expect(composer.y).toBeGreaterThanOrEqual(70);
  expect(composer.y + composer.height).toBeLessThanOrEqual(410);
});

test("Reset ignores the old reply and sends the next question with a new session", async ({ page, api }) => {
  await openShell(page);
  await openChat(page);
  api.holdChats = true;
  await send(page, "Old prompt");
  await expect.poll(() => api.pendingChats.length).toBe(1);
  await chatDialog(page).getByRole("button", { name: /Mới/ }).click();
  await expect.poll(() => api.sessions.length).toBe(2);
  api.holdChats = false;
  await api.pendingChats[0].fulfill({ json: { reply: "STALE_REPLY" } }).catch(() => {});
  await send(page, "New prompt");
  await expect(chatDialog(page).getByText("A mocked tutor reply.")).toBeVisible();
  await expect(chatDialog(page).getByText("STALE_REPLY")).toHaveCount(0);
  await expect(chatDialog(page).getByText("Old prompt")).toHaveCount(0);
  expect(api.chats.map(request => request.session_id)).toEqual(["session-1", "session-2"]);
});

test("Reset during session creation cannot restore the old session or send early", async ({ page, api }) => {
  api.holdSessions = true;
  await openShell(page);
  await openChat(page);
  await expect.poll(() => api.sessions.length).toBe(1);
  await chatDialog(page).getByRole("button", { name: /Mới/ }).click();
  await expect.poll(() => api.sessions.length).toBe(2);
  await send(page, "Wait for the replacement session");
  await api.sessions[0].fulfill({ json: { session_id: "old-session" } }).catch(() => {});
  expect(api.chats).toHaveLength(0);
  await api.sessions[1].fulfill({ json: { session_id: "replacement-session" } });
  await expect(chatDialog(page).getByText("A mocked tutor reply.")).toBeVisible();
  expect(api.chats).toHaveLength(1);
  expect(api.chats[0].session_id).toBe("replacement-session");
});

test("theme, OS preference, opacity, and language agree across controls and reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await openShell(page);
  await settingsTrigger(page).click();
  let settings = page.getByRole("dialog", { name: "Cài đặt nhanh", exact: true });
  await settings.getByRole("button", { name: "Sáng", exact: false }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "paper");
  await expect(settings).toHaveAttribute("data-theme-mode", "light");
  await expect(settings.getByRole("button", { name: "Sáng", exact: false })).toBeFocused();
  await settings.getByRole("button", { name: "Tối", exact: false }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ink");
  await settings.getByRole("button", { name: "Kính Lỏng", exact: false }).click();
  await settings.getByRole("button", { name: /25%/ }).click();
  expect(await page.evaluate(() => localStorage.getItem("bingmath_liquid_glass_opacity"))).toBe("0.25");
  await settings.getByRole("button", { name: "Hệ thống", exact: false }).click();
  await expect(settings).toHaveAttribute("data-theme-mode", "light");
  await expect(page.getByRole("navigation", { name: "Thanh điều hướng di động" })).toHaveAttribute("data-theme-mode", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(settings).toHaveAttribute("data-theme-mode", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ink");
  await settings.getByRole("button", { name: /English/ }).click();
  settings = page.getByRole("dialog", { name: "Quick Settings", exact: true });
  await expect(settings).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Quick Settings", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-mobile-theme", "dark");
  await page.getByRole("button", { name: "Quick Settings", exact: true }).click();
  await expect(page.getByRole("button", { name: /System/ })).toHaveAttribute("aria-pressed", "true");
});

test("Quick Math uses guest progress instead of stale cached identities and locks answered questions", async ({ page }) => {
  await page.addInitScript(() => {
    const now = new Date();
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
    localStorage.setItem("duomath_user", JSON.stringify({ id: "previous-account" }));
    localStorage.setItem("bingmath_bonus_xp", "900");
    localStorage.setItem("bingmath_bonus_xp:guest", "40");
    localStorage.setItem("bingmath_solved_today:guest", "2");
    localStorage.setItem("bingmath_solved_date:guest", today);
  });
  await openShell(page);
  await settingsTrigger(page).click();
  const card = page.getByTestId("quick-math-card");
  await expect(card).toContainText("Hôm nay: 2 · +40 XP");
  const question = await page.getByTestId("quick-math-question").textContent();
  const answer = card.locator('[data-testid^="quick-math-opt-"]').first();
  await expect(answer).toBeEnabled();
  await answer.click();
  await expect(answer).toBeDisabled();
  await page.getByRole("button", { name: "Sáng", exact: false }).click();
  await expect(page.getByTestId("quick-math-question")).toHaveText(question!);
  await expect(answer).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem("bingmath_bonus_xp"))).toBe("900");
});

test("a requested guide is dismissed persistently and manual replay starts at step one", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("review-visited")) {
      localStorage.setItem("review-visited", "true");
      localStorage.setItem("bingmath_trigger_v1_guide", "true");
    }
  });
  await openShell(page);
  const guide = page.getByRole("dialog");
  await expect(guide).toBeVisible();
  const title = await guide.getAttribute("aria-label");
  await guide.getByRole("button", { name: /Tiếp theo/ }).click();
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(mobileTutor(page)).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await settingsTrigger(page).click();
  await page.getByRole("button", { name: /Xem Hướng Dẫn/ }).click();
  await expect(page.getByRole("dialog")).toHaveAttribute("aria-label", title!);
});

test("lesson and full tutor routes keep their overlay exclusions", async ({ page }) => {
  await page.goto("/L6-C1-L1");
  await expect(mobileTutor(page)).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Thanh điều hướng di động" })).toHaveCount(0);
  await page.goto("/DuoMCB");
  await expect(page.getByTestId("tutor-workspace")).toBeVisible();
  await expect(mobileTutor(page)).toHaveCount(0);
  await expect(desktopTutor(page)).toHaveCount(0);
  await expect(settingsTrigger(page)).toHaveCount(0);
});
