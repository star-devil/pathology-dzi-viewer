import OpenSeadragon from "openseadragon";

/** 默认查看器配置 */
const DEFAULT_VIEWER_OPTIONS: Record<string, unknown> = {
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

/**
 * 创建 OpenSeadragon 查看器实例
 */
export function createViewer(
  element: HTMLElement,
  tileSources: string | OpenSeadragon.TileSource[],
  overrides?: Record<string, unknown>
): OpenSeadragon.Viewer {
  const config = {
    id: `dzi-viewer-${Date.now()}`,
    element,
    tileSources,
    ...DEFAULT_VIEWER_OPTIONS,
    ...overrides
  };

  return OpenSeadragon(config as OpenSeadragon.Options);
}

/**
 * 从图像URL创建查看器
 */
export function createViewerFromUrl(
  element: HTMLElement,
  imageUrl: string,
  overrides?: Record<string, unknown>
): OpenSeadragon.Viewer {
  return createViewer(element, imageUrl, overrides);
}

/**
 * 提取图像信息
 */
export function extractImageInfo(
  viewer: OpenSeadragon.Viewer,
  imageUrl: string
) {
  const tiledImage = viewer.world.getItemAt(0);
  const size = tiledImage ? tiledImage.getContentSize() : { x: 0, y: 0 };
  const tileSource = tiledImage?.source as Record<string, any> | undefined;

  return {
    width: size.x,
    height: size.y,
    tileSize: tileSource?.tileSize || 256,
    tileOverlap: tileSource?.overlap || 0,
    minLevel: tileSource?.minLevel || 0,
    maxLevel: tileSource?.maxLevel || tileSource?.levels || 10,
    format:
      tileSource?.format ||
      imageUrl.split(".").pop()?.toUpperCase() ||
      "DZI",
    mimeType:
      tileSource?.mimeType ||
      `image/${imageUrl.split(".").pop()?.toLowerCase() || "jpeg"}`
  };
}
