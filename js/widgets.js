/* 互動工具：文章資料裡的互動區塊由這裡產生，所有癌別共用。
   每個工具都有「列印版」：printMode 為 true 時改成全部展開的靜態內容。 */
window.Widgets = (function () {
  "use strict";
  var F = window.Figures;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  // 每篇文章裡的選擇器依出現順序編號，記住使用者選到哪一項（返回時還原）
  var STATE = {}, SCOPE = "", COUNT = 0;
  // 一排選擇按鈕 + 內容面板
  function picker(items, label, render, opts) {
    opts = opts || {};
    var key = SCOPE + ":" + (COUNT++);
    var wrap = el("div", "picker" + (opts.cls ? " " + opts.cls : "")); wrap.dataset.key = key;
    var bar = el("div", "pick"); bar.setAttribute("role", "tablist"); bar.setAttribute("aria-label", label);
    var panel = el("div", "panel"); panel.setAttribute("role", "tabpanel");
    var btns = items.map(function (it, i) {
      var b = el("button", null, opts.btn ? opts.btn(it, i) : it.t); b.type = "button"; b.setAttribute("role", "tab");
      bar.appendChild(b); return b;
    });
    function select(i, user) {
      STATE[key] = i;
      btns.forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); });
      panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
      panel.innerHTML = ""; var c = render(items[i], i, panel); if (typeof c === "string") panel.innerHTML = c; else if (c) panel.appendChild(c);
      if (opts.footNav && items.length > 1) panel.appendChild(footNav(i));
      if (opts.onSelect) opts.onSelect(i);
      // 已經往下讀到面板中間時，換項目後把畫面帶回這組選單的開頭
      if (user) { var top = wrap.getBoundingClientRect().top, off = window.App ? window.App.barH() : 100; if (top < off) window.scrollTo({ top: scrollY + top - off - 8, behavior: "smooth" }); }
    }
    function footNav(i) {
      var n = el("div", "pk-foot"), prev = items[i - 1], next = items[i + 1];
      var name = function (it) { return it.t || (it[1] && it[1].t) || ""; };
      if (prev) { var p = el("button", "btn-s", "← " + name(prev)); p.type = "button"; p.addEventListener("click", function () { select(i - 1, true); }); n.appendChild(p); } else n.appendChild(el("span"));
      var m = el("button", "btn-s pk-menu", "↑ 回到選單"); m.type = "button";
      m.addEventListener("click", function () { var off = window.App ? window.App.barH() : 100; window.scrollTo({ top: scrollY + wrap.getBoundingClientRect().top - off - 8, behavior: "smooth" }); });
      n.appendChild(m);
      if (next) { var x = el("button", "btn-s", name(next) + " →"); x.type = "button"; x.addEventListener("click", function () { select(i + 1, true); }); n.appendChild(x); } else n.appendChild(el("span"));
      return n;
    }
    btns.forEach(function (b, i) { b.addEventListener("click", function () { select(i, true); }); });
    wrap.append(bar, panel);
    var st = STATE[key]; select(st != null && st < items.length ? st : (opts.start || 0)); return wrap;
  }
  function staticList(items, render) { var w = el("div", "print-stack"); items.forEach(function (it, i) { var p = el("div", "panel"); var c = render(it, i, p); if (typeof c === "string") p.innerHTML = c; else if (c) p.appendChild(c); w.appendChild(p); }); return w; }

  var W = {}, VIDS = {};
  W.beginRender = function (scope) { SCOPE = scope; COUNT = 0; };

  /* ---------- 影片連結卡 ---------- */
  W.setVideos = function (list) { VIDS = {}; (list || []).forEach(function (v) { VIDS[v.n] = v; }); };
  // src：其他癌別的影片（治療小冊依讀者從哪一篇點進來，列出那一癌別的影片）
  function vmap(id) { var a = (window.ARTICLES || {})[id], m = {}; ((a && a.videos) || []).forEach(function (v) { m[v.n] = v; }); return m; }
  function vcards(eps, pm, src) {
    var V = src || VIDS;
    return '<div class="vgrid">' + eps.filter(function (n) { return V[n]; }).map(function (n) {
      var v = V[n], url = "https://www.youtube.com/watch?v=" + v.id;
      return '<a class="vcard" href="' + url + '" target="_blank" rel="noopener"><span class="vc-art" aria-hidden="true"><i></i><b>' + n + '</b></span>' +
        '<span class="vc-txt"><small>第 ' + n + ' 集</small><span class="vc-t">' + v.t + "</span>" +
        (pm ? '<span class="vc-u">youtu.be/' + v.id + "</span>" : '<span class="vc-go">在 YouTube 觀看 ↗</span>') + "</span></a>";
    }).join("") + "</div>";
  }
  function vrelated(eps, pm) { return eps && eps.length ? '<div class="vrel"><span class="vrel-h">相關影片</span>' + vcards(eps, pm) + "</div>" : ""; }
  /* ---------- 治療小冊入口 ---------- */
  W.booklets = function (b, pm) {
    var list = (window.TREATMENTS || []).filter(function (t) { return t.cancers === "all" || t.cancers.indexOf(b.cancer) > -1; });
    var w = el("div", "booklets");
    w.innerHTML = (b.title ? '<h4 class="vg-h">' + b.title + "</h4>" : "") + '<div class="bk-grid">' + list.map(function (t) {
      return '<a class="bk-card" href="#' + t.id + '" style="--c:' + t.color + '"><span class="bk-spine" aria-hidden="true">' + F.icon(t.icon, 26) + "</span>" +
        '<span class="bk-txt"><b>' + t.name + "</b><span>" + t.short + "</span></span>" + (pm ? "" : '<span class="bk-go" aria-hidden="true">→</span>') + "</a>";
    }).join("") + "</div>";
    return w;
  };
  function bookLink(id) {
    var t = (window.TREATMENTS || []).filter(function (x) { return x.id === id; })[0];
    return t ? '<a class="bk-link" href="#' + t.id + '">閱讀《' + t.name + "》治療小冊 →</a>" : "";
  }

  /* ---------- 化療週期 ---------- */
  W.cycle = function (b, pm) {
    var tone = function (p) { return "var(--" + (p.tone === "red" ? "red" : p.tone === "amber" ? "amber" : p.tone === "good" ? "good" : "gold") + ")"; };
    var r = function (p) { return "<h4>第 " + p.from + (p.to > p.from ? "–" + p.to : "") + " 天：" + p.t + "</h4><p>" + p.d + "</p>"; };
    if (pm) return staticList(b.phases, r);
    var w = el("div", "tool cycle");
    var bar = '<div class="cy-bar">' + b.phases.map(function (p) {
      return '<i style="flex:' + (p.to - p.from + 1) + ";background:" + tone(p) + '"></i>';
    }).join("") + '<span class="cy-mark"></span></div>';
    w.innerHTML = '<div class="cy-head"><span class="cy-day">第 <b>1</b> 天</span><span class="cy-of">/ ' + b.days + " 天一個週期</span></div>" + bar +
      '<label class="cy-lbl" for="cy-range">拖動選擇第幾天</label><input type="range" id="cy-range" min="1" max="' + b.days + '" value="1">' +
      '<div class="cy-ticks" aria-hidden="true"><span>第 1 天</span><span>第 7 天</span><span>第 14 天</span><span>第 21 天</span></div><div class="panel cy-panel" aria-live="polite"></div>';
    var rg = w.querySelector("#cy-range"), day = w.querySelector(".cy-day b"), mk = w.querySelector(".cy-mark"), pn = w.querySelector(".cy-panel"), last = null;
    function upd() {
      var d = +rg.value, p = b.phases.filter(function (x) { return d >= x.from && d <= x.to; })[0];
      day.textContent = d; mk.style.left = ((d - .5) / b.days * 100) + "%"; mk.style.borderColor = tone(p);
      if (p !== last) { pn.classList.remove("swap"); void pn.offsetWidth; pn.classList.add("swap"); pn.style.borderLeftColor = tone(p); pn.innerHTML = r(p); last = p; }
    }
    rg.addEventListener("input", upd); upd(); return w;
  };

  /* ---------- 手術：切除範圍 ---------- */
  function meter(n, of, label) {
    var d = ""; for (var i = 0; i < of; i++) d += '<i class="' + (i < n ? "on" : "") + '"></i>';
    return '<div class="meter"><span>' + label + '</span><span class="m-dots" aria-label="' + n + " / " + of + '">' + d + "</span></div>";
  }
  // 圖解選單：fig 指定圖解（預設肺部切除範圍）；keep 顯示保留功能的刻度；dl 為額外的說明欄位 [[標題, 內容], ...]
  W.resections = function (b, pm) {
    var fig = F[b.fig || "resection"];
    var r = function (x) {
      return (pm ? "" : '<div class="fig mini-fig">' + fig(x.k) + "</div>") +
        "<h4>" + x.t + "</h4><p>" + x.d + "</p>" + (x.keep != null ? meter(x.keep, 4, b.meter || "保留的肺功能") : "") +
        "<dl>" + (x.fit ? "<dt>適合情況</dt><dd>" + x.fit + "</dd>" : "") + (x.dl || []).map(function (d) { return "<dt>" + d[0] + "</dt><dd>" + d[1] + "</dd>"; }).join("") + "</dl>";
    };
    return pm ? staticList(b.items, r) : picker(b.items, b.label || "選擇切除範圍", r, { cls: "split-pick", footNav: true, onSelect: function () { if (window.App) window.App.watchAnims(); } });
  };
  W.approaches = function (b, pm) {
    var r = function (x) {
      return (pm ? "" : '<div class="fig mini-fig">' + F.approach(x.k) + "</div>") +
        "<h4>" + x.t + "</h4><p>" + x.d + '</p><dl><dt>恢復</dt><dd>' + x.recover + "</dd><dt>費用</dt><dd>" + x.cost + "</dd></dl>";
    };
    return pm ? staticList(b.items, r) : picker(b.items, "選擇手術方式", r, { cls: "split-pick", footNav: true, onSelect: function () { if (window.App) window.App.watchAnims(); } });
  };
  /* ---------- 放射治療技術比較 ---------- */
  W.rttech = function (b, pm) {
    var r = function (x) {
      var cal = ""; for (var i = 0; i < x.n; i++) cal += "<i></i>";
      return (pm ? "" : '<div class="fig mini-fig">' + F.rtTech(x.k) + "</div>") +
        "<h4>" + x.t + "</h4>" +
        '<div class="rt-cal"><span class="rt-cal-l">治療次數</span><span class="rt-dots' + (x.n > 12 ? " many" : "") + '">' + cal + '</span><span class="rt-cal-t">' + x.sessions + "</span></div>" +
        '<dl class="rt-dl"><dt>劑量形狀</dt><dd>' + x.shape + "</dd><dt>適合情況</dt><dd>" + x.fit + "</dd><dt>健保</dt><dd>" + x.nhi + "</dd></dl>";
    };
    return pm ? staticList(b.items, r) : picker(b.items, "選擇放射治療技術", r, { cls: "split-pick rt-pick", footNav: true, onSelect: function () { if (window.App) window.App.watchAnims(); } });
  };
  /* ---------- 免疫治療的合併方式 ---------- */
  W.combos = function (b) {
    var col = { "免疫": "#6a5cae", "化療": "#a8553a", "抗血管新生": "#2f8a86", "放療": "#c08a2e", "化放療": "#c08a2e", "手術": "#4f78b0", "另一種免疫": "#8a6fd1" };
    var w = el("div", "combos");
    w.innerHTML = (b.title ? '<h4 class="vg-h">' + b.title + "</h4>" : "") + b.items.map(function (c, i) {
      var parts = c.parts.map(function (p) {
        if (p === "+" || p === "→") return '<span class="cb-op">' + p + "</span>";
        return '<span class="cb-pill" style="--pc:' + (col[p] || "#3b418f") + '">' + p + "</span>";
      }).join("");
      return '<div class="cb-row' + (c.common ? " common" : "") + '" style="--d:' + (i * .08) + 's"><div class="cb-eq">' + parts + "</div>" +
        '<div class="cb-txt"><b>' + c.t + "</b><span>" + c.when + "</span></div>" + (c.common ? '<span class="cb-tag">很常見</span>' : "") + "</div>";
    }).join("");
    return w;
  };
  /* ---------- 全身圖：點選部位看副作用 ---------- */
  W.bodymap = function (b, pm) {
    var r = function (x) {
      return '<h4>' + x.t + "</h4>" +
        '<div class="bm-row"><span class="bm-tag ok">常見表現</span><p>' + x.common + "</p></div>" +
        '<div class="bm-row"><span class="bm-tag warn">要立即就醫</span><p>' + x.warn + "</p></div>" +
        (x.tip ? '<div class="bm-row"><span class="bm-tag tip">怎麼處理</span><p>' + x.tip + "</p></div>" : "");
    };
    if (pm) return staticList(b.items, r);
    var w = el("div", "bodymap");
    var fig = el("div", "fig bm-fig"); fig.innerHTML = F.body(b.items) + '<p class="bm-hint">點身上發光的地方</p>';
    var side = el("div", "bm-side");
    var chips = el("div", "bm-chips"); chips.setAttribute("role", "group"); chips.setAttribute("aria-label", "選擇身體部位");
    var panel = el("div", "panel bm-panel"); panel.setAttribute("aria-live", "polite");
    var btns = b.items.map(function (x, i) {
      var c = el("button", "bm-chip", x.t); c.type = "button"; c.addEventListener("click", function () { pick(i); }); chips.appendChild(c); return c;
    });
    var spots = fig.querySelectorAll(".bm-spot");
    spots.forEach(function (sp) {
      sp.addEventListener("click", function () { b.items.forEach(function (x, i) { if (x.id === sp.dataset.id) pick(i); }); });
    });
    function pick(i) {
      btns.forEach(function (c, j) { c.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      spots.forEach(function (sp) { sp.classList.toggle("on", sp.dataset.id === b.items[i].id); });
      panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap"); panel.innerHTML = r(b.items[i]);
    }
    side.append(chips, panel); w.append(fig, side); pick(0); return w;
  };

  /* ---------- 小測驗 ---------- */
  W.quiz = function (b, pm) {
    var r = function (q, i) { return "<h4>" + (i + 1) + ". " + q.q + "</h4><p><b>答案：" + q.opts[q.a] + "</b>。" + q.why + "</p>"; };
    if (pm) return staticList(b.items, r);
    var w = el("div", "tool quiz"), i = 0, score = 0, answered = false;
    w.innerHTML = '<div class="qz-top"><span class="qz-n"></span><span class="qz-bar"><i></i></span></div><div class="qz-body" aria-live="polite"></div>';
    var body = w.querySelector(".qz-body"), n = w.querySelector(".qz-n"), bar = w.querySelector(".qz-bar i");
    function show() {
      var q = b.items[i]; answered = false;
      n.textContent = "第 " + (i + 1) + " / " + b.items.length + " 題"; bar.style.width = (i / b.items.length * 100) + "%";
      body.innerHTML = '<h4 class="qz-q">' + q.q + '</h4><div class="qz-opts"></div><div class="qz-fb" hidden></div>';
      var box = body.querySelector(".qz-opts"), fb = body.querySelector(".qz-fb");
      q.opts.forEach(function (o, k) {
        var btn = el("button", "qz-opt", o); btn.type = "button";
        btn.addEventListener("click", function () {
          if (answered) return; answered = true;
          var ok = k === q.a; if (ok) score++;
          box.querySelectorAll("button").forEach(function (x, m) { x.disabled = true; if (m === q.a) x.classList.add("right"); else if (m === k) x.classList.add("wrong"); });
          fb.hidden = false; fb.className = "qz-fb " + (ok ? "ok" : "no");
          fb.innerHTML = "<b>" + (ok ? "答對了！" : "再想想看：") + "</b>" + q.why;
          var next = el("button", "btn-p", i < b.items.length - 1 ? "下一題 →" : "看結果"); next.type = "button";
          next.addEventListener("click", function () { i++; if (i < b.items.length) show(); else done(); });
          fb.appendChild(next);
        });
        box.appendChild(btn);
      });
    }
    function done() {
      bar.style.width = "100%"; n.textContent = "完成";
      var all = score === b.items.length;
      body.innerHTML = '<div class="qz-done"><div class="qz-score"><b>' + score + "</b>/" + b.items.length + "</div><p>" +
        (all ? "全部答對，你已經很了解" + (b.topic || "這個主題") + "了！" : "答錯的地方，可以回到前面的章節再看看，或在看診時問問醫療團隊。") + "</p></div>";
      var again = el("button", "btn-s", "再做一次"); again.type = "button"; again.addEventListener("click", function () { i = 0; score = 0; show(); });
      body.querySelector(".qz-done").appendChild(again);
    }
    show(); return w;
  };

  /* ---------- 本院癌症資源中心 ---------- */
  W.resource = function (b) {
    var S = (window.SITE && window.SITE.resource) || null; if (!S) return el("div");
    var w = el("aside", "resource");
    w.innerHTML = '<div class="rs-head"><span class="rs-ico" aria-hidden="true">' + F.icon("heart", 26) + "</span><div><small>" + window.SITE.hospital + "</small><b>" + S.name + "</b>" +
      (S.slogan ? '<span class="rs-slogan">' + S.slogan + "</span>" : "") + "</div></div>" +
      "<p>" + (b.text || S.intro) + "</p>" +
      '<div class="rs-svc">' + S.services.map(function (x) { return '<div class="rs-card"><b>' + x.t + "</b><span>" + x.d + "</span></div>"; }).join("") + "</div>" +
      '<div class="rs-contact">' +
      '<div class="rs-c"><span class="rs-l">個管聯絡電話</span><a class="rs-tel" href="tel:' + S.tel + '">' + S.phone + '</a><span class="rs-ext">分機 ' + S.ext.join("、") + "</span></div>" +
      '<div class="rs-c"><span class="rs-l">LINE 官方帳號</span><a class="rs-line" href="' + S.lineUrl + '" target="_blank" rel="noopener">' + S.line + ' ↗</a><span class="rs-ext">加入好友，隨時詢問</span></div>' +
      '<div class="rs-c"><span class="rs-l">地點</span><b class="rs-place">' + S.place + '</b><button type="button" class="btn-s rs-map-btn" aria-expanded="false">怎麼走？</button></div>' +
      (S.hours ? '<div class="rs-c"><span class="rs-l">服務時間</span><b>' + S.hours + "</b>" + (S.afterHours ? '<span class="rs-ext">' + S.afterHours + "</span>" : "") + "</div>" : "") +
      "</div>" +
      '<div class="rs-map" hidden><div class="fig">' + F.resourceMap() + '</div><p class="rs-route">' + S.route + "</p></div>";
    var btn = w.querySelector(".rs-map-btn"), map = w.querySelector(".rs-map");
    btn.addEventListener("click", function () { map.hidden = !map.hidden; btn.setAttribute("aria-expanded", map.hidden ? "false" : "true"); btn.textContent = map.hidden ? "怎麼走？" : "收起地圖"; });
    return w;
  };

  W.videos = function (b, pm) {
    var w = el("div", "videos");
    if (b.groups) b.groups.forEach(function (g) { w.insertAdjacentHTML("beforeend", '<h4 class="vg-h">' + g.t + "</h4>" + vcards(g.eps, pm, b.from ? vmap(b.from) : null)); });
    else w.innerHTML = (b.title ? '<h4 class="vg-h">' + b.title + "</h4>" : "") + vcards(b.eps, pm, b.from ? vmap(b.from) : null);
    return w;
  };

  W.tabs = function (b, pm) {
    var r = function (it) { return (pm ? "<h4>" + it.t + "</h4>" : "") + it.html; };
    return pm ? staticList(b.items, r) : picker(b.items, "分類", r);
  };

  W.risks = function (b) {
    return el("ul", "chips", b.items.map(function (r) { return '<li class="chip"><span class="chip-ico">' + F.icon(r.icon) + "</span><div><b>" + r.t + "</b><span>" + r.d + "</span></div></li>"; }).join(""));
  };
  W.symptoms = function (b) {
    return el("ul", "chips sym", b.items.map(function (r) { return '<li class="chip"><span class="chip-ico">' + F.icon(r.icon) + "</span><div><b>" + r.t + "</b><span>" + r.d + "</span></div></li>"; }).join(""));
  };

  /* ---------- 篩檢資格計算 ---------- */
  W.screening = function (b, pm) {
    if (pm) return el("div");
    if (b.kind === "crc") return crcScreen();
    var w = el("form", "tool screen-tool"); w.setAttribute("aria-label", "肺癌篩檢資格檢查");
    w.innerHTML =
      '<div class="row"><span class="lbl">性別</span><div class="seg2" role="radiogroup" aria-label="性別">' +
      '<label><input type="radio" name="sx" id="sx-m" value="m" checked><span>男性</span></label><label><input type="radio" name="sx" id="sx-f" value="f"><span>女性</span></label></div></div>' +
      '<div class="row"><label class="lbl" for="sc-age">年齡</label><div class="num"><button type="button" data-d="-1" data-t="sc-age" aria-label="年齡減一">−</button><input id="sc-age" type="number" inputmode="numeric" min="18" max="100" value="55"><button type="button" data-d="1" data-t="sc-age" aria-label="年齡加一">＋</button><span>歲</span></div></div>' +
      '<div class="row"><span class="lbl">家族史</span><label class="tg"><input type="checkbox" id="sc-fam"><span>父母、子女或兄弟姊妹曾得肺癌</span></label></div>' +
      '<div class="row"><span class="lbl">吸菸</span><div class="seg2" role="radiogroup" aria-label="吸菸狀況">' +
      '<label><input type="radio" name="sm" id="sm-n" value="n" checked><span>從不吸菸</span></label><label><input type="radio" name="sm" id="sm-y" value="y"><span>仍在吸菸</span></label><label><input type="radio" name="sm" id="sm-q" value="q"><span>已戒菸</span></label></div></div>' +
      '<div class="row smk" hidden><label class="lbl" for="sc-ppd">每天幾包</label><div class="num"><button type="button" data-d="-0.5" data-t="sc-ppd" aria-label="減半包">−</button><input id="sc-ppd" type="number" inputmode="decimal" step="0.5" min="0" max="5" value="1"><button type="button" data-d="0.5" data-t="sc-ppd" aria-label="加半包">＋</button><span>包</span></div></div>' +
      '<div class="row smk" hidden><label class="lbl" for="sc-yrs">吸了幾年</label><div class="num"><button type="button" data-d="-1" data-t="sc-yrs" aria-label="減一年">−</button><input id="sc-yrs" type="number" inputmode="numeric" min="0" max="80" value="20"><button type="button" data-d="1" data-t="sc-yrs" aria-label="加一年">＋</button><span>年</span></div></div>' +
      '<div class="row quit" hidden><label class="lbl" for="sc-q">戒菸幾年</label><div class="num"><button type="button" data-d="-1" data-t="sc-q" aria-label="減一年">−</button><input id="sc-q" type="number" inputmode="numeric" min="0" max="80" value="5"><button type="button" data-d="1" data-t="sc-q" aria-label="加一年">＋</button><span>年</span></div></div>' +
      '<div class="result" aria-live="polite"></div>';
    var res = w.querySelector(".result");
    function v(id) { return parseFloat(w.querySelector("#" + id).value) || 0; }
    function calc() {
      var sex = w.querySelector('input[name="sx"]:checked').value, sm = w.querySelector('input[name="sm"]:checked').value, age = v("sc-age");
      w.querySelectorAll(".smk").forEach(function (r) { r.hidden = sm === "n"; });
      w.querySelector(".quit").hidden = sm !== "q";
      var why = [], ok = false;
      if (w.querySelector("#sc-fam").checked) {
        var lo = sex === "m" ? 45 : 40;
        if (age >= lo && age <= 74) { ok = true; why.push("有肺癌家族史，且年齡在 " + lo + "–74 歲"); }
        else why.push("家族史族群的年齡範圍是" + (sex === "m" ? "男性 45" : "女性 40") + "–74 歲");
      }
      var py = 0;
      if (sm !== "n") {
        py = Math.round(v("sc-ppd") * v("sc-yrs") * 10) / 10;
        var quitOk = sm === "y" || v("sc-q") < 15;
        if (age >= 50 && age <= 74 && py >= 20 && quitOk) { ok = true; why.push("重度吸菸者：" + py + " 包-年，年齡 50–74 歲"); }
        else {
          var miss = [];
          if (py < 20) miss.push("吸菸量 " + py + " 包-年（需 20 以上）");
          if (age < 50 || age > 74) miss.push("年齡需 50–74 歲");
          if (!quitOk) miss.push("戒菸已滿 15 年");
          why.push("吸菸族群條件未符合：" + miss.join("、"));
        }
      }
      res.className = "result " + (ok ? "yes" : "no");
      res.innerHTML = ok
        ? '<div class="res-ico">✓</div><div><b>你符合公費肺癌篩檢資格</b><span>' + why.filter(function (x) { return x.indexOf("未") < 0 && x.indexOf("範圍") < 0; }).join("；") + "。可以向門診或國健署合作醫院預約低劑量電腦斷層。</span></div>"
        : '<div class="res-ico">i</div><div><b>目前不符合公費篩檢資格</b><span>' + (why.length ? why.join("；") + "。" : "沒有肺癌家族史，也不是重度吸菸者。") + "有症狀或其他擔心，仍可以和醫師討論是否需要檢查。</span></div>";
      if (sm !== "n") res.innerHTML += '<div class="py">你的吸菸量：<b>' + py + "</b> 包-年</div>";
    }
    w.addEventListener("input", calc); w.addEventListener("change", calc);
    w.addEventListener("submit", function (e) { e.preventDefault(); });
    w.addEventListener("click", function (e) {
      var t = e.target.closest("button[data-d]"); if (!t) return;
      var inp = w.querySelector("#" + t.dataset.t), n = (parseFloat(inp.value) || 0) + parseFloat(t.dataset.d);
      inp.value = Math.max(+inp.min, Math.min(+inp.max, n)); calc();
    });
    calc(); return w;
  };

  /* ---------- 大腸癌篩檢資格（糞便潛血檢查） ---------- */
  function crcScreen() {
    var w = el("form", "tool screen-tool"); w.setAttribute("aria-label", "大腸癌篩檢資格檢查");
    w.innerHTML =
      '<div class="row"><label class="lbl" for="cr-age">年齡</label><div class="num"><button type="button" data-d="-1" data-t="cr-age" aria-label="年齡減一">−</button><input id="cr-age" type="number" inputmode="numeric" min="18" max="100" value="50"><button type="button" data-d="1" data-t="cr-age" aria-label="年齡加一">＋</button><span>歲</span></div></div>' +
      '<div class="row"><span class="lbl">家族史</span><label class="tg"><input type="checkbox" id="cr-fam"><span>父母、子女或兄弟姊妹曾得大腸直腸癌</span></label></div>' +
      '<div class="row"><span class="lbl">症狀</span><label class="tg"><input type="checkbox" id="cr-sym"><span>最近有血便、排便習慣改變、糞便變細或不明原因貧血</span></label></div>' +
      '<div class="result" aria-live="polite"></div>';
    var res = w.querySelector(".result");
    function calc() {
      var age = parseFloat(w.querySelector("#cr-age").value) || 0, fam = w.querySelector("#cr-fam").checked, sym = w.querySelector("#cr-sym").checked;
      var ok = (age >= 45 && age <= 74) || (fam && age >= 40 && age <= 44), html;
      if (ok) html = '<div class="res-ico">✓</div><div><b>你符合公費大腸癌篩檢資格</b><span>' + (age < 45 ? "有大腸直腸癌家族史，40–44 歲也可以篩檢。" : "45–74 歲民眾可以篩檢。") + "每 2 年一次免費糞便潛血檢查，可以在健保特約的醫院、診所或衛生所領取採便管。</span></div>";
      else html = '<div class="res-ico">i</div><div><b>目前不在公費篩檢的年齡範圍</b><span>' + (age > 74 ? "75 歲以上是否需要檢查，請和醫師討論。" : age >= 40 ? "40–44 歲需要有大腸直腸癌家族史才符合。" : "公費篩檢從 45 歲開始（有家族史從 40 歲）。") + (fam ? "有家族史的人，可以和醫師討論是否直接安排大腸鏡。" : "") + "</span></div>";
      if (sym) html += '<div class="py"><b>有症狀不用等篩檢</b>：請直接看腸胃科或大腸直腸外科，由醫師安排檢查。</div>';
      res.className = "result " + (ok ? "yes" : "no"); res.innerHTML = html;
    }
    w.addEventListener("input", calc); w.addEventListener("change", calc);
    w.addEventListener("submit", function (e) { e.preventDefault(); });
    w.addEventListener("click", function (e) {
      var t = e.target.closest("button[data-d]"); if (!t) return;
      var inp = w.querySelector("#" + t.dataset.t), n = (parseFloat(inp.value) || 0) + parseFloat(t.dataset.d);
      inp.value = Math.max(+inp.min, Math.min(+inp.max, n)); calc();
    });
    calc(); return w;
  }

  /* ---------- 檢查旅程 ---------- */
  W.journey = function (b, pm) {
    var r = function (s, i) {
      return '<div class="j-head"><span class="j-ico">' + F.icon(s.icon, 28) + '</span><div><small>第 ' + (i + 1) + " 站</small><h4>" + s.t + "</h4></div></div><p>" + s.d +
        '</p><dl><dt>會有什麼感覺</dt><dd>' + s.feel + "</dd><dt>需要準備什麼</dt><dd>" + s.prep + "</dd></dl>";
    };
    if (pm) return staticList(b.items, r);
    var w = el("div", "journey"); w.style.setProperty("--n", b.items.length);
    var track = el("div", "j-track"); track.setAttribute("aria-hidden", "true");
    track.innerHTML = '<div class="j-line"><i></i></div>';
    var p = picker(b.items, "檢查站", r, {
      cls: "j-pick",
      btn: function (s, i) { return '<span class="j-dot">' + F.icon(s.icon, 22) + "</span><span class=\"j-t\">" + (s.s || s.t) + "</span>"; },
      onSelect: function (i) { track.style.setProperty("--p", (i / (b.items.length - 1)).toFixed(3)); }
    });
    w.append(track, p);
    var nav = el("div", "j-nav"), prev = el("button", "btn-s", "← 上一站"), next = el("button", "btn-s", "下一站 →");
    prev.type = next.type = "button";
    var btns = p.querySelectorAll(".pick button");
    function cur() { var c = 0; btns.forEach(function (b, i) { if (b.getAttribute("aria-selected") === "true") c = i; }); return c; }
    prev.addEventListener("click", function () { btns[Math.max(0, cur() - 1)].click(); });
    next.addEventListener("click", function () { btns[Math.min(btns.length - 1, cur() + 1)].click(); });
    nav.append(prev, next); w.appendChild(nav);
    return w;
  };

  W.tnm = function (b) {
    return el("div", "tnm", b.items.map(function (x) { return '<div class="tnm-c"><span class="tnm-k">' + x.k + "</span><b>" + x.t + "</b><span>" + x.d + "</span></div>"; }).join(""));
  };

  /* ---------- 分期地圖 ---------- */
  W.stagemap = function (b, pm) {
    var r = function (s) { return "<h4>" + s.t + "</h4><p>" + s.d + '</p><div class="tx"><b>常見治療方向：</b>' + s.tx + "</div>"; };
    if (pm) return staticList(b.items, r);
    var w = el("div", "stagewrap");
    var fig = el("div", "stagefig"); fig.innerHTML = (F[b.fig] || F.stagemap)();
    var svg = fig.querySelector("svg");
    var p = picker(b.items, "選擇期別", r, {
      cls: "stage-pick",
      btn: function (s) { return s.t.replace("第 ", "").replace(" 期", "") + "<small>期</small>"; },
      start: 1,
      onSelect: function (i) { svg.setAttribute("data-stage", b.items[i].k); }
    });
    var info = el("div", "stage-side"); info.appendChild(p);
    w.append(fig, info); return w;
  };

  /* ---------- 治療路徑 ---------- */
  W.paths = function (b, pm) {
    var r = function (p) {
      return "<h4>" + p.t + '</h4><span class="goal">' + p.goal + '</span><ol class="flow">' + p.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + '</ol><p class="alt">' + p.alt + "</p>" + vrelated(p.eps, pm) + (p.book && !pm ? bookLink(p.book) : "");
    };
    return pm ? staticList(b.items, r) : picker(b.items, "選擇病情階段", r, { cls: "path-pick sticky-pick", footNav: true });
  };

  /* ---------- 治療機轉 ---------- */
  W.mechanisms = function (b, pm) {
    var r = function (m) {
      var d = el("div", "mech");
      // m.fig 可指定其他圖解（例如大腸手術用 colonSeg），m.arg 為傳入參數
      var fig = el("div", "mech-fig"); if (!pm) fig.innerHTML = m.fig && F[m.fig] ? F[m.fig](m.arg) : F.mech[m.id] ? F.mech[m.id]() : "";
      var t = el("div", "mech-txt",
        "<h4>" + m.t + '<small>' + m.short + "</small></h4>" +
        '<dl><dt>怎麼作用</dt><dd>' + m.how + "</dd><dt>怎麼進行</dt><dd>" + m.when + "</dd><dt>常見副作用</dt><dd>" + m.se + '</dd><dt>小提醒</dt><dd>' + m.tip + "</dd></dl>" + (m.book && !pm ? bookLink(m.book) : "") + vrelated(m.eps, pm));
      if (!pm) d.appendChild(fig); d.appendChild(t); return d;
    };
    if (pm) return staticList(b.items, r);
    return picker(b.items, "選擇治療方式", r, {
      cls: "mech-pick sticky-pick", footNav: true,
      btn: function (m) { return "<b>" + m.t + "</b><small>" + m.short + "</small>"; },
      onSelect: function () { if (window.App) window.App.watchAnims(); }
    });
  };

  /* ---------- 問題清單 ---------- */
  W.checklist = function (b, pm) {
    var key = "check-" + b.id, saved = store(key) || {};
    var ul = el("ul", "checklist");
    b.items.forEach(function (q, i) {
      var li = el("li"); var id = b.id + "-" + i;
      li.innerHTML = '<input type="checkbox" id="' + id + '"' + (saved[i] ? " checked" : "") + (pm ? " disabled" : "") + '><label for="' + id + '"><span class="box" aria-hidden="true"></span>' + q + "</label>";
      ul.appendChild(li);
    });
    if (pm) return ul;
    var w = el("div", "tool");
    var foot = el("div", "check-foot");
    var count = el("span"), clear = el("button", "btn-s", "清除勾選"); clear.type = "button";
    function upd() { var n = ul.querySelectorAll("input:checked").length; count.textContent = n ? "已勾選 " + n + " 題，看診時打開這頁給醫師看" : "勾選你想問的問題"; }
    ul.addEventListener("change", function () { var s = {}; ul.querySelectorAll("input").forEach(function (x, i) { if (x.checked) s[i] = 1; }); store(key, s); upd(); });
    clear.addEventListener("click", function () { ul.querySelectorAll("input").forEach(function (x) { x.checked = false; }); store(key, {}); upd(); });
    foot.append(count, clear); w.append(ul, foot); upd(); return w;
  };

  /* ---------- 紅黃綠燈 ---------- */
  W.triage = function (b, pm) {
    var levels = [["red", b.red], ["yellow", b.yellow], ["green", b.green]];
    var S = window.SITE && window.SITE.resource;
    var call = S ? '<p class="tri-call">個管聯絡電話：<a href="tel:' + S.tel + '">' + S.phone + "</a> 分機 " + S.ext.join("、") + (S.hours ? "（" + S.hours + "）" : "") + (S.afterHours ? '<span class="tri-after">' + S.afterHours + "</span>" : "") + "</p>" : "";
    var r = function (lv) { return '<div class="tri-' + lv[0] + '"><h4>' + lv[1].t + '</h4><ul>' + lv[1].items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" + (lv[0] === "yellow" ? call : "") + "</div>"; };
    if (pm) return staticList(levels, r);
    var w = el("div", "triage");
    var p = picker(levels, "症狀分級", r, {
      cls: "tri-pick",
      btn: function (lv) { return '<span class="lamp lamp-' + lv[0] + '"></span><span>' + lv[1].t.split("：")[0] + "</span>"; }
    });
    w.appendChild(p); return w;
  };

  /* ---------- 副作用選單 ---------- */
  W.sidefx = function (b, pm) {
    var r = function (g) {
      return (pm ? "<h4>" + g.t + "</h4>" : "") + '<dl class="fx">' + g.list.map(function (x) { return "<dt>" + x[0] + "</dt><dd>" + x[1] + "</dd>"; }).join("") + "</dl>";
    };
    return pm ? staticList(b.items, r) : picker(b.items, "選擇治療方式", r);
  };

  /* ---------- 戒菸時間軸 ---------- */
  W.quit = function (b) {
    var w = el("div", "quit");
    var ol = el("ol", "quit-line");
    b.items.forEach(function (x, i) { ol.appendChild(el("li", null, '<span class="q-t">' + x[0] + '</span><span class="q-d">' + x[1] + "</span>")); });
    w.appendChild(ol);
    if (b.note) w.appendChild(el("p", "note", b.note));
    return w;
  };

  /* ---------- 噘嘴呼吸 ---------- */
  W.breathe = function (b, pm) {
    if (pm) return el("p", null, "練習方法：用鼻子吸氣 2 秒，噘嘴慢慢吐氣 4 秒，重複 5–10 次。");
    var w = el("div", "tool breath");
    w.innerHTML = '<div class="b-fig fig">' + F.pursed() + '</div>' +
      '<div class="b-side"><div class="b-cue" aria-live="polite">準備好了嗎？</div>' +
      '<div class="b-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="b-track"/><circle cx="60" cy="60" r="52" class="b-prog"/></svg><span class="b-count">6</span><small class="b-unit">回</small></div>' +
      '<div class="b-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
      '<button type="button" class="btn-p" id="breath-go">開始練習</button><span class="b-round">吸 2 秒、吐 4 秒，共 6 回</span></div>';
    var svg = w.querySelector(".pursed-fig"), cue = w.querySelector(".b-cue"), cnt = w.querySelector(".b-count"), unit = w.querySelector(".b-unit"),
        prog = w.querySelector(".b-prog"), dots = w.querySelectorAll(".b-dots i"), go = w.querySelector("#breath-go"), rd = w.querySelector(".b-round");
    var C = 2 * Math.PI * 52, timer = null, running = false;
    prog.style.strokeDasharray = C; prog.style.strokeDashoffset = C;
    svg.classList.add("idle");
    function ring(sec) {
      prog.style.transition = "none"; prog.style.strokeDashoffset = C; void prog.getBoundingClientRect();
      prog.style.transition = "stroke-dashoffset " + sec + "s linear"; prog.style.strokeDashoffset = 0;
    }
    function stop(done) {
      running = false; clearInterval(timer); svg.setAttribute("class", "anim pursed-fig idle"); go.textContent = done ? "再練一次" : "開始練習";
      cue.textContent = done ? "完成了，做得很好！" : "準備好了嗎？"; cnt.textContent = "6"; unit.textContent = "回";
      prog.style.transition = "none"; prog.style.strokeDashoffset = C; rd.textContent = "吸 2 秒、吐 4 秒，共 6 回";
      dots.forEach(function (d) { d.className = done ? "on" : ""; });
    }
    go.addEventListener("click", function () {
      if (running) return stop(false);
      running = true; go.textContent = "停止";
      var round = 1, phase = "in", left = 2;
      function show(start) {
        svg.setAttribute("class", "anim pursed-fig " + phase);
        cue.textContent = phase === "in" ? "用鼻子吸氣" : "噘嘴慢慢吐氣"; cue.className = "b-cue " + phase;
        cnt.textContent = left; unit.textContent = "秒"; rd.textContent = "第 " + round + " / 6 回";
        dots.forEach(function (d, i) { d.className = i < round - 1 ? "on" : (i === round - 1 ? "now" : ""); });
        if (start) ring(phase === "in" ? 2 : 4);
      }
      show(true);
      timer = setInterval(function () {
        left--;
        if (left <= 0) {
          if (phase === "in") { phase = "out"; left = 4; }
          else { round++; if (round > 6) return stop(true); phase = "in"; left = 2; }
          return show(true);
        }
        show(false);
      }, 1000);
    });
    return w;
  };

  return W;
})();
