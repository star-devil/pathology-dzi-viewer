<template>
  <div class="refine-tools-panel border border-gray-200 rounded-lg p-3">
    <el-text class="font-medium">精修工具</el-text>

    <!-- 标注工具 -->
    <div class="my-2">
      <el-text type="info" size="small" class="mb-1! block">标注工具</el-text>
      <div class="grid grid-cols-2 gap-2">
        <el-button
          v-for="tool in tools"
          :key="tool.type"
          size="small"
          :type="selectedTool === tool.type ? 'primary' : ''"
          @click="handleToolSelect(tool.type)">
          <template #icon>
            <el-icon><component :is="tool.icon" /></el-icon>
          </template>
          {{ tool.label }}
        </el-button>
      </div>
    </div>

    <!-- 辅助工具 -->
    <div class="mb-3">
      <el-text type="info" size="small" class="mb-1! block">辅助工具</el-text>
      <div class="grid grid-cols-2 gap-2">
        <el-button size="small" :disabled="!canUndo" @click="$emit('undo')">
          <template #icon
            ><el-icon><RefreshLeft /></el-icon
          ></template>
          撤销
        </el-button>
        <el-button size="small" :disabled="!canRedo" @click="$emit('redo')">
          <template #icon
            ><el-icon><RefreshRight /></el-icon
          ></template>
          重做
        </el-button>
        <el-tooltip content="请使用移动工具选择元素">
          <el-button
            size="small"
            :disabled="!selectedAnnotationId"
            @click="$emit('delete-selected')">
            <template #icon
              ><el-icon><Delete /></el-icon
            ></template>
            删除选中
          </el-button>
        </el-tooltip>
        <el-button size="small" @click="$emit('clear-annotation')">
          <template #icon
            ><el-icon><Remove /></el-icon
          ></template>
          清除全部精修
        </el-button>
      </div>
    </div>

    <!-- 提交和退出 -->
    <el-button type="primary" class="w-full mb-1!" @click="handleSubmitClick">
      提交精修
    </el-button>
    <el-button class="w-full" @click="$emit('exit')">退出精修</el-button>

    <!-- 提交精修弹窗 -->
    <el-dialog
      v-model="submitDialogVisible"
      title="提交精修"
      width="480px"
      :close-on-click-modal="false"
      destroy-on-close>
      <el-form
        ref="submitFormRef"
        :model="submitForm"
        :rules="submitRules"
        label-width="100px">
        <el-form-item label="版本号">
          <el-text type="info">提交后由系统自动生成</el-text>
        </el-form-item>
        <el-form-item label="版本名称" prop="versionName">
          <el-input
            v-model="submitForm.versionName"
            maxlength="20"
            show-word-limit
            placeholder="请输入版本名称" />
        </el-form-item>
        <el-form-item label="版本备注" prop="versionRemark">
          <el-input
            v-model="submitForm.versionRemark"
            type="textarea"
            maxlength="100"
            show-word-limit
            :rows="3"
            placeholder="请输入版本备注（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="mr-2!" @click="submitDialogVisible = false"
          >取消</el-button
        >
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleConfirmSubmit">
          确认提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import {
    Location,
    Minus,
    Grid,
    CircleCheck,
    Aim,
    CircleClose,
    EditPen,
    Finished,
    RefreshLeft,
    RefreshRight,
    Delete,
    Remove
  } from '@element-plus/icons-vue';
  import { ref, reactive, computed } from 'vue';
  import type { AnnotationType } from '@pathology/dzi-viewer-core';
  import type { FormInstance, FormRules } from 'element-plus';

  defineOptions({ name: 'RefineToolsPanel' });

  const props = defineProps<{
    currentTool: AnnotationType | null;
    canUndo: boolean;
    canRedo: boolean;
    selectedAnnotationId: string | null;
    submitLoading?: boolean;
    onMessage?: (msg: string, opts?: { type?: string }) => void;
  }>();

  const emit = defineEmits<{
    (e: 'tool-change', tool: AnnotationType | null): void;
    (e: 'submit', data: { versionName: string; versionRemark: string }): void;
    (e: 'exit'): void;
    (e: 'undo'): void;
    (e: 'redo'): void;
    (e: 'delete-selected'): void;
    (e: 'clear-annotation'): void;
  }>();

  const tools = [
    { type: 'move' as AnnotationType, label: '移动', icon: Location },
    { type: 'line' as AnnotationType, label: '直线', icon: Minus },
    { type: 'rect' as AnnotationType, label: '矩形', icon: Grid },
    { type: 'circle' as AnnotationType, label: '圆', icon: CircleCheck },
    { type: 'ellipse' as AnnotationType, label: '椭圆', icon: Aim },
    { type: 'polygon' as AnnotationType, label: '多边形', icon: CircleClose },
    { type: 'path' as AnnotationType, label: '路径', icon: EditPen },
    { type: 'closed_path' as AnnotationType, label: '闭合路径', icon: Finished }
  ];

  const selectedTool = computed(() => props.currentTool);

  // 提交弹窗
  const submitDialogVisible = ref(false);
  const submitFormRef = ref<FormInstance>();
  const submitForm = reactive({ versionName: '', versionRemark: '' });

  const submitRules: FormRules = {
    versionName: [
      { required: true, message: '请输入版本名称', trigger: 'blur' },
      { max: 20, message: '版本名称不能超过20个字符', trigger: 'blur' }
    ]
  };

  function handleSubmitClick() {
    submitForm.versionName = '';
    submitForm.versionRemark = '';
    submitDialogVisible.value = true;
  }

  async function handleConfirmSubmit() {
    if (!submitFormRef.value) return;
    await submitFormRef.value.validate((valid) => {
      if (valid) {
        emit('submit', {
          versionName: submitForm.versionName,
          versionRemark: submitForm.versionRemark
        });
        submitDialogVisible.value = false;
      } else {
        props.onMessage?.('请完善表单信息', { type: 'warning' });
      }
    });
  }

  function handleToolSelect(tool: AnnotationType) {
    if (props.currentTool === tool) {
      emit('tool-change', null);
    } else {
      emit('tool-change', tool);
    }
  }
</script>

<style lang="scss" scoped>
  .refine-tools-panel {
    .el-button + .el-button {
      margin-left: unset !important;
    }
  }
</style>
