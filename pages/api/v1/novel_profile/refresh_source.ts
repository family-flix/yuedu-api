/**
 * @file 根据小说详情，在书源网站搜索该小说及其章节
 */

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";

import { app, store } from "@/store/index";
import { Administrator } from "@/domains/user/administrator";
import { ModelQuery } from "@/domains/store/types";
import { BaseApiResp, Result } from "@/types/index";
import { response_error_factory } from "@/utils/server";
import { Job, TaskTypes } from "@/domains/job";
import { ScheduleTask } from "@/domains/schedule";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const { novel_id } = req.body as Partial<{
    novel_id: string;
  }>;
  if (!novel_id) {
    return e(Result.Err("缺少 novel_id 参数"));
  }
  const t_res = await Administrator.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  const where: ModelQuery<"novel_profile"> = {
    id: novel_id,
  };
  const r = await store.prisma.novel_profile.findFirst({
    where,
    include: {
      author: true,
    },
  });
  if (!r) {
    return e(Result.Err("没有匹配的记录"));
  }
  const novel = r;
  const r2 = await Job.New({
    unique_id: r.id,
    desc: `搜索「${r.name}」及其章节`,
    type: TaskTypes.SearchNovelInSource,
    user_id: user.id,
    app,
    store,
  });
  if (r2.error) {
    return e(Result.Err(r2.error.message));
  }
  const job = r2.data;
  const schedule = new ScheduleTask({
    app,
    store,
    on_print(n) {
      job.output.write(n);
    },
  });
  async function run() {
    await schedule.search_novel_by_novel_sources({
      novel,
      user,
    });
    job.finish();
  }
  run();
  res.status(200).json({
    code: 0,
    msg: "",
    data: {
      job_id: job.id,
    },
  });
}
