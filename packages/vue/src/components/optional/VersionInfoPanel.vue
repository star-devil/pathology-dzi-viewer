<template>
  <div class="version-info-panel border border-gray-200 rounded-lg">
    <div class="header px-3 py-2 border-b border-gray-200 flex items-center justify-between">
      <el-text class="font-medium">版本信息</el-text>
    </div>
    <div class="content px-3 py-2 space-y-2">
      <div class="flex justify-between">
        <el-text type="info" size="small">版本号：</el-text>
        <el-text>{{ data.versionNumber }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">版本类型：</el-text>
        <el-text>{{ data.versionType }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">创建时间：</el-text>
        <el-text>{{ data.createdTime }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">标注状态：</el-text>
        <el-tag
          :type="statusMap[data.status]?.type || 'info'"
          round
          size="small"
          effect="dark"
        >
          {{ statusMap[data.status]?.label || data.status }}
        </el-tag>
      </div>
      <div v-if="data.status === 'FAILED'" class="flex justify-between">
        <el-text type="info" size="small">错误信息：</el-text>
        <el-text>{{ data.errorMessage }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">标注人：</el-text>
        <el-text>{{ data.creator }}</el-text>
      </div>
      <div class="flex justify-between">
        <el-text type="info" size="small">标注完成时间：</el-text>
        <el-text>{{ data.annotatedTime }}</el-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ANNOTATION_STATUS_MAP, type VersionInfo } from "@pathology/dzi-viewer-core";

defineOptions({ name: "VersionInfoPanel" });

defineProps<{
  data: VersionInfo;
}>();

const statusMap = ANNOTATION_STATUS_MAP;
</script>
