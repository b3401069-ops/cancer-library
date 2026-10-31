/* 肝癌專屬圖解：肝臟構造與血流、肝炎到肝癌、分期示意（腫瘤＋肝功能）、
   局部治療（手術切除、肝臟移植、電燒微波、經動脈栓塞、釔90）。掛在 window.Figures 底下。
   文章用 { type: "figure", id: "liver" }；局部治療選單用 resections 的 fig: "liverLocal"。 */
(function (F) {
  "use strict";
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 13) + '" fill="' + (o.fill || "#b3b9dc") + '" text-anchor="' + (o.anchor || "middle") + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : "") + ">" + s + "</text>"; }
  function svg(vb, label, body, cls) { return '<svg class="anim ' + (cls || "") + '" viewBox="' + vb + '" role="img" aria-label="' + label + '">' + body + "</svg>"; }
  function tag(x, y, s, o) {
    o = o || {};
    var size = o.size || 12, w = s.length * size + 14, a = o.anchor || "middle";
    var x0 = a === "start" ? x : a === "end" ? x - w : x - w / 2;
    return '<g><rect x="' + x0.toFixed(1) + '" y="' + (y - size - 3) + '" width="' + w + '" height="' + (size + 9) + '" rx="' + ((size + 9) / 2) + '" fill="#0e1236" fill-opacity=".8" stroke="' + (o.stroke || "#3a4382") + '"/>' +
      txt(x0 + w / 2, y + 1, s, { size: size, fill: o.fill || "#e6e9ff", weight: 700 }) + "</g>";
  }
  function anim(attr, values, keyTimes, dur) { return '<animate attributeName="' + attr + '" values="' + values + '" keyTimes="' + keyTimes + '" dur="' + dur + 's" repeatCount="indefinite"/>'; }
  function phase(x, y, s, a, b, dur, o) {
    o = o || {};
    return '<g opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;" + a.toFixed(3) + ";" + (a + .02).toFixed(3) + ";" + (b - .02).toFixed(3) + ";" + b.toFixed(3) + ";1", dur) +
      txt(x, y, s, { fill: o.fill || "#f0cf86", size: o.size || 13.5, weight: 700 }) + "</g>";
  }
  function show(t, D, out) { // 第 t 秒出現，out 秒消失（預設留到循環結束）
    var a = t / D, o = out ? out / D : .95;
    return anim("opacity", "0;0;1;1;0;0", "0;" + a.toFixed(3) + ";" + Math.min(o - .01, a + .04).toFixed(3) + ";" + o.toFixed(3) + ";" + Math.min(.99, o + .04).toFixed(3) + ";1", D);
  }
  function grads(k) {
    return '<linearGradient id="' + k + '-lv" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#c8675c"/><stop offset=".6" stop-color="#9a4248"/><stop offset="1" stop-color="#6e2c3a"/></linearGradient>' +
      '<linearGradient id="' + k + '-ci" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#b9845a"/><stop offset="1" stop-color="#7a4a3a"/></linearGradient>' +
      '<radialGradient id="' + k + '-t" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#fff0c4"/><stop offset=".5" stop-color="#e8c06a"/><stop offset="1" stop-color="#b07a32"/></radialGradient>' +
      '<radialGradient id="' + k + '-heat" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3c0"/><stop offset=".55" stop-color="#ff9a3c" stop-opacity=".85"/><stop offset="1" stop-color="#e2604e" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + k + '-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3688"/><stop offset="1" stop-color="#1b2160"/></linearGradient>';
  }
  // 肝臟外形（畫面左邊是病人的右邊：右葉大、左葉往右變尖）
  var LIVER = "M60 120 C 52 80 90 50 150 46 C 220 40 300 52 350 70 C 372 78 370 96 352 104 C 320 118 290 124 262 140 C 236 156 222 184 196 200 C 168 218 120 226 90 210 C 66 196 62 160 60 120 Z";
  // 肝臟本體：陰影、填色、高光、鐮狀韌帶
  function liverBody(k, o) {
    o = o || {};
    var fill = o.fill || "url(#" + k + "-lv)";
    return '<path d="' + LIVER + '" fill="#140c2a" opacity=".35" transform="translate(4 6)"/>' +
      '<path d="' + LIVER + '" fill="' + fill + '" stroke="' + (o.stroke || "#e9a08f") + '" stroke-width="2"/>' +
      '<path d="M96 70 C 140 54 210 50 280 60" fill="none" stroke="#ffd9cc" stroke-opacity=".35" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M252 54 C 250 90 254 118 262 140" fill="none" stroke="#5a2232" stroke-opacity=".5" stroke-width="2"/>';
  }
  // 肝硬化的表面結節
  function nodules(k, n, seedOff) {
    var s = "", pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i * 137.5 + (seedOff || 0)) * Math.PI / 180, r = 20 + (i * 53 % 70);
      pts.push([170 + Math.cos(a) * r * 1.6, 120 + Math.sin(a) * r * .8]);
    }
    pts.forEach(function (p) {
      s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (6 + (p[0] * 7 % 5)).toFixed(1) + '" fill="#d0a070" fill-opacity=".35" stroke="#5a3226" stroke-opacity=".55" stroke-width="1.2"/>';
    });
    return '<g clip-path="url(#' + k + '-clip)">' + s + "</g>";
  }
  function clip(k) { return '<clipPath id="' + k + '-clip"><path d="' + LIVER + '"/></clipPath>'; }
  // 腫瘤（肝癌在影像上多呈淡黃色結節）
  function tumor(k, x, y, r, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + k + '-t)" stroke="#fff3d6" stroke-width="1.4"' + (extra || "") + "/>"; }

  /* ---------- 1. 肝臟的構造與工作 ----------
     門靜脈把腸道吸收的養分送進肝臟（藍紫色），肝動脈送來氧氣（紅色），膽汁由膽管流出（綠色）。一循環 6 秒。 */
  F.liver = function () {
    var D = 6, k = "lvA";
    var PV = "M226 300 C 224 260 214 216 206 176", HA = "M262 300 C 258 250 236 210 214 180", BD = "M196 176 C 192 214 188 250 176 300";
    var veins = '<g clip-path="url(#' + k + '-clip)" fill="none" stroke-linecap="round">' +
      ["M206 176 C 170 160 130 140 96 120", "M206 176 C 180 140 150 104 120 80", "M206 176 C 230 140 270 110 330 86", "M206 176 C 196 140 200 100 214 70"].map(function (d) {
        return '<path d="' + d + '" stroke="#8796e6" stroke-opacity=".55" stroke-width="5"/>';
      }).join("") +
      ["M214 180 C 176 166 138 148 104 132", "M214 180 C 190 150 160 116 140 96", "M214 180 C 240 150 280 120 320 100"].map(function (d) {
        return '<path d="' + d + '" stroke="#ff8f7a" stroke-opacity=".6" stroke-width="2.4"/>';
      }).join("") + "</g>";
    var flow = "";
    for (var i = 0; i < 4; i++) {
      var b = (-i * 1.5).toFixed(1) + "s";
      flow += '<circle r="4" fill="#aab8ff"><animateMotion dur="3s" begin="' + b + '" repeatCount="indefinite" path="' + PV + '"/></circle>' +
        '<circle r="3" fill="#ffb199"><animateMotion dur="2.4s" begin="' + b + '" repeatCount="indefinite" path="' + HA + '"/></circle>' +
        '<circle r="3" fill="#a6e07f"><animateMotion dur="3.4s" begin="' + b + '" repeatCount="indefinite" path="' + BD + '"/></circle>';
    }
    var jobs = [["代謝養分", 0], ["解毒、分解藥物", 1], ["製造膽汁", 2], ["製造凝血因子、白蛋白", 3]].map(function (j) {
      return '<g opacity="0">' + show(.4 + j[1] * .8, D) + tag(516, 70 + j[1] * 30, j[0], { anchor: "end", size: 12.5, fill: "#f0cf86" }) + "</g>";
    }).join("");
    return svg("0 -10 520 330", "肝臟構造示意：門靜脈從腸道送養分進肝臟，肝動脈送氧氣，膽汁經由膽管流向膽囊與腸道；肝臟負責代謝、解毒、製造膽汁與凝血因子",
      "<defs>" + grads(k) + clip(k) + "</defs>" +
      '<path d="' + PV + '" stroke="#5f6fc8" stroke-width="16" stroke-linecap="round" fill="none"/><path d="' + PV + '" stroke="#8796e6" stroke-width="11" stroke-linecap="round" fill="none"/>' +
      '<path d="' + HA + '" stroke="#b8403e" stroke-width="8" stroke-linecap="round" fill="none"/><path d="' + HA + '" stroke="#ff8f7a" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
      '<path d="' + BD + '" stroke="#4f8a3c" stroke-width="7" stroke-linecap="round" fill="none"/><path d="' + BD + '" stroke="#a6e07f" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
      liverBody(k) + veins +
      '<path d="M176 190 C 166 206 170 234 186 238 C 202 240 206 214 198 196 Z" fill="#6fae5a" stroke="#c9f0a8" stroke-width="1.6"/><ellipse cx="182" cy="208" rx="4" ry="8" fill="#e6ffd0" opacity=".45"/>' +
      flow + jobs +
      tag(126, 150, "右葉", { size: 12 }) + tag(304, 100, "左葉", { size: 12 }) +
      tag(140, 262, "膽囊、膽管", { size: 11.5, fill: "#a6e07f" }) +
      tag(222, 316, "門靜脈：從腸道送來養分", { size: 11, fill: "#aab8ff", anchor: "end" }) + tag(270, 296, "肝動脈：送來氧氣", { size: 11, fill: "#ffb199", anchor: "start" }) +
      txt(260, 8, "肝臟：身體的化學工廠", { fill: "#f0cf86", size: 16, weight: 700 }) + txt(444, 50, "肝臟的工作", { fill: "#d9dcf5", size: 12.5, weight: 700 }), "liver-fig");
  };

  /* ---------- 2. 從肝炎到肝癌 ----------
     健康的肝 → 慢性肝炎 → 肝纖維化 → 肝硬化 → 肝癌，依序出現；下方提醒抗病毒、戒酒可以讓這條路慢下來。一循環 11 秒。 */
  F.hepProg = function () {
    var D = 11, k = "lvP", S = .34, cols = [62, 186, 310, 434, 558];
    var names = [["健康的肝", "#d9dcf5"], ["慢性肝炎", "#ffb199"], ["肝纖維化", "#f0cf86"], ["肝硬化", "#e8a86a"], ["肝癌", "#ff8f7a"]];
    function mini(i) {
      var tx = cols[i] - 212 * S, inner = "", fill = i >= 3 ? "url(#" + k + "-ci)" : "url(#" + k + "-lv)";
      if (i === 1) inner = [[120, 100], [200, 80], [160, 150], [280, 90], [110, 170]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="16" fill="#ff5a4a" opacity=".45"><animate attributeName="opacity" values=".25;.6;.25" dur="1.6s" repeatCount="indefinite"/></circle>'; }).join("");
      if (i === 2) inner = '<g fill="none" stroke="#ffe7c2" stroke-opacity=".65" stroke-width="4" clip-path="url(#' + k + '-clip)"><path d="M70 90 L 140 130 L 120 200 M140 130 L 230 110 L 300 80 M230 110 L 220 170 L 170 210 M90 160 L 140 130"/></g>';
      if (i >= 3) inner = nodules(k, 22, i * 11) + '<g fill="none" stroke="#3a1f1a" stroke-opacity=".5" stroke-width="3" clip-path="url(#' + k + '-clip)"><path d="M70 90 L 140 130 L 120 200 M140 130 L 230 110 L 300 80 M230 110 L 220 170 L 170 210"/></g>';
      if (i === 4) inner += tumor(k, 150, 120, 30) + '<circle cx="150" cy="120" r="38" fill="none" stroke="#ff8f7a" stroke-width="3"><animate attributeName="r" values="32;46;32" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/></circle>';
      var sc = i >= 3 ? S * .9 : S, ty = i >= 3 ? 58 : 50;
      return '<g transform="translate(' + (cols[i] - 212 * sc).toFixed(1) + " " + ty + ") scale(" + sc + ')">' + liverBody(k, { fill: fill, stroke: i >= 3 ? "#d8b08a" : "#e9a08f" }) + inner + "</g>";
    }
    var body = "";
    for (var i = 0; i < 5; i++) {
      var t = .3 + i * 1.6;
      body += '<g opacity="0">' + show(t, D) + mini(i) + tag(cols[i], 152, names[i][0], { fill: names[i][1], size: 14 }) +
        (i ? '<path d="M' + (cols[i] - 74) + ' 92 h 22" stroke="#f0cf86" stroke-width="2.4"/><path d="M' + (cols[i] - 54) + ' 86 l 8 6 -8 6" fill="none" stroke="#f0cf86" stroke-width="2.4"/>' : "") + "</g>";
    }
    // 病毒、酒精、脂肪肝
    var causes = '<g opacity="0">' + show(1.9, D) + txt(186, 180, "B 肝、C 肝、喝酒、脂肪肝", { fill: "#ffb199", size: 13 }) + txt(186, 198, "讓肝臟長期發炎", { fill: "#ffb199", size: 13 }) + "</g>";
    var slow = '<g opacity="0">' + show(8.4, D) +
      '<path d="M130 210 V 220 H 490 V 210" fill="none" stroke="#7fdcaa" stroke-width="2.4"/>' +
      txt(310, 242, "抗病毒治療、戒酒、控制體重，可以讓這條路慢下來，甚至停下來", { fill: "#7fdcaa", size: 15, weight: 700 }) + "</g>";
    var check = '<g opacity="0">' + show(8.4, D) + txt(558, 180, "高風險的人", { fill: "#f0cf86", size: 13 }) + txt(558, 198, "每 6 個月追蹤", { fill: "#f0cf86", size: 13 }) + "</g>";
    return svg("0 0 620 260", "從肝炎到肝癌的過程：健康的肝、慢性肝炎、肝纖維化、肝硬化，最後可能發生肝癌；抗病毒治療與戒酒可以讓這個過程變慢",
      "<defs>" + grads(k) + clip(k) + "</defs>" + body + causes + check + slow +
      phase(310, 22, "肝臟長期發炎，會一步一步受傷", 0, .74, D, { size: 16 }) + phase(310, 22, "好消息：這個過程可以被減緩", .74, .97, D, { fill: "#7fdcaa", size: 16 }), "hepprog-fig");
  };

  /* ---------- 3. 分期示意：腫瘤狀況 × 肝功能 ----------
     tk：t1 單一小腫瘤、t2 早期（單一或 2–3 顆小腫瘤）、t3 多顆局限在肝內、t4 侵犯血管或轉移；
     fk：A 肝功能好、B 中等、C 差（肝硬化合併腹水、黃疸）。 */
  F.liverMini = function (tk, fk) {
    var k = "lvM" + tk + fk, S = .82;
    var fill = fk === "A" ? "url(#" + k + "-lv)" : "url(#" + k + "-ci)";
    var tum = "";
    if (tk === "t1") tum = tumor(k, 130, 120, 9);
    if (tk === "t2") tum = tumor(k, 130, 120, 15) + tumor(k, 200, 84, 9);
    if (tk === "t3") tum = [[110, 100, 18], [170, 140, 14], [230, 96, 16], [140, 170, 10], [290, 92, 11], [190, 70, 9]].map(function (t) { return tumor(k, t[0], t[1], t[2]); }).join("");
    if (tk === "t4") tum = tumor(k, 150, 120, 34) + tumor(k, 240, 96, 12) +
      '<path d="M178 140 C 196 156 204 170 206 186" stroke="url(#' + k + '-t)" stroke-width="12" stroke-linecap="round" fill="none"/>';
    var inner = (fk !== "A" ? nodules(k, fk === "B" ? 12 : 24, 30) : "") + (fk === "C" ? '<path d="' + LIVER + '" fill="#f2d24c" opacity=".22"/>' : "");
    var out = '<g transform="translate(' + (160 - 212 * S).toFixed(1) + " 18) scale(" + S + ')">' +
      '<path d="M206 176 C 212 210 220 240 224 280" stroke="#8796e6" stroke-width="11" stroke-linecap="round" fill="none"/>' +
      liverBody(k, { fill: fill, stroke: fk === "A" ? "#e9a08f" : "#d8b08a" }) + inner + tum + "</g>";
    if (tk === "t4") out += '<g fill="none" stroke="#ff8f7a" stroke-width="1.6" stroke-dasharray="4 5"><path class="met-path" d="M110 100 C 70 60 50 40 30 24"/><path class="met-path" d="M210 120 C 250 80 280 50 300 26"/></g>' +
      tumor(k, 28, 22, 6) + tumor(k, 302, 24, 6) + txt(40, 14, "肺", { fill: "#ff8f7a", size: 11, anchor: "start", weight: 700 }) + txt(292, 14, "骨頭", { fill: "#ff8f7a", size: 11, anchor: "end", weight: 700 }) +
      tag(214, 196, "腫瘤侵犯門靜脈", { size: 10.5, fill: "#ffb199", anchor: "start" });
    if (fk === "C") out += '<path d="M40 200 C 90 214 230 214 280 200 L 284 216 C 230 228 90 228 36 216 Z" fill="#7ec8f5" opacity=".45"/>' + tag(160, 214, "腹水", { size: 10.5, fill: "#7ec8f5" });
    return svg("0 0 320 230", "肝癌分期示意：腫瘤的數量、大小與範圍，以及肝臟本身的功能", "<defs>" + grads(k) + clip(k) + "</defs>" + out, "livermini-fig");
  };

  /* ---------- 4. 局部治療 ----------
     kind：resect 手術切除、tx 肝臟移植、ablate 電燒／微波、tace 經動脈栓塞、y90 釔90 經動脈放射。 */
  function resect() {
    var D = 9, k = "lvR";
    var cut = "M100 60 C 120 110 132 170 120 216";
    var keep = "M100 60 C 104 54 130 52 150 46 C 220 40 300 52 350 70 C 372 78 370 96 352 104 C 320 118 290 124 262 140 C 236 156 222 184 196 200 C 168 218 140 222 120 216 C 132 170 120 110 100 60 Z";
    var right = "M60 120 C 52 80 90 50 150 46 C 130 52 104 54 100 60 C 120 110 132 170 120 216 C 104 220 96 216 90 210 C 66 196 62 160 60 120 Z";
    return svg("0 -20 400 300", "手術切除示意：切除有腫瘤的肝臟部分，剩下的肝臟在幾個月內慢慢長大",
      "<defs>" + grads(k) + "</defs>" +
      '<g style="transform-origin:250px 120px">' +
      '<animateTransform attributeName="transform" type="scale" values="1;1;1;1.1;1.1;1" keyTimes="0;.6;.7;.88;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<path d="' + keep + '" fill="#140c2a" opacity=".35" transform="translate(4 6)"/><path d="' + keep + '" fill="url(#' + k + '-lv)" stroke="#e9a08f" stroke-width="2"/>' +
      '<path d="M130 54 C 180 46 230 48 280 60" fill="none" stroke="#ffd9cc" stroke-opacity=".35" stroke-width="7" stroke-linecap="round"/></g>' +
      '<g>' + '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;-30 18;-30 18;0 0" keyTimes="0;.4;.55;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      anim("opacity", "1;1;0;0;1", "0;.42;.56;.95;1", D) +
      '<path d="' + right + '" fill="url(#' + k + '-lv)" stroke="#e9a08f" stroke-width="2"/>' + tumor(k, 86, 130, 18) + "</g>" +
      '<path d="' + right + '" fill="none" stroke="#d9dcf5" stroke-width="1.6" stroke-dasharray="4 5" opacity="0">' + anim("opacity", "0;0;.7;.7;0", "0;.56;.62;.95;1", D) + "</path>" + tag(70, 236, "已切除的部分", { size: 11, fill: "#d9dcf5" }).replace("<g>", '<g opacity="0">' + anim("opacity", "0;0;1;1;0", "0;.56;.62;.95;1", D)) +
      '<path d="' + cut + '" fill="none" stroke="#f0cf86" stroke-width="3" stroke-dasharray="7 6" opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;.12;.16;.42;.48;1", D) + "</path>" +
      '<g opacity="0">' + show(6.4, D) + '<path d="M250 210 l 0 -16 M242 202 l 8 -8 8 8" stroke="#7fdcaa" stroke-width="2.4" fill="none"/>' + tag(250, 240, "剩下的肝臟會慢慢長大", { fill: "#7fdcaa" }) + "</g>" +
      phase(200, -2, "1. 找到腫瘤，畫出切除範圍", 0, .2, D) + phase(200, -2, "2. 切除有腫瘤的部分，保留足夠的肝", .2, .6, D) +
      phase(200, -2, "3. 幾週到幾個月內，剩下的肝會再長大", .6, .97, D, { fill: "#7fdcaa" }), "lvlocal-fig");
  }
  function transplant() {
    var D = 9, k = "lvT";
    return svg("0 -20 400 300", "肝臟移植示意：把生病的肝臟換成捐贈的健康肝臟，接上血管與膽管",
      "<defs>" + grads(k) + clip(k) + "</defs>" +
      '<path d="M206 176 C 212 210 220 240 224 280" stroke="#8796e6" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M216 180 C 230 220 244 250 252 280" stroke="#ff8f7a" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      // 舊的肝：肝硬化＋腫瘤，移出
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-260 0;-260 0;0 0" keyTimes="0;.25;.42;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + anim("opacity", "1;1;0;0;1", "0;.25;.42;.95;1", D) +
      liverBody(k, { fill: "url(#" + k + "-ci)", stroke: "#d8b08a" }) + nodules(k, 20, 7) + tumor(k, 140, 120, 16) + tumor(k, 230, 92, 10) + "</g>" +
      // 新的肝：移入
      '<g opacity="0"><animateTransform attributeName="transform" type="translate" values="260 0;260 0;0 0;0 0;260 0" keyTimes="0;.45;.62;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + anim("opacity", "0;0;1;1;0", "0;.45;.62;.95;1", D) +
      liverBody(k) + "</g>" +
      '<g opacity="0">' + show(6, D) + '<circle cx="206" cy="180" r="10" fill="none" stroke="#f0cf86" stroke-width="2.4" stroke-dasharray="3 3"/>' + tag(206, 250, "接上血管與膽管", { fill: "#f0cf86", size: 11.5 }) + "</g>" +
      phase(200, -2, "1. 取出生病的肝臟（肝硬化與腫瘤一起拿掉）", 0, .42, D) + phase(200, -2, "2. 放入捐贈的健康肝臟", .42, .64, D) +
      phase(200, -2, "3. 接上血管與膽管，同時解決肝癌和肝硬化", .64, .97, D, { fill: "#7fdcaa" }), "lvlocal-fig");
  }
  function ablate() {
    var D = 9, k = "lvB", TX = 230, TY = 170;
    return svg("0 -20 400 336", "電燒或微波消融示意：在超音波導引下，細針穿過皮膚插到腫瘤中心，加熱把腫瘤和周圍一圈組織燒掉",
      "<defs>" + grads(k) + "</defs>" +
      '<rect x="0" y="34" width="400" height="20" fill="#c9a58c"/><rect x="0" y="54" width="400" height="14" fill="#e8d39a" opacity=".55"/>' + txt(14, 48, "皮膚", { anchor: "start", fill: "#5a3a2a", size: 11, weight: 700 }) +
      '<path d="M0 68 H 400 V 280 H 0 Z" fill="url(#' + k + '-lv)"/>' +
      '<g fill="none" stroke="#5a2232" stroke-opacity=".35" stroke-width="2"><path d="M40 120 C 120 140 160 120 200 150"/><path d="M300 100 C 330 160 320 220 360 260"/></g>' +
      // 超音波探頭與扇形影像
      '<polygon points="130,34 70,250 210,250" fill="#d9f0ff" opacity=".1"/><rect x="112" y="14" width="36" height="22" rx="6" fill="#d9dcf5"/><rect x="122" y="2" width="16" height="14" rx="3" fill="#9fa7d8"/>' +
      tag(130, -4, "超音波", { size: 11 }) +
      // 加熱範圍
      '<circle cx="' + TX + '" cy="' + TY + '" r="0" fill="url(#' + k + '-heat)">' + anim("r", "0;0;46;46;0", "0;.38;.62;.92;1", D) + "</circle>" +
      // 腫瘤：加熱後變成灰白的疤
      '<circle cx="' + TX + '" cy="' + TY + '" r="24" fill="url(#' + k + '-t)" stroke="#fff3d6" stroke-width="1.4">' + anim("fill-opacity", "1;1;1;0;0;1", "0;.5;.62;.7;.95;1", D) + "</circle>" +
      '<circle cx="' + TX + '" cy="' + TY + '" r="38" fill="#9a8f8a" stroke="#d9d0c8" stroke-dasharray="4 4" opacity="0">' + anim("opacity", "0;0;.85;.85;0", "0;.66;.74;.95;1", D) + "</circle>" +
      // 電燒針
      '<line x1="300" y1="0" x2="300" y2="0" stroke="#eef0ff" stroke-width="4" stroke-linecap="round">' +
      anim("x2", "300;300;" + TX + ";" + TX + ";300;300", "0;.14;.34;.9;.96;1", D) + anim("y2", "0;0;" + TY + ";" + TY + ";0;0", "0;.14;.34;.9;.96;1", D) + "</line>" +
      '<rect x="290" y="-14" width="20" height="16" rx="4" fill="#9fa7d8"/>' +
      '<g opacity="0">' + show(6.4, D) + tag(TX + 50, TY + 70, "腫瘤連同周圍一圈燒掉，留下疤痕", { size: 11.5, fill: "#f0cf86" }) + "</g>" +
      phase(200, 304, "1. 用超音波找到腫瘤", 0, .14, D) + phase(200, 304, "2. 細針穿過皮膚，插到腫瘤中心", .14, .38, D) +
      phase(200, 304, "3. 電流或微波加熱，燒掉腫瘤與周圍一圈", .38, .66, D) + phase(200, 304, "4. 燒過的地方慢慢變成疤痕", .66, .97, D, { fill: "#7fdcaa" }), "lvlocal-fig");
  }
  function tace(y90) {
    var D = 10, k = y90 ? "lvY" : "lvE", S = .62;
    // 導管路徑：鼠蹊部股動脈 → 主動脈 → 肝動脈 → 腫瘤
    var CATH = "M150 470 C 160 430 180 400 196 380 L 200 250 C 200 230 196 214 186 200 C 176 186 162 176 146 168";
    var feeders = '<g fill="none" stroke="#ff8f7a" stroke-width="2.2" stroke-linecap="round"><path d="M146 168 C 136 160 128 150 122 140"/><path d="M146 168 C 136 170 124 172 114 168"/><path d="M146 168 C 144 154 146 146 150 136"/></g>';
    var beads = "", col = y90 ? "#9effa8" : "#f4d27e";
    for (var i = 0; i < 7; i++) beads += '<circle r="' + (y90 ? 3 : 3.4) + '" fill="' + col + '" opacity="0"><animateMotion dur="1.6s" begin="' + (i * .2).toFixed(1) + 's" repeatCount="indefinite" path="M186 200 C 176 186 162 176 146 168 C 138 160 130 150 124 142"/>' +
      anim("opacity", "0;0;1;1;0;0", "0;.5;.52;.8;.82;1", D) + "</circle>";
    return svg("0 -24 400 520", y90 ? "釔90 示意：從鼠蹊部動脈放入導管，到肝臟腫瘤的血管，打入帶有放射線的微粒，從腫瘤內部照射" : "經動脈栓塞示意：從鼠蹊部動脈放入導管，沿著血管到肝臟，把藥物和栓塞物質打進餵養腫瘤的血管，腫瘤缺血縮小",
      "<defs>" + grads(k) + clip(k) + "</defs>" +
      // 身體輪廓
      '<path d="M120 -10 C 80 10 64 60 64 120 C 64 240 76 360 96 470 H 304 C 324 360 336 240 336 120 C 336 60 320 10 280 -10 Z" fill="url(#' + k + '-body)" stroke="#5b66b8" stroke-width="1.5"/>' +
      '<path d="M96 470 L 90 500 M304 470 L 310 500" stroke="#5b66b8" stroke-width="1.5"/>' +
      // 主動脈
      '<path d="M200 60 L 200 380 C 196 410 170 440 150 470" stroke="#b8403e" stroke-width="12" stroke-linecap="round" fill="none" opacity=".75"/><path d="M200 380 C 206 410 230 440 250 470" stroke="#b8403e" stroke-width="10" stroke-linecap="round" fill="none" opacity=".6"/>' +
      txt(214, 330, "主動脈", { anchor: "start", fill: "#ffb199", size: 11.5 }) +
      // 肝臟
      '<g transform="translate(' + (200 - 212 * S).toFixed(1) + " 70) scale(" + S + ')">' + liverBody(k) + "</g>" +
      '<path d="M200 250 C 200 230 196 214 186 200" stroke="#ff8f7a" stroke-width="4" fill="none"/>' + feeders +
      // 腫瘤（栓塞後變暗、縮小）
      '<g style="transform-origin:132px 152px"><animateTransform attributeName="transform" type="scale" values="1;1;1;.72;.72;1" keyTimes="0;.6;.8;.9;.96;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<circle cx="132" cy="152" r="22" fill="url(#' + k + '-t)" stroke="#fff3d6" stroke-width="1.4">' + anim("fill-opacity", "1;1;.45;.45;1", "0;.75;.86;.96;1", D) + "</circle>" +
      (y90 ? '<circle cx="132" cy="152" r="22" fill="#9effa8" opacity="0">' + anim("opacity", "0;0;.45;.25;0", "0;.6;.75;.95;1", D) + "</circle>" : "") + "</g>" +
      // 導管
      '<path d="' + CATH + '" fill="none" stroke="#eef0ff" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="460" stroke-dashoffset="460">' +
      anim("stroke-dashoffset", "460;460;0;0;460", "0;.06;.45;.95;1", D) + "</path>" + beads +
      '<circle cx="150" cy="470" r="7" fill="#e2604e" stroke="#ffd0c4" stroke-width="2" opacity="0">' + show(.2, D) + "</circle>" +
      tag(150, 498, "鼠蹊部的小傷口", { size: 11.5 }) +
      tag(300, 150, y90 ? "釔90 微粒" : "藥物＋栓塞物質", { size: 11.5, fill: col }) + '<path d="M246 146 C 210 150 180 160 150 158" stroke="' + col + '" stroke-width="1.2" fill="none" stroke-dasharray="3 3"/>' +
      phase(200, -6, "1. 從鼠蹊部的動脈放入細細的導管", 0, .22, D) + phase(200, -6, "2. 導管沿著血管走到肝臟", .22, .48, D) +
      phase(200, -6, y90 ? "3. 打入帶放射線的微粒，從腫瘤內部照射" : "3. 把藥物和栓塞物質打進餵養腫瘤的血管", .48, .78, D) +
      phase(200, -6, y90 ? "4. 腫瘤在幾週到幾個月內慢慢縮小" : "4. 腫瘤缺血、壞死而縮小", .78, .97, D, { fill: "#7fdcaa" }), "lvlocal-fig tace-fig");
  }
  F.liverLocal = function (kind) {
    if (kind === "resect") return resect();
    if (kind === "tx") return transplant();
    if (kind === "ablate") return ablate();
    if (kind === "y90") return tace(true);
    return tace(false);
  };
})(window.Figures);
