import { HttpClientCore } from "@/domains/http_client";
import { connect } from "@/domains/http_client/connect.axios";
import { Result } from "@/types";
import { parseJSONStr } from "@/utils";
import { SearchedNovelChapterProfile } from "../types";

const _client = new HttpClientCore({
  hostname: "https://m.qidian.com",
});
connect(_client);
_client.setHeaders({
  authority: "m.qidian.com",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  cookie:
    "hiijack=0; e1=%7B%22l6%22%3A%22%22%2C%22l1%22%3A3%2C%22pid%22%3A%22qd_P_Searchresult%22%2C%22eid%22%3A%22qd_S81%22%7D; e2=%7B%22l6%22%3A%22%22%2C%22l1%22%3A2%2C%22pid%22%3A%22qd_p_qidian%22%2C%22eid%22%3A%22%22%7D; Hm_lvt_f00f67093ce2f38f215010b699629083=1708513692; e1=%7B%22l6%22%3A%22%22%2C%22l1%22%3A2%2C%22pid%22%3A%22qd_p_qidian%22%2C%22eid%22%3A%22%22%7D; e2=%7B%22l6%22%3A%22%22%2C%22l1%22%3A2%2C%22pid%22%3A%22qd_p_qidian%22%2C%22eid%22%3A%22qd_H_Search%22%7D; supportwebp=true; newstatisticUUID=1708519993_1240487663; fu=979443076; hiijack=0; _yep_uuid=b2bd78ea-78b5-33d6-eaa5-3c55a29d5e7d; Hm_lvt_1d7d9ab48732e057a5e22e962e5797a6=1708524248; supportWebp=true; Hm_lpvt_1d7d9ab48732e057a5e22e962e5797a6=1710038037; _ga_D20NXNVDG2=GS1.1.1710121298.7.0.1710121298.0.0.0; _ga_VMQL7235X0=GS1.1.1710121298.7.0.1710121298.0.0.0; traffic_utm_referer=; _gid=GA1.2.2038683927.1710167461; tgw_l7_route=7dd6485eac2f4e5e8cec004db2aec682; seo-jump-referrer=; _csrfToken=cb445b1e-0fc5-4119-83c5-7598ff9fe3da; Hm_lpvt_f00f67093ce2f38f215010b699629083=1710169283; _gat_gtag_UA_199934072_2=1; _ga_FZMMH98S83=GS1.1.1710169282.5.0.1710169282.0.0.0; _ga=GA1.1.1141727904.1708513693; _ga_PFYW0QLV3P=GS1.1.1710169282.5.0.1710169282.0.0.0",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
});
const client = {
  async get<T>(...args: Parameters<typeof _client.get>) {
    const r = await _client.get(...args);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    return Result.Ok(r.data as T);
  },
  async post<T>(...args: Parameters<typeof _client.post>) {
    const r = await _client.post(...args);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    return Result.Ok(r.data as T);
  },
};

