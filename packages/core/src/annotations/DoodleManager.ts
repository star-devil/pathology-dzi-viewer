import type OpenSeadragon from "openseadragon";
import { createDoodle } from "@wtsml/doodle";
import type { AnnotationType, DoodleShape } from "../types/viewer";

// ===== 内部类型 =====

type OperationType = "add" | "remove" | "update";

interface BaseCommand {
  type: OperationType;
  shape: DoodleShape;
  timestamp: number;
}

interface AddCommand extends BaseCommand {
  type: "add";
}

interface RemoveCommand extends BaseCommand {
  type: "remove";
}

interface UpdateCommand extends BaseCommand {
  type: "update";
  oldPos: number[];
}

type Command = AddCommand | RemoveCommand | UpdateCommand;

// ===== 回调类型 =====

export type ShapeChangeCallback = (shape: DoodleShape) => void;
export type UndoRedoCallback = (
  type: "undo" | "redo",
  shape?: DoodleShape
) => void;
export type ShapeSelectCallback = (id: string | null) => void;

// ===== DoodleManager =====

/**
 * Doodle 标注管理器类
 * 封装 @wtsml/doodle 插件，提供标注绘制、撤销/重做功能
 */
export class DoodleManager {
  private viewer: OpenSeadragon.Viewer;
  private doodle: ReturnType<typeof createDoodle>;
  private currentTool: AnnotationType | null = null;
  private onShapeChange?: ShapeChangeCallback;
  private onUndoRedoChange?: UndoRedoCallback;
  private onShapeSelect?: ShapeSelectCallback;
  private shapes: Map<string, DoodleShape> = new Map();
  private selectedShapeId: string | null = null;
  private isRefineMode: boolean = false;

  // 撤销/重做栈
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  // 是否触发回调（区分用户操作和程序操作）
  private emitCallback: boolean = true;

  constructor(viewer: OpenSeadragon.Viewer) {
    this.viewer = viewer;
    const doodle = createDoodle({
      viewer,
      onAdd: (shape) => this.handleShapeAdd(shape as DoodleShape),
      onRemove: (shape) => this.handleShapeRemove(shape as DoodleShape),
      onUpdate: (shape) => this.handleShapeUpdate(shape as DoodleShape),
      onSelect: (shape) => this.handleShapeSelect(shape as DoodleShape),
      onCancelSelect: (shape) => this.handleShapeCancelSelect(shape as DoodleShape)
    });
    this.doodle = doodle;
  }

  // ===== 工具控制 =====

  /** 设置当前标注工具 */
  setActiveTool(tool: AnnotationType | null): void {
    if (tool !== "move") {
      this.selectedShapeId = null;
      this.onShapeSelect?.(null);
    }
    this.currentTool = tool;

    if (tool) {
      this.doodle.setMode(tool);
      (this.viewer as any).gestureSettingsMouse.clickToZoom = false;
      this.doodle.setPan(tool === "move");
    } else {
      this.doodle.setPan(true);
      (this.viewer as any).gestureSettingsMouse.clickToZoom = true;
    }
  }

  /** 获取当前工具 */
  getCurrentTool(): AnnotationType | null {
    return this.currentTool;
  }

  // ===== 图形操作（公共API） =====

  /** 添加图形 */
  addShape(shape: DoodleShape, emitCallback: boolean = true): void {
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
  removeShape(id: string, emitCallback: boolean = true): void {
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
  clearShapes(emitCallback: boolean = true): void {
    if (this.undoStack.length === 0) return;

    const previousCallbackState = this.emitCallback;
    this.emitCallback = emitCallback;

    const userCommands = [...this.undoStack];
    userCommands.forEach(command => {
      this.doodle.removeShape(command.shape);
      this.shapes.delete(command.shape.id);
    });

    this.undoStack = [];
    this.redoStack = [];

    if (this.emitCallback) {
      this.onShapeChange?.(undefined as any);
    }

    this.emitCallback = previousCallbackState;
  }

  /** 完全清空所有图形（用于版本对比重新绘制前的清理） */
  clearAllShapes(): void {
    this.doodle.clear();
    this.shapes.clear();
    this.undoStack = [];
    this.redoStack = [];
  }

  /** 获取所有图形 */
  getShapes(): DoodleShape[] {
    return Array.from(this.shapes.values());
  }

  /** 根据 ID 获取图形 */
  getShapeById(id: string): DoodleShape | undefined {
    return this.shapes.get(id);
  }

  /** 更新图形属性 */
  updateShape(shape: DoodleShape, emitCallback: boolean = true): void {
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
  setRefineMode(enabled: boolean): void {
    this.isRefineMode = enabled;
    this.doodle.setReadOnly(!enabled);
  }

  /** 是否处于精修模式 */
  getRefineMode(): boolean {
    return this.isRefineMode;
  }

  // ===== 撤销/重做 =====

  /** 撤销 */
  undo(): { success: boolean; shape?: DoodleShape } {
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
  redo(): { success: boolean; shape?: DoodleShape } {
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
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /** 能否重做 */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** 清空撤销/重做历史 */
  clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /** 获取撤销栈数量 */
  getUndoStackCount(): number {
    return this.undoStack.length;
  }

  // ===== 回调设置 =====

  /** 设置图形变更回调 */
  setShapeChangeCallback(callback: ShapeChangeCallback): void {
    this.onShapeChange = callback;
  }

  /** 设置撤销/重做回调 */
  setUndoRedoCallback(callback: UndoRedoCallback): void {
    this.onUndoRedoChange = callback;
  }

  /** 设置图形选中回调 */
  setShapeSelectCallback(callback: ShapeSelectCallback): void {
    this.onShapeSelect = callback;
  }

  /** 获取当前选中的图形ID */
  getSelectedShapeId(): string | null {
    return this.selectedShapeId;
  }

  // ===== 销毁 =====

  /** 销毁管理器 */
  destroy(): void {
    if (this.doodle) {
      this.doodle.clear();
      this.doodle.setReadOnly(true);
    }

    this.shapes.clear();
    this.undoStack = [];
    this.redoStack = [];
    this.currentTool = null;
    this.selectedShapeId = null;

    this.onShapeChange = undefined;
    this.onUndoRedoChange = undefined;
    this.onShapeSelect = undefined;

    this.doodle = null as any;
    this.viewer = null as any;
  }

  // ===== 内部处理 =====

  private saveToUndoStack(command: Command): void {
    this.undoStack.push(command);
    this.redoStack = [];
  }

  private arrayDiff(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return true;
    return a.some((val, index) => val !== b[index]);
  }

  private handleShapeAdd(shape: DoodleShape): void {
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

  private handleShapeRemove(shape: DoodleShape): void {
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

  private handleShapeUpdate(shape: DoodleShape): void {
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

  private handleShapeSelect(shape: DoodleShape): void {
    if (!this.isRefineMode) return;
    this.selectedShapeId = shape.id;
    this.onShapeSelect?.(shape.id);
  }

  private handleShapeCancelSelect(_shape: DoodleShape): void {
    this.selectedShapeId = null;
    this.onShapeSelect?.(null);
  }
}
