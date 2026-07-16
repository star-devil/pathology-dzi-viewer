export { default as AnnotationViewer } from './components/AnnotationViewer.vue';
export { default as ImageInfoPanel } from './components/panels/ImageInfoPanel.vue';
export { default as SliceInfoPanel } from './components/panels/SliceInfoPanel.vue';
export { default as AnnotationStatsPanel } from './components/panels/AnnotationStatsPanel.vue';
export { default as AnnotationRegionPanel } from './components/panels/AnnotationRegionPanel.vue';
export { default as BaseToolsPanel } from './components/panels/BaseToolsPanel.vue';
export { default as ZoomControlPanel } from './components/panels/ZoomControlPanel.vue';
export { default as RefineToolsPanel } from './components/panels/RefineToolsPanel.vue';
export { default as VersionInfoPanel } from './components/optional/VersionInfoPanel.vue';
export { default as VersionComparePanel } from './components/optional/VersionComparePanel.vue';
export { default as AnnotationDetailLayout } from './layouts/AnnotationDetailLayout.vue';
export { useAnnotationViewer, convertAnnotationData, convertShapesToAnnotationData } from './composables/useAnnotationViewer';
export type { UseAnnotationViewerOptions } from './composables/useAnnotationViewer';
export type { AnnotationDataProvider, VersionListItem, MessageCallback, MessageType, MessageOptions, ConvertedAnnotation, RefineSubmitParams } from './types';
export { TOOL_NAMES, ANNOTATION_TOOL_LIST, LINE_ANNOTATION_TYPES, AREA_ANNOTATION_TYPES, REGION_COLOR_MAP, DEFAULT_REGION_COLOR, COMPARE_VERSION_COLORS, ANNOTATION_STATUS_MAP, ANNOTATION_TYPE_MAP, getVersionCompareColor } from '@pathology/dzi-viewer-core';
export type { AnnotationMode, AnnotationType, AnnotationData, AnnotationRegion, AnnotationRegionInfo, AnnotationRegionStatistics, ManualAnnotationStatistics, ImageInfo, SliceInfo, VersionInfo, VersionColorMap, DoodleShape, Annotation, AnnotationShape, AnnotationPoint, CirclePoint, EllipsePoint, RectPoint, LinePoint } from '@pathology/dzi-viewer-core';
//# sourceMappingURL=index.d.ts.map