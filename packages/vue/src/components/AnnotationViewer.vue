<template>
  <div class="annotation-viewer-container w-full h-full relative">
    <div
      ref="viewerContainer"
      v-loading="isLoading"
      :element-loading-text="loadingText"
      class="dzi-viewer w-full h-full relative"
    />

    <!-- 缩放级别显示 -->
    <div class="zoom-indicator absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
      {{ (zoomLevel * 100).toFixed(0) }}%
    </div>

    <!-- 当前标注工具提示 -->
    <div
      v-if="currentTool"
      class="tool-indicator absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded text-sm"
    >
      当前工具: {{ getToolName(currentTool) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import OpenSeadragon from "openseadragon";
import {
  loadImage,
  extractImageInfo,
  DoodleManager,
  compareAnnotationVersions,
  getVersionColor,
  convertPointsToPos,
  TOOL_NAMES,
  type AnnotationData,
  type AnnotationType,
  type ImageInfo,
  type VersionColorMap,
  type DoodleShape
} from "@pathology/dzi-viewer-core";

defineOptions({ name: "AnnotationViewer" });

const props = defineProps<{
  imageUrl: string;
  annotationData?: AnnotationData;
  initialZoom?: number;
  currentTool?: AnnotationType | null;
  readOnly?: boolean;
  /** 版本对比 - 各版本的标注数据 */
  compareAnnotationsData?: Record<string, AnnotationData>;
  /** 版本对比 - 颜色映射 */
  compareVersionColors?: VersionColorMap;
  /** 版本对比 - 加载状态 */
  compareLoading?: boolean;
  /** 基准版本 ID */
  baseVersionId?: string;
}>();

const emit = defineEmits<{
  (e: "annotation-change", annotation: any): void;
  (e: "tool-change", tool: AnnotationType | null): void;
  (e: "zoom-change", level: number): void;
  (e: "image-loaded", info: ImageInfo): void;
  (e: "undo-change", annotation: any): void;
  (e: "redo-change", annotation: any): void;
  (e: "annotation-select", id: string | null): void;
}>();

const viewerContainer = ref<HTMLElement | null>(null);
const loading = ref(true);
const compareLoadingInner = ref(false);
const zoomLevel = ref(1);

const isLoading = computed(() => loading.value || compareLoadingInner.value);
const loadingText = computed(() =>
  props.compareLoading ? "正在加载版本对比数据..." : "正在加载图像..."
);

let viewer: OpenSeadragon.Viewer | null = null;
let doodleManager: DoodleManager | null = null;

// ===== 辅助函数 =====

function getToolName(tool: AnnotationType): string {
  return TOOL_NAMES[tool] || tool;
}

function generateShapeId(prefix: string, index: number | string, suffix?: string): string {
  return `${prefix}-${index}${suffix ? `-${suffix}` : ""}`;
}

// ===== 初始化查看器 =====

async function initViewer() {
  if (!viewerContainer.value || !props.imageUrl) return;

  loading.value = true;

  try {
    if (viewer) {
      viewer.destroy();
      viewer = null;
    }

    const tileSource = await loadImage(props.imageUrl);

    viewer = OpenSeadragon({
      element: viewerContainer.value,
      tileSources: tileSource,
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
    });

    viewer.addHandler("zoom", () => {
      if (viewer) {
        zoomLevel.value = viewer.viewport.getZoom();
        emit("zoom-change", zoomLevel.value);
      }
    });

    viewer.addHandler("open", () => {
      loading.value = false;
      const imageInfo = extractImageInfo(viewer!, props.imageUrl);
      emit("image-loaded", imageInfo);
      initDoodleManager();

      if (props.annotationData && Array.isArray(props.annotationData)) {
        drawAnnotations();
      }
    });

    if (props.initialZoom) {
      viewer.viewport.zoomTo(props.initialZoom);
      zoomLevel.value = props.initialZoom;
    }
  } catch {
    loading.value = false;
  }
}

// ===== DoodleManager =====

function initDoodleManager() {
  if (!viewer) return;

  if (doodleManager) {
    doodleManager.destroy();
    doodleManager = null;
  }

  doodleManager = new DoodleManager(viewer);
  doodleManager.setShapeChangeCallback((shape: DoodleShape) => {
    emit("annotation-change", shape as any);
  });

  doodleManager.setUndoRedoCallback((type: "undo" | "redo", shape?: DoodleShape) => {
    if (type === "undo") {
      emit("undo-change", shape as any);
    } else {
      emit("redo-change", shape as any);
    }
  });

  doodleManager.setShapeSelectCallback((id: string | null) => {
    emit("annotation-select", id);
  });
}

// ===== 绘制标注 =====

function drawAnnotations(customColor?: string) {
  if (!doodleManager || !props.annotationData || !Array.isArray(props.annotationData)) {
    return;
  }

  doodleManager.clearShapes(false);

  const borderColor = customColor || "#EF4444";
  const fillColor = customColor || "#10B981";

  props.annotationData.forEach((region, index) => {
    if (region.external && region.external.length > 0) {
      const shapeType = region.shape || "closed_path";
      const pos = convertPointsToPos(region.external, shapeType);

      const shape: DoodleShape = {
        id: generateShapeId("region", index, "external"),
        type: shapeType as AnnotationType,
        pos,
        color: borderColor
      };

      doodleManager?.addShape(shape, false);
      doodleManager?.setRefineMode(false);
    }

    if (region.holes && region.holes.length > 0) {
      region.holes.forEach((hole, holeIndex) => {
        if (hole && hole.length > 0) {
          const pos = convertPointsToPos(hole);
          const shape: DoodleShape = {
            id: generateShapeId("region", index, `hole-${holeIndex}`),
            type: region.shape || "closed_path",
            pos,
            color: fillColor
          };
          doodleManager?.addShape(shape, false);
          doodleManager?.setRefineMode(false);
        }
      });
    }
  });
}

function drawSingleRegion(
  region: AnnotationData[0],
  index: number,
  color: string,
  prefix: string
) {
  if (!region.external || region.external.length === 0) return;

  const shapeType = region.shape || "closed_path";
  const pos = convertPointsToPos(region.external, shapeType);

  const shape: DoodleShape = {
    id: generateShapeId(prefix, index, "external"),
    type: shapeType as AnnotationType,
    pos,
    color,
    readonly: true
  };

  doodleManager?.addShape(shape, false);

  if (region.holes && region.holes.length > 0) {
    region.holes.forEach((hole, holeIndex) => {
      if (hole && hole.length > 0) {
        const holePos = convertPointsToPos(hole, shapeType);
        const holeShape: DoodleShape = {
          id: generateShapeId(prefix, index, `hole-${holeIndex}`),
          type: shapeType as AnnotationType,
          pos: holePos,
          color,
          readonly: true
        };
        doodleManager?.addShape(holeShape, false);
      }
    });
  }
}

/** 绘制版本对比标注 */
function drawCompareAnnotations(onComplete?: () => void) {
  if (!doodleManager || !props.compareAnnotationsData || Object.keys(props.compareAnnotationsData).length === 0) {
    onComplete?.();
    return;
  }

  doodleManager.clearAllShapes();

  const versionIds = Object.keys(props.compareAnnotationsData);

  if (versionIds.length === 1) {
    const versionId = versionIds[0];
    const data = props.compareAnnotationsData[versionId];
    const color = getVersionColor(versionId, props.compareVersionColors || {}, "#6B7280");

    if (data && Array.isArray(data)) {
      data.forEach((region, index) => {
        drawSingleRegion(region, index, color, `compare-${versionId}`);
      });
    }
    onComplete?.();
    return;
  }

  const baseVersionId = props.baseVersionId || versionIds[0];
  const baseData = props.compareAnnotationsData[baseVersionId];
  const baseColor = getVersionColor(baseVersionId, props.compareVersionColors || {}, "#6B7280");

  if (baseData && Array.isArray(baseData)) {
    baseData.forEach((region, index) => {
      drawSingleRegion(region, index, baseColor, `base-${baseVersionId}`);
    });
  }

  const compareDataMap = props.compareAnnotationsData!;

  versionIds
    .filter(id => id !== baseVersionId)
    .forEach(versionId => {
      const compareData = compareDataMap[versionId];
      const versionColor = getVersionColor(versionId, props.compareVersionColors || {}, "#6B7280");

      if (!compareData || !Array.isArray(compareData)) return;

      const result = compareAnnotationVersions(baseData || [], compareData);

      result.differences
        .filter(diff => diff.type === "added" || diff.type === "modified")
        .forEach(diff => {
          if (diff.compareRegion) {
            drawSingleRegion(diff.compareRegion, diff.index, versionColor, `diff-${versionId}`);
          }
        });
    });

  onComplete?.();
}

// ===== 缩放控制 =====

function zoomTo(level: number) {
  if (viewer) {
    viewer.viewport.zoomTo(level);
    zoomLevel.value = level;
  }
}

function resetView() {
  if (viewer) {
    viewer.viewport.goHome();
    zoomLevel.value = 1;
  }
}

function zoomIn() {
  if (viewer) {
    const newZoom = viewer.viewport.getZoom() * 1.2;
    viewer.viewport.zoomTo(newZoom);
    zoomLevel.value = newZoom;
  }
}

function zoomOut() {
  if (viewer) {
    const newZoom = viewer.viewport.getZoom() / 1.2;
    viewer.viewport.zoomTo(newZoom);
    zoomLevel.value = newZoom;
  }
}

function getZoomLevel(): number {
  return zoomLevel.value;
}

// ===== 监听 =====

watch(() => props.imageUrl, () => { initViewer(); });

watch(() => props.annotationData, () => {
  if (viewer && viewer.world.getItemAt(0) && doodleManager) {
    drawAnnotations();
  }
}, { deep: true });

watch(() => props.currentTool, tool => {
  if (doodleManager && tool !== undefined) {
    doodleManager.setActiveTool(tool);
  }
  if (tool !== undefined) {
    emit("tool-change", tool);
  }
}, { immediate: true });

watch(() => props.readOnly, readOnly => {
  if (!readOnly && viewer && !doodleManager) {
    initDoodleManager();
  } else if (readOnly && doodleManager) {
    doodleManager.clearShapes(false);
  }
});

watch(() => props.baseVersionId, () => {
  // 仅跟踪基准版本变化，不触发绘制
});

// ===== 生命周期 =====

onMounted(() => { initViewer(); });

onBeforeUnmount(() => {
  if (doodleManager) { doodleManager.destroy(); doodleManager = null; }
  if (viewer) { viewer.destroy(); viewer = null; }
});

// ===== 暴露 =====

defineExpose({
  zoomTo,
  resetView,
  zoomIn,
  zoomOut,
  getZoomLevel,
  getViewer: () => viewer,
  getDoodleManager: () => doodleManager,
  undo: () => doodleManager?.undo() ?? { success: false },
  redo: () => doodleManager?.redo() ?? { success: false },
  canUndo: () => doodleManager?.canUndo() ?? false,
  canRedo: () => doodleManager?.canRedo() ?? false,
  setRefineMode: (enabled: boolean) => { doodleManager?.setRefineMode(enabled); },
  clearAllShapes: () => { doodleManager?.clearAllShapes(); },
  drawCompareAnnotations,
  redrawAnnotations: drawAnnotations
});
</script>

<style lang="scss" scoped>
.annotation-viewer-container {
  :deep(.openseadragon-container) {
    width: 100%;
    height: 100%;
    background-color: #1a1a1a !important;
  }

  :deep(.navigator) {
    position: absolute !important;
    top: 10px !important;
    right: 10px !important;
    z-index: 10;
    width: 200px !important;
    height: 150px !important;
    background: rgb(0 0 0 / 70%) !important;
    border: 1px solid var(--el-border-color) !important;
    border-radius: 4px !important;
  }

  .tool-indicator {
    background-color: var(--el-color-primary);
  }
}
</style>
