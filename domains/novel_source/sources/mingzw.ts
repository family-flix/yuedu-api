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
export class MingZWSource extends NovelSourceClient {
  static hostname = "https://www.mingzw.net";
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
    this.client = new HttpClientCore();
    connect(this.client);
  }

  async search(keyword: string) {
    // const r = await this.browser.open(this.pages.home);
    // if (r.error) {
    //   return Result.Err(r.error.message);
    // }
    // const page = r.data;
    const r = await this.client.get<string>(`https://www.mingzw.net/mzwlist/${encodeURIComponent(keyword)}.html`);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const $ = load(r.data);
    const books_html: string[] = [];
    $(".figure-horizontal").each((i, el) => {
      const text = $(el).html();
      if (text) {
        books_html.push(text);
      }
    });
    const books = books_html
      .map((item) => {
        const url_r = /href="(\/mzwbook\/[^"]{1,})"/;
        const url = item.match(url_r);
        const name_r = /title="([^"]{1,})">/;
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
  async fetch_chapters(novel: SearchedNovel) {
    const { id } = novel;
    const r = await this.client.get<string>(`https://www.mingzw.net/mzwchapter/${id}.html`);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const $ = load(r.data);
    const chapters_html: string[] = [];
    $(".content ul li").each((i, el) => {
      const text = $(el).html();
      if (text) {
        chapters_html.push(text);
      }
    });
    const chapters = chapters_html
      .map((item) => {
        const url_r = /href="(\/mzwread\/[^"]{1,})"/;
        const url = item.match(url_r);
        const name_r = /">([^<]{1,})<\/a>/;
        const name = item.match(name_r);
        return {
          id: (() => {
            if (!url) {
              return null;
            }
            const r = url[1].match(/[0-9]{1,}_([0-9]{1,})/);
            if (!r) {
              return null;
            }
            return r[1];
          })(),
          name: name ? name[1] : null,
          url: url ? [MingZWSource.hostname, url[1]].join("") : null,
        };
      })
      .filter((chapter) => {
        return chapter.id && chapter.name && chapter.url;
      }) as SearchedNovelChapter[];
    return Result.Ok({
      chapters,
    });
  }
  async fetch_content(chapter: SearchedNovelChapter) {
    const { url } = chapter;
    //     const matched = url.match(/novel_id=([^&]{1,})&page=([0-9]{1,})$/);
    //     if (!matched) {
    //       return Result.Err(`链接 '${url}' 缺少 id 和 page`);
    //     }
    //     const [, id, page_num] = matched;
    //     const url2 = `https://cn.bg3.co/novel/pagea/${id}_${page_num}.html`;
    //     console.log("[]fetch_content - before goto url2", url);
    console.log("fetch_content - before goto", url);
    const r = await this.client.get<string>(url);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    // const page = r.data;
    const $ = load(r.data);
    const $content = await $(".contents");
    if (!$content) {
      return Result.Err("没有找到 .content");
    }
    const outerHTML = $content.html();
    if (!outerHTML) {
      return Result.Err("没有 html");
    }
    const r2 = outerHTML.replace(/<p>/g, "").replace(/<\/p>/g, "\n");
    const contents = r2
      .split("\n")
      .map((text) => text.trim())
      .filter(Boolean) as string[];
    return Result.Ok(contents);
  }
  async finish() {
    if (this.browser) {
      await this.browser.destroy();
    }
    return Result.Ok(null);
  }
}
