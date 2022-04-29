module.exports = {
  disabled: true,
  name: "采墨阁",
  host: "https://www.caimoge.com",
  search: "/search/",
  extract: {
    search: {
      i: [
        ["type", "#searchkey"],
        ["click", ".serBtn"],
      ],
      data_source: {
        r: /<dl[\s\S]{1,}?<\/dl>/,
      },
      title: {
        r: /h3><a href="[^"]{1,}?">([^<]{1,}?)<\/a><\/span>/,
      },
      author: {
        r: /作者：[^<]{1,}</,
      },
      cover: {
        r: /src="[^"]{1,}/,
      },
      intro: {
        r: /book_des">([^<]{1,}?)</,
      },
      url: {
        r: /<h3><a href="([^"]{1,}?)"/,
        a: [[/^/, "https://www.caimoge.com"]],
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
        r: /href="([^"]{1,}?)"/,
        a: [[/^/, "https://www.wucuoxs.com"]],
      },
    },
    chapter: {
      title: {
        r: /<h1>([^<]{1,})<\/h1>/,
      },
      content: {
        r: /id="content">([\s\S]{1,}?)<\/div>/,
        a: [
          [/<p><a[^<]{1,}<\/a><\/p>/, ""],
          [/<p>/, ""],
          [/<\/p>(?!$)/, "\n\n"],
          [/<\/p>/, ""],
        ],
      },
    },
  },
};
