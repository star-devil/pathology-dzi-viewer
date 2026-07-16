import { DefineComponent, ComponentOptionsMixin, PublicProps, ComponentProvideOptions } from 'vue';
type __VLS_Props = {
    zoomLevel: number;
    zoomPercentage: number;
};
declare const _default: DefineComponent<__VLS_Props, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
    "zoom-change": (value: number) => any;
}, string, PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onZoom-change"?: ((value: number) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;
//# sourceMappingURL=ZoomControlPanel.vue.d.ts.map