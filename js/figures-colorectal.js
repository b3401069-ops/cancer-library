/* 大腸直腸癌專屬圖解：大腸構造、息肉變癌、分期（腸壁深度）、手術切除段、造口、RAS 與抗 EGFR 藥物。
   掛在 window.Figures 底下，文章用 { type: "figure", id: "colon" } 等方式引用；
   互動工具用 fig 參數指定（例如 stagemap 的 fig: "crcStage"、resections 的 fig: "colonSeg"）。
   腸管用多層線條畫出立體感：陰影、外框、腸壁、皺褶（結腸袋）、結腸帶與高光。 */
(function (F) {
  "use strict";
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 13) + '" fill="' + (o.fill || "#b3b9dc") + '" text-anchor="' + (o.anchor || "middle") + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") + ">" + s + "</text>"; }
  function svg(vb, label, body, cls) { return '<svg class="anim ' + (cls || "") + '" viewBox="' + vb + '" role="img" aria-label="' + label + '">' + body + "</svg>"; }
  // 帶底色的小標籤
  function tag(x, y, s, o) {
    o = o || {};
    var size = o.size || 12, w = s.length * size + 14, a = o.anchor || "middle";
    var x0 = a === "start" ? x : a === "end" ? x - w : x - w / 2;
    return '<g' + (o.cls ? ' class="' + o.cls + '"' : "") + '><rect x="' + x0.toFixed(1) + '" y="' + (y - size - 3) + '" width="' + w + '" height="' + (size + 9) + '" rx="' + ((size + 9) / 2) + '" fill="#0e1236" fill-opacity=".78" stroke="' + (o.stroke || "#3a4382") + '"/>' +
      txt(x0 + w / 2, y + 1, s, { size: size, fill: o.fill || "#e6e9ff", weight: o.weight || 700 }) + "</g>";
  }
  function tumGrad(id) { return '<radialGradient id="' + id + '" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#ffc0a8"/><stop offset=".55" stop-color="#e2604e"/><stop offset="1" stop-color="#9e2f47"/></radialGradient>'; }
  function anim(attr, values, keyTimes, dur, extra) { return '<animate attributeName="' + attr + '" values="' + values + '" keyTimes="' + keyTimes + '" dur="' + dur + 's" repeatCount="indefinite"' + (extra || "") + "/>"; }
  // 依階段顯示的說明文字（a、b 為循環中的比例）
  function phase(x, y, s, a, b, dur, o) {
    o = o || {};
    return '<g opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;" + a.toFixed(3) + ";" + (a + .02).toFixed(3) + ";" + (b - .02).toFixed(3) + ";" + b.toFixed(3) + ";1", dur) +
      txt(x, y, s, { fill: o.fill || "#f0cf86", size: o.size || 14, weight: 700 }) + "</g>";
  }

  /* ---------- 共用：身體與大腸的路徑（畫面左邊是病人的右邊） ---------- */
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
  // 供應各段腸子的血管（腸繫膜動脈分支），切除時跟著一起拿掉
  var VES = {
    asc: "M200 184 C 170 186 140 190 116 196 M200 184 C 168 168 140 156 114 150",
    transA: "M200 184 C 186 168 170 150 160 128",
    transB: "M206 186 C 226 168 244 140 252 112",
    desc: "M210 200 C 240 196 268 184 292 176",
    sig: "M210 200 C 230 222 250 240 260 262",
    rectU: "M210 200 C 214 226 210 250 206 272",
    ileum: "M200 184 C 180 200 160 220 146 236"
  };
  function defs(k) {
    return '<linearGradient id="' + k + '-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3688"/><stop offset="1" stop-color="#1b2160"/></linearGradient>' +
      '<radialGradient id="' + k + '-liver" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#b9675f"/><stop offset="1" stop-color="#6e3344"/></radialGradient>' + tumGrad(k + "-t");
  }
  function body(k) {
    return '<path d="M70 18 C 58 80 54 150 62 220 C 68 272 100 312 150 324 H 250 C 300 312 332 272 338 220 C 346 150 342 80 330 18 Z" fill="url(#' + k + '-body)" stroke="#5b66b8" stroke-width="1.5"/>' +
      // 肋骨下緣、肝臟、胃、骨盆
      '<g fill="none" stroke="#8f98d8" stroke-opacity=".28" stroke-width="2.2"><path d="M76 40 C 110 70 160 82 200 70 C 240 82 290 70 324 40"/><path d="M80 24 C 120 52 170 60 200 50 C 230 60 280 52 320 24"/></g>' +
      '<path d="M78 34 C 96 26 150 28 186 44 C 196 60 180 82 150 88 C 120 92 90 84 80 66 C 74 56 74 42 78 34 Z" fill="url(#' + k + '-liver)" opacity=".55"/>' +
      txt(118, 64, "肝臟", { fill: "#f3d0c8", size: 11 }) +
      '<path d="M236 40 C 262 30 300 40 304 62 C 306 84 284 92 262 86 C 246 82 236 70 232 58 Z" fill="#c9a36b" opacity=".22"/>' + txt(272, 64, "胃", { fill: "#e8d3a8", size: 11 }) +
      '<g fill="none" stroke="#9fa7d8" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"><path d="M86 250 C 90 276 112 296 150 304"/><path d="M314 250 C 310 276 288 296 250 304"/></g>';
  }
  // 小腸：一圈圈的腸環
  var SMALL = '<g fill="none" stroke-linecap="round">' +
    ["M150 166 C 172 152 232 154 254 168 C 268 182 244 194 200 192 C 158 190 138 202 150 216 C 164 230 236 228 256 214",
     "M164 236 C 190 248 232 248 252 236 M168 178 C 186 172 214 172 232 180"].map(function (d) {
      return '<path d="' + d + '" stroke="#6e3a62" stroke-width="12" stroke-opacity=".5"/><path d="' + d + '" stroke="#e9a8bf" stroke-width="8" stroke-opacity=".38"/>';
    }).join("") + "</g>";
  // 一段腸管（w：粗細倍率；plain：小腸，不畫結腸袋）
  function tube(d, o) {
    o = o || {};
    var w = o.w || 1, p = '<path d="' + d + '" fill="none" stroke-linecap="round" ';
    return p + 'stroke="#140c2a" stroke-opacity=".35" stroke-width="' + 30 * w + '" transform="translate(2 3)"/>' +
      p + 'stroke="#7c3a57" stroke-width="' + 27 * w + '"/>' +
      p + 'stroke="#e7a0b5" stroke-width="' + 22 * w + '"/>' +
      (o.plain ? "" : p.replace('stroke-linecap="round" ', "") + 'stroke="#c46f8e" stroke-width="' + 22 * w + '" stroke-dasharray="2.4 9.6"/>' +
        p + 'stroke="#a8526f" stroke-opacity=".55" stroke-width="' + 2.6 * w + '" transform="translate(2.5 2.5)"/>') +
      p + 'stroke="#fde1ea" stroke-opacity=".5" stroke-width="' + 5 * w + '" transform="translate(-3 -3)"/>';
  }
  function cecum() {
    return '<path d="M114 266 q -7 14 1 24" stroke="#7c3a57" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M114 266 q -7 14 1 24" stroke="#e7a0b5" stroke-width="4" stroke-linecap="round" fill="none"/>' +
      '<circle cx="122" cy="257" r="17" fill="#140c2a" opacity=".3"/><circle cx="120" cy="254" r="16" fill="#e7a0b5" stroke="#7c3a57" stroke-width="3"/><circle cx="115" cy="249" r="5" fill="#fde1ea" opacity=".5"/>';
  }
  function anal() { return '<path d="' + SEG.anal + '" stroke="#7c3a57" stroke-width="17" stroke-linecap="round"/><path d="' + SEG.anal + '" stroke="#c46f8e" stroke-width="10" stroke-linecap="round"/>'; }
  function seg(s) {
    if (s === "cecum") return cecum();
    if (s === "anal") return anal();
    if (s === "ileum") return tube(SEG.ileum, { w: .62, plain: true });
    return tube(SEG[s]);
  }
  function vessels(list) {
    return '<g fill="none" stroke-linecap="round">' + list.filter(function (s) { return VES[s]; }).map(function (s) {
      return '<path d="' + VES[s] + '" stroke="#ff8f7a" stroke-opacity=".32" stroke-width="1.4"/>';
    }).join("") + "</g>";
  }
  var ALL = ["asc", "transA", "transB", "desc", "sig", "rectU", "rectL", "ileum", "cecum", "anal"];
  function colonAll(skip) {
    skip = skip || {};
    var keep = ALL.filter(function (s) { return !skip[s]; });
    return vessels(keep) + keep.map(seg).join("");
  }

  /* ---------- 1. 大腸的構造與功能 ----------
     糞便沿著大腸前進、由稀變成形；水滴從腸壁被吸收。一循環 9 秒。 */
  F.colon = function () {
    var D = 9, k = "co", dots = "";
    for (var i = 0; i < 6; i++) {
      var b = (-i * D / 6).toFixed(2) + "s";
      dots += '<circle r="5"><animateMotion dur="' + D + 's" begin="' + b + '" repeatCount="indefinite" path="' + FULL + '"/>' +
        '<animate attributeName="fill" values="#e8d27a;#c69a4e;#8a5a32;#6b4226" dur="' + D + 's" begin="' + b + '" repeatCount="indefinite"/>' +
        '<animate attributeName="r" values="3.6;4.6;5.4;5.8" dur="' + D + 's" begin="' + b + '" repeatCount="indefinite"/></circle>';
    }
    var drops = "";
    [[108, 190, -24, 0], [140, 112, 0, -22], [196, 152, 0, 20], [258, 104, 0, -22], [308, 160, 24, 0], [286, 214, 22, 6]].forEach(function (p, i) {
      drops += '<path d="M0 -5 C 3 -1 4 1 4 2 A 4 4 0 0 1 -4 2 C -4 1 -3 -1 0 -5 Z" fill="#7ec8f5" transform="translate(' + p[0] + " " + p[1] + ')">' +
        '<animateTransform attributeName="transform" type="translate" values="' + p[0] + " " + p[1] + ";" + (p[0] + p[2]) + " " + (p[1] + p[3]) + '" dur="2.6s" begin="' + (i * .45) + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0;1;0" dur="2.6s" begin="' + (i * .45) + 's" repeatCount="indefinite"/></path>';
    });
    return svg("-10 -22 444 362", "大腸構造示意：盲腸、升結腸、橫結腸、降結腸、乙狀結腸、直腸到肛門；大腸吸收水分，把食物殘渣變成糞便",
      "<defs>" + defs(k) + "</defs>" + body(k) + SMALL + colonAll() + dots + drops +
      txt(200, -6, "大腸吸收水分，把食物殘渣慢慢變成糞便", { fill: "#f0cf86", size: 14, weight: 700 }) +
      tag(70, 176, "升結腸", { anchor: "end" }) + tag(200, 122, "橫結腸") + tag(330, 160, "降結腸", { anchor: "start" }) +
      tag(262, 302, "乙狀結腸", { anchor: "start" }) + tag(186, 296, "直腸", { anchor: "end" }) + tag(220, 330, "肛門", { anchor: "start", size: 11 }) +
      tag(100, 304, "盲腸、闌尾", { anchor: "end", size: 11 }) + txt(204, 208, "小腸", { fill: "#f3c6d4", size: 12, weight: 700 }) +
      '<g transform="translate(330 12)"><path d="M0 -5 C 3 -1 4 1 4 2 A 4 4 0 0 1 -4 2 C -4 1 -3 -1 0 -5 Z" fill="#7ec8f5"/></g>' +
      txt(340, 16, "水分被吸收", { anchor: "start", fill: "#7ec8f5", size: 11.5 }) +
      '<circle cx="324" cy="34" r="4.5" fill="#8a5a32"/>' + txt(334, 38, "糞便慢慢成形", { anchor: "start", fill: "#d9c2a5", size: 11.5 }), "colon-fig");
  };

  /* ---------- 腸壁剖面（息肉圖與分期圖共用） ----------
     黏膜（隱窩）、黏膜下層（血管）、肌肉層（環走肌、縱走肌）、漿膜。 */
  function wallDefs(k) {
    return '<pattern id="' + k + '-cr" width="9" height="30" patternUnits="userSpaceOnUse"><rect width="9" height="30" fill="#e7a0b5"/><path d="M4.5 3 V 22" stroke="#c46f8e" stroke-width="3.2" stroke-linecap="round"/><circle cx="4.5" cy="25" r="1.4" fill="#fde1ea"/></pattern>' +
      '<pattern id="' + k + '-ci" width="12" height="9" patternUnits="userSpaceOnUse"><rect width="12" height="9" fill="#a8524f"/><ellipse cx="6" cy="4.5" rx="4.6" ry="2.6" fill="#c46a63"/></pattern>' +
      '<pattern id="' + k + '-lo" width="24" height="6" patternUnits="userSpaceOnUse"><rect width="24" height="6" fill="#8f4248"/><path d="M0 3 H 24" stroke="#b05a5d" stroke-width="2"/></pattern>' +
      '<pattern id="' + k + '-fat" width="18" height="16" patternUnits="userSpaceOnUse"><rect width="18" height="16" fill="#2d3474"/><circle cx="5" cy="5" r="4" fill="#e8d39a" fill-opacity=".14"/><circle cx="13" cy="11" r="4.5" fill="#e8d39a" fill-opacity=".12"/></pattern>' +
      '<linearGradient id="' + k + '-pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbc4d2"/><stop offset="1" stop-color="#d4607f"/></linearGradient>' + tumGrad(k + "-t");
  }
  // x0–x1 寬、表面在 y0；回傳各層的 y
  function wall(k, x0, x1, y0, o) {
    o = o || {};
    var W = x1 - x0, Y = { m: y0, sm: y0 + 30, ci: y0 + 58, lo: y0 + 82, se: y0 + 104, fat: y0 + 110 };
    var wave = "M" + x0 + " " + (y0 + 2);
    for (var x = x0; x < x1; x += 20) wave += " Q " + (x + 10) + " " + (y0 - 3) + " " + Math.min(x1, x + 20) + " " + (y0 + 2);
    var s = '<path d="' + wave + " V " + Y.sm + " H " + x0 + ' Z" fill="url(#' + k + '-cr)"/>' +
      '<rect x="' + x0 + '" y="' + Y.sm + '" width="' + W + '" height="28" fill="#ead0dc"/>' +
      '<g fill="none" stroke-width="1.6" stroke-linecap="round"><path d="M' + x0 + " " + (Y.sm + 9) + " C " + (x0 + W * .25) + " " + (Y.sm + 2) + " " + (x0 + W * .5) + " " + (Y.sm + 16) + " " + x1 + " " + (Y.sm + 8) + '" stroke="#e2604e"/>' +
      '<path d="M' + x0 + " " + (Y.sm + 19) + " C " + (x0 + W * .3) + " " + (Y.sm + 26) + " " + (x0 + W * .6) + " " + (Y.sm + 12) + " " + x1 + " " + (Y.sm + 20) + '" stroke="#6f86d6"/></g>' +
      '<rect x="' + x0 + '" y="' + Y.ci + '" width="' + W + '" height="24" fill="url(#' + k + '-ci)"/>' +
      '<rect x="' + x0 + '" y="' + Y.lo + '" width="' + W + '" height="22" fill="url(#' + k + '-lo)"/>' +
      '<rect x="' + x0 + '" y="' + Y.se + '" width="' + W + '" height="6" fill="#f0cf86" opacity=".9"/>';
    if (o.fat) s += '<rect x="' + x0 + '" y="' + Y.fat + '" width="' + W + '" height="' + o.fat + '" rx="6" fill="url(#' + k + '-fat)"/>';
    if (o.labels) {
      s += tag(x0 + 6, Y.m + 18, "黏膜", { anchor: "start", size: 10.5 }) + tag(x0 + 6, Y.sm + 18, "黏膜下層", { anchor: "start", size: 10.5 }) +
        tag(x0 + 6, Y.ci + 17, "肌肉層", { anchor: "start", size: 10.5 }) + tag(x0 + 6, Y.se + 4, "漿膜", { anchor: "start", size: 10.5, stroke: "#f0cf86" });
    }
    return s;
  }

  /* ---------- 2. 息肉慢慢變成癌，以及大腸鏡切除 ----------
     正常黏膜 → 小息肉 → 變大的腺瘤 → 癌細胞往下侵犯；最後大腸鏡伸進來，用圈套把腺瘤切下。一循環 12 秒。 */
  F.polyp = function () {
    var D = 12, k = "pp", Y0 = 130;
    function show(t, out) {
      var a = t / D, o = out ? out / D : .95;
      return anim("opacity", "0;0;1;1;0;0", "0;" + a.toFixed(3) + ";" + (a + .04).toFixed(3) + ";" + o.toFixed(3) + ";" + Math.min(.99, o + .04).toFixed(3) + ";1", D);
    }
    var crypts = function (cx, cy, r) { var s = ""; for (var i = -2; i <= 2; i++) s += '<circle cx="' + (cx + i * r * .35) + '" cy="' + (cy + (i % 2) * 3) + '" r="1.6" fill="#fde1ea" opacity=".75"/>'; return s; };
    // 小息肉
    var s2 = '<path d="M132 ' + (Y0 + 1) + ' C 134 ' + (Y0 - 20) + " 166 " + (Y0 - 20) + " 168 " + (Y0 + 1) + ' Z" fill="url(#' + k + '-pg)" stroke="#b84d6c" stroke-width="1.2"/>' + crypts(150, Y0 - 9, 14);
    // 有蒂的腺瘤（花椰菜狀）
    var head = [[234, 88, 15], [250, 79, 17], [266, 89, 14], [250, 98, 16], [240, 100, 11], [262, 101, 11]].map(function (c) {
      return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="url(#' + k + '-pg)" stroke="#b84d6c" stroke-width="1.2"/>';
    }).join("") + crypts(250, 84, 20) + crypts(250, 98, 16);
    var stalk = '<path d="M244 ' + (Y0 + 1) + " C 245 120 245 112 246 106 L 254 106 C 255 112 255 120 256 " + (Y0 + 1) + ' Z" fill="#e7a0b5" stroke="#b84d6c" stroke-width="1.2"/><path d="M250 ' + Y0 + ' V 108" stroke="#e2604e" stroke-width="1.4"/>';
    // 癌：表面潰瘍、往下長出不規則的根
    var s4 = '<path d="M316 ' + (Y0 + 1) + " C 316 104 334 94 350 98 C 368 94 384 108 384 " + (Y0 + 1) + ' Z" fill="url(#' + k + '-t)" stroke="#ffd0c4" stroke-width="1.2"/>' +
      '<ellipse cx="350" cy="108" rx="13" ry="5" fill="#5a1e2e" opacity=".8"/>' +
      '<path d="M318 130 C 312 140 300 146 302 154 C 306 162 320 154 326 160 C 322 176 316 190 326 196 C 334 200 338 192 342 204 C 348 214 356 206 356 196 C 364 204 374 198 372 186 C 368 176 376 166 372 158 C 380 158 396 160 396 150 C 394 140 384 138 382 130 Z" fill="url(#' + k + '-t)" opacity=".9"/>' +
      '<path d="M326 196 l -6 12 M350 206 l 2 12 M370 190 l 8 10 M304 152 l -10 4 M394 150 l 10 2" stroke="#c2485a" stroke-width="2.6" stroke-linecap="round"/>';
    // 大腸鏡與圈套
    var scope = '<g opacity="0">' + show(6.4) +
      '<path d="M-20 52 C 70 40 150 44 206 64" fill="none" stroke="#141a46" stroke-width="16" stroke-linecap="round"/>' +
      '<path d="M-20 52 C 70 40 150 44 206 64" fill="none" stroke="#5b66b8" stroke-width="11" stroke-linecap="round"/>' +
      '<path d="M-20 49 C 70 37 150 41 204 60" fill="none" stroke="#aab1ff" stroke-width="2" stroke-opacity=".6"/>' +
      '<polygon points="208,58 252,74 236,100" fill="#fff6c9" opacity=".2"/><circle cx="208" cy="66" r="3" fill="#fff6c9"/>' +
      '<path d="M208 66 C 222 80 236 96 244 108" stroke="#d9dcf5" stroke-width="1.6" fill="none"/>' +
      '<ellipse cx="250" cy="110" rx="20" ry="5" fill="none" stroke="#f0cf86" stroke-width="2.4">' +
      anim("rx", "20;20;20;5;5;20", "0;.62;.66;.7;.95;1", D) + "</ellipse>" + "</g>";
    var removed = '<g>' + '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;-22 -34;-22 -34;0 0" keyTimes="0;.72;.8;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<g opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;" + (3 / D).toFixed(3) + ";" + (3.4 / D).toFixed(3) + ";.76;.82;1", D) + head + "</g></g>";
    var lbl = function (x, s, t, col) { return '<g opacity="0">' + show(t) + tag(x, 262, s, { fill: col || "#e6e9ff" }) + "</g>"; };
    return svg("0 0 420 300", "息肉變成癌症示意：正常黏膜、小息肉、變大的腺瘤、癌細胞往下侵犯；在息肉階段用大腸鏡切除，就能預防大腸癌",
      "<defs>" + wallDefs(k) + "</defs>" +
      '<rect x="10" y="30" width="400" height="' + (Y0 - 30) + '" rx="10" fill="#141a46" opacity=".55"/>' + txt(30, 50, "腸道內", { anchor: "start", fill: "#8f98d8", size: 11 }) +
      wall(k, 10, 410, Y0, { labels: true }) +
      '<g opacity="0">' + show(1.4) + s2 + "</g>" +
      '<g opacity="0">' + show(3) + stalk + "</g>" + removed +
      '<g opacity="0">' + show(4.6) + s4 + "</g>" + scope +
      lbl(66, "正常黏膜", .3) + lbl(150, "小息肉", 1.4) + lbl(250, "變大的腺瘤", 3) + lbl(350, "癌往深處侵犯", 4.6, "#ff9b8a") +
      '<path d="M40 280 H 384" stroke="#d9dcf5" stroke-width="1.6"/><path d="M392 280 l -10 -5 v 10 z" fill="#d9dcf5"/>' +
      txt(212, 297, "從息肉變成癌，通常要好幾年，甚至十年以上", { fill: "#d9dcf5", size: 12 }) +
      phase(210, 18, "1. 正常的大腸黏膜", 0, 1.4 / D, D) + phase(210, 18, "2. 長出小息肉", 1.4 / D, 3 / D, D) +
      phase(210, 18, "3. 息肉慢慢變大，成為腺瘤", 3 / D, 4.6 / D, D) + phase(210, 18, "4. 部分腺瘤變成癌，往腸壁深處侵犯", 4.6 / D, 6.4 / D, D, { fill: "#ff9b8a" }) +
      phase(210, 18, "5. 在息肉階段用大腸鏡切除，就能預防大腸癌", 6.4 / D, .97, D, { fill: "#7fdcaa" }), "polyp-fig");
  };

  /* ---------- 3. 分期：腫瘤長多深、有沒有到淋巴結或其他器官 ----------
     由 widgets.js 的 stagemap 設定 data-stage（0–4），CSS 控制顯示。 */
  F.crcStage = function () {
    var k = "cs", Y0 = 64;
    var bump = function (x, w, h) { return "M" + (x - w) + " " + (Y0 + 2) + " C " + (x - w) + " " + (Y0 - h) + " " + (x + w) + " " + (Y0 - h) + " " + (x + w) + " " + (Y0 + 2); };
    var tum =
      '<path class="td td0" d="' + bump(118, 18, 18) + ' L 134 84 C 124 90 112 90 102 84 Z" fill="url(#' + k + '-t)" stroke="#ffd0c4"/>' +
      '<path class="td td1" d="' + bump(118, 26, 26) + ' L 142 120 C 140 140 130 150 120 146 C 110 152 98 142 96 124 Z" fill="url(#' + k + '-t)" stroke="#ffd0c4"/>' +
      '<path class="td td2" d="' + bump(118, 34, 34) + ' L 152 150 C 158 170 152 186 146 192 C 140 204 128 204 122 196 C 114 206 100 204 96 192 C 86 186 82 168 86 150 Z" fill="url(#' + k + '-t)" stroke="#ffd0c4"/>' +
      '<ellipse class="td td1" cx="118" cy="' + (Y0 - 14) + '" rx="10" ry="4" fill="#5a1e2e" opacity=".7"/><ellipse class="td td2" cx="118" cy="' + (Y0 - 20) + '" rx="14" ry="5" fill="#5a1e2e" opacity=".75"/>';
    var nodes =
      '<g class="lv" fill="none" stroke="#aab1ff" stroke-width="1.5" stroke-dasharray="3 4"><path d="M100 196 C 80 210 66 220 54 232"/><path d="M120 200 V 236"/><path d="M142 192 C 160 206 172 214 182 226"/></g>' +
      [[52, 238], [120, 246], [184, 232]].map(function (n) { return '<path class="cnode" d="M' + (n[0] - 11) + " " + n[1] + " C " + (n[0] - 11) + " " + (n[1] - 9) + " " + (n[0] + 11) + " " + (n[1] - 9) + " " + (n[0] + 11) + " " + n[1] + " C " + (n[0] + 11) + " " + (n[1] + 8) + " " + n[0] + " " + (n[1] + 4) + " " + (n[0]) + " " + (n[1] + 6) + " C " + (n[0] - 4) + " " + (n[1] + 9) + " " + (n[0] - 11) + " " + (n[1] + 7) + " " + (n[0] - 11) + " " + n[1] + ' Z"/>'; }).join("") +
      txt(120, 276, "附近淋巴結", { cls: "cnode-l", size: 12, weight: 700 });
    // 右側小人形：肺、肝、大腸、腹膜
    var bx = 312;
    var fig = '<circle cx="' + bx + '" cy="30" r="15" fill="#2b3483" stroke="#5b66b8"/>' +
      '<path d="M' + (bx - 30) + " 54 C " + (bx - 16) + " 48 " + (bx + 16) + " 48 " + (bx + 30) + " 54 C " + (bx + 42) + " 62 " + (bx + 46) + " 84 " + (bx + 46) + " 112 L " + (bx + 42) + " 252 H " + (bx - 42) + " L " + (bx - 46) + " 112 C " + (bx - 46) + " 84 " + (bx - 42) + ' 62 ' + (bx - 30) + ' 54 Z" fill="#2b3483" stroke="#5b66b8"/>' +
      '<path d="M' + (bx - 4) + " 66 C " + (bx - 30) + " 64 " + (bx - 34) + " 100 " + (bx - 28) + " 116 C " + (bx - 20) + " 120 " + (bx - 8) + " 116 " + (bx - 6) + ' 100 Z" fill="#e9a8b8" opacity=".42"/>' +
      '<path d="M' + (bx + 4) + " 66 C " + (bx + 30) + " 64 " + (bx + 34) + " 100 " + (bx + 28) + " 116 C " + (bx + 20) + " 120 " + (bx + 8) + " 116 " + (bx + 6) + ' 100 Z" fill="#e9a8b8" opacity=".42"/>' +
      '<path d="M' + (bx - 36) + " 132 C " + (bx - 20) + " 120 " + (bx + 10) + " 122 " + (bx + 14) + " 136 C " + (bx + 10) + " 150 " + (bx - 20) + " 156 " + (bx - 32) + ' 148 Z" fill="#a8574f" opacity=".75"/>' +
      '<path d="M' + (bx - 24) + " 228 V 178 C " + (bx - 24) + " 170 " + (bx + 24) + " 170 " + (bx + 24) + " 178 V 228" + '" fill="none" stroke="#e39bb0" stroke-width="7" stroke-opacity=".55" stroke-linecap="round"/>';
    var mets = [
      { x: bx - 18, y: 92, l: "肺臟", lx: bx + 52, ly: 92 },
      { x: bx - 12, y: 140, l: "肝臟", lx: bx + 52, ly: 140 },
      { x: bx + 4, y: 206, l: "腹膜", lx: bx + 52, ly: 206 }
    ].map(function (o, i) {
      return '<g class="cmet" style="transition-delay:' + (i * .15) + 's"><path class="met-path" d="M152 150 Q ' + (226 + i * 8) + " " + (o.y - 46) + " " + o.x + " " + o.y + '" fill="none" stroke="#ff8f7a" stroke-width="1.6" stroke-dasharray="4 5"/>' +
        '<circle cx="' + o.x + '" cy="' + o.y + '" r="7" fill="url(#' + k + '-t)" stroke="#ffd0c4"/>' + '<path d="M' + (o.x + 9) + " " + o.y + " H" + (o.lx - 4) + '" stroke="#ff8f7a" stroke-width="1"/>' +
        txt(o.lx, o.ly + 4, o.l, { anchor: "start", fill: "#ff8f7a", weight: 700, size: 12.5 }) + "</g>";
    }).join("");
    return svg("0 0 400 290", "大腸直腸癌分期示意：腫瘤往腸壁深處長的程度、附近淋巴結，以及肝臟、肺臟、腹膜等遠處轉移",
      "<defs>" + wallDefs(k) + "</defs>" +
      '<rect x="16" y="16" width="204" height="' + (Y0 - 16) + '" rx="8" fill="#141a46" opacity=".55"/>' + txt(196, 34, "腸道內", { anchor: "end", fill: "#8f98d8", size: 11 }) +
      wall(k, 16, 220, Y0, { labels: true, fat: 112 }) + nodes + tum +
      '<path d="M226 ' + (Y0 + 4) + " V " + (Y0 + 104) + '" stroke="#d9dcf5" stroke-width="1.4"/><path d="M226 ' + (Y0 + 110) + ' l -4 -8 h 8 z" fill="#d9dcf5"/>' +
      txt(234, Y0 + 50, "越", { anchor: "start", fill: "#d9dcf5", size: 11 }) + txt(234, Y0 + 64, "深", { anchor: "start", fill: "#d9dcf5", size: 11 }) +
      fig + mets, "stagemap crcst");
  };

  /* ---------- 4. 手術切除範圍（依腫瘤位置） ----------
     kind：right 右半結腸、left 左半結腸、sigmoid 乙狀結腸、lar 低位前切除（直腸）、apr 腹會陰切除（直腸）。
     1 找到腫瘤 → 2 連同血管與淋巴結切下 → 3 兩端接起來（需要時做造口）。一循環 9 秒。 */
  var CUT = {
    right: { rem: ["asc", "transA", "cecum", "ileum"], tumor: [111, 190], cuts: [[178, 214], [200, 138]], link: "M178 214 C 196 192 202 162 200 140", label: "右半結腸切除：小腸接到橫結腸" },
    left: { rem: ["transB", "desc"], tumor: [296, 156], cuts: [[200, 138], [292, 222]], link: "M200 138 C 252 150 298 182 292 222", label: "左半結腸切除：橫結腸接到乙狀結腸" },
    sigmoid: { rem: ["sig"], tumor: [252, 270], cuts: [[292, 222], [205, 262]], link: "M292 222 C 286 252 236 264 205 262", label: "乙狀結腸切除：降結腸接到直腸" },
    lar: { rem: ["sig", "rectU"], tumor: [205, 276], cuts: [[292, 222], [205, 286]], link: "M292 222 C 290 270 236 290 205 286", label: "低位前切除：保留肛門，接到剩下的直腸", stoma: { x: 84, y: 214, t: "暫時性", t2: "迴腸造口", tx: 40, ty: 246, via: "M178 214 C 150 206 112 212 84 214" } },
    apr: { rem: ["sig", "rectU", "rectL", "anal"], tumor: [205, 298], cuts: [[292, 222]], link: "M292 222 C 302 238 310 246 318 250", label: "腹會陰切除：直腸和肛門一起切除", stoma: { x: 318, y: 252, t: "永久性", t2: "結腸造口", tx: 360, ty: 284 } }
  };
  F.colonSeg = function (kind) {
    var D = 9, R = CUT[kind], skip = {}, k = "cg" + kind;
    R.rem.forEach(function (s) { skip[s] = 1; });
    var rem = vessels(R.rem) + R.rem.map(seg).join("") +
      '<circle cx="' + R.tumor[0] + '" cy="' + R.tumor[1] + '" r="10" fill="url(#' + k + '-t)" stroke="#ffd0c4"/>';
    var glow = R.rem.filter(function (s) { return SEG[s] && s !== "ileum"; }).map(function (s) {
      return '<path d="' + SEG[s] + '" fill="none" stroke="#f0cf86" stroke-width="40" stroke-linecap="round" stroke-opacity="0">' + anim("stroke-opacity", "0;0;.32;.32;0;0", "0;.12;.18;.42;.5;1", D) + "</path>";
    }).join("");
    var cuts = R.cuts.map(function (c) {
      return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="18" fill="none" stroke="#f0cf86" stroke-width="2.4" stroke-dasharray="4 4" opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;.2;.24;.5;.56;1", D) + "</circle>";
    }).join("");
    // 吻合：用遮罩讓接回去的腸管從一端長到另一端
    var link = '<mask id="' + k + '-lm" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="340"><path d="' + R.link + '" fill="none" stroke="#fff" stroke-width="46" stroke-dasharray="400" stroke-dashoffset="400">' +
      anim("stroke-dashoffset", "400;400;0;0;400", "0;.56;.74;.95;1", D) + "</path></mask>";
    var staples = R.cuts.map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="4" fill="#f0cf86"/>'; }).join("");
    var stoma = "";
    if (R.stoma) {
      var S = R.stoma;
      stoma = '<g opacity="0">' + anim("opacity", "0;0;1;1;0", "0;.74;.8;.95;1", D) +
        (S.via ? '<path d="' + S.via + '" fill="none" stroke="#e7a0b5" stroke-width="7" stroke-dasharray="3 5"/>' : "") +
        '<circle cx="' + S.x + '" cy="' + S.y + '" r="15" fill="#efe3d0" stroke="#c9b79a" stroke-width="2"/><circle cx="' + S.x + '" cy="' + S.y + '" r="10" fill="#e2604e" stroke="#ffd0c4" stroke-width="1.5"/><circle cx="' + (S.x - 3) + '" cy="' + (S.y - 3) + '" r="3" fill="#ffd0c4" opacity=".7"/>' +
        tag(S.tx, S.ty, S.t, { fill: "#7ec8f5", size: 11.5 }) + tag(S.tx, S.ty + 20, S.t2, { fill: "#7ec8f5", size: 11.5 }) + "</g>";
    }
    return svg("0 -40 400 400", "手術切除範圍示意：" + R.label,
      "<defs>" + defs(k) + link + "</defs>" + body(k) + SMALL + colonAll(skip) + glow +
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -12;0 -12;0 0" keyTimes="0;.44;.56;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      anim("opacity", "1;1;0;0;1", "0;.44;.56;.95;1", D) + rem + "</g>" +
      '<g mask="url(#' + k + '-lm)">' + tube(R.link) + "</g>" +
      '<g opacity="0">' + anim("opacity", "0;0;1;1;0", "0;.72;.76;.95;1", D) + staples + "</g>" + cuts + stoma +
      txt(200, -22, R.label, { fill: "#f0cf86", weight: 700, size: 14.5 }) +
      phase(200, 352, "1. 找到腫瘤所在的腸段", 0, .2, D, { fill: "#d9dcf5", size: 13 }) +
      phase(200, 352, "2. 連同血管與淋巴結一起切下", .2, .56, D, { fill: "#d9dcf5", size: 13 }) +
      phase(200, 352, R.stoma ? "3. 接回腸子，並做造口" : "3. 把兩端接起來（吻合）", .56, .97, D, { fill: "#d9dcf5", size: 13 }), "seg-fig");
  };

  /* ---------- 5. 造口 ----------
     kind：colo 結腸造口（多在左下腹）、ileo 迴腸造口（多在右下腹）。排出物沿腸道走到造口，流進兩件式造口袋。
     角落放大圖：健康的造口，以及底座的洞比造口大 2–3 毫米。 */
  F.stoma = function (kind) {
    var D = 7, colo = kind === "colo", k = "st" + kind;
    var sx = colo ? 306 : 94, sy = 236;
    var route = colo ? "M116 104 C 140 92 170 146 200 138 C 232 132 262 88 288 96 C 300 140 296 190 292 214 C 294 224 300 230 " + sx + " " + sy
      : "M150 166 C 172 152 232 154 254 168 C 268 182 244 194 200 192 C 158 190 138 202 150 216 C 160 226 140 232 120 234 C 108 235 100 235 " + sx + " " + sy;
    var bowel = colo ? colonAll({ sig: 1, rectU: 1, rectL: 1, anal: 1 }) + tube("M292 214 C 294 224 300 230 " + sx + " " + sy) +
        '<g opacity=".22">' + tube(SEG.sig) + tube(SEG.rectU) + tube(SEG.rectL) + "</g>"
      : '<g opacity=".28">' + colonAll({ ileum: 1 }) + "</g>" + tube(route, { w: .55, plain: true });
    var dots = "";
    for (var i = 0; i < 5; i++) dots += '<circle r="' + (colo ? 4.6 : 3.4) + '" fill="' + (colo ? "#7a4a2a" : "#d8b04e") + '"><animateMotion dur="' + D + 's" begin="' + (-i * D / 5).toFixed(2) + 's" repeatCount="indefinite" path="' + route + '"/></circle>';
    // 兩件式造口袋：底座＋可排放的袋子
    var bx = sx - 34, by = sy - 18;
    var bag = "M" + bx + " " + by + " C " + bx + " " + (by - 12) + " " + (bx + 68) + " " + (by - 12) + " " + (bx + 68) + " " + by + " L " + (bx + 74) + " " + (by + 74) + " C " + (bx + 72) + " " + (by + 88) + " " + (bx + 50) + " " + (by + 92) + " " + (bx + 42) + " " + (by + 92) + " L " + (bx + 26) + " " + (by + 92) + " C " + (bx + 18) + " " + (by + 92) + " " + (bx - 4) + " " + (by + 88) + " " + (bx - 6) + " " + (by + 74) + " Z";
    var fillCol = colo ? "#7a4a2a" : "#d8b04e";
    var pouch = '<clipPath id="' + k + '-p"><path d="' + bag + '"/></clipPath>' +
      '<linearGradient id="' + k + '-bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".28"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#ffffff" stop-opacity=".22"/></linearGradient>';
    var pouchDraw = '<g clip-path="url(#' + k + '-p)"><rect x="' + (bx - 10) + '" y="' + (by + 92) + '" width="100" height="100" fill="' + fillCol + '" opacity=".8">' +
      '<animate attributeName="y" values="' + (by + 92) + ";" + (by + 52) + ";" + (by + 92) + '" dur="' + (D * 2) + 's" repeatCount="indefinite"/></rect></g>' +
      '<path d="' + bag + '" fill="url(#' + k + '-bg)" stroke="#e6e9ff" stroke-opacity=".8" stroke-width="2"/>' +
      '<rect x="' + (bx + 22) + '" y="' + (by + 90) + '" width="24" height="8" rx="3" fill="#9fa7d8"/>' +
      '<circle cx="' + sx + '" cy="' + sy + '" r="20" fill="#efe3d0" stroke="#c9b79a" stroke-width="2.5"/><circle cx="' + sx + '" cy="' + sy + '" r="15" fill="none" stroke="#b8a888" stroke-width="1.5" stroke-dasharray="2 3"/>' +
      '<circle cx="' + sx + '" cy="' + sy + '" r="11" fill="#e2604e" stroke="#ffd0c4" stroke-width="1.5"/><circle cx="' + (sx - 3) + '" cy="' + (sy - 3) + '" r="3.2" fill="#ffd0c4" opacity=".7"/>';
    // 放大圖
    var ix = colo ? 22 : 378, iy = 70;
    var inset = '<g transform="translate(' + ix + " " + iy + ')"><circle r="46" fill="#141a46" stroke="#f0cf86" stroke-width="1.6"/>' +
      '<circle r="38" fill="#c9a58c"/><circle r="27" fill="#efe3d0" stroke="#c9b79a" stroke-width="2"/>' +
      '<circle r="19" fill="#d94e44"/><path d="M-14 -6 C -8 -14 8 -14 14 -6 M-15 4 C -8 12 8 12 15 4" stroke="#ff9b8a" stroke-width="2" fill="none" opacity=".8"/>' +
      '<ellipse cx="-6" cy="-8" rx="6" ry="3.5" fill="#ffd0c4" opacity=".75"/><circle r="4" fill="#7a2030"/>' +
      '<path d="M19 0 H 27" stroke="#f0cf86" stroke-width="1.5"/><path d="M19 -3 V 3 M27 -3 V 3" stroke="#f0cf86" stroke-width="1.5"/></g>' +
      txt(ix, iy + 64, "健康的造口", { fill: "#f0cf86", size: 12, weight: 700 }) + txt(ix, iy + 80, "紅潤、濕潤", { fill: "#f0cf86", size: 11.5 }) +
      txt(ix, iy + 98, "底座的洞比造口", { fill: "#d9dcf5", size: 11 }) + txt(ix, iy + 112, "大 2–3 毫米", { fill: "#d9dcf5", size: 11 });
    return svg("-30 -24 460 370", colo ? "結腸造口示意：大腸接到左下腹的造口，糞便流進造口袋" : "迴腸造口示意：小腸接到右下腹的造口，排出物較稀，流進造口袋",
      "<defs>" + defs(k) + pouch + "</defs>" + body(k) + (colo ? SMALL : "") + bowel + dots + pouchDraw + inset +
      tag(sx, by + 118, "兩件式造口袋", { size: 11.5 }) +
      txt(200, -6, colo ? "結腸造口：多在左下腹，排出物較成形" : "迴腸造口：多在右下腹，排出物較稀、量較多", { fill: "#f0cf86", size: 14.5, weight: 700 }), "stoma-fig");
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
