import a, { forwardRef as Zn, createElement as vr, useState as le, useEffect as Ne, useRef as Ir } from "react";
import { Link as F, useNavigate as Qa, useSearchParams as es } from "react-router-dom";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ts = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Qn = (...e) => e.filter((t, r, n) => !!t && t.trim() !== "" && n.indexOf(t) === r).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var rs = {
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
const ns = Zn(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: n,
    className: s = "",
    children: o,
    iconNode: i,
    ...c
  }, f) => vr(
    "svg",
    {
      ref: f,
      ...rs,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: n ? Number(r) * 24 / Number(t) : r,
      className: Qn("lucide", s),
      ...c
    },
    [
      ...i.map(([d, u]) => vr(d, u)),
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
const te = (e, t) => {
  const r = Zn(
    ({ className: n, ...s }, o) => vr(ns, {
      ref: o,
      iconNode: t,
      className: Qn(`lucide-${ts(e)}`, n),
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
const ea = te("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fe = te("Calendar", [
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
const ta = te("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const as = te("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ss = te("Clock", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const os = te("FileText", [
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
const ls = te("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const is = te("Files", [
  ["path", { d: "M20 7h-3a2 2 0 0 1-2-2V2", key: "x099mo" }],
  ["path", { d: "M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z", key: "18t6ie" }],
  ["path", { d: "M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8", key: "1nja0z" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zt = te("Folder", [
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
const cs = te("House", [
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
const ms = te("Link2", [
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
const us = te("List", [
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
const ds = te("Menu", [
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
const _t = te("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fs = te("Rss", [
  ["path", { d: "M4 11a9 9 0 0 1 9 9", key: "pv89mb" }],
  ["path", { d: "M4 4a16 16 0 0 1 16 16", key: "k0647b" }],
  ["circle", { cx: "5", cy: "19", r: "1", key: "bfqh0e" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ra = te("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ps = te("Tag", [
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
const hs = te("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mr = te("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gs = te("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function na(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: ys } = Object.prototype, { getPrototypeOf: lt } = Object, { iterator: Tt, toStringTag: aa } = Symbol, Xt = (({ hasOwnProperty: e }) => (t, r) => e.call(t, r))(Object.prototype), Nt = (e, t) => {
  let r = e;
  const n = [];
  for (; r != null && r !== Object.prototype; ) {
    if (n.indexOf(r) !== -1)
      return !1;
    if (n.push(r), Xt(r, t))
      return !0;
    r = lt(r);
  }
  return !1;
}, Es = (e, t) => e != null && Nt(e, t) ? e[t] : void 0, Ur = /* @__PURE__ */ ((e) => (t) => {
  const r = ys.call(t);
  return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), _e = (e) => (e = e.toLowerCase(), (t) => Ur(t) === e), Qt = (e) => (t) => typeof t === e, { isArray: Ve } = Array, Ge = Qt("undefined");
function ct(e) {
  return e !== null && !Ge(e) && e.constructor !== null && !Ge(e.constructor) && Ee(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const sa = _e("ArrayBuffer");
function bs(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && sa(e.buffer), t;
}
const xs = Qt("string"), Ee = Qt("function"), oa = Qt("number"), mt = (e) => e !== null && typeof e == "object", ws = (e) => e === !0 || e === !1, $t = (e) => {
  if (!mt(e))
    return !1;
  const t = lt(e);
  return (t === null || t === Object.prototype || lt(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !Nt(e, aa) && !Nt(e, Tt);
}, Ns = (e) => {
  if (!mt(e) || ct(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, _s = _e("Date"), Ts = _e("File"), Ss = (e) => !!(e && typeof e.uri < "u"), As = (e) => e && typeof e.getParts < "u", Rs = _e("Blob"), vs = _e("FileList"), Os = _e("Set"), ks = (e) => mt(e) && Ee(e.pipe);
function Cs() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const gn = Cs(), yn = typeof gn.FormData < "u" ? gn.FormData : void 0, Ds = (e) => {
  if (!e) return !1;
  if (yn && e instanceof yn) return !0;
  const t = lt(e);
  if (!t || t === Object.prototype || !Ee(e.append)) return !1;
  const r = Ur(e);
  return r === "formdata" || // detect form-data instance
  r === "object" && Ee(e.toString) && e.toString() === "[object FormData]";
}, Ls = _e("URLSearchParams"), [Ps, Is, Ms, Us] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(_e), Fs = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function St(e, t, { allOwnKeys: r = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let n, s;
  if (typeof e != "object" && (e = [e]), Ve(e))
    for (n = 0, s = e.length; n < s; n++)
      t.call(null, e[n], n, e);
  else {
    if (ct(e))
      return;
    const o = r ? Object.getOwnPropertyNames(e) : Object.keys(e), i = o.length;
    let c;
    for (n = 0; n < i; n++)
      c = o[n], t.call(null, e[c], c, e);
  }
}
function la(e, t) {
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
const We = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, ia = (e) => !Ge(e) && e !== We;
function Or(...e) {
  const { caseless: t, skipUndefined: r } = ia(this) && this || {}, n = {}, s = (o, i) => {
    if (i === "__proto__" || i === "constructor" || i === "prototype")
      return;
    const c = t && typeof i == "string" && la(n, i) || i, f = Xt(n, c) ? n[c] : void 0;
    $t(f) && $t(o) ? n[c] = Or(f, o) : $t(o) ? n[c] = Or({}, o) : Ve(o) ? n[c] = o.slice() : (!r || !Ge(o)) && (n[c] = o);
  };
  for (let o = 0, i = e.length; o < i; o++) {
    const c = e[o];
    if (!c || ct(c) || (St(c, s), typeof c != "object" || Ve(c)))
      continue;
    const f = Object.getOwnPropertySymbols(c);
    for (let d = 0; d < f.length; d++) {
      const u = f[d];
      Ys.call(c, u) && s(c[u], u);
    }
  }
  return n;
}
const zs = (e, t, r, { allOwnKeys: n } = {}) => (St(
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
), e), Hs = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), Bs = (e, t, r, n) => {
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
}, js = (e, t, r, n) => {
  let s, o, i;
  const c = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0; )
      i = s[o], (!n || n(i, e, t)) && !c[i] && (t[i] = e[i], c[i] = !0);
    e = r !== !1 && lt(e);
  } while (e && (!r || r(e, t)) && e !== Object.prototype);
  return t;
}, qs = (e, t, r) => {
  e = String(e), (r === void 0 || r > e.length) && (r = e.length), r -= t.length;
  const n = e.indexOf(t, r);
  return n !== -1 && n === r;
}, Ws = (e) => {
  if (!e) return null;
  if (Ve(e)) return e;
  let t = e.length;
  if (!oa(t)) return null;
  const r = new Array(t);
  for (; t-- > 0; )
    r[t] = e[t];
  return r;
}, $s = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && lt(Uint8Array)), Vs = (e, t) => {
  const n = (e && e[Tt]).call(e);
  let s;
  for (; (s = n.next()) && !s.done; ) {
    const o = s.value;
    t.call(e, o[0], o[1]);
  }
}, Gs = (e, t) => {
  let r;
  const n = [];
  for (; (r = e.exec(t)) !== null; )
    n.push(r);
  return n;
}, Js = _e("HTMLFormElement"), Xs = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(r, n, s) {
  return n.toUpperCase() + s;
}), { propertyIsEnumerable: Ys } = Object.prototype, Ks = _e("RegExp"), ca = (e, t) => {
  const r = Object.getOwnPropertyDescriptors(e), n = {};
  St(r, (s, o) => {
    let i;
    (i = t(s, o, e)) !== !1 && (n[o] = i || s);
  }), Object.defineProperties(e, n);
}, Zs = (e) => {
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
}, Qs = (e, t) => {
  const r = {}, n = (s) => {
    s.forEach((o) => {
      r[o] = !0;
    });
  };
  return Ve(e) ? n(e) : n(String(e).split(t)), r;
}, eo = () => {
}, to = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function ro(e) {
  return !!(e && Ee(e.append) && e[aa] === "FormData" && e[Tt]);
}
const no = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), r = (n) => {
    if (mt(n)) {
      if (t.has(n))
        return;
      if (ct(n))
        return n;
      if (!("toJSON" in n)) {
        t.add(n);
        let s;
        if (Os(n)) {
          s = [];
          for (const o of n) {
            const i = r(o);
            !Ge(i) && s.push(i);
          }
        } else
          s = Ve(n) ? [] : {}, St(n, (o, i) => {
            const c = r(o);
            !Ge(c) && (s[i] = c);
          });
        return t.delete(n), s;
      }
    }
    return n;
  };
  return r(e);
}, ao = _e("AsyncFunction"), so = (e) => e && (mt(e) || Ee(e)) && Ee(e.then) && Ee(e.catch), ma = ((e, t) => e ? setImmediate : t ? ((r, n) => (We.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === We && o === r && n.length && n.shift()();
  },
  !1
), (s) => {
  n.push(s), We.postMessage(r, "*");
}))(`axios@${Math.random()}`, []) : (r) => setTimeout(r))(typeof setImmediate == "function", Ee(We.postMessage)), oo = typeof queueMicrotask < "u" ? queueMicrotask.bind(We) : typeof process < "u" && process.nextTick || ma, ua = (e) => e != null && Ee(e[Tt]), lo = (e) => e != null && Nt(e, Tt) && ua(e), m = {
  isArray: Ve,
  isArrayBuffer: sa,
  isBuffer: ct,
  isFormData: Ds,
  isArrayBufferView: bs,
  isString: xs,
  isNumber: oa,
  isBoolean: ws,
  isObject: mt,
  isPlainObject: $t,
  isEmptyObject: Ns,
  isReadableStream: Ps,
  isRequest: Is,
  isResponse: Ms,
  isHeaders: Us,
  isUndefined: Ge,
  isDate: _s,
  isFile: Ts,
  isReactNativeBlob: Ss,
  isReactNative: As,
  isBlob: Rs,
  isRegExp: Ks,
  isFunction: Ee,
  isStream: ks,
  isURLSearchParams: Ls,
  isTypedArray: $s,
  isFileList: vs,
  forEach: St,
  merge: Or,
  extend: zs,
  trim: Fs,
  stripBOM: Hs,
  inherits: Bs,
  toFlatObject: js,
  kindOf: Ur,
  kindOfTest: _e,
  endsWith: qs,
  toArray: Ws,
  forEachEntry: Vs,
  matchAll: Gs,
  isHTMLForm: Js,
  hasOwnProperty: Xt,
  hasOwnProp: Xt,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: Nt,
  getSafeProp: Es,
  reduceDescriptors: ca,
  freezeMethods: Zs,
  toObjectSet: Qs,
  toCamelCase: Xs,
  noop: eo,
  toFiniteNumber: to,
  findKey: la,
  global: We,
  isContextDefined: ia,
  isSpecCompliantForm: ro,
  toJSONObject: no,
  isAsyncFn: ao,
  isThenable: so,
  setImmediate: ma,
  asap: oo,
  isIterable: ua,
  isSafeIterable: lo
}, io = m.toObjectSet([
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
]), co = (e) => {
  const t = {};
  let r, n, s;
  return e && e.split(`
`).forEach(function(i) {
    s = i.indexOf(":"), r = i.substring(0, s).trim().toLowerCase(), n = i.substring(s + 1).trim();
    const c = m.hasOwnProp(t, r);
    !r || c && m.hasOwnProp(io, r) || (r === "set-cookie" ? c ? t[r].push(n) : t[r] = [n] : t[r] = c ? t[r] + ", " + n : n);
  }), t;
};
function mo(e) {
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
const uo = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), fo = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Fr(e, t) {
  return m.isArray(e) ? e.map((r) => Fr(r, t)) : mo(String(e).replace(t, ""));
}
const po = (e) => Fr(e, uo), ho = (e) => Fr(e, fo);
function da(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return m.forEach(e.toJSON(), (r, n) => {
    t[n] = ho(r);
  }), t;
}
const En = Symbol("internals");
function Et(e) {
  return e && String(e).trim().toLowerCase();
}
function Vt(e) {
  return e === !1 || e == null ? e : m.isArray(e) ? e.map(Vt) : po(String(e));
}
function go(e) {
  const t = /* @__PURE__ */ Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let n;
  for (; n = r.exec(e); )
    t[n[1]] = n[2];
  return t;
}
const yo = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
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
function Eo(e) {
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
function bo(e) {
  const t = /* @__PURE__ */ Object.create(null), r = String(e);
  let n = 0, s = !1, o = !1;
  function i(c) {
    const f = yr(r.slice(n, c)), d = f.indexOf("=");
    if (d < 1)
      return;
    const u = yr(f.slice(0, d));
    if (!yo.test(u))
      return;
    const y = u.toLowerCase();
    if (y === "__proto__" || y === "constructor" || y === "prototype")
      return;
    const b = yr(f.slice(d + 1));
    t[y] = Eo(b);
  }
  for (let c = 0; c < r.length; c++) {
    const f = r.charCodeAt(c);
    s ? o ? o = !1 : f === 92 ? o = !0 : f === 34 && (s = !1) : f === 34 ? s = !0 : (f === 44 || f === 59) && (i(c), n = c + 1);
  }
  return i(r.length), t;
}
const xo = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Er(e, t, r, n, s) {
  if (m.isFunction(n))
    return n.call(this, t, r);
  if (s && (t = r), !!m.isString(t)) {
    if (m.isString(n))
      return t.indexOf(n) !== -1;
    if (m.isRegExp(n))
      return n.test(t);
  }
}
function wo(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, r, n) => r.toUpperCase() + n);
}
function No(e, t) {
  const r = m.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((n) => {
    Object.defineProperty(e, n + r, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(s, o, i) {
        return this[n].call(this, t, s, o, i);
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
    function o(c, f, d) {
      const u = Et(f);
      if (!u)
        return;
      const y = m.findKey(s, u);
      (!y || s[y] === void 0 || d === !0 || d === void 0 && s[y] !== !1) && (s[y || f] = Vt(c));
    }
    const i = (c, f) => m.forEach(c, (d, u) => o(d, u, f));
    if (m.isPlainObject(t) || t instanceof this.constructor)
      i(t, r);
    else if (m.isString(t) && (t = t.trim()) && !xo(t))
      i(co(t), r);
    else if (m.isObject(t) && m.isSafeIterable(t)) {
      let c = /* @__PURE__ */ Object.create(null), f, d;
      for (const u of t) {
        if (!m.isArray(u))
          throw new TypeError("Object iterator must return a key-value pair");
        d = u[0], m.hasOwnProp(c, d) ? (f = c[d], c[d] = m.isArray(f) ? [...f, u[1]] : [f, u[1]]) : c[d] = u[1];
      }
      i(c, r);
    } else
      t != null && o(r, t, n);
    return this;
  }
  get(t, r) {
    if (t = Et(t), t) {
      const n = m.findKey(this, t);
      if (n) {
        const s = this[n];
        if (!r)
          return s;
        if (r === !0)
          return go(s);
        if (m.isFunction(r))
          return r.call(this, s, n);
        if (m.isRegExp(r))
          return r.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, r) {
    if (t = Et(t), t) {
      const n = m.findKey(this, t);
      return !!(n && this[n] !== void 0 && (!r || Er(this, this[n], n, r)));
    }
    return !1;
  }
  delete(t, r) {
    const n = this;
    let s = !1;
    function o(i) {
      if (i = Et(i), i) {
        const c = m.findKey(n, i);
        c && (!r || Er(n, n[c], c, r)) && (delete n[c], s = !0);
      }
    }
    return m.isArray(t) ? t.forEach(o) : o(t), s;
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
    return m.forEach(this, (s, o) => {
      const i = m.findKey(n, o);
      if (i) {
        r[i] = Vt(s), delete r[o];
        return;
      }
      const c = t ? wo(o) : String(o).trim();
      c !== o && delete r[o], r[c] = Vt(s), n[c] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const r = /* @__PURE__ */ Object.create(null);
    return m.forEach(this, (n, s) => {
      n != null && n !== !1 && (r[s] = t && m.isArray(n) ? n.join(", ") : n);
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
    return m.isArray(t) ? t : t == null || t === !1 ? [] : [t];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static parseParameters(t) {
    return bo(t);
  }
  static concat(t, ...r) {
    const n = new this(t);
    return r.forEach((s) => n.set(s)), n;
  }
  static accessor(t) {
    const n = (this[En] = this[En] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(i) {
      const c = Et(i);
      n[c] || (No(s, i), n[c] = !0);
    }
    return m.isArray(t) ? t.forEach(o) : o(t), this;
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
m.reduceDescriptors(fe.prototype, ({ value: e }, t) => {
  let r = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(n) {
      this[r] = n;
    }
  };
});
m.freezeMethods(fe);
const Yt = "[REDACTED ****]";
function _o(e) {
  if (m.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (m.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function To(e, t) {
  const r = new Set(t.map((o) => String(o).toLowerCase())), n = [], s = (o) => {
    if (o === null || typeof o != "object" || m.isBuffer(o)) return o;
    if (n.indexOf(o) !== -1) return;
    o instanceof fe && (o = o.toJSON()), n.push(o);
    let i;
    if (m.isArray(o))
      i = [], o.forEach((c, f) => {
        const d = s(c);
        m.isUndefined(d) || (i[f] = d);
      });
    else {
      if (!m.isPlainObject(o) && _o(o))
        return n.pop(), o;
      i = /* @__PURE__ */ Object.create(null);
      for (const [c, f] of Object.entries(o)) {
        const d = r.has(c.toLowerCase()) ? Yt : s(f);
        m.isUndefined(d) || (i[c] = d);
      }
    }
    return n.pop(), i;
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
function So(e) {
  return e.errors.map((r) => {
    try {
      return r && r.message ? bn(r.message) : bn(r);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let v = class fa extends Error {
  static from(t, r, n, s, o, i) {
    let c = t.message;
    !c && m.isArray(t.errors) && t.errors.length && (c = So(t));
    const f = new fa(c, r || t.code, n, s, o);
    return Object.defineProperty(f, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), f.name = t.name, t.status != null && f.status == null && (f.status = t.status), i && Object.assign(f, i), f;
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
    const t = this.config, r = t && m.hasOwnProp(t, "redact") ? t.redact : void 0, n = m.isArray(r) && r.length > 0 ? To(t, r) : m.toJSONObject(t);
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
v.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
v.ERR_BAD_OPTION = "ERR_BAD_OPTION";
v.ECONNABORTED = "ECONNABORTED";
v.ETIMEDOUT = "ETIMEDOUT";
v.ECONNREFUSED = "ECONNREFUSED";
v.ERR_NETWORK = "ERR_NETWORK";
v.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
v.ERR_DEPRECATED = "ERR_DEPRECATED";
v.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
v.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
v.ERR_CANCELED = "ERR_CANCELED";
v.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
v.ERR_INVALID_URL = "ERR_INVALID_URL";
v.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const Ao = null, pa = 100;
function kr(e) {
  return m.isPlainObject(e) || m.isArray(e);
}
function ha(e) {
  return m.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function br(e, t, r) {
  return e ? e.concat(t).map(function(s, o) {
    return s = ha(s), !r && o ? "[" + s + "]" : s;
  }).join(r ? "." : "") : t;
}
function Ro(e) {
  return m.isArray(e) && !e.some(kr);
}
const vo = m.toFlatObject(m, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function er(e, t, r) {
  if (!m.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData(), r = m.toFlatObject(
    r,
    {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    },
    !1,
    function(O, M) {
      return !m.isUndefined(M[O]);
    }
  );
  const n = r.metaTokens, s = r.visitor || P, o = r.dots, i = r.indexes, c = r.Blob || typeof Blob < "u" && Blob, f = r.maxDepth === void 0 ? pa : r.maxDepth, d = c && m.isSpecCompliantForm(t), u = [];
  if (!m.isFunction(s))
    throw new TypeError("visitor must be a function");
  function y(x) {
    if (x === null) return "";
    if (m.isDate(x))
      return x.toISOString();
    if (m.isBoolean(x))
      return x.toString();
    if (!d && m.isBlob(x))
      throw new v("Blob is not supported. Use a Buffer instead.");
    if (m.isArrayBuffer(x) || m.isTypedArray(x)) {
      if (d && typeof c == "function")
        return new c([x]);
      throw new v("Blob is not supported. Use a Buffer instead.", v.ERR_NOT_SUPPORT);
    }
    return x;
  }
  function b(x) {
    if (x > f)
      throw new v(
        "Object is too deeply nested (" + x + " levels). Max depth: " + f,
        v.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function k(x, O) {
    if (f === 1 / 0)
      return JSON.stringify(x);
    const M = [];
    return JSON.stringify(x, function(h, A) {
      if (!m.isObject(A))
        return A;
      for (; M.length && M[M.length - 1] !== this; )
        M.pop();
      return M.push(A), b(O + M.length - 1), A;
    });
  }
  function P(x, O, M) {
    let U = x;
    if (m.isReactNative(t) && m.isReactNativeBlob(x))
      return t.append(br(M, O, o), y(x)), !1;
    if (x && !M && typeof x == "object") {
      if (m.endsWith(O, "{}"))
        O = n ? O : O.slice(0, -2), x = k(x, 1);
      else if (m.isArray(x) && Ro(x) || (m.isFileList(x) || m.endsWith(O, "[]")) && (U = m.toArray(x)))
        return O = ha(O), U.forEach(function(A, E) {
          !(m.isUndefined(A) || A === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            i === !0 ? br([O], E, o) : i === null ? O : O + "[]",
            y(A)
          );
        }), !1;
    }
    return kr(x) ? !0 : (t.append(br(M, O, o), y(x)), !1);
  }
  const B = Object.assign(vo, {
    defaultVisitor: P,
    convertValue: y,
    isVisitable: kr
  });
  function C(x, O, M = 0) {
    if (!m.isUndefined(x)) {
      if (b(M), u.indexOf(x) !== -1)
        throw new Error("Circular reference detected in " + O.join("."));
      u.push(x), m.forEach(x, function(h, A) {
        (!(m.isUndefined(h) || h === null) && s.call(t, h, m.isString(A) ? A.trim() : A, O, B)) === !0 && C(h, O ? O.concat(A) : [A], M + 1);
      }), u.pop();
    }
  }
  if (!m.isObject(e))
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
function Oo(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function ya(e, t, r) {
  if (!t)
    return e;
  e = e || "";
  const n = m.isFunction(r) ? {
    serialize: r
  } : r, s = m.getSafeProp(n, "encode") || Oo, o = m.getSafeProp(n, "serialize");
  let i;
  if (o ? i = o(t, n) : i = m.isURLSearchParams(t) ? t.toString() : new zr(t, n).toString(s), i) {
    const c = e.indexOf("#");
    c !== -1 && (e = e.slice(0, c)), e += (e.indexOf("?") === -1 ? "?" : "&") + i;
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
    m.forEach(this.handlers, function(n) {
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
}, ko = typeof URLSearchParams < "u" ? URLSearchParams : zr, Co = typeof FormData < "u" ? FormData : null, Do = typeof Blob < "u" ? Blob : null, Lo = {
  isBrowser: !0,
  classes: {
    URLSearchParams: ko,
    FormData: Co,
    Blob: Do
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Br = typeof window < "u" && typeof document < "u", Cr = typeof navigator == "object" && navigator || void 0, Po = Br && (!Cr || ["ReactNative", "NativeScript", "NS"].indexOf(Cr.product) < 0), Io = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Mo = Br && window.location.href || "http://localhost", Uo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Br,
  hasStandardBrowserEnv: Po,
  hasStandardBrowserWebWorkerEnv: Io,
  navigator: Cr,
  origin: Mo
}, Symbol.toStringTag, { value: "Module" })), oe = {
  ...Uo,
  ...Lo
};
function Fo(e, t) {
  return er(e, new oe.classes.URLSearchParams(), {
    visitor: function(r, n, s, o) {
      return oe.isNode && m.isBuffer(r) ? (this.append(n, r.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const Nn = pa;
function Ea(e) {
  if (e > Nn)
    throw new v(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + Nn,
      v.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function zo(e) {
  const t = [], r = /[^.[\]]+|\[([^.[\]]*)]/g;
  let n;
  for (; (n = r.exec(e)) !== null; )
    Ea(t.length), t.push(n[0] === "[]" ? "" : n[1] || n[0]);
  return t;
}
function Ho(e) {
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
    let i = r[o++];
    if (i === "__proto__") return !0;
    const c = Number.isFinite(+i), f = o >= r.length;
    return i = !i && m.isArray(s) ? s.length : i, f ? (m.hasOwnProp(s, i) ? s[i] = m.isArray(s[i]) ? s[i].concat(n) : [s[i], n] : s[i] = n, !c) : ((!m.hasOwnProp(s, i) || !m.isObject(s[i])) && (s[i] = []), t(r, n, s[i], o) && m.isArray(s[i]) && (s[i] = Ho(s[i])), !c);
  }
  if (m.isFormData(e) && m.isFunction(e.entries)) {
    const r = {};
    return m.forEachEntry(e, (n, s) => {
      t(zo(n), s, r, 0);
    }), r;
  }
  return null;
}
const nt = (e, t) => e != null && m.hasOwnProp(e, t) ? e[t] : void 0;
function Bo(e, t, r) {
  if (m.isString(e))
    try {
      return (t || JSON.parse)(e), m.trim(e);
    } catch (n) {
      if (n.name !== "SyntaxError")
        throw n;
    }
  return (r || JSON.stringify)(e);
}
const At = {
  transitional: Hr,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, r) {
      const n = r.getContentType() || "", s = n.indexOf("application/json") > -1, o = m.isObject(t);
      if (o && m.isHTMLForm(t) && (t = new FormData(t)), m.isFormData(t))
        return s ? JSON.stringify(ba(t)) : t;
      if (m.isArrayBuffer(t) || m.isBuffer(t) || m.isStream(t) || m.isFile(t) || m.isBlob(t) || m.isReadableStream(t))
        return t;
      if (m.isArrayBufferView(t))
        return t.buffer;
      if (m.isURLSearchParams(t))
        return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let c;
      if (o) {
        const f = nt(this, "formSerializer");
        if (n.indexOf("application/x-www-form-urlencoded") > -1)
          return Fo(t, f).toString();
        if ((c = m.isFileList(t)) || n.indexOf("multipart/form-data") > -1) {
          const d = nt(this, "env"), u = d && d.FormData;
          return er(
            c ? { "files[]": t } : t,
            u && new u(),
            f
          );
        }
      }
      return o || s ? (r.setContentType("application/json", !1), Bo(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const r = nt(this, "transitional") || At.transitional, n = r && r.forcedJSONParsing, s = nt(this, "responseType"), o = s === "json";
      if (m.isResponse(t) || m.isReadableStream(t))
        return t;
      if (t && m.isString(t) && (n && !s || o)) {
        const c = !(r && r.silentJSONParsing) && o;
        try {
          return JSON.parse(t, nt(this, "parseReviver"));
        } catch (f) {
          if (c)
            throw f.name === "SyntaxError" ? v.from(f, v.ERR_BAD_RESPONSE, this, null, nt(this, "response")) : f;
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
m.forEach(["delete", "get", "head", "post", "put", "patch", "query"], (e) => {
  At.headers[e] = {};
});
function xr(e, t) {
  const r = this || At, n = t || r, s = fe.from(n.headers);
  let o = n.data;
  return m.forEach(e, function(c) {
    o = c.call(r, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function xa(e) {
  return !!(e && e.__CANCEL__);
}
let Rt = class extends v {
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
    super(t ?? "canceled", v.ERR_CANCELED, r, n), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function wa(e, t, r) {
  const n = r.config.validateStatus;
  !r.status || !n || n(r.status) ? e(r) : t(new v(
    "Request failed with status code " + r.status,
    r.status >= 400 && r.status < 500 ? v.ERR_BAD_REQUEST : v.ERR_BAD_RESPONSE,
    r.config,
    r.request,
    r
  ));
}
function jo(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function qo(e, t) {
  e = e || 10;
  const r = new Array(e), n = new Array(e);
  let s = 0, o = 0, i;
  return t = t !== void 0 ? t : 1e3, function(f) {
    const d = Date.now(), u = n[o];
    i || (i = d), r[s] = f, n[s] = d;
    let y = o, b = 0;
    for (; y !== s; )
      b += r[y++], y = y % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), d - i < t)
      return;
    const k = u && d - u;
    return k ? Math.round(b * 1e3 / k) : void 0;
  };
}
function Wo(e, t) {
  let r = 0, n = 1e3 / t, s, o;
  const i = (d, u = Date.now()) => {
    r = u, s = null, o && (clearTimeout(o), o = null), e(...d);
  };
  return [(...d) => {
    const u = Date.now(), y = u - r;
    y >= n ? i(d, u) : (s = d, o || (o = setTimeout(() => {
      o = null, i(s);
    }, n - y)));
  }, () => s && i(s)];
}
const Kt = (e, t, r = 3) => {
  let n = 0;
  const s = qo(50, 250);
  return Wo((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const i = o.loaded, c = o.lengthComputable ? o.total : void 0, f = Math.max(0, c != null ? Math.min(i, c) : i), d = Math.max(0, f - n), u = s(d);
    n = Math.max(n, f);
    const y = {
      loaded: f,
      total: c,
      progress: c ? f / c : void 0,
      bytes: d,
      rate: u || void 0,
      estimated: u && c ? (c - f) / u : void 0,
      event: o,
      lengthComputable: c != null,
      [t ? "download" : "upload"]: !0
    };
    e(y);
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
}, Tn = (e, t = m.asap) => (...r) => t(() => e(...r)), $o = oe.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (r) => (r = new URL(r, oe.origin), e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)))(
  new URL(oe.origin),
  oe.navigator && /(msie|trident)/i.test(oe.navigator.userAgent)
) : () => !0, Vo = oe.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, r, n, s, o, i) {
      if (typeof document > "u") return;
      const c = [`${e}=${encodeURIComponent(t)}`];
      m.isNumber(r) && c.push(`expires=${new Date(r).toUTCString()}`), m.isString(n) && c.push(`path=${n}`), m.isString(s) && c.push(`domain=${s}`), o === !0 && c.push("secure"), m.isString(i) && c.push(`SameSite=${i}`), document.cookie = c.join("; ");
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
function Go(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Jo(e, t) {
  if (!t)
    return e;
  let r = e.length;
  for (; r > 0 && e.charCodeAt(r - 1) === 47; )
    r--;
  return e.slice(0, r) + "/" + t.replace(/^\/+/, "");
}
const Xo = /^https?:(?!\/\/)/i, Yo = /[\t\n\r]/g;
function Ko(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function Zo(e) {
  return Ko(e).replace(Yo, "");
}
function Qo(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, r, n = "") => `${r}${n}${Yt}`);
}
function el(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${Yt}@`), r = t.indexOf("#"), s = (r === -1 ? t : t.slice(0, r)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${Yt}`
  );
  return r === -1 ? s : `${s}#${Qo(t.slice(r + 1))}`;
}
function Sn(e, t) {
  if (typeof e == "string") {
    const r = Zo(e);
    if (Xo.test(r))
      throw new v(
        `Invalid URL ${JSON.stringify(el(r))}: missing "//" after protocol`,
        v.ERR_INVALID_URL,
        t
      );
  }
}
function Na(e, t, r, n) {
  Sn(t, n);
  let s = !Go(t);
  return e && (s || r === !1) ? (Sn(e, n), Jo(e, t)) : t;
}
const An = (e) => e instanceof fe ? { ...e } : e, tl = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function Je(e, t) {
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
  function n(u, y, b, k) {
    return m.isPlainObject(u) && m.isPlainObject(y) ? m.merge.call({ caseless: k }, u, y) : m.isPlainObject(y) ? m.merge({}, y) : m.isArray(y) ? y.slice() : y;
  }
  function s(u, y, b, k) {
    if (m.isUndefined(y)) {
      if (!m.isUndefined(u))
        return n(void 0, u, b, k);
    } else return n(u, y, b, k);
  }
  function o(u, y) {
    if (!m.isUndefined(y))
      return n(void 0, y);
  }
  function i(u, y) {
    if (m.isUndefined(y)) {
      if (!m.isUndefined(u))
        return n(void 0, u);
    } else return n(void 0, y);
  }
  function c(u) {
    const y = m.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!m.isUndefined(y))
      if (m.isPlainObject(y)) {
        if (m.hasOwnProp(y, u))
          return y[u];
      } else
        return;
    const b = m.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (m.isPlainObject(b) && m.hasOwnProp(b, u))
      return b[u];
  }
  function f(u, y, b) {
    if (m.hasOwnProp(t, b))
      return n(u, y);
    if (m.hasOwnProp(e, b))
      return n(void 0, u);
  }
  const d = {
    url: o,
    method: o,
    data: o,
    baseURL: i,
    transformRequest: i,
    transformResponse: i,
    paramsSerializer: i,
    timeout: i,
    timeoutMessage: i,
    withCredentials: i,
    withXSRFToken: i,
    adapter: i,
    responseType: i,
    xsrfCookieName: i,
    xsrfHeaderName: i,
    onUploadProgress: i,
    onDownloadProgress: i,
    decompress: i,
    maxContentLength: i,
    maxBodyLength: i,
    beforeRedirect: i,
    transport: i,
    httpAgent: i,
    httpsAgent: i,
    cancelToken: i,
    socketPath: i,
    allowedSocketPaths: i,
    responseEncoding: i,
    validateStatus: f,
    headers: (u, y, b) => s(An(u), An(y), b, !0)
  };
  return m.forEach(tl({ ...e, ...t }), function(y) {
    if (y === "__proto__" || y === "constructor" || y === "prototype") return;
    const b = m.hasOwnProp(d, y) ? d[y] : s, k = m.hasOwnProp(e, y) ? e[y] : void 0, P = m.hasOwnProp(t, y) ? t[y] : void 0, B = b(k, P, y);
    m.isUndefined(B) && b !== f || (r[y] = B);
  }), m.hasOwnProp(t, "validateStatus") && m.isUndefined(t.validateStatus) && c("validateStatusUndefinedResolves") === !1 && (m.hasOwnProp(e, "validateStatus") ? r.validateStatus = n(void 0, e.validateStatus) : delete r.validateStatus), r;
}
const rl = ["content-type", "content-length"];
function nl(e, t, r) {
  if (r !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([n, s]) => {
    rl.includes(n.toLowerCase()) && e.set(n, s);
  });
}
const al = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
);
function _a(e) {
  const t = Je({}, e), r = (b) => m.hasOwnProp(t, b) ? t[b] : void 0, n = r("data");
  let s = r("withXSRFToken");
  const o = r("xsrfHeaderName"), i = r("xsrfCookieName");
  let c = r("headers");
  const f = r("auth"), d = r("baseURL"), u = r("allowAbsoluteUrls"), y = r("url");
  if (t.headers = c = fe.from(c), t.url = ya(
    Na(d, y, u, t),
    r("params"),
    r("paramsSerializer")
  ), f) {
    const b = m.getSafeProp(f, "username") || "", k = m.getSafeProp(f, "password") || "";
    try {
      c.set(
        "Authorization",
        "Basic " + btoa(b + ":" + (k ? al(k) : ""))
      );
    } catch (P) {
      throw v.from(P, v.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (m.isFormData(n) && (oe.hasStandardBrowserEnv || oe.hasStandardBrowserWebWorkerEnv || m.isReactNative(n) ? c.setContentType(void 0) : m.isFunction(n.getHeaders) && nl(c, n.getHeaders(), r("formDataHeaderPolicy"))), oe.hasStandardBrowserEnv && (m.isFunction(s) && (s = s(t)), s === !0 || s == null && $o(t.url))) {
    const k = o && i && Vo.read(i);
    k && c.set(o, k);
  }
  return t;
}
const sl = typeof XMLHttpRequest < "u", ol = sl && function(e) {
  return new Promise(function(r, n) {
    const s = _a(e);
    let o = s.data;
    const i = fe.from(s.headers).normalize();
    let { responseType: c, onUploadProgress: f, onDownloadProgress: d } = s, u, y, b, k, P;
    function B() {
      k && k(), P && P(), s.cancelToken && s.cancelToken.unsubscribe(u), s.signal && s.signal.removeEventListener("abort", u);
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
        function(E) {
          r(E), B();
        },
        function(E) {
          n(E), B();
        },
        h
      ), C = null;
    }
    "onloadend" in C ? C.onloadend = x : C.onreadystatechange = function() {
      !C || C.readyState !== 4 || C.status === 0 && !(C.responseURL && C.responseURL.startsWith("file:")) || setTimeout(x);
    }, C.onabort = function() {
      C && (n(new v("Request aborted", v.ECONNABORTED, e, C)), B(), C = null);
    }, C.onerror = function(U) {
      const h = U && U.message ? U.message : "Network Error", A = new v(h, v.ERR_NETWORK, e, C);
      A.event = U || null, n(A), B(), C = null;
    }, C.ontimeout = function() {
      let U = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const h = s.transitional || Hr;
      s.timeoutErrorMessage && (U = s.timeoutErrorMessage), n(
        new v(
          U,
          h.clarifyTimeoutError ? v.ETIMEDOUT : v.ECONNABORTED,
          e,
          C
        )
      ), B(), C = null;
    }, o === void 0 && i.setContentType(null), "setRequestHeader" in C && m.forEach(da(i), function(U, h) {
      C.setRequestHeader(h, U);
    }), m.isUndefined(s.withCredentials) || (C.withCredentials = !!s.withCredentials), c && c !== "json" && (C.responseType = s.responseType), d && ([b, P] = Kt(d, !0), C.addEventListener("progress", b)), f && C.upload && ([y, k] = Kt(f), C.upload.addEventListener("progress", y), C.upload.addEventListener("loadend", k)), (s.cancelToken || s.signal) && (u = (M) => {
      C && (n(!M || M.type ? new Rt(null, e, C) : M), C.abort(), B(), C = null);
    }, s.cancelToken && s.cancelToken.subscribe(u), s.signal && (s.signal.aborted ? u() : s.signal.addEventListener("abort", u)));
    const O = jo(s.url);
    if (O && !oe.protocols.includes(O)) {
      n(
        new v(
          "Unsupported protocol " + O + ":",
          v.ERR_BAD_REQUEST,
          e
        )
      ), B();
      return;
    }
    C.send(o || null);
  });
}, ll = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const r = new AbortController();
  let n = !1;
  const s = function(f) {
    if (!n) {
      n = !0, i();
      const d = f instanceof Error ? f : this.reason;
      r.abort(
        d instanceof v ? d : new Rt(d instanceof Error ? d.message : d)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, s(new v(`timeout of ${t}ms exceeded`, v.ETIMEDOUT));
  }, t);
  const i = () => {
    e && (o && clearTimeout(o), o = null, e.forEach((f) => {
      f.unsubscribe ? f.unsubscribe(s) : f.removeEventListener("abort", s);
    }), e = null);
  };
  e.forEach((f) => {
    if (!n) {
      if (f.aborted) {
        s.call(f);
        return;
      }
      f.addEventListener("abort", s, { once: !0 });
    }
  });
  const { signal: c } = r;
  return c.unsubscribe = () => m.asap(i), c;
}, il = function* (e, t) {
  let r = e.byteLength;
  if (r < t) {
    yield e;
    return;
  }
  let n = 0, s;
  for (; n < r; )
    s = n + t, yield e.slice(n, s), n = s;
}, cl = async function* (e, t) {
  for await (const r of ml(e))
    yield* il(r, t);
}, ml = async function* (e) {
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
  const s = cl(e, t);
  let o = 0, i, c = (f) => {
    i || (i = !0, n && n(f));
  };
  return new ReadableStream(
    {
      async pull(f) {
        try {
          const { done: d, value: u } = await s.next();
          if (d) {
            c(), f.close();
            return;
          }
          let y = u.byteLength;
          if (r) {
            let b = o += y;
            r(b);
          }
          f.enqueue(new Uint8Array(u));
        } catch (d) {
          throw c(d), d;
        }
      },
      cancel(f) {
        return c(f), s.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, vn = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Ta = (e, t, r) => t + 2 < r && vn(e.charCodeAt(t + 1)) && vn(e.charCodeAt(t + 2)), On = (e) => e <= 57 ? e - 48 : (e & 223) - 55, ul = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, dl = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, fl = (e) => {
  const t = Math.floor(e / 4), r = e % 4;
  return t * 3 + (r === 2 ? 1 : r === 3 ? 2 : 0);
}, pl = (e) => {
  const t = e.length;
  let r = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (r++, t > 1 && e.charCodeAt(t - 2) === 61 && r++), Math.floor((t - r) * 3 / 4);
}, hl = (e) => {
  const t = e.length;
  let r = 0, n = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let i = e.charCodeAt(o);
    if (i === 37 && Ta(e, o, t) && (i = On(e.charCodeAt(o + 1)) * 16 + On(e.charCodeAt(o + 2)), o += 2), !dl(i)) {
      if (i === 61) {
        n++;
        continue;
      }
      if (!ul(i) || n > 0) {
        s = !0;
        continue;
      }
      r++;
    }
  }
  return s || n > 2 || n > 0 && (r + n) % 4 !== 0 || r % 4 === 1 ? pl(e) : fl(r);
}, gl = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const r = e.indexOf(",");
  if (r < 0) return 0;
  const n = e.slice(5, r), s = e.slice(r + 1);
  if (/;base64/i.test(n))
    return t(s);
  let i = 0;
  for (let c = 0, f = s.length; c < f; c++) {
    const d = s.charCodeAt(c);
    if (d === 37 && Ta(s, c, f))
      i += 1, c += 2;
    else if (d < 128)
      i += 1;
    else if (d < 2048)
      i += 2;
    else if (d >= 55296 && d <= 56319 && c + 1 < f) {
      const u = s.charCodeAt(c + 1);
      u >= 56320 && u <= 57343 ? (i += 4, c++) : i += 3;
    } else
      i += 3;
  }
  return i;
};
function yl(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return gl(
    t === -1 ? e : e.slice(0, t),
    hl
  );
}
const jr = "1.19.0", kn = 64 * 1024, { isFunction: jt } = m, El = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
), Cn = (e) => {
  if (!m.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, Dn = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, bl = (e) => {
  const t = e.indexOf("://");
  let r = e;
  return t !== -1 && (r = r.slice(t + 3)), r.includes("@") || r.includes(":");
}, xl = (e) => {
  const t = m.global !== void 0 && m.global !== null ? m.global : globalThis, { ReadableStream: r, TextEncoder: n } = t;
  e = m.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: s, Request: o, Response: i } = e, c = s ? jt(s) : typeof fetch == "function", f = jt(o), d = jt(i);
  if (!c)
    return !1;
  const u = c && jt(r), y = c && (typeof n == "function" ? /* @__PURE__ */ ((x) => (O) => x.encode(O))(new n()) : async (x) => new Uint8Array(await new o(x).arrayBuffer())), b = f && u && Dn(() => {
    let x = !1;
    const O = new o(oe.origin, {
      body: new r(),
      method: "POST",
      get duplex() {
        return x = !0, "half";
      }
    }), M = O.headers.has("Content-Type");
    return O.body != null && O.body.cancel(), x && !M;
  }), k = d && u && Dn(() => m.isReadableStream(new i("").body)), P = {
    stream: k && ((x) => x.body)
  };
  c && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((x) => {
    !P[x] && (P[x] = (O, M) => {
      let U = O && O[x];
      if (U)
        return U.call(O);
      throw new v(
        `Response type '${x}' is not supported`,
        v.ERR_NOT_SUPPORT,
        M
      );
    });
  });
  const B = async (x) => {
    if (x == null)
      return 0;
    if (m.isBlob(x))
      return x.size;
    if (m.isSpecCompliantForm(x))
      return (await new o(oe.origin, {
        method: "POST",
        body: x
      }).arrayBuffer()).byteLength;
    if (m.isArrayBufferView(x) || m.isArrayBuffer(x))
      return x.byteLength;
    if (m.isURLSearchParams(x) && (x = x + ""), m.isString(x))
      return (await y(x)).byteLength;
  }, C = async (x, O) => {
    const M = m.toFiniteNumber(x.getContentLength());
    return M ?? B(O);
  };
  return async (x) => {
    let {
      url: O,
      method: M,
      data: U,
      signal: h,
      cancelToken: A,
      timeout: E,
      onDownloadProgress: H,
      onUploadProgress: z,
      responseType: q,
      headers: J,
      withCredentials: T = "same-origin",
      fetchOptions: _,
      maxContentLength: N,
      maxBodyLength: S
    } = _a(x);
    const Ae = m.isNumber(N) && N > -1, ze = m.isNumber(S) && S > -1, vt = (G) => m.hasOwnProp(x, G) ? x[G] : void 0;
    let Ot = s || fetch;
    q = q ? (q + "").toLowerCase() : "text";
    let Re = ll(
      [h, A && A.toAbortSignal()],
      E
    ), re = null;
    const V = Re && Re.unsubscribe && (() => {
      Re.unsubscribe();
    });
    let Ce, He = null;
    const kt = () => new v(
      "Request body larger than maxBodyLength limit",
      v.ERR_BAD_REQUEST,
      x,
      re
    );
    try {
      let G;
      const he = vt("auth");
      if (he) {
        const D = m.getSafeProp(he, "username") || "", ne = m.getSafeProp(he, "password") || "";
        G = {
          username: D,
          password: ne
        };
      }
      if (bl(O)) {
        const D = new URL(O, oe.origin);
        if (!G && (D.username || D.password)) {
          const ne = Cn(D.username), Te = Cn(D.password);
          G = {
            username: ne,
            password: Te
          };
        }
        (D.username || D.password) && (D.username = "", D.password = "", O = D.href);
      }
      if (G && (J.delete("authorization"), J.set(
        "Authorization",
        "Basic " + btoa(El((G.username || "") + ":" + (G.password || "")))
      )), Ae && typeof O == "string" && O.startsWith("data:") && yl(O) > N)
        throw new v(
          "maxContentLength size of " + N + " exceeded",
          v.ERR_BAD_RESPONSE,
          x,
          re
        );
      if (ze && M !== "get" && M !== "head") {
        const D = await B(U);
        if (typeof D == "number" && isFinite(D) && (Ce = D, D > S))
          throw kt();
      }
      const Ye = ze && (m.isReadableStream(U) || m.isStream(U)), ut = (D, ne, Te) => Rn(
        D,
        kn,
        (me) => {
          if (ze && me > S)
            throw He = kt();
          ne && ne(me);
        },
        Te
      );
      if (b && M !== "get" && M !== "head" && (z || Ye)) {
        if (Ce = Ce ?? await C(J, U), Ce !== 0 || Ye) {
          let D = new o(O, {
            method: "POST",
            body: U,
            duplex: "half"
          }), ne;
          if (m.isFormData(U) && (ne = D.headers.get("content-type")) && J.setContentType(ne), D.body) {
            const [Te, me] = z && _n(
              Ce,
              Kt(Tn(z))
            ) || [];
            U = ut(D.body, Te, me);
          }
        }
      } else if (Ye && !f && u && M !== "get" && M !== "head")
        U = ut(U);
      else if (Ye && f && !b && M !== "get" && M !== "head")
        throw new v(
          "Stream request bodies are not supported by the current fetch implementation",
          v.ERR_NOT_SUPPORT,
          x,
          re
        );
      m.isString(T) || (T = T ? "include" : "omit");
      const nr = f && "credentials" in o.prototype;
      if (m.isFormData(U)) {
        const D = J.getContentType();
        D && /^multipart\/form-data/i.test(D) && !/boundary=/i.test(D) && J.delete("content-type");
      }
      J.set("User-Agent", "axios/" + jr, !1);
      const dt = {
        ..._,
        signal: Re,
        method: M.toUpperCase(),
        headers: da(J.normalize()),
        body: U,
        duplex: "half",
        credentials: nr ? T : void 0
      };
      re = f && new o(O, dt);
      let W = await (f ? Ot(re, _) : Ot(O, dt));
      const Ke = fe.from(W.headers);
      if (Ae) {
        const D = m.toFiniteNumber(Ke.getContentLength());
        if (D != null && D > N)
          throw new v(
            "maxContentLength size of " + N + " exceeded",
            v.ERR_BAD_RESPONSE,
            x,
            re
          );
      }
      const X = k && (q === "stream" || q === "response");
      if (k && W.body && (H || Ae || X && V)) {
        const D = {};
        ["status", "statusText", "headers"].forEach((De) => {
          D[De] = W[De];
        });
        const ne = m.toFiniteNumber(Ke.getContentLength()), [Te, me] = H && _n(
          ne,
          Kt(Tn(H), !0)
        ) || [];
        let ft = 0;
        const pt = (De) => {
          if (Ae && (ft = De, ft > N))
            throw new v(
              "maxContentLength size of " + N + " exceeded",
              v.ERR_BAD_RESPONSE,
              x,
              re
            );
          Te && Te(De);
        };
        W = new i(
          Rn(W.body, kn, pt, () => {
            me && me(), V && V();
          }),
          D
        );
      }
      q = q || "text";
      let be = await P[m.findKey(P, q) || "text"](
        W,
        x
      );
      if (Ae && !k && !X) {
        let D;
        if (be != null && (typeof be.byteLength == "number" ? D = be.byteLength : typeof be.size == "number" ? D = be.size : typeof be == "string" && (D = typeof n == "function" ? new n().encode(be).byteLength : be.length)), typeof D == "number" && D > N)
          throw new v(
            "maxContentLength size of " + N + " exceeded",
            v.ERR_BAD_RESPONSE,
            x,
            re
          );
      }
      return !X && V && V(), await new Promise((D, ne) => {
        wa(D, ne, {
          data: be,
          headers: fe.from(W.headers),
          status: W.status,
          statusText: W.statusText,
          config: x,
          request: re
        });
      });
    } catch (G) {
      if (V && V(), Re && Re.aborted && Re.reason instanceof v) {
        const he = Re.reason;
        throw he.config = x, re && (he.request = re), G !== he && Object.defineProperty(he, "cause", {
          __proto__: null,
          value: G,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), he;
      }
      if (He)
        throw re && !He.request && (He.request = re), He;
      if (G instanceof v)
        throw re && !G.request && (G.request = re), G;
      if (G && G.name === "TypeError" && /Load failed|fetch/i.test(G.message)) {
        const he = new v(
          "Network Error",
          v.ERR_NETWORK,
          x,
          re,
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
      throw v.from(G, G && G.code, x, re, G && G.response);
    }
  };
}, wl = /* @__PURE__ */ new Map(), Sa = (e) => {
  let t = e && e.env || {};
  const { fetch: r, Request: n, Response: s } = t, o = [n, s, r];
  let i = o.length, c = i, f, d, u = wl;
  for (; c--; )
    f = o[c], d = u.get(f), d === void 0 && u.set(f, d = c ? /* @__PURE__ */ new Map() : xl(t)), u = d;
  return d;
};
Sa();
const qr = {
  http: Ao,
  xhr: ol,
  fetch: {
    get: Sa
  }
};
m.forEach(qr, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const Ln = (e) => `- ${e}`, Nl = (e) => m.isFunction(e) || e === null || e === !1;
function _l(e, t) {
  e = m.isArray(e) ? e : [e];
  const { length: r } = e;
  let n, s;
  const o = {};
  for (let i = 0; i < r; i++) {
    n = e[i];
    let c;
    if (s = n, !Nl(n) && (s = qr[(c = String(n)).toLowerCase()], s === void 0))
      throw new v(`Unknown adapter '${c}'`);
    if (s && (m.isFunction(s) || (s = s.get(t))))
      break;
    o[c || "#" + i] = s;
  }
  if (!s) {
    const i = Object.entries(o).map(
      ([f, d]) => `adapter ${f} ` + (d === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let c = r ? i.length > 1 ? `since :
` + i.map(Ln).join(`
`) : " " + Ln(i[0]) : "as no adapter specified";
    throw new v(
      "There is no suitable adapter to dispatch the request " + c,
      v.ERR_NOT_SUPPORT
    );
  }
  return s;
}
const Aa = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: _l,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: qr
};
function wr(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new Rt(null, e);
}
function Nr(e) {
  return wr(e), e.headers = fe.from(e.headers), e.data = xr.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Aa.getAdapter(e.adapter || At.adapter, e)(e).then(
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
  function s(o, i) {
    return "[Axios v" + jr + "] Transitional option '" + o + "'" + i + (n ? ". " + n : "");
  }
  return (o, i, c) => {
    if (t === !1)
      throw new v(
        s(i, " has been removed" + (r ? " in " + r : "")),
        v.ERR_DEPRECATED
      );
    return r && !Pn[i] && (Pn[i] = !0, console.warn(
      s(
        i,
        " has been deprecated since v" + r + " and will be removed in the near future"
      )
    )), t ? t(o, i, c) : !0;
  };
};
tr.spelling = function(t) {
  return (r, n) => (console.warn(`${n} is likely a misspelling of ${t}`), !0);
};
function Tl(e, t, r) {
  if (typeof e != "object" || e === null)
    throw new v("options must be an object", v.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let s = n.length;
  for (; s-- > 0; ) {
    const o = n[s], i = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (i) {
      const c = e[o], f = c === void 0 || i(c, o, e);
      if (f !== !0)
        throw new v(
          "option " + o + " must be " + f,
          v.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (r !== !0)
      throw new v("Unknown option " + o, v.ERR_BAD_OPTION);
  }
}
const Gt = {
  assertOptions: Tl,
  validators: tr
}, ue = Gt.validators;
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
          const i = s.stack.indexOf(`
`);
          return i === -1 ? "" : s.stack.slice(i + 1);
        })();
        try {
          if (!n.stack)
            n.stack = o;
          else if (o) {
            const i = o.indexOf(`
`), c = i === -1 ? -1 : o.indexOf(`
`, i + 1), f = c === -1 ? "" : o.slice(c + 1);
            String(n.stack).endsWith(f) || (n.stack += `
` + o);
          }
        } catch {
        }
      }
      throw n;
    }
  }
  _request(t, r) {
    typeof t == "string" ? (r = r || {}, r.url = t) : r = t || {}, r = Je(this.defaults, r);
    const { transitional: n, paramsSerializer: s, headers: o } = r;
    n !== void 0 && Gt.assertOptions(
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
    ), s != null && (m.isFunction(s) ? r.paramsSerializer = {
      serialize: s
    } : Gt.assertOptions(
      s,
      {
        encode: ue.function,
        serialize: ue.function
      },
      !0
    )), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), Gt.assertOptions(
      r,
      {
        baseUrl: ue.spelling("baseURL"),
        withXsrfToken: ue.spelling("withXSRFToken")
      },
      !0
    ), r.method = (r.method || this.defaults.method || "get").toLowerCase();
    let i = o && m.merge(o.common, o[r.method]);
    o && m.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (P) => {
      delete o[P];
    }), r.headers = fe.concat(i, o);
    const c = [];
    let f = !0;
    this.interceptors.request.forEach(function(B) {
      if (typeof B.runWhen == "function" && B.runWhen(r) === !1)
        return;
      f = f && B.synchronous;
      const C = r.transitional || Hr;
      C && C.legacyInterceptorReqResOrdering ? c.unshift(B.fulfilled, B.rejected) : c.push(B.fulfilled, B.rejected);
    });
    const d = [];
    this.interceptors.response.forEach(function(B) {
      d.push(B.fulfilled, B.rejected);
    });
    let u, y = 0, b;
    if (!f) {
      const P = [Nr.bind(this), void 0];
      for (P.unshift(...c), P.push(...d), b = P.length, u = Promise.resolve(r); y < b; )
        u = u.then(P[y++], P[y++]);
      return u;
    }
    b = c.length;
    let k = r;
    for (; y < b; ) {
      const P = c[y++], B = c[y++];
      try {
        k = P ? P(k) : k;
      } catch (C) {
        if (!B) {
          u = Promise.reject(C);
          break;
        }
        try {
          const x = B.call(this, C);
          m.isThenable(x) && (u = Promise.resolve(x).then(
            () => Nr.call(this, k)
          ));
        } catch (x) {
          u = Promise.reject(x);
        }
        break;
      }
    }
    if (!u)
      try {
        u = Nr.call(this, k);
      } catch (P) {
        u = Promise.reject(P);
      }
    for (y = 0, b = d.length; y < b; )
      u = u.then(d[y++], d[y++]);
    return u;
  }
  getUri(t) {
    t = Je(this.defaults, t);
    const r = Na(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return ya(r, t.params, t.paramsSerializer);
  }
};
m.forEach(["delete", "get", "head", "options"], function(t) {
  $e.prototype[t] = function(r, n) {
    return this.request(
      Je(n || {}, {
        method: t,
        url: r,
        data: n && m.hasOwnProp(n, "data") ? n.data : void 0
      })
    );
  };
});
m.forEach(["post", "put", "patch", "query"], function(t) {
  function r(n) {
    return function(o, i, c) {
      return this.request(
        Je(c || {}, {
          method: t,
          headers: n ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: o,
          data: i
        })
      );
    };
  }
  $e.prototype[t] = r(), t !== "query" && ($e.prototype[t + "Form"] = r(!0));
});
let Sl = class Ra {
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
      const i = new Promise((c) => {
        n.subscribe(c), o = c;
      }).then(s);
      return i.cancel = function() {
        n.unsubscribe(o);
      }, i;
    }, t(function(o, i, c) {
      n.reason || (n.reason = new Rt(o, i, c), r(n.reason));
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
function Al(e) {
  return function(r) {
    return e.apply(null, r);
  };
}
function Rl(e) {
  return m.isObject(e) && e.isAxiosError === !0;
}
const Dr = {
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
Object.entries(Dr).forEach(([e, t]) => {
  Dr[t] = e;
});
function va(e) {
  const t = new $e(e), r = na($e.prototype.request, t);
  return m.extend(r, $e.prototype, t, { allOwnKeys: !0 }), m.extend(r, t, null, { allOwnKeys: !0 }), r.create = function(s) {
    return va(Je(e, s));
  }, r;
}
const Q = va(At);
Q.Axios = $e;
Q.CanceledError = Rt;
Q.CancelToken = Sl;
Q.isCancel = xa;
Q.VERSION = jr;
Q.toFormData = er;
Q.AxiosError = v;
Q.Cancel = Q.CanceledError;
Q.all = function(t) {
  return Promise.all(t);
};
Q.spread = Al;
Q.isAxiosError = Rl;
Q.mergeConfig = Je;
Q.AxiosHeaders = fe;
Q.formToJSON = (e) => ba(m.isHTMLForm(e) ? new FormData(e) : e);
Q.getAdapter = Aa.getAdapter;
Q.HttpStatusCode = Dr;
Q.default = Q;
const {
  Axios: $i,
  AxiosError: Vi,
  CanceledError: Gi,
  isCancel: Ji,
  CancelToken: Xi,
  VERSION: Yi,
  all: Ki,
  Cancel: Zi,
  isAxiosError: Qi,
  spread: ec,
  toFormData: tc,
  AxiosHeaders: rc,
  HttpStatusCode: nc,
  formToJSON: ac,
  getAdapter: sc,
  mergeConfig: oc,
  create: lc
} = Q, we = Q.create({ baseURL: "/api", withCredentials: !0 });
we.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const vl = {
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
  pages: "页面",
  "get the latest posts in your feed reader": "通过 RSS 阅读器订阅最新文章",
  on: "评论于",
  anonymous: "匿名",
  subscribe: "订阅",
  calendar: "日历",
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
function g(e, t) {
  if (t != null && t.translations_override)
    try {
      const s = JSON.parse(t.translations_override)[e];
      if (typeof s == "string" && s) return s;
    } catch {
    }
  return (localStorage.getItem("mortar_lang") || (t == null ? void 0 : t.site_lang) || "en") === "zh" && vl[e] || e;
}
function Ol(e) {
  return localStorage.getItem("mortar_lang") || (e == null ? void 0 : e.site_lang) || "en";
}
function kl(e) {
  localStorage.setItem("mortar_lang", e), window.location.reload();
}
function Cl({ settings: e }) {
  const [t, r] = le([]), [n, s] = le(!1), [o, i] = le(null);
  Ne(() => {
    we.get("/menus/location/primary").then((u) => r(u.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && we.get("/auth/me").then((u) => i(u.data)).catch(() => localStorage.removeItem("mortar_token"));
  }, []);
  function c() {
    we.post("/auth/logout").catch(() => {
    }), localStorage.removeItem("mortar_token"), window.location.href = "/";
  }
  const f = (u) => t.filter((y) => (y.parentId || null) === u && !(y.url === "/" && (y.label.toLowerCase() === "home" || y.label === g("home", e)))), d = (u) => {
    const y = f(u.id);
    return y.length === 0 ? a.createElement(F, { key: u.id, to: u.url, className: "text-sm text-gray-600 hover:text-gray-900" }, u.label) : a.createElement(
      "div",
      { key: u.id, className: "relative group" },
      a.createElement(F, { to: u.url, className: "text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1" }, u.label, a.createElement("span", { className: "text-xs" }, "▾")),
      a.createElement(
        "div",
        { className: "absolute left-0 top-full pt-2 hidden group-hover:block z-50" },
        a.createElement(
          "div",
          { className: "bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]" },
          y.map((b) => a.createElement(F, { key: b.id, to: b.url, className: "block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900" }, b.label))
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
      a.createElement(F, { to: "/", className: "text-xl font-bold text-gray-900 tracking-tight" }, e.site_title || "Mortar"),
      a.createElement(
        "div",
        { className: "hidden md:flex items-center gap-6" },
        a.createElement(F, { to: "/", className: "text-sm text-gray-600 hover:text-gray-900" }, g("home", e)),
        f(null).map(d),
        o ? a.createElement(
          "div",
          { className: "flex items-center gap-2" },
          a.createElement("span", { className: "text-sm text-gray-600" }, o.username),
          a.createElement("button", { onClick: c, className: "text-sm text-gray-400 hover:text-gray-600" }, g("logout"))
        ) : a.createElement(
          a.Fragment,
          null,
          e.frontend_show_login !== "0" && a.createElement(F, { to: "/login", className: "text-sm text-gray-600 hover:text-gray-900" }, g("sign in")),
          a.createElement(F, { to: "/register", className: "text-sm text-gray-600 hover:text-gray-900" }, g("register", e))
        ),
        e.frontend_show_login !== "0" && a.createElement("a", { href: "/admin", className: "text-sm text-primary-600 hover:text-primary-700 font-medium" }, g("admin", e))
      ),
      a.createElement(
        "div",
        { className: "flex items-center gap-3 md:hidden" },
        a.createElement("button", { onClick: () => s(!n), className: "p-2 text-gray-600", "aria-label": g("toggle menu", e), "aria-expanded": n, "aria-controls": "mobile-nav" }, n ? a.createElement(gs, { size: 20 }) : a.createElement(ds, { size: 20 }))
      )
    ),
    n && a.createElement(
      "div",
      { id: "mobile-nav", className: "md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1" },
      a.createElement(F, { to: "/", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, g("home", e)),
      (() => {
        const u = [], y = (b, k) => {
          t.filter((P) => (P.parentId || null) === b && !(P.url === "/" && (P.label.toLowerCase() === "home" || P.label === g("home", e)))).forEach((P) => {
            u.push(a.createElement(F, { key: P.id, to: P.url, className: "block text-sm text-gray-600 py-1", style: { paddingLeft: 8 + k * 14 }, onClick: () => s(!1) }, P.label)), y(P.id, k + 1);
          });
        };
        return y(null, 0), u;
      })(),
      o ? a.createElement(
        a.Fragment,
        null,
        a.createElement("span", { className: "block text-sm text-gray-600 py-1" }, o.username),
        a.createElement("button", { onClick: c, className: "block text-sm text-gray-400 py-1" }, g("logout"))
      ) : e.frontend_show_login !== "0" && a.createElement(F, { to: "/login", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, g("sign in")),
      a.createElement(F, { to: "/register", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, g("register", e)),
      e.frontend_show_login !== "0" && a.createElement("a", { href: "/admin", className: "block text-sm text-primary-600 font-medium py-1" }, g("admin", e))
    )
  );
}
function Dl({ settings: e }) {
  const t = Ol(e);
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
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, g("navigate", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement(F, { to: "/", className: "text-sm text-gray-500 hover:text-gray-700" }, g("home", e))),
            a.createElement("li", null, a.createElement(F, { to: "/search", className: "text-sm text-gray-500 hover:text-gray-700" }, g("search", e))),
            a.createElement("li", null, a.createElement("a", { href: "/api/feed/rss", className: "text-sm text-gray-500 hover:text-gray-700" }, g("rss feed", e)))
          )
        ),
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, g("about", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement(F, { to: "/page/about", className: "text-sm text-gray-500 hover:text-gray-700" }, g("about", e))),
            a.createElement("li", null, a.createElement(F, { to: "/page/" + ((e == null ? void 0 : e.privacy_policy_slug) || "privacy-policy"), className: "text-sm text-gray-500 hover:text-gray-700" }, g("privacy policy", e)))
          )
        ),
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, g("admin", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement("a", { href: "/admin", className: "text-sm text-gray-500 hover:text-gray-700" }, g("dashboard", e))),
            a.createElement("li", null, a.createElement("a", { href: "/admin#/posts", className: "text-sm text-gray-500 hover:text-gray-700" }, g("posts", e)))
          )
        ),
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, g("connect", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement("a", { href: "/api/feed/rss", target: "_blank", className: "text-sm text-gray-500 hover:text-gray-700" }, g("rss feed", e))),
            a.createElement("li", null, a.createElement("a", { href: "/api/sitemap.xml", target: "_blank", className: "text-sm text-gray-500 hover:text-gray-700" }, g("sitemap", e)))
          )
        )
      ),
      a.createElement(
        "div",
        { className: "pt-6 border-t border-gray-200 flex items-center justify-center gap-4 flex-wrap" },
        a.createElement(
          "p",
          { className: "text-sm text-gray-500" },
          "© " + (/* @__PURE__ */ new Date()).getFullYear() + " " + (e.site_title || "Mortar CMS") + ". " + g("powered by", e) + " Mortar. ",
          a.createElement("a", { href: "/api/feed/rss", className: "text-primary-600 hover:text-primary-700", target: "_blank" }, g("rss feed", e))
        ),
        a.createElement("button", {
          onClick: () => kl(t === "zh" ? "en" : "zh"),
          className: "text-xs px-2 py-1 rounded border border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors",
          "aria-label": g("switch language", e)
        }, t === "zh" ? "EN" : "中文")
      )
    )
  );
}
function Wr() {
  const [e, t] = le([]);
  if (Ne(() => {
    we.get("/tags").then((n) => t(n.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const r = Math.max(...e.map((n) => {
    var s;
    return ((s = n._count) == null ? void 0 : s.posts) || 0;
  }), 1);
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g("tag cloud")),
    a.createElement(
      "div",
      { className: "flex flex-wrap gap-1.5" },
      e.map((n) => {
        var o, i, c;
        const s = 0.65 + (((o = n._count) == null ? void 0 : o.posts) || 0) / r * 0.35;
        return a.createElement(F, {
          key: n.id,
          to: "/tag/" + n.slug,
          className: "inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors",
          style: { fontSize: s + "rem" },
          title: (((i = n._count) == null ? void 0 : i.posts) || 0) + " " + g("posts")
        }, n.name + " (" + (((c = n._count) == null ? void 0 : c.posts) || 0) + ")");
      })
    )
  );
}
function $r() {
  const [e, t] = le([]);
  return Ne(() => {
    we.get("/posts?limit=5").then((r) => t(r.data.posts || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g("recent posts")),
    a.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((r) => a.createElement(
        "li",
        { key: r.id },
        a.createElement(F, { to: "/post/" + r.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, r.title)
      ))
    )
  );
}
function Vr() {
  const [e, t] = le([]);
  return Ne(() => {
    we.get("/posts/popular?limit=5").then((r) => t(r.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, a.createElement(hs, { size: 14 }), g("popular posts")),
    a.createElement(
      "ul",
      { className: "space-y-2" },
      e.map(
        (r, n) => a.createElement(
          "li",
          { key: r.id, className: "flex items-start gap-2" },
          a.createElement("span", { className: "text-xs font-bold text-gray-300 mt-0.5 w-4" }, n + 1),
          a.createElement(F, { to: "/post/" + r.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, r.title),
          r.views > 0 && a.createElement("span", { className: "text-xs text-gray-400 ml-auto shrink-0" }, r.views + " " + g("views"))
        )
      )
    )
  );
}
function Gr() {
  const [e, t] = le([]);
  if (Ne(() => {
    we.get("/posts/archives").then((n) => t(n.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const r = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g("archives")),
    a.createElement(
      "ul",
      { className: "space-y-1" },
      e.map((n) => {
        const [s, o] = n.month.split("-");
        return a.createElement(
          "li",
          { key: n.month },
          a.createElement(
            F,
            { to: "/archive/" + s + "/" + o, className: "text-sm text-gray-600 hover:text-primary-600" },
            r[parseInt(o) - 1] + " " + s + " (" + n.count + ")"
          )
        );
      })
    )
  );
}
function Jr() {
  const [e, t] = le(""), [r, n] = le([]), [s, o] = le(!1), [i, c] = le(!1), f = Qa(), d = Ir(null);
  Ne(() => {
    const b = e.trim();
    if (b.length < 2) {
      n([]), o(!1);
      return;
    }
    c(!0);
    const k = setTimeout(() => {
      we.get("/posts/suggest", { params: { q: b } }).then((P) => {
        var B;
        n(((B = P.data) == null ? void 0 : B.suggestions) || []), o(!0);
      }).catch(() => {
        n([]);
      }).finally(() => c(!1));
    }, 250);
    return () => clearTimeout(k);
  }, [e]), Ne(() => {
    const b = (k) => {
      d.current && !d.current.contains(k.target) && o(!1);
    };
    return document.addEventListener("mousedown", b), () => document.removeEventListener("mousedown", b);
  }, []);
  const u = (b) => {
    b.preventDefault(), e.trim() && f("/search?q=" + encodeURIComponent(e.trim()));
  }, y = (b) => {
    o(!1), f("/" + b.type + "/" + b.slug);
  };
  return a.createElement(
    "div",
    { ref: d, className: "rounded-lg border border-gray-200 p-4 relative" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g("search")),
    a.createElement(
      "form",
      { onSubmit: u, className: "flex gap-2" },
      a.createElement("input", {
        type: "text",
        value: e,
        onChange: (b) => t(b.target.value),
        onFocus: () => {
          r.length > 0 && o(!0);
        },
        placeholder: g("search placeholder"),
        "aria-label": g("search posts"),
        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      }),
      a.createElement("button", {
        type: "submit",
        "aria-label": g("search"),
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
              k.preventDefault(), y(b);
            },
            className: "w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          },
          a.createElement(b.type === "page" ? ls : os, { size: 14, className: "text-gray-400 shrink-0" }),
          a.createElement("span", { className: "text-sm text-gray-800 dark:text-gray-100 truncate" }, b.title),
          a.createElement("span", { className: "ml-auto text-xs uppercase text-gray-400 shrink-0" }, b.type)
        )
      )
    ),
    s && i && r.length === 0 && a.createElement("div", { className: "absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 px-3 py-2 text-xs text-gray-400" }, g("searching") + "…")
  );
}
function Xr() {
  const [e, t] = le([]);
  return Ne(() => {
    we.get("/links").then((r) => t(r.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g("links")),
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
function Ll() {
  const [e, t] = le([]);
  return Ne(() => {
    we.get("/comments/recent?limit=5").then((r) => t(r.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, a.createElement(_t, { size: 14, className: "text-gray-400" }), g("recent comments")),
    a.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((r) => a.createElement(
        "li",
        { key: r.id, className: "text-xs text-gray-600 leading-snug" },
        a.createElement("span", { className: "font-medium text-gray-800" }, r.author || g("anonymous")),
        " " + g("on") + " ",
        a.createElement(F, { to: "/post/" + r.postSlug + "#comments", className: "text-primary-600 hover:underline" }, r.postTitle),
        a.createElement("p", { className: "text-gray-500 mt-0.5 line-clamp-2" }, r.content)
      ))
    )
  );
}
function Pl() {
  const e = /* @__PURE__ */ new Date(), t = e.getFullYear(), r = e.getMonth(), n = new Date(t, r, 1).getDay(), s = new Date(t, r + 1, 0).getDate(), o = e.getDate(), i = ["日", "一", "二", "三", "四", "五", "六"], c = [];
  for (let f = 0; f < n; f++) c.push(a.createElement("div", { key: "b" + f }));
  for (let f = 1; f <= s; f++)
    c.push(a.createElement(F, {
      key: f,
      to: "/archive/" + t + "/" + String(r + 1).padStart(2, "0"),
      className: "flex items-center justify-center h-7 text-xs rounded " + (f === o ? "bg-primary-600 text-white font-medium" : "text-gray-600 hover:bg-gray-100"),
      title: g("view monthly archive")
    }, f));
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, a.createElement(Fe, { size: 14, className: "text-gray-400" }), g("calendar")),
    a.createElement(
      "div",
      { className: "grid grid-cols-7 gap-0.5 text-center" },
      i.map((f, d) => a.createElement("div", { key: d, className: "text-[10px] text-gray-400 py-1" }, f)),
      c
    )
  );
}
function Il() {
  const [e, t] = le([]);
  return Ne(() => {
    we.get("/pages/public").then((r) => t(r.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, a.createElement(is, { size: 14, className: "text-gray-400" }), g("pages")),
    a.createElement(
      "ul",
      { className: "space-y-1.5" },
      e.map((r) => a.createElement(
        "li",
        { key: r.id },
        a.createElement(F, { to: "/page/" + r.slug, className: "text-sm text-gray-600 hover:text-primary-600" }, r.title)
      ))
    )
  );
}
function Ml() {
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g("subscribe")),
    a.createElement("a", {
      href: "/api/feed/rss",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
    }, a.createElement(fs, { size: 16 }), g("rss feed")),
    a.createElement("p", { className: "text-xs text-gray-500 mt-2" }, g("get the latest posts in your feed reader"))
  );
}
function Oa(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function it(e, t) {
  if (!e) return;
  const r = Oa(t.cdn_url);
  return r && e.startsWith("/uploads/") ? r + e : e;
}
function Ul(e, t) {
  let r = e;
  const n = Oa(t.cdn_url);
  return n && (r = r.replace(/(src|href|data-src|poster)="\/uploads\//g, '$1="' + n + "/uploads/")), r.replace(/<img(?![^>]*loading=)[^>]*>/g, (s) => s.replace(/<img/, '<img loading="lazy"'));
}
function Fl(e) {
  const t = String(e || ""), r = t.match(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/);
  return new Date(r ? t.replace(" ", "T") + "Z" : t).getTime();
}
function Xe(e) {
  const t = Date.now(), r = Fl(e), n = t - r, s = Math.floor(n / 6e4);
  if (s < 1) return "just now";
  if (s < 60) return `${s}m ago`;
  const o = Math.floor(s / 60);
  if (o < 24) return `${o}h ago`;
  const i = Math.floor(o / 24);
  if (i < 7) return `${i}d ago`;
  const c = Math.floor(i / 7);
  return c < 5 ? `${c}w ago` : new Date(r).toLocaleDateString();
}
function rr(e) {
  const t = (e || "").replace(/<[^>]*>/g, ""), r = (t.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length, n = t.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil((r + n) / 200)) + " min read";
}
function zl(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function Hl(e) {
  const { settings: t, posts: r, total: n, page: s, setPage: o, loadError: i, catSlug: c, isTagPage: f, categories: d } = e;
  return a.createElement(
    "div",
    null,
    c && a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-12 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, (f ? g("tag", t) + ": " : "") + (c || "").replace(/-/g, " "))
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
          r.length === 0 ? i ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, g("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, g("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, g("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, g("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-12" },
            r.map((u) => {
              var y, b, k;
              return a.createElement(
                "article",
                { key: u.id, className: "pb-12 border-b border-gray-100 last:border-0" },
                u.featured && a.createElement("img", {
                  src: it(u.featured, t),
                  alt: u.title,
                  className: "w-full h-48 object-cover rounded-lg mb-5",
                  loading: "lazy",
                  decoding: "async",
                  sizes: "(min-width: 900px) 512px, 100vw",
                  srcSet: u.srcset ? Object.entries(u.srcset).map(([P, B]) => it(B, t) + " " + P + "w").join(", ") : void 0
                }),
                a.createElement(
                  F,
                  { to: "/post/" + u.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-3" }, u.format && u.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, zl(u.format), u.format.charAt(0).toUpperCase() + u.format.slice(1)) : null, u.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + g("featured", t)) : null, u.title)
                ),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-4" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Fe, { size: 12 }), Xe(u.publishedAt || u.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Mr, { size: 12 }), a.createElement(F, { to: "/author/" + (((y = u.author) == null ? void 0 : y.username) || ""), className: "hover:text-primary-600" }, (b = u.author) == null ? void 0 : b.username)),
                  ((k = u.categories) == null ? void 0 : k[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Zt, { size: 12 }), u.categories[0].name)
                ),
                u.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed mb-4" }, u.excerpt),
                a.createElement(
                  "div",
                  { className: "flex items-center justify-between gap-3" },
                  a.createElement(
                    "div",
                    { className: "flex items-center gap-3 text-xs text-gray-500" },
                    a.createElement("span", { className: "inline-flex items-center gap-1" }, rr(u.content)),
                    u.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1" }, a.createElement(_t, { size: 12 }), "" + u.commentCount)
                  ),
                  a.createElement(F, { to: "/post/" + u.slug, className: "inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700" }, g("read more", t))
                )
              );
            })
          ),
          n > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + g("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, g("page", t) + " " + s + " " + g("of", t) + " " + Math.ceil(n / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= n, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, g("next", t) + " →")
          )
        ),
        a.createElement(
          "aside",
          { className: "space-y-6" },
          (() => {
            var k;
            const u = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), y = (() => {
              try {
                return JSON.parse(t.widgets_config || "{}");
              } catch {
                return {};
              }
            })(), b = (P) => u.length === 0 || u.includes(P);
            return a.createElement(
              a.Fragment,
              null,
              b("search") && a.createElement(Jr),
              b("recent_posts") && a.createElement($r),
              b("popular") && a.createElement(Vr),
              b("tag_cloud") && a.createElement(Wr),
              b("archives") && a.createElement(Gr),
              b("links") && a.createElement(Xr),
              b("recent_comments") && a.createElement(Ll),
              b("calendar") && a.createElement(Pl),
              b("pages") && a.createElement(Il),
              b("rss") && a.createElement(Ml),
              b("html") && ((k = y.html) == null ? void 0 : k.html) && a.createElement(
                "div",
                { className: "rounded-lg border border-gray-200 p-4" },
                y.html.title && a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, y.html.title),
                a.createElement("div", { dangerouslySetInnerHTML: { __html: y.html.html } })
              )
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g("categories", t)),
            d.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, g("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, d.map((u) => {
              var y;
              return a.createElement(
                "li",
                { key: u.id },
                a.createElement(F, { to: "/category/" + u.slug, className: "text-sm " + (c === u.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, u.name, ((y = u._count) == null ? void 0 : y.posts) > 0 ? a.createElement("span", { className: "text-gray-500 ml-1" }, "(" + u._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
function Bl(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function jl(e) {
  const { settings: t, posts: r, total: n, page: s, setPage: o, loadError: i, catSlug: c, categories: f } = e;
  return a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-10 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, (c || "").replace(/-/g, " ")),
      a.createElement("p", { className: "text-sm text-gray-500 mt-2" }, n + " " + g("posts", t))
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
          r.length === 0 ? i ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, g("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, g("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, g("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, g("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-12" },
            r.map((d) => {
              var u, y, b;
              return a.createElement(
                "article",
                { key: d.id, className: "pb-12 border-b border-gray-100 last:border-0" },
                d.featured && a.createElement("img", { src: it(d.featured, t), alt: d.title, className: "w-full h-48 object-cover rounded-lg mb-5", loading: "lazy" }),
                a.createElement(
                  F,
                  { to: "/post/" + d.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-3" }, d.format && d.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, Bl(d.format), d.format.charAt(0).toUpperCase() + d.format.slice(1)) : null, d.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + g("featured", t)) : null, d.title)
                ),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-4" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Fe, { size: 12 }), Xe(d.publishedAt || d.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Mr, { size: 12 }), a.createElement(F, { to: "/author/" + (((u = d.author) == null ? void 0 : u.username) || ""), className: "hover:text-primary-600" }, (y = d.author) == null ? void 0 : y.username)),
                  ((b = d.categories) == null ? void 0 : b[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Zt, { size: 12 }), d.categories[0].name)
                ),
                d.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed mb-4" }, d.excerpt),
                a.createElement(
                  "div",
                  { className: "flex items-center justify-between gap-3" },
                  a.createElement(
                    "div",
                    { className: "flex items-center gap-3 text-xs text-gray-500" },
                    a.createElement("span", { className: "inline-flex items-center gap-1" }, rr(d.content)),
                    d.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1" }, a.createElement(_t, { size: 12 }), "" + d.commentCount)
                  ),
                  a.createElement(F, { to: "/post/" + d.slug, className: "inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700" }, g("read more", t))
                )
              );
            })
          ),
          n > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + g("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, g("page", t) + " " + s + " " + g("of", t) + " " + Math.ceil(n / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= n, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, g("next", t) + " →")
          )
        ),
        a.createElement(
          "aside",
          { className: "space-y-6" },
          (() => {
            const d = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), u = (y) => d.length === 0 || d.includes(y);
            return a.createElement(
              a.Fragment,
              null,
              u("search") && a.createElement(Jr),
              u("recent_posts") && a.createElement($r),
              u("popular") && a.createElement(Vr),
              u("tag_cloud") && a.createElement(Wr),
              u("archives") && a.createElement(Gr),
              u("links") && a.createElement(Xr)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g("categories", t)),
            f.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, g("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, f.map((d) => {
              var u;
              return a.createElement(
                "li",
                { key: d.id },
                a.createElement(F, { to: "/category/" + d.slug, className: "text-sm " + (c === d.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, d.name, ((u = d._count) == null ? void 0 : u.posts) > 0 ? a.createElement("span", { className: "text-gray-500 ml-1" }, "(" + d._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
function ql(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function Wl(e) {
  const { settings: t, posts: r, total: n, page: s, setPage: o, loadError: i, catSlug: c, categories: f } = e;
  return a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-10 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, g("tag", t) + ": " + (c || "").replace(/-/g, " ")),
      a.createElement("p", { className: "text-sm text-gray-500 mt-2" }, n + " " + g("posts", t))
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
          r.length === 0 ? i ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, g("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, g("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, g("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, g("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-12" },
            r.map((d) => {
              var u, y, b;
              return a.createElement(
                "article",
                { key: d.id, className: "pb-12 border-b border-gray-100 last:border-0" },
                d.featured && a.createElement("img", { src: it(d.featured, t), alt: d.title, className: "w-full h-48 object-cover rounded-lg mb-5", loading: "lazy" }),
                a.createElement(
                  F,
                  { to: "/post/" + d.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-3" }, d.format && d.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, ql(d.format), d.format.charAt(0).toUpperCase() + d.format.slice(1)) : null, d.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + g("featured", t)) : null, d.title)
                ),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-4" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Fe, { size: 12 }), Xe(d.publishedAt || d.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Mr, { size: 12 }), a.createElement(F, { to: "/author/" + (((u = d.author) == null ? void 0 : u.username) || ""), className: "hover:text-primary-600" }, (y = d.author) == null ? void 0 : y.username)),
                  ((b = d.categories) == null ? void 0 : b[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Zt, { size: 12 }), d.categories[0].name)
                ),
                d.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed mb-4" }, d.excerpt),
                a.createElement(
                  "div",
                  { className: "flex items-center justify-between gap-3" },
                  a.createElement(
                    "div",
                    { className: "flex items-center gap-3 text-xs text-gray-500" },
                    a.createElement("span", { className: "inline-flex items-center gap-1" }, rr(d.content)),
                    d.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1" }, a.createElement(_t, { size: 12 }), "" + d.commentCount)
                  ),
                  a.createElement(F, { to: "/post/" + d.slug, className: "inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700" }, g("read more", t))
                )
              );
            })
          ),
          n > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + g("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, g("page", t) + " " + s + " " + g("of", t) + " " + Math.ceil(n / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= n, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, g("next", t) + " →")
          )
        ),
        a.createElement(
          "aside",
          { className: "space-y-6" },
          (() => {
            const d = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), u = (y) => d.length === 0 || d.includes(y);
            return a.createElement(
              a.Fragment,
              null,
              u("search") && a.createElement(Jr),
              u("recent_posts") && a.createElement($r),
              u("popular") && a.createElement(Vr),
              u("tag_cloud") && a.createElement(Wr),
              u("archives") && a.createElement(Gr),
              u("links") && a.createElement(Xr)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, g("categories", t)),
            f.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, g("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, f.map((d) => {
              var u;
              return a.createElement(
                "li",
                { key: d.id },
                a.createElement(F, { to: "/category/" + d.slug, className: "text-sm " + (c === d.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, d.name, ((u = d._count) == null ? void 0 : u.posts) > 0 ? a.createElement("span", { className: "text-gray-500 ml-1" }, "(" + d._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
const $l = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function Vl(e) {
  const { data: t, year: r, month: n } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(F, { to: "/", className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6" }, a.createElement(ea, { size: 14 }), g("back")),
    a.createElement("h1", { className: "text-2xl font-bold text-gray-900 mb-6" }, $l[parseInt(n || "1") - 1] + " " + r),
    a.createElement("p", { className: "text-sm text-gray-500 mb-6" }, t.total + " " + g("posts")),
    t.posts.length === 0 ? a.createElement("p", { className: "text-gray-500" }, g("no posts in this month")) : a.createElement(
      "div",
      { className: "space-y-6" },
      t.posts.map((s) => a.createElement(
        "article",
        { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
        a.createElement(F, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, s.title)),
        a.createElement(
          "div",
          { className: "flex items-center gap-3 text-xs text-gray-500" },
          a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Fe, { size: 12 }), Xe(s.publishedAt || s.createdAt))
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
function Gl(e) {
  const { query: t, posts: r, loading: n, error: s } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement("h1", { className: "text-2xl font-bold text-gray-900 mb-2" }, g("search results")),
    a.createElement("p", { className: "text-sm text-gray-500 mb-6" }, t ? g("showing results for") + ' "' + t + '"' : g("enter a search term")),
    n ? a.createElement("p", { className: "text-gray-500" }, g("searching")) : s ? a.createElement(
      "div",
      { className: "text-center py-12" },
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, g("search failed")),
      a.createElement("p", { className: "text-sm text-gray-500 mb-4" }, g("try again later"))
    ) : r.length === 0 ? a.createElement(
      "div",
      { className: "text-center py-12" },
      a.createElement(ra, { size: 48, className: "mx-auto text-gray-300 mb-4" }),
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, g("no results for") + ' "' + t + '"'),
      a.createElement("p", { className: "text-sm text-gray-500 mb-4" }, g("try different keywords")),
      a.createElement(F, { to: "/", className: "text-primary-600 text-sm" }, "← " + g("browse all posts"))
    ) : a.createElement(
      "div",
      { className: "space-y-6" },
      r.map((o) => {
        var i;
        return a.createElement(
          "article",
          { key: o.id, className: "pb-6 border-b border-gray-100 last:border-0" },
          a.createElement(F, { to: "/post/" + o.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, In(o.title, t))),
          a.createElement(
            "div",
            { className: "flex items-center gap-3 text-xs text-gray-500 mb-2" },
            a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Fe, { size: 12 }), Xe(o.publishedAt || o.createdAt)),
            a.createElement("span", null, g("written by") + " " + (((i = o.author) == null ? void 0 : i.username) || "Unknown"))
          ),
          o.excerpt && a.createElement("p", { className: "text-sm text-gray-600" }, In(o.excerpt, t))
        );
      })
    )
  );
}
function Jl({ count: e = 5 }) {
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
function Xl(e) {
  const { username: t, posts: r, loading: n, error: s } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(F, { to: "/", className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6" }, a.createElement(ea, { size: 14 }), g("back")),
    a.createElement(
      "div",
      { className: "flex items-center gap-3 mb-8" },
      a.createElement("div", { className: "w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-bold" }, (t || "?")[0].toUpperCase()),
      a.createElement(
        "div",
        null,
        a.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, t),
        a.createElement("p", { className: "text-sm text-gray-500" }, r.length + " " + g("posts"))
      )
    ),
    n ? a.createElement(Jl, null) : s ? a.createElement("p", { className: "text-gray-500" }, g("author not found")) : r.length === 0 ? a.createElement("p", { className: "text-gray-500" }, g("no posts yet")) : a.createElement(
      "div",
      { className: "space-y-6" },
      r.map((o) => {
        var i;
        return a.createElement(
          "article",
          { key: o.id, className: "pb-6 border-b border-gray-100 last:border-0" },
          a.createElement(F, { to: "/post/" + o.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, o.title)),
          a.createElement(
            "div",
            { className: "flex items-center gap-3 text-xs text-gray-500" },
            a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Fe, { size: 12 }), Xe(o.publishedAt || o.createdAt)),
            ((i = o.categories) == null ? void 0 : i[0]) && a.createElement("span", { className: "capitalize" }, o.categories[0].name)
          ),
          o.excerpt && a.createElement("p", { className: "text-sm text-gray-600 mt-2" }, o.excerpt)
        );
      })
    )
  );
}
function ka({ items: e }) {
  return a.createElement(
    "nav",
    { className: "flex items-center gap-1 text-sm text-gray-500 mb-6", "aria-label": "Breadcrumb" },
    a.createElement(F, { to: "/", className: "hover:text-gray-700 flex items-center gap-1" }, a.createElement(cs, { size: 14 })),
    e.map((t, r) => a.createElement(
      a.Fragment,
      { key: r },
      a.createElement(as, { size: 12, className: "text-gray-300" }),
      r === e.length - 1 || !t.to ? a.createElement("span", { className: "text-gray-900 font-medium" }, t.label) : a.createElement(F, { to: t.to, className: "hover:text-gray-700" }, t.label)
    ))
  );
}
function Yl({ postId: e, slug: t }) {
  const [r, n] = le([]);
  return Ne(() => {
    e && we.get("/posts/" + e + "/related").then((s) => n(s.data)).catch(() => {
    });
  }, [e]), r.length === 0 ? a.createElement("p", { className: "text-sm text-gray-400" }, g("no related posts")) : a.createElement(
    "div",
    { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
    r.map((s) => a.createElement(
      F,
      { key: s.id, to: "/post/" + s.slug, className: "group block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all" },
      a.createElement("h4", { className: "text-sm font-medium text-gray-900 group-hover:text-primary-600 mb-1" }, s.title),
      a.createElement("p", { className: "text-xs text-gray-500 line-clamp-2" }, s.excerpt || "")
    ))
  );
}
function Kl({ title: e, url: t, siteUrl: r }) {
  const n = (r || window.location.origin) + t, s = encodeURIComponent(n), o = encodeURIComponent(e);
  async function i() {
    try {
      await navigator.clipboard.writeText(n), alert(g("link copied to clipboard"));
    } catch {
      window.prompt(g("copy link"), n);
    }
  }
  const c = (f) => a.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" }, a.createElement("path", { d: f }));
  return a.createElement(
    "div",
    { className: "flex items-center gap-2" },
    a.createElement("span", { className: "text-xs text-gray-400 mr-1" }, g("share") + ":"),
    a.createElement("a", { href: "https://twitter.com/intent/tweet?url=" + s + "&text=" + o, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors", title: "Twitter" }, c("M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z")),
    a.createElement("a", { href: "https://www.facebook.com/sharer/sharer.php?u=" + s, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors", title: "Facebook" }, c("M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z")),
    a.createElement("a", { href: "https://www.linkedin.com/sharing/share-offsite/?url=" + s, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", title: "LinkedIn" }, c("M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.9-2.2 4.18 0 4.95 2.75 4.95 6.32V24h-4v-8.6c0-2.05-.04-4.7-2.86-4.7-2.86 0-3.3 2.24-3.3 4.55V24h-4V8z")),
    a.createElement("button", { onClick: i, className: "p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors", title: g("copy link") }, a.createElement(ms, { size: 14 }))
  );
}
function Zl(e) {
  return e.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "").slice(0, 80);
}
function Ql({ containerRef: e, settings: t }) {
  const [r, n] = le([]), [s, o] = le(!0);
  if (Ne(() => {
    const c = e.current;
    if (!c) return;
    const f = c.querySelectorAll("h2, h3"), d = [], u = /* @__PURE__ */ new Set();
    f.forEach((y) => {
      const b = (y.textContent || "").trim();
      if (!b) return;
      let k = y.id || Zl(b);
      k || (k = "sec-" + d.length), u.has(k) && (k = k + "-" + d.length), u.add(k), y.id = k, d.push({ id: k, text: b, level: y.tagName === "H2" ? 2 : 3 });
    }), n(d);
  }, [e]), r.length < 3) return null;
  const i = (c) => {
    const f = document.getElementById(c);
    f && f.scrollIntoView({ behavior: "smooth", block: "start" });
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
      a.createElement(us, { size: 15, className: "text-gray-400" }),
      g("table of contents", t || {}),
      a.createElement("span", { className: "ml-auto text-gray-400 text-xs" }, s ? "▲" : "▼")
    ),
    s && a.createElement(
      "nav",
      { className: "px-2 pb-2 max-h-64 overflow-y-auto" },
      r.map(
        (c) => a.createElement("button", {
          key: c.id,
          onClick: () => i(c.id),
          className: "w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 transition-colors " + (c.level === 3 ? "pl-7 text-gray-500" : "text-gray-800 font-medium")
        }, c.text)
      )
    )
  );
}
function Ca(e) {
  return String(e || "").replace(/@import[^;]+;?/gi, "").replace(/expression\([^)]*\)/gi, "").replace(/behavior\s*:[^;}]+;?/gi, "").replace(/url\(\s*(javascript|data):/gi, "url(");
}
function ei(e) {
  return e.replace(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/g,
    '<div class="aspect-video my-4"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen class="w-full h-full rounded-lg"></iframe></div>'
  ).replace(
    /(?:https?:\/\/)?twitter\.com\/(\w+)\/status\/(\d+)/g,
    '<blockquote class="twitter-tweet my-4"><a href="https://twitter.com/$1/status/$2"></a></blockquote>'
  );
}
function ti(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Jt = { exports: {} }, ri = Jt.exports, Mn;
function ni() {
  return Mn || (Mn = 1, (function(e) {
    (function(t) {
      function r(h, A) {
        var E = (h & 65535) + (A & 65535), H = (h >> 16) + (A >> 16) + (E >> 16);
        return H << 16 | E & 65535;
      }
      function n(h, A) {
        return h << A | h >>> 32 - A;
      }
      function s(h, A, E, H, z, q) {
        return r(n(r(r(A, h), r(H, q)), z), E);
      }
      function o(h, A, E, H, z, q, J) {
        return s(A & E | ~A & H, h, A, z, q, J);
      }
      function i(h, A, E, H, z, q, J) {
        return s(A & H | E & ~H, h, A, z, q, J);
      }
      function c(h, A, E, H, z, q, J) {
        return s(A ^ E ^ H, h, A, z, q, J);
      }
      function f(h, A, E, H, z, q, J) {
        return s(E ^ (A | ~H), h, A, z, q, J);
      }
      function d(h, A) {
        h[A >> 5] |= 128 << A % 32, h[(A + 64 >>> 9 << 4) + 14] = A;
        var E, H, z, q, J, T = 1732584193, _ = -271733879, N = -1732584194, S = 271733878;
        for (E = 0; E < h.length; E += 16)
          H = T, z = _, q = N, J = S, T = o(T, _, N, S, h[E], 7, -680876936), S = o(S, T, _, N, h[E + 1], 12, -389564586), N = o(N, S, T, _, h[E + 2], 17, 606105819), _ = o(_, N, S, T, h[E + 3], 22, -1044525330), T = o(T, _, N, S, h[E + 4], 7, -176418897), S = o(S, T, _, N, h[E + 5], 12, 1200080426), N = o(N, S, T, _, h[E + 6], 17, -1473231341), _ = o(_, N, S, T, h[E + 7], 22, -45705983), T = o(T, _, N, S, h[E + 8], 7, 1770035416), S = o(S, T, _, N, h[E + 9], 12, -1958414417), N = o(N, S, T, _, h[E + 10], 17, -42063), _ = o(_, N, S, T, h[E + 11], 22, -1990404162), T = o(T, _, N, S, h[E + 12], 7, 1804603682), S = o(S, T, _, N, h[E + 13], 12, -40341101), N = o(N, S, T, _, h[E + 14], 17, -1502002290), _ = o(_, N, S, T, h[E + 15], 22, 1236535329), T = i(T, _, N, S, h[E + 1], 5, -165796510), S = i(S, T, _, N, h[E + 6], 9, -1069501632), N = i(N, S, T, _, h[E + 11], 14, 643717713), _ = i(_, N, S, T, h[E], 20, -373897302), T = i(T, _, N, S, h[E + 5], 5, -701558691), S = i(S, T, _, N, h[E + 10], 9, 38016083), N = i(N, S, T, _, h[E + 15], 14, -660478335), _ = i(_, N, S, T, h[E + 4], 20, -405537848), T = i(T, _, N, S, h[E + 9], 5, 568446438), S = i(S, T, _, N, h[E + 14], 9, -1019803690), N = i(N, S, T, _, h[E + 3], 14, -187363961), _ = i(_, N, S, T, h[E + 8], 20, 1163531501), T = i(T, _, N, S, h[E + 13], 5, -1444681467), S = i(S, T, _, N, h[E + 2], 9, -51403784), N = i(N, S, T, _, h[E + 7], 14, 1735328473), _ = i(_, N, S, T, h[E + 12], 20, -1926607734), T = c(T, _, N, S, h[E + 5], 4, -378558), S = c(S, T, _, N, h[E + 8], 11, -2022574463), N = c(N, S, T, _, h[E + 11], 16, 1839030562), _ = c(_, N, S, T, h[E + 14], 23, -35309556), T = c(T, _, N, S, h[E + 1], 4, -1530992060), S = c(S, T, _, N, h[E + 4], 11, 1272893353), N = c(N, S, T, _, h[E + 7], 16, -155497632), _ = c(_, N, S, T, h[E + 10], 23, -1094730640), T = c(T, _, N, S, h[E + 13], 4, 681279174), S = c(S, T, _, N, h[E], 11, -358537222), N = c(N, S, T, _, h[E + 3], 16, -722521979), _ = c(_, N, S, T, h[E + 6], 23, 76029189), T = c(T, _, N, S, h[E + 9], 4, -640364487), S = c(S, T, _, N, h[E + 12], 11, -421815835), N = c(N, S, T, _, h[E + 15], 16, 530742520), _ = c(_, N, S, T, h[E + 2], 23, -995338651), T = f(T, _, N, S, h[E], 6, -198630844), S = f(S, T, _, N, h[E + 7], 10, 1126891415), N = f(N, S, T, _, h[E + 14], 15, -1416354905), _ = f(_, N, S, T, h[E + 5], 21, -57434055), T = f(T, _, N, S, h[E + 12], 6, 1700485571), S = f(S, T, _, N, h[E + 3], 10, -1894986606), N = f(N, S, T, _, h[E + 10], 15, -1051523), _ = f(_, N, S, T, h[E + 1], 21, -2054922799), T = f(T, _, N, S, h[E + 8], 6, 1873313359), S = f(S, T, _, N, h[E + 15], 10, -30611744), N = f(N, S, T, _, h[E + 6], 15, -1560198380), _ = f(_, N, S, T, h[E + 13], 21, 1309151649), T = f(T, _, N, S, h[E + 4], 6, -145523070), S = f(S, T, _, N, h[E + 11], 10, -1120210379), N = f(N, S, T, _, h[E + 2], 15, 718787259), _ = f(_, N, S, T, h[E + 9], 21, -343485551), T = r(T, H), _ = r(_, z), N = r(N, q), S = r(S, J);
        return [T, _, N, S];
      }
      function u(h) {
        var A, E = "", H = h.length * 32;
        for (A = 0; A < H; A += 8)
          E += String.fromCharCode(h[A >> 5] >>> A % 32 & 255);
        return E;
      }
      function y(h) {
        var A, E = [];
        for (E[(h.length >> 2) - 1] = void 0, A = 0; A < E.length; A += 1)
          E[A] = 0;
        var H = h.length * 8;
        for (A = 0; A < H; A += 8)
          E[A >> 5] |= (h.charCodeAt(A / 8) & 255) << A % 32;
        return E;
      }
      function b(h) {
        return u(d(y(h), h.length * 8));
      }
      function k(h, A) {
        var E, H = y(h), z = [], q = [], J;
        for (z[15] = q[15] = void 0, H.length > 16 && (H = d(H, h.length * 8)), E = 0; E < 16; E += 1)
          z[E] = H[E] ^ 909522486, q[E] = H[E] ^ 1549556828;
        return J = d(z.concat(y(A)), 512 + A.length * 8), u(d(q.concat(J), 640));
      }
      function P(h) {
        var A = "0123456789abcdef", E = "", H, z;
        for (z = 0; z < h.length; z += 1)
          H = h.charCodeAt(z), E += A.charAt(H >>> 4 & 15) + A.charAt(H & 15);
        return E;
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
      function O(h, A) {
        return k(B(h), B(A));
      }
      function M(h, A) {
        return P(O(h, A));
      }
      function U(h, A, E) {
        return A ? E ? O(A, h) : M(A, h) : E ? C(h) : x(h);
      }
      e.exports ? e.exports = U : t.md5 = U;
    })(ri);
  })(Jt)), Jt.exports;
}
var ai = ni();
const si = /* @__PURE__ */ ti(ai);
function qt(e, t = 80) {
  return "https://www.gravatar.com/avatar/" + si(e.trim().toLowerCase()) + "?s=" + t + "&d=mp";
}
function Da(e, t = []) {
  Ne(() => {
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
function oi(e) {
  if (Array.isArray(e)) return e;
}
function li(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, s, o, i, c = [], f = !0, d = !1;
    try {
      if (o = (r = r.call(e)).next, t !== 0) for (; !(f = (n = o.call(r)).done) && (c.push(n.value), c.length !== t); f = !0) ;
    } catch (u) {
      d = !0, s = u;
    } finally {
      try {
        if (!f && r.return != null && (i = r.return(), Object(i) !== i)) return;
      } finally {
        if (d) throw s;
      }
    }
    return c;
  }
}
function ii() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ci(e, t) {
  return oi(e) || li(e, t) || mi(e, t) || ii();
}
function mi(e, t) {
  if (e) {
    if (typeof e == "string") return Un(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Un(e, t) : void 0;
  }
}
const La = Object.entries, Fn = Object.setPrototypeOf, ui = Object.isFrozen, di = Object.getPrototypeOf, fi = Object.getOwnPropertyDescriptor;
let ie = Object.freeze, ce = Object.seal, ot = Object.create, Pa = typeof Reflect < "u" && Reflect, Lr = Pa.apply, Pr = Pa.construct;
ie || (ie = function(t) {
  return t;
});
ce || (ce = function(t) {
  return t;
});
Lr || (Lr = function(t, r) {
  for (var n = arguments.length, s = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
    s[o - 2] = arguments[o];
  return t.apply(r, s);
});
Pr || (Pr = function(t) {
  for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), s = 1; s < r; s++)
    n[s - 1] = arguments[s];
  return new t(...n);
});
const at = ee(Array.prototype.forEach), pi = ee(Array.prototype.lastIndexOf), zn = ee(Array.prototype.pop), st = ee(Array.prototype.push), hi = ee(Array.prototype.splice), Ue = Array.isArray, wt = ee(String.prototype.toLowerCase), _r = ee(String.prototype.toString), Hn = ee(String.prototype.match), bt = ee(String.prototype.replace), Bn = ee(String.prototype.indexOf), gi = ee(String.prototype.trim), yi = ee(Number.prototype.toString), Ei = ee(Boolean.prototype.toString), jn = typeof BigInt > "u" ? null : ee(BigInt.prototype.toString), qn = typeof Symbol > "u" ? null : ee(Symbol.prototype.toString), se = ee(Object.prototype.hasOwnProperty), xt = ee(Object.prototype.toString), ae = ee(RegExp.prototype.test), qe = bi(TypeError);
function ee(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), s = 1; s < r; s++)
      n[s - 1] = arguments[s];
    return Lr(e, t, n);
  };
}
function bi(e) {
  return function() {
    for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++)
      r[n] = arguments[n];
    return Pr(e, r);
  };
}
function $(e, t) {
  let r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : wt;
  if (Fn && Fn(e, null), !Ue(t))
    return e;
  let n = t.length;
  for (; n--; ) {
    let s = t[n];
    if (typeof s == "string") {
      const o = r(s);
      o !== s && (ui(t) || (t[n] = o), s = o);
    }
    e[s] = !0;
  }
  return e;
}
function xi(e) {
  for (let t = 0; t < e.length; t++)
    se(e, t) || (e[t] = null);
  return e;
}
function de(e) {
  const t = ot(null);
  for (const n of La(e)) {
    var r = ci(n, 2);
    const s = r[0], o = r[1];
    se(e, s) && (Ue(o) ? t[s] = xi(o) : o && typeof o == "object" && o.constructor === Object ? t[s] = de(o) : t[s] = o);
  }
  return t;
}
function wi(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return yi(e);
    case "boolean":
      return Ei(e);
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
      const t = e, r = Se(t, "toString");
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
function Se(e, t) {
  for (; e !== null; ) {
    const n = fi(e, t);
    if (n) {
      if (n.get)
        return ee(n.get);
      if (typeof n.value == "function")
        return ee(n.value);
    }
    e = di(e);
  }
  function r() {
    return null;
  }
  return r;
}
function Ni(e) {
  try {
    return ae(e, ""), !0;
  } catch {
    return !1;
  }
}
const Wn = ie(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Tr = ie(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Sr = ie(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), _i = ie(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Ar = ie(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Ti = ie(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), $n = ie(["#text"]), Vn = ie(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), Rr = ie(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Gn = ie(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), Wt = ie(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Si = ce(/{{[\w\W]*|^[\w\W]*}}/g), Ai = ce(/<%[\w\W]*|^[\w\W]*%>/g), Ri = ce(/\${[\w\W]*/g), vi = ce(/^data-[\-\w.\u00B7-\uFFFF]+$/), Oi = ce(/^aria-[\-\w]+$/), Jn = ce(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), ki = ce(/^(?:\w+script|data):/i), Ci = ce(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Di = ce(/^html$/i), Li = ce(/^[a-z][.\w]*(-[.\w]+)+$/i), Xn = ce(/<[/\w!]/g), Yn = ce(/<[/\w]/g), Pi = ce(/<\/no(script|embed|frames)/i), Ii = ce(/\/>/i), xe = {
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
}, Mi = function() {
  return typeof window > "u" ? null : window;
}, Ui = function(t, r) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let n = null;
  const s = "data-tt-policy-suffix";
  r && r.hasAttribute(s) && (n = r.getAttribute(s));
  const o = "dompurify" + (n ? "#" + n : "");
  try {
    return t.createPolicy(o, {
      createHTML(i) {
        return i;
      },
      createScriptURL(i) {
        return i;
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
  return se(t, r) && Ue(t[r]) ? $(s.base ? de(s.base) : {}, t[r], s.transform) : n;
};
function Ia() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Mi();
  const t = (R) => Ia(R);
  if (t.version = "3.4.13", t.removed = [], !e || !e.document || e.document.nodeType !== xe.document || !e.Element)
    return t.isSupported = !1, t;
  let r = e.document;
  const n = r, s = n.currentScript;
  e.DocumentFragment;
  const o = e.HTMLTemplateElement, i = e.Node, c = e.Element, f = e.NodeFilter, d = e.NamedNodeMap;
  d === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const u = e.DOMParser, y = e.trustedTypes, b = c.prototype, k = Se(b, "cloneNode"), P = Se(b, "remove"), B = Se(b, "nextSibling"), C = Se(b, "childNodes"), x = Se(b, "parentNode"), O = Se(b, "shadowRoot"), M = Se(b, "attributes"), U = i && i.prototype ? Se(i.prototype, "nodeType") : null, h = i && i.prototype ? Se(i.prototype, "nodeName") : null, A = i && i.prototype ? Se(i.prototype, "ownerDocument") : null;
  if (typeof o == "function") {
    const R = r.createElement("template");
    R.content && R.content.ownerDocument && (r = R.content.ownerDocument);
  }
  let E, H = "", z, q = !1, J = 0;
  const T = function() {
    if (J > 0)
      throw qe('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, _ = function(l) {
    T(), J++;
    try {
      return E.createHTML(l);
    } finally {
      J--;
    }
  }, N = function(l) {
    T(), J++;
    try {
      return E.createScriptURL(l);
    } finally {
      J--;
    }
  }, S = function() {
    return q || (z = Ui(y, s), q = !0), z;
  }, Ae = r, ze = Ae.implementation, vt = Ae.createNodeIterator, Ot = Ae.createDocumentFragment, Re = Ae.getElementsByTagName, re = n.importNode;
  let V = Kn();
  t.isSupported = typeof La == "function" && typeof x == "function" && ze && ze.createHTMLDocument !== void 0;
  const Ce = Si, He = Ai, kt = Ri, G = vi, he = Oi, Ye = ki, ut = Ci, nr = Li;
  let dt = Jn, W = null;
  const Ke = $({}, [...Wn, ...Tr, ...Sr, ...Ar, ...$n]);
  let X = null;
  const be = $({}, [...Vn, ...Rr, ...Gn, ...Wt]);
  let D = Object.seal(ot(null, {
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
  })), ne = null, Te = null;
  const me = Object.seal(ot(null, {
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
  let ft = !0, pt = !0, De = !1, Yr = !0, Le = !1, Pe = !0, Be = !1, ar = !1, Ct = null, Dt = null, sr = !1, Ze = !1, Lt = !1, Pt = !1, Kr = !0, Zr = !1;
  const Qr = "user-content-";
  let or = !0, It = !1, Qe = {}, ve = null;
  const lr = $({}, [
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
  const tn = $({}, ["audio", "video", "img", "source", "image", "track"]);
  let ir = null;
  const rn = $({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Mt = "http://www.w3.org/1998/Math/MathML", Ut = "http://www.w3.org/2000/svg", Oe = "http://www.w3.org/1999/xhtml";
  let et = Oe, cr = !1, mr = null;
  const Ua = $({}, [Mt, Ut, Oe], _r), nn = ie(["mi", "mo", "mn", "ms", "mtext"]);
  let ur = $({}, nn);
  const an = ie(["annotation-xml"]);
  let dr = $({}, an);
  const Fa = $({}, ["title", "style", "font", "a", "script"]);
  let ht = null;
  const za = ["application/xhtml+xml", "text/html"], Ha = "text/html";
  let K = null, tt = null;
  const Ba = r.createElement("form"), sn = function(l) {
    return l instanceof RegExp || l instanceof Function;
  }, fr = function() {
    let l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (tt && tt === l)
      return;
    (!l || typeof l != "object") && (l = {}), l = de(l), ht = // eslint-disable-next-line unicorn/prefer-includes
    za.indexOf(l.PARSER_MEDIA_TYPE) === -1 ? Ha : l.PARSER_MEDIA_TYPE, K = ht === "application/xhtml+xml" ? _r : wt, W = Me(l, "ALLOWED_TAGS", Ke, {
      transform: K
    }), X = Me(l, "ALLOWED_ATTR", be, {
      transform: K
    }), mr = Me(l, "ALLOWED_NAMESPACES", Ua, {
      transform: _r
    }), ir = Me(l, "ADD_URI_SAFE_ATTR", rn, {
      transform: K,
      base: rn
    }), en = Me(l, "ADD_DATA_URI_TAGS", tn, {
      transform: K,
      base: tn
    }), ve = Me(l, "FORBID_CONTENTS", lr, {
      transform: K
    }), ne = Me(l, "FORBID_TAGS", de({}), {
      transform: K
    }), Te = Me(l, "FORBID_ATTR", de({}), {
      transform: K
    }), Qe = se(l, "USE_PROFILES") ? l.USE_PROFILES && typeof l.USE_PROFILES == "object" ? de(l.USE_PROFILES) : l.USE_PROFILES : !1, ft = l.ALLOW_ARIA_ATTR !== !1, pt = l.ALLOW_DATA_ATTR !== !1, De = l.ALLOW_UNKNOWN_PROTOCOLS || !1, Yr = l.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Le = l.SAFE_FOR_TEMPLATES || !1, Pe = l.SAFE_FOR_XML !== !1, Be = l.WHOLE_DOCUMENT || !1, Ze = l.RETURN_DOM || !1, Lt = l.RETURN_DOM_FRAGMENT || !1, Pt = l.RETURN_TRUSTED_TYPE || !1, sr = l.FORCE_BODY || !1, Kr = l.SANITIZE_DOM !== !1, Zr = l.SANITIZE_NAMED_PROPS || !1, or = l.KEEP_CONTENT !== !1, It = l.IN_PLACE || !1, dt = Ni(l.ALLOWED_URI_REGEXP) ? l.ALLOWED_URI_REGEXP : Jn, et = typeof l.NAMESPACE == "string" ? l.NAMESPACE : Oe, ur = se(l, "MATHML_TEXT_INTEGRATION_POINTS") && l.MATHML_TEXT_INTEGRATION_POINTS && typeof l.MATHML_TEXT_INTEGRATION_POINTS == "object" ? de(l.MATHML_TEXT_INTEGRATION_POINTS) : $({}, nn), dr = se(l, "HTML_INTEGRATION_POINTS") && l.HTML_INTEGRATION_POINTS && typeof l.HTML_INTEGRATION_POINTS == "object" ? de(l.HTML_INTEGRATION_POINTS) : $({}, an);
    const p = se(l, "CUSTOM_ELEMENT_HANDLING") && l.CUSTOM_ELEMENT_HANDLING && typeof l.CUSTOM_ELEMENT_HANDLING == "object" ? de(l.CUSTOM_ELEMENT_HANDLING) : ot(null);
    if (D = ot(null), se(p, "tagNameCheck") && sn(p.tagNameCheck) && (D.tagNameCheck = p.tagNameCheck), se(p, "attributeNameCheck") && sn(p.attributeNameCheck) && (D.attributeNameCheck = p.attributeNameCheck), se(p, "allowCustomizedBuiltInElements") && typeof p.allowCustomizedBuiltInElements == "boolean" && (D.allowCustomizedBuiltInElements = p.allowCustomizedBuiltInElements), ce(D), Le && (pt = !1), Lt && (Ze = !0), Qe && (W = $({}, $n), X = ot(null), Qe.html === !0 && ($(W, Wn), $(X, Vn)), Qe.svg === !0 && ($(W, Tr), $(X, Rr), $(X, Wt)), Qe.svgFilters === !0 && ($(W, Sr), $(X, Rr), $(X, Wt)), Qe.mathMl === !0 && ($(W, Ar), $(X, Gn), $(X, Wt))), me.tagCheck = null, me.attributeCheck = null, se(l, "ADD_TAGS") && (typeof l.ADD_TAGS == "function" ? me.tagCheck = l.ADD_TAGS : Ue(l.ADD_TAGS) && (W === Ke && (W = de(W)), $(W, l.ADD_TAGS, K))), se(l, "ADD_ATTR") && (typeof l.ADD_ATTR == "function" ? me.attributeCheck = l.ADD_ATTR : Ue(l.ADD_ATTR) && (X === be && (X = de(X)), $(X, l.ADD_ATTR, K))), se(l, "ADD_URI_SAFE_ATTR") && Ue(l.ADD_URI_SAFE_ATTR) && $(ir, l.ADD_URI_SAFE_ATTR, K), se(l, "FORBID_CONTENTS") && Ue(l.FORBID_CONTENTS) && (ve === lr && (ve = de(ve)), $(ve, l.FORBID_CONTENTS, K)), se(l, "ADD_FORBID_CONTENTS") && Ue(l.ADD_FORBID_CONTENTS) && (ve === lr && (ve = de(ve)), $(ve, l.ADD_FORBID_CONTENTS, K)), or && (W["#text"] = !0), Be && $(W, ["html", "head", "body"]), W.table && ($(W, ["tbody"]), delete ne.tbody), l.TRUSTED_TYPES_POLICY) {
      if (typeof l.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw qe('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof l.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw qe('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const w = E;
      E = l.TRUSTED_TYPES_POLICY;
      try {
        H = _("");
      } catch (L) {
        throw E = w, L;
      }
    } else l.TRUSTED_TYPES_POLICY === null ? (E = void 0, H = "") : (E === void 0 && (E = S()), E && typeof H == "string" && (H = _("")));
    ie && ie(l), tt = l;
  }, on = $({}, [...Tr, ...Sr, ..._i]), ln = $({}, [...Ar, ...Ti]), ja = function(l, p, w) {
    return p.namespaceURI === Oe ? l === "svg" : p.namespaceURI === Mt ? l === "svg" && (w === "annotation-xml" || ur[w]) : !!on[l];
  }, qa = function(l, p, w) {
    return p.namespaceURI === Oe ? l === "math" : p.namespaceURI === Ut ? l === "math" && dr[w] : !!ln[l];
  }, Wa = function(l, p, w) {
    return p.namespaceURI === Ut && !dr[w] || p.namespaceURI === Mt && !ur[w] ? !1 : !ln[l] && (Fa[l] || !on[l]);
  }, $a = function(l) {
    let p = x(l);
    (!p || !p.tagName) && (p = {
      namespaceURI: et,
      tagName: "template"
    });
    const w = wt(l.tagName), L = wt(p.tagName);
    return mr[l.namespaceURI] ? l.namespaceURI === Ut ? ja(w, p, L) : l.namespaceURI === Mt ? qa(w, p, L) : l.namespaceURI === Oe ? Wa(w, p, L) : !!(ht === "application/xhtml+xml" && mr[l.namespaceURI]) : !1;
  }, Ie = function(l) {
    st(t.removed, {
      element: l
    });
    try {
      x(l).removeChild(l);
    } catch {
      if (P(l), !x(l))
        throw qe("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, Ft = function(l) {
    gt(l);
    const p = C(l);
    if (p) {
      const L = [];
      at(p, (I) => {
        st(L, I);
      }), at(L, (I) => {
        try {
          P(I);
        } catch {
        }
      });
    }
    const w = M(l);
    if (w)
      for (let L = w.length - 1; L >= 0; --L) {
        const I = w[L], j = I && I.name;
        if (typeof j == "string")
          try {
            l.removeAttribute(j);
          } catch {
          }
      }
  }, je = function(l, p) {
    try {
      st(t.removed, {
        attribute: p.getAttributeNode(l),
        from: p
      });
    } catch {
      st(t.removed, {
        attribute: null,
        from: p
      });
    }
    if (p.removeAttribute(l), l === "is")
      if (Ze || Lt)
        try {
          Ie(p);
        } catch {
        }
      else
        try {
          p.setAttribute(l, "");
        } catch {
        }
  }, Va = function(l) {
    const p = M(l);
    if (p)
      for (let w = p.length - 1; w >= 0; --w) {
        const L = p[w], I = L && L.name;
        if (!(typeof I != "string" || X[K(I)]))
          try {
            l.removeAttribute(I);
          } catch {
          }
      }
  }, gt = function(l) {
    const p = [l];
    for (; p.length > 0; ) {
      const w = p.pop();
      (U ? U(w) : w.nodeType) === xe.element && Va(w);
      const I = C(w);
      if (I)
        for (let j = I.length - 1; j >= 0; --j)
          p.push(I[j]);
    }
  }, Ga = function(l) {
    if (!Pe)
      return;
    const p = [l];
    for (; p.length > 0; ) {
      const w = p.pop(), L = U ? U(w) : w.nodeType;
      if (L === xe.processingInstruction || L === xe.comment && ae(Yn, w.data)) {
        try {
          P(w);
        } catch {
        }
        continue;
      }
      if (L === xe.element) {
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
  }, cn = function(l) {
    let p = null, w = null;
    if (sr)
      l = "<remove></remove>" + l;
    else {
      const j = Hn(l, /^[\r\n\t ]+/);
      w = j && j[0];
    }
    ht === "application/xhtml+xml" && et === Oe && (l = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + l + "</body></html>");
    const L = E ? _(l) : l;
    if (et === Oe)
      try {
        p = new u().parseFromString(L, ht);
      } catch {
      }
    if (!p || !p.documentElement) {
      p = ze.createDocument(et, "template", null);
      try {
        p.documentElement.innerHTML = cr ? H : L;
      } catch {
      }
    }
    const I = p.body || p.documentElement;
    return l && w && I.insertBefore(r.createTextNode(w), I.childNodes[0] || null), et === Oe ? Re.call(p, Be ? "html" : "body")[0] : Be ? p.documentElement : I;
  }, mn = function(l) {
    const p = A ? A(l) : l.ownerDocument;
    return vt.call(
      p || l,
      l,
      // eslint-disable-next-line no-bitwise
      f.SHOW_ELEMENT | f.SHOW_COMMENT | f.SHOW_TEXT | f.SHOW_PROCESSING_INSTRUCTION | f.SHOW_CDATA_SECTION,
      null
    );
  }, zt = function(l) {
    return l = bt(l, Ce, " "), l = bt(l, He, " "), l = bt(l, kt, " "), l;
  }, pr = function(l) {
    var p;
    l.normalize();
    const w = A ? A(l) : l.ownerDocument, L = vt.call(
      w || l,
      l,
      // eslint-disable-next-line no-bitwise
      f.SHOW_TEXT | f.SHOW_COMMENT | f.SHOW_CDATA_SECTION | f.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let I = L.nextNode();
    for (; I; )
      I.data = zt(I.data), I = L.nextNode();
    const j = (p = l.querySelectorAll) === null || p === void 0 ? void 0 : p.call(l, "template");
    j && at(j, (Y) => {
      rt(Y.content) && pr(Y.content);
    });
  }, Ht = function(l) {
    const p = h ? h(l) : null;
    return typeof p != "string" || K(p) !== "form" ? !1 : typeof l.nodeName != "string" || typeof l.textContent != "string" || typeof l.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    l.attributes !== M(l) || typeof l.removeAttribute != "function" || typeof l.setAttribute != "function" || typeof l.namespaceURI != "string" || typeof l.insertBefore != "function" || typeof l.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    l.nodeType !== U(l) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
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
    l.childNodes !== C(l);
  }, rt = function(l) {
    if (!U || typeof l != "object" || l === null)
      return !1;
    try {
      return U(l) === xe.documentFragment;
    } catch {
      return !1;
    }
  }, yt = function(l) {
    if (!U || typeof l != "object" || l === null)
      return !1;
    try {
      return typeof U(l) == "number";
    } catch {
      return !1;
    }
  };
  function ke(R, l, p) {
    R.length !== 0 && at(R, (w) => {
      w.call(t, l, p, tt);
    });
  }
  const Ja = function(l, p) {
    return !!(Pe && l.hasChildNodes() && !yt(l.firstElementChild) && ae(Xn, l.textContent) && ae(Xn, l.innerHTML) || Pe && l.namespaceURI === Oe && p === "style" && yt(l.firstElementChild) || l.nodeType === xe.processingInstruction || Pe && l.nodeType === xe.comment && ae(Yn, l.data));
  }, Xa = function(l, p, w) {
    if (!ne[p] && pn(p) && (D.tagNameCheck instanceof RegExp && ae(D.tagNameCheck, p) || D.tagNameCheck instanceof Function && D.tagNameCheck(p)))
      return !1;
    if (or && !ve[p]) {
      const L = x(l), I = C(l);
      if (I && L) {
        const j = I.length;
        for (let Y = j - 1; Y >= 0; --Y) {
          const Z = l === w ? k(I[Y], !0) : I[Y];
          L.insertBefore(Z, B(l));
        }
      }
    }
    return Ie(l), !0;
  }, un = function(l, p, w, L) {
    return l.length === 0 ? p : p === w || p === L ? de(p) : p;
  }, dn = function(l, p) {
    if (ke(V.beforeSanitizeElements, l, null), l !== p && x(l) === null)
      return It && gt(l), !0;
    if (Ht(l))
      return Ie(l), !0;
    const w = K(h ? h(l) : l.nodeName);
    if (W = un(V.uponSanitizeElement, W, Ke, Ct), ke(V.uponSanitizeElement, l, {
      tagName: w,
      allowedTags: W
    }), l !== p && x(l) === null)
      return It && gt(l), !0;
    if (Ja(l, w))
      return Ie(l), !0;
    if (ne[w] || !(me.tagCheck instanceof Function && me.tagCheck(w)) && !W[w]) {
      const I = Xa(l, w, p);
      return I === !1 && ke(V.afterSanitizeElements, l, null), I;
    }
    if ((U ? U(l) : l.nodeType) === xe.element && !$a(l) || (w === "noscript" || w === "noembed" || w === "noframes") && ae(Pi, l.innerHTML))
      return Ie(l), !0;
    if (Le && l.nodeType === xe.text) {
      const I = zt(l.textContent);
      l.textContent !== I && (st(t.removed, {
        element: l.cloneNode()
      }), l.textContent = I);
    }
    return ke(V.afterSanitizeElements, l, null), !1;
  }, fn = function(l, p, w) {
    if (Te[p] || Pe && p === "patchsrc" || Pe && p === "for" && l !== "label" && l !== "output" || Kr && (p === "id" || p === "name") && (w in r || w in Ba))
      return !1;
    const L = X[p] || me.attributeCheck instanceof Function && me.attributeCheck(p, l);
    if (!(pt && ae(G, p))) {
      if (!(ft && ae(he, p))) {
        if (L) {
          if (!ir[p]) {
            if (!ae(dt, bt(w, ut, ""))) {
              if (!((p === "src" || p === "xlink:href" || p === "href") && l !== "script" && Bn(w, "data:") === 0 && en[l])) {
                if (!(De && !ae(Ye, bt(w, ut, "")))) {
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
          !(pn(l) && (D.tagNameCheck instanceof RegExp && ae(D.tagNameCheck, l) || D.tagNameCheck instanceof Function && D.tagNameCheck(l)) && (D.attributeNameCheck instanceof RegExp && ae(D.attributeNameCheck, p) || D.attributeNameCheck instanceof Function && D.attributeNameCheck(p, l)) || // Alternative, second condition checks if it's an `is`-attribute, AND
          // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
          p === "is" && D.allowCustomizedBuiltInElements && (D.tagNameCheck instanceof RegExp && ae(D.tagNameCheck, w) || D.tagNameCheck instanceof Function && D.tagNameCheck(w)))
        ) return !1;
      }
    }
    return !0;
  }, Ya = $({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), pn = function(l) {
    return !Ya[wt(l)] && ae(nr, l);
  }, Ka = function(l, p, w, L) {
    if (E && typeof y == "object" && typeof y.getAttributeType == "function" && !w)
      switch (y.getAttributeType(l, p)) {
        case "TrustedHTML":
          return _(L);
        case "TrustedScriptURL":
          return N(L);
      }
    return L;
  }, Za = function(l, p, w, L) {
    try {
      w ? l.setAttributeNS(w, p, L) : l.setAttribute(p, L), Ht(l) ? Ie(l) : zn(t.removed);
    } catch {
      je(p, l);
    }
  }, hn = function(l) {
    ke(V.beforeSanitizeAttributes, l, null);
    const p = l.attributes;
    if (!p || Ht(l))
      return;
    X = un(V.uponSanitizeAttribute, X, be, Dt);
    const w = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: X,
      forceKeepAttr: void 0
    };
    let L = p.length;
    const I = K(l.nodeName);
    for (; L--; ) {
      const j = p[L], Y = j.name, Z = j.namespaceURI, ge = j.value, ye = K(Y), gr = ge;
      let pe = Y === "value" ? gr : gi(gr);
      if (w.attrName = ye, w.attrValue = pe, w.keepAttr = !0, w.forceKeepAttr = void 0, ke(V.uponSanitizeAttribute, l, w), pe = w.attrValue, Zr && (ye === "id" || ye === "name") && Bn(pe, Qr) !== 0 && (je(Y, l), pe = Qr + pe), Pe && ae(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, pe)) {
        je(Y, l);
        continue;
      }
      if (ye === "attributename" && Hn(pe, "href")) {
        je(Y, l);
        continue;
      }
      if (!w.forceKeepAttr) {
        if (!w.keepAttr) {
          je(Y, l);
          continue;
        }
        if (!Yr && ae(Ii, pe)) {
          je(Y, l);
          continue;
        }
        if (Le && (pe = zt(pe)), !fn(I, ye, pe)) {
          je(Y, l);
          continue;
        }
        pe = Ka(I, ye, Z, pe), pe !== gr && Za(l, Y, Z, pe);
      }
    }
    ke(V.afterSanitizeAttributes, l, null);
  }, Bt = function(l) {
    let p = null;
    const w = mn(l);
    for (ke(V.beforeSanitizeShadowDOM, l, null); p = w.nextNode(); )
      if (ke(V.uponSanitizeShadowNode, p, null), dn(p, l), hn(p), rt(p.content) && Bt(p.content), (U ? U(p) : p.nodeType) === xe.element) {
        const I = O(p);
        rt(I) && (hr(I), Bt(I));
      }
    ke(V.afterSanitizeShadowDOM, l, null);
  }, hr = function(l) {
    const p = [{
      node: l,
      shadow: null
    }];
    for (; p.length > 0; ) {
      const w = p.pop();
      if (w.shadow) {
        Bt(w.shadow);
        continue;
      }
      const L = w.node, j = (U ? U(L) : L.nodeType) === xe.element, Y = C(L);
      if (Y)
        for (let Z = Y.length - 1; Z >= 0; --Z)
          p.push({
            node: Y[Z],
            shadow: null
          });
      if (j) {
        const Z = h ? h(L) : null;
        if (typeof Z == "string" && K(Z) === "template") {
          const ge = L.content;
          rt(ge) && p.push({
            node: ge,
            shadow: null
          });
        }
      }
      if (j) {
        const Z = O(L);
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
    let l = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, p = null, w = null, L = null, I = null;
    if (cr = !R, cr && (R = "<!-->"), typeof R != "string" && !yt(R) && (R = wi(R), typeof R != "string"))
      throw qe("dirty is not a string, aborting");
    if (!t.isSupported)
      return R;
    ar ? (W = Ct, X = Dt) : fr(l), (V.uponSanitizeElement.length > 0 || V.uponSanitizeAttribute.length > 0) && (W = de(W)), V.uponSanitizeAttribute.length > 0 && (X = de(X)), t.removed = [];
    const j = It && typeof R != "string" && yt(R);
    if (j) {
      Ga(R);
      const ge = h ? h(R) : R.nodeName;
      if (typeof ge == "string") {
        const ye = K(ge);
        if (!W[ye] || ne[ye])
          throw Ft(R), qe("root node is forbidden and cannot be sanitized in-place");
      }
      if (Ht(R))
        throw Ft(R), qe("root node is clobbered and cannot be sanitized in-place");
      try {
        hr(R);
      } catch (ye) {
        throw Ft(R), ye;
      }
    } else if (yt(R))
      p = cn("<!---->"), w = p.ownerDocument.importNode(R, !0), w.nodeType === xe.element && w.nodeName === "BODY" || w.nodeName === "HTML" ? p = w : p.appendChild(w), hr(w);
    else {
      if (!Ze && !Le && !Be && // eslint-disable-next-line unicorn/prefer-includes
      R.indexOf("<") === -1)
        return E && Pt ? _(R) : R;
      if (p = cn(R), !p)
        return Ze ? null : Pt ? H : "";
    }
    p && sr && Ie(p.firstChild);
    const Y = j ? R : p;
    try {
      const ge = mn(Y);
      for (; L = ge.nextNode(); )
        dn(L, Y), hn(L), rt(L.content) && Bt(L.content);
    } catch (ge) {
      throw j && (Ft(R), at(t.removed, (ye) => {
        ye.element && gt(ye.element);
      })), ge;
    }
    if (j)
      return at(t.removed, (ge) => {
        ge.element && gt(ge.element);
      }), Le && pr(R), R;
    if (Ze) {
      if (Le && pr(p), Lt)
        for (I = Ot.call(p.ownerDocument); p.firstChild; )
          I.appendChild(p.firstChild);
      else
        I = p;
      return (X.shadowroot || X.shadowrootmode) && (I = re.call(n, I, !0)), I;
    }
    let Z = Be ? p.outerHTML : p.innerHTML;
    return Be && W["!doctype"] && p.ownerDocument && p.ownerDocument.doctype && p.ownerDocument.doctype.name && ae(Di, p.ownerDocument.doctype.name) && (Z = "<!DOCTYPE " + p.ownerDocument.doctype.name + `>
` + Z), Le && (Z = zt(Z)), E && Pt ? _(Z) : Z;
  }, t.setConfig = function() {
    let R = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    fr(R), ar = !0, Ct = W, Dt = X;
  }, t.clearConfig = function() {
    tt = null, ar = !1, Ct = null, Dt = null, E = z, H = "";
  }, t.isValidAttribute = function(R, l, p) {
    tt || fr({});
    const w = K(R), L = K(l);
    return fn(w, L, p);
  }, t.addHook = function(R, l) {
    typeof l == "function" && se(V, R) && st(V[R], l);
  }, t.removeHook = function(R, l) {
    if (se(V, R)) {
      if (l !== void 0) {
        const p = pi(V[R], l);
        return p === -1 ? void 0 : hi(V[R], p, 1)[0];
      }
      return zn(V[R]);
    }
  }, t.removeHooks = function(R) {
    se(V, R) && (V[R] = []);
  }, t.removeAllHooks = function() {
    V = Kn();
  }, t;
}
var Ma = Ia();
function Fi(e) {
  var A, E, H;
  const { settings: t, post: r, comments: n, submitted: s, commentForm: o, submitComment: i, setCommentForm: c, commentError: f, slug: d } = e, u = String((r == null ? void 0 : r.content) || "").split(/<!--\s*nextpage\s*-->/i), [y] = es(), b = u.length, k = Math.max(1, Math.min(b, parseInt(y.get("page") || "1", 10) || 1)), P = u[k - 1] || "", B = b > 1 && a.createElement(
    "nav",
    { className: "flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-100" },
    k > 1 && a.createElement(F, { to: "/post/" + d + (k - 1 > 1 ? "?page=" + (k - 1) : ""), className: "text-sm text-gray-500 hover:text-primary-600" }, "← " + g("previous", t)),
    a.createElement("span", { className: "text-sm text-gray-500" }, g("page", t) + " " + k + " / " + b),
    k < b && a.createElement(F, { to: "/post/" + d + "?page=" + (k + 1), className: "text-sm text-gray-500 hover:text-primary-600" }, g("next", t) + " →")
  ), C = Ir(null);
  Da(C, [r == null ? void 0 : r.content]);
  const x = (A = r.categories) == null ? void 0 : A[0], O = r.author, M = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 bg-white", U = n.map((z) => a.createElement(
    "div",
    { key: z.id, className: "mb-5 p-5 rounded-2xl border border-gray-100" },
    a.createElement(
      "div",
      { className: "flex items-center gap-2.5 mb-2" },
      a.createElement("img", { src: qt(z.email || ""), alt: "", className: "w-8 h-8 rounded-full" }),
      a.createElement(
        "div",
        null,
        a.createElement("p", { className: "font-medium text-sm text-gray-900" }, z.author),
        a.createElement("p", { className: "text-xs text-gray-500" }, new Date(z.createdAt).toLocaleDateString())
      )
    ),
    a.createElement("p", { className: "text-sm text-gray-700 leading-relaxed" }, z.content),
    (z.children || []).map((q) => a.createElement(
      "div",
      { key: q.id, className: "ml-8 mt-3 pl-4 border-l-2 border-gray-100" },
      a.createElement(
        "div",
        { className: "flex items-center gap-2 mb-1" },
        a.createElement("img", { src: qt(q.email || ""), alt: "", className: "w-6 h-6 rounded-full" }),
        a.createElement("span", { className: "font-medium text-sm text-gray-800" }, q.author)
      ),
      a.createElement("p", { className: "text-sm text-gray-600" }, q.content)
    ))
  )), h = a.createElement(
    "form",
    { onSubmit: i, noValidate: !0, className: "space-y-3 mt-6 p-6 rounded-2xl bg-gray-50" },
    a.createElement("h4", { className: "text-sm font-semibold text-gray-900" }, g("leave a comment", t)),
    f && a.createElement("div", { role: "alert", className: "p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg" }, f),
    a.createElement("input", { type: "text", name: "website_url", style: { position: "absolute", left: "-9999px" }, tabIndex: -1, autoComplete: "off" }),
    a.createElement(
      "div",
      { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
      a.createElement("input", { value: o.author, onChange: (z) => c({ ...o, author: z.target.value }), placeholder: g("name", t), "aria-label": g("name", t), className: M, autoComplete: "name" }),
      a.createElement("input", { value: o.email, onChange: (z) => c({ ...o, email: z.target.value }), placeholder: g("email", t), type: "email", "aria-label": g("email", t), className: M, autoComplete: "email" })
    ),
    a.createElement("textarea", { value: o.content, onChange: (z) => c({ ...o, content: z.target.value }), placeholder: g("your comment", t) + "...", "aria-label": g("your comment", t), className: M, rows: 3, required: !0 }),
    a.createElement(
      "label",
      { className: "flex items-center gap-2 text-sm text-gray-500 cursor-pointer" },
      a.createElement("input", { type: "checkbox", checked: !!o.notifyMe, onChange: (z) => c({ ...o, notifyMe: z.target.checked }), className: "rounded border-gray-300 text-primary-600" }),
      g("notify me of replies", t)
    ),
    a.createElement("button", { type: "submit", className: "w-full py-2.5 rounded-xl text-white text-sm font-medium transition-colors", style: { background: "var(--primary-color, #2563eb)" } }, g("submit comment", t))
  );
  return a.createElement(
    "article",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(ka, { items: [{ label: g("blog", t), to: "/" }, { label: r.title || g("post", t) }] }),
    // Header: category chip + title + meta
    a.createElement(
      "header",
      { className: "mb-8" },
      x && a.createElement(F, {
        to: "/category/" + x.slug,
        className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4",
        style: { background: "color-mix(in srgb, var(--primary-color, #2563eb) 10%, transparent)", color: "var(--primary-color, #2563eb)" }
      }, a.createElement(Zt, { size: 11 }), x.name),
      a.createElement(
        "h1",
        { className: "text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-4" },
        r.format && r.format !== "standard" ? a.createElement("span", { className: "block text-xs font-normal text-gray-500 mb-1 uppercase tracking-wider" }, r.format) : null,
        r.title
      ),
      a.createElement(
        "div",
        { className: "flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 border-y border-gray-100 py-3" },
        a.createElement(
          "span",
          { className: "flex items-center gap-1.5" },
          a.createElement("img", { src: qt((O == null ? void 0 : O.email) || ""), alt: "", className: "w-6 h-6 rounded-full" }),
          a.createElement(F, { to: "/author/" + ((O == null ? void 0 : O.username) || ""), className: "font-medium text-gray-700 hover:text-primary-600" }, O == null ? void 0 : O.username)
        ),
        a.createElement("span", { className: "flex items-center gap-1.5" }, a.createElement(Fe, { size: 14 }), Xe(r.publishedAt || r.createdAt)),
        a.createElement("span", { className: "flex items-center gap-1.5" }, a.createElement(ss, { size: 14 }), rr(r.content || "")),
        r.commentCount > 0 && a.createElement("span", { className: "flex items-center gap-1.5" }, a.createElement(_t, { size: 14 }), r.commentCount)
      )
    ),
    // Featured image
    r.featured && a.createElement(
      "div",
      { className: "mb-10" },
      a.createElement("img", {
        src: it(r.featured, t),
        alt: r.title,
        className: "w-full max-h-96 object-cover rounded-2xl shadow-lg",
        // Hero image is the LCP element: load it eagerly at high priority
        loading: "eager",
        fetchPriority: "high",
        decoding: "async",
        sizes: "(min-width: 900px) 768px, 100vw",
        srcSet: r.srcset ? Object.entries(r.srcset).map(([z, q]) => it(q, t) + " " + z + "w").join(", ") : void 0
      })
    ),
    // Content + table of contents
    ((E = r.meta) == null ? void 0 : E._visual_css) && a.createElement("style", { dangerouslySetInnerHTML: { __html: Ca(r.meta._visual_css) } }),
    a.createElement(Ql, { containerRef: C, settings: t }),
    a.createElement("div", { ref: C, className: "prose prose-gray prose-lg max-w-none mb-12", dangerouslySetInnerHTML: { __html: Ul(ei(Ma.sanitize(P)), t) } }),
    B,
    // Tags
    ((H = r.tags) == null ? void 0 : H.length) > 0 && a.createElement(
      "div",
      { className: "flex flex-wrap items-center gap-2 mb-10" },
      a.createElement(ps, { size: 15, className: "text-gray-500" }),
      r.tags.map((z) => a.createElement(F, { key: z.tagId, to: "/tag/" + z.slug, className: "px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" }, z.name))
    ),
    // Share + back row (share buttons toggleable in theme settings)
    a.createElement(
      "div",
      { className: "flex items-center justify-between py-6 border-t border-gray-100 mb-10" },
      a.createElement(F, { to: "/", className: "text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1" }, a.createElement(ta, { size: 15 }), g("all posts", t)),
      t.theme_show_share_buttons !== "0" && a.createElement(Kl, { title: r.title, url: "/post/" + r.slug, siteUrl: t.site_url })
    ),
    // Author box
    O && a.createElement(
      "div",
      { className: "flex items-start gap-4 p-6 rounded-2xl bg-gray-50 mb-10" },
      a.createElement("img", { src: qt((O == null ? void 0 : O.email) || ""), alt: "", className: "w-14 h-14 rounded-full flex-shrink-0" }),
      a.createElement(
        "div",
        null,
        a.createElement("p", { className: "text-xs text-gray-500 mb-0.5" }, g("written by", t)),
        a.createElement(F, { to: "/author/" + O.username, className: "font-semibold text-gray-900 hover:text-primary-600" }, O.username),
        O.bio && a.createElement("p", { className: "text-sm text-gray-600 mt-1.5 leading-relaxed" }, O.bio)
      )
    ),
    // Related posts (toggleable in theme settings)
    t.theme_show_related_posts !== "0" && a.createElement(
      "section",
      { className: "mb-12" },
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, g("related posts", t)),
      d && a.createElement(Yl, { postId: r == null ? void 0 : r.id, slug: d })
    ),
    // Comments
    a.createElement(
      "section",
      { className: "border-t border-gray-100 pt-8" },
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-5" }, g("comments", t) + (n.length ? " (" + n.length + ")" : "")),
      n.length === 0 && !s && a.createElement(
        "div",
        { className: "text-center py-6 rounded-2xl bg-gray-50 mb-6" },
        a.createElement("p", { className: "text-sm text-gray-500" }, g("no comments yet", t) + ". " + g("be the first to share your thoughts", t) + "!")
      ),
      U,
      s && a.createElement("p", { className: "text-sm text-green-600 mb-4" }, g("comment submitted and pending review", t)),
      h
    )
  );
}
function zi(e) {
  var s;
  const { settings: t, page: r } = e, n = Ir(null);
  return Da(n, [r == null ? void 0 : r.content]), r ? a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(ka, { items: [{ label: g("home", t), to: "/" }, { label: r.title }] }),
    a.createElement("h1", { className: "text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight my-8" }, r.title),
    ((s = r.meta) == null ? void 0 : s._visual_css) && a.createElement("style", { dangerouslySetInnerHTML: { __html: Ca(r.meta._visual_css) } }),
    a.createElement("div", { ref: n, className: "prose prose-gray prose-lg max-w-none", dangerouslySetInnerHTML: { __html: Ma.sanitize(r.content || "") } }),
    r.parent && a.createElement(
      F,
      { to: "/page/" + r.parent.slug, className: "inline-flex items-center gap-1 mt-10 text-sm text-gray-500 hover:text-primary-600" },
      a.createElement(ta, { size: 15 }),
      r.parent.title
    )
  ) : null;
}
const ic = { name: "default", typography: { cap: 2, max: 24 }, Header: Cl, Footer: Dl, HomeLayout: Hl, CategoryLayout: jl, TagLayout: Wl, ArchiveLayout: Vl, SearchLayout: Gl, AuthorLayout: Xl, PostLayout: Fi, PageLayout: zi };
export {
  ic as default
};
