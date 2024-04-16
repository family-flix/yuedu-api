import { Application } from "@/domains/application";
import { QidianClient } from "@/domains/novel_profile/qidian";
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
  const $qidian = new QidianClient();
  const r = await $qidian.search("最初");
  if (r.error) {
    console.log(r.error.message);
    return;
  }
  console.log(r.data);
  console.log("Completed");
})();
