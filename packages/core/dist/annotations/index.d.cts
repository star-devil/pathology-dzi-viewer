import OpenSeadragon from 'openseadragon';
import { e as AnnotationType, D as DoodleShape } from '../viewer-BdmZLkJ6.cjs';

type ShapeChangeCallback = (shape: DoodleShape) => void;
type UndoRedoCallback = (type: "undo" | "redo", shape?: DoodleShape) => void;
type ShapeSelectCallback = (id: string | null) => void;
/**
 * Doodle 标注管理器类
 * 封装 @wtsml/doodle 插件，提供标注绘制、撤销/重做功能
 */
declare class DoodleManager {
    private viewer;
    private doodle;
    private currentTool;
    private onShapeChange?;
    private onUndoRedoChange?;
    private onShapeSelect?;
    private shapes;
    private selectedShapeId;
    private isRefineMode;
    private undoStack;
    private redoStack;
    private emitCallback;
    constructor(viewer: OpenSeadragon.Viewer);
    /** 设置当前标注工具 */
    setActiveTool(tool: AnnotationType | null): void;
    /** 获取当前工具 */
    getCurrentTool(): AnnotationType | null;
    /** 添加图形 */
    addShape(shape: DoodleShape, emitCallback?: boolean): void;
    /** 删除图形 */
    removeShape(id: string, emitCallback?: boolean): void;
    /** 清空用户手动操作的图形 */
    clearShapes(emitCallback?: boolean): void;
    /** 完全清空所有图形（用于版本对比重新绘制前的清理） */
    clearAllShapes(): void;
    /** 获取所有图形 */
    getShapes(): DoodleShape[];
    /** 根据 ID 获取图形 */
    getShapeById(id: string): DoodleShape | undefined;
    /** 更新图形属性 */
    updateShape(shape: DoodleShape, emitCallback?: boolean): void;
    /** 设置精修模式（切换所有标注的可编辑状态） */
    setRefineMode(enabled: boolean): void;
    /** 是否处于精修模式 */
    getRefineMode(): boolean;
    /** 撤销 */
    undo(): {
        success: boolean;
        shape?: DoodleShape;
    };
    /** 重做 */
    redo(): {
        success: boolean;
        shape?: DoodleShape;
    };
    /** 能否撤销 */
    canUndo(): boolean;
    /** 能否重做 */
    canRedo(): boolean;
    /** 清空撤销/重做历史 */
    clearHistory(): void;
    /** 获取撤销栈数量 */
    getUndoStackCount(): number;
    /** 设置图形变更回调 */
    setShapeChangeCallback(callback: ShapeChangeCallback): void;
    /** 设置撤销/重做回调 */
    setUndoRedoCallback(callback: UndoRedoCallback): void;
    /** 设置图形选中回调 */
    setShapeSelectCallback(callback: ShapeSelectCallback): void;
    /** 获取当前选中的图形ID */
    getSelectedShapeId(): string | null;
    /** 销毁管理器 */
    destroy(): void;
    private saveToUndoStack;
    private arrayDiff;
    private handleShapeAdd;
    private handleShapeRemove;
    private handleShapeUpdate;
    private handleShapeSelect;
    private handleShapeCancelSelect;
}

export { DoodleManager, type ShapeChangeCallback, type ShapeSelectCallback, type UndoRedoCallback };
