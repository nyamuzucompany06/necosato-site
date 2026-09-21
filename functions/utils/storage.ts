// functions/utils/storage.ts
//
// 画像の取得はすべてこのファイルを経由します（公開サイト側は読み取り専用）。
// 今は Cloudflare R2 を使っていますが、AWS S3 等に切り替える場合は、
// このファイルの中身だけをAWS SDKの getObject を使う実装に書き換えれば、
// 呼び出し側（images/[[path]].ts）は変更不要な想定です。
// necosato-admin/functions/utils/storage.ts と対になっています（書き込み系はadmin側のみ）。

export interface StorageEnv {
  IMAGES: R2Bucket;
}

export interface StoredObject {
  body: ReadableStream | null;
  contentType: string;
  etag: string;
}

export async function getObject(env: StorageEnv, key: string): Promise<StoredObject | null> {
  const object = await env.IMAGES.get(key);
  if (!object) return null;
  return {
    body: object.body,
    contentType: object.httpMetadata?.contentType || "application/octet-stream",
    etag: object.httpEtag,
  };
}
