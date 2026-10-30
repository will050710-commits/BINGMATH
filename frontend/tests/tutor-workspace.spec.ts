import { expect, test as base, type Locator, type Page } from "@playwright/test";
import { firstSceneTitle, installTutorApi, secondSceneTitle } from "./fixtures/tutor-api";

const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(errors);
    expect(errors, "The real chat route must not raise an uncaught browser error").toEqual([]);
  }, { auto: true }],
});

const workspace = (page: Page) => page.getByTestId("tutor-workspace");
const canvas = (page: Page) => page.getByTestId("tutor-canvas-content");
const composer = (page: Page) => page.getByTestId("tutor-composer");
const graph = (page: Page) => canvas(page).locator(".recharts-wrapper");
const slider = (page: Page) => canvas(page).locator('input[type="range"]').first();

async function send(page: Page, message: string) {
  await composer(page).locator("textarea").fill(message);
  await composer(page).getByRole("button", { name: "Gửi câu trả lời", exact: true }).click();
}

async function openTutor(page: Page) {
  const api = await installTutorApi(page);
  await page.goto("/DuoMCB");
  await expect(workspace(page)).toBeVisible({ timeout: 90_000 });
  return api;
}

async function openGraph(page: Page) {
  const api = await openTutor(page);
  await send(page, "Khám phá parabol");
  await expect(graph(page)).toBeVisible();
  await expect(slider(page)).toHaveValue("0");
  return api;
}

async function markGraph(page: Page) {
  await graph(page).evaluate((element) => {
    (window as typeof window & { __tutorGraph?: Element }).__tutorGraph = element;
  });
}

async function expectSameGraph(page: Page) {
  await expect(graph(page)).toHaveCount(1);
  expect(await graph(page).evaluate((element) =>
    (window as typeof window & { __tutorGraph?: Element }).__tutorGraph === element && element.isConnected,
  )).toBe(true);
}

async function setH(page: Page) {
  await slider(page).focus();
  await slider(page).press("ArrowRight");
  await slider(page).press("ArrowRight");
  await expect(slider(page)).toHaveValue("0.5");
}

async function expectWithinViewport(locator: Locator, page: Page) {
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  const viewport = page.viewportSize()!;
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.y).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height + 1);
}

test("keeps one live graph and its parameter while typing, resizing, collapsing and expanding", async ({ page }) => {
  await openGraph(page);
  await expect(workspace(page)).toHaveAttribute("data-layout", "desktop");
  await setH(page);
  await markGraph(page);
  await composer(page).locator("textarea").fill("Em đang thử nghiệm h = 0.5");
  await expectSameGraph(page);
  await expect(slider(page)).toHaveValue("0.5");

  const divider = page.getByTestId("tutor-divider");
  const oldRatio = Number(await divider.getAttribute("aria-valuenow"));
  await divider.click();
  await expect(divider).toHaveAttribute("aria-valuenow", String(oldRatio));
  await divider.focus();
  await divider.press("ArrowRight");
  await expect.poll(async () => Number(await divider.getAttribute("aria-valuenow"))).toBeGreaterThan(oldRatio);
  const bounds = await divider.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + 80, bounds!.y + bounds!.height / 2, { steps: 12 });
  await page.mouse.up();
  await expectSameGraph(page);

  await page.getByRole("button", { name: "Đóng bảng minh họa", exact: true }).click();
  await expect(workspace(page)).toHaveAttribute("data-mode", "collapsed");
  await expectSameGraph(page);
  await page.getByRole("button", { name: "Mở bảng minh họa", exact: true }).click();
  await expect(graph(page)).toBeVisible();

  await page.getByRole("button", { name: "Phóng lớn bảng minh họa", exact: true }).click();
  await expect(workspace(page)).toHaveAttribute("data-mode", "expanded");
  await expect(composer(page)).toBeVisible();
  await expectWithinViewport(composer(page), page);
  await page.getByRole("button", { name: "Thu nhỏ bảng minh họa", exact: true }).click();
  await expect(workspace(page)).toHaveAttribute("data-mode", "split");
  await expectSameGraph(page);
  await expect(slider(page)).toHaveValue("0.5");
  await expect(composer(page).locator("textarea")).toHaveValue("Em đang thử nghiệm h = 0.5");
});

