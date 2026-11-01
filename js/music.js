/* 背景音樂：在瀏覽器裡即時合成，不使用任何音檔，沒有版權問題。每個場景一首：
   lobby  水晶溫室：柔和和弦＋音樂盒
   breath 肺癌：隨呼吸起伏的長音、微風、像長笛的高音
   river  大腸直腸癌：流水聲＋豎琴般的分解和弦
   botanical 肝癌：溫暖的低音和弦＋拇指琴
   constellation 淋巴癌：深遠的低鳴＋閃爍的玻璃鈴、長回聲
   book   治療小冊：溫室的旋律，更安靜
   預設關閉；使用者按下「♪」才開始（瀏覽器規定）。開關狀態記在使用者自己的瀏覽器。
   換場景時淡出再淡入；閱讀文章時音量較小；播放衛教影片、切到別的分頁時暫停。 */
window.Music = (function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master, dry, wet, echo, echoFb, noise, noiseF, noiseG, lfo, lfoG;
  var timer = null, nextAt = 0, idx = 0, on = false, ducked = false, scene = "lobby", th = null, btns = [], switching = null;

  /* ---------- 各場景的設定 ---------- */
  var THEMES = {
    lobby: { vol: .4, len: 8, pad: { type: "triangle", cut: 900, lvl: .05, atk: 2.8 }, voice: "bell", every: [.7, 1, 1.4, 2, 2.6], v: [.035, .07], echo: [.46, .3],
      chords: [[48, 55, 64, 67, 71], [45, 52, 60, 64, 71], [41, 48, 57, 60, 64], [43, 50, 55, 62, 64]],
      notes: [[72, 76, 79, 83, 84, 88], [69, 72, 76, 79, 81, 84], [65, 69, 72, 76, 77, 81], [67, 71, 74, 76, 79, 83]] },
    book: { vol: .15, base: "lobby" },
    breath: { vol: .26, len: 10, pad: { type: "sine", cut: 1400, lvl: .045, atk: 4.5, swell: 5 }, voice: "flute", every: [2.5, 3.5, 5], v: [.03, .045], echo: [.6, .35], noise: { type: "lowpass", f: 700, q: .2, lvl: .035, rate: .2 },
      chords: [[50, 57, 62, 66, 69, 76], [47, 54, 59, 62, 66, 69], [43, 50, 55, 59, 62, 66], [45, 52, 57, 61, 64, 71]],
      notes: [[74, 76, 78, 81, 83], [71, 74, 76, 78, 81], [74, 78, 79, 81, 83], [73, 76, 78, 81, 85]] },
    river: { vol: .24, len: 8, pad: { type: "sine", cut: 800, lvl: .035, atk: 2 }, voice: "harp", arp: .25, v: [.03, .05], echo: [.375, .22], noise: { type: "bandpass", f: 1100, q: .6, lvl: .05, rate: .13 },
      chords: [[41, 48, 57, 64, 67], [40, 48, 55, 60, 67], [38, 45, 53, 60, 65], [46, 53, 57, 62, 65]],
      notes: [[65, 69, 72, 76, 79, 81], [64, 67, 72, 76, 79, 84], [62, 65, 69, 72, 74, 77], [58, 62, 65, 69, 70, 74]] },
    botanical: { vol: .2, len: 8, pad: { type: "triangle", cut: 650, lvl: .05, atk: 2.5 }, voice: "kalimba", every: [.5, .5, 1, 1, 1.5], v: [.05, .08], echo: [.33, .18],
      chords: [[45, 52, 57, 60, 64, 71], [41, 48, 53, 57, 64], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]],
      notes: [[69, 72, 74, 76, 79, 81], [69, 72, 74, 76, 77, 81], [67, 72, 74, 76, 79, 84], [67, 71, 74, 76, 79, 83]] },
    constellation: { vol: .2, len: 12, pad: { type: "sine", cut: 600, lvl: .055, atk: 5, drone: 28 }, voice: "glass", every: [1.2, 2, 3, 4], v: [.025, .05], echo: [.62, .45],
      chords: [[40, 47, 56, 63, 66], [37, 44, 52, 59, 63], [45, 52, 56, 63, 66], [42, 49, 54, 61, 63]],
      notes: [[83, 87, 88, 90, 92, 95], [80, 83, 87, 88, 92], [81, 85, 88, 90, 93], [78, 82, 85, 87, 90, 94]] }
  };
  function theme(name) { var t = THEMES[name] || THEMES.lobby; return t.base ? Object.assign({}, THEMES[t.base], { vol: t.vol }) : t; }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function store(v) { try { if (v == null) return localStorage.getItem("bgm"); localStorage.setItem("bgm", v); } catch (e) { return null; } }
  function rnd(a) { return a[(Math.random() * a.length) | 0]; }

  /* ---------- 音訊線路 ---------- */
  function init() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    var len = ctx.sampleRate * 5, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = ir.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    var rev = ctx.createConvolver(); rev.buffer = ir;
    wet = ctx.createGain(); wet.gain.value = .9; wet.connect(rev); rev.connect(master);
    dry = ctx.createGain(); dry.gain.value = .55; dry.connect(master);
    echo = ctx.createDelay(1.5); echoFb = ctx.createGain(); echo.connect(echoFb); echoFb.connect(echo); echo.connect(wet);
    // 環境聲（風、流水）：循環的雜訊，經過濾波，音量由很慢的起伏控制
    var nb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), nd = nb.getChannelData(0);
    for (var j = 0; j < nd.length; j++) nd[j] = Math.random() * 2 - 1;
    noise = ctx.createBufferSource(); noise.buffer = nb; noise.loop = true;
    noiseF = ctx.createBiquadFilter(); noiseG = ctx.createGain(); noiseG.gain.value = 0;
    lfo = ctx.createOscillator(); lfoG = ctx.createGain(); lfo.connect(lfoG); lfoG.connect(noiseG.gain);
    noise.connect(noiseF); noiseF.connect(noiseG); noiseG.connect(dry); noiseG.connect(wet);
    noise.start(); lfo.start();
  }
  function applyTheme() {
    th = theme(scene);
    echo.delayTime.setValueAtTime(th.echo[0], ctx.currentTime); echoFb.gain.setValueAtTime(th.echo[1], ctx.currentTime);
    var n = th.noise;
    noiseF.type = n ? n.type : "lowpass"; noiseF.frequency.value = n ? n.f : 500; noiseF.Q.value = n ? n.q : .5;
    noiseG.gain.setValueAtTime(n ? n.lvl : 0, ctx.currentTime); lfo.frequency.value = n ? n.rate : .1; lfoG.gain.value = n ? n.lvl * .8 : 0;
    nextAt = ctx.currentTime + .15; idx = 0;
  }

  /* ---------- 樂器 ---------- */
  function pad(notes, t, p, len) {
    var end = t + len + 3.5, lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = p.cut; lp.Q.value = .3;
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(p.lvl, t + p.atk);
    if (p.swell) for (var s = t + p.atk; s < t + len; s += p.swell) { g.gain.linearRampToValueAtTime(p.lvl * .45, s + p.swell * .5); g.gain.linearRampToValueAtTime(p.lvl, s + p.swell); }
    g.gain.setValueAtTime(p.lvl, t + len - .5); g.gain.linearRampToValueAtTime(0, end);
    lp.connect(g); g.connect(dry); g.connect(wet);
    notes.forEach(function (m) {
      [-5, 5].forEach(function (cents, k) {
        var o = ctx.createOscillator(); o.type = k ? p.type : "sine"; o.frequency.value = hz(m); o.detune.value = cents;
        o.connect(lp); o.start(t); o.stop(end + .1);
      });
    });
    if (p.drone) { var o2 = ctx.createOscillator(), g2 = ctx.createGain(); o2.frequency.value = hz(p.drone); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.06, t + p.atk); g2.gain.linearRampToValueAtTime(0, end); o2.connect(g2); g2.connect(dry); g2.connect(wet); o2.start(t); o2.stop(end + .1); }
  }
  // 依音色組合出不同的「樂器」：[泛音倍數, 音量]、起音、衰減時間、送到回聲的比例
  var VOICES = {
    bell: { parts: [[1, 1], [2.01, .22], [3.98, .06]], atk: .008, dec: 3.2, echo: 1 },
    harp: { parts: [[1, 1], [2, .3], [3, .1]], atk: .004, dec: 1.6, echo: .6, type: "triangle" },
    kalimba: { parts: [[1, 1], [5.4, .12]], atk: .003, dec: 1.1, echo: .5 },
    glass: { parts: [[1, 1], [2.76, .25], [5.4, .08]], atk: .01, dec: 4.5, echo: 1 },
    flute: { parts: [[1, 1], [2, .12]], atk: .35, dec: 2.6, echo: .8, vib: 5 }
  };
  function note(m, t, v, voice) {
    var vc = VOICES[voice], g = ctx.createGain(), end = t + vc.dec;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + vc.atk); g.gain.exponentialRampToValueAtTime(.0001, end);
    var eg = ctx.createGain(); eg.gain.value = vc.echo;
    g.connect(dry); g.connect(wet); g.connect(eg); eg.connect(echo);
    vc.parts.forEach(function (p) {
      var o = ctx.createOscillator(), og = ctx.createGain(); o.type = vc.type || "sine"; o.frequency.value = hz(m) * p[0]; og.gain.value = p[1];
      if (vc.vib) { var vb = ctx.createOscillator(), vg = ctx.createGain(); vb.frequency.value = vc.vib; vg.gain.value = hz(m) * p[0] * .006; vb.connect(vg); vg.connect(o.frequency); vb.start(t); vb.stop(end + .05); }
      o.connect(og); og.connect(g); o.start(t); o.stop(end + .05);
    });
  }
  function schedule() {
    var now = ctx.currentTime;
    while (nextAt < now + 1.5) {
      var k = idx % th.chords.length, len = th.len, sc = th.notes[k];
      pad(th.chords[k], nextAt, th.pad, len);
      if (th.arp) {
        // 分解和弦：上行再下行，像撥弦
        var seq = sc.concat(sc.slice(1, -1).reverse()), i = 0;
        for (var t = nextAt + .2; t < nextAt + len - .2; t += th.arp, i++) if (Math.random() > .12) note(seq[i % seq.length], t, th.v[0] + Math.random() * (th.v[1] - th.v[0]), th.voice);
      } else {
        for (var t2 = nextAt + .4 + Math.random() * .6; t2 < nextAt + len - .4; t2 += rnd(th.every)) note(rnd(sc), t2, th.v[0] + Math.random() * (th.v[1] - th.v[0]), th.voice);
      }
      nextAt += len; idx++;
    }
  }

  /* ---------- 控制 ---------- */
  function ramp(v, sec) { if (!ctx) return; var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(v, t + sec); }
  function target() { return on && !ducked && !document.hidden ? theme(scene).vol : 0; }
  function start() {
    if (!AC) return;
    if (!ctx) { init(); applyTheme(); }
    ctx.resume(); if (nextAt < ctx.currentTime) nextAt = ctx.currentTime + .1;
    if (!timer) { schedule(); timer = setInterval(schedule, 400); }
    ramp(target(), 2.5);
  }
  function stop() {
    if (!ctx) return; ramp(0, 1.2);
    setTimeout(function () { if (!on && timer) { clearInterval(timer); timer = null; ctx.suspend(); } }, 1400);
  }
  function setScene(name) {
    if (!THEMES[name]) name = "lobby";
    if (name === scene) { if (ctx && on) ramp(target(), 1.5); return; }
    scene = name;
    if (!ctx || !on) { if (ctx) applyTheme(); return; }
    // 換場景：先淡出，換曲，再淡入
    clearTimeout(switching); ramp(0, .9);
    switching = setTimeout(function () { applyTheme(); ramp(target(), 3); }, 1000);
  }
  function paint() {
    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("aria-label", on ? "關閉背景音樂" : "播放背景音樂");
      b.title = on ? "關閉背景音樂" : "播放背景音樂";
      b.classList.toggle("on", on);
      var t = b.querySelector(".bgm-t"); if (t) t.textContent = on ? "音樂開" : "音樂";
    });
  }
  function set(v) { on = v; store(v ? "1" : "0"); if (on) start(); else stop(); paint(); }

  document.addEventListener("visibilitychange", function () { if (!ctx || !on) return; if (document.hidden) ramp(0, .3); else { ctx.resume(); ramp(target(), 1.5); } });
  // 上次開著音樂：等使用者第一次點畫面時再開始（瀏覽器規定）
  if (AC && store() === "1") {
    on = true;
    var first = function (e) { document.removeEventListener("pointerdown", first, true); if (e.target.closest && e.target.closest(".bgm-btn")) return; if (on) start(); };
    document.addEventListener("pointerdown", first, true);
  }
  return {
    available: !!AC,
    // 產生一個開關按鈕；compact 只顯示音符圖示
    button: function (compact) {
      var b = document.createElement("button"); b.type = "button"; b.className = "bgm-btn" + (compact ? " compact" : "");
      b.innerHTML = '<span class="bgm-note" aria-hidden="true">♪</span><span class="bgm-ico" aria-hidden="true"><i></i><i></i><i></i></span>' + (compact ? "" : '<span class="bgm-t">音樂</span>');
      b.addEventListener("click", function (e) { e.stopPropagation(); set(!on); });
      btns = btns.filter(function (x) { return x.isConnected; }); btns.push(b); paint(); return b;
    },
    scene: setScene,
    duck: function (d) { ducked = d; if (ctx && on) ramp(target(), d ? .4 : 2); },
    isOn: function () { return on; }
  };
})();
