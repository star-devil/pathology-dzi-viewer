import { ref, reactive, computed, watch, nextTick, onMounted } from "vue";
import {
  REGION_COLOR_MAP,
  DEFAULT_REGION_COLOR,
  calculateAnnotationArea,
  calculateRegionLevel,
  formatArea,
  extractFileName,
  extractFileType,
  convertPointsToPos,
  compareAnnotationVersions,
  getVersionColor,
  type AnnotationMode,
  type AnnotationData,
  type AnnotationRegionInfo,
  type AnnotationRegionStatistics,
  type ManualAnnotationStatistics,
  type ImageInfo,
  type SliceInfo,
  type VersionInfo,
  type VersionColorMap,
  type AnnotationType,
  type DoodleShape
} from "@pathology/dzi-viewer-core";
import type {
  AnnotationDataProvider,
  VersionListItem,
  MessageCallback,
  MessageType,
  ConvertedAnnotation
} from "../types";

// ===== 选项配置 =====

export interface UseAnnotationViewerOptions {
  /** 图像ID */
  imageId: string;
  /** 标注任务ID */
  annotationTaskId: string;
  /** 初始版本ID（可选） */
  initialVersionId?: string;
  /** 初始模式 */
  mode?: AnnotationMode;
  /** 数据提供器 */
  dataProvider?: AnnotationDataProvider;
  /** 消息回调 */
  onMessage?: MessageCallback;
}

// ===== 辅助函数（内部） =====

const LINE_TYPES: string[] = ["line", "path"];
const AREA_TYPES: string[] = [
  "polygon",
  "rect",
  "closed_path",
  "circle",
  "ellipse"
];

function getRegionColor(label: string): string {
  return REGION_COLOR_MAP[label]?.color || DEFAULT_REGION_COLOR.color;
}

function getRegionBgColor(label: string): string {
  return REGION_COLOR_MAP[label]?.bgColor || DEFAULT_REGION_COLOR.bgColor;
}

/**
 * 转换 API 标注数据为内部 Viewer 格式
 */
export function convertAnnotationData(annotationData?: AnnotationData): ConvertedAnnotation[] {
  if (!annotationData || !Array.isArray(annotationData)) return [];

  return annotationData.map((region, index) => {
    const shapeType = region.shape || "closed_path";
    let externalPoints: number[];

    if (shapeType === "circle") {
      const point = region.external[0] as { x: number; y: number; r: number };
      externalPoints = [point.x, point.y, point.r];
    } else if (shapeType === "ellipse") {
      const point = region.external[0] as {
        x: number;
        y: number;
        rx: number;
        ry: number;
      };
      externalPoints = [point.x, point.y, point.rx, point.ry];
    } else if (shapeType === "rect") {
      const point = region.external[0] as {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      externalPoints = [point.x, point.y, point.width, point.height];
    } else {
      externalPoints = region.external.flatMap(p => [p.x, p.y]);
    }

    const holesPoints = region.holes.map(hole =>
      hole.flatMap(p => [p.x, p.y])
    );

    return {
      id: `region-${index}`,
      type: shapeType,
      points: externalPoints,
      holes: holesPoints,
      label: `组织区域-${index}`,
      confidence: 1,
      style: {
        color: getRegionColor("正常组织"),
        strokeWidth: 2,
        fill: true,
        fillColor: getRegionBgColor("正常组织")
      }
    };
  });
}

/**
 * 将 DoodleShape[] 转换为 AnnotationData 格式
 */
export function convertShapesToAnnotationData(shapes: DoodleShape[]): AnnotationData {
  return shapes.map(shape => {
    const pos = shape.pos;
    let external: Array<{ x: number; y: number } & Record<string, number>>;

    switch (shape.type) {
      case "line":
        external = [
          { x: pos[0], y: pos[1] },
          { x: pos[2], y: pos[3] }
        ];
        break;
      case "rect": {
        const [x, y, width, height] = pos;
        external = [{ x, y, width, height }];
        break;
      }
      case "polygon":
      case "closed_path":
      case "path": {
        const points: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < pos.length; i += 2) {
          points.push({ x: pos[i], y: pos[i + 1] });
        }
        external = points;
        break;
      }
      case "circle": {
        const [x, y, r] = pos;
        external = [{ x, y, r }];
        break;
      }
      case "ellipse": {
        const [x, y, rx, ry] = pos;
        external = [{ x, y, rx, ry }];
        break;
      }
      default: {
        const points: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < pos.length; i += 2) {
          points.push({ x: pos[i], y: pos[i + 1] });
        }
        external = points;
        break;
      }
    }

    return {
      external,
      holes: [],
      shape: shape.type as any
    };
  });
}

