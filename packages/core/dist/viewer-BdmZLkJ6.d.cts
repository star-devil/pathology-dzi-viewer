import OpenSeadragon from 'openseadragon';

/** DZI 查看器支持的图像格式 */
type SupportedImageFormat = "tiff" | "svs" | "kfb" | "dzi";
/**
 * 标注工具类型（doodle 插件支持的所有工具类型）
 * - move: 移动
 * - line: 直线
 * - rect: 矩形
 * - polygon: 多边形
 * - circle: 圆
 * - ellipse: 椭圆
 * - path: 路径
 * - closed_path: 闭合路径
 */
type AnnotationType = "move" | "line" | "rect" | "polygon" | "circle" | "ellipse" | "path" | "closed_path";
/** 工具名称映射 */
declare const TOOL_NAMES: Record<AnnotationType, string>;
/** 所有 AnnotationType 工具列表 */
declare const ANNOTATION_TOOL_LIST: AnnotationType[];
/** 线标注类型 */
declare const LINE_ANNOTATION_TYPES: AnnotationType[];
/** 面标注类型 */
declare const AREA_ANNOTATION_TYPES: AnnotationType[];
/** 标注数据结构 */
interface Annotation {
    id: string;
    type: AnnotationType;
    points: number[][];
    /** 空洞区域点列表 */
    holes?: number[][][];
    style?: AnnotationStyle;
    label?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
/** 标注样式 */
interface AnnotationStyle {
    color?: string;
    strokeWidth?: number;
    fill?: boolean;
    fillColor?: string;
}
/**
 * doodle 插件图形数据结构
 * pos 结构根据 type 不同而不同：
 * - line: [x1, y1, x2, y2] - 起点和终点坐标
 * - rect: [x, y, width, height] - 左上角坐标和宽高
 * - polygon/closed_path/path: [x, y, x, y, ...] - 各个点的循环坐标
 * - circle: [x, y, r] - 圆心坐标和半径
 * - ellipse: [x, y, rx, ry] - 圆心坐标和横纵轴半径
 */
interface DoodleShape {
    id: string;
    type: AnnotationType;
    pos: number[];
    color: string;
    readonly?: boolean;
}
/** 图像信息（从DZI解析获取） */
interface ImageInfo {
    width: number;
    height: number;
    tileSize: number;
    tileOverlap: number;
    minLevel: number;
    maxLevel: number;
    format: string;
    mimeType: string;
}
/** 视图状态 */
interface ViewState {
    zoom: number;
    pan: OpenSeadragon.Point;
    rotation: number;
}
/** 鼠标位置信息 */
interface MousePosition {
    x: number;
    y: number;
    imageX: number;
    imageY: number;
    viewportX: number;
    viewportY: number;
}
/** 缩放级别信息 */
interface ZoomLevel {
    current: number;
    min: number;
    max: number;
    percentage: number;
}
/** DZI 查看器配置 */
interface DziViewerConfig {
    id: string;
    prefixUrl?: string;
    tileSources: string | OpenSeadragon.TileSource[];
    showNavigator?: boolean;
    showZoomControl?: boolean;
    showHomeControl?: boolean;
    showFullPageControl?: boolean;
    showRotationControl?: boolean;
    gestureSettingsMouse?: OpenSeadragon.GestureSettings;
    gestureSettingsTouch?: OpenSeadragon.GestureSettings;
    immediateRender?: boolean;
    blendTime?: number;
    alwaysBlend?: boolean;
    autoHideControls?: boolean;
    visibilityRatio?: number;
    minZoomLevel?: number;
    maxZoomLevel?: number;
    minZoomImageRatio?: number;
    maxZoomPixelRatio?: number;
    smoothTileEdgesMinZoom?: number;
    iOSDevice?: boolean;
    pixelDeviceRatio?: number;
    debugMode?: boolean;
    crossOriginPolicy?: false | "Anonymous" | "use-credentials";
    ajaxWithCredentials?: boolean;
    loadTilesWithAjax?: boolean;
    ajaxHeaders?: Record<string, string>;
}
/** 标注工具配置 */
interface AnnotationToolConfig {
    type: AnnotationType;
    color: string;
    strokeWidth: number;
    fill?: boolean;
    fillColor?: string;
}
/** 测量类型 */
type MeasurementType = "distance" | "area" | "angle";
/** 测量数据结构 */
interface Measurement {
    id: string;
    type: MeasurementType;
    points: number[][];
    value: number;
    unit: string;
    label?: string;
    createdAt: Date;
}
/** 测量工具配置 */
interface MeasurementToolConfig {
    type: MeasurementType;
    color: string;
    strokeWidth: number;
    precision: number;
    unit: string;
}
/** DZI 查看器事件类型 */
type DziViewerEventType = "open" | "close" | "zoom" | "pan" | "animation-start" | "animation-finish" | "load-start" | "load-finish" | "tile-loaded" | "tile-drawn" | "opacity-change" | "resize" | "fullscreen-enter" | "fullscreen-exit" | "canvas-click" | "canvas-double-click" | "canvas-drag" | "canvas-drag-end" | "canvas-release" | "canvas-scroll" | "container-enter" | "container-exit" | "image-loaded" | "update-viewport" | "update-tile" | "destroy";
/** DZI 查看器事件处理器 */
type DziViewerEventHandler = (event: OpenSeadragon.ViewerEvent) => void;

export { ANNOTATION_TOOL_LIST as A, type DoodleShape as D, type ImageInfo as I, LINE_ANNOTATION_TYPES as L, type Measurement as M, type SupportedImageFormat as S, TOOL_NAMES as T, type ViewState as V, type ZoomLevel as Z, AREA_ANNOTATION_TYPES as a, type Annotation as b, type AnnotationStyle as c, type AnnotationToolConfig as d, type AnnotationType as e, type DziViewerConfig as f, type DziViewerEventHandler as g, type DziViewerEventType as h, type MeasurementToolConfig as i, type MeasurementType as j, type MousePosition as k };
