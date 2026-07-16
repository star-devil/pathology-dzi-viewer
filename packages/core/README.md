# @pathology/dzi-viewer-core

病理切片 DZI 标注预览核心引擎 —— 纯 TypeScript，无 UI 框架依赖。

基于 [OpenSeadragon](https://openseadragon.github.io/) 和 [@wtsml/doodle](https://www.npmjs.com/package/@wtsml/doodle)，提供图像查看器创建、标注管理、几何计算、版本对比等能力。可在浏览器端或任何支持 DOM 的 JS 环境中使用。

## 示例图片
https://github.com/star-devil/pathology-dzi-viewer/blob/main/example_image/image.png?raw=true


## 安装

```bash
pnpm add @pathology/dzi-viewer-core
```

需要安装 peer dependency：

```bash
pnpm add openseadragon
```

## 快速开始

```ts
import { createViewer, DoodleManager } from "@pathology/dzi-viewer-core";

// 创建查看器
const viewer = createViewer(document.getElementById("viewer")!, "https://example.com/slide.dzi");

// 获取图像信息
viewer.addHandler("open", () => {
  const tiledImage = viewer.world.getItemAt(0);
  console.log("图像尺寸:", tiledImage.getContentSize());
});

// 创建标注管理器
const manager = new DoodleManager(viewer);

// 切换工具
manager.setActiveTool("polygon");

// 监听标注变更
manager.onShapeChange((shapes) => {
  console.log("当前标注:", shapes);
});
```

## 模块导览

包按子路径导出，可按需引入：

```ts
// 主入口（全部导出）
import { createViewer, DoodleManager, compareAnnotationVersions } from "@pathology/dzi-viewer-core";

// 按子路径引入
import { createViewer, createViewerFromUrl, extractImageInfo } from "@pathology/dzi-viewer-core/viewer";
import { DoodleManager } from "@pathology/dzi-viewer-core/annotations";
import { compareAnnotationVersions, calculatePolygonArea } from "@pathology/dzi-viewer-core/utils";
import type { AnnotationData, ImageInfo, DziViewerConfig } from "@pathology/dzi-viewer-core/types";
```

## API 参考

### viewer — 查看器

| 函数 | 说明 |
|------|------|
| `createViewer(element, tileSources, overrides?)` | 创建 OpenSeadragon 查看器实例 |
| `createViewerFromUrl(element, imageUrl, overrides?)` | 从图像 URL 创建查看器 |
| `extractImageInfo(viewer, imageUrl)` | 提取图像信息（尺寸、瓦片大小、层级等） |

```ts
const viewer = createViewer(
  document.getElementById("container")!,
  "https://example.com/slide.dzi",
  { showNavigator: true, maxZoomPixelRatio: 3 }
);
```

### annotations — 标注管理

#### DoodleManager

```ts
import { DoodleManager } from "@pathology/dzi-viewer-core/annotations";

const manager = new DoodleManager(viewer);

// 工具控制
manager.setActiveTool("polygon");   // 切换标注工具
manager.getCurrentTool();           // → "polygon"
manager.setReadOnly(false);         // 设置只读模式

// 图形操作
manager.addShape(shape);            // 添加图形
manager.removeShape(id);            // 删除图形
manager.getShapes();                // 获取所有图形
manager.getShapeById(id);           // 按 ID 获取
manager.updateShape(shape);         // 更新图形
manager.clearAllShapes();           // 清空所有图形

// 撤销/重做
manager.undo();
manager.redo();
manager.canUndo();
manager.canRedo();
manager.clearHistory();

// 精修模式
manager.setRefineMode(true);
manager.getRefineMode();

// 销毁
manager.destroy();
```

#### 回调类型

```ts
type ShapeChangeCallback = (shapes: DoodleShape[]) => void;
type ShapeSelectCallback = (shape: DoodleShape | null) => void;
type UndoRedoCallback = (canUndo: boolean, canRedo: boolean) => void;
```

### utils — 工具函数

#### 几何计算

| 函数 | 说明 |
|------|------|
| `calculateDistance(p1, p2)` | 两点欧氏距离 |
| `calculateCentroid(points)` | 多边形重心 |
| `calculatePolygonArea(points)` | 多边形面积（鞋带公式） |
| `calculateCircleArea(r)` | 圆形面积 |
| `calculateEllipseArea(rx, ry)` | 椭圆面积 |
| `calculateRectArea(width, height)` | 矩形面积 |
| `calculateAnnotationArea(points, shapeType?)` | 通用面积计算（自动判断形状） |
| `calculateRegionLevel(area)` | 区域等级（小/中/大） |
| `formatArea(area)` | 格式化面积显示 |
| `convertPointsToPos(points, shapeType?)` | AnnotationPoint → DoodleShape pos 数组 |
| `extractFileName(filePath)` | 从路径提取文件名 |
| `extractFileType(filePath)` | 从路径提取文件类型扩展名 |

#### 坐标转换

| 函数 | 说明 |
|------|------|
| `viewportToImage(vx, vy, zoom, panX, panY)` | 视口坐标 → 图像坐标 |
| `imageToViewport(ix, iy, zoom, panX, panY)` | 图像坐标 → 视口坐标 |
| `arrayToAnnotationPoints(points)` | `number[][]` → `AnnotationPoint[]` |
| `annotationPointsToArray(points)` | `AnnotationPoint[]` → `number[][]` |

#### 图像加载

| 函数 | 说明 |
|------|------|
| `getImageFormatFromFilename(filename)` | 根据文件名获取图像格式 |
| `getImageFormatFromMimeType(mimeType)` | 根据 MIME 类型获取图像格式 |
| `isSupportedImageFormat(filename)` | 检查是否为支持的图像格式 |
| `buildDziImageUrl(imagePath, format, dziServer?)` | 构建 DZI 图像 URL |
| `validateDziUrl(url)` | 验证 DZI URL 是否可访问 |
| `loadImage(imagePath, dziServer?)` | 加载图像并返回瓦片源 URL |

#### 版本对比

| 函数 | 说明 |
|------|------|
| `compareAnnotationVersions(baseData, compareData, threshold?)` | 比较两个版本的标注差异 |
| `isRegionsEqual(region1, region2, tolerance?)` | 检查两个区域是否完全相同 |
| `calculateRegionSimilarity(region1, region2)` | 计算两个区域的相似度 |
| `findMostSimilarRegion(target, candidates, excluded, threshold?)` | 找最相似区域 |
| `getVersionColor(versionId, colorMap, defaultColor?)` | 获取版本颜色 |

```ts
import { compareAnnotationVersions } from "@pathology/dzi-viewer-core/utils";

const result = compareAnnotationVersions(baseData, compareData, 0.7);
// {
//   differences: DifferenceRegion[],
//   addedCount: 2,
//   removedCount: 1,
//   modifiedCount: 3,
//   unchangedCount: 10
// }
```

## 类型参考

### 标注数据格式

```ts
type AnnotationData = AnnotationRegion[];

interface AnnotationRegion {
  external: AnnotationPoint[];   // 外边界点
  holes: AnnotationPoint[][];    // 内部空洞
  shape?: AnnotationShape;       // 形状类型
}

type AnnotationPoint =
  | { x: number; y: number }
  | { x: number; y: number; r: number }
  | { x: number; y: number; rx: number; ry: number }
  | { x: number; y: number; width: number; height: number };

type AnnotationShape = "line" | "rect" | "polygon" | "circle" | "ellipse" | "path" | "closed_path";
```

### 标注工具类型

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

### 其他关键类型

| 类型 | 说明 |
|------|------|
| `ImageInfo` | 图像信息（尺寸、瓦片、层级等） |
| `DziViewerConfig` | 查看器配置 |
| `DoodleShape` | doodle 图形数据结构 |
| `ViewState` | 视图状态（缩放、平移、旋转） |
| `ZoomLevel` | 缩放级别信息 |
| `SliceInfo` | 切片信息 |
| `VersionInfo` | 版本信息 |
| `VersionColorMap` | 版本颜色映射 |

## 开发

```bash
pnpm --filter @pathology/dzi-viewer-core build
pnpm --filter @pathology/dzi-viewer-core dev    # watch 模式
pnpm --filter @pathology/dzi-viewer-core typecheck
```

## License

MIT
