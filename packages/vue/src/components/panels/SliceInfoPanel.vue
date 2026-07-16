<template>
  <div class="slice-info-panel border border-gray-200 rounded-lg">
    <div class="header px-3 py-2 border-b border-gray-200 flex items-center justify-between">
      <el-text class="font-medium">切片信息</el-text>
    </div>
    <div class="content px-3 py-2 space-y-2">
      <div class="flex justify-between">
        <el-text type="info" size="small">切片ID：</el-text>
        <el-text>{{ data.sliceId }}</el-text>
      </div>
      <div v-if="data.fileName" class="flex justify-between">
        <el-text type="info" size="small">文件名称：</el-text>
        <el-text>{{ data.fileName }}</el-text>
      </div>
      <div v-if="data.fileType" class="flex justify-between">
        <el-text type="info" size="small">文件类型：</el-text>
        <el-text>{{ data.fileType }}</el-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SliceInfo } from "@pathology/dzi-viewer-core";

defineOptions({ name: "SliceInfoPanel" });

defineProps<{
  data: SliceInfo;
}>();
</script>
