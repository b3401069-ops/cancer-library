/* 癌別專屬版面（looks）：每個癌別有自己的開場主視覺、章節標題、側邊導覽與紋樣。
   版面樣式在 css/looks.css，以 #article[data-look="..."] 區分；文章內容與互動元件不變。
   新增癌別時，在 data/cancers.js 加上 look（breath、river、botanical、constellation），不加就是原本的星夜書本版面。 */
window.Looks = (function () {
  "use strict";
  function rnd(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  var CN_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
  function svg(body, cls) { return '<svg class="look-art ' + (cls || "") + '" viewBox="0 0 1200 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + body + "</svg>"; }

  /* ---------- 肺癌：呼吸的星光肺葉與上升的氣泡 ---------- */
  function breath() {
    var r = rnd(7), dots = "", tree = "";
    function lobe(cx, flip) {
      for (var i = 0; i < 120; i++) {
        var a = r() * Math.PI * 2, d = Math.sqrt(r()), x = cx + Math.cos(a) * d * 92, y = 230 + Math.sin(a) * d * 150;
        if (flip * (x - cx) > 60 && y < 200) continue; // 內側上方留給氣管
        var s = 1.2 + r() * 2.6;
        dots += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + s.toFixed(1) + '" class="bd" style="animation-delay:' + (r() * 4).toFixed(2) + 's"/>';
      }
    }
    lobe(490, 1); lobe(710, -1);
    tree = '<path d="M600 20 V 170 M600 170 C 580 190 540 200 520 230 M600 170 C 620 190 660 200 680 230 M540 205 C 520 215 500 240 490 280 M660 205 C 680 215 700 240 710 280 M520 230 C 500 250 480 260 460 300 M680 230 C 700 250 720 260 740 300" class="bt"/>';
    var bub = "";
    for (var b = 0; b < 16; b++) { var x0 = (r() * 1200).toFixed(0), s0 = (3 + r() * 9).toFixed(1); bub += '<circle cx="' + x0 + '" cy="480" r="' + s0 + '" class="bb" style="animation-delay:-' + (r() * 14).toFixed(1) + "s;animation-duration:" + (10 + r() * 8).toFixed(1) + 's"/>'; }
    return svg('<g class="lungs">' + tree + dots + "</g>" + bub, "art-breath");
  }

  /* ---------- 大腸直腸癌：月光下蜿蜒的河流與燈籠 ---------- */
  function river() {
    var r = rnd(11), d = "M1240 40 C 1040 60 1080 170 900 190 C 720 210 760 310 560 330 C 380 350 300 420 -40 430";
    var lan = "";
    for (var i = 0; i < 9; i++) { var t = i / 8, x = 1180 - t * 1150 + (r() - .5) * 40, y = 70 + t * 340 + (r() - .5) * 30; lan += '<g class="lan" style="animation-delay:' + (-r() * 6).toFixed(1) + 's"><circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="14" class="lh"/><circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="4.5" class="lc"/></g>'; }
    var reeds = "";
    for (var k = 0; k < 40; k++) { var rx = r() * 1200, h = 40 + r() * 90; reeds += '<path d="M' + rx.toFixed(0) + " 460 Q " + (rx + 8).toFixed(0) + " " + (460 - h / 2).toFixed(0) + " " + (rx + (r() - .3) * 30).toFixed(0) + " " + (460 - h).toFixed(0) + '" class="rd"/>'; }
    var ff = "";
    for (var f = 0; f < 18; f++) ff += '<circle cx="' + (r() * 1200).toFixed(0) + '" cy="' + (120 + r() * 300).toFixed(0) + '" r="2.2" class="ff" style="animation-delay:-' + (r() * 6).toFixed(1) + 's"/>';
    return svg('<path d="' + d + '" class="rv-bank"/><path d="' + d + '" class="rv-water"/><path d="' + d + '" class="rv-flow"/>' + lan + reeds + ff, "art-river");
  }

  /* ---------- 肝癌：植物圖鑑的葉脈與飄落的葉子 ---------- */
  function leaf(x, y, s, rot, cls) {
    var v = "";
    for (var i = 1; i < 7; i++) { var yy = -150 + i * 40; v += "M0 " + yy + " Q 40 " + (yy - 22) + " " + (70 - i * 4) + " " + (yy - 52) + " M0 " + yy + " Q -40 " + (yy - 22) + " " + (-70 + i * 4) + " " + (yy - 52) + " "; }
    return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ") scale(" + s + ')" class="' + cls + '"><path d="M0 -190 C 110 -120 110 80 0 190 C -110 80 -110 -120 0 -190 Z" class="lf"/><path d="M0 -180 V 230" class="lv lv0"/><path d="' + v + '" class="lv"/></g>';
  }
  function botanical() {
    var r = rnd(5), fall = "";
    for (var i = 0; i < 10; i++) fall += '<path d="M0 -9 C 7 -4 7 4 0 10 C -7 4 -7 -4 0 -9 Z" class="fl" style="--x:' + (r() * 1200).toFixed(0) + "px;animation-delay:-" + (r() * 16).toFixed(1) + "s;animation-duration:" + (12 + r() * 8).toFixed(1) + 's"/>';
    var vine = '<path d="M-20 420 C 120 380 160 300 260 300 S 380 360 460 330" class="vn"/><path d="M1220 420 C 1080 380 1040 300 940 300 S 820 360 740 330" class="vn"/>';
    return svg(leaf(150, 230, .95, -28, "lfg") + leaf(1050, 230, .95, 28, "lfg") + leaf(300, 330, .5, 18, "lfg sm") + leaf(900, 330, .5, -18, "lfg sm") + vine + fall, "art-bot");
  }

  /* ---------- 淋巴癌：連成星座的淋巴結；也當作章節星圖 ---------- */
  function constellation(secs) {
    var r = rnd(3), pts = [], lines = "", stars = "";
    for (var i = 0; i < 70; i++) stars += '<circle cx="' + (r() * 1200).toFixed(0) + '" cy="' + (r() * 460).toFixed(0) + '" r="' + (.6 + r() * 1.4).toFixed(1) + '" class="st" style="animation-delay:-' + (r() * 5).toFixed(1) + 's"/>';
    // 右側一串淋巴結星座（9 個，對應九章）
    var n = (secs || []).length || 9;
    for (var k = 0; k < n; k++) { var t = k / (n - 1); pts.push([650 + Math.sin(t * 5.2) * 110 + t * 230, 60 + t * 330 + Math.cos(t * 7) * 26]); }
    for (var j = 0; j < n - 1; j++) lines += '<path d="M' + pts[j][0].toFixed(0) + " " + pts[j][1].toFixed(0) + " L " + pts[j + 1][0].toFixed(0) + " " + pts[j + 1][1].toFixed(0) + '" class="cl" style="animation-delay:' + (j * .25).toFixed(2) + 's"/>';
    var nodes = pts.map(function (p, k) {
      var s = secs && secs[k];
      return '<g class="cn' + (s ? " go" : "") + '"' + (s ? ' data-sec="' + s.id + '" role="link" tabindex="0" aria-label="第 ' + (k + 1) + " 章：" + s.title + '"' : "") + ' style="animation-delay:' + (k * .25 + .4).toFixed(2) + 's">' +
        '<circle cx="' + p[0].toFixed(0) + '" cy="' + p[1].toFixed(0) + '" r="20" class="ch"/><ellipse cx="' + p[0].toFixed(0) + '" cy="' + p[1].toFixed(0) + '" rx="9" ry="7" class="cc"/>' +
        (s ? '<text x="' + (p[0] + 18).toFixed(0) + '" y="' + (p[1] + 5).toFixed(0) + '" class="ct">' + (k + 1) + " " + s.title + "</text>" : "") + "</g>";
    }).join("");
    return svg(stars + lines + nodes, "art-const");
  }

  var HERO = { breath: breath, river: river, botanical: botanical, constellation: constellation };

  /* 章節標題的裝飾與編號文字 */
  function chLabel(look, i) {
    if (look === "river") return "第 " + (i + 1) + " 站";
    if (look === "botanical") return "第" + CN_NUM[i] + "章";
    if (look === "breath") return "CHAPTER " + String(i + 1).padStart(2, "0");
    if (look === "constellation") return "第 " + (i + 1) + " 顆星";
    return "第 " + (i + 1) + " 章";
  }
  function orn(look, i) {
    if (look === "botanical") return '<svg class="orn" viewBox="0 0 220 24" aria-hidden="true"><path d="M0 12 H 88 M132 12 H 220"/><path d="M110 2 C 124 8 124 16 110 22 C 96 16 96 8 110 2 Z"/><path d="M110 4 V 20"/><circle cx="92" cy="12" r="2.5"/><circle cx="128" cy="12" r="2.5"/></svg>';
    if (look === "breath") return '<span class="big-n" aria-hidden="true">' + String(i + 1).padStart(2, "0") + "</span>";
    if (look === "river") return '<span class="station" aria-hidden="true"><i></i></span>';
    if (look === "constellation") return '<span class="node-n" aria-hidden="true">' + (i + 1) + "</span>";
    return "";
  }
  return {
    hero: function (look, secs) { return HERO[look] ? HERO[look](secs) : ""; },
    chLabel: chLabel, orn: orn,
    has: function (look) { return !!HERO[look]; }
  };
})();
