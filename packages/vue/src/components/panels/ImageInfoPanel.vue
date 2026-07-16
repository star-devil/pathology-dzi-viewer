<template>
  <div class="image-info-panel border border-gray-200 rounded-lg">
    <div class="header px-3 py-2 border-b border-gray-200 flex items-center justify-between">
      <el-text class="font-medium">图像信息</el-text>
    </div>
    <div v-if="data.width > 0" class="content px-3 py-2 space-y-2">
      <div class="flex justify-between">
        <el-text type="info" size="small">尺寸:</el-text>
        <el-text>{{ data.width }} × {{ data.height }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">宽高比:</el-text>
        <el-text>{{ aspectRatio }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">像素总数:</el-text>
        <el-text>{{ totalPixels.toLocaleString() }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">瓦片大小:</el-text>
        <el-text>{{ data.tileSize }}px</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">瓦片重叠:</el-text>
        <el-text>{{ data.tileOverlap }}px</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">缩放级别:</el-text>
        <el-text>{{ data.minLevel }} - {{ data.maxLevel }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">格式:</el-text>
        <el-text>{{ data.format?.toUpperCase() }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">MIME类型:</el-text>
        <el-text>{{ data.mimeType }}</el-text>
      </div>
    </div>
    <div v-else class="content px-3 py-2 text-center text-gray-400">
      <el-text type="info" size="small">图像加载中...</el-text>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { ImageInfo } from "@pathology/dzi-viewer-core";

defineOptions({ name: "ImageInfoPanel" });

const props = defineProps<{
  data: ImageInfo;
}>();

const totalPixels = computed(() => props.data.width * props.data.height);

const aspectRatio = computed(() => {
  if (props.data.height === 0) return "0:0";
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(props.data.width, props.data.height);
  return `${props.data.width / divisor}:${props.data.height / divisor}`;
});
</script>
