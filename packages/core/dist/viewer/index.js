import OpenSeadragon from 'openseadragon';

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
  return OpenSeadragon(config);
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

export { buildDziImageUrl, createViewer, createViewerFromUrl, extractImageInfo, getImageFormatFromFilename, getImageFormatFromMimeType, isSupportedImageFormat, loadImage, validateDziUrl };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map