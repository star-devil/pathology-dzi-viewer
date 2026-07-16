import { default as OpenSeadragon } from 'openseadragon';
import { DoodleManager, AnnotationData, AnnotationType, ImageInfo, VersionColorMap, DoodleShape } from '@pathology/dzi-viewer-core';
import { DefineComponent, ComponentOptionsMixin, PublicProps, ComponentProvideOptions } from 'vue';
type __VLS_Props = {
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
};
declare function drawAnnotations(customColor?: string): void;
/** 绘制版本对比标注 */
declare function drawCompareAnnotations(onComplete?: () => void): void;
declare function zoomTo(level: number): void;
declare function resetView(): void;
declare function zoomIn(): void;
declare function zoomOut(): void;
declare function getZoomLevel(): number;
declare const _default: DefineComponent<__VLS_Props, {
    zoomTo: typeof zoomTo;
    resetView: typeof resetView;
    zoomIn: typeof zoomIn;
    zoomOut: typeof zoomOut;
    getZoomLevel: typeof getZoomLevel;
    getViewer: () => OpenSeadragon.Viewer | null;
    getDoodleManager: () => DoodleManager | null;
    undo: () => {
        success: boolean;
        shape?: DoodleShape;
    };
    redo: () => {
        success: boolean;
        shape?: DoodleShape;
    };
    canUndo: () => boolean;
    canRedo: () => boolean;
    setRefineMode: (enabled: boolean) => void;
    clearAllShapes: () => void;
    drawCompareAnnotations: typeof drawCompareAnnotations;
    redrawAnnotations: typeof drawAnnotations;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
    "annotation-change": (annotation: any) => any;
    "tool-change": (tool: AnnotationType | null) => any;
    "zoom-change": (level: number) => any;
    "image-loaded": (info: ImageInfo) => any;
    "undo-change": (annotation: any) => any;
    "redo-change": (annotation: any) => any;
    "annotation-select": (id: string | null) => any;
}, string, PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onAnnotation-change"?: ((annotation: any) => any) | undefined;
    "onTool-change"?: ((tool: AnnotationType | null) => any) | undefined;
    "onZoom-change"?: ((level: number) => any) | undefined;
    "onImage-loaded"?: ((info: ImageInfo) => any) | undefined;
    "onUndo-change"?: ((annotation: any) => any) | undefined;
    "onRedo-change"?: ((annotation: any) => any) | undefined;
    "onAnnotation-select"?: ((id: string | null) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {
    viewerContainer: HTMLDivElement;
}, HTMLDivElement>;
export default _default;
//# sourceMappingURL=AnnotationViewer.vue.d.ts.map