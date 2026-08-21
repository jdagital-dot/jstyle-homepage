// サイト共通設定
// microCMS の接続情報はここで一元管理しています。
// 変更する場合はこのファイルだけを編集してください（index / news-list / news-detail が参照します）。
window.JSTYLE_CONFIG = {
    microcms: {
        serviceDomain: 'j-style-news',
        apiKey: 'nuAX2PFCPxRVLB5iRw37iYoQQ5ugY6ncWLHZ'
    },

    // 大会の期間限定告知（トップページの告知バー・オープニング）
    // entryDeadline までは「募集中」、eventEnd までは「まもなく開催」、
    // それ以降は告知バーもオープニングの大会仕様も自動的に出なくなります。
    // 次の大会で使うときは、この4つの値を書き換えてください。
    cupPromo: {
        entryDeadline: '2026-11-13',   // 申込締切（この日まで「募集中」）
        eventEnd: '2026-12-27',        // 大会最終日（この日まで「まもなく開催」）
        cupUrl: 'jstyle-cup.html',
        entryText: '第2回 J.STYLE杯 参加チーム募集中｜12/26・27 開催／申込締切 11/13（金）必着',
        soonText: '第2回 J.STYLE杯 まもなく開催｜2026年12月26日（土）・27日（日） 上越市総合体育館',

        // オープニング（サイトを開いた直後の全画面表示）の文言
        opening: {
            label: '2ND TOURNAMENT',
            name: 'J.STYLE',
            nameAccent: '杯',
            date: '2026.12.26 — 12.27',
            venue: '上越市総合体育館・身障者体育館'
        }
    }
};
