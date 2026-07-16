declare module "@wtsml/doodle" {
  import type OpenSeadragon from "openseadragon";

  interface DoodleShapeLike {
    id: string;
    type: string;
    pos: number[];
    color: string;
    readonly?: boolean;
  }

  interface DoodleOptions {
    viewer: OpenSeadragon.Viewer;
    onAdd?: (shape: DoodleShapeLike) => void;
    onRemove?: (shape: DoodleShapeLike) => void;
    onUpdate?: (shape: DoodleShapeLike) => void;
    onSelect?: (shape: DoodleShapeLike) => void;
    onCancelSelect?: (shape: DoodleShapeLike) => void;
  }

  interface DoodleInstance {
    setMode: (mode: string) => void;
    setPan: (enabled: boolean) => void;
    setReadOnly: (readOnly: boolean) => void;
    addShape: (shape: DoodleShapeLike) => void;
    removeShape: (shape: DoodleShapeLike) => void;
    updateShape: (shape: DoodleShapeLike) => void;
    clear: () => void;
  }

  function createDoodle(options: DoodleOptions): DoodleInstance;
  export { createDoodle };
}
