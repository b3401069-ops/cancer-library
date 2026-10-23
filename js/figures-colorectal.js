/* 大腸直腸癌專屬圖解：大腸構造、息肉變癌、分期（腸壁深度）、手術切除段、造口、RAS 與抗 EGFR 藥物。
   掛在 window.Figures 底下，文章用 { type: "figure", id: "colon" } 等方式引用；
   互動工具用 fig 參數指定（例如 stagemap 的 fig: "crcStage"、resections 的 fig: "colonSeg"）。 */
(function (F) {
  "use strict";
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 13) + '" fill="' + (o.fill || "#b3b9dc") + '" text-anchor="' + (o.anchor || "middle") + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") + ">" + s + "</text>"; }
  function svg(vb, label, body, cls) { return '<svg class="anim ' + (cls || "") + '" viewBox="' + vb + '" role="img" aria-label="' + label + '">' + body + "</svg>"; }
  function tumGrad(id) { return '<radialGradient id="' + id + '" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffb199"/><stop offset="1" stop-color="#c2485a"/></radialGradient>'; }
  // 依序出現（循環 dur 秒，第 t 秒出現，結尾淡出）
  function popIn(t, dur) {
    var a = (t / dur).toFixed(3), b = Math.min(.9, t / dur + .05).toFixed(3);
    return '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;' + a + ";" + b + ';.94;1" dur="' + dur + 's" repeatCount="indefinite"/>';
  }

  /* ---------- 共用：大腸各段的路徑（畫面左邊是病人的右邊） ---------- */
  var SEG = {
    asc: "M120 254 C 104 238 106 160 116 104",
    transA: "M116 104 C 140 92 170 146 200 138",
    transB: "M200 138 C 232 132 262 88 288 96",
    desc: "M288 96 C 300 140 296 190 292 222",
    sig: "M292 222 C 290 262 250 280 236 256 C 224 236 206 240 205 262",
    rectU: "M205 262 L205 286",
    rectL: "M205 286 L205 304",
    anal: "M205 304 L205 316",
    ileum: "M178 214 C 160 228 140 240 124 240"
  };
  var FULL = "M120 254 C 104 238 106 160 116 104 C 140 92 170 146 200 138 C 232 132 262 88 288 96 C 300 140 296 190 292 222 C 290 262 250 280 236 256 C 224 236 206 240 205 262 L205 316";
  var TORSO = '<path d="M70 18 C 58 80 54 150 62 220 C 68 272 100 312 150 324 H 250 C 300 312 332 272 338 220 C 346 150 342 80 330 18 Z" fill="#232c72" stroke="#5b66b8" stroke-width="1.5"/>';
  var SMALL = '<g fill="none" stroke="#e9a8b8" stroke-opacity=".22" stroke-width="9" stroke-linecap="round">' +
    '<path d="M150 168 C 170 156 232 158 252 170 C 264 182 240 194 200 192 C 160 190 140 202 152 214 C 166 226 236 224 254 212"/>' +
    '<path d="M164 236 C 190 246 230 246 250 236"/></g>';
  // 一段腸管：外框、腸壁、皺褶紋路
  function tube(d, o) {
    o = o || {};
    var w = o.w || 1, extra = o.attr || "";
    return '<path d="' + d + '" fill="none" stroke="#8d4d68" stroke-width="' + 26 * w + '" stroke-linecap="round"' + extra + "/>" +
      '<path d="' + d + '" fill="none" stroke="#e39bb0" stroke-width="' + 20 * w + '" stroke-linecap="round"' + extra + "/>" +
      (o.plain ? "" : '<path d="' + d + '" fill="none" stroke="#b86a86" stroke-width="' + 20 * w + '" stroke-dasharray="1.6 10"' + extra + "/>");
  }
  function cecum() { return '<circle cx="120" cy="254" r="15" fill="#e39bb0" stroke="#8d4d68" stroke-width="3"/><path d="M114 268 q -6 14 2 22" stroke="#e39bb0" stroke-width="5" stroke-linecap="round" fill="none"/>'; }
  function colonAll(skip) {
    skip = skip || {};
    var s = "";
    ["asc", "transA", "transB", "desc", "sig", "rectU", "rectL"].forEach(function (k) { if (!skip[k]) s += tube(SEG[k]); });
    if (!skip.anal) s += '<path d="' + SEG.anal + '" stroke="#8d4d68" stroke-width="16" stroke-linecap="round"/>';
    if (!skip.cecum) s += cecum();
    if (!skip.ileum) s += tube(SEG.ileum, { w: .6, plain: true });
    return s;
  }

  /* ---------- 1. 大腸的構造與功能 ----------
     糞便沿著大腸前進、顏色由稀變成形；水滴從腸壁被吸收。一循環 8 秒。 */
  F.colon = function () {
    var D = 8, dots = "";
    for (var i = 0; i < 5; i++) {
      dots += '<circle r="5"><animateMotion dur="' + D + 's" begin="' + (-i * D / 5).toFixed(2) + 's" repeatCount="indefinite" path="' + FULL + '"/>' +
        '<animate attributeName="fill" values="#e8d27a;#c69a4e;#8a5a32;#6b4226" dur="' + D + 's" begin="' + (-i * D / 5).toFixed(2) + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="r" values="4;5;5.5;5" dur="' + D + 's" begin="' + (-i * D / 5).toFixed(2) + 's" repeatCount="indefinite"/></circle>';
    }
    var drops = "";
    [[108, 190, -22, 0], [140, 112, 0, -22], [200, 150, 0, 22], [258, 104, 0, -22], [306, 160, 22, 0]].forEach(function (p, i) {
      drops += '<path d="M0 -5 C 3 -1 4 1 4 2 A 4 4 0 0 1 -4 2 C -4 1 -3 -1 0 -5 Z" fill="#7ec8f5" transform="translate(' + p[0] + " " + p[1] + ')">' +
        '<animateTransform attributeName="transform" type="translate" values="' + p[0] + " " + p[1] + ";" + (p[0] + p[2]) + " " + (p[1] + p[3]) + '" dur="2.4s" begin="' + (i * .5) + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="' + (i * .5) + 's" repeatCount="indefinite"/></path>';
    });
    return svg("0 -14 400 346", "大腸構造示意：盲腸、升結腸、橫結腸、降結腸、乙狀結腸、直腸到肛門；大腸吸收水分，把食物殘渣變成糞便",
      TORSO + SMALL + colonAll() + dots + drops +
      txt(200, 2, "大腸吸收水分，把食物殘渣慢慢變成糞便", { fill: "#f0cf86", size: 14, weight: 700 }) +
      txt(84, 170, "升結腸", { anchor: "end", fill: "#d9dcf5" }) +
      txt(200, 116, "橫結腸", { fill: "#d9dcf5" }) +
      txt(318, 160, "降結腸", { anchor: "start", fill: "#d9dcf5" }) +
      txt(262, 300, "乙狀結腸", { anchor: "start", fill: "#d9dcf5" }) +
      txt(190, 296, "直腸", { anchor: "end", fill: "#d9dcf5" }) +
      txt(218, 324, "肛門", { anchor: "start", fill: "#d9dcf5", size: 12 }) +
      txt(100, 296, "盲腸、闌尾", { anchor: "end", fill: "#d9dcf5", size: 12 }) +
      txt(204, 206, "小腸", { fill: "#e9a8b8", size: 12 }) +
      '<g transform="translate(292 36)"><path d="M0 -5 C 3 -1 4 1 4 2 A 4 4 0 0 1 -4 2 C -4 1 -3 -1 0 -5 Z" fill="#7ec8f5"/></g>' +
      txt(300, 40, "水分被吸收", { anchor: "start", fill: "#7ec8f5", size: 11.5 }), "colon-fig");
  };

  /* ---------- 2. 息肉慢慢變成癌 ----------
     正常黏膜 → 小息肉 → 變大的腺瘤 → 癌細胞往下侵犯；最後框出「可以用大腸鏡切除」的階段。一循環 9 秒。 */
  F.polyp = function () {
    var D = 9;
    var layers =
      '<path d="M20 120 C 60 116 100 124 140 120 C 180 116 220 124 260 120 C 300 116 340 124 380 120 V 142 H 20 Z" fill="#e39bb0"/>' +
      '<rect x="20" y="142" width="360" height="24" fill="#d1a9bd" opacity=".55"/>' +
      '<rect x="20" y="166" width="360" height="30" fill="#a8574f" opacity=".75"/>' +
      '<g stroke="#8d4048" stroke-width="1" opacity=".6">' + [180, 186, 192].map(function (y) { return '<path d="M20 ' + y + ' H380"/>'; }).join("") + "</g>" +
      txt(26, 136, "黏膜", { anchor: "start", fill: "#5a2a3c", size: 10.5 }) + txt(26, 158, "黏膜下層", { anchor: "start", fill: "#3b2f2f", size: 10.5 }) + txt(26, 186, "肌肉層", { anchor: "start", fill: "#f3dcdc", size: 10.5 });
    var st = [
      { x: 72, t: "正常黏膜", s: "" },
      { x: 150, t: "小息肉", s: '<path d="M134 121 C 136 102 164 102 166 121 Z" fill="#f08aa0" stroke="#ffd0dc" stroke-width="1"/>' },
      { x: 240, t: "變大的腺瘤", s: '<path d="M235 121 L236 104 L244 104 L245 121 Z" fill="#e88aa0"/><path d="M216 92 C 214 74 236 66 248 72 C 266 70 270 90 262 100 C 256 110 226 112 218 104 Z" fill="#e86f86" stroke="#ffd0dc" stroke-width="1"/><circle cx="232" cy="84" r="3" fill="#ffd0dc" opacity=".6"/><circle cx="250" cy="90" r="2.5" fill="#ffd0dc" opacity=".6"/>' },
      { x: 330, t: "癌細胞往下侵犯", s: '<path d="M304 121 C 306 96 324 86 336 92 C 350 88 364 104 364 121 L 360 150 C 356 178 346 190 338 174 C 330 188 316 178 314 158 Z" fill="url(#pp-t)" stroke="#ffd0c4" stroke-width="1"/>' }
    ];
    var body = "";
    st.forEach(function (o, i) {
      var t = .4 + i * 1.4;
      body += '<g opacity="0">' + popIn(t, D) + o.s + txt(o.x, 216, o.t, { fill: i === 3 ? "#ff8f7a" : "#eef0fb", weight: 700, size: 13 }) + "</g>";
    });
    // 可以切除的階段
    body += '<g opacity="0">' + popIn(6.2, D) +
      '<rect x="108" y="56" width="186" height="76" rx="12" fill="#f0cf86" fill-opacity=".08" stroke="#f0cf86" stroke-width="2" stroke-dasharray="6 5"/>' +
      txt(201, 72, "這兩個階段，大腸鏡就能切除", { fill: "#f0cf86", size: 12.5, weight: 700 }) + "</g>";
    return svg("0 34 400 226", "息肉變成癌症示意：正常黏膜、小息肉、變大的腺瘤、癌細胞往下侵犯；在息肉階段用大腸鏡切除可以預防大腸癌",
      "<defs>" + tumGrad("pp-t") + "</defs>" + layers + body +
      '<path d="M40 232 H 352" stroke="#d9dcf5" stroke-width="1.6"/><path d="M360 232 l -10 -5 v 10 z" fill="#d9dcf5"/>' +
      txt(200, 250, "從息肉變成癌，通常要好幾年，甚至十年以上", { fill: "#d9dcf5", size: 12.5 }), "polyp-fig");
  };

  /* ---------- 3. 分期：腫瘤長多深、有沒有到淋巴結或其他器官 ----------
     由 widgets.js 的 stagemap 設定 data-stage（0–4），CSS 控制顯示。 */
  F.crcStage = function () {
    var X = 20, W = 176;
    var wall =
      txt(176, 50, "腸道內", { fill: "#b3b9dc", size: 12 }) +
      '<rect x="' + X + '" y="58" width="' + W + '" height="34" rx="4" fill="#e39bb0"/>' +
      '<rect x="' + X + '" y="92" width="' + W + '" height="30" fill="#d1a9bd" opacity=".6"/>' +
      '<rect x="' + X + '" y="122" width="' + W + '" height="60" fill="#a8574f" opacity=".85"/>' +
      '<g stroke="#8d4048" stroke-width="1" opacity=".7">' + [134, 146, 158, 170].map(function (y) { return '<path d="M' + X + " " + y + " H" + (X + W) + '"/>'; }).join("") + "</g>" +
      '<rect x="' + X + '" y="182" width="' + W + '" height="8" fill="#f0cf86" opacity=".85"/>' +
      '<rect x="' + X + '" y="190" width="' + W + '" height="74" rx="4" fill="#3a4296" opacity=".45"/>' +
      txt(26, 80, "黏膜", { anchor: "start", fill: "#5a2a3c", size: 10.5 }) + txt(26, 111, "黏膜下層", { anchor: "start", fill: "#3b2f2f", size: 10.5 }) +
      txt(26, 156, "肌肉層", { anchor: "start", fill: "#f3dcdc", size: 10.5 }) + txt(26, 203, "漿膜外", { anchor: "start", fill: "#d9dcf5", size: 10.5 });
    var tum =
      '<path class="td td0" d="M96 58 C 100 48 128 48 132 58 L 130 84 C 120 88 108 88 98 84 Z" fill="url(#cs-t)" stroke="#ffd0c4"/>' +
      '<path class="td td1" d="M90 58 C 94 44 132 44 136 58 L 138 120 C 132 140 124 150 114 146 C 104 150 94 140 88 120 Z" fill="url(#cs-t)" stroke="#ffd0c4"/>' +
      '<path class="td td2" d="M86 58 C 90 40 136 40 140 58 L 146 150 C 150 180 144 200 132 206 C 122 214 106 214 96 206 C 82 200 78 180 82 150 Z" fill="url(#cs-t)" stroke="#ffd0c4"/>';
    var nodes =
      '<g class="lv" fill="none" stroke="#aab1ff" stroke-width="1.4" stroke-dasharray="3 4"><path d="M100 206 C 80 220 66 228 56 238"/><path d="M114 212 V 244"/><path d="M128 206 C 148 220 160 226 170 234"/></g>' +
      '<ellipse class="cnode" cx="54" cy="242" rx="9" ry="7"/><ellipse class="cnode" cx="114" cy="250" rx="9" ry="7"/><ellipse class="cnode" cx="172" cy="238" rx="9" ry="7"/>' +
      txt(114, 278, "附近淋巴結", { cls: "cnode-l", size: 12 });
    // 右邊：小人形與遠處轉移
    var body =
      '<circle cx="290" cy="40" r="16" fill="#2b3483" stroke="#5b66b8"/>' +
      '<path d="M262 64 C 276 58 304 58 318 64 C 330 70 334 90 334 120 L 330 250 H 250 L 246 120 C 246 90 250 70 262 64 Z" fill="#2b3483" stroke="#5b66b8"/>' +
      '<ellipse cx="274" cy="96" rx="12" ry="20" fill="#e9a8b8" opacity=".4"/><ellipse cx="306" cy="96" rx="12" ry="20" fill="#e9a8b8" opacity=".4"/>' +
      '<path d="M258 136 C 270 126 300 128 306 140 C 304 152 280 158 266 152 C 258 148 256 142 258 136 Z" fill="#a8574f" opacity=".75"/>' +
      '<path d="M266 190 C 270 172 312 172 316 190 C 318 210 306 222 290 224 C 274 222 262 210 266 190 Z" fill="none" stroke="#e39bb0" stroke-width="5" opacity=".6"/>';
    var mets = [
      { x: 274, y: 92, l: "肺臟", lx: 352, ly: 92 },
      { x: 280, y: 142, l: "肝臟", lx: 352, ly: 142 },
      { x: 296, y: 214, l: "腹膜", lx: 352, ly: 214 }
    ].map(function (o, i) {
      return '<g class="cmet" style="transition-delay:' + (i * .15) + 's"><path class="met-path" d="M146 150 Q ' + (210 + i * 10) + " " + (o.y - 40) + " " + o.x + " " + o.y + '" fill="none" stroke="#ff8f7a" stroke-width="1.6" stroke-dasharray="4 5"/>' +
        '<circle cx="' + o.x + '" cy="' + o.y + '" r="7" fill="url(#cs-t)" stroke="#ffd0c4"/>' + '<path d="M' + (o.x + 9) + " " + o.y + " H" + (o.lx - 4) + '" stroke="#ff8f7a" stroke-width="1"/>' +
        txt(o.lx, o.ly + 4, o.l, { anchor: "start", fill: "#ff8f7a", weight: 700, size: 12.5 }) + "</g>";
    }).join("");
    return svg("0 22 390 270", "大腸直腸癌分期示意：腫瘤往腸壁深處長的程度、附近淋巴結，以及肝臟、肺臟、腹膜等遠處轉移",
      "<defs>" + tumGrad("cs-t") + "</defs>" + wall + nodes + tum + body + mets, "stagemap crcst");
  };

  /* ---------- 4. 手術切除範圍（依腫瘤位置） ----------
     kind：right 右半結腸、left 左半結腸、sigmoid 乙狀結腸、lar 低位前切除（直腸）、apr 腹會陰切除（直腸）。
     金色框出要切除的腸段 → 切下淡出 → 兩端接起來（吻合）；需要造口時最後出現造口。一循環 7 秒。 */
  var CUT = {
    right: { rem: ["asc", "transA", "cecum", "ileum"], tumor: [112, 186], link: "M178 214 C 196 192 202 162 200 140", label: "右半結腸切除：小腸接到橫結腸" },
    left: { rem: ["transB", "desc"], tumor: [295, 156], link: "M200 138 C 252 150 298 182 292 222", label: "左半結腸切除：橫結腸接到乙狀結腸" },
    sigmoid: { rem: ["sig"], tumor: [252, 270], link: "M292 222 C 286 252 236 264 205 262", label: "乙狀結腸切除：降結腸接到直腸" },
    lar: { rem: ["sig", "rectU"], tumor: [205, 276], link: "M292 222 C 290 270 236 290 205 286", label: "低位前切除：保留肛門，接到剩下的直腸", stoma: { x: 84, y: 214, t: "暫時性", t2: "迴腸造口", tx: 40, ty: 244, via: "M178 214 C 150 206 112 212 84 214" } },
    apr: { rem: ["sig", "rectU", "rectL", "anal"], tumor: [205, 298], link: "M292 222 C 302 238 310 246 318 250", label: "腹會陰切除：直腸和肛門一起切除", stoma: { x: 318, y: 252, t: "永久性結腸造口", tx: 352, ty: 290 } }
  };
  F.colonSeg = function (kind) {
    var D = 7, R = CUT[kind], skip = {}, rem = "", k = "cg" + kind;
    R.rem.forEach(function (s) { skip[s] = 1; });
    R.rem.forEach(function (s) {
      if (s === "cecum") rem += cecum();
      else if (s === "anal") rem += '<path d="' + SEG.anal + '" stroke="#8d4d68" stroke-width="16" stroke-linecap="round"/>';
      else if (s === "ileum") rem += tube(SEG.ileum, { w: .6, plain: true });
      else rem += tube(SEG[s]);
    });
    var outline = R.rem.filter(function (s) { return SEG[s]; }).map(function (s) {
      return '<path d="' + SEG[s] + '" fill="none" stroke="#f0cf86" stroke-width="34" stroke-linecap="round" stroke-opacity="0"><animate attributeName="stroke-opacity" values="0;.35;.35;0;0" keyTimes="0;.12;.4;.5;1" dur="' + D + 's" repeatCount="indefinite"/></path>';
    }).join("") + (kind === "right" ? '<circle cx="120" cy="254" r="22" fill="#f0cf86" opacity="0"><animate attributeName="opacity" values="0;.35;.35;0;0" keyTimes="0;.12;.4;.5;1" dur="' + D + 's" repeatCount="indefinite"/></circle>' : "");
    var dash = ' stroke-dasharray="320" stroke-dashoffset="320"';
    var anim = '<animate attributeName="stroke-dashoffset" values="320;320;0;0;320" keyTimes="0;.55;.75;.95;1" dur="' + D + 's" repeatCount="indefinite"/>';
    var link = '<path d="' + R.link + '" fill="none" stroke="#8d4d68" stroke-width="26" stroke-linecap="round"' + dash + ">" + anim + "</path>" +
      '<path d="' + R.link + '" fill="none" stroke="#e39bb0" stroke-width="20" stroke-linecap="round"' + dash + ">" + anim + "</path>";
    var stoma = "";
    if (R.stoma) {
      var S = R.stoma;
      stoma = '<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.74;.8;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        (S.via ? '<path d="' + S.via + '" fill="none" stroke="#e39bb0" stroke-width="7" stroke-dasharray="3 5"/>' : "") +
        '<circle cx="' + S.x + '" cy="' + S.y + '" r="11" fill="#e2604e" stroke="#ffd0c4" stroke-width="2"/><circle cx="' + (S.x - 3) + '" cy="' + (S.y - 3) + '" r="3" fill="#ffd0c4" opacity=".7"/>' +
        txt(S.tx, S.ty, S.t, { fill: "#7ec8f5", weight: 700, size: 12 }) + (S.t2 ? txt(S.tx, S.ty + 16, S.t2, { fill: "#7ec8f5", weight: 700, size: 12 }) : "") + "</g>";
    }
    return svg("0 -16 400 348", "手術切除範圍示意：" + R.label,
      "<defs>" + tumGrad(k + "-t") + "</defs>" + TORSO + SMALL + colonAll(skip) + outline +
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -10;0 -10;0 0" keyTimes="0;.42;.56;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="1;1;.1;.1;1" keyTimes="0;.42;.56;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + rem +
      '<circle cx="' + R.tumor[0] + '" cy="' + R.tumor[1] + '" r="10" fill="url(#' + k + '-t)" stroke="#ffd0c4"/></g>' +
      link + stoma + txt(200, 0, R.label, { fill: "#f0cf86", weight: 700, size: 14 }), "seg-fig");
  };

  /* ---------- 5. 造口 ----------
     kind：colo 結腸造口（多在左下腹）、ileo 迴腸造口（多在右下腹）。排出物沿腸道走到造口，流進造口袋。 */
  F.stoma = function (kind) {
    var D = 6, colo = kind === "colo";
    var sx = colo ? 304 : 96, sy = 246;
    var route = colo ? "M116 104 C 140 92 170 146 200 138 C 232 132 262 88 288 96 C 300 140 296 190 292 222 C 294 232 298 240 " + sx + " " + sy
      : "M150 168 C 170 156 232 158 252 170 C 264 182 240 194 200 192 C 160 190 140 202 152 214 C 160 222 150 236 124 240 C 112 242 102 244 " + sx + " " + sy;
    var bowel = colo ? colonAll({ sig: 1, rectU: 1, rectL: 1, anal: 1 }) + '<g opacity=".25">' + tube(SEG.sig) + tube(SEG.rectU) + tube(SEG.rectL) + "</g>"
      : '<g opacity=".3">' + colonAll({ ileum: 1 }) + "</g>" + '<path d="' + route + '" fill="none" stroke="#e39bb0" stroke-width="9" stroke-linecap="round" opacity=".8"/>';
    var dots = "";
    for (var i = 0; i < 4; i++) {
      dots += '<circle r="' + (colo ? 4.5 : 3.6) + '" fill="' + (colo ? "#8a5a32" : "#d8b04e") + '"><animateMotion dur="' + D + 's" begin="' + (-i * D / 4).toFixed(2) + 's" repeatCount="indefinite" path="' + route + '"/></circle>';
    }
    var bx = sx - 30, pouch = "M" + bx + " " + (sy - 14) + " C " + bx + " " + (sy - 26) + " " + (bx + 60) + " " + (sy - 26) + " " + (bx + 60) + " " + (sy - 14) + " L " + (bx + 66) + " " + (sy + 56) + " C " + (bx + 66) + " " + (sy + 72) + " " + (bx - 6) + " " + (sy + 72) + " " + (bx - 6) + " " + (sy + 56) + " Z";
    var k = "st" + kind;
    return svg("0 -16 400 360", colo ? "結腸造口示意：大腸接到左下腹的造口，糞便流進造口袋" : "迴腸造口示意：小腸接到右下腹的造口，排出物較稀，流進造口袋",
      "<defs><clipPath id=\"" + k + '-p"><path d="' + pouch + '"/></clipPath></defs>' + TORSO + (colo ? SMALL : "") + bowel + dots +
      // 造口袋與內容物
      '<g clip-path="url(#' + k + '-p)"><rect x="' + (bx - 10) + '" y="' + (sy + 70) + '" width="90" height="80" fill="' + (colo ? "#8a5a32" : "#d8b04e") + '" opacity=".75">' +
      '<animate attributeName="y" values="' + (sy + 70) + ";" + (sy + 34) + ";" + (sy + 70) + '" dur="' + (D * 2) + 's" repeatCount="indefinite"/></rect></g>' +
      '<path d="' + pouch + '" fill="#d9dcf5" fill-opacity=".18" stroke="#d9dcf5" stroke-width="2"/>' +
      '<circle cx="' + sx + '" cy="' + sy + '" r="12" fill="#e2604e" stroke="#ffd0c4" stroke-width="2"/>' +
      txt(colo ? bx + 30 : bx + 30, sy + 92, "造口袋", { fill: "#d9dcf5", size: 12 }) +
      // 放大圖：健康的造口
      '<g transform="translate(' + (colo ? 34 : 366) + ' 46)"><circle r="28" fill="#141a46" stroke="#f0cf86" stroke-width="1.5"/><circle r="19" fill="#c9a58c"/>' +
      '<circle r="12" fill="#e2604e"/><circle cx="-4" cy="-4" r="4" fill="#ff9b8a" opacity=".8"/><circle r="2.6" fill="#8d2a3a"/>' +
      txt(0, 44, "健康的造口", { fill: "#f0cf86", size: 11.5, weight: 700 }) + txt(0, 59, "紅潤、濕潤", { fill: "#f0cf86", size: 11.5 }) + "</g>" +
      txt(200, 2, colo ? "結腸造口：多在左下腹，排出物較成形" : "迴腸造口：多在右下腹，排出物較稀、量較多", { fill: "#f0cf86", size: 14, weight: 700 }), "stoma-fig");
  };

  /* ---------- 6. RAS 基因與抗 EGFR 標靶藥物 ----------
     左：RAS 正常，抗體擋住 EGFR 後訊號停止；右：RAS 突變，訊號從下游自己一直傳，擋住上面也沒用。一循環 6 秒。 */
  F.egfrRas = function () {
    var D = 6;
    function panel(ox, mut) {
      var c = ox + 100, s = "";
      s += txt(c, -6, mut ? "RAS 突變" : "RAS 正常（原生型）", { fill: mut ? "#ff8f7a" : "#7fdcaa", weight: 700, size: 14 });
      s += '<rect x="' + (ox + 6) + '" y="74" width="188" height="14" rx="7" fill="#5b66b8" opacity=".55"/>' + txt(ox + 14, 104, "細胞膜", { anchor: "start", size: 10.5 });
      // EGFR 開關
      s += '<path d="M' + c + " 112 V 52 M" + c + " 52 l -12 -14 M" + c + ' 52 l 12 -14" stroke="#aab1ff" stroke-width="5" stroke-linecap="round" fill="none"/>' + txt(c + 22, 60, "EGFR", { anchor: "start", fill: "#aab1ff", size: 11 });
      // 抗 EGFR 抗體從上方接上
      s += '<g><animateTransform attributeName="transform" type="translate" values="0 -40;0 -40;0 0;0 0;0 -40" keyTimes="0;.22;.36;.94;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.2;.3;.94;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        '<path d="M' + c + " 34 V 18 M" + c + " 34 l -10 10 M" + c + ' 34 l 10 10" transform="rotate(180 ' + c + ' 32)" stroke="#f0cf86" stroke-width="5" stroke-linecap="round" fill="none"/>' +
        txt(c - 22, 34, "抗 EGFR 藥物", { anchor: "end", fill: "#f0cf86", size: 11, weight: 700 }) + "</g>";
      // 訊號鏈
      s += '<path d="M' + c + " 112 V 214" + '" stroke="#5b66b8" stroke-width="2" stroke-dasharray="3 4"/>';
      s += '<circle cx="' + c + '" cy="132" r="15" fill="' + (mut ? "#c2485a" : "#2f3a8a") + '" stroke="' + (mut ? "#ffd0c4" : "#aab1ff") + '" stroke-width="2">' +
        (mut ? '<animate attributeName="r" values="14;17;14" dur="1.2s" repeatCount="indefinite"/>' : "") + "</circle>" + txt(c, 136, "RAS", { fill: "#fff", size: 11, weight: 700 });
      s += '<circle cx="' + c + '" cy="172" r="13" fill="#2f3a8a" stroke="#aab1ff" stroke-width="2"/>' + txt(c, 176, "下游", { fill: "#fff", size: 10 });
      if (mut) s += txt(c + 22, 128, "一直開著", { anchor: "start", fill: "#ff8f7a", size: 11, weight: 700 });
      // 細胞核
      s += '<ellipse cx="' + c + '" cy="226" rx="54" ry="20" fill="#3a4296" stroke="#aab1ff"><animate attributeName="fill" values="' + (mut ? "#7a3a5a;#7a3a5a;#7a3a5a" : "#7a3a5a;#7a3a5a;#3a4296;#3a4296;#7a3a5a") + '"' + (mut ? "" : ' keyTimes="0;.38;.46;.94;1"') + ' dur="' + D + 's" repeatCount="indefinite"/></ellipse>' + txt(c, 230, "細胞核", { fill: "#eef0fb", size: 11 });
      // 訊號點
      for (var i = 0; i < 4; i++) {
        var b = (i * D / 8).toFixed(2);
        if (!mut) s += '<circle r="4" fill="#f0cf86"><animateMotion dur="1.5s" begin="' + b + 's" repeatCount="indefinite" path="M' + c + " 96 V 214" + '"/><animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.38;.4;.96;1" dur="' + D + 's" repeatCount="indefinite"/></circle>';
        else s += '<circle r="4" fill="#ff8f7a"><animateMotion dur="1.5s" begin="' + b + 's" repeatCount="indefinite" path="M' + c + " 148 V 214" + '"/></circle>';
      }
      s += '<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.42;.48;.94;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        txt(c, 266, mut ? "訊號照樣往下傳，這類藥沒效" : "訊號停止，癌細胞不再長", { fill: mut ? "#ff8f7a" : "#7fdcaa", size: 12.5, weight: 700 }) + "</g>";
      return s;
    }
    return svg("0 -24 420 304", "抗 EGFR 藥物示意：RAS 正常時，藥物擋住 EGFR 開關，生長訊號停止；RAS 突變時，訊號從下游自己一直傳，所以要先檢測 RAS",
      panel(4, false) + '<path d="M210 30 V 250" stroke="#3a4382" stroke-dasharray="4 6"/>' + panel(214, true), "ras-fig");
  };
})(window.Figures);
