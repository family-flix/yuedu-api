import { Application } from "@/domains/application";
import { ScheduleTask } from "@/domains/schedule";

/**
 * 理解方式就是，每秒，都会检查是否要执行对应任务
 * 第一个数字是「秒」，如果为 *，表示 0-60 任一数字，那检查时，当前为 23 秒，0-60秒 满足条件，执行
 * 第二个数字是「分」，如果为 *，表示 0-60 任一数字，那检查时，当前为 1 分，0-60分 满足条件，执行
 * 其他数字同理，依次为 小时、
 */

(async () => {
  const OUTPUT_PATH = process.env.OUTPUT_PATH;
  if (!OUTPUT_PATH) {
    console.error("缺少数据库文件路径");
    return;
  }
  const app = new Application({
    root_path: OUTPUT_PATH,
  });
  const store = app.store;
  const schedule = new ScheduleTask({ app, store });
  await schedule.search_novels();
  const r = await schedule.match_searched_chapter();
  console.log("\nThe Cron jobs is running");
})();
