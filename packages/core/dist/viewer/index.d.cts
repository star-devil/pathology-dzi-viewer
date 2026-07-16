import { S as SupportedImageFormat } from '../viewer-BdmZLkJ6.cjs';
import OpenSeadragon from 'openseadragon';

/** 根据文件名获取图像格式 */
declare function getImageFormatFromFilename(filename: string): SupportedImageFormat | null;
/** 根据 MIME 类型获取图像格式 */
declare function getImageFormatFromMimeType(mimeType: string): SupportedImageFormat | null;
/** 检查文件是否为支持的图像格式 */
declare function isSupportedImageFormat(filename: string): boolean;
/** 构建DZI图像URL */
declare function buildDziImageUrl(imagePath: string, format: SupportedImageFormat, dziServer?: string): string;
/** 验证DZI图像URL是否有效 */
declare function validateDziUrl(url: string): Promise<boolean>;
/** 加载图像并返回瓦片源（用于OpenSeadragon） */
declare function loadImage(imagePath: string, dziServer?: string): Promise<string>;

/**
 * 创建 OpenSeadragon 查看器实例
 */
declare function createViewer(element: HTMLElement, tileSources: string | OpenSeadragon.TileSource[], overrides?: Record<string, unknown>): OpenSeadragon.Viewer;
/**
 * 从图像URL创建查看器
 */
declare function createViewerFromUrl(element: HTMLElement, imageUrl: string, overrides?: Record<string, unknown>): OpenSeadragon.Viewer;
/**
 * 提取图像信息
 */
declare function extractImageInfo(viewer: OpenSeadragon.Viewer, imageUrl: string): {
    width: number;
    height: number;
    tileSize: any;
    tileOverlap: any;
    minLevel: any;
    maxLevel: any;
    format: any;
    mimeType: any;
};

export { buildDziImageUrl, createViewer, createViewerFromUrl, extractImageInfo, getImageFormatFromFilename, getImageFormatFromMimeType, isSupportedImageFormat, loadImage, validateDziUrl };
