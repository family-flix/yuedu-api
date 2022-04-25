import puppeteer, { Browser } from "puppeteer";

import { HtmlCache } from "./cache";

const Cache = new HtmlCache();
let existingBrowser: null | Browser = null;

export async function requestPage(url: string) {
  console.log("[LOG] Start request page");

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
  // page.on("request", (req) => {
  //   if (["stylesheet", "font"].includes(req.resourceType())) {
  //     req.abort();
  //     return;
  //   }
  //   req.continue();
  // });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
  );
  const u = url.includes("http") ? url : `https:${url}`;
  await page.goto(u, {});
  console.log("[LOG] reach page");
  const html = await page.content();
  await page.close();

  await Cache.set(url, html);

  return html;
}

export function destroy_browser() {
  if (existingBrowser) {
    existingBrowser.close();
  }
}
