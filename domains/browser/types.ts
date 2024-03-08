export interface IBookRes {
  title: string;
  author: string;
  intro?: string;
  cover?: string;
  sources: ({
    /**
     * 书籍在该书源的 url
     */
    url: string;
  } & BookSourceRule)[];
}

/**
 * 替换器
 */
export type PageReplaceRule = [string | RegExp, string][];
/**
 * 提取器
 */
export interface PageContentExtractRule {
  s?: string;
  b?: PageReplaceRule;
  r: string | RegExp;
  a?: PageReplaceRule;
}

/**
 * 搜索结果
 */
export type ISearchResult = {
  /**
   * 书籍名称
   */
  title: string;
  /**
   * 书籍作者
   */
  author: string;
  /**
   * 书籍封面
   */
  cover?: string;
  /**
   * 书籍介绍
   */
  intro?: string;
  /**
   * 所有章节
   */
  chapters: {
    /**
     * 章节名称
     */
    title: string;
    /**
     * 章节书源
     */
    sources: {
      /**
       * 该章节在该书源的地址
       */
      url: string;
    }[];
  }[];
  sources: {
    /**
     * 书源名称
     */
    name?: string;
    /**
     * 书源网站
     */
    host: string;
    /**
     * 书籍在该书源的地址
     */
    url: string;
    /**
     * 书源实例
     */
    // $instance: BookSource;
  }[];
};

interface IPageFetch {
  page: string;
  /**
   * 该页面的交互
   * 第一个字符串是行为，第二个是选择器
   * ['click', '.btn']
   * ['type', '.input', 'test']
   */
  i?: [string, string, string?][];
}

/**
 * 书籍信息提取规则
 */
export interface BookSourceRule {
  disabled?: boolean;
  name?: string;
  host: string;
  /**
   * 是否需要模拟为手机进行访问
   */
  mobile?: boolean;
  /**
   * 页面获取规则
   */
  fetch: {
    search: IPageFetch;
    profile?: IPageFetch;
    chapters: IPageFetch;
    chapter?: IPageFetch;
  };
  /**
   * 内容提取规则
   */
  extract: {
    /**
     * 书籍详情
     */
    profile: {
      title: PageContentExtractRule;
      author: PageContentExtractRule;
      intro: PageContentExtractRule;
      cover: PageContentExtractRule;
    };
    /**
     * 最近更新时间
     */
    latest_updated?: PageContentExtractRule;
    /**
     * 章列表
     */
    chapters: {
      data_source: PageContentExtractRule;
      id: PageContentExtractRule;
      title: PageContentExtractRule;
      url: PageContentExtractRule;
    };
    /**
     * 章及正文
     */
    chapter?: {
      title?: PageContentExtractRule;
      content: PageContentExtractRule;
    };
    /**
     * 最新章节
     */
    latest_chapters?: {
      data_source: PageContentExtractRule;
      title: PageContentExtractRule;
      url: PageContentExtractRule;
      updated: PageContentExtractRule;
    };
    /**
     * 搜索
     */
    search: {
      data_source: PageContentExtractRule;
      id: PageContentExtractRule;
      title: PageContentExtractRule;
      author: PageContentExtractRule;
      url: PageContentExtractRule;
      cover?: PageContentExtractRule;
      intro?: PageContentExtractRule;
    };
  };
}

export interface PageRequestPayload {
  url: string;
  mobile?: boolean;
  cache_key?: string;
  host?: string;
  i?: [string, string, string?][];
  kw?: string;
}

export interface ICache {
  get: (key: string) => Promise<string>;
  set: (key: string, content: string) => Promise<void>;
}

export interface Result<T> {
  Ok(): null | T;
  Err(): null | string;
}
