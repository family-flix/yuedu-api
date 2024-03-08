import { BookSourceCore } from "@/domains/yuedu/v2";

import { sources } from "./sources";

async function main() {
  const r = await BookSourceCore.Create({ payload: sources.sbooktxt });
  if (r.error) {
    return;
  }
  const source = r.data;
  const r2 = await source.search("道诡异仙");
  await source.destroy();
  if (r2.error) {
    console.log(r2.error.message);
    return;
  }
  console.log(r2.data);
}
main();
