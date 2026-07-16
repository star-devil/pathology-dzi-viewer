<template>
  <div class="version-compare-panel border border-gray-200 rounded-lg p-3">
    <el-text class="font-medium mb-2! block">切片版本列表</el-text>
    <el-text type="info" size="small" class="mb-1! block">
      最多选择 5 个版本进行对比
    </el-text>

    <el-scrollbar max-height="300px">
      <div class="version-list space-y-2">
        <div
          v-for="version in versions"
          :key="version.id"
          class="version-item border rounded p-2 cursor-pointer transition-all"
          :class="{ 'version-selected': selectedIds.includes(version.id) }"
          :style="getVersionItemStyle(version.id)"
          @click="$emit('select', version.id)"
        >
          <div
            v-if="selectedIds.includes(version.id)"
            class="version-color-bar"
            :style="{ backgroundColor: getVersionColorDisplay(version.id) }"
          />
          <div
            class="version-content"
            :class="{ 'has-color': selectedIds.includes(version.id) }"
          >
            <div class="flex items-center">
              <el-tag
                :type="typeMap[version.annotation_type]?.type || 'info'"
                size="small"
                class="mr-2"
              >
                {{ typeMap[version.annotation_type]?.label }}
              </el-tag>
              <el-text>v{{ version.version_number }}</el-text>
            </div>
            <div>
              <el-text type="info" size="small">
                由 {{ version.annotated_by_name || "-" }} 标注完成于
                {{ version.annotated_at }}
              </el-text>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <el-button
      type="primary"
      class="w-full mt-3!"
      :disabled="selectedIds.length === 0"
      @click="$emit('start-compare')"
    >
      开始对比
    </el-button>
    <el-button class="w-full mt-2!" @click="$emit('exit')">取消对比</el-button>
  </div>
</template>

<script lang="ts" setup>
import { ANNOTATION_TYPE_MAP, type VersionColorMap } from "@pathology/dzi-viewer-core";
import type { VersionListItem } from "../../types";

defineOptions({ name: "VersionComparePanel" });

const props = defineProps<{
  versions: VersionListItem[];
  selectedIds: string[];
  versionColorMap?: VersionColorMap;
}>();

defineEmits<{
  (e: "select", versionId: string): void;
  (e: "start-compare"): void;
  (e: "exit"): void;
}>();

const typeMap = ANNOTATION_TYPE_MAP;

function getVersionColorDisplay(versionId: string): string {
  return props.versionColorMap?.[versionId]?.color || "";
}

function getVersionItemStyle(versionId: string): Record<string, string> {
  if (props.versionColorMap?.[versionId]) {
    const color = props.versionColorMap[versionId].color;
    return { borderColor: color, backgroundColor: `${color}15` };
  }
  return {};
}
</script>

<style lang="scss" scoped>
.version-item {
  position: relative;
  padding-left: 10px;
  border-width: 1px;

  &:hover {
    background-color: var(--el-fill-color-light) !important;
  }

  &.version-selected {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }
}

.version-color-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  border-radius: 4px 0 0 4px;
}

.version-content {
  padding-left: 6px;

  &.has-color {
    padding-left: 4px;
  }
}

.el-button + .el-button {
  margin-left: unset !important;
}
</style>
