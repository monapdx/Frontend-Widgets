// Optional browser checks: requires Playwright and its Chromium browser.
const { chromium } = require("playwright"),
  fs = require("fs"),
  path = require("path"),
  http = require("http"),
  assert = require("assert/strict");
(async () => {
  const root = path.resolve(__dirname, ".."),
    server = http
      .createServer((req, res) => {
        let file = path.join(root, decodeURIComponent(req.url.split("?")[0]));
        if (file.endsWith("/")) file += "index.html";
        try {
          res.setHeader(
            "Content-Type",
            file.endsWith(".css")
              ? "text/css"
              : file.endsWith(".js")
                ? "text/javascript"
                : file.endsWith(".png")
                  ? "image/png"
                  : "text/html",
          );
          res.end(fs.readFileSync(file));
        } catch {
          res.statusCode = 404;
          res.end();
        }
      })
      .listen(8765, "127.0.0.1");
  const b = await chromium.launch({
    headless: true,
    executablePath: process.env.WIDGET_BROWSER_EXECUTABLE || undefined,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const p = await b.newPage({
    viewport: { width: 1280, height: 900 },
    acceptDownloads: true,
  });
  await p.route(/https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const goto = (f) => p.goto("http://127.0.0.1:8765/" + f);
  const checks = [];
  const pass = (x) => {
    checks.push(x);
    console.log("PASS", x);
  };
  try {
    await goto("styles/preview.html");
    await p.click("#theme");
    assert.equal(
      await p.evaluate(() => getComputedStyle(document.body).backgroundColor),
      "rgb(27, 22, 33)",
    );
    await p.click("#theme");
    await p.locator("#name").focus();
    assert.equal(
      await p
        .locator("#name")
        .evaluate((e) => getComputedStyle(e).outlineStyle),
      "solid",
    );
    await p.evaluate(() => {
      let e = document.createElement("button");
      e.hidden = true;
      document.body.append(e);
    });
    assert.equal(
      await p
        .locator("button[hidden]")
        .evaluate((e) => getComputedStyle(e).display),
      "none",
    );
    pass("Light/dark theme, focus ring, and hidden controls");
    await goto("index.html");
    const total = await p.locator(".card:visible").count();
    assert(total > 20);
    await p.locator("#search").fill("Pixel");
    const filtered = await p.locator(".card:visible").count();
    assert(filtered > 0 && filtered < total);
    pass("Catalog filtering");
    await goto("table-generator.html");
    await p.click("#generateTable");
    assert.equal(await p.locator(".grid-table > div").count(), 33);
    await p.locator(".editable").first().fill("Works");
    assert.equal(await p.locator(".editable").first().textContent(), "Works");
    pass("Table generation and editing");
    await goto("button-generator.html");
    await p.locator("#solidHex").fill("#e69dfc");
    await p.locator("#solidHex").dispatchEvent("input");
    assert.equal(
      await p
        .locator("#previewEl")
        .evaluate((e) => getComputedStyle(e).backgroundColor),
      "rgb(230, 157, 252)",
    );
    assert.equal(
      await p.locator("#previewEl").evaluate((e) => getComputedStyle(e).color),
      "rgb(255, 255, 255)",
    );
    await p.locator("#url").fill("https://example.com");
    assert.equal(await p.locator("#previewEl").evaluate((e) => e.tagName), "A");
    pass("Button preview respects chosen color and switches element type");
    await goto("pixel-art-to-svg.html");
    await p
      .locator("#pixelFile")
      .setInputFiles({
        name: "pixel.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    await p.waitForFunction(() =>
      document.querySelector("#svgOutput").textContent.includes("<svg"),
    );
    pass("Image upload and SVG generation");
    await goto("offline-GPT.html");
    await p.click("#demoBtn");
    assert((await p.locator(".chat").count()) > 0);
    await p.locator(".chat").first().click();
    assert((await p.locator(".msg").count()) > 0);
    pass("Chat archive demo and conversation rendering");
    await goto("quiz-builder.html");
    await p.click("#demo-btn");
    const download = p.waitForEvent("download");
    await p.click("#generate-btn");
    const d = await download;
    const output = fs.readFileSync(await d.path(), "utf8");
    assert(output.includes("const wordList"));
    assert(!output.includes("neo-brutal"));
    pass("Quiz exports standalone HTML without retired CSS");
    await goto("email-viewer.html");
    await p
      .locator("#file")
      .setInputFiles({
        name: "test.mbox",
        mimeType: "text/plain",
        buffer: Buffer.from(
          "From sender@example.com Sat Nov 01 00:00:00 2026\nFrom: Sender <sender@example.com>\nTo: reader@example.com\nSubject: Foundation test\nDate: Sun, 1 Nov 2026 00:00:00 +0000\nContent-Type: text/plain; charset=UTF-8\n\nHello from the test.\n",
        ),
      });
    await p.waitForFunction(() =>
      document.body.textContent.includes("Foundation test"),
    );
    await p.locator(".list .row").first().click();
    assert((await p.locator("#textBox").textContent()).includes("Hello"));
    pass("MBOX upload and message rendering");
    const files = fs
      .readdirSync(root)
      .filter(
        (f) =>
          f.endsWith(".html") &&
          fs.readFileSync(f, "utf8").includes("styles/widgets.css"),
      );
    for (const width of [1280, 390]) {
      await p.setViewportSize({ width, height: 900 });
      for (const file of files) {
        await goto(file);
        const overflow = await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        assert(!overflow, `${file} overflows at ${width}px`);
      }
      pass(`All ${files.length} migrated root pages fit at ${width}px`);
    }
    await p.setViewportSize({ width: 390, height: 844 });
    await goto("styles/preview.html");
    pass("Mobile style preview");
    console.log("Completed", checks.length, "checks");
  } finally {
    await b.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
