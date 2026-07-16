import { AnnotationMode, AnnotationData, AnnotationRegionInfo, AnnotationRegionStatistics, ManualAnnotationStatistics, ImageInfo, SliceInfo, VersionInfo, VersionColorMap, AnnotationType, DoodleShape } from '@pathology/dzi-viewer-core';
import { AnnotationDataProvider, VersionListItem, MessageCallback, ConvertedAnnotation } from '../types';
import { Ref, ComputedRef } from 'vue';
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
/**
 * 转换 API 标注数据为内部 Viewer 格式
 */
export declare function convertAnnotationData(annotationData?: AnnotationData): ConvertedAnnotation[];
/**
 * 将 DoodleShape[] 转换为 AnnotationData 格式
 */
export declare function convertShapesToAnnotationData(shapes: DoodleShape[]): AnnotationData;
export declare function useAnnotationViewer(options: UseAnnotationViewerOptions): {
    visible: Ref<boolean, boolean>;
    currentMode: Ref<AnnotationMode, AnnotationMode>;
    annotationLoading: Ref<boolean, boolean>;
    versionsLoading: Ref<boolean, boolean>;
    submitLoading: Ref<boolean, boolean>;
    compareLoading: Ref<boolean, boolean>;
    currentAnnotation: Ref<any, any>;
    annotationVersionsList: Ref<{
        id: string;
        version_number: number;
        version_name: string;
        version_remark?: string | undefined;
        annotation_type: "AI" | "MANUAL";
        status: string;
        annotated_by_name?: string | undefined;
        annotated_at?: string | undefined;
    }[], VersionListItem[] | {
        id: string;
        version_number: number;
        version_name: string;
        version_remark?: string | undefined;
        annotation_type: "AI" | "MANUAL";
        status: string;
        annotated_by_name?: string | undefined;
        annotated_at?: string | undefined;
    }[]>;
    selectedVersionId: Ref<string[], string[]>;
    compareVersionsData: Ref<Record<string, AnnotationData>, Record<string, AnnotationData>>;
    versionColorMap: Ref<VersionColorMap, VersionColorMap>;
    currentTool: Ref<AnnotationType | null, AnnotationType | null>;
    fileUrl: Ref<string, string>;
    versionInfo: Ref<VersionInfo | undefined, VersionInfo | undefined>;
    imageInfo: Ref<{
        width: number;
        height: number;
        tileSize: number;
        tileOverlap: number;
        minLevel: number;
        maxLevel: number;
        format: string;
        mimeType: string;
    }, ImageInfo | {
        width: number;
        height: number;
        tileSize: number;
        tileOverlap: number;
        minLevel: number;
        maxLevel: number;
        format: string;
        mimeType: string;
    }>;
    sliceInfo: Ref<{
        sliceId: string;
        fileName?: string | undefined;
        fileType?: string | undefined;
    }, SliceInfo | {
        sliceId: string;
        fileName?: string | undefined;
        fileType?: string | undefined;
    }>;
    baseAnnotationStatistics: Ref<{
        total: number;
        lineCount: number;
        polygonCount: number;
    }, AnnotationRegionStatistics | {
        total: number;
        lineCount: number;
        polygonCount: number;
    }>;
    manualAnnotationStatistics: Ref<{
        manualLineCount: number;
        manualPolygonCount: number;
    }, ManualAnnotationStatistics | {
        manualLineCount: number;
        manualPolygonCount: number;
    }>;
    annotationRegions: Ref<{
        area: string;
        tissueType: string;
        regionLevel: string;
        colorCode: string;
        confidence?: number | undefined;
        type: string;
    }[], AnnotationRegionInfo[] | {
        area: string;
        tissueType: string;
        regionLevel: string;
        colorCode: string;
        confidence?: number | undefined;
        type: string;
    }[]>;
    selectedAnnotationId: Ref<string | null, string | null>;
    zoomLevel: Ref<number, number>;
    zoomPercentage: ComputedRef<number>;
    isViewMode: ComputedRef<boolean>;
    isCompareMode: ComputedRef<boolean>;
    isRefineMode: ComputedRef<boolean>;
    windowTitle: ComputedRef<"切片标注预览" | "版本对比" | "人工精修">;
    canUndo: ComputedRef<any>;
    canRedo: ComputedRef<any>;
    navigatorVisible: Ref<boolean, boolean>;
    baseVersionId: ComputedRef<string>;
    dziViewerRef: Ref<any, any>;
    handleDialogVisibleChange: (val: boolean) => void;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleResetView: () => void;
    handleZoomChange: (value: number) => void;
    handleZoomLevelChange: (level: number) => void;
    handleImageLoaded: (info: ImageInfo) => void;
    handleAnnotationSelect: (id: string | null) => void;
    handleToolChange: (tool: AnnotationType | null) => void;
    handleAnnotationChange: (newAnnotation: any) => void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleUndoChange: (annotation?: any) => void;
    handleRedoChange: (annotation?: any) => void;
    handleDeleteSelectedAnnotation: () => void;
    handleClearAnnotation: () => void;
    handleVersionSelect: (versionId: string) => void;
    handleStartCompare: () => Promise<void>;
    handleEnterRefine: () => void;
    handleSwitchToCompare: () => void;
    returnToViewMode: () => Promise<void>;
    handleSubmitRefine: (data: {
        versionName: string;
        versionRemark: string;
    }) => Promise<void>;
    handleClose: () => void;
    handleToggleFullscreen: () => void;
    handleToggleNavigator: () => void;
    loadAnnotation: () => Promise<void>;
    loadVersions: () => Promise<void>;
    switchMode: (mode: AnnotationMode) => void;
};
//# sourceMappingURL=useAnnotationViewer.d.ts.map