const Koa = require("koa");
const Router = require("koa-router");
const koaBody = require("koa-body");

const core = require("../dist");
const BOOK_SOURCES = require("./sources");

const app = new Koa();
const router = new Router();

function getType(v) {
  return Object.prototype.toString.call(v).slice(8, -1);
}
function walkObj(obj, callback) {
  const type = getType(obj);
  if (type === "Object") {
    return Object.keys(obj)
      .map((key) => {
        return {
          [key]: walkObj(obj[key], callback),
        };
      })
      .reduce((total, cur) => {
        return { ...total, ...cur };
      }, {});
  }
  if (type === "Array") {
    return obj.map((v) => {
      return walkObj(v, callback);
    });
  }
  return callback(obj);
}

(async () => {
  await core.BookSource.add_source(BOOK_SOURCES);

  router.get("/api/sources", (ctx) => {
    const { rules } = ctx.query;
    ctx.body = JSON.stringify({
      code: 0,
      msg: "",
      data: {
        page: 1,
        pageSize: 10,
        list: rules
          ? walkObj(BOOK_SOURCES, (v) => {
              return v.toString();
            })
          : BOOK_SOURCES.map((source) => {
              const { name, host } = source;
              return {
                name,
                host,
              };
            }),
        total: BOOK_SOURCES.length,
      },
    });
  });

  router.get("/api/books/search", async (ctx) => {
    const { kw, host } = ctx.query;
    const results = await core.BookSource.search({ keyword: kw, host });
    if (results.Err()) {
      ctx.body = JSON.stringify({
        code: 100,
        msg: results.Err(),
        data: null,
      });
      return;
    }
    ctx.body = JSON.stringify({
      code: 0,
      data: {
        page: 1,
        pageSize: 10,
        list: results.Ok(),
        total: 0,
      },
    });
  });
  router.get("/api/books/chapters", async (ctx) => {
    const { host, book_id } = ctx.query;
    const results = await core.BookSource.chapters({
      host,
      book_id,
    });
    if (results.Err()) {
      ctx.body = JSON.stringify({
        code: 100,
        msg: results.Err(),
        data: null,
      });
      return;
    }
    ctx.body = JSON.stringify({
      code: 0,
      data: {
        list: results.Ok(),
      },
    });
  });
  router.get("/api/books/chapter", async (ctx) => {
    const { source_host, book_id, chapter_id } = ctx.query;
    const results = await core.BookSource.chapter({
      book_id,
      chapter_id,
      host: source_host,
    });
    if (results.Err()) {
      ctx.body = JSON.stringify({
        code: 100,
        msg: results.Err(),
        data: null,
      });
      return;
    }
    ctx.body = JSON.stringify({
      code: 0,
      data: results.Ok(),
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
