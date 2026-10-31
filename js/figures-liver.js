/* 肝癌專屬圖解：肝臟構造與血流、肝炎到肝癌、分期示意（腫瘤＋肝功能）、抗病毒治療、
   局部治療（手術切除、肝臟移植、電燒微波、經動脈栓塞、釔90）、肝硬化警訊全身圖。掛在 window.Figures 底下。
   肝臟用共用的 liverArt() 畫：漸層、小葉紋理、血管樹、肝炎／纖維化／肝硬化的外觀、腫瘤。 */
(function (F) {
  "use strict";
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 13) + '" fill="' + (o.fill || "#b3b9dc") + '" text-anchor="' + (o.anchor || "middle") + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") + ">" + s + "</text>"; }
  function svg(vb, label, body, cls) { return '<svg class="anim ' + (cls || "") + '" viewBox="' + vb + '" role="img" aria-label="' + label + '">' + body + "</svg>"; }
  function tag(x, y, s, o) {
    o = o || {};
    var size = o.size || 12, w = s.length * size + 14, a = o.anchor || "middle";
    var x0 = a === "start" ? x : a === "end" ? x - w : x - w / 2;
    return '<g' + (o.cls ? ' class="' + o.cls + '"' : "") + '><rect x="' + x0.toFixed(1) + '" y="' + (y - size - 3) + '" width="' + w + '" height="' + (size + 9) + '" rx="' + ((size + 9) / 2) + '" fill="#0e1236" fill-opacity=".82" stroke="' + (o.stroke || "#3a4382") + '"/>' +
      txt(x0 + w / 2, y + 1, s, { size: size, fill: o.fill || "#e6e9ff", weight: 700 }) + "</g>";
  }
  // 引線標籤：從 (x1,y1) 指向 (x2,y2)，標籤在 (x2,y2)
  function callout(x1, y1, x2, y2, s, o) {
    o = o || {};
    return '<path d="M' + x1 + " " + y1 + " L " + x2 + " " + y2 + '" stroke="' + (o.line || "#d9dcf5") + '" stroke-width="1" stroke-opacity=".7"/><circle cx="' + x1 + '" cy="' + y1 + '" r="2.4" fill="' + (o.line || "#d9dcf5") + '"/>' +
      tag(x2, y2 + 4, s, { anchor: o.anchor || "middle", size: o.size || 11.5, fill: o.fill });
  }
  function anim(attr, values, keyTimes, dur) { return '<animate attributeName="' + attr + '" values="' + values + '" keyTimes="' + keyTimes + '" dur="' + dur + 's" repeatCount="indefinite"/>'; }
  function phase(x, y, s, a, b, dur, o) {
    o = o || {};
    return '<g opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;" + a.toFixed(3) + ";" + (a + .02).toFixed(3) + ";" + (b - .02).toFixed(3) + ";" + b.toFixed(3) + ";1", dur) +
      txt(x, y, s, { fill: o.fill || "#f0cf86", size: o.size || 13.5, weight: 700 }) + "</g>";
  }
  function show(t, D, out) {
    var a = t / D, o = out ? out / D : .95;
    return anim("opacity", "0;0;1;1;0;0", "0;" + a.toFixed(3) + ";" + Math.min(o - .01, a + .04).toFixed(3) + ";" + o.toFixed(3) + ";" + Math.min(.99, o + .04).toFixed(3) + ";1", D);
  }

  /* ---------- 共用：肝臟 ---------- */
  // 400×250 的座標：畫面左邊是病人的右邊（右葉大），左葉往右變尖；(208,196) 附近是膽囊窩
  var LIVER = "M40 118 C 34 78 62 44 118 34 C 170 25 238 30 300 44 C 340 53 372 62 384 76 C 392 86 386 98 368 104 C 338 114 306 120 282 132 C 262 142 250 156 240 172 C 232 186 226 196 214 202 L 208 196 C 202 204 192 212 176 218 C 150 228 112 232 86 222 C 58 210 44 170 40 118 Z";
  var GB = "M190 198 C 178 214 180 242 196 246 C 214 248 218 222 208 200 Z";
  var STATE = {
    ok: ["#d77c6c", "#a8484e", "#6d2a3a", "#f2b0a2"],
    hep: ["#e8735e", "#b93a40", "#7a2234", "#ffb6a0"],
    fib: ["#cf8670", "#a0544e", "#6a3236", "#ecc0a8"],
    cir: ["#c99a70", "#9e6a4c", "#674032", "#e8c8a8"]
  };
  function liverDefs(k) {
    var s = "";
    Object.keys(STATE).forEach(function (st) {
      var c = STATE[st];
      s += '<linearGradient id="' + k + "-" + st + '" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></linearGradient>';
    });
    return s +
      '<radialGradient id="' + k + '-shine" cx="32%" cy="22%" r="55%"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + k + '-under" cx="50%" cy="100%" r="70%"><stop offset="0" stop-color="#1a0814" stop-opacity=".55"/><stop offset="1" stop-color="#1a0814" stop-opacity="0"/></radialGradient>' +
      '<pattern id="' + k + '-lob" width="16" height="14" patternUnits="userSpaceOnUse"><path d="M4 0 L12 0 L16 7 L12 14 L4 14 L0 7 Z" fill="none" stroke="#2a0d18" stroke-opacity=".13" stroke-width="1"/><circle cx="8" cy="7" r="1.1" fill="#2a0d18" fill-opacity=".14"/></pattern>' +
      '<pattern id="' + k + '-spk" width="11" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r="1.1" fill="#ff4a3a" fill-opacity=".75"/><circle cx="7.5" cy="7" r=".9" fill="#ff7a5a" fill-opacity=".7"/><circle cx="9" cy="1.5" r=".6" fill="#fff" fill-opacity=".35"/></pattern>' +
      '<radialGradient id="' + k + '-nod" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#f0d0a8"/><stop offset=".75" stop-color="#b98260" stop-opacity=".5"/><stop offset="1" stop-color="#7a4a36" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + k + '-t" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#fff4cc"/><stop offset=".5" stop-color="#ecc070"/><stop offset="1" stop-color="#b47a2c"/></radialGradient>' +
      '<linearGradient id="' + k + '-gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a8e08a"/><stop offset="1" stop-color="#4f8a3c"/></linearGradient>' +
      '<clipPath id="' + k + '-clip"><path d="' + LIVER + '"/></clipPath>';
  }
  // 血管樹：主幹（二次曲線）＋沿途的小分支
  function tree(mains, color, w, op) {
    var s = "";
    mains.forEach(function (m, mi) {
      var x0 = m[0], y0 = m[1], cx = m[2], cy = m[3], x1 = m[4], y1 = m[5];
      s += '<path d="M' + x0 + " " + y0 + " Q " + cx + " " + cy + " " + x1 + " " + y1 + '" stroke-width="' + w + '"/>';
      [.32, .55, .76].forEach(function (t, i) {
        var px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1, py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
        var dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy), L = Math.sqrt(dx * dx + dy * dy) || 1;
        var side = (i + mi) % 2 ? 1 : -1, ang = side * .7, ux = dx / L, uy = dy / L;
        var rx = ux * Math.cos(ang) - uy * Math.sin(ang), ry = ux * Math.sin(ang) + uy * Math.cos(ang), len = 26 - i * 5;
        s += '<path d="M' + px.toFixed(1) + " " + py.toFixed(1) + " q " + (rx * len * .5 + ry * 3).toFixed(1) + " " + (ry * len * .5 - rx * 3).toFixed(1) + " " + (rx * len).toFixed(1) + " " + (ry * len).toFixed(1) + '" stroke-width="' + (w * .55).toFixed(1) + '"/>';
      });
    });
    return '<g fill="none" stroke="' + color + '" stroke-opacity="' + (op || .5) + '" stroke-linecap="round">' + s + "</g>";
  }
  var PORTAL = [[236, 178, 160, 168, 76, 150], [236, 178, 170, 120, 112, 70], [236, 178, 210, 130, 190, 92], [236, 178, 290, 130, 352, 88]];
  var HEPV = [[292, 34, 210, 50, 110, 104], [292, 34, 250, 70, 210, 120], [292, 34, 330, 52, 362, 78]];
  var ART = [[240, 182, 166, 176, 90, 168], [240, 182, 180, 130, 130, 84], [240, 182, 296, 142, 340, 104]];
  // 肝臟本體。o.state：ok／hep／fib／cir；o.vessels：畫血管；o.tumors：[[x,y,r],...]；o.gb：膽囊；o.pulse：肝炎發炎閃動
  function liverArt(k, o) {
    o = o || {};
    var st = o.state || "ok", c = STATE[st], s = "";
    s += '<path d="' + LIVER + '" fill="#120818" opacity=".4" transform="translate(5 8)"/>';
    if (o.gb !== false) s += '<path d="' + GB + '" fill="url(#' + k + '-gb)" stroke="#d8f5c0" stroke-width="1.4"/><ellipse cx="196" cy="222" rx="4" ry="9" fill="#f0ffe0" opacity=".45"/>';
    s += '<path d="' + LIVER + '" fill="url(#' + k + "-" + st + ')"/>';
    s += '<g clip-path="url(#' + k + '-clip)">';
    s += '<rect x="20" y="20" width="380" height="220" fill="url(#' + k + '-lob)"/>';
    if (o.vessels !== false) s += tree(PORTAL, "#8f9cf0", 5, .45) + tree(HEPV, "#5a64c8", 4.5, .4) + (o.art ? tree(ART, "#ff8f7a", 1.8, .6) : "");
    if (st === "hep") s += '<rect x="20" y="20" width="380" height="220" fill="url(#' + k + '-spk)"/>' +
      '<path d="' + LIVER + '" fill="#ff3a2a" opacity=".12">' + (o.pulse ? '<animate attributeName="opacity" values=".06;.22;.06" dur="2.2s" repeatCount="indefinite"/>' : "") + "</path>";
    if (st === "fib") s += '<g fill="none" stroke="#fff0dc" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round">' +
      '<path d="M50 120 L 96 104 L 150 120 L 196 96 L 250 108 L 300 80 L 360 86"/><path d="M96 104 L 92 60 M150 120 L 140 176 L 100 200 M196 96 L 206 60 M250 108 L 236 150 L 200 180 M300 80 L 296 120"/>' +
      '<path d="M60 170 L 100 150 L 140 176 M236 150 L 270 130" stroke-opacity=".4"/></g>';
    if (st === "cir") {
      // 肝硬化：柔和的大結節與淡淡的纖維紋路（避免密集的小圓點造成不適感）
      var n = "";
      for (var yy = 52; yy < 236; yy += 34) for (var xx = 56 + ((yy / 34) % 2) * 17; xx < 392; xx += 34) {
        var r = 15 + ((xx * 7 + yy * 3) % 5);
        n += '<circle cx="' + (xx + ((xx * yy) % 7) - 3) + '" cy="' + (yy + ((xx + yy) % 5) - 2) + '" r="' + r + '" fill="url(#' + k + '-nod)" fill-opacity=".38"/>';
      }
      s += n + '<g fill="none" stroke="#f3dcc0" stroke-opacity=".28" stroke-width="1.6" stroke-linecap="round"><path d="M50 120 L 96 104 L 150 120 L 196 96 L 250 108 L 300 80 L 360 86"/><path d="M96 104 L 92 60 M150 120 L 140 176 L 100 200 M196 96 L 206 60 M250 108 L 236 150 L 200 180 M300 80 L 296 120"/></g>';
    }
    s += '<path d="' + LIVER + '" fill="url(#' + k + '-shine)"/><path d="' + LIVER + '" fill="url(#' + k + '-under)"/>';
    (o.tumors || []).forEach(function (t) { s += tumor(k, t[0], t[1], t[2], o.feed); });
    s += "</g>";
    // 鐮狀韌帶、邊緣
    s += '<path d="M262 30 C 258 70 262 110 276 136" fill="none" stroke="#3a1420" stroke-opacity=".45" stroke-width="2"/>';
    if (st === "cir") s += '<path d="' + LIVER + '" fill="none" stroke="' + c[1] + '" stroke-width="6" stroke-dasharray=".1 24" stroke-linecap="round"/>';
    s += '<path d="' + LIVER + '" fill="none" stroke="' + c[3] + '" stroke-width="1.8" stroke-opacity=".9"/>';
    s += '<path d="M78 58 C 130 38 210 36 290 50" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="6" stroke-linecap="round"/>';
    return s;
  }
  // 肝癌腫瘤：有包膜的結節，周圍有供應的小動脈（肝癌血流豐富）
  function tumor(k, x, y, r, feed) {
    var s = "";
    if (feed !== false) s += '<g fill="none" stroke="#ff6a5a" stroke-width="1.4" stroke-opacity=".85" stroke-linecap="round">' +
      '<path d="M' + (x - r * 2.1) + " " + (y + r * 1.2) + " Q " + (x - r * 1.3) + " " + (y + r * .4) + " " + (x - r * .8) + " " + (y + r * .2) + '"/>' +
      '<path d="M' + (x + r * .4) + " " + (y + r * 2.2) + " Q " + (x + r * .2) + " " + (y + r * 1.4) + " " + (x + r * .1) + " " + (y + r * .9) + '"/>' +
      '<path d="M' + (x + r * 2) + " " + (y - r * .2) + " Q " + (x + r * 1.4) + " " + (y - r * .1) + " " + (x + r * .9) + " " + (y) + '"/></g>';
    s += '<circle cx="' + x + '" cy="' + (y + r * .12) + '" r="' + r + '" fill="#3a1a10" opacity=".35"/>';
    s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + k + '-t)" stroke="#fff3d6" stroke-width="' + Math.max(1, r / 9).toFixed(1) + '"/>';
    if (r > 10) s += '<path d="M' + (x - r * .5) + " " + (y - r * .1) + " Q " + x + " " + (y + r * .35) + " " + (x + r * .5) + " " + (y - r * .15) + " M" + (x - r * .1) + " " + (y - r * .6) + " Q " + (x + r * .05) + " " + y + " " + (x - r * .15) + " " + (y + r * .55) + '" fill="none" stroke="#b47a2c" stroke-opacity=".45" stroke-width="1.2"/>';
    s += '<ellipse cx="' + (x - r * .35) + '" cy="' + (y - r * .4) + '" rx="' + (r * .35) + '" ry="' + (r * .2) + '" fill="#fff" opacity=".45"/>';
    return s;
  }
  function wrap(k, inner, tx, ty, sc) { return '<g transform="translate(' + tx + " " + ty + ") scale(" + sc + ')">' + inner + "</g>"; }

  /* ---------- 1. 肝臟的構造與工作 ----------
     肝臟、膽囊、下腔靜脈、門靜脈、肝動脈、膽管與十二指腸；血流與膽汁流動；右側四張「肝臟的工作」卡片輪流亮起。一循環 8 秒。 */
  F.liver = function () {
    var D = 8, k = "lvA";
    var PVT = "M262 300 C 258 260 246 214 236 180", HAT = "M300 300 C 300 260 276 214 242 184", CBD = "M226 186 C 220 214 214 246 206 278";
    var IVC = "M292 -18 L 292 36";
    var outside =
      // 十二指腸、胃（淡）
      '<path d="M180 262 C 150 272 150 304 186 310 C 226 316 262 304 276 288" fill="none" stroke="#e6a0b5" stroke-opacity=".35" stroke-width="16" stroke-linecap="round"/>' +
      txt(160, 324, "十二指腸", { fill: "#e6a0b5", size: 10.5 }) +
      '<path d="M300 116 C 340 110 380 130 384 170 C 386 206 350 222 316 210 C 296 202 290 176 296 150 Z" fill="#c9a36b" opacity=".18"/>' + txt(344, 186, "胃", { fill: "#e8d3a8", size: 11 }) +
      // 下腔靜脈
      '<path d="' + IVC + '" stroke="#3a46a8" stroke-width="20" stroke-linecap="round"/><path d="' + IVC + '" stroke="#5a64c8" stroke-width="14" stroke-linecap="round"/>' +
      // 門靜脈、肝動脈、膽管
      '<path d="M380 280 C 330 282 290 284 262 300" fill="none" stroke="#5f6fc8" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="' + PVT + '" stroke="#4b59b8" stroke-width="18" stroke-linecap="round" fill="none"/><path d="' + PVT + '" stroke="#8f9cf0" stroke-width="12" stroke-linecap="round" fill="none"/><path d="' + PVT + '" stroke="#d6dcff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round" fill="none" transform="translate(-3 0)"/>' +
      '<path d="' + HAT + '" stroke="#a83a3a" stroke-width="8" stroke-linecap="round" fill="none"/><path d="' + HAT + '" stroke="#ff8f7a" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
      '<path d="' + CBD + '" stroke="#3f7a32" stroke-width="7" stroke-linecap="round" fill="none"/><path d="' + CBD + '" stroke="#a6e07f" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
      '<path d="M200 214 C 210 210 218 200 224 192" stroke="#a6e07f" stroke-width="3" fill="none"/>';
    var flow = "";
    for (var i = 0; i < 4; i++) {
      var b = (-i * D / 8).toFixed(2) + "s";
      flow += '<circle r="3.6" fill="#c8d0ff"><animateMotion dur="2.6s" begin="' + b + '" repeatCount="indefinite" path="' + PVT + ' C 200 170 140 160 90 150"/></circle>' +
        '<circle r="2.6" fill="#ffc0a8"><animateMotion dur="2.2s" begin="' + b + '" repeatCount="indefinite" path="' + HAT + ' C 210 170 150 120 120 90"/></circle>' +
        '<circle r="3" fill="#8f9cf0"><animateMotion dur="2.8s" begin="' + b + '" repeatCount="indefinite" path="M110 104 Q 210 50 292 34 L 292 -18"/></circle>' +
        '<circle r="2.6" fill="#c8f5a8"><animateMotion dur="3s" begin="' + b + '" repeatCount="indefinite" path="' + CBD + '"/></circle>';
    }
    var jobs = [["營養", "轉換、儲存養分", "#f0cf86"], ["解毒", "分解藥物、酒精、毒素", "#7fdcaa"], ["膽汁", "幫助消化油脂", "#a6e07f"], ["凝血、白蛋白", "止血、維持體內水分", "#ff9b8a"]];
    var cards = jobs.map(function (j, i) {
      var y = 40 + i * 66, a = (i / 4).toFixed(3), b2 = ((i + 1) / 4).toFixed(3);
      return '<g><rect x="430" y="' + y + '" width="160" height="56" rx="12" fill="#141a46" stroke="' + j[2] + '" stroke-opacity=".35"/>' +
        '<rect x="430" y="' + y + '" width="160" height="56" rx="12" fill="' + j[2] + '" fill-opacity="0">' + anim("fill-opacity", "0;0;.14;.14;0;0", "0;" + a + ";" + (+a + .02).toFixed(3) + ";" + (b2 - .02).toFixed(3) + ";" + b2 + ";1", D) + "</rect>" +
        '<circle cx="452" cy="' + (y + 28) + '" r="12" fill="' + j[2] + '" fill-opacity=".2" stroke="' + j[2] + '"/>' + txt(452, y + 32, String(i + 1), { fill: j[2], size: 12, weight: 700 }) +
        txt(472, y + 24, j[0], { anchor: "start", fill: "#eef0fb", size: 13.5, weight: 700 }) + txt(472, y + 43, j[1], { anchor: "start", fill: "#b3b9dc", size: 10.5 }) + "</g>";
    }).join("");
    return svg("0 -34 600 370", "肝臟構造示意：門靜脈從腸道送養分進肝臟，肝動脈送氧氣，血液經肝靜脈流回下腔靜脈，膽汁經膽管流向膽囊與十二指腸；肝臟負責營養代謝、解毒、製造膽汁與凝血因子",
      "<defs>" + liverDefs(k) + "</defs>" + outside + liverArt(k, { art: true }) + flow +
      tag(118, 132, "右葉", { size: 13 }) + tag(326, 84, "左葉", { size: 13 }) +
      callout(196, 236, 120, 262, "膽囊", { fill: "#a6e07f" }) +
      callout(292, -6, 210, -14, "下腔靜脈：血液流回心臟", { anchor: "end", fill: "#aab8ff" }) +
      callout(258, 280, 300, 336, "門靜脈：從腸道送來養分", { fill: "#c8d0ff", anchor: "start" }) +
      callout(298, 270, 330, 304, "肝動脈：送來氧氣", { fill: "#ffb199", anchor: "start" }) +
      callout(212, 258, 120, 296, "膽管", { fill: "#a6e07f" }) +
      txt(510, 22, "肝臟的四項工作", { fill: "#f0cf86", size: 14, weight: 700 }) + cards, "liver-fig");
  };

  /* ---------- 2. 從肝炎到肝癌 ----------
     五個階段的肝臟放在卡片裡：健康 → 慢性肝炎（整個肝瀰漫性發炎、腫脹，周圍有病毒） → 纖維化（白色疤痕） → 肝硬化（表面結節、縮小） → 肝癌。一循環 12 秒。 */
  F.hepProg = function () {
    var D = 12, k = "lvP", S = .29, W = 128, X0 = 8;
    var st = [
      { s: "ok", t: "健康的肝", d: "表面平滑、紅潤", c: "#d9dcf5" },
      { s: "hep", t: "慢性肝炎", d: "整個肝長期發炎、腫脹", c: "#ff9b8a" },
      { s: "fib", t: "肝纖維化", d: "留下白色的疤痕", c: "#f0cf86" },
      { s: "cir", t: "肝硬化", d: "變硬、縮小、表面凹凸", c: "#e8a86a" },
      { s: "cir", t: "肝癌", d: "在受傷的肝上長出腫瘤", c: "#ff8f7a", tum: true }
    ];
    function virus(x, y, r) {
      var sp = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; sp += '<path d="M' + (x + Math.cos(a) * r).toFixed(1) + " " + (y + Math.sin(a) * r).toFixed(1) + " L " + (x + Math.cos(a) * r * 1.6).toFixed(1) + " " + (y + Math.sin(a) * r * 1.6).toFixed(1) + '" stroke="#ff9b8a" stroke-width="1.2"/><circle cx="' + (x + Math.cos(a) * r * 1.7).toFixed(1) + '" cy="' + (y + Math.sin(a) * r * 1.7).toFixed(1) + '" r="1.3" fill="#ffd0c4"/>'; }
      return '<g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#c2485a" stroke="#ffd0c4" stroke-width="1"/>' + sp + "</g>";
    }
    var body = "";
    st.forEach(function (o, i) {
      var cx = X0 + i * W + W / 2, t = .3 + i * 1.7, sc = o.s === "cir" ? S * .9 : (o.s === "hep" ? S * 1.04 : S);
      var inner = liverArt(k, { state: o.s, gb: false, vessels: o.s === "ok" || o.s === "hep", pulse: o.s === "hep", tumors: o.tum ? [[150, 118, 34]] : [], feed: true });
      var extra = "";
      if (o.s === "hep") extra = '<g opacity=".95">' + virus(cx - 46, 46, 4) + virus(cx + 48, 54, 3.5) + virus(cx - 30, 128, 3) + virus(cx + 40, 124, 3.6) + "</g>" +
        '<g fill="none" stroke="#ff6a5a" stroke-opacity=".7" stroke-width="1.6"><path d="M' + (cx - 54) + ' 92 q -6 -6 0 -12"><animate attributeName="opacity" values=".2;1;.2" dur="1.4s" repeatCount="indefinite"/></path><path d="M' + (cx + 56) + ' 92 q 6 -6 0 -12"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></path></g>';
      if (o.tum) extra = '<circle cx="' + (cx - 18) + '" cy="88" r="16" fill="none" stroke="#ff8f7a" stroke-width="2"><animate attributeName="r" values="12;22;12" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/></circle>';
      body += '<g opacity="0">' + show(t, D) +
        '<rect x="' + (X0 + i * W + 4) + '" y="30" width="' + (W - 8) + '" height="150" rx="14" fill="#141a46" stroke="' + o.c + '" stroke-opacity=".35"/>' +
        wrap(k, inner, (cx - 212 * sc).toFixed(1), (o.s === "cir" ? 58 : 52), sc) + extra +
        txt(cx, 154, o.t, { fill: o.c, size: 14, weight: 700 }) + txt(cx, 171, o.d, { fill: "#b3b9dc", size: 10.5 }) +
        (i ? '<path d="M' + (X0 + i * W - 6) + ' 104 l 10 0" stroke="#f0cf86" stroke-width="2.4"/><path d="M' + (X0 + i * W) + ' 99 l 6 5 -6 5" fill="none" stroke="#f0cf86" stroke-width="2.4"/>' : "") + "</g>";
    });
    var causes = '<g opacity="0">' + show(2, D) + tag(X0 + W * 1.5, 204, "B 肝、C 肝、喝酒、脂肪肝 → 長期發炎", { fill: "#ffb199", size: 12 }) + "</g>";
    var slow = '<g opacity="0">' + show(9, D) +
      '<path d="M' + (X0 + W * 1 + 10) + ' 222 V 230 H ' + (X0 + W * 4 - 10) + ' V 222" fill="none" stroke="#7fdcaa" stroke-width="2.4"/>' +
      txt(X0 + W * 2.5, 252, "抗病毒治療、戒酒、控制體重，可以讓這條路慢下來，甚至停下來", { fill: "#7fdcaa", size: 14.5, weight: 700 }) + "</g>";
    return svg("0 0 656 264", "從肝炎到肝癌的過程：健康的肝、慢性肝炎、肝纖維化、肝硬化，最後可能發生肝癌；抗病毒治療與戒酒可以讓這個過程變慢",
      "<defs>" + liverDefs(k) + "</defs>" + body + causes + slow +
      phase(328, 18, "肝臟長期發炎，會一步一步受傷", 0, .74, D, { size: 16 }) + phase(328, 18, "好消息：這個過程可以被減緩", .74, .97, D, { fill: "#7fdcaa", size: 16 }), "hepprog-fig");
  };

  /* ---------- 3. 分期示意：腫瘤狀況 × 肝功能 ----------
     tk：t1 單一小腫瘤、t2 早期、t3 多顆局限在肝內、t4 侵犯門靜脈或轉移；fk：A 好、B 中等、C 差。
     下方有肝功能刻度，C 級時畫出腹水與黃疸。 */
  F.liverMini = function (tk, fk) {
    var k = "lvM" + tk + fk, S = .78, st = fk === "A" ? "ok" : "cir";
    var tumors = { t1: [[118, 118, 9]], t2: [[118, 118, 16], [200, 82, 9]], t3: [[100, 104, 17], [168, 150, 13], [226, 96, 15], [134, 176, 10], [300, 88, 10], [184, 66, 9]], t4: [[138, 120, 32], [240, 92, 12]] }[tk];
    var inner = liverArt(k, { state: st, tumors: tumors, art: fk === "A" });
    var pv = '<path d="M256 286 C 254 250 246 214 236 180" stroke="#4b59b8" stroke-width="18" stroke-linecap="round" fill="none"/><path d="M256 286 C 254 250 246 214 236 180" stroke="#8f9cf0" stroke-width="12" stroke-linecap="round" fill="none"/>';
    if (tk === "t4") pv += '<path d="M240 190 C 246 216 252 246 256 270" stroke="url(#' + k + '-t)" stroke-width="10" stroke-linecap="round" fill="none"/>';
    var out = wrap(k, pv + inner + (fk === "C" ? '<path d="' + LIVER + '" fill="#f2d24c" opacity=".2"/>' : ""), (170 - 212 * S).toFixed(1), 22, S);
    if (fk === "C") out += '<path d="M14 120 C 10 190 60 246 170 248 C 280 246 330 190 326 120" fill="none" stroke="#8a94e0" stroke-opacity=".35" stroke-width="2" stroke-dasharray="5 5"/>' +
      '<path d="M26 200 Q 98 192 170 200 T 314 200 C 300 230 250 246 170 246 C 90 246 40 230 26 200 Z" fill="#7ec8f5" opacity=".45"><animate attributeName="d" values="M26 200 Q 98 192 170 200 T 314 200 C 300 230 250 246 170 246 C 90 246 40 230 26 200 Z;M26 200 Q 98 208 170 200 T 314 200 C 300 230 250 246 170 246 C 90 246 40 230 26 200 Z;M26 200 Q 98 192 170 200 T 314 200 C 300 230 250 246 170 246 C 90 246 40 230 26 200 Z" dur="3s" repeatCount="indefinite"/></path>' + tag(84, 230, "腹水", { size: 11, fill: "#7ec8f5" });
    if (tk === "t4") {
      out += '<g fill="none" stroke="#ff8f7a" stroke-width="1.6" stroke-dasharray="4 5"><path class="met-path" d="M110 104 C 76 70 56 50 40 36"/><path class="met-path" d="M210 110 C 250 76 284 52 304 38"/></g>' +
        '<g transform="translate(26 18)"><path d="M10 2 C 2 2 0 14 2 22 C 6 26 12 24 12 18 V 4 Z M16 2 C 24 2 26 14 24 22 C 20 26 14 24 14 18 V 4 Z" fill="#e9a8b8" opacity=".85"/><circle cx="7" cy="14" r="3.5" fill="url(#' + k + '-t)"/></g>' + txt(54, 30, "肺", { fill: "#ff8f7a", size: 11, anchor: "start", weight: 700 }) +
        '<g transform="translate(296 18)"><path d="M4 22 L 18 8" stroke="#e8e0d0" stroke-width="5" stroke-linecap="round"/><circle cx="3" cy="21" r="3.6" fill="#e8e0d0"/><circle cx="6" cy="25" r="3.6" fill="#e8e0d0"/><circle cx="17" cy="5" r="3.6" fill="#e8e0d0"/><circle cx="21" cy="9" r="3.6" fill="#e8e0d0"/><circle cx="11" cy="15" r="3.5" fill="url(#' + k + '-t)"/></g>' + txt(292, 30, "骨頭", { fill: "#ff8f7a", size: 11, anchor: "end", weight: 700 }) +
        tag(228, 204, "腫瘤長進門靜脈", { size: 10.5, fill: "#ffb199", anchor: "start" });
    }
    // 肝功能刻度
    var seg = [["A", "#7fdcaa"], ["B", "#e8c77f"], ["C", "#e2604e"]].map(function (g, i) {
      var on = g[0] === fk;
      return '<rect x="' + (96 + i * 52) + '" y="262" width="48" height="12" rx="6" fill="' + g[1] + '" fill-opacity="' + (on ? 1 : .22) + '"/>' + txt(120 + i * 52, 290, g[0], { fill: on ? g[1] : "#6a72a8", size: 12, weight: 700 });
    }).join("");
    out += txt(84, 272, "肝功能", { anchor: "end", fill: "#d9dcf5", size: 11.5, weight: 700 }) + seg +
      '<path d="M' + ({ A: 120, B: 172, C: 224 }[fk]) + ' 256 l -6 -7 h 12 z" fill="#fff"/>';
    return svg("0 0 340 296", "肝癌分期示意：腫瘤的數量、大小與範圍，以及肝臟本身的功能", "<defs>" + liverDefs(k) + "</defs>" + out, "livermini-fig");
  };

  /* ---------- 4. 抗病毒治療 ----------
     發炎的肝臟周圍有病毒；抗病毒藥物進來後病毒減少，肝臟從發炎的紅色慢慢恢復；右側病毒量長條下降。一循環 9 秒。 */
  F.antiviral = function () {
    var D = 9, k = "lvV";
    var viruses = "";
    [[60, 40], [330, 50], [70, 210], [360, 180], [200, 20], [240, 230], [30, 130], [380, 110]].forEach(function (p, i) {
      viruses += '<g transform="translate(' + p[0] + " " + p[1] + ')"><g>' + anim("opacity", "1;1;0;0;1", "0;" + (.3 + i * .04).toFixed(2) + ";" + (.45 + i * .04).toFixed(2) + ";.95;1", D) +
        '<animateTransform attributeName="transform" type="translate" values="0 0;4 -3;0 0" dur="' + (2 + i * .3).toFixed(1) + 's" repeatCount="indefinite"/>' +
        '<circle r="8" fill="#c2485a" stroke="#ffd0c4"/>' + [0, 1, 2, 3, 4, 5].map(function (j) { var a = j * Math.PI / 3; return '<path d="M' + (Math.cos(a) * 8).toFixed(1) + " " + (Math.sin(a) * 8).toFixed(1) + " L " + (Math.cos(a) * 13).toFixed(1) + " " + (Math.sin(a) * 13).toFixed(1) + '" stroke="#ffb199" stroke-width="2"/>'; }).join("") + "</g></g>";
    });
    var pills = "";
    [[150, 270], [200, 280], [250, 268]].forEach(function (p, i) {
      pills += '<g opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;" + (.2 + i * .03).toFixed(2) + ";" + (.24 + i * .03).toFixed(2) + ";.42;.48;1", D) +
        '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -110;0 -110;0 0" keyTimes="0;' + (.2 + i * .03).toFixed(2) + ";.46;.95;1" + '" dur="' + D + 's" repeatCount="indefinite"/>' +
        '<g transform="translate(' + p[0] + " " + p[1] + ') rotate(-30)"><rect x="-14" y="-6" width="28" height="12" rx="6" fill="#f0f2ff"/><rect x="0" y="-6" width="14" height="12" rx="6" fill="#7fdcaa"/><rect x="0" y="-6" width="4" height="12" fill="#7fdcaa"/></g></g>';
    });
    var bar = '<rect x="440" y="40" width="30" height="190" rx="8" fill="#141a46" stroke="#3a4382"/>' +
      '<rect x="444" y="44" width="22" height="182" rx="5" fill="#e2604e">' + anim("height", "182;182;14;14;182", "0;.3;.62;.95;1", D) + anim("y", "44;44;212;212;44", "0;.3;.62;.95;1", D) + anim("fill", "#e2604e;#e2604e;#7fdcaa;#7fdcaa;#e2604e", "0;.3;.62;.95;1", D) + "</rect>" +
      txt(455, 30, "病毒量", { fill: "#d9dcf5", size: 12, weight: 700 }) + txt(482, 56, "高", { anchor: "start", fill: "#ff8f7a", size: 11 }) + txt(482, 226, "低", { anchor: "start", fill: "#7fdcaa", size: 11 });
    return svg("0 0 520 300", "抗病毒治療示意：發炎的肝臟周圍有許多病毒，服用抗病毒藥物後病毒量下降，肝臟發炎減輕",
      "<defs>" + liverDefs(k) + "</defs>" +
      '<g transform="translate(16 20) scale(.96)">' + liverArt(k, { state: "ok", gb: true }) +
      '<g>' + anim("opacity", "1;1;0;0;1", "0;.35;.7;.95;1", D) + liverArt(k, { state: "hep", gb: true, pulse: true }) + "</g></g>" +
      viruses + pills + bar +
      phase(220, 290, "1. 肝炎病毒讓肝臟持續發炎", 0, .2, D) + phase(220, 290, "2. 每天按時服用抗病毒藥物", .2, .45, D) +
      phase(220, 290, "3. 病毒被壓制，肝臟發炎慢慢減輕", .45, .97, D, { fill: "#7fdcaa" }), "antiviral-fig");
  };

  /* ---------- 5. 局部治療 ---------- */
  // 手術切除：右葉下段的腫瘤連同肝段切除；剩下的肝在幾個月內再生長大
  function resect() {
    var D = 10, k = "lvR";
    var piece = "M40 118 C 34 78 62 44 118 34 C 112 60 118 96 132 126 C 142 150 148 186 150 226 C 128 230 104 230 86 222 C 58 210 44 170 40 118 Z";
    var keepMask = '<mask id="' + k + '-keep" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="280"><rect width="420" height="280" fill="#fff"/><path d="' + piece + '" fill="#000"/></mask>' +
      '<mask id="' + k + '-pc" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="280"><path d="' + piece + '" fill="#fff"/></mask>';
    var cut = "M118 34 C 112 60 118 96 132 126 C 142 150 148 186 150 226";
    return svg("0 -34 440 344", "手術切除示意：切除有腫瘤的肝段，剩下的肝臟在幾個月內慢慢長大",
      "<defs>" + liverDefs(k) + keepMask + "</defs>" +
      '<g transform="translate(20 10)">' +
      '<g style="transform-origin:270px 120px"><animateTransform attributeName="transform" type="scale" values="1;1;1;1.12;1.12;1" keyTimes="0;.62;.7;.9;.96;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<g mask="url(#' + k + '-keep)">' + liverArt(k, { art: true }) + "</g>" +
      '<g opacity="0">' + anim("opacity", "0;0;1;1;0", "0;.62;.68;.95;1", D) + '<path d="' + cut + '" fill="none" stroke="#7fdcaa" stroke-width="3" stroke-linecap="round"/></g></g>' +
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-40 30;-40 30;0 0" keyTimes="0;.4;.56;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + anim("opacity", "1;1;1;0;0;1", "0;.4;.52;.6;.95;1", D) +
      '<g mask="url(#' + k + '-pc)">' + liverArt(k, { art: true, gb: false, tumors: [[84, 140, 20]] }) + "</g></g>" +
      // 肝段分界（淡）與切線
      '<path d="M190 30 C 186 90 196 150 210 200 M290 44 C 280 80 282 110 296 128" fill="none" stroke="#fff" stroke-opacity=".18" stroke-dasharray="3 5"/>' +
      '<path d="' + cut + '" fill="none" stroke="#f0cf86" stroke-width="3" stroke-dasharray="8 6" opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;.12;.16;.42;.48;1", D) + anim("stroke-dashoffset", "0;-28", "0;1", 1) + "</path>" +
      '<g opacity="0">' + anim("opacity", "0;0;.8;.8;0", "0;.56;.62;.95;1", D) + '<path d="' + piece + '" fill="none" stroke="#d9dcf5" stroke-width="1.4" stroke-dasharray="4 5"/>' + tag(78, 132, "已切除", { size: 11, fill: "#d9dcf5" }) + "</g>" +
      "</g>" +
      // 再生時間軸
      '<g opacity="0">' + show(6.4, D) + [["術後 1 週", 0], ["1 個月", 1], ["3 個月", 2]].map(function (p) {
        var x = 190 + p[1] * 80; return '<circle cx="' + x + '" cy="268" r="' + (6 + p[1] * 3) + '" fill="#7fdcaa" fill-opacity="' + (.35 + p[1] * .25) + '"/>' + txt(x, 294, p[0], { fill: "#7fdcaa", size: 11.5 });
      }).join("") + '<path d="M200 268 H 350" stroke="#7fdcaa" stroke-width="1.5" stroke-dasharray="3 4"/>' + txt(110, 272, "剩下的肝長大", { fill: "#7fdcaa", size: 12, weight: 700 }) + "</g>" +
      phase(220, -16, "1. 找到腫瘤，畫出要切除的肝段", 0, .2, D) + phase(220, -16, "2. 連同周圍的肝組織一起切除", .2, .6, D) +
      phase(220, -16, "3. 剩下的肝在幾週到幾個月內再長大", .6, .97, D, { fill: "#7fdcaa" }), "lvlocal-fig");
  }
  // 肝臟移植：生病的肝（肝硬化＋腫瘤）移出，健康的肝移入，接上四條管路
  function transplant() {
    var D = 10, k = "lvT";
    var joints = [[292, 36, "下腔靜脈"], [236, 182, "門靜脈"], [246, 190, "肝動脈"], [222, 196, "膽管"]];
    var pipes = '<path d="M292 -24 V 36" stroke="#5a64c8" stroke-width="16" stroke-linecap="round"/><path d="M262 300 C 258 260 246 214 236 182" stroke="#8f9cf0" stroke-width="12" stroke-linecap="round" fill="none"/>' +
      '<path d="M300 300 C 300 260 276 214 246 190" stroke="#ff8f7a" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M206 290 C 214 250 218 220 222 196" stroke="#a6e07f" stroke-width="4" stroke-linecap="round" fill="none"/>';
    return svg("0 -40 440 360", "肝臟移植示意：把生病的肝臟換成捐贈的健康肝臟，接上血管與膽管",
      "<defs>" + liverDefs(k) + "</defs>" + '<g transform="translate(20 6)">' + pipes +
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-300 -10;-300 -10;0 0" keyTimes="0;.24;.42;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + anim("opacity", "1;1;0;0;1", "0;.26;.42;.95;1", D) +
      liverArt(k, { state: "cir", tumors: [[130, 120, 18], [232, 92, 11]] }) + "</g>" +
      '<g opacity="0"><animateTransform attributeName="transform" type="translate" values="300 -10;300 -10;0 0;0 0;300 -10" keyTimes="0;.42;.6;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + anim("opacity", "0;0;1;1;0", "0;.42;.58;.95;1", D) +
      liverArt(k, { state: "ok", art: true }) + "</g>" +
      joints.map(function (j, i) {
        return '<g opacity="0">' + show(6.2 + i * .35, D) + '<circle cx="' + j[0] + '" cy="' + j[1] + '" r="9" fill="none" stroke="#f0cf86" stroke-width="2.2"><animate attributeName="r" values="7;12;7" dur="1.4s" repeatCount="indefinite"/></circle></g>';
      }).join("") + "</g>" +
      '<g opacity="0">' + show(6.2, D) + tag(330, 300, "接上：下腔靜脈、門靜脈、肝動脈、膽管", { size: 11.5, fill: "#f0cf86" }) + "</g>" +
      phase(220, -22, "1. 取出生病的肝臟（肝硬化與腫瘤一起拿掉）", 0, .42, D) + phase(220, -22, "2. 放入捐贈的健康肝臟", .42, .62, D) +
      phase(220, -22, "3. 接上血管與膽管，同時解決肝癌和肝硬化", .62, .97, D, { fill: "#7fdcaa" }), "lvlocal-fig");
  }
  // 電燒／微波：剖面圖（皮膚、脂肪、肌肉、肋骨、肝臟），超音波導引，針尖加熱、燒灼範圍包含安全邊緣
  function ablate() {
    var D = 10, k = "lvB", TX = 250, TY = 196;
    var layers = '<rect x="0" y="40" width="440" height="10" fill="#d9b69a"/><rect x="0" y="50" width="440" height="22" fill="#efd9a0" opacity=".75"/>' +
      '<pattern id="' + k + '-mus" width="20" height="8" patternUnits="userSpaceOnUse"><rect width="20" height="8" fill="#a24a4a"/><path d="M0 4 H 20" stroke="#c46a63" stroke-width="2"/></pattern>' +
      '<rect x="0" y="72" width="440" height="22" fill="url(#' + k + '-mus)"/>' +
      '<g fill="#e8e0d0" opacity=".85"><ellipse cx="60" cy="84" rx="26" ry="8"/><ellipse cx="380" cy="84" rx="26" ry="8"/></g>' +
      txt(436, 48, "皮膚", { anchor: "end", fill: "#5a3a2a", size: 10.5, weight: 700 }) + txt(436, 66, "脂肪", { anchor: "end", fill: "#6a5020", size: 10.5, weight: 700 }) + txt(436, 88, "肌肉", { anchor: "end", fill: "#fbe0d8", size: 10.5, weight: 700 }) + txt(60, 88, "肋骨", { fill: "#5a4a40", size: 10, weight: 700 });
    var liverSec = '<clipPath id="' + k + '-sec"><rect x="0" y="94" width="440" height="230"/></clipPath>' +
      '<g clip-path="url(#' + k + '-sec)"><rect x="0" y="94" width="440" height="230" fill="url(#' + k + '-ok)"/><rect x="0" y="94" width="440" height="230" fill="url(#' + k + '-lob)"/>' +
      '<g fill="none" stroke="#8f9cf0" stroke-opacity=".45" stroke-linecap="round"><path d="M0 250 C 80 240 150 270 210 300" stroke-width="10"/><path d="M380 324 C 360 260 400 200 440 170" stroke-width="7"/><path d="M110 130 C 140 150 150 180 140 210" stroke-width="4"/></g></g>' +
      txt(30, 312, "肝臟", { anchor: "start", fill: "#ffd9cc", size: 12, weight: 700 });
    var probe = '<polygon points="150,40 70,300 250,300" fill="#d9f0ff" opacity=".09"/><path d="M150 40 L 70 300 M150 40 L 250 300" stroke="#d9f0ff" stroke-opacity=".25"/>' +
      '<rect x="128" y="14" width="44" height="26" rx="8" fill="#e6e9ff"/><rect x="140" y="-6" width="20" height="22" rx="4" fill="#9fa7d8"/><rect x="128" y="36" width="44" height="5" rx="2" fill="#7ec8f5"/>' + tag(150, -12, "超音波探頭", { size: 11 });
    var heat = '<circle cx="' + TX + '" cy="' + TY + '" r="0" fill="url(#' + k + '-heat)">' + anim("r", "0;0;52;52;0", "0;.38;.6;.92;1", D) + "</circle>" +
      [0, 1, 2].map(function (i) { return '<circle cx="' + TX + '" cy="' + TY + '" r="10" fill="none" stroke="#ffb35a" stroke-width="1.6" opacity="0">' + anim("opacity", "0;0;.9;0;0", "0;" + (.4 + i * .05).toFixed(2) + ";" + (.45 + i * .05).toFixed(2) + ";" + (.6 + i * .05).toFixed(2) + ";1", D) + anim("r", "10;10;56;56;10", "0;" + (.4 + i * .05).toFixed(2) + ";" + (.6 + i * .05).toFixed(2) + ";.95;1", D) + "</circle>"; }).join("");
    var scar = '<circle cx="' + TX + '" cy="' + TY + '" r="44" fill="#a89c94" stroke="#ece4dc" stroke-width="1.4" stroke-dasharray="4 4" opacity="0">' + anim("opacity", "0;0;.85;.85;0", "0;.64;.72;.95;1", D) + "</circle>" +
      '<g opacity="0">' + anim("opacity", "0;0;1;1;0", "0;.66;.72;.95;1", D) + '<circle cx="' + TX + '" cy="' + TY + '" r="44" fill="none" stroke="#7fdcaa" stroke-width="1.6" stroke-dasharray="2 4"/>' + callout(TX + 31, TY - 31, 380, 130, "燒到腫瘤外 0.5–1 公分", { fill: "#7fdcaa", size: 11 }) + "</g>";
    var tum = '<g>' + anim("opacity", "1;1;1;0;0;1", "0;.5;.62;.7;.95;1", D) + tumor(k, TX, TY, 26) + "</g>";
    var needle = '<g><animateTransform attributeName="transform" type="translate" values="80 -150;80 -150;0 0;0 0;80 -150;80 -150" keyTimes="0;.14;.34;.9;.96;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<line x1="' + (TX + 70) + '" y1="' + (TY - 172) + '" x2="' + TX + '" y2="' + TY + '" stroke="#c9cdea" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="' + (TX + 8) + '" y1="' + (TY - 20) + '" x2="' + TX + '" y2="' + TY + '" stroke="#ffd36a" stroke-width="5" stroke-linecap="round"><animate attributeName="stroke" values="#ffd36a;#ff7a3a;#ffd36a" dur=".8s" repeatCount="indefinite"/></line>' +
      '<rect x="' + (TX + 64) + '" y="' + (TY - 196) + '" width="16" height="26" rx="4" fill="#9fa7d8" transform="rotate(22 ' + (TX + 72) + " " + (TY - 183) + ')"/></g>';
    return svg("0 -30 440 380", "電燒或微波消融示意：在超音波導引下，細針穿過皮膚插到腫瘤中心，加熱把腫瘤和周圍一圈組織燒掉",
      "<defs>" + liverDefs(k) + '<radialGradient id="' + k + '-heat" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3c0"/><stop offset=".5" stop-color="#ff9a3c" stop-opacity=".85"/><stop offset="1" stop-color="#e2604e" stop-opacity="0"/></radialGradient></defs>' +
      liverSec + layers + probe + heat + tum + scar + needle +
      '<g opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;.4;.44;.62;.66;1", D) + tag(TX + 90, TY + 70, "電流或微波加熱", { fill: "#ffb35a", size: 11.5 }) + "</g>" +
      phase(220, 340, "1. 用超音波找到腫瘤", 0, .14, D) + phase(220, 340, "2. 細針穿過皮膚，插到腫瘤中心", .14, .38, D) +
      phase(220, 340, "3. 加熱燒掉腫瘤，連同周圍一圈安全範圍", .38, .66, D) + phase(220, 340, "4. 燒過的地方慢慢變成疤痕", .66, .97, D, { fill: "#7fdcaa" }), "lvlocal-fig");
  }
  // 經動脈栓塞／釔90：主動脈 → 腹腔動脈 → 肝總動脈 → 肝動脈 → 腫瘤；放大的腫瘤血管網
  function tace(y90) {
    var D = 11, k = y90 ? "lvY" : "lvE", S = .74, col = y90 ? "#9effa8" : "#f4d27e";
    var AORTA = "M210 470 L 210 220";
    var CATH = "M160 470 C 176 440 196 420 206 400 L 210 252 C 214 236 226 230 240 226 C 260 222 268 210 264 196 C 260 184 248 176 236 168 C 214 154 196 146 178 142";
    var lv = wrap(k, liverArt(k, { art: false }), 40, 50, S);
    // 腫瘤（座標已換算到全圖）＋豐富的腫瘤血管
    var TX = 40 + 150 * S, TY = 50 + 120 * S, TR = 24;
    var blush = '<g fill="none" stroke="#ff6a5a" stroke-width="1.3" stroke-opacity=".9">' +
      [[-1, -.2], [-.6, .9], [.2, 1], [.9, .5], [.8, -.7], [-.2, -1]].map(function (d) { return '<path d="M178 142 Q ' + (TX + d[0] * TR * 1.6).toFixed(1) + " " + (TY + d[1] * TR * 1.6).toFixed(1) + " " + (TX + d[0] * TR * .6).toFixed(1) + " " + (TY + d[1] * TR * .6).toFixed(1) + '"/>'; }).join("") + "</g>";
    var tum = '<g style="transform-origin:' + TX + "px " + TY + 'px"><animateTransform attributeName="transform" type="scale" values="1;1;1;.74;.74;1" keyTimes="0;.62;.8;.9;.96;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      tumor(k, TX, TY, TR, false) + '<circle cx="' + TX + '" cy="' + TY + '" r="' + TR + '" fill="#5a4a46" opacity="0">' + anim("opacity", "0;0;.55;.55;0", "0;.72;.84;.95;1", D) + "</circle>" +
      (y90 ? '<circle cx="' + TX + '" cy="' + TY + '" r="' + TR + '" fill="none" stroke="#9effa8" stroke-width="2" opacity="0">' + anim("opacity", "0;0;.9;0;0", "0;.6;.66;.8;1", D) + anim("r", String(TR) + ";" + TR + ";" + (TR * 1.8) + ";" + (TR * 1.8) + ";" + TR, "0;.6;.8;.95;1", D) + "</circle>" : "") + "</g>";
    var beads = "";
    for (var i = 0; i < 9; i++) beads += '<circle r="' + (y90 ? 2.6 : 3.2) + '" fill="' + col + '" opacity="0"><animateMotion dur="1.4s" begin="' + (i * .16).toFixed(2) + 's" repeatCount="indefinite" path="M236 168 C 214 154 196 146 178 142 Q ' + (TX + 18) + " " + (TY - 10) + " " + (TX + 4) + " " + (TY + 2) + '"/>' +
      anim("opacity", "0;0;1;1;0;0", "0;.5;.52;.8;.82;1", D) + "</circle>";
    var stuck = "";
    for (var j = 0; j < 12; j++) { var a = j * 2.4, rr = (j % 4) * 5 + 4; stuck += '<circle cx="' + (TX + Math.cos(a) * rr).toFixed(1) + '" cy="' + (TY + Math.sin(a) * rr).toFixed(1) + '" r="2.2" fill="' + col + '"/>'; }
    return svg("0 -34 420 540", y90 ? "釔90 示意：從鼠蹊部動脈放入導管，到肝臟腫瘤的血管，打入帶有放射線的微粒，從腫瘤內部照射" : "經動脈栓塞示意：從鼠蹊部動脈放入導管，沿著血管到肝臟，把藥物和栓塞物質打進餵養腫瘤的血管，腫瘤缺血縮小",
      "<defs>" + liverDefs(k) + '<linearGradient id="' + k + '-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3688"/><stop offset="1" stop-color="#1b2160"/></linearGradient></defs>' +
      '<path d="M110 -20 C 60 0 44 60 44 130 C 44 260 56 380 80 470 L 74 506 H 346 L 340 470 C 364 380 376 260 376 130 C 376 60 360 0 310 -20 Z" fill="url(#' + k + '-bd)" stroke="#5b66b8" stroke-width="1.5"/>' +
      '<g fill="none" stroke="#8f98d8" stroke-opacity=".25" stroke-width="2.4"><path d="M60 30 C 120 60 300 60 360 30"/><path d="M58 60 C 120 92 300 92 362 60"/></g>' +
      // 動脈系統
      '<path d="' + AORTA + '" stroke="#a83a3a" stroke-width="16" stroke-linecap="round"/><path d="' + AORTA + '" stroke="#e2604e" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M210 400 C 200 430 176 450 160 476 M210 400 C 220 430 244 450 260 476" stroke="#c8484a" stroke-width="9" stroke-linecap="round" fill="none"/>' +
      '<path d="M210 252 C 214 236 226 230 240 226 C 260 222 268 210 264 196 C 260 184 248 176 236 168" stroke="#e2604e" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M240 226 C 270 224 300 230 330 246" stroke="#e2604e" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>' +
      txt(222, 330, "主動脈", { anchor: "start", fill: "#ffb199", size: 11.5 }) + txt(336, 250, "脾動脈", { anchor: "start", fill: "#ffb199", size: 10.5 }) +
      lv + '<path d="M236 168 C 214 154 196 146 178 142" stroke="#ff8f7a" stroke-width="3.5" fill="none" stroke-linecap="round"/>' + blush + tum +
      '<g opacity="0">' + anim("opacity", "0;0;1;1;0", "0;.78;.82;.95;1", D) + stuck + "</g>" +
      '<path d="' + CATH + '" fill="none" stroke="#eef0ff" stroke-width="3" stroke-linecap="round" stroke-dasharray="560" stroke-dashoffset="560">' + anim("stroke-dashoffset", "560;560;0;0;560", "0;.06;.46;.95;1", D) + "</path>" +
      beads +
      '<circle cx="160" cy="470" r="7" fill="#e2604e" stroke="#ffd0c4" stroke-width="2" opacity="0">' + show(.3, D) + "</circle>" + tag(160, 500, "鼠蹊部的小傷口", { size: 11.5 }) +
      callout(TX + 18, TY - 18, 330, 90, y90 ? "釔90 放射微粒" : "化療藥物＋栓塞微粒", { fill: col, anchor: "start", size: 11.5 }) +
      callout(TX - 18, TY + 16, 58, 210, "腫瘤的血管很多", { fill: "#ff9b8a", anchor: "start", size: 11 }) +
      phase(210, -14, "1. 從鼠蹊部的動脈放入細細的導管", 0, .22, D) + phase(210, -14, "2. 導管沿著主動脈走到肝動脈", .22, .48, D) +
      phase(210, -14, y90 ? "3. 打入帶放射線的微粒，從腫瘤內部照射" : "3. 把藥物和栓塞微粒打進餵養腫瘤的血管", .48, .8, D) +
      phase(210, -14, y90 ? "4. 腫瘤在幾週到幾個月內慢慢縮小" : "4. 腫瘤斷了養分，壞死縮小", .8, .97, D, { fill: "#7fdcaa" }), "lvlocal-fig tace-fig");
  }
  F.liverLocal = function (kind) {
    if (kind === "resect") return resect();
    if (kind === "tx") return transplant();
    if (kind === "ablate") return ablate();
    if (kind === "y90") return tace(true);
    return tace(false);
  };

  /* ---------- 6. 肝硬化警訊全身圖 ----------
     專屬人形：眼白變黃、食道靜脈曲張、肝硬化的肝與腫大的脾臟、腹水（液面晃動）、腳腫、瘀青。
     熱點旁直接標出名稱，吸引點選；hot 為 [{id,x,y,t,side}]，由 widgets.js 的 bodymap 處理。 */
  F.cirrhosisBody = function (hot) {
    var k = "lvC", SK = "#3a4296", ED = "#8a94e0";
    var body =
      '<path d="M150 14 C 128 14 116 30 116 50 C 116 70 128 84 138 88 L 136 100 C 104 106 82 114 74 134 L 58 236 C 56 254 50 272 46 288 C 44 296 52 300 56 292 L 74 244 L 86 172 L 84 290 C 82 310 84 330 92 346 L 96 470 C 96 482 124 482 124 470 L 132 352 C 136 342 164 342 168 352 L 176 470 C 176 482 204 482 204 470 L 208 346 C 216 330 218 310 216 290 L 214 172 L 226 244 L 244 292 C 248 300 256 296 254 288 C 250 272 244 254 242 236 L 226 134 C 218 114 196 106 164 100 L 162 88 C 172 84 184 70 184 50 C 184 30 172 14 150 14 Z" fill="' + SK + '" stroke="' + ED + '" stroke-width="1.6"/>' +
      // 鼓起的肚子（腹水）
      '<path d="M86 210 C 72 250 72 300 92 330 C 120 356 180 356 208 330 C 228 300 228 250 214 210 Z" fill="' + SK + '" stroke="' + ED + '" stroke-width="1.6"/>' +
      '<clipPath id="' + k + '-belly"><path d="M86 210 C 72 250 72 300 92 330 C 120 356 180 356 208 330 C 228 300 228 250 214 210 Z"/></clipPath>' +
      '<g clip-path="url(#' + k + '-belly)"><path d="M60 270 Q 100 260 150 270 T 240 270 V 370 H 60 Z" fill="#7ec8f5" opacity=".45"><animate attributeName="d" values="M60 270 Q 100 260 150 270 T 240 270 V 370 H 60 Z;M60 270 Q 100 280 150 270 T 240 270 V 370 H 60 Z;M60 270 Q 100 260 150 270 T 240 270 V 370 H 60 Z" dur="2.6s" repeatCount="indefinite"/></path></g>' +
      // 臉：黃色的眼白
      '<ellipse cx="138" cy="48" rx="7" ry="4.5" fill="#f2d24c"/><ellipse cx="162" cy="48" rx="7" ry="4.5" fill="#f2d24c"/><circle cx="138" cy="48" r="2.4" fill="#2a2a3a"/><circle cx="162" cy="48" r="2.4" fill="#2a2a3a"/>' +
      // 腦（意識）
      '<path d="M134 24 q 8 -8 16 0 q 8 -8 16 0" fill="none" stroke="#c9a3ff" stroke-width="2" stroke-linecap="round"><animate attributeName="opacity" values=".3;1;.3" dur="2s" repeatCount="indefinite"/></path>' +
      // 食道與靜脈曲張
      '<path d="M150 92 V 196" stroke="#e9a8b8" stroke-width="8" stroke-linecap="round" opacity=".7"/>' +
      '<g fill="#5a64e0">' + [120, 140, 160, 178].map(function (y, i) { return '<ellipse cx="' + (i % 2 ? 154 : 146) + '" cy="' + y + '" rx="4" ry="6"/>'; }).join("") + "</g>" +
      // 肝硬化的肝、脾臟腫大
      '<g transform="translate(88 178) scale(.24)">' + liverArt(k, { state: "cir", gb: false, vessels: false }) + "</g>" +
      '<path d="M186 184 C 206 182 214 200 208 218 C 200 230 184 226 180 212 C 176 198 178 188 186 184 Z" fill="#b05a8a" opacity=".85"/>' +
      // 腳腫
      '<path d="M96 410 C 92 440 94 466 110 470 C 126 466 128 440 124 410 Z M176 410 C 172 440 174 466 190 470 C 206 466 208 440 204 410 Z" fill="#7ec8f5" opacity=".28"/>' +
      // 瘀青
      '<g fill="#8a4ab0" opacity=".75"><ellipse cx="66" cy="236" rx="6" ry="4"/><ellipse cx="72" cy="252" rx="4" ry="3"/><ellipse cx="236" cy="226" rx="5" ry="3.5"/></g>';
    var spots = hot.map(function (h, i) {
      var left = h.side === "left", lx = left ? h.x - 16 : h.x + 16;
      return '<g class="bm-spot" data-id="' + h.id + '" style="cursor:pointer">' +
        '<circle class="bm-pulse" cx="' + h.x + '" cy="' + h.y + '" r="12" style="animation-delay:' + (i * .25) + 's"/>' +
        '<circle class="bm-dot" cx="' + h.x + '" cy="' + h.y + '" r="8"/>' + txt(h.x, h.y + 4, "+", { fill: "#141a46", size: 13, weight: 700 }) +
        '<path d="M' + (left ? h.x - 9 : h.x + 9) + " " + h.y + " H " + lx + '" stroke="#f0cf86" stroke-width="1.2"/>' +
        '<g class="bm-lbl">' + tag(lx, h.y + 5, h.short || h.t, { anchor: left ? "end" : "start", size: 14, fill: "#f0cf86", stroke: "#f0cf86" }) + "</g>" +
        '<rect x="' + (left ? lx - 90 : h.x - 14) + '" y="' + (h.y - 16) + '" width="' + (Math.abs(lx - h.x) + 104) + '" height="32" fill="transparent"/></g>';
    }).join("");
    return svg("-56 0 412 490", "肝硬化警訊全身圖：意識混亂、黃疸、食道靜脈曲張出血、腹水、黑便、容易瘀青、腳腫，點選標籤查看說明",
      "<defs>" + liverDefs(k) + "</defs>" + body + spots, "body-fig cirr-fig");
  };
})(window.Figures);
