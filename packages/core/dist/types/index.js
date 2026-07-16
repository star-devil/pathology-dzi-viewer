// src/types/viewer.ts
var TOOL_NAMES = {
  move: "\u79FB\u52A8",
  line: "\u76F4\u7EBF",
  rect: "\u77E9\u5F62",
  polygon: "\u591A\u8FB9\u5F62",
  circle: "\u5706",
  ellipse: "\u692D\u5706",
  path: "\u8DEF\u5F84",
  closed_path: "\u95ED\u5408\u8DEF\u5F84"
};
var ANNOTATION_TOOL_LIST = [
  "move",
  "line",
  "rect",
  "polygon",
  "circle",
  "ellipse",
  "path",
  "closed_path"
];
var LINE_ANNOTATION_TYPES = ["line", "path"];
var AREA_ANNOTATION_TYPES = [
  "polygon",
  "rect",
  "closed_path",
  "circle",
  "ellipse"
];

// src/types/annotation.ts
var COMPARE_VERSION_COLORS = [
  { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.3)", name: "\u7EA2\u8272" },
  { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.3)", name: "\u84DD\u8272" },
  { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.3)", name: "\u7EFF\u8272" },
  { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.3)", name: "\u6A59\u8272" },
  { color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.3)", name: "\u7D2B\u8272" }
];
var getVersionCompareColor = (index) => {
  return COMPARE_VERSION_COLORS[index % COMPARE_VERSION_COLORS.length];
};
var REGION_COLOR_MAP = {
  \u6B63\u5E38\u7EC4\u7EC7: { color: "#22C55E", bgColor: "rgba(74, 222, 128, 0.4)" },
  \u80BF\u7624\u533A\u57DF: { color: "#3B82F6", bgColor: "rgba(96, 165, 250, 0.4)" },
  \u574F\u6B7B\u533A\u57DF: { color: "#EF4444", bgColor: "rgba(248, 113, 113, 0.4)" },
  \u708E\u75C7\u533A\u57DF: { color: "#F59E0B", bgColor: "rgba(250, 204, 21, 0.4)" }
};
var DEFAULT_REGION_COLOR = {
  color: "#22C55E",
  bgColor: "rgba(74, 222, 128, 0.4)"
};
var ANNOTATION_STATUS_MAP = {
  PENDING: { type: "info", label: "\u5F85\u5904\u7406" },
  PROCESSING: { type: "warning", label: "\u5904\u7406\u4E2D" },
  COMPLETED: { type: "success", label: "\u5DF2\u5B8C\u6210" },
  FAILED: { type: "danger", label: "\u5931\u8D25" },
  CANCELLED: { type: "info", label: "\u5DF2\u53D6\u6D88" }
};
var ANNOTATION_TYPE_MAP = {
  AI: { type: "success", label: "\u667A\u80FD\u6807\u6CE8" },
  MANUAL: { type: "primary", label: "\u4EBA\u5DE5\u7CBE\u4FEE" }
};

export { ANNOTATION_STATUS_MAP, ANNOTATION_TOOL_LIST, ANNOTATION_TYPE_MAP, AREA_ANNOTATION_TYPES, COMPARE_VERSION_COLORS, DEFAULT_REGION_COLOR, LINE_ANNOTATION_TYPES, REGION_COLOR_MAP, TOOL_NAMES, getVersionCompareColor };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map