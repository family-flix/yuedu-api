import puppeteer, { Browser } from "puppeteer";

import { HtmlCache } from "./cache";

const Cache = new HtmlCache();
const iPhone = puppeteer.devices["iPhone 6"];
let existingBrowser: null | Browser = null;
let destroy_browser_timer: NodeJS.Timeout | null = null;

export async function requestPage(
  url: string,
  params: { mobile?: boolean; i?: [string, string, string?][] } = {}
) {
  console.log("[LOG] Start request page");
  const { mobile, i = [] } = params;

  if (destroy_browser_timer) {
    clearTimeout(destroy_browser_timer);
  }
  destroy_browser_timer = setTimeout(() => {
    destroy_browser();
  }, 3 * 60 * 1000);

  const cache = await Cache.get(url);
  if (cache) {
    console.log("[LOG] use cache\n");
    return cache;
  }

  console.log("[LOG] the url is");
  console.log(url);
  console.log("");
  if (existingBrowser === null) {
    existingBrowser = await puppeteer.launch({
      // executablePath:
      //   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
      ignoreHTTPSErrors: true,
      args: [
        // "--no-sandbox",
        // "--single-process",
        // "--no-zygote",
        // "--disable-setuid-sandbox",
      ],
    });
  }
  const page = await existingBrowser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    // const u = request.url();
    // if (u.includes("cm.g.doubleclick.net")) {
    //   request.abort();
    //   return;
    // }
    const type = request.resourceType();
    if (["stylesheet", "font"].includes(type)) {
      request.abort();
      return;
    }
    request.continue();
  });
  // page.on("response", (response) => {
  //   const u = response.url();
  // });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
  );
  if (mobile) {
    await page.emulate(iPhone);
  }
  const u = url.includes("http") ? url : `https:${url}`;
  await page.goto(u, {
    waitUntil: "domcontentloaded",
  });
  console.log("[LOG] reach page");
  // 执行交互
  for (let ii = 0; ii < i.length; ii += 1) {
    const [method, selector] = i[ii];
    if (method === "click") {
      // console.log("click page", selector);
      await page.click(selector);
    }
    if (method === "waitForSelector") {
      // console.log("waitForSelector page", selector);
      await page.waitForSelector(selector);
    }
  }

  const html = await page.content();
  await page.close();

  await Cache.set(url, html);

  return html;
}

export function destroy_browser() {
  if (existingBrowser) {
    existingBrowser.close();
    existingBrowser = null;
  }
}
