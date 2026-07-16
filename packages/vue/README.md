# @pathology/dzi-viewer-vue

病理切片 DZI 标注预览 Vue 3 组件 —— 基于 OpenSeadragon 的病理图像查看与标注系统。

提供开箱即用的 Vue 3 组件（图像查看器 + 工具面板 + 标注统计 + 版本对比），配合 `@pathology/dzi-viewer-core` 提供完整的数据和视图能力。

## 示例图片
https://github.com/star-devil/pathology-dzi-viewer/blob/main/example_image/image.png?raw=true

## 安装

```bash
pnpm add @pathology/dzi-viewer-vue
```

core 包会自动安装，无需手动添加。但你需要确保以下 peer dependencies 已安装：

```bash
pnpm add vue element-plus @element-plus/icons-vue openseadragon
```

## 快速开始

```vue
<template>
  <AnnotationViewer
    ref="viewerRef"
    :image-url="dziUrl"
    :annotation-data="annotations"
    :current-tool="currentTool"
    :read-only="false"
    @image-loaded="onImageLoaded"
    @annotation-change="onAnnotationChange"
    @zoom-change="onZoomChange"
  />
</template>

<script setup>
import { ref } from "vue";
import { AnnotationViewer } from "@pathology/dzi-viewer-vue";
import "@pathology/dzi-viewer-vue/dist/dzi-viewer-vue.css";

const dziUrl = ref("https://example.com/slide.dzi");
const currentTool = ref(null);
const annotations = ref([]);

function onImageLoaded(info) {
  console.log("图像尺寸:", info.width, "×", info.height);
}
function onAnnotationChange(annotation) {
  console.log("标注变更:", annotation);
}
function onZoomChange(level) {
  console.log("缩放级别:", level);
}
</script>
```

> **注意**：必须引入 CSS 文件 `@pathology/dzi-viewer-vue/dist/dzi-viewer-vue.css`，否则组件样式不生效。

## 组件列表

### 🔴 必选组件

| 组件 | 描述 | 核心 Props |
|------|------|-----------|
| `AnnotationViewer` | DZI 图像查看器 + 标注绘制引擎 | `imageUrl`, `annotationData`, `currentTool`, `readOnly` |
| `ImageInfoPanel` | 图像基本信息（尺寸、瓦片、格式等） | `data: ImageInfo` |
| `SliceInfoPanel` | 切片基本信息（ID、文件名、类型） | `data: SliceInfo` |
| `AnnotationStatsPanel` | 标注统计（基础标注 + 人工标注） | `baseStats`, `manualStats` |
| `AnnotationRegionPanel` | 标注区域列表（颜色、类型、面积） | `regions: AnnotationRegionInfo[]` |
| `BaseToolsPanel` | 基础工具（放大/缩小/重置/全屏/导航器） | `navigatorVisible` |
| `ZoomControlPanel` | 缩放滑块控制 | `zoomLevel`, `zoomPercentage` |
| `RefineToolsPanel` | 精修工具（画笔/撤销/重做/删除/提交） | `currentTool`, `canUndo`, `canRedo` |

### 🟡 可选组件

| 组件 | 描述 | 核心 Props |
|------|------|-----------|
| `VersionInfoPanel` | 版本信息（版本号、类型、状态、标注人） | `data: VersionInfo` |
| `VersionComparePanel` | 版本对比（多版本选择 + 差异可视化） | `versions`, `selectedIds`, `versionColorMap` |
| `AnnotationDetailLayout` | 完整三栏布局（左侧信息 + 中间查看器 + 右侧工具） | 所有状态 props |

## Composable

### `useAnnotationViewer(options)`

核心业务逻辑 composable，管理标注预览的全部状态和方法。

```ts
import { useAnnotationViewer } from "@pathology/dzi-viewer-vue";

const {
  // 状态
  annotationLoading,
  submitLoading,
  currentAnnotation,
  fileUrl,
  imageInfo,
  sliceInfo,
  versionInfo,
  zoomLevel,
  zoomPercentage,
  currentTool,
  canUndo,
  canRedo,

  // 标注统计
  baseAnnotationStatistics,
  manualAnnotationStatistics,
  annotationRegions,

  // 方法
  handleZoomIn,
  handleZoomOut,
  handleResetView,
  handleToolChange,
  handleUndo,
  handleRedo,
  handleEnterRefine,
  returnToViewMode,
  handleSubmitRefine,
  handleDeleteSelectedAnnotation,
  handleClearAnnotation,

  // 版本对比
  handleVersionSelect,
  handleStartCompare,
  handleSwitchToCompare,

  // 引用
  dziViewerRef,
} = useAnnotationViewer({
  imageId: "img-001",
  annotationTaskId: "task-001",
  mode: "view",                          // 'view' | 'refine' | 'compare'
  dataProvider: myDataProvider,          // 实现 AnnotationDataProvider 接口
  onMessage: (msg, opts) => {            // 消息回调
    ElMessage({ message: msg, type: opts?.type });
  }
});
```

