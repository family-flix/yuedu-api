const source = {
  disabled: true,
  name: "起点",
  host: "https://m.qidian.com",
  search: "/soushu/{{key}}.html",
  extract: {
    mobile: true,
    search: {
      data_source: {
        r: /<li class="book-li ">[\s\S]{1,}?<\/li>/,
      },
      title: {
        b: [[/<\/{0,1}mark>/, ""]],
        r: /<h2 class="book-title">([^<]{1,})<\/h2>/,
      },
      author: {
        r: /<\/svg>([^<]{1,}?)\s{0,}<\/span>/,
      },
      intro: {
        r: /<p class="book-desc">([^<]{1,}?)<\/p>/,
      },
      cover: {
        r: /"(\/\/bookcover[^"]{1,})"/,
      },
      url: {
        r: /href="([^"]{1,}?)"/,
        a: [[/$/, ".html"]],
      },
    },
    profile: {},
    chapters: {
      i: [
        ["click", ".book-catalog-info"],
        ["waitForSelector", "#chapterNav"],
      ],
      data_source: {
        r: /<li class="chapter-li[^%]{1,}?<\/li>/,
      },
      title: {
        r: /chapter-index[^>]{1,}>([^<]{1,}?)</,
      },
      url: {
        r: /href="([^"]{1,}?)"/,
      },
    },
  },
};

module.exports = source;