test("keeps the live graph and draft through desktop, tablet and mobile layouts", async ({ page }) => {
  await openGraph(page);
  await setH(page);
  await markGraph(page);
  await composer(page).locator("textarea").fill("Bản nháp cần được giữ nguyên");

  await page.screenshot({ path: "../work/ui-desktop.png" });

  // Breakpoints use the workspace width after sidebars, not window width.
  const initialBounds = await workspace(page).boundingBox();
  const outsideWidth = page.viewportSize()!.width - initialBounds!.width;
  await page.setViewportSize({ width: Math.round(900 + outsideWidth), height: 1000 });
  await expect(workspace(page)).toHaveAttribute("data-layout", "tablet");
  await expectSameGraph(page);
  await page.screenshot({ path: "../work/ui-tablet.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(workspace(page)).toHaveAttribute("data-layout", "mobile");
  await expect(workspace(page)).toHaveAttribute("data-keyboard", "closed");
  await expectSameGraph(page);
  await expect(slider(page)).toHaveValue("0.5");
  await expectWithinViewport(composer(page), page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.screenshot({ path: "../work/ui-mobile.png" });

  await page.setViewportSize({ width: 1600, height: 1000 });
  await expect(workspace(page)).toHaveAttribute("data-layout", "desktop");
  await expectSameGraph(page);
  await expect(composer(page).locator("textarea")).toHaveValue("Bản nháp cần được giữ nguyên");
});

test("does not pull a reader away from older messages when a reply arrives", async ({ page }) => {
  const api = await openGraph(page);
  await send(page, "Tạo lịch sử dài");
  const transcript = page.getByTestId("tutor-transcript");
  await expect(transcript.getByText("Quan sát 45:", { exact: false })).toBeVisible();
  await expect.poll(() => transcript.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeGreaterThan(500);
  await transcript.evaluate((element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event("scroll"));
  });
  api.holdNextReply();
  await send(page, "Cho em phản hồi tiếp");
  await expect.poll(() => api.messages.length).toBe(3);
  api.releaseReply();
  await expect(transcript.getByText("Phản hồi mới:", { exact: false })).toBeAttached();
  await expect.poll(() => transcript.evaluate((element) => element.scrollTop)).toBeLessThan(50);
  const newResponse = page.getByRole("button", { name: "Xem phản hồi mới", exact: true });
  await expect(newResponse).toBeVisible();
  await newResponse.click();
  await expect.poll(() => transcript.evaluate((element) => element.scrollHeight - element.clientHeight - element.scrollTop)).toBeLessThan(100);
});

test("can explicitly reopen the scene belonging to an earlier message", async ({ page }) => {
  await openGraph(page);
  await send(page, "Cho em hình thứ hai");
  await expect(canvas(page).getByText(secondSceneTitle, { exact: true })).toBeVisible();
  const oldScene = page.getByTestId("tutor-transcript").getByRole("button", { name: new RegExp(firstSceneTitle) });
  await oldScene.click();
  await expect(canvas(page).getByText(firstSceneTitle, { exact: true })).toBeVisible();
  await expect(graph(page)).toHaveCount(1);
});

test("supports keyboard divider controls and reduced motion without losing graph state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openGraph(page);
  await markGraph(page);
  const divider = page.getByRole("separator", { name: "Điều chỉnh độ rộng hội thoại" });
  await divider.focus();
  await divider.press("End");
  const max = Number(await divider.getAttribute("aria-valuemax"));
  await expect.poll(async () => Number(await divider.getAttribute("aria-valuenow"))).toBeCloseTo(max, 0);
  await divider.press("Home");
  const min = Number(await divider.getAttribute("aria-valuemin"));
  await expect.poll(async () => Number(await divider.getAttribute("aria-valuenow"))).toBeCloseTo(min, 0);
  await page.getByRole("button", { name: "Phóng lớn bảng minh họa", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(workspace(page)).toHaveAttribute("data-mode", "split");
  await expectSameGraph(page);
});

test("keeps the composer visible when the mobile visual viewport shrinks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGraph(page);
  await markGraph(page);
  await composer(page).locator("textarea").fill("Nháp trước khi mở bàn phím");

  // Deterministic keyboard geometry simulation. Physical iOS/Android keyboards
  // remain a separate device QA step; a desktop browser cannot open them.
  await page.evaluate(() => {
    const viewport = window.visualViewport;
    if (!viewport) throw new Error("This check requires VisualViewport support");
    Object.defineProperty(viewport, "height", { configurable: true, get: () => 420 });
    viewport.dispatchEvent(new Event("resize"));
  });
  await expect.poll(async () => {
    const bounds = await composer(page).boundingBox();
    return bounds ? bounds.y + bounds.height : Number.POSITIVE_INFINITY;
  }).toBeLessThanOrEqual(421);
  await expectSameGraph(page);
  await expect(composer(page).locator("textarea")).toHaveValue("Nháp trước khi mở bàn phím");
  await page.evaluate(() => {
    const viewport = window.visualViewport!;
    Reflect.deleteProperty(viewport, "height");
    viewport.dispatchEvent(new Event("resize"));
  });
  await expectWithinViewport(composer(page), page);
});

test("keeps the composer accessible above the actual MathLive keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGraph(page);
  await markGraph(page);
  await composer(page).getByRole("button", { name: "Σ", exact: true }).click();
  const field = composer(page).locator("math-field");
  await expect(field).toBeVisible();
  await field.focus();
  await page.evaluate(() => window.mathVirtualKeyboard.show());
  await expect(workspace(page)).toHaveAttribute("data-keyboard", "open");
  await expect.poll(async () => {
    const bottom = await composer(page).evaluate((element) => element.getBoundingClientRect().bottom);
    const top = await page.evaluate(() => window.mathVirtualKeyboard.boundingRect.top);
    return bottom - top;
  }).toBeLessThanOrEqual(1);
  await expectSameGraph(page);
  await page.evaluate(() => window.mathVirtualKeyboard.hide());
  await expect(workspace(page)).toHaveAttribute("data-keyboard", "closed");
});

test("does not force the composer below a very short mobile visual viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGraph(page);
  await composer(page).locator("textarea").fill("Bản nháp trong vùng nhìn ngắn");
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport!, "height", { configurable: true, get: () => 220 });
    window.visualViewport!.dispatchEvent(new Event("resize"));
  });
  await expect(workspace(page)).toHaveAttribute("data-minimal-viewport", "true");
  await expect.poll(async () => (await composer(page).boundingBox())!.y + (await composer(page).boundingBox())!.height).toBeLessThanOrEqual(221);
  await expect(composer(page).getByRole("button", { name: "Gửi câu trả lời" })).toBeInViewport();
});

