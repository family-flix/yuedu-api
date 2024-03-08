export const config = {
  disabled: true,
  name: "顶点小说",
  host: "https://www.sbooktxt.com",
  fetch: {
    search: {
      page: "/search.php?q={{kw}}",
    },
    chapters: {
      page: "/{{book_id}}/",
    },
    chapter: {
      page: "/{{book_id}}/{{chapter_id}}.html",
    },
  },
  extract: {
    search: {
      data_source: {
        b: [[/\n/, ""]],
        r: /<div class="result-item[\s\S]{1,}?<\/div>[ ]{0,}?<\/div>/,
      },
      id: {
        r: /href="\/([^\/]{1,}?)\/"/,
      },
      title: {
        b: [
          [/\n/, ""],
          [/[ ]{2,}/, ""],
        ],
        r: /title="([^"]{1,}?)"/,
      },
      author: {
        r: /作者：[\s\S]{1,}?([\u4e00-\u9fa5]{1,})</,
      },
      cover: {
        r: /(https:\/\/www\.sbooktxt.com[^"]{1,})"/,
      },
      intro: {
        r: /result-game-item-desc">([^<]{1,})<\//,
      },
      url: {
        r: /href="([^"]{1,}?)"/,
        a: [[/^/, "https://www.sbooktxt.com"]],
      },
    },
    profile: {
      title: {
        r: /og:title" content="([\s\S]{1,}?)">/,
      },
      author: {
        r: /og:novel:author" content="([\s\S]{1,}?)">/,
      },
      intro: {
        r: /og:description" content="([\s\S]{1,}?)">/,
      },
      cover: {
        r: /og:image" content="([\s\S]{1,}?)">/,
      },
    },
    latest_updated: {
      r: /最近更新：[-0-9]{1,}?<\/p>/,
    },
    chapters: {
      data_source: {
        b: [[/<dt[\s\S]{1,}?<dt>/, ""]],
        r: /(<dd>([\s\S]{1,}?)<\/dd>)/,
      },
      id: {
        r: /href="\/[^\/]{1,}?\/([^\/]{1,}?)\.html"/,
      },
      title: {
        r: /">([\s\S]{1,})<\/a>/,
      },
      url: {
        // a1234 a1234q 提取 a123，后面不能存在 q
        r: /href="([^"]{1,}?)"/,
        a: [[/^/, "https://www.sbooktxt.com"]],
      },
    },
    chapter: {
      title: {
        r: /<h1>([^<]{1,})<\/h1>/,
      },
      content: {
        b: [[/&nbsp;<\/div>/, ""]],
        r: /id="content">([\s\S]{1,}?)<\/div>/,
        a: [
          [/<div[\s\S]{0,}<\/div>(?=(<p))/, ""],
          [/<\/div/, ""],
          [/&nbsp;/, ""],
          [/\s/, ""],
          [/<br>/, "\n"],
          [/>/, ""],
        ],
      },
    },
    latest_chapters: {
      data_source: {
        b: [[/正文<\/dt>[\s\S]{0,}<dd>[\s\S]{1,}<\/dl>/, ""]],
        r: /(<dd>([\s\S]{1,}?)<\/dd>)/,
      },
      title: {
        r: /<td[\s\S]{1,}_blank">([\s\S]{1,}?)<\/a><\/td>/,
      },
      url: {
        r: /<td class="even"><a href="([\s\S]{1,}?)" target="_blank">/,
      },
      updated: {
        r: /odd" align="center">([-0-9]{1,})<\/td>/,
      },
    },
  },
};
