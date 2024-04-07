import fs from "fs";
import path from "path";

import factory from "debug";
import { load } from "cheerio";

import { BrowserHelper } from "@/domains/browser/index";
import { HttpClientCore } from "@/domains/http_client/index";
import { connect } from "@/domains/http_client/connect.axios";
import { NovelSourceClient } from "@/domains/novel_source/types";
import { Result } from "@/types/index";

const debug = factory("yuedu:huanyuan");

type SearchedNovel = {
  id: string;
  name: string;
  url: string;
};
type SearchedNovelChapter = {
  id: string;
  name: string;
  url: string;
};

type SourceProps = {
  unique_id: string;
  browser?: BrowserHelper;
};
export class HuanyuanSource extends NovelSourceClient {
  hostname = "https://huanyuan.app";

  unique_id: string;
  token = "";

  browser?: BrowserHelper;
  client: HttpClientCore;

  constructor(props: SourceProps) {
    const { unique_id, browser } = props;

    super(unique_id, "");

    this.unique_id = unique_id;
    this.browser = browser;
    this.client = new HttpClientCore({
      hostname: this.hostname,
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "cache-control": "max-age=0",
        cookie:
          "Hm_lvt_b466fb7fd98d7107d169ea1edbf6f64c=1710316088,1712132249; cf_chl_3=622eebe16708e5d; cf_clearance=NLDt6KLqXFy__2LFtVw0A719b9sqxDl4t_h5E2Av6QI-1712132354-1.0.1.1-OZgrkItwH9DiAIfVlaxA599kzI1pgXZa4KEn9OSpLgkidYA0X.X39m5n4FAmQIt4O0Piw2SvXyplISfQK0PlYw; PHPSESSID=3vbkd0ehoapkknuk67qhd52rh5; Hm_lpvt_b466fb7fd98d7107d169ea1edbf6f64c=1712132372",
        origin: "https://huanyuan.app",
        referer:
          "https://huanyuan.app/so/search.html?searchkey=%E6%88%91%E7%9A%84%E5%B1%9E%E6%80%A7%E4%BF%AE%E8%A1%8C%E4%BA%BA%E7%94%9F&token=fb9ca6eee16eb628&__cf_chl_tk=jv04YzuUniMPh5P.ZSK0P7yXgXvzYn8Bpo0JtYEr1fU-1712132354-0.0.1.1-1599",
        "sec-ch-ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        "sec-ch-ua-arch": '"x86"',
        "sec-ch-ua-bitness": '"64"',
        "sec-ch-ua-full-version": '"123.0.6312.87"',
        "sec-ch-ua-full-version-list":
          '"Google Chrome";v="123.0.6312.87", "Not:A-Brand";v="8.0.0.0", "Chromium";v="123.0.6312.87"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": '""',
        "sec-ch-ua-platform": '"macOS"',
        "sec-ch-ua-platform-version": '"14.0.0"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      },
    });
    connect(this.client);
  }

