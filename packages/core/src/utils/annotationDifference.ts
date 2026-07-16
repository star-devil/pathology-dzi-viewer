import type {
  AnnotationData,
  AnnotationRegion,
  AnnotationPoint,
  VersionColorMap
} from "../types/annotation";
import {
  calculateDistance,
  calculateCentroid,
  calculatePolygonArea
} from "./geometry";

// ===== 类型定义 =====

/** 差异类型 */
export type DifferenceType = "added" | "removed" | "modified" | "unchanged";

/** 差异区域信息 */
export interface DifferenceRegion {
  index: number;
  type: DifferenceType;
  baseRegion?: AnnotationRegion;
  compareRegion?: AnnotationRegion;
  similarity?: number;
}

/** 差异比较结果 */
export interface DifferenceResult {
  baseVersionId: string;
  compareVersionId: string;
  differences: DifferenceRegion[];
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  unchangedCount: number;
}

// ===== 区域比较 =====

/** 检查两个区域是否完全相同 */
export function isRegionsEqual(
  region1: AnnotationRegion,
  region2: AnnotationRegion,
  tolerance: number = 5
): boolean {
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

/** 计算两个区域的相似度 */
export function calculateRegionSimilarity(
  region1: AnnotationRegion,
  region2: AnnotationRegion
): number {
  const ext1 = region1.external;
  const ext2 = region2.external;

  if (region1.shape !== region2.shape) return 0.3;

  const area1 = calculatePolygonArea(ext1);
  const area2 = calculatePolygonArea(ext2);
  const areaRatio =
    area1 && area2 ? Math.min(area1, area2) / Math.max(area1, area2) : 0;

  const centroid1 = calculateCentroid(ext1);
  const centroid2 = calculateCentroid(ext2);
  const distance = calculateDistance(centroid1, centroid2);
  const maxDist = Math.max(area1, area2) ** 0.5 || 1;
  const distanceScore = Math.max(0, 1 - distance / maxDist);

  return areaRatio * 0.6 + distanceScore * 0.4;
}

/** 找到与目标区域最相似的区域 */
export function findMostSimilarRegion(
  targetRegion: AnnotationRegion,
  candidates: AnnotationRegion[],
  excludedIndices: Set<number>,
  threshold: number = 0.7
): { index: number; similarity: number } | null {
  let bestMatch: { index: number; similarity: number } | null = null;
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

/** 比较两个版本的标注数据，找出差异 */
export function compareAnnotationVersions(
  baseData: AnnotationData,
  compareData: AnnotationData,
  similarityThreshold: number = 0.7
): DifferenceResult {
  const differences: DifferenceRegion[] = [];
  const matchedBaseIndices = new Set<number>();
  const matchedCompareIndices = new Set<number>();

  // 1. 精确匹配 unchanged 区域
  compareData.forEach((compareRegion, compareIndex) => {
    const matchIndex = baseData.findIndex(
      (baseRegion, baseIndex) =>
        !matchedBaseIndices.has(baseIndex) &&
        isRegionsEqual(baseRegion, compareRegion)
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

  // 2. 相似度匹配 modified 区域
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

  // 3. 标记 added 区域
  compareData.forEach((compareRegion, compareIndex) => {
    if (!matchedCompareIndices.has(compareIndex)) {
      differences.push({
        index: compareIndex,
        type: "added",
        compareRegion
      });
    }
  });

  // 4. 标记 removed 区域
  baseData.forEach((baseRegion, baseIndex) => {
    if (!matchedBaseIndices.has(baseIndex)) {
      differences.push({
        index: baseIndex,
        type: "removed",
        baseRegion
      });
    }
  });

  // 按索引排序
  differences.sort((a, b) => a.index - b.index);

  const addedCount = differences.filter(d => d.type === "added").length;
  const removedCount = differences.filter(d => d.type === "removed").length;
  const modifiedCount = differences.filter(d => d.type === "modified").length;
  const unchangedCount = differences.filter(d => d.type === "unchanged").length;

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

/** 获取版本颜色 */
export function getVersionColor(
  versionId: string,
  versionColorMap: VersionColorMap,
  defaultColor: string = "#6B7280"
): string {
  return versionColorMap?.[versionId]?.color || defaultColor;
}