test("discards an old pending reply after starting another conversation", async ({ page }) => {
  const api = await openGraph(page);
  api.holdNextReply();
  await send(page, "Cho em hình thứ hai");
  await expect.poll(() => api.messages.length).toBe(2);
  await page.getByRole("button", { name: "New Chat" }).click();
  api.releaseReply();
  await expect(page.getByTestId("math-canvas-renderer")).toHaveCount(0);
  await send(page, "Khám phá parabol mới");
  await expect(canvas(page).getByText(firstSceneTitle, { exact: true })).toBeVisible();
  await expect(page.getByTestId("tutor-transcript").getByText(secondSceneTitle)).toHaveCount(0);
  expect(api.messages).toHaveLength(3);
});


test("waits for saved history before allowing a message in the selected conversation", async ({ page }) => {
  const api = await openGraph(page);
  await page.getByRole("button", { name: "New Chat" }).click();

  // Hold a real IndexedDB read at its completion boundary to reproduce a slow
  // device without adding arbitrary timeouts or test-only code to the app.
  await page.evaluate(() => {
    const originalGet = IDBObjectStore.prototype.get;
    IDBObjectStore.prototype.get = function (query) {
      const request = originalGet.call(this, query);
      IDBObjectStore.prototype.get = originalGet;
      Object.defineProperty(request, "onsuccess", {
        set(callback: (this: IDBRequest, event: Event) => void) {
          request.addEventListener("success", (event) => {
            (window as typeof window & { __releaseHistory?: () => void }).__releaseHistory = () => callback.call(request, event);
          }, { once: true });
        },
      });
      return request;
    };
  });
  await page.getByRole("button", { name: "💬 Khám phá parabol", exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(
    (window as typeof window & { __releaseHistory?: () => void }).__releaseHistory,
  ))).toBe(true);
  await composer(page).locator("textarea").fill("Bản nháp trong lúc tải lịch sử");
  await expect(composer(page).getByRole("button", { name: "Gửi câu trả lời", exact: true })).toBeDisabled();
  await composer(page).locator("textarea").press("Enter");
  expect(api.messages).toHaveLength(1);

  await page.evaluate(() => (window as typeof window & { __releaseHistory?: () => void }).__releaseHistory?.());
  await expect(graph(page)).toBeVisible();
  await expect(composer(page).locator("textarea")).toHaveValue("Bản nháp trong lúc tải lịch sử");
  await composer(page).getByRole("button", { name: "Gửi câu trả lời", exact: true }).click();
  await expect.poll(() => api.messages.length).toBe(2);
});

