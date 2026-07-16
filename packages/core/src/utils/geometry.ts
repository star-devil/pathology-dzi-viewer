import type { AnnotationPoint, CirclePoint, EllipsePoint, RectPoint } from "../types/annotation";

// ===== 几何计算 =====

/** 计算两点欧氏距离 */
export function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/** 计算多边形重心 */
export function calculateCentroid(
  points: AnnotationPoint[]
): { x: number; y: number } {
  let x = 0;
  let y = 0;
  const n = points.length;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / n, y: y / n };
}

/** 计算多边形面积（鞋带公式） */
export function calculatePolygonArea(
  points: { x: number; y: number }[]
): number {
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

/** 计算圆形面积 */
export function calculateCircleArea(r: number): number {
  return Math.PI * r * r;
}

/** 计算椭圆面积 */
export function calculateEllipseArea(rx: number, ry: number): number {
  return Math.PI * rx * ry;
}

/** 计算矩形面积 */
export function calculateRectArea(width: number, height: number): number {
  return width * height;
}

/**
 * 通用面积计算（根据标注类型自动判断）
 */
export function calculateAnnotationArea(
  points: AnnotationPoint[],
  shapeType?: string
): number {
  if (shapeType === "circle") {
    const point = points[0] as CirclePoint;
    return calculateCircleArea(point.r);
  }
  if (shapeType === "ellipse") {
    const point = points[0] as EllipsePoint;
    return calculateEllipseArea(point.rx, point.ry);
  }
  if (shapeType === "rect") {
    const point = points[0] as RectPoint;
    return calculateRectArea(point.width, point.height);
  }
  return calculatePolygonArea(points as { x: number; y: number }[]);
}

// ===== 区域等级 =====

/** 计算区域等级 */
export function calculateRegionLevel(area: number): "小" | "中" | "大" {
  if (area < 1000) return "小";
  if (area < 10000) return "中";
  return "大";
}

// ===== 格式化 =====

/** 格式化面积 */
export function formatArea(area: number): string {
  if (area >= 10000) {
    return `${(area / 10000).toFixed(2)} mm²`;
  }
  return `${area.toFixed(2)} px²`;
}

// ===== 点转换 =====

/**
 * 将 AnnotationPoint 数组转换为 DoodleShape 的 pos 数组
 */
export function convertPointsToPos(
  points: AnnotationPoint[],
  shapeType?: string
): number[] {
  if (shapeType === "circle") {
    const point = points[0] as CirclePoint;
    return [point.x, point.y, point.r];
  }
  if (shapeType === "ellipse") {
    const point = points[0] as EllipsePoint;
    return [point.x, point.y, point.rx, point.ry];
  }
  if (shapeType === "rect") {
    const point = points[0] as RectPoint;
    return [point.x, point.y, point.width, point.height];
  }
  return points.flatMap(p => [p.x, p.y]);
}

/** 从文件路径提取文件名 */
export function extractFileName(filePath: string): string {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || "";
}

/** 从文件路径提取文件类型 */
export function extractFileType(filePath: string): string {
  const parts = filePath.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}
