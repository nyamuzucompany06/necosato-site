// functions/utils/db.ts
//
// データベースへのアクセスはすべてこのファイルを経由します（公開サイト側は読み取り専用）。
// 今は Cloudflare D1（SQLite互換）を使っていますが、将来別のDBに切り替える場合は、
// このファイルの中身だけを書き換えれば、functions/api/*.ts 側はほぼ変更なしで動く想定です。
// necosato-admin/functions/utils/db.ts と対になっています（書き込み系はadmin側のみ）。

export interface Cat {
  id: string;
  name: string;
  image: string;
  gender: string;
  status: string;
}

export interface Settings {
  wishlistUrl: string;
  signatureUrl: string;
  instagramUrl: string;
  lineUrl: string;
  phone: string;
  representative: string;
}

export interface DbEnv {
  DB: D1Database;
}

export async function listCats(env: DbEnv): Promise<Cat[]> {
  const { results } = await env.DB.prepare(
    "SELECT id, name, image, gender, status FROM cats ORDER BY created_at ASC"
  ).all<Cat>();
  return results as unknown as Cat[];
}

export async function getSettings(env: DbEnv): Promise<Settings> {
  const row: any = await env.DB.prepare("SELECT * FROM settings WHERE id = 1").first();
  return {
    wishlistUrl: row?.wishlist_url || "",
    signatureUrl: row?.signature_url || "",
    instagramUrl: row?.instagram_url || "",
    lineUrl: row?.line_url || "",
    phone: row?.phone || "",
    representative: row?.representative || "",
  };
}
