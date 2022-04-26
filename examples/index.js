const core = require("../dist");
const { BOOK_SOURCES } = require("./constants");

(async () => {
  await core.BookSource.add_source(BOOK_SOURCES);
  const keyword = "道诡异仙";
  const results = await core.BookSource.multi_search(keyword);
  console.log(results);
  // const matched = results.find((r) => r.title === keyword);
  // if (!matched) {
  //   console.log("");
  //   return;
  // }
  // const chapters = await core.BookSource.chapters(matched);
  // if (chapters.length) {
  //   const latest_chapter = chapters[chapters.length - 1];
  //   console.log(latest_chapter);

  //   const contents = await core.BookSource.content(latest_chapter);
  //   if (contents.length) {
  //     console.log(contents[0]);
  //   }
  // }
})();
