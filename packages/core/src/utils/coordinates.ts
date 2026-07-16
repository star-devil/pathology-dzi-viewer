import type { AnnotationPoint } from "../types/annotation";

/**
 * 坐标转换工具
 */

/** OpenSeadragon 视口坐标 → 图像坐标 */
export function viewportToImage(
  viewportX: number,
  viewportY: number,
  zoom: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  return {
    x: (viewportX - panX) / zoom,
    y: (viewportY - panY) / zoom
  };
}

/** 图像坐标 → OpenSeadragon 视口坐标 */
export function imageToViewport(
  imageX: number,
  imageY: number,
  zoom: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  return {
    x: imageX * zoom + panX,
    y: imageY * zoom + panY
  };
}

/** 将 number[][] 转换为 AnnotationPoint[] */
export function arrayToAnnotationPoints(
  points: number[][]
): AnnotationPoint[] {
  return points.map(p => ({ x: p[0], y: p[1] }));
}

/** 将 AnnotationPoint[] 转换为 number[][] */
export function annotationPointsToArray(
  points: AnnotationPoint[]
): number[][] {
  return points.map(p => [p.x, p.y]);
}
