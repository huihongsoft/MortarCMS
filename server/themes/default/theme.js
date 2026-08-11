import a, { forwardRef as Zn, createElement as Or, useState as pe, useEffect as Se, useRef as Ir } from "react";
import { Link as z, useNavigate as Za, useSearchParams as Qa } from "react-router-dom";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const es = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Qn = (...e) => e.filter((t, r, n) => !!t && t.trim() !== "" && n.indexOf(t) === r).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var ts = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rs = Zn(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: n,
    className: s = "",
    children: o,
    iconNode: l,
    ...c
  }, d) => Or(
    "svg",
    {
      ref: d,
      ...ts,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: n ? Number(r) * 24 / Number(t) : r,
      className: Qn("lucide", s),
      ...c
    },
    [
      ...l.map(([f, m]) => Or(f, m)),
      ...Array.isArray(o) ? o : [o]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const se = (e, t) => {
  const r = Zn(
    ({ className: n, ...s }, o) => Or(rs, {
      ref: o,
      iconNode: t,
      className: Qn(`lucide-${es(e)}`, n),
      ...s
    })
  );
  return r.displayName = `${e}`, r;
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ea = se("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Je = se("Calendar", [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ta = se("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ns = se("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const as = se("Clock", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ss = se("FileText", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const os = se("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kt = se("Folder", [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const is = se("House", [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "1d0kgt"
    }
  ]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ls = se("Link2", [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cs = se("List", [
  ["path", { d: "M3 12h.01", key: "nlz23k" }],
  ["path", { d: "M3 18h.01", key: "1tta3j" }],
  ["path", { d: "M3 6h.01", key: "1rqtza" }],
  ["path", { d: "M8 12h13", key: "1za7za" }],
  ["path", { d: "M8 18h13", key: "1lx6n3" }],
  ["path", { d: "M8 6h13", key: "ik3vkj" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const us = se("Menu", [
  ["line", { x1: "4", x2: "20", y1: "12", y2: "12", key: "1e0a9i" }],
  ["line", { x1: "4", x2: "20", y1: "6", y2: "6", key: "1owob3" }],
  ["line", { x1: "4", x2: "20", y1: "18", y2: "18", key: "yk5zj1" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zt = se("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ra = se("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ms = se("Tag", [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fs = se("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mr = se("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ds = se("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function na(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: ps } = Object.prototype, { getPrototypeOf: it } = Object, { iterator: _t, toStringTag: aa } = Symbol, Jt = (({ hasOwnProperty: e }) => (t, r) => e.call(t, r))(Object.prototype), Nt = (e, t) => {
  let r = e;
  const n = [];
  for (; r != null && r !== Object.prototype; ) {
    if (n.indexOf(r) !== -1)
      return !1;
    if (n.push(r), Jt(r, t))
      return !0;
    r = it(r);
  }
  return !1;
}, hs = (e, t) => e != null && Nt(e, t) ? e[t] : void 0, Ur = /* @__PURE__ */ ((e) => (t) => {
  const r = ps.call(t);
  return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), we = (e) => (e = e.toLowerCase(), (t) => Ur(t) === e), Qt = (e) => (t) => typeof t === e, { isArray: We } = Array, Ve = Qt("undefined");
function ct(e) {
  return e !== null && !Ve(e) && e.constructor !== null && !Ve(e.constructor) && Ee(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const sa = we("ArrayBuffer");
function gs(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && sa(e.buffer), t;
}
const ys = Qt("string"), Ee = Qt("function"), oa = Qt("number"), ut = (e) => e !== null && typeof e == "object", Es = (e) => e === !0 || e === !1, $t = (e) => {
  if (!ut(e))
    return !1;
  const t = it(e);
  return (t === null || t === Object.prototype || it(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !Nt(e, aa) && !Nt(e, _t);
}, bs = (e) => {
  if (!ut(e) || ct(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, xs = we("Date"), ws = we("File"), Ns = (e) => !!(e && typeof e.uri < "u"), _s = (e) => e && typeof e.getParts < "u", Ts = we("Blob"), Ss = we("FileList"), As = we("Set"), Rs = (e) => ut(e) && Ee(e.pipe);
function Os() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const gn = Os(), yn = typeof gn.FormData < "u" ? gn.FormData : void 0, vs = (e) => {
  if (!e) return !1;
  if (yn && e instanceof yn) return !0;
  const t = it(e);
  if (!t || t === Object.prototype || !Ee(e.append)) return !1;
  const r = Ur(e);
  return r === "formdata" || // detect form-data instance
  r === "object" && Ee(e.toString) && e.toString() === "[object FormData]";
}, ks = we("URLSearchParams"), [Cs, Ls, Ds, Ps] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(we), Is = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Tt(e, t, { allOwnKeys: r = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let n, s;
  if (typeof e != "object" && (e = [e]), We(e))
    for (n = 0, s = e.length; n < s; n++)
      t.call(null, e[n], n, e);
  else {
    if (ct(e))
      return;
    const o = r ? Object.getOwnPropertyNames(e) : Object.keys(e), l = o.length;
    let c;
    for (n = 0; n < l; n++)
      c = o[n], t.call(null, e[c], c, e);
  }
}
function ia(e, t) {
  if (ct(e))
    return null;
  t = t.toLowerCase();
  const r = Object.keys(e);
  let n = r.length, s;
  for (; n-- > 0; )
    if (s = r[n], t === s.toLowerCase())
      return s;
  return null;
}
const qe = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, la = (e) => !Ve(e) && e !== qe;
function vr(...e) {
  const { caseless: t, skipUndefined: r } = la(this) && this || {}, n = {}, s = (o, l) => {
    if (l === "__proto__" || l === "constructor" || l === "prototype")
      return;
    const c = t && typeof l == "string" && ia(n, l) || l, d = Jt(n, c) ? n[c] : void 0;
    $t(d) && $t(o) ? n[c] = vr(d, o) : $t(o) ? n[c] = vr({}, o) : We(o) ? n[c] = o.slice() : (!r || !Ve(o)) && (n[c] = o);
  };
  for (let o = 0, l = e.length; o < l; o++) {
    const c = e[o];
    if (!c || ct(c) || (Tt(c, s), typeof c != "object" || We(c)))
      continue;
    const d = Object.getOwnPropertySymbols(c);
    for (let f = 0; f < d.length; f++) {
      const m = d[f];
      Gs.call(c, m) && s(c[m], m);
    }
  }
  return n;
}
const Ms = (e, t, r, { allOwnKeys: n } = {}) => (Tt(
  t,
  (s, o) => {
    r && Ee(s) ? Object.defineProperty(e, o, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: na(s, r),
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : Object.defineProperty(e, o, {
      __proto__: null,
      value: s,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  },
  { allOwnKeys: n }
), e), Us = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), Fs = (e, t, r, n) => {
  e.prototype = Object.create(t.prototype, n), Object.defineProperty(e.prototype, "constructor", {
    __proto__: null,
    value: e,
    writable: !0,
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e, "super", {
    __proto__: null,
    value: t.prototype
  }), r && Object.assign(e.prototype, r);
}, zs = (e, t, r, n) => {
  let s, o, l;
  const c = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0; )
      l = s[o], (!n || n(l, e, t)) && !c[l] && (t[l] = e[l], c[l] = !0);
    e = r !== !1 && it(e);
  } while (e && (!r || r(e, t)) && e !== Object.prototype);
  return t;
}, Hs = (e, t, r) => {
  e = String(e), (r === void 0 || r > e.length) && (r = e.length), r -= t.length;
  const n = e.indexOf(t, r);
  return n !== -1 && n === r;
}, Bs = (e) => {
  if (!e) return null;
  if (We(e)) return e;
  let t = e.length;
  if (!oa(t)) return null;
  const r = new Array(t);
  for (; t-- > 0; )
    r[t] = e[t];
  return r;
}, js = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && it(Uint8Array)), qs = (e, t) => {
  const n = (e && e[_t]).call(e);
  let s;
  for (; (s = n.next()) && !s.done; ) {
    const o = s.value;
    t.call(e, o[0], o[1]);
  }
}, $s = (e, t) => {
  let r;
  const n = [];
  for (; (r = e.exec(t)) !== null; )
    n.push(r);
  return n;
}, Ws = we("HTMLFormElement"), Vs = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(r, n, s) {
  return n.toUpperCase() + s;
}), { propertyIsEnumerable: Gs } = Object.prototype, Js = we("RegExp"), ca = (e, t) => {
  const r = Object.getOwnPropertyDescriptors(e), n = {};
  Tt(r, (s, o) => {
    let l;
    (l = t(s, o, e)) !== !1 && (n[o] = l || s);
  }), Object.defineProperties(e, n);
}, Xs = (e) => {
  ca(e, (t, r) => {
    if (Ee(e) && ["arguments", "caller", "callee"].includes(r))
      return !1;
    const n = e[r];
    if (Ee(n)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + r + "'");
      });
    }
  });
}, Ys = (e, t) => {
  const r = {}, n = (s) => {
    s.forEach((o) => {
      r[o] = !0;
    });
  };
  return We(e) ? n(e) : n(String(e).split(t)), r;
}, Ks = () => {
}, Zs = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Qs(e) {
  return !!(e && Ee(e.append) && e[aa] === "FormData" && e[_t]);
}
const eo = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), r = (n) => {
    if (ut(n)) {
      if (t.has(n))
        return;
      if (ct(n))
        return n;
      if (!("toJSON" in n)) {
        t.add(n);
        let s;
        if (As(n)) {
          s = [];
          for (const o of n) {
            const l = r(o);
            !Ve(l) && s.push(l);
          }
        } else
          s = We(n) ? [] : {}, Tt(n, (o, l) => {
            const c = r(o);
            !Ve(c) && (s[l] = c);
          });
        return t.delete(n), s;
      }
    }
    return n;
  };
  return r(e);
}, to = we("AsyncFunction"), ro = (e) => e && (ut(e) || Ee(e)) && Ee(e.then) && Ee(e.catch), ua = ((e, t) => e ? setImmediate : t ? ((r, n) => (qe.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === qe && o === r && n.length && n.shift()();
  },
  !1
), (s) => {
  n.push(s), qe.postMessage(r, "*");
}))(`axios@${Math.random()}`, []) : (r) => setTimeout(r))(typeof setImmediate == "function", Ee(qe.postMessage)), no = typeof queueMicrotask < "u" ? queueMicrotask.bind(qe) : typeof process < "u" && process.nextTick || ua, ma = (e) => e != null && Ee(e[_t]), ao = (e) => e != null && Nt(e, _t) && ma(e), u = {
  isArray: We,
  isArrayBuffer: sa,
  isBuffer: ct,
  isFormData: vs,
  isArrayBufferView: gs,
  isString: ys,
  isNumber: oa,
  isBoolean: Es,
  isObject: ut,
  isPlainObject: $t,
  isEmptyObject: bs,
  isReadableStream: Cs,
  isRequest: Ls,
  isResponse: Ds,
  isHeaders: Ps,
  isUndefined: Ve,
  isDate: xs,
  isFile: ws,
  isReactNativeBlob: Ns,
  isReactNative: _s,
  isBlob: Ts,
  isRegExp: Js,
  isFunction: Ee,
  isStream: Rs,
  isURLSearchParams: ks,
  isTypedArray: js,
  isFileList: Ss,
  forEach: Tt,
  merge: vr,
  extend: Ms,
  trim: Is,
  stripBOM: Us,
  inherits: Fs,
  toFlatObject: zs,
  kindOf: Ur,
  kindOfTest: we,
  endsWith: Hs,
  toArray: Bs,
  forEachEntry: qs,
  matchAll: $s,
  isHTMLForm: Ws,
  hasOwnProperty: Jt,
  hasOwnProp: Jt,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: Nt,
  getSafeProp: hs,
  reduceDescriptors: ca,
  freezeMethods: Xs,
  toObjectSet: Ys,
  toCamelCase: Vs,
  noop: Ks,
  toFiniteNumber: Zs,
  findKey: ia,
  global: qe,
  isContextDefined: la,
  isSpecCompliantForm: Qs,
  toJSONObject: eo,
  isAsyncFn: to,
  isThenable: ro,
  setImmediate: ua,
  asap: no,
  isIterable: ma,
  isSafeIterable: ao
}, so = u.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), oo = (e) => {
  const t = {};
  let r, n, s;
  return e && e.split(`
`).forEach(function(l) {
    s = l.indexOf(":"), r = l.substring(0, s).trim().toLowerCase(), n = l.substring(s + 1).trim();
    const c = u.hasOwnProp(t, r);
    !r || c && u.hasOwnProp(so, r) || (r === "set-cookie" ? c ? t[r].push(n) : t[r] = [n] : t[r] = c ? t[r] + ", " + n : n);
  }), t;
};
function io(e) {
  let t = 0, r = e.length;
  for (; t < r; ) {
    const n = e.charCodeAt(t);
    if (n !== 9 && n !== 32)
      break;
    t += 1;
  }
  for (; r > t; ) {
    const n = e.charCodeAt(r - 1);
    if (n !== 9 && n !== 32)
      break;
    r -= 1;
  }
  return t === 0 && r === e.length ? e : e.slice(t, r);
}
const lo = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), co = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Fr(e, t) {
  return u.isArray(e) ? e.map((r) => Fr(r, t)) : io(String(e).replace(t, ""));
}
const uo = (e) => Fr(e, lo), mo = (e) => Fr(e, co);
function fa(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return u.forEach(e.toJSON(), (r, n) => {
    t[n] = mo(r);
  }), t;
}
const En = Symbol("internals");
function Et(e) {
  return e && String(e).trim().toLowerCase();
}
function Wt(e) {
  return e === !1 || e == null ? e : u.isArray(e) ? e.map(Wt) : uo(String(e));
}
function fo(e) {
  const t = /* @__PURE__ */ Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let n;
  for (; n = r.exec(e); )
    t[n[1]] = n[2];
  return t;
}
const po = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function yr(e) {
  let t = 0, r = e.length;
  for (; t < r; ) {
    const n = e.charCodeAt(t);
    if (n !== 9 && n !== 32)
      break;
    t += 1;
  }
  for (; r > t; ) {
    const n = e.charCodeAt(r - 1);
    if (n !== 9 && n !== 32)
      break;
    r -= 1;
  }
  return t === 0 && r === e.length ? e : e.slice(t, r);
}
function ho(e) {
  const t = e.length - 1;
  if (t < 1 || e.charCodeAt(0) !== 34 || e.charCodeAt(t) !== 34)
    return e;
  let r = "";
  for (let n = 1; n < t; n++) {
    const s = e.charCodeAt(n);
    if (s === 34 || s === 92 && (n += 1, n >= t))
      return e;
    r += e[n];
  }
  return r;
}
function go(e) {
  const t = /* @__PURE__ */ Object.create(null), r = String(e);
  let n = 0, s = !1, o = !1;
  function l(c) {
    const d = yr(r.slice(n, c)), f = d.indexOf("=");
    if (f < 1)
      return;
    const m = yr(d.slice(0, f));
    if (!po.test(m))
      return;
    const g = m.toLowerCase();
    if (g === "__proto__" || g === "constructor" || g === "prototype")
      return;
    const b = yr(d.slice(f + 1));
    t[g] = ho(b);
  }
  for (let c = 0; c < r.length; c++) {
    const d = r.charCodeAt(c);
    s ? o ? o = !1 : d === 92 ? o = !0 : d === 34 && (s = !1) : d === 34 ? s = !0 : (d === 44 || d === 59) && (l(c), n = c + 1);
  }
  return l(r.length), t;
}
const yo = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Er(e, t, r, n, s) {
  if (u.isFunction(n))
    return n.call(this, t, r);
  if (s && (t = r), !!u.isString(t)) {
    if (u.isString(n))
      return t.indexOf(n) !== -1;
    if (u.isRegExp(n))
      return n.test(t);
  }
}
function Eo(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, r, n) => r.toUpperCase() + n);
}
function bo(e, t) {
  const r = u.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((n) => {
    Object.defineProperty(e, n + r, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(s, o, l) {
        return this[n].call(this, t, s, o, l);
      },
      configurable: !0
    });
  });
}
let fe = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, r, n) {
    const s = this;
    function o(c, d, f) {
      const m = Et(d);
      if (!m)
        return;
      const g = u.findKey(s, m);
      (!g || s[g] === void 0 || f === !0 || f === void 0 && s[g] !== !1) && (s[g || d] = Wt(c));
    }
    const l = (c, d) => u.forEach(c, (f, m) => o(f, m, d));
    if (u.isPlainObject(t) || t instanceof this.constructor)
      l(t, r);
    else if (u.isString(t) && (t = t.trim()) && !yo(t))
      l(oo(t), r);
    else if (u.isObject(t) && u.isSafeIterable(t)) {
      let c = /* @__PURE__ */ Object.create(null), d, f;
      for (const m of t) {
        if (!u.isArray(m))
          throw new TypeError("Object iterator must return a key-value pair");
        f = m[0], u.hasOwnProp(c, f) ? (d = c[f], c[f] = u.isArray(d) ? [...d, m[1]] : [d, m[1]]) : c[f] = m[1];
      }
      l(c, r);
    } else
      t != null && o(r, t, n);
    return this;
  }
  get(t, r) {
    if (t = Et(t), t) {
      const n = u.findKey(this, t);
      if (n) {
        const s = this[n];
        if (!r)
          return s;
        if (r === !0)
          return fo(s);
        if (u.isFunction(r))
          return r.call(this, s, n);
        if (u.isRegExp(r))
          return r.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, r) {
    if (t = Et(t), t) {
      const n = u.findKey(this, t);
      return !!(n && this[n] !== void 0 && (!r || Er(this, this[n], n, r)));
    }
    return !1;
  }
  delete(t, r) {
    const n = this;
    let s = !1;
    function o(l) {
      if (l = Et(l), l) {
        const c = u.findKey(n, l);
        c && (!r || Er(n, n[c], c, r)) && (delete n[c], s = !0);
      }
    }
    return u.isArray(t) ? t.forEach(o) : o(t), s;
  }
  clear(t) {
    const r = Object.keys(this);
    let n = r.length, s = !1;
    for (; n--; ) {
      const o = r[n];
      (!t || Er(this, this[o], o, t, !0)) && (delete this[o], s = !0);
    }
    return s;
  }
  normalize(t) {
    const r = this, n = {};
    return u.forEach(this, (s, o) => {
      const l = u.findKey(n, o);
      if (l) {
        r[l] = Wt(s), delete r[o];
        return;
      }
      const c = t ? Eo(o) : String(o).trim();
      c !== o && delete r[o], r[c] = Wt(s), n[c] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const r = /* @__PURE__ */ Object.create(null);
    return u.forEach(this, (n, s) => {
      n != null && n !== !1 && (r[s] = t && u.isArray(n) ? n.join(", ") : n);
    }), r;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([t, r]) => t + ": " + r).join(`
`);
  }
  getSetCookie() {
    const t = this.get("set-cookie");
    return u.isArray(t) ? t : t == null || t === !1 ? [] : [t];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static parseParameters(t) {
    return go(t);
  }
  static concat(t, ...r) {
    const n = new this(t);
    return r.forEach((s) => n.set(s)), n;
  }
  static accessor(t) {
    const n = (this[En] = this[En] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(l) {
      const c = Et(l);
      n[c] || (bo(s, l), n[c] = !0);
    }
    return u.isArray(t) ? t.forEach(o) : o(t), this;
  }
};
fe.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
u.reduceDescriptors(fe.prototype, ({ value: e }, t) => {
  let r = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(n) {
      this[r] = n;
    }
  };
});
u.freezeMethods(fe);
const Xt = "[REDACTED ****]";
function xo(e) {
  if (u.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (u.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function wo(e, t) {
  const r = new Set(t.map((o) => String(o).toLowerCase())), n = [], s = (o) => {
    if (o === null || typeof o != "object" || u.isBuffer(o)) return o;
    if (n.indexOf(o) !== -1) return;
    o instanceof fe && (o = o.toJSON()), n.push(o);
    let l;
    if (u.isArray(o))
      l = [], o.forEach((c, d) => {
        const f = s(c);
        u.isUndefined(f) || (l[d] = f);
      });
    else {
      if (!u.isPlainObject(o) && xo(o))
        return n.pop(), o;
      l = /* @__PURE__ */ Object.create(null);
      for (const [c, d] of Object.entries(o)) {
        const f = r.has(c.toLowerCase()) ? Xt : s(d);
        u.isUndefined(f) || (l[c] = f);
      }
    }
    return n.pop(), l;
  };
  return s(e);
}
function bn(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function No(e) {
  return e.errors.map((r) => {
    try {
      return r && r.message ? bn(r.message) : bn(r);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let O = class da extends Error {
  static from(t, r, n, s, o, l) {
    let c = t.message;
    !c && u.isArray(t.errors) && t.errors.length && (c = No(t));
    const d = new da(c, r || t.code, n, s, o);
    return Object.defineProperty(d, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), d.name = t.name, t.status != null && d.status == null && (d.status = t.status), l && Object.assign(d, l), d;
  }
  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  constructor(t, r, n, s, o) {
    super(t), Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, r && (this.code = r), n && (this.config = n), s && (this.request = s), o && (this.response = o, this.status = o.status);
  }
  toJSON() {
    const t = this.config, r = t && u.hasOwnProp(t, "redact") ? t.redact : void 0, n = u.isArray(r) && r.length > 0 ? wo(t, r) : u.toJSONObject(t);
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: n,
      code: this.code,
      status: this.status
    };
  }
};
O.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
O.ERR_BAD_OPTION = "ERR_BAD_OPTION";
O.ECONNABORTED = "ECONNABORTED";
O.ETIMEDOUT = "ETIMEDOUT";
O.ECONNREFUSED = "ECONNREFUSED";
O.ERR_NETWORK = "ERR_NETWORK";
O.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
O.ERR_DEPRECATED = "ERR_DEPRECATED";
O.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
O.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
O.ERR_CANCELED = "ERR_CANCELED";
O.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
O.ERR_INVALID_URL = "ERR_INVALID_URL";
O.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const _o = null, pa = 100;
function kr(e) {
  return u.isPlainObject(e) || u.isArray(e);
}
function ha(e) {
  return u.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function br(e, t, r) {
  return e ? e.concat(t).map(function(s, o) {
    return s = ha(s), !r && o ? "[" + s + "]" : s;
  }).join(r ? "." : "") : t;
}
function To(e) {
  return u.isArray(e) && !e.some(kr);
}
const So = u.toFlatObject(u, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function er(e, t, r) {
  if (!u.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData(), r = u.toFlatObject(
    r,
    {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    },
    !1,
    function(v, M) {
      return !u.isUndefined(M[v]);
    }
  );
  const n = r.metaTokens, s = r.visitor || P, o = r.dots, l = r.indexes, c = r.Blob || typeof Blob < "u" && Blob, d = r.maxDepth === void 0 ? pa : r.maxDepth, f = c && u.isSpecCompliantForm(t), m = [];
  if (!u.isFunction(s))
    throw new TypeError("visitor must be a function");
  function g(x) {
    if (x === null) return "";
    if (u.isDate(x))
      return x.toISOString();
    if (u.isBoolean(x))
      return x.toString();
    if (!f && u.isBlob(x))
      throw new O("Blob is not supported. Use a Buffer instead.");
    if (u.isArrayBuffer(x) || u.isTypedArray(x)) {
      if (f && typeof c == "function")
        return new c([x]);
      throw new O("Blob is not supported. Use a Buffer instead.", O.ERR_NOT_SUPPORT);
    }
    return x;
  }
  function b(x) {
    if (x > d)
      throw new O(
        "Object is too deeply nested (" + x + " levels). Max depth: " + d,
        O.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function k(x, v) {
    if (d === 1 / 0)
      return JSON.stringify(x);
    const M = [];
    return JSON.stringify(x, function(h, A) {
      if (!u.isObject(A))
        return A;
      for (; M.length && M[M.length - 1] !== this; )
        M.pop();
      return M.push(A), b(v + M.length - 1), A;
    });
  }
  function P(x, v, M) {
    let U = x;
    if (u.isReactNative(t) && u.isReactNativeBlob(x))
      return t.append(br(M, v, o), g(x)), !1;
    if (x && !M && typeof x == "object") {
      if (u.endsWith(v, "{}"))
        v = n ? v : v.slice(0, -2), x = k(x, 1);
      else if (u.isArray(x) && To(x) || (u.isFileList(x) || u.endsWith(v, "[]")) && (U = u.toArray(x)))
        return v = ha(v), U.forEach(function(A, y) {
          !(u.isUndefined(A) || A === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            l === !0 ? br([v], y, o) : l === null ? v : v + "[]",
            g(A)
          );
        }), !1;
    }
    return kr(x) ? !0 : (t.append(br(M, v, o), g(x)), !1);
  }
  const B = Object.assign(So, {
    defaultVisitor: P,
    convertValue: g,
    isVisitable: kr
  });
  function C(x, v, M = 0) {
    if (!u.isUndefined(x)) {
      if (b(M), m.indexOf(x) !== -1)
        throw new Error("Circular reference detected in " + v.join("."));
      m.push(x), u.forEach(x, function(h, A) {
        (!(u.isUndefined(h) || h === null) && s.call(t, h, u.isString(A) ? A.trim() : A, v, B)) === !0 && C(h, v ? v.concat(A) : [A], M + 1);
      }), m.pop();
    }
  }
  if (!u.isObject(e))
    throw new TypeError("data must be an object");
  return C(e), t;
}
function xn(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+"
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20/g, function(n) {
    return t[n];
  });
}
function zr(e, t) {
  this._pairs = [], e && er(e, this, t);
}
const ga = zr.prototype;
ga.append = function(t, r) {
  this._pairs.push([t, r]);
};
ga.toString = function(t) {
  const r = t ? (n) => t.call(this, n, xn) : xn;
  return this._pairs.map(function(s) {
    return r(s[0]) + "=" + r(s[1]);
  }, "").join("&");
};
function Ao(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function ya(e, t, r) {
  if (!t)
    return e;
  e = e || "";
  const n = u.isFunction(r) ? {
    serialize: r
  } : r, s = u.getSafeProp(n, "encode") || Ao, o = u.getSafeProp(n, "serialize");
  let l;
  if (o ? l = o(t, n) : l = u.isURLSearchParams(t) ? t.toString() : new zr(t, n).toString(s), l) {
    const c = e.indexOf("#");
    c !== -1 && (e = e.slice(0, c)), e += (e.indexOf("?") === -1 ? "?" : "&") + l;
  }
  return e;
}
class wn {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   * @param {Object} options The options for the interceptor, synchronous and runWhen
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(t, r, n) {
    return this.handlers.push({
      fulfilled: t,
      rejected: r,
      synchronous: n ? n.synchronous : !1,
      runWhen: n ? n.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(t) {
    this.handlers[t] && (this.handlers[t] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(t) {
    u.forEach(this.handlers, function(n) {
      n !== null && t(n);
    });
  }
}
const Hr = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, Ro = typeof URLSearchParams < "u" ? URLSearchParams : zr, Oo = typeof FormData < "u" ? FormData : null, vo = typeof Blob < "u" ? Blob : null, ko = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Ro,
    FormData: Oo,
    Blob: vo
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Br = typeof window < "u" && typeof document < "u", Cr = typeof navigator == "object" && navigator || void 0, Co = Br && (!Cr || ["ReactNative", "NativeScript", "NS"].indexOf(Cr.product) < 0), Lo = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Do = Br && window.location.href || "http://localhost", Po = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Br,
  hasStandardBrowserEnv: Co,
  hasStandardBrowserWebWorkerEnv: Lo,
  navigator: Cr,
  origin: Do
}, Symbol.toStringTag, { value: "Module" })), oe = {
  ...Po,
  ...ko
};
function Io(e, t) {
  return er(e, new oe.classes.URLSearchParams(), {
    visitor: function(r, n, s, o) {
      return oe.isNode && u.isBuffer(r) ? (this.append(n, r.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const Nn = pa;
function Ea(e) {
  if (e > Nn)
    throw new O(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + Nn,
      O.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function Mo(e) {
  const t = [], r = /[^.[\]]+|\[([^.[\]]*)]/g;
  let n;
  for (; (n = r.exec(e)) !== null; )
    Ea(t.length), t.push(n[0] === "[]" ? "" : n[1] || n[0]);
  return t;
}
function Uo(e) {
  const t = {}, r = Object.keys(e);
  let n;
  const s = r.length;
  let o;
  for (n = 0; n < s; n++)
    o = r[n], t[o] = e[o];
  return t;
}
function ba(e) {
  function t(r, n, s, o) {
    Ea(o);
    let l = r[o++];
    if (l === "__proto__") return !0;
    const c = Number.isFinite(+l), d = o >= r.length;
    return l = !l && u.isArray(s) ? s.length : l, d ? (u.hasOwnProp(s, l) ? s[l] = u.isArray(s[l]) ? s[l].concat(n) : [s[l], n] : s[l] = n, !c) : ((!u.hasOwnProp(s, l) || !u.isObject(s[l])) && (s[l] = []), t(r, n, s[l], o) && u.isArray(s[l]) && (s[l] = Uo(s[l])), !c);
  }
  if (u.isFormData(e) && u.isFunction(e.entries)) {
    const r = {};
    return u.forEachEntry(e, (n, s) => {
      t(Mo(n), s, r, 0);
    }), r;
  }
  return null;
}
const nt = (e, t) => e != null && u.hasOwnProp(e, t) ? e[t] : void 0;
function Fo(e, t, r) {
  if (u.isString(e))
    try {
      return (t || JSON.parse)(e), u.trim(e);
    } catch (n) {
      if (n.name !== "SyntaxError")
        throw n;
    }
  return (r || JSON.stringify)(e);
}
const St = {
  transitional: Hr,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, r) {
      const n = r.getContentType() || "", s = n.indexOf("application/json") > -1, o = u.isObject(t);
      if (o && u.isHTMLForm(t) && (t = new FormData(t)), u.isFormData(t))
        return s ? JSON.stringify(ba(t)) : t;
      if (u.isArrayBuffer(t) || u.isBuffer(t) || u.isStream(t) || u.isFile(t) || u.isBlob(t) || u.isReadableStream(t))
        return t;
      if (u.isArrayBufferView(t))
        return t.buffer;
      if (u.isURLSearchParams(t))
        return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let c;
      if (o) {
        const d = nt(this, "formSerializer");
        if (n.indexOf("application/x-www-form-urlencoded") > -1)
          return Io(t, d).toString();
        if ((c = u.isFileList(t)) || n.indexOf("multipart/form-data") > -1) {
          const f = nt(this, "env"), m = f && f.FormData;
          return er(
            c ? { "files[]": t } : t,
            m && new m(),
            d
          );
        }
      }
      return o || s ? (r.setContentType("application/json", !1), Fo(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const r = nt(this, "transitional") || St.transitional, n = r && r.forcedJSONParsing, s = nt(this, "responseType"), o = s === "json";
      if (u.isResponse(t) || u.isReadableStream(t))
        return t;
      if (t && u.isString(t) && (n && !s || o)) {
        const c = !(r && r.silentJSONParsing) && o;
        try {
          return JSON.parse(t, nt(this, "parseReviver"));
        } catch (d) {
          if (c)
            throw d.name === "SyntaxError" ? O.from(d, O.ERR_BAD_RESPONSE, this, null, nt(this, "response")) : d;
        }
      }
      return t;
    }
  ],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: oe.classes.FormData,
    Blob: oe.classes.Blob
  },
  validateStatus: function(t) {
    return t >= 200 && t < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
u.forEach(["delete", "get", "head", "post", "put", "patch", "query"], (e) => {
  St.headers[e] = {};
});
function xr(e, t) {
  const r = this || St, n = t || r, s = fe.from(n.headers);
  let o = n.data;
  return u.forEach(e, function(c) {
    o = c.call(r, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function xa(e) {
  return !!(e && e.__CANCEL__);
}
let At = class extends O {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(t, r, n) {
    super(t ?? "canceled", O.ERR_CANCELED, r, n), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function wa(e, t, r) {
  const n = r.config.validateStatus;
  !r.status || !n || n(r.status) ? e(r) : t(new O(
    "Request failed with status code " + r.status,
    r.status >= 400 && r.status < 500 ? O.ERR_BAD_REQUEST : O.ERR_BAD_RESPONSE,
    r.config,
    r.request,
    r
  ));
}
function zo(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Ho(e, t) {
  e = e || 10;
  const r = new Array(e), n = new Array(e);
  let s = 0, o = 0, l;
  return t = t !== void 0 ? t : 1e3, function(d) {
    const f = Date.now(), m = n[o];
    l || (l = f), r[s] = d, n[s] = f;
    let g = o, b = 0;
    for (; g !== s; )
      b += r[g++], g = g % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), f - l < t)
      return;
    const k = m && f - m;
    return k ? Math.round(b * 1e3 / k) : void 0;
  };
}
function Bo(e, t) {
  let r = 0, n = 1e3 / t, s, o;
  const l = (f, m = Date.now()) => {
    r = m, s = null, o && (clearTimeout(o), o = null), e(...f);
  };
  return [(...f) => {
    const m = Date.now(), g = m - r;
    g >= n ? l(f, m) : (s = f, o || (o = setTimeout(() => {
      o = null, l(s);
    }, n - g)));
  }, () => s && l(s)];
}
const Yt = (e, t, r = 3) => {
  let n = 0;
  const s = Ho(50, 250);
  return Bo((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const l = o.loaded, c = o.lengthComputable ? o.total : void 0, d = Math.max(0, c != null ? Math.min(l, c) : l), f = Math.max(0, d - n), m = s(f);
    n = Math.max(n, d);
    const g = {
      loaded: d,
      total: c,
      progress: c ? d / c : void 0,
      bytes: f,
      rate: m || void 0,
      estimated: m && c ? (c - d) / m : void 0,
      event: o,
      lengthComputable: c != null,
      [t ? "download" : "upload"]: !0
    };
    e(g);
  }, r);
}, _n = (e, t) => {
  const r = e != null;
  return [
    (n) => t[0]({
      lengthComputable: r,
      total: e,
      loaded: n
    }),
    t[1]
  ];
}, Tn = (e, t = u.asap) => (...r) => t(() => e(...r)), jo = oe.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (r) => (r = new URL(r, oe.origin), e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)))(
  new URL(oe.origin),
  oe.navigator && /(msie|trident)/i.test(oe.navigator.userAgent)
) : () => !0, qo = oe.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, r, n, s, o, l) {
      if (typeof document > "u") return;
      const c = [`${e}=${encodeURIComponent(t)}`];
      u.isNumber(r) && c.push(`expires=${new Date(r).toUTCString()}`), u.isString(n) && c.push(`path=${n}`), u.isString(s) && c.push(`domain=${s}`), o === !0 && c.push("secure"), u.isString(l) && c.push(`SameSite=${l}`), document.cookie = c.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.split(";");
      for (let r = 0; r < t.length; r++) {
        const n = t[r].replace(/^\s+/, ""), s = n.indexOf("=");
        if (s !== -1 && n.slice(0, s) === e)
          try {
            return decodeURIComponent(n.slice(s + 1));
          } catch {
            return n.slice(s + 1);
          }
      }
      return null;
    },
    remove(e) {
      this.write(e, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function $o(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Wo(e, t) {
  if (!t)
    return e;
  let r = e.length;
  for (; r > 0 && e.charCodeAt(r - 1) === 47; )
    r--;
  return e.slice(0, r) + "/" + t.replace(/^\/+/, "");
}
const Vo = /^https?:(?!\/\/)/i, Go = /[\t\n\r]/g;
function Jo(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function Xo(e) {
  return Jo(e).replace(Go, "");
}
function Yo(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, r, n = "") => `${r}${n}${Xt}`);
}
function Ko(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${Xt}@`), r = t.indexOf("#"), s = (r === -1 ? t : t.slice(0, r)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${Xt}`
  );
  return r === -1 ? s : `${s}#${Yo(t.slice(r + 1))}`;
}
function Sn(e, t) {
  if (typeof e == "string") {
    const r = Xo(e);
    if (Vo.test(r))
      throw new O(
        `Invalid URL ${JSON.stringify(Ko(r))}: missing "//" after protocol`,
        O.ERR_INVALID_URL,
        t
      );
  }
}
function Na(e, t, r, n) {
  Sn(t, n);
  let s = !$o(t);
  return e && (s || r === !1) ? (Sn(e, n), Wo(e, t)) : t;
}
const An = (e) => e instanceof fe ? { ...e } : e, Zo = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function Ge(e, t) {
  e = e || {}, t = t || {};
  const r = /* @__PURE__ */ Object.create(null);
  Object.defineProperty(r, "hasOwnProperty", {
    // Null-proto descriptor so a polluted Object.prototype.get cannot turn
    // this data descriptor into an accessor descriptor on the way in.
    __proto__: null,
    value: Object.prototype.hasOwnProperty,
    enumerable: !1,
    writable: !0,
    configurable: !0
  });
  function n(m, g, b, k) {
    return u.isPlainObject(m) && u.isPlainObject(g) ? u.merge.call({ caseless: k }, m, g) : u.isPlainObject(g) ? u.merge({}, g) : u.isArray(g) ? g.slice() : g;
  }
  function s(m, g, b, k) {
    if (u.isUndefined(g)) {
      if (!u.isUndefined(m))
        return n(void 0, m, b, k);
    } else return n(m, g, b, k);
  }
  function o(m, g) {
    if (!u.isUndefined(g))
      return n(void 0, g);
  }
  function l(m, g) {
    if (u.isUndefined(g)) {
      if (!u.isUndefined(m))
        return n(void 0, m);
    } else return n(void 0, g);
  }
  function c(m) {
    const g = u.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!u.isUndefined(g))
      if (u.isPlainObject(g)) {
        if (u.hasOwnProp(g, m))
          return g[m];
      } else
        return;
    const b = u.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (u.isPlainObject(b) && u.hasOwnProp(b, m))
      return b[m];
  }
  function d(m, g, b) {
    if (u.hasOwnProp(t, b))
      return n(m, g);
    if (u.hasOwnProp(e, b))
      return n(void 0, m);
  }
  const f = {
    url: o,
    method: o,
    data: o,
    baseURL: l,
    transformRequest: l,
    transformResponse: l,
    paramsSerializer: l,
    timeout: l,
    timeoutMessage: l,
    withCredentials: l,
    withXSRFToken: l,
    adapter: l,
    responseType: l,
    xsrfCookieName: l,
    xsrfHeaderName: l,
    onUploadProgress: l,
    onDownloadProgress: l,
    decompress: l,
    maxContentLength: l,
    maxBodyLength: l,
    beforeRedirect: l,
    transport: l,
    httpAgent: l,
    httpsAgent: l,
    cancelToken: l,
    socketPath: l,
    allowedSocketPaths: l,
    responseEncoding: l,
    validateStatus: d,
    headers: (m, g, b) => s(An(m), An(g), b, !0)
  };
  return u.forEach(Zo({ ...e, ...t }), function(g) {
    if (g === "__proto__" || g === "constructor" || g === "prototype") return;
    const b = u.hasOwnProp(f, g) ? f[g] : s, k = u.hasOwnProp(e, g) ? e[g] : void 0, P = u.hasOwnProp(t, g) ? t[g] : void 0, B = b(k, P, g);
    u.isUndefined(B) && b !== d || (r[g] = B);
  }), u.hasOwnProp(t, "validateStatus") && u.isUndefined(t.validateStatus) && c("validateStatusUndefinedResolves") === !1 && (u.hasOwnProp(e, "validateStatus") ? r.validateStatus = n(void 0, e.validateStatus) : delete r.validateStatus), r;
}
const Qo = ["content-type", "content-length"];
function ei(e, t, r) {
  if (r !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([n, s]) => {
    Qo.includes(n.toLowerCase()) && e.set(n, s);
  });
}
const ti = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
);
function _a(e) {
  const t = Ge({}, e), r = (b) => u.hasOwnProp(t, b) ? t[b] : void 0, n = r("data");
  let s = r("withXSRFToken");
  const o = r("xsrfHeaderName"), l = r("xsrfCookieName");
  let c = r("headers");
  const d = r("auth"), f = r("baseURL"), m = r("allowAbsoluteUrls"), g = r("url");
  if (t.headers = c = fe.from(c), t.url = ya(
    Na(f, g, m, t),
    r("params"),
    r("paramsSerializer")
  ), d) {
    const b = u.getSafeProp(d, "username") || "", k = u.getSafeProp(d, "password") || "";
    try {
      c.set(
        "Authorization",
        "Basic " + btoa(b + ":" + (k ? ti(k) : ""))
      );
    } catch (P) {
      throw O.from(P, O.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (u.isFormData(n) && (oe.hasStandardBrowserEnv || oe.hasStandardBrowserWebWorkerEnv || u.isReactNative(n) ? c.setContentType(void 0) : u.isFunction(n.getHeaders) && ei(c, n.getHeaders(), r("formDataHeaderPolicy"))), oe.hasStandardBrowserEnv && (u.isFunction(s) && (s = s(t)), s === !0 || s == null && jo(t.url))) {
    const k = o && l && qo.read(l);
    k && c.set(o, k);
  }
  return t;
}
const ri = typeof XMLHttpRequest < "u", ni = ri && function(e) {
  return new Promise(function(r, n) {
    const s = _a(e);
    let o = s.data;
    const l = fe.from(s.headers).normalize();
    let { responseType: c, onUploadProgress: d, onDownloadProgress: f } = s, m, g, b, k, P;
    function B() {
      k && k(), P && P(), s.cancelToken && s.cancelToken.unsubscribe(m), s.signal && s.signal.removeEventListener("abort", m);
    }
    let C = new XMLHttpRequest();
    C.open(s.method.toUpperCase(), s.url, !0), C.timeout = s.timeout;
    function x() {
      if (!C)
        return;
      const M = fe.from(
        "getAllResponseHeaders" in C && C.getAllResponseHeaders()
      ), h = {
        data: !c || c === "text" || c === "json" ? C.responseText : C.response,
        status: C.status,
        statusText: C.statusText,
        headers: M,
        config: e,
        request: C
      };
      wa(
        function(y) {
          r(y), B();
        },
        function(y) {
          n(y), B();
        },
        h
      ), C = null;
    }
    "onloadend" in C ? C.onloadend = x : C.onreadystatechange = function() {
      !C || C.readyState !== 4 || C.status === 0 && !(C.responseURL && C.responseURL.startsWith("file:")) || setTimeout(x);
    }, C.onabort = function() {
      C && (n(new O("Request aborted", O.ECONNABORTED, e, C)), B(), C = null);
    }, C.onerror = function(U) {
      const h = U && U.message ? U.message : "Network Error", A = new O(h, O.ERR_NETWORK, e, C);
      A.event = U || null, n(A), B(), C = null;
    }, C.ontimeout = function() {
      let U = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const h = s.transitional || Hr;
      s.timeoutErrorMessage && (U = s.timeoutErrorMessage), n(
        new O(
          U,
          h.clarifyTimeoutError ? O.ETIMEDOUT : O.ECONNABORTED,
          e,
          C
        )
      ), B(), C = null;
    }, o === void 0 && l.setContentType(null), "setRequestHeader" in C && u.forEach(fa(l), function(U, h) {
      C.setRequestHeader(h, U);
    }), u.isUndefined(s.withCredentials) || (C.withCredentials = !!s.withCredentials), c && c !== "json" && (C.responseType = s.responseType), f && ([b, P] = Yt(f, !0), C.addEventListener("progress", b)), d && C.upload && ([g, k] = Yt(d), C.upload.addEventListener("progress", g), C.upload.addEventListener("loadend", k)), (s.cancelToken || s.signal) && (m = (M) => {
      C && (n(!M || M.type ? new At(null, e, C) : M), C.abort(), B(), C = null);
    }, s.cancelToken && s.cancelToken.subscribe(m), s.signal && (s.signal.aborted ? m() : s.signal.addEventListener("abort", m)));
    const v = zo(s.url);
    if (v && !oe.protocols.includes(v)) {
      n(
        new O(
          "Unsupported protocol " + v + ":",
          O.ERR_BAD_REQUEST,
          e
        )
      ), B();
      return;
    }
    C.send(o || null);
  });
}, ai = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const r = new AbortController();
  let n = !1;
  const s = function(d) {
    if (!n) {
      n = !0, l();
      const f = d instanceof Error ? d : this.reason;
      r.abort(
        f instanceof O ? f : new At(f instanceof Error ? f.message : f)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, s(new O(`timeout of ${t}ms exceeded`, O.ETIMEDOUT));
  }, t);
  const l = () => {
    e && (o && clearTimeout(o), o = null, e.forEach((d) => {
      d.unsubscribe ? d.unsubscribe(s) : d.removeEventListener("abort", s);
    }), e = null);
  };
  e.forEach((d) => {
    if (!n) {
      if (d.aborted) {
        s.call(d);
        return;
      }
      d.addEventListener("abort", s, { once: !0 });
    }
  });
  const { signal: c } = r;
  return c.unsubscribe = () => u.asap(l), c;
}, si = function* (e, t) {
  let r = e.byteLength;
  if (r < t) {
    yield e;
    return;
  }
  let n = 0, s;
  for (; n < r; )
    s = n + t, yield e.slice(n, s), n = s;
}, oi = async function* (e, t) {
  for await (const r of ii(e))
    yield* si(r, t);
}, ii = async function* (e) {
  if (e[Symbol.asyncIterator]) {
    yield* e;
    return;
  }
  const t = e.getReader();
  try {
    for (; ; ) {
      const { done: r, value: n } = await t.read();
      if (r)
        break;
      yield n;
    }
  } finally {
    await t.cancel();
  }
}, Rn = (e, t, r, n) => {
  const s = oi(e, t);
  let o = 0, l, c = (d) => {
    l || (l = !0, n && n(d));
  };
  return new ReadableStream(
    {
      async pull(d) {
        try {
          const { done: f, value: m } = await s.next();
          if (f) {
            c(), d.close();
            return;
          }
          let g = m.byteLength;
          if (r) {
            let b = o += g;
            r(b);
          }
          d.enqueue(new Uint8Array(m));
        } catch (f) {
          throw c(f), f;
        }
      },
      cancel(d) {
        return c(d), s.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, On = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Ta = (e, t, r) => t + 2 < r && On(e.charCodeAt(t + 1)) && On(e.charCodeAt(t + 2)), vn = (e) => e <= 57 ? e - 48 : (e & 223) - 55, li = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, ci = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, ui = (e) => {
  const t = Math.floor(e / 4), r = e % 4;
  return t * 3 + (r === 2 ? 1 : r === 3 ? 2 : 0);
}, mi = (e) => {
  const t = e.length;
  let r = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (r++, t > 1 && e.charCodeAt(t - 2) === 61 && r++), Math.floor((t - r) * 3 / 4);
}, fi = (e) => {
  const t = e.length;
  let r = 0, n = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let l = e.charCodeAt(o);
    if (l === 37 && Ta(e, o, t) && (l = vn(e.charCodeAt(o + 1)) * 16 + vn(e.charCodeAt(o + 2)), o += 2), !ci(l)) {
      if (l === 61) {
        n++;
        continue;
      }
      if (!li(l) || n > 0) {
        s = !0;
        continue;
      }
      r++;
    }
  }
  return s || n > 2 || n > 0 && (r + n) % 4 !== 0 || r % 4 === 1 ? mi(e) : ui(r);
}, di = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const r = e.indexOf(",");
  if (r < 0) return 0;
  const n = e.slice(5, r), s = e.slice(r + 1);
  if (/;base64/i.test(n))
    return t(s);
  let l = 0;
  for (let c = 0, d = s.length; c < d; c++) {
    const f = s.charCodeAt(c);
    if (f === 37 && Ta(s, c, d))
      l += 1, c += 2;
    else if (f < 128)
      l += 1;
    else if (f < 2048)
      l += 2;
    else if (f >= 55296 && f <= 56319 && c + 1 < d) {
      const m = s.charCodeAt(c + 1);
      m >= 56320 && m <= 57343 ? (l += 4, c++) : l += 3;
    } else
      l += 3;
  }
  return l;
};
function pi(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return di(
    t === -1 ? e : e.slice(0, t),
    fi
  );
}
const jr = "1.19.0", kn = 64 * 1024, { isFunction: Bt } = u, hi = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
), Cn = (e) => {
  if (!u.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, Ln = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, gi = (e) => {
  const t = e.indexOf("://");
  let r = e;
  return t !== -1 && (r = r.slice(t + 3)), r.includes("@") || r.includes(":");
}, yi = (e) => {
  const t = u.global !== void 0 && u.global !== null ? u.global : globalThis, { ReadableStream: r, TextEncoder: n } = t;
  e = u.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: s, Request: o, Response: l } = e, c = s ? Bt(s) : typeof fetch == "function", d = Bt(o), f = Bt(l);
  if (!c)
    return !1;
  const m = c && Bt(r), g = c && (typeof n == "function" ? /* @__PURE__ */ ((x) => (v) => x.encode(v))(new n()) : async (x) => new Uint8Array(await new o(x).arrayBuffer())), b = d && m && Ln(() => {
    let x = !1;
    const v = new o(oe.origin, {
      body: new r(),
      method: "POST",
      get duplex() {
        return x = !0, "half";
      }
    }), M = v.headers.has("Content-Type");
    return v.body != null && v.body.cancel(), x && !M;
  }), k = f && m && Ln(() => u.isReadableStream(new l("").body)), P = {
    stream: k && ((x) => x.body)
  };
  c && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((x) => {
    !P[x] && (P[x] = (v, M) => {
      let U = v && v[x];
      if (U)
        return U.call(v);
      throw new O(
        `Response type '${x}' is not supported`,
        O.ERR_NOT_SUPPORT,
        M
      );
    });
  });
  const B = async (x) => {
    if (x == null)
      return 0;
    if (u.isBlob(x))
      return x.size;
    if (u.isSpecCompliantForm(x))
      return (await new o(oe.origin, {
        method: "POST",
        body: x
      }).arrayBuffer()).byteLength;
    if (u.isArrayBufferView(x) || u.isArrayBuffer(x))
      return x.byteLength;
    if (u.isURLSearchParams(x) && (x = x + ""), u.isString(x))
      return (await g(x)).byteLength;
  }, C = async (x, v) => {
    const M = u.toFiniteNumber(x.getContentLength());
    return M ?? B(v);
  };
  return async (x) => {
    let {
      url: v,
      method: M,
      data: U,
      signal: h,
      cancelToken: A,
      timeout: y,
      onDownloadProgress: H,
      onUploadProgress: F,
      responseType: q,
      headers: J,
      withCredentials: T = "same-origin",
      fetchOptions: _,
      maxContentLength: N,
      maxBodyLength: S
    } = _a(x);
    const Ae = u.isNumber(N) && N > -1, Fe = u.isNumber(S) && S > -1, Rt = (G) => u.hasOwnProp(x, G) ? x[G] : void 0;
    let Ot = s || fetch;
    q = q ? (q + "").toLowerCase() : "text";
    let Re = ai(
      [h, A && A.toAbortSignal()],
      y
    ), te = null;
    const V = Re && Re.unsubscribe && (() => {
      Re.unsubscribe();
    });
    let Ce, ze = null;
    const vt = () => new O(
      "Request body larger than maxBodyLength limit",
      O.ERR_BAD_REQUEST,
      x,
      te
    );
    try {
      let G;
      const he = Rt("auth");
      if (he) {
        const L = u.getSafeProp(he, "username") || "", re = u.getSafeProp(he, "password") || "";
        G = {
          username: L,
          password: re
        };
      }
      if (gi(v)) {
        const L = new URL(v, oe.origin);
        if (!G && (L.username || L.password)) {
          const re = Cn(L.username), Ne = Cn(L.password);
          G = {
            username: re,
            password: Ne
          };
        }
        (L.username || L.password) && (L.username = "", L.password = "", v = L.href);
      }
      if (G && (J.delete("authorization"), J.set(
        "Authorization",
        "Basic " + btoa(hi((G.username || "") + ":" + (G.password || "")))
      )), Ae && typeof v == "string" && v.startsWith("data:") && pi(v) > N)
        throw new O(
          "maxContentLength size of " + N + " exceeded",
          O.ERR_BAD_RESPONSE,
          x,
          te
        );
      if (Fe && M !== "get" && M !== "head") {
        const L = await B(U);
        if (typeof L == "number" && isFinite(L) && (Ce = L, L > S))
          throw vt();
      }
      const Ye = Fe && (u.isReadableStream(U) || u.isStream(U)), mt = (L, re, Ne) => Rn(
        L,
        kn,
        (ce) => {
          if (Fe && ce > S)
            throw ze = vt();
          re && re(ce);
        },
        Ne
      );
      if (b && M !== "get" && M !== "head" && (F || Ye)) {
        if (Ce = Ce ?? await C(J, U), Ce !== 0 || Ye) {
          let L = new o(v, {
            method: "POST",
            body: U,
            duplex: "half"
          }), re;
          if (u.isFormData(U) && (re = L.headers.get("content-type")) && J.setContentType(re), L.body) {
            const [Ne, ce] = F && _n(
              Ce,
              Yt(Tn(F))
            ) || [];
            U = mt(L.body, Ne, ce);
          }
        }
      } else if (Ye && !d && m && M !== "get" && M !== "head")
        U = mt(U);
      else if (Ye && d && !b && M !== "get" && M !== "head")
        throw new O(
          "Stream request bodies are not supported by the current fetch implementation",
          O.ERR_NOT_SUPPORT,
          x,
          te
        );
      u.isString(T) || (T = T ? "include" : "omit");
      const nr = d && "credentials" in o.prototype;
      if (u.isFormData(U)) {
        const L = J.getContentType();
        L && /^multipart\/form-data/i.test(L) && !/boundary=/i.test(L) && J.delete("content-type");
      }
      J.set("User-Agent", "axios/" + jr, !1);
      const ft = {
        ..._,
        signal: Re,
        method: M.toUpperCase(),
        headers: fa(J.normalize()),
        body: U,
        duplex: "half",
        credentials: nr ? T : void 0
      };
      te = d && new o(v, ft);
      let $ = await (d ? Ot(te, _) : Ot(v, ft));
      const Ke = fe.from($.headers);
      if (Ae) {
        const L = u.toFiniteNumber(Ke.getContentLength());
        if (L != null && L > N)
          throw new O(
            "maxContentLength size of " + N + " exceeded",
            O.ERR_BAD_RESPONSE,
            x,
            te
          );
      }
      const X = k && (q === "stream" || q === "response");
      if (k && $.body && (H || Ae || X && V)) {
        const L = {};
        ["status", "statusText", "headers"].forEach((Le) => {
          L[Le] = $[Le];
        });
        const re = u.toFiniteNumber(Ke.getContentLength()), [Ne, ce] = H && _n(
          re,
          Yt(Tn(H), !0)
        ) || [];
        let dt = 0;
        const pt = (Le) => {
          if (Ae && (dt = Le, dt > N))
            throw new O(
              "maxContentLength size of " + N + " exceeded",
              O.ERR_BAD_RESPONSE,
              x,
              te
            );
          Ne && Ne(Le);
        };
        $ = new l(
          Rn($.body, kn, pt, () => {
            ce && ce(), V && V();
          }),
          L
        );
      }
      q = q || "text";
      let be = await P[u.findKey(P, q) || "text"](
        $,
        x
      );
      if (Ae && !k && !X) {
        let L;
        if (be != null && (typeof be.byteLength == "number" ? L = be.byteLength : typeof be.size == "number" ? L = be.size : typeof be == "string" && (L = typeof n == "function" ? new n().encode(be).byteLength : be.length)), typeof L == "number" && L > N)
          throw new O(
            "maxContentLength size of " + N + " exceeded",
            O.ERR_BAD_RESPONSE,
            x,
            te
          );
      }
      return !X && V && V(), await new Promise((L, re) => {
        wa(L, re, {
          data: be,
          headers: fe.from($.headers),
          status: $.status,
          statusText: $.statusText,
          config: x,
          request: te
        });
      });
    } catch (G) {
      if (V && V(), Re && Re.aborted && Re.reason instanceof O) {
        const he = Re.reason;
        throw he.config = x, te && (he.request = te), G !== he && Object.defineProperty(he, "cause", {
          __proto__: null,
          value: G,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), he;
      }
      if (ze)
        throw te && !ze.request && (ze.request = te), ze;
      if (G instanceof O)
        throw te && !G.request && (G.request = te), G;
      if (G && G.name === "TypeError" && /Load failed|fetch/i.test(G.message)) {
        const he = new O(
          "Network Error",
          O.ERR_NETWORK,
          x,
          te,
          G && G.response
        );
        throw Object.defineProperty(he, "cause", {
          __proto__: null,
          value: G.cause || G,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), he;
      }
      throw O.from(G, G && G.code, x, te, G && G.response);
    }
  };
}, Ei = /* @__PURE__ */ new Map(), Sa = (e) => {
  let t = e && e.env || {};
  const { fetch: r, Request: n, Response: s } = t, o = [n, s, r];
  let l = o.length, c = l, d, f, m = Ei;
  for (; c--; )
    d = o[c], f = m.get(d), f === void 0 && m.set(d, f = c ? /* @__PURE__ */ new Map() : yi(t)), m = f;
  return f;
};
Sa();
const qr = {
  http: _o,
  xhr: ni,
  fetch: {
    get: Sa
  }
};
u.forEach(qr, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const Dn = (e) => `- ${e}`, bi = (e) => u.isFunction(e) || e === null || e === !1;
function xi(e, t) {
  e = u.isArray(e) ? e : [e];
  const { length: r } = e;
  let n, s;
  const o = {};
  for (let l = 0; l < r; l++) {
    n = e[l];
    let c;
    if (s = n, !bi(n) && (s = qr[(c = String(n)).toLowerCase()], s === void 0))
      throw new O(`Unknown adapter '${c}'`);
    if (s && (u.isFunction(s) || (s = s.get(t))))
      break;
    o[c || "#" + l] = s;
  }
  if (!s) {
    const l = Object.entries(o).map(
      ([d, f]) => `adapter ${d} ` + (f === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let c = r ? l.length > 1 ? `since :
` + l.map(Dn).join(`
`) : " " + Dn(l[0]) : "as no adapter specified";
    throw new O(
      "There is no suitable adapter to dispatch the request " + c,
      O.ERR_NOT_SUPPORT
    );
  }
  return s;
}
const Aa = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: xi,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: qr
};
function wr(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new At(null, e);
}
function Nr(e) {
  return wr(e), e.headers = fe.from(e.headers), e.data = xr.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Aa.getAdapter(e.adapter || St.adapter, e)(e).then(
    function(n) {
      wr(e), e.response = n;
      try {
        n.data = xr.call(e, e.transformResponse, n);
      } finally {
        delete e.response;
      }
      return n.headers = fe.from(n.headers), n;
    },
    function(n) {
      if (!xa(n) && (wr(e), n && n.response)) {
        e.response = n.response;
        try {
          n.response.data = xr.call(
            e,
            e.transformResponse,
            n.response
          );
        } finally {
          delete e.response;
        }
        n.response.headers = fe.from(n.response.headers);
      }
      return Promise.reject(n);
    }
  );
}
const tr = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  tr[e] = function(n) {
    return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const Pn = {};
tr.transitional = function(t, r, n) {
  function s(o, l) {
    return "[Axios v" + jr + "] Transitional option '" + o + "'" + l + (n ? ". " + n : "");
  }
  return (o, l, c) => {
    if (t === !1)
      throw new O(
        s(l, " has been removed" + (r ? " in " + r : "")),
        O.ERR_DEPRECATED
      );
    return r && !Pn[l] && (Pn[l] = !0, console.warn(
      s(
        l,
        " has been deprecated since v" + r + " and will be removed in the near future"
      )
    )), t ? t(o, l, c) : !0;
  };
};
tr.spelling = function(t) {
  return (r, n) => (console.warn(`${n} is likely a misspelling of ${t}`), !0);
};
function wi(e, t, r) {
  if (typeof e != "object" || e === null)
    throw new O("options must be an object", O.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let s = n.length;
  for (; s-- > 0; ) {
    const o = n[s], l = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (l) {
      const c = e[o], d = c === void 0 || l(c, o, e);
      if (d !== !0)
        throw new O(
          "option " + o + " must be " + d,
          O.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (r !== !0)
      throw new O("Unknown option " + o, O.ERR_BAD_OPTION);
  }
}
const Vt = {
  assertOptions: wi,
  validators: tr
}, ue = Vt.validators;
let $e = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new wn(),
      response: new wn()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(t, r) {
    try {
      return await this._request(t, r);
    } catch (n) {
      if (n instanceof Error) {
        let s = {};
        Error.captureStackTrace ? Error.captureStackTrace(s) : s = new Error();
        const o = (() => {
          if (!s.stack)
            return "";
          const l = s.stack.indexOf(`
`);
          return l === -1 ? "" : s.stack.slice(l + 1);
        })();
        try {
          if (!n.stack)
            n.stack = o;
          else if (o) {
            const l = o.indexOf(`
`), c = l === -1 ? -1 : o.indexOf(`
`, l + 1), d = c === -1 ? "" : o.slice(c + 1);
            String(n.stack).endsWith(d) || (n.stack += `
` + o);
          }
        } catch {
        }
      }
      throw n;
    }
  }
  _request(t, r) {
    typeof t == "string" ? (r = r || {}, r.url = t) : r = t || {}, r = Ge(this.defaults, r);
    const { transitional: n, paramsSerializer: s, headers: o } = r;
    n !== void 0 && Vt.assertOptions(
      n,
      {
        silentJSONParsing: ue.transitional(ue.boolean),
        forcedJSONParsing: ue.transitional(ue.boolean),
        clarifyTimeoutError: ue.transitional(ue.boolean),
        legacyInterceptorReqResOrdering: ue.transitional(ue.boolean),
        advertiseZstdAcceptEncoding: ue.transitional(ue.boolean),
        validateStatusUndefinedResolves: ue.transitional(ue.boolean)
      },
      !1
    ), s != null && (u.isFunction(s) ? r.paramsSerializer = {
      serialize: s
    } : Vt.assertOptions(
      s,
      {
        encode: ue.function,
        serialize: ue.function
      },
      !0
    )), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), Vt.assertOptions(
      r,
      {
        baseUrl: ue.spelling("baseURL"),
        withXsrfToken: ue.spelling("withXSRFToken")
      },
      !0
    ), r.method = (r.method || this.defaults.method || "get").toLowerCase();
    let l = o && u.merge(o.common, o[r.method]);
    o && u.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (P) => {
      delete o[P];
    }), r.headers = fe.concat(l, o);
    const c = [];
    let d = !0;
    this.interceptors.request.forEach(function(B) {
      if (typeof B.runWhen == "function" && B.runWhen(r) === !1)
        return;
      d = d && B.synchronous;
      const C = r.transitional || Hr;
      C && C.legacyInterceptorReqResOrdering ? c.unshift(B.fulfilled, B.rejected) : c.push(B.fulfilled, B.rejected);
    });
    const f = [];
    this.interceptors.response.forEach(function(B) {
      f.push(B.fulfilled, B.rejected);
    });
    let m, g = 0, b;
    if (!d) {
      const P = [Nr.bind(this), void 0];
      for (P.unshift(...c), P.push(...f), b = P.length, m = Promise.resolve(r); g < b; )
        m = m.then(P[g++], P[g++]);
      return m;
    }
    b = c.length;
    let k = r;
    for (; g < b; ) {
      const P = c[g++], B = c[g++];
      try {
        k = P ? P(k) : k;
      } catch (C) {
        if (!B) {
          m = Promise.reject(C);
          break;
        }
        try {
          const x = B.call(this, C);
          u.isThenable(x) && (m = Promise.resolve(x).then(
            () => Nr.call(this, k)
          ));
        } catch (x) {
          m = Promise.reject(x);
        }
        break;
      }
    }
    if (!m)
      try {
        m = Nr.call(this, k);
      } catch (P) {
        m = Promise.reject(P);
      }
    for (g = 0, b = f.length; g < b; )
      m = m.then(f[g++], f[g++]);
    return m;
  }
  getUri(t) {
    t = Ge(this.defaults, t);
    const r = Na(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return ya(r, t.params, t.paramsSerializer);
  }
};
u.forEach(["delete", "get", "head", "options"], function(t) {
  $e.prototype[t] = function(r, n) {
    return this.request(
      Ge(n || {}, {
        method: t,
        url: r,
        data: n && u.hasOwnProp(n, "data") ? n.data : void 0
      })
    );
  };
});
u.forEach(["post", "put", "patch", "query"], function(t) {
  function r(n) {
    return function(o, l, c) {
      return this.request(
        Ge(c || {}, {
          method: t,
          headers: n ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: o,
          data: l
        })
      );
    };
  }
  $e.prototype[t] = r(), t !== "query" && ($e.prototype[t + "Form"] = r(!0));
});
let Ni = class Ra {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let r;
    this.promise = new Promise(function(o) {
      r = o;
    });
    const n = this;
    this.promise.then((s) => {
      if (!n._listeners) return;
      let o = n._listeners.length;
      for (; o-- > 0; )
        n._listeners[o](s);
      n._listeners = null;
    }), this.promise.then = (s) => {
      let o;
      const l = new Promise((c) => {
        n.subscribe(c), o = c;
      }).then(s);
      return l.cancel = function() {
        n.unsubscribe(o);
      }, l;
    }, t(function(o, l, c) {
      n.reason || (n.reason = new At(o, l, c), r(n.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(t) {
    if (this.reason) {
      t(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(t) : this._listeners = [t];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(t) {
    if (!this._listeners)
      return;
    const r = this._listeners.indexOf(t);
    r !== -1 && this._listeners.splice(r, 1);
  }
  toAbortSignal() {
    const t = new AbortController(), r = (n) => {
      t.abort(n);
    };
    return this.subscribe(r), t.signal.unsubscribe = () => this.unsubscribe(r), t.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let t;
    return {
      token: new Ra(function(s) {
        t = s;
      }),
      cancel: t
    };
  }
};
function _i(e) {
  return function(r) {
    return e.apply(null, r);
  };
}
function Ti(e) {
  return u.isObject(e) && e.isAxiosError === !0;
}
const Lr = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerReturnsAnUnknownError: 520,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(Lr).forEach(([e, t]) => {
  Lr[t] = e;
});
function Oa(e) {
  const t = new $e(e), r = na($e.prototype.request, t);
  return u.extend(r, $e.prototype, t, { allOwnKeys: !0 }), u.extend(r, t, null, { allOwnKeys: !0 }), r.create = function(s) {
    return Oa(Ge(e, s));
  }, r;
}
const Q = Oa(St);
Q.Axios = $e;
Q.CanceledError = At;
Q.CancelToken = Ni;
Q.isCancel = xa;
Q.VERSION = jr;
Q.toFormData = er;
Q.AxiosError = O;
Q.Cancel = Q.CanceledError;
Q.all = function(t) {
  return Promise.all(t);
};
Q.spread = _i;
Q.isAxiosError = Ti;
Q.mergeConfig = Ge;
Q.AxiosHeaders = fe;
Q.formToJSON = (e) => ba(u.isHTMLForm(e) ? new FormData(e) : e);
Q.getAdapter = Aa.getAdapter;
Q.HttpStatusCode = Lr;
Q.default = Q;
const {
  Axios: Ul,
  AxiosError: Fl,
  CanceledError: zl,
  isCancel: Hl,
  CancelToken: Bl,
  VERSION: jl,
  all: ql,
  Cancel: $l,
  isAxiosError: Wl,
  spread: Vl,
  toFormData: Gl,
  AxiosHeaders: Jl,
  HttpStatusCode: Xl,
  formToJSON: Yl,
  getAdapter: Kl,
  mergeConfig: Zl,
  create: Ql
} = Q, Te = Q.create({ baseURL: "/api", withCredentials: !0 });
Te.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const Si = {
  "your homepage displays": "首页显示",
  "your latest posts": "你的最新文章",
  "a static page": "一个静态页面",
  homepage: "首页",
  "select a page": "选择页面",
  home: "首页",
  search: "搜索",
  about: "关于",
  register: "注册",
  admin: "管理后台",
  "site title": "站点标题",
  "search posts": "搜索文章",
  "search placeholder": "搜索文章...",
  "recent posts": "最近文章",
  "popular posts": "热门文章",
  "tag cloud": "标签云",
  archives: "归档",
  categories: "分类",
  "no categories yet": "暂无分类",
  "no posts yet": "暂无文章",
  "check back later for new content": "请稍后再来查看新内容",
  "read more": "阅读更多 →",
  "page not found": "页面未找到",
  "the page you are looking for might have been removed or is temporarily unavailable": "您访问的页面可能已被移除或暂时不可用",
  "back to home": "返回首页",
  "search results": "搜索结果",
  "showing results for": "正在显示",
  "enter a search term": "输入搜索词",
  searching: "搜索中...",
  "no results for": "没有找到",
  "try different keywords": "尝试其他关键词",
  "browse all posts": "浏览全部文章",
  "related posts": "相关文章",
  "no related posts": "暂无相关文章",
  comments: "评论",
  "no comments yet": "暂无评论",
  "notify me of replies": "有人回复时通过邮件通知我",
  "be the first to share your thoughts": "成为第一个评论的人",
  "leave a comment": "发表评论",
  name: "姓名",
  email: "邮箱",
  "your comment": "你的评论",
  "submit comment": "提交评论",
  "comment submitted and pending review": "评论已提交,等待审核",
  password: "密码",
  "password protected": "密码保护",
  "log in": "登录",
  checking: "验证中",
  "wrong password, please try again": "密码错误，请重试",
  "log in to view this page": "请登录后查看此页面",
  "this page is private": "此页面为私密",
  "enter the password to view this post": "输入密码查看这篇文章",
  "enter password": "输入密码",
  "all posts": "全部文章",
  back: "返回",
  "read in": "阅读",
  words: "字",
  "min read": "分钟阅读",
  "written by": "作者",
  share: "分享",
  "copy link": "复制链接",
  "link copied to clipboard": "链接已复制",
  "view all posts": "查看全部文章",
  posts: "文章",
  navigate: "导航",
  "rss feed": "RSS 订阅",
  "powered by": "由",
  "all rights reserved": "版权所有",
  "this site uses cookies to improve your experience": "本站使用 Cookie 以改善体验",
  accept: "接受",
  "privacy policy": "隐私政策",
  archive: "归档",
  "no posts in this month": "该月暂无文章",
  author: "作者",
  "no results": "无结果",
  created: "创建于",
  updated: "更新于",
  "back to top": "回到顶部",
  "continue reading": "继续阅读",
  "recent posts widget": "最近文章",
  previous: "上一页",
  next: "下一页",
  page: "第",
  of: "页,共",
  loading: "加载中...",
  "failed to load posts": "文章加载失败",
  "failed to load archive": "归档加载失败",
  "failed to load": "加载失败",
  "please try again later": "请稍后再试",
  views: "次浏览",
  sticky: "置顶",
  all: "全部",
  tag: "标签",
  category: "分类",
  links: "友情链接",
  featured: "精选",
  "switch language": "切换语言",
  "username must be at least 3 characters": "用户名至少需要 3 个字符",
  "enter a valid email address": "请输入有效的邮箱地址",
  "password strength": "密码强度",
  "confirm new password": "确认新密码",
  "name and email are required to comment": "填写昵称和邮箱后才能评论",
  "comment failed": "评论提交失败，请稍后重试",
  "table of contents": "目录"
};
function E(e, t) {
  if (t != null && t.translations_override)
    try {
      const s = JSON.parse(t.translations_override)[e];
      if (typeof s == "string" && s) return s;
    } catch {
    }
  return (localStorage.getItem("mortar_lang") || (t == null ? void 0 : t.site_lang) || "en") === "zh" && Si[e] || e;
}
function Ai(e) {
  return localStorage.getItem("mortar_lang") || (e == null ? void 0 : e.site_lang) || "en";
}
function Ri(e) {
  localStorage.setItem("mortar_lang", e), window.location.reload();
}
function Oi({ settings: e }) {
  const [t, r] = pe([]), [n, s] = pe(!1), [o, l] = pe(null);
  Se(() => {
    Te.get("/menus/location/primary").then((m) => r(m.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && Te.get("/auth/me").then((m) => l(m.data)).catch(() => localStorage.removeItem("mortar_token"));
  }, []);
  function c() {
    Te.post("/auth/logout").catch(() => {
    }), localStorage.removeItem("mortar_token"), window.location.href = "/";
  }
  const d = (m) => t.filter((g) => (g.parentId || null) === m && !(g.url === "/" && (g.label.toLowerCase() === "home" || g.label === E("home", e)))), f = (m) => {
    const g = d(m.id);
    return g.length === 0 ? a.createElement(z, { key: m.id, to: m.url, className: "text-sm text-gray-600 hover:text-gray-900" }, m.label) : a.createElement(
      "div",
      { key: m.id, className: "relative group" },
      a.createElement(z, { to: m.url, className: "text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1" }, m.label, a.createElement("span", { className: "text-[9px]" }, "▾")),
      a.createElement(
        "div",
        { className: "absolute left-0 top-full pt-2 hidden group-hover:block z-50" },
        a.createElement(
          "div",
          { className: "bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]" },
          g.map((b) => a.createElement(z, { key: b.id, to: b.url, className: "block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900" }, b.label))
        )
      )
    );
  };
  return a.createElement(
    "header",
    { className: "bg-white border-b border-gray-200 sticky top-0 z-40" },
    a.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 h-16 flex items-center justify-between" },
      a.createElement(z, { to: "/", className: "text-xl font-bold text-gray-900 tracking-tight" }, e.site_title || "Mortar"),
      a.createElement(
        "div",
        { className: "hidden md:flex items-center gap-6" },
        a.createElement(z, { to: "/", className: "text-sm text-gray-600 hover:text-gray-900" }, E("home", e)),
        d(null).map(f),
        o ? a.createElement(
          "div",
          { className: "flex items-center gap-2" },
          a.createElement("span", { className: "text-sm text-gray-600" }, o.username),
          a.createElement("button", { onClick: c, className: "text-sm text-gray-400 hover:text-gray-600" }, E("logout"))
        ) : a.createElement(
          a.Fragment,
          null,
          a.createElement(z, { to: "/login", className: "text-sm text-gray-600 hover:text-gray-900" }, E("sign in")),
          a.createElement(z, { to: "/register", className: "text-sm text-gray-600 hover:text-gray-900" }, E("register", e))
        ),
        a.createElement("a", { href: "/admin", className: "text-sm text-primary-600 hover:text-primary-700 font-medium" }, E("admin", e))
      ),
      a.createElement(
        "div",
        { className: "flex items-center gap-3 md:hidden" },
        a.createElement("button", { onClick: () => s(!n), className: "p-2 text-gray-600" }, n ? a.createElement(ds, { size: 20 }) : a.createElement(us, { size: 20 }))
      )
    ),
    n && a.createElement(
      "div",
      { className: "md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1" },
      a.createElement(z, { to: "/", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, E("home", e)),
      (() => {
        const m = [], g = (b, k) => {
          t.filter((P) => (P.parentId || null) === b && !(P.url === "/" && (P.label.toLowerCase() === "home" || P.label === E("home", e)))).forEach((P) => {
            m.push(a.createElement(z, { key: P.id, to: P.url, className: "block text-sm text-gray-600 py-1", style: { paddingLeft: 8 + k * 14 }, onClick: () => s(!1) }, P.label)), g(P.id, k + 1);
          });
        };
        return g(null, 0), m;
      })(),
      o ? a.createElement(
        a.Fragment,
        null,
        a.createElement("span", { className: "block text-sm text-gray-600 py-1" }, o.username),
        a.createElement("button", { onClick: c, className: "block text-sm text-gray-400 py-1" }, E("logout"))
      ) : a.createElement(z, { to: "/login", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, E("sign in")),
      a.createElement(z, { to: "/register", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, E("register", e)),
      a.createElement("a", { href: "/admin", className: "block text-sm text-primary-600 font-medium py-1" }, E("admin", e))
    )
  );
}
function vi({ settings: e }) {
  const t = Ai(e);
  return a.createElement(
    "footer",
    { className: "bg-gray-50 border-t border-gray-200 mt-16" },
    a.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-8" },
      a.createElement(
        "div",
        { className: "grid grid-cols-2 md:grid-cols-4 gap-6 mb-6" },
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, E("navigate", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement(z, { to: "/", className: "text-sm text-gray-500 hover:text-gray-700" }, E("home", e))),
            a.createElement("li", null, a.createElement(z, { to: "/search", className: "text-sm text-gray-500 hover:text-gray-700" }, E("search", e))),
            a.createElement("li", null, a.createElement("a", { href: "/api/feed/rss", className: "text-sm text-gray-500 hover:text-gray-700" }, E("rss feed", e)))
          )
        ),
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, E("about", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement(z, { to: "/page/about", className: "text-sm text-gray-500 hover:text-gray-700" }, E("about", e))),
            a.createElement("li", null, a.createElement(z, { to: "/page/" + ((e == null ? void 0 : e.privacy_policy_slug) || "privacy-policy"), className: "text-sm text-gray-500 hover:text-gray-700" }, E("privacy policy", e)))
          )
        ),
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, E("admin", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement("a", { href: "/admin", className: "text-sm text-gray-500 hover:text-gray-700" }, E("dashboard", e))),
            a.createElement("li", null, a.createElement("a", { href: "/admin#/posts", className: "text-sm text-gray-500 hover:text-gray-700" }, E("posts", e)))
          )
        ),
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, E("connect", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement("a", { href: "/api/feed/rss", target: "_blank", className: "text-sm text-gray-500 hover:text-gray-700" }, E("rss feed", e))),
            a.createElement("li", null, a.createElement("a", { href: "/api/sitemap.xml", target: "_blank", className: "text-sm text-gray-500 hover:text-gray-700" }, E("sitemap", e)))
          )
        )
      ),
      a.createElement(
        "div",
        { className: "pt-6 border-t border-gray-200 flex items-center justify-center gap-4 flex-wrap" },
        a.createElement(
          "p",
          { className: "text-sm text-gray-500" },
          "© " + (/* @__PURE__ */ new Date()).getFullYear() + " " + (e.site_title || "Mortar CMS") + ". " + E("powered by", e) + " Mortar. ",
          a.createElement("a", { href: "/api/feed/rss", className: "text-primary-600 hover:text-primary-700", target: "_blank" }, E("rss feed", e))
        ),
        a.createElement("button", {
          onClick: () => Ri(t === "zh" ? "en" : "zh"),
          className: "text-xs px-2 py-1 rounded border border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors",
          "aria-label": E("switch language", e)
        }, t === "zh" ? "EN" : "中文")
      )
    )
  );
}
function $r() {
  const [e, t] = pe([]);
  if (Se(() => {
    Te.get("/tags").then((n) => t(n.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const r = Math.max(...e.map((n) => {
    var s;
    return ((s = n._count) == null ? void 0 : s.posts) || 0;
  }), 1);
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("tag cloud")),
    a.createElement(
      "div",
      { className: "flex flex-wrap gap-1.5" },
      e.map((n) => {
        var o, l, c;
        const s = 0.65 + (((o = n._count) == null ? void 0 : o.posts) || 0) / r * 0.35;
        return a.createElement(z, {
          key: n.id,
          to: "/tag/" + n.slug,
          className: "inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors",
          style: { fontSize: s + "rem" },
          title: (((l = n._count) == null ? void 0 : l.posts) || 0) + " " + E("posts")
        }, n.name + " (" + (((c = n._count) == null ? void 0 : c.posts) || 0) + ")");
      })
    )
  );
}
function Wr() {
  const [e, t] = pe([]);
  return Se(() => {
    Te.get("/posts?limit=5").then((r) => t(r.data.posts || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("recent posts")),
    a.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((r) => a.createElement(
        "li",
        { key: r.id },
        a.createElement(z, { to: "/post/" + r.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, r.title)
      ))
    )
  );
}
function Vr() {
  const [e, t] = pe([]);
  return Se(() => {
    Te.get("/posts/popular?limit=5").then((r) => t(r.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, a.createElement(fs, { size: 14 }), E("popular posts")),
    a.createElement(
      "ul",
      { className: "space-y-2" },
      e.map(
        (r, n) => a.createElement(
          "li",
          { key: r.id, className: "flex items-start gap-2" },
          a.createElement("span", { className: "text-xs font-bold text-gray-300 mt-0.5 w-4" }, n + 1),
          a.createElement(z, { to: "/post/" + r.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, r.title),
          r.views > 0 && a.createElement("span", { className: "text-xs text-gray-400 ml-auto shrink-0" }, r.views + " " + E("views"))
        )
      )
    )
  );
}
function Gr() {
  const [e, t] = pe([]);
  if (Se(() => {
    Te.get("/posts/archives").then((n) => t(n.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const r = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("archives")),
    a.createElement(
      "ul",
      { className: "space-y-1" },
      e.map((n) => {
        const [s, o] = n.month.split("-");
        return a.createElement(
          "li",
          { key: n.month },
          a.createElement(
            z,
            { to: "/archive/" + s + "/" + o, className: "text-sm text-gray-600 hover:text-primary-600" },
            r[parseInt(o) - 1] + " " + s + " (" + n.count + ")"
          )
        );
      })
    )
  );
}
function Jr() {
  const [e, t] = pe(""), [r, n] = pe([]), [s, o] = pe(!1), [l, c] = pe(!1), d = Za(), f = Ir(null);
  Se(() => {
    const b = e.trim();
    if (b.length < 2) {
      n([]), o(!1);
      return;
    }
    c(!0);
    const k = setTimeout(() => {
      Te.get("/posts/suggest", { params: { q: b } }).then((P) => {
        var B;
        n(((B = P.data) == null ? void 0 : B.suggestions) || []), o(!0);
      }).catch(() => {
        n([]);
      }).finally(() => c(!1));
    }, 250);
    return () => clearTimeout(k);
  }, [e]), Se(() => {
    const b = (k) => {
      f.current && !f.current.contains(k.target) && o(!1);
    };
    return document.addEventListener("mousedown", b), () => document.removeEventListener("mousedown", b);
  }, []);
  const m = (b) => {
    b.preventDefault(), e.trim() && d("/search?q=" + encodeURIComponent(e.trim()));
  }, g = (b) => {
    o(!1), d("/" + b.type + "/" + b.slug);
  };
  return a.createElement(
    "div",
    { ref: f, className: "rounded-lg border border-gray-200 p-4 relative" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("search")),
    a.createElement(
      "form",
      { onSubmit: m, className: "flex gap-2" },
      a.createElement("input", {
        type: "text",
        value: e,
        onChange: (b) => t(b.target.value),
        onFocus: () => {
          r.length > 0 && o(!0);
        },
        placeholder: E("search placeholder"),
        "aria-label": E("search posts"),
        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      }),
      a.createElement("button", {
        type: "submit",
        className: "px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      }, a.createElement(ra, { size: 16 }))
    ),
    // Suggestions dropdown
    s && r.length > 0 && a.createElement(
      "div",
      { className: "absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden" },
      r.map(
        (b) => a.createElement(
          "button",
          {
            key: b.id,
            type: "button",
            onMouseDown: (k) => {
              k.preventDefault(), g(b);
            },
            className: "w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          },
          a.createElement(b.type === "page" ? os : ss, { size: 14, className: "text-gray-400 shrink-0" }),
          a.createElement("span", { className: "text-sm text-gray-800 dark:text-gray-100 truncate" }, b.title),
          a.createElement("span", { className: "ml-auto text-[10px] uppercase text-gray-400 shrink-0" }, b.type)
        )
      )
    ),
    s && l && r.length === 0 && a.createElement("div", { className: "absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 px-3 py-2 text-xs text-gray-400" }, E("searching") + "…")
  );
}
function Xr() {
  const [e, t] = pe([]);
  return Se(() => {
    Te.get("/links").then((r) => t(r.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("links")),
    a.createElement(
      "ul",
      { className: "space-y-1.5" },
      e.map(
        (r) => a.createElement(
          "li",
          { key: r.id },
          a.createElement(
            "a",
            { href: r.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600" },
            r.avatar ? a.createElement("img", { src: r.avatar, alt: "", className: "w-5 h-5 rounded-full object-cover" }) : null,
            a.createElement("span", { className: "truncate" }, r.name)
          )
        )
      )
    )
  );
}
function va(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function lt(e, t) {
  if (!e) return;
  const r = va(t.cdn_url);
  return r && e.startsWith("/uploads/") ? r + e : e;
}
function ki(e, t) {
  let r = e;
  const n = va(t.cdn_url);
  return n && (r = r.replace(/(src|href|data-src|poster)="\/uploads\//g, '$1="' + n + "/uploads/")), r.replace(/<img(?![^>]*loading=)[^>]*>/g, (s) => s.replace(/<img/, '<img loading="lazy"'));
}
function Xe(e) {
  const t = Date.now(), r = new Date(e).getTime(), n = t - r, s = Math.floor(n / 6e4);
  if (s < 1) return "just now";
  if (s < 60) return `${s}m ago`;
  const o = Math.floor(s / 60);
  if (o < 24) return `${o}h ago`;
  const l = Math.floor(o / 24);
  if (l < 7) return `${l}d ago`;
  const c = Math.floor(l / 7);
  return c < 5 ? `${c}w ago` : new Date(e).toLocaleDateString();
}
function rr(e) {
  const t = (e || "").replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(t / 200)) + " min read";
}
function Ci(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function Li(e) {
  const { settings: t, posts: r, total: n, page: s, setPage: o, loadError: l, catSlug: c, isTagPage: d, categories: f } = e;
  return a.createElement(
    "div",
    null,
    c && a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-12 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, (d ? E("tag", t) + ": " : "") + (c || "").replace(/-/g, " "))
    ),
    a.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-8" },
      a.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" + (t.theme_sidebar_position === "left" ? " [direction:rtl] [&>*]:[direction:ltr]" : "") },
        a.createElement(
          "div",
          { className: "lg:col-span-2" },
          r.length === 0 ? l ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-8" },
            r.map((m) => {
              var g, b, k;
              return a.createElement(
                "article",
                { key: m.id, className: "pb-8 border-b border-gray-100 last:border-0" },
                m.featured && a.createElement("img", {
                  src: lt(m.featured, t),
                  alt: m.title,
                  className: "w-full h-48 object-cover rounded-lg mb-4",
                  loading: "lazy",
                  decoding: "async",
                  sizes: "(min-width: 900px) 512px, 100vw",
                  srcSet: m.srcset ? Object.entries(m.srcset).map(([P, B]) => lt(B, t) + " " + P + "w").join(", ") : void 0
                }),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-3" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(m.publishedAt || m.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Mr, { size: 12 }), a.createElement(z, { to: "/author/" + (((g = m.author) == null ? void 0 : g.username) || ""), className: "hover:text-primary-600" }, (b = m.author) == null ? void 0 : b.username)),
                  ((k = m.categories) == null ? void 0 : k[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 12 }), m.categories[0].name)
                ),
                a.createElement(
                  z,
                  { to: "/post/" + m.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-2" }, m.format && m.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, Ci(m.format), m.format.charAt(0).toUpperCase() + m.format.slice(1)) : null, m.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + E("featured", t)) : null, m.title)
                ),
                m.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, m.excerpt),
                a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, rr(m.content)),
                m.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, a.createElement(Zt, { size: 12 }), "" + m.commentCount),
                a.createElement(z, { to: "/post/" + m.slug, className: "inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700" }, E("read more", t))
              );
            })
          ),
          n > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + E("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, E("page", t) + " " + s + " " + E("of", t) + " " + Math.ceil(n / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= n, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, E("next", t) + " →")
          )
        ),
        a.createElement(
          "aside",
          { className: "space-y-6" },
          (() => {
            var k;
            const m = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), g = (() => {
              try {
                return JSON.parse(t.widgets_config || "{}");
              } catch {
                return {};
              }
            })(), b = (P) => m.length === 0 || m.includes(P);
            return a.createElement(
              a.Fragment,
              null,
              b("search") && a.createElement(Jr),
              b("recent_posts") && a.createElement(Wr),
              b("popular") && a.createElement(Vr),
              b("tag_cloud") && a.createElement($r),
              b("archives") && a.createElement(Gr),
              b("links") && a.createElement(Xr),
              b("html") && ((k = g.html) == null ? void 0 : k.html) && a.createElement(
                "div",
                { className: "rounded-lg border border-gray-200 p-4" },
                g.html.title && a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g.html.title),
                a.createElement("div", { dangerouslySetInnerHTML: { __html: g.html.html } })
              )
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("categories", t)),
            f.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, E("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, f.map((m) => {
              var g;
              return a.createElement(
                "li",
                { key: m.id },
                a.createElement(z, { to: "/category/" + m.slug, className: "text-sm " + (c === m.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, m.name, ((g = m._count) == null ? void 0 : g.posts) > 0 ? a.createElement("span", { className: "text-gray-400 ml-1" }, "(" + m._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
function Di(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function Pi(e) {
  const { settings: t, posts: r, total: n, page: s, setPage: o, loadError: l, catSlug: c, categories: d } = e;
  return a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-10 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, (c || "").replace(/-/g, " ")),
      a.createElement("p", { className: "text-sm text-gray-500 mt-2" }, n + " " + E("posts", t))
    ),
    a.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-8" },
      a.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" + (t.theme_sidebar_position === "left" ? " [direction:rtl] [&>*]:[direction:ltr]" : "") },
        a.createElement(
          "div",
          { className: "lg:col-span-2" },
          r.length === 0 ? l ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-8" },
            r.map((f) => {
              var m, g, b;
              return a.createElement(
                "article",
                { key: f.id, className: "pb-8 border-b border-gray-100 last:border-0" },
                f.featured && a.createElement("img", { src: lt(f.featured, t), alt: f.title, className: "w-full h-48 object-cover rounded-lg mb-4", loading: "lazy" }),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-3" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(f.publishedAt || f.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Mr, { size: 12 }), a.createElement(z, { to: "/author/" + (((m = f.author) == null ? void 0 : m.username) || ""), className: "hover:text-primary-600" }, (g = f.author) == null ? void 0 : g.username)),
                  ((b = f.categories) == null ? void 0 : b[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 12 }), f.categories[0].name)
                ),
                a.createElement(
                  z,
                  { to: "/post/" + f.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-2" }, f.format && f.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, Di(f.format), f.format.charAt(0).toUpperCase() + f.format.slice(1)) : null, f.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + E("featured", t)) : null, f.title)
                ),
                f.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, f.excerpt),
                a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, rr(f.content)),
                f.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, a.createElement(Zt, { size: 12 }), "" + f.commentCount),
                a.createElement(z, { to: "/post/" + f.slug, className: "inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700" }, E("read more", t))
              );
            })
          ),
          n > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + E("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, E("page", t) + " " + s + " " + E("of", t) + " " + Math.ceil(n / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= n, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, E("next", t) + " →")
          )
        ),
        a.createElement(
          "aside",
          { className: "space-y-6" },
          (() => {
            const f = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), m = (g) => f.length === 0 || f.includes(g);
            return a.createElement(
              a.Fragment,
              null,
              m("search") && a.createElement(Jr),
              m("recent_posts") && a.createElement(Wr),
              m("popular") && a.createElement(Vr),
              m("tag_cloud") && a.createElement($r),
              m("archives") && a.createElement(Gr),
              m("links") && a.createElement(Xr)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("categories", t)),
            d.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, E("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, d.map((f) => {
              var m;
              return a.createElement(
                "li",
                { key: f.id },
                a.createElement(z, { to: "/category/" + f.slug, className: "text-sm " + (c === f.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, f.name, ((m = f._count) == null ? void 0 : m.posts) > 0 ? a.createElement("span", { className: "text-gray-400 ml-1" }, "(" + f._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
function Ii(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function Mi(e) {
  const { settings: t, posts: r, total: n, page: s, setPage: o, loadError: l, catSlug: c, categories: d } = e;
  return a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-10 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, E("tag", t) + ": " + (c || "").replace(/-/g, " ")),
      a.createElement("p", { className: "text-sm text-gray-500 mt-2" }, n + " " + E("posts", t))
    ),
    a.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-8" },
      a.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" + (t.theme_sidebar_position === "left" ? " [direction:rtl] [&>*]:[direction:ltr]" : "") },
        a.createElement(
          "div",
          { className: "lg:col-span-2" },
          r.length === 0 ? l ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-8" },
            r.map((f) => {
              var m, g, b;
              return a.createElement(
                "article",
                { key: f.id, className: "pb-8 border-b border-gray-100 last:border-0" },
                f.featured && a.createElement("img", { src: lt(f.featured, t), alt: f.title, className: "w-full h-48 object-cover rounded-lg mb-4", loading: "lazy" }),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-3" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(f.publishedAt || f.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Mr, { size: 12 }), a.createElement(z, { to: "/author/" + (((m = f.author) == null ? void 0 : m.username) || ""), className: "hover:text-primary-600" }, (g = f.author) == null ? void 0 : g.username)),
                  ((b = f.categories) == null ? void 0 : b[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 12 }), f.categories[0].name)
                ),
                a.createElement(
                  z,
                  { to: "/post/" + f.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-2" }, f.format && f.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, Ii(f.format), f.format.charAt(0).toUpperCase() + f.format.slice(1)) : null, f.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + E("featured", t)) : null, f.title)
                ),
                f.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, f.excerpt),
                a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, rr(f.content)),
                f.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, a.createElement(Zt, { size: 12 }), "" + f.commentCount),
                a.createElement(z, { to: "/post/" + f.slug, className: "inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700" }, E("read more", t))
              );
            })
          ),
          n > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + E("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, E("page", t) + " " + s + " " + E("of", t) + " " + Math.ceil(n / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= n, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, E("next", t) + " →")
          )
        ),
        a.createElement(
          "aside",
          { className: "space-y-6" },
          (() => {
            const f = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), m = (g) => f.length === 0 || f.includes(g);
            return a.createElement(
              a.Fragment,
              null,
              m("search") && a.createElement(Jr),
              m("recent_posts") && a.createElement(Wr),
              m("popular") && a.createElement(Vr),
              m("tag_cloud") && a.createElement($r),
              m("archives") && a.createElement(Gr),
              m("links") && a.createElement(Xr)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("categories", t)),
            d.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, E("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, d.map((f) => {
              var m;
              return a.createElement(
                "li",
                { key: f.id },
                a.createElement(z, { to: "/category/" + f.slug, className: "text-sm " + (c === f.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, f.name, ((m = f._count) == null ? void 0 : m.posts) > 0 ? a.createElement("span", { className: "text-gray-400 ml-1" }, "(" + f._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
const Ui = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function Fi(e) {
  const { data: t, year: r, month: n } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(z, { to: "/", className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6" }, a.createElement(ea, { size: 14 }), E("back")),
    a.createElement("h1", { className: "text-2xl font-bold text-gray-900 mb-6" }, Ui[parseInt(n || "1") - 1] + " " + r),
    a.createElement("p", { className: "text-sm text-gray-500 mb-6" }, t.total + " " + E("posts")),
    t.posts.length === 0 ? a.createElement("p", { className: "text-gray-500" }, E("no posts in this month")) : a.createElement(
      "div",
      { className: "space-y-6" },
      t.posts.map((s) => a.createElement(
        "article",
        { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
        a.createElement(z, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, s.title)),
        a.createElement(
          "div",
          { className: "flex items-center gap-3 text-xs text-gray-500" },
          a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(s.publishedAt || s.createdAt))
        ),
        s.excerpt && a.createElement("p", { className: "text-sm text-gray-600 mt-2" }, s.excerpt)
      ))
    )
  );
}
function In(e, t) {
  return !t || !e ? e : e.split(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi")).map(
    (n, s) => n.toLowerCase() === t.toLowerCase() ? a.createElement("mark", { key: s, className: "bg-yellow-200 rounded px-0.5" }, n) : n
  );
}
function zi(e) {
  const { query: t, posts: r, loading: n } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement("h1", { className: "text-2xl font-bold text-gray-900 mb-2" }, E("search results")),
    a.createElement("p", { className: "text-sm text-gray-500 mb-6" }, t ? E("showing results for") + ' "' + t + '"' : E("enter a search term")),
    n ? a.createElement("p", { className: "text-gray-500" }, E("searching")) : r.length === 0 ? a.createElement(
      "div",
      { className: "text-center py-12" },
      a.createElement(ra, { size: 48, className: "mx-auto text-gray-300 mb-4" }),
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no results for") + ' "' + t + '"'),
      a.createElement("p", { className: "text-sm text-gray-500 mb-4" }, E("try different keywords")),
      a.createElement(z, { to: "/", className: "text-primary-600 text-sm" }, "← " + E("browse all posts"))
    ) : a.createElement(
      "div",
      { className: "space-y-6" },
      r.map((s) => {
        var o;
        return a.createElement(
          "article",
          { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
          a.createElement(z, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, In(s.title, t))),
          a.createElement(
            "div",
            { className: "flex items-center gap-3 text-xs text-gray-500 mb-2" },
            a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(s.publishedAt || s.createdAt)),
            a.createElement("span", null, E("written by") + " " + (((o = s.author) == null ? void 0 : o.username) || "Unknown"))
          ),
          s.excerpt && a.createElement("p", { className: "text-sm text-gray-600" }, In(s.excerpt, t))
        );
      })
    )
  );
}
function Hi({ count: e = 5 }) {
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8 space-y-6 animate-pulse" },
    Array.from(
      { length: e },
      (t, r) => a.createElement(
        "div",
        { key: r, className: "flex gap-4" },
        a.createElement("div", { className: "w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" }),
        a.createElement(
          "div",
          { className: "flex-1 space-y-2 py-1" },
          a.createElement("div", { className: "h-4 w-2/3 bg-gray-200 rounded" }),
          a.createElement("div", { className: "h-3 w-full bg-gray-200 rounded" }),
          a.createElement("div", { className: "h-3 w-1/2 bg-gray-200 rounded" })
        )
      )
    )
  );
}
function Bi(e) {
  const { username: t, posts: r, loading: n } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(z, { to: "/", className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6" }, a.createElement(ea, { size: 14 }), E("back")),
    a.createElement(
      "div",
      { className: "flex items-center gap-3 mb-8" },
      a.createElement("div", { className: "w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-bold" }, (t || "?")[0].toUpperCase()),
      a.createElement(
        "div",
        null,
        a.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, t),
        a.createElement("p", { className: "text-sm text-gray-500" }, r.length + " " + E("posts"))
      )
    ),
    n ? a.createElement(Hi, null) : r.length === 0 ? a.createElement("p", { className: "text-gray-500" }, E("no posts yet")) : a.createElement(
      "div",
      { className: "space-y-6" },
      r.map((s) => {
        var o;
        return a.createElement(
          "article",
          { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
          a.createElement(z, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, s.title)),
          a.createElement(
            "div",
            { className: "flex items-center gap-3 text-xs text-gray-500" },
            a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(s.publishedAt || s.createdAt)),
            ((o = s.categories) == null ? void 0 : o[0]) && a.createElement("span", { className: "capitalize" }, s.categories[0].name)
          ),
          s.excerpt && a.createElement("p", { className: "text-sm text-gray-600 mt-2" }, s.excerpt)
        );
      })
    )
  );
}
function ka({ items: e }) {
  return a.createElement(
    "nav",
    { className: "flex items-center gap-1 text-sm text-gray-500 mb-6", "aria-label": "Breadcrumb" },
    a.createElement(z, { to: "/", className: "hover:text-gray-700 flex items-center gap-1" }, a.createElement(is, { size: 14 })),
    e.map((t, r) => a.createElement(
      a.Fragment,
      { key: r },
      a.createElement(ns, { size: 12, className: "text-gray-300" }),
      r === e.length - 1 || !t.to ? a.createElement("span", { className: "text-gray-900 font-medium" }, t.label) : a.createElement(z, { to: t.to, className: "hover:text-gray-700" }, t.label)
    ))
  );
}
function ji({ postId: e, slug: t }) {
  const [r, n] = pe([]);
  return Se(() => {
    e && Te.get("/posts/" + e + "/related").then((s) => n(s.data)).catch(() => {
    });
  }, [e]), r.length === 0 ? a.createElement("p", { className: "text-sm text-gray-400" }, E("no related posts")) : a.createElement(
    "div",
    { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
    r.map((s) => a.createElement(
      z,
      { key: s.id, to: "/post/" + s.slug, className: "group block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all" },
      a.createElement("h4", { className: "text-sm font-medium text-gray-900 group-hover:text-primary-600 mb-1" }, s.title),
      a.createElement("p", { className: "text-xs text-gray-500 line-clamp-2" }, s.excerpt || "")
    ))
  );
}
function qi({ title: e, url: t, siteUrl: r }) {
  const n = (r || window.location.origin) + t, s = encodeURIComponent(n), o = encodeURIComponent(e);
  async function l() {
    try {
      await navigator.clipboard.writeText(n), alert(E("link copied to clipboard"));
    } catch {
      window.prompt(E("copy link"), n);
    }
  }
  const c = (d) => a.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" }, a.createElement("path", { d }));
  return a.createElement(
    "div",
    { className: "flex items-center gap-2" },
    a.createElement("span", { className: "text-xs text-gray-400 mr-1" }, E("share") + ":"),
    a.createElement("a", { href: "https://twitter.com/intent/tweet?url=" + s + "&text=" + o, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors", title: "Twitter" }, c("M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z")),
    a.createElement("a", { href: "https://www.facebook.com/sharer/sharer.php?u=" + s, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors", title: "Facebook" }, c("M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z")),
    a.createElement("a", { href: "https://www.linkedin.com/sharing/share-offsite/?url=" + s, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", title: "LinkedIn" }, c("M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.9-2.2 4.18 0 4.95 2.75 4.95 6.32V24h-4v-8.6c0-2.05-.04-4.7-2.86-4.7-2.86 0-3.3 2.24-3.3 4.55V24h-4V8z")),
    a.createElement("button", { onClick: l, className: "p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors", title: E("copy link") }, a.createElement(ls, { size: 14 }))
  );
}
function $i(e) {
  return e.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "").slice(0, 80);
}
function Wi({ containerRef: e, settings: t }) {
  const [r, n] = pe([]), [s, o] = pe(!0);
  if (Se(() => {
    const c = e.current;
    if (!c) return;
    const d = c.querySelectorAll("h2, h3"), f = [], m = /* @__PURE__ */ new Set();
    d.forEach((g) => {
      const b = (g.textContent || "").trim();
      if (!b) return;
      let k = g.id || $i(b);
      k || (k = "sec-" + f.length), m.has(k) && (k = k + "-" + f.length), m.add(k), g.id = k, f.push({ id: k, text: b, level: g.tagName === "H2" ? 2 : 3 });
    }), n(f);
  }, [e]), r.length < 3) return null;
  const l = (c) => {
    const d = document.getElementById(c);
    d && d.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return a.createElement(
    "div",
    { className: "mb-8 rounded-xl border border-gray-100 bg-gray-50/70 overflow-hidden" },
    a.createElement(
      "button",
      {
        onClick: () => o(!s),
        className: "w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100/80 transition-colors"
      },
      a.createElement(cs, { size: 15, className: "text-gray-400" }),
      E("table of contents", t || {}),
      a.createElement("span", { className: "ml-auto text-gray-400 text-xs" }, s ? "▲" : "▼")
    ),
    s && a.createElement(
      "nav",
      { className: "px-2 pb-2 max-h-64 overflow-y-auto" },
      r.map(
        (c) => a.createElement("button", {
          key: c.id,
          onClick: () => l(c.id),
          className: "w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 transition-colors " + (c.level === 3 ? "pl-7 text-gray-500" : "text-gray-800 font-medium")
        }, c.text)
      )
    )
  );
}
function Vi(e) {
  return e.replace(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/g,
    '<div class="aspect-video my-4"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen class="w-full h-full rounded-lg"></iframe></div>'
  ).replace(
    /(?:https?:\/\/)?twitter\.com\/(\w+)\/status\/(\d+)/g,
    '<blockquote class="twitter-tweet my-4"><a href="https://twitter.com/$1/status/$2"></a></blockquote>'
  );
}
function Gi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Gt = { exports: {} }, Ji = Gt.exports, Mn;
function Xi() {
  return Mn || (Mn = 1, (function(e) {
    (function(t) {
      function r(h, A) {
        var y = (h & 65535) + (A & 65535), H = (h >> 16) + (A >> 16) + (y >> 16);
        return H << 16 | y & 65535;
      }
      function n(h, A) {
        return h << A | h >>> 32 - A;
      }
      function s(h, A, y, H, F, q) {
        return r(n(r(r(A, h), r(H, q)), F), y);
      }
      function o(h, A, y, H, F, q, J) {
        return s(A & y | ~A & H, h, A, F, q, J);
      }
      function l(h, A, y, H, F, q, J) {
        return s(A & H | y & ~H, h, A, F, q, J);
      }
      function c(h, A, y, H, F, q, J) {
        return s(A ^ y ^ H, h, A, F, q, J);
      }
      function d(h, A, y, H, F, q, J) {
        return s(y ^ (A | ~H), h, A, F, q, J);
      }
      function f(h, A) {
        h[A >> 5] |= 128 << A % 32, h[(A + 64 >>> 9 << 4) + 14] = A;
        var y, H, F, q, J, T = 1732584193, _ = -271733879, N = -1732584194, S = 271733878;
        for (y = 0; y < h.length; y += 16)
          H = T, F = _, q = N, J = S, T = o(T, _, N, S, h[y], 7, -680876936), S = o(S, T, _, N, h[y + 1], 12, -389564586), N = o(N, S, T, _, h[y + 2], 17, 606105819), _ = o(_, N, S, T, h[y + 3], 22, -1044525330), T = o(T, _, N, S, h[y + 4], 7, -176418897), S = o(S, T, _, N, h[y + 5], 12, 1200080426), N = o(N, S, T, _, h[y + 6], 17, -1473231341), _ = o(_, N, S, T, h[y + 7], 22, -45705983), T = o(T, _, N, S, h[y + 8], 7, 1770035416), S = o(S, T, _, N, h[y + 9], 12, -1958414417), N = o(N, S, T, _, h[y + 10], 17, -42063), _ = o(_, N, S, T, h[y + 11], 22, -1990404162), T = o(T, _, N, S, h[y + 12], 7, 1804603682), S = o(S, T, _, N, h[y + 13], 12, -40341101), N = o(N, S, T, _, h[y + 14], 17, -1502002290), _ = o(_, N, S, T, h[y + 15], 22, 1236535329), T = l(T, _, N, S, h[y + 1], 5, -165796510), S = l(S, T, _, N, h[y + 6], 9, -1069501632), N = l(N, S, T, _, h[y + 11], 14, 643717713), _ = l(_, N, S, T, h[y], 20, -373897302), T = l(T, _, N, S, h[y + 5], 5, -701558691), S = l(S, T, _, N, h[y + 10], 9, 38016083), N = l(N, S, T, _, h[y + 15], 14, -660478335), _ = l(_, N, S, T, h[y + 4], 20, -405537848), T = l(T, _, N, S, h[y + 9], 5, 568446438), S = l(S, T, _, N, h[y + 14], 9, -1019803690), N = l(N, S, T, _, h[y + 3], 14, -187363961), _ = l(_, N, S, T, h[y + 8], 20, 1163531501), T = l(T, _, N, S, h[y + 13], 5, -1444681467), S = l(S, T, _, N, h[y + 2], 9, -51403784), N = l(N, S, T, _, h[y + 7], 14, 1735328473), _ = l(_, N, S, T, h[y + 12], 20, -1926607734), T = c(T, _, N, S, h[y + 5], 4, -378558), S = c(S, T, _, N, h[y + 8], 11, -2022574463), N = c(N, S, T, _, h[y + 11], 16, 1839030562), _ = c(_, N, S, T, h[y + 14], 23, -35309556), T = c(T, _, N, S, h[y + 1], 4, -1530992060), S = c(S, T, _, N, h[y + 4], 11, 1272893353), N = c(N, S, T, _, h[y + 7], 16, -155497632), _ = c(_, N, S, T, h[y + 10], 23, -1094730640), T = c(T, _, N, S, h[y + 13], 4, 681279174), S = c(S, T, _, N, h[y], 11, -358537222), N = c(N, S, T, _, h[y + 3], 16, -722521979), _ = c(_, N, S, T, h[y + 6], 23, 76029189), T = c(T, _, N, S, h[y + 9], 4, -640364487), S = c(S, T, _, N, h[y + 12], 11, -421815835), N = c(N, S, T, _, h[y + 15], 16, 530742520), _ = c(_, N, S, T, h[y + 2], 23, -995338651), T = d(T, _, N, S, h[y], 6, -198630844), S = d(S, T, _, N, h[y + 7], 10, 1126891415), N = d(N, S, T, _, h[y + 14], 15, -1416354905), _ = d(_, N, S, T, h[y + 5], 21, -57434055), T = d(T, _, N, S, h[y + 12], 6, 1700485571), S = d(S, T, _, N, h[y + 3], 10, -1894986606), N = d(N, S, T, _, h[y + 10], 15, -1051523), _ = d(_, N, S, T, h[y + 1], 21, -2054922799), T = d(T, _, N, S, h[y + 8], 6, 1873313359), S = d(S, T, _, N, h[y + 15], 10, -30611744), N = d(N, S, T, _, h[y + 6], 15, -1560198380), _ = d(_, N, S, T, h[y + 13], 21, 1309151649), T = d(T, _, N, S, h[y + 4], 6, -145523070), S = d(S, T, _, N, h[y + 11], 10, -1120210379), N = d(N, S, T, _, h[y + 2], 15, 718787259), _ = d(_, N, S, T, h[y + 9], 21, -343485551), T = r(T, H), _ = r(_, F), N = r(N, q), S = r(S, J);
        return [T, _, N, S];
      }
      function m(h) {
        var A, y = "", H = h.length * 32;
        for (A = 0; A < H; A += 8)
          y += String.fromCharCode(h[A >> 5] >>> A % 32 & 255);
        return y;
      }
      function g(h) {
        var A, y = [];
        for (y[(h.length >> 2) - 1] = void 0, A = 0; A < y.length; A += 1)
          y[A] = 0;
        var H = h.length * 8;
        for (A = 0; A < H; A += 8)
          y[A >> 5] |= (h.charCodeAt(A / 8) & 255) << A % 32;
        return y;
      }
      function b(h) {
        return m(f(g(h), h.length * 8));
      }
      function k(h, A) {
        var y, H = g(h), F = [], q = [], J;
        for (F[15] = q[15] = void 0, H.length > 16 && (H = f(H, h.length * 8)), y = 0; y < 16; y += 1)
          F[y] = H[y] ^ 909522486, q[y] = H[y] ^ 1549556828;
        return J = f(F.concat(g(A)), 512 + A.length * 8), m(f(q.concat(J), 640));
      }
      function P(h) {
        var A = "0123456789abcdef", y = "", H, F;
        for (F = 0; F < h.length; F += 1)
          H = h.charCodeAt(F), y += A.charAt(H >>> 4 & 15) + A.charAt(H & 15);
        return y;
      }
      function B(h) {
        return unescape(encodeURIComponent(h));
      }
      function C(h) {
        return b(B(h));
      }
      function x(h) {
        return P(C(h));
      }
      function v(h, A) {
        return k(B(h), B(A));
      }
      function M(h, A) {
        return P(v(h, A));
      }
      function U(h, A, y) {
        return A ? y ? v(A, h) : M(A, h) : y ? C(h) : x(h);
      }
      e.exports ? e.exports = U : t.md5 = U;
    })(Ji);
  })(Gt)), Gt.exports;
}
var Yi = Xi();
const Ki = /* @__PURE__ */ Gi(Yi);
function jt(e, t = 80) {
  return "https://www.gravatar.com/avatar/" + Ki(e.trim().toLowerCase()) + "?s=" + t + "&d=mp";
}
function Ca(e, t = []) {
  Se(() => {
    const r = e.current;
    r && r.querySelectorAll("img").forEach((n) => {
      n.hasAttribute("loading") || n.setAttribute("loading", "lazy"), n.setAttribute("decoding", "async"), !n.hasAttribute("width") && !n.style.aspectRatio && n.addEventListener("load", () => {
        n.naturalWidth && !n.style.aspectRatio && (n.style.aspectRatio = String(n.naturalWidth / n.naturalHeight));
      }, { once: !0 });
    });
  }, t);
}
/*! @license DOMPurify 3.4.13 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.13/LICENSE */
function Un(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Zi(e) {
  if (Array.isArray(e)) return e;
}
function Qi(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, s, o, l, c = [], d = !0, f = !1;
    try {
      if (o = (r = r.call(e)).next, t !== 0) for (; !(d = (n = o.call(r)).done) && (c.push(n.value), c.length !== t); d = !0) ;
    } catch (m) {
      f = !0, s = m;
    } finally {
      try {
        if (!d && r.return != null && (l = r.return(), Object(l) !== l)) return;
      } finally {
        if (f) throw s;
      }
    }
    return c;
  }
}
function el() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function tl(e, t) {
  return Zi(e) || Qi(e, t) || rl(e, t) || el();
}
function rl(e, t) {
  if (e) {
    if (typeof e == "string") return Un(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Un(e, t) : void 0;
  }
}
const La = Object.entries, Fn = Object.setPrototypeOf, nl = Object.isFrozen, al = Object.getPrototypeOf, sl = Object.getOwnPropertyDescriptor;
let ie = Object.freeze, le = Object.seal, ot = Object.create, Da = typeof Reflect < "u" && Reflect, Dr = Da.apply, Pr = Da.construct;
ie || (ie = function(t) {
  return t;
});
le || (le = function(t) {
  return t;
});
Dr || (Dr = function(t, r) {
  for (var n = arguments.length, s = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
    s[o - 2] = arguments[o];
  return t.apply(r, s);
});
Pr || (Pr = function(t) {
  for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), s = 1; s < r; s++)
    n[s - 1] = arguments[s];
  return new t(...n);
});
const at = ee(Array.prototype.forEach), ol = ee(Array.prototype.lastIndexOf), zn = ee(Array.prototype.pop), st = ee(Array.prototype.push), il = ee(Array.prototype.splice), Ue = Array.isArray, wt = ee(String.prototype.toLowerCase), _r = ee(String.prototype.toString), Hn = ee(String.prototype.match), bt = ee(String.prototype.replace), Bn = ee(String.prototype.indexOf), ll = ee(String.prototype.trim), cl = ee(Number.prototype.toString), ul = ee(Boolean.prototype.toString), jn = typeof BigInt > "u" ? null : ee(BigInt.prototype.toString), qn = typeof Symbol > "u" ? null : ee(Symbol.prototype.toString), ae = ee(Object.prototype.hasOwnProperty), xt = ee(Object.prototype.toString), ne = ee(RegExp.prototype.test), je = ml(TypeError);
function ee(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), s = 1; s < r; s++)
      n[s - 1] = arguments[s];
    return Dr(e, t, n);
  };
}
function ml(e) {
  return function() {
    for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++)
      r[n] = arguments[n];
    return Pr(e, r);
  };
}
function W(e, t) {
  let r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : wt;
  if (Fn && Fn(e, null), !Ue(t))
    return e;
  let n = t.length;
  for (; n--; ) {
    let s = t[n];
    if (typeof s == "string") {
      const o = r(s);
      o !== s && (nl(t) || (t[n] = o), s = o);
    }
    e[s] = !0;
  }
  return e;
}
function fl(e) {
  for (let t = 0; t < e.length; t++)
    ae(e, t) || (e[t] = null);
  return e;
}
function me(e) {
  const t = ot(null);
  for (const n of La(e)) {
    var r = tl(n, 2);
    const s = r[0], o = r[1];
    ae(e, s) && (Ue(o) ? t[s] = fl(o) : o && typeof o == "object" && o.constructor === Object ? t[s] = me(o) : t[s] = o);
  }
  return t;
}
function dl(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return cl(e);
    case "boolean":
      return ul(e);
    case "bigint":
      return jn ? jn(e) : "0";
    case "symbol":
      return qn ? qn(e) : "Symbol()";
    case "undefined":
      return xt(e);
    case "function":
    case "object": {
      if (e === null)
        return xt(e);
      const t = e, r = _e(t, "toString");
      if (typeof r == "function") {
        const n = r(t);
        return typeof n == "string" ? n : xt(n);
      }
      return xt(e);
    }
    default:
      return xt(e);
  }
}
function _e(e, t) {
  for (; e !== null; ) {
    const n = sl(e, t);
    if (n) {
      if (n.get)
        return ee(n.get);
      if (typeof n.value == "function")
        return ee(n.value);
    }
    e = al(e);
  }
  function r() {
    return null;
  }
  return r;
}
function pl(e) {
  try {
    return ne(e, ""), !0;
  } catch {
    return !1;
  }
}
const $n = ie(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Tr = ie(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Sr = ie(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), hl = ie(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Ar = ie(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), gl = ie(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Wn = ie(["#text"]), Vn = ie(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), Rr = ie(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Gn = ie(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), qt = ie(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), yl = le(/{{[\w\W]*|^[\w\W]*}}/g), El = le(/<%[\w\W]*|^[\w\W]*%>/g), bl = le(/\${[\w\W]*/g), xl = le(/^data-[\-\w.\u00B7-\uFFFF]+$/), wl = le(/^aria-[\-\w]+$/), Jn = le(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Nl = le(/^(?:\w+script|data):/i), _l = le(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Tl = le(/^html$/i), Sl = le(/^[a-z][.\w]*(-[.\w]+)+$/i), Xn = le(/<[/\w!]/g), Yn = le(/<[/\w]/g), Al = le(/<\/no(script|embed|frames)/i), Rl = le(/\/>/i), xe = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  // Deprecated
  entityNode: 6,
  // Deprecated
  processingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12
  // Deprecated
}, Ol = function() {
  return typeof window > "u" ? null : window;
}, vl = function(t, r) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let n = null;
  const s = "data-tt-policy-suffix";
  r && r.hasAttribute(s) && (n = r.getAttribute(s));
  const o = "dompurify" + (n ? "#" + n : "");
  try {
    return t.createPolicy(o, {
      createHTML(l) {
        return l;
      },
      createScriptURL(l) {
        return l;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + o + " could not be created."), null;
  }
}, Kn = function() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
}, Me = function(t, r, n, s) {
  return ae(t, r) && Ue(t[r]) ? W(s.base ? me(s.base) : {}, t[r], s.transform) : n;
};
function Pa() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Ol();
  const t = (R) => Pa(R);
  if (t.version = "3.4.13", t.removed = [], !e || !e.document || e.document.nodeType !== xe.document || !e.Element)
    return t.isSupported = !1, t;
  let r = e.document;
  const n = r, s = n.currentScript;
  e.DocumentFragment;
  const o = e.HTMLTemplateElement, l = e.Node, c = e.Element, d = e.NodeFilter, f = e.NamedNodeMap;
  f === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const m = e.DOMParser, g = e.trustedTypes, b = c.prototype, k = _e(b, "cloneNode"), P = _e(b, "remove"), B = _e(b, "nextSibling"), C = _e(b, "childNodes"), x = _e(b, "parentNode"), v = _e(b, "shadowRoot"), M = _e(b, "attributes"), U = l && l.prototype ? _e(l.prototype, "nodeType") : null, h = l && l.prototype ? _e(l.prototype, "nodeName") : null, A = l && l.prototype ? _e(l.prototype, "ownerDocument") : null;
  if (typeof o == "function") {
    const R = r.createElement("template");
    R.content && R.content.ownerDocument && (r = R.content.ownerDocument);
  }
  let y, H = "", F, q = !1, J = 0;
  const T = function() {
    if (J > 0)
      throw je('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, _ = function(i) {
    T(), J++;
    try {
      return y.createHTML(i);
    } finally {
      J--;
    }
  }, N = function(i) {
    T(), J++;
    try {
      return y.createScriptURL(i);
    } finally {
      J--;
    }
  }, S = function() {
    return q || (F = vl(g, s), q = !0), F;
  }, Ae = r, Fe = Ae.implementation, Rt = Ae.createNodeIterator, Ot = Ae.createDocumentFragment, Re = Ae.getElementsByTagName, te = n.importNode;
  let V = Kn();
  t.isSupported = typeof La == "function" && typeof x == "function" && Fe && Fe.createHTMLDocument !== void 0;
  const Ce = yl, ze = El, vt = bl, G = xl, he = wl, Ye = Nl, mt = _l, nr = Sl;
  let ft = Jn, $ = null;
  const Ke = W({}, [...$n, ...Tr, ...Sr, ...Ar, ...Wn]);
  let X = null;
  const be = W({}, [...Vn, ...Rr, ...Gn, ...qt]);
  let L = Object.seal(ot(null, {
    tagNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: !1
    }
  })), re = null, Ne = null;
  const ce = Object.seal(ot(null, {
    tagCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    }
  }));
  let dt = !0, pt = !0, Le = !1, Yr = !0, De = !1, Pe = !0, He = !1, ar = !1, kt = null, Ct = null, sr = !1, Ze = !1, Lt = !1, Dt = !1, Kr = !0, Zr = !1;
  const Qr = "user-content-";
  let or = !0, Pt = !1, Qe = {}, Oe = null;
  const ir = W({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    // <selectedcontent> mirrors the selected <option>'s subtree, cloned by
    // the UA (customizable <select>) — including any on* handlers — and the
    // engine re-mirrors synchronously whenever a removal changes which
    // option/selectedcontent is current, even inside DOMPurify's inert
    // DOMParser document. Hoisting its children on removal re-inserts a fresh
    // mirror target ahead of the walk, which the engine refills, looping
    // forever (DoS) and amplifying output. Dropping its content on removal
    // (rather than hoisting) breaks that cascade; the content is a duplicate
    // of the option, which is sanitized on its own. See campaign-3 F1/F6.
    "selectedcontent",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp"
  ]);
  let en = null;
  const tn = W({}, ["audio", "video", "img", "source", "image", "track"]);
  let lr = null;
  const rn = W({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), It = "http://www.w3.org/1998/Math/MathML", Mt = "http://www.w3.org/2000/svg", ve = "http://www.w3.org/1999/xhtml";
  let et = ve, cr = !1, ur = null;
  const Ma = W({}, [It, Mt, ve], _r), nn = ie(["mi", "mo", "mn", "ms", "mtext"]);
  let mr = W({}, nn);
  const an = ie(["annotation-xml"]);
  let fr = W({}, an);
  const Ua = W({}, ["title", "style", "font", "a", "script"]);
  let ht = null;
  const Fa = ["application/xhtml+xml", "text/html"], za = "text/html";
  let K = null, tt = null;
  const Ha = r.createElement("form"), sn = function(i) {
    return i instanceof RegExp || i instanceof Function;
  }, dr = function() {
    let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (tt && tt === i)
      return;
    (!i || typeof i != "object") && (i = {}), i = me(i), ht = // eslint-disable-next-line unicorn/prefer-includes
    Fa.indexOf(i.PARSER_MEDIA_TYPE) === -1 ? za : i.PARSER_MEDIA_TYPE, K = ht === "application/xhtml+xml" ? _r : wt, $ = Me(i, "ALLOWED_TAGS", Ke, {
      transform: K
    }), X = Me(i, "ALLOWED_ATTR", be, {
      transform: K
    }), ur = Me(i, "ALLOWED_NAMESPACES", Ma, {
      transform: _r
    }), lr = Me(i, "ADD_URI_SAFE_ATTR", rn, {
      transform: K,
      base: rn
    }), en = Me(i, "ADD_DATA_URI_TAGS", tn, {
      transform: K,
      base: tn
    }), Oe = Me(i, "FORBID_CONTENTS", ir, {
      transform: K
    }), re = Me(i, "FORBID_TAGS", me({}), {
      transform: K
    }), Ne = Me(i, "FORBID_ATTR", me({}), {
      transform: K
    }), Qe = ae(i, "USE_PROFILES") ? i.USE_PROFILES && typeof i.USE_PROFILES == "object" ? me(i.USE_PROFILES) : i.USE_PROFILES : !1, dt = i.ALLOW_ARIA_ATTR !== !1, pt = i.ALLOW_DATA_ATTR !== !1, Le = i.ALLOW_UNKNOWN_PROTOCOLS || !1, Yr = i.ALLOW_SELF_CLOSE_IN_ATTR !== !1, De = i.SAFE_FOR_TEMPLATES || !1, Pe = i.SAFE_FOR_XML !== !1, He = i.WHOLE_DOCUMENT || !1, Ze = i.RETURN_DOM || !1, Lt = i.RETURN_DOM_FRAGMENT || !1, Dt = i.RETURN_TRUSTED_TYPE || !1, sr = i.FORCE_BODY || !1, Kr = i.SANITIZE_DOM !== !1, Zr = i.SANITIZE_NAMED_PROPS || !1, or = i.KEEP_CONTENT !== !1, Pt = i.IN_PLACE || !1, ft = pl(i.ALLOWED_URI_REGEXP) ? i.ALLOWED_URI_REGEXP : Jn, et = typeof i.NAMESPACE == "string" ? i.NAMESPACE : ve, mr = ae(i, "MATHML_TEXT_INTEGRATION_POINTS") && i.MATHML_TEXT_INTEGRATION_POINTS && typeof i.MATHML_TEXT_INTEGRATION_POINTS == "object" ? me(i.MATHML_TEXT_INTEGRATION_POINTS) : W({}, nn), fr = ae(i, "HTML_INTEGRATION_POINTS") && i.HTML_INTEGRATION_POINTS && typeof i.HTML_INTEGRATION_POINTS == "object" ? me(i.HTML_INTEGRATION_POINTS) : W({}, an);
    const p = ae(i, "CUSTOM_ELEMENT_HANDLING") && i.CUSTOM_ELEMENT_HANDLING && typeof i.CUSTOM_ELEMENT_HANDLING == "object" ? me(i.CUSTOM_ELEMENT_HANDLING) : ot(null);
    if (L = ot(null), ae(p, "tagNameCheck") && sn(p.tagNameCheck) && (L.tagNameCheck = p.tagNameCheck), ae(p, "attributeNameCheck") && sn(p.attributeNameCheck) && (L.attributeNameCheck = p.attributeNameCheck), ae(p, "allowCustomizedBuiltInElements") && typeof p.allowCustomizedBuiltInElements == "boolean" && (L.allowCustomizedBuiltInElements = p.allowCustomizedBuiltInElements), le(L), De && (pt = !1), Lt && (Ze = !0), Qe && ($ = W({}, Wn), X = ot(null), Qe.html === !0 && (W($, $n), W(X, Vn)), Qe.svg === !0 && (W($, Tr), W(X, Rr), W(X, qt)), Qe.svgFilters === !0 && (W($, Sr), W(X, Rr), W(X, qt)), Qe.mathMl === !0 && (W($, Ar), W(X, Gn), W(X, qt))), ce.tagCheck = null, ce.attributeCheck = null, ae(i, "ADD_TAGS") && (typeof i.ADD_TAGS == "function" ? ce.tagCheck = i.ADD_TAGS : Ue(i.ADD_TAGS) && ($ === Ke && ($ = me($)), W($, i.ADD_TAGS, K))), ae(i, "ADD_ATTR") && (typeof i.ADD_ATTR == "function" ? ce.attributeCheck = i.ADD_ATTR : Ue(i.ADD_ATTR) && (X === be && (X = me(X)), W(X, i.ADD_ATTR, K))), ae(i, "ADD_URI_SAFE_ATTR") && Ue(i.ADD_URI_SAFE_ATTR) && W(lr, i.ADD_URI_SAFE_ATTR, K), ae(i, "FORBID_CONTENTS") && Ue(i.FORBID_CONTENTS) && (Oe === ir && (Oe = me(Oe)), W(Oe, i.FORBID_CONTENTS, K)), ae(i, "ADD_FORBID_CONTENTS") && Ue(i.ADD_FORBID_CONTENTS) && (Oe === ir && (Oe = me(Oe)), W(Oe, i.ADD_FORBID_CONTENTS, K)), or && ($["#text"] = !0), He && W($, ["html", "head", "body"]), $.table && (W($, ["tbody"]), delete re.tbody), i.TRUSTED_TYPES_POLICY) {
      if (typeof i.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw je('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof i.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw je('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const w = y;
      y = i.TRUSTED_TYPES_POLICY;
      try {
        H = _("");
      } catch (D) {
        throw y = w, D;
      }
    } else i.TRUSTED_TYPES_POLICY === null ? (y = void 0, H = "") : (y === void 0 && (y = S()), y && typeof H == "string" && (H = _("")));
    ie && ie(i), tt = i;
  }, on = W({}, [...Tr, ...Sr, ...hl]), ln = W({}, [...Ar, ...gl]), Ba = function(i, p, w) {
    return p.namespaceURI === ve ? i === "svg" : p.namespaceURI === It ? i === "svg" && (w === "annotation-xml" || mr[w]) : !!on[i];
  }, ja = function(i, p, w) {
    return p.namespaceURI === ve ? i === "math" : p.namespaceURI === Mt ? i === "math" && fr[w] : !!ln[i];
  }, qa = function(i, p, w) {
    return p.namespaceURI === Mt && !fr[w] || p.namespaceURI === It && !mr[w] ? !1 : !ln[i] && (Ua[i] || !on[i]);
  }, $a = function(i) {
    let p = x(i);
    (!p || !p.tagName) && (p = {
      namespaceURI: et,
      tagName: "template"
    });
    const w = wt(i.tagName), D = wt(p.tagName);
    return ur[i.namespaceURI] ? i.namespaceURI === Mt ? Ba(w, p, D) : i.namespaceURI === It ? ja(w, p, D) : i.namespaceURI === ve ? qa(w, p, D) : !!(ht === "application/xhtml+xml" && ur[i.namespaceURI]) : !1;
  }, Ie = function(i) {
    st(t.removed, {
      element: i
    });
    try {
      x(i).removeChild(i);
    } catch {
      if (P(i), !x(i))
        throw je("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, Ut = function(i) {
    gt(i);
    const p = C(i);
    if (p) {
      const D = [];
      at(p, (I) => {
        st(D, I);
      }), at(D, (I) => {
        try {
          P(I);
        } catch {
        }
      });
    }
    const w = M(i);
    if (w)
      for (let D = w.length - 1; D >= 0; --D) {
        const I = w[D], j = I && I.name;
        if (typeof j == "string")
          try {
            i.removeAttribute(j);
          } catch {
          }
      }
  }, Be = function(i, p) {
    try {
      st(t.removed, {
        attribute: p.getAttributeNode(i),
        from: p
      });
    } catch {
      st(t.removed, {
        attribute: null,
        from: p
      });
    }
    if (p.removeAttribute(i), i === "is")
      if (Ze || Lt)
        try {
          Ie(p);
        } catch {
        }
      else
        try {
          p.setAttribute(i, "");
        } catch {
        }
  }, Wa = function(i) {
    const p = M(i);
    if (p)
      for (let w = p.length - 1; w >= 0; --w) {
        const D = p[w], I = D && D.name;
        if (!(typeof I != "string" || X[K(I)]))
          try {
            i.removeAttribute(I);
          } catch {
          }
      }
  }, gt = function(i) {
    const p = [i];
    for (; p.length > 0; ) {
      const w = p.pop();
      (U ? U(w) : w.nodeType) === xe.element && Wa(w);
      const I = C(w);
      if (I)
        for (let j = I.length - 1; j >= 0; --j)
          p.push(I[j]);
    }
  }, Va = function(i) {
    if (!Pe)
      return;
    const p = [i];
    for (; p.length > 0; ) {
      const w = p.pop(), D = U ? U(w) : w.nodeType;
      if (D === xe.processingInstruction || D === xe.comment && ne(Yn, w.data)) {
        try {
          P(w);
        } catch {
        }
        continue;
      }
      if (D === xe.element) {
        const j = w, Y = K(h ? h(w) : w.nodeName);
        try {
          j.hasAttribute && j.hasAttribute("patchsrc") && j.removeAttribute("patchsrc"), j.hasAttribute && j.hasAttribute("for") && Y !== "label" && Y !== "output" && j.removeAttribute("for");
        } catch {
        }
      }
      const I = C(w);
      if (I)
        for (let j = I.length - 1; j >= 0; --j)
          p.push(I[j]);
    }
  }, cn = function(i) {
    let p = null, w = null;
    if (sr)
      i = "<remove></remove>" + i;
    else {
      const j = Hn(i, /^[\r\n\t ]+/);
      w = j && j[0];
    }
    ht === "application/xhtml+xml" && et === ve && (i = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + i + "</body></html>");
    const D = y ? _(i) : i;
    if (et === ve)
      try {
        p = new m().parseFromString(D, ht);
      } catch {
      }
    if (!p || !p.documentElement) {
      p = Fe.createDocument(et, "template", null);
      try {
        p.documentElement.innerHTML = cr ? H : D;
      } catch {
      }
    }
    const I = p.body || p.documentElement;
    return i && w && I.insertBefore(r.createTextNode(w), I.childNodes[0] || null), et === ve ? Re.call(p, He ? "html" : "body")[0] : He ? p.documentElement : I;
  }, un = function(i) {
    const p = A ? A(i) : i.ownerDocument;
    return Rt.call(
      p || i,
      i,
      // eslint-disable-next-line no-bitwise
      d.SHOW_ELEMENT | d.SHOW_COMMENT | d.SHOW_TEXT | d.SHOW_PROCESSING_INSTRUCTION | d.SHOW_CDATA_SECTION,
      null
    );
  }, Ft = function(i) {
    return i = bt(i, Ce, " "), i = bt(i, ze, " "), i = bt(i, vt, " "), i;
  }, pr = function(i) {
    var p;
    i.normalize();
    const w = A ? A(i) : i.ownerDocument, D = Rt.call(
      w || i,
      i,
      // eslint-disable-next-line no-bitwise
      d.SHOW_TEXT | d.SHOW_COMMENT | d.SHOW_CDATA_SECTION | d.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let I = D.nextNode();
    for (; I; )
      I.data = Ft(I.data), I = D.nextNode();
    const j = (p = i.querySelectorAll) === null || p === void 0 ? void 0 : p.call(i, "template");
    j && at(j, (Y) => {
      rt(Y.content) && pr(Y.content);
    });
  }, zt = function(i) {
    const p = h ? h(i) : null;
    return typeof p != "string" || K(p) !== "form" ? !1 : typeof i.nodeName != "string" || typeof i.textContent != "string" || typeof i.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    i.attributes !== M(i) || typeof i.removeAttribute != "function" || typeof i.setAttribute != "function" || typeof i.namespaceURI != "string" || typeof i.insertBefore != "function" || typeof i.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    i.nodeType !== U(i) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
    // "childNodes" shadows the prototype getter. Direct reads of
    // form.childNodes from a clobbered form return the named child
    // instead of the real NodeList, so any walk that reads it directly
    // skips the form's real children. Compare the direct read to the
    // cached Node.prototype getter — when the form's named-property
    // getter intercepts the read, the two values differ and we flag
    // the form. This catches every clobbering child type (input,
    // select, etc.) regardless of whether the named child happens to
    // carry a numeric .length, which a typeof-based probe would miss
    // (e.g. HTMLSelectElement.length is a defined unsigned-long).
    i.childNodes !== C(i);
  }, rt = function(i) {
    if (!U || typeof i != "object" || i === null)
      return !1;
    try {
      return U(i) === xe.documentFragment;
    } catch {
      return !1;
    }
  }, yt = function(i) {
    if (!U || typeof i != "object" || i === null)
      return !1;
    try {
      return typeof U(i) == "number";
    } catch {
      return !1;
    }
  };
  function ke(R, i, p) {
    R.length !== 0 && at(R, (w) => {
      w.call(t, i, p, tt);
    });
  }
  const Ga = function(i, p) {
    return !!(Pe && i.hasChildNodes() && !yt(i.firstElementChild) && ne(Xn, i.textContent) && ne(Xn, i.innerHTML) || Pe && i.namespaceURI === ve && p === "style" && yt(i.firstElementChild) || i.nodeType === xe.processingInstruction || Pe && i.nodeType === xe.comment && ne(Yn, i.data));
  }, Ja = function(i, p, w) {
    if (!re[p] && pn(p) && (L.tagNameCheck instanceof RegExp && ne(L.tagNameCheck, p) || L.tagNameCheck instanceof Function && L.tagNameCheck(p)))
      return !1;
    if (or && !Oe[p]) {
      const D = x(i), I = C(i);
      if (I && D) {
        const j = I.length;
        for (let Y = j - 1; Y >= 0; --Y) {
          const Z = i === w ? k(I[Y], !0) : I[Y];
          D.insertBefore(Z, B(i));
        }
      }
    }
    return Ie(i), !0;
  }, mn = function(i, p, w, D) {
    return i.length === 0 ? p : p === w || p === D ? me(p) : p;
  }, fn = function(i, p) {
    if (ke(V.beforeSanitizeElements, i, null), i !== p && x(i) === null)
      return Pt && gt(i), !0;
    if (zt(i))
      return Ie(i), !0;
    const w = K(h ? h(i) : i.nodeName);
    if ($ = mn(V.uponSanitizeElement, $, Ke, kt), ke(V.uponSanitizeElement, i, {
      tagName: w,
      allowedTags: $
    }), i !== p && x(i) === null)
      return Pt && gt(i), !0;
    if (Ga(i, w))
      return Ie(i), !0;
    if (re[w] || !(ce.tagCheck instanceof Function && ce.tagCheck(w)) && !$[w]) {
      const I = Ja(i, w, p);
      return I === !1 && ke(V.afterSanitizeElements, i, null), I;
    }
    if ((U ? U(i) : i.nodeType) === xe.element && !$a(i) || (w === "noscript" || w === "noembed" || w === "noframes") && ne(Al, i.innerHTML))
      return Ie(i), !0;
    if (De && i.nodeType === xe.text) {
      const I = Ft(i.textContent);
      i.textContent !== I && (st(t.removed, {
        element: i.cloneNode()
      }), i.textContent = I);
    }
    return ke(V.afterSanitizeElements, i, null), !1;
  }, dn = function(i, p, w) {
    if (Ne[p] || Pe && p === "patchsrc" || Pe && p === "for" && i !== "label" && i !== "output" || Kr && (p === "id" || p === "name") && (w in r || w in Ha))
      return !1;
    const D = X[p] || ce.attributeCheck instanceof Function && ce.attributeCheck(p, i);
    if (!(pt && ne(G, p))) {
      if (!(dt && ne(he, p))) {
        if (D) {
          if (!lr[p]) {
            if (!ne(ft, bt(w, mt, ""))) {
              if (!((p === "src" || p === "xlink:href" || p === "href") && i !== "script" && Bn(w, "data:") === 0 && en[i])) {
                if (!(Le && !ne(Ye, bt(w, mt, "")))) {
                  if (w)
                    return !1;
                }
              }
            }
          }
        } else if (
          // First condition does a very basic check if a) it's basically a valid custom element tagname AND
          // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
          // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
          !(pn(i) && (L.tagNameCheck instanceof RegExp && ne(L.tagNameCheck, i) || L.tagNameCheck instanceof Function && L.tagNameCheck(i)) && (L.attributeNameCheck instanceof RegExp && ne(L.attributeNameCheck, p) || L.attributeNameCheck instanceof Function && L.attributeNameCheck(p, i)) || // Alternative, second condition checks if it's an `is`-attribute, AND
          // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
          p === "is" && L.allowCustomizedBuiltInElements && (L.tagNameCheck instanceof RegExp && ne(L.tagNameCheck, w) || L.tagNameCheck instanceof Function && L.tagNameCheck(w)))
        ) return !1;
      }
    }
    return !0;
  }, Xa = W({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), pn = function(i) {
    return !Xa[wt(i)] && ne(nr, i);
  }, Ya = function(i, p, w, D) {
    if (y && typeof g == "object" && typeof g.getAttributeType == "function" && !w)
      switch (g.getAttributeType(i, p)) {
        case "TrustedHTML":
          return _(D);
        case "TrustedScriptURL":
          return N(D);
      }
    return D;
  }, Ka = function(i, p, w, D) {
    try {
      w ? i.setAttributeNS(w, p, D) : i.setAttribute(p, D), zt(i) ? Ie(i) : zn(t.removed);
    } catch {
      Be(p, i);
    }
  }, hn = function(i) {
    ke(V.beforeSanitizeAttributes, i, null);
    const p = i.attributes;
    if (!p || zt(i))
      return;
    X = mn(V.uponSanitizeAttribute, X, be, Ct);
    const w = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: X,
      forceKeepAttr: void 0
    };
    let D = p.length;
    const I = K(i.nodeName);
    for (; D--; ) {
      const j = p[D], Y = j.name, Z = j.namespaceURI, ge = j.value, ye = K(Y), gr = ge;
      let de = Y === "value" ? gr : ll(gr);
      if (w.attrName = ye, w.attrValue = de, w.keepAttr = !0, w.forceKeepAttr = void 0, ke(V.uponSanitizeAttribute, i, w), de = w.attrValue, Zr && (ye === "id" || ye === "name") && Bn(de, Qr) !== 0 && (Be(Y, i), de = Qr + de), Pe && ne(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, de)) {
        Be(Y, i);
        continue;
      }
      if (ye === "attributename" && Hn(de, "href")) {
        Be(Y, i);
        continue;
      }
      if (!w.forceKeepAttr) {
        if (!w.keepAttr) {
          Be(Y, i);
          continue;
        }
        if (!Yr && ne(Rl, de)) {
          Be(Y, i);
          continue;
        }
        if (De && (de = Ft(de)), !dn(I, ye, de)) {
          Be(Y, i);
          continue;
        }
        de = Ya(I, ye, Z, de), de !== gr && Ka(i, Y, Z, de);
      }
    }
    ke(V.afterSanitizeAttributes, i, null);
  }, Ht = function(i) {
    let p = null;
    const w = un(i);
    for (ke(V.beforeSanitizeShadowDOM, i, null); p = w.nextNode(); )
      if (ke(V.uponSanitizeShadowNode, p, null), fn(p, i), hn(p), rt(p.content) && Ht(p.content), (U ? U(p) : p.nodeType) === xe.element) {
        const I = v(p);
        rt(I) && (hr(I), Ht(I));
      }
    ke(V.afterSanitizeShadowDOM, i, null);
  }, hr = function(i) {
    const p = [{
      node: i,
      shadow: null
    }];
    for (; p.length > 0; ) {
      const w = p.pop();
      if (w.shadow) {
        Ht(w.shadow);
        continue;
      }
      const D = w.node, j = (U ? U(D) : D.nodeType) === xe.element, Y = C(D);
      if (Y)
        for (let Z = Y.length - 1; Z >= 0; --Z)
          p.push({
            node: Y[Z],
            shadow: null
          });
      if (j) {
        const Z = h ? h(D) : null;
        if (typeof Z == "string" && K(Z) === "template") {
          const ge = D.content;
          rt(ge) && p.push({
            node: ge,
            shadow: null
          });
        }
      }
      if (j) {
        const Z = v(D);
        rt(Z) && p.push({
          node: null,
          shadow: Z
        }, {
          node: Z,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(R) {
    let i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, p = null, w = null, D = null, I = null;
    if (cr = !R, cr && (R = "<!-->"), typeof R != "string" && !yt(R) && (R = dl(R), typeof R != "string"))
      throw je("dirty is not a string, aborting");
    if (!t.isSupported)
      return R;
    ar ? ($ = kt, X = Ct) : dr(i), (V.uponSanitizeElement.length > 0 || V.uponSanitizeAttribute.length > 0) && ($ = me($)), V.uponSanitizeAttribute.length > 0 && (X = me(X)), t.removed = [];
    const j = Pt && typeof R != "string" && yt(R);
    if (j) {
      Va(R);
      const ge = h ? h(R) : R.nodeName;
      if (typeof ge == "string") {
        const ye = K(ge);
        if (!$[ye] || re[ye])
          throw Ut(R), je("root node is forbidden and cannot be sanitized in-place");
      }
      if (zt(R))
        throw Ut(R), je("root node is clobbered and cannot be sanitized in-place");
      try {
        hr(R);
      } catch (ye) {
        throw Ut(R), ye;
      }
    } else if (yt(R))
      p = cn("<!---->"), w = p.ownerDocument.importNode(R, !0), w.nodeType === xe.element && w.nodeName === "BODY" || w.nodeName === "HTML" ? p = w : p.appendChild(w), hr(w);
    else {
      if (!Ze && !De && !He && // eslint-disable-next-line unicorn/prefer-includes
      R.indexOf("<") === -1)
        return y && Dt ? _(R) : R;
      if (p = cn(R), !p)
        return Ze ? null : Dt ? H : "";
    }
    p && sr && Ie(p.firstChild);
    const Y = j ? R : p;
    try {
      const ge = un(Y);
      for (; D = ge.nextNode(); )
        fn(D, Y), hn(D), rt(D.content) && Ht(D.content);
    } catch (ge) {
      throw j && (Ut(R), at(t.removed, (ye) => {
        ye.element && gt(ye.element);
      })), ge;
    }
    if (j)
      return at(t.removed, (ge) => {
        ge.element && gt(ge.element);
      }), De && pr(R), R;
    if (Ze) {
      if (De && pr(p), Lt)
        for (I = Ot.call(p.ownerDocument); p.firstChild; )
          I.appendChild(p.firstChild);
      else
        I = p;
      return (X.shadowroot || X.shadowrootmode) && (I = te.call(n, I, !0)), I;
    }
    let Z = He ? p.outerHTML : p.innerHTML;
    return He && $["!doctype"] && p.ownerDocument && p.ownerDocument.doctype && p.ownerDocument.doctype.name && ne(Tl, p.ownerDocument.doctype.name) && (Z = "<!DOCTYPE " + p.ownerDocument.doctype.name + `>
` + Z), De && (Z = Ft(Z)), y && Dt ? _(Z) : Z;
  }, t.setConfig = function() {
    let R = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    dr(R), ar = !0, kt = $, Ct = X;
  }, t.clearConfig = function() {
    tt = null, ar = !1, kt = null, Ct = null, y = F, H = "";
  }, t.isValidAttribute = function(R, i, p) {
    tt || dr({});
    const w = K(R), D = K(i);
    return dn(w, D, p);
  }, t.addHook = function(R, i) {
    typeof i == "function" && ae(V, R) && st(V[R], i);
  }, t.removeHook = function(R, i) {
    if (ae(V, R)) {
      if (i !== void 0) {
        const p = ol(V[R], i);
        return p === -1 ? void 0 : il(V[R], p, 1)[0];
      }
      return zn(V[R]);
    }
  }, t.removeHooks = function(R) {
    ae(V, R) && (V[R] = []);
  }, t.removeAllHooks = function() {
    V = Kn();
  }, t;
}
var Ia = Pa();
function kl(e) {
  var A, y, H;
  const { settings: t, post: r, comments: n, submitted: s, commentForm: o, submitComment: l, setCommentForm: c, commentError: d, slug: f } = e, m = String((r == null ? void 0 : r.content) || "").split(/<!--\s*nextpage\s*-->/i), [g] = Qa(), b = m.length, k = Math.max(1, Math.min(b, parseInt(g.get("page") || "1", 10) || 1)), P = m[k - 1] || "", B = b > 1 && a.createElement(
    "nav",
    { className: "flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-100" },
    k > 1 && a.createElement(z, { to: "/post/" + f + (k - 1 > 1 ? "?page=" + (k - 1) : ""), className: "text-sm text-gray-500 hover:text-primary-600" }, "← " + E("previous", t)),
    a.createElement("span", { className: "text-sm text-gray-400" }, E("page", t) + " " + k + " / " + b),
    k < b && a.createElement(z, { to: "/post/" + f + "?page=" + (k + 1), className: "text-sm text-gray-500 hover:text-primary-600" }, E("next", t) + " →")
  ), C = Ir(null);
  Ca(C, [r == null ? void 0 : r.content]);
  const x = (A = r.categories) == null ? void 0 : A[0], v = r.author, M = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 bg-white", U = n.map((F) => a.createElement(
    "div",
    { key: F.id, className: "mb-5 p-5 rounded-2xl border border-gray-100" },
    a.createElement(
      "div",
      { className: "flex items-center gap-2.5 mb-2" },
      a.createElement("img", { src: jt(F.email || ""), alt: "", className: "w-8 h-8 rounded-full" }),
      a.createElement(
        "div",
        null,
        a.createElement("p", { className: "font-medium text-sm text-gray-900" }, F.author),
        a.createElement("p", { className: "text-xs text-gray-400" }, new Date(F.createdAt).toLocaleDateString())
      )
    ),
    a.createElement("p", { className: "text-sm text-gray-700 leading-relaxed" }, F.content),
    (F.children || []).map((q) => a.createElement(
      "div",
      { key: q.id, className: "ml-8 mt-3 pl-4 border-l-2 border-gray-100" },
      a.createElement(
        "div",
        { className: "flex items-center gap-2 mb-1" },
        a.createElement("img", { src: jt(q.email || ""), alt: "", className: "w-6 h-6 rounded-full" }),
        a.createElement("span", { className: "font-medium text-sm text-gray-800" }, q.author)
      ),
      a.createElement("p", { className: "text-sm text-gray-600" }, q.content)
    ))
  )), h = a.createElement(
    "form",
    { onSubmit: l, noValidate: !0, className: "space-y-3 mt-6 p-6 rounded-2xl bg-gray-50" },
    a.createElement("h4", { className: "text-sm font-semibold text-gray-900" }, E("leave a comment", t)),
    d && a.createElement("div", { role: "alert", className: "p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg" }, d),
    a.createElement("input", { type: "text", name: "website_url", style: { position: "absolute", left: "-9999px" }, tabIndex: -1, autoComplete: "off" }),
    a.createElement(
      "div",
      { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
      a.createElement("input", { value: o.author, onChange: (F) => c({ ...o, author: F.target.value }), placeholder: E("name", t), "aria-label": E("name", t), className: M, autoComplete: "name" }),
      a.createElement("input", { value: o.email, onChange: (F) => c({ ...o, email: F.target.value }), placeholder: E("email", t), type: "email", "aria-label": E("email", t), className: M, autoComplete: "email" })
    ),
    a.createElement("textarea", { value: o.content, onChange: (F) => c({ ...o, content: F.target.value }), placeholder: E("your comment", t) + "...", "aria-label": E("your comment", t), className: M, rows: 3, required: !0 }),
    a.createElement(
      "label",
      { className: "flex items-center gap-2 text-sm text-gray-500 cursor-pointer" },
      a.createElement("input", { type: "checkbox", checked: !!o.notifyMe, onChange: (F) => c({ ...o, notifyMe: F.target.checked }), className: "rounded border-gray-300 text-primary-600" }),
      E("notify me of replies", t)
    ),
    a.createElement("button", { type: "submit", className: "w-full py-2.5 rounded-xl text-white text-sm font-medium transition-colors", style: { background: "var(--primary-color, #2563eb)" } }, E("submit comment", t))
  );
  return a.createElement(
    "article",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(ka, { items: [{ label: E("blog", t), to: "/" }, { label: r.title || E("post", t) }] }),
    // Header: category chip + title + meta
    a.createElement(
      "header",
      { className: "mb-8" },
      x && a.createElement(z, {
        to: "/category/" + x.slug,
        className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4",
        style: { background: "color-mix(in srgb, var(--primary-color, #2563eb) 10%, transparent)", color: "var(--primary-color, #2563eb)" }
      }, a.createElement(Kt, { size: 11 }), x.name),
      a.createElement(
        "h1",
        { className: "text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-4" },
        r.format && r.format !== "standard" ? a.createElement("span", { className: "block text-xs font-normal text-gray-400 mb-1 uppercase tracking-wider" }, r.format) : null,
        r.title
      ),
      a.createElement(
        "div",
        { className: "flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 border-y border-gray-100 py-3" },
        a.createElement(
          "span",
          { className: "flex items-center gap-1.5" },
          a.createElement("img", { src: jt((v == null ? void 0 : v.email) || ""), alt: "", className: "w-6 h-6 rounded-full" }),
          a.createElement(z, { to: "/author/" + ((v == null ? void 0 : v.username) || ""), className: "font-medium text-gray-700 hover:text-primary-600" }, v == null ? void 0 : v.username)
        ),
        a.createElement("span", { className: "flex items-center gap-1.5" }, a.createElement(Je, { size: 14 }), Xe(r.publishedAt || r.createdAt)),
        a.createElement("span", { className: "flex items-center gap-1.5" }, a.createElement(as, { size: 14 }), rr(r.content || "")),
        r.commentCount > 0 && a.createElement("span", { className: "flex items-center gap-1.5" }, a.createElement(Zt, { size: 14 }), r.commentCount)
      )
    ),
    // Featured image
    r.featured && a.createElement(
      "div",
      { className: "mb-10" },
      a.createElement("img", {
        src: lt(r.featured, t),
        alt: r.title,
        className: "w-full max-h-96 object-cover rounded-2xl shadow-lg",
        // Hero image is the LCP element: load it eagerly at high priority
        loading: "eager",
        fetchPriority: "high",
        decoding: "async",
        sizes: "(min-width: 900px) 768px, 100vw",
        srcSet: r.srcset ? Object.entries(r.srcset).map(([F, q]) => lt(q, t) + " " + F + "w").join(", ") : void 0
      })
    ),
    // Content + table of contents
    ((y = r.meta) == null ? void 0 : y._visual_css) && a.createElement("style", { dangerouslySetInnerHTML: { __html: r.meta._visual_css } }),
    a.createElement(Wi, { containerRef: C, settings: t }),
    a.createElement("div", { ref: C, className: "prose prose-gray prose-lg max-w-none mb-12", dangerouslySetInnerHTML: { __html: ki(Vi(Ia.sanitize(P)), t) } }),
    B,
    // Tags
    ((H = r.tags) == null ? void 0 : H.length) > 0 && a.createElement(
      "div",
      { className: "flex flex-wrap items-center gap-2 mb-10" },
      a.createElement(ms, { size: 15, className: "text-gray-400" }),
      r.tags.map((F) => a.createElement(z, { key: F.tagId, to: "/tag/" + F.slug, className: "px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" }, F.name))
    ),
    // Share + back row (share buttons toggleable in theme settings)
    a.createElement(
      "div",
      { className: "flex items-center justify-between py-6 border-t border-gray-100 mb-10" },
      a.createElement(z, { to: "/", className: "text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1" }, a.createElement(ta, { size: 15 }), E("all posts", t)),
      t.theme_show_share_buttons !== "0" && a.createElement(qi, { title: r.title, url: "/post/" + r.slug, siteUrl: t.site_url })
    ),
    // Author box
    v && a.createElement(
      "div",
      { className: "flex items-start gap-4 p-6 rounded-2xl bg-gray-50 mb-10" },
      a.createElement("img", { src: jt((v == null ? void 0 : v.email) || ""), alt: "", className: "w-14 h-14 rounded-full flex-shrink-0" }),
      a.createElement(
        "div",
        null,
        a.createElement("p", { className: "text-xs text-gray-400 mb-0.5" }, E("written by", t)),
        a.createElement(z, { to: "/author/" + v.username, className: "font-semibold text-gray-900 hover:text-primary-600" }, v.username),
        v.bio && a.createElement("p", { className: "text-sm text-gray-600 mt-1.5 leading-relaxed" }, v.bio)
      )
    ),
    // Related posts (toggleable in theme settings)
    t.theme_show_related_posts !== "0" && a.createElement(
      "section",
      { className: "mb-12" },
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, E("related posts", t)),
      f && a.createElement(ji, { postId: r == null ? void 0 : r.id, slug: f })
    ),
    // Comments
    a.createElement(
      "section",
      { className: "border-t border-gray-100 pt-8" },
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-5" }, E("comments", t) + (n.length ? " (" + n.length + ")" : "")),
      n.length === 0 && !s && a.createElement(
        "div",
        { className: "text-center py-6 rounded-2xl bg-gray-50 mb-6" },
        a.createElement("p", { className: "text-sm text-gray-400" }, E("no comments yet", t) + ". " + E("be the first to share your thoughts", t) + "!")
      ),
      U,
      s && a.createElement("p", { className: "text-sm text-green-600 mb-4" }, E("comment submitted and pending review", t)),
      h
    )
  );
}
function Cl(e) {
  var s;
  const { settings: t, page: r } = e, n = Ir(null);
  return Ca(n, [r == null ? void 0 : r.content]), r ? a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(ka, { items: [{ label: E("home", t), to: "/" }, { label: r.title }] }),
    a.createElement("h1", { className: "text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight my-8" }, r.title),
    ((s = r.meta) == null ? void 0 : s._visual_css) && a.createElement("style", { dangerouslySetInnerHTML: { __html: r.meta._visual_css } }),
    a.createElement("div", { ref: n, className: "prose prose-gray prose-lg max-w-none", dangerouslySetInnerHTML: { __html: Ia.sanitize(r.content || "") } }),
    r.parent && a.createElement(
      z,
      { to: "/page/" + r.parent.slug, className: "inline-flex items-center gap-1 mt-10 text-sm text-gray-500 hover:text-primary-600" },
      a.createElement(ta, { size: 15 }),
      r.parent.title
    )
  ) : null;
}
const ec = { name: "default", typography: { cap: 2, max: 24 }, Header: Oi, Footer: vi, HomeLayout: Li, CategoryLayout: Pi, TagLayout: Mi, ArchiveLayout: Fi, SearchLayout: zi, AuthorLayout: Bi, PostLayout: kl, PageLayout: Cl };
export {
  ec as default
};
