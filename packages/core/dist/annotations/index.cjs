'use strict';

var doodle = require('@wtsml/doodle');

// src/annotations/DoodleManager.ts
var DoodleManager = class {
  constructor(viewer) {
    this.currentTool = null;
    this.shapes = /* @__PURE__ */ new Map();
    this.selectedShapeId = null;
    this.isRefineMode = false;
    // 撤销/重做栈
    this.undoStack = [];
    this.redoStack = [];
    // 是否触发回调（区分用户操作和程序操作）
    this.emitCallback = true;
    this.viewer = viewer;
    const doodle$1 = doodle.createDoodle({
      viewer,
      onAdd: (shape) => this.handleShapeAdd(shape),
      onRemove: (shape) => this.handleShapeRemove(shape),
      onUpdate: (shape) => this.handleShapeUpdate(shape),
      onSelect: (shape) => this.handleShapeSelect(shape),
      onCancelSelect: (shape) => this.handleShapeCancelSelect(shape)
    });
    this.doodle = doodle$1;
  }
  // ===== 工具控制 =====
  /** 设置当前标注工具 */
  setActiveTool(tool) {
    if (tool !== "move") {
      this.selectedShapeId = null;
      this.onShapeSelect?.(null);
    }
    this.currentTool = tool;
    if (tool) {
      this.doodle.setMode(tool);
      this.viewer.gestureSettingsMouse.clickToZoom = false;
      this.doodle.setPan(tool === "move");
    } else {
      this.doodle.setPan(true);
      this.viewer.gestureSettingsMouse.clickToZoom = true;
    }
  }
  /** 获取当前工具 */
  getCurrentTool() {
    return this.currentTool;
  }
  // ===== 图形操作（公共API） =====
  /** 添加图形 */
  addShape(shape, emitCallback = true) {
    const previousCallbackState = this.emitCallback;
    this.emitCallback = emitCallback;
    if (this.emitCallback) {
      this.saveToUndoStack({
        type: "add",
        shape: { ...shape },
        timestamp: Date.now()
      });
    }
    this.doodle.addShape(shape);
    this.shapes.set(shape.id, shape);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
    this.emitCallback = previousCallbackState;
  }
  /** 删除图形 */
  removeShape(id, emitCallback = true) {
    const shape = this.shapes.get(id);
    if (!shape) return;
    const previousCallbackState = this.emitCallback;
    this.emitCallback = emitCallback;
    if (this.emitCallback) {
      this.saveToUndoStack({
        type: "remove",
        shape: { ...shape },
        timestamp: Date.now()
      });
    }
    this.doodle.removeShape(shape);
    this.shapes.delete(id);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
    this.emitCallback = previousCallbackState;
  }
  /** 清空用户手动操作的图形 */
  clearShapes(emitCallback = true) {
    if (this.undoStack.length === 0) return;
    const previousCallbackState = this.emitCallback;
    this.emitCallback = emitCallback;
    const userCommands = [...this.undoStack];
    userCommands.forEach((command) => {
      this.doodle.removeShape(command.shape);
      this.shapes.delete(command.shape.id);
    });
    this.undoStack = [];
    this.redoStack = [];
    if (this.emitCallback) {
      this.onShapeChange?.(void 0);
    }
    this.emitCallback = previousCallbackState;
  }
  /** 完全清空所有图形（用于版本对比重新绘制前的清理） */
  clearAllShapes() {
    this.doodle.clear();
    this.shapes.clear();
    this.undoStack = [];
    this.redoStack = [];
  }
  /** 获取所有图形 */
  getShapes() {
    return Array.from(this.shapes.values());
  }
  /** 根据 ID 获取图形 */
  getShapeById(id) {
    return this.shapes.get(id);
  }
  /** 更新图形属性 */
  updateShape(shape, emitCallback = true) {
    const previousCallbackState = this.emitCallback;
    this.emitCallback = emitCallback;
    this.doodle.updateShape(shape);
    this.shapes.set(shape.id, shape);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
    this.emitCallback = previousCallbackState;
  }
  // ===== 精修模式 =====
  /** 设置精修模式（切换所有标注的可编辑状态） */
  setRefineMode(enabled) {
    this.isRefineMode = enabled;
    this.doodle.setReadOnly(!enabled);
  }
  /** 是否处于精修模式 */
  getRefineMode() {
    return this.isRefineMode;
  }
  // ===== 撤销/重做 =====
  /** 撤销 */
  undo() {
    if (this.undoStack.length === 0) {
      return { success: false };
    }
    const command = this.undoStack.pop();
    if (!command) return { success: false };
    switch (command.type) {
      case "add":
        this.doodle.removeShape(command.shape);
        this.shapes.delete(command.shape.id);
        break;
      case "remove":
        this.doodle.addShape(command.shape);
        this.shapes.set(command.shape.id, command.shape);
        break;
      case "update": {
        const currentShape = this.shapes.get(command.shape.id);
        if (currentShape) {
          command.oldPos = [...currentShape.pos];
          this.doodle.updateShape(command.shape);
          this.shapes.set(command.shape.id, command.shape);
        }
        break;
      }
    }
    this.redoStack.push(command);
    this.onUndoRedoChange?.("undo", command.shape);
    return { success: true, shape: command.shape };
  }
  /** 重做 */
  redo() {
    if (this.redoStack.length === 0) {
      return { success: false };
    }
    const command = this.redoStack.pop();
    if (!command) return { success: false };
    switch (command.type) {
      case "add":
        this.doodle.addShape(command.shape);
        this.shapes.set(command.shape.id, command.shape);
        break;
      case "remove":
        this.doodle.removeShape(command.shape);
        this.shapes.delete(command.shape.id);
        break;
      case "update": {
        const redoCurrentShape = this.shapes.get(command.shape.id);
        if (redoCurrentShape) {
          command.shape.pos = [...redoCurrentShape.pos];
          this.doodle.updateShape(command.shape);
          this.shapes.set(command.shape.id, command.shape);
        }
        break;
      }
    }
    this.undoStack.push(command);
    this.onUndoRedoChange?.("redo", command.shape);
    return { success: true, shape: command.shape };
  }
  /** 能否撤销 */
  canUndo() {
    return this.undoStack.length > 0;
  }
  /** 能否重做 */
  canRedo() {
    return this.redoStack.length > 0;
  }
  /** 清空撤销/重做历史 */
  clearHistory() {
    this.undoStack = [];
    this.redoStack = [];
  }
  /** 获取撤销栈数量 */
  getUndoStackCount() {
    return this.undoStack.length;
  }
  // ===== 回调设置 =====
  /** 设置图形变更回调 */
  setShapeChangeCallback(callback) {
    this.onShapeChange = callback;
  }
  /** 设置撤销/重做回调 */
  setUndoRedoCallback(callback) {
    this.onUndoRedoChange = callback;
  }
  /** 设置图形选中回调 */
  setShapeSelectCallback(callback) {
    this.onShapeSelect = callback;
  }
  /** 获取当前选中的图形ID */
  getSelectedShapeId() {
    return this.selectedShapeId;
  }
  // ===== 销毁 =====
  /** 销毁管理器 */
  destroy() {
    if (this.doodle) {
      this.doodle.clear();
      this.doodle.setReadOnly(true);
    }
    this.shapes.clear();
    this.undoStack = [];
    this.redoStack = [];
    this.currentTool = null;
    this.selectedShapeId = null;
    this.onShapeChange = void 0;
    this.onUndoRedoChange = void 0;
    this.onShapeSelect = void 0;
    this.doodle = null;
    this.viewer = null;
  }
  // ===== 内部处理 =====
  saveToUndoStack(command) {
    this.undoStack.push(command);
    this.redoStack = [];
  }
  arrayDiff(a, b) {
    if (a.length !== b.length) return true;
    return a.some((val, index) => val !== b[index]);
  }
  handleShapeAdd(shape) {
    if (this.emitCallback) {
      this.saveToUndoStack({
        type: "add",
        shape: { ...shape },
        timestamp: Date.now()
      });
    }
    this.doodle.addShape(shape);
    this.shapes.set(shape.id, shape);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
  }
  handleShapeRemove(shape) {
    this.saveToUndoStack({
      type: "remove",
      shape: { ...shape },
      timestamp: Date.now()
    });
    this.doodle.removeShape(shape);
    this.shapes.delete(shape.id);
    if (this.emitCallback) {
      this.onShapeChange?.(shape);
    }
  }
  handleShapeUpdate(shape) {
    if (this.isRefineMode && this.currentTool === "move") {
      const existingShape = this.shapes.get(shape.id);
      if (existingShape) {
        const oldPos = [...existingShape.pos];
        if (this.arrayDiff(oldPos, shape.pos)) {
          this.saveToUndoStack({
            type: "update",
            shape: { ...existingShape, pos: oldPos },
            oldPos,
            timestamp: Date.now()
          });
        }
      }
      this.doodle.updateShape(shape);
      this.shapes.set(shape.id, shape);
    } else {
      this.doodle.updateShape(shape);
      this.shapes.set(shape.id, shape);
      this.onShapeChange?.(shape);
    }
  }
  handleShapeSelect(shape) {
    if (!this.isRefineMode) return;
    this.selectedShapeId = shape.id;
    this.onShapeSelect?.(shape.id);
  }
  handleShapeCancelSelect(_shape) {
    this.selectedShapeId = null;
    this.onShapeSelect?.(null);
  }
};

exports.DoodleManager = DoodleManager;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map