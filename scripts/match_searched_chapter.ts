import { Application } from "@/domains/application";
import { ScheduleTask } from "@/domains/schedule";

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
  await schedule.match_searched_chapter({ force: true });
  console.log("Completed");
})();
