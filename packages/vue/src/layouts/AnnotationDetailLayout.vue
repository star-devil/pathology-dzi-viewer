<template>
  <el-dialog
    :model-value="visible"
    :title="windowTitle"
    :fullscreen="true"
    :show-close="true"
    bodyClass="annotation-detail-body"
    headerClass="annotation-detail-header"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="content flex">
      <!-- 左侧信息面板 -->
      <el-scrollbar height="calc(100vh - 25px - 32px)">
        <div
          v-loading="annotationLoading"
          class="left-panel w-[341px] bg-white p-2 flex flex-col gap-3"
        >
          <!-- 切片信息 -->
          <SliceInfoPanel :data="sliceInfo" />

          <!-- 版本信息（可选） -->
          <slot name="version-info">
            <VersionInfoPanel v-if="versionInfo" :data="versionInfo" />
          </slot>

          <!-- 图像信息 -->
          <ImageInfoPanel :data="imageInfo" />

          <!-- 标注区域统计 -->
          <AnnotationStatsPanel
            v-if="isViewMode || isRefineMode"
            :base-stats="baseAnnotationStatistics"
            :manual-stats="manualAnnotationStatistics"
          />

          <!-- 标注区域信息 -->
          <AnnotationRegionPanel :regions="annotationRegions" />
        </div>
      </el-scrollbar>

      <!-- 中间DZI图像查看区域 -->
      <div class="center-panel flex-1 flex flex-col p-2">
        <div class="viewer-container flex-1 bg-white rounded-lg overflow-hidden">
          <slot name="viewer">
            <AnnotationViewer
              ref="dziViewerRef"
              :image-url="fileUrl"
              :annotation-data="currentAnnotation?.annotation_data"
              :initial-zoom="zoomLevel"
              :current-tool="currentTool"
              :read-only="!isRefineMode"
              :compare-annotations-data="isCompareMode ? compareVersionsData : undefined"
              :compare-version-colors="isCompareMode ? versionColorMap : undefined"
              :compare-loading="compareLoading"
              :base-version-id="isCompareMode ? baseVersionId : undefined"
              @annotation-change="$emit('annotation-change', $event)"
              @zoom-change="$emit('zoom-change', $event)"
              @image-loaded="$emit('image-loaded', $event)"
              @annotation-select="$emit('annotation-select', $event)"
              @undo-change="$emit('undo-change', $event)"
              @redo-change="$emit('redo-change', $event)"
            />
          </slot>
        </div>
      </div>

      <!-- 右侧工具栏 -->
      <el-scrollbar height="calc(100vh - 25px - 32px)">
        <div class="right-panel w-[341px] bg-white p-2 flex flex-col gap-3">
          <!-- 返回/关闭按钮 -->
          <slot name="close-button">
            <el-button class="w-full" @click="$emit('close')">
              <template #icon><el-icon><ArrowLeft /></el-icon></template>
              返回
            </el-button>
          </slot>

          <!-- 基础工具面板 -->
          <BaseToolsPanel
            :navigator-visible="navigatorVisible"
            @zoom-in="$emit('zoom-in')"
            @zoom-out="$emit('zoom-out')"
            @reset="$emit('reset-view')"
            @toggle-fullscreen="$emit('toggle-fullscreen')"
            @toggle-navigator="$emit('toggle-navigator')"
          />

          <!-- 缩放控制面板 -->
          <ZoomControlPanel
            :zoom-level="zoomLevel"
            :zoom-percentage="zoomPercentage"
            @zoom-change="$emit('zoom-change-slider', $event)"
          />

          <!-- 精修工具面板 -->
          <RefineToolsPanel
            v-if="isRefineMode"
            :current-tool="currentTool"
            :can-undo="canUndo"
            :can-redo="canRedo"
            :selected-annotation-id="selectedAnnotationId"
            :submit-loading="submitLoading"
            @tool-change="$emit('tool-change', $event)"
            @submit="$emit('submit-refine', $event)"
            @exit="$emit('exit-refine')"
            @undo="$emit('undo')"
            @redo="$emit('redo')"
            @delete-selected="$emit('delete-selected')"
            @clear-annotation="$emit('clear-annotation')"
          />

          <!-- 版本对比面板 -->
          <slot name="version-compare">
            <VersionComparePanel
              v-if="isCompareMode"
              :versions="annotationVersionsList"
              :selected-ids="selectedVersionId"
              :version-color-map="versionColorMap"
              @exit="$emit('exit-compare')"
              @select="$emit('version-select', $event)"
              @start-compare="$emit('start-compare')"
            />
          </slot>

          <!-- 操作按钮（view模式） -->
          <slot name="action-buttons">
            <div v-if="isViewMode" class="version-compare-btn">
              <el-button class="w-full" @click="$emit('switch-to-compare')">
                <template #icon><el-icon><Connection /></el-icon></template>
                版本对比
              </el-button>
            </div>
            <div v-if="isViewMode" class="enter-refine-btn">
              <el-button type="primary" class="w-full" @click="$emit('enter-refine')">
                <template #icon><el-icon><Edit /></el-icon></template>
                进入人工精修
              </el-button>
            </div>
          </slot>
        </div>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ArrowLeft, Connection, Edit } from "@element-plus/icons-vue";
