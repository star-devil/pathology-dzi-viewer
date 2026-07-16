import { AnnotationType } from '@pathology/dzi-viewer-core';
import { DefineComponent, ComponentOptionsMixin, PublicProps, ComponentProvideOptions } from 'vue';
type __VLS_Props = {
    currentTool: AnnotationType | null;
    canUndo: boolean;
    canRedo: boolean;
    selectedAnnotationId: string | null;
    submitLoading?: boolean;
    onMessage?: (msg: string, opts?: {
        type?: string;
    }) => void;
};
declare const _default: DefineComponent<__VLS_Props, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
    "tool-change": (tool: AnnotationType | null) => any;
    undo: () => any;
    redo: () => any;
    submit: (data: {
        versionName: string;
        versionRemark: string;
    }) => any;
    exit: () => any;
    "delete-selected": () => any;
    "clear-annotation": () => any;
}, string, PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onTool-change"?: ((tool: AnnotationType | null) => any) | undefined;
    onUndo?: (() => any) | undefined;
    onRedo?: (() => any) | undefined;
    onSubmit?: ((data: {
        versionName: string;
        versionRemark: string;
    }) => any) | undefined;
    onExit?: (() => any) | undefined;
    "onDelete-selected"?: (() => any) | undefined;
    "onClear-annotation"?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {
    submitFormRef: unknown;
}, HTMLDivElement>;
export default _default;
//# sourceMappingURL=RefineToolsPanel.vue.d.ts.map