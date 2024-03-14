import { DXMWXSource } from "./sources/dxmwx";
import { MingZWSource } from "./sources/mingzw";
import { NovelSourceClient } from "./types";

export const NovelSourceClientMap: Record<string, new (props: { unique_id: string }) => NovelSourceClient> = {
  // bg3: Bg3Source,
  mingzw: MingZWSource,
  dxmwx: DXMWXSource,
};
