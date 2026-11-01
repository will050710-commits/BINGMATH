import { expect, test } from "@playwright/test";

test.describe("C1 CLIL Pilot (/L6-C1-L1)", () => {
  test("renders 3 learning modes, glossary & MC term triggers, preserves quiz state, and isolates learner scopes without hydration mismatch", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto("/L6-C1-L1");
    expect(response?.status()).toBe(200);

    // 1. Default mode is Assisted
    const assistedBtn = page.getByTestId("learning-mode-option-assisted");
    await expect(assistedBtn).toBeVisible();
    await expect(assistedBtn).toHaveAttribute("aria-checked", "true");

    // 2. Verify no <button> is nested inside another <button> anywhere on the page
    const nestedButtonCount = await page.locator("button button").count();
    expect(nestedButtonCount).toBe(0);

    // 3. Verify English option 4 in MC question 1 renders "has 2 elements" instead of raw Vietnamese
    const mcOpt3 = page.getByTestId("mc-option-3");
    await expect(mcOpt3).toContainText("has 2");
    await expect(mcOpt3).toContainText("elements");

    // 4. Clicking a math term trigger opens the popover without selecting an MC answer (R4)
    const firstTermTrigger = page.locator('[data-clil-term-trigger="true"]').first();
    await firstTermTrigger.click();
    const termPopover = page.getByTestId("math-term-popover");
    await expect(termPopover).toBeVisible();

    // Pressing Escape dismisses the popover
    await page.keyboard.press("Escape");
    await expect(termPopover).toBeHidden();

    // 5. Glossary section (#trans) renders definitions and interactive term triggers (R4)
    const glossarySetCard = page.getByTestId("glossary-card-set");
    await expect(glossarySetCard).toBeVisible();
    await expect(glossarySetCard).toContainText("Tập hợp");
    await expect(glossarySetCard).toContainText("well-defined collection");
    const glossaryTrigger = glossarySetCard.locator('[data-clil-term-trigger="true"]');
    await glossaryTrigger.click();
    await expect(termPopover).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(termPopover).toBeHidden();

    // 6. Select MC answer C (index 2, correct answer) and verify quiz state is preserved when switching modes
    const mcOpt2 = page.getByTestId("mc-option-2");
    await mcOpt2.click();
    await expect(page.getByText(/Score:\s*1|Điểm:\s*1/)).toBeVisible();

    // Switch to Parallel mode
    const parallelBtn = page.getByTestId("learning-mode-option-parallel");
    await parallelBtn.click();
    await expect(parallelBtn).toHaveAttribute("aria-checked", "true");
    await expect(page.locator('[data-learning-mode="parallel"]').first()).toBeVisible();
    // Score and selected state must still be preserved
    await expect(page.getByText(/Score:\s*1|Điểm:\s*1/)).toBeVisible();

    // Switch to Immersion mode
    const immersionBtn = page.getByTestId("learning-mode-option-immersion");
    await immersionBtn.click();
    await expect(immersionBtn).toHaveAttribute("aria-checked", "true");
    await expect(page.locator('[data-learning-mode="immersion"]').first()).toBeVisible();
    await expect(page.getByText(/Score:\s*1|Điểm:\s*1/)).toBeVisible();

    // 7. Learner scope isolation & reactive user switch (R5)
    await page.evaluate(() => {
      localStorage.setItem("duomath_user", JSON.stringify({ id: "user_alpha" }));
      window.dispatchEvent(new Event("bingmath:auth-scope-change"));
    });
    // Fresh user_alpha defaults to Assisted
    await expect(assistedBtn).toHaveAttribute("aria-checked", "true");
    await parallelBtn.click();
    await expect(parallelBtn).toHaveAttribute("aria-checked", "true");

    // Switch to user_beta — must not inherit user_alpha's Parallel mode
    await page.evaluate(() => {
      localStorage.setItem("duomath_user", JSON.stringify({ id: "user_beta" }));
      window.dispatchEvent(new Event("bingmath:auth-scope-change"));
    });
    await expect(assistedBtn).toHaveAttribute("aria-checked", "true");

    // Switch back to user_alpha and reload to verify persisted Parallel mode & zero SSR/CSR hydration mismatch (R6)
    await page.evaluate(() => {
      localStorage.setItem("duomath_user", JSON.stringify({ id: "user_alpha" }));
    });
    await page.reload();
    await expect(parallelBtn).toHaveAttribute("aria-checked", "true");
    const hydrationErrors = consoleErrors.filter((e) =>
      /hydration|did not match|server-rendered HTML/i.test(e)
    );
    expect(hydrationErrors).toEqual([]);
  });

  test("mobile modal traps focus, marks background inert, and zero horizontal overflow across 375px, 768px, and 1440px viewports (R7, R8)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/L6-C1-L1");

    const firstTermTrigger = page.locator('[data-clil-term-trigger="true"]').first();
    await firstTermTrigger.click();
    const termPopover = page.getByTestId("math-term-popover");
    await expect(termPopover).toBeVisible();
    await expect(termPopover).toHaveAttribute("aria-modal", "true");

    // Background CLIL root is marked inert while mobile modal is open
    const hasInertBackground = await page.evaluate(() => {
      return document.querySelectorAll('[data-clil-managed="true"][inert]').length > 0;
    });
    expect(hasInertBackground).toBe(true);

    // Tab stays trapped inside the modal dialog
    await page.keyboard.press("Tab");
    const focusInsideModal = await page.evaluate(() => {
      const dialog = document.querySelector('[data-testid="math-term-popover"]');
      return Boolean(dialog && dialog.contains(document.activeElement));
    });
    expect(focusInsideModal).toBe(true);

    await page.keyboard.press("Escape");
    await expect(termPopover).toBeHidden();

    for (const vp of [
      { width: 375, height: 812 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(vp);
      await page.goto("/L6-C1-L1");
      await expect(page.getByTestId("learning-mode-switch")).toBeVisible();
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });
      expect(overflow).toBeLessThanOrEqual(1);
    }
  });
});
