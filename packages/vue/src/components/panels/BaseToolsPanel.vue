<template>
  <div class="base-tools-panel border border-gray-200 rounded-lg p-3">
    <el-text class="font-medium mb-2! block">基础工具</el-text>
    <div class="tools-grid grid grid-cols-2 gap-2">
      <el-button size="small" @click="$emit('zoom-in')">
        <template #icon><el-icon><ZoomIn /></el-icon></template>
        放大
      </el-button>
      <el-button size="small" @click="$emit('zoom-out')">
        <template #icon><el-icon><ZoomOut /></el-icon></template>
        缩小
      </el-button>
      <el-button size="small" @click="$emit('reset')">
        <template #icon><el-icon><Refresh /></el-icon></template>
        重置视图
      </el-button>
      <el-button size="small" @click="$emit('toggle-fullscreen')">
        <template #icon><el-icon><FullScreen /></el-icon></template>
        全屏
      </el-button>
    </div>
    <el-button
      size="small"
      class="w-full mt-2!"
      :type="navigatorVisible ? 'primary' : 'default'"
      @click="$emit('toggle-navigator')"
    >
      <template #icon><el-icon><Position /></el-icon></template>
      {{ navigatorVisible ? "隐藏导航器" : "显示导航器" }}
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import {
  ZoomIn,
  ZoomOut,
  Refresh,
  FullScreen,
  Position
} from "@element-plus/icons-vue";

defineOptions({ name: "BaseToolsPanel" });

withDefaults(defineProps<{
  navigatorVisible?: boolean;
}>(), {
  navigatorVisible: true
});

defineEmits<{
  (e: "zoom-in"): void;
  (e: "zoom-out"): void;
  (e: "reset"): void;
  (e: "toggle-fullscreen"): void;
  (e: "toggle-navigator"): void;
}>();
</script>

<style lang="scss" scoped>
.tools-grid {
  .el-button {
    width: 100%;
    margin-left: unset;
  }
}
</style>
