/* 淋巴癌專屬圖解：淋巴系統、淋巴結裡發生的變化、分期（以橫膈膜為界）、
   治療原理（抗 CD20 抗體、CAR-T、雙特異性抗體、自體造血幹細胞移植）。掛在 window.Figures 底下。 */
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
  function callout(x1, y1, x2, y2, s, o) {
    o = o || {};
    return '<g' + (o.cls ? ' class="' + o.cls + '"' : "") + '><path d="M' + x1 + " " + y1 + " L " + x2 + " " + y2 + '" stroke="' + (o.line || "#d9dcf5") + '" stroke-width="1" stroke-opacity=".7"/><circle cx="' + x1 + '" cy="' + y1 + '" r="2.2" fill="' + (o.line || "#d9dcf5") + '"/>' +
      tag(x2, y2 + 4, s, { anchor: o.anchor || "middle", size: o.size || 11.5, fill: o.fill }) + "</g>";
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
  function defs(k) {
    return '<linearGradient id="' + k + '-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3688"/><stop offset="1" stop-color="#1b2160"/></linearGradient>' +
      '<radialGradient id="' + k + '-ln" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#d6f7e6"/><stop offset=".6" stop-color="#6fcf9f"/><stop offset="1" stop-color="#2f8a66"/></radialGradient>' +
      '<radialGradient id="' + k + '-bad" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f3d6ff"/><stop offset=".6" stop-color="#b07ae0"/><stop offset="1" stop-color="#6a3aa8"/></radialGradient>' +
      '<radialGradient id="' + k + '-cell" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#e8f0ff"/><stop offset="1" stop-color="#8fa4e8"/></radialGradient>' +
      '<radialGradient id="' + k + '-ly" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#f6e8ff"/><stop offset="1" stop-color="#9a6ad6"/></radialGradient>' +
      '<radialGradient id="' + k + '-t" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#e6fff4"/><stop offset="1" stop-color="#3aa880"/></radialGradient>';
  }
  // 正面人形（300×480）
  var BODY = "M150 14 C 128 14 116 30 116 50 C 116 70 128 84 138 88 L 136 100 C 104 106 82 114 74 134 L 58 236 C 56 254 50 272 46 288 C 44 296 52 300 56 292 L 74 244 L 86 172 L 86 290 C 84 310 86 330 92 346 L 96 470 C 96 482 124 482 124 470 L 132 352 C 136 342 164 342 168 352 L 176 470 C 176 482 204 482 204 470 L 208 346 C 214 330 216 310 214 290 L 214 172 L 226 244 L 244 292 C 248 300 256 296 254 288 C 250 272 244 254 242 236 L 226 134 C 218 114 196 106 164 100 L 162 88 C 172 84 184 70 184 50 C 184 30 172 14 150 14 Z";
  function body(k) { return '<path d="' + BODY + '" fill="url(#' + k + '-bd)" stroke="#8a94e0" stroke-width="1.6"/>'; }
  // 淋巴結群：[x, y, 名稱, 分期圖的群組]
  var NODES = {
    neckR: [[128, 92], [124, 104], [132, 112]], neckL: [[172, 92], [176, 104], [168, 112]],
    axR: [[96, 140], [102, 150]], axL: [[204, 140], [198, 150]],
    med: [[146, 150], [154, 160], [148, 172]],
    abd: [[148, 234], [164, 242], [155, 256]],
    ingR: [[116, 314], [124, 322]], ingL: [[184, 314], [176, 322]]
  };
  function node(k, x, y, r, fill) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 1.25).toFixed(1) + '" ry="' + r + '" fill="url(#' + k + "-" + (fill || "ln") + ')" stroke="#e6fff4" stroke-opacity=".7" stroke-width="1"/>'; }
  var VESSELS = "M128 104 C 132 130 140 140 146 150 M172 104 C 168 130 160 140 154 158 M100 146 C 120 150 134 154 146 156 M200 146 C 182 150 166 154 154 160 M146 172 C 148 200 148 220 150 236 M120 318 C 132 290 142 262 146 246 M180 318 C 168 290 158 262 154 246";

  /* ---------- 1. 淋巴系統（可點選的全身圖） ----------
     hot：bodymap 傳入的熱點（id、x、y、short、side）。淋巴液從手腳、腸道沿著淋巴管往上流，
     經過一站站淋巴結，最後由胸管在左側鎖骨下方匯入靜脈。右頸有一顆慢慢變大、不痛的淋巴結。 */
  F.lymphSystem = function (hot) {
    var D = 8, k = "lyS";
    // 淋巴管：每條都從末梢畫向中心，流動方向才會正確
    var PATHS = [
      "M52 288 C 60 246 70 196 94 146 C 108 128 122 118 136 112",          // 右手 → 腋下 → 右鎖骨下
      "M248 288 C 240 246 230 196 206 146 C 192 128 178 118 166 110",      // 左手 → 腋下 → 左鎖骨下
      "M108 466 C 110 420 114 362 118 322 C 128 292 140 266 151 240",      // 右腳 → 鼠蹊 → 腹腔
      "M192 466 C 190 420 186 362 182 322 C 172 292 160 266 151 240",      // 左腳 → 鼠蹊 → 腹腔
      "M151 240 C 152 206 154 170 155 140 C 156 122 160 112 166 110",      // 胸管：乳糜池 → 左鎖骨下
      "M133 68 C 138 80 141 96 136 112",                                     // 右頸
      "M167 68 C 162 80 159 96 166 110",                                     // 左頸
      "M128 252 C 136 248 144 244 151 240", "M174 252 C 166 248 158 244 151 240" // 腸道的淋巴
    ];
    var NODES2 = [[136, 80], [139, 90], [140, 100], [132, 110], [164, 80], [161, 90], [168, 110],
      [94, 144], [100, 154], [90, 154], [206, 144], [200, 154], [210, 154], [66, 222], [234, 222],
      [148, 126], [156, 136], [150, 148], [155, 162],
      [146, 248], [157, 258], [148, 270], [134, 284], [167, 284],
      [118, 320], [125, 329], [111, 329], [182, 320], [175, 329], [189, 329]];
    var base = PATHS.map(function (d) { return '<path d="' + d + '"/>'; }).join("");
    var flow = PATHS.map(function (d, i) {
      return '<path d="' + d + '"><animate attributeName="stroke-dashoffset" values="0;-24" dur="' + (1.1 + (i % 3) * .15).toFixed(2) + 's" repeatCount="indefinite"/></path>';
    }).join("");
    var nodes = NODES2.map(function (p, i) {
      var r = i > 12 && i < 15 ? 2.8 : 3.8;
      return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + (r * 1.3).toFixed(1) + '" ry="' + r + '" fill="url(#' + k + '-ln)" stroke="#e6fff4" stroke-opacity=".6" stroke-width=".8" transform="rotate(' + ((i * 37) % 50 - 25) + " " + p[0] + " " + p[1] + ')"/>';
    }).join("");
    var body = '<path d="' + BODY + '" fill="url(#' + k + '-bd)" stroke="#8a94e0" stroke-width="1.4"/>' +
      '<path d="' + BODY + '" fill="none" stroke="#c9d0ff" stroke-opacity=".12" stroke-width="10" clip-path="url(#' + k + '-clip)"/>';
    var bones = '<g fill="none" stroke="#f0cf86" stroke-opacity=".28" stroke-linecap="round">' +
      '<path d="M150 118 V 176" stroke-width="5"/>' +                                             // 胸骨
      '<path d="M112 350 L 114 440 M188 350 L 186 440" stroke-width="7"/></g>';                   // 大腿骨
    // 胃與腸道（淡淡的輪廓），讓「胃腸道」熱點有位置感
    var gut = '<g fill="none" stroke="#e9a8b8" stroke-opacity=".22" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M166 182 C 182 180 188 196 182 210 C 174 224 154 222 146 214"/>' +
      '<path d="M120 236 C 120 224 136 222 140 232 C 144 242 128 248 124 258 C 120 270 136 276 142 268 M160 232 C 164 222 180 224 180 236 C 180 248 166 250 166 262 C 166 272 180 274 182 264"/></g>';
    var spleen = '<path d="M186 192 C 204 188 212 204 206 220 C 198 232 182 228 178 214 C 174 202 178 194 186 192 Z" fill="#b05a8a" opacity=".75"/>';
    var lump = '<ellipse cx="161" cy="94" rx="5" ry="4" fill="url(#' + k + '-bad)" stroke="#f3d6ff" stroke-width="1.1">' +
      anim("rx", "4;4;10;10;4", "0;.25;.6;.95;1", D) + anim("ry", "3.5;3.5;8;8;3.5", "0;.25;.6;.95;1", D) + "</ellipse>" +
      '<g opacity="0">' + show(4.6, D) + callout(169, 92, 226, 96, "不痛、慢慢變大", { anchor: "start", fill: "#d9b8ff", size: 11 }) + "</g>";
    var spots = (hot || []).map(function (h, i) {
      var left = h.side === "left", lx = left ? h.x - 16 : h.x + 16;
      return '<g class="bm-spot" data-id="' + h.id + '" style="cursor:pointer">' +
        '<circle class="bm-pulse" cx="' + h.x + '" cy="' + h.y + '" r="10" style="animation-delay:' + (i * .2) + 's"/>' +
        '<circle class="bm-dot" cx="' + h.x + '" cy="' + h.y + '" r="7"/>' + txt(h.x, h.y + 4, "+", { fill: "#141a46", size: 12, weight: 700 }) +
        '<path d="M' + (left ? h.x - 8 : h.x + 8) + " " + h.y + " H " + lx + '" stroke="#f0cf86" stroke-width="1.2"/>' +
        '<g class="bm-lbl">' + tag(lx, h.y + 5, h.short || h.t, { anchor: left ? "end" : "start", size: 13, fill: "#f0cf86", stroke: "#f0cf86" }) + "</g>" +
        '<rect x="' + (left ? lx - 96 : h.x - 14) + '" y="' + (h.y - 15) + '" width="' + (Math.abs(lx - h.x) + 110) + '" height="30" fill="transparent"/></g>';
    }).join("");
    return svg("-62 0 424 486", "淋巴系統全身圖：淋巴液從手腳與腸道沿著淋巴管往上流，經過頸部、腋下、縱膈腔、腹腔、鼠蹊部的淋巴結，最後在左側鎖骨下方匯入血液；脾臟、骨髓也是免疫系統的一部分。點選標籤查看各部位的說明",
      "<defs>" + defs(k) + '<clipPath id="' + k + '-clip"><path d="' + BODY + '"/></clipPath>' +
      '<filter id="' + k + '-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>' +
      body + bones + gut + spleen +
      '<g fill="none" stroke="#6fcf9f" stroke-linecap="round" stroke-linejoin="round"><g stroke-width="5" stroke-opacity=".18" filter="url(#' + k + '-glow)">' + base + '</g><g stroke-width="1.8" stroke-opacity=".6">' + base + "</g>" +
      '<g stroke="#d6ffec" stroke-width="2.2" stroke-dasharray="2 10" stroke-opacity=".95">' + flow + "</g></g>" +
      '<circle cx="166" cy="110" r="3" fill="#7ec8f5"/>' + nodes + lump + spots, "body-fig cirr-fig lymph-fig");
  };

  /* ---------- 2. 淋巴結裡發生了什麼 ----------
     正常淋巴結：外有包膜，裡面有一圈圈的濾泡、淋巴球。淋巴球的基因出錯後不停增生，濾泡結構消失，淋巴結整個脹大。一循環 10 秒。 */
  F.lymphNode = function () {
    var D = 10, k = "lyN", CX = 240, CY = 150;
    // 豆形淋巴結：下方中間凹進去的地方是淋巴門（淋巴液從這裡流出）
    var BEAN = "M128 150 C 128 92 178 62 240 62 C 302 62 352 92 352 150 C 352 204 312 234 268 236 C 250 237 248 220 240 212 C 232 220 230 237 212 236 C 168 234 128 204 128 150 Z";
    var fol = [[168, 128], [198, 96], [240, 86], [282, 96], [312, 128], [316, 172], [164, 172]];
    var normal = '<path d="' + BEAN + '" fill="#2a5566" stroke="#a6f0c8" stroke-width="2.5"/>' +
      '<path d="M240 212 C 232 188 236 168 240 150 C 244 168 248 188 240 212 Z M200 196 C 214 184 226 176 240 168 M280 196 C 266 184 254 176 240 168" fill="none" stroke="#6fcf9f" stroke-opacity=".35" stroke-width="2"/>' +
      fol.map(function (f) {
        return '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="20" fill="#3c7a82" stroke="#a6f0c8" stroke-opacity=".45"/><circle cx="' + f[0] + '" cy="' + f[1] + '" r="10" fill="#8fdcbc" opacity=".5"/>';
      }).join("");
    var cells = "";
    for (var i = 0; i < 30; i++) { var a = i * 2.39, r = Math.sqrt(i + .5) / Math.sqrt(30); cells += '<circle cx="' + (CX + Math.cos(a) * r * 100).toFixed(1) + '" cy="' + (CY + Math.sin(a) * r * 66).toFixed(1) + '" r="3.6" fill="url(#' + k + '-cell)" opacity=".85"/>'; }
    var bad = "";
    for (var j = 0; j < 110; j++) {
      var a2 = j * 2.39996, r2 = Math.sqrt(j + .5) / Math.sqrt(110), t = 2.8 + (j % 25) * .14;
      bad += '<circle cx="' + (CX + Math.cos(a2) * r2 * 112).toFixed(1) + '" cy="' + (CY - 2 + Math.sin(a2) * r2 * 82).toFixed(1) + '" r="4.6" fill="url(#' + k + '-ly)" stroke="#f3d6ff" stroke-width=".5" opacity="0">' + anim("opacity", "0;0;1;1;0", "0;" + (t / D).toFixed(3) + ";" + ((t + .4) / D).toFixed(3) + ";.95;1", D) + "</circle>";
    }
    var flow = "";
    ["M40 70 C 90 66 140 80 168 98", "M440 76 C 400 72 350 82 316 100", "M240 212 C 240 240 250 266 270 292"].forEach(function (d, i) {
      for (var n = 0; n < 2; n++) flow += '<circle r="2.6" fill="#c8ffe4"><animateMotion dur="2.4s" begin="' + (-n * 1.2 - i * .4).toFixed(1) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
    });
    return svg("0 0 480 310", "淋巴結示意：正常的淋巴結有包膜和濾泡；淋巴癌時，出錯的淋巴球不停增生，填滿淋巴結，使淋巴結脹大",
      "<defs>" + defs(k) + '<clipPath id="' + k + '-clip"><path d="' + BEAN + '"/></clipPath></defs>' +
      '<g fill="none" stroke="#6fcf9f" stroke-width="5" stroke-linecap="round" stroke-opacity=".65"><path d="M40 70 C 90 66 140 80 168 98"/><path d="M440 76 C 400 72 350 82 316 100"/><path d="M240 212 C 240 240 250 266 270 292"/></g>' + flow +
      '<g style="transform-origin:' + CX + "px " + CY + 'px"><animateTransform attributeName="transform" type="scale" values="1;1;1.2;1.2;1" keyTimes="0;.3;.7;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      normal + '<g clip-path="url(#' + k + '-clip)"><g>' + anim("opacity", "1;1;0;0;1", "0;.32;.55;.95;1", D) + cells + "</g>" +
      '<path d="' + BEAN + '" fill="#4a2a6a" opacity="0">' + anim("opacity", "0;0;.8;.8;0", "0;.3;.6;.95;1", D) + "</path>" + bad + "</g>" +
      '<path d="' + BEAN + '" fill="none" stroke="#d9b8ff" stroke-width="2.5" opacity="0">' + anim("opacity", "0;0;1;1;0", "0;.35;.6;.95;1", D) + "</path></g>" +
      '<g>' + anim("opacity", "1;1;0;0;1", "0;.28;.3;.95;1", D) + callout(282, 96, 390, 46, "濾泡：淋巴球聚集的地方", { anchor: "middle", fill: "#a6f0c8", size: 11 }) + "</g>" +
      txt(40, 58, "淋巴液流入", { anchor: "start", fill: "#a6f0c8", size: 11 }) + txt(282, 298, "流出", { anchor: "start", fill: "#a6f0c8", size: 11 }) +
      phase(240, 22, "1. 正常的淋巴結：有包膜、濾泡和淋巴球", 0, .28, D) +
      phase(240, 22, "2. 淋巴球的基因出錯，開始不停增生", .28, .6, D, { fill: "#d9b8ff" }) +
      phase(240, 22, "3. 塞滿淋巴結、讓它脹大，也可能跑到別處", .6, .97, D, { fill: "#d9b8ff" }), "lnode-fig");
  };

  /* ---------- 3. 分期：以橫膈膜為界 ----------
     由 widgets.js 的 stagemap 設定 data-stage（1–4）：
     1 期一個區域；2 期橫膈膜同一側兩個以上區域；3 期橫膈膜上下都有；4 期侵犯淋巴結以外的器官（肝、肺、骨髓）。 */
  F.lymphStage = function () {
    var k = "lyT";
    function grp(cls, list) { return '<g class="lg ' + cls + '">' + list.map(function (p) { return '<ellipse class="lnod" cx="' + p[0] + '" cy="' + p[1] + '" rx="7.5" ry="6"/>'; }).join("") + "</g>"; }
    var g = grp("g1", NODES.neckR) + grp("g2", NODES.axR.concat(NODES.med)) + grp("g3", NODES.abd.concat(NODES.ingR, NODES.ingL)) +
      grp("g0", NODES.neckL.concat(NODES.axL));
    var org = '<g class="lorg">' +
      '<path d="M100 132 C 104 116 124 112 136 120 C 140 140 140 166 136 182 C 122 186 104 182 98 172 C 96 158 96 144 100 132 Z" fill="#e9a8b8" opacity=".28"/>' +
      '<path d="M200 132 C 196 116 176 112 164 120 C 160 140 160 166 164 182 C 178 186 196 182 202 172 C 204 158 204 144 200 132 Z" fill="#e9a8b8" opacity=".28"/>' +
      '<circle cx="118" cy="132" r="4.5" fill="url(#' + k + '-ly)"/>' +
      '<path d="M94 206 C 112 198 142 200 148 212 C 146 226 120 232 104 228 C 94 224 90 214 94 206 Z" fill="#a8574f"/><circle cx="118" cy="214" r="5" fill="url(#' + k + '-ly)"/>' +
      '<path d="M108 360 L 112 440 M192 360 L 188 440" stroke="#d9b8ff" stroke-width="8" stroke-linecap="round" opacity=".8"/>' +
      callout(102, 218, 20, 236, "肝臟", { anchor: "end", fill: "#ff9b8a" }) + callout(110, 400, 20, 400, "骨髓", { anchor: "end", fill: "#d9b8ff" }) + callout(112, 132, 20, 150, "肺", { anchor: "end", fill: "#ff9b8a" }) + "</g>";
    return svg("-60 0 380 490", "淋巴癌分期示意：以橫膈膜為界，看侵犯幾個淋巴結區域、是否在橫膈膜上下兩側，以及是否侵犯其他器官",
      "<defs>" + defs(k) + "</defs>" + body(k) +
      '<path d="M66 196 C 110 182 190 182 234 196" fill="none" stroke="#f0cf86" stroke-width="2.4" stroke-dasharray="7 5"/>' +
      tag(258, 204, "橫膈膜", { anchor: "start", size: 11.5, fill: "#f0cf86", stroke: "#f0cf86" }) +
      txt(258, 170, "上方", { anchor: "start", fill: "#d9dcf5", size: 11 }) + txt(258, 236, "下方", { anchor: "start", fill: "#d9dcf5", size: 11 }) +
      g + org, "stagemap lyst");
  };

  /* ---------- 4. 治療原理 ----------
     kind：cd20 抗 CD20 抗體、cart CAR-T、bispecific 雙特異性抗體、sct 自體造血幹細胞移植。 */
  function lymphoma(k, x, y, r, o) {
    o = o || {};
    var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + k + '-ly)" stroke="#f3d6ff" stroke-width="1.6"/><circle cx="' + (x + 2) + '" cy="' + (y + 2) + '" r="' + (r * .55) + '" fill="#7a4ab8" opacity=".55"/>';
    if (o.marks) for (var i = 0; i < o.marks; i++) { var a = i / o.marks * Math.PI * 2; s += '<rect x="' + (x + Math.cos(a) * r - 3).toFixed(1) + '" y="' + (y + Math.sin(a) * r - 3).toFixed(1) + '" width="6" height="6" rx="1.5" fill="' + (o.mc || "#f0cf86") + '" transform="rotate(' + (a * 180 / Math.PI).toFixed(0) + " " + (x + Math.cos(a) * r).toFixed(1) + " " + (y + Math.sin(a) * r).toFixed(1) + ')"/>'; }
    return s;
  }
  function tcell(k, x, y, r, car) {
    var s = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + k + '-t)" stroke="#e6fff4" stroke-width="1.6"/><circle cx="' + (x - 2) + '" cy="' + (y + 1) + '" r="' + (r * .5) + '" fill="#2f8a66" opacity=".5"/>';
    if (car) for (var i = 0; i < 6; i++) { var a = (i / 6) * Math.PI * 2 + .3; var px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; s += '<path d="M' + px.toFixed(1) + " " + py.toFixed(1) + " l " + (Math.cos(a) * 8).toFixed(1) + " " + (Math.sin(a) * 8).toFixed(1) + '" stroke="#ff9b8a" stroke-width="3" stroke-linecap="round"/><circle cx="' + (px + Math.cos(a) * 10).toFixed(1) + '" cy="' + (py + Math.sin(a) * 10).toFixed(1) + '" r="3" fill="#ff9b8a"/>'; }
    return s;
  }
  function Y(x, y, rot, col1, col2) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ')"><path d="M0 0 V 14 M0 0 L -8 -10 M0 0 L 8 -10" stroke="' + col1 + '" stroke-width="4" stroke-linecap="round" fill="none"/>' +
      (col2 ? '<path d="M0 0 L 8 -10" stroke="' + col2 + '" stroke-width="4" stroke-linecap="round"/>' : "") + "</g>";
  }
  function burst(x, y, t, D) {
    var s = '<g opacity="0">' + anim("opacity", "0;0;1;0;0", "0;" + (t / D).toFixed(3) + ";" + ((t + .3) / D).toFixed(3) + ";" + ((t + 1.2) / D).toFixed(3) + ";1", D);
    for (var i = 0; i < 10; i++) { var a = i * .628; s += '<circle cx="' + (x + Math.cos(a) * 26).toFixed(1) + '" cy="' + (y + Math.sin(a) * 26).toFixed(1) + '" r="3.5" fill="#d9b8ff"/>'; }
    return s + "</g>";
  }
  F.lymphTx = function (kind) {
    var k = "lyX" + kind, D = 9, body = "", cap = "";
    if (kind === "cd20") {
      // 抗體貼上 B 細胞淋巴癌表面的 CD20，引來免疫細胞攻擊
      var abs = "";
      for (var i = 0; i < 6; i++) {
        var a = i / 6 * Math.PI * 2, px = 220 + Math.cos(a) * 54, py = 150 + Math.sin(a) * 54, rot = a * 180 / Math.PI + 90;
        abs += '<g opacity="0">' + anim("opacity", "0;0;1;1;0;0", "0;" + ((1 + i * .25) / D).toFixed(3) + ";" + ((1.4 + i * .25) / D).toFixed(3) + ";.7;.74;1", D) + Y(px.toFixed(1), py.toFixed(1), rot.toFixed(0), "#f0cf86") + "</g>";
      }
      body = '<g>' + anim("opacity", "1;1;0;0;1", "0;.66;.72;.95;1", D) + lymphoma(k, 220, 150, 44, { marks: 12 }) + tag(220, 230, "B 細胞淋巴癌（表面有 CD20）", { size: 11.5, fill: "#d9b8ff" }) + "</g>" + burst(220, 150, 6.2, D) + abs +
        '<g><animateTransform attributeName="transform" type="translate" values="120 0;120 0;16 0;16 0;120 0" keyTimes="0;.4;.6;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + tcell(k, 300, 150, 26) + tag(300, 112, "免疫細胞", { size: 11.5, fill: "#a6f0c8" }) + "</g>" +
        '<g opacity="0">' + show(6.8, D) + tag(220, 230, "淋巴癌細胞被破壞、清除", { size: 11.5, fill: "#7fdcaa" }) + "</g>";
      cap = phase(220, 26, "1. 抗 CD20 抗體認出淋巴癌細胞表面的 CD20", 0, .4, D) + phase(220, 26, "2. 引來免疫細胞攻擊", .4, .68, D, { fill: "#a6f0c8" }) + phase(220, 26, "3. 淋巴癌細胞被消滅", .68, .97, D, { fill: "#7fdcaa" });
      return svg("0 0 440 260", "抗 CD20 抗體示意：抗體貼在 B 細胞淋巴癌表面的 CD20 上，引來免疫細胞攻擊，消滅淋巴癌細胞", "<defs>" + defs(k) + "</defs>" + body + cap, "lytx-fig");
    }
    if (kind === "cart") {
      D = 12;
      var steps = [["收集 T 細胞", 70], ["裝上「導航器」", 180], ["培養增生", 290], ["輸回體內攻擊", 400]];
      var hdr = steps.map(function (s, i) {
        return '<g opacity="0">' + show(.2 + i * 2.6, D) + '<circle cx="' + s[1] + '" cy="56" r="13" fill="#141a46" stroke="#f0cf86"/>' + txt(s[1], 61, String(i + 1), { fill: "#f0cf86", weight: 700 }) + txt(s[1], 88, s[0], { fill: "#eef0fb", size: 12, weight: 700 }) + "</g>";
      }).join("") + '<path d="M84 56 H 386" stroke="#f0cf86" stroke-opacity=".35" stroke-dasharray="3 5"/>';
      var p1 = '<g opacity="0">' + show(.2, D) + '<rect x="38" y="120" width="64" height="90" rx="10" fill="#7a2030" opacity=".6"/>' + '<path d="M70 120 V 104" stroke="#d9dcf5" stroke-width="3"/>' + tcell(k, 58, 160, 10) + tcell(k, 82, 180, 10) + tcell(k, 66, 194, 9) + txt(70, 230, "血袋", { size: 11 }) + "</g>";
      var p2 = '<g opacity="0">' + show(2.8, D) + '<path d="M150 150 h 60 l -8 60 h -44 z" fill="#d9f0ff" fill-opacity=".14" stroke="#d9f0ff" stroke-opacity=".6"/>' + tcell(k, 180, 176, 14, true) +
        txt(180, 136, "加上 CAR 基因", { fill: "#7ec8f5", size: 10.5 }) + "</g>";
      var p3 = '<g opacity="0">' + show(5.4, D) + [[270, 150], [300, 150], [285, 176], [262, 196], [312, 198], [287, 210]].map(function (p) { return tcell(k, p[0], p[1], 10, true); }).join("") + "</g>";
      var p4 = '<g opacity="0">' + show(8, D) + '<g>' + anim("opacity", "1;1;0;0;1", "0;.85;.9;.95;1", D) + lymphoma(k, 410, 172, 22, { marks: 8, mc: "#7ec8f5" }) + "</g>" + burst(410, 172, 10.6, D) +
        '<g><animateTransform attributeName="transform" type="translate" values="-30 0;-30 0;0 0;0 0;-30 0" keyTimes="0;.67;.8;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + tcell(k, 372, 172, 13, true) + "</g>" +
        txt(410, 216, "CD19", { fill: "#7ec8f5", size: 10.5 }) + "</g>";
      return svg("0 20 470 230", "CAR-T 示意：抽血收集病人的 T 細胞，在實驗室裝上能辨認淋巴癌的接受器，培養增生後輸回體內，找到並攻擊淋巴癌細胞",
        "<defs>" + defs(k) + "</defs>" + hdr + p1 + p2 + p3 + p4 + '<g opacity="0">' + show(10.8, D) + tag(235, 244, "像是把自己的免疫細胞裝上「導航器」，專門找淋巴癌", { size: 11.5, fill: "#7fdcaa" }) + "</g>", "lytx-fig");
    }
    if (kind === "bispecific") {
      // 雙特異性抗體一手抓 T 細胞（CD3），一手抓淋巴癌（CD20），把兩者拉在一起
      body = '<g><animateTransform attributeName="transform" type="translate" values="-60 0;-60 0;0 0;0 0;-60 0" keyTimes="0;.3;.5;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' + tcell(k, 150, 150, 34) + txt(150, 205, "T 細胞（CD3）", { fill: "#a6f0c8", size: 11.5, weight: 700 }) + "</g>" +
        '<g><animateTransform attributeName="transform" type="translate" values="60 0;60 0;0 0;0 0;60 0" keyTimes="0;.3;.5;.95;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        '<g>' + anim("opacity", "1;1;0;0;1", "0;.72;.78;.95;1", D) + lymphoma(k, 290, 150, 38, { marks: 10 }) + "</g>" + txt(290, 210, "淋巴癌（CD20）", { fill: "#d9b8ff", size: 11.5, weight: 700 }) + "</g>" + burst(290, 150, 7, D) +
        '<g opacity="0">' + show(1.2, D, 7) + '<g transform="translate(220 150)"><path d="M-36 0 H 36" stroke="#f0cf86" stroke-width="4" stroke-linecap="round"/><path d="M-36 0 l -8 -9 M-36 0 l -8 9" stroke="#a6f0c8" stroke-width="4" stroke-linecap="round"/><path d="M36 0 l 8 -9 M36 0 l 8 9" stroke="#d9b8ff" stroke-width="4" stroke-linecap="round"/></g>' + tag(220, 120, "雙特異性抗體", { size: 11.5, fill: "#f0cf86" }) + "</g>" +
        '<g opacity="0">' + show(5, D, 7) + [0, 1, 2, 3].map(function (i) { return '<circle r="3.5" fill="#a6f0c8"><animateMotion dur="1s" begin="' + (i * .25) + 's" repeatCount="indefinite" path="M180 150 H 260"/></circle>'; }).join("") + "</g>";
      cap = phase(220, 30, "1. 抗體的一端抓住 T 細胞，另一端抓住淋巴癌", 0, .5, D) + phase(220, 30, "2. 把兩者拉近，T 細胞被啟動", .5, .74, D, { fill: "#a6f0c8" }) + phase(220, 30, "3. T 細胞直接攻擊淋巴癌", .74, .97, D, { fill: "#7fdcaa" });
      return svg("0 0 440 240", "雙特異性抗體示意：抗體一端抓住 T 細胞、一端抓住淋巴癌細胞，把兩者拉在一起，讓 T 細胞攻擊淋巴癌", "<defs>" + defs(k) + "</defs>" + body + cap, "lytx-fig");
    }
    // sct：自體造血幹細胞移植
    D = 12;
    var bar = function (x, t0) {
      var k = "0;" + (t0 / D).toFixed(3) + ";" + ((t0 + .5) / D).toFixed(3) + ";" + Math.min(.95, (t0 + 1.6) / D).toFixed(3) + ";.97;1";
      return '<rect x="' + x + '" y="200" width="16" height="0" rx="3" fill="#7fdcaa">' + anim("height", "0;0;0;60;60;0", k, D) + anim("y", "200;200;200;140;140;200", k, D) + "</rect>";
      return '<rect x="' + x + '" y="200" width="16" height="0" rx="3" fill="#7fdcaa">' + anim("height", "0;0;0;60;60;0", "0;" + (t0 / D).toFixed(3) + ";" + ((t0 + .5) / D).toFixed(3) + ";" + ((t0 + 2) / D).toFixed(3) + ";.95;1", D) + anim("y", "200;200;200;140;140;200", "0;" + (t0 / D).toFixed(3) + ";" + ((t0 + .5) / D).toFixed(3) + ";" + ((t0 + 2) / D).toFixed(3) + ";.95;1", D) + "</rect>";
    };
    var stem = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="6" fill="#f0cf86" stroke="#fff3d6"/>'; };
    var p1 = '<g opacity="0">' + show(.2, D) + '<rect x="40" y="110" width="70" height="80" rx="10" fill="#141a46" stroke="#7ec8f5"/>' + '<circle cx="75" cy="140" r="16" fill="none" stroke="#7ec8f5" stroke-width="2"><animateTransform attributeName="transform" type="rotate" values="0 75 140;360 75 140" dur="2s" repeatCount="indefinite"/></circle>' +
      stem(68, 176) + stem(82, 176) + txt(75, 210, "收集幹細胞", { fill: "#7ec8f5", size: 11.5, weight: 700 }) + "</g>";
    var p2 = '<g opacity="0">' + show(3, D) + '<rect x="150" y="116" width="54" height="70" rx="8" fill="#d9f0ff" fill-opacity=".12" stroke="#d9f0ff"/>' + stem(170, 150) + stem(184, 160) + '<path d="M162 128 l 4 6 M198 128 l -4 6 M180 122 v 7" stroke="#d9f0ff"/>' + txt(177, 210, "冷凍保存", { fill: "#d9f0ff", size: 11.5, weight: 700 }) + "</g>";
    var p3 = '<g opacity="0">' + show(5.6, D) + '<path d="M250 110 h 30 v 40 a 15 15 0 0 1 -30 0 z" fill="#a8553a" opacity=".85"/>' + '<path d="M265 165 V 190" stroke="#d9dcf5" stroke-width="2"/>' + txt(265, 210, "高劑量化療", { fill: "#ffb199", size: 11.5, weight: 700 }) + "</g>";
    var p4 = '<g opacity="0">' + show(8, D) + '<path d="M330 120 h 26 v 50 h -26 z" fill="#f0cf86" fill-opacity=".2" stroke="#f0cf86"/>' + stem(343, 140) + stem(343, 156) +
      bar(372, 9) + bar(392, 9.4) + bar(412, 9.8) + txt(392, 128, "血球回升", { fill: "#7fdcaa", size: 10.5 }) + txt(380, 222, "輸回幹細胞", { fill: "#f0cf86", size: 11.5, weight: 700 }) + "</g>";
    return svg("0 30 460 230", "自體造血幹細胞移植示意：先收集自己的幹細胞冷凍保存，接受高劑量化療後，再把幹細胞輸回體內，重建造血功能",
      "<defs>" + defs(k) + "</defs>" + p1 + p2 + p3 + p4 + '<path d="M115 150 H 140 M210 150 H 240 M290 150 H 320" stroke="#f0cf86" stroke-width="2" stroke-dasharray="4 4"/>' +
      phase(230, 70, "1. 先從血液中收集自己的造血幹細胞", 0, .24, D) + phase(230, 70, "2. 冷凍保存", .24, .46, D) + phase(230, 70, "3. 接受高劑量化療，清除淋巴癌", .46, .66, D, { fill: "#ffb199" }) +
      phase(230, 70, "4. 輸回幹細胞，約 2 週後血球慢慢回升", .66, .97, D, { fill: "#7fdcaa" }), "lytx-fig");
  };
})(window.Figures);