export class QidianClient {
  async search(keyword: string) {
    const r = await client.get<string>(`/soushu/${encodeURIComponent(keyword)}.html`);
    // 原料获取
    //     const url = host + encodeURI(fetch.search.page.replace(/\{\{kw\}\}/, keyword));
    //     const r = await this.browser.request({
    //       url,
    //       host,
    //       cache_key: fetch.search.page.match(/\{\{kw\}\}/) ? undefined : keyword,
    //       i: fetch.search.i,
    //       kw: keyword,
    //     });
    if (r.error) {
      return Result.Err(r.error.message);
    }
    // 内容提取
    const html = r.data;
    // writeFile(path.resolve(__dirname, "./mock/qidian/search1.html"), html);
    const regexp1 = /type="application\/json">(\{"pageContext":[^<]{1,})<\//;
    // const dataSource = m(html)(extract.search.data_source, "g");
    const json_str = html.match(regexp1);
    if (!json_str) {
      return Result.Err("系统异常", 1001);
    }
    const json_r = parseJSONStr<{
      pageContext: {
        _pageId: string;
        pageProps: {
          pageData: {
            keyState: number;
            bookInfo: {
              records: {
                cbid: string;
                bid: number;
                bName: string;
                desc: string;
                catId: number;
                cat: string;
                subCateId: number;
                subCateName: string;
                subCateUrl: string;
                cid: number;
                bAuth: string;
                state: string;
                signStatus: string;
                imgUrl: string;
                isVip: number;
                form: number;
                fineLayoutOrg: number;
                fineLayout: number;
                lastChapterName: string;
                lastUpdateTime: string;
                bookType: string;
                isPub: number;
                updateTime: string;
                algInfo: string;
                clickCnt: number;
                recomendCnt: number;
                cnt: string;
                isInShelf: number;
                _index: number;
              }[];
              total: number;
              pageNum: number;
              pageSize: number;
              isLast: number;
            };
            filters: {
              key: string;
              title: string;
              items: {
                value: number;
                text: string;
              }[];
            }[];
            tagInfo: null;
            kw: string;
            orderBy: {
              key: string;
              selectedValue: number;
              items: {
                text: string;
                value: string;
              }[];
            };
            user: {
              isLogin: boolean;
              avatar: string;
              nickName: string;
              tucaoUrl: string;
              guid: string;
            };
            gender: string;
            urlOriginal: string;
          };
          configData: null;
        };
        pageTrackReportExt: {
          pid: string;
          type: string;
        };
        routeParams: {
          kw: string;
        };
        urlPathname: string;
        INITIAL_STATE: string;
        urlOriginal: string;
        hostname: string;
        errorMsg: string;
        redirectUrl: string;
      };
    }>(json_str[1]);
    if (json_r.error) {
      return Result.Err(json_r.error.message);
    }
    const json = json_r.data;
    // console.log("[LOG] Search result is: ", dataSource?.length);
    // const result = [];
    // for (let i = 0; i < dataSource.length; i += 1) {
    //   const content = dataSource[i];
    //   const mm = m(content);
    //   result.push({
    //     id: mm(extract.search.id) as string,
    //     title: mm(extract.search.title) as string,
    //     url: mm(extract.search.url) as string,
    //     author: mm(extract.search.author) as string,
    //     cover: mm(extract.search.cover) as string | undefined,
    //     intro: mm(extract.search.intro) as string | undefined,
    //   });
    // }
    const { records, pageNum, total, isLast, pageSize } = json.pageContext.pageProps.pageData.bookInfo;
    return Result.Ok({
      items: records.map((novel) => {
        const { bid, bName, desc, bAuth, imgUrl, state, lastChapterName, lastUpdateTime } = novel;
        return {
          unique_id: String(bid),
          name: bName,
          overview: desc,
          cover_path: imgUrl.startsWith("http") ? imgUrl : `https:${imgUrl}`,
          author: {
            name: bAuth,
          },
          in_production: state === "连载" ? 1 : 0,
          latest_chapter: {
            name: lastChapterName,
            updated_at: lastUpdateTime,
          },
        };
      }),
      page: pageNum,
      total: total,
      no_more: isLast,
      page_size: pageSize,
    });
  }
  /** 获取小说详情 */
  async fetch_profile(id: string) {
    console.log("[NOVEL_PROFILE]fetch_profile", id);
    const r = await client.get<string>(`/book/${id}/`);
    if (r.error) {
      console.log("[NOVEL_PROFILE]fetch_profile failed, because", r.error.message);
      return Result.Err(r.error.message);
    }
    // 内容提取
    const html = r.data;
    const regexp1 = /type="application\/json">(\{"pageContext":[^<]{1,})<\//;
    // const dataSource = m(html)(extract.search.data_source, "g");
    const json_str = html.match(regexp1);
    if (!json_str) {
      return Result.Err("没有匹配到详情数据");
    }
    const json_r = parseJSONStr<{
      pageContext: {
        _pageId: string;
        pageProps: {
          pageData: {
            bookInfo: {
              bookId: number;
              bookName: string;
              authorId: number;
              authorName: string;
              chanId: number;
              chanName: string;
              chanUrl: string;
              auditStatus: number;
              checkLevel: number;
              subCateId: number;
              subCateName: string;
              unitCategoryId: number;
              unitSubCategoryId: number;
              isVip: number;
              bookType: number;
              form: number;
              chargetype: number;
              totalprice: number;
              fineLayout: number;
              isPreCollection: number;
              bookStatus: string;
              actionStatus: string;
              signStatus: string;
              desc: string;
              joinTime: number;
              collect: number;
              updChapterId: number;
              updChapterName: string;
              updTime: string;
              updChapterUrl: string;
              cbid: string;
              bookLabels: any[];
              bookTag: {
                tagName: string;
              };
              updInfo: any[];
              copyRightInfo: {
                editorNickname: string;
              };
              interact: {
                recTicketEnable: number;
                monthTicketEnable: number;
                donateEnable: number;
              };
              updTimes: number;
              wordsCnt: number;
              clickTotal: number;
              recomAll: number;
              recomWeek: number;
              monthTicket: number;
              showWordsCnt: string;
              vipClickWeek: number;
              vipClickAll: number;
              contentRelated: any[];
              isSign: number;
              noRewardMonthTic: number;
              rateInfo: {
                rate: number;
                userCount: number;
                iRated: number;
                totalCnt: number;
                pageMax: number;
                iRateStar: number;
                pageIndex: number;
              };
            };
            updInfo: any[];
            rewardInfo: {
              weekCnt: number;
              todayCnt: number;
            };
            recTicketInfo: {
              weekCnt: number;
              disForward: number;
              disBackward: number;
              rank: number;
              totalCnt: number;
            };
            monthTicketInfo: {
              monthCnt: number;
              disForward: number;
              disBackward: number;
              rank: number;
            };
            checkLevel: number;
            isPre: number;
            isPublication: number;
            salesMode: number;
            hasSubscribe: number;
            hasChapterAuth: number;
            fansInfo: {
              fansRank: {
                userName: string;
                userId: number;
                avatar: string;
                levelName: string;
                userLevel: number;
                levelVal: number;
              }[];
              fansTotal: string;
            };
            bookPromoteInfo: {
              bgImgUrl: {
                imgUrl: string;
                link: string;
              };
              recommend: string;
              freetime: {
                start: number;
                end: number;
              };
              isRecom: number;
              isLimitFree: number;
            };
            cTCnt: number;
            recentChapters: {
              uuid: number;
              cN: string;
              uT: string;
              cnt: number;
              cU: string;
              id: number;
              sS: number;
              uTm: string;
              vS: number;
            }[];
            chapterContentInfo: {
              firstChapterId: number;
              firstChapterC: string;
              firstChapterT: string;
              nextChapterId: number;
            };
            categoryRecomBooks: {
              bookId: number;
              bookName: string;
              chanId: number;
              subCateId: number;
              chanName: string;
              subCategoryName: string;
              authorId: number;
              authorName: string;
              dailyUpdWords: string;
              desc: string;
              recommendName: string;
              chanAlias: string;
            }[];
            authorInfo: {
              cid: number;
              authorId: number;
              name: string;
              authorName: string;
              desc: string;
              authorNickName: string;
              userId: number;
              days: number;
              writeDays: number;
              rank: string;
              rankNum: number;
              avatar: string;
              level: number;
              authorLevel: string;
              books: any[];
              wordsCnt: number;
              cnt: number;
              bookCnt: number;
              total: number;
            };
            readInfo: {
              hasRead: number;
              isInBookShelf: number;
              chapterId: number;
              isVip: number;
            };
            adBanner1: {
              picUrl: string;
            };
            shortUrl: string;
            bookHonorList: {
              time: string;
              desc: string;
            }[];
            stamps: {
              bookId: number;
              cbid: string;
              badgeLogo: string;
              locationId: number;
              status: number;
              createTime: number;
              updateTime: number;
              badge: {
                badgeLogo: string;
                badgeType: string;
                badgeName: string;
                badgeDesc: string;
                badgeGoal: string;
                badgeLink: string;
                badgeImage: string;
                badgeStatus: number;
                badgeTop: number;
                getCount: number;
                addTime: number;
              };
            }[];
            bookActReward: {
              hitU: number;
              subscribeC: number;
              isGotR: number;
              isGotF: number;
            };
            innerBookRecom: {
              recomName: string;
              bookId: number;
            }[];
            bookAlbum: {
              AlbumId: string;
              BookId: string;
              Categories: {
                AlbumId: string;
                BookId: string;
                CategoryId: string;
                CategoryName: string;
                CategoryType: string;
                Content: string;
                CreateTime: string;
                ParentCategoryId: string;
                RoleId: string;
                RoleImage: string;
                RoleInfo: {
                  Capacity: string;
                  RoleHeadIcon: string;
                  RoleId: string;
                  RoleName: string;
                };
                Sort: string;
                SubCategories: any[];
                UpdateTime: string;
              }[];
              Cbid: string;
            };
            user: {
              isLogin: boolean;
              avatar: string;
              nickName: string;
              tucaoUrl: string;
              guid: string;
            };
            gender: string;
            guidanceEnable: number;
          };
        };
        pageTrackReportExt: {
          pid: string;
          type: string;
          bid: number;
        };
        routeParams: {
          bookId: string;
        };
        urlPathname: string;
        INITIAL_STATE: string;
        urlOriginal: string;
        hostname: string;
        errorMsg: string;
        redirectUrl: string;
      };
    }>(json_str[1]);
    if (json_r.error) {
      return Result.Err(json_r.error.message);
    }
    const json = json_r.data;
    const {
      bookId,
      bookName,
      desc,
      bookStatus,
      authorId,
      authorName,
      wordsCnt,
      updChapterId,
      updChapterName,
      updTime,
    } = json.pageContext.pageProps.pageData.bookInfo;
    const { authorInfo, cTCnt, recentChapters } = json.pageContext.pageProps.pageData;
    return Result.Ok({
      unique_id: String(bookId),
      /** 小说名 */
      name: bookName,
      /** 简介 */
      overview: desc,
      /** 封面 */
      cover_path: `https://bookcover.yuewen.com/qdbimg/349573/${bookId}/180.webp`,
      /** 作者信息 */
      author: {
        id: String(authorId),
        name: authorName,
        avatar: authorInfo.avatar,
      },
      /** 是否连载中 */
      in_production: bookStatus === "连载" ? 1 : 0,
      /** 总章节数 */
      chapter_count: cTCnt,
      /** 总字数 */
      word_count: wordsCnt,
      /** 最新章节 */
      latest_chapter: {
        id: updChapterId,
        name: updChapterName,
        updated_at: updTime,
      },
    });
  }
  /** 获取指定小说章节列表 */
  async fetch_chapters(id: string) {
    const r = await client.get<string>(`/book/${id}/catalog/`);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    // 内容提取
    const html = r.data;
    const regexp1 = /type="application\/json">(\{"pageContext":[^<]{1,})<\//;
    // const dataSource = m(html)(extract.search.data_source, "g");
    const json_str = html.match(regexp1);
    if (!json_str) {
      return Result.Err("没有匹配到详情数据");
    }
    const json_r = parseJSONStr<{
      pageContext: {
        _pageId: string;
        pageProps: {
          pageData: {
            vs: {
              vId: number;
              cCnt: number;
              vS: number;
              isD: number;
              vN: string;
              cs: {
                uuid: number;
                cN: string;
                uT: string;
                cnt: number;
                cU: string;
                id: number;
                sS: number;
              }[];
              wC: number;
              hS: boolean;
              _index: number;
            }[];
            bookName: string;
            chapterTotalCnt: number;
            firstChapterJumpurl: string;
            salesMode: number;
            bookType: number;
            bookStatus: string;
            actionStatus: string;
            limitFreeType: number;
            loginStatus: number;
            bookId: string;
            cbid: string;
            bookActReward: {
              hitU: number;
              subscribeC: number;
              isGotR: number;
              isGotF: number;
            };
            user: {
              isLogin: boolean;
              avatar: string;
              nickName: string;
              tucaoUrl: string;
              guid: string;
            };
            gender: string;
            guidanceEnable: number;
          };
          configData: null;
        };
        pageTrackReportExt: {
          pid: string;
          type: string;
          bid: string;
        };
        routeParams: {
          bookId: string;
        };
        urlPathname: string;
        INITIAL_STATE: string;
        urlOriginal: string;
        hostname: string;
        errorMsg: string;
        redirectUrl: string;
      };
    }>(json_str[1]);
    if (json_r.error) {
      return Result.Err(json_r.error.message);
    }
    const json = json_r.data;
    const { vs } = json.pageContext.pageProps.pageData;
    const chapters = vs.reduce((total, section) => {
      return total.concat(
        section.cs.map((chapter) => {
          const { id, uuid, cN, cnt, uT } = chapter;
          return {
            unique_id: String(id),
            section: {
              unique_id: String(section.vId),
              name: section.vN,
              order: section._index,
              chapter_count: section.cCnt,
            },
            name: cN,
            order: uuid,
            text_count: cnt,
            updated_at: uT,
          };
        })
      );
    }, [] as SearchedNovelChapterProfile[]);
    return Result.Ok(chapters);
  }
}
