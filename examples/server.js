const Koa = require("koa");
const Router = require("koa-router");
const koaBody = require("koa-body");

const core = require("../dist");
const BOOK_SOURCES = require("./sources");

const app = new Koa();
const router = new Router();

(async () => {
  await core.BookSource.add_source(BOOK_SOURCES);
  router.get("/api/books/search", async (ctx) => {
    const { kw } = ctx.query;
    const results = await core.BookSource.multi_search(kw);
    ctx.body = JSON.stringify({
      code: 0,
      data: {
        page: 1,
        pageSize: 10,
        list: results,
        total: 0,
      },
    });
  });
  router.get("/api/books/chapters", async (ctx) => {
    const { source_name, source_host, url } = ctx.query;
    const results = await core.BookSource.chapters({
      url,
      name: source_name,
      host: source_host,
    });
    ctx.body = JSON.stringify({
      code: 0,
      data: {
        list: results,
      },
    });
  });
  router.get("/api/books/chapter", async (ctx) => {
    const { source_name, source_host, url } = ctx.query;
    const results = await core.BookSource.chapter({
      url,
      name: source_name,
      host: source_host,
    });
    ctx.body = JSON.stringify({
      code: 0,
      data: results,
    });
  });

  app.use(koaBody({ json: true }));

  app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Content-Length, Authorization, Accept, X-Requested-With"
    );
    ctx.set("Access-Control-Allow-Credentials", true);
    ctx.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    if (ctx.method == "OPTIONS") {
      ctx.body = 200;
    } else {
      await next();
    }
  });

  app.use(router.routes());

  const PORT = 3002;
  app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
  });
})();
