/* 3D 魔法書館大廳（Three.js r128）
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

  /* ---------- 背景書櫃 ---------- */
  function makeShelves() {
    var n = tier === "full" ? 9 : 5, R = 12, spread = 1.5;
    var wood = new T.MeshStandardMaterial({ color: 0x2a1d24, roughness: .9 });
    var perCase = tier === "full" ? 70 : 36;
    var spines = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ roughness: .8 }), n * perCase);
    var m = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(), p = new T.Vector3(), col = new T.Color(), idx = 0;
    var palette = [0x4a5a8c, 0x6b4a5e, 0x3e6b66, 0x7a6a3e, 0x5b4a86, 0x8a5a44, 0x384a6e];
    for (var i = 0; i < n; i++) {
      var a = (i - (n - 1) / 2) / ((n - 1) / 2) * spread * .8;
      var caseG = new T.Group();
      caseG.position.set(Math.sin(a) * R, 0, -Math.cos(a) * R + 2); caseG.rotation.y = -a;
      var frame = new T.Mesh(new T.BoxGeometry(3.2, 7, .5), wood); frame.position.set(0, 1.5, -.3); caseG.add(frame);
      for (var sh = 0; sh < 5; sh++) {
        var board = new T.Mesh(new T.BoxGeometry(3.2, .08, .8), wood); board.position.set(0, -1.6 + sh * 1.4, 0); caseG.add(board);
      }
      scene.add(caseG); caseG.updateMatrixWorld();
      for (var k = 0; k < perCase && idx < n * perCase; k++) {
        var shelf = k % 5, slot = Math.floor(k / 5), hh = .7 + Math.random() * .45, ww = .12 + Math.random() * .1;
        p.set(-1.4 + slot * (2.8 / (perCase / 5)) + Math.random() * .05, -1.56 + shelf * 1.4 + hh / 2, .1).applyMatrix4(caseG.matrixWorld);
        q.setFromEuler(new T.Euler(0, -a, (Math.random() - .5) * .08));
        s.set(ww, hh, .55); m.compose(p, q, s); spines.setMatrixAt(idx, m);
        col.setHex(palette[(Math.random() * palette.length) | 0]).multiplyScalar(.55 + Math.random() * .35);
        spines.setColorAt(idx, col); idx++;
      }
    }
    spines.count = idx; scene.add(spines);
  }

  /* ---------- 地面魔法陣與粒子 ---------- */
  function makeFloor() {
    var floor = new T.Mesh(new T.CircleGeometry(16, 48), new T.MeshStandardMaterial({ color: 0x141a40, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.2; scene.add(floor);
    var runeTex = canvasTex(512, 512, function (g, w) {
      g.translate(w / 2, w / 2); g.strokeStyle = "rgba(232,199,127,.9)"; g.lineWidth = 3;
      [230, 200, 120].forEach(function (r) { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); });
      for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2, b = a + Math.PI * 2 / 3; g.beginPath(); g.moveTo(Math.cos(a) * 200, Math.sin(a) * 200); g.lineTo(Math.cos(b) * 200, Math.sin(b) * 200); g.stroke(); }
      for (var j = 0; j < 36; j++) { var an = j / 36 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(an) * 205, Math.sin(an) * 205); g.lineTo(Math.cos(an) * 225, Math.sin(an) * 225); g.stroke(); }
    });
    var circle = new T.Mesh(new T.PlaneGeometry(9, 9), new T.MeshBasicMaterial({ map: runeTex, transparent: true, opacity: .35, blending: T.AdditiveBlending, depthWrite: false }));
    circle.rotation.x = -Math.PI / 2; circle.position.y = -2.18; scene.add(circle); rings.push(circle);
  }
  function makeParticles() {
    var count = tier === "full" ? 700 : 220, geo = new T.BufferGeometry(), pos = new Float32Array(count * 3), spd = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - .5) * 22; pos[i * 3 + 1] = -2 + Math.random() * 9; pos[i * 3 + 2] = (Math.random() - .5) * 16 - 2;
      spd[i] = .15 + Math.random() * .35;
    }
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    particles = new T.Points(geo, new T.PointsMaterial({ size: tier === "full" ? .11 : .14, map: dotTex(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: 0xffe2a0 }));
    particles.userData.spd = spd; scene.add(particles);
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
      books.forEach(function (b, i) {
        var c = i % cols, r = Math.floor(i / cols);
        b.position.set((c - (cols - 1) / 2) * 1.9, (rowsN - 1) / 2 * 2.45 - r * 2.45 + .35, 0);
        b.rotation.y = (c ? -1 : 1) * .12; b.userData.baseY = b.position.y; b.scale.setScalar(.95);
      });
      camera.fov = 52; camBase.set(0, .3, 11.2 + (rowsN - 3) * 2.4); lookAt.set(0, .25, 0);
    } else {
      var R = 6.2, span = Math.min(1.25, .2 * n);
      books.forEach(function (b, i) {
        var a = n === 1 ? 0 : (i / (n - 1) - .5) * span;
        b.position.set(Math.sin(a) * R, .25, -Math.cos(a) * R + R * .55);
        b.rotation.y = -a * .9; b.userData.baseY = b.position.y; b.scale.setScalar(1);
      });
      camera.fov = 45; camBase.set(0, .9, 8.4 + Math.max(0, 1.5 - aspect) * 4); lookAt.set(0, .2, 0);
    }
    camera.updateProjectionMatrix();
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
    if (particles) {
      var arr = particles.geometry.attributes.position.array, spd = particles.userData.spd;
      for (var i = 0; i < spd.length; i++) {
        arr[i * 3 + 1] += spd[i] * dt * (reduced ? .2 : 1);
        arr[i * 3] += Math.sin(t * .5 + i) * dt * .05;
        if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = -2;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }
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
      if (particles) particles.geometry.setDrawRange(0, 220);
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
    scene = new T.Scene(); scene.fog = new T.Fog(0x0c1130, 9, 22);
    camera = new T.PerspectiveCamera(45, 1, .1, 60);
    clock = new T.Clock(); raycaster = new T.Raycaster(); pointer = new T.Vector2(9, 9);
    scene.add(new T.HemisphereLight(0x8890d8, 0x1a1030, .75));
    var key = new T.PointLight(0xffd99a, 1.3, 30); key.position.set(0, 5, 6); scene.add(key);
    var rim = new T.PointLight(0x7f8cff, .8, 25); rim.position.set(-6, 3, -4); scene.add(rim);
    makeFloor(); makeShelves(); makeParticles();
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
