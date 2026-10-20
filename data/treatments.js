/* 治療小冊清單：可跨癌別共用的治療說明。內容在 articles/tx-*.js。
   cancers：哪些癌別的文章會列出這本小冊（"all" 代表所有癌別）。 */
window.TREATMENTS = [
  { id: "tx-surgery-lung", name: "肺部手術", en: "Lung Surgery", color: "#4f78b0", icon: "scalpel", short: "胸腔鏡切除與術後照顧", cancers: ["lung"], ready: true },
  { id: "tx-radiation", name: "放射治療", en: "Radiotherapy", color: "#c08a2e", icon: "beam", short: "定位、每日治療與皮膚照顧", cancers: "all", ready: true },
  { id: "tx-chemo", name: "化學治療", en: "Chemotherapy", color: "#a8553a", icon: "drip", short: "療程節奏與副作用照顧", cancers: "all", ready: true },
  { id: "tx-targeted", name: "標靶治療", en: "Targeted Therapy", color: "#2f8a86", icon: "pill", short: "基因檢測、用藥與抗藥性", cancers: "all", ready: true },
  { id: "tx-immuno", name: "免疫治療", en: "Immunotherapy", color: "#6a5cae", icon: "immune", short: "免疫副作用與追蹤", cancers: "all", ready: true }
];
