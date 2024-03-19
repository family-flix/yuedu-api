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
  BigInt.prototype.toJSON = function () {
    return Number(this);
  };
  const r = await store.prisma.$queryRaw`
SELECT CAST(COUNT(*) AS INT) AS count
FROM PlayHistory
`;
  console.log(JSON.stringify(r));
})();
