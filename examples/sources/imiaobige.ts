export const config = {
  disabled: true,
  name: "妙笔阁",
  host: "https://www.imiaobige.com",
  fetch: {
    search: {
      page: "/search.html",
      i: [
        ["type", "#key"],
        ["click", ".serBtn"],
      ],
    },
    chapters: {
      // "https://www.imiaobige.com/novel/113672.html"
      page: "/read/{{book_id}}/",
    },
    chapter: {
      page: "/{{book_id}}/{{chapter_id}}.html",
    },
  },
  extract: {
    search: {
      data_source: {
        r: /<dl[\s\S]{1,}?<\/dl>/,
      },
      id: {
        r: /\/novel\/([0-9]{1,}?)\.html/,
      },
      title: {
        r: /h3><a href="[^"]{1,}?">([^<]{1,}?)<\/a>/,
      },
      author: {
        r: /作者：<a[^>]{1,}?>([^<]{1,}?)</,
      },
      cover: {
        r: /src="([^"]{1,})"/,
      },
      intro: {
        r: /book_des">([^<]{1,}?)</,
      },
      url: {
        r: /<h3><a href="([^"]{1,}?)"/,
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
        r: /href="\/[0-9]{1,}?\/([0-9]{1,})\.html"/,
      },
      title: {
        r: /">([\s\S]{1,})<\/a>/,
      },
      url: {
        r: /href="([^"]{1,}?)"/,
        a: [[/^/, "https://www.imiaobige.com"]],
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
