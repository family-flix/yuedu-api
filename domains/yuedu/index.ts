// @ts-nocheck
/**
 * @file 书源
 */
import { Result } from "@/types";

import { BookSourceRule, ICache, PageRequestPayload, ISearchResult } from "./types";
import { requestPage } from "./page_request";
import { HtmlCache } from "./cache";
import { m } from "./utils";

export class BookSourceCore {
  /**
   * 书源
   */
  static sources: BookSourceRule[];
  /**
   * 添加书源
   */
  static CreateSource(sources: BookSourceRule[]) {
    BookSourceCore.sources = sources;
  }
  /**
   * 加载书源
   */
  static LoadSource() {
    return BookSourceCore.sources.filter((source) => !source.disabled) as BookSourceRule[];
  }

  /**
   * 聚合源搜索
   */
  // static async multi_search(keyword: string): Promise<ISearchResult[]> {
  //   const sources = BookSource.loadSource();
  //   console.log("[LOG] Multi_search", sources);
  //   const requests = [];
  //   for (let i = 0; i < sources.length; i += 1) {
  //     const { name, host } = sources[i];
  //     const $instance = new BookSource(sources[i]);
  //     requests.push(
  //       (async () => {
  //         const results = await $instance.search(keyword);
  //         return {
  //           name,
  //           host,
  //           $instance,
  //           results,
  //         };
  //       })()
  //     );
  //   }
  //   const resps = await Promise.all(requests);
  //   const books: Record<string, ISearchResult> = {};
  //   for (let i = 0; i < resps.length; i += 1) {
  //     const { name, host, results } = resps[i];
  //     for (let j = 0; j < results.length; j += 1) {
  //       const { title, author, url, cover, intro } = results[j];
  //       const uid = title + author;
  //       books[uid] = books[uid] || {
  //         title,
  //         author,
  //         cover,
  //         intro,
  //         chapters: [],
  //         sources: [],
  //       };
  //       books[uid].cover = books[uid].cover || cover;
  //       books[uid].intro = books[uid].intro || intro;
  //       books[uid].sources.push({
  //         name,
  //         host,
  //         url,
  //         // $instance,
  //       });
  //     }
  //   }
  //   return Object.values(books);
  // }

  /**
   * 获取书籍详情
   */
  static async FetchProfile(result: ISearchResult) {
    // const { sources } = result;
    // for (let i = 0; i < sources.length; i += 1) {
    //   const { url, $instance } = sources[i];
    //   $instance.profile(url);
    // }
  }

  /**
   * 使用指定源搜索
   */
  static async Search(source: { host: string; keyword: string }) {
    const { keyword, host } = source;
    const s = BookSourceCore.sources.find((s) => s.host === host)!;
    const $instance = new BookSourceCore(s);
    const r = await $instance.search(keyword);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    return Result.Ok(r.data);
  }

  /**
   * 根据指定源使用书籍 url 获取该书籍所有章节
   */
  static async chapters(source: { host: string; book_id: string }) {
    console.log(source);
    const { book_id, host } = source;
    const s = BookSourceCore.sources.find((s) => s.host === host)!;
    const $instance = new BookSourceCore(s);
    const r = await $instance.chapters(book_id);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    return Result.Ok(r.data);
  }

  /**
   * 从多个源获取所有章节
   */
  // static async chapters_with_multi_sources(
  //   sources: {
  //     name?: string;
  //     host: string;
  //     url: string;
  //   }[]
  // ): Promise<
  //   Result<
  //     {
  //       title: string;
  //       sources: {
  //         url: string;
  //         name?: string;
  //         host: string;
  //       }[];
  //     }[]
  //   >
  // > {
  //   const chaptersMap: Record<string, any> = {};
  //   for (let i = 0; i < sources.length; i += 1) {
  //     const { name, url, host } = sources[i];
  //     const source = BookSource.sources.find((s) => s.host === host)!;
  //     const $instance = new BookSource(source);
  //     const r = await $instance.chapters(url);
  //     if (r.Err()) {
  //       continue;
  //     }
  //     const chapters = r.Ok();
  //     // console.log("fetch ", url, source, chapters);
  //     for (let i = 0; i < chapters.length; i += 1) {
  //       const { title, url } = chapters[i];
  //       chaptersMap[title] = chaptersMap[title] || {
  //         title,
  //         sources: [],
  //       };
  //       chaptersMap[title].sources.push({
  //         name,
  //         host,
  //         url,
  //       });
  //     }
  //   }
  //   const result = Object.values(chaptersMap);
  //   return Ok(result);
  // }

  /**
   * 获取指定章节
   */
  static async chapter(chapter: { host: string; book_id: string; chapter_id: string }) {
    const { host, book_id, chapter_id } = chapter;
    const s = BookSourceCore.sources.find((so) => so.host === host)!;
    const $instance = new BookSourceCore(s);
    const r = await $instance.chapter({
      book_id,
      chapter_id,
    });
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const { title, content } = r.data;
    return Result.Ok({
      title,
      content,
    });
  }

