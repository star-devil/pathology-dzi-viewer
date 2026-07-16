import { d as AnnotationPoint, e as AnnotationRegion, b as AnnotationData, V as VersionColorMap } from '../annotation-CQJRTy1D.cjs';

/** 计算两点欧氏距离 */
declare function calculateDistance(p1: {
    x: number;
    y: number;
}, p2: {
    x: number;
    y: number;
}): number;
/** 计算多边形重心 */
declare function calculateCentroid(points: AnnotationPoint[]): {
    x: number;
    y: number;
};
/** 计算多边形面积（鞋带公式） */
declare function calculatePolygonArea(points: {
    x: number;
    y: number;
}[]): number;
/** 计算圆形面积 */
declare function calculateCircleArea(r: number): number;
/** 计算椭圆面积 */
declare function calculateEllipseArea(rx: number, ry: number): number;
/** 计算矩形面积 */
declare function calculateRectArea(width: number, height: number): number;
/**
 * 通用面积计算（根据标注类型自动判断）
 */
declare function calculateAnnotationArea(points: AnnotationPoint[], shapeType?: string): number;
/** 计算区域等级 */
declare function calculateRegionLevel(area: number): "小" | "中" | "大";
/** 格式化面积 */
declare function formatArea(area: number): string;
/**
 * 将 AnnotationPoint 数组转换为 DoodleShape 的 pos 数组
 */
declare function convertPointsToPos(points: AnnotationPoint[], shapeType?: string): number[];
/** 从文件路径提取文件名 */
declare function extractFileName(filePath: string): string;
/** 从文件路径提取文件类型 */
declare function extractFileType(filePath: string): string;

/** 差异类型 */
type DifferenceType = "added" | "removed" | "modified" | "unchanged";
/** 差异区域信息 */
interface DifferenceRegion {
    index: number;
    type: DifferenceType;
    baseRegion?: AnnotationRegion;
    compareRegion?: AnnotationRegion;
    similarity?: number;
}
/** 差异比较结果 */
interface DifferenceResult {
    baseVersionId: string;
    compareVersionId: string;
    differences: DifferenceRegion[];
    addedCount: number;
    removedCount: number;
    modifiedCount: number;
    unchangedCount: number;
}
/** 检查两个区域是否完全相同 */
declare function isRegionsEqual(region1: AnnotationRegion, region2: AnnotationRegion, tolerance?: number): boolean;
/** 计算两个区域的相似度 */
declare function calculateRegionSimilarity(region1: AnnotationRegion, region2: AnnotationRegion): number;
/** 找到与目标区域最相似的区域 */
declare function findMostSimilarRegion(targetRegion: AnnotationRegion, candidates: AnnotationRegion[], excludedIndices: Set<number>, threshold?: number): {
    index: number;
    similarity: number;
} | null;
/** 比较两个版本的标注数据，找出差异 */
declare function compareAnnotationVersions(baseData: AnnotationData, compareData: AnnotationData, similarityThreshold?: number): DifferenceResult;
/** 获取版本颜色 */
declare function getVersionColor(versionId: string, versionColorMap: VersionColorMap, defaultColor?: string): string;

/**
 * 坐标转换工具
 */
/** OpenSeadragon 视口坐标 → 图像坐标 */
declare function viewportToImage(viewportX: number, viewportY: number, zoom: number, panX: number, panY: number): {
    x: number;
    y: number;
};
/** 图像坐标 → OpenSeadragon 视口坐标 */
declare function imageToViewport(imageX: number, imageY: number, zoom: number, panX: number, panY: number): {
    x: number;
    y: number;
};
/** 将 number[][] 转换为 AnnotationPoint[] */
declare function arrayToAnnotationPoints(points: number[][]): AnnotationPoint[];
/** 将 AnnotationPoint[] 转换为 number[][] */
declare function annotationPointsToArray(points: AnnotationPoint[]): number[][];

export { type DifferenceRegion, type DifferenceResult, type DifferenceType, annotationPointsToArray, arrayToAnnotationPoints, calculateAnnotationArea, calculateCentroid, calculateCircleArea, calculateDistance, calculateEllipseArea, calculatePolygonArea, calculateRectArea, calculateRegionLevel, calculateRegionSimilarity, compareAnnotationVersions, convertPointsToPos, extractFileName, extractFileType, findMostSimilarRegion, formatArea, getVersionColor, imageToViewport, isRegionsEqual, viewportToImage };
