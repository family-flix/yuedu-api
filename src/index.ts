/**
 * @file 书源
 */
import { IBookSourceRules, ISearchResult } from "./types";
import { requestPage } from "./page_request";
import { findSource, m } from "./utils";

export class BookSource {
  /**
   * 书源名称
   */
  name?: string;
  /**
   * 书源域名
   */
  host: string;
  /**
   * 搜索地址
   */
  search_pathname: string;
  /**
   * 解析规则
   */
  extract: IBookSourceRules["extract"];
  /**
   * 额外请求头信息
   */
  headers?: Record<string, string>;

  static sources: IBookSourceRules[];
  /**
   * 添加书源
   */
  static add_source(sources: IBookSourceRules[]) {
    BookSource.sources = sources;
  }
  /**
   * 加载书源
   */
  static loadSource() {
    return BookSource.sources.filter(
      (source) => !source.disabled
    ) as IBookSourceRules[];
  }

  /**
   * 聚合源搜索
   */
  static async multi_search(keyword: string): Promise<ISearchResult[]> {
    const sources = BookSource.loadSource();
    console.log("[LOG] Multi_search", sources);
    const requests = [];
    for (let i = 0; i < sources.length; i += 1) {
      const { name, host } = sources[i];
      const $instance = new BookSource(sources[i]);
      requests.push(
        (async () => {
          const results = await $instance.search(keyword);
          return {
            name,
            host,
            $instance,
            results,
          };
        })()
      );
    }
    const resps = await Promise.all(requests);
    const books: Record<string, ISearchResult> = {};
    for (let i = 0; i < resps.length; i += 1) {
      const { name, host, results, $instance } = resps[i];
      for (let j = 0; j < results.length; j += 1) {
        const { title, author, url, cover, intro } = results[j];
        const uid = title + author;
        books[uid] = books[uid] || {
          title,
          author,
          cover,
          intro,
          chapters: [],
          sources: [],
        };
        books[uid].cover = books[uid].cover || cover;
        books[uid].intro = books[uid].intro || intro;
        books[uid].sources.push({
          name,
          host,
          url,
          $instance,
        });
      }
    }
    return Object.values(books);
  }

  /**
   * 获取书籍详情
   */
  static async profile(result: ISearchResult) {
    const { sources } = result;
    for (let i = 0; i < sources.length; i += 1) {
      const { url, $instance } = sources[i];
      $instance.profile(url);
    }
  }

  /**
   * 获取所有章节
   */
  static async chapters(result: ISearchResult): Promise<
    {
      title: string;
      sources: {
        url: string;
        $instance: BookSource;
      }[];
    }[]
  > {
    const { sources } = result;
    const chaptersMap: Record<string, any> = {};
    for (let i = 0; i < sources.length; i += 1) {
      const { url, $instance } = sources[i];
      const chapters = await $instance.chapters(url);
      for (let i = 0; i < chapters.length; i += 1) {
        const { title, url } = chapters[i];
        chaptersMap[title] = chaptersMap[title] || {
          title,
          sources: [],
        };
        chaptersMap[title].sources.push({
          url,
          $instance,
        });
      }
    }
    return Object.values(chaptersMap);
  }

  /**
   * 或者指定章节正文
   */
  static async content(chapter: {
    title: string;
    sources: {
      url: string;
      $instance: BookSource;
    }[];
  }) {
    const { sources } = chapter;
    const results = [];
    for (let i = 0; i < sources.length; i += 1) {
      const { url, $instance } = sources[i];
      const { content } = await $instance.chapter(url);
      results.push(content);
    }

    return results;
  }

  constructor(params: IBookSourceRules) {
    const { name, host, search, extract } = params;
    this.name = name;
    this.host = host;
    this.search_pathname = search;
    this.extract = extract;
  }

  /**
   * 搜索书籍
   * @param keyword
   * @returns
   */
  async search(keyword: string) {
    const { host, search_pathname, extract } = this;
    const url =
      host + encodeURI(search_pathname.replace(/\{\{key\}\}/, keyword));
    const html = await requestPage(url);
    const dataSource = m(html)(extract.search.data_source, "g");
    console.log("[LOG] Search result is: ", dataSource?.length);
    console.log();

    if (dataSource === null) {
      return [];
    }
    const result = [];
    for (let i = 0; i < dataSource.length; i += 1) {
      const content = dataSource[i];
      const mm = m(content);
      result.push({
        title: mm(extract.search.title) as string,
        url: mm(extract.search.url) as string,
        author: mm(extract.search.author) as string,
        cover: mm(extract.search.cover) as string | undefined,
        intro: mm(extract.search.intro) as string | undefined,
      });
    }

    return result;
  }

  /**
   * 获取书籍详情
   */
  async profile(url: string) {
    const { profile } = this.extract;
    const html = await requestPage(url);
    const mm = m(html);
    return {
      title: mm(profile.title),
      author: mm(profile.author),
      intro: mm(profile.intro),
      cover: mm(profile.cover),
      chapters: await this.chapters(url),
    };
  }
  /**
   * 获取所有章节
   */
  async chapters(url: string) {
    const { chapters } = this.extract;
    const html = await requestPage(url);
    console.log("[LOG] Get chapters");
    const mm = m(html);
    const data_source = mm(chapters.data_source, "g");
    if (!data_source) {
      return [];
    }
    const results = [];
    for (let i = 0; i < data_source.length; i += 1) {
      const record = data_source[i];
      const mmm = m(record);
      results.push({
        title: mmm(chapters.title) as string,
        url: mmm(chapters.url) as string,
      });
    }
    return results;
  }
  /**
   * 获取书籍最新章节
   */
  async latest_chapters(url: string) {
    const { chapters } = this.extract;
    const html = await requestPage(url);
    const mm = m(html);
    const data_source = mm(chapters.data_source, "g");
    if (!data_source) {
      return [];
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
    return results;
  }
  /**
   * 获取最近更新时间
   */
  async latest_updated(url: string) {
    const { latest_updated } = this.extract;
    const html = await requestPage(url);
    return m(html)(latest_updated);
  }
  /**
   * 获取指定章节内容
   */
  async chapter(url: string) {
    const { chapter } = this.extract;
    const html = await requestPage(url);
    const mm = m(html);
    return {
      title: mm(chapter.title),
      content: mm(chapter.content),
    };
  }
}
