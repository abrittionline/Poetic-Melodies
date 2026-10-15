import { test, expect } from "@playwright/test";
test("public library, playback, language and collections", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "কবিতা যখন গান হয়ে ওঠে।" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch language" }).click();
  await expect(
    page.getByRole("heading", { name: "When poetry finds its melody." }),
  ).toBeVisible();
  await page.goto("/poetry");
  await page.getByRole("textbox", { name: "Search poetry" }).fill("Blue");
  await expect(
    page.getByRole("heading", { name: "The Blue Letter" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Beyond the Window" }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search poetry" })
    .fill("nonexistent");
  await expect(
    page.getByText("No poems found. Try another search or category."),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search poetry" }).fill("");
  await page.getByLabel("Category", { exact: true }).selectOption("love");
  await expect(
    page.getByRole("heading", { name: "The Blue Letter" }),
  ).toBeVisible();
  await page.goto("/poem/window");
  const audio = page.locator("audio");
  await expect(audio).toHaveAttribute("src", "/media/morning.wav");
  await audio.evaluate(async (el: HTMLAudioElement) => {
    await el.play();
  });
  await expect
    .poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime))
    .toBeGreaterThan(0);
  await page.goto("/poem/river-song");
  const video = page.locator("video");
  await expect(video).toHaveAttribute("src", "/media/river.mp4");
  await video.evaluate(async (el: HTMLVideoElement) => {
    el.muted = true;
    await el.play();
  });
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0);
  await page.goto("/series/letters");
  await expect(
    page.getByRole("heading", { name: "Letters to Silence" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "The Blue Letter" }),
  ).toBeVisible();
  await page.goto("/album/first-light");
  await expect(
    page.getByRole("heading", { name: "First Light" }),
  ).toBeVisible();
  await page.goto("/poet/sohel");
  await expect(
    page.getByRole("heading", { name: "Sohel Azad", exact: true }),
  ).toBeVisible();
});
test("admin creates draft, edits, publishes, exports and deletes", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("ডেমো পাসওয়ার্ড").fill("wrong");
  await page.getByRole("button", { name: "প্রবেশ করুন" }).click();
  await expect(page.locator(".alert")).toContainText("পাসওয়ার্ড সঠিক নয়");
  await page.getByLabel("ডেমো পাসওয়ার্ড").fill("poetry-demo");
  await page.getByRole("button", { name: "প্রবেশ করুন" }).click();
  await page.getByRole("button", { name: "নতুন যোগ করুন" }).click();
  await page.getByLabel("বাংলা শিরোনাম").fill("পরীক্ষার কবিতা");
  await page.getByLabel("English title").fill("Test poem");
  await page.getByRole("button", { name: "সংরক্ষণ করুন" }).click();
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "Test poem" }),
  ).toContainText("draft");
  await page.goto("/poetry");
  await page.getByRole("textbox").fill("Test poem");
  await expect(
    page.getByText("কোনো কবিতা পাওয়া যায়নি। অন্য শব্দ বা বিভাগ চেষ্টা করুন।"),
  ).toBeVisible();
  await page.goto("/admin");
  const row = page.getByRole("row").filter({ hasText: "Test poem" });
  await row.getByRole("button", { name: "সম্পাদনা" }).click();
  await page.getByLabel("English title").fill("Edited test poem");
  await page.getByRole("button", { name: "সংরক্ষণ করুন" }).click();
  await row.getByRole("button", { name: "প্রকাশ", exact: true }).click();
  await page.goto("/poetry");
  await page.getByRole("textbox").fill("Edited test poem");
  await expect(
    page.getByRole("heading", { name: "পরীক্ষার কবিতা" }),
  ).toBeVisible();
  await page.goto("/admin");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "ব্যাকআপ" }).click();
  expect((await download).suggestedFilename()).toBe(
    "poetic-melodies-backup.json",
  );
  page.on("dialog", (d) => d.accept());
  await page
    .getByRole("row")
    .filter({ hasText: "Edited test poem" })
    .getByRole("button", { name: "মুছুন" })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Edited test poem" }),
  ).toHaveCount(0);
});
test("phone layout and offline public shell", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "কবিতা যখন গান হয়ে ওঠে।" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "আপনি অফলাইনে আছেন। সংরক্ষিত পৃষ্ঠা ও স্থানীয় অডিও ব্যবহার করতে পারবেন।",
    ),
  ).toBeVisible();
  await context.setOffline(false);
});

test("backup import restores validated content and category publishing hides related poems", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("ডেমো পাসওয়ার্ড").fill("poetry-demo");
  await page.getByRole("button", { name: "প্রবেশ করুন" }).click();
  const backup = await page.evaluate(() =>
    localStorage.getItem("poetic-melodies-v1"),
  );
  const data = backup ? JSON.parse(backup) : null;
  await page.getByRole("button", { name: "বিভাগ", exact: true }).click();
  const nature = page.getByRole("row").filter({ hasText: "Nature" });
  await nature.getByRole("button", { name: "খসড়া", exact: true }).click();
  await page.goto("/poetry");
  await expect(
    page.getByRole("heading", { name: "জানালার ওপারে" }),
  ).toHaveCount(0);
  await page.goto("/admin");
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("poetic-melodies-v1")!),
  );
  stored.categories.find((x: { id: string }) => x.id === "nature").status =
    "published";
  page.once("dialog", (d) => d.accept());
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(data || stored)),
    });
  await expect(page.getByText("Backup restored.")).toBeVisible();
  await page.goto("/poetry");
  await expect(
    page.getByRole("heading", { name: "জানালার ওপারে" }),
  ).toBeVisible();
});
