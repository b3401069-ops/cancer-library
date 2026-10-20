/* 網站主程式：切換書館與文章頁、產生備援書架、把文章資料排版成頁面。
   文章內容在 articles/*.js，癌別清單在 data/cancers.js，
   動畫圖解在 js/figures.js，互動工具在 js/widgets.js；這裡只負責「怎麼排版」。 */
window.App = (function () {
  "use strict";
  var CANCERS = window.CANCERS || [], TREATMENTS = window.TREATMENTS || [], ARTICLES = window.ARTICLES || {}, F = window.Figures, W = window.Widgets;
  var $ = function (s) { return document.querySelector(s); };
  var lobbyEl = $("#lobby"), articleEl = $("#article"), shelfEl = $("#shelf"), toastEl = $("#toast");
  var has3D = false, staticMode = false, printMode = false, toastTimer, curId = null, curBooklet = false, lastCancer = null, scrollMem = {};
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SCALES = [1, 1.15, 1.3], scaleIdx = 0;
  try { scaleIdx = Math.max(0, Math.min(2, parseInt(localStorage.getItem("fontScale") || "0", 10) || 0)); } catch (e) {}
  document.documentElement.style.setProperty("--scale", SCALES[scaleIdx]);

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------- 動畫：離開畫面就暫停，減少動態時停在完整畫面 ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var s = e.target, on = e.isIntersecting && !reduced;
      // 離開畫面：SVG 內建動畫與 CSS 動畫都暫停，捲動時不浪費效能
      s.classList.toggle("off", !on);
      if (s.pauseAnimations) { if (on) s.unpauseAnimations(); else s.pauseAnimations(); }
    });
  }, { rootMargin: "80px" }) : null;
  // 手機等觸控裝置：拿掉 SVG 的模糊光暈濾鏡（很耗效能，視覺差異不大）
  var lowPower = window.matchMedia && matchMedia("(pointer: coarse)").matches;
  function watchAnims() {
    if (lowPower) articleEl.querySelectorAll("svg.anim [filter]").forEach(function (n) { n.removeAttribute("filter"); });
    articleEl.querySelectorAll("svg.anim").forEach(function (s) {
      if (s.dataset.watched) return; s.dataset.watched = "1";
      if (reduced && s.setCurrentTime) { try { s.setCurrentTime(5.5); s.pauseAnimations(); } catch (e) {} return; }
      if (io) io.observe(s);
    });
  }

  /* ---------- 區塊排版 ---------- */
  function renderBlock(b, cn) {
    if (W[b.type]) return W[b.type](b, printMode);
    switch (b.type) {
      case "p": return el("p", null, b.text);
      case "h3": return el("h3", "sub-h", b.text);
      case "list": return el("ul", "l", b.items.map(function (i) { return "<li>" + i + "</li>"; }).join(""));
      case "callout":
        var c = el("aside", "call" + (b.level === "danger" ? " danger" : ""));
        c.innerHTML = '<span class="call-ico" aria-hidden="true">' + (b.level === "danger" ? "!" : "i") + "</span><div><h4>" + b.title + "</h4><div>" + b.text + "</div></div>"; return c;
      case "figure":
        if (printMode) return el("p", "fig-cap-print", "【圖解】" + b.caption);
        var fx = b.id.indexOf("mech:") === 0 ? F.mech[b.id.slice(5)] : F[b.id];
        return el("figure", "fig", (fx ? fx() : "") + "<figcaption>" + b.caption + "</figcaption>");
      case "table":
        var t = "<table><thead><tr>" + b.head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
          b.rows.map(function (r) { return "<tr>" + r.map(function (d) { return "<td>" + d + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
        return el("div", "tbl", '<div class="tbl-scroll">' + t + "</div>" + (b.note ? '<p class="note">' + b.note + "</p>" : ""));
      case "steps": return el("ol", "steps", b.items.map(function (s) { return "<li><b>" + s.t + "</b><span>" + s.d + "</span></li>"; }).join(""));
      case "video":
        var a = el("a", "vid"); a.href = b.href; a.target = "_blank"; a.rel = "noopener"; a.style.setProperty("--c", cn.color);
        a.innerHTML = '<div class="vid-art" aria-hidden="true"><div class="vid-stack"><i></i><i></i><i></i></div><span class="vid-play"></span></div>' +
          '<div class="vid-txt"><b>' + b.title + "</b><span>" + b.text + '</span><span class="vid-go">' + (b.cta || "在 YouTube 觀看") + " ↗</span>" +
          (printMode ? '<span class="vid-url">' + b.href + "</span>" : "") + "</div>";
        return a;
      case "faq":
        var f = el("div", "faqs");
        b.items.forEach(function (x) { var d = el("details", "faq", "<summary><span>" + x.q + '</span><i aria-hidden="true"></i></summary><div class="faq-a">' + x.a + "</div>"); if (printMode) d.open = true; f.appendChild(d); });
        return f;
      case "sources": return el("ol", "src", b.items.map(function (s) { return '<li><a href="' + s.href + '" target="_blank" rel="noopener">' + s.t + "</a></li>"; }).join(""));
    }
    return document.createTextNode("");
  }

  /* ---------- 文章頁 ---------- */
  function renderArticle(id) {
    var art = ARTICLES[id], booklet = art.kind === "booklet";
    var cn = CANCERS.concat(TREATMENTS).filter(function (c) { return c.id === id; })[0] || { color: "#3b418f", name: art.title, en: "" };
    if (!booklet) lastCancer = id;
    var from = booklet && lastCancer ? CANCERS.filter(function (c) { return c.id === lastCancer; })[0] : null;
    curId = id; curBooklet = booklet; articleEl.innerHTML = ""; articleEl.style.setProperty("--c", cn.color);
    W.beginRender(id);
    W.setVideos(art.videos || (art.videosFrom && ARTICLES[art.videosFrom] ? ARTICLES[art.videosFrom].videos : []));

    // 上方工具列
    var bar = el("div", "bar"), barIn = el("div", "bar-in");
    var back = el("button", "back", '<span aria-hidden="true">←</span> ' + (from ? from.name : "書館")); back.type = "button";
    back.addEventListener("click", function () { location.hash = from ? from.id : ""; });
    var ttl = el("div", "bar-title", art.title);
    var sizes = el("div", "seg"); sizes.setAttribute("role", "group"); sizes.setAttribute("aria-label", "字體大小");
    ["A", "A+", "A++"].forEach(function (lbl, i) {
      var b = el("button", null, lbl); b.type = "button"; b.setAttribute("aria-pressed", i === scaleIdx ? "true" : "false");
      b.setAttribute("aria-label", ["標準字", "大字", "特大字"][i]);
      b.addEventListener("click", function () {
        scaleIdx = i; document.documentElement.style.setProperty("--scale", SCALES[i]);
        try { localStorage.setItem("fontScale", String(i)); } catch (e) {}
        sizes.querySelectorAll("button").forEach(function (x, j) { x.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      });
      sizes.appendChild(b);
    });
    var pv = el("button", "pv", printMode ? "網頁版" : "列印版"); pv.type = "button";
    pv.setAttribute("aria-pressed", printMode ? "true" : "false");
    pv.addEventListener("click", function () { printMode = !printMode; document.body.classList.toggle("printview", printMode); renderArticle(id); window.scrollTo(0, 0); });
    barIn.append(back, ttl, sizes, pv);
    var toc = el("nav", "toc"); toc.setAttribute("aria-label", "章節");
    art.sections.forEach(function (s, i) {
      var a = el("a", null, '<span class="toc-n">' + (i + 1) + "</span>" + s.title); a.href = "#" + id; a.dataset.sec = s.id;
      a.addEventListener("click", function (e) { e.preventDefault(); var t = document.getElementById("s-" + s.id); if (t) t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }); });
      toc.appendChild(a);
    });
    var prog = el("div", "prog", "<i></i>");
    bar.append(barIn, toc, prog);

    // 開場：夜空與翻開的書
    var hero = el("header", "a-hero");
    hero.innerHTML =
      '<div class="sky" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<div class="a-hero-in">' +
      '<div class="tome" aria-hidden="true"><div class="tome-back"></div><div class="tome-page p1"></div><div class="tome-page p2"></div>' +
      '<div class="tome-cover"><span class="tome-sig">' + F.icon(art.sections[0].emblem || "book", 34) + "</span><b>" + cn.name + "</b><small>" + (cn.en || "").toUpperCase() + "</small></div></div>" +
      '<div class="a-hero-txt"><p class="eyebrow">' + (booklet ? '<a href="#">書館</a> › ' + (from ? '<a href="#' + from.id + '">' + from.name + "</a> › " : "") + "治療小冊" : "星夜癌症衛教書館・民眾版") + '</p><h1>' + art.title + '</h1><p class="sub">' + art.subtitle + "</p>" +
      (art.status ? '<span class="badge">' + art.status + "</span>" : "") + "</div></div>" +
      '<div class="a-hero-lead"><p class="lead">' + art.lead + "</p>" +
      (art.facts ? '<ul class="facts">' + art.facts.map(function (f) { return "<li><b>" + f.n + "</b><span>" + f.t + "</span></li>"; }).join("") + "</ul>" : "") + "</div>";

    var wrap = el("div", "wrap");
    wrap.appendChild(el("div", "printnote", "這是列印版面：動畫與互動已展開成文字。請用瀏覽器選單的「列印」印出，或請門診人員協助列印。"));
    var meta = el("p", "meta", "最後更新：" + art.updated + "　審核：" + art.reviewer + "　共 " + art.sections.length + " 章");
    wrap.appendChild(meta);
    art.sections.forEach(function (s, i) {
      var sec = el("section", "sec"); sec.id = "s-" + s.id;
      sec.appendChild(el("div", "ch-head",
        '<span class="emblem" aria-hidden="true">' + F.icon(s.emblem || "book", 30) + '<svg class="ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30"/></svg></span>' +
        '<div><span class="ch-n">第 ' + (i + 1) + " 章</span><h2>" + s.title + "</h2>" + (s.intro ? '<p class="ch-intro">' + s.intro + "</p>" : "") + "</div>"));
      var body = el("div", "ch-body");
      s.blocks.forEach(function (b) { var n = renderBlock(b, cn); if (n.nodeType === 1) n.classList.add("rv"); body.appendChild(n); });
      sec.appendChild(body); wrap.appendChild(sec);
    });
    var end = el("div", "end");
    end.innerHTML = '<div class="end-orn" aria-hidden="true">✦</div><p>讀完這本書了。還有其他想了解的，可以回到書館，或在看診時問問醫療團隊。</p>';
    if (from) { var fb = el("button", "btn-p", "回到《" + from.name + "》"); fb.type = "button"; fb.addEventListener("click", function () { location.hash = from.id; }); end.appendChild(fb); }
    if (!booklet) end.appendChild(W.booklets({ cancer: id, title: "延伸閱讀：治療小冊" }, printMode));
    var endBtn = el("button", from ? "btn-s" : "btn-p", "回到書館"); endBtn.type = "button"; endBtn.addEventListener("click", function () { location.hash = ""; });
    end.appendChild(endBtn);
    wrap.appendChild(end);
    wrap.appendChild(el("p", "disc", "本網站內容僅供衛教參考，不能取代醫師的診斷與治療建議。每位病人的情況不同，實際治療請與您的主治醫師討論。"));
    // 浮動按鈕：小冊左下角「回到原本那一篇」；右下角「回到頂端」
    var fab = el("div", "fabs");
    if (booklet) {
      var ret = el("button", "fab-back", '<span aria-hidden="true">←</span> 回到' + (from ? "《" + from.name + "》" : "書館")); ret.type = "button";
      ret.addEventListener("click", function () { location.hash = from ? from.id : ""; });
      fab.appendChild(ret);
    } else fab.appendChild(el("span"));
    var up = el("button", "fab-up", '<span aria-hidden="true">↑</span><span class="sr">回到頂端</span>'); up.type = "button";
    up.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });
    fab.appendChild(up);
    articleEl.append(bar, hero, wrap, fab);
    if (io) io.observe(hero); // 開場夜空捲出畫面後暫停星星動畫
    requestAnimationFrame(function () { articleEl.style.setProperty("--barh", barH() + "px"); });
    watchAnims(); trackChapters();
  }

  /* ---------- 閱讀進度與目前章節 ---------- */
  var secIO = null;
  function trackChapters() {
    if (secIO) secIO.disconnect();
    if (!("IntersectionObserver" in window)) return;
    secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id.replace("s-", "");
        articleEl.querySelectorAll(".toc a").forEach(function (a) {
          var on = a.dataset.sec === id; a.classList.toggle("on", on);
          if (on && a.parentNode.scrollTo) a.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: reduced ? "auto" : "smooth" });
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    articleEl.querySelectorAll("section.sec").forEach(function (s) { secIO.observe(s); });
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (articleEl.hidden || ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? scrollY / h : 0;
      var bar = articleEl.querySelector(".prog i"); if (bar) bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
      articleEl.classList.toggle("scrolled", scrollY > 900);
    });
  }, { passive: true });

  /* ---------- 備援書架 ---------- */
  function renderShelf(filter) {
    var ul = $("#books"); ul.innerHTML = "";
    var f = (filter || "").trim();
    CANCERS.filter(function (c) { return !f || c.name.indexOf(f) > -1 || c.en.toLowerCase().indexOf(f.toLowerCase()) > -1; }).forEach(function (c) {
      var li = el("li"), b = el("button", "book" + (c.ready ? " ready" : "")); b.type = "button";
      b.style.setProperty("--c", c.color);
      b.innerHTML = '<span class="tag">' + (c.ready ? "可閱讀" : "撰寫中") + "</span><div><b>" + c.name + "</b><br><em>" + c.en.toUpperCase() + "</em></div>";
      b.addEventListener("click", function () { if (c.ready) location.hash = c.id; else notReady(c); });
      li.appendChild(b); ul.appendChild(li);
    });
    var tx = TREATMENTS.filter(function (c) { return !f || c.name.indexOf(f) > -1; });
    if (tx.length) {
      ul.appendChild(el("li", "shelf-sub", "治療小冊"));
      tx.forEach(function (c) {
        var li = el("li"), b = el("button", "book booklet ready"); b.type = "button"; b.style.setProperty("--c", c.color);
        b.innerHTML = '<span class="tag">治療小冊</span><div><b>' + c.name + "</b><br><em>" + c.short + "</em></div>";
        b.addEventListener("click", function () { location.hash = c.id; });
        li.appendChild(b); ul.appendChild(li);
      });
    }
    if (!ul.children.length) ul.appendChild(el("li", null, '<p style="color:var(--mist)">找不到符合的癌別，請換個關鍵字。</p>'));
  }
  function notReady(c) {
    var ready = CANCERS.filter(function (x) { return x.ready; }).map(function (x) { return "《" + x.name + "》"; }).join("、");
    toastEl.textContent = "《" + c.name + "》還在撰寫中，目前可以先閱讀" + ready + "。";
    toastEl.hidden = false; toastEl.style.opacity = 1; clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.style.opacity = 0; setTimeout(function () { toastEl.hidden = true; }, 400); }, 2600);
  }
  function openShelf() { shelfEl.hidden = false; renderShelf($("#q").value); if (has3D) window.Lobby.stop(); }
  function closeShelf() { if (staticMode) return; shelfEl.hidden = true; if (has3D) window.Lobby.start(); }

  /* ---------- 切換 ---------- */
  function showLobby() {
    articleEl.hidden = true; lobbyEl.hidden = false; document.body.classList.remove("reading");
    if (printMode) { printMode = false; document.body.classList.remove("printview"); }
    if (has3D) { window.Lobby.reset(); if (shelfEl.hidden) window.Lobby.start(); }
  }
  function barH() { var b = articleEl.querySelector(".bar"); return b ? b.getBoundingClientRect().height : 100; }
  function showArticle(id) {
    if (has3D) window.Lobby.stop();
    // 離開一篇文章前記住讀到哪裡；從小冊回到原本的癌別文章時，回到剛才的位置
    var wasBooklet = curBooklet;
    if (curId && !articleEl.hidden) scrollMem[curId] = scrollY;
    renderArticle(id); lobbyEl.hidden = true; articleEl.hidden = false; document.body.classList.add("reading");
    var y = wasBooklet && !curBooklet && scrollMem[id] != null ? scrollMem[id] : 0;
    window.scrollTo(0, y);
    if (y) requestAnimationFrame(function () { window.scrollTo(0, y); });
  }
  function route() {
    var id = location.hash.replace("#", "");
    if (id && ARTICLES[id]) showArticle(id); else showLobby();
  }
  function goStatic() {
    staticMode = true; has3D = false;
    $("#closeShelf").hidden = true; $("#hint").hidden = true; $("#openShelf").hidden = true;
    shelfEl.hidden = false; renderShelf("");
  }

  /* ---------- 啟動 ---------- */
  $("#openShelf").addEventListener("click", openShelf);
  $("#closeShelf").addEventListener("click", closeShelf);
  $("#q").addEventListener("input", function (e) { renderShelf(e.target.value); });
  window.addEventListener("hashchange", route);

  function boot() {
    has3D = !!(window.THREE && window.Lobby && window.Lobby.init({
      cancers: CANCERS,
      onPick: function (c) { location.hash = c.id; },
      onNotReady: notReady,
      onFallback: goStatic,
      isVisible: function () { return !lobbyEl.hidden && shelfEl.hidden; }
    }));
    if (!has3D) goStatic();
    route();
    // 安全網：書館顯示中卻一直畫不出畫面，就改用平面書架，確保一定看得到書
    if (has3D) setTimeout(function check() {
      if (staticMode || lobbyEl.hidden || !shelfEl.hidden) return;
      if (document.visibilityState !== "visible") return setTimeout(check, 2000);
      if (window.Lobby.frames() === 0 || !window.Lobby.ok()) { window.Lobby.stop(); goStatic(); }
    }, 6000);
    var ld = $("#loading"); ld.style.opacity = 0; setTimeout(function () { ld.hidden = true; }, 800);
  }
  // 等字型載入後再畫封面，避免書名用到備用字型；最多等 2.5 秒
  var fontWait = document.fonts && document.fonts.load
    ? Promise.race([Promise.all([document.fonts.load('700 80px "LXGW WenKai TC"'), document.fonts.load('500 20px "Noto Sans TC"')]), new Promise(function (r) { setTimeout(r, 2500); })])
    : Promise.resolve();
  fontWait.then(boot, boot);

  return { watchAnims: watchAnims, barH: barH };
})();
