import { BaseDomain } from "@/domains/base";
import { DatabaseStore } from "@/domains/store/index";
import { Result } from "@/types/index";

import { pushdeer_send } from "./clients/push_deer";
import { PushClientTypes } from "./constants";
import { SendPayload } from "./types";

enum Events {}
type TheTypesOfEvents = {};

type NotifyProps = {
  type: number;
  token: string;
};

export class PushClient extends BaseDomain<TheTypesOfEvents> {
  static New(options: { type: number; token: string }) {
    const { type, token } = options;
    if (type === undefined) {
      return Result.Err("请指定推送客户端");
    }
    if (token === undefined) {
      return Result.Err("请传入客户端token");
    }
    return Result.Ok(
      new PushClient({
        type,
        token,
      })
    );
  }

  type: number;
  token: string;

  constructor(props: { _name?: string } & NotifyProps) {
    super(props);

    const { type = PushClientTypes.PushDeer, token } = props;
    // this.store = store;
    this.type = type;
    this.token = token;
  }

  send(msg: SendPayload) {
    // console.log("[DOMAIN]notify - send", msg);
    if (this.type === PushClientTypes.PushDeer) {
      return pushdeer_send(msg, this.token);
    }
    return Promise.resolve(Result.Err("推送异常"));
  }
}
