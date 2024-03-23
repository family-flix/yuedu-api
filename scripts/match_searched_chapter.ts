import { Application } from "@/domains/application";
import { ScheduleTask } from "@/domains/schedule";
import { parse_argv } from "@/utils/server";

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
  const options = parse_argv(process.argv.slice(2));
  await schedule.match_searched_chapter({ force: !!options.force });
  console.log("Completed");
})();
