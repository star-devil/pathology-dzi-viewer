'use strict';

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

exports.annotationPointsToArray = annotationPointsToArray;
exports.arrayToAnnotationPoints = arrayToAnnotationPoints;
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
exports.extractFileName = extractFileName;
exports.extractFileType = extractFileType;
exports.findMostSimilarRegion = findMostSimilarRegion;
exports.formatArea = formatArea;
exports.getVersionColor = getVersionColor;
exports.imageToViewport = imageToViewport;
exports.isRegionsEqual = isRegionsEqual;
exports.viewportToImage = viewportToImage;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map