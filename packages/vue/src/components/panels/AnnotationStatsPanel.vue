<template>
  <div class="annotation-stats-panel border border-gray-200 rounded-lg">
    <div class="header px-3 py-2 border-b border-gray-200 flex items-center justify-between">
      <el-text class="font-medium">标注区域统计</el-text>
    </div>
    <div class="content px-3 py-2 space-y-2">
      <!-- 当前版本已有标注 -->
      <div class="section-title mb-1">
        <el-text type="info" size="small">当前版本已有标注</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">总数：</el-text>
        <el-text type="primary">{{ baseStats.total }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">线标注：</el-text>
        <el-text>{{ baseStats.lineCount }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">面标注：</el-text>
        <el-text>{{ baseStats.polygonCount }}</el-text>
      </div>

      <!-- 本次新增人工标注 -->
      <el-divider class="my-2!" />
      <div class="section-title mb-1">
        <el-text type="info" size="small">本次新增人工标注</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">总数：</el-text>
        <el-text type="primary">
          {{ manualStats.manualLineCount + manualStats.manualPolygonCount }}
        </el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">线标注：</el-text>
        <el-text type="success">+{{ manualStats.manualLineCount }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">面标注：</el-text>
        <el-text type="success">+{{ manualStats.manualPolygonCount }}</el-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  AnnotationRegionStatistics,
  ManualAnnotationStatistics
} from "@pathology/dzi-viewer-core";

defineOptions({ name: "AnnotationStatsPanel" });

defineProps<{
  baseStats: AnnotationRegionStatistics;
  manualStats: ManualAnnotationStatistics;
}>();
</script>