// ===== 主 Composable =====

export function useAnnotationViewer(options: UseAnnotationViewerOptions) {
  const { imageId, annotationTaskId, dataProvider, onMessage } = options;

  // ===== 内部状态 =====

  const visible = ref(true);
  const currentMode = ref<AnnotationMode>(options.mode || "view");
  const annotationLoading = ref(false);
  const versionsLoading = ref(false);
  const submitLoading = ref(false);
  const compareLoading = ref(false);

  const currentAnnotation = ref<any>(null);
  const annotationVersionsList = ref<VersionListItem[]>([]);
  const selectedVersionId = ref<string[]>([]);

  const currentTool = ref<AnnotationType | null>(null);

  const fileUrl = ref("");

  // 图像信息
  const imageInfo = ref<ImageInfo>({
    width: 0, height: 0, tileSize: 0, tileOverlap: 0,
    minLevel: 0, maxLevel: 0, format: "", mimeType: ""
  });

  // 切片信息
  const sliceInfo = ref<SliceInfo>({ sliceId: "" });

  // 版本信息
  const versionInfo = ref<VersionInfo | undefined>();

  // 标注统计
  const baseAnnotationStatistics = ref<AnnotationRegionStatistics>({
    total: 0, lineCount: 0, polygonCount: 0
  });

  const manualAnnotationStatistics = ref<ManualAnnotationStatistics>({
    manualLineCount: 0, manualPolygonCount: 0
  });

  // 标注区域信息
  const annotationRegions = ref<AnnotationRegionInfo[]>([]);

  // 选中
  const selectedAnnotationId = ref<string | null>(null);

  // 缩放
  const zoomLevel = ref(1);
  const zoomPercentage = computed(() => Math.round(zoomLevel.value * 100));

  // DZI查看器引用
  const dziViewerRef = ref<any>(null);

  // 撤销/重做触发器
  const undoRedoTrigger = ref(0);

  // 导航器
  const navigatorVisible = ref(true);

  // 版本对比
  const compareVersionsData = ref<Record<string, AnnotationData>>({});
  const versionColorMap = ref<VersionColorMap>({});

  // 基准版本ID
  const baseVersionId = computed(() =>
    selectedVersionId.value.length > 0 ? selectedVersionId.value[0] : ""
  );

  // ===== 计算属性 =====

  const isViewMode = computed(() => currentMode.value === "view");
  const isCompareMode = computed(() => currentMode.value === "compare");
  const isRefineMode = computed(() => currentMode.value === "refine");

  const windowTitle = computed(() => {
    switch (currentMode.value) {
      case "view": return "切片标注预览";
      case "compare": return "版本对比";
      case "refine": return "人工精修";
      default: return "切片标注预览";
    }
  });

  const canUndo = computed(() => {
    undoRedoTrigger.value;
    return dziViewerRef.value?.canUndo() ?? false;
  });

  const canRedo = computed(() => {
    undoRedoTrigger.value;
    return dziViewerRef.value?.canRedo() ?? false;
  });

  // ===== 内部方法 =====

  function notify(message: string, type: MessageType = "info", grouping?: boolean) {
    onMessage?.(message, { type, grouping });
  }

  function clearUndoHistory() {
    dziViewerRef.value?.getDoodleManager()?.clearHistory();
  }

  function updateBaseAnnotationStatistics(data?: AnnotationData) {
    if (!data || !Array.isArray(data)) {
      baseAnnotationStatistics.value = { total: 0, lineCount: 0, polygonCount: 0 };
      return;
    }
    baseAnnotationStatistics.value = {
      total: data.length,
      lineCount: 0,
      polygonCount: data.length
    };
  }

  function updateAnnotationRegions(data?: AnnotationData) {
    if (!data || !Array.isArray(data)) {
      annotationRegions.value = [];
      return;
    }

    annotationRegions.value = data.map((region, index) => {
      const shapeType = region.shape || "closed_path";
      const area = calculateAnnotationArea(region.external, shapeType);

      return {
        area: formatArea(area),
        tissueType: `组织区域-${index + 1}`,
        regionLevel: calculateRegionLevel(area),
        colorCode: "#22C55E",
        confidence: 0,
        type: "polygon"
      };
    });
  }

  const { compareVersionColors, getVersionCompareColor } = {
    compareVersionColors: [
      { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.3)", name: "红色" },
      { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.3)", name: "蓝色" },
      { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.3)", name: "绿色" },
      { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.3)", name: "橙色" },
      { color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.3)", name: "紫色" }
    ],
    getVersionCompareColor: (index: number) => {
      const colors = [
        { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.3)", name: "红色" },
        { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.3)", name: "蓝色" },
        { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.3)", name: "绿色" },
        { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.3)", name: "橙色" },
        { color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.3)", name: "紫色" }
      ];
      return colors[index % colors.length];
    }
  };

  // ===== 数据加载 =====

  async function loadAnnotation() {
    if (!imageId) return;

    const versionId = options.initialVersionId || "";
    annotationLoading.value = true;

    try {
      if (!dataProvider?.getAnnotation) {
        notify("未配置数据提供器", "warning");
        return;
      }

      const result = await dataProvider.getAnnotation(imageId, versionId);
      if (result) {
        currentAnnotation.value = result;
        versionInfo.value = {
          versionNumber: `v${result.version_number}`,
          versionType: result.annotation_type === "AI" ? "智能标注" : "人工精修",
          createdTime: result.created_at,
          status: result.status as any,
          errorMessage: result.error_message,
          creator: result.annotated_by_name || "--",
          annotatedTime: result.annotated_at || ""
        };

        fileUrl.value = result.FileUrl;

        const fileType = extractFileType(result.FileUrl);
        imageInfo.value = {
          ...imageInfo.value,
          format: fileType,
          mimeType: `image/${fileType.toLowerCase()}`
        };

        sliceInfo.value = {
          sliceId: result.image_id,
          fileName: extractFileName(result.FileUrl),
          fileType: extractFileType(result.FileUrl)
        };

        clearUndoHistory();
        manualAnnotationStatistics.value = { manualLineCount: 0, manualPolygonCount: 0 };

        if (result.annotation_data) {
          updateBaseAnnotationStatistics(result.annotation_data);
          updateAnnotationRegions(result.annotation_data);
        }
      }
    } finally {
      annotationLoading.value = false;
    }
  }

  async function loadVersions() {
    if (!imageId) return;

    versionsLoading.value = true;
    try {
      if (dataProvider?.getVersions) {
        const result = await dataProvider.getVersions({
          imageId,
          annotationTaskId,
          page: 1,
          pageSize: 50
        });
        if (result) {
          annotationVersionsList.value = result;
        }
      }
    } finally {
      versionsLoading.value = false;
    }
  }

  // ===== 缩放控制 =====

  function handleZoomIn() {
    dziViewerRef.value?.zoomIn();
    zoomLevel.value = dziViewerRef.value?.getZoomLevel() || 1;
  }

  function handleZoomOut() {
    dziViewerRef.value?.zoomOut();
    zoomLevel.value = dziViewerRef.value?.getZoomLevel() || 1;
  }

  function handleResetView() {
    dziViewerRef.value?.resetView();
    zoomLevel.value = 1;
  }

  function handleZoomChange(value: number) {
    zoomLevel.value = value / 100;
    dziViewerRef.value?.zoomTo(zoomLevel.value);
  }

  // ===== 全屏 =====

  function handleToggleFullscreen() {
    const container = document.querySelector(".annotation-viewer-container") as HTMLElement;
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  }

  // ===== 导航器 =====

  function handleToggleNavigator() {
    navigatorVisible.value = !navigatorVisible.value;
    const viewerContainer = document.querySelector(".annotation-viewer-container");
    if (viewerContainer) {
      const navigatorElement = viewerContainer.querySelector(".navigator") as HTMLElement;
      if (navigatorElement) {
        navigatorElement.style.display = navigatorVisible.value ? "block" : "none";
      }
    }
  }

  // ===== 工具 =====

  function handleToolChange(tool: AnnotationType | null) {
    currentTool.value = tool;
  }

  // ===== 标注操作 =====

  function getCurrentAnnotationData(): AnnotationData | null {
    const doodleManager = dziViewerRef.value?.getDoodleManager();
    const allShapes = doodleManager?.getShapes() || [];

    const existingAiShapeIds = new Set(
      allShapes
        .filter((shape: DoodleShape) =>
          shape.id.startsWith("region-") && shape.id.endsWith("-external")
        )
        .map((shape: DoodleShape) => {
          const match = shape.id.match(/^region-(\d+)-external$/);
          return match ? parseInt(match[1]) : -1;
        })
        .filter((index: number) => index >= 0)
    );

    const originalAiData = currentAnnotation.value?.annotation_data || [];
    const updatedAiAnnotationData: AnnotationData = [];

    originalAiData.forEach((region: any, index: number) => {
      if (existingAiShapeIds.has(index)) {
        const movedShape = allShapes.find(
          (shape: DoodleShape) => shape.id === `region-${index}-external`
        );
        if (movedShape) {
          const converted = convertShapesToAnnotationData([movedShape]);
          if (converted.length > 0) {
            updatedAiAnnotationData.push({
              ...converted[0],
              shape: region.shape || "closed_path"
            });
          }
        } else {
          updatedAiAnnotationData.push(region);
        }
      }
    });

    const manualShapes = allShapes.filter(
      (shape: DoodleShape) => !shape.id.startsWith("region")
    );
    const manualAnnotationData = convertShapesToAnnotationData(manualShapes);

    return [...updatedAiAnnotationData, ...manualAnnotationData];
  }

  function handleUndo() {
    const result = dziViewerRef.value?.undo();
    if (result?.success) {
      notify("已撤销", "success", true);
    }
    undoRedoTrigger.value++;
  }

  function handleRedo() {
    const result = dziViewerRef.value?.redo();
    if (result?.success) {
      notify("已重做", "success", true);
    }
    undoRedoTrigger.value++;
  }

  function handleUndoChange(annotation?: any) {
    if (annotation) {
      if (LINE_TYPES.includes(annotation.type)) {
        manualAnnotationStatistics.value.manualLineCount = Math.max(
          0, manualAnnotationStatistics.value.manualLineCount - 1
        );
      } else if (AREA_TYPES.includes(annotation.type)) {
        manualAnnotationStatistics.value.manualPolygonCount = Math.max(
          0, manualAnnotationStatistics.value.manualPolygonCount - 1
        );
      }
    }
  }

  function handleRedoChange(annotation?: any) {
    if (annotation) {
      if (LINE_TYPES.includes(annotation.type)) {
        manualAnnotationStatistics.value.manualLineCount++;
      } else if (AREA_TYPES.includes(annotation.type)) {
        manualAnnotationStatistics.value.manualPolygonCount++;
      }
    }
  }

  function handleDeleteSelectedAnnotation() {
    if (!selectedAnnotationId.value) {
      notify("请先选择要删除的标注", "warning");
      return;
    }
    const doodleManager = dziViewerRef.value?.getDoodleManager();
    if (doodleManager) {
      doodleManager.removeShape(selectedAnnotationId.value);
      notify("已删除标注", "success");
    }
    selectedAnnotationId.value = null;
  }

  function handleClearAnnotation() {
    const doodleManager = dziViewerRef.value?.getDoodleManager();
    const undoStackCount = doodleManager?.getUndoStackCount() || 0;

    manualAnnotationStatistics.value = { manualLineCount: 0, manualPolygonCount: 0 };
    doodleManager?.clearShapes();

    if (undoStackCount === 0) {
      notify("没有可清除的人工标注", "warning");
      return;
    }
    notify("已清除所有人工标注", "success");
  }

  // ===== 标注变化回调 =====

  function handleAnnotationChange(newAnnotation: any) {
    undoRedoTrigger.value++;
    if (LINE_TYPES.includes(newAnnotation.type)) {
      manualAnnotationStatistics.value.manualLineCount++;
    } else if (AREA_TYPES.includes(newAnnotation.type)) {
      manualAnnotationStatistics.value.manualPolygonCount++;
    }
  }

  function handleAnnotationSelect(id: string | null) {
    selectedAnnotationId.value = id;
  }

  function handleZoomLevelChange(level: number) {
    zoomLevel.value = level;
  }

  function handleImageLoaded(info: ImageInfo) {
    imageInfo.value = info;
  }

  // ===== 版本对比 =====

  function handleVersionSelect(versionId: string) {
    const index = selectedVersionId.value.indexOf(versionId);
    if (index > -1) {
      selectedVersionId.value.splice(index, 1);
      const newColorMap = { ...versionColorMap.value };
      delete newColorMap[versionId];
      versionColorMap.value = newColorMap;
    } else if (selectedVersionId.value.length < 5) {
      const currentColors = Object.values(versionColorMap.value).map(c => c.color);
      const unusedColor = compareVersionColors.find(c => !currentColors.includes(c.color));
      if (unusedColor) {
        versionColorMap.value = { ...versionColorMap.value, [versionId]: unusedColor };
      } else {
        versionColorMap.value = {
          ...versionColorMap.value,
          [versionId]: getVersionCompareColor(selectedVersionId.value.length)
        };
      }
      selectedVersionId.value.push(versionId);
    } else {
      notify("最多只能选择 5 个版本进行对比", "warning");
    }
  }

  function updateVersionColorMap() {
    selectedVersionId.value.forEach(versionId => {
      if (!versionColorMap.value[versionId]) {
        const currentColors = Object.values(versionColorMap.value).map(c => c.color);
        const unusedColor = compareVersionColors.find(c => !currentColors.includes(c.color));
        versionColorMap.value = {
          ...versionColorMap.value,
          [versionId]: unusedColor || getVersionCompareColor(selectedVersionId.value.length)
        };
      }
    });
  }

  async function loadCompareVersions() {
    if (selectedVersionId.value.length === 0) return;
    if (!dataProvider?.getAnnotation) {
      notify("未配置数据提供器", "warning");
      return;
    }

    compareLoading.value = true;
    try {
      const dataMap: Record<string, AnnotationData> = {};

      await Promise.all(
        selectedVersionId.value.map(async (versionId) => {
          try {
            const result = await dataProvider!.getAnnotation!(imageId, versionId);
            if (result?.annotation_data) {
              dataMap[versionId] = result.annotation_data;
            } else {
              dataMap[versionId] = [];
            }
          } catch {
            dataMap[versionId] = [];
          }
        })
      );

      compareVersionsData.value = dataMap;
    } finally {
      compareLoading.value = false;
    }
  }

  async function handleStartCompare() {
    if (selectedVersionId.value.length > 0) {
      const doodleManager = dziViewerRef.value?.getDoodleManager();
      doodleManager?.clearAllShapes();
      updateVersionColorMap();

      compareLoading.value = true;
      try {
        await loadCompareVersions();
        nextTick(() => {
          dziViewerRef.value?.drawCompareAnnotations?.(() => {
            compareLoading.value = false;
          });
        });
      } catch {
        compareLoading.value = false;
        notify("加载版本数据失败", "error");
      }
    } else {
      notify("请先选择要对比的版本", "warning");
    }
  }

  // ===== 模式切换 =====

  function switchMode(mode: AnnotationMode) {
    currentMode.value = mode;
  }

  function handleEnterRefine() {
    switchMode("refine");
    nextTick(() => {
      dziViewerRef.value?.setRefineMode(true);
      currentTool.value = "move";
    });
  }

  async function returnToViewMode() {
    switchMode("view");
    dziViewerRef.value?.setRefineMode(false);

    selectedVersionId.value = [];
    compareVersionsData.value = {};
    versionColorMap.value = {};
    currentAnnotation.value = null;
    versionInfo.value = undefined;
    baseAnnotationStatistics.value = { total: 0, lineCount: 0, polygonCount: 0 };
    manualAnnotationStatistics.value = { manualLineCount: 0, manualPolygonCount: 0 };
    annotationRegions.value = [];
    selectedAnnotationId.value = null;
    clearUndoHistory();

    const oldFileUrl = fileUrl.value;
    fileUrl.value = "";
    await loadAnnotation();

    if (fileUrl.value === oldFileUrl && fileUrl.value) {
      nextTick(() => {
        if (dziViewerRef.value) {
          const doodleManager = dziViewerRef.value.getDoodleManager();
          if (doodleManager) {
            doodleManager.clearShapes(false);
          }
          dziViewerRef.value.redrawAnnotations?.();
        }
      });
    }
  }

  function handleSwitchToCompare() {
    switchMode("compare");
    selectedVersionId.value = [];
  }

  // ===== 提交精修 =====

  async function handleSubmitRefine(data: { versionName: string; versionRemark: string }) {
    if (!data.versionName) {
      notify("请输入版本名称", "warning");
      return;
    }
    if (!dataProvider?.submitRefine) {
      notify("未配置数据提交功能", "warning");
      return;
    }

    submitLoading.value = true;
    try {
      const annotationData = getCurrentAnnotationData();
      await dataProvider.submitRefine(imageId, {
        annotationTaskId,
        versionName: data.versionName,
        versionRemark: data.versionRemark,
        annotationData: annotationData || []
      });
      visible.value = false;
    } finally {
      submitLoading.value = false;
    }
  }

  // ===== 关闭 =====

  function handleClose() {
    visible.value = false;
  }

  function handleDialogVisibleChange(val: boolean) {
    visible.value = val;
  }

  // ===== 生命周期 =====

  function initData() {
    loadAnnotation();
    loadVersions();
  }

  onMounted(() => {
    initData();
  });

  // 监听模式切换
  watch(
    () => currentMode.value,
    mode => {
      if (mode === "compare") {
        loadVersions();
      }
      if (mode !== "refine") {
        currentTool.value = null;
      }
    }
  );

  return {
    // 状态
    visible,
    currentMode,
    annotationLoading,
    versionsLoading,
    submitLoading,
    compareLoading,
    currentAnnotation,
    annotationVersionsList,
    selectedVersionId,
    compareVersionsData,
    versionColorMap,
    currentTool,
    fileUrl,
    versionInfo,
    imageInfo,
    sliceInfo,
    baseAnnotationStatistics,
    manualAnnotationStatistics,
    annotationRegions,
    selectedAnnotationId,
    zoomLevel,
    zoomPercentage,
    // 计算属性
    isViewMode,
    isCompareMode,
    isRefineMode,
    windowTitle,
    canUndo,
    canRedo,
    navigatorVisible,
    baseVersionId,
    dziViewerRef,
    // 方法
    handleDialogVisibleChange,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleZoomChange,
    handleZoomLevelChange,
    handleImageLoaded,
    handleAnnotationSelect,
    handleToolChange,
    handleAnnotationChange,
    handleUndo,
    handleRedo,
    handleUndoChange,
    handleRedoChange,
    handleDeleteSelectedAnnotation,
    handleClearAnnotation,
    handleVersionSelect,
    handleStartCompare,
    handleEnterRefine,
    handleSwitchToCompare,
    returnToViewMode,
    handleSubmitRefine,
    handleClose,
    handleToggleFullscreen,
    handleToggleNavigator,
    loadAnnotation,
    loadVersions,
    switchMode
  };
}
