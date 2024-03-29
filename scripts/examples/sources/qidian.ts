import { BookSourceRule } from "@/domains/yuedu/types";

export const config: BookSourceRule = {
  disabled: true,
  name: "起点",
  host: "https://m.qidian.com",
  mobile: true,
  fetch: {
    search: {
      page: "/soushu/{{kw}}.html",
    },
    chapters: {
      page: "/book/{{id}}/0.html",
      i: [
        ["click", ".book-catalog-info"],
        ["waitForSelector", "#chapterNav"],
      ],
    },
  },
  extract: {
    search: {
      data_source: {
        r: /<li class="book-li[ ]{0,1}"[ ]{0,1}>[\s\S]{1,}?<\/li>/,
      },
      id: {
        r: /m\.qidian\.com\/book\/([^\/]{1,}?)\/0/,
      },
      title: {
        b: [[/<\/{0,1}mark>/, ""]],
        r: /<h2 class="book-title">([^<]{1,})<\/h2>/,
      },
      author: {
        r: /book-author">([^<]{1,}?)\s{0,}<\/span>/,
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
    profile: {
      title: {
        r: /<h2 class="book-title">([^<]{1,})<\/h2>/,
      },
      author: {
        r: /<h2 class="book-title">([^<]{1,})<\/h2>/,
      },
      intro: {
        r: /<h2 class="book-title">([^<]{1,})<\/h2>/,
      },
      cover: {
        r: /<h2 class="book-title">([^<]{1,})<\/h2>/,
      },
    },
    chapters: {
      id: {
        r: /m\.qidian\.com\/book\/[^\/]{1,}?\/([^\/]{1,}?)\.html/,
      },
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
