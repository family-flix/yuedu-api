import { HttpClientCore } from "@/domains/http_client";
import { connect } from "@/domains/http_client/connect.axios";
import { Result } from "@/types";
import { parseJSONStr } from "@/utils";
import { SearchedNovelChapterProfile } from "../types";

const _client = new HttpClientCore({
  hostname: "https://m.qidian.com",
});
connect(_client);
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
      return Result.Err("没有匹配到列表数据");
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
