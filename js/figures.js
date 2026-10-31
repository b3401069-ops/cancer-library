/* 動畫圖解庫：所有癌別共用。文章資料用 { type: "figure", id: "..." } 引用。
   動畫用 SVG 內建的 <animate>（SMIL），離開畫面時由 app.js 暫停，減少手機耗電；
   使用者開啟「減少動態效果」時，會停在完整的最後畫面。顏色全部取自 CSS 變數，深淺色模式都適用。 */
window.Figures = (function () {
  "use strict";
  var INK = "var(--ink)", MUTED = "var(--muted)", ACC = "var(--accent)", GOLD = "var(--gold)", LINE = "var(--line)",
      TUM = "var(--tumor)", OK = "var(--good)", SOFT = "var(--info-bg)", PANEL = "var(--panel)";
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 14) + '" fill="' + (o.fill || MUTED) + '" text-anchor="' + (o.anchor || "middle") + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") + ">" + s + "</text>"; }
  function svg(vb, label, body, cls) { return '<svg class="anim ' + (cls || "") + '" viewBox="' + vb + '" role="img" aria-label="' + label + '">' + body + "</svg>"; }
  // 依序出現：在 dur 秒的循環中，於 t 秒時從 0 長到 1，最後一起淡出
  function popIn(t, dur, attr, to) {
    var a = (t / dur).toFixed(3), b = Math.min(.9, t / dur + .05).toFixed(3);
    return '<animate attributeName="' + attr + '" values="0;0;' + to + ';' + to + ';0" keyTimes="0;' + a + ";" + b + ';.94;1" dur="' + dur + 's" repeatCount="indefinite"/>';
  }

  /* ---------- 1. 呼吸 ----------
     立體感的肺臟：右肺三葉、左肺兩葉（含心臟凹陷）、氣管軟骨環、逐級變細的支氣管樹、
     橫膈膜隨呼吸上下移動；吸氣時氧氣（金色）流入，吐氣時二氧化碳（灰藍）流出；
     右側放大鏡顯示肺泡和微血管之間的氣體交換。一個呼吸循環 5 秒。 */
  function breathe() {
    var D = 5, OX = -28; // 整體往左移，右側留給放大鏡
    function P(x, y) { return [x + OX, y]; }
    function pt(p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }
    // 支氣管樹：手動定出葉支氣管，再往下分支三層
    var segs = [], leaves = [], routes = [];
    function grow(x, y, ang, len, w, depth, trail) {
      var r = ang * Math.PI / 180, x2 = x + Math.cos(r) * len, y2 = y + Math.sin(r) * len;
      segs.push({ d: "M" + pt([x, y]) + " L" + pt([x2, y2]), w: w });
      var tr = trail.concat([[x2, y2]]);
      if (depth === 0) { leaves.push([x2, y2]); routes.push(tr); return; }
      var spread = 24 + depth * 4;
      grow(x2, y2, ang - spread, len * .7, w * .66, depth - 1, tr);
      grow(x2, y2, ang + spread, len * .7, w * .66, depth - 1, tr);
    }
    var top = P(200, 8), carina = P(200, 108), rMain = P(176, 134), lMain = P(228, 140);
    var base = [top, carina];
    // 右肺（畫面左側）：上葉、中葉、下葉
    grow(rMain[0], rMain[1], 212, 26, 4.2, 2, base.concat([rMain]));
    grow(rMain[0] - 6, rMain[1] + 12, 158, 26, 4.2, 2, base.concat([rMain, [rMain[0] - 6, rMain[1] + 12]]));
    grow(rMain[0] - 6, rMain[1] + 12, 102, 36, 4.6, 2, base.concat([rMain, [rMain[0] - 6, rMain[1] + 12]]));
    // 左肺（畫面右側）：上葉、舌葉、下葉
    grow(lMain[0], lMain[1], 322, 28, 4.2, 2, base.concat([lMain]));
    grow(lMain[0] + 8, lMain[1] + 10, 22, 22, 3.8, 2, base.concat([lMain, [lMain[0] + 8, lMain[1] + 10]]));
    grow(lMain[0] + 8, lMain[1] + 10, 80, 38, 4.6, 2, base.concat([lMain, [lMain[0] + 8, lMain[1] + 10]]));

    var tree = '<path d="M' + pt(carina) + " L" + pt(rMain) + " L" + pt([rMain[0] - 6, rMain[1] + 12]) + '" stroke-width="8"/>' +
      '<path d="M' + pt(carina) + " L" + pt(lMain) + " L" + pt([lMain[0] + 8, lMain[1] + 10]) + '" stroke-width="7.5"/>';
    segs.forEach(function (s) { tree += '<path d="' + s.d + '" stroke-width="' + s.w.toFixed(2) + '"/>'; });
    // 末端的肺泡小葡萄串
    var alv = "";
    leaves.forEach(function (l, i) {
      var k = (i % 3) * .12;
      alv += '<g transform="translate(' + pt(l) + ')"><circle r="3.4" cx="-2" cy="1"/><circle r="3" cx="2.4" cy="-1.6"/><circle r="2.6" cx="1.6" cy="2.8"/>' +
        '<animate attributeName="opacity" values=".55;1;1;.55" keyTimes="0;.4;.5;1" dur="' + D + 's" begin="' + k + 's" repeatCount="indefinite"/></g>';
    });
    // 空氣粒子：吸氣往下（金色氧氣），吐氣往上（灰藍二氧化碳）
    var air = "";
    routes.forEach(function (r, i) {
      if (i % 2) return;
      var d = "M" + r.map(pt).join(" L");
      [0, .22, .44].forEach(function (b) {
        air += '<circle r="2.4"><animateMotion dur="' + D + 's" begin="' + b + 's" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;1;0;0" keyTimes="0;.42;.5;.92;1" path="' + d + '"/>' +
          '<animate attributeName="fill" values="#f4d27e;#f4d27e;#9fb3d9;#9fb3d9" keyTimes="0;.46;.48;1" calcMode="discrete" dur="' + D + 's" begin="' + b + 's" repeatCount="indefinite"/>' +
          '<animate attributeName="opacity" values="0;1;1;.9;0" keyTimes="0;.05;.45;.88;1" dur="' + D + 's" begin="' + b + 's" repeatCount="indefinite"/></circle>';
      });
    });
    var LP = lungPaths(OX), RL = LP.RL, LL = LP.LL, fiss = LP.fiss;
    var rings = "";
    for (var y = 18; y <= 98; y += 10) rings += '<path d="M' + pt(P(193, y)) + " q7 3 14 0" + '"/>';

    // 放大鏡：肺泡與微血管
    var MX = 382, MY = 142, MR = 64, src = P(268, 206);
    var cells = "";
    [0, .6, 1.2, 1.8, 2.4].forEach(function (b) {
      cells += '<ellipse rx="6.5" ry="4" fill="#e0566b"><animateMotion dur="3s" begin="' + b + 's" repeatCount="indefinite" rotate="auto" path="M' + (MX - 74) + " " + (MY + 40) + " C" + (MX - 30) + " " + (MY + 18) + " " + (MX + 30) + " " + (MY + 54) + " " + (MX + 74) + " " + (MY + 30) + '"/></ellipse>';
    });
    var gas = "";
    [[-26, 0], [2, .7], [28, 1.4]].forEach(function (g) {
      gas += '<circle cx="' + (MX + g[0]) + '" r="3" fill="#f4d27e"><animate attributeName="cy" values="' + (MY - 14) + ";" + (MY + 30) + '" dur="2.1s" begin="' + g[1] + 's" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.8;1" dur="2.1s" begin="' + g[1] + 's" repeatCount="indefinite"/></circle>';
      gas += '<circle cx="' + (MX + g[0] + 10) + '" r="2.6" fill="#9fb3d9"><animate attributeName="cy" values="' + (MY + 30) + ";" + (MY - 14) + '" dur="2.1s" begin="' + (g[1] + 1) + 's" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.8;1" dur="2.1s" begin="' + (g[1] + 1) + 's" repeatCount="indefinite"/></circle>';
    });
    var sacs = "";
    [[-30, -22, 20], [0, -30, 22], [30, -20, 19], [-14, -2, 15], [16, 0, 15]].forEach(function (s) {
      sacs += '<circle cx="' + (MX + s[0]) + '" cy="' + (MY + s[1]) + '" r="' + s[2] + '" fill="url(#br-sac)" stroke="#f6c7d0" stroke-width="1.2"><animate attributeName="r" values="' + (s[2] * .92) + ";" + s[2] + ";" + s[2] + ";" + (s[2] * .92) + '" keyTimes="0;.42;.5;1" dur="' + D + 's" repeatCount="indefinite"/></circle>';
    });

    return svg("0 0 460 300", "肺臟呼吸動畫：吸氣時氧氣經氣管、支氣管到肺泡進入血液，吐氣時排出二氧化碳",
      "<defs>" +
      '<radialGradient id="br-lung" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="#f6c1cc" stop-opacity=".95"/><stop offset=".55" stop-color="#c87e9a" stop-opacity=".75"/><stop offset="1" stop-color="#6e4a8e" stop-opacity=".7"/></radialGradient>' +
      '<radialGradient id="br-sac" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fbd9e0"/><stop offset="1" stop-color="#c47a95"/></radialGradient>' +
      '<linearGradient id="br-vessel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c3f6e"/><stop offset="1" stop-color="#b8475e"/></linearGradient>' +
      '<filter id="br-glow" filterUnits="userSpaceOnUse" x="0" y="0" width="460" height="300"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<clipPath id="br-mag"><circle cx="' + MX + '" cy="' + MY + '" r="' + MR + '"/></clipPath>' +
      "</defs>" +
      // 肺臟與支氣管（一起隨呼吸擴張）
      '<g class="br-lungs">' +
      '<path d="' + RL + '" fill="url(#br-lung)" stroke="#f3c9d3" stroke-width="1.6"/>' +
      '<path d="' + LL + '" fill="url(#br-lung)" stroke="#f3c9d3" stroke-width="1.6"/>' +
      '<path d="M' + pt(P(124, 70)) + " C" + pt(P(112, 92)) + " " + pt(P(104, 120)) + " " + pt(P(100, 150)) + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M' + pt(P(276, 70)) + " C" + pt(P(288, 92)) + " " + pt(P(296, 120)) + " " + pt(P(300, 150)) + '" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>' +
      '<g fill="none" stroke="#5a3a78" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="3 3">' + fiss + "</g>" +
      '<g fill="none" stroke="#eef0ff" stroke-linecap="round" stroke-linejoin="round" filter="url(#br-glow)">' + tree + "</g>" +
      '<g fill="#fde3ea" stroke="#d68aa3" stroke-width=".6">' + alv + "</g>" +
      "</g>" +
      // 氣管
      '<path d="M' + pt(P(200, 8)) + " L" + pt(P(200, 110)) + '" stroke="#eef0ff" stroke-width="13" stroke-linecap="round" filter="url(#br-glow)"/>' +
      '<g fill="none" stroke="#8f97d6" stroke-width="1.6">' + rings + "</g>" +
      // 橫膈膜
      '<path class="br-dia" d="M' + pt(P(64, 270)) + " C" + pt(P(110, 238)) + " " + pt(P(170, 240)) + " " + pt(P(200, 256)) + " C" + pt(P(230, 240)) + " " + pt(P(290, 238)) + " " + pt(P(336, 270)) + '" fill="none" stroke="#e8c77f" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>' +
      air +
      // 放大鏡連線
      '<circle cx="' + src[0] + '" cy="' + src[1] + '" r="9" fill="none" stroke="#e8c77f" stroke-width="1.6"/>' +
      '<path d="M' + (src[0] + 9) + " " + (src[1] - 3) + " L" + (MX - MR + 4) + " " + (MY + 18) + '" stroke="#e8c77f" stroke-width="1.2" stroke-dasharray="3 4"/>' +
      // 放大鏡內容
      '<circle cx="' + MX + '" cy="' + MY + '" r="' + MR + '" fill="#0d1236"/>' +
      '<g clip-path="url(#br-mag)">' +
      '<path d="M' + (MX - 74) + " " + (MY + 40) + " C" + (MX - 30) + " " + (MY + 18) + " " + (MX + 30) + " " + (MY + 54) + " " + (MX + 74) + " " + (MY + 30) + '" fill="none" stroke="url(#br-vessel)" stroke-width="22" stroke-linecap="round" opacity=".9"/>' +
      sacs + cells + gas + "</g>" +
      '<circle cx="' + MX + '" cy="' + MY + '" r="' + MR + '" fill="none" stroke="#e8c77f" stroke-width="2.5"/>' +
      txt(MX, MY - MR - 10, "肺泡放大", { fill: "#f0cf86", weight: 700, size: 13 }) +
      '<g font-size="12">' +
      '<circle cx="' + (MX - 52) + '" cy="' + (MY + MR + 22) + '" r="4" fill="#f4d27e"/>' + txt(MX - 44, MY + MR + 26, "氧氣進入血液", { anchor: "start", size: 12, fill: "#f0cf86" }) +
      '<circle cx="' + (MX - 52) + '" cy="' + (MY + MR + 42) + '" r="4" fill="#9fb3d9"/>' + txt(MX - 44, MY + MR + 46, "二氧化碳排出", { anchor: "start", size: 12, fill: "#b9c6e6" }) +
      "</g>" +
      // 標籤
      txt(P(214, 30)[0], 30, "氣管", { anchor: "start", fill: "#d9dcf5" }) +
      '<path d="M' + pt(P(196, 186)) + " L" + pt(P(186, 140)) + '" stroke="#d9dcf5" stroke-width="1" stroke-dasharray="2 3"/>' + txt(P(200, 200)[0], 200, "支氣管", { fill: "#d9dcf5", size: 13 }) +
      txt(P(120, 290)[0], 290, "右肺（三葉）", { fill: "#d9dcf5" }) + txt(P(280, 290)[0], 290, "左肺（兩葉）", { fill: "#d9dcf5" }) +
      txt(P(200, 286)[0], 272, "橫膈膜", { fill: "#e8c77f", size: 12 }) +
      '<g font-weight="700">' + txt(P(52, 40)[0], 40, "吸氣", { fill: "#f4d27e", cls: "cue-in", anchor: "start", size: 16 }) + txt(P(52, 40)[0], 40, "吐氣", { fill: "#b9c6e6", cls: "cue-out", anchor: "start", size: 16 }) + "</g>", "breathe-fig");
  }

  /* ---------- 2. 正常細胞 vs 癌細胞 ---------- */
  function cells() {
    var D = 7, body = "";
    // 正常：整齊排列，長到 6 個就停
    var normal = [[50, 80], [80, 80], [110, 80], [50, 110], [80, 110], [110, 110]];
    normal.forEach(function (p, i) {
      body += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0" fill="' + SOFT + '" stroke="' + ACC + '" stroke-width="2">' + popIn(.3 + i * .55, D, "r", 12) + "</circle>";
      body += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0" fill="' + ACC + '">' + popIn(.3 + i * .55, D, "r", 3.5) + "</circle>";
    });
    body += '<g opacity="0">' + '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.5;.55;.94;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<rect x="36" y="134" width="88" height="24" rx="12" fill="' + OK + '" opacity=".15"/>' + txt(80, 151, "數量剛好，停！", { fill: OK, weight: 700 }) + "</g>";
    // 癌細胞：不規則、越長越多
    var seed = [[250, 100], [272, 88], [232, 84], [262, 120], [236, 118], [290, 108], [282, 136], [214, 102], [248, 66], [302, 82], [226, 140], [258, 146], [312, 124], [206, 74], [276, 62], [298, 150], [212, 130], [320, 100]];
    seed.forEach(function (p, i) {
      var t = .3 + i * .33, r = 9 + (i % 3) * 2;
      body += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0" fill="' + TUM + '" fill-opacity=".22" stroke="' + TUM + '" stroke-width="1.8">' + popIn(t, D, "r", r) + "</circle>";
      body += '<circle cx="' + (p[0] + 1) + '" cy="' + (p[1] - 1) + '" r="0" fill="' + TUM + '">' + popIn(t, D, "r", 3.5 + (i % 2)) + "</circle>";
    });
    return svg("0 0 360 200", "動畫：正常細胞長到需要的數量就停止，癌細胞不停分裂",
      '<line x1="180" y1="30" x2="180" y2="180" stroke="' + LINE + '" stroke-dasharray="4 5"/>' +
      txt(80, 32, "正常細胞", { fill: INK, weight: 700, size: 15 }) + txt(260, 32, "癌細胞", { fill: TUM, weight: 700, size: 15 }) +
      body + txt(260, 186, "煞車壞了，一直分裂", { fill: TUM }));
  }

  /* ---------- 共用：立體肺臟外形（座標以 400 寬為準，ox 可整體左右平移） ---------- */
  function lungPaths(ox) {
    function P(x, y) { return (x + ox).toFixed(1) + " " + y.toFixed(1); }
    var RL = "M" + P(164, 46) + " C" + P(140, 48) + " " + P(116, 78) + " " + P(104, 114) + " C" + P(92, 150) + " " + P(84, 192) + " " + P(82, 228) +
      " C" + P(81, 246) + " " + P(92, 256) + " " + P(110, 250) + " C" + P(130, 244) + " " + P(152, 238) + " " + P(172, 242) +
      " C" + P(184, 244) + " " + P(190, 236) + " " + P(188, 222) + " C" + P(184, 196) + " " + P(182, 172) + " " + P(184, 148) +
      " C" + P(186, 120) + " " + P(184, 92) + " " + P(180, 70) + " C" + P(177, 54) + " " + P(172, 46) + " " + P(164, 46) + " Z";
    var LL = "M" + P(236, 46) + " C" + P(260, 48) + " " + P(284, 78) + " " + P(296, 114) + " C" + P(308, 150) + " " + P(316, 192) + " " + P(318, 228) +
      " C" + P(319, 246) + " " + P(308, 256) + " " + P(290, 250) + " C" + P(272, 244) + " " + P(256, 240) + " " + P(244, 244) +
      " C" + P(232, 248) + " " + P(226, 240) + " " + P(230, 228) + " C" + P(240, 212) + " " + P(244, 192) + " " + P(234, 178) +
      " C" + P(222, 166) + " " + P(216, 150) + " " + P(216, 128) + " C" + P(216, 100) + " " + P(218, 82) + " " + P(222, 66) +
      " C" + P(226, 52) + " " + P(230, 46) + " " + P(236, 46) + " Z";
    var hFis = "M" + P(98, 138) + " C" + P(124, 134) + " " + P(156, 140) + " " + P(182, 150);
    var fiss = '<path d="' + hFis + '"/><path d="M' + P(90, 180) + " C" + P(116, 196) + " " + P(138, 218) + " " + P(148, 244) + '"/>' +
      '<path d="M' + P(306, 142) + " C" + P(284, 172) + " " + P(266, 208) + " " + P(258, 242) + '"/>';
    return { RL: RL, LL: LL, fiss: fiss, hFis: hFis };
  }
  var LUNG_DEFS = function (k) {
    return '<radialGradient id="' + k + '-lung" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="#f6c1cc" stop-opacity=".95"/><stop offset=".55" stop-color="#c87e9a" stop-opacity=".75"/><stop offset="1" stop-color="#6e4a8e" stop-opacity=".7"/></radialGradient>' +
      '<radialGradient id="' + k + '-tum" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#ffb199"/><stop offset=".6" stop-color="#e2604e"/><stop offset="1" stop-color="#9c3346"/></radialGradient>';
  };
  function lungBody(k, ox, extra) {
    var L = lungPaths(ox);
    return '<path d="' + L.RL + '" fill="url(#' + k + '-lung)" stroke="#f3c9d3" stroke-width="1.6"/>' +
      '<path d="' + L.LL + '" fill="url(#' + k + '-lung)" stroke="#f3c9d3" stroke-width="1.6"/>' +
      '<g fill="none" stroke="#5a3a78" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="3 3">' + L.fiss + "</g>" + (extra || "");
  }

  /* ---------- 標靶：阻斷生長訊號 ----------
     放大看癌細胞的一小段：細胞膜上的「生長開關」（受體）因基因突變一直開著，
     訊號一路傳到細胞核，細胞不停分裂；標靶藥物卡進開關內側，訊號中斷，細胞核暗下來。一循環 9 秒。 */
  function genes() {
    var D = 9;
    function ph(t, a, b, fill) {
      return '<text x="200" y="26" font-size="15" font-weight="700" fill="' + fill + '" text-anchor="middle" opacity="0">' + t +
        '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ";" + (a + .02).toFixed(2) + ";" + (b - .02).toFixed(2) + ";" + b + ';1" dur="' + D + 's" repeatCount="indefinite"/></text>';
    }
    // 訊號粒子：從開關沿著路徑傳到細胞核
    var sig = "";
    [0, .5, 1, 1.5].forEach(function (b) {
      sig += '<circle r="4.2" fill="#f4d27e"><animateMotion dur="2s" begin="' + b + 's" repeatCount="indefinite" path="M200 118 C 170 140 232 160 196 180 C 176 192 204 200 200 210"/>' +
        '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="2s" begin="' + b + 's" repeatCount="indefinite"/></circle>';
    });
    var names = ["EGFR", "ALK", "ROS1"], cyc = "";
    names.forEach(function (n, i) {
      var k0 = (i / 3).toFixed(3), k1 = (i / 3 + .01).toFixed(3), k2 = ((i + 1) / 3 - .01).toFixed(3), k3 = ((i + 1) / 3).toFixed(3);
      cyc += '<text x="200" y="111" font-size="12" font-weight="700" fill="#2a1f05" text-anchor="middle" opacity="0">' + n +
        '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + k0 + ";" + k1 + ";" + k2 + ";" + k3 + ';1" dur="' + (D * 3) + 's" repeatCount="indefinite"/></text>';
    });
    return svg("0 0 400 300", "動畫：基因突變讓生長開關一直開著，標靶藥物卡住開關，生長訊號被阻斷",
      "<defs>" +
      '<linearGradient id="tg-mem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9a8b8"/><stop offset="1" stop-color="#b56f8f"/></linearGradient>' +
      '<radialGradient id="tg-cyto" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#3b2f6e"/><stop offset="1" stop-color="#1b1a48"/></radialGradient>' +
      '<radialGradient id="tg-nuc" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#f6a2b5"/><stop offset="1" stop-color="#8f3d6b"/></radialGradient>' +
      '<linearGradient id="tg-pill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7ec8f5"/><stop offset=".5" stop-color="#7ec8f5"/><stop offset=".5" stop-color="#f6f7ff"/><stop offset="1" stop-color="#f6f7ff"/></linearGradient>' +
      '<filter id="tg-glow" filterUnits="userSpaceOnUse" x="0" y="-30" width="400" height="330"><feGaussianBlur stdDeviation="5"/></filter>' +
      "</defs><g transform=\"translate(0 30)\">" +
      // 細胞內部與細胞膜
      '<path d="M0 84 Q200 64 400 84 V270 H0 Z" fill="url(#tg-cyto)"/><path d="M0 -30 H400 V80 Q200 60 0 80 Z" fill="#0e1236" opacity=".35"/>' +
      '<path d="M0 78 Q200 58 400 78" fill="none" stroke="url(#tg-mem)" stroke-width="10"/>' +
      '<path d="M0 90 Q200 70 400 90" fill="none" stroke="url(#tg-mem)" stroke-width="10" opacity=".85"/>' +
      txt(16, 56, "細胞外", { anchor: "start", fill: "#b3b9dc", size: 12 }) + txt(16, 112, "細胞內", { anchor: "start", fill: "#b3b9dc", size: 12 }) +
      txt(384, 66, "細胞膜", { anchor: "end", fill: "#e9a8b8", size: 12 }) +
      // 受體（生長開關）
      '<g>' +
      '<path d="M188 40 C178 30 182 16 194 20 L198 72 M212 40 C222 30 218 16 206 20 L202 72" fill="#9fb3d9" stroke="#dfe6ff" stroke-width="2"/>' +
      '<rect x="196" y="62" width="8" height="34" fill="#9fb3d9"/>' +
      '<rect x="178" y="98" width="44" height="20" rx="6" fill="#f0cf86" stroke="#fff3cf" stroke-width="1.5"/>' + cyc +
      '<path d="M226 92 l5 -9 l2 8 l8 -3 l-5 8 l8 3 l-9 2 l2 8 l-7 -5 l-5 7 l0 -9 z" fill="#ff8f7a"><animate attributeName="opacity" values="1;.4;1" dur="1.2s" repeatCount="indefinite"/></path>' +
      "</g>" +
      txt(262, 104, "基因突變：", { anchor: "start", fill: "#ff8f7a", size: 12, weight: 700 }) + txt(262, 120, "開關卡在「開」", { anchor: "start", fill: "#ff8f7a", size: 12 }) +
      // 訊號路徑
      '<path d="M200 118 C 170 140 232 160 196 180 C 176 192 204 200 200 210" fill="none" stroke="#f4d27e" stroke-width="2" stroke-dasharray="3 5" opacity=".6"/>' +
      '<g><animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.42;.48;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + sig + "</g>" +
      txt(150, 160, "生長訊號", { fill: "#f4d27e", size: 12 }) +
      // 細胞核與分裂
      '<ellipse cx="200" cy="236" rx="78" ry="30" fill="#f6a2b5" opacity=".5" filter="url(#tg-glow)"><animate attributeName="opacity" values=".55;.85;.55;.55;0;0;.55" keyTimes="0;.15;.3;.45;.55;.95;1" dur="' + D + 's" repeatCount="indefinite"/></ellipse>' +
      '<ellipse cx="200" cy="236" rx="70" ry="26" fill="url(#tg-nuc)" stroke="#fbd0db" stroke-width="1.5"><animate attributeName="opacity" values="1;1;.35;.35;1" keyTimes="0;.48;.58;.95;1" dur="' + D + 's" repeatCount="indefinite"/></ellipse>' +
      txt(200, 241, "細胞核", { fill: "#fff", size: 13, weight: 700 }) +
      '<g opacity="0"><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.1;.4;.46;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<circle cx="312" cy="224" r="12" fill="none" stroke="#ff8f7a" stroke-width="2"><animate attributeName="cx" values="312;304;312" dur="1.2s" repeatCount="indefinite"/></circle>' +
      '<circle cx="312" cy="224" r="12" fill="none" stroke="#ff8f7a" stroke-width="2"><animate attributeName="cx" values="312;328;312" dur="1.2s" repeatCount="indefinite"/></circle>' +
      txt(318, 256, "不停分裂", { fill: "#ff8f7a", size: 12, weight: 700 }) + "</g>" +
      // 標靶藥物（口服小分子）
      '<g><animateTransform attributeName="transform" type="translate" values="-150 70;-150 70;0 0;0 0;-150 70" keyTimes="0;.32;.44;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.3;.34;.93;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<rect x="168" y="100" width="30" height="16" rx="8" fill="url(#tg-pill)" stroke="#0e1236" stroke-width="1"/>' + "</g>" +
      '<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.47;.5;.93;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<circle cx="200" cy="164" r="15" fill="#0e1236" stroke="#7fdcaa" stroke-width="2.5"/><path d="M193 157 l14 14 M207 157 l-14 14" stroke="#7fdcaa" stroke-width="3" stroke-linecap="round"/>' +
      txt(226, 168, "訊號被阻斷", { anchor: "start", fill: "#7fdcaa", size: 13, weight: 700 }) +
      txt(118, 112, "標靶藥物", { anchor: "end", fill: "#7ec8f5", size: 12, weight: 700 }) + "</g>" +
      "</g>" + ph("1. 基因突變讓生長開關一直開著", 0, .32, "#ff8f7a") + ph("2. 標靶藥物卡進開關", .32, .5, "#7ec8f5") + ph("3. 訊號中斷，癌細胞停止生長", .5, .97, "#7fdcaa"), "genes-fig");
  }

  /* ---------- 營養：國健署「我的餐盤」 ---------- */
  function plate() {
    var D = 6, CX = 168, CY = 136;
    function drop(t, body) {
      return '<g opacity="0"><animate attributeName="opacity" values="0;1" begin="' + t + 's" dur=".5s" fill="freeze"/>' +
        '<animateTransform attributeName="transform" type="translate" values="0 -14;0 0" begin="' + t + 's" dur=".6s" fill="freeze" calcMode="spline" keySplines=".2 .8 .3 1"/>' + body + "</g>";
    }
    function tag(x, y, label, sub, color, anchor) {
      return '<g><rect x="' + (anchor === "end" ? x - 112 : x) + '" y="' + (y - 15) + '" width="112" height="36" rx="10" fill="#141a46" stroke="' + color + '" stroke-width="1.4"/>' +
        txt(anchor === "end" ? x - 56 : x + 56, y + 1, label, { fill: color, size: 13, weight: 700 }) + txt(anchor === "end" ? x - 56 : x + 56, y + 16, sub, { fill: "#b3b9dc", size: 10.5 }) + "</g>";
    }
    var broc = "";
    [[118, 160], [134, 176], [104, 182], [124, 196], [146, 194]].forEach(function (b) {
      broc += '<path d="M' + b[0] + " " + (b[1] + 4) + " v10" + '" stroke="#8fcf7a" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="' + (b[0] - 5) + '" cy="' + b[1] + '" r="6" fill="#4f9a52"/><circle cx="' + (b[0] + 5) + '" cy="' + b[1] + '" r="6" fill="#5fae5c"/><circle cx="' + b[0] + '" cy="' + (b[1] - 6) + '" r="6.5" fill="#6dbb63"/>';
    });
    var carrot = "";
    [[156, 170], [164, 186], [150, 206]].forEach(function (c) { carrot += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="7" fill="#f08a3c"/><circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.2" fill="#f7b277"/>'; });
    var rice = "";
    for (var i = 0; i < 26; i++) { var a = i * 2.4, r = 4 + (i * 7) % 24; rice += '<ellipse cx="' + (126 + Math.cos(a) * r).toFixed(1) + '" cy="' + (104 + Math.sin(a) * r * .7).toFixed(1) + '" rx="2.6" ry="1.4" fill="#fffaf0" transform="rotate(' + (i * 37 % 180) + " " + (126 + Math.cos(a) * r).toFixed(1) + " " + (104 + Math.sin(a) * r * .7).toFixed(1) + ')"/>'; }
    var steam = "";
    [[116, 0], [130, .7], [204, .35]].forEach(function (s) {
      steam += '<path d="M' + s[0] + ' 82 c-6 -8 6 -12 0 -20" fill="none" stroke="#ffffff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"><animate attributeName="opacity" values="0;.8;0" dur="2.4s" begin="' + s[1] + 's" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="2.4s" begin="' + s[1] + 's" repeatCount="indefinite"/></path>';
    });
    return svg("0 0 420 280", "國健署我的餐盤：全穀雜糧、蔬菜、豆魚蛋肉、水果，加上乳品與堅果",
      "<defs>" +
      '<radialGradient id="pl-plate" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".85" stop-color="#e8ebf6"/><stop offset="1" stop-color="#c9cfe6"/></radialGradient>' +
      '<radialGradient id="pl-fish" cx="40%" cy="40%" r="70%"><stop offset="0" stop-color="#ffb59c"/><stop offset="1" stop-color="#e9785b"/></radialGradient>' +
      '<linearGradient id="pl-milk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe4f5"/></linearGradient>' +
      "</defs>" +
      // 餐盤
      '<ellipse cx="' + CX + '" cy="' + (CY + 8) + '" rx="112" ry="108" fill="#000" opacity=".3"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="110" fill="url(#pl-plate)"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="92" fill="#f7f8fd" stroke="#d7dcef" stroke-width="2"/>' +
      '<path d="M' + CX + " " + (CY - 92) + " V" + (CY + 92) + " M" + (CX - 92) + " " + CY + " H" + (CX + 92) + '" stroke="#d7dcef" stroke-width="2"/>' +
      // 全穀雜糧（左上）
      drop(.2, '<ellipse cx="126" cy="106" rx="34" ry="24" fill="#f1e6cf"/><ellipse cx="126" cy="102" rx="30" ry="19" fill="#fffaf0"/>' + rice + '<ellipse cx="148" cy="80" rx="9" ry="6" fill="#c9a36b"/><ellipse cx="102" cy="84" rx="7" ry="5" fill="#a77b45"/>') +
      // 蔬菜（左下）
      drop(.7, '<path d="M98 150 c14 -6 30 -2 38 8 c-10 6 -28 8 -38 -8z" fill="#7cc46e"/><path d="M108 210 c10 -14 26 -16 36 -6 c-12 10 -26 12 -36 6z" fill="#5fae5c"/>' + broc + carrot) +
      // 豆魚蛋肉（右下）
      drop(1.2, '<g class="pl-protein">' +
        '<path d="M186 158 C204 146 236 148 248 160 C238 176 206 180 186 168 Z" fill="url(#pl-fish)"/><path d="M200 156 q4 8 0 16 M214 152 q4 10 0 20 M228 154 q4 8 0 16" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none"/>' +
        '<ellipse cx="208" cy="200" rx="18" ry="14" fill="#fffdf7"/><circle cx="210" cy="198" r="7" fill="#f6b73c"/>' +
        '<rect x="232" y="186" width="16" height="16" rx="3" fill="#f6f0dc" stroke="#e0d6b6"/><rect x="236" y="204" width="16" height="16" rx="3" fill="#f6f0dc" stroke="#e0d6b6"/></g>') +
      // 水果（右上）
      drop(1.7, '<path d="M206 88 C190 96 192 122 210 124 C216 128 222 128 228 124 C246 122 246 96 230 88 C224 86 218 88 218 90 C216 88 212 86 206 88 Z" fill="#e2504e"/><path d="M218 90 q2 -10 8 -12" stroke="#7a4b2a" stroke-width="2.5" fill="none"/><path d="M224 80 c6 -4 12 -2 14 2 c-6 4 -12 2 -14 -2z" fill="#6dbb63"/>' +
        '<path d="M232 120 c10 -20 26 -24 30 -16 c-4 12 -18 20 -30 16z" fill="#f2d14a"/>') +
      steam +
      // 乳品與堅果
      drop(2.2, '<path d="M346 44 h34 l-5 66 h-24 z" fill="url(#pl-milk)" stroke="#b7c0e6" stroke-width="1.5"/><path d="M348 60 h30" stroke="#b7c0e6" stroke-width="1"/>') +
      drop(2.6, '<ellipse cx="360" cy="222" rx="26" ry="10" fill="#c9cfe6"/><path d="M386 222 h22" stroke="#c9cfe6" stroke-width="5" stroke-linecap="round"/><ellipse cx="354" cy="219" rx="6" ry="4" fill="#b98a55"/><ellipse cx="366" cy="220" rx="6" ry="4" fill="#a8743f"/>') +
      // 蛋白質提醒光圈
      '<circle cx="216" cy="182" r="46" fill="none" stroke="#f0cf86" stroke-width="2.5" stroke-dasharray="6 6" opacity="0"><animate attributeName="opacity" values="0;0;1" keyTimes="0;.6;1" dur="3.5s" fill="freeze"/><animateTransform attributeName="transform" type="rotate" values="0 216 182;360 216 182" dur="18s" repeatCount="indefinite"/></circle>' +
      // 標籤（國健署「我的餐盤」口訣）
      tag(4, 40, "全穀雜糧", "飯跟蔬菜一樣多", "#f0cf86") +
      tag(4, 244, "蔬菜", "菜比水果多一點", "#8fdc7f") +
      tag(300, 176, "豆魚蛋肉", "一掌心・治療期加量", "#ffb59c") +
      tag(236, 22, "水果", "每餐拳頭大", "#ff9b8a") +
      txt(363, 126, "乳品", { fill: "#e6eaff", size: 12, weight: 700 }) + txt(363, 140, "早晚一杯奶", { fill: "#b3b9dc", size: 10.5 }) +
      txt(372, 242, "堅果種子", { fill: "#e6eaff", size: 12, weight: 700 }) + txt(372, 256, "一茶匙", { fill: "#b3b9dc", size: 10.5 }), "plate-fig");
  }

  /* ---------- 分期地圖（人體） ---------- */
  function stagemap() {
    var k = "sm", S = .78, TX = 115, TY = 134;
    var nodes = '<circle class="node n1" cx="153" cy="165" r="6"/><circle class="node n2" cx="162" cy="128" r="6"/><circle class="node n2" cx="170" cy="153" r="6"/><circle class="node n3" cx="200" cy="86" r="6"/>';
    var mets = [
      { x: 170, y: 38, label: "腦", lx: 206, ly: 34 },
      { x: 232, y: 206, label: "另一側肺", lx: 300, ly: 206 },
      { x: 262, y: 128, label: "骨頭", lx: 300, ly: 122 },
      { x: 120, y: 284, label: "肝臟", lx: 78, ly: 304 },
      { x: 202, y: 296, label: "腎上腺", lx: 236, ly: 314 }
    ];
    var m = "";
    mets.forEach(function (o, i) {
      var cx = (TX + o.x) / 2 + (o.x >= TX ? 30 : -30), cy = (TY + o.y) / 2 - 24;
      m += '<g class="met" style="transition-delay:' + (i * .12) + 's"><path class="met-path" d="M' + TX + " " + TY + " Q " + cx + " " + cy + " " + o.x + " " + o.y + '" fill="none" stroke="#ff8f7a" stroke-width="1.6" stroke-dasharray="4 5"/>' +
        '<circle cx="' + o.x + '" cy="' + o.y + '" r="7.5" fill="url(#' + k + '-tum)" stroke="#ffd0c4" stroke-width="1"/>' + txt(o.lx, o.ly, o.label, { fill: "#ff8f7a", weight: 700, size: 13, anchor: o.lx > 280 ? "start" : "middle" }) + "</g>";
    });
    var ribs = "";
    for (var i = 0; i < 6; i++) { var y = 108 + i * 24; ribs += '<path d="M168 ' + (y - 6) + " C 120 " + (y - 14) + " 76 " + (y + 4) + " 62 " + (y + 30) + " M172 " + (y - 6) + " C 220 " + (y - 14) + " 264 " + (y + 4) + " 278 " + (y + 30) + '"/>'; }
    return svg("0 0 360 350", "肺癌分期示意圖：腫瘤大小、淋巴結與遠處轉移",
      "<defs>" + LUNG_DEFS(k) +
      '<linearGradient id="sm-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3483"/><stop offset="1" stop-color="#1a2058"/></linearGradient>' +
      '<radialGradient id="sm-liver" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#c77a6e"/><stop offset="1" stop-color="#7d3f4c"/></radialGradient>' +
      "</defs>" +
      // 身體
      '<path d="M170 8 C 150 8 140 24 140 40 C 140 58 152 70 158 74 L156 86 C 120 92 80 98 62 120 C 50 136 48 170 46 220 L 40 350 H 300 L 294 220 C 292 170 290 136 278 120 C 260 98 220 92 184 86 L182 74 C 188 70 200 58 200 40 C 200 24 190 8 170 8 Z" fill="url(#sm-body)" stroke="#5b66b8" stroke-width="1.5"/>' +
      '<ellipse cx="170" cy="36" rx="20" ry="18" fill="#3a4296" opacity=".8"/>' +
      '<g fill="none" stroke="#5b66b8" stroke-opacity=".45" stroke-width="2">' + ribs + "</g>" +
      '<path d="M170 92 V340" stroke="#5b66b8" stroke-width="6" stroke-dasharray="8 4" opacity=".7"/>' +
      // 肺臟（共用外形縮小放入）
      '<g transform="translate(' + (170 - 200 * S).toFixed(1) + " " + (92 - 46 * S).toFixed(1) + ") scale(" + S + ')">' + lungBody(k, 0) + "</g>" +
      '<path d="M170 72 V128 M170 128 L154 150 M170 128 L188 152" stroke="#eef0ff" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path d="M160 196 C 168 180 196 182 204 200 C 208 222 186 238 176 240 C 164 232 152 214 160 196 Z" fill="#e0566b" opacity=".45"/>' + // 心臟
      '<path d="M76 258 C 110 246 150 250 170 262 C 190 250 230 246 264 258" fill="none" stroke="#e8c77f" stroke-opacity=".55" stroke-width="2.5"/>' + // 橫膈膜
      '<path d="M84 272 C 100 262 150 260 166 274 C 164 300 120 314 92 302 C 80 296 78 282 84 272 Z" fill="url(#sm-liver)" opacity=".85"/>' +
      '<path d="M196 290 l8 -10 l8 10 z" fill="#c9a36b" opacity=".85"/>' +
      // 肋膜積水（第 4 期）
      '<path class="met" d="M86 238 C 96 250 130 252 150 246 C 136 258 98 260 86 250 Z" fill="#7ec8f5" fill-opacity=".6"/>' + '<g class="met">' + txt(70, 228, "肋膜積水", { fill: "#7ec8f5", weight: 700, size: 12 }) + '</g>' +
      nodes + txt(206, 128, "淋巴結", { cls: "node-label", size: 12, anchor: "start" }) +
      m +
      '<g class="tumor" style="transform-origin:' + TX + "px " + TY + 'px"><circle cx="' + TX + '" cy="' + TY + '" r="20" fill="url(#' + k + '-tum)" stroke="#ffd0c4" stroke-width="1.2"/><circle cx="' + TX + '" cy="' + TY + '" r="26" fill="none" stroke="#ff8f7a" stroke-width="2" class="tumor-ring"/></g>' +
      txt(76, 100, "腫瘤", { fill: "#ff8f7a", weight: 700 }) + '<path d="M86 104 L102 120" stroke="#ff8f7a" stroke-width="1.2"/>', "stagemap");
  }

  /* ---------- 手術：胸腔鏡切除右上肺葉 ---------- */
  function surgeryFig() {
    var D = 8, k = "sg", L = lungPaths(0);
    function ph(t, a, b) {
      return '<text x="200" y="22" font-size="14" font-weight="700" fill="#f0cf86" text-anchor="middle" opacity="0">' + t +
        '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ";" + (a + .02).toFixed(2) + ";" + (b - .02).toFixed(2) + ";" + b + ';1" dur="' + D + 's" repeatCount="indefinite"/></text>';
    }
    var upperClip = "M40 0 H200 V160 L182 150 C156 140 124 134 98 138 L40 138 Z";
    var lowerClip = "M40 138 L98 138 C124 134 156 140 182 150 L200 160 V300 H40 Z";
    function tool(x1, y1, x2, y2, b) {
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#d9dcf5" stroke-width="3.5" stroke-linecap="round">' +
        '<animate attributeName="x2" values="' + x1 + ";" + x1 + ";" + x2 + ";" + x2 + ";" + x1 + ";" + x1 + '" keyTimes="0;' + b + ';.18;.52;.6;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="y2" values="' + y1 + ";" + y1 + ";" + y2 + ";" + y2 + ";" + y1 + ";" + y1 + '" keyTimes="0;' + b + ';.18;.52;.6;1" dur="' + D + 's" repeatCount="indefinite"/></line>' +
        '<circle cx="' + x1 + '" cy="' + y1 + '" r="5" fill="#141a46" stroke="#f0cf86" stroke-width="2"/>';
    }
    return svg("0 -8 400 298", "手術動畫：胸腔鏡從小傷口沿著肺葉間的縫切除有腫瘤的肺葉，剩下的肺慢慢擴張",
      "<defs>" + LUNG_DEFS(k) +
      '<clipPath id="sg-up"><path d="' + upperClip + '"/></clipPath><clipPath id="sg-low"><path d="' + lowerClip + '"/></clipPath>' +
      "</defs>" +
      // 左肺（不動）
      '<path d="' + L.LL + '" fill="url(#' + k + '-lung)" stroke="#f3c9d3" stroke-width="1.6" opacity=".55"/>' +
      // 右肺下方兩葉：切除後稍微擴張
      '<g style="transform-origin:130px 250px"><animateTransform attributeName="transform" type="scale" values="1;1;1.06;1.06;1" keyTimes="0;.62;.8;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<path d="' + L.RL + '" fill="url(#' + k + '-lung)" stroke="#f3c9d3" stroke-width="1.6" clip-path="url(#sg-low)"/>' +
      '<path d="M90 180 C116 196 138 218 148 244" fill="none" stroke="#5a3a78" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="3 3"/></g>' +
      // 右上葉（含腫瘤）：被切下並移出
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-46 -36;-46 -36;0 0" keyTimes="0;.5;.66;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="1;1;.12;.12;1" keyTimes="0;.52;.68;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<path d="' + L.RL + '" fill="url(#' + k + '-lung)" stroke="#f3c9d3" stroke-width="1.6" clip-path="url(#sg-up)"/>' +
      '<circle cx="132" cy="100" r="15" fill="url(#' + k + '-tum)" stroke="#ffd0c4"/></g>' +
      // 切線（沿水平裂）
      '<path d="' + L.hFis + '" fill="none" stroke="#f0cf86" stroke-width="3" stroke-dasharray="120" stroke-dashoffset="120">' +
      '<animate attributeName="stroke-dashoffset" values="120;120;0;0;120" keyTimes="0;.2;.45;.95;1" dur="' + D + 's" repeatCount="indefinite"/></path>' +
      '<path d="M102 142 l4 -4 M116 140 l4 -4 M130 139 l4 -4 M144 140 l4 -4 M158 143 l4 -4 M172 147 l4 -4" stroke="#f0cf86" stroke-width="1.6" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.5;.56;.95;1" dur="' + D + 's" repeatCount="indefinite"/></path>' +
      // 氣管
      '<path d="M200 38 V108 M200 108 L176 134 M200 108 L228 140" stroke="#eef0ff" stroke-width="9" stroke-linecap="round" fill="none" opacity=".9"/>' +
      // 胸腔鏡器械（從胸壁小洞進入）
      tool(56, 120, 104, 126, ".05") + tool(64, 176, 112, 150, ".09") + tool(84, 74, 120, 104, ".12") +
      txt(36, 210, "胸壁小傷口", { anchor: "start", fill: "#b3b9dc", size: 12 }) +
      txt(118, 270, "保留的肺葉", { fill: "#d9dcf5", size: 13 }) + txt(280, 270, "左肺", { fill: "#d9dcf5", size: 13 }) +
      ph("1. 從胸壁幾個小洞放入胸腔鏡", 0, .2) + ph("2. 沿著肺葉之間的縫切開", .2, .5) + ph("3. 取出有腫瘤的肺葉", .5, .7) + ph("4. 剩下的肺葉慢慢擴張代償", .7, .97), "surgery-fig");
  }

  /* ---------- 噘嘴呼吸練習（由 widgets.js 控制吸氣／吐氣） ---------- */
  function pursed() {
    var drops = "";
    [0, .4, .8, 1.2, 1.6].forEach(function (b, i) {
      drops += '<circle r="2.6" fill="#f4d27e"><animateMotion dur="2s" begin="' + b + 's" repeatCount="indefinite" path="M' + (30 - i * 2) + " " + (64 + i * 6) + ' C 60 70 84 80 112 92"/></circle>';
    });
    return svg("0 0 400 240", "噘嘴呼吸示意：用鼻子吸氣，再像吹蠟燭一樣噘嘴慢慢吐氣",
      "<defs>" + LUNG_DEFS("pb") +
      '<radialGradient id="pb-flame" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff6c9"/><stop offset=".5" stop-color="#f6c04a"/><stop offset="1" stop-color="#e2604e" stop-opacity=".2"/></radialGradient>' +
      '<linearGradient id="pb-skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a4296"/><stop offset="1" stop-color="#4d57b0"/></linearGradient>' +
      "</defs>" +
      // 側臉與胸部
      '<path d="M120 20 C 150 16 176 30 182 58 L 186 74 C 196 80 198 86 190 90 L 192 100 C 200 104 200 112 194 116 C 196 124 192 130 184 132 C 180 146 168 150 150 150 L 148 170 C 196 176 230 196 236 240 H 40 C 44 200 70 178 110 170 L 108 146 C 86 132 78 104 82 76 C 86 44 100 24 120 20 Z" fill="url(#pb-skin)" stroke="#7f8ad6" stroke-width="1.5"/>' +
      '<circle cx="160" cy="62" r="4" fill="#eef0ff"/>' +
      // 嘴唇（吐氣時噘起）
      '<g class="pb-lips"><ellipse cx="194" cy="112" rx="5" ry="3.5" fill="#e98aa0"/></g>' +
      // 肺臟（隨吸吐擴張）
      '<g class="pb-lung"><g transform="translate(98 160) scale(.28)">' +
      '<path d="' + lungPaths(-60).RL + '" fill="url(#pb-lung)" stroke="#f3c9d3" stroke-width="4"/><path d="' + lungPaths(-60).LL + '" fill="url(#pb-lung)" stroke="#f3c9d3" stroke-width="4"/></g></g>' +
      // 吸氣：空氣從鼻子進入
      '<g class="pb-in"><g transform="translate(176 0)">' + drops + "</g>" +
      '<path d="M280 70 C 250 72 228 80 206 90" fill="none" stroke="#f4d27e" stroke-width="2" stroke-dasharray="4 6" class="pb-flow-in"/>' + "</g>" +
      // 吐氣：氣流從嘴唇吹向蠟燭
      '<g class="pb-out"><path d="M204 112 C 236 108 262 116 290 112" fill="none" stroke="#9fb3d9" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 8" class="pb-flow"/>' +
      '<path d="M204 118 C 232 124 258 120 286 126" fill="none" stroke="#9fb3d9" stroke-width="2" stroke-linecap="round" stroke-dasharray="6 10" class="pb-flow"/></g>' +
      // 蠟燭
      '<rect x="318" y="140" width="22" height="66" rx="3" fill="#f6f0dc"/><rect x="314" y="204" width="30" height="8" rx="3" fill="#c9cfe6"/><path d="M329 140 v-8" stroke="#3b2f2f" stroke-width="2"/>' +
      '<g class="pb-flame" style="transform-origin:329px 134px"><path d="M329 96 C 340 112 340 126 329 134 C 318 126 318 112 329 96 Z" fill="url(#pb-flame)"/>' +
      '<ellipse cx="329" cy="122" rx="18" ry="22" fill="#f6c04a" opacity=".18"/></g>' +
      txt(329, 230, "像吹蠟燭，但不要吹熄", { fill: "#b3b9dc", size: 12 }) +
      txt(250, 60, "鼻子吸氣", { fill: "#f4d27e", size: 13, weight: 700, cls: "pb-lbl-in" }) +
      txt(250, 146, "噘嘴慢慢吐氣", { fill: "#b9c6e6", size: 13, weight: 700, cls: "pb-lbl-out" }), "pursed-fig");
  }

  /* ---------- 6. 治療機轉 ---------- */
  var MECH = {};
  MECH.surgery = function () { return surgeryFig(); };
  MECH.radiation = function () {
    var D = 4, beams = "";
    [[-60, 0], [60, .2], [180, .4]].forEach(function (b) {
      beams += '<g transform="rotate(' + b[0] + ' 160 116)"><path d="M146 0 L174 0 L166 98 L154 98 Z" fill="' + GOLD + '" opacity="0">' +
        '<animate attributeName="opacity" values="0;.55;.55;0" keyTimes="0;.15;.7;1" dur="' + D + 's" begin="' + b[1] + 's" repeatCount="indefinite"/></path></g>';
    });
    var normal = "";
    [[96, 80], [224, 84], [90, 150], [230, 150], [130, 186], [192, 190], [160, 56]].forEach(function (p) { normal += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="' + SOFT + '" stroke="' + ACC + '" stroke-width="1.5"/>'; });
    return svg("0 0 320 220", "放射治療動畫：多個角度的射線集中在腫瘤，腫瘤縮小",
      normal + beams +
      '<g><animateTransform attributeName="transform" type="scale" values="1;1;.62;.62;1" keyTimes="0;.3;.7;.95;1" dur="' + (D * 2) + 's" repeatCount="indefinite" additive="sum"/></g>' +
      '<circle cx="160" cy="116" r="22" fill="' + TUM + '"><animate attributeName="r" values="22;22;13;13;22" keyTimes="0;.3;.7;.95;1" dur="' + (D * 2) + 's" repeatCount="indefinite"/></circle>' +
      '<circle cx="160" cy="116" r="30" fill="none" stroke="' + GOLD + '" stroke-width="2"><animate attributeName="r" values="24;40" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="1.4s" repeatCount="indefinite"/></circle>' +
      txt(160, 214, "射線集中在腫瘤，周圍正常組織只受到少量照射"));
  };
  /* ---------- 化療：分四步看懂 ----------
     上方是血管，藥物從點滴進入血液流到全身；藥物進入組織後，正在分裂的癌細胞被破壞，
     休息中的正常細胞不受影響；頭髮、口腔、骨髓這些分裂快的正常細胞短暫受影響後恢復。一循環 12 秒。 */
  MECH.chemo = function () {
    var D = 12;
    function ph(t, a, b, fill) {
      return '<text x="200" y="20" font-size="14" font-weight="700" fill="' + fill + '" text-anchor="middle" opacity="0">' + t +
        '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ";" + (a + .02).toFixed(2) + ";" + (b - .02).toFixed(2) + ";" + b + ';1" dur="' + D + 's" repeatCount="indefinite"/></text>';
    }
    // 血管裡流動的藥物
    var flow = "";
    for (var i = 0; i < 9; i++) flow += '<circle r="3.6" fill="#f4d27e"><animateMotion dur="3s" begin="' + (i * .33) + 's" repeatCount="indefinite" path="M-10 ' + (48 + (i % 3) * 6) + ' H410"/></circle>';
    // 癌細胞（分裂中）與正常細胞（休息中）
    var cancer = [[74, 136], [150, 160], [226, 132]], normal = [[300, 140], [362, 168]];
    var drops = "", cells = "";
    cancer.concat(normal).forEach(function (c, i) {
      drops += '<circle r="3.2" fill="#f4d27e" opacity="0"><animateMotion dur="' + D + 's" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;.24;.46;1" calcMode="linear" path="M' + (c[0] - 10) + " 56 Q " + (c[0] + 20) + " " + ((56 + c[1]) / 2) + " " + c[0] + " " + c[1] + '"/>' +
        '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.24;.27;.44;.48;1" dur="' + D + 's" repeatCount="indefinite"/></circle>';
    });
    cancer.forEach(function (c, i) {
      var x = c[0], y = c[1];
      cells += '<g><animate attributeName="opacity" values="1;1;1;.08;.08;1" keyTimes="0;.48;.5;.62;.96;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        '<ellipse cx="' + (x - 9) + '" cy="' + y + '" rx="17" ry="20" fill="url(#ch-tum)" stroke="#ffd0c4" stroke-width="1.2"><animate attributeName="cx" values="' + (x - 6) + ";" + (x - 11) + ";" + (x - 6) + '" dur="1.6s" begin="' + (i * .3) + 's" repeatCount="indefinite"/></ellipse>' +
        '<ellipse cx="' + (x + 9) + '" cy="' + y + '" rx="17" ry="20" fill="url(#ch-tum)" stroke="#ffd0c4" stroke-width="1.2"><animate attributeName="cx" values="' + (x + 6) + ";" + (x + 11) + ";" + (x + 6) + '" dur="1.6s" begin="' + (i * .3) + 's" repeatCount="indefinite"/></ellipse>' +
        '<circle cx="' + (x - 9) + '" cy="' + y + '" r="5" fill="#8f2d45"/><circle cx="' + (x + 9) + '" cy="' + y + '" r="5" fill="#8f2d45"/></g>' +
        // 破裂碎片
        '<g opacity="0"><animate attributeName="opacity" values="0;0;1;.6;0;0" keyTimes="0;.49;.53;.62;.7;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        '<path d="M' + (x - 14) + " " + (y - 8) + " l8 -6 l4 8 z M" + (x + 6) + " " + (y - 12) + " l9 2 l-3 8 z M" + (x - 4) + " " + (y + 8) + " l7 6 l-8 4 z M" + (x + 14) + " " + (y + 6) + ' l6 6 l-7 2 z" fill="#ff8f7a"/></g>';
    });
    normal.forEach(function (c) {
      cells += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="18" fill="url(#ch-norm)" stroke="#cfd6ff" stroke-width="1.2"/><circle cx="' + c[0] + '" cy="' + c[1] + '" r="5.5" fill="#5a63b8"/>';
    });
    // 分裂快的正常細胞：頭髮、口腔、骨髓
    function organ(x, label, icon) {
      return '<g><animate attributeName="opacity" values="1;1;.3;.3;1;1" keyTimes="0;.72;.76;.86;.94;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        '<circle cx="' + x + '" cy="236" r="18" fill="#222b6a" stroke="#aab1ff" stroke-width="1.4"/>' + icon + "</g>" + txt(x, 270, label, { fill: "#d9dcf5", size: 12 });
    }
    return svg("0 0 400 280", "化學治療動畫：藥物從血液流到全身，打擊正在分裂的癌細胞；頭髮、口腔、骨髓會短暫受影響後恢復",
      "<defs>" +
      '<radialGradient id="ch-tum" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffb199"/><stop offset="1" stop-color="#c2485a"/></radialGradient>' +
      '<radialGradient id="ch-norm" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#c9cff8"/><stop offset="1" stop-color="#6f78c8"/></radialGradient>' +
      '<linearGradient id="ch-ves" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c2f4c"/><stop offset=".5" stop-color="#b8475e"/><stop offset="1" stop-color="#7c2f4c"/></linearGradient>' +
      "</defs>" +
      '<rect x="0" y="36" width="400" height="34" rx="6" fill="url(#ch-ves)"/>' + txt(392, 32, "血管", { anchor: "end", fill: "#e9a8b8", size: 12 }) + flow + drops + cells +
      txt(150, 204, "正在分裂的癌細胞", { fill: "#ff8f7a", size: 12, weight: 700 }) + txt(331, 204, "休息中的正常細胞", { fill: "#aab1ff", size: 12, weight: 700 }) +
      organ(110, "頭髮", '<path d="M102 242 c2 -10 4 -14 4 -18 M110 244 c0 -10 2 -16 2 -20 M118 242 c-2 -10 -2 -14 0 -18" stroke="#e8c77f" stroke-width="2" fill="none"/>') +
      organ(200, "口腔黏膜", '<path d="M188 234 q12 10 24 0 q-12 -6 -24 0z" fill="#e98aa0"/>') +
      organ(290, "骨髓（血球）", '<circle cx="284" cy="232" r="5" fill="#e0566b"/><circle cx="296" cy="236" r="5" fill="#f6f7ff"/><circle cx="288" cy="244" r="3" fill="#c9a36b"/>') +
      '<text x="352" y="240" font-size="12" fill="#7fdcaa" font-weight="700" opacity="0">會恢復<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.86;.88;.98;1" dur="' + D + 's" repeatCount="indefinite"/></text>' +
      ph("1. 藥物從點滴進入血液，流到全身", 0, .24, "#f4d27e") + ph("2. 藥物進入身體各處的細胞", .24, .48, "#f4d27e") +
      ph("3. 正在分裂的癌細胞被破壞", .48, .72, "#ff8f7a") + ph("4. 頭髮、口腔、骨髓短暫受影響，之後會恢復", .72, .98, "#7fdcaa"), "chemo-fig");
  };
  MECH.targeted = function () { return genes(); };
  MECH.immuno = function () {
    var D = 8;
    return svg("0 0 320 220", "免疫治療動畫：藥物擋住癌細胞踩住的煞車，免疫細胞重新攻擊癌細胞",
      // T 細胞
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 0;30 0;30 0;0 0" keyTimes="0;.4;.55;.7;.94;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<circle cx="78" cy="110" r="40" fill="' + ACC + '" fill-opacity=".14" stroke="' + ACC + '" stroke-width="2.5"><animate attributeName="fill-opacity" values=".08;.08;.08;.35;.35;.08" keyTimes="0;.4;.55;.62;.94;1" dur="' + D + 's" repeatCount="indefinite"/></circle>' +
      '<circle cx="78" cy="110" r="14" fill="' + ACC + '" fill-opacity=".5"/>' +
      '<path d="M118 104 h12 M118 116 h12" stroke="' + ACC + '" stroke-width="3"/>' + txt(78, 168, "免疫細胞", { fill: ACC, weight: 700 }) + "</g>" +
      // 癌細胞
      '<g><animate attributeName="opacity" values="1;1;1;1;.12;.12;1" keyTimes="0;.4;.6;.72;.82;.94;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<circle cx="240" cy="110" r="44" fill="' + TUM + '" fill-opacity=".16" stroke="' + TUM + '" stroke-width="2.5"/>' +
      '<path d="M196 98 h-14 v24 h14" fill="none" stroke="' + TUM + '" stroke-width="3"/>' + txt(240, 172, "癌細胞", { fill: TUM, weight: 700 }) + "</g>" +
      // 煞車
      '<g><animate attributeName="opacity" values="1;1;0;0;0;1" keyTimes="0;.3;.4;.6;.94;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<rect x="138" y="96" width="38" height="28" rx="6" fill="' + PANEL + '" stroke="' + TUM + '" stroke-width="2"/>' + txt(157, 115, "煞車", { fill: TUM, size: 12, weight: 700 }) + "</g>" +
      // 抗體
      '<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.15;.2;.5;.58;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<animateTransform attributeName="transform" type="translate" values="0 -80;0 -80;0 0;0 0;0 0" keyTimes="0;.15;.32;.9;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<path d="M157 84 v-18 M157 66 l-10 -12 M157 66 l10 -12" stroke="' + GOLD + '" stroke-width="4" fill="none" stroke-linecap="round"/></g>' +
      txt(160, 30, "1. 癌細胞踩住免疫細胞的煞車", { fill: INK, cls: "ph ph1" }) +
      txt(160, 30, "2. 免疫治療藥物擋住煞車", { fill: GOLD, cls: "ph ph2" }) +
      txt(160, 30, "3. 免疫細胞重新攻擊癌細胞", { fill: ACC, cls: "ph ph3" }) +
      '<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.62;.66;.8;.84" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<path d="M150 90 l14 -8 M152 110 h18 M150 130 l14 8" stroke="' + ACC + '" stroke-width="3" stroke-linecap="round"/></g>', "immuno-fig");
  };

  /* ---------- 肺癌手術：四種切除範圍 ----------
     kind: lobe 肺葉、segment 肺節、wedge 楔狀、pneumo 全肺。
     金色虛線先畫出切除範圍，該部分再移出淡去，剩下保留的肺。一循環 6 秒。 */
  var RESECT = {
    lobe: { region: "M40 0 H200 V160 L182 150 C156 140 124 134 98 138 L40 138 Z", tumor: [132, 100, 13], move: "-40 -30", label: "切除右上肺葉" },
    segment: { region: "M128 70 C140 54 168 42 184 58 L186 112 C164 116 140 108 124 98 Z", tumor: [156, 82, 9], move: "-10 -40", label: "只切除上葉的一節" },
    wedge: { region: "M70 150 L120 160 L74 186 Z", tumor: [92, 164, 6], move: "-34 4", label: "切下周邊一小塊" },
    pneumo: { region: "M40 0 H192 V300 H40 Z", tumor: [168, 140, 14], move: "-40 0", label: "切除整個右肺" }
  };
  function resection(kind) {
    var D = 6, R = RESECT[kind], L = lungPaths(0), k = "rs" + kind;
    return svg("0 0 400 290", "手術切除範圍示意：" + R.label,
      "<defs>" + LUNG_DEFS(k) +
      '<clipPath id="' + k + '-reg"><path d="' + R.region + '"/></clipPath>' +
      '<clipPath id="' + k + '-lung"><path d="' + L.RL + '"/></clipPath>' +
      '<mask id="' + k + '-keep"><rect x="0" y="0" width="400" height="300" fill="#fff"/><path d="' + R.region + '" fill="#000"/></mask>' +
      "</defs>" +
      '<path d="' + L.LL + '" fill="url(#' + k + '-lung)" stroke="#f3c9d3" stroke-width="1.6" opacity=".5"/>' +
      // 保留的右肺
      '<g mask="url(#' + k + '-keep)"><path d="' + L.RL + '" fill="url(#' + k + '-lung)" stroke="#f3c9d3" stroke-width="1.6"/>' +
      '<g fill="none" stroke="#5a3a78" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="3 3">' + L.fiss + "</g></g>" +
      // 被切除的部分
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;' + R.move + ";" + R.move + ';0 0" keyTimes="0;.45;.65;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="1;1;.15;.15;1" keyTimes="0;.47;.67;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<g clip-path="url(#' + k + '-reg)"><path d="' + L.RL + '" fill="url(#' + k + '-lung)" stroke="#f3c9d3" stroke-width="1.6"/></g>' +
      '<circle cx="' + R.tumor[0] + '" cy="' + R.tumor[1] + '" r="' + R.tumor[2] + '" fill="url(#' + k + '-tum)" stroke="#ffd0c4"/></g>' +
      // 切線
      '<g clip-path="url(#' + k + '-lung)"><path d="' + R.region + '" fill="#f0cf86" fill-opacity="0" stroke="#f0cf86" stroke-width="3" stroke-dasharray="600" stroke-dashoffset="600">' +
      '<animate attributeName="stroke-dashoffset" values="600;0;0;0;600" keyTimes="0;.35;.45;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<animate attributeName="fill-opacity" values="0;0;.18;0;0" keyTimes="0;.3;.42;.5;1" dur="' + D + 's" repeatCount="indefinite"/></path></g>' +
      '<path d="M200 38 V108 M200 108 L176 134 M200 108 L228 140" stroke="#eef0ff" stroke-width="9" stroke-linecap="round" fill="none" opacity=".85"/>' +
      txt(200, 22, R.label, { fill: "#f0cf86", weight: 700, size: 15 }) +
      txt(118, 278, "右肺", { fill: "#d9dcf5", size: 13 }) + txt(280, 278, "左肺", { fill: "#d9dcf5", size: 13 }), "resect-fig");
  }

  /* ---------- 肺癌手術：三種方式（手術場景） ----------
     病人側躺在手術台上、手臂抬高，看得到右胸要手術的位置。
     vats：小傷口放入鏡頭與器械，醫師看螢幕；robot：機械手臂從上方伸入，醫師在控制台操作；
     open：沿肋骨切一道長傷口，用撐開器撐開肋骨。 */
  function approach(kind) {
    var SKIN = "#c9a58c", SKIN2 = "#a8836c";
    var scene =
      // 手術台
      '<rect x="30" y="214" width="360" height="12" rx="4" fill="#5b66b8"/><rect x="190" y="226" width="40" height="34" fill="#3a4296"/>' +
      // 病人：側躺、右手抬高
      '<path d="M110 156 C 96 140 84 122 70 116 C 56 112 44 118 44 126" stroke="' + SKIN + '" stroke-width="16" stroke-linecap="round" fill="none"/>' +
      '<circle cx="62" cy="178" r="20" fill="' + SKIN + '"/><path d="M50 166 C 54 156 70 154 78 162" stroke="#3b2f2f" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M82 172 C 96 150 150 142 204 146 C 240 148 268 152 296 160 L 384 170 C 390 182 388 198 380 206 L 296 208 C 250 212 160 214 96 208 C 82 202 76 186 82 172 Z" fill="' + SKIN + '"/>' +
      // 無菌單蓋住腰部以下，只露出右胸
      '<path d="M226 150 C 262 150 290 156 312 162 L 388 170 C 394 184 392 200 384 210 L 226 214 Z" fill="#4f9a8a" opacity=".95"/>' +
      '<path d="M82 186 C 84 200 92 208 104 210 L 108 214 H 80 C 74 204 74 194 82 186 Z" fill="#4f9a8a" opacity=".9"/>' +
      // 透視看到的肺
      '<ellipse cx="160" cy="180" rx="50" ry="22" fill="#e9a8b8" opacity=".35"/>' +
      '<path d="M124 168 q 34 -8 72 0 M122 186 q 38 -6 78 2" stroke="' + SKIN2 + '" stroke-opacity=".6" stroke-width="1.5" fill="none"/>';
    var tools = "", wound = "", cap = "";
    function rod(x1, y1, x2, y2, b, cam) {
      return '<g opacity="0"><animate attributeName="opacity" values="0;1" begin="' + b + 's" dur=".4s" fill="freeze"/>' +
        '<line x1="' + x2 + '" y1="' + y2 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#e6e9ff" stroke-width="4" stroke-linecap="round">' +
        '<animate attributeName="x2" values="' + x2 + ";" + x1 + '" begin="' + b + 's" dur=".8s" fill="freeze"/><animate attributeName="y2" values="' + y2 + ";" + y1 + '" begin="' + b + 's" dur=".8s" fill="freeze"/></line>' +
        '<rect x="' + (x2 - 7) + '" y="' + (y2 - 7) + '" width="14" height="14" rx="3" fill="' + (cam ? "#7ec8f5" : "#d9dcf5") + '"/></g>';
    }
    if (kind === "vats") {
      wound = '<g fill="#b8475e"><ellipse cx="128" cy="151" rx="5" ry="2.4"/><ellipse cx="160" cy="146" rx="5" ry="2.4"/><ellipse cx="192" cy="147" rx="5" ry="2.4"/></g>';
      tools = rod(128, 160, 104, 104, .3) + rod(160, 158, 156, 96, .7, true) + rod(192, 158, 214, 104, 1.1) +
        // 鏡頭連到螢幕
        '<path d="M156 89 C 170 50 230 40 286 56" stroke="#7ec8f5" stroke-width="2" fill="none" stroke-dasharray="4 4"/>' +
        '<rect x="286" y="20" width="100" height="70" rx="6" fill="#141a46" stroke="#d9dcf5" stroke-width="2"/><rect x="332" y="90" width="8" height="40" fill="#5b66b8"/><rect x="314" y="128" width="44" height="6" rx="3" fill="#5b66b8"/>' +
        '<clipPath id="ap-scr"><rect x="290" y="24" width="92" height="62" rx="4"/></clipPath><g clip-path="url(#ap-scr)">' +
        '<ellipse cx="336" cy="58" rx="40" ry="26" fill="#c87e9a"><animate attributeName="cx" values="330;342;330" dur="4s" repeatCount="indefinite"/></ellipse>' +
        '<circle cx="344" cy="52" r="7" fill="#e2604e"><animate attributeName="cx" values="338;350;338" dur="4s" repeatCount="indefinite"/></circle>' +
        '<path d="M300 80 l18 -14 M372 80 l-16 -12" stroke="#e6e9ff" stroke-width="3"/></g>' + txt(336, 108, "螢幕", { fill: "#d9dcf5", size: 12 });
      cap = "1–3 個幾公分的小傷口，放入鏡頭和器械，醫師看著螢幕手術";
    } else if (kind === "robot") {
      wound = '<g fill="#b8475e"><circle cx="124" cy="151" r="2.6"/><circle cx="150" cy="147" r="2.6"/><circle cx="176" cy="146" r="2.6"/><circle cx="202" cy="147" r="2.6"/></g>';
      // 機械手臂車：從右上方伸過來
      tools = '<rect x="330" y="8" width="40" height="150" rx="6" fill="#d9dcf5" opacity=".9"/><rect x="320" y="150" width="60" height="12" rx="4" fill="#9fa7d8"/>' +
        '<path d="M330 30 H 140" stroke="#d9dcf5" stroke-width="10" stroke-linecap="round"/>' +
        [[124, 151, 112, .2], [150, 147, 142, .4], [176, 146, 172, .6], [202, 147, 204, .8]].map(function (a) {
          return '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="2.6s" begin="' + a[3] + 's" repeatCount="indefinite"/>' +
            '<path d="M' + a[2] + " 30 L" + (a[2] - 10) + " 80 L" + a[0] + " " + (a[1] - 4) + '" stroke="#eef0ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
            '<circle cx="' + (a[2] - 10) + '" cy="80" r="6" fill="#141a46" stroke="#eef0ff" stroke-width="2"/></g>';
        }).join("") +
        txt(350, 178, "機械手臂", { fill: "#d9dcf5", size: 12 }) +
        // 醫師控制台（左上）
        '<g transform="translate(6 8)"><rect x="0" y="40" width="64" height="44" rx="6" fill="#3a4296" stroke="#aab1ff"/><rect x="10" y="22" width="44" height="20" rx="4" fill="#141a46" stroke="#aab1ff"/>' +
        '<rect x="14" y="26" width="36" height="12" rx="2" fill="#7ec8f5" opacity=".6"><animate attributeName="opacity" values=".4;.9;.4" dur="2s" repeatCount="indefinite"/></rect>' +
        '<circle cx="32" cy="8" r="9" fill="' + SKIN + '"/><path d="M22 18 q10 8 20 0" stroke="#5a63b8" stroke-width="8" fill="none"/></g>' +
        '<path d="M70 70 C 100 60 110 40 140 32" stroke="#7ec8f5" stroke-width="2" fill="none" stroke-dasharray="4 4"/>' + txt(38, 108, "醫師控制台", { fill: "#d9dcf5", size: 12 });
      cap = "3–4 個約 1 公分的小洞，醫師坐在控制台操作機械手臂";
    } else {
      wound = '<path d="M108 156 C 140 140 190 138 226 148" stroke="#b8475e" stroke-width="5" stroke-linecap="round" fill="none" stroke-dasharray="140" stroke-dashoffset="140"><animate attributeName="stroke-dashoffset" values="140;0" dur="1.4s" begin=".3s" fill="freeze"/></path>' +
        // 傷口被撐開，看得到裡面的肺
        '<ellipse cx="166" cy="146" rx="52" ry="0" fill="#5a2a3c"><animate attributeName="ry" values="0;12" dur="1.2s" begin="1.8s" fill="freeze"/></ellipse>' +
        '<ellipse cx="166" cy="148" rx="36" ry="0" fill="#e9a8b8"><animate attributeName="ry" values="0;7" dur="1.2s" begin="1.8s" fill="freeze"/></ellipse>';
      tools = '<g opacity="0"><animate attributeName="opacity" values="0;1" begin="1.6s" dur=".4s" fill="freeze"/>' +
        '<rect x="96" y="108" width="140" height="8" rx="3" fill="#d9dcf5"/>' +
        '<g><animateTransform attributeName="transform" type="translate" values="12 0;0 0" dur="1.2s" begin="1.8s" fill="freeze"/><rect x="110" y="112" width="8" height="36" rx="2" fill="#e6e9ff"/></g>' +
        '<g><animateTransform attributeName="transform" type="translate" values="-12 0;0 0" dur="1.2s" begin="1.8s" fill="freeze"/><rect x="214" y="112" width="8" height="36" rx="2" fill="#e6e9ff"/></g></g>' +
        txt(166, 98, "肋骨撐開器", { fill: "#d9dcf5", size: 12 });
      cap = "沿著肋骨切一道較長的傷口，用撐開器撐開肋骨直接手術";
    }
    var size = kind === "vats" ? '<g stroke="#ff8f7a" stroke-width="5" stroke-linecap="round"><path d="M140 256 h14 M166 256 h14 M192 256 h14"/></g>' :
      kind === "robot" ? '<g fill="#ff8f7a"><circle cx="146" cy="256" r="3.5"/><circle cx="164" cy="256" r="3.5"/><circle cx="182" cy="256" r="3.5"/><circle cx="200" cy="256" r="3.5"/></g>' :
      '<path d="M120 256 h120" stroke="#ff8f7a" stroke-width="5" stroke-linecap="round"/>';
    return svg("0 0 400 300", "手術方式示意：" + cap,
      scene + wound + tools +
      txt(40, 260, "傷口：", { anchor: "start", fill: "#b3b9dc", size: 12 }) + size +
      txt(200, 288, cap, { fill: "#f0cf86", size: 12.5, weight: 700 }), "approach-fig");
  }

  /* ---------- 全身圖（免疫副作用） ----------
     正面人形，器官淡淡畫在身體裡；hot 為可點的熱點 [{id, x, y, t}]，由 widgets.js 處理點選。 */
  function bodyMap(hot, plain) {
    var SK = "#3a4296", ED = "#7f8ad6";
    var organs =
      '<ellipse cx="110" cy="40" rx="9" ry="6" fill="#c9a36b" opacity=".55"/>' + // 腦下垂體
      '<path d="M100 96 q10 8 20 0 q-2 8 -10 10 q-8 -2 -10 -10z" fill="#e9a8b8" opacity=".7"/>' + // 甲狀腺
      '<path d="M104 120 C 84 118 72 140 72 170 C 72 186 84 190 96 186 C 104 182 106 170 106 156 Z" fill="#e9a8b8" opacity=".45"/>' +
      '<path d="M116 120 C 136 118 148 140 148 170 C 148 186 136 190 124 186 C 116 182 114 170 114 156 Z" fill="#e9a8b8" opacity=".45"/>' + // 肺
      '<path d="M112 150 C 120 142 136 146 134 160 C 132 172 120 180 114 182 C 108 174 104 160 112 150 Z" fill="#e0566b" opacity=".6"/>' + // 心
      '<path d="M76 194 C 92 186 116 188 118 198 C 116 212 92 216 80 210 C 74 206 72 200 76 194 Z" fill="#a8574f" opacity=".7"/>' + // 肝
      '<path d="M112 204 C 124 200 142 202 146 210 C 138 214 124 214 112 210 Z" fill="#f0cf86" opacity=".55"/>' + // 胰臟
      '<ellipse cx="90" cy="226" rx="8" ry="12" fill="#c9a36b" opacity=".55"/><ellipse cx="130" cy="226" rx="8" ry="12" fill="#c9a36b" opacity=".55"/>' + // 腎、腎上腺
      '<path d="M86 238 C 90 230 130 230 134 238 C 140 256 132 272 110 274 C 88 272 80 256 86 238 Z" fill="none" stroke="#e9a8b8" stroke-width="5" opacity=".55"/>' + // 腸
      '<path d="M96 246 q14 10 28 0 M96 258 q14 -8 28 0" stroke="#e9a8b8" stroke-width="4" fill="none" opacity=".5"/>';
    var spots = hot.map(function (h) {
      return '<g class="bm-spot" data-id="' + h.id + '">' +
        '<circle class="bm-pulse" cx="' + h.x + '" cy="' + h.y + '" r="9"/>' +
        '<circle class="bm-dot" cx="' + h.x + '" cy="' + h.y + '" r="7"/>' +
        '<circle cx="' + h.x + '" cy="' + h.y + '" r="18" fill="transparent"/></g>';
    }).join("");
    return svg("0 0 220 440", "人體全身圖，點選身體部位查看免疫治療可能的副作用",
      // 身體輪廓
      '<path d="M110 8 C 92 8 82 22 82 40 C 82 58 92 70 100 74 L 98 86 C 74 90 56 98 50 116 L 36 214 C 34 232 30 252 26 266 C 24 274 32 278 36 270 L 52 222 L 64 150 L 66 270 L 68 420 C 68 430 92 430 92 420 L 100 300 C 104 292 116 292 120 300 L 128 420 C 128 430 152 430 152 420 L 154 270 L 156 150 L 168 222 L 184 270 C 188 278 196 274 194 266 C 190 252 186 232 184 214 L 170 116 C 164 98 146 90 122 86 L 120 74 C 128 70 138 58 138 40 C 138 22 128 8 110 8 Z" fill="' + SK + '" stroke="' + ED + '" stroke-width="1.6"/>' +
      (plain ? "" : organs) + spots, "body-fig");
  }

  /* ---------- 癌症資源中心路線圖（依本院單張重畫） ---------- */
  function resourceMap() {
    return svg("0 0 400 300", "路線圖：從本院復健科側門出去，沿著停車場走到放射治療中心大門，癌症資源中心就在裡面",
      txt(60, 22, "民樂街", { fill: "#d9dcf5", size: 13, weight: 700 }) + txt(200, 292, "思源路", { fill: "#d9dcf5", size: 13, weight: 700 }) +
      txt(20, 136, "長", { fill: "#d9dcf5", size: 13, weight: 700 }) + txt(20, 154, "青", { fill: "#d9dcf5", size: 13, weight: 700 }) + txt(20, 172, "街", { fill: "#d9dcf5", size: 13, weight: 700 }) +
      // 本院大樓
      '<path d="M40 50 H130 V128 H178 V230 H130 V270 H40 Z" fill="#f2b896" opacity=".9"/>' +
      txt(86, 170, "臺北醫院", { fill: "#3b2f2f", size: 14, weight: 700 }) + txt(86, 188, "（本院）", { fill: "#5a4a40", size: 11 }) +
      '<rect x="66" y="266" width="40" height="6" fill="#3b2f2f"/>' + txt(86, 262, "本院大門", { fill: "#5a4a40", size: 10.5 }) +
      '<rect x="36" y="70" width="6" height="22" fill="#3b2f2f"/>' + txt(52, 84, "急診", { fill: "#5a4a40", size: 10.5, anchor: "start" }) +
      txt(154, 146, "復健科", { fill: "#3b2f2f", size: 12, weight: 700 }) +
      '<rect x="176" y="168" width="6" height="30" fill="#e2604e"/>' + txt(170, 214, "側門", { fill: "#b8475e", size: 12, weight: 700, anchor: "end" }) +
      // 停車場
      '<rect x="262" y="140" width="56" height="130" rx="8" fill="#2f9a5a"/>' + txt(290, 210, "停車場", { fill: "#fff", size: 13, weight: 700 }) +
      // 放射治療中心（癌症資源中心）
      '<rect x="200" y="36" width="180" height="78" rx="12" fill="#fde7c8" stroke="#e8c77f" stroke-width="2"/>' +
      txt(290, 64, "癌症資源中心", { fill: "#3b2f2f", size: 16, weight: 700 }) + txt(290, 84, "放射治療中心", { fill: "#5a4a40", size: 12 }) +
      '<rect x="268" y="110" width="44" height="6" fill="#3b2f2f"/>' + txt(290, 104, "大門", { fill: "#b8475e", size: 11, weight: 700 }) +
      '<circle cx="214" cy="48" r="9" fill="#e2604e"/><circle cx="214" cy="48" r="3.5" fill="#fff"/>' +
      // 路線
      '<path d="M182 184 H 236 Q 248 184 248 172 V 124" fill="none" stroke="#f0cf86" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 9">' +
      '<animate attributeName="stroke-dashoffset" values="22;0" dur="1s" repeatCount="indefinite"/></path>' +
      '<path d="M240 130 L248 118 L256 130" fill="none" stroke="#f0cf86" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle r="6" fill="#fff8e6" stroke="#e8c77f" stroke-width="2"><animateMotion dur="4s" repeatCount="indefinite" path="M182 184 H 236 Q 248 184 248 172 V 124"/></circle>', "map-fig");
  }

  /* ---------- 放射治療技術比較 ----------
     橫切面：身體、腫瘤、脊髓與心臟（需要保護的器官），四種技術的射線與劑量分布。 */
  function rtTech(kind) {
    var D = 6, CX = 200, CY = 130, k = "rt" + kind;
    var base = '<ellipse cx="' + CX + '" cy="' + CY + '" rx="150" ry="96" fill="#232c72" stroke="#5b66b8" stroke-width="1.5"/>' +
      '<ellipse cx="150" cy="122" rx="52" ry="58" fill="#c87e9a" opacity=".35"/><ellipse cx="252" cy="122" rx="52" ry="58" fill="#c87e9a" opacity=".35"/>' +
      '<circle cx="200" cy="206" r="13" fill="#3a4296" stroke="#aab1ff" stroke-width="1.4"/>' + txt(200, 210, "脊髓", { fill: "#d9dcf5", size: 10.5 }) +
      '<ellipse cx="214" cy="160" rx="24" ry="18" fill="#e0566b" opacity=".45"/>' + txt(214, 164, "心臟", { fill: "#fbd0db", size: 10.5 });
    var tumorPath = kind === "sbrt" ? '<circle cx="140" cy="104" r="11" fill="url(#' + k + '-t)"/>' :
      kind === "palli" ? '<circle cx="200" cy="206" r="0"/><path d="M302 92 a14 14 0 1 1 0.1 0" fill="url(#' + k + '-t)"/>' :
      '<path d="M120 92 C 140 74 176 80 182 104 C 188 128 168 152 146 150 C 126 148 108 120 120 92 Z" fill="url(#' + k + '-t)"/>';
    var beams = "", dose = "", extra = "";
    if (kind === "imrt") {
      dose = '<path d="M112 90 C 136 64 186 72 192 104 C 198 134 172 162 144 160 C 116 158 98 120 112 90 Z" fill="#f0cf86" opacity=".25"><animate attributeName="opacity" values=".15;.38;.15" dur="2s" repeatCount="indefinite"/></path>';
      beams = '<circle cx="150" cy="118" r="138" fill="none" stroke="#5b66b8" stroke-dasharray="4 6" opacity=".7"/>' +
        '<g><animateTransform attributeName="transform" type="rotate" values="0 150 118;360 150 118" dur="' + (D * 1.5) + 's" repeatCount="indefinite"/>' +
        '<path d="M140 -12 L160 -12 L154 104 L146 104 Z" fill="#f0cf86" opacity=".45"/>' + txt(166, 40, "射線", { fill: "#f0cf86", size: 11, anchor: "start" }) +
        '<rect x="130" y="-34" width="40" height="22" rx="5" fill="#d9dcf5"/><rect x="141" y="-14" width="18" height="5" rx="2" fill="#9fa7d8"/>' +
        '<g><animateTransform attributeName="transform" type="rotate" values="0 150 -23;-360 150 -23" dur="' + (D * 1.5) + 's" repeatCount="indefinite"/>' +
        '<rect x="104" y="-60" width="92" height="20" rx="10" fill="#0e1236" stroke="#f0cf86"/>' + txt(150, -45.5, "放射線機器", { fill: "#f0cf86", size: 12, weight: 700 }) + "</g></g>";
      extra = txt(200, 250, "機器繞著身體旋轉照射，劑量的形狀貼合腫瘤", { fill: "#f0cf86", size: 13, weight: 700 });
    } else if (kind === "sbrt") {
      for (var i = 0; i < 9; i++) {
        var a = i * 40;
        beams += '<g transform="rotate(' + a + ' 140 104)"><path d="M138 -40 L142 -40 L141 104 L139 104 Z" fill="#f0cf86" opacity="0"><animate attributeName="opacity" values="0;.85;.85;0" keyTimes="0;.1;.7;1" dur="' + D + 's" begin="' + (i * .25) + 's" repeatCount="indefinite"/></path></g>';
      }
      dose = '<circle cx="140" cy="104" r="16" fill="#fff6c9" opacity=".3"><animate attributeName="r" values="12;20;12" dur="1.5s" repeatCount="indefinite"/></circle>';
      extra = txt(200, 250, "很多細射線集中在小腫瘤，每次劑量很高", { fill: "#f0cf86", size: 13, weight: 700 });
    } else if (kind === "palli") {
      beams = '<path d="M282 -12 H322 V226 H282 Z" fill="#f0cf86" opacity=".18"><animate attributeName="opacity" values=".1;.28;.1" dur="2s" repeatCount="indefinite"/></path>' +
        '<rect x="282" y="-30" width="40" height="18" rx="4" fill="#d9dcf5"/><rect x="282" y="222" width="40" height="14" rx="4" fill="#d9dcf5"/>' +
        '<path d="M278 -21 H 250" stroke="#f0cf86" stroke-width="1.2"/>' + txt(246, -17, "放射線機器（前方）", { fill: "#f0cf86", size: 11.5, weight: 700, anchor: "end" }) +
        '<path d="M278 229 H 250" stroke="#f0cf86" stroke-width="1.2"/>' + txt(246, 233, "機器轉到後方照射", { fill: "#f0cf86", size: 11.5, anchor: "end" });
      extra = txt(150, 262, "前後兩個方向照射骨頭轉移處，目標是止痛", { fill: "#f0cf86", size: 13, weight: 700 }) +
        txt(342, 84, "骨頭轉移", { fill: "#ff8f7a", size: 12, weight: 700, anchor: "start" });
    } else {
      // 質子：粒子停在腫瘤，後方幾乎沒有劑量
      for (var j = 0; j < 6; j++) {
        beams += '<circle r="3" fill="#7ec8f5"><animateMotion dur="2s" begin="' + (j * .33) + 's" repeatCount="indefinite" path="M0 ' + (112 + (j % 3) * 4) + ' H150"/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.92;1" dur="2s" begin="' + (j * .33) + 's" repeatCount="indefinite"/></circle>';
      }
      dose = '<path d="M50 104 H150 V132 H50 Z" fill="#7ec8f5" opacity=".12"/><circle cx="150" cy="118" r="26" fill="#7ec8f5" opacity=".3"><animate attributeName="opacity" values=".2;.45;.2" dur="1.6s" repeatCount="indefinite"/></circle>';
      extra = txt(200, 250, "質子停在腫瘤處釋放能量，腫瘤後方幾乎沒有劑量", { fill: "#7ec8f5", size: 13, weight: 700 }) +
        '<g transform="translate(60 268)"><rect x="0" y="0" width="280" height="96" rx="10" fill="#141a46" stroke="#3a4382"/>' +
        txt(14, 20, "身體深度與劑量", { fill: "#d9dcf5", size: 12, anchor: "start" }) +
        '<rect x="128" y="26" width="34" height="50" fill="#ff8f7a" opacity=".18"/>' + txt(118, 90, "腫瘤", { fill: "#ff8f7a", size: 10.5 }) +
        '<path d="M20 76 H264" stroke="#5b66b8"/>' +
        '<path d="M20 50 C 40 30 60 34 100 42 C 160 54 210 62 264 70" stroke="#f0cf86" stroke-width="2.2" fill="none"/>' +
        '<path d="M20 64 C 70 62 110 58 138 34 L146 28 L156 76 H264" stroke="#7ec8f5" stroke-width="2.6" fill="none"/>' +
        '<path d="M150 16 h18" stroke="#f0cf86" stroke-width="2.2"/>' + txt(172, 20, "傳統射線", { fill: "#f0cf86", size: 10.5, anchor: "start" }) +
        '<path d="M218 16 h18" stroke="#7ec8f5" stroke-width="2.6"/>' + txt(240, 20, "質子", { fill: "#7ec8f5", size: 10.5, anchor: "start" }) +
        txt(214, 90, "質子在腫瘤後方幾乎是 0", { fill: "#7ec8f5", size: 10.5 }) + "</g>";
    }
    return svg(kind === "proton" ? "0 -36 400 410" : kind === "imrt" ? "-50 -84 500 384" : kind === "palli" ? "0 -40 400 314" : "0 -36 400 296", "放射治療技術示意", "<defs>" + '<radialGradient id="' + k + '-t" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffb199"/><stop offset="1" stop-color="#c2485a"/></radialGradient></defs>' +
      base + dose + tumorPath + beams + extra, "rt-fig");
  }

  /* ---------- 7. 小圖示 ---------- */
  var I = {
    lungs: '<path d="M12 4v8M12 12l-3 3M12 12l3 3"/><path d="M9 7C6 6 3 10 3 15c0 3 2 4 4 4 2 0 2-2 2-4V7zM15 7c3-1 6 3 6 8 0 3-2 4-4 4-2 0-2-2-2-4V7z"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="M15 15l5 5"/>',
    stairs: '<path d="M3 20h4v-4h4v-4h4V8h4V4"/>',
    shield: '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    leaf: '<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path d="M5 19l8-8"/>',
    play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
    book: '<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v14"/>',
    smoke: '<rect x="3" y="13" width="14" height="4" rx="1"/><path d="M19 13v4M21 13v4M17 9c0-2 2-2 2-4M20 9c0-2 2-2 2-4"/>',
    people: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M3 19c0-3 2-5 5-5s5 2 5 5M13 19c0-2.5 1.5-4 3-4s4 1.5 4 4"/>',
    tree: '<circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 7v5M6 16v-4h12v4"/>',
    pot: '<path d="M4 11h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M2 11h2M20 11h2M9 7c0-1.5 1-1.5 1-3M14 7c0-1.5 1-1.5 1-3"/>',
    air: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"/>',
    factory: '<path d="M3 20V10l5 3V10l5 3V6h4l1 14z"/><path d="M3 20h18"/>',
    lungx: '<path d="M9 7C6 6 3 10 3 15c0 3 2 4 4 4 2 0 2-2 2-4V7zM15 7c3-1 6 3 6 8 0 3-2 4-4 4-2 0-2-2-2-4V7z"/><path d="M12 3v6"/><path d="M5 13l2 2M17 13l2 2"/>',
    cough: '<circle cx="9" cy="10" r="5"/><path d="M14 10h2M16 7l2-2M16 13l2 2M19 10h2"/>',
    drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
    chest: '<path d="M4 20V9c2-3 5-4 8-4s6 1 8 4v11"/><path d="M12 5v15M8 11c1 0 2 1 2 2M16 11c-1 0-2 1-2 2"/>',
    voice: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    scale: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 10a4 4 0 0 1 8 0M12 10l2-2"/>',
    bone: '<path d="M7 17l10-10"/><circle cx="6" cy="16" r="2"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="6" r="2"/><circle cx="18" cy="8" r="2"/>',
    ct: '<circle cx="12" cy="11" r="7"/><circle cx="12" cy="11" r="3"/><path d="M3 20h18"/>',
    needle: '<path d="M4 20l6-6M10 14l8-8 2 2-8 8zM15 5l4 4"/>',
    scan: '<path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3"/><path d="M7 12h10"/>',
    dna: '<path d="M7 3c0 6 10 6 10 12s-10 3-10 6M17 3c0 6-10 6-10 12 0 3 10 3 10 6"/><path d="M8 7h8M8 17h8"/>',
    scalpel: '<path d="M14 3l7 7-9 9H5v-7z"/><path d="M5 19l-2 2"/><path d="M10 8l6 6"/>',
    beam: '<circle cx="12" cy="14" r="3"/><path d="M12 3v5M4 6l4 5M20 6l-4 5"/><path d="M5 21h14"/>',
    drip: '<path d="M8 3h8v7a4 4 0 0 1-8 0z"/><path d="M12 14v4c0 2 2 3 4 3"/><path d="M8 7h8"/>',
    pill: '<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="M10 7l5 8"/>',
    immune: '<circle cx="12" cy="12" r="5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    skin: '<path d="M4 8c3-2 5 2 8 0s5-2 8 0M4 13c3-2 5 2 8 0s5-2 8 0M4 18c3-2 5 2 8 0s5-2 8 0"/>',
    gut: '<path d="M8 4h8M8 4c-3 0-4 3-2 5h10c2 2 1 5-2 5H8c-3 0-3 4 0 4h6c2 0 2 2 0 2"/>',
    liver: '<path d="M3 10c0-4 6-5 11-4 4 1 7 3 7 6 0 4-5 7-10 7-5 0-8-4-8-9z"/><path d="M14 6v8"/>',
    thyroid: '<path d="M12 5v14"/><path d="M12 9c-2-4-7-3-7 2s3 7 7 4c4 3 7 1 7-4s-5-6-7-2"/>',
    sugar: '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01"/>',
    muscle: '<path d="M4 16c2-6 6-9 10-8 2 .5 3 2 2 4-2 3-6 2-7 5"/><path d="M4 16c3 3 9 4 14 0"/>',
    team: '<circle cx="12" cy="7" r="3"/><circle cx="5" cy="10" r="2"/><circle cx="19" cy="10" r="2"/><path d="M7 20c0-3 2-6 5-6s5 3 5 6M2 18c0-2 1.5-4 3-4M22 18c0-2-1.5-4-3-4"/>',
    // 大腸直腸癌
    colon: '<path d="M6 19V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3.5a1.5 1.5 0 0 0-1.5 1.5V22"/><path d="M6 10h2M6 14h2M16 9h2M16 13h2M10 5v2M14 5v2"/>',
    meat: '<path d="M14 4c4 0 7 3 6 7-1 5-6 9-11 9-3 0-5-2-5-5 0-4 4-5 5-8 1-2 3-3 5-3z"/><circle cx="15" cy="9" r="2"/>',
    wine: '<path d="M8 3h8c0 5-1 8-4 8s-4-3-4-8z"/><path d="M12 11v8M8 21h8"/>',
    sofa: '<path d="M5 12V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 12h18v5H3zM5 17v2M19 17v2"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 6 10 6 10 9s-10 3-10 9M17 3c0 6-10 6-10 9"/>',
    bowel: '<path d="M8 4h8v7H8z"/><path d="M5 11h14a7 7 0 0 1-7 7 7 7 0 0 1-7-7z"/><path d="M10 18l-1 3h6l-1-3"/>',
    thin: '<path d="M3 12h18"/><path d="M3 7h4M10 7h4M17 7h4M3 17h4M10 17h4M17 17h4"/>',
    belly: '<path d="M6 4c-2 6-2 12 1 17h10c3-5 3-11 1-17"/><path d="M12 10a3 3 0 1 1-3 3"/>',
    scope: '<rect x="2" y="3" width="5" height="6" rx="1"/><path d="M7 6h3a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h4"/><circle cx="21" cy="18" r="1.2"/>',
    stoma: '<path d="M6 6c-1 5 0 10 2 13 2 2 6 2 8 0 2-3 3-8 2-13"/><circle cx="12" cy="9" r="2.5"/><path d="M6 6h12"/>',
    tube: '<path d="M9 3h6M10 3v14a2 2 0 0 0 4 0V3"/><path d="M10 11h4"/>',
    virus: '<circle cx="12" cy="12" r="5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/><circle cx="12" cy="3" r="1"/><circle cx="12" cy="21" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="21" cy="12" r="1"/>',
    eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    thermo: '<path d="M10 4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z"/><path d="M12 9v6"/>',
    run: '<circle cx="14" cy="4" r="2"/><path d="M9 21l3-6 3 2v5M12 15l-1-6 4 1 3 3M11 9l-4 2-1 3"/>'
  };
  function icon(name, size) {
    return '<svg class="ico" viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[name] || I.book) + "</svg>";
  }

  return { breathe: breathe, cells: cells, genes: genes, plate: plate, stagemap: stagemap, pursed: pursed, body: bodyMap, resourceMap: resourceMap, resection: resection, approach: approach, rtTech: rtTech, mech: MECH, icon: icon };
})();
