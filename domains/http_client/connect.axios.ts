import axios, { CancelToken, CancelTokenSource, ResponseType } from "axios";
import iconv from "iconv-lite";

import { JSONObject, Result } from "@/types/index";

import { HttpClientCore } from "./index";

export function connect(store: HttpClientCore) {
  let requests: { id: string; source: CancelTokenSource }[] = [];
  store.fetch = async (options) => {
    const { url, method, id, data, charset, headers } = options;
    const source = axios.CancelToken.source();
    if (id) {
      requests.push({
        id,
        source,
      });
    }
    if (method === "GET") {
      try {
        const config: {
          params: JSONObject | FormData | undefined;
          headers?: Record<string, string>;
          cancelToken: CancelToken;
          responseType?: string;
        } = {
          params: data,
          headers,
          cancelToken: source.token,
        };
        if (charset === "gbk") {
          config.responseType = "arraybuffer";
        }
        const r = await axios.get(url, {});
        if (charset === "gbk") {
          const d = iconv.decode(r.data, "gbk");
          r.data = d;
        }
        requests = requests.filter((r) => r.id !== id);
        return r;
      } catch (err) {
        requests = requests.filter((r) => r.id !== id);
        throw err;
      }
    }
    if (method === "POST") {
      try {
        const config: {
          cancelToken: CancelToken;
          headers?: Record<string, string>;
          responseType?: ResponseType;
        } = {
          headers,
          cancelToken: source.token,
        };
        if (charset === "gbk") {
          config.responseType = "arraybuffer";
        }
        const r = await axios.post(url, data, config);
        if (charset === "gbk") {
          const d = iconv.decode(r.data, "gbk");
          r.data = d;
        }
        requests = requests.filter((r) => r.id !== id);
        return r;
      } catch (err) {
        requests = requests.filter((r) => r.id !== id);
        throw err;
      }
    }
    return Promise.reject("unknown method");
  };
  store.cancel = (id: string) => {
    const matched = requests.find((r) => r.id === id);
    if (!matched) {
      return Result.Err("没有找到对应请求");
    }
    requests = requests.filter((r) => r.id !== id);
    matched.source.cancel("主动取消");
    return Result.Ok(null);
  };
}
