<template>
  <div class="annotation-region-panel border border-gray-200 rounded-lg">
    <div class="header px-3 py-2 border-b border-gray-200 flex items-center justify-between">
      <el-text class="font-medium">标注区域信息</el-text>
    </div>
    <el-scrollbar max-height="400px">
      <div class="content px-3 py-2 space-y-2">
        <div
          v-for="(region, index) in regions"
          :key="index"
          class="region-item"
        >
          <div class="grid grid-cols-3 gap-2">
            <div class="flex items-center gap-2">
              <span
                class="color-indicator w-3 h-3 rounded-full flex-shrink-0"
                :style="{ backgroundColor: region.colorCode }"
              />
              <el-text size="small" class="whitespace-nowrap">
                {{ region.tissueType }}
              </el-text>
            </div>
            <el-text type="info" size="small" class="whitespace-nowrap">
              {{ region.regionLevel }}
            </el-text>
            <el-text type="info" size="small" class="whitespace-nowrap">
              {{ region.area }}
            </el-text>
          </div>
        </div>
        <div v-if="regions.length === 0" class="text-center py-4">
          <el-text type="info" size="small">暂无标注区域</el-text>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import type { AnnotationRegionInfo } from "@pathology/dzi-viewer-core";

defineOptions({ name: "AnnotationRegionPanel" });

defineProps<{
  regions: AnnotationRegionInfo[];
}>();
</script>
