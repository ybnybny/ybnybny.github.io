/* KaTeX 自动渲染：只在含公式的页面加载
   关键点：忽略 pre/code，避免代码块里的 $ 被当成公式 */
(function () {
  function run() {
    // 依赖没加载成功时要出声，否则页面会静默保留原始的 $...$ 文本
    if (typeof renderMathInElement !== "function") {
      console.error("[katex] auto-render 未加载，公式不会被渲染。检查 vendor/katex/contrib/auto-render.min.js 是否 404。");
      return;
    }
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"],
      ignoredClasses: ["no-math"],
      throwOnError: false,
      errorColor: "#b00020"
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
