import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test("sign-in page loads and has correct title", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveTitle(/Sign in/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("sign-up page loads and has correct title", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveTitle(/Create account/);
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });

  test("root redirects to sign-in", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in form validates email", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: /continue with email/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("sign-up link navigates from sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("cmd+k opens command palette", async ({ page }) => {
    await page.goto("/sign-in");
    // Command palette only mounts in the app shell, not on auth pages
    // This confirms it does NOT appear on the auth layout
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
