import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");
});

const TODO_ITEMS = [
  "buy some cheese",
  "feed the cat",
  "book a doctors appointment",
];

test.describe("新待办事项", () => {
  test("应该允许我添加待办事项吗", async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder("What needs to be done?");

    // Create 1st todo.
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press("Enter");

    // Make sure the list only has one todo item.
    await expect(page.getByTestId("todo-title")).toHaveText([TODO_ITEMS[0]]);

    // Create 2nd todo.
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press("Enter");

    // Make sure the list now has two todo items.
    await expect(page.getByTestId("todo-title")).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1],
    ]);

    await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test("当添加项时，应该清除文本输入字段吗?", async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder("What needs to be done?");

    // Create one todo item.
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press("Enter");

    // Check that input is empty.
    await expect(newTodo).toBeEmpty();
    await checkNumberOfTodosInLocalStorage(page, 1);
  });

  test("是否应该在列表底部添加新项目", async ({ page }) => {
    // Create 3 items.
    await createDefaultTodos(page);

    // create a todo count locator
    const todoCount = page.getByTestId("todo-count");

    // Check test using different methods.
    await expect(page.getByText("3 items left")).toBeVisible();
    await expect(todoCount).toHaveText("3 items left");
    await expect(todoCount).toContainText("3");
    await expect(todoCount).toHaveText(/3/);

    // Check all items in one call.
    await expect(page.getByTestId("todo-title")).toHaveText(TODO_ITEMS);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });
});

test.describe("将所有标记为已完成", () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test.afterEach(async ({ page }) => {
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test("是否允许我将所有项目标记为已完成", async ({ page }) => {
    // Complete all todos.
    await page.getByLabel("Mark all as complete").check();

    // Ensure all todos have 'completed' class.
    await expect(page.getByTestId("todo-item")).toHaveClass([
      "completed",
      "completed",
      "completed",
    ]);
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);
  });

  test("是否允许我清除所有项目的完整状态", async ({ page }) => {
    const toggleAll = page.getByLabel("Mark all as complete");
    // Check and then immediately uncheck.
    await toggleAll.check();
    await toggleAll.uncheck();

    // Should be no completed classes.
    await expect(page.getByTestId("todo-item")).toHaveClass(["", "", ""]);
  });

  test("当项目完成/清除时，完成所有复选框应更新状态", async ({ page }) => {
    const toggleAll = page.getByLabel("Mark all as complete");
    await toggleAll.check();
    await expect(toggleAll).toBeChecked();
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Uncheck first todo.
    const firstTodo = page.getByTestId("todo-item").nth(0);
    await firstTodo.getByRole("checkbox").uncheck();

    // Reuse toggleAll locator and make sure its not checked.
    await expect(toggleAll).not.toBeChecked();

    await firstTodo.getByRole("checkbox").check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Assert the toggle all is checked again.
    await expect(toggleAll).toBeChecked();
  });
});

test.describe("项目", () => {
  test("是否允许我将项目标记为完成", async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder("What needs to be done?");

    // Create two items.
    for (const item of TODO_ITEMS.slice(0, 2)) {
      await newTodo.fill(item);
      await newTodo.press("Enter");
    }

    // Check first item.
    const firstTodo = page.getByTestId("todo-item").nth(0);
    await firstTodo.getByRole("checkbox").check();
    await expect(firstTodo).toHaveClass("completed");

    // Check second item.
    const secondTodo = page.getByTestId("todo-item").nth(1);
    await expect(secondTodo).not.toHaveClass("completed");
    await secondTodo.getByRole("checkbox").check();

    // Assert completed class.
    await expect(firstTodo).toHaveClass("completed");
    await expect(secondTodo).toHaveClass("completed");
  });

  test("是否允许我取消已完成项目的标记", async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder("What needs to be done?");

    // Create two items.
    for (const item of TODO_ITEMS.slice(0, 2)) {
      await newTodo.fill(item);
      await newTodo.press("Enter");
    }

    const firstTodo = page.getByTestId("todo-item").nth(0);
    const secondTodo = page.getByTestId("todo-item").nth(1);
    const firstTodoCheckbox = firstTodo.getByRole("checkbox");

    await firstTodoCheckbox.check();
    await expect(firstTodo).toHaveClass("completed");
    await expect(secondTodo).not.toHaveClass("completed");
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    await firstTodoCheckbox.uncheck();
    await expect(firstTodo).not.toHaveClass("completed");
    await expect(secondTodo).not.toHaveClass("completed");
    await checkNumberOfCompletedTodosInLocalStorage(page, 0);
  });

  test("应该允许我编辑一个项目吗", async ({ page }) => {
    await createDefaultTodos(page);

    const todoItems = page.getByTestId("todo-item");
    const secondTodo = todoItems.nth(1);
    await secondTodo.dblclick();
    await expect(secondTodo.getByRole("textbox", { name: "Edit" })).toHaveValue(
      TODO_ITEMS[1]
    );
    await secondTodo
      .getByRole("textbox", { name: "Edit" })
      .fill("buy some sausages");
    await secondTodo.getByRole("textbox", { name: "Edit" }).press("Enter");

    // Explicitly assert the new text value.
    await expect(todoItems).toHaveText([
      TODO_ITEMS[0],
      "buy some sausages",
      TODO_ITEMS[2],
    ]);
    await checkTodosInLocalStorage(page, "buy some sausages");
  });
});

