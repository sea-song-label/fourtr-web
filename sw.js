// 4tr — 曲ができたことを知らせるための小さな受け口（2026-08-28）
//
// 他の画面を開くと、iOSは4trのページを完全に止める。止まっている間は
// ページ自身では何もできない。**この受け口だけは、ページが止まっていても
// iOSが起こしてくれる**ので、サーバーからのお知らせをここで受けて表示する。
//
// ⚠️ここでは音も曲も一切扱わない。お知らせを出すことだけをする。
// （キャッシュには手を出さない——ウェブ版の更新は「アプリ自身が新しい版を
//   見つけて入れ替わる」形で別に解決済み。ここで横取りすると、その仕組みと
//   噛み合わなくなって更新が届かなくなる）

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let title = "4tr";
  let body = "Your song is ready.";
  try {
    const d = event.data ? event.data.json() : null;
    if (d && d.title) title = d.title;
    if (d && d.body) body = d.body;
  } catch (_) {
    // 中身が読めなくても、お知らせ自体は出す
  }
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      tag: "4tr-done",
    })
  );
});

// お知らせを押したら4trを開く（すでに開いていればそれを前に出す）
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
