import { test, expect, type Page } from "@playwright/test";

test("掘金签到", async ({ page, context }) => {
  await page.goto("https://juejin.cn/user/3562073406845768");
  await context.storageState({ path: "state.json" });
  await page
    .getByRole("banner")
    .getByRole("img", { name: "哎哟迪奥的头像" })
    .click();
  await page.getByRole("link", { name: "掘友等级 JY.3 84.9 /" }).click();
  await page.getByRole("link", { name: "每日签到" }).click();
  await page.getByRole("button", { name: "立即签到" }).click();
  await page.getByRole("button", { name: "去抽奖" }).click();
  await page.getByText("免费抽奖次数：1次").click();
  await page.getByRole("button", { name: "收下奖励" }).click();
  await context.close();
});