import type {
  AnnotationData,
  AnnotationType,
  AnnotationRegionInfo,
  AnnotationRegionStatistics,
  ManualAnnotationStatistics,
  ImageInfo,
  SliceInfo,
  VersionInfo,
  VersionColorMap
} from "@pathology/dzi-viewer-core";
import type { VersionListItem, RefineSubmitParams } from "../types";
import AnnotationViewer from "../components/AnnotationViewer.vue";
import ImageInfoPanel from "../components/panels/ImageInfoPanel.vue";
import SliceInfoPanel from "../components/panels/SliceInfoPanel.vue";
import AnnotationStatsPanel from "../components/panels/AnnotationStatsPanel.vue";
import AnnotationRegionPanel from "../components/panels/AnnotationRegionPanel.vue";
import BaseToolsPanel from "../components/panels/BaseToolsPanel.vue";
import ZoomControlPanel from "../components/panels/ZoomControlPanel.vue";
import RefineToolsPanel from "../components/panels/RefineToolsPanel.vue";
import VersionInfoPanel from "../components/optional/VersionInfoPanel.vue";
import VersionComparePanel from "../components/optional/VersionComparePanel.vue";

defineOptions({ name: "AnnotationDetailLayout" });

defineProps<{
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
}>();

defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "close"): void;
  (e: "annotation-change", annotation: any): void;
  (e: "zoom-change", level: number): void;
  (e: "zoom-change-slider", value: number): void;
  (e: "image-loaded", info: ImageInfo): void;
  (e: "annotation-select", id: string | null): void;
  (e: "undo-change", annotation: any): void;
  (e: "redo-change", annotation: any): void;
  (e: "tool-change", tool: AnnotationType | null): void;
  (e: "undo"): void;
  (e: "redo"): void;
  (e: "delete-selected"): void;
  (e: "clear-annotation"): void;
  (e: "zoom-in"): void;
  (e: "zoom-out"): void;
  (e: "reset-view"): void;
  (e: "toggle-fullscreen"): void;
  (e: "toggle-navigator"): void;
  (e: "submit-refine", data: RefineSubmitParams): void;
  (e: "exit-refine"): void;
  (e: "exit-compare"): void;
  (e: "version-select", versionId: string): void;
  (e: "start-compare"): void;
  (e: "switch-to-compare"): void;
  (e: "enter-refine"): void;
}>();
</script>

<style lang="scss">
.annotation-detail-body {
  padding: 0;
}

.annotation-detail-header {
  padding-bottom: 0 !important;
}
</style>
