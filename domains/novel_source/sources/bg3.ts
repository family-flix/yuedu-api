import fs from "fs";
import path from "path";

import factory from "debug";

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
  browser: BrowserHelper;
};
export class Bg3Source extends NovelSourceClient {
  static hostname = "https://cn.ttkan.co";
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

  pages = {
    home: "https://cn.ttkan.co",
  };

  browser: BrowserHelper;
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
    const r = await this.browser.open(this.pages.home);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const page = r.data;
    await page.goto(`https://cn.ttkan.co/novel/search?q=${encodeURIComponent(keyword)}`);
    //     const content = await page.content();
    //     fs.writeFileSync(path.resolve(__dirname, "data/bg3_search1.html"), content);
    const books_html = await page.$$eval(".novel_cell", (elements) => {
      return elements.map((elm) => {
        return elm.outerHTML;
      });
    });
    const books = books_html
      .map((item) => {
        const url_r = /href="(\/novel\/[^"]{1,})"/;
        const url = item.match(url_r);
        const name_r = /<h3[^>]{1,}>([^<]{1,})<\/h3/;
        const name = item.match(name_r);
        return {
          id: (() => {
            if (!url) {
              return null;
            }
            const r = url[1].split("/").pop();
            if (!r) {
              return null;
            }
            return r;
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
    this.client.setHeaders({
      authority: "cn.ttkan.co",
      accept: "application/json",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "amp-same-origin": "true",
      cookie: "_ga=amp-r-VOErdfsjWlgp3Ets8PUg",
      referer: "https://cn.ttkan.co/novel/chapters/daoguiyixian-huweidebi",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    });
    const r = await this.client.get<{ items: { chapter_id: number; chapter_name: string }[] }>(
      "https://cn.ttkan.co/api/nq/amp_novel_chapters",
      {
        language: "cn",
        novel_id: id,
        __amp_source_origin: "https://cn.ttkan.co",
      }
    );
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const chapters = r.data.items.map((chapter) => {
      const { chapter_id, chapter_name } = chapter;
      const url = `https://cn.bg3.co/novel/pagea/${id}_${chapter_id}.html`;
      return {
        id: [id, chapter_id].join("/"),
        name: chapter_name,
        url,
      };
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
    const r = await this.browser.goto(url);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const page = r.data;
    const content_html = await page.$eval(".content", (element) => {
      return element.innerHTML;
    });
    const r2 = content_html.match(/<p[^>]{1,}>([^<]{1,})<\/p/g);
    if (!r2) {
      return Result.Err("没有找到正文");
    }
    const contents = r2
      .map((text) => {
        const rr = text.match(/<p[^>]{1,}>([^<]{1,})<\/p/);
        if (rr) {
          return rr[1];
        }
        return null;
      })
      .filter(Boolean) as string[];
    return Result.Ok(contents);
  }
  async finish() {
    await this.browser.destroy();
    return Result.Ok(null);
  }
}
