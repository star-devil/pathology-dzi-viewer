import { AnnotationData, AnnotationType, AnnotationRegionInfo, AnnotationRegionStatistics, ManualAnnotationStatistics, ImageInfo, SliceInfo, VersionInfo, VersionColorMap, DoodleManager, DoodleShape } from '@pathology/dzi-viewer-core';
import { VersionListItem } from '../types';
import { CreateComponentPublicInstanceWithMixins, ComponentOptionsMixin, PublicProps, GlobalComponents, GlobalDirectives, ComponentProvideOptions, DefineComponent } from 'vue';
import { Viewer } from 'openseadragon';
type __VLS_Props = {
    visible: boolean;
    windowTitle: string;
    isViewMode: boolean;
    isCompareMode: boolean;
    isRefineMode: boolean;
    annotationLoading: boolean;
    submitLoading: boolean;
    compareLoading: boolean;
    currentAnnotation: any;
    annotationVersionsList: VersionListItem[];
    selectedVersionId: string[];
    compareVersionsData: Record<string, AnnotationData>;
    versionColorMap: VersionColorMap;
    currentTool: AnnotationType | null;
    fileUrl: string;
    versionInfo?: VersionInfo;
    imageInfo: ImageInfo;
    sliceInfo: SliceInfo;
    baseAnnotationStatistics: AnnotationRegionStatistics;
    manualAnnotationStatistics: ManualAnnotationStatistics;
    annotationRegions: AnnotationRegionInfo[];
    selectedAnnotationId: string | null;
    zoomLevel: number;
    zoomPercentage: number;
    canUndo: boolean;
    canRedo: boolean;
    navigatorVisible: boolean;
    baseVersionId: string;
    dziViewerRef?: any;
};
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        'version-info'?(_: {}): any;
        viewer?(_: {}): any;
        'close-button'?(_: {}): any;
        'version-compare'?(_: {}): any;
        'action-buttons'?(_: {}): any;
    };
    refs: {
        dziViewerRef: CreateComponentPublicInstanceWithMixins<Readonly<{
            imageUrl: string;
            annotationData?: AnnotationData;
            initialZoom?: number;
            currentTool?: AnnotationType | null;
            readOnly?: boolean;
            compareAnnotationsData?: Record<string, AnnotationData>;
            compareVersionColors?: VersionColorMap;
            compareLoading?: boolean;
            baseVersionId?: string;
        }> & Readonly<{
            "onAnnotation-change"?: ((annotation: any) => any) | undefined;
            "onTool-change"?: ((tool: AnnotationType | null) => any) | undefined;
            "onZoom-change"?: ((level: number) => any) | undefined;
            "onImage-loaded"?: ((info: ImageInfo) => any) | undefined;
            "onUndo-change"?: ((annotation: any) => any) | undefined;
            "onRedo-change"?: ((annotation: any) => any) | undefined;
            "onAnnotation-select"?: ((id: string | null) => any) | undefined;
        }>, {
            zoomTo: (level: number) => void;
            resetView: () => void;
            zoomIn: () => void;
            zoomOut: () => void;
            getZoomLevel: () => number;
            getViewer: () => Viewer | null;
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
            drawCompareAnnotations: (onComplete?: () => void) => void;
            redrawAnnotations: (customColor?: string) => void;
        }, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
            "annotation-change": (annotation: any) => any;
            "tool-change": (tool: AnnotationType | null) => any;
            "zoom-change": (level: number) => any;
            "image-loaded": (info: ImageInfo) => any;
            "undo-change": (annotation: any) => any;
            "redo-change": (annotation: any) => any;
            "annotation-select": (id: string | null) => any;
        }, PublicProps, {}, false, {}, {}, GlobalComponents, GlobalDirectives, string, {
            viewerContainer: HTMLDivElement;
        }, HTMLDivElement, ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            imageUrl: string;
            annotationData?: AnnotationData;
            initialZoom?: number;
            currentTool?: AnnotationType | null;
            readOnly?: boolean;
            compareAnnotationsData?: Record<string, AnnotationData>;
            compareVersionColors?: VersionColorMap;
            compareLoading?: boolean;
            baseVersionId?: string;
        }> & Readonly<{
            "onAnnotation-change"?: ((annotation: any) => any) | undefined;
            "onTool-change"?: ((tool: AnnotationType | null) => any) | undefined;
            "onZoom-change"?: ((level: number) => any) | undefined;
            "onImage-loaded"?: ((info: ImageInfo) => any) | undefined;
            "onUndo-change"?: ((annotation: any) => any) | undefined;
            "onRedo-change"?: ((annotation: any) => any) | undefined;
            "onAnnotation-select"?: ((id: string | null) => any) | undefined;
        }>, {
            zoomTo: (level: number) => void;
            resetView: () => void;
            zoomIn: () => void;
            zoomOut: () => void;
            getZoomLevel: () => number;
            getViewer: () => Viewer | null;
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
            drawCompareAnnotations: (onComplete?: () => void) => void;
            redrawAnnotations: (customColor?: string) => void;
        }, {}, {}, {}, {}> | null;
    };
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: DefineComponent<__VLS_Props, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
    [x: string]: any;
}, string, PublicProps, Readonly<__VLS_Props> & Readonly<{
    [x: `on${Capitalize<any>}`]: ((...args: any) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {
    dziViewerRef: CreateComponentPublicInstanceWithMixins<Readonly<{
        imageUrl: string;
        annotationData?: AnnotationData;
        initialZoom?: number;
        currentTool?: AnnotationType | null;
        readOnly?: boolean;
        compareAnnotationsData?: Record<string, AnnotationData>;
        compareVersionColors?: VersionColorMap;
        compareLoading?: boolean;
        baseVersionId?: string;
    }> & Readonly<{
        "onAnnotation-change"?: ((annotation: any) => any) | undefined;
        "onTool-change"?: ((tool: AnnotationType | null) => any) | undefined;
        "onZoom-change"?: ((level: number) => any) | undefined;
        "onImage-loaded"?: ((info: ImageInfo) => any) | undefined;
        "onUndo-change"?: ((annotation: any) => any) | undefined;
        "onRedo-change"?: ((annotation: any) => any) | undefined;
        "onAnnotation-select"?: ((id: string | null) => any) | undefined;
    }>, {
        zoomTo: (level: number) => void;
        resetView: () => void;
        zoomIn: () => void;
        zoomOut: () => void;
        getZoomLevel: () => number;
        getViewer: () => Viewer | null;
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
        drawCompareAnnotations: (onComplete?: () => void) => void;
        redrawAnnotations: (customColor?: string) => void;
    }, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
        "annotation-change": (annotation: any) => any;
        "tool-change": (tool: AnnotationType | null) => any;
        "zoom-change": (level: number) => any;
        "image-loaded": (info: ImageInfo) => any;
        "undo-change": (annotation: any) => any;
        "redo-change": (annotation: any) => any;
        "annotation-select": (id: string | null) => any;
    }, PublicProps, {}, false, {}, {}, GlobalComponents, GlobalDirectives, string, {
        viewerContainer: HTMLDivElement;
    }, HTMLDivElement, ComponentProvideOptions, {
        P: {};
        B: {};
        D: {};
        C: {};
        M: {};
        Defaults: {};
    }, Readonly<{
        imageUrl: string;
        annotationData?: AnnotationData;
        initialZoom?: number;
        currentTool?: AnnotationType | null;
        readOnly?: boolean;
        compareAnnotationsData?: Record<string, AnnotationData>;
        compareVersionColors?: VersionColorMap;
        compareLoading?: boolean;
        baseVersionId?: string;
    }> & Readonly<{
        "onAnnotation-change"?: ((annotation: any) => any) | undefined;
        "onTool-change"?: ((tool: AnnotationType | null) => any) | undefined;
        "onZoom-change"?: ((level: number) => any) | undefined;
        "onImage-loaded"?: ((info: ImageInfo) => any) | undefined;
        "onUndo-change"?: ((annotation: any) => any) | undefined;
        "onRedo-change"?: ((annotation: any) => any) | undefined;
        "onAnnotation-select"?: ((id: string | null) => any) | undefined;
    }>, {
        zoomTo: (level: number) => void;
        resetView: () => void;
        zoomIn: () => void;
        zoomOut: () => void;
        getZoomLevel: () => number;
        getViewer: () => Viewer | null;
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
        drawCompareAnnotations: (onComplete?: () => void) => void;
        redrawAnnotations: (customColor?: string) => void;
    }, {}, {}, {}, {}> | null;
}, any>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
//# sourceMappingURL=AnnotationDetailLayout.vue.d.ts.map