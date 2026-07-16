# @pathology/dzi-viewer

病理切片 DZI 标注预览组件库 —— 基于 OpenSeadragon 的病理图像查看与标注系统。

  [![npm version](https://img.shields.io/npm/v/%40pathology%2Fdzi-viewer-core.svg)](https://www.npmjs.com/package/%40pathology%2Fdzi-viewer-core)

  [![npm downloads](https://img.shields.io/npm/dm/%40pathology%2Fdzi-viewer-core.svg)](https://www.npmjs.com/package/%40pathology%2Fdzi-viewer-core)
 
   [![npm version](https://img.shields.io/npm/v/%40pathology%2Fdzi-viewer-vue.svg)](https://www.npmjs.com/package/%40pathology%2Fdzi-viewer-vue)

  [![npm downloads](https://img.shields.io/npm/dm/%40pathology%2Fdzi-viewer-vue.svg)](https://www.npmjs.com/package/%40pathology%2Fdzi-viewer-vue)

## 示例图片
![示例图片](https://github.com/star-devil/pathology-dzi-viewer/blob/main/example_image/image.png?raw=true)


## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 图像引擎 | [OpenSeadragon](https://openseadragon.github.io/) ^5.0 | DZI 深度缩放图像渲染 |
| 标注引擎 | [@wtsml/doodle](https://www.npmjs.com/package/@wtsml/doodle) ^1.0 | 矢量标注绘制（基于 SVG overlay） |
| UI 框架 | [Vue 3](https://vuejs.org/) ^3.4 | Composition API + `<script setup>` |
| 组件库 | [Element Plus](https://element-plus.org/) ^2.0 | UI 控件（按钮、对话框、滑块等） |
| 图标 | [@element-plus/icons-vue](https://element-plus.org/en-US/component/icon.html) ^2.0 | 工具图标 |
| 构建 | tsup (core) + Vite 6 (vue) | Monorepo 分包的构建方案 |
| 类型 | TypeScript ^5.4 | 完整类型声明 |
| 包管理 | pnpm workspace | Monorepo 依赖管理 |

## 包结构

```
dzi-viewer/
├── packages/
│   ├── core/   →  @pathology/dzi-viewer-core    纯 TS 引擎（无 UI 框架依赖）
│   └── vue/    →  @pathology/dzi-viewer-vue     Vue 3 组件层
```

## 快速开始

### 安装

```bash
# 安装两个包（vue 会自动依赖 core）
pnpm add @pathology/dzi-viewer-vue @pathology/dzi-viewer-core

# 确保 peerDependencies 已安装
pnpm add vue element-plus @element-plus/icons-vue openseadragon
```

### 基础用法

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

### 完整布局用法（三栏布局）

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
    :compare-loading="false"
    :current-annotation="annotation"
    :annotation-versions-list="versions"
    :selected-version-id="[]"
    :compare-versions-data="{}"
    :version-color-map="{}"
    :current-tool="null"
    :file-url="fileUrl"
    :version-info="version"
    :image-info="imageInfo"
    :slice-info="sliceInfo"
    :base-annotation-statistics="baseStats"
    :manual-annotation-statistics="manualStats"
    :annotation-regions="regions"
    :selected-annotation-id="null"
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
// ... 使用 useAnnotationViewer composable 提供数据绑定
</script>
```

---

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
| `RefineToolsPanel` | 精修工具（画笔/撤销/重做/删除/提交） | `currentTool`, `canUndo`, `canRedo`, `selectedAnnotationId` |

### 🟡 可选组件

| 组件 | 描述 | 核心 Props |
|------|------|-----------|
| `VersionInfoPanel` | 版本信息（版本号、类型、状态、标注人） | `data: VersionInfo` |
| `VersionComparePanel` | 版本对比（多版本选择 + 差异可视化） | `versions`, `selectedIds`, `versionColorMap` |
| `AnnotationDetailLayout` | 完整三栏布局（左侧信息 + 中间查看器 + 右侧工具） | 所有状态 props |

---

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

  // ...
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

---

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

---

## 核心 API

### `AnnotationViewer` 方法（通过 ref 调用）

```ts
const viewerRef = ref<InstanceType<typeof AnnotationViewer>>();

// 缩放控制
viewerRef.value.zoomTo(2.5);           // 缩放到指定级别
viewerRef.value.zoomIn();              // 放大
viewerRef.value.zoomOut();             // 缩小
viewerRef.value.resetView();           // 重置视图
viewerRef.value.getZoomLevel();        // 获取当前缩放级别

// 标注管理
viewerRef.value.getDoodleManager();    // 获取 DoodleManager 实例
viewerRef.value.undo();                // 撤销
viewerRef.value.redo();                // 重做
viewerRef.value.canUndo();             // 能否撤销
viewerRef.value.canRedo();             // 能否重做
viewerRef.value.setRefineMode(true);   // 切换精修模式
viewerRef.value.clearAllShapes();      // 清空所有图形

// 版本对比
viewerRef.value.drawCompareAnnotations(() => {
  console.log("对比标注绘制完成");
});

// 原始 OpenSeadragon 实例
viewerRef.value.getViewer();
```

### `DoodleManager` (通过 `getDoodleManager()` 获取)

```ts
const manager = viewerRef.value.getDoodleManager();

// 图形操作
manager.addShape(shape);              // 添加图形
manager.removeShape(id);              // 删除图形
manager.getShapes();                  // 获取所有图形
manager.getShapeById(id);             // 按 ID 获取图形
manager.updateShape(shape);           // 更新图形

// 工具控制
manager.setActiveTool("polygon");     // 切换标注工具
manager.getCurrentTool();             // 获取当前工具

// 撤销/重做
manager.undo();
manager.redo();
manager.canUndo();
manager.canRedo();
manager.clearHistory();               // 清空历史

// 精修模式
manager.setRefineMode(true);
manager.getRefineMode();

// 销毁
manager.destroy();
```

---

## 标注工具类型

| 工具 | 类型标识 | 说明 |
|------|---------|------|
| 移动 | `move` | 选中并移动标注 |
| 直线 | `line` | 绘制直线/箭头 |
| 矩形 | `rect` | 绘制矩形 |
| 多边形 | `polygon` | 绘制多边形 |
| 圆 | `circle` | 绘制圆形 |
| 椭圆 | `ellipse` | 绘制椭圆 |
| 路径 | `path` | 自由路径 |
| 闭合路径 | `closed_path` | 闭合自由路径 |

---

## 标注数据格式

API 交互使用的标注数据格式（`AnnotationData`）：

```ts
type AnnotationData = AnnotationRegion[];

interface AnnotationRegion {
  external: AnnotationPoint[];     // 外边界点
  holes: AnnotationPoint[][];      // 内部空洞
  shape?: AnnotationShape;         // 形状类型
}

// 支持的点格式
type AnnotationPoint =
  | { x: number; y: number }                      // 普通点
  | { x: number; y: number; r: number }           // 圆
  | { x: number; y: number; rx: number; ry: number } // 椭圆
  | { x: number; y: number; width: number; height: number }; // 矩形
```

---

## 版本对比

版本对比功能通过差异算法实现，支持最多 5 个版本同时对比：

```ts
import { compareAnnotationVersions } from "@pathology/dzi-viewer-core";

const result = compareAnnotationVersions(baseData, compareData, 0.7);
// result.differences: DifferenceRegion[]
// result.addedCount / removedCount / modifiedCount / unchangedCount
```

差异类型：`added` | `removed` | `modified` | `unchanged`

---

## 模式切换

组件支持三种模式，通过 `mode` 或手动切换：

```
view (预览)  →  refine (精修)  →  view (预览)
   ↓                                  ↑
compare (对比)  ──────────────────────┘
```

---

## Peer Dependencies

使用此组件库需要在项目中安装以下依赖：

```json
{
  "vue": "^3.4.0",
  "element-plus": "^2.0.0",
  "@element-plus/icons-vue": "^2.0.0",
  "openseadragon": "^5.0.0"
}
```

---

## 开发

```bash
# 安装依赖
pnpm install

# 构建 core 包
pnpm --filter @pathology/dzi-viewer-core build

# 构建 vue 包
pnpm --filter @pathology/dzi-viewer-vue build

# 构建所有包
pnpm build

# 开发模式（监听文件变化）
pnpm --filter @pathology/dzi-viewer-core dev
pnpm --filter @pathology/dzi-viewer-vue dev
```

---

## License

MIT
