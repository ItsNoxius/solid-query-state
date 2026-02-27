import { expect, test } from "@playwright/test";

test.describe("solid-query-state E2E", () => {
  test("displays name from URL", async ({ page }) => {
    await page.goto("/?name=Alice");
    await expect(page.getByTestId("name-display")).toHaveText(
      "Hello, Alice!"
    );
  });

  test("updates URL when name is entered", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("name-input").fill("Bob");
    await page.getByTestId("name-input").blur();
    await expect(page).toHaveURL(/\?name=Bob/);
  });

  test("clears name from URL", async ({ page }) => {
    await page.goto("/?name=Charlie");
    await page.getByTestId("name-clear").click();
    await expect(page).toHaveURL(/\/(\?)?$/);
    await expect(page.getByTestId("name-display")).toHaveText(
      "Hello, anonymous visitor!"
    );
  });

  test("count increments and updates URL", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("count-display")).toHaveText("Count: 0");

    await page.getByTestId("count-increment").click();
    await expect(page.getByTestId("count-display")).toHaveText("Count: 1");
    await expect(page).toHaveURL(/\?count=1/);

    await page.getByTestId("count-increment").click();
    await expect(page.getByTestId("count-display")).toHaveText("Count: 2");
    await expect(page).toHaveURL(/\?count=2/);
  });

  test("count decrements", async ({ page }) => {
    await page.goto("/?count=5");
    await page.getByTestId("count-decrement").click();
    await expect(page.getByTestId("count-display")).toHaveText("Count: 4");
  });

  test("filters search and page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("search-input").fill("test query");
    await page.getByTestId("search-input").blur();
    await expect(page).toHaveURL(/search=test\+query/);

    await page.getByTestId("page-next").click();
    await expect(page.getByTestId("page-display")).toHaveText("Page: 1");
    await expect(page).toHaveURL(/page=1/);
  });
});
