import axios from "axios";
import iconv from "iconv-lite";

import { HttpClientCore } from "./index";

export function connect(store: HttpClientCore) {
  store.fetch = async (options) => {
    const { url, method, data, charset, headers } = options;
    if (method === "GET") {
      const config = {
        headers: {
          ...headers,
        },
      };
      if (charset === "gbk") {
        // @ts-ignore
        config.responseType = "arraybuffer";
      }
      const r = await axios.get(url, config);
      if (charset === "gbk") {
        const d = iconv.decode(r.data, "gbk");
        r.data = d;
      }
      return r;
    }
    if (method === "POST") {
      return axios.post(url, data, {
        headers: {
          ...headers,
        },
      });
    }
    return Promise.reject("unknown method");
  };
}
