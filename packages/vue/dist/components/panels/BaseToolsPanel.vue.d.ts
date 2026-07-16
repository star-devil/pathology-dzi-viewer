import { DefineComponent, ComponentOptionsMixin, PublicProps, ComponentProvideOptions } from 'vue';
type __VLS_Props = {
    navigatorVisible?: boolean;
};
declare const _default: DefineComponent<__VLS_Props, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
    "zoom-in": () => any;
    "zoom-out": () => any;
    reset: () => any;
    "toggle-fullscreen": () => any;
    "toggle-navigator": () => any;
}, string, PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onZoom-in"?: (() => any) | undefined;
    "onZoom-out"?: (() => any) | undefined;
    onReset?: (() => any) | undefined;
    "onToggle-fullscreen"?: (() => any) | undefined;
    "onToggle-navigator"?: (() => any) | undefined;
}>, {
    navigatorVisible: boolean;
}, {}, {}, {}, string, ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;
//# sourceMappingURL=BaseToolsPanel.vue.d.ts.map