/* 癌別清單：書館書架與備援清單都由這份檔案自動產生。
   新增癌別：在下方加一筆，並在 articles/ 放一份同 id 的文章檔，再到 index.html 加一行 <script>。
   ready: true 代表文章已完成，可點進閱讀；false 會顯示「撰寫中」。 */
window.CANCERS = [
  { id: "lung",       name: "肺癌",        en: "Lung",        color: "#3d7bb8", sigil: "lung",     ready: true  },
  { id: "colorectal", name: "大腸直腸癌",  en: "Colorectal",  color: "#5b8a52", sigil: "spiral",   ready: true  },
  { id: "breast",     name: "乳癌",        en: "Breast",      color: "#b8607e", sigil: "ribbon",   ready: false },
  { id: "liver",      name: "肝癌",        en: "Liver",       color: "#a8553a", sigil: "leaf",     ready: true  },
  { id: "headneck",   name: "頭頸癌",      en: "Head & Neck", color: "#2f8a86", sigil: "wave",     ready: false },
  { id: "prostate",   name: "攝護腺癌",    en: "Prostate",    color: "#6a5cae", sigil: "star",     ready: false }
];
