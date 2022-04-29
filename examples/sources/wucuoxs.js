module.exports = {
  disabled: true,
  name: "无错小说",
  host: "https://www.wucuoxs.com",
  fetch: {
    search: {
      page: "/modules/article/search.php",
      i: [
        ["type", "#s_key"],
        ["click", ".s_btn"],
      ],
    },
  },
  extract: {
    search: {
      data_source: {
        s: /novelslist2">[\s\S]{1,}?<\/div>/,
        b: [[/(?<=360px;">)<li>[\s\S]{1,}?<\/li>/, ""]],
        r: /<li[\s\S]{1,}?<\/li>/,
      },
      title: {
        r: /s2"><a href="[^"]{1,}?">([\s\S]{1,}?)<\/a><\/span>/,
        a: [
          [/<font[^>]{1,}>/, ""],
          [/<\/font>/, ""],
        ],
      },
      author: {
        r: /s4">([^<]{1,}?)</,
      },
      url: {
        r: /href="([^"]{1,}?)"/,
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
