# playwright-demo

Play with this tool Playwright。玩一下这个前端自动化工具。

## 1. Install

在当前工作区中安装 vscode 插件：[Playwright Test](https://marketplace.visualstudio.com/items?itemName=mlewand.playwright-test)

初始化：cmd + p，输入 install Playwright，选择 谷歌浏览器 点击 Ok，安静等待安装。

## 2. Run 的两种方式

### VS Code 插件的方式运行

点击左侧菜单栏的测试，点击显示浏览器，然后运行监测到的测试用例，最后会生成可视化的报表。

### 命令运行

直接通过 npx playwright test --ui ，以可视化的方式运行测试用例

## 3. 录制

录制的功能是 VS Code 插件带的。

1. 点击左侧菜单栏的测试，点击运行一个 first 目录下的文件`index.spec.ts`中的单测。
2. 然后把光标放到 `await context.storageState({ path: "state.json" });` 的下一行
3. 点击在当前光标处开始录制，然后操作浏览器，操作完毕后点击停止录制。代码就会自动生成到 first 文件下。
4. 但是这个代码非常的鸡肋，不会有任何判断，只是简单的傻瓜操作。如果你想要更加智能的代码，需要自己完善逻辑。

state.json 就是记录了浏览器的状态，比如登录状态，cookie 等等。当你登录过一次，  
就可以`await context.storageState({ path: "state.json" });`生成文件，  
然后在playwright.config.ts中把`// storageState: "state.json",`的注释打开，  
就可以在每次运行测试用例的时候，自动加载这个状态，就不用每次都登录了。

two中的代码就是录制的代码，需要 state.json 文件存在，且需要在 playwright.config.ts 中打开`storageState: "state.json",`的注释。

## 4. 其它

它还支持其它的拓展功能，通过`page.$、page.locator`进行选择器的查询，单元测的expect断言，通过fetch主动发起额外的请求，通过page.click()模拟点击，通过page.fill()模拟输入，通过page.selectOption()模拟下拉框选择，通过page.evaluate()执行js脚本，通过page.waitForSelector()等待元素出现，通过page.waitForTimeout()等待时间，通过page.waitForNavigation()等待页面跳转，通过page.waitForRequest()等待网络请求，通过page.waitForResponse()等待网络响应，通过page.waitForEvent()等待事件触发，通过page.emulateMedia()模拟设备，通过page.emulateTimezone()模拟时区，通过page.emulateLocale()模拟语言，通过page.emulateVisionDeficiency()模拟视力缺陷，通过page.emulateMediaFeatures()模拟媒体特性，通过page.emulateMediaType()模拟媒体类型，通过page.emulateDevice()模拟设备，通过page.emulate()模拟设备等等

更多请看 [playwright](https://playwright.dev/docs/api/class-playwright)

