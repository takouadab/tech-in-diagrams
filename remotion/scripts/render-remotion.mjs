import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] ?? "/mnt/documents/what-is-cloud-computing-short.mp4";
const stills = (process.argv[3] ?? "").split(",").filter(Boolean);

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl: bundled, id: "main", puppeteerInstance: browser });

for (const s of stills) {
  const [frame, file] = s.split(":");
  await renderStill({
    composition,
    serveUrl: bundled,
    frame: Number(frame),
    output: file,
    puppeteerInstance: browser,
    overwrite: true,
  });
  console.log("still", frame, file);
}

if (out !== "none") {
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: out,
    puppeteerInstance: browser,
    muted: true,
    concurrency: 2,
    overwrite: true,
  });
  console.log("rendered", out);
}

await browser.close({ silent: false });
