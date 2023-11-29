import { test, expect, type Page } from "@playwright/test";

test("login", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "msToken",
      value: "enter input",
      path: "/",
      domain: ".juejin.cn",
      secure: true,
    },
    {
      name: "sessionid",
      value: "enter input",
      path: "/",
      domain: ".juejin.cn",
      httpOnly: true,
      secure: true,
    },
    {
      name: "sessionid_ss",
      value: "enter input",
      path: "/",
      domain: ".juejin.cn",
      httpOnly: true,
      secure: true,
    },
  ]);
  await page.goto("https://juejin.cn/user/3562073406845768");
  await context.storageState({ path: "state.json" });
});
