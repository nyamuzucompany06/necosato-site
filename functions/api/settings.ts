// functions/api/settings.ts
// GET -> サイト設定を返す（公開サイト用・読み取り専用。書き込みは管理画面プロジェクト側で行います）
import type { DbEnv } from "../utils/db";
import { getSettings } from "../utils/db";

export const onRequestGet: PagesFunction<DbEnv> = async ({ env }) => {
  const settings = await getSettings(env);
  return Response.json(settings);
};
