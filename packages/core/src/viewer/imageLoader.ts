import type { SupportedImageFormat } from "../types/viewer";

// ===== 文件扩展名映射 =====

const FILE_EXTENSION_MAP: Record<string, SupportedImageFormat> = {
  ".tiff": "tiff",
  ".tif": "tiff",
  ".svs": "svs",
  ".kfb": "kfb",
  ".dzi": "dzi"
};

const MIME_TYPE_MAP: Record<string, SupportedImageFormat> = {
  "image/tiff": "tiff",
  "image/tif": "tiff",
  "image/x-tiff": "tiff",
  "image/x-tif": "tiff",
  "application/x-tiff": "tiff",
  "application/x-tif": "tiff",
  "image/svs": "svs",
  "image/kfb": "kfb",
  "application/xml": "dzi",
  "text/xml": "dzi"
};

// ===== 公共 API =====

/** 根据文件名获取图像格式 */
export function getImageFormatFromFilename(
  filename: string
): SupportedImageFormat | null {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return FILE_EXTENSION_MAP[extension] || null;
}

/** 根据 MIME 类型获取图像格式 */
export function getImageFormatFromMimeType(
  mimeType: string
): SupportedImageFormat | null {
  return MIME_TYPE_MAP[mimeType.toLowerCase()] || null;
}

/** 检查文件是否为支持的图像格式 */
export function isSupportedImageFormat(filename: string): boolean {
  const format = getImageFormatFromFilename(filename);
  return format !== null;
}

/** 构建DZI图像URL */
export function buildDziImageUrl(
  imagePath: string,
  format: SupportedImageFormat,
  dziServer: string = ""
): string {
  const baseUrl = dziServer || "";
  if (format === "dzi") {
    return `${baseUrl}${imagePath}`;
  }
  return `${baseUrl}${imagePath}.dzi`;
}

/** 验证DZI图像URL是否有效 */
export async function validateDziUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

/** 加载图像并返回瓦片源（用于OpenSeadragon） */
export async function loadImage(
  imagePath: string,
  dziServer: string = ""
): Promise<string> {
  // 检测图像格式
  const format = getImageFormatFromFilename(imagePath);
  if (!format) {
    throw new Error(`不支持的图像格式: ${imagePath}`);
  }

  // 构建DZI URL
  const dziUrl = buildDziImageUrl(imagePath, format, dziServer);

  // 验证URL
  const isValid = await validateDziUrl(dziUrl);
  if (!isValid) {
    throw new Error(`无法访问图像: ${dziUrl}`);
  }

  // 对于DZI格式，直接返回URL，让OpenSeadragon自动处理
  return dziUrl;
}
