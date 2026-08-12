import c, { forwardRef as Tt, createElement as qe, useState as j, useEffect as G, useRef as or } from "react";
import { Link as P, useNavigate as ar } from "react-router-dom";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ir = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Pt = (...e) => e.filter((t, r, n) => !!t && t.trim() !== "" && n.indexOf(t) === r).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var lr = {
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
const cr = Tt(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: n,
    className: s = "",
    children: o,
    iconNode: a,
    ...l
  }, d) => qe(
    "svg",
    {
      ref: d,
      ...lr,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: n ? Number(r) * 24 / Number(t) : r,
      className: Pt("lucide", s),
      ...l
    },
    [
      ...a.map(([m, u]) => qe(m, u)),
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
const $ = (e, t) => {
  const r = Tt(
    ({ className: n, ...s }, o) => qe(cr, {
      ref: o,
      iconNode: t,
      className: Pt(`lucide-${ir(e)}`, n),
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
const at = $("Calendar", [
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
const ur = $("FileText", [
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
const dr = $("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fr = $("Folder", [
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
const mr = $("Menu", [
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
const pr = $("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hr = $("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const it = $("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gr = $("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function kt(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: yr } = Object.prototype, { getPrototypeOf: ae } = Object, { iterator: pe, toStringTag: Ct } = Symbol, Ne = (({ hasOwnProperty: e }) => (t, r) => e.call(t, r))(Object.prototype), me = (e, t) => {
  let r = e;
  const n = [];
  for (; r != null && r !== Object.prototype; ) {
    if (n.indexOf(r) !== -1)
      return !1;
    if (n.push(r), Ne(r, t))
      return !0;
    r = ae(r);
  }
  return !1;
}, br = (e, t) => e != null && me(e, t) ? e[t] : void 0, Ve = /* @__PURE__ */ ((e) => (t) => {
  const r = yr.call(t);
  return e[r] || (e[r] = r.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), I = (e) => (e = e.toLowerCase(), (t) => Ve(t) === e), Te = (e) => (t) => typeof t === e, { isArray: te } = Array, re = Te("undefined");
function ie(e) {
  return e !== null && !re(e) && e.constructor !== null && !re(e.constructor) && U(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const vt = I("ArrayBuffer");
function Er(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && vt(e.buffer), t;
}
const wr = Te("string"), U = Te("function"), Dt = Te("number"), le = (e) => e !== null && typeof e == "object", xr = (e) => e === !0 || e === !1, Re = (e) => {
  if (!le(e))
    return !1;
  const t = ae(e);
  return (t === null || t === Object.prototype || ae(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !me(e, Ct) && !me(e, pe);
}, Rr = (e) => {
  if (!le(e) || ie(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, Sr = I("Date"), Or = I("File"), Nr = (e) => !!(e && typeof e.uri < "u"), _r = (e) => e && typeof e.getParts < "u", Ar = I("Blob"), Tr = I("FileList"), Pr = I("Set"), kr = (e) => le(e) && U(e.pipe);
function Cr() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const lt = Cr(), ct = typeof lt.FormData < "u" ? lt.FormData : void 0, vr = (e) => {
  if (!e) return !1;
  if (ct && e instanceof ct) return !0;
  const t = ae(e);
  if (!t || t === Object.prototype || !U(e.append)) return !1;
  const r = Ve(e);
  return r === "formdata" || // detect form-data instance
  r === "object" && U(e.toString) && e.toString() === "[object FormData]";
}, Dr = I("URLSearchParams"), [Lr, Ur, Fr, Br] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(I), jr = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function he(e, t, { allOwnKeys: r = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let n, s;
  if (typeof e != "object" && (e = [e]), te(e))
    for (n = 0, s = e.length; n < s; n++)
      t.call(null, e[n], n, e);
  else {
    if (ie(e))
      return;
    const o = r ? Object.getOwnPropertyNames(e) : Object.keys(e), a = o.length;
    let l;
    for (n = 0; n < a; n++)
      l = o[n], t.call(null, e[l], l, e);
  }
}
function Lt(e, t) {
  if (ie(e))
    return null;
  t = t.toLowerCase();
  const r = Object.keys(e);
  let n = r.length, s;
  for (; n-- > 0; )
    if (s = r[n], t === s.toLowerCase())
      return s;
  return null;
}
const Y = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Ut = (e) => !re(e) && e !== Y;
function He(...e) {
  const { caseless: t, skipUndefined: r } = Ut(this) && this || {}, n = {}, s = (o, a) => {
    if (a === "__proto__" || a === "constructor" || a === "prototype")
      return;
    const l = t && typeof a == "string" && Lt(n, a) || a, d = Ne(n, l) ? n[l] : void 0;
    Re(d) && Re(o) ? n[l] = He(d, o) : Re(o) ? n[l] = He({}, o) : te(o) ? n[l] = o.slice() : (!r || !re(o)) && (n[l] = o);
  };
  for (let o = 0, a = e.length; o < a; o++) {
    const l = e[o];
    if (!l || ie(l) || (he(l, s), typeof l != "object" || te(l)))
      continue;
    const d = Object.getOwnPropertySymbols(l);
    for (let m = 0; m < d.length; m++) {
      const u = d[m];
      Gr.call(l, u) && s(l[u], u);
    }
  }
  return n;
}
const Ir = (e, t, r, { allOwnKeys: n } = {}) => (he(
  t,
  (s, o) => {
    r && U(s) ? Object.defineProperty(e, o, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: kt(s, r),
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
), e), Mr = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), qr = (e, t, r, n) => {
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
}, Hr = (e, t, r, n) => {
  let s, o, a;
  const l = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0; )
      a = s[o], (!n || n(a, e, t)) && !l[a] && (t[a] = e[a], l[a] = !0);
    e = r !== !1 && ae(e);
  } while (e && (!r || r(e, t)) && e !== Object.prototype);
  return t;
}, zr = (e, t, r) => {
  e = String(e), (r === void 0 || r > e.length) && (r = e.length), r -= t.length;
  const n = e.indexOf(t, r);
  return n !== -1 && n === r;
}, $r = (e) => {
  if (!e) return null;
  if (te(e)) return e;
  let t = e.length;
  if (!Dt(t)) return null;
  const r = new Array(t);
  for (; t-- > 0; )
    r[t] = e[t];
  return r;
}, Wr = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && ae(Uint8Array)), Vr = (e, t) => {
  const n = (e && e[pe]).call(e);
  let s;
  for (; (s = n.next()) && !s.done; ) {
    const o = s.value;
    t.call(e, o[0], o[1]);
  }
}, Jr = (e, t) => {
  let r;
  const n = [];
  for (; (r = e.exec(t)) !== null; )
    n.push(r);
  return n;
}, Kr = I("HTMLFormElement"), Xr = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(r, n, s) {
  return n.toUpperCase() + s;
}), { propertyIsEnumerable: Gr } = Object.prototype, Zr = I("RegExp"), Ft = (e, t) => {
  const r = Object.getOwnPropertyDescriptors(e), n = {};
  he(r, (s, o) => {
    let a;
    (a = t(s, o, e)) !== !1 && (n[o] = a || s);
  }), Object.defineProperties(e, n);
}, Qr = (e) => {
  Ft(e, (t, r) => {
    if (U(e) && ["arguments", "caller", "callee"].includes(r))
      return !1;
    const n = e[r];
    if (U(n)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + r + "'");
      });
    }
  });
}, Yr = (e, t) => {
  const r = {}, n = (s) => {
    s.forEach((o) => {
      r[o] = !0;
    });
  };
  return te(e) ? n(e) : n(String(e).split(t)), r;
}, en = () => {
}, tn = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function rn(e) {
  return !!(e && U(e.append) && e[Ct] === "FormData" && e[pe]);
}
const nn = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), r = (n) => {
    if (le(n)) {
      if (t.has(n))
        return;
      if (ie(n))
        return n;
      if (!("toJSON" in n)) {
        t.add(n);
        let s;
        if (Pr(n)) {
          s = [];
          for (const o of n) {
            const a = r(o);
            !re(a) && s.push(a);
          }
        } else
          s = te(n) ? [] : {}, he(n, (o, a) => {
            const l = r(o);
            !re(l) && (s[a] = l);
          });
        return t.delete(n), s;
      }
    }
    return n;
  };
  return r(e);
}, sn = I("AsyncFunction"), on = (e) => e && (le(e) || U(e)) && U(e.then) && U(e.catch), Bt = ((e, t) => e ? setImmediate : t ? ((r, n) => (Y.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === Y && o === r && n.length && n.shift()();
  },
  !1
), (s) => {
  n.push(s), Y.postMessage(r, "*");
}))(`axios@${Math.random()}`, []) : (r) => setTimeout(r))(typeof setImmediate == "function", U(Y.postMessage)), an = typeof queueMicrotask < "u" ? queueMicrotask.bind(Y) : typeof process < "u" && process.nextTick || Bt, jt = (e) => e != null && U(e[pe]), ln = (e) => e != null && me(e, pe) && jt(e), i = {
  isArray: te,
  isArrayBuffer: vt,
  isBuffer: ie,
  isFormData: vr,
  isArrayBufferView: Er,
  isString: wr,
  isNumber: Dt,
  isBoolean: xr,
  isObject: le,
  isPlainObject: Re,
  isEmptyObject: Rr,
  isReadableStream: Lr,
  isRequest: Ur,
  isResponse: Fr,
  isHeaders: Br,
  isUndefined: re,
  isDate: Sr,
  isFile: Or,
  isReactNativeBlob: Nr,
  isReactNative: _r,
  isBlob: Ar,
  isRegExp: Zr,
  isFunction: U,
  isStream: kr,
  isURLSearchParams: Dr,
  isTypedArray: Wr,
  isFileList: Tr,
  forEach: he,
  merge: He,
  extend: Ir,
  trim: jr,
  stripBOM: Mr,
  inherits: qr,
  toFlatObject: Hr,
  kindOf: Ve,
  kindOfTest: I,
  endsWith: zr,
  toArray: $r,
  forEachEntry: Vr,
  matchAll: Jr,
  isHTMLForm: Kr,
  hasOwnProperty: Ne,
  hasOwnProp: Ne,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: me,
  getSafeProp: br,
  reduceDescriptors: Ft,
  freezeMethods: Qr,
  toObjectSet: Yr,
  toCamelCase: Xr,
  noop: en,
  toFiniteNumber: tn,
  findKey: Lt,
  global: Y,
  isContextDefined: Ut,
  isSpecCompliantForm: rn,
  toJSONObject: nn,
  isAsyncFn: sn,
  isThenable: on,
  setImmediate: Bt,
  asap: an,
  isIterable: jt,
  isSafeIterable: ln
}, cn = i.toObjectSet([
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
]), un = (e) => {
  const t = {};
  let r, n, s;
  return e && e.split(`
`).forEach(function(a) {
    s = a.indexOf(":"), r = a.substring(0, s).trim().toLowerCase(), n = a.substring(s + 1).trim();
    const l = i.hasOwnProp(t, r);
    !r || l && i.hasOwnProp(cn, r) || (r === "set-cookie" ? l ? t[r].push(n) : t[r] = [n] : t[r] = l ? t[r] + ", " + n : n);
  }), t;
};
function dn(e) {
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
const fn = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), mn = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Je(e, t) {
  return i.isArray(e) ? e.map((r) => Je(r, t)) : dn(String(e).replace(t, ""));
}
const pn = (e) => Je(e, fn), hn = (e) => Je(e, mn);
function It(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return i.forEach(e.toJSON(), (r, n) => {
    t[n] = hn(r);
  }), t;
}
const ut = Symbol("internals");
function fe(e) {
  return e && String(e).trim().toLowerCase();
}
function Se(e) {
  return e === !1 || e == null ? e : i.isArray(e) ? e.map(Se) : pn(String(e));
}
function gn(e) {
  const t = /* @__PURE__ */ Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let n;
  for (; n = r.exec(e); )
    t[n[1]] = n[2];
  return t;
}
const yn = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function Ue(e) {
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
function bn(e) {
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
function En(e) {
  const t = /* @__PURE__ */ Object.create(null), r = String(e);
  let n = 0, s = !1, o = !1;
  function a(l) {
    const d = Ue(r.slice(n, l)), m = d.indexOf("=");
    if (m < 1)
      return;
    const u = Ue(d.slice(0, m));
    if (!yn.test(u))
      return;
    const f = u.toLowerCase();
    if (f === "__proto__" || f === "constructor" || f === "prototype")
      return;
    const y = Ue(d.slice(m + 1));
    t[f] = bn(y);
  }
  for (let l = 0; l < r.length; l++) {
    const d = r.charCodeAt(l);
    s ? o ? o = !1 : d === 92 ? o = !0 : d === 34 && (s = !1) : d === 34 ? s = !0 : (d === 44 || d === 59) && (a(l), n = l + 1);
  }
  return a(r.length), t;
}
const wn = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Fe(e, t, r, n, s) {
  if (i.isFunction(n))
    return n.call(this, t, r);
  if (s && (t = r), !!i.isString(t)) {
    if (i.isString(n))
      return t.indexOf(n) !== -1;
    if (i.isRegExp(n))
      return n.test(t);
  }
}
function xn(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, r, n) => r.toUpperCase() + n);
}
function Rn(e, t) {
  const r = i.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((n) => {
    Object.defineProperty(e, n + r, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(s, o, a) {
        return this[n].call(this, t, s, o, a);
      },
      configurable: !0
    });
  });
}
let L = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, r, n) {
    const s = this;
    function o(l, d, m) {
      const u = fe(d);
      if (!u)
        return;
      const f = i.findKey(s, u);
      (!f || s[f] === void 0 || m === !0 || m === void 0 && s[f] !== !1) && (s[f || d] = Se(l));
    }
    const a = (l, d) => i.forEach(l, (m, u) => o(m, u, d));
    if (i.isPlainObject(t) || t instanceof this.constructor)
      a(t, r);
    else if (i.isString(t) && (t = t.trim()) && !wn(t))
      a(un(t), r);
    else if (i.isObject(t) && i.isSafeIterable(t)) {
      let l = /* @__PURE__ */ Object.create(null), d, m;
      for (const u of t) {
        if (!i.isArray(u))
          throw new TypeError("Object iterator must return a key-value pair");
        m = u[0], i.hasOwnProp(l, m) ? (d = l[m], l[m] = i.isArray(d) ? [...d, u[1]] : [d, u[1]]) : l[m] = u[1];
      }
      a(l, r);
    } else
      t != null && o(r, t, n);
    return this;
  }
  get(t, r) {
    if (t = fe(t), t) {
      const n = i.findKey(this, t);
      if (n) {
        const s = this[n];
        if (!r)
          return s;
        if (r === !0)
          return gn(s);
        if (i.isFunction(r))
          return r.call(this, s, n);
        if (i.isRegExp(r))
          return r.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, r) {
    if (t = fe(t), t) {
      const n = i.findKey(this, t);
      return !!(n && this[n] !== void 0 && (!r || Fe(this, this[n], n, r)));
    }
    return !1;
  }
  delete(t, r) {
    const n = this;
    let s = !1;
    function o(a) {
      if (a = fe(a), a) {
        const l = i.findKey(n, a);
        l && (!r || Fe(n, n[l], l, r)) && (delete n[l], s = !0);
      }
    }
    return i.isArray(t) ? t.forEach(o) : o(t), s;
  }
  clear(t) {
    const r = Object.keys(this);
    let n = r.length, s = !1;
    for (; n--; ) {
      const o = r[n];
      (!t || Fe(this, this[o], o, t, !0)) && (delete this[o], s = !0);
    }
    return s;
  }
  normalize(t) {
    const r = this, n = {};
    return i.forEach(this, (s, o) => {
      const a = i.findKey(n, o);
      if (a) {
        r[a] = Se(s), delete r[o];
        return;
      }
      const l = t ? xn(o) : String(o).trim();
      l !== o && delete r[o], r[l] = Se(s), n[l] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const r = /* @__PURE__ */ Object.create(null);
    return i.forEach(this, (n, s) => {
      n != null && n !== !1 && (r[s] = t && i.isArray(n) ? n.join(", ") : n);
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
    return i.isArray(t) ? t : t == null || t === !1 ? [] : [t];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static parseParameters(t) {
    return En(t);
  }
  static concat(t, ...r) {
    const n = new this(t);
    return r.forEach((s) => n.set(s)), n;
  }
  static accessor(t) {
    const n = (this[ut] = this[ut] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(a) {
      const l = fe(a);
      n[l] || (Rn(s, a), n[l] = !0);
    }
    return i.isArray(t) ? t.forEach(o) : o(t), this;
  }
};
L.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
i.reduceDescriptors(L.prototype, ({ value: e }, t) => {
  let r = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(n) {
      this[r] = n;
    }
  };
});
i.freezeMethods(L);
const _e = "[REDACTED ****]";
function Sn(e) {
  if (i.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (i.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function On(e, t) {
  const r = new Set(t.map((o) => String(o).toLowerCase())), n = [], s = (o) => {
    if (o === null || typeof o != "object" || i.isBuffer(o)) return o;
    if (n.indexOf(o) !== -1) return;
    o instanceof L && (o = o.toJSON()), n.push(o);
    let a;
    if (i.isArray(o))
      a = [], o.forEach((l, d) => {
        const m = s(l);
        i.isUndefined(m) || (a[d] = m);
      });
    else {
      if (!i.isPlainObject(o) && Sn(o))
        return n.pop(), o;
      a = /* @__PURE__ */ Object.create(null);
      for (const [l, d] of Object.entries(o)) {
        const m = r.has(l.toLowerCase()) ? _e : s(d);
        i.isUndefined(m) || (a[l] = m);
      }
    }
    return n.pop(), a;
  };
  return s(e);
}
function dt(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function Nn(e) {
  return e.errors.map((r) => {
    try {
      return r && r.message ? dt(r.message) : dt(r);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let h = class Mt extends Error {
  static from(t, r, n, s, o, a) {
    let l = t.message;
    !l && i.isArray(t.errors) && t.errors.length && (l = Nn(t));
    const d = new Mt(l, r || t.code, n, s, o);
    return Object.defineProperty(d, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), d.name = t.name, t.status != null && d.status == null && (d.status = t.status), a && Object.assign(d, a), d;
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
    const t = this.config, r = t && i.hasOwnProp(t, "redact") ? t.redact : void 0, n = i.isArray(r) && r.length > 0 ? On(t, r) : i.toJSONObject(t);
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
h.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
h.ERR_BAD_OPTION = "ERR_BAD_OPTION";
h.ECONNABORTED = "ECONNABORTED";
h.ETIMEDOUT = "ETIMEDOUT";
h.ECONNREFUSED = "ECONNREFUSED";
h.ERR_NETWORK = "ERR_NETWORK";
h.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
h.ERR_DEPRECATED = "ERR_DEPRECATED";
h.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
h.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
h.ERR_CANCELED = "ERR_CANCELED";
h.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
h.ERR_INVALID_URL = "ERR_INVALID_URL";
h.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const _n = null, qt = 100;
function ze(e) {
  return i.isPlainObject(e) || i.isArray(e);
}
function Ht(e) {
  return i.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Be(e, t, r) {
  return e ? e.concat(t).map(function(s, o) {
    return s = Ht(s), !r && o ? "[" + s + "]" : s;
  }).join(r ? "." : "") : t;
}
function An(e) {
  return i.isArray(e) && !e.some(ze);
}
const Tn = i.toFlatObject(i, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function Pe(e, t, r) {
  if (!i.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData(), r = i.toFlatObject(
    r,
    {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    },
    !1,
    function(E, w) {
      return !i.isUndefined(w[E]);
    }
  );
  const n = r.metaTokens, s = r.visitor || O, o = r.dots, a = r.indexes, l = r.Blob || typeof Blob < "u" && Blob, d = r.maxDepth === void 0 ? qt : r.maxDepth, m = l && i.isSpecCompliantForm(t), u = [];
  if (!i.isFunction(s))
    throw new TypeError("visitor must be a function");
  function f(p) {
    if (p === null) return "";
    if (i.isDate(p))
      return p.toISOString();
    if (i.isBoolean(p))
      return p.toString();
    if (!m && i.isBlob(p))
      throw new h("Blob is not supported. Use a Buffer instead.");
    if (i.isArrayBuffer(p) || i.isTypedArray(p)) {
      if (m && typeof l == "function")
        return new l([p]);
      throw new h("Blob is not supported. Use a Buffer instead.", h.ERR_NOT_SUPPORT);
    }
    return p;
  }
  function y(p) {
    if (p > d)
      throw new h(
        "Object is too deeply nested (" + p + " levels). Max depth: " + d,
        h.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function x(p, E) {
    if (d === 1 / 0)
      return JSON.stringify(p);
    const w = [];
    return JSON.stringify(p, function(v, A) {
      if (!i.isObject(A))
        return A;
      for (; w.length && w[w.length - 1] !== this; )
        w.pop();
      return w.push(A), y(E + w.length - 1), A;
    });
  }
  function O(p, E, w) {
    let N = p;
    if (i.isReactNative(t) && i.isReactNativeBlob(p))
      return t.append(Be(w, E, o), f(p)), !1;
    if (p && !w && typeof p == "object") {
      if (i.endsWith(E, "{}"))
        E = n ? E : E.slice(0, -2), p = x(p, 1);
      else if (i.isArray(p) && An(p) || (i.isFileList(p) || i.endsWith(E, "[]")) && (N = i.toArray(p)))
        return E = Ht(E), N.forEach(function(A, W) {
          !(i.isUndefined(A) || A === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? Be([E], W, o) : a === null ? E : E + "[]",
            f(A)
          );
        }), !1;
    }
    return ze(p) ? !0 : (t.append(Be(w, E, o), f(p)), !1);
  }
  const b = Object.assign(Tn, {
    defaultVisitor: O,
    convertValue: f,
    isVisitable: ze
  });
  function g(p, E, w = 0) {
    if (!i.isUndefined(p)) {
      if (y(w), u.indexOf(p) !== -1)
        throw new Error("Circular reference detected in " + E.join("."));
      u.push(p), i.forEach(p, function(v, A) {
        (!(i.isUndefined(v) || v === null) && s.call(t, v, i.isString(A) ? A.trim() : A, E, b)) === !0 && g(v, E ? E.concat(A) : [A], w + 1);
      }), u.pop();
    }
  }
  if (!i.isObject(e))
    throw new TypeError("data must be an object");
  return g(e), t;
}
function ft(e) {
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
function Ke(e, t) {
  this._pairs = [], e && Pe(e, this, t);
}
const zt = Ke.prototype;
zt.append = function(t, r) {
  this._pairs.push([t, r]);
};
zt.toString = function(t) {
  const r = t ? (n) => t.call(this, n, ft) : ft;
  return this._pairs.map(function(s) {
    return r(s[0]) + "=" + r(s[1]);
  }, "").join("&");
};
function Pn(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function $t(e, t, r) {
  if (!t)
    return e;
  e = e || "";
  const n = i.isFunction(r) ? {
    serialize: r
  } : r, s = i.getSafeProp(n, "encode") || Pn, o = i.getSafeProp(n, "serialize");
  let a;
  if (o ? a = o(t, n) : a = i.isURLSearchParams(t) ? t.toString() : new Ke(t, n).toString(s), a) {
    const l = e.indexOf("#");
    l !== -1 && (e = e.slice(0, l)), e += (e.indexOf("?") === -1 ? "?" : "&") + a;
  }
  return e;
}
class mt {
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
    i.forEach(this.handlers, function(n) {
      n !== null && t(n);
    });
  }
}
const Xe = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, kn = typeof URLSearchParams < "u" ? URLSearchParams : Ke, Cn = typeof FormData < "u" ? FormData : null, vn = typeof Blob < "u" ? Blob : null, Dn = {
  isBrowser: !0,
  classes: {
    URLSearchParams: kn,
    FormData: Cn,
    Blob: vn
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Ge = typeof window < "u" && typeof document < "u", $e = typeof navigator == "object" && navigator || void 0, Ln = Ge && (!$e || ["ReactNative", "NativeScript", "NS"].indexOf($e.product) < 0), Un = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Fn = Ge && window.location.href || "http://localhost", Bn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Ge,
  hasStandardBrowserEnv: Ln,
  hasStandardBrowserWebWorkerEnv: Un,
  navigator: $e,
  origin: Fn
}, Symbol.toStringTag, { value: "Module" })), C = {
  ...Bn,
  ...Dn
};
function jn(e, t) {
  return Pe(e, new C.classes.URLSearchParams(), {
    visitor: function(r, n, s, o) {
      return C.isNode && i.isBuffer(r) ? (this.append(n, r.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const pt = qt;
function Wt(e) {
  if (e > pt)
    throw new h(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + pt,
      h.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function In(e) {
  const t = [], r = /[^.[\]]+|\[([^.[\]]*)]/g;
  let n;
  for (; (n = r.exec(e)) !== null; )
    Wt(t.length), t.push(n[0] === "[]" ? "" : n[1] || n[0]);
  return t;
}
function Mn(e) {
  const t = {}, r = Object.keys(e);
  let n;
  const s = r.length;
  let o;
  for (n = 0; n < s; n++)
    o = r[n], t[o] = e[o];
  return t;
}
function Vt(e) {
  function t(r, n, s, o) {
    Wt(o);
    let a = r[o++];
    if (a === "__proto__") return !0;
    const l = Number.isFinite(+a), d = o >= r.length;
    return a = !a && i.isArray(s) ? s.length : a, d ? (i.hasOwnProp(s, a) ? s[a] = i.isArray(s[a]) ? s[a].concat(n) : [s[a], n] : s[a] = n, !l) : ((!i.hasOwnProp(s, a) || !i.isObject(s[a])) && (s[a] = []), t(r, n, s[a], o) && i.isArray(s[a]) && (s[a] = Mn(s[a])), !l);
  }
  if (i.isFormData(e) && i.isFunction(e.entries)) {
    const r = {};
    return i.forEachEntry(e, (n, s) => {
      t(In(n), s, r, 0);
    }), r;
  }
  return null;
}
const oe = (e, t) => e != null && i.hasOwnProp(e, t) ? e[t] : void 0;
function qn(e, t, r) {
  if (i.isString(e))
    try {
      return (t || JSON.parse)(e), i.trim(e);
    } catch (n) {
      if (n.name !== "SyntaxError")
        throw n;
    }
  return (r || JSON.stringify)(e);
}
const ge = {
  transitional: Xe,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, r) {
      const n = r.getContentType() || "", s = n.indexOf("application/json") > -1, o = i.isObject(t);
      if (o && i.isHTMLForm(t) && (t = new FormData(t)), i.isFormData(t))
        return s ? JSON.stringify(Vt(t)) : t;
      if (i.isArrayBuffer(t) || i.isBuffer(t) || i.isStream(t) || i.isFile(t) || i.isBlob(t) || i.isReadableStream(t))
        return t;
      if (i.isArrayBufferView(t))
        return t.buffer;
      if (i.isURLSearchParams(t))
        return r.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let l;
      if (o) {
        const d = oe(this, "formSerializer");
        if (n.indexOf("application/x-www-form-urlencoded") > -1)
          return jn(t, d).toString();
        if ((l = i.isFileList(t)) || n.indexOf("multipart/form-data") > -1) {
          const m = oe(this, "env"), u = m && m.FormData;
          return Pe(
            l ? { "files[]": t } : t,
            u && new u(),
            d
          );
        }
      }
      return o || s ? (r.setContentType("application/json", !1), qn(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const r = oe(this, "transitional") || ge.transitional, n = r && r.forcedJSONParsing, s = oe(this, "responseType"), o = s === "json";
      if (i.isResponse(t) || i.isReadableStream(t))
        return t;
      if (t && i.isString(t) && (n && !s || o)) {
        const l = !(r && r.silentJSONParsing) && o;
        try {
          return JSON.parse(t, oe(this, "parseReviver"));
        } catch (d) {
          if (l)
            throw d.name === "SyntaxError" ? h.from(d, h.ERR_BAD_RESPONSE, this, null, oe(this, "response")) : d;
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
    FormData: C.classes.FormData,
    Blob: C.classes.Blob
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
i.forEach(["delete", "get", "head", "post", "put", "patch", "query"], (e) => {
  ge.headers[e] = {};
});
function je(e, t) {
  const r = this || ge, n = t || r, s = L.from(n.headers);
  let o = n.data;
  return i.forEach(e, function(l) {
    o = l.call(r, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function Jt(e) {
  return !!(e && e.__CANCEL__);
}
let ye = class extends h {
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
    super(t ?? "canceled", h.ERR_CANCELED, r, n), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function Kt(e, t, r) {
  const n = r.config.validateStatus;
  !r.status || !n || n(r.status) ? e(r) : t(new h(
    "Request failed with status code " + r.status,
    r.status >= 400 && r.status < 500 ? h.ERR_BAD_REQUEST : h.ERR_BAD_RESPONSE,
    r.config,
    r.request,
    r
  ));
}
function Hn(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function zn(e, t) {
  e = e || 10;
  const r = new Array(e), n = new Array(e);
  let s = 0, o = 0, a;
  return t = t !== void 0 ? t : 1e3, function(d) {
    const m = Date.now(), u = n[o];
    a || (a = m), r[s] = d, n[s] = m;
    let f = o, y = 0;
    for (; f !== s; )
      y += r[f++], f = f % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), m - a < t)
      return;
    const x = u && m - u;
    return x ? Math.round(y * 1e3 / x) : void 0;
  };
}
function $n(e, t) {
  let r = 0, n = 1e3 / t, s, o;
  const a = (m, u = Date.now()) => {
    r = u, s = null, o && (clearTimeout(o), o = null), e(...m);
  };
  return [(...m) => {
    const u = Date.now(), f = u - r;
    f >= n ? a(m, u) : (s = m, o || (o = setTimeout(() => {
      o = null, a(s);
    }, n - f)));
  }, () => s && a(s)];
}
const Ae = (e, t, r = 3) => {
  let n = 0;
  const s = zn(50, 250);
  return $n((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const a = o.loaded, l = o.lengthComputable ? o.total : void 0, d = Math.max(0, l != null ? Math.min(a, l) : a), m = Math.max(0, d - n), u = s(m);
    n = Math.max(n, d);
    const f = {
      loaded: d,
      total: l,
      progress: l ? d / l : void 0,
      bytes: m,
      rate: u || void 0,
      estimated: u && l ? (l - d) / u : void 0,
      event: o,
      lengthComputable: l != null,
      [t ? "download" : "upload"]: !0
    };
    e(f);
  }, r);
}, ht = (e, t) => {
  const r = e != null;
  return [
    (n) => t[0]({
      lengthComputable: r,
      total: e,
      loaded: n
    }),
    t[1]
  ];
}, gt = (e, t = i.asap) => (...r) => t(() => e(...r)), Wn = C.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (r) => (r = new URL(r, C.origin), e.protocol === r.protocol && e.host === r.host && (t || e.port === r.port)))(
  new URL(C.origin),
  C.navigator && /(msie|trident)/i.test(C.navigator.userAgent)
) : () => !0, Vn = C.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, r, n, s, o, a) {
      if (typeof document > "u") return;
      const l = [`${e}=${encodeURIComponent(t)}`];
      i.isNumber(r) && l.push(`expires=${new Date(r).toUTCString()}`), i.isString(n) && l.push(`path=${n}`), i.isString(s) && l.push(`domain=${s}`), o === !0 && l.push("secure"), i.isString(a) && l.push(`SameSite=${a}`), document.cookie = l.join("; ");
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
function Jn(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Kn(e, t) {
  if (!t)
    return e;
  let r = e.length;
  for (; r > 0 && e.charCodeAt(r - 1) === 47; )
    r--;
  return e.slice(0, r) + "/" + t.replace(/^\/+/, "");
}
const Xn = /^https?:(?!\/\/)/i, Gn = /[\t\n\r]/g;
function Zn(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function Qn(e) {
  return Zn(e).replace(Gn, "");
}
function Yn(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, r, n = "") => `${r}${n}${_e}`);
}
function es(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${_e}@`), r = t.indexOf("#"), s = (r === -1 ? t : t.slice(0, r)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${_e}`
  );
  return r === -1 ? s : `${s}#${Yn(t.slice(r + 1))}`;
}
function yt(e, t) {
  if (typeof e == "string") {
    const r = Qn(e);
    if (Xn.test(r))
      throw new h(
        `Invalid URL ${JSON.stringify(es(r))}: missing "//" after protocol`,
        h.ERR_INVALID_URL,
        t
      );
  }
}
function Xt(e, t, r, n) {
  yt(t, n);
  let s = !Jn(t);
  return e && (s || r === !1) ? (yt(e, n), Kn(e, t)) : t;
}
const bt = (e) => e instanceof L ? { ...e } : e, ts = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function ne(e, t) {
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
  function n(u, f, y, x) {
    return i.isPlainObject(u) && i.isPlainObject(f) ? i.merge.call({ caseless: x }, u, f) : i.isPlainObject(f) ? i.merge({}, f) : i.isArray(f) ? f.slice() : f;
  }
  function s(u, f, y, x) {
    if (i.isUndefined(f)) {
      if (!i.isUndefined(u))
        return n(void 0, u, y, x);
    } else return n(u, f, y, x);
  }
  function o(u, f) {
    if (!i.isUndefined(f))
      return n(void 0, f);
  }
  function a(u, f) {
    if (i.isUndefined(f)) {
      if (!i.isUndefined(u))
        return n(void 0, u);
    } else return n(void 0, f);
  }
  function l(u) {
    const f = i.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!i.isUndefined(f))
      if (i.isPlainObject(f)) {
        if (i.hasOwnProp(f, u))
          return f[u];
      } else
        return;
    const y = i.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (i.isPlainObject(y) && i.hasOwnProp(y, u))
      return y[u];
  }
  function d(u, f, y) {
    if (i.hasOwnProp(t, y))
      return n(u, f);
    if (i.hasOwnProp(e, y))
      return n(void 0, u);
  }
  const m = {
    url: o,
    method: o,
    data: o,
    baseURL: a,
    transformRequest: a,
    transformResponse: a,
    paramsSerializer: a,
    timeout: a,
    timeoutMessage: a,
    withCredentials: a,
    withXSRFToken: a,
    adapter: a,
    responseType: a,
    xsrfCookieName: a,
    xsrfHeaderName: a,
    onUploadProgress: a,
    onDownloadProgress: a,
    decompress: a,
    maxContentLength: a,
    maxBodyLength: a,
    beforeRedirect: a,
    transport: a,
    httpAgent: a,
    httpsAgent: a,
    cancelToken: a,
    socketPath: a,
    allowedSocketPaths: a,
    responseEncoding: a,
    validateStatus: d,
    headers: (u, f, y) => s(bt(u), bt(f), y, !0)
  };
  return i.forEach(ts({ ...e, ...t }), function(f) {
    if (f === "__proto__" || f === "constructor" || f === "prototype") return;
    const y = i.hasOwnProp(m, f) ? m[f] : s, x = i.hasOwnProp(e, f) ? e[f] : void 0, O = i.hasOwnProp(t, f) ? t[f] : void 0, b = y(x, O, f);
    i.isUndefined(b) && y !== d || (r[f] = b);
  }), i.hasOwnProp(t, "validateStatus") && i.isUndefined(t.validateStatus) && l("validateStatusUndefinedResolves") === !1 && (i.hasOwnProp(e, "validateStatus") ? r.validateStatus = n(void 0, e.validateStatus) : delete r.validateStatus), r;
}
const rs = ["content-type", "content-length"];
function ns(e, t, r) {
  if (r !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([n, s]) => {
    rs.includes(n.toLowerCase()) && e.set(n, s);
  });
}
const ss = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
);
function Gt(e) {
  const t = ne({}, e), r = (y) => i.hasOwnProp(t, y) ? t[y] : void 0, n = r("data");
  let s = r("withXSRFToken");
  const o = r("xsrfHeaderName"), a = r("xsrfCookieName");
  let l = r("headers");
  const d = r("auth"), m = r("baseURL"), u = r("allowAbsoluteUrls"), f = r("url");
  if (t.headers = l = L.from(l), t.url = $t(
    Xt(m, f, u, t),
    r("params"),
    r("paramsSerializer")
  ), d) {
    const y = i.getSafeProp(d, "username") || "", x = i.getSafeProp(d, "password") || "";
    try {
      l.set(
        "Authorization",
        "Basic " + btoa(y + ":" + (x ? ss(x) : ""))
      );
    } catch (O) {
      throw h.from(O, h.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (i.isFormData(n) && (C.hasStandardBrowserEnv || C.hasStandardBrowserWebWorkerEnv || i.isReactNative(n) ? l.setContentType(void 0) : i.isFunction(n.getHeaders) && ns(l, n.getHeaders(), r("formDataHeaderPolicy"))), C.hasStandardBrowserEnv && (i.isFunction(s) && (s = s(t)), s === !0 || s == null && Wn(t.url))) {
    const x = o && a && Vn.read(a);
    x && l.set(o, x);
  }
  return t;
}
const os = typeof XMLHttpRequest < "u", as = os && function(e) {
  return new Promise(function(r, n) {
    const s = Gt(e);
    let o = s.data;
    const a = L.from(s.headers).normalize();
    let { responseType: l, onUploadProgress: d, onDownloadProgress: m } = s, u, f, y, x, O;
    function b() {
      x && x(), O && O(), s.cancelToken && s.cancelToken.unsubscribe(u), s.signal && s.signal.removeEventListener("abort", u);
    }
    let g = new XMLHttpRequest();
    g.open(s.method.toUpperCase(), s.url, !0), g.timeout = s.timeout;
    function p() {
      if (!g)
        return;
      const w = L.from(
        "getAllResponseHeaders" in g && g.getAllResponseHeaders()
      ), v = {
        data: !l || l === "text" || l === "json" ? g.responseText : g.response,
        status: g.status,
        statusText: g.statusText,
        headers: w,
        config: e,
        request: g
      };
      Kt(
        function(W) {
          r(W), b();
        },
        function(W) {
          n(W), b();
        },
        v
      ), g = null;
    }
    "onloadend" in g ? g.onloadend = p : g.onreadystatechange = function() {
      !g || g.readyState !== 4 || g.status === 0 && !(g.responseURL && g.responseURL.startsWith("file:")) || setTimeout(p);
    }, g.onabort = function() {
      g && (n(new h("Request aborted", h.ECONNABORTED, e, g)), b(), g = null);
    }, g.onerror = function(N) {
      const v = N && N.message ? N.message : "Network Error", A = new h(v, h.ERR_NETWORK, e, g);
      A.event = N || null, n(A), b(), g = null;
    }, g.ontimeout = function() {
      let N = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const v = s.transitional || Xe;
      s.timeoutErrorMessage && (N = s.timeoutErrorMessage), n(
        new h(
          N,
          v.clarifyTimeoutError ? h.ETIMEDOUT : h.ECONNABORTED,
          e,
          g
        )
      ), b(), g = null;
    }, o === void 0 && a.setContentType(null), "setRequestHeader" in g && i.forEach(It(a), function(N, v) {
      g.setRequestHeader(v, N);
    }), i.isUndefined(s.withCredentials) || (g.withCredentials = !!s.withCredentials), l && l !== "json" && (g.responseType = s.responseType), m && ([y, O] = Ae(m, !0), g.addEventListener("progress", y)), d && g.upload && ([f, x] = Ae(d), g.upload.addEventListener("progress", f), g.upload.addEventListener("loadend", x)), (s.cancelToken || s.signal) && (u = (w) => {
      g && (n(!w || w.type ? new ye(null, e, g) : w), g.abort(), b(), g = null);
    }, s.cancelToken && s.cancelToken.subscribe(u), s.signal && (s.signal.aborted ? u() : s.signal.addEventListener("abort", u)));
    const E = Hn(s.url);
    if (E && !C.protocols.includes(E)) {
      n(
        new h(
          "Unsupported protocol " + E + ":",
          h.ERR_BAD_REQUEST,
          e
        )
      ), b();
      return;
    }
    g.send(o || null);
  });
}, is = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const r = new AbortController();
  let n = !1;
  const s = function(d) {
    if (!n) {
      n = !0, a();
      const m = d instanceof Error ? d : this.reason;
      r.abort(
        m instanceof h ? m : new ye(m instanceof Error ? m.message : m)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, s(new h(`timeout of ${t}ms exceeded`, h.ETIMEDOUT));
  }, t);
  const a = () => {
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
  const { signal: l } = r;
  return l.unsubscribe = () => i.asap(a), l;
}, ls = function* (e, t) {
  let r = e.byteLength;
  if (r < t) {
    yield e;
    return;
  }
  let n = 0, s;
  for (; n < r; )
    s = n + t, yield e.slice(n, s), n = s;
}, cs = async function* (e, t) {
  for await (const r of us(e))
    yield* ls(r, t);
}, us = async function* (e) {
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
}, Et = (e, t, r, n) => {
  const s = cs(e, t);
  let o = 0, a, l = (d) => {
    a || (a = !0, n && n(d));
  };
  return new ReadableStream(
    {
      async pull(d) {
        try {
          const { done: m, value: u } = await s.next();
          if (m) {
            l(), d.close();
            return;
          }
          let f = u.byteLength;
          if (r) {
            let y = o += f;
            r(y);
          }
          d.enqueue(new Uint8Array(u));
        } catch (m) {
          throw l(m), m;
        }
      },
      cancel(d) {
        return l(d), s.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, wt = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Zt = (e, t, r) => t + 2 < r && wt(e.charCodeAt(t + 1)) && wt(e.charCodeAt(t + 2)), xt = (e) => e <= 57 ? e - 48 : (e & 223) - 55, ds = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, fs = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, ms = (e) => {
  const t = Math.floor(e / 4), r = e % 4;
  return t * 3 + (r === 2 ? 1 : r === 3 ? 2 : 0);
}, ps = (e) => {
  const t = e.length;
  let r = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (r++, t > 1 && e.charCodeAt(t - 2) === 61 && r++), Math.floor((t - r) * 3 / 4);
}, hs = (e) => {
  const t = e.length;
  let r = 0, n = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let a = e.charCodeAt(o);
    if (a === 37 && Zt(e, o, t) && (a = xt(e.charCodeAt(o + 1)) * 16 + xt(e.charCodeAt(o + 2)), o += 2), !fs(a)) {
      if (a === 61) {
        n++;
        continue;
      }
      if (!ds(a) || n > 0) {
        s = !0;
        continue;
      }
      r++;
    }
  }
  return s || n > 2 || n > 0 && (r + n) % 4 !== 0 || r % 4 === 1 ? ps(e) : ms(r);
}, gs = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const r = e.indexOf(",");
  if (r < 0) return 0;
  const n = e.slice(5, r), s = e.slice(r + 1);
  if (/;base64/i.test(n))
    return t(s);
  let a = 0;
  for (let l = 0, d = s.length; l < d; l++) {
    const m = s.charCodeAt(l);
    if (m === 37 && Zt(s, l, d))
      a += 1, l += 2;
    else if (m < 128)
      a += 1;
    else if (m < 2048)
      a += 2;
    else if (m >= 55296 && m <= 56319 && l + 1 < d) {
      const u = s.charCodeAt(l + 1);
      u >= 56320 && u <= 57343 ? (a += 4, l++) : a += 3;
    } else
      a += 3;
  }
  return a;
};
function ys(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return gs(
    t === -1 ? e : e.slice(0, t),
    hs
  );
}
const Ze = "1.19.0", Rt = 64 * 1024, { isFunction: xe } = i, bs = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, r) => String.fromCharCode(parseInt(r, 16))
), St = (e) => {
  if (!i.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, Ot = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, Es = (e) => {
  const t = e.indexOf("://");
  let r = e;
  return t !== -1 && (r = r.slice(t + 3)), r.includes("@") || r.includes(":");
}, ws = (e) => {
  const t = i.global !== void 0 && i.global !== null ? i.global : globalThis, { ReadableStream: r, TextEncoder: n } = t;
  e = i.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: s, Request: o, Response: a } = e, l = s ? xe(s) : typeof fetch == "function", d = xe(o), m = xe(a);
  if (!l)
    return !1;
  const u = l && xe(r), f = l && (typeof n == "function" ? /* @__PURE__ */ ((p) => (E) => p.encode(E))(new n()) : async (p) => new Uint8Array(await new o(p).arrayBuffer())), y = d && u && Ot(() => {
    let p = !1;
    const E = new o(C.origin, {
      body: new r(),
      method: "POST",
      get duplex() {
        return p = !0, "half";
      }
    }), w = E.headers.has("Content-Type");
    return E.body != null && E.body.cancel(), p && !w;
  }), x = m && u && Ot(() => i.isReadableStream(new a("").body)), O = {
    stream: x && ((p) => p.body)
  };
  l && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((p) => {
    !O[p] && (O[p] = (E, w) => {
      let N = E && E[p];
      if (N)
        return N.call(E);
      throw new h(
        `Response type '${p}' is not supported`,
        h.ERR_NOT_SUPPORT,
        w
      );
    });
  });
  const b = async (p) => {
    if (p == null)
      return 0;
    if (i.isBlob(p))
      return p.size;
    if (i.isSpecCompliantForm(p))
      return (await new o(C.origin, {
        method: "POST",
        body: p
      }).arrayBuffer()).byteLength;
    if (i.isArrayBufferView(p) || i.isArrayBuffer(p))
      return p.byteLength;
    if (i.isURLSearchParams(p) && (p = p + ""), i.isString(p))
      return (await f(p)).byteLength;
  }, g = async (p, E) => {
    const w = i.toFiniteNumber(p.getContentLength());
    return w ?? b(E);
  };
  return async (p) => {
    let {
      url: E,
      method: w,
      data: N,
      signal: v,
      cancelToken: A,
      timeout: W,
      onDownloadProgress: Ce,
      onUploadProgress: ve,
      responseType: V,
      headers: J,
      withCredentials: be = "same-origin",
      fetchOptions: Ye,
      maxContentLength: M,
      maxBodyLength: Ee
    } = Gt(p);
    const ce = i.isNumber(M) && M > -1, De = i.isNumber(Ee) && Ee > -1, rr = (_) => i.hasOwnProp(p, _) ? p[_] : void 0;
    let et = s || fetch;
    V = V ? (V + "").toLowerCase() : "text";
    let K = is(
      [v, A && A.toAbortSignal()],
      W
    ), k = null;
    const Z = K && K.unsubscribe && (() => {
      K.unsubscribe();
    });
    let se, ue = null;
    const tt = () => new h(
      "Request body larger than maxBodyLength limit",
      h.ERR_BAD_REQUEST,
      p,
      k
    );
    try {
      let _;
      const B = rr("auth");
      if (B) {
        const R = i.getSafeProp(B, "username") || "", F = i.getSafeProp(B, "password") || "";
        _ = {
          username: R,
          password: F
        };
      }
      if (Es(E)) {
        const R = new URL(E, C.origin);
        if (!_ && (R.username || R.password)) {
          const F = St(R.username), X = St(R.password);
          _ = {
            username: F,
            password: X
          };
        }
        (R.username || R.password) && (R.username = "", R.password = "", E = R.href);
      }
      if (_ && (J.delete("authorization"), J.set(
        "Authorization",
        "Basic " + btoa(bs((_.username || "") + ":" + (_.password || "")))
      )), ce && typeof E == "string" && E.startsWith("data:") && ys(E) > M)
        throw new h(
          "maxContentLength size of " + M + " exceeded",
          h.ERR_BAD_RESPONSE,
          p,
          k
        );
      if (De && w !== "get" && w !== "head") {
        const R = await b(N);
        if (typeof R == "number" && isFinite(R) && (se = R, R > Ee))
          throw tt();
      }
      const we = De && (i.isReadableStream(N) || i.isStream(N)), rt = (R, F, X) => Et(
        R,
        Rt,
        (Q) => {
          if (De && Q > Ee)
            throw ue = tt();
          F && F(Q);
        },
        X
      );
      if (y && w !== "get" && w !== "head" && (ve || we)) {
        if (se = se ?? await g(J, N), se !== 0 || we) {
          let R = new o(E, {
            method: "POST",
            body: N,
            duplex: "half"
          }), F;
          if (i.isFormData(N) && (F = R.headers.get("content-type")) && J.setContentType(F), R.body) {
            const [X, Q] = ve && ht(
              se,
              Ae(gt(ve))
            ) || [];
            N = rt(R.body, X, Q);
          }
        }
      } else if (we && !d && u && w !== "get" && w !== "head")
        N = rt(N);
      else if (we && d && !y && w !== "get" && w !== "head")
        throw new h(
          "Stream request bodies are not supported by the current fetch implementation",
          h.ERR_NOT_SUPPORT,
          p,
          k
        );
      i.isString(be) || (be = be ? "include" : "omit");
      const nr = d && "credentials" in o.prototype;
      if (i.isFormData(N)) {
        const R = J.getContentType();
        R && /^multipart\/form-data/i.test(R) && !/boundary=/i.test(R) && J.delete("content-type");
      }
      J.set("User-Agent", "axios/" + Ze, !1);
      const nt = {
        ...Ye,
        signal: K,
        method: w.toUpperCase(),
        headers: It(J.normalize()),
        body: N,
        duplex: "half",
        credentials: nr ? be : void 0
      };
      k = d && new o(E, nt);
      let H = await (d ? et(k, Ye) : et(E, nt));
      const st = L.from(H.headers);
      if (ce) {
        const R = i.toFiniteNumber(st.getContentLength());
        if (R != null && R > M)
          throw new h(
            "maxContentLength size of " + M + " exceeded",
            h.ERR_BAD_RESPONSE,
            p,
            k
          );
      }
      const Le = x && (V === "stream" || V === "response");
      if (x && H.body && (Ce || ce || Le && Z)) {
        const R = {};
        ["status", "statusText", "headers"].forEach((de) => {
          R[de] = H[de];
        });
        const F = i.toFiniteNumber(st.getContentLength()), [X, Q] = Ce && ht(
          F,
          Ae(gt(Ce), !0)
        ) || [];
        let ot = 0;
        const sr = (de) => {
          if (ce && (ot = de, ot > M))
            throw new h(
              "maxContentLength size of " + M + " exceeded",
              h.ERR_BAD_RESPONSE,
              p,
              k
            );
          X && X(de);
        };
        H = new a(
          Et(H.body, Rt, sr, () => {
            Q && Q(), Z && Z();
          }),
          R
        );
      }
      V = V || "text";
      let z = await O[i.findKey(O, V) || "text"](
        H,
        p
      );
      if (ce && !x && !Le) {
        let R;
        if (z != null && (typeof z.byteLength == "number" ? R = z.byteLength : typeof z.size == "number" ? R = z.size : typeof z == "string" && (R = typeof n == "function" ? new n().encode(z).byteLength : z.length)), typeof R == "number" && R > M)
          throw new h(
            "maxContentLength size of " + M + " exceeded",
            h.ERR_BAD_RESPONSE,
            p,
            k
          );
      }
      return !Le && Z && Z(), await new Promise((R, F) => {
        Kt(R, F, {
          data: z,
          headers: L.from(H.headers),
          status: H.status,
          statusText: H.statusText,
          config: p,
          request: k
        });
      });
    } catch (_) {
      if (Z && Z(), K && K.aborted && K.reason instanceof h) {
        const B = K.reason;
        throw B.config = p, k && (B.request = k), _ !== B && Object.defineProperty(B, "cause", {
          __proto__: null,
          value: _,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), B;
      }
      if (ue)
        throw k && !ue.request && (ue.request = k), ue;
      if (_ instanceof h)
        throw k && !_.request && (_.request = k), _;
      if (_ && _.name === "TypeError" && /Load failed|fetch/i.test(_.message)) {
        const B = new h(
          "Network Error",
          h.ERR_NETWORK,
          p,
          k,
          _ && _.response
        );
        throw Object.defineProperty(B, "cause", {
          __proto__: null,
          value: _.cause || _,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), B;
      }
      throw h.from(_, _ && _.code, p, k, _ && _.response);
    }
  };
}, xs = /* @__PURE__ */ new Map(), Qt = (e) => {
  let t = e && e.env || {};
  const { fetch: r, Request: n, Response: s } = t, o = [n, s, r];
  let a = o.length, l = a, d, m, u = xs;
  for (; l--; )
    d = o[l], m = u.get(d), m === void 0 && u.set(d, m = l ? /* @__PURE__ */ new Map() : ws(t)), u = m;
  return m;
};
Qt();
const Qe = {
  http: _n,
  xhr: as,
  fetch: {
    get: Qt
  }
};
i.forEach(Qe, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const Nt = (e) => `- ${e}`, Rs = (e) => i.isFunction(e) || e === null || e === !1;
function Ss(e, t) {
  e = i.isArray(e) ? e : [e];
  const { length: r } = e;
  let n, s;
  const o = {};
  for (let a = 0; a < r; a++) {
    n = e[a];
    let l;
    if (s = n, !Rs(n) && (s = Qe[(l = String(n)).toLowerCase()], s === void 0))
      throw new h(`Unknown adapter '${l}'`);
    if (s && (i.isFunction(s) || (s = s.get(t))))
      break;
    o[l || "#" + a] = s;
  }
  if (!s) {
    const a = Object.entries(o).map(
      ([d, m]) => `adapter ${d} ` + (m === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let l = r ? a.length > 1 ? `since :
` + a.map(Nt).join(`
`) : " " + Nt(a[0]) : "as no adapter specified";
    throw new h(
      "There is no suitable adapter to dispatch the request " + l,
      h.ERR_NOT_SUPPORT
    );
  }
  return s;
}
const Yt = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: Ss,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Qe
};
function Ie(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new ye(null, e);
}
function Me(e) {
  return Ie(e), e.headers = L.from(e.headers), e.data = je.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Yt.getAdapter(e.adapter || ge.adapter, e)(e).then(
    function(n) {
      Ie(e), e.response = n;
      try {
        n.data = je.call(e, e.transformResponse, n);
      } finally {
        delete e.response;
      }
      return n.headers = L.from(n.headers), n;
    },
    function(n) {
      if (!Jt(n) && (Ie(e), n && n.response)) {
        e.response = n.response;
        try {
          n.response.data = je.call(
            e,
            e.transformResponse,
            n.response
          );
        } finally {
          delete e.response;
        }
        n.response.headers = L.from(n.response.headers);
      }
      return Promise.reject(n);
    }
  );
}
const ke = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  ke[e] = function(n) {
    return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const _t = {};
ke.transitional = function(t, r, n) {
  function s(o, a) {
    return "[Axios v" + Ze + "] Transitional option '" + o + "'" + a + (n ? ". " + n : "");
  }
  return (o, a, l) => {
    if (t === !1)
      throw new h(
        s(a, " has been removed" + (r ? " in " + r : "")),
        h.ERR_DEPRECATED
      );
    return r && !_t[a] && (_t[a] = !0, console.warn(
      s(
        a,
        " has been deprecated since v" + r + " and will be removed in the near future"
      )
    )), t ? t(o, a, l) : !0;
  };
};
ke.spelling = function(t) {
  return (r, n) => (console.warn(`${n} is likely a misspelling of ${t}`), !0);
};
function Os(e, t, r) {
  if (typeof e != "object" || e === null)
    throw new h("options must be an object", h.ERR_BAD_OPTION_VALUE);
  const n = Object.keys(e);
  let s = n.length;
  for (; s-- > 0; ) {
    const o = n[s], a = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (a) {
      const l = e[o], d = l === void 0 || a(l, o, e);
      if (d !== !0)
        throw new h(
          "option " + o + " must be " + d,
          h.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (r !== !0)
      throw new h("Unknown option " + o, h.ERR_BAD_OPTION);
  }
}
const Oe = {
  assertOptions: Os,
  validators: ke
}, D = Oe.validators;
let ee = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new mt(),
      response: new mt()
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
          const a = s.stack.indexOf(`
`);
          return a === -1 ? "" : s.stack.slice(a + 1);
        })();
        try {
          if (!n.stack)
            n.stack = o;
          else if (o) {
            const a = o.indexOf(`
`), l = a === -1 ? -1 : o.indexOf(`
`, a + 1), d = l === -1 ? "" : o.slice(l + 1);
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
    typeof t == "string" ? (r = r || {}, r.url = t) : r = t || {}, r = ne(this.defaults, r);
    const { transitional: n, paramsSerializer: s, headers: o } = r;
    n !== void 0 && Oe.assertOptions(
      n,
      {
        silentJSONParsing: D.transitional(D.boolean),
        forcedJSONParsing: D.transitional(D.boolean),
        clarifyTimeoutError: D.transitional(D.boolean),
        legacyInterceptorReqResOrdering: D.transitional(D.boolean),
        advertiseZstdAcceptEncoding: D.transitional(D.boolean),
        validateStatusUndefinedResolves: D.transitional(D.boolean)
      },
      !1
    ), s != null && (i.isFunction(s) ? r.paramsSerializer = {
      serialize: s
    } : Oe.assertOptions(
      s,
      {
        encode: D.function,
        serialize: D.function
      },
      !0
    )), r.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? r.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : r.allowAbsoluteUrls = !0), Oe.assertOptions(
      r,
      {
        baseUrl: D.spelling("baseURL"),
        withXsrfToken: D.spelling("withXSRFToken")
      },
      !0
    ), r.method = (r.method || this.defaults.method || "get").toLowerCase();
    let a = o && i.merge(o.common, o[r.method]);
    o && i.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (O) => {
      delete o[O];
    }), r.headers = L.concat(a, o);
    const l = [];
    let d = !0;
    this.interceptors.request.forEach(function(b) {
      if (typeof b.runWhen == "function" && b.runWhen(r) === !1)
        return;
      d = d && b.synchronous;
      const g = r.transitional || Xe;
      g && g.legacyInterceptorReqResOrdering ? l.unshift(b.fulfilled, b.rejected) : l.push(b.fulfilled, b.rejected);
    });
    const m = [];
    this.interceptors.response.forEach(function(b) {
      m.push(b.fulfilled, b.rejected);
    });
    let u, f = 0, y;
    if (!d) {
      const O = [Me.bind(this), void 0];
      for (O.unshift(...l), O.push(...m), y = O.length, u = Promise.resolve(r); f < y; )
        u = u.then(O[f++], O[f++]);
      return u;
    }
    y = l.length;
    let x = r;
    for (; f < y; ) {
      const O = l[f++], b = l[f++];
      try {
        x = O ? O(x) : x;
      } catch (g) {
        if (!b) {
          u = Promise.reject(g);
          break;
        }
        try {
          const p = b.call(this, g);
          i.isThenable(p) && (u = Promise.resolve(p).then(
            () => Me.call(this, x)
          ));
        } catch (p) {
          u = Promise.reject(p);
        }
        break;
      }
    }
    if (!u)
      try {
        u = Me.call(this, x);
      } catch (O) {
        u = Promise.reject(O);
      }
    for (f = 0, y = m.length; f < y; )
      u = u.then(m[f++], m[f++]);
    return u;
  }
  getUri(t) {
    t = ne(this.defaults, t);
    const r = Xt(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return $t(r, t.params, t.paramsSerializer);
  }
};
i.forEach(["delete", "get", "head", "options"], function(t) {
  ee.prototype[t] = function(r, n) {
    return this.request(
      ne(n || {}, {
        method: t,
        url: r,
        data: n && i.hasOwnProp(n, "data") ? n.data : void 0
      })
    );
  };
});
i.forEach(["post", "put", "patch", "query"], function(t) {
  function r(n) {
    return function(o, a, l) {
      return this.request(
        ne(l || {}, {
          method: t,
          headers: n ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: o,
          data: a
        })
      );
    };
  }
  ee.prototype[t] = r(), t !== "query" && (ee.prototype[t + "Form"] = r(!0));
});
let Ns = class er {
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
      const a = new Promise((l) => {
        n.subscribe(l), o = l;
      }).then(s);
      return a.cancel = function() {
        n.unsubscribe(o);
      }, a;
    }, t(function(o, a, l) {
      n.reason || (n.reason = new ye(o, a, l), r(n.reason));
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
      token: new er(function(s) {
        t = s;
      }),
      cancel: t
    };
  }
};
function _s(e) {
  return function(r) {
    return e.apply(null, r);
  };
}
function As(e) {
  return i.isObject(e) && e.isAxiosError === !0;
}
const We = {
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
Object.entries(We).forEach(([e, t]) => {
  We[t] = e;
});
function tr(e) {
  const t = new ee(e), r = kt(ee.prototype.request, t);
  return i.extend(r, ee.prototype, t, { allOwnKeys: !0 }), i.extend(r, t, null, { allOwnKeys: !0 }), r.create = function(s) {
    return tr(ne(e, s));
  }, r;
}
const T = tr(ge);
T.Axios = ee;
T.CanceledError = ye;
T.CancelToken = Ns;
T.isCancel = Jt;
T.VERSION = Ze;
T.toFormData = Pe;
T.AxiosError = h;
T.Cancel = T.CanceledError;
T.all = function(t) {
  return Promise.all(t);
};
T.spread = _s;
T.isAxiosError = As;
T.mergeConfig = ne;
T.AxiosHeaders = L;
T.formToJSON = (e) => Vt(i.isHTMLForm(e) ? new FormData(e) : e);
T.getAdapter = Yt.getAdapter;
T.HttpStatusCode = We;
T.default = T;
const {
  Axios: Ws,
  AxiosError: Vs,
  CanceledError: Js,
  isCancel: Ks,
  CancelToken: Xs,
  VERSION: Gs,
  all: Zs,
  Cancel: Qs,
  isAxiosError: Ys,
  spread: eo,
  toFormData: to,
  AxiosHeaders: ro,
  HttpStatusCode: no,
  formToJSON: so,
  getAdapter: oo,
  mergeConfig: ao,
  create: io
} = T, q = T.create({ baseURL: "/api", withCredentials: !0 });
q.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const Ts = {
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
function S(e, t) {
  if (t != null && t.translations_override)
    try {
      const s = JSON.parse(t.translations_override)[e];
      if (typeof s == "string" && s) return s;
    } catch {
    }
  return (localStorage.getItem("mortar_lang") || (t == null ? void 0 : t.site_lang) || "en") === "zh" && Ts[e] || e;
}
function Ps({ settings: e }) {
  const [t, r] = j([]), [n, s] = j(!1), [o, a] = j(null);
  G(() => {
    q.get("/menus/location/primary").then((u) => r(u.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && q.get("/auth/me").then((u) => a(u.data)).catch(() => localStorage.removeItem("mortar_token"));
  }, []);
  function l() {
    q.post("/auth/logout").catch(() => {
    }), localStorage.removeItem("mortar_token"), window.location.href = "/";
  }
  const d = e.theme_header_layout || "centered", m = e.theme_banner_text || "";
  return c.createElement(
    "header",
    { className: "bg-white border-b-4 border-red-700 sticky top-0 z-40 shadow-sm" },
    // Masthead
    c.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-5 " + (d === "centered" ? "text-center" : "flex items-end justify-between") },
      c.createElement(
        P,
        { to: "/", className: "inline-block" },
        c.createElement("h1", { className: "text-3xl md:text-4xl font-bold tracking-tight text-gray-900", style: { fontFamily: "Georgia, serif" } }, e.site_title || "Mortar"),
        e.site_description && c.createElement("p", { className: "text-xs uppercase tracking-[0.3em] text-red-700 mt-1" }, e.site_description)
      ),
      m && c.createElement("p", { className: "text-sm italic text-gray-500 hidden md:block" }, m)
    ),
    // Nav bar
    c.createElement(
      "div",
      { className: "border-t border-gray-200" },
      c.createElement(
        "div",
        { className: "max-w-5xl mx-auto px-4 h-12 flex items-center justify-between" },
        c.createElement(
          "div",
          { className: "hidden md:flex items-center gap-7" },
          c.createElement(P, { to: "/", className: "text-sm font-medium text-gray-700 hover:text-red-700" }, S("home", e)),
          t.filter((u) => !(u.url === "/" && (u.label.toLowerCase() === "home" || u.label === S("home", e)))).map((u) => c.createElement(P, { key: u.id, to: u.url, className: "text-sm font-medium text-gray-700 hover:text-red-700 uppercase tracking-wide" }, u.label))
        ),
        c.createElement(
          "div",
          { className: "hidden md:flex items-center gap-5 text-sm" },
          o ? c.createElement(
            c.Fragment,
            null,
            c.createElement("span", { className: "text-gray-600" }, o.username),
            c.createElement("button", { onClick: l, className: "text-gray-400 hover:text-gray-600" }, S("logout"))
          ) : c.createElement(
            c.Fragment,
            null,
            c.createElement(P, { to: "/login", className: "text-gray-600 hover:text-red-700" }, S("sign in")),
            c.createElement(P, { to: "/register", className: "text-gray-600 hover:text-red-700" }, S("register", e))
          ),
          c.createElement("a", { href: "/admin", className: "px-3 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-800" }, S("admin", e))
        ),
        c.createElement("button", { onClick: () => s(!n), className: "md:hidden p-2 text-gray-600", "aria-label": S("toggle menu", e), "aria-expanded": n, "aria-controls": "mobile-nav" }, n ? c.createElement(gr, { size: 20 }) : c.createElement(mr, { size: 20 }))
      ),
      n && c.createElement(
        "div",
        { className: "md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2" },
        c.createElement(P, { to: "/", className: "block text-sm text-gray-600 py-1" }, S("home", e)),
        t.filter((u) => !(u.url === "/" && (u.label.toLowerCase() === "home" || u.label === S("home", e)))).map((u) => c.createElement(P, { key: u.id, to: u.url, className: "block text-sm text-gray-600 py-1" }, u.label)),
        o ? c.createElement("button", { onClick: l, className: "block text-sm text-gray-400 py-1" }, S("logout")) : c.createElement(P, { to: "/login", className: "block text-sm text-gray-600 py-1" }, S("sign in")),
        c.createElement(P, { to: "/register", className: "block text-sm text-gray-600 py-1" }, S("register", e)),
        c.createElement("a", { href: "/admin", className: "block text-sm text-red-700 font-medium py-1" }, S("admin", e))
      )
    )
  );
}
function ks({ settings: e }) {
  return c.createElement(
    "footer",
    { className: "bg-gray-900 text-gray-300 mt-16" },
    c.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-10" },
      c.createElement(
        "div",
        { className: "text-center mb-6" },
        c.createElement("p", { className: "text-xl font-bold text-white", style: { fontFamily: "Georgia, serif" } }, e.site_title || "Mortar"),
        e.site_description && c.createElement("p", { className: "text-xs uppercase tracking-[0.3em] text-red-400 mt-1" }, e.site_description)
      ),
      c.createElement(
        "div",
        { className: "flex items-center justify-center gap-6 text-sm" },
        c.createElement(P, { to: "/", className: "hover:text-white" }, S("home", e)),
        c.createElement(P, { to: "/search", className: "hover:text-white" }, S("search", e)),
        c.createElement(P, { to: "/page/about", className: "hover:text-white" }, S("about", e)),
        c.createElement("a", { href: "/api/feed/rss", className: "hover:text-white" }, S("rss feed", e))
      ),
      c.createElement("p", { className: "text-center text-xs text-gray-500 mt-6" }, S("powered by", e) + " Mortar")
    )
  );
}
function Cs() {
  const [e, t] = j([]);
  if (G(() => {
    q.get("/tags").then((n) => t(n.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const r = Math.max(...e.map((n) => {
    var s;
    return ((s = n._count) == null ? void 0 : s.posts) || 0;
  }), 1);
  return c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("tag cloud")),
    c.createElement(
      "div",
      { className: "flex flex-wrap gap-1.5" },
      e.map((n) => {
        var o, a, l;
        const s = 0.65 + (((o = n._count) == null ? void 0 : o.posts) || 0) / r * 0.35;
        return c.createElement(P, {
          key: n.id,
          to: "/tag/" + n.slug,
          className: "inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors",
          style: { fontSize: s + "rem" },
          title: (((a = n._count) == null ? void 0 : a.posts) || 0) + " " + S("posts")
        }, n.name + " (" + (((l = n._count) == null ? void 0 : l.posts) || 0) + ")");
      })
    )
  );
}
function vs() {
  const [e, t] = j([]);
  return G(() => {
    q.get("/posts?limit=5").then((r) => t(r.data.posts || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("recent posts")),
    c.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((r) => c.createElement(
        "li",
        { key: r.id },
        c.createElement(P, { to: "/post/" + r.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, r.title)
      ))
    )
  );
}
function Ds() {
  const [e, t] = j([]);
  return G(() => {
    q.get("/posts/popular?limit=5").then((r) => t(r.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, c.createElement(hr, { size: 14 }), S("popular posts")),
    c.createElement(
      "ul",
      { className: "space-y-2" },
      e.map(
        (r, n) => c.createElement(
          "li",
          { key: r.id, className: "flex items-start gap-2" },
          c.createElement("span", { className: "text-xs font-bold text-gray-300 mt-0.5 w-4" }, n + 1),
          c.createElement(P, { to: "/post/" + r.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, r.title),
          r.views > 0 && c.createElement("span", { className: "text-xs text-gray-400 ml-auto shrink-0" }, r.views + " " + S("views"))
        )
      )
    )
  );
}
function Ls() {
  const [e, t] = j([]);
  if (G(() => {
    q.get("/posts/archives").then((n) => t(n.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const r = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("archives")),
    c.createElement(
      "ul",
      { className: "space-y-1" },
      e.map((n) => {
        const [s, o] = n.month.split("-");
        return c.createElement(
          "li",
          { key: n.month },
          c.createElement(
            P,
            { to: "/archive/" + s + "/" + o, className: "text-sm text-gray-600 hover:text-primary-600" },
            r[parseInt(o) - 1] + " " + s + " (" + n.count + ")"
          )
        );
      })
    )
  );
}
function Us() {
  const [e, t] = j(""), [r, n] = j([]), [s, o] = j(!1), [a, l] = j(!1), d = ar(), m = or(null);
  G(() => {
    const y = e.trim();
    if (y.length < 2) {
      n([]), o(!1);
      return;
    }
    l(!0);
    const x = setTimeout(() => {
      q.get("/posts/suggest", { params: { q: y } }).then((O) => {
        var b;
        n(((b = O.data) == null ? void 0 : b.suggestions) || []), o(!0);
      }).catch(() => {
        n([]);
      }).finally(() => l(!1));
    }, 250);
    return () => clearTimeout(x);
  }, [e]), G(() => {
    const y = (x) => {
      m.current && !m.current.contains(x.target) && o(!1);
    };
    return document.addEventListener("mousedown", y), () => document.removeEventListener("mousedown", y);
  }, []);
  const u = (y) => {
    y.preventDefault(), e.trim() && d("/search?q=" + encodeURIComponent(e.trim()));
  }, f = (y) => {
    o(!1), d("/" + y.type + "/" + y.slug);
  };
  return c.createElement(
    "div",
    { ref: m, className: "rounded-lg border border-gray-200 p-4 relative" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("search")),
    c.createElement(
      "form",
      { onSubmit: u, className: "flex gap-2" },
      c.createElement("input", {
        type: "text",
        value: e,
        onChange: (y) => t(y.target.value),
        onFocus: () => {
          r.length > 0 && o(!0);
        },
        placeholder: S("search placeholder"),
        "aria-label": S("search posts"),
        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      }),
      c.createElement("button", {
        type: "submit",
        "aria-label": S("search"),
        className: "px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      }, c.createElement(pr, { size: 16 }))
    ),
    // Suggestions dropdown
    s && r.length > 0 && c.createElement(
      "div",
      { className: "absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden" },
      r.map(
        (y) => c.createElement(
          "button",
          {
            key: y.id,
            type: "button",
            onMouseDown: (x) => {
              x.preventDefault(), f(y);
            },
            className: "w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          },
          c.createElement(y.type === "page" ? dr : ur, { size: 14, className: "text-gray-400 shrink-0" }),
          c.createElement("span", { className: "text-sm text-gray-800 dark:text-gray-100 truncate" }, y.title),
          c.createElement("span", { className: "ml-auto text-xs uppercase text-gray-400 shrink-0" }, y.type)
        )
      )
    ),
    s && a && r.length === 0 && c.createElement("div", { className: "absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 px-3 py-2 text-xs text-gray-400" }, S("searching") + "…")
  );
}
function Fs() {
  const [e, t] = j([]);
  return G(() => {
    q.get("/links").then((r) => t(r.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("links")),
    c.createElement(
      "ul",
      { className: "space-y-1.5" },
      e.map(
        (r) => c.createElement(
          "li",
          { key: r.id },
          c.createElement(
            "a",
            { href: r.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600" },
            r.avatar ? c.createElement("img", { src: r.avatar, alt: "", className: "w-5 h-5 rounded-full object-cover" }) : null,
            c.createElement("span", { className: "truncate" }, r.name)
          )
        )
      )
    )
  );
}
function Bs(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function js(e, t) {
  if (!e) return;
  const r = Bs(t.cdn_url);
  return r && e.startsWith("/uploads/") ? r + e : e;
}
function At(e) {
  const t = Date.now(), r = new Date(e).getTime(), n = t - r, s = Math.floor(n / 6e4);
  if (s < 1) return "just now";
  if (s < 60) return `${s}m ago`;
  const o = Math.floor(s / 60);
  if (o < 24) return `${o}h ago`;
  const a = Math.floor(o / 24);
  if (a < 7) return `${a}d ago`;
  const l = Math.floor(a / 7);
  return l < 5 ? `${l}w ago` : new Date(e).toLocaleDateString();
}
function Is(e) {
  var x, O;
  const { settings: t, posts: r, total: n, page: s, setPage: o, loadError: a, catSlug: l, isTagPage: d, categories: m } = e, u = { fontFamily: "Georgia, serif" }, [f, ...y] = r;
  return c.createElement(
    "div",
    null,
    l && c.createElement(
      "div",
      { className: "bg-red-700 text-white py-10 text-center" },
      c.createElement("h1", { className: "text-3xl font-bold capitalize" }, (d ? S("tag", t) + ": " : "") + (l || "").replace(/-/g, " "))
    ),
    c.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-8" },
      c.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" },
        // Left sidebar (magazine style)
        c.createElement(
          "aside",
          { className: "order-2 lg:order-1 space-y-6" },
          (() => {
            const b = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), g = (p) => b.length === 0 || b.includes(p);
            return c.createElement(
              c.Fragment,
              null,
              g("search") && c.createElement(Us),
              g("recent_posts") && c.createElement(vs),
              g("popular") && c.createElement(Ds),
              g("tag_cloud") && c.createElement(Cs),
              g("archives") && c.createElement(Ls),
              g("links") && c.createElement(Fs)
            );
          })(),
          c.createElement(
            "div",
            { className: "rounded-lg border-2 border-red-700 p-4" },
            c.createElement("h3", { className: "text-sm font-bold text-red-700 mb-3 uppercase tracking-wider", style: u }, S("categories", t)),
            m.length === 0 ? c.createElement("p", { className: "text-sm text-gray-500" }, S("no categories yet", t)) : c.createElement("ul", { className: "space-y-1" }, m.map((b) => {
              var g;
              return c.createElement(
                "li",
                { key: b.id },
                c.createElement(P, { to: "/category/" + b.slug, className: "text-sm " + (l === b.slug ? "text-red-700 font-medium" : "text-gray-600 hover:text-red-700") }, b.name, ((g = b._count) == null ? void 0 : g.posts) > 0 ? c.createElement("span", { className: "text-gray-500 ml-1" }, "(" + b._count.posts + ")") : null)
              );
            }))
          )
        ),
        // Main column
        c.createElement(
          "div",
          { className: "order-1 lg:order-2 lg:col-span-2" },
          r.length === 0 ? a ? c.createElement("div", { className: "text-center py-20" }, c.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, S("failed to load posts", t))) : c.createElement("div", { className: "text-center py-20" }, c.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, S("no posts yet", t))) : c.createElement(
            "div",
            { className: "space-y-10" },
            // Lead story: big card
            f && c.createElement(
              "article",
              { className: "bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200" },
              f.featured && c.createElement("img", { src: js(f.featured, t), alt: f.title, className: "w-full h-64 object-cover", loading: "lazy" }),
              c.createElement(
                "div",
                { className: "p-6" },
                c.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-2" },
                  c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(at, { size: 12 }), At(f.publishedAt || f.createdAt)),
                  c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(it, { size: 12 }), (x = f.author) == null ? void 0 : x.username),
                  ((O = f.categories) == null ? void 0 : O[0]) && c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(fr, { size: 12 }), f.categories[0].name)
                ),
                c.createElement(
                  P,
                  { to: "/post/" + f.slug },
                  c.createElement("h2", { className: "text-2xl font-bold text-gray-900 hover:text-red-700 mb-2", style: u }, f.title)
                ),
                f.excerpt && c.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, f.excerpt),
                c.createElement(P, { to: "/post/" + f.slug, className: "inline-block mt-3 text-sm font-medium text-red-700 hover:text-red-800" }, S("read more", t))
              )
            ),
            // Rest of posts: list with left border
            y.map((b) => {
              var g;
              return c.createElement(
                "article",
                { key: b.id, className: "border-l-4 border-red-700 pl-4 py-2" },
                c.createElement(
                  P,
                  { to: "/post/" + b.slug },
                  c.createElement("h3", { className: "text-lg font-bold text-gray-900 hover:text-red-700", style: u }, b.title)
                ),
                c.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mt-1" },
                  c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(at, { size: 12 }), At(b.publishedAt || b.createdAt)),
                  c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(it, { size: 12 }), (g = b.author) == null ? void 0 : g.username)
                ),
                b.excerpt && c.createElement("p", { className: "text-gray-600 text-sm mt-2" }, b.excerpt)
              );
            })
          ),
          n > parseInt(t.posts_per_page || "10") && c.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-6" },
            c.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + S("previous", t)),
            c.createElement("span", { className: "text-sm text-gray-500" }, S("page", t) + " " + s + " " + S("of", t) + " " + Math.ceil(n / parseInt(t.posts_per_page || "10"))),
            c.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= n, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, S("next", t) + " →")
          )
        )
      )
    )
  );
}
const lo = { name: "magazine", typography: { cap: 1, max: 30 }, Header: Ps, Footer: ks, HomeLayout: Is };
export {
  lo as default
};
