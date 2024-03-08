export const config = {
  name: "七七书包网",
  host: "http://www.shubao77b.com",
  search: "/modules/article/search.php",
  extract: {
    search: {
      i: [
        ["type", "td #searchkey"],
        ["click", "td .button"],
      ],
      data_source: {
        r: /<tr[^>]{1,}>[\s\S]{1,}?<\/tr>/,
      },
      title: {
        r: /<td[\s\S]{1,}\/">([\s\S]{1,}?)<\/a><\/td>/,
      },
      author: {
        r: /<td class="odd">(?=[^<])([\s\S]{1,}?)<\/td>/,
      },
      url: {
        r: /<td class="odd"><a href="([\s\S]{1,}?[^\.])">/,
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
      title: {
        r: /">([\s\S]{1,})<\/a>/,
      },
      url: {
        r: /href="([\s\S]{1,})">/,
        a: [[/^/, "http://www.shubao77b.com"]],
      },
    },
    chapter: {
      title: {
        r: /<h1>([^<]{1,})<\/h1>/,
      },
      content: {
        r: /<div id="content"[^>]{0,}>([\s\S]{1,}?)<\/div>/,
        a: [
          [/<div[\s\S]{1,}<\/div>(?=(<p))/, ""],
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
