import CronJob from "cron";
import dayjs from "dayjs";

import { Application } from "@/domains/application";
import { ScheduleTask } from "@/domains/schedule";
import { PushClient } from "@/domains/push_client";
import { PushClientTypes } from "@/domains/push_client/constants";

/**
 * 理解方式就是，每秒，都会检查是否要执行对应任务
 * 第一个数字是「秒」，如果为 *，表示 0-60 任一数字，那检查时，当前为 23 秒，0-60秒 满足条件，执行
 * 第二个数字是「分」，如果为 *，表示 0-60 任一数字，那检查时，当前为 1 分，0-60分 满足条件，执行
 * 其他数字同理，依次为 小时、
 */

(async () => {
  const OUTPUT_PATH = process.env.OUTPUT_PATH;
  const PushDeerToken = process.env.OUTPUT_PATH;
  //   const DATABASE_PATH = "file://$OUTPUT_PATH/data/family-flix.db?connection_limit=1";
  if (!OUTPUT_PATH) {
    console.error("缺少数据库文件路径");
    return;
  }
  if (!PushDeerToken) {
    console.error("缺少 PushDeer token");
    return;
  }
  const app = new Application({
    root_path: OUTPUT_PATH,
  });
  const store = app.store;
  const schedule = new ScheduleTask({ app, store });
  const push = new PushClient({ type: PushClientTypes.PushDeer, token: PushDeerToken });

  //   new CronJob.CronJob(
  //     "0 */5 * * * *",
  //     async () => {
  //       console.log("执行任务 at 0 */5 * * * *", dayjs().format("YYYY/MM/DD HH:mm:ss"));
  //       ping_drive_status(store);
  //     },
  //     null,
  //     true,
  //     "Asia/Shanghai"
  //   );

  // 0秒0分*小时（每个小时） 执行一次
  // new CronJob.CronJob(
  //   "0 0 * * * *",
  //   async () => {

  //   },
  //   null,
  //   true,
  //   "Asia/Shanghai"
  // );

  // new CronJob.CronJob(
  //   "0 0 8-23 * * *",
  //   async () => {
  //     console.log("执行任务 at 0 0 8-23 * * *", dayjs().format("YYYY/MM/DD HH:mm:ss"));
  //     notice_push_deer({
  //       title: "资源同步",
  //       markdown: "更新了失效的资源",
  //     });
  //   },
  //   null,
  //   true,
  //   "Asia/Shanghai"
  // );
  new CronJob.CronJob(
    "0 50 8-23 * * *",
    async () => {
      console.log("执行任务 at 0 50 8-23 * * *", dayjs().format("YYYY/MM/DD HH:mm:ss"));
      await schedule.refresh_novel_profiles();
      await schedule.search_novels();
      const r = await schedule.match_searched_chapter();
      if (r.error) {
        return;
      }
      const tip = r.data;
      if (!tip) {
        return;
      }
      push.send({
        markdown: tip,
      });
    },
    null,
    true,
    "Asia/Shanghai"
  );
  // new CronJob.CronJob(
  //   "0 50 8-23 * * *",
  //   async () => {
  //     console.log("执行任务 at 0 50 8-23 * * *", dayjs().format("YYYY/MM/DD HH:mm:ss"));
  //   },
  //   null,
  //   true,
  //   "Asia/Shanghai"
  // );
  new CronJob.CronJob(
    "0 0 8 * * *",
    async () => {
      console.log("执行任务 at 0 0 8 * * *", dayjs().format("YYYY/MM/DD HH:mm:ss"));
    },
    null,
    true,
    "Asia/Shanghai"
  );
  // 0秒0分8时（每天8点时）执行一次
  new CronJob.CronJob(
    "0 0 20 * * *",
    async () => {
      console.log("执行任务 at 0 0 20 * * *", dayjs().format("YYYY/MM/DD HH:mm:ss"));
    },
    null,
    true,
    "Asia/Shanghai"
  );
  new CronJob.CronJob(
    "0 30 23 * * *",
    async () => {
      console.log("执行任务 at 0 0 23 * * *", dayjs().format("YYYY/MM/DD HH:mm:ss"));
      // await schedule.archive_daily_update_collection();
      // notice_push_deer({
      //   title: "归档",
      //   markdown: "归档了当天更新",
      // });
    },
    null,
    true,
    "Asia/Shanghai"
  );
  new CronJob.CronJob(
    "0 0 2 * * *",
    async () => {
      console.log("执行任务 at 0 0 2 * * *", dayjs().format("YYYY/MM/DD HH:mm:ss"));
    },
    null,
    true,
    "Asia/Shanghai"
  );
  new CronJob.CronJob(
    "0 0 3 * * *",
    async () => {
      console.log("执行任务 at 0 0 3 * * *", dayjs().format("YYYY/MM/DD HH:mm:ss"));
    },
    null,
    true,
    "Asia/Shanghai"
  );
  console.log("\nThe Cron jobs is running");
})();
