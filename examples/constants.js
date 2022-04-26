module.exports.BOOK_SOURCES = [
  {
    name: "起点",
    host: "https://m.qidian.com",
    search: "/soushu/{{key}}.html",
    extract: {
      mobile: true,
      search: {
        data_source: {
          r: /<li class="book-li ">[\s\S]{1,}?<\/li>/.toString(),
        },
        title: {
          b: [[/<\/{0,1}mark>/.toString(), ""]],
          r: /<h2 class="book-title">([^<]{1,})<\/h2>/.toString(),
        },
        author: {
          r: /<\/svg>([\s\S]{1,}?)[\s]{0,}?<\/span>/.toString(),
        },
        intro: {
          r: /<p class="book-desc">([\s\S]{1,}?)<\/p>/.toString(),
        },
        cover: {
          r: /"(\/\/bookcover[\.a-z0-9\/]{1,})"/.toString(),
        },
        url: {
          r: /<a href="([^"]{1,}?)"/.toString(),
        },
      },
      profile: {},
      chapters: {
        i: [
          ["click", ".book-catalog-info"],
          ["waitForSelector", "#chapterNav"],
        ],
        data_source: {
          // a1234ba1-234b 匹配 a1234b，数字间存在符号的不匹配
          r: /<li class="chapter-li[^%]{1,}?<\/li>/.toString(),
        },
        title: {
          r: /<span class="chapter-title">([^<]{1,}?)<\/span>/.toString(),
        },
        url: {
          r: /href="([^"]{1,}?)"/.toString(),
        },
      },
    },
  },
  {
    name: "笔趣阁",
    host: "http://www.b5200.net",
    search: "/modules/article/search.php?searchkey={{key}}",
    extract: {
      profile: {
        title: {
          r: /og:title" content="([\s\S]{1,}?)">/.toString(),
        },
        author: {
          r: /og:novel:author" content="([\s\S]{1,}?)">/.toString(),
        },
        intro: {
          r: /og:description" content="([\s\S]{1,}?)">/.toString(),
        },
        cover: {
          r: /og:image" content="([\s\S]{1,}?)">/.toString(),
        },
      },
      latest_updated: {
        r: /最近更新：[-0-9]{1,}?<\/p>/.toString(),
      },
      chapters: {
        data_source: {
          b: [[/(<dd>[\s\S]{1,}?<\/dd>){9}/.toString(), ""]],
          r: /(<dd>([\s\S]{1,}?)<\/dd>)/.toString(),
        },
        title: {
          r: /">([\s\S]{1,})<\/a>/.toString(),
        },
        url: {
          r: /href="([\s\S]{1,})">/.toString(),
        },
      },
      chapter: {
        title: {
          r: /<h1>([^<]{1,})<\/h1>/.toString(),
        },
        content: {
          r: /id="content"[^>]{1,}>([\s\S]{1,}?)<\/div>(?=[^(<p)])/.toString(),
          a: [
            // a12345a12345c 移除后面的 a12345
            [/<div[\s\S]{1,}<\/div>(?=(<p))/.toString(), ""],
            [/\s/.toString(), ""],
            [/<p>[\s\S]{0,}?(?=[\S])/.toString(), ""],
            [/<\/p>/.toString(), "\n"],
          ],
        },
      },
      latest_chapters: {
        data_source: {
          b: [[/正文<\/dt>[\s\S]{0,}<dd>[\s\S]{1,}<\/dl>/.toString(), ""]],
          r: /(<dd>([\s\S]{1,}?)<\/dd>)/.toString(),
        },
        title: {
          r: /<td[\s\S]{1,}_blank">([\s\S]{1,}?)<\/a><\/td>/.toString(),
        },
        url: {
          r: /<td class="even"><a href="([\s\S]{1,}?)" target="_blank">/.toString(),
        },
        updated: {
          r: /odd" align="center">([-0-9]{1,})<\/td>/.toString(),
        },
      },
      search: {
        // 指定字符<tr> 后面跟着 任意字符(一个或更多) 再跟着 指定字符 </tr>
        data_source: {
          r: /<tr>[\s\S]{1,}?<\/tr>/.toString(),
        },
        // 指定字符 <td 后面跟着 任意字符(一个或更多) 再跟着 指定字符 /" 再跟着 任意字符(一个或更多) 再跟着 </a></td>
        title: {
          r: /<td[\s\S]{1,}\/">([\s\S]{1,}?)<\/a><\/td>/.toString(),
        },
        // 指定字符 <td class="odd"> 且后面非 < 再跟着 任意字符(一个或多个) 再跟着 指定字符 </td>
        author: {
          r: /<td class="odd">(?=[^<])([\s\S]{1,}?)<\/td>/.toString(),
        },
        // 指定字符 <td 后面跟着 任意字符(一个或更多) 再跟着 指定字符 href=" 再跟着 任意字符(一个或更多) 再跟着 非指定字符. 再跟着 指定字符 ">
        url: {
          r: /<td class="odd"><a href="([\s\S]{1,}?[^\.])">/.toString(),
        },
      },
    },
  },
];
