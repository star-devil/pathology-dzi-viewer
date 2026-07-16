import { AnnotationMode, AnnotationData, AnnotationRegionInfo, AnnotationRegionStatistics, ManualAnnotationStatistics, ImageInfo, SliceInfo, VersionInfo, VersionColorMap, AnnotationPoint, AnnotationShape } from '@pathology/dzi-viewer-core';
export type { AnnotationMode, AnnotationData, AnnotationRegionInfo, AnnotationRegionStatistics, ManualAnnotationStatistics, ImageInfo, SliceInfo, VersionInfo, VersionColorMap, AnnotationPoint, AnnotationShape };
/** 标注记录数据 */
export interface AnnotationRecordData {
    id: string;
    image_id: string;
    FileUrl: string;
    version_number: number;
    version_name: string;
    version_remark?: string;
    annotation_type: "AI" | "MANUAL";
    annotation_data?: AnnotationData;
    status: string;
    error_message?: string;
    annotated_by_name?: string;
    annotated_at?: string;
    created_at: string;
}
/** 版本列表项 */
export interface VersionListItem {
    id: string;
    version_number: number;
    version_name: string;
    version_remark?: string;
    annotation_type: "AI" | "MANUAL";
    status: string;
    annotated_by_name?: string;
    annotated_at?: string;
}
/** 数据提供器 - 由使用者实现，注入到组件中 */
export interface AnnotationDataProvider {
    /** 获取标注数据 */
    getAnnotation: (imageId: string, versionId?: string) => Promise<AnnotationRecordData | null>;
    /** 获取版本列表 */
    getVersions?: (params: {
        imageId: string;
        annotationTaskId: string;
        page?: number;
        pageSize?: number;
    }) => Promise<VersionListItem[]>;
    /** 提交精修 */
    submitRefine?: (imageId: string, params: {
        annotationTaskId: string;
        versionName: string;
        versionRemark: string;
        annotationData: AnnotationData;
    }) => Promise<void>;
}
export type MessageType = "success" | "warning" | "error" | "info";
export interface MessageOptions {
    type?: MessageType;
    grouping?: boolean;
}
export type MessageCallback = (message: string, options?: MessageOptions) => void;
export interface RefineSubmitParams {
    versionName: string;
    versionRemark: string;
}
/** AnnotationViewer 主组件 Props */
export interface AnnotationViewerProps {
    imageId: string;
    annotationTaskId: string;
    initialVersionId?: string;
    mode?: AnnotationMode;
    visible?: boolean;
    dataProvider?: AnnotationDataProvider;
    onMessage?: MessageCallback;
    title?: string;
    fullscreen?: boolean;
    destroyOnClose?: boolean;
}
export interface AnnotationViewerEmits {
    (e: "close"): void;
    (e: "completed", data: {
        action: "refine" | "close";
    }): void;
    (e: "update:visible", value: boolean): void;
}
export interface ConvertedAnnotation {
    id: string;
    type: string;
    points: number[];
    holes: number[][];
    label: string;
    confidence: number;
    style: {
        color: string;
        strokeWidth: number;
        fill: boolean;
        fillColor: string;
    };
}
//# sourceMappingURL=index.d.ts.map