'use strict';

var OpenSeadragon = require('openseadragon');
var doodle = require('@wtsml/doodle');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var OpenSeadragon__default = /*#__PURE__*/_interopDefault(OpenSeadragon);

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

// src/viewer/imageLoader.ts
var FILE_EXTENSION_MAP = {
  ".tiff": "tiff",
  ".tif": "tiff",
  ".svs": "svs",
  ".kfb": "kfb",
  ".dzi": "dzi"
};
var MIME_TYPE_MAP = {
  "image/tiff": "tiff",
  "image/tif": "tiff",
  "image/x-tiff": "tiff",
  "image/x-tif": "tiff",
  "application/x-tiff": "tiff",
  "application/x-tif": "tiff",
  "image/svs": "svs",
  "image/kfb": "kfb",
  "application/xml": "dzi",
  "text/xml": "dzi"
};
function getImageFormatFromFilename(filename) {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return FILE_EXTENSION_MAP[extension] || null;
}
function getImageFormatFromMimeType(mimeType) {
  return MIME_TYPE_MAP[mimeType.toLowerCase()] || null;
}
function isSupportedImageFormat(filename) {
  const format = getImageFormatFromFilename(filename);
  return format !== null;
}
function buildDziImageUrl(imagePath, format, dziServer = "") {
  const baseUrl = dziServer || "";
  if (format === "dzi") {
    return `${baseUrl}${imagePath}`;
  }
  return `${baseUrl}${imagePath}.dzi`;
}
async function validateDziUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}
async function loadImage(imagePath, dziServer = "") {
  const format = getImageFormatFromFilename(imagePath);
  if (!format) {
    throw new Error(`\u4E0D\u652F\u6301\u7684\u56FE\u50CF\u683C\u5F0F: ${imagePath}`);
  }
  const dziUrl = buildDziImageUrl(imagePath, format, dziServer);
  const isValid = await validateDziUrl(dziUrl);
  if (!isValid) {
    throw new Error(`\u65E0\u6CD5\u8BBF\u95EE\u56FE\u50CF: ${dziUrl}`);
  }
  return dziUrl;
}
var DEFAULT_VIEWER_OPTIONS = {
  showNavigator: true,
  animationTime: 0.5,
  blendTime: 0.1,
  constrainDuringPan: true,
  maxZoomPixelRatio: 2,
  minZoomImageRatio: 0.8,
  visibilityRatio: 1,
  zoomPerScroll: 1.2,
  showZoomControl: false,
  showHomeControl: false,
  showFullPageControl: false,
  showRotationControl: false,
  crossOriginPolicy: "Anonymous",
  ajaxWithCredentials: false,
  loadTilesWithAjax: true,
  gestureSettingsMouse: {
    dragToPan: true,
    clickToZoom: false,
    dblClickToZoom: false
  }
};
function createViewer(element, tileSources, overrides) {
  const config = {
    id: `dzi-viewer-${Date.now()}`,
    element,
    tileSources,
    ...DEFAULT_VIEWER_OPTIONS,
    ...overrides
  };
  return OpenSeadragon__default.default(config);
}
function createViewerFromUrl(element, imageUrl, overrides) {
  return createViewer(element, imageUrl, overrides);
}
function extractImageInfo(viewer, imageUrl) {
  const tiledImage = viewer.world.getItemAt(0);
  const size = tiledImage ? tiledImage.getContentSize() : { x: 0, y: 0 };
  const tileSource = tiledImage?.source;
  return {
    width: size.x,
    height: size.y,
    tileSize: tileSource?.tileSize || 256,
    tileOverlap: tileSource?.overlap || 0,
    minLevel: tileSource?.minLevel || 0,
    maxLevel: tileSource?.maxLevel || tileSource?.levels || 10,
    format: tileSource?.format || imageUrl.split(".").pop()?.toUpperCase() || "DZI",
    mimeType: tileSource?.mimeType || `image/${imageUrl.split(".").pop()?.toLowerCase() || "jpeg"}`
  };
}
var DoodleManager = class {
  constructor(viewer) {
    this.currentTool = null;
    this.shapes = /* @__PURE__ */ new Map();
    this.selectedShapeId = null;
    this.isRefineMode = false;
    // 撤销/重做栈
    this.undoStack = [];
    this.redoStack = [];
    // 是否触发回调（区分用户操作和程序操作）
    this.emitCallback = true;
    this.viewer = viewer;
    const doodle$1 = doodle.createDoodle({
      viewer,
      onAdd: (shape) => this.handleShapeAdd(shape),
      onRemove: (shape) => this.handleShapeRemove(shape),
      onUpdate: (shape) => this.handleShapeUpdate(shape),
      onSelect: (shape) => this.handleShapeSelect(shape),
      onCancelSelect: (shape) => this.handleShapeCancelSelect(shape)
    });
    this.doodle = doodle$1;
  }
  // ===== 工具控制 =====
  /** 设置当前标注工具 */
  setActiveTool(tool) {
    if (tool !== "move") {
      this.selectedShapeId = null;
      this.onShapeSelect?.(null);
    }
    this.currentTool = tool;
    if (tool) {
      this.doodle.setMode(tool);
      this.viewer.gestureSettingsMouse.clickToZoom = false;
      this.doodle.setPan(tool === "move");
    } else {
      this.doodle.setPan(true);
      this.viewer.gestureSettingsMouse.clickToZoom = true;
    }
  }
  /** 获取当前工具 */
  getCurrentTool() {
    return this.currentTool;
  }
  // ===== 图形操作（公共API） =====
  /** 添加图形 */
  addShape(shape, emitCallback = true) {
    const previousCallbackState = this.emitCallback;
    this.emitCallback = emitCallback;
    if (this.emitCallback) {
      this.saveToUndoStack({
        type: "add",
        shape: { ...shape },
        timestamp: Date.now()
      });
    }
    this.doodle.addShape(shape);
    this.shapes.set(shape.id, shape);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
    this.emitCallback = previousCallbackState;
  }
  /** 删除图形 */
  removeShape(id, emitCallback = true) {
    const shape = this.shapes.get(id);
    if (!shape) return;
    const previousCallbackState = this.emitCallback;
    this.emitCallback = emitCallback;
    if (this.emitCallback) {
      this.saveToUndoStack({
        type: "remove",
        shape: { ...shape },
        timestamp: Date.now()
      });
    }
    this.doodle.removeShape(shape);
    this.shapes.delete(id);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
    this.emitCallback = previousCallbackState;
  }
  /** 清空用户手动操作的图形 */
  clearShapes(emitCallback = true) {
    if (this.undoStack.length === 0) return;
    const previousCallbackState = this.emitCallback;
    this.emitCallback = emitCallback;
    const userCommands = [...this.undoStack];
    userCommands.forEach((command) => {
      this.doodle.removeShape(command.shape);
      this.shapes.delete(command.shape.id);
    });
    this.undoStack = [];
    this.redoStack = [];
    if (this.emitCallback) {
      this.onShapeChange?.(void 0);
    }
    this.emitCallback = previousCallbackState;
  }
  /** 完全清空所有图形（用于版本对比重新绘制前的清理） */
  clearAllShapes() {
    this.doodle.clear();
    this.shapes.clear();
    this.undoStack = [];
    this.redoStack = [];
  }
  /** 获取所有图形 */
  getShapes() {
    return Array.from(this.shapes.values());
  }
  /** 根据 ID 获取图形 */
  getShapeById(id) {
    return this.shapes.get(id);
  }
  /** 更新图形属性 */
  updateShape(shape, emitCallback = true) {
    const previousCallbackState = this.emitCallback;
    this.emitCallback = emitCallback;
    this.doodle.updateShape(shape);
    this.shapes.set(shape.id, shape);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
    this.emitCallback = previousCallbackState;
  }
  // ===== 精修模式 =====
  /** 设置精修模式（切换所有标注的可编辑状态） */
  setRefineMode(enabled) {
    this.isRefineMode = enabled;
    this.doodle.setReadOnly(!enabled);
  }
  /** 是否处于精修模式 */
  getRefineMode() {
    return this.isRefineMode;
  }
  // ===== 撤销/重做 =====
  /** 撤销 */
  undo() {
    if (this.undoStack.length === 0) {
      return { success: false };
    }
    const command = this.undoStack.pop();
    if (!command) return { success: false };
    switch (command.type) {
      case "add":
        this.doodle.removeShape(command.shape);
        this.shapes.delete(command.shape.id);
        break;
      case "remove":
        this.doodle.addShape(command.shape);
        this.shapes.set(command.shape.id, command.shape);
        break;
      case "update": {
        const currentShape = this.shapes.get(command.shape.id);
        if (currentShape) {
          command.oldPos = [...currentShape.pos];
          this.doodle.updateShape(command.shape);
          this.shapes.set(command.shape.id, command.shape);
        }
        break;
      }
    }
    this.redoStack.push(command);
    this.onUndoRedoChange?.("undo", command.shape);
    return { success: true, shape: command.shape };
  }
  /** 重做 */
  redo() {
    if (this.redoStack.length === 0) {
      return { success: false };
    }
    const command = this.redoStack.pop();
    if (!command) return { success: false };
    switch (command.type) {
      case "add":
        this.doodle.addShape(command.shape);
        this.shapes.set(command.shape.id, command.shape);
        break;
      case "remove":
        this.doodle.removeShape(command.shape);
        this.shapes.delete(command.shape.id);
        break;
      case "update": {
        const redoCurrentShape = this.shapes.get(command.shape.id);
        if (redoCurrentShape) {
          command.shape.pos = [...redoCurrentShape.pos];
          this.doodle.updateShape(command.shape);
          this.shapes.set(command.shape.id, command.shape);
        }
        break;
      }
    }
    this.undoStack.push(command);
    this.onUndoRedoChange?.("redo", command.shape);
    return { success: true, shape: command.shape };
  }
  /** 能否撤销 */
  canUndo() {
    return this.undoStack.length > 0;
  }
  /** 能否重做 */
  canRedo() {
    return this.redoStack.length > 0;
  }
  /** 清空撤销/重做历史 */
  clearHistory() {
    this.undoStack = [];
    this.redoStack = [];
  }
  /** 获取撤销栈数量 */
  getUndoStackCount() {
    return this.undoStack.length;
  }
  // ===== 回调设置 =====
  /** 设置图形变更回调 */
  setShapeChangeCallback(callback) {
    this.onShapeChange = callback;
  }
  /** 设置撤销/重做回调 */
  setUndoRedoCallback(callback) {
    this.onUndoRedoChange = callback;
  }
  /** 设置图形选中回调 */
  setShapeSelectCallback(callback) {
    this.onShapeSelect = callback;
  }
  /** 获取当前选中的图形ID */
  getSelectedShapeId() {
    return this.selectedShapeId;
  }
  // ===== 销毁 =====
  /** 销毁管理器 */
  destroy() {
    if (this.doodle) {
      this.doodle.clear();
      this.doodle.setReadOnly(true);
    }
    this.shapes.clear();
    this.undoStack = [];
    this.redoStack = [];
    this.currentTool = null;
    this.selectedShapeId = null;
    this.onShapeChange = void 0;
    this.onUndoRedoChange = void 0;
    this.onShapeSelect = void 0;
    this.doodle = null;
    this.viewer = null;
  }
  // ===== 内部处理 =====
  saveToUndoStack(command) {
    this.undoStack.push(command);
    this.redoStack = [];
  }
  arrayDiff(a, b) {
    if (a.length !== b.length) return true;
    return a.some((val, index) => val !== b[index]);
  }
  handleShapeAdd(shape) {
    if (this.emitCallback) {
      this.saveToUndoStack({
        type: "add",
        shape: { ...shape },
        timestamp: Date.now()
      });
    }
    this.doodle.addShape(shape);
    this.shapes.set(shape.id, shape);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
  }
  handleShapeRemove(shape) {
    this.saveToUndoStack({
      type: "remove",
      shape: { ...shape },
      timestamp: Date.now()
    });
    this.doodle.removeShape(shape);
    this.shapes.delete(shape.id);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
  }
  handleShapeUpdate(shape) {
    if (this.isRefineMode && this.currentTool === "move") {
      const existingShape = this.shapes.get(shape.id);
      if (existingShape) {
        const oldPos = [...existingShape.pos];
        if (this.arrayDiff(oldPos, shape.pos)) {
          this.saveToUndoStack({
            type: "update",
            shape: { ...existingShape, pos: oldPos },
            oldPos,
            timestamp: Date.now()
          });
        }
      }
      this.doodle.updateShape(shape);
      this.shapes.set(shape.id, shape);
    } else {
      this.doodle.updateShape(shape);
      this.shapes.set(shape.id, shape);
      this.onShapeChange?.(shape);
    }
  }
  handleShapeSelect(shape) {
    if (!this.isRefineMode) return;
    this.selectedShapeId = shape.id;
    this.onShapeSelect?.(shape.id);
  }
  handleShapeCancelSelect(_shape) {
    this.selectedShapeId = null;
    this.onShapeSelect?.(null);
  }
};

