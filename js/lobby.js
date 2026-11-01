/* 3D 書館大廳：夜晚的水晶溫室（Three.js r128）
   書本依 window.CANCERS 自動產生；改文章不需要動這個檔案。
   效能分級：full 完整特效 / lite 簡化 / static 改用平面書架（由 app.js 處理）。 */
window.Lobby = (function () {
  "use strict";
  var T = window.THREE;
  var renderer, scene, camera, clock, raycaster, pointer;
  var books = [], hitMeshes = [], hovered = null, particles, rings = [];
  var tier = "full", running = false, busy = false, opts = {};
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tweens = [];
  var camBase = new T.Vector3(), lookAt = new T.Vector3(0, 0.5, 0), parallax = { x: 0, y: 0 };
  var canvas, tipEl, frameTimes = [], monitorUntil = 0, frames = 0, lost = false;

  /* ---------- 效能判斷 ---------- */
  function detectTier() {
    try {
      var c = document.createElement("canvas");
      if (!(c.getContext("webgl") || c.getContext("experimental-webgl"))) return "static";
    } catch (e) { return "static"; }
    var cores = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4;
    var small = Math.min(screen.width, screen.height) < 500;
    if (cores <= 2 || mem <= 1) return "lite";
    if (cores <= 4 || mem <= 2 || (small && cores <= 6)) return "lite";
    return "full";
  }

  /* ---------- 小工具 ---------- */
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function tween(dur, fn, done) { tweens.push({ t0: performance.now(), dur: reduced ? 1 : dur, fn: fn, done: done }); }
  function runTweens(now) {
    for (var i = tweens.length - 1; i >= 0; i--) {
      var tw = tweens[i], k = Math.min(1, (now - tw.t0) / tw.dur);
      tw.fn(ease(k));
      if (k >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); }
    }
  }
  function shade(hex, amt) {
    var c = new T.Color(hex);
    return amt > 0 ? c.lerp(new T.Color(0xffffff), amt) : c.lerp(new T.Color(0x000000), -amt);
  }
  function canvasTex(w, h, draw) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    var tx = new T.CanvasTexture(c);
    tx.anisotropy = renderer.capabilities.getMaxAnisotropy ? Math.min(4, renderer.capabilities.getMaxAnisotropy()) : 1;
    return tx;
  }
  function dotTex() {
    return canvasTex(64, 64, function (g, w) {
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,240,200,1)"); gr.addColorStop(.3, "rgba(232,199,127,.6)"); gr.addColorStop(1, "rgba(232,199,127,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    });
  }

  /* ---------- 封面徽記 ---------- */
  function sigil(g, kind, cx, cy, s) {
    g.save(); g.translate(cx, cy); g.strokeStyle = "#e8c77f"; g.fillStyle = "rgba(232,199,127,.18)"; g.lineWidth = 5; g.lineJoin = "round"; g.lineCap = "round";
    g.beginPath(); g.arc(0, 0, s, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 4; g.beginPath();
    if (kind === "lung") {
      g.moveTo(0, -s * .7); g.lineTo(0, -s * .1); g.moveTo(0, -s * .1); g.lineTo(-s * .18, s * .05); g.moveTo(0, -s * .1); g.lineTo(s * .18, s * .05);
      g.stroke(); g.beginPath();
      g.ellipse(-s * .38, s * .18, s * .26, s * .46, .15, 0, Math.PI * 2);
      g.ellipse(s * .38, s * .18, s * .26, s * .46, -.15, 0, Math.PI * 2);
      g.fill(); g.stroke();
    } else if (kind === "spiral") {
      for (var a = 0; a < Math.PI * 6; a += .1) { var r = s * .08 + a * s * .04; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      g.stroke();
    } else if (kind === "ribbon") {
      g.moveTo(-s * .35, s * .65); g.bezierCurveTo(s * .2, 0, s * .45, -s * .5, 0, -s * .62);
      g.bezierCurveTo(-s * .45, -s * .5, -s * .2, 0, s * .35, s * .65); g.stroke();
    } else if (kind === "leaf") {
      g.moveTo(0, -s * .65); g.quadraticCurveTo(s * .6, 0, 0, s * .6); g.quadraticCurveTo(-s * .6, 0, 0, -s * .65); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(0, -s * .5); g.lineTo(0, s * .5); g.stroke();
    } else if (kind === "wave") {
      for (var k = -1; k <= 1; k++) { g.moveTo(-s * .6, k * s * .3); for (var x = -s * .6; x <= s * .6; x += 4) g.lineTo(x, k * s * .3 + Math.sin(x / s * 7) * s * .1); }
      g.stroke();
    } else if (kind === "nodes") {
      // 淋巴結：以淋巴管相連的一串豆形結節
      var pts = [[-.42, -.42], [.38, -.38], [0, -.02], [-.36, .4], [.4, .42]];
      g.moveTo(pts[0][0] * s, pts[0][1] * s); g.quadraticCurveTo(-s * .05, -s * .32, 0, -s * .02); g.quadraticCurveTo(s * .08, -s * .3, pts[1][0] * s, pts[1][1] * s);
      g.moveTo(0, -s * .02); g.quadraticCurveTo(-s * .05, s * .26, pts[3][0] * s, pts[3][1] * s); g.moveTo(0, -s * .02); g.quadraticCurveTo(s * .08, s * .28, pts[4][0] * s, pts[4][1] * s);
      g.stroke();
      pts.forEach(function (p, i) { g.beginPath(); g.ellipse(p[0] * s, p[1] * s, s * (i === 2 ? .17 : .13), s * (i === 2 ? .13 : .1), i * .6, 0, Math.PI * 2); g.fill(); g.stroke(); });
    } else {
      for (var i = 0; i < 16; i++) { var rr = i % 2 ? s * .28 : s * .66, an = i / 16 * Math.PI * 2 - Math.PI / 2; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
      g.closePath(); g.fill(); g.stroke();
    }
    g.restore();
  }
  function coverTex(cn) {
    return canvasTex(512, 712, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, "#" + shade(cn.color, .12).getHexString()); gr.addColorStop(1, "#" + shade(cn.color, -.35).getHexString());
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = "#e8c77f"; g.lineWidth = 6; g.strokeRect(26, 26, w - 52, h - 52);
      g.lineWidth = 2; g.strokeRect(42, 42, w - 84, h - 84);
      [[42, 42], [w - 42, 42], [42, h - 42], [w - 42, h - 42]].forEach(function (p) { g.fillStyle = "#e8c77f"; g.beginPath(); g.arc(p[0], p[1], 8, 0, Math.PI * 2); g.fill(); });
      sigil(g, cn.sigil, w / 2, 230, 96);
      var size = 110; g.font = "700 " + size + 'px "LXGW WenKai TC", serif';
      while (g.measureText(cn.name).width > w - 120 && size > 50) { size -= 6; g.font = "700 " + size + 'px "LXGW WenKai TC", serif'; }
      g.fillStyle = "#fff8e6"; g.textAlign = "center"; g.textBaseline = "middle";
      g.shadowColor = "rgba(232,199,127,.6)"; g.shadowBlur = 18; g.fillText(cn.name, w / 2, 470); g.shadowBlur = 0;
      g.font = '500 30px "Noto Sans TC", sans-serif'; g.fillStyle = "#e8c77f"; g.fillText(cn.en.toUpperCase(), w / 2, 560);
      g.font = '400 26px "Noto Sans TC", sans-serif'; g.fillStyle = "rgba(255,248,230,.75)";
      g.fillText(cn.ready ? "點我翻開" : "撰寫中", w / 2, 625);
    });
  }
  function spineTex(cn) {
    return canvasTex(64, 712, function (g, w, h) {
      g.fillStyle = "#" + shade(cn.color, -.45).getHexString(); g.fillRect(0, 0, w, h);
      g.fillStyle = "#e8c77f"; [60, 72, h - 72, h - 60].forEach(function (y) { g.fillRect(6, y, w - 12, 4); });
    });
  }

  /* ---------- 建立書本 ---------- */
  function makeBook(cn) {
    var W = 1.4, H = 1.95, D = 0.32, C = 0.045;
    var group = new T.Group();
    var coverMat = new T.MeshStandardMaterial({ color: shade(cn.color, -.25), roughness: .7, metalness: .1 });
    var paper = new T.MeshStandardMaterial({ color: 0xf1e7cf, roughness: .9 });
    var back = new T.Mesh(new T.BoxGeometry(W, H, C), coverMat); back.position.z = -D / 2 + C / 2;
    var pages = new T.Mesh(new T.BoxGeometry(W - .08, H - .1, D - C * 2), paper); pages.position.x = .03;
    var spine = new T.Mesh(new T.BoxGeometry(C, H, D), [coverMat, new T.MeshStandardMaterial({ map: spineTex(cn), roughness: .6 }), coverMat, coverMat, coverMat, coverMat]);
    spine.position.x = -W / 2;
    var pivot = new T.Object3D(); pivot.position.set(-W / 2, 0, D / 2 - C / 2);
    var front = new T.Mesh(new T.BoxGeometry(W, H, C), [coverMat, coverMat, coverMat, coverMat,
      new T.MeshStandardMaterial({ map: coverTex(cn), roughness: .55, metalness: .15, emissive: new T.Color(cn.color), emissiveIntensity: .08 }),
      paper]);
    front.position.x = W / 2; pivot.add(front);
    // 翻開時露出的內頁光
    var inner = new T.Mesh(new T.PlaneGeometry(W - .2, H - .25), new T.MeshBasicMaterial({ color: 0xfff4d6, transparent: true, opacity: 0 }));
    inner.position.set(.03, 0, D / 2 - C - .002);
    group.add(back, pages, spine, pivot, inner);

    var glow = new T.Sprite(new T.SpriteMaterial({ map: dotTex(), color: shade(cn.color, .45), transparent: true, opacity: .55, blending: T.AdditiveBlending, depthWrite: false }));
    glow.scale.set(3.6, 3.6, 1); glow.position.z = -.5; group.add(glow);

    [back, pages, spine, front].forEach(function (m) { m.userData.book = group; hitMeshes.push(m); });
    group.userData = { cn: cn, pivot: pivot, glow: glow, inner: inner, frontMat: front.material[4], phase: Math.random() * 6, hover: 0, baseY: 0 };
    return group;
  }

  /* ---------- 水晶溫室 ----------
     玻璃穹頂（肋架＋淡淡的玻璃）、穹頂外的星空與月亮、從穹頂灑下的月光、
     四周的大葉植物、垂下的發光藤蔓與花、地面的花環，以及漂浮的螢火。
     中央的樹（樹幹、枝條、葉、花苞）依書本位置在 layout() 裡重建，書像果實一樣掛在枝頭。 */
  var DOME = { c: new T.Vector3(0, -2.2, -3), r: 15 };
  var swayers = [], pulsers = [], tree = null, strands = [], fireflies = [];
  function softTex(stops) {
    return canvasTex(64, 64, function (g, w) {
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    });
  }
  var TEX = {};
  function texs() {
    TEX.glow = softTex([[0, "rgba(255,255,255,1)"], [.25, "rgba(255,255,255,.55)"], [1, "rgba(255,255,255,0)"]]);
    // 花：五片花瓣＋亮心
    TEX.flower = canvasTex(64, 64, function (g) {
      g.translate(32, 32);
      for (var i = 0; i < 5; i++) { g.rotate(Math.PI * 2 / 5); var gr = g.createRadialGradient(0, -12, 0, 0, -12, 13); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(0, -12, 8, 13, 0, 0, Math.PI * 2); g.fill(); }
      var c = g.createRadialGradient(0, 0, 0, 0, 0, 8); c.addColorStop(0, "#fffbe8"); c.addColorStop(1, "rgba(255,240,180,0)"); g.fillStyle = c; g.beginPath(); g.arc(0, 0, 8, 0, Math.PI * 2); g.fill();
    });
    // 葉子：深綠漸層，葉脈微微發光
    TEX.leaf = canvasTex(128, 256, function (g, w, h) {
      g.beginPath(); g.moveTo(w / 2, 4); g.bezierCurveTo(w * 1.05, h * .3, w * .9, h * .78, w / 2, h - 4); g.bezierCurveTo(w * .1, h * .78, -w * .05, h * .3, w / 2, 4); g.closePath();
      var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#2f6b5c"); gr.addColorStop(1, "#123a36"); g.fillStyle = gr; g.fill();
      g.strokeStyle = "rgba(150,255,210,.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2, h - 10); g.stroke();
      g.lineWidth = 1.6; g.strokeStyle = "rgba(150,255,210,.32)";
      for (var y = 40; y < h - 30; y += 26) { g.beginPath(); g.moveTo(w / 2, y); g.quadraticCurveTo(w * .75, y - 6, w * .88, y - 20); g.moveTo(w / 2, y); g.quadraticCurveTo(w * .25, y - 6, w * .12, y - 20); g.stroke(); }
    });
    // 大葉（龜背芋般的剪影）
    TEX.bigleaf = canvasTex(256, 256, function (g, w, h) {
      g.translate(w / 2, h / 2);
      g.beginPath(); g.ellipse(0, 0, 118, 104, 0, 0, Math.PI * 2);
      var gr = g.createRadialGradient(-20, -30, 10, 0, 0, 130); gr.addColorStop(0, "#2c6a58"); gr.addColorStop(1, "#0d2a2a"); g.fillStyle = gr; g.fill();
      g.globalCompositeOperation = "destination-out";
      for (var i = 0; i < 7; i++) { var a = -Math.PI / 2 + (i - 3) * .42; g.save(); g.rotate(a); g.beginPath(); g.ellipse(84, 0, 34, 7, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      g.beginPath(); g.moveTo(0, 0); g.lineTo(-14, 118); g.lineTo(14, 118); g.fill();
      g.globalCompositeOperation = "source-over";
      g.strokeStyle = "rgba(140,255,200,.35)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 104); g.lineTo(0, -100); g.stroke();
    });
    // 月光光束：上亮下淡
    TEX.beam = canvasTex(64, 256, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(220,235,255,.9)"); gr.addColorStop(1, "rgba(220,235,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var sx = g.createLinearGradient(0, 0, w, 0); sx.addColorStop(0, "rgba(0,0,0,1)"); sx.addColorStop(.5, "rgba(0,0,0,0)"); sx.addColorStop(1, "rgba(0,0,0,1)");
      g.globalCompositeOperation = "destination-out"; g.fillStyle = sx; g.fillRect(0, 0, w, h);
    });
  }
  function add(o) { scene.add(o); return o; }
  function sprite(tex, color, size, opacity, fog) {
    var s = new T.Sprite(new T.SpriteMaterial({ map: tex, color: color, transparent: true, opacity: opacity, blending: T.AdditiveBlending, depthWrite: false, fog: fog !== false }));
    s.scale.set(size, size, 1); return s;
  }
  var FLOWER = [0xffb3d9, 0x9ff5e0, 0xffe39a, 0xc8b3ff, 0x9fd4ff];
  function domePoint(az, el, r) { r = r || DOME.r; return new T.Vector3(DOME.c.x + Math.sin(az) * Math.cos(el) * r, DOME.c.y + Math.sin(el) * r * .78, DOME.c.z - Math.cos(az) * Math.cos(el) * r); }
  function makeGreenhouse() {
    var full = tier === "full";
    // 穹頂外的星空
    var sn = full ? 900 : 350, sp = new Float32Array(sn * 3);
    for (var i = 0; i < sn; i++) { var az = Math.random() * Math.PI * 2, el = Math.random() * 1.3 + .1, r = 34 + Math.random() * 6; sp[i * 3] = Math.sin(az) * Math.cos(el) * r; sp[i * 3 + 1] = Math.sin(el) * r - 4; sp[i * 3 + 2] = -Math.cos(az) * Math.cos(el) * r - 3; }
    var sg = new T.BufferGeometry(); sg.setAttribute("position", new T.BufferAttribute(sp, 3));
    var stars = add(new T.Points(sg, new T.PointsMaterial({ size: .16, map: TEX.glow, color: 0xdfe8ff, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })));
    pulsers.push({ m: stars.material, base: .8, amp: .15, sp: .7, ph: 0 });
    // 月亮與光暈
    var moon = add(sprite(TEX.glow, 0xf4f8ff, 5, 1, false)); moon.position.set(5, 13, -26);
    add(sprite(TEX.glow, 0x9fc4ff, 18, .28, false)).position.copy(moon.position);
    // 穹頂肋架：經線與緯線
    var ribMat = new T.MeshBasicMaterial({ color: 0xbcd8ff, transparent: true, opacity: .22, fog: false, depthWrite: false });
    var nMer = 16;
    for (var m = 0; m < nMer; m++) {
      var az0 = m / nMer * Math.PI * 2, pts = [];
      for (var e = 0; e <= 16; e++) pts.push(domePoint(az0, e / 16 * Math.PI / 2));
      add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 32, .045, 5, false), ribMat));
    }
    [.18, .55, .95, 1.3].forEach(function (el) {
      var pts = []; for (var k = 0; k <= 48; k++) pts.push(domePoint(k / 48 * Math.PI * 2, el));
      add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts, true), 96, .035, 4, true), ribMat));
    });
    // 玻璃：極淡的藍綠色，從裡面看
    var glass = add(new T.Mesh(new T.SphereGeometry(DOME.r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshBasicMaterial({ color: 0x5fa8c8, transparent: true, opacity: .025, side: T.BackSide, depthWrite: false, fog: false })));
    glass.position.copy(DOME.c); glass.scale.y = .78;
    // 月光光束
    var beams = full ? 4 : 2;
    for (var bm = 0; bm < beams; bm++) {
      var beam = add(new T.Mesh(new T.PlaneGeometry(2.6 + bm * .6, 17), new T.MeshBasicMaterial({ map: TEX.beam, color: 0xcfe3ff, transparent: true, opacity: .1, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false })));
      beam.position.set(-3.5 + bm * 2.6, 4.6, -6 + bm * .8); beam.rotation.z = -.32 + bm * .06;
      pulsers.push({ m: beam.material, base: .09, amp: .04, sp: .35 + bm * .1, ph: bm * 1.7 });
    }
    // 垂下的藤蔓與花
    var nV = full ? 14 : 7;
    for (var v = 0; v < nV; v++) {
      var azv = (v / nV - .5) * 2.6 + (Math.random() - .5) * .2, top = domePoint(azv, .9 + Math.random() * .3, DOME.r - .3);
      var len = 3 + Math.random() * 4, vp = [];
      for (var q = 0; q <= 10; q++) { var f = q / 10; vp.push(new T.Vector3(top.x + Math.sin(f * 5 + v) * .25, top.y - f * len, top.z + Math.cos(f * 4 + v) * .2)); }
      var vine = new T.Group(); vine.position.copy(top);
      var curve = new T.CatmullRomCurve3(vp.map(function (p) { return p.clone().sub(top); }));
      vine.add(new T.Mesh(new T.TubeGeometry(curve, 24, .025, 4, false), new T.MeshBasicMaterial({ color: 0x3d8c74 })));
      for (var fl = 0; fl < 5; fl++) {
        var fp = curve.getPoint(.2 + fl * .18), sf = sprite(TEX.flower, FLOWER[(v + fl) % FLOWER.length], .45 + Math.random() * .25, .85);
        sf.position.copy(fp); vine.add(sf); pulsers.push({ m: sf.material, base: .7, amp: .25, sp: 1 + Math.random(), ph: Math.random() * 6 });
      }
      add(vine); swayers.push({ o: vine, amp: .05, sp: .5 + Math.random() * .4, ph: Math.random() * 6 });
    }
    // 四周的大葉植物
    var nL = full ? 40 : 18, bigMat = function () { return new T.MeshBasicMaterial({ map: TEX.bigleaf, transparent: true, alphaTest: .05, side: T.DoubleSide, color: 0xffffff }); };
    for (var l = 0; l < nL; l++) {
      var azl = (l / nL - .5) * 3.6 + (Math.random() - .5) * .15, rr = 9 + Math.random() * 4;
      var lf = add(new T.Mesh(new T.PlaneGeometry(1, 1), bigMat()));
      var sz = 2 + Math.random() * 2.4; lf.scale.set(sz, sz, 1);
      lf.position.set(Math.sin(azl) * rr, -2.2 + Math.random() * 3.2 + sz * .3, -Math.cos(azl) * rr - 2);
      lf.rotation.set(-.3 + Math.random() * .4, -azl + (Math.random() - .5) * .8, (Math.random() - .5) * 1.4);
      lf.material.color.setHSL(.42 + Math.random() * .06, .35, .55 + Math.random() * .2);
      swayers.push({ o: lf, amp: .03, sp: .4 + Math.random() * .3, ph: Math.random() * 6, rz: lf.rotation.z });
    }
    // 地面：苔色地板＋花環
    var floorTex = canvasTex(256, 256, function (g, w) {
      var gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "#16323a"); gr.addColorStop(.45, "#0a1c24"); gr.addColorStop(1, "#050d14"); g.fillStyle = gr; g.fillRect(0, 0, w, w);
    });
    floorTex.encoding = T.sRGBEncoding;
    var floor = add(new T.Mesh(new T.CircleGeometry(18, 48), new T.MeshBasicMaterial({ map: floorTex })));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.2;
    var ringTex = canvasTex(512, 512, function (g, w) {
      g.translate(w / 2, w / 2);
      g.strokeStyle = "rgba(160,255,215,.5)"; g.lineWidth = 2; [228, 150].forEach(function (r) { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); });
      for (var j = 0; j < 40; j++) { var an = j / 40 * Math.PI * 2; g.save(); g.rotate(an); g.fillStyle = "rgba(120,220,180,.55)"; g.beginPath(); g.ellipse(0, -190, 8, 22, .4, 0, Math.PI * 2); g.fill(); g.restore(); }
      for (var d = 0; d < 24; d++) { var ad = d / 24 * Math.PI * 2 + .1, gr = g.createRadialGradient(Math.cos(ad) * 190, Math.sin(ad) * 190, 0, Math.cos(ad) * 190, Math.sin(ad) * 190, 14); gr.addColorStop(0, "rgba(255,240,200,.95)"); gr.addColorStop(1, "rgba(255,200,230,0)"); g.fillStyle = gr; g.beginPath(); g.arc(Math.cos(ad) * 190, Math.sin(ad) * 190, 14, 0, Math.PI * 2); g.fill(); }
    });
    var ring = add(new T.Mesh(new T.PlaneGeometry(10, 10), new T.MeshBasicMaterial({ map: ringTex, transparent: true, opacity: .3, blending: T.AdditiveBlending, depthWrite: false })));
    ring.rotation.x = -Math.PI / 2; ring.position.y = -2.18; rings.push(ring);
    // 地上的發光小花叢
    var nB = full ? 46 : 20;
    for (var bb = 0; bb < nB; bb++) {
      var azb = Math.random() * Math.PI * 2, rb = 5.5 + Math.random() * 6, fb = add(sprite(TEX.flower, FLOWER[bb % FLOWER.length], .35 + Math.random() * .3, .8));
      fb.position.set(Math.sin(azb) * rb, -2.05 + Math.random() * .3, -Math.cos(azb) * rb - 2);
      pulsers.push({ m: fb.material, base: .65, amp: .3, sp: .8 + Math.random(), ph: Math.random() * 6 });
    }
  }
  // 螢火：三群不同大小與閃爍節奏
  function makeParticles() {
    var groups = tier === "full" ? [[160, .12, 0xd9ff9a], [120, .09, 0xfff0b0], [90, .16, 0x9ff5e0]] : [[90, .14, 0xd9ff9a], [60, .16, 0x9ff5e0]];
    groups.forEach(function (gp, gi) {
      var n = gp[0], pos = new Float32Array(n * 3), seed = new Float32Array(n);
      for (var i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 20; pos[i * 3 + 1] = -2 + Math.random() * 8; pos[i * 3 + 2] = (Math.random() - .5) * 14 - 2; seed[i] = Math.random() * 100; }
      var geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3));
      var pts = add(new T.Points(geo, new T.PointsMaterial({ size: gp[1], map: TEX.glow, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: gp[2] })));
      pts.userData.seed = seed; fireflies.push(pts);
      pulsers.push({ m: pts.material, base: .75, amp: .25, sp: 1.3 + gi * .5, ph: gi * 2 });
    });
  }

  /* ---------- 中央的樹：依書本位置長出枝條 ---------- */
  function tube(points, r, mat) { return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points), Math.max(8, points.length * 6), r, 6, false), mat); }
  function buildTree(portrait) {
    if (tree) { scene.remove(tree); tree.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
    strands.forEach(function (s) { scene.remove(s.line); s.line.geometry.dispose(); }); strands = [];
    tree = new T.Group();
    var bark = new T.MeshStandardMaterial({ color: 0x1c1a28, emissive: 0x0f3a34, emissiveIntensity: .45, roughness: .9 });
    var twig = new T.MeshStandardMaterial({ color: 0x24263a, emissive: 0x1d6a58, emissiveIntensity: .55, roughness: .85 });
    var tops = books.map(function (b) { return new T.Vector3(b.position.x, b.userData.baseY + 1.55 * b.scale.x, b.position.z); });
    var maxY = Math.max.apply(null, tops.map(function (p) { return p.y; }));
    var tz = portrait ? -1.3 : Math.min.apply(null, tops.map(function (p) { return p.z; })) - 1.6;
    var trunkTop = new T.Vector3(0, maxY + (portrait ? 1.2 : 2.2), tz);
    // 樹幹：下粗上細（分三段）
    var base = new T.Vector3(0, -2.2, tz);
    var tp = [base, new T.Vector3(.25, -1, tz), new T.Vector3(-.2, (maxY - 2.2) / 2, tz), new T.Vector3(.1, maxY, tz), trunkTop];
    tree.add(tube(tp.slice(0, 3), .26, bark), tube(tp.slice(2, 4), .18, bark), tube(tp.slice(3), .11, bark));
    // 樹根
    for (var r = 0; r < 5; r++) { var a = r / 5 * Math.PI * 2 + .3; tree.add(tube([new T.Vector3(0, -1.6, tz), new T.Vector3(Math.cos(a) * .6, -2.05, tz + Math.sin(a) * .6), new T.Vector3(Math.cos(a) * 1.2, -2.2, tz + Math.sin(a) * 1.2)], .07, bark)); }
    var leafMat = new T.MeshBasicMaterial({ map: TEX.leaf, transparent: true, alphaTest: .1, side: T.DoubleSide });
    function leaves(curve, n, size) {
      for (var i = 0; i < n; i++) {
        var p = curve.getPoint(.25 + Math.random() * .75), lf = new T.Mesh(new T.PlaneGeometry(size * .5, size), leafMat);
        lf.position.copy(p).add(new T.Vector3((Math.random() - .5) * .3, (Math.random() - .2) * .3, (Math.random() - .5) * .3));
        lf.rotation.set(Math.random() * .8 - .4, Math.random() * Math.PI, Math.random() * 2 - 1); tree.add(lf);
      }
    }
    function buds(curve, n) {
      for (var i = 0; i < n; i++) {
        var sb = sprite(TEX.flower, FLOWER[(Math.random() * FLOWER.length) | 0], .3 + Math.random() * .2, .9);
        sb.position.copy(curve.getPoint(.3 + Math.random() * .7)); tree.add(sb);
        pulsers.push({ m: sb.material, base: .7, amp: .3, sp: 1 + Math.random(), ph: Math.random() * 6 });
      }
    }
    var full = tier === "full";
    // 掛書的枝條
    tops.forEach(function (hp, i) {
      var from = new T.Vector3(0, Math.min(hp.y + (portrait ? .5 : 1.1), trunkTop.y - .2), tz);
      var mid = new T.Vector3((from.x + hp.x) / 2, Math.max(from.y, hp.y) + .45, (from.z + hp.z) / 2);
      var curve = new T.CatmullRomCurve3([from, mid, hp]);
      tree.add(new T.Mesh(new T.TubeGeometry(curve, 20, .05, 5, false), twig));
      leaves(curve, full ? 7 : 4, .5); buds(curve, full ? 2 : 1);
      // 垂下來的細藤，連到書的上緣（每一格依書的位置更新）
      var g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(new Float32Array(6 * 3), 3));
      var line = new T.Line(g, new T.LineBasicMaterial({ color: 0xa8ffd8, transparent: true, opacity: .7 }));
      scene.add(line); strands.push({ line: line, book: books[i], top: hp.clone() });
      // 枝頭的小葉冠
      for (var k = 0; k < 3; k++) { var lc = new T.Mesh(new T.PlaneGeometry(.22, .44), leafMat); lc.position.copy(hp).add(new T.Vector3((k - 1) * .16, .12, 0)); lc.rotation.set(0, 0, (k - 1) * .7); tree.add(lc); }
    });
    // 樹冠：往上、往外的裝飾枝
    var nC = full ? 9 : 5;
    for (var c = 0; c < nC; c++) {
      var ang = (c / (nC - 1) - .5) * 2.4, len = 1.6 + Math.random() * 1.2;
      var st = new T.Vector3(0, trunkTop.y - .3 - Math.random() * .6, tz);
      var en = new T.Vector3(Math.sin(ang) * len * (portrait ? .9 : 1.4), st.y + Math.cos(ang) * len * .8 + .3, tz + (Math.random() - .5) * .8);
      var cv = new T.CatmullRomCurve3([st, st.clone().lerp(en, .5).add(new T.Vector3(0, .3, 0)), en]);
      tree.add(new T.Mesh(new T.TubeGeometry(cv, 16, .04, 5, false), twig));
      leaves(cv, full ? 10 : 5, .55); buds(cv, full ? 3 : 1);
    }
    // 樹冠後方的柔光
    var halo = sprite(TEX.glow, 0x7fe0c0, portrait ? 6 : 9, .12); halo.position.set(0, trunkTop.y - 1, tz - .5); tree.add(halo);
    scene.add(tree);
  }
  function updateStrands(t) {
    strands.forEach(function (s) {
      var b = s.book, arr = s.line.geometry.attributes.position.array;
      var end = new T.Vector3(0, .98, 0); b.localToWorld(end);
      for (var i = 0; i < 6; i++) {
        var f = i / 5, x = s.top.x + (end.x - s.top.x) * f, y = s.top.y + (end.y - s.top.y) * f, z = s.top.z + (end.z - s.top.z) * f;
        arr[i * 3] = x + Math.sin(f * Math.PI) * .04 * Math.sin(t + i); arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
      }
      s.line.geometry.attributes.position.needsUpdate = true;
    });
  }

  /* ---------- 版面：橫向弧形 / 直式兩排 ---------- */
  function layout() {
    var w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    if (!w || !h) return; // 面板還沒展開時先不排版，等尺寸出來再排
    var aspect = w / h;
    renderer.setSize(w, h, false); camera.aspect = aspect;
    var n = books.length;
    if (aspect < .9) {
      var cols = 2, rowsN = Math.ceil(n / cols);
      // 最下排固定在地板上方（y = -0.95），整組往上排；書的數量是奇數時，最後一本置中
      var top = (rowsN - 1) * 2.3 - .95, mid = top - (rowsN - 1) / 2 * 2.3;
      books.forEach(function (b, i) {
        var c = i % cols, r = Math.floor(i / cols), alone = n % 2 && i === n - 1;
        b.position.set(alone ? 0 : (c - (cols - 1) / 2) * 1.9, top - r * 2.3, 0);
        b.rotation.y = alone ? 0 : (c ? -1 : 1) * .12; b.userData.baseY = b.position.y; b.scale.setScalar(.95);
      });
      // 手機直式：越窄越拉遠，書架置中，避開上方標題與底部按鈕
      camera.fov = 52; camBase.set(0, mid - .25, 11.2 + (rowsN - 3) * 2.6 + Math.max(0, .62 - aspect) * 14); lookAt.set(0, mid - .75, 0);
    } else {
      var R = 6.2, span = Math.min(1.25, .2 * n);
      books.forEach(function (b, i) {
        var a = n === 1 ? 0 : (i / (n - 1) - .5) * span;
        b.position.set(Math.sin(a) * R, .25, -Math.cos(a) * R + R * .55);
        b.rotation.y = -a * .9; b.userData.baseY = b.position.y; b.scale.setScalar(1);
      });
      camera.fov = 45; camBase.set(0, 1.1, 8.6 + Math.max(0, 1.5 - aspect) * 4); lookAt.set(0, .55, 0);
    }
    camera.updateProjectionMatrix();
    // 霧依鏡頭距離調整：手機直式鏡頭拉得比較遠，書才不會被霧蓋住
    scene.fog.near = camBase.z - 1; scene.fog.far = camBase.z + 18;
    buildTree(aspect < .9);
  }

  /* ---------- 互動 ---------- */
  function setPointer(e) {
    var r = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width * 2 - 1; pointer.y = -(e.clientY - r.top) / r.height * 2 + 1;
    parallax.x = pointer.x; parallax.y = pointer.y;
  }
  function pick() {
    raycaster.setFromCamera(pointer, camera);
    var hit = raycaster.intersectObjects(hitMeshes, false)[0];
    return hit ? hit.object.userData.book : null;
  }
  function showTip(b) {
    if (!b) { tipEl.hidden = true; return; }
    var v = new T.Vector3(0, 1.15, 0); b.localToWorld(v); v.project(camera);
    var r = canvas.getBoundingClientRect();
    tipEl.innerHTML = b.userData.cn.name + "<small>" + (b.userData.cn.ready ? "點一下翻開" : "撰寫中") + "</small>";
    tipEl.style.left = (r.left + (v.x + 1) / 2 * r.width) + "px"; tipEl.style.top = (r.top + (1 - v.y) / 2 * r.height) + "px";
    tipEl.hidden = false;
  }
  var downAt = null;
  function onMove(e) { if (busy) return; setPointer(e); if (e.pointerType === "mouse") { hovered = pick(); canvas.style.cursor = hovered ? "pointer" : "default"; showTip(hovered); } }
  function onDown(e) { downAt = { x: e.clientX, y: e.clientY }; setPointer(e); }
  function onUp(e) {
    if (busy || !downAt) return;
    var moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y); downAt = null;
    if (moved > 12) return;
    setPointer(e); var b = pick();
    if (!b) return;
    if (!b.userData.cn.ready) { hovered = b; showTip(b); if (opts.onNotReady) opts.onNotReady(b.userData.cn); return; }
    openBook(b);
  }
  function openBook(b) {
    busy = true; tipEl.hidden = true; hovered = b;
    var ud = b.userData, startCam = camera.position.clone(), startLook = lookAt.clone(), startRot = b.rotation.y;
    var target = new T.Vector3(); b.getWorldPosition(target);
    var endCam = target.clone().add(new T.Vector3(0, .05, 2.35)), endLook = target.clone();
    tween(1100, function (k) {
      camera.position.lerpVectors(startCam, endCam, k); lookAt.lerpVectors(startLook, endLook, k);
      b.rotation.y = startRot * (1 - k);
    }, function () {
      tween(900, function (k) {
        ud.pivot.rotation.y = -2.5 * k; ud.inner.material.opacity = k;
        ud.glow.material.opacity = .55 + k * .45; ud.glow.scale.setScalar(3.6 + k * 4);
      }, function () {
        if (opts.onPick) opts.onPick(ud.cn);
      });
    });
  }

  /* ---------- 迴圈 ---------- */
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    var dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime;
    if (now < monitorUntil) frameTimes.push(dt);
    else if (frameTimes.length) checkPerf();
    runTweens(now);
    var amp = reduced ? .02 : .13;
    books.forEach(function (b) {
      var ud = b.userData;
      if (busy && b === hovered) return;
      ud.hover += ((b === hovered ? 1 : 0) - ud.hover) * .12;
      b.position.y = ud.baseY + Math.sin(t * .9 + ud.phase) * amp + ud.hover * .15;
      b.rotation.z = Math.sin(t * .6 + ud.phase) * (reduced ? 0 : .035);
      var s = (canvas.clientWidth / canvas.clientHeight < .9 ? .95 : 1) * (1 + ud.hover * .1);
      b.scale.setScalar(s);
      ud.glow.material.opacity = .45 + ud.hover * .5 + Math.sin(t * 1.4 + ud.phase) * .06;
      ud.frontMat.emissiveIntensity = .08 + ud.hover * .25;
    });
    fireflies.forEach(function (pts) {
      var arr = pts.geometry.attributes.position.array, sd = pts.userData.seed, k = reduced ? .2 : 1;
      for (var i = 0; i < sd.length; i++) {
        arr[i * 3] += Math.sin(t * .3 + sd[i]) * dt * .25 * k; arr[i * 3 + 1] += (Math.sin(t * .5 + sd[i] * 2) * .12 + .05) * dt * k; arr[i * 3 + 2] += Math.cos(t * .27 + sd[i]) * dt * .2 * k;
        if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = -2;
      }
      pts.geometry.attributes.position.needsUpdate = true;
    });
    pulsers.forEach(function (p) { p.m.opacity = p.base + Math.sin(t * p.sp + p.ph) * (reduced ? 0 : p.amp); });
    swayers.forEach(function (w) { if (w.rz != null) w.o.rotation.z = w.rz + Math.sin(t * w.sp + w.ph) * w.amp; else w.o.rotation.z = Math.sin(t * w.sp + w.ph) * w.amp; });
    updateStrands(t);
    rings.forEach(function (r) { r.rotation.z += dt * .05; });
    if (!busy) {
      camera.position.x += (camBase.x + parallax.x * .5 - camera.position.x) * .04;
      camera.position.y += (camBase.y + parallax.y * .25 - camera.position.y) * .04;
      camera.position.z += (camBase.z - camera.position.z) * .04;
    }
    camera.lookAt(lookAt);
    if (hovered && !busy && hovered === pick() && !tipEl.hidden) showTip(hovered);
    if (!lost) { renderer.render(scene, camera); frames++; }
  }
  function checkPerf() {
    var avg = frameTimes.reduce(function (a, b) { return a + b; }, 0) / frameTimes.length; frameTimes = [];
    if (avg > .055 && tier === "lite") { stop(); if (opts.onFallback) opts.onFallback("slow"); }
    else if (avg > .034 && tier === "full") {
      tier = "lite"; renderer.setPixelRatio(1);
      fireflies.forEach(function (p) { p.geometry.setDrawRange(0, 60); });
      monitorUntil = performance.now() + 2500;
    }
  }

  /* ---------- 對外介面 ---------- */
  function init(o) {
    opts = o || {}; tier = detectTier();
    if (tier === "static" || !T) return false;
    canvas = document.getElementById("scene"); tipEl = document.getElementById("tip");
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: tier === "full", alpha: true, powerPreference: "high-performance" }); }
    catch (e) { return false; }
    renderer.setPixelRatio(tier === "full" ? Math.min(devicePixelRatio || 1, 2) : 1);
    renderer.outputEncoding = T.sRGBEncoding;
    scene = new T.Scene(); scene.fog = new T.Fog(new T.Color(0x07121c).convertSRGBToLinear(), 10, 26);
    camera = new T.PerspectiveCamera(45, 1, .1, 60);
    clock = new T.Clock(); raycaster = new T.Raycaster(); pointer = new T.Vector2(9, 9);
    scene.add(new T.HemisphereLight(0x9cc8ff, 0x0e2a24, .55));
    var moonL = new T.DirectionalLight(0xcfe0ff, .55); moonL.position.set(5, 12, -6); scene.add(moonL);
    var key = new T.PointLight(0xffe2b0, 1.15, 30); key.position.set(0, 4, 7); scene.add(key);
    var rim = new T.PointLight(0x6fe0c0, .9, 22); rim.position.set(-5, 3, -5); scene.add(rim);
    texs(); makeGreenhouse(); makeParticles();
    (opts.cancers || []).forEach(function (cn) { var b = makeBook(cn); books.push(b); scene.add(b); });
    layout();
    camera.position.set(camBase.x, camBase.y + 1.2, camBase.z + (reduced ? 0 : 6));
    window.addEventListener("resize", function () { if (renderer) layout(); });
    // 面板大小改變（例如側邊預覽展開）時重新排版
    if ("ResizeObserver" in window) new ResizeObserver(function () { if (renderer) layout(); }).observe(canvas);
    // 繪圖環境遺失時（瀏覽器回收 GPU 資源）等待恢復；恢復不了就改用平面書架
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault(); lost = true;
      setTimeout(function () { if (lost && opts.onFallback) { stop(); opts.onFallback("lost"); } }, 3000);
    });
    canvas.addEventListener("webglcontextrestored", function () { lost = false; layout(); if (opts.isVisible && opts.isVisible()) { running = false; start(); } });
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", function () { hovered = null; tipEl.hidden = true; parallax.x = parallax.y = 0; });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (opts.isVisible && opts.isVisible()) start(); });
    return true;
  }
  function start() {
    if (running || !renderer) return;
    running = true; clock.getDelta(); monitorUntil = performance.now() + 3000; frameTimes = [];
    requestAnimationFrame(loop);
  }
  function stop() { running = false; }
  function reset() {
    busy = false; hovered = null; tweens = [];
    books.forEach(function (b) { b.userData.pivot.rotation.y = 0; b.userData.inner.material.opacity = 0; b.userData.glow.scale.setScalar(3.6); });
    layout();
  }
  return { init: init, start: start, stop: stop, reset: reset, tier: function () { return tier; }, frames: function () { return frames; }, ok: function () { return !!renderer && !lost; } };
})();
