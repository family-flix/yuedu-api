/**
 * @file 书源
 */
import { BrowserHelper } from "@/domains/browser";
import { parseJSONStr } from "@/utils";
import { Result } from "@/types";

import { BookSourceRule } from "./types";
import { m } from "./utils";

type BookSourceCoreState = {};
type BookSourceCoreProps = {
  payload: BookSourceRule;
  browser: BrowserHelper;
};
export class BookSourceCore {
  static async Create(props: { payload: BookSourceRule }) {
    const { payload } = props;
    const r = await BrowserHelper.Launch();
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const browser = r.data;
    return Result.Ok(
      new BookSourceCore({
        payload,
        browser,
      })
    );
  }

  rule: BookSourceRule;

  browser: BrowserHelper;

  constructor(props: BookSourceCoreProps) {
    const { payload, browser } = props;

    this.rule = payload;
    this.browser = browser;
  }

  /**
   * 搜索书籍
   * @param keyword
   * @returns
   */
  async search(keyword: string) {
    const { host, fetch, extract } = this.rule;
    // 原料获取
    const url = host + encodeURI(fetch.search.page.replace(/\{\{kw\}\}/, keyword));
    const r = await this.browser.request({
      url,
      host,
      cache_key: fetch.search.page.match(/\{\{kw\}\}/) ? undefined : keyword,
      i: fetch.search.i,
      kw: keyword,
    });
    if (r.error) {
      return Result.Err(r.error.message);
    }
    // 内容提取
    const html = r.data;
    // writeFile(path.resolve(__dirname, "./mock/qidian/search1.html"), html);
    const regexp1 = /type="application\/json">(\{"pageContext":[^<]{1,})<\//;
    // const dataSource = m(html)(extract.search.data_source, "g");
    const json_str = html.match(regexp1);
    if (!json_str) {
      return Result.Err("没有匹配到列表数据");
    }
    const json_r = parseJSONStr<{
      pageContext: {
        _pageId: string;
        pageProps: {
          pageData: {
            keyState: number;
            bookInfo: {
              records: {
                cbid: string;
                bid: number;
                bName: string;
                desc: string;
                catId: number;
                cat: string;
                subCateId: number;
                subCateName: string;
                subCateUrl: string;
                cid: number;
                bAuth: string;
                state: string;
                signStatus: string;
                imgUrl: string;
                isVip: number;
                form: number;
                fineLayoutOrg: number;
                fineLayout: number;
                lastChapterName: string;
                lastUpdateTime: string;
                bookType: string;
                isPub: number;
                updateTime: string;
                algInfo: string;
                clickCnt: number;
                recomendCnt: number;
                cnt: string;
                isInShelf: number;
                _index: number;
              }[];
              total: number;
              pageNum: number;
              pageSize: number;
              isLast: number;
            };
            filters: {
              key: string;
              title: string;
              items: {
                value: number;
                text: string;
              }[];
            }[];
            tagInfo: null;
            kw: string;
            orderBy: {
              key: string;
              selectedValue: number;
              items: {
                text: string;
                value: string;
              }[];
            };
            user: {
              isLogin: boolean;
              avatar: string;
              nickName: string;
              tucaoUrl: string;
              guid: string;
            };
            gender: string;
            urlOriginal: string;
          };
          configData: null;
        };
        pageTrackReportExt: {
          pid: string;
          type: string;
        };
        routeParams: {
          kw: string;
        };
        urlPathname: string;
        INITIAL_STATE: string;
        urlOriginal: string;
        hostname: string;
        errorMsg: string;
        redirectUrl: string;
      };
    }>(json_str[1]);
    if (json_r.error) {
      return Result.Err(json_r.error.message);
    }
    const json = json_r.data;
    // console.log("[LOG] Search result is: ", dataSource?.length);
    // const result = [];
    // for (let i = 0; i < dataSource.length; i += 1) {
    //   const content = dataSource[i];
    //   const mm = m(content);
    //   result.push({
    //     id: mm(extract.search.id) as string,
    //     title: mm(extract.search.title) as string,
    //     url: mm(extract.search.url) as string,
    //     author: mm(extract.search.author) as string,
    //     cover: mm(extract.search.cover) as string | undefined,
    //     intro: mm(extract.search.intro) as string | undefined,
    //   });
    // }
    const { records, pageNum, total, isLast, pageSize } = json.pageContext.pageProps.pageData.bookInfo;
    return Result.Ok({
      items: records,
      page: pageNum,
      total: total,
      no_more: isLast,
      page_size: pageSize,
    });
  }

  /**
   * 获取书籍详情
   */
  async profile(url: string) {
    const { profile } = this.rule.extract;
    const r = await this.browser.request({ url });
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
    const { host, mobile, fetch, extract } = this.rule;
    const { chapters } = extract;
    const url = host + encodeURI(fetch.chapters.page.replace(/\{\{book_id\}\}/, id));
    const r = await this.browser.request({
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
    const { chapters } = this.rule.extract;
    const r = await this.browser.request({ url });
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
    const { latest_updated } = this.rule.extract;
    const r = await this.browser.request({ url });
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
    const { host, fetch, extract } = this.rule;
    if (!fetch.chapter) {
      return Result.Err("missing fetch.chapter");
    }
    if (!extract.chapter) {
      return Result.Err("missing extract.chapter");
    }
    const url =
      host +
      encodeURI(fetch.chapter.page.replace(/\{\{book_id\}\}/, book_id).replace(/\{\{chapter_id\}\}/, chapter_id));
    const r = await this.browser.request({ url });
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const html = r.data;
    const mm = m(html);
    return Result.Ok({
      title: mm(extract.chapter.title),
      content: mm(extract.chapter.content),
    });
  }

  destroy() {
    this.browser.destroy();
  }
}
