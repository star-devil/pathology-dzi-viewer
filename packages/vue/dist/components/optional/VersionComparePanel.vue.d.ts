import { VersionColorMap } from '@pathology/dzi-viewer-core';
import { VersionListItem } from '../../types';
import { DefineComponent, ComponentOptionsMixin, PublicProps, ComponentProvideOptions } from 'vue';
type __VLS_Props = {
    versions: VersionListItem[];
    selectedIds: string[];
    versionColorMap?: VersionColorMap;
};
declare const _default: DefineComponent<__VLS_Props, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
    select: (versionId: string) => any;
    exit: () => any;
    "start-compare": () => any;
}, string, PublicProps, Readonly<__VLS_Props> & Readonly<{
    onSelect?: ((versionId: string) => any) | undefined;
    onExit?: (() => any) | undefined;
    "onStart-compare"?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;
//# sourceMappingURL=VersionComparePanel.vue.d.ts.map