import axios from "axios";
import fetch from "node-fetch";

// import { BookSourceCore } from "@/domains/yuedu";

// import { sources } from "./sources";
import { BrowserHelper } from "@/domains/browser";

async function main() {
  const r = await BrowserHelper.Launch();
  if (r.error) {
    return;
  }
  const browser = r.data;
  const r2 = await browser.open("https://cn.ttkan.co/");
  if (r2.error) {
    return;
  }
  const page = r2.data;
  // page.on("request", (request) => console.log(`Request: ${request.url()}`));
  // page.on("response", (response) => console.log(`Response: ${response.status()} ${response.url()}`));
  // page.on("framenavigated", (frame) => console.log(`Frame navigated: ${frame.url()}`));

  // const url = "https://cn.ttkan.co/novel/user/page_direct?novel_id=daoguiyixian-huweidebi&page=3";
  const url = "https://cn.bg3.co/novel/pagea/daoguiyixian-huweidebi_1.html";
  try {
    await page.goto(url);
  } catch (error) {
    console.error("Navigation failed:", error);
  }
  browser.destroy();
}
main();
