// ===== 标注预览模式 =====

/** 标注预览模式类型 */
export type AnnotationMode = "view" | "compare" | "refine";

// ===== 标注数据格式（API交互用） =====

/** 标注点坐标 - 点格式 */
export interface LinePoint {
  x: number;
  y: number;
}

/** 标注点坐标 - 圆格式 */
export interface CirclePoint {
  x: number;
  y: number;
  r: number;
}

/** 标注点坐标 - 椭圆格式 */
export interface EllipsePoint {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

/** 标注点坐标 - 矩形格式 */
export interface RectPoint {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 标注点坐标（联合类型，支持四种格式） */
export type AnnotationPoint =
  | LinePoint
  | CirclePoint
  | EllipsePoint
  | RectPoint;

/** 标注形状类型 */
export type AnnotationShape =
  | "line"
  | "rect"
  | "polygon"
  | "circle"
  | "ellipse"
  | "path"
  | "closed_path";

/** 单个标注区域（带空洞的多边形） */
export interface AnnotationRegion {
  external: AnnotationPoint[];
  holes: AnnotationPoint[][];
  shape?: AnnotationShape;
}

/** 标注数据（API返回的annotation_data） */
export type AnnotationData = AnnotationRegion[];

/** 标注类型枚举 */
export type AnnotationSourceType = "AI" | "MANUAL";

/** 标注状态枚举 */
export type AnnotationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

// ===== 标注统计与展示 =====

/** 标注区域统计 */
export interface AnnotationRegionStatistics {
  total: number;
  lineCount: number;
  polygonCount: number;
}

/** 人工标注统计 */
export interface ManualAnnotationStatistics {
  manualLineCount: number;
  manualPolygonCount: number;
}

/** 标注区域信息（展示用） */
export interface AnnotationRegionInfo {
  area: string;
  tissueType: string;
  regionLevel: string;
  colorCode: string;
  confidence?: number;
  type: string;
}

// ===== 切片/版本/图像信息 =====

/** 切片信息 */
export interface SliceInfo {
  sliceId: string;
  fileName?: string;
  fileType?: string;
}

/** 版本信息 */
export interface VersionInfo {
  versionNumber: string;
  versionType: string;
  createdTime: string;
  status: AnnotationStatus;
  errorMessage?: string;
  creator: string;
  annotatedTime: string;
}

// ===== 精修相关 =====

/** 最近标注记录 */
export interface RecentAnnotation {
  id: string;
  type: string;
  time: string;
}

/** 精修提交参数 */
export interface RefineSubmitParams {
  versionName: string;
  versionRemark: string;
}

// ===== 版本对比 =====

/** 版本对比颜色配置 */
export interface VersionCompareColor {
  color: string;
  bgColor: string;
  name: string;
}

/** 版本颜色映射 */
export type VersionColorMap = Record<string, VersionCompareColor>;

/** 版本对比颜色列表（5种区分度高的颜色） */
export const COMPARE_VERSION_COLORS: VersionCompareColor[] = [
  { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.3)", name: "红色" },
  { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.3)", name: "蓝色" },
  { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.3)", name: "绿色" },
  { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.3)", name: "橙色" },
  { color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.3)", name: "紫色" }
];

/** 根据索引获取版本对比颜色 */
export const getVersionCompareColor = (index: number): VersionCompareColor => {
  return COMPARE_VERSION_COLORS[index % COMPARE_VERSION_COLORS.length];
};

// ===== 区域颜色配置 =====

/** 区域颜色编码映射 */
export const REGION_COLOR_MAP: Record<
  string,
  { color: string; bgColor: string }
> = {
  正常组织: { color: "#22C55E", bgColor: "rgba(74, 222, 128, 0.4)" },
  肿瘤区域: { color: "#3B82F6", bgColor: "rgba(96, 165, 250, 0.4)" },
  坏死区域: { color: "#EF4444", bgColor: "rgba(248, 113, 113, 0.4)" },
  炎症区域: { color: "#F59E0B", bgColor: "rgba(250, 204, 21, 0.4)" }
};

/** 默认区域颜色 */
export const DEFAULT_REGION_COLOR = {
  color: "#22C55E",
  bgColor: "rgba(74, 222, 128, 0.4)"
};

// ===== 标注状态/类型映射（展示用） =====

/** 标注状态映射 */
export const ANNOTATION_STATUS_MAP: Record<
  string,
  { type: string; label: string }
> = {
  PENDING: { type: "info", label: "待处理" },
  PROCESSING: { type: "warning", label: "处理中" },
  COMPLETED: { type: "success", label: "已完成" },
  FAILED: { type: "danger", label: "失败" },
  CANCELLED: { type: "info", label: "已取消" }
};

/** 标注类型映射 */
export const ANNOTATION_TYPE_MAP: Record<
  string,
  { type: string; label: string }
> = {
  AI: { type: "success", label: "智能标注" },
  MANUAL: { type: "primary", label: "人工精修" }
};