test.describe("编辑时", () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test("编辑时是否应该隐藏其他控件", async ({ page }) => {
    const todoItem = page.getByTestId("todo-item").nth(1);
    await todoItem.dblclick();
    await expect(todoItem.getByRole("checkbox")).not.toBeVisible();
    await expect(
      todoItem.locator("label", {
        hasText: TODO_ITEMS[1],
      })
    ).not.toBeVisible();
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test("应该保存模糊编辑吗", async ({ page }) => {
    const todoItems = page.getByTestId("todo-item");
    await todoItems.nth(1).dblclick();
    await todoItems
      .nth(1)
      .getByRole("textbox", { name: "Edit" })
      .fill("buy some sausages");
    await todoItems
      .nth(1)
      .getByRole("textbox", { name: "Edit" })
      .dispatchEvent("blur");

    await expect(todoItems).toHaveText([
      TODO_ITEMS[0],
      "buy some sausages",
      TODO_ITEMS[2],
    ]);
    await checkTodosInLocalStorage(page, "buy some sausages");
  });

  test("应该修改输入的文本吗?", async ({ page }) => {
    const todoItems = page.getByTestId("todo-item");
    await todoItems.nth(1).dblclick();
    await todoItems
      .nth(1)
      .getByRole("textbox", { name: "Edit" })
      .fill("    buy some sausages    ");
    await todoItems
      .nth(1)
      .getByRole("textbox", { name: "Edit" })
      .press("Enter");

    await expect(todoItems).toHaveText([
      TODO_ITEMS[0],
      "buy some sausages",
      TODO_ITEMS[2],
    ]);
    await checkTodosInLocalStorage(page, "buy some sausages");
  });

  test("如果输入了一个空文本字符串，是否应该删除该项", async ({ page }) => {
    const todoItems = page.getByTestId("todo-item");
    await todoItems.nth(1).dblclick();
    await todoItems.nth(1).getByRole("textbox", { name: "Edit" }).fill("");
    await todoItems
      .nth(1)
      .getByRole("textbox", { name: "Edit" })
      .press("Enter");

    await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test("应该取消escape上的编辑吗", async ({ page }) => {
    const todoItems = page.getByTestId("todo-item");
    await todoItems.nth(1).dblclick();
    await todoItems
      .nth(1)
      .getByRole("textbox", { name: "Edit" })
      .fill("buy some sausages");
    await todoItems
      .nth(1)
      .getByRole("textbox", { name: "Edit" })
      .press("Escape");
    await expect(todoItems).toHaveText(TODO_ITEMS);
  });
});

test.describe("计数器", () => {
  test("应该显示当前的待办事项数吗", async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder("What needs to be done?");

    // create a todo count locator
    const todoCount = page.getByTestId("todo-count");

    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press("Enter");

    await expect(todoCount).toContainText("1");

    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press("Enter");
    await expect(todoCount).toContainText("2");

    await checkNumberOfTodosInLocalStorage(page, 2);
  });
});

test.describe("清除已完成按钮", () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
  });

  test("应该显示正确的文本吗", async ({ page }) => {
    await page.locator(".todo-list li .toggle").first().check();
    await expect(
      page.getByRole("button", { name: "Clear completed" })
    ).toBeVisible();
  });

  test("点击应该删除完成的项目时", async ({ page }) => {
    const todoItems = page.getByTestId("todo-item");
    await todoItems.nth(1).getByRole("checkbox").check();
    await page.getByRole("button", { name: "Clear completed" }).click();
    await expect(todoItems).toHaveCount(2);
    await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test("应该在没有完成项目的时候隐藏吗", async ({ page }) => {
    await page.locator(".todo-list li .toggle").first().check();
    await page.getByRole("button", { name: "Clear completed" }).click();
    await expect(
      page.getByRole("button", { name: "Clear completed" })
    ).toBeHidden();
  });
});

test.describe("继续", () => {
  test("应该保存它的数据", async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder("What needs to be done?");

    for (const item of TODO_ITEMS.slice(0, 2)) {
      await newTodo.fill(item);
      await newTodo.press("Enter");
    }

    const todoItems = page.getByTestId("todo-item");
    const firstTodoCheck = todoItems.nth(0).getByRole("checkbox");
    await firstTodoCheck.check();
    await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    await expect(firstTodoCheck).toBeChecked();
    await expect(todoItems).toHaveClass(["completed", ""]);

    // Ensure there is 1 completed item.
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    // Now reload.
    await page.reload();
    await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    await expect(firstTodoCheck).toBeChecked();
    await expect(todoItems).toHaveClass(["completed", ""]);
  });
});

