/** 标注预览模式类型 */
type AnnotationMode = "view" | "compare" | "refine";
/** 标注点坐标 - 点格式 */
interface LinePoint {
    x: number;
    y: number;
}
/** 标注点坐标 - 圆格式 */
interface CirclePoint {
    x: number;
    y: number;
    r: number;
}
/** 标注点坐标 - 椭圆格式 */
interface EllipsePoint {
    x: number;
    y: number;
    rx: number;
    ry: number;
}
/** 标注点坐标 - 矩形格式 */
interface RectPoint {
    x: number;
    y: number;
    width: number;
    height: number;
}
/** 标注点坐标（联合类型，支持四种格式） */
type AnnotationPoint = LinePoint | CirclePoint | EllipsePoint | RectPoint;
/** 标注形状类型 */
type AnnotationShape = "line" | "rect" | "polygon" | "circle" | "ellipse" | "path" | "closed_path";
/** 单个标注区域（带空洞的多边形） */
interface AnnotationRegion {
    external: AnnotationPoint[];
    holes: AnnotationPoint[][];
    shape?: AnnotationShape;
}
/** 标注数据（API返回的annotation_data） */
type AnnotationData = AnnotationRegion[];
/** 标注类型枚举 */
type AnnotationSourceType = "AI" | "MANUAL";
/** 标注状态枚举 */
type AnnotationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
/** 标注区域统计 */
interface AnnotationRegionStatistics {
    total: number;
    lineCount: number;
    polygonCount: number;
}
/** 人工标注统计 */
interface ManualAnnotationStatistics {
    manualLineCount: number;
    manualPolygonCount: number;
}
/** 标注区域信息（展示用） */
interface AnnotationRegionInfo {
    area: string;
    tissueType: string;
    regionLevel: string;
    colorCode: string;
    confidence?: number;
    type: string;
}
/** 切片信息 */
interface SliceInfo {
    sliceId: string;
    fileName?: string;
    fileType?: string;
}
/** 版本信息 */
interface VersionInfo {
    versionNumber: string;
    versionType: string;
    createdTime: string;
    status: AnnotationStatus;
    errorMessage?: string;
    creator: string;
    annotatedTime: string;
}
/** 最近标注记录 */
interface RecentAnnotation {
    id: string;
    type: string;
    time: string;
}
/** 精修提交参数 */
interface RefineSubmitParams {
    versionName: string;
    versionRemark: string;
}
/** 版本对比颜色配置 */
interface VersionCompareColor {
    color: string;
    bgColor: string;
    name: string;
}
/** 版本颜色映射 */
type VersionColorMap = Record<string, VersionCompareColor>;
/** 版本对比颜色列表（5种区分度高的颜色） */
declare const COMPARE_VERSION_COLORS: VersionCompareColor[];
/** 根据索引获取版本对比颜色 */
declare const getVersionCompareColor: (index: number) => VersionCompareColor;
/** 区域颜色编码映射 */
declare const REGION_COLOR_MAP: Record<string, {
    color: string;
    bgColor: string;
}>;
/** 默认区域颜色 */
declare const DEFAULT_REGION_COLOR: {
    color: string;
    bgColor: string;
};
/** 标注状态映射 */
declare const ANNOTATION_STATUS_MAP: Record<string, {
    type: string;
    label: string;
}>;
/** 标注类型映射 */
declare const ANNOTATION_TYPE_MAP: Record<string, {
    type: string;
    label: string;
}>;

export { ANNOTATION_STATUS_MAP as A, COMPARE_VERSION_COLORS as C, DEFAULT_REGION_COLOR as D, type EllipsePoint as E, type LinePoint as L, type ManualAnnotationStatistics as M, REGION_COLOR_MAP as R, type SliceInfo as S, type VersionColorMap as V, ANNOTATION_TYPE_MAP as a, type AnnotationData as b, type AnnotationMode as c, type AnnotationPoint as d, type AnnotationRegion as e, type AnnotationRegionInfo as f, type AnnotationRegionStatistics as g, type AnnotationShape as h, type AnnotationSourceType as i, type AnnotationStatus as j, type CirclePoint as k, type RecentAnnotation as l, type RectPoint as m, type RefineSubmitParams as n, type VersionCompareColor as o, type VersionInfo as p, getVersionCompareColor as q };