  async search(keyword: string) {
    const r = await this.client.post<string>(
      `/so/search.html?searchkey=${encodeURIComponent(keyword)}&token=fb9ca6eee16eb628`,
      {
        "89d2921f5e1c56ae24fbab6a9df60286dd5838ee9e09cdb34b2ac20b344c0253":
          "8_XtwoexJAxaXmZ.7vvdJxNRValArhi8CV4d9j7OT.U-1712132354-1.1.1.1-B5d0IzzFruVD1XiUqG8WHhDpXyJw0mMItyIR92185upvE1h.QI8WfGWmfiBL8kmF_Sw4SsHwYeEds140JUwlBa_br.SZwIK0nnZnOs.6KqZDznTyWul.wTqs4WLiVM4hQ6PjGeVjD7EIVR7yaX3myD3R3siGD8ot_e7NvBN58XBrnjVtbKCHgBPBWVHpG8ur.ck0PVp.wHlAL25Q8K63q6HbtCeBFkTDJlVNf8ynDuk1MyctDRCybU8TkQ.uei2XuKc_VfdHY4a514UFdKY5LGxf7ThTyLikwdfz3Yr3r4_iCZhb2Gha765rW3_W5OrkLqNT6q3aj2jX8mJeHS.m2U6.mz.nf1ApXqbvOtRlyd96giG_VefXxI2PvHLrU51GGk5jhB3MKySVdOkbK.8WGL3Nz39_krYd6wCFmgpM.wSQC2BQz8s2NO4A8LZ1gv940gzzVcxRVIil_u_1_ZrweMz_y_vT7e7gosM.qPx5NAlxJ_4Y8WDTzRf0MMS_guOskm00ZqAta8TMYfl2szV6zHKGZI3JSO6YOwzAtg1Sh_kL6GiinVmWQZ1w1_.d23jW0xNwhAEBnfiPTggm9WoLVdUaRZ_nLA2.Td7S106pCrEIhF1yGBhUmwE3fQ9fm_i3s1Egx5KSfqo5h2tP.nXeKfzIGrsKmZQktmBPcuGqBW48_.w3uWpDtfW_1xHrMP0.LTEr51SDeJAcdNyceM3puCbY9gbUk10b4x9WCdu87Dhq0k78TjY09E79O4ATig09.79i3WB5nSle6aLVTbfDfbfqRlRcL.uagFBKMRcPv9WBqlFl9fD280s8.7k1UGqWClEz2_aY7w6dvVJxzPznrE_Ogapl7wxCtsiD5zPjgRyv4IWoicp71XNTG8JiQkemQ2LIruISUoPvVPlfQJc7.MzwoUacajcUbZiBGq66CcmB2_Vcyv2fbFAwbN0JlYsE898Fq40JkzIzgMFshAavVnCISf0RlPcCldtThBNXee8cig0ZwvFRn_q1noW2do9q3xo1uv9rVXskajCp3I9_fjiLPD7TtQWc7RWYOexuU4bt8zcMaIem8bNuSks8ThkG325cmN4Do4ogC7GQbFGOhwaTbxXgwwNfniHYeyHhHqtnk1c.5LlqsgnJS31airzMgOo9Mq6Vw98MNZ16t.FYOtSSlbUQTv0x9J6zWpjRCK8xe4UOrj_I3zbYW5HaidTzfeVt28GIkq9F7wpjHQljCbqmsrbqKn50LFSHoJHukwoHIoGac8SJy7d6l37RpgvmIsIptp.KgLQYFI9E1EVVLBOmeTykxCk7FuNQga6_j82KLDSr0DRewsFBEiGpADMaPM7XDqx.KVnlLNrONMkxmT30FOEnP4oqUWnhHBPzVwP0Z8gcXc83wmrTQYmvFtUte.Zr_hgwj06ee1w4K7XWdU_MFYZnpwgc5uHHBkD_NrJtvxNbica58L6vpcI.VnS2OMb74Zt6ePMR8JqFtJkFsfBfKeV_feodmfxcMT7oYa7ZMsVyPTNpwh4sBDwdL.9Q",
        "217ba195342ab2595dcaa1f83cc131156e0ff5062952bfc4193847e312adc986":
          "zd.gYjoVIk5ejpAFGOG_IslPUndVXiWEjxMPBYwYxAI-1712132354-1.1.1.1-hQDO.XX.M15OHhJY5AdZr2WQtNcEHN_nK3SJ2F8OqhIMJaehFNuwZqooDUvXQfkEDkdJ8cEVQISIqm5.Q8fnjAgCgGD7up3vnj1mGY8DXrCPJrgNg.MaxyO7vKMypp.Zx__mpQ_t0g.AQ3gHj.WC6Vu5YyDzCCYjCjQjEsIVEm.7eAXpzuj6OkeSG7MoV6aGIjLd9FQYmFxcXBdAzXuWixBvwcjzo1_vG.ruwLKT36ewZOctxaXKdHmfio19VZkV8gYmdaYml9W9xm_81ct2pLmCdfyiAUoX8g8L72torCtY5FW_r3b_XdoxUonEF6HqsXU3N83xofuJvlLDIfY5tdMeUAsDp5sz9lsFWU2HALpSg1qiIlcQjJAJxjApeVoiejoOCh_aeTeCmk_OFU2GFzS3PcLi8LgRqcQxY8dMAGztakGTi1piBIHAdX50mdQweMz13eOub5_rqYsdqB110KPp4eFdkYo_yU.59XAmpZrq6mpWyR_VQjyF8cXSCRST8NkNIzUawQSmq1iY_TguOew62IeKxItAwFqRnDqP3SwQA.4SWh4zTiqNUrngJMSF2uYzwNKCK_kCJjrY4OqBmtC7zrBZg.ZNzbHUiOg_BXDQcM62CgvWSl7Cs0BqubaEI2HpNIHeinzHcAJ2idsJtYwxq9CHCkBZZoprAHcILsE_gEypFNMuPCcjgmVw__UbEEDqhADc95YFQz1DluZE7ZtXnH_QV8WUnlf5LKwxNDq_VCoxZDyPvOPSv2aOcyUNWyJi87VyiwFRU5U8YbCbgwHHDOsWXHxsWXVrqgcODt239B12_v4fSs7Phgk4Tj0YT._2oYPO_jiCXjymmKBc4Dbd.SN9EbeblEItVW2u4Z7U2g5RWZbfOFWFvP47OG8zMq86N7mE1X1twhY17F_51EDBIZ.0E4DvJBNp19xXGmRqfLGvEAyZp.Lnsx8FkhWBSE8T.AJSzG6Q9LxYFOOYASz0Fvy_Gdr8FtOMhlDgZOdreQnV5NCXuSHeLUVPaJ5iM6UOm5XUHR54W70zLfe2LRFuUlv_4S8wy_eFhF4GcFnujo4gnHuXYruDT2.cFHhcPfefapHY_XdDm7Veqr8a_FC7UcPTzqEg6L0lQfNROHQMiS5rGMNYiLM6RToTQb0SaII76_g9OwwBbooyX974uLM2TCIImJQWumN6RtbSx1Cb016yRXACuTbtLKddpNKA7XDsh.Y3VaROob0F1mzeysDLYsTJK6hAYp_VG_oO3qcJCwBq4LkofjkaUXZNmqf0yMP3d7vO3WEKgvzod43KQgXcVAgXuwZbOQRuDzfQFrju3pORAWSHgZEErBaJ5P6_Sv8NdU.hTJBkRddaBOh2IETxNPuXEQnNK3Q6P3WG1UqCFjMi0nlXnFrto20aPT2nq1Ob4OlzxJgGDvQcWJrSlKtIx0Yi5whgUdUn8swSyL5N5XHJ.UUQyenGLtWXPEWsw6ERTNMAe86N7UUeGHXT_TO0CNBx8I697bRDR.e8KLbZptcJLAlQ.WtnwNgVls9YA0VN4HX2NxfCFHDKusvQSs6Vur2h0LFRbMFhX3e5.Bjd_MwtmxbSP9rvcRJ6QSTWXvfHhVPdtZEPgiH02qWV4F87Xyc_hYLHI.mGg_X0jjtkn8M8WIPOO8rATarnWUieXVvVocK4CclzCw9H5pEJYsMHzcpLRcvl3.tBoPIdBGayGWszyKQR2Xba4UYUS.vQK6CDI9R9Bby1QbOIcOSkK8F2QdCJDAJ6rx.ZyBX8OMAmdiPXBhz2nccGD19BEjWIA65EkrFuZrKt_W6JeBH1E7FCgDiHRG36QNh.UR8GaOfm00K2BCbDd_3Q7s35WxEZrIxL9.D_9a_Lk8CQPwovzxYcbNK4v5ltWUz1pUu7TBmYWFESSU3VWyWYGc1vkDCifiPLSlnf2P1ON5_IhvvKT8m9QPhgRqyBa9OvXq.LzpelPRoX_2JS7lRcAAPF.H4y__JrcvB1w_mak4gOfT3cWLp1Wz8KGu1xLAg9Bsy3LHckV5Q75yFNpBiV_IAEy00I96ezE2W_u3CPV5DMl4Z2r9saPiaboz4MAiA8pxlpGBEs1I2Mbpml11tqT5q2CZHMiy11wBPQ7_N_XbGurO9Pgxdi8V4u3i.ycEMfXaLw6qa3_DILWltzLy0Uyl5PFWHlfsC3IoKCF3DUh5ipTtiKZH_c1KxswjuGXtkdjTZ7LBKvhTSl1gI3W_x_NmLtLQLC3lqFGPDLrI1wr5zaneR1iHAuvYV8Dyig9utePL.i12__MD7sZhwSAsQ5_gyiqvijXVV1FixhKxuygueFla2Sp7K_vtVxHaLHD10C6ALpcGA",
        "1a5ca4e109d8170f1d6ead605f8e020fea5e4cb6b4fa926bd664d134bb2e5395": "45652193487b152b806fed012be1f384",
        "58e035f8abf984afe28fb3e0c025c8cd6039b9abebd6741cf9e09beef5bc5870": "zFlQhUiTgiRD-1-86e7a1f059469436",
      }
    );
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const $ = load(r.data);
    const books_html: string[] = [];
    $(".library li").each((i, el) => {
      const text = $(el).html();
      if (text) {
        books_html.push(text);
      }
    });
    const books = books_html
      .map((item) => {
        const url_r = /href="(\/novel\/[^"]{1,})"/;
        const url = item.match(url_r);
        const name_r = /alt="([^"]{1,})">/;
        const name = item.match(name_r);
        return {
          id: (() => {
            if (!url) {
              return null;
            }
            const r = url[1].match(/\/([0-9a-z]{1,})\/$/);
            if (!r) {
              return null;
            }
            return r[1];
          })(),
          name: name ? name[1] : null,
          url: url ? [this.hostname, url[1]].join("") : null,
        };
      })
      .filter((book) => {
        return book.id && book.name && book.url;
      }) as SearchedNovel[];
    if (books.length === 0) {
      return Result.Err("没有搜索到结果");
    }
    const matched = this.find_matched_book(books, { name: keyword });
    if (!matched) {
      return Result.Err(`搜索到结果，但没有完美匹配 '${keyword}' 的结果`);
    }
    return Result.Ok(matched);
  }
  find_matched_book(books: SearchedNovel[], target: { name: string }) {
    for (let i = 0; i < books.length; i += 1) {
      const book = books[i];
      if (book.name === target.name) {
        return book;
      }
    }
    return null;
  }
  async fetch_chapters(novel: { id: string }) {
    const { id } = novel;
    const r = await this.client.get<string>(`https://www.mingzw.net/mzwchapter/${id}.html`);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const $ = load(r.data);
    const chapters_html: string[] = [];
    $(".content ul li").each((i, el) => {
      const text = $(el).html();
      if (text) {
        chapters_html.push(text);
      }
    });
    const chapters = chapters_html
      .map((item) => {
        const url_r = /href="(\/mzwread\/[^"]{1,})"/;
        const url = item.match(url_r);
        const name_r = /">([^<]{1,})<\/a>/;
        const name = item.match(name_r);
        return {
          id: (() => {
            if (!url) {
              return null;
            }
            const r = url[1].match(/[0-9]{1,}_([0-9]{1,})/);
            if (!r) {
              return null;
            }
            return r[1];
          })(),
          name: name ? name[1] : null,
          url: url ? [this.hostname, url[1]].join("") : null,
        };
      })
      .filter((chapter) => {
        return chapter.id && chapter.name && chapter.url;
      }) as SearchedNovelChapter[];
    return Result.Ok({
      chapters,
    });
  }
  async fetch_content(chapter: { url: string }) {
    const { url } = chapter;
    console.log([this.unique_id].join("/"), "fetch_content - before goto", url);
    const r = await this.client.get<string>(url);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    // const page = r.data;
    const $ = load(r.data);
    const $content = await $(".contents");
    if (!$content) {
      return Result.Err("没有找到 .content");
    }
    const outerHTML = $content.html();
    if (!outerHTML) {
      return Result.Err("没有 html");
    }
    const r2 = outerHTML.replace(/<p>/g, "").replace(/<\/p>/g, "\n");
    const contents = r2
      .split("\n")
      .map((text) => text.trim())
      .filter(Boolean) as string[];
    return Result.Ok(contents);
  }
  async finish() {
    if (this.browser) {
      await this.browser.destroy();
    }
    return Result.Ok(null);
  }
}
