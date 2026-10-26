/* 站内搜索：Pagefind 静态索引 + 浮层 UI
   - 索引只在生产构建时生成（CI 里 hugo 之后跑 pagefind）
   - 本地 hugo server 下没有索引，会给出提示而不是报错 */
(function () {
  var BASE = (document.body && document.body.dataset.base) || "/";
  var overlay = document.getElementById("search-overlay");
  var mount = document.getElementById("search-mount");
  var hint = document.getElementById("search-hint");
  if (!overlay || !mount) return;

  var state = "idle"; // idle | loading | ready | failed

  function loadCss(href) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function init() {
    if (state !== "idle") return;
    state = "loading";
    loadCss(BASE + "pagefind/pagefind-ui.css");
    loadScript(BASE + "pagefind/pagefind-ui.js")
      .then(function () {
        /* eslint-disable no-undef */
        new PagefindUI({
          element: "#search-mount",
          showSubResults: true,
          showImages: false,
          excerptLength: 24,
          translations: {
            placeholder: "搜索文章标题或关键词…",
            clear_search: "清空",
            load_more: "加载更多",
            search_label: "站内搜索",
            filters_label: "筛选",
            zero_results: "没有找到和 [SEARCH_TERM] 相关的内容",
            many_results: "找到 [COUNT] 条关于 [SEARCH_TERM] 的结果",
            one_result: "找到 1 条关于 [SEARCH_TERM] 的结果",
            alt_search: "没有找到 [SEARCH_TERM]，改看 [DIFFERENT_TERM] 的结果",
            search_suggestion: "没有找到 [SEARCH_TERM]，可以试试：",
            searching: "搜索中…"
          }
        });
        state = "ready";
        if (hint) hint.textContent = "按 Esc 关闭。";
        var input = mount.querySelector("input");
        if (input) input.focus();
      })
      .catch(function () {
        state = "failed";
        if (hint) {
          hint.textContent =
            "搜索索引还没生成。本地预览（hugo server）下不可用；推送到 GitHub 后由 CI 自动生成索引，线上即可使用。";
        }
      });
  }

  function open() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    init();
    var input = mount.querySelector("input");
    if (input) input.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest && t.closest("[data-search-open]")) { e.preventDefault(); open(); return; }
    if (t.closest && t.closest("[data-search-close]")) { e.preventDefault(); close(); return; }
    if (overlay.hidden) return;
    /* 点击浮层空白处关闭 */
    if (t === overlay || (t.classList && t.classList.contains("search-overlay"))) close();
  });

  document.addEventListener("keydown", function (e) {
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (overlay.hidden) open(); else close();
      return;
    }
    if (e.key === "Escape" && !overlay.hidden) close();
  });
})();