test.describe("路由选择", () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
    // make sure the app had a chance to save updated todos in storage
    // before navigating to a new view, otherwise the items can get lost :(
    // in some frameworks like Durandal
    await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
  });

  test("应该允许我显示活动项目吗", async ({ page }) => {
    const todoItem = page.getByTestId("todo-item");
    await page.getByTestId("todo-item").nth(1).getByRole("checkbox").check();

    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole("link", { name: "Active" }).click();
    await expect(todoItem).toHaveCount(2);
    await expect(todoItem).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test("可以后退按钮吗", async ({ page }) => {
    const todoItem = page.getByTestId("todo-item");
    await page.getByTestId("todo-item").nth(1).getByRole("checkbox").check();

    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    await test.step("Showing all items", async () => {
      await page.getByRole("link", { name: "All" }).click();
      await expect(todoItem).toHaveCount(3);
    });

    await test.step("Showing active items", async () => {
      await page.getByRole("link", { name: "Active" }).click();
    });

    await test.step("Showing completed items", async () => {
      await page.getByRole("link", { name: "Completed" }).click();
    });

    await expect(todoItem).toHaveCount(1);
    await page.goBack();
    await expect(todoItem).toHaveCount(2);
    await page.goBack();
    await expect(todoItem).toHaveCount(3);
  });

  test("应该允许我显示已完成的项目吗", async ({ page }) => {
    await page.getByTestId("todo-item").nth(1).getByRole("checkbox").check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole("link", { name: "Completed" }).click();
    await expect(page.getByTestId("todo-item")).toHaveCount(1);
  });

  test("应该允许我显示所有的项目吗", async ({ page }) => {
    await page.getByTestId("todo-item").nth(1).getByRole("checkbox").check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole("link", { name: "Active" }).click();
    await page.getByRole("link", { name: "Completed" }).click();
    await page.getByRole("link", { name: "All" }).click();
    await expect(page.getByTestId("todo-item")).toHaveCount(3);
  });

  test("应该突出当前应用的过滤器吗", async ({ page }) => {
    await expect(page.getByRole("link", { name: "All" })).toHaveClass(
      "selected"
    );

    //create locators for active and completed links
    const activeLink = page.getByRole("link", { name: "Active" });
    const completedLink = page.getByRole("link", { name: "Completed" });
    await activeLink.click();

    // Page change - active items.
    await expect(activeLink).toHaveClass("selected");
    await completedLink.click();

    // Page change - completed items.
    await expect(completedLink).toHaveClass("selected");
  });
});

async function createDefaultTodos(page: Page) {
  // create a new todo locator
  const newTodo = page.getByPlaceholder("What needs to be done?");

  for (const item of TODO_ITEMS) {
    await newTodo.fill(item);
    await newTodo.press("Enter");
  }
}

async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
  return await page.waitForFunction((e) => {
    return JSON.parse(localStorage["react-todos"]).length === e;
  }, expected);
}

async function checkNumberOfCompletedTodosInLocalStorage(
  page: Page,
  expected: number
) {
  return await page.waitForFunction((e) => {
    return (
      JSON.parse(localStorage["react-todos"]).filter(
        (todo: any) => todo.completed
      ).length === e
    );
  }, expected);
}

async function checkTodosInLocalStorage(page: Page, title: string) {
  return await page.waitForFunction((t) => {
    return JSON.parse(localStorage["react-todos"])
      .map((todo: any) => todo.title)
      .includes(t);
  }, title);
}
