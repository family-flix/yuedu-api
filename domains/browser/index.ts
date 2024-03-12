import puppeteer, { Browser, HTTPRequest, HTTPResponse } from "puppeteer";

import { sleep } from "@/utils/index";
import { Result } from "@/types/index";

import { PageRequestPayload } from "./types";
import { cleanHTML } from "./utils";

const iPhone = puppeteer.devices["iPhone 6"];

interface BrowserHelperProps {
  browser: puppeteer.Browser;
}
export class BrowserHelper {
  static async Launch(props: Partial<{ headless: boolean; proxy: boolean }> = {}) {
    const { headless = false, proxy } = props;
    const browser = await puppeteer.launch({
      headless: true,
      // ...(() => {
      //   if (headless) {
      //     return {
      //       headless: true,
      //     };
      //   }
      //   return {
      //     executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      //     headless: false,
      //   };
      // })(),
      ignoreHTTPSErrors: true,
      // devtools: true,
      args: [
        // "--no-sandbox",
        // "--single-process",
        // "--no-zygote",
        // "--disable-setuid-sandbox",
        proxy ? `--proxy-server=${proxy}` : "",
      ].filter(Boolean),
    });
    return Result.Ok(new BrowserHelper({ browser }));
  }

  browser: puppeteer.Browser;
  cur_page: puppeteer.Page | null = null;

  constructor(props: BrowserHelperProps) {
    const { browser } = props;

    this.browser = browser;
  }

  async open(page_url: string) {
    const page = await this.browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );
    await page.goto(page_url, {
      waitUntil: "domcontentloaded",
    });
    this.cur_page = page;
    return Result.Ok(page);
  }
  async goto(url: string) {
    if (!this.cur_page) {
      return Result.Err("请先使用 open 方法打开页面");
    }
    console.log("[LOG]goto page", url);
    this.cur_page.on("load", () => {
      console.log("[LOG]page", url, "is loaded");
    });
    await this.cur_page.goto(url, {
      waitUntil: "domcontentloaded",
      // waitUntil: "networkidle2",
    });
    // setTimeout(() => {
    //   return Promise.resolve(Result.Err(`'${url}' 打开超时`));
    // }, 3000);
    return Result.Ok(this.cur_page);
  }
  async wrap<T extends (...args: any[]) => any, R extends ReturnType<T>>(fn: T): Promise<Result<R>> {
    try {
      const r = await fn();
      return Result.Ok(r);
    } catch (err) {
      const e = err as Error;
      return Result.Err(e.message);
    }
  }
  async request(params: PageRequestPayload) {
    const { url, mobile, host, cache_key = "", i = [], kw = "" } = params;

    const page = await this.browser.newPage();
    // await page.setRequestInterception(true);
    // page.on("request", (request) => {
    //   if (request.isNavigationRequest() && request.redirectChain().length) {
    //     request.abort();
    //     return;
    //   }
    //   // const u = request.url();
    //   const type = request.resourceType();
    //   // 起点的章节列表必须要这个逻辑
    //   if (["stylesheet", "font"].includes(type)) {
    //     request.abort();
    //     return;
    //   }
    //   request.continue();
    // });
    // page.on("response", (response) => {
    //   const u = response.url();
    // });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );
    if (mobile) {
      await page.emulate(iPhone);
      await page.setViewport({
        width: 750,
        height: 1334,
      });
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
      return Result.Err(`Request url: ${url} failed because ${error.message}`);
    }
    console.log("[LOG] reach page");
    // 执行交互
    // try {
    //   for (let ii = 0; ii < i.length; ii += 1) {
    //     const [method, selector] = i[ii];
    //     if (method === "click") {
    //       await page.click(selector);
    //     }
    //     if (method === "type") {
    //       await page.type(selector, kw);
    //     }
    //     if (method === "waitForSelector") {
    //       await page.waitForSelector(selector);
    //     }
    //   }
    // } catch (err) {
    //   const error = err as any;
    //   return Result.Err(`Execute some actions failed because ${error.message}`);
    // }
    await page.waitForTimeout(1000);
    const html = await page.content();
    await page.close();
    const clean_html = cleanHTML(html);
    //     if (Cache) {
    //       await Cache.set(url + cache_key, clean_html);
    //     }
    return Result.Ok(clean_html);
  }
  destroy() {
    this.browser.close();
  }
}

// import { ICache, PageRequestPayload, Result } from "./types";
// import { cleanHTML, Err, Ok } from "./utils";
