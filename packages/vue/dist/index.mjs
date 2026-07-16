import { defineComponent as q, ref as x, computed as F, watch as te, onMounted as ke, onBeforeUnmount as ct, resolveDirective as Re, openBlock as $, createElementBlock as T, withDirectives as Ve, createElementVNode as y, toDisplayString as C, createCommentVNode as W, resolveComponent as A, createVNode as t, withCtx as n, createTextVNode as s, Fragment as ye, renderList as be, normalizeStyle as pe, unref as O, reactive as vt, createBlock as ne, resolveDynamicComponent as gt, normalizeClass as ze, renderSlot as le, nextTick as fe } from "vue";
import pt from "openseadragon";
import { TOOL_NAMES as yt, loadImage as bt, extractImageInfo as Ct, DoodleManager as wt, convertPointsToPos as re, getVersionColor as ce, compareAnnotationVersions as $t, ANNOTATION_STATUS_MAP as ht, ANNOTATION_TYPE_MAP as xt, REGION_COLOR_MAP as Ie, DEFAULT_REGION_COLOR as _e, extractFileType as Te, extractFileName as At, calculateAnnotationArea as zt, calculateRegionLevel as Tt, formatArea as St } from "@pathology/dzi-viewer-core";
import { ANNOTATION_STATUS_MAP as Do, ANNOTATION_TOOL_LIST as Oo, ANNOTATION_TYPE_MAP as Eo, AREA_ANNOTATION_TYPES as Mo, COMPARE_VERSION_COLORS as Uo, DEFAULT_REGION_COLOR as jo, LINE_ANNOTATION_TYPES as Bo, REGION_COLOR_MAP as Fo, TOOL_NAMES as Zo, getVersionCompareColor as Ho } from "@pathology/dzi-viewer-core";
import { ZoomIn as kt, ZoomOut as Rt, Refresh as Vt, FullScreen as It, Position as _t, Location as Lt, Minus as Pt, Grid as Nt, CircleCheck as Dt, Aim as Ot, CircleClose as Et, EditPen as Mt, Finished as Ut, RefreshLeft as jt, RefreshRight as Bt, Delete as Ft, Remove as Zt, ArrowLeft as Ht, Connection as Wt, Edit as Yt } from "@element-plus/icons-vue";
const qt = { class: "annotation-viewer-container w-full h-full relative" }, Gt = ["element-loading-text"], Jt = { class: "zoom-indicator absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm" }, Kt = {
  key: 0,
  class: "tool-indicator absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded text-sm"
}, Qt = /* @__PURE__ */ q({
  name: "AnnotationViewer",
  __name: "AnnotationViewer",
  props: {
    imageUrl: {},
    annotationData: {},
    initialZoom: {},
    currentTool: {},
    readOnly: { type: Boolean },
    compareAnnotationsData: {},
    compareVersionColors: {},
    compareLoading: { type: Boolean },
    baseVersionId: {}
  },
  emits: ["annotation-change", "tool-change", "zoom-change", "image-loaded", "undo-change", "redo-change", "annotation-select"],
  setup(l, { expose: r, emit: e }) {
    const o = l, f = e, u = x(null), i = x(!0), b = x(!1), v = x(1), R = F(() => i.value || b.value), M = F(
      () => o.compareLoading ? "正在加载版本对比数据..." : "正在加载图像..."
    );
    let p = null, c = null;
    function w(d) {
      return yt[d] || d;
    }
    function g(d, S, I) {
      return `${d}-${S}${I ? `-${I}` : ""}`;
    }
    async function E() {
      if (!(!u.value || !o.imageUrl)) {
        i.value = !0;
        try {
          p && (p.destroy(), p = null);
          const d = await bt(o.imageUrl);
          p = pt({
            element: u.value,
            tileSources: d,
            showNavigator: !0,
            animationTime: 0.5,
            blendTime: 0.1,
            constrainDuringPan: !0,
            maxZoomPixelRatio: 2,
            minZoomImageRatio: 0.8,
            visibilityRatio: 1,
            zoomPerScroll: 1.2,
            showZoomControl: !1,
            showHomeControl: !1,
            showFullPageControl: !1,
            showRotationControl: !1,
            crossOriginPolicy: "Anonymous",
            ajaxWithCredentials: !1,
            loadTilesWithAjax: !0,
            gestureSettingsMouse: {
              dragToPan: !0,
              clickToZoom: !1,
              dblClickToZoom: !1
            }
          }), p.addHandler("zoom", () => {
            p && (v.value = p.viewport.getZoom(), f("zoom-change", v.value));
          }), p.addHandler("open", () => {
            i.value = !1;
            const S = Ct(p, o.imageUrl);
            f("image-loaded", S), U(), o.annotationData && Array.isArray(o.annotationData) && N();
          }), o.initialZoom && (p.viewport.zoomTo(o.initialZoom), v.value = o.initialZoom);
        } catch {
          i.value = !1;
        }
      }
    }
    function U() {
      p && (c && (c.destroy(), c = null), c = new wt(p), c.setShapeChangeCallback((d) => {
        f("annotation-change", d);
      }), c.setUndoRedoCallback((d, S) => {
        f(d === "undo" ? "undo-change" : "redo-change", S);
      }), c.setShapeSelectCallback((d) => {
        f("annotation-select", d);
      }));
    }
    function N(d) {
      if (!c || !o.annotationData || !Array.isArray(o.annotationData))
        return;
      c.clearShapes(!1);
      const S = d || "#EF4444", I = d || "#10B981";
      o.annotationData.forEach((V, k) => {
        if (V.external && V.external.length > 0) {
          const Z = V.shape || "closed_path", _ = re(V.external, Z), L = {
            id: g("region", k, "external"),
            type: Z,
            pos: _,
            color: S
          };
          c == null || c.addShape(L, !1), c == null || c.setRefineMode(!1);
        }
        V.holes && V.holes.length > 0 && V.holes.forEach((Z, _) => {
          if (Z && Z.length > 0) {
            const L = re(Z), Q = {
              id: g("region", k, `hole-${_}`),
              type: V.shape || "closed_path",
              pos: L,
              color: I
            };
            c == null || c.addShape(Q, !1), c == null || c.setRefineMode(!1);
          }
        });
      });
    }
    function K(d, S, I, V) {
      if (!d.external || d.external.length === 0) return;
      const k = d.shape || "closed_path", Z = re(d.external, k), _ = {
        id: g(V, S, "external"),
        type: k,
        pos: Z,
        color: I,
        readonly: !0
      };
      c == null || c.addShape(_, !1), d.holes && d.holes.length > 0 && d.holes.forEach((L, Q) => {
        if (L && L.length > 0) {
          const ee = re(L, k), H = {
            id: g(V, S, `hole-${Q}`),
            type: k,
            pos: ee,
            color: I,
            readonly: !0
          };
          c == null || c.addShape(H, !1);
        }
      });
    }
    function G(d) {
      if (!c || !o.compareAnnotationsData || Object.keys(o.compareAnnotationsData).length === 0) {
        d == null || d();
        return;
      }
      c.clearAllShapes();
      const S = Object.keys(o.compareAnnotationsData);
      if (S.length === 1) {
        const _ = S[0], L = o.compareAnnotationsData[_], Q = ce(_, o.compareVersionColors || {}, "#6B7280");
        L && Array.isArray(L) && L.forEach((ee, H) => {
          K(ee, H, Q, `compare-${_}`);
        }), d == null || d();
        return;
      }
      const I = o.baseVersionId || S[0], V = o.compareAnnotationsData[I], k = ce(I, o.compareVersionColors || {}, "#6B7280");
      V && Array.isArray(V) && V.forEach((_, L) => {
        K(_, L, k, `base-${I}`);
      });
      const Z = o.compareAnnotationsData;
      S.filter((_) => _ !== I).forEach((_) => {
        const L = Z[_], Q = ce(_, o.compareVersionColors || {}, "#6B7280");
        if (!L || !Array.isArray(L)) return;
        $t(V || [], L).differences.filter((H) => H.type === "added" || H.type === "modified").forEach((H) => {
          H.compareRegion && K(H.compareRegion, H.index, Q, `diff-${_}`);
        });
      }), d == null || d();
    }
    function P(d) {
      p && (p.viewport.zoomTo(d), v.value = d);
    }
    function X() {
      p && (p.viewport.goHome(), v.value = 1);
    }
    function J() {
      if (p) {
        const d = p.viewport.getZoom() * 1.2;
        p.viewport.zoomTo(d), v.value = d;
      }
    }
    function z() {
      if (p) {
        const d = p.viewport.getZoom() / 1.2;
        p.viewport.zoomTo(d), v.value = d;
      }
    }
    function ae() {
      return v.value;
    }
    return te(() => o.imageUrl, () => {
      E();
    }), te(() => o.annotationData, () => {
      p && p.world.getItemAt(0) && c && N();
    }, { deep: !0 }), te(() => o.currentTool, (d) => {
      c && d !== void 0 && c.setActiveTool(d), d !== void 0 && f("tool-change", d);
    }, { immediate: !0 }), te(() => o.readOnly, (d) => {
      !d && p && !c ? U() : d && c && c.clearShapes(!1);
    }), te(() => o.baseVersionId, () => {
    }), ke(() => {
      E();
    }), ct(() => {
      c && (c.destroy(), c = null), p && (p.destroy(), p = null);
    }), r({
      zoomTo: P,
      resetView: X,
      zoomIn: J,
      zoomOut: z,
      getZoomLevel: ae,
      getViewer: () => p,
      getDoodleManager: () => c,
      undo: () => (c == null ? void 0 : c.undo()) ?? { success: !1 },
      redo: () => (c == null ? void 0 : c.redo()) ?? { success: !1 },
      canUndo: () => (c == null ? void 0 : c.canUndo()) ?? !1,
      canRedo: () => (c == null ? void 0 : c.canRedo()) ?? !1,
      setRefineMode: (d) => {
        c == null || c.setRefineMode(d);
      },
      clearAllShapes: () => {
        c == null || c.clearAllShapes();
      },
      drawCompareAnnotations: G,
      redrawAnnotations: N
    }), (d, S) => {
      const I = Re("loading");
      return $(), T("div", qt, [
        Ve(y("div", {
          ref_key: "viewerContainer",
          ref: u,
          "element-loading-text": M.value,
          class: "dzi-viewer w-full h-full relative"
        }, null, 8, Gt), [
          [I, R.value]
        ]),
        y("div", Jt, C((v.value * 100).toFixed(0)) + "% ", 1),
        l.currentTool ? ($(), T("div", Kt, " 当前工具: " + C(w(l.currentTool)), 1)) : W("", !0)
      ]);
    };
  }
}), ue = (l, r) => {
  const e = l.__vccOpts || l;
  for (const [o, f] of r)
    e[o] = f;
  return e;
}, Xt = /* @__PURE__ */ ue(Qt, [["__scopeId", "data-v-bc240da5"]]), en = { class: "image-info-panel border border-gray-200 rounded-lg" }, tn = { class: "header px-3 py-2 border-b border-gray-200 flex items-center justify-between" }, nn = {
  key: 0,
  class: "content px-3 py-2 space-y-2"
}, on = { class: "flex justify-between" }, ln = { class: "flex justify-between" }, an = { class: "flex justify-between" }, sn = { class: "flex justify-between" }, rn = { class: "flex justify-between" }, un = { class: "flex justify-between" }, dn = { class: "flex justify-between" }, mn = { class: "flex justify-between" }, fn = {
  key: 1,
  class: "content px-3 py-2 text-center text-gray-400"
}, cn = /* @__PURE__ */ q({
  name: "ImageInfoPanel",
  __name: "ImageInfoPanel",
  props: {
    data: {}
  },
  setup(l) {
    const r = l, e = F(() => r.data.width * r.data.height), o = F(() => {
      if (r.data.height === 0) return "0:0";
      const f = (i, b) => b === 0 ? i : f(b, i % b), u = f(r.data.width, r.data.height);
      return `${r.data.width / u}:${r.data.height / u}`;
    });
    return (f, u) => {
      const i = A("el-text");
      return $(), T("div", en, [
        y("div", tn, [
          t(i, { class: "font-medium" }, {
            default: n(() => [...u[0] || (u[0] = [
              s("图像信息", -1)
            ])]),
            _: 1
          })
        ]),
        l.data.width > 0 ? ($(), T("div", nn, [
          y("div", on, [
            t(i, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...u[1] || (u[1] = [
                s("尺寸:", -1)
              ])]),
              _: 1
            }),
            t(i, null, {
              default: n(() => [
                s(C(l.data.width) + " × " + C(l.data.height), 1)
              ]),
              _: 1
            })
          ]),
          y("div", ln, [
            t(i, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...u[2] || (u[2] = [
                s("宽高比:", -1)
              ])]),
              _: 1
            }),
            t(i, null, {
              default: n(() => [
                s(C(o.value), 1)
              ]),
              _: 1
            })
          ]),
          y("div", an, [
            t(i, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...u[3] || (u[3] = [
                s("像素总数:", -1)
              ])]),
              _: 1
            }),
            t(i, null, {
              default: n(() => [
                s(C(e.value.toLocaleString()), 1)
              ]),
              _: 1
            })
          ]),
          y("div", sn, [
            t(i, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...u[4] || (u[4] = [
                s("瓦片大小:", -1)
              ])]),
              _: 1
            }),
            t(i, null, {
              default: n(() => [
                s(C(l.data.tileSize) + "px", 1)
              ]),
              _: 1
            })
          ]),
          y("div", rn, [
            t(i, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...u[5] || (u[5] = [
                s("瓦片重叠:", -1)
              ])]),
              _: 1
            }),
            t(i, null, {
              default: n(() => [
                s(C(l.data.tileOverlap) + "px", 1)
              ]),
              _: 1
            })
          ]),
          y("div", un, [
            t(i, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...u[6] || (u[6] = [
                s("缩放级别:", -1)
              ])]),
              _: 1
            }),
            t(i, null, {
              default: n(() => [
                s(C(l.data.minLevel) + " - " + C(l.data.maxLevel), 1)
              ]),
              _: 1
            })
          ]),
          y("div", dn, [
            t(i, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...u[7] || (u[7] = [
                s("格式:", -1)
              ])]),
              _: 1
            }),
            t(i, null, {
              default: n(() => {
                var b;
                return [
                  s(C((b = l.data.format) == null ? void 0 : b.toUpperCase()), 1)
                ];
              }),
              _: 1
            })
          ]),
          y("div", mn, [
            t(i, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...u[8] || (u[8] = [
                s("MIME类型:", -1)
              ])]),
              _: 1
            }),
            t(i, null, {
              default: n(() => [
                s(C(l.data.mimeType), 1)
              ]),
              _: 1
            })
          ])
        ])) : ($(), T("div", fn, [
          t(i, {
            type: "info",
            size: "small"
          }, {
            default: n(() => [...u[9] || (u[9] = [
              s("图像加载中...", -1)
            ])]),
            _: 1
          })
        ]))
      ]);
    };
  }
}), vn = { class: "slice-info-panel border border-gray-200 rounded-lg" }, gn = { class: "header px-3 py-2 border-b border-gray-200 flex items-center justify-between" }, pn = { class: "content px-3 py-2 space-y-2" }, yn = { class: "flex justify-between" }, bn = {
  key: 0,
  class: "flex justify-between"
}, Cn = {
  key: 1,
  class: "flex justify-between"
}, wn = /* @__PURE__ */ q({
  name: "SliceInfoPanel",
  __name: "SliceInfoPanel",
  props: {
    data: {}
  },
  setup(l) {
    return (r, e) => {
      const o = A("el-text");
      return $(), T("div", vn, [
        y("div", gn, [
          t(o, { class: "font-medium" }, {
            default: n(() => [...e[0] || (e[0] = [
              s("切片信息", -1)
            ])]),
            _: 1
          })
        ]),
        y("div", pn, [
          y("div", yn, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[1] || (e[1] = [
                s("切片ID：", -1)
              ])]),
              _: 1
            }),
            t(o, null, {
              default: n(() => [
                s(C(l.data.sliceId), 1)
              ]),
              _: 1
            })
          ]),
          l.data.fileName ? ($(), T("div", bn, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[2] || (e[2] = [
                s("文件名称：", -1)
              ])]),
              _: 1
            }),
            t(o, null, {
              default: n(() => [
                s(C(l.data.fileName), 1)
              ]),
              _: 1
            })
          ])) : W("", !0),
          l.data.fileType ? ($(), T("div", Cn, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[3] || (e[3] = [
                s("文件类型：", -1)
              ])]),
              _: 1
            }),
            t(o, null, {
              default: n(() => [
                s(C(l.data.fileType), 1)
              ]),
              _: 1
            })
          ])) : W("", !0)
        ])
      ]);
    };
  }
}), $n = { class: "annotation-stats-panel border border-gray-200 rounded-lg" }, hn = { class: "header px-3 py-2 border-b border-gray-200 flex items-center justify-between" }, xn = { class: "content px-3 py-2 space-y-2" }, An = { class: "section-title mb-1" }, zn = { class: "flex justify-between" }, Tn = { class: "flex justify-between" }, Sn = { class: "flex justify-between" }, kn = { class: "section-title mb-1" }, Rn = { class: "flex justify-between" }, Vn = { class: "flex justify-between" }, In = { class: "flex justify-between" }, _n = /* @__PURE__ */ q({
  name: "AnnotationStatsPanel",
  __name: "AnnotationStatsPanel",
  props: {
    baseStats: {},
    manualStats: {}
  },
  setup(l) {
    return (r, e) => {
      const o = A("el-text"), f = A("el-divider");
      return $(), T("div", $n, [
        y("div", hn, [
          t(o, { class: "font-medium" }, {
            default: n(() => [...e[0] || (e[0] = [
              s("标注区域统计", -1)
            ])]),
            _: 1
          })
        ]),
        y("div", xn, [
          y("div", An, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[1] || (e[1] = [
                s("当前版本已有标注", -1)
              ])]),
              _: 1
            })
          ]),
          y("div", zn, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[2] || (e[2] = [
                s("总数：", -1)
              ])]),
              _: 1
            }),
            t(o, { type: "primary" }, {
              default: n(() => [
                s(C(l.baseStats.total), 1)
              ]),
              _: 1
            })
          ]),
          y("div", Tn, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[3] || (e[3] = [
                s("线标注：", -1)
              ])]),
              _: 1
            }),
            t(o, null, {
              default: n(() => [
                s(C(l.baseStats.lineCount), 1)
              ]),
              _: 1
            })
          ]),
          y("div", Sn, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[4] || (e[4] = [
                s("面标注：", -1)
              ])]),
              _: 1
            }),
            t(o, null, {
              default: n(() => [
                s(C(l.baseStats.polygonCount), 1)
              ]),
              _: 1
            })
          ]),
          t(f, { class: "my-2!" }),
          y("div", kn, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[5] || (e[5] = [
                s("本次新增人工标注", -1)
              ])]),
              _: 1
            })
          ]),
          y("div", Rn, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[6] || (e[6] = [
                s("总数：", -1)
              ])]),
              _: 1
            }),
            t(o, { type: "primary" }, {
              default: n(() => [
                s(C(l.manualStats.manualLineCount + l.manualStats.manualPolygonCount), 1)
              ]),
              _: 1
            })
          ]),
          y("div", Vn, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[7] || (e[7] = [
                s("线标注：", -1)
              ])]),
              _: 1
            }),
            t(o, { type: "success" }, {
              default: n(() => [
                s("+" + C(l.manualStats.manualLineCount), 1)
              ]),
              _: 1
            })
          ]),
          y("div", In, [
            t(o, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...e[8] || (e[8] = [
                s("面标注：", -1)
              ])]),
              _: 1
            }),
            t(o, { type: "success" }, {
              default: n(() => [
                s("+" + C(l.manualStats.manualPolygonCount), 1)
              ]),
              _: 1
            })
          ])
        ])
      ]);
    };
  }
}), Ln = { class: "annotation-region-panel border border-gray-200 rounded-lg" }, Pn = { class: "header px-3 py-2 border-b border-gray-200 flex items-center justify-between" }, Nn = { class: "content px-3 py-2 space-y-2" }, Dn = { class: "grid grid-cols-3 gap-2" }, On = { class: "flex items-center gap-2" }, En = {
  key: 0,
  class: "text-center py-4"
}, Mn = /* @__PURE__ */ q({
  name: "AnnotationRegionPanel",
  __name: "AnnotationRegionPanel",
  props: {
    regions: {}
  },
  setup(l) {
    return (r, e) => {
      const o = A("el-text"), f = A("el-scrollbar");
      return $(), T("div", Ln, [
        y("div", Pn, [
          t(o, { class: "font-medium" }, {
            default: n(() => [...e[0] || (e[0] = [
              s("标注区域信息", -1)
            ])]),
            _: 1
          })
        ]),
        t(f, { "max-height": "400px" }, {
          default: n(() => [
            y("div", Nn, [
              ($(!0), T(ye, null, be(l.regions, (u, i) => ($(), T("div", {
                key: i,
                class: "region-item"
              }, [
                y("div", Dn, [
                  y("div", On, [
                    y("span", {
                      class: "color-indicator w-3 h-3 rounded-full flex-shrink-0",
                      style: pe({ backgroundColor: u.colorCode })
                    }, null, 4),
                    t(o, {
                      size: "small",
                      class: "whitespace-nowrap"
                    }, {
                      default: n(() => [
                        s(C(u.tissueType), 1)
                      ]),
                      _: 2
                    }, 1024)
                  ]),
                  t(o, {
                    type: "info",
                    size: "small",
                    class: "whitespace-nowrap"
                  }, {
                    default: n(() => [
                      s(C(u.regionLevel), 1)
                    ]),
                    _: 2
                  }, 1024),
                  t(o, {
                    type: "info",
                    size: "small",
                    class: "whitespace-nowrap"
                  }, {
                    default: n(() => [
                      s(C(u.area), 1)
                    ]),
                    _: 2
                  }, 1024)
                ])
              ]))), 128)),
              l.regions.length === 0 ? ($(), T("div", En, [
                t(o, {
                  type: "info",
                  size: "small"
                }, {
                  default: n(() => [...e[1] || (e[1] = [
                    s("暂无标注区域", -1)
                  ])]),
                  _: 1
                })
              ])) : W("", !0)
            ])
          ]),
          _: 1
        })
      ]);
    };
  }
}), Un = { class: "base-tools-panel border border-gray-200 rounded-lg p-3" }, jn = { class: "tools-grid grid grid-cols-2 gap-2" }, Bn = /* @__PURE__ */ q({
  name: "BaseToolsPanel",
  __name: "BaseToolsPanel",
  props: {
    navigatorVisible: { type: Boolean, default: !0 }
  },
  emits: ["zoom-in", "zoom-out", "reset", "toggle-fullscreen", "toggle-navigator"],
  setup(l) {
    return (r, e) => {
      const o = A("el-text"), f = A("el-icon"), u = A("el-button");
      return $(), T("div", Un, [
        t(o, { class: "font-medium mb-2! block" }, {
          default: n(() => [...e[5] || (e[5] = [
            s("基础工具", -1)
          ])]),
          _: 1
        }),
        y("div", jn, [
          t(u, {
            size: "small",
            onClick: e[0] || (e[0] = (i) => r.$emit("zoom-in"))
          }, {
            icon: n(() => [
              t(f, null, {
                default: n(() => [
                  t(O(kt))
                ]),
                _: 1
              })
            ]),
            default: n(() => [
              e[6] || (e[6] = s(" 放大 ", -1))
            ]),
            _: 1
          }),
          t(u, {
            size: "small",
            onClick: e[1] || (e[1] = (i) => r.$emit("zoom-out"))
          }, {
            icon: n(() => [
              t(f, null, {
                default: n(() => [
                  t(O(Rt))
                ]),
                _: 1
              })
            ]),
            default: n(() => [
              e[7] || (e[7] = s(" 缩小 ", -1))
            ]),
            _: 1
          }),
          t(u, {
            size: "small",
            onClick: e[2] || (e[2] = (i) => r.$emit("reset"))
          }, {
            icon: n(() => [
              t(f, null, {
                default: n(() => [
                  t(O(Vt))
                ]),
                _: 1
              })
            ]),
            default: n(() => [
              e[8] || (e[8] = s(" 重置视图 ", -1))
            ]),
            _: 1
          }),
          t(u, {
            size: "small",
            onClick: e[3] || (e[3] = (i) => r.$emit("toggle-fullscreen"))
          }, {
            icon: n(() => [
              t(f, null, {
                default: n(() => [
                  t(O(It))
                ]),
                _: 1
              })
            ]),
            default: n(() => [
              e[9] || (e[9] = s(" 全屏 ", -1))
            ]),
            _: 1
          })
        ]),
        t(u, {
          size: "small",
          class: "w-full mt-2!",
          type: l.navigatorVisible ? "primary" : "default",
          onClick: e[4] || (e[4] = (i) => r.$emit("toggle-navigator"))
        }, {
          icon: n(() => [
            t(f, null, {
              default: n(() => [
                t(O(_t))
              ]),
              _: 1
            })
          ]),
          default: n(() => [
            s(" " + C(l.navigatorVisible ? "隐藏导航器" : "显示导航器"), 1)
          ]),
          _: 1
        }, 8, ["type"])
      ]);
    };
  }
}), Fn = /* @__PURE__ */ ue(Bn, [["__scopeId", "data-v-3b489257"]]), Zn = { class: "zoom-control-panel border border-gray-200 rounded-lg p-3" }, Hn = { class: "flex justify-between mt-2" }, Wn = /* @__PURE__ */ q({
  name: "ZoomControlPanel",
  __name: "ZoomControlPanel",
  props: {
    zoomLevel: {},
    zoomPercentage: {}
  },
  emits: ["zoom-change"],
  setup(l, { emit: r }) {
    const e = r;
    function o(f) {
      e("zoom-change", f);
    }
    return (f, u) => {
      const i = A("el-text"), b = A("el-slider");
      return $(), T("div", Zn, [
        t(i, { class: "font-medium mb-3 block" }, {
          default: n(() => [...u[0] || (u[0] = [
            s("缩放控制", -1)
          ])]),
          _: 1
        }),
        t(b, {
          "model-value": l.zoomPercentage,
          min: 10,
          max: 5e3,
          "format-tooltip": (v) => `${(v / 100).toFixed(2)}x`,
          "onUpdate:modelValue": o
        }, null, 8, ["model-value", "format-tooltip"]),
        y("div", Hn, [
          t(i, {
            type: "info",
            size: "small"
          }, {
            default: n(() => [
              s(C(l.zoomLevel.toFixed(2)) + "x", 1)
            ]),
            _: 1
          }),
          t(i, {
            type: "info",
            size: "small"
          }, {
            default: n(() => [
              s("(" + C(l.zoomPercentage) + "%)", 1)
            ]),
            _: 1
          })
        ])
      ]);
    };
  }
}), Yn = { class: "refine-tools-panel border border-gray-200 rounded-lg p-3" }, qn = { class: "my-2" }, Gn = { class: "grid grid-cols-2 gap-2" }, Jn = { class: "mb-3" }, Kn = { class: "grid grid-cols-2 gap-2" }, Qn = /* @__PURE__ */ q({
  name: "RefineToolsPanel",
  __name: "RefineToolsPanel",
  props: {
    currentTool: {},
    canUndo: { type: Boolean },
    canRedo: { type: Boolean },
    selectedAnnotationId: {},
    submitLoading: { type: Boolean },
    onMessage: { type: Function }
  },
  emits: ["tool-change", "submit", "exit", "undo", "redo", "delete-selected", "clear-annotation"],
  setup(l, { emit: r }) {
    const e = l, o = r, f = [
      { type: "move", label: "移动", icon: Lt },
      { type: "line", label: "直线", icon: Pt },
      { type: "rect", label: "矩形", icon: Nt },
      { type: "circle", label: "圆", icon: Dt },
      { type: "ellipse", label: "椭圆", icon: Ot },
      { type: "polygon", label: "多边形", icon: Et },
      { type: "path", label: "路径", icon: Mt },
      { type: "closed_path", label: "闭合路径", icon: Ut }
    ], u = F(() => e.currentTool), i = x(!1), b = x(), v = vt({ versionName: "", versionRemark: "" }), R = {
      versionName: [
        { required: !0, message: "请输入版本名称", trigger: "blur" },
        { max: 20, message: "版本名称不能超过20个字符", trigger: "blur" }
      ]
    };
    function M() {
      v.versionName = "", v.versionRemark = "", i.value = !0;
    }
    async function p() {
      b.value && await b.value.validate((w) => {
        var g;
        w ? (o("submit", {
          versionName: v.versionName,
          versionRemark: v.versionRemark
        }), i.value = !1) : (g = e.onMessage) == null || g.call(e, "请完善表单信息", { type: "warning" });
      });
    }
    function c(w) {
      e.currentTool === w ? o("tool-change", null) : o("tool-change", w);
    }
    return (w, g) => {
      const E = A("el-text"), U = A("el-icon"), N = A("el-button"), K = A("el-tooltip"), G = A("el-form-item"), P = A("el-input"), X = A("el-form"), J = A("el-dialog");
      return $(), T("div", Yn, [
        t(E, { class: "font-medium" }, {
          default: n(() => [...g[9] || (g[9] = [
            s("精修工具", -1)
          ])]),
          _: 1
        }),
        y("div", qn, [
          t(E, {
            type: "info",
            size: "small",
            class: "mb-1! block"
          }, {
            default: n(() => [...g[10] || (g[10] = [
              s("标注工具", -1)
            ])]),
            _: 1
          }),
          y("div", Gn, [
            ($(), T(ye, null, be(f, (z) => t(N, {
              key: z.type,
              size: "small",
              type: u.value === z.type ? "primary" : "",
              onClick: (ae) => c(z.type)
            }, {
              icon: n(() => [
                t(U, null, {
                  default: n(() => [
                    ($(), ne(gt(z.icon)))
                  ]),
                  _: 2
                }, 1024)
              ]),
              default: n(() => [
                s(" " + C(z.label), 1)
              ]),
              _: 2
            }, 1032, ["type", "onClick"])), 64))
          ])
        ]),
        y("div", Jn, [
          t(E, {
            type: "info",
            size: "small",
            class: "mb-1! block"
          }, {
            default: n(() => [...g[11] || (g[11] = [
              s("辅助工具", -1)
            ])]),
            _: 1
          }),
          y("div", Kn, [
            t(N, {
              size: "small",
              disabled: !l.canUndo,
              onClick: g[0] || (g[0] = (z) => w.$emit("undo"))
            }, {
              icon: n(() => [
                t(U, null, {
                  default: n(() => [
                    t(O(jt))
                  ]),
                  _: 1
                })
              ]),
              default: n(() => [
                g[12] || (g[12] = s(" 撤销 ", -1))
              ]),
              _: 1
            }, 8, ["disabled"]),
            t(N, {
              size: "small",
              disabled: !l.canRedo,
              onClick: g[1] || (g[1] = (z) => w.$emit("redo"))
            }, {
              icon: n(() => [
                t(U, null, {
                  default: n(() => [
                    t(O(Bt))
                  ]),
                  _: 1
                })
              ]),
              default: n(() => [
                g[13] || (g[13] = s(" 重做 ", -1))
              ]),
              _: 1
            }, 8, ["disabled"]),
            t(K, { content: "请使用移动工具选择元素" }, {
              default: n(() => [
                t(N, {
                  size: "small",
                  disabled: !l.selectedAnnotationId,
                  onClick: g[2] || (g[2] = (z) => w.$emit("delete-selected"))
                }, {
                  icon: n(() => [
                    t(U, null, {
                      default: n(() => [
                        t(O(Ft))
                      ]),
                      _: 1
                    })
                  ]),
                  default: n(() => [
                    g[14] || (g[14] = s(" 删除选中 ", -1))
                  ]),
                  _: 1
                }, 8, ["disabled"])
              ]),
              _: 1
            }),
            t(N, {
              size: "small",
              onClick: g[3] || (g[3] = (z) => w.$emit("clear-annotation"))
            }, {
              icon: n(() => [
                t(U, null, {
                  default: n(() => [
                    t(O(Zt))
                  ]),
                  _: 1
                })
              ]),
              default: n(() => [
                g[15] || (g[15] = s(" 清除全部精修 ", -1))
              ]),
              _: 1
            })
          ])
        ]),
        t(N, {
          type: "primary",
          class: "w-full mb-1!",
          onClick: M
        }, {
          default: n(() => [...g[16] || (g[16] = [
            s(" 提交精修 ", -1)
          ])]),
          _: 1
        }),
        t(N, {
          class: "w-full",
          onClick: g[4] || (g[4] = (z) => w.$emit("exit"))
        }, {
          default: n(() => [...g[17] || (g[17] = [
            s("退出精修", -1)
          ])]),
          _: 1
        }),
        t(J, {
          modelValue: i.value,
          "onUpdate:modelValue": g[8] || (g[8] = (z) => i.value = z),
          title: "提交精修",
          width: "480px",
          "close-on-click-modal": !1,
          "destroy-on-close": ""
        }, {
          footer: n(() => [
            t(N, {
              class: "mr-2!",
              onClick: g[7] || (g[7] = (z) => i.value = !1)
            }, {
              default: n(() => [...g[19] || (g[19] = [
                s("取消", -1)
              ])]),
              _: 1
            }),
            t(N, {
              type: "primary",
              loading: l.submitLoading,
              onClick: p
            }, {
              default: n(() => [...g[20] || (g[20] = [
                s(" 确认提交 ", -1)
              ])]),
              _: 1
            }, 8, ["loading"])
          ]),
          default: n(() => [
            t(X, {
              ref_key: "submitFormRef",
              ref: b,
              model: v,
              rules: R,
              "label-width": "100px"
            }, {
              default: n(() => [
                t(G, { label: "版本号" }, {
                  default: n(() => [
                    t(E, { type: "info" }, {
                      default: n(() => [...g[18] || (g[18] = [
                        s("提交后由系统自动生成", -1)
                      ])]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                t(G, {
                  label: "版本名称",
                  prop: "versionName"
                }, {
                  default: n(() => [
                    t(P, {
                      modelValue: v.versionName,
                      "onUpdate:modelValue": g[5] || (g[5] = (z) => v.versionName = z),
                      maxlength: "20",
                      "show-word-limit": "",
                      placeholder: "请输入版本名称"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                t(G, {
                  label: "版本备注",
                  prop: "versionRemark"
                }, {
                  default: n(() => [
                    t(P, {
                      modelValue: v.versionRemark,
                      "onUpdate:modelValue": g[6] || (g[6] = (z) => v.versionRemark = z),
                      type: "textarea",
                      maxlength: "100",
                      "show-word-limit": "",
                      rows: 3,
                      placeholder: "请输入版本备注（选填）"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["model"])
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
}), Xn = /* @__PURE__ */ ue(Qn, [["__scopeId", "data-v-48e2412c"]]), eo = { class: "version-info-panel border border-gray-200 rounded-lg" }, to = { class: "header px-3 py-2 border-b border-gray-200 flex items-center justify-between" }, no = { class: "content px-3 py-2 space-y-2" }, oo = { class: "flex justify-between" }, lo = { class: "flex justify-between" }, ao = { class: "flex justify-between" }, io = { class: "flex justify-between" }, so = {
  key: 0,
  class: "flex justify-between"
}, ro = { class: "flex justify-between" }, uo = { class: "flex justify-between" }, mo = /* @__PURE__ */ q({
  name: "VersionInfoPanel",
  __name: "VersionInfoPanel",
  props: {
    data: {}
  },
  setup(l) {
    const r = ht;
    return (e, o) => {
      var i;
      const f = A("el-text"), u = A("el-tag");
      return $(), T("div", eo, [
        y("div", to, [
          t(f, { class: "font-medium" }, {
            default: n(() => [...o[0] || (o[0] = [
              s("版本信息", -1)
            ])]),
            _: 1
          })
        ]),
        y("div", no, [
          y("div", oo, [
            t(f, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...o[1] || (o[1] = [
                s("版本号：", -1)
              ])]),
              _: 1
            }),
            t(f, null, {
              default: n(() => [
                s(C(l.data.versionNumber), 1)
              ]),
              _: 1
            })
          ]),
          y("div", lo, [
            t(f, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...o[2] || (o[2] = [
                s("版本类型：", -1)
              ])]),
              _: 1
            }),
            t(f, null, {
              default: n(() => [
                s(C(l.data.versionType), 1)
              ]),
              _: 1
            })
          ]),
          y("div", ao, [
            t(f, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...o[3] || (o[3] = [
                s("创建时间：", -1)
              ])]),
              _: 1
            }),
            t(f, null, {
              default: n(() => [
                s(C(l.data.createdTime), 1)
              ]),
              _: 1
            })
          ]),
          y("div", io, [
            t(f, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...o[4] || (o[4] = [
                s("标注状态：", -1)
              ])]),
              _: 1
            }),
            t(u, {
              type: ((i = O(r)[l.data.status]) == null ? void 0 : i.type) || "info",
              round: "",
              size: "small",
              effect: "dark"
            }, {
              default: n(() => {
                var b;
                return [
                  s(C(((b = O(r)[l.data.status]) == null ? void 0 : b.label) || l.data.status), 1)
                ];
              }),
              _: 1
            }, 8, ["type"])
          ]),
          l.data.status === "FAILED" ? ($(), T("div", so, [
            t(f, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...o[5] || (o[5] = [
                s("错误信息：", -1)
              ])]),
              _: 1
            }),
            t(f, null, {
              default: n(() => [
                s(C(l.data.errorMessage), 1)
              ]),
              _: 1
            })
          ])) : W("", !0),
          y("div", ro, [
            t(f, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...o[6] || (o[6] = [
                s("标注人：", -1)
              ])]),
              _: 1
            }),
            t(f, null, {
              default: n(() => [
                s(C(l.data.creator), 1)
              ]),
              _: 1
            })
          ]),
          y("div", uo, [
            t(f, {
              type: "info",
              size: "small"
            }, {
              default: n(() => [...o[7] || (o[7] = [
                s("标注完成时间：", -1)
              ])]),
              _: 1
            }),
            t(f, null, {
              default: n(() => [
                s(C(l.data.annotatedTime), 1)
              ]),
              _: 1
            })
          ])
        ])
      ]);
    };
  }
}), fo = { class: "version-compare-panel border border-gray-200 rounded-lg p-3" }, co = { class: "version-list space-y-2" }, vo = ["onClick"], go = { class: "flex items-center" }, po = /* @__PURE__ */ q({
  name: "VersionComparePanel",
  __name: "VersionComparePanel",
  props: {
    versions: {},
    selectedIds: {},
    versionColorMap: {}
  },
  emits: ["select", "start-compare", "exit"],
  setup(l) {
    const r = l, e = xt;
    function o(u) {
      var i, b;
      return ((b = (i = r.versionColorMap) == null ? void 0 : i[u]) == null ? void 0 : b.color) || "";
    }
    function f(u) {
      var i;
      if ((i = r.versionColorMap) != null && i[u]) {
        const b = r.versionColorMap[u].color;
        return { borderColor: b, backgroundColor: `${b}15` };
      }
      return {};
    }
    return (u, i) => {
      const b = A("el-text"), v = A("el-tag"), R = A("el-scrollbar"), M = A("el-button");
      return $(), T("div", fo, [
        t(b, { class: "font-medium mb-2! block" }, {
          default: n(() => [...i[2] || (i[2] = [
            s("切片版本列表", -1)
          ])]),
          _: 1
        }),
        t(b, {
          type: "info",
          size: "small",
          class: "mb-1! block"
        }, {
          default: n(() => [...i[3] || (i[3] = [
            s(" 最多选择 5 个版本进行对比 ", -1)
          ])]),
          _: 1
        }),
        t(R, { "max-height": "300px" }, {
          default: n(() => [
            y("div", co, [
              ($(!0), T(ye, null, be(l.versions, (p) => {
                var c;
                return $(), T("div", {
                  key: p.id,
                  class: ze(["version-item border rounded p-2 cursor-pointer transition-all", { "version-selected": l.selectedIds.includes(p.id) }]),
                  style: pe(f(p.id)),
                  onClick: (w) => u.$emit("select", p.id)
                }, [
                  l.selectedIds.includes(p.id) ? ($(), T("div", {
                    key: 0,
                    class: "version-color-bar",
                    style: pe({ backgroundColor: o(p.id) })
                  }, null, 4)) : W("", !0),
                  y("div", {
                    class: ze(["version-content", { "has-color": l.selectedIds.includes(p.id) }])
                  }, [
                    y("div", go, [
                      t(v, {
                        type: ((c = O(e)[p.annotation_type]) == null ? void 0 : c.type) || "info",
                        size: "small",
                        class: "mr-2"
                      }, {
                        default: n(() => {
                          var w;
                          return [
                            s(C((w = O(e)[p.annotation_type]) == null ? void 0 : w.label), 1)
                          ];
                        }),
                        _: 2
                      }, 1032, ["type"]),
                      t(b, null, {
                        default: n(() => [
                          s("v" + C(p.version_number), 1)
                        ]),
                        _: 2
                      }, 1024)
                    ]),
                    y("div", null, [
                      t(b, {
                        type: "info",
                        size: "small"
                      }, {
                        default: n(() => [
                          s(" 由 " + C(p.annotated_by_name || "-") + " 标注完成于 " + C(p.annotated_at), 1)
                        ]),
                        _: 2
                      }, 1024)
                    ])
                  ], 2)
                ], 14, vo);
              }), 128))
            ])
          ]),
          _: 1
        }),
        t(M, {
          type: "primary",
          class: "w-full mt-3!",
          disabled: l.selectedIds.length === 0,
          onClick: i[0] || (i[0] = (p) => u.$emit("start-compare"))
        }, {
          default: n(() => [...i[4] || (i[4] = [
            s(" 开始对比 ", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        t(M, {
          class: "w-full mt-2!",
          onClick: i[1] || (i[1] = (p) => u.$emit("exit"))
        }, {
          default: n(() => [...i[5] || (i[5] = [
            s("取消对比", -1)
          ])]),
          _: 1
        })
      ]);
    };
  }
}), yo = /* @__PURE__ */ ue(po, [["__scopeId", "data-v-1a90c7f4"]]), bo = { class: "content flex" }, Co = { class: "left-panel w-[341px] bg-white p-2 flex flex-col gap-3" }, wo = { class: "center-panel flex-1 flex flex-col p-2" }, $o = { class: "viewer-container flex-1 bg-white rounded-lg overflow-hidden" }, ho = { class: "right-panel w-[341px] bg-white p-2 flex flex-col gap-3" }, xo = {
  key: 0,
  class: "version-compare-btn"
}, Ao = {
  key: 1,
  class: "enter-refine-btn"
}, Io = /* @__PURE__ */ q({
  name: "AnnotationDetailLayout",
  __name: "AnnotationDetailLayout",
  props: {
    visible: { type: Boolean },
    windowTitle: {},
    isViewMode: { type: Boolean },
    isCompareMode: { type: Boolean },
    isRefineMode: { type: Boolean },
    annotationLoading: { type: Boolean },
    submitLoading: { type: Boolean },
    compareLoading: { type: Boolean },
    currentAnnotation: {},
    annotationVersionsList: {},
    selectedVersionId: {},
    compareVersionsData: {},
    versionColorMap: {},
    currentTool: {},
    fileUrl: {},
    versionInfo: {},
    imageInfo: {},
    sliceInfo: {},
    baseAnnotationStatistics: {},
    manualAnnotationStatistics: {},
    annotationRegions: {},
    selectedAnnotationId: {},
    zoomLevel: {},
    zoomPercentage: {},
    canUndo: { type: Boolean },
    canRedo: { type: Boolean },
    navigatorVisible: { type: Boolean },
    baseVersionId: {},
    dziViewerRef: {}
  },
  emits: ["update:visible", "close", "annotation-change", "zoom-change", "zoom-change-slider", "image-loaded", "annotation-select", "undo-change", "redo-change", "tool-change", "undo", "redo", "delete-selected", "clear-annotation", "zoom-in", "zoom-out", "reset-view", "toggle-fullscreen", "toggle-navigator", "submit-refine", "exit-refine", "exit-compare", "version-select", "start-compare", "switch-to-compare", "enter-refine"],
  setup(l) {
    return (r, e) => {
      const o = A("el-scrollbar"), f = A("el-icon"), u = A("el-button"), i = A("el-dialog"), b = Re("loading");
      return $(), ne(i, {
        "model-value": l.visible,
        title: l.windowTitle,
        fullscreen: !0,
        "show-close": !0,
        bodyClass: "annotation-detail-body",
        headerClass: "annotation-detail-header",
        "onUpdate:modelValue": e[25] || (e[25] = (v) => r.$emit("update:visible", v))
      }, {
        default: n(() => [
          y("div", bo, [
            t(o, { height: "calc(100vh - 25px - 32px)" }, {
              default: n(() => [
                Ve(($(), T("div", Co, [
                  t(wn, { data: l.sliceInfo }, null, 8, ["data"]),
                  le(r.$slots, "version-info", {}, () => [
                    l.versionInfo ? ($(), ne(mo, {
                      key: 0,
                      data: l.versionInfo
                    }, null, 8, ["data"])) : W("", !0)
                  ]),
                  t(cn, { data: l.imageInfo }, null, 8, ["data"]),
                  l.isViewMode || l.isRefineMode ? ($(), ne(_n, {
                    key: 0,
                    "base-stats": l.baseAnnotationStatistics,
                    "manual-stats": l.manualAnnotationStatistics
                  }, null, 8, ["base-stats", "manual-stats"])) : W("", !0),
                  t(Mn, { regions: l.annotationRegions }, null, 8, ["regions"])
                ])), [
                  [b, l.annotationLoading]
                ])
              ]),
              _: 3
            }),
            y("div", wo, [
              y("div", $o, [
                le(r.$slots, "viewer", {}, () => {
                  var v;
                  return [
                    t(Xt, {
                      ref: "dziViewerRef",
                      "image-url": l.fileUrl,
                      "annotation-data": (v = l.currentAnnotation) == null ? void 0 : v.annotation_data,
                      "initial-zoom": l.zoomLevel,
                      "current-tool": l.currentTool,
                      "read-only": !l.isRefineMode,
                      "compare-annotations-data": l.isCompareMode ? l.compareVersionsData : void 0,
                      "compare-version-colors": l.isCompareMode ? l.versionColorMap : void 0,
                      "compare-loading": l.compareLoading,
                      "base-version-id": l.isCompareMode ? l.baseVersionId : void 0,
                      onAnnotationChange: e[0] || (e[0] = (R) => r.$emit("annotation-change", R)),
                      onZoomChange: e[1] || (e[1] = (R) => r.$emit("zoom-change", R)),
                      onImageLoaded: e[2] || (e[2] = (R) => r.$emit("image-loaded", R)),
                      onAnnotationSelect: e[3] || (e[3] = (R) => r.$emit("annotation-select", R)),
                      onUndoChange: e[4] || (e[4] = (R) => r.$emit("undo-change", R)),
                      onRedoChange: e[5] || (e[5] = (R) => r.$emit("redo-change", R))
                    }, null, 8, ["image-url", "annotation-data", "initial-zoom", "current-tool", "read-only", "compare-annotations-data", "compare-version-colors", "compare-loading", "base-version-id"])
                  ];
                })
              ])
            ]),
            t(o, { height: "calc(100vh - 25px - 32px)" }, {
              default: n(() => [
                y("div", ho, [
                  le(r.$slots, "close-button", {}, () => [
                    t(u, {
                      class: "w-full",
                      onClick: e[6] || (e[6] = (v) => r.$emit("close"))
                    }, {
                      icon: n(() => [
                        t(f, null, {
                          default: n(() => [
                            t(O(Ht))
                          ]),
                          _: 1
                        })
                      ]),
                      default: n(() => [
                        e[26] || (e[26] = s(" 返回 ", -1))
                      ]),
                      _: 1
                    })
                  ]),
                  t(Fn, {
                    "navigator-visible": l.navigatorVisible,
                    onZoomIn: e[7] || (e[7] = (v) => r.$emit("zoom-in")),
                    onZoomOut: e[8] || (e[8] = (v) => r.$emit("zoom-out")),
                    onReset: e[9] || (e[9] = (v) => r.$emit("reset-view")),
                    onToggleFullscreen: e[10] || (e[10] = (v) => r.$emit("toggle-fullscreen")),
                    onToggleNavigator: e[11] || (e[11] = (v) => r.$emit("toggle-navigator"))
                  }, null, 8, ["navigator-visible"]),
                  t(Wn, {
                    "zoom-level": l.zoomLevel,
                    "zoom-percentage": l.zoomPercentage,
                    onZoomChange: e[12] || (e[12] = (v) => r.$emit("zoom-change-slider", v))
                  }, null, 8, ["zoom-level", "zoom-percentage"]),
                  l.isRefineMode ? ($(), ne(Xn, {
                    key: 0,
                    "current-tool": l.currentTool,
                    "can-undo": l.canUndo,
                    "can-redo": l.canRedo,
                    "selected-annotation-id": l.selectedAnnotationId,
                    "submit-loading": l.submitLoading,
                    onToolChange: e[13] || (e[13] = (v) => r.$emit("tool-change", v)),
                    onSubmit: e[14] || (e[14] = (v) => r.$emit("submit-refine", v)),
                    onExit: e[15] || (e[15] = (v) => r.$emit("exit-refine")),
                    onUndo: e[16] || (e[16] = (v) => r.$emit("undo")),
                    onRedo: e[17] || (e[17] = (v) => r.$emit("redo")),
                    onDeleteSelected: e[18] || (e[18] = (v) => r.$emit("delete-selected")),
                    onClearAnnotation: e[19] || (e[19] = (v) => r.$emit("clear-annotation"))
                  }, null, 8, ["current-tool", "can-undo", "can-redo", "selected-annotation-id", "submit-loading"])) : W("", !0),
                  le(r.$slots, "version-compare", {}, () => [
                    l.isCompareMode ? ($(), ne(yo, {
                      key: 0,
                      versions: l.annotationVersionsList,
                      "selected-ids": l.selectedVersionId,
                      "version-color-map": l.versionColorMap,
                      onExit: e[20] || (e[20] = (v) => r.$emit("exit-compare")),
                      onSelect: e[21] || (e[21] = (v) => r.$emit("version-select", v)),
                      onStartCompare: e[22] || (e[22] = (v) => r.$emit("start-compare"))
                    }, null, 8, ["versions", "selected-ids", "version-color-map"])) : W("", !0)
                  ]),
                  le(r.$slots, "action-buttons", {}, () => [
                    l.isViewMode ? ($(), T("div", xo, [
                      t(u, {
                        class: "w-full",
                        onClick: e[23] || (e[23] = (v) => r.$emit("switch-to-compare"))
                      }, {
                        icon: n(() => [
                          t(f, null, {
                            default: n(() => [
                              t(O(Wt))
                            ]),
                            _: 1
                          })
                        ]),
                        default: n(() => [
                          e[27] || (e[27] = s(" 版本对比 ", -1))
                        ]),
                        _: 1
                      })
                    ])) : W("", !0),
                    l.isViewMode ? ($(), T("div", Ao, [
                      t(u, {
                        type: "primary",
                        class: "w-full",
                        onClick: e[24] || (e[24] = (v) => r.$emit("enter-refine"))
                      }, {
                        icon: n(() => [
                          t(f, null, {
                            default: n(() => [
                              t(O(Yt))
                            ]),
                            _: 1
                          })
                        ]),
                        default: n(() => [
                          e[28] || (e[28] = s(" 进入人工精修 ", -1))
                        ]),
                        _: 1
                      })
                    ])) : W("", !0)
                  ])
                ])
              ]),
              _: 3
            })
          ])
        ]),
        _: 3
      }, 8, ["model-value", "title"]);
    };
  }
}), ve = ["line", "path"], ge = [
  "polygon",
  "rect",
  "closed_path",
  "circle",
  "ellipse"
];
function zo(l) {
  var r;
  return ((r = Ie[l]) == null ? void 0 : r.color) || _e.color;
}
function To(l) {
  var r;
  return ((r = Ie[l]) == null ? void 0 : r.bgColor) || _e.bgColor;
}
function _o(l) {
  return !l || !Array.isArray(l) ? [] : l.map((r, e) => {
    const o = r.shape || "closed_path";
    let f;
    if (o === "circle") {
      const i = r.external[0];
      f = [i.x, i.y, i.r];
    } else if (o === "ellipse") {
      const i = r.external[0];
      f = [i.x, i.y, i.rx, i.ry];
    } else if (o === "rect") {
      const i = r.external[0];
      f = [i.x, i.y, i.width, i.height];
    } else
      f = r.external.flatMap((i) => [i.x, i.y]);
    const u = r.holes.map(
      (i) => i.flatMap((b) => [b.x, b.y])
    );
    return {
      id: `region-${e}`,
      type: o,
      points: f,
      holes: u,
      label: `组织区域-${e}`,
      confidence: 1,
      style: {
        color: zo("正常组织"),
        strokeWidth: 2,
        fill: !0,
        fillColor: To("正常组织")
      }
    };
  });
}
function Se(l) {
  return l.map((r) => {
    const e = r.pos;
    let o;
    switch (r.type) {
      case "line":
        o = [
          { x: e[0], y: e[1] },
          { x: e[2], y: e[3] }
        ];
        break;
      case "rect": {
        const [f, u, i, b] = e;
        o = [{ x: f, y: u, width: i, height: b }];
        break;
      }
      case "polygon":
      case "closed_path":
      case "path": {
        const f = [];
        for (let u = 0; u < e.length; u += 2)
          f.push({ x: e[u], y: e[u + 1] });
        o = f;
        break;
      }
      case "circle": {
        const [f, u, i] = e;
        o = [{ x: f, y: u, r: i }];
        break;
      }
      case "ellipse": {
        const [f, u, i, b] = e;
        o = [{ x: f, y: u, rx: i, ry: b }];
        break;
      }
      default: {
        const f = [];
        for (let u = 0; u < e.length; u += 2)
          f.push({ x: e[u], y: e[u + 1] });
        o = f;
        break;
      }
    }
    return {
      external: o,
      holes: [],
      shape: r.type
    };
  });
}
function Lo(l) {
  const { imageId: r, annotationTaskId: e, dataProvider: o, onMessage: f } = l, u = x(!0), i = x(l.mode || "view"), b = x(!1), v = x(!1), R = x(!1), M = x(!1), p = x(null), c = x([]), w = x([]), g = x(null), E = x(""), U = x({
    width: 0,
    height: 0,
    tileSize: 0,
    tileOverlap: 0,
    minLevel: 0,
    maxLevel: 0,
    format: "",
    mimeType: ""
  }), N = x({ sliceId: "" }), K = x(), G = x({
    total: 0,
    lineCount: 0,
    polygonCount: 0
  }), P = x({
    manualLineCount: 0,
    manualPolygonCount: 0
  }), X = x([]), J = x(null), z = x(1), ae = F(() => Math.round(z.value * 100)), d = x(null), S = x(0), I = x(!0), V = x({}), k = x({}), Z = F(
    () => w.value.length > 0 ? w.value[0] : ""
  ), _ = F(() => i.value === "view"), L = F(() => i.value === "compare"), Q = F(() => i.value === "refine"), ee = F(() => {
    switch (i.value) {
      case "view":
        return "切片标注预览";
      case "compare":
        return "版本对比";
      case "refine":
        return "人工精修";
      default:
        return "切片标注预览";
    }
  }), H = F(() => {
    var a;
    return S.value, ((a = d.value) == null ? void 0 : a.canUndo()) ?? !1;
  }), Le = F(() => {
    var a;
    return S.value, ((a = d.value) == null ? void 0 : a.canRedo()) ?? !1;
  });
  function j(a, m = "info", h) {
    f == null || f(a, { type: m, grouping: h });
  }
  function Ce() {
    var a, m;
    (m = (a = d.value) == null ? void 0 : a.getDoodleManager()) == null || m.clearHistory();
  }
  function Pe(a) {
    if (!a || !Array.isArray(a)) {
      G.value = { total: 0, lineCount: 0, polygonCount: 0 };
      return;
    }
    G.value = {
      total: a.length,
      lineCount: 0,
      polygonCount: a.length
    };
  }
  function Ne(a) {
    if (!a || !Array.isArray(a)) {
      X.value = [];
      return;
    }
    X.value = a.map((m, h) => {
      const D = m.shape || "closed_path", B = zt(m.external, D);
      return {
        area: St(B),
        tissueType: `组织区域-${h + 1}`,
        regionLevel: Tt(B),
        colorCode: "#22C55E",
        confidence: 0,
        type: "polygon"
      };
    });
  }
  const { compareVersionColors: we, getVersionCompareColor: $e } = {
    compareVersionColors: [
      { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.3)", name: "红色" },
      { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.3)", name: "蓝色" },
      { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.3)", name: "绿色" },
      { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.3)", name: "橙色" },
      { color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.3)", name: "紫色" }
    ],
    getVersionCompareColor: (a) => {
      const m = [
        { color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.3)", name: "红色" },
        { color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.3)", name: "蓝色" },
        { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.3)", name: "绿色" },
        { color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.3)", name: "橙色" },
        { color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.3)", name: "紫色" }
      ];
      return m[a % m.length];
    }
  };
  async function de() {
    if (!r) return;
    const a = l.initialVersionId || "";
    b.value = !0;
    try {
      if (!(o != null && o.getAnnotation)) {
        j("未配置数据提供器", "warning");
        return;
      }
      const m = await o.getAnnotation(r, a);
      if (m) {
        p.value = m, K.value = {
          versionNumber: `v${m.version_number}`,
          versionType: m.annotation_type === "AI" ? "智能标注" : "人工精修",
          createdTime: m.created_at,
          status: m.status,
          errorMessage: m.error_message,
          creator: m.annotated_by_name || "--",
          annotatedTime: m.annotated_at || ""
        }, E.value = m.FileUrl;
        const h = Te(m.FileUrl);
        U.value = {
          ...U.value,
          format: h,
          mimeType: `image/${h.toLowerCase()}`
        }, N.value = {
          sliceId: m.image_id,
          fileName: At(m.FileUrl),
          fileType: Te(m.FileUrl)
        }, Ce(), P.value = { manualLineCount: 0, manualPolygonCount: 0 }, m.annotation_data && (Pe(m.annotation_data), Ne(m.annotation_data));
      }
    } finally {
      b.value = !1;
    }
  }
  async function me() {
    if (r) {
      v.value = !0;
      try {
        if (o != null && o.getVersions) {
          const a = await o.getVersions({
            imageId: r,
            annotationTaskId: e,
            page: 1,
            pageSize: 50
          });
          a && (c.value = a);
        }
      } finally {
        v.value = !1;
      }
    }
  }
  function De() {
    var a, m;
    (a = d.value) == null || a.zoomIn(), z.value = ((m = d.value) == null ? void 0 : m.getZoomLevel()) || 1;
  }
  function Oe() {
    var a, m;
    (a = d.value) == null || a.zoomOut(), z.value = ((m = d.value) == null ? void 0 : m.getZoomLevel()) || 1;
  }
  function Ee() {
    var a;
    (a = d.value) == null || a.resetView(), z.value = 1;
  }
  function Me(a) {
    var m;
    z.value = a / 100, (m = d.value) == null || m.zoomTo(z.value);
  }
  function Ue() {
    const a = document.querySelector(".annotation-viewer-container");
    a && (document.fullscreenElement ? document.exitFullscreen() : a.requestFullscreen());
  }
  function je() {
    I.value = !I.value;
    const a = document.querySelector(".annotation-viewer-container");
    if (a) {
      const m = a.querySelector(".navigator");
      m && (m.style.display = I.value ? "block" : "none");
    }
  }
  function Be(a) {
    g.value = a;
  }
  function Fe() {
    var he, xe;
    const a = (he = d.value) == null ? void 0 : he.getDoodleManager(), m = (a == null ? void 0 : a.getShapes()) || [], h = new Set(
      m.filter(
        (Y) => Y.id.startsWith("region-") && Y.id.endsWith("-external")
      ).map((Y) => {
        const oe = Y.id.match(/^region-(\d+)-external$/);
        return oe ? parseInt(oe[1]) : -1;
      }).filter((Y) => Y >= 0)
    ), D = ((xe = p.value) == null ? void 0 : xe.annotation_data) || [], B = [];
    D.forEach((Y, oe) => {
      if (h.has(oe)) {
        const Ae = m.find(
          (se) => se.id === `region-${oe}-external`
        );
        if (Ae) {
          const se = Se([Ae]);
          se.length > 0 && B.push({
            ...se[0],
            shape: Y.shape || "closed_path"
          });
        } else
          B.push(Y);
      }
    });
    const mt = m.filter(
      (Y) => !Y.id.startsWith("region")
    ), ft = Se(mt);
    return [...B, ...ft];
  }
  function Ze() {
    var m;
    const a = (m = d.value) == null ? void 0 : m.undo();
    a != null && a.success && j("已撤销", "success", !0), S.value++;
  }
  function He() {
    var m;
    const a = (m = d.value) == null ? void 0 : m.redo();
    a != null && a.success && j("已重做", "success", !0), S.value++;
  }
  function We(a) {
    a && (ve.includes(a.type) ? P.value.manualLineCount = Math.max(
      0,
      P.value.manualLineCount - 1
    ) : ge.includes(a.type) && (P.value.manualPolygonCount = Math.max(
      0,
      P.value.manualPolygonCount - 1
    )));
  }
  function Ye(a) {
    a && (ve.includes(a.type) ? P.value.manualLineCount++ : ge.includes(a.type) && P.value.manualPolygonCount++);
  }
  function qe() {
    var m;
    if (!J.value) {
      j("请先选择要删除的标注", "warning");
      return;
    }
    const a = (m = d.value) == null ? void 0 : m.getDoodleManager();
    a && (a.removeShape(J.value), j("已删除标注", "success")), J.value = null;
  }
  function Ge() {
    var h;
    const a = (h = d.value) == null ? void 0 : h.getDoodleManager(), m = (a == null ? void 0 : a.getUndoStackCount()) || 0;
    if (P.value = { manualLineCount: 0, manualPolygonCount: 0 }, a == null || a.clearShapes(), m === 0) {
      j("没有可清除的人工标注", "warning");
      return;
    }
    j("已清除所有人工标注", "success");
  }
  function Je(a) {
    S.value++, ve.includes(a.type) ? P.value.manualLineCount++ : ge.includes(a.type) && P.value.manualPolygonCount++;
  }
  function Ke(a) {
    J.value = a;
  }
  function Qe(a) {
    z.value = a;
  }
  function Xe(a) {
    U.value = a;
  }
  function et(a) {
    const m = w.value.indexOf(a);
    if (m > -1) {
      w.value.splice(m, 1);
      const h = { ...k.value };
      delete h[a], k.value = h;
    } else if (w.value.length < 5) {
      const h = Object.values(k.value).map((B) => B.color), D = we.find((B) => !h.includes(B.color));
      D ? k.value = { ...k.value, [a]: D } : k.value = {
        ...k.value,
        [a]: $e(w.value.length)
      }, w.value.push(a);
    } else
      j("最多只能选择 5 个版本进行对比", "warning");
  }
  function tt() {
    w.value.forEach((a) => {
      if (!k.value[a]) {
        const m = Object.values(k.value).map((D) => D.color), h = we.find((D) => !m.includes(D.color));
        k.value = {
          ...k.value,
          [a]: h || $e(w.value.length)
        };
      }
    });
  }
  async function nt() {
    if (w.value.length !== 0) {
      if (!(o != null && o.getAnnotation)) {
        j("未配置数据提供器", "warning");
        return;
      }
      M.value = !0;
      try {
        const a = {};
        await Promise.all(
          w.value.map(async (m) => {
            try {
              const h = await o.getAnnotation(r, m);
              h != null && h.annotation_data ? a[m] = h.annotation_data : a[m] = [];
            } catch {
              a[m] = [];
            }
          })
        ), V.value = a;
      } finally {
        M.value = !1;
      }
    }
  }
  async function ot() {
    var a;
    if (w.value.length > 0) {
      const m = (a = d.value) == null ? void 0 : a.getDoodleManager();
      m == null || m.clearAllShapes(), tt(), M.value = !0;
      try {
        await nt(), fe(() => {
          var h, D;
          (D = (h = d.value) == null ? void 0 : h.drawCompareAnnotations) == null || D.call(h, () => {
            M.value = !1;
          });
        });
      } catch {
        M.value = !1, j("加载版本数据失败", "error");
      }
    } else
      j("请先选择要对比的版本", "warning");
  }
  function ie(a) {
    i.value = a;
  }
  function lt() {
    ie("refine"), fe(() => {
      var a;
      (a = d.value) == null || a.setRefineMode(!0), g.value = "move";
    });
  }
  async function at() {
    var m;
    ie("view"), (m = d.value) == null || m.setRefineMode(!1), w.value = [], V.value = {}, k.value = {}, p.value = null, K.value = void 0, G.value = { total: 0, lineCount: 0, polygonCount: 0 }, P.value = { manualLineCount: 0, manualPolygonCount: 0 }, X.value = [], J.value = null, Ce();
    const a = E.value;
    E.value = "", await de(), E.value === a && E.value && fe(() => {
      var h, D;
      if (d.value) {
        const B = d.value.getDoodleManager();
        B && B.clearShapes(!1), (D = (h = d.value).redrawAnnotations) == null || D.call(h);
      }
    });
  }
  function it() {
    ie("compare"), w.value = [];
  }
  async function st(a) {
    if (!a.versionName) {
      j("请输入版本名称", "warning");
      return;
    }
    if (!(o != null && o.submitRefine)) {
      j("未配置数据提交功能", "warning");
      return;
    }
    R.value = !0;
    try {
      const m = Fe();
      await o.submitRefine(r, {
        annotationTaskId: e,
        versionName: a.versionName,
        versionRemark: a.versionRemark,
        annotationData: m || []
      }), u.value = !1;
    } finally {
      R.value = !1;
    }
  }
  function rt() {
    u.value = !1;
  }
  function ut(a) {
    u.value = a;
  }
  function dt() {
    de(), me();
  }
  return ke(() => {
    dt();
  }), te(
    () => i.value,
    (a) => {
      a === "compare" && me(), a !== "refine" && (g.value = null);
    }
  ), {
    // 状态
    visible: u,
    currentMode: i,
    annotationLoading: b,
    versionsLoading: v,
    submitLoading: R,
    compareLoading: M,
    currentAnnotation: p,
    annotationVersionsList: c,
    selectedVersionId: w,
    compareVersionsData: V,
    versionColorMap: k,
    currentTool: g,
    fileUrl: E,
    versionInfo: K,
    imageInfo: U,
    sliceInfo: N,
    baseAnnotationStatistics: G,
    manualAnnotationStatistics: P,
    annotationRegions: X,
    selectedAnnotationId: J,
    zoomLevel: z,
    zoomPercentage: ae,
    // 计算属性
    isViewMode: _,
    isCompareMode: L,
    isRefineMode: Q,
    windowTitle: ee,
    canUndo: H,
    canRedo: Le,
    navigatorVisible: I,
    baseVersionId: Z,
    dziViewerRef: d,
    // 方法
    handleDialogVisibleChange: ut,
    handleZoomIn: De,
    handleZoomOut: Oe,
    handleResetView: Ee,
    handleZoomChange: Me,
    handleZoomLevelChange: Qe,
    handleImageLoaded: Xe,
    handleAnnotationSelect: Ke,
    handleToolChange: Be,
    handleAnnotationChange: Je,
    handleUndo: Ze,
    handleRedo: He,
    handleUndoChange: We,
    handleRedoChange: Ye,
    handleDeleteSelectedAnnotation: qe,
    handleClearAnnotation: Ge,
    handleVersionSelect: et,
    handleStartCompare: ot,
    handleEnterRefine: lt,
    handleSwitchToCompare: it,
    returnToViewMode: at,
    handleSubmitRefine: st,
    handleClose: rt,
    handleToggleFullscreen: Ue,
    handleToggleNavigator: je,
    loadAnnotation: de,
    loadVersions: me,
    switchMode: ie
  };
}
export {
  Do as ANNOTATION_STATUS_MAP,
  Oo as ANNOTATION_TOOL_LIST,
  Eo as ANNOTATION_TYPE_MAP,
  Mo as AREA_ANNOTATION_TYPES,
  Io as AnnotationDetailLayout,
  Mn as AnnotationRegionPanel,
  _n as AnnotationStatsPanel,
  Xt as AnnotationViewer,
  Fn as BaseToolsPanel,
  Uo as COMPARE_VERSION_COLORS,
  jo as DEFAULT_REGION_COLOR,
  cn as ImageInfoPanel,
  Bo as LINE_ANNOTATION_TYPES,
  Fo as REGION_COLOR_MAP,
  Xn as RefineToolsPanel,
  wn as SliceInfoPanel,
  Zo as TOOL_NAMES,
  yo as VersionComparePanel,
  mo as VersionInfoPanel,
  Wn as ZoomControlPanel,
  _o as convertAnnotationData,
  Se as convertShapesToAnnotationData,
  Ho as getVersionCompareColor,
  Lo as useAnnotationViewer
};
