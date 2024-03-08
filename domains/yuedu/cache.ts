import fs from "fs-extra";
import path from "path";

const dir = "./.cache";
const filename = path.resolve(dir, "data.json");

let store: Record<string, any> = {};

async function getStore() {
  //   return store;
  await fs.ensureFile(filename);
  let prevCacheStr = await fs.readFile(filename, "utf-8");
  let prevCache: Record<string, any> = {};
  try {
    prevCache = JSON.parse(prevCacheStr);
  } catch (err) {
    // ...
  }
  return prevCache;
}
async function saveStore(data: Record<string, any>) {
  //   Object.assign(store, data);
  await fs.writeFile(filename, JSON.stringify(data));
  return true;
}

export class HtmlCache {
  dir = "./.cache";
  filename = "data.json";

  constructor(params: { dir?: string; filename?: string } = {}) {
    const { dir, filename } = params;
    if (dir) {
      this.dir = dir;
    }
    if (filename) {
      this.filename = filename;
    }
  }
  async set(key: string, content: any) {
    const prevCache = await getStore();
    const nextCache = {
      ...prevCache,
      [key]: content,
    };
    await saveStore(nextCache);
    return nextCache[key];
  }

  async get(key: string) {
    const store = await getStore();
    return store[key];
  }
}