// src/utils/geometry.ts
function calculateDistance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}
function calculateCentroid(points) {
  let x = 0;
  let y = 0;
  const n = points.length;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / n, y: y / n };
}
function calculatePolygonArea(points) {
  if (points.length < 3) return 0;
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}
function calculateCircleArea(r) {
  return Math.PI * r * r;
}
function calculateEllipseArea(rx, ry) {
  return Math.PI * rx * ry;
}
function calculateRectArea(width, height) {
  return width * height;
}
function calculateAnnotationArea(points, shapeType) {
  if (shapeType === "circle") {
    const point = points[0];
    return calculateCircleArea(point.r);
  }
  if (shapeType === "ellipse") {
    const point = points[0];
    return calculateEllipseArea(point.rx, point.ry);
  }
  if (shapeType === "rect") {
    const point = points[0];
    return calculateRectArea(point.width, point.height);
  }
  return calculatePolygonArea(points);
}
function calculateRegionLevel(area) {
  if (area < 1e3) return "\u5C0F";
  if (area < 1e4) return "\u4E2D";
  return "\u5927";
}
function formatArea(area) {
  if (area >= 1e4) {
    return `${(area / 1e4).toFixed(2)} mm\xB2`;
  }
  return `${area.toFixed(2)} px\xB2`;
}
function convertPointsToPos(points, shapeType) {
  if (shapeType === "circle") {
    const point = points[0];
    return [point.x, point.y, point.r];
  }
  if (shapeType === "ellipse") {
    const point = points[0];
    return [point.x, point.y, point.rx, point.ry];
  }
  if (shapeType === "rect") {
    const point = points[0];
    return [point.x, point.y, point.width, point.height];
  }
  return points.flatMap((p) => [p.x, p.y]);
}
function extractFileName(filePath) {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || "";
}
function extractFileType(filePath) {
  const parts = filePath.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

// src/utils/annotationDifference.ts
function isRegionsEqual(region1, region2, tolerance = 5) {
  if (region1.shape !== region2.shape) return false;
  const ext1 = region1.external;
  const ext2 = region2.external;
  if (ext1.length !== ext2.length) return false;
  for (let i = 0; i < ext1.length; i++) {
    const p1 = ext1[i];
    const p2 = ext2[i];
    if (Math.abs(p1.x - p2.x) > tolerance || Math.abs(p1.y - p2.y) > tolerance) {
      return false;
    }
  }
  const holes1 = region1.holes || [];
  const holes2 = region2.holes || [];
  if (holes1.length !== holes2.length) return false;
  return true;
}
function calculateRegionSimilarity(region1, region2) {
  const ext1 = region1.external;
  const ext2 = region2.external;
  if (region1.shape !== region2.shape) return 0.3;
  const area1 = calculatePolygonArea(ext1);
  const area2 = calculatePolygonArea(ext2);
  const areaRatio = area1 && area2 ? Math.min(area1, area2) / Math.max(area1, area2) : 0;
  const centroid1 = calculateCentroid(ext1);
  const centroid2 = calculateCentroid(ext2);
  const distance = calculateDistance(centroid1, centroid2);
  const maxDist = Math.max(area1, area2) ** 0.5 || 1;
  const distanceScore = Math.max(0, 1 - distance / maxDist);
  return areaRatio * 0.6 + distanceScore * 0.4;
}
function findMostSimilarRegion(targetRegion, candidates, excludedIndices, threshold = 0.7) {
  let bestMatch = null;
  let bestSimilarity = 0;
  candidates.forEach((region, index) => {
    if (excludedIndices.has(index)) return;
    const similarity = calculateRegionSimilarity(targetRegion, region);
    if (similarity > bestSimilarity && similarity >= threshold) {
      bestSimilarity = similarity;
      bestMatch = { index, similarity };
    }
  });
  return bestMatch;
}
function compareAnnotationVersions(baseData, compareData, similarityThreshold = 0.7) {
  const differences = [];
  const matchedBaseIndices = /* @__PURE__ */ new Set();
  const matchedCompareIndices = /* @__PURE__ */ new Set();
  compareData.forEach((compareRegion, compareIndex) => {
    const matchIndex = baseData.findIndex(
      (baseRegion, baseIndex) => !matchedBaseIndices.has(baseIndex) && isRegionsEqual(baseRegion, compareRegion)
    );
    if (matchIndex >= 0) {
      matchedBaseIndices.add(matchIndex);
      matchedCompareIndices.add(compareIndex);
      differences.push({
        index: compareIndex,
        type: "unchanged",
        baseRegion: baseData[matchIndex],
        compareRegion
      });
    }
  });
  compareData.forEach((compareRegion, compareIndex) => {
    if (matchedCompareIndices.has(compareIndex)) return;
    const match = findMostSimilarRegion(
      compareRegion,
      baseData,
      matchedBaseIndices,
      similarityThreshold
    );
    if (match) {
      matchedBaseIndices.add(match.index);
      matchedCompareIndices.add(compareIndex);
      differences.push({
        index: compareIndex,
        type: "modified",
        baseRegion: baseData[match.index],
        compareRegion,
        similarity: match.similarity
      });
    }
  });
  compareData.forEach((compareRegion, compareIndex) => {
    if (!matchedCompareIndices.has(compareIndex)) {
      differences.push({
        index: compareIndex,
        type: "added",
        compareRegion
      });
    }
  });
  baseData.forEach((baseRegion, baseIndex) => {
    if (!matchedBaseIndices.has(baseIndex)) {
      differences.push({
        index: baseIndex,
        type: "removed",
        baseRegion
      });
    }
  });
  differences.sort((a, b) => a.index - b.index);
  const addedCount = differences.filter((d) => d.type === "added").length;
  const removedCount = differences.filter((d) => d.type === "removed").length;
  const modifiedCount = differences.filter((d) => d.type === "modified").length;
  const unchangedCount = differences.filter((d) => d.type === "unchanged").length;
  return {
    baseVersionId: "",
    compareVersionId: "",
    differences,
    addedCount,
    removedCount,
    modifiedCount,
    unchangedCount
  };
}
function getVersionColor(versionId, versionColorMap, defaultColor = "#6B7280") {
  return versionColorMap?.[versionId]?.color || defaultColor;
}

// src/utils/coordinates.ts
function viewportToImage(viewportX, viewportY, zoom, panX, panY) {
  return {
    x: (viewportX - panX) / zoom,
    y: (viewportY - panY) / zoom
  };
}
function imageToViewport(imageX, imageY, zoom, panX, panY) {
  return {
    x: imageX * zoom + panX,
    y: imageY * zoom + panY
  };
}
function arrayToAnnotationPoints(points) {
  return points.map((p) => ({ x: p[0], y: p[1] }));
}
function annotationPointsToArray(points) {
  return points.map((p) => [p.x, p.y]);
}

exports.ANNOTATION_STATUS_MAP = ANNOTATION_STATUS_MAP;
exports.ANNOTATION_TOOL_LIST = ANNOTATION_TOOL_LIST;
exports.ANNOTATION_TYPE_MAP = ANNOTATION_TYPE_MAP;
exports.AREA_ANNOTATION_TYPES = AREA_ANNOTATION_TYPES;
exports.COMPARE_VERSION_COLORS = COMPARE_VERSION_COLORS;
exports.DEFAULT_REGION_COLOR = DEFAULT_REGION_COLOR;
exports.DoodleManager = DoodleManager;
exports.LINE_ANNOTATION_TYPES = LINE_ANNOTATION_TYPES;
exports.REGION_COLOR_MAP = REGION_COLOR_MAP;
exports.TOOL_NAMES = TOOL_NAMES;
exports.annotationPointsToArray = annotationPointsToArray;
exports.arrayToAnnotationPoints = arrayToAnnotationPoints;
exports.buildDziImageUrl = buildDziImageUrl;
exports.calculateAnnotationArea = calculateAnnotationArea;
exports.calculateCentroid = calculateCentroid;
exports.calculateCircleArea = calculateCircleArea;
exports.calculateDistance = calculateDistance;
exports.calculateEllipseArea = calculateEllipseArea;
exports.calculatePolygonArea = calculatePolygonArea;
exports.calculateRectArea = calculateRectArea;
exports.calculateRegionLevel = calculateRegionLevel;
exports.calculateRegionSimilarity = calculateRegionSimilarity;
exports.compareAnnotationVersions = compareAnnotationVersions;
exports.convertPointsToPos = convertPointsToPos;
exports.createViewer = createViewer;
exports.createViewerFromUrl = createViewerFromUrl;
exports.extractFileName = extractFileName;
exports.extractFileType = extractFileType;
exports.extractImageInfo = extractImageInfo;
exports.findMostSimilarRegion = findMostSimilarRegion;
exports.formatArea = formatArea;
exports.getImageFormatFromFilename = getImageFormatFromFilename;
exports.getImageFormatFromMimeType = getImageFormatFromMimeType;
exports.getVersionColor = getVersionColor;
exports.getVersionCompareColor = getVersionCompareColor;
exports.imageToViewport = imageToViewport;
exports.isRegionsEqual = isRegionsEqual;
exports.isSupportedImageFormat = isSupportedImageFormat;
exports.loadImage = loadImage;
exports.validateDziUrl = validateDziUrl;
exports.viewportToImage = viewportToImage;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map