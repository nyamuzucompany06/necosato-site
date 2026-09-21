// functions/api/cats.ts
// GET -> 猫一覧を返す（公開サイト用・読み取り専用。書き込みは管理画面プロジェクト側で行います）
import type { DbEnv } from "../utils/db";
import { listCats } from "../utils/db";

export const onRequestGet: PagesFunction<DbEnv> = async ({ env }) => {
  const cats = await listCats(env);
  return Response.json(cats);
};
