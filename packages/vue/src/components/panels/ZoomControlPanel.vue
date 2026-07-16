<template>
  <div class="zoom-control-panel border border-gray-200 rounded-lg p-3">
    <el-text class="font-medium mb-3 block">缩放控制</el-text>
    <el-slider
      :model-value="zoomPercentage"
      :min="10"
      :max="5000"
      :format-tooltip="(val: number) => `${(val / 100).toFixed(2)}x`"
      @update:model-value="handleZoomChange"
    />
    <div class="flex justify-between mt-2">
      <el-text type="info" size="small">{{ zoomLevel.toFixed(2) }}x</el-text>
      <el-text type="info" size="small">({{ zoomPercentage }}%)</el-text>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: "ZoomControlPanel" });

const props = defineProps<{
  zoomLevel: number;
  zoomPercentage: number;
}>();

const emit = defineEmits<{
  (e: "zoom-change", value: number): void;
}>();

function handleZoomChange(value: number) {
  emit("zoom-change", value);
}
</script>
