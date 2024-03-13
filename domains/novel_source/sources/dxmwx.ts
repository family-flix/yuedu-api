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
export class DXMWXSource extends NovelSourceClient {
  static hostname = "https://www.dxmwx.org";
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
    this.client.setHeaders({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      Referer: "https://www.dxmwx.org/",
      "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": "macOS",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Upgrade-Insecure-Requests": "1",
      Cookie:
        "_ga=GA1.1.1192860391.1701665530; ASP.NET_SessionId=utzzo5sflnqfvv1fnmjgcypx; TokenId=B6028F0187FB8B5A2B9E6CD29D5BE92CFB53912D216AAE458A161576F90B4A3461718A1E8AC9C505A0D5547D6382F930; _ga_829J453C49=GS1.1.1710320789.3.1.1710322742.0.0.0",
    });
    connect(this.client);
  }

  async search(keyword: string) {
    // const r = await this.browser.open(this.pages.home);
    // if (r.error) {
    //   return Result.Err(r.error.message);
    // }
    // const page = r.data;
    const url = `https://www.dxmwx.org/list/${encodeURIComponent(keyword)}.html`;
    console.log("[]search - url", url);
    const r = await this.client.get<string>(url);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const $ = load(r.data);
    const books_html: string[] = [];
    $("#ListContents>div").each((i, el) => {
      const text = $(el).html();
      if (text) {
        books_html.push(text);
      }
    });
    const books = books_html
      .map((item) => {
        const url_r = /href="(\/book\/[^"]{1,})"/;
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
          url: url ? [DXMWXSource.hostname, url[1]].join("") : null,
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
    const r = await this.client.get<string>(`https://www.dxmwx.org/chapter/${id}.html`);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const $ = load(r.data);
    const chapters_html: string[] = [];
    $("div span").each((i, el) => {
      const text = $(el).html();
      if (text) {
        chapters_html.push(text);
      }
    });
    const chapters = chapters_html
      .map((item) => {
        const url_r = /href="(\/read\/[^"]{1,})"/;
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
          url: url ? [DXMWXSource.hostname, url[1]].join("") : null,
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
    const paragraphs: string[] = [];
    await $("#Lab_Contents p").each((i, el) => {
      const html = $(el).text();
      if (html) {
        paragraphs.push(html);
      }
    });
    if (!paragraphs.length) {
      return Result.Err("没有找到 .content");
    }
    const contents = paragraphs.map((text) => text.trim()).filter(Boolean) as string[];
    return Result.Ok(contents);
  }
  async finish() {
    if (this.browser) {
      await this.browser.destroy();
    }
    return Result.Ok(null);
  }
}