  /**
   * 书源名称
   */
  name?: string;
  /**
   * 书源域名
   */
  host: string;
  /**
   * 是否使用移动模式
   *
   */
  mobile?: boolean;
  /**
   * 搜索地址
   */
  // private search_pathname: string;
  /**
   * 提取规则
   */
  private fetch: BookSourceRule["fetch"];
  /**
   * 解析规则
   */
  private extract: BookSourceRule["extract"];
  /**
   * 缓存
   */
  private cache: null | ICache;
  /**
   * 页面请求器
   * @param params
   * @param Cache
   */
  request: (params: PageRequestPayload) => Promise<Result<any>>;
  /**
   *
   * @param params
   * @param Cache
   */
  destroy: () => void;

  constructor(params: BookSourceRule, Cache: ICache = new HtmlCache()) {
    const { name, host, mobile, fetch, extract } = params;
    this.name = name;
    this.host = host;
    this.mobile = mobile;
    this.fetch = fetch;
    this.extract = extract;
    this.cache = Cache;

    const { request, destroy } = requestPage(Cache);
    this.request = request;
    this.destroy = destroy;
  }

  /**
   * 搜索书籍
   * @param keyword
   * @returns
   */
  async search(keyword: string) {
    const { host, fetch, extract } = this;
    // 原料获取
    const url = host + encodeURI(fetch.search.page.replace(/\{\{kw\}\}/, keyword));
    const r = await this.request({
      url,
      host,
      cache_key: fetch.search.page.match(/\{\{kw\}\}/) ? undefined : keyword,
      i: fetch.search.i,
      kw: keyword,
    });
    if (r.error) {
      return r;
    }
    // 内容提取
    const html = r.data;
    const dataSource = m(html)(extract.search.data_source, "g");
    console.log("[LOG] Search result is: ", dataSource?.length);
    console.log();
    if (dataSource === null) {
      return Result.Ok([]);
    }
    const result = [];
    for (let i = 0; i < dataSource.length; i += 1) {
      const content = dataSource[i];
      const mm = m(content);
      result.push({
        id: mm(extract.search.id) as string,
        title: mm(extract.search.title) as string,
        url: mm(extract.search.url) as string,
        author: mm(extract.search.author) as string,
        cover: mm(extract.search.cover) as string | undefined,
        intro: mm(extract.search.intro) as string | undefined,
      });
    }
    return Result.Ok(result);
  }

  /**
   * 获取书籍详情
   */
  async profile(url: string) {
    const { profile } = this.extract;
    const r = await this.request({ url });
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const html = r.data;
    const mm = m(html);
    return Result.Ok({
      title: mm(profile.title),
      author: mm(profile.author),
      intro: mm(profile.intro),
      cover: mm(profile.cover),
      chapters: await this.chapters(url),
    });
  }
  /**
   * 获取所有章节
   */
  async chapters(id: string) {
    const { host, mobile, fetch, extract } = this;
    const { chapters } = extract;
    const url = host + encodeURI(fetch.chapters.page.replace(/\{\{book_id\}\}/, id));
    const r = await this.request({
      url,
      mobile,
      i: fetch.chapters.i,
    });
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const html = r.data;
    console.log("[LOG] Get chapters");
    const mm = m(html);
    const data_source = mm(chapters.data_source, "g");
    if (!data_source) {
      return Result.Ok([]);
    }
    const results = [];
    for (let i = 0; i < data_source.length; i += 1) {
      const record = data_source[i];
      const mmm = m(record);
      results.push({
        id: mmm(chapters.id) as string | null,
        title: mmm(chapters.title) as string | null,
        url: mmm(chapters.url) as string | null,
      });
    }
    return Result.Ok(results);
  }
  /**
   * 获取书籍最新章节
   */
  async latest_chapters(url: string) {
    const { chapters } = this.extract;
    const r = await this.request({ url });
    if (r.error) {
      return r;
    }
    const html = r.data;
    const mm = m(html);
    const data_source = mm(chapters.data_source, "g");
    if (!data_source) {
      return Result.Ok([]);
    }
    const results = [];
    for (let i = 0; i < data_source.length; i += 1) {
      const record = data_source[i];
      const mmm = m(record);
      results.push({
        title: mmm(chapters.title),
        url: mmm(chapters.url),
      });
    }
    return Result.Ok(results);
  }
  /**
   * 获取最近更新时间
   */
  async latest_updated(url: string) {
    const { latest_updated } = this.extract;
    const r = await this.request({ url });
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const html = r.data;
    return Result.Ok(m(html)(latest_updated));
  }
  /**
   * 获取指定章节内容
   */
  async chapter({ book_id, chapter_id }: { book_id: string; chapter_id: string }) {
    const { host, fetch } = this;
    const { chapter } = this.extract;
    const url =
      host +
      encodeURI(fetch.chapter.page.replace(/\{\{book_id\}\}/, book_id).replace(/\{\{chapter_id\}\}/, chapter_id));
    const r = await this.request({ url });
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const html = r.data;
    const mm = m(html);
    return Result.Ok({
      title: mm(chapter.title),
      content: mm(chapter.content),
    });
  }
}
