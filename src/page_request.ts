import puppeteer, { Browser, HTTPRequest, HTTPResponse } from "puppeteer";
import { ICache, IPageRequestParams, Result } from "./types";
import { cleanHTML, Err, Ok } from "./utils";

const iPhone = puppeteer.devices["iPhone 6"];
let existingBrowser: null | Browser = null;
let destroy_browser_timer: NodeJS.Timeout | null = null;

const headless = false;

export function requestPage(Cache: null | ICache) {
  return {
    request: async (params: IPageRequestParams): Promise<Result<any>> => {
      console.log("[LOG] Start request page");
      const { url, mobile, host, cache_key = "", i = [], kw = "" } = params;

      if (destroy_browser_timer) {
        clearTimeout(destroy_browser_timer);
      }
      destroy_browser_timer = setTimeout(() => {
        destroy_browser();
      }, 3 * 60 * 1000);

      if (Cache) {
        const cache = await Cache.get(url + cache_key);
        if (cache) {
          console.log("[LOG] use cache\n");
          return Ok(cache);
        }
      }

      console.log("[LOG] the url is");
      console.log(url);
      console.log("");
      if (existingBrowser === null) {
        existingBrowser = await puppeteer.launch({
          ...(() => {
            if (headless) {
              return {
                headless: true,
              };
            }
            return {
              executablePath:
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              headless: false,
            };
          })(),
          ignoreHTTPSErrors: true,
          args: [
            // "--no-sandbox",
            // "--single-process",
            // "--no-zygote",
            // "--disable-setuid-sandbox",
          ],
        });
      }
      console.log("[LOG] open page prepare goto url");
      const page = await existingBrowser.newPage();
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (request.isNavigationRequest() && request.redirectChain().length) {
          request.abort();
          return;
        }
        // const u = request.url();
        const type = request.resourceType();
        // 起点的章节列表必须要这个逻辑
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
      // await page.setCookie({
      //   name: "cf_clearance",
      //   value: "JImoUHm3Ihean_bt8jER3IEQE.p3FaPMecn3vjghlCs-1651202157-0-150",
      //   domain: ".caimoge.com",
      // });
      try {
        if (host) {
          console.log("[LOG] goto host before goto target url");
          await page.goto(host, {
            waitUntil: "domcontentloaded",
          });
        }
        const u = url.includes("http") ? url : `https:${url}`;
        console.log("[LOG] goto url");
        await page.goto(u, {
          // 起点的章节列表不能有这个
          // waitUntil: "domcontentloaded",
          waitUntil: "load",
        });
      } catch (err) {
        console.log("[ERROR] goto url failed.");
        const error = err as any;
        return Err(`Request url: ${url} failed because ${error.message}`);
      }
      console.log("[LOG] reach page");
      // 执行交互
      try {
        for (let ii = 0; ii < i.length; ii += 1) {
          const [method, selector] = i[ii];
          if (method === "click") {
            // console.log("click page", selector);
            await page.click(selector);
          }
          if (method === "type") {
            await page.type(selector, kw);
          }
          if (method === "waitForSelector") {
            // console.log("waitForSelector page", selector);
            await page.waitForSelector(selector);
          }
        }
      } catch (err) {
        const error = err as any;
        return Err(`Exec some actions failed because ${error.message}`);
      }

      await page.waitForTimeout(1000);
      const html = await page.content();
      await page.close();

      const clean_html = cleanHTML(html);

      if (Cache) {
        await Cache.set(url + cache_key, clean_html);
      }

      return Ok(clean_html);
    },
    destroy: destroy_browser,
  };
}

export function destroy_browser() {
  if (existingBrowser) {
    existingBrowser.close();
    existingBrowser = null;
  }
}
