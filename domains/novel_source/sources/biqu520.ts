import fs from "fs";
import path from "path";

import factory from "debug";
import { load } from "cheerio";

import { BrowserHelper } from "@/domains/browser/index";
import { HttpClientCore } from "@/domains/http_client/index";
import { connect } from "@/domains/http_client/connect.axios";
import { NovelSourceClient } from "@/domains/novel_source/types";
import { Result } from "@/types/index";

const debug = factory("yuedu:bg3");

type SearchedNovel = {
  id: string;
  name: string;
  url: string;
};
type SearchedNovelChapter = {
  id: string;
  name: string;
  url: string;
};

type SourceProps = {
  unique_id: string;
  browser?: BrowserHelper;
};
export class Biqu520Source extends NovelSourceClient {
  static hostname = "http://m.biqu520.net";
  // static async Start(props: { id: string; unique_id: string; browser: BrowserHelper }) {
  //   const { id, unique_id, browser } = props;
  //   const r = await BrowserHelper.Launch();
  //   if (r.error) {
  //     return Result.Err(r.error.message);
  //   }
  //   return Result.Ok(new Bg3Source({ browser: r.data }));
  // }

  unique_id: string;
  token = "";

  browser?: BrowserHelper;
  client: HttpClientCore;

  constructor(props: SourceProps) {
    const { unique_id, browser } = props;

    super(unique_id, "");

    this.unique_id = unique_id;
    this.browser = browser;
    this.client = new HttpClientCore({});
    this.client.appendHeaders({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      Connection: "keep-alive",
      Cookie:
        "rids=201459%2C199916; Hm_lvt_29308bff1e04139f17c5c9bf3dc6ffd7=1710751253; pv=4; cac=94; Hm_lpvt_29308bff1e04139f17c5c9bf3dc6ffd7=1710751262",
      Host: "m.biqu520.net",
      Referer: "http://m.biqu520.net/",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    });
    connect(this.client);
  }

  async search(keyword: string) {
    // const r = await this.browser.open(this.pages.home);
    // if (r.error) {
    //   return Result.Err(r.error.message);
    // }
    // const page = r.data;
    const r = await this.client.get<string>(
      `http://m.biqu520.net/modules/article/waps.php?keyword=${encodeURIComponent(keyword)}`,
      {},
      {
        charset: "gbk",
      }
    );
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const $ = load(r.data);
    const books_html: string[] = [];
    $(".line").each((i, el) => {
      const text = $(el).html();
      if (text) {
        books_html.push(text);
      }
    });
    const books = books_html
      .map((item) => {
        const url_r = /href="(\/info-[^"]{1,})\/"/;
        const url = item.match(url_r);
        const name_r = /href="\/info-[^"]{1,}\/"[^>]{1,}>([^<]{1,})<\/a/;
        const name = item.match(name_r);
        return {
          id: (() => {
            if (!url) {
              return null;
            }
            const r = url[1].match(/[0-9]{1,}/);
            if (!r) {
              return null;
            }
            return r[0];
          })(),
          name: name ? name[1] : null,
          url: url ? url[1] : null,
        };
      })
      .filter((book) => {
        return book.id && book.name && book.url;
      }) as SearchedNovel[];
    if (books.length === 0) {
      return Result.Err("没有搜索到结果");
    }
    const matched = this.find_matched_book(books, { name: keyword });
    if (!matched) {
      console.log(books);
      return Result.Err(`搜索到结果，但没有完美匹配 '${keyword}' 的结果`);
    }
    return Result.Ok(matched);
  }
  find_matched_book(books: SearchedNovel[], target: { name: string }) {
    for (let i = 0; i < books.length; i += 1) {
      const book = books[i];
      if (book.name === target.name) {
        return book;
      }
    }
    return null;
  }
  async fetch_chapters_by_page(id: string, page: number) {
    const r = await this.client.get<string>(
      `http://m.biqu520.net/wapbook-${id}_${page}_1/`,
      {},
      {
        charset: "gbk",
      }
    );
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const $ = load(r.data);
    const chapters_html: string[] = [];
    $(".chapter li").each((i, el) => {
      const text = $(el).html();
      if (text) {
        chapters_html.push(text.replace(/<span><\/span>/, ""));
      }
    });
    const chapters = chapters_html
      .map((item) => {
        const url_r = /href="(\/wapbook-[^"]{1,})"/;
        const url = item.match(url_r);
        const name_r = /">([^<]{1,})<\/a>/;
        const name = item.match(name_r);
        return {
          id: (() => {
            if (!url) {
              return null;
            }
            const r = url[1].match(/[0-9]{1,}-([0-9]{1,})/);
            if (!r) {
              return null;
            }
            return r[1];
          })(),
          name: name ? name[1] : null,
          url: url ? [Biqu520Source.hostname, url[1]].join("") : null,
        };
      })
      .filter((chapter) => {
        return chapter.id && chapter.name && chapter.url;
      }) as SearchedNovelChapter[];
    return Result.Ok({
      list: chapters,
      has_more: (() => {
        const e = $(".page").html();
        if (!e) {
          return false;
        }
        if (e.includes("下一页")) {
          return true;
        }
        return false;
      })(),
    });
  }
  async fetch_chapters(novel: { id: string }) {
    const { id } = novel;
    const chapters: SearchedNovelChapter[] = [];
    let page = 1;
    let has_more = true;
    do {
      await (async () => {
        const r1 = await this.fetch_chapters_by_page(id, page);
        page += 1;
        if (r1.error) {
          has_more = false;
          return;
        }
        has_more = r1.data.has_more;
        chapters.push(...r1.data.list);
      })();
    } while (has_more);
    return Result.Ok({
      chapters,
    });
  }
  async fetch_content(chapter: { url: string }) {
    const { url } = chapter;
    console.log([this.unique_id].join("/"), "fetch_content - before goto", url);
    const r = await this.client.get<string>(url, {}, { charset: "gbk" });
    if (r.error) {
      return Result.Err(r.error.message);
    }
    // const page = r.data;
    const $ = load(r.data);
    const $content = await $("div.text");
    if (!$content) {
      return Result.Err("没有找到 content");
    }
    const paragraphs: string[] = [];
    await $("div.text p").each((i, el) => {
      const html = $(el).text();
      if (html) {
        paragraphs.push(html);
      }
    });
    if (!paragraphs.length) {
      return Result.Err("没有找到 content");
    }
    const contents = paragraphs
      .map((text) => text.trim())
      .filter((text) => {
        if (text.includes("【点击下载")) {
          return false;
        }
        if (text.includes("【在阅读模式下")) {
          return false;
        }
        if (text.includes("【<a")) {
          return false;
        }
        return true;
      })
      .filter(Boolean) as string[];
    if (contents.length < 20) {
      return Result.Err("章节内容不全");
    }
    return Result.Ok(contents);
  }
  async finish() {
    if (this.browser) {
      await this.browser.destroy();
    }
    return Result.Ok(null);
  }
}