test("resizes a live JSXGraph SVG board without replacing its DOM instance", async ({ page }) => {
  await openTutor(page);
  await send(page, "Vẽ tam giác SVG");
  const board = canvas(page).locator(".jxgbox");
  const svg = board.locator("svg").first();
  await expect(svg).toBeVisible();
  await svg.evaluate((element) => {
    (window as typeof window & { __tutorBoard?: Element }).__tutorBoard = element;
  });
  const oldWidth = (await board.boundingBox())!.width;
  await canvas(page).getByRole("button", { name: "Thu phóng gần", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(workspace(page)).toHaveAttribute("data-layout", "mobile");
  await expect.poll(async () => (await board.boundingBox())!.width).toBeLessThan(oldWidth);
  await expect.poll(async () => {
    const dimensions = await board.evaluate((element) => ({
      boardWidth: element.clientWidth,
      svgWidth: Number(element.querySelector("svg")?.getAttribute("width")),
    }));
    return Math.abs(dimensions.boardWidth - dimensions.svgWidth);
  }).toBeLessThanOrEqual(1);
  expect(await svg.evaluate((element) =>
    (window as typeof window & { __tutorBoard?: Element }).__tutorBoard === element,
  )).toBe(true);
  await page.getByRole("button", { name: "Đóng bảng minh họa", exact: true }).click();
  await page.getByRole("button", { name: "Mở bảng minh họa", exact: true }).click();
  expect(await svg.evaluate((element) =>
    (window as typeof window & { __tutorBoard?: Element }).__tutorBoard === element,
  )).toBe(true);
});

test("resizes the Three.js drawing buffer while retaining its WebGL canvas", async ({ page }) => {
  await openTutor(page);
  await send(page, "Vẽ khối 3D");
  const webgl = canvas(page).locator("canvas");
  await expect(webgl).toBeVisible();
  await webgl.evaluate((element) => {
    (window as typeof window & { __tutorWebGL?: Element }).__tutorWebGL = element;
  });
  const initialWidth = Number(await webgl.getAttribute("width"));
  await canvas(page).getByLabel("Tự xoay 3D").uncheck();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(workspace(page)).toHaveAttribute("data-layout", "mobile");
  await expect.poll(async () => Number(await webgl.getAttribute("width"))).toBeLessThan(initialWidth);
  await expect.poll(async () => webgl.evaluate((element) => {
    const buffer = element as HTMLCanvasElement;
    return Math.abs(buffer.width / buffer.height - buffer.clientWidth / buffer.clientHeight);
  })).toBeLessThan(0.02);
  await page.getByRole("button", { name: "Đóng bảng minh họa", exact: true }).click();
  await page.getByRole("button", { name: "Mở bảng minh họa", exact: true }).click();
  expect(await webgl.evaluate((element) =>
    (window as typeof window & { __tutorWebGL?: Element }).__tutorWebGL === element,
  )).toBe(true);
  await expect(canvas(page).getByLabel("Tự xoay 3D")).not.toBeChecked();
});
