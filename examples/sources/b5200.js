module.exports = {
  name: "笔趣阁",
  host: "https://www.b5200.net",
  search: "/modules/article/search.php?searchkey={{key}}",
  extract: {
    search: {
      data_source: {
        r: /<tr>[\s\S]{1,}?<\/tr>/,
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
        b: [[/(<dd>[\s\S]{1,}?<\/dd>){9}/, ""]],
        r: /(<dd>([\s\S]{1,}?)<\/dd>)/,
      },
      title: {
        r: /">([\s\S]{1,})<\/a>/,
      },
      url: {
        r: /href="([\s\S]{1,})">/,
      },
    },
    chapter: {
      title: {
        r: /<h1>([^<]{1,})<\/h1>/,
      },
      content: {
        r: /id="content"[^>]{1,}>([\s\S]{1,}?)<\/div>(?=[^(<p)])/,
        a: [
          [/<div[\s\S]{1,}<\/div>(?=(<p))/, ""],
          [/\s/, ""],
          [/<p>[\s\S]{0,}?(?=[\S])/, ""],
          [/<\/p>/, "\n"],
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