## 数据提供器接口

使用者需要实现 `AnnotationDataProvider` 接口来对接自己的 API：

```ts
import type { AnnotationDataProvider } from "@pathology/dzi-viewer-vue";

const myDataProvider: AnnotationDataProvider = {
  // 获取标注数据（必填）
  async getAnnotation(imageId, versionId) {
    const res = await fetch(`/api/images/${imageId}/annotations?version_id=${versionId || ""}`);
    return res.json();
  },

  // 获取版本列表（版本对比时需要）
  async getVersions({ imageId, annotationTaskId, page, pageSize }) {
    const res = await fetch(`/api/annotation-versions?image_id=${imageId}&page=${page}&page_size=${pageSize}`);
    const data = await res.json();
    return data.content;
  },

  // 提交精修（精修模式需要）
  async submitRefine(imageId, { annotationTaskId, versionName, versionRemark, annotationData }) {
    await fetch(`/api/images/${imageId}/annotations`, {
      method: "POST",
      body: JSON.stringify({
        annotation_task_id: annotationTaskId,
        version_name: versionName,
        version_remark: versionRemark,
        annotation_data: annotationData
      })
    });
  }
};
```

## AnnotationViewer 实例方法

通过 `ref` 获取组件实例后，可调用以下方法：

```ts
const viewerRef = ref<InstanceType<typeof AnnotationViewer>>();

// 缩放控制
viewerRef.value.zoomTo(2.5);
viewerRef.value.zoomIn();
viewerRef.value.zoomOut();
viewerRef.value.resetView();
viewerRef.value.getZoomLevel();

// 标注管理
viewerRef.value.getDoodleManager();         // 获取 DoodleManager 实例
viewerRef.value.undo();
viewerRef.value.redo();
viewerRef.value.canUndo();
viewerRef.value.canRedo();
viewerRef.value.setRefineMode(true);
viewerRef.value.clearAllShapes();

// 版本对比
viewerRef.value.drawCompareAnnotations(() => {
  console.log("对比标注绘制完成");
});

// 原始 OpenSeadragon 实例
viewerRef.value.getViewer();
```

## 完整布局用法

```vue
<template>
  <AnnotationDetailLayout
    :visible="visible"
    :window-title="title"
    :is-view-mode="true"
    :is-compare-mode="false"
    :is-refine-mode="false"
    :annotation-loading="loading"
    :submit-loading="false"
    :current-annotation="annotation"
    :annotation-versions-list="versions"
    :current-tool="null"
    :file-url="fileUrl"
    :version-info="version"
    :image-info="imageInfo"
    :slice-info="sliceInfo"
    :base-annotation-statistics="baseStats"
    :manual-annotation-statistics="manualStats"
    :annotation-regions="regions"
    :zoom-level="1"
    :zoom-percentage="100"
    :can-undo="false"
    :can-redo="false"
    :navigator-visible="true"
    :base-version-id="''"
    @close="handleClose"
    @zoom-in="handleZoomIn"
    @zoom-out="handleZoomOut"
    @enter-refine="handleEnterRefine"
    @switch-to-compare="handleSwitchToCompare"
    @submit-refine="handleSubmitRefine"
  />
</template>

<script setup>
import { AnnotationDetailLayout } from "@pathology/dzi-viewer-vue";
import "@pathology/dzi-viewer-vue/dist/dzi-viewer-vue.css";
</script>
```

## 模式切换

组件支持三种模式：

```
view（预览） →  refine（精修） →  view（预览）
   ↓                                    ↑
compare（对比） ──────────────────────────┘
```

## Peer Dependencies

| 依赖 | 版本 | 说明 |
|------|------|------|
| `vue` | `^3.4.0` | UI 框架 |
| `element-plus` | `^2.0.0` | 组件库 |
| `@element-plus/icons-vue` | `^2.0.0` | 图标库 |
| `openseadragon` | `^5.0.0` | DZI 图像引擎 |

## 开发

```bash
pnpm --filter @pathology/dzi-viewer-vue build
pnpm --filter @pathology/dzi-viewer-vue dev      # watch 模式
pnpm --filter @pathology/dzi-viewer-vue typecheck
```

## License

MIT
