import c, { forwardRef as Tt, createElement as qe, useState as H, useEffect as ae } from "react";
import { Link as P, useNavigate as on } from "react-router-dom";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const an = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Pt = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var ln = {
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
const cn = Tt(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: a,
    ...l
  }, d) => qe(
    "svg",
    {
      ref: d,
      ...ln,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
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
const ne = (e, t) => {
  const n = Tt(
    ({ className: r, ...s }, o) => qe(cn, {
      ref: o,
      iconNode: t,
      className: Pt(`lucide-${an(e)}`, r),
      ...s
    })
  );
  return n.displayName = `${e}`, n;
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const at = ne("Calendar", [
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
const un = ne("Folder", [
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
const dn = ne("Menu", [
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
const fn = ne("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mn = ne("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const it = ne("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pn = ne("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function Ct(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: hn } = Object.prototype, { getPrototypeOf: oe } = Object, { iterator: pe, toStringTag: kt } = Symbol, Ne = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), me = (e, t) => {
  let n = e;
  const r = [];
  for (; n != null && n !== Object.prototype; ) {
    if (r.indexOf(n) !== -1)
      return !1;
    if (r.push(n), Ne(n, t))
      return !0;
    n = oe(n);
  }
  return !1;
}, yn = (e, t) => e != null && me(e, t) ? e[t] : void 0, Ve = /* @__PURE__ */ ((e) => (t) => {
  const n = hn.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), j = (e) => (e = e.toLowerCase(), (t) => Ve(t) === e), Te = (e) => (t) => typeof t === e, { isArray: Y } = Array, ee = Te("undefined");
function ie(e) {
  return e !== null && !ee(e) && e.constructor !== null && !ee(e.constructor) && v(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Dt = j("ArrayBuffer");
function gn(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Dt(e.buffer), t;
}
const bn = Te("string"), v = Te("function"), Lt = Te("number"), le = (e) => e !== null && typeof e == "object", En = (e) => e === !0 || e === !1, Re = (e) => {
  if (!le(e))
    return !1;
  const t = oe(e);
  return (t === null || t === Object.prototype || oe(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !me(e, kt) && !me(e, pe);
}, wn = (e) => {
  if (!le(e) || ie(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, xn = j("Date"), Rn = j("File"), Sn = (e) => !!(e && typeof e.uri < "u"), On = (e) => e && typeof e.getParts < "u", Nn = j("Blob"), _n = j("FileList"), An = j("Set"), Tn = (e) => le(e) && v(e.pipe);
function Pn() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const lt = Pn(), ct = typeof lt.FormData < "u" ? lt.FormData : void 0, Cn = (e) => {
  if (!e) return !1;
  if (ct && e instanceof ct) return !0;
  const t = oe(e);
  if (!t || t === Object.prototype || !v(e.append)) return !1;
  const n = Ve(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && v(e.toString) && e.toString() === "[object FormData]";
}, kn = j("URLSearchParams"), [Dn, Ln, Un, vn] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(j), Fn = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function he(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, s;
  if (typeof e != "object" && (e = [e]), Y(e))
    for (r = 0, s = e.length; r < s; r++)
      t.call(null, e[r], r, e);
  else {
    if (ie(e))
      return;
    const o = n ? Object.getOwnPropertyNames(e) : Object.keys(e), a = o.length;
    let l;
    for (r = 0; r < a; r++)
      l = o[r], t.call(null, e[l], l, e);
  }
}
function Ut(e, t) {
  if (ie(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, s;
  for (; r-- > 0; )
    if (s = n[r], t === s.toLowerCase())
      return s;
  return null;
}
const Z = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, vt = (e) => !ee(e) && e !== Z;
function He(...e) {
  const { caseless: t, skipUndefined: n } = vt(this) && this || {}, r = {}, s = (o, a) => {
    if (a === "__proto__" || a === "constructor" || a === "prototype")
      return;
    const l = t && typeof a == "string" && Ut(r, a) || a, d = Ne(r, l) ? r[l] : void 0;
    Re(d) && Re(o) ? r[l] = He(d, o) : Re(o) ? r[l] = He({}, o) : Y(o) ? r[l] = o.slice() : (!n || !ee(o)) && (r[l] = o);
  };
  for (let o = 0, a = e.length; o < a; o++) {
    const l = e[o];
    if (!l || ie(l) || (he(l, s), typeof l != "object" || Y(l)))
      continue;
    const d = Object.getOwnPropertySymbols(l);
    for (let m = 0; m < d.length; m++) {
      const u = d[m];
      Kn.call(l, u) && s(l[u], u);
    }
  }
  return r;
}
const Bn = (e, t, n, { allOwnKeys: r } = {}) => (he(
  t,
  (s, o) => {
    n && v(s) ? Object.defineProperty(e, o, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: Ct(s, n),
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
  { allOwnKeys: r }
), e), jn = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), In = (e, t, n, r) => {
  e.prototype = Object.create(t.prototype, r), Object.defineProperty(e.prototype, "constructor", {
    __proto__: null,
    value: e,
    writable: !0,
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e, "super", {
    __proto__: null,
    value: t.prototype
  }), n && Object.assign(e.prototype, n);
}, Mn = (e, t, n, r) => {
  let s, o, a;
  const l = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0; )
      a = s[o], (!r || r(a, e, t)) && !l[a] && (t[a] = e[a], l[a] = !0);
    e = n !== !1 && oe(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, qn = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, Hn = (e) => {
  if (!e) return null;
  if (Y(e)) return e;
  let t = e.length;
  if (!Lt(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, zn = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && oe(Uint8Array)), $n = (e, t) => {
  const r = (e && e[pe]).call(e);
  let s;
  for (; (s = r.next()) && !s.done; ) {
    const o = s.value;
    t.call(e, o[0], o[1]);
  }
}, Wn = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, Vn = j("HTMLFormElement"), Jn = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(n, r, s) {
  return r.toUpperCase() + s;
}), { propertyIsEnumerable: Kn } = Object.prototype, Xn = j("RegExp"), Ft = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  he(n, (s, o) => {
    let a;
    (a = t(s, o, e)) !== !1 && (r[o] = a || s);
  }), Object.defineProperties(e, r);
}, Gn = (e) => {
  Ft(e, (t, n) => {
    if (v(e) && ["arguments", "caller", "callee"].includes(n))
      return !1;
    const r = e[n];
    if (v(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, Zn = (e, t) => {
  const n = {}, r = (s) => {
    s.forEach((o) => {
      n[o] = !0;
    });
  };
  return Y(e) ? r(e) : r(String(e).split(t)), n;
}, Qn = () => {
}, Yn = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function er(e) {
  return !!(e && v(e.append) && e[kt] === "FormData" && e[pe]);
}
const tr = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (r) => {
    if (le(r)) {
      if (t.has(r))
        return;
      if (ie(r))
        return r;
      if (!("toJSON" in r)) {
        t.add(r);
        let s;
        if (An(r)) {
          s = [];
          for (const o of r) {
            const a = n(o);
            !ee(a) && s.push(a);
          }
        } else
          s = Y(r) ? [] : {}, he(r, (o, a) => {
            const l = n(o);
            !ee(l) && (s[a] = l);
          });
        return t.delete(r), s;
      }
    }
    return r;
  };
  return n(e);
}, nr = j("AsyncFunction"), rr = (e) => e && (le(e) || v(e)) && v(e.then) && v(e.catch), Bt = ((e, t) => e ? setImmediate : t ? ((n, r) => (Z.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === Z && o === n && r.length && r.shift()();
  },
  !1
), (s) => {
  r.push(s), Z.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", v(Z.postMessage)), sr = typeof queueMicrotask < "u" ? queueMicrotask.bind(Z) : typeof process < "u" && process.nextTick || Bt, jt = (e) => e != null && v(e[pe]), or = (e) => e != null && me(e, pe) && jt(e), i = {
  isArray: Y,
  isArrayBuffer: Dt,
  isBuffer: ie,
  isFormData: Cn,
  isArrayBufferView: gn,
  isString: bn,
  isNumber: Lt,
  isBoolean: En,
  isObject: le,
  isPlainObject: Re,
  isEmptyObject: wn,
  isReadableStream: Dn,
  isRequest: Ln,
  isResponse: Un,
  isHeaders: vn,
  isUndefined: ee,
  isDate: xn,
  isFile: Rn,
  isReactNativeBlob: Sn,
  isReactNative: On,
  isBlob: Nn,
  isRegExp: Xn,
  isFunction: v,
  isStream: Tn,
  isURLSearchParams: kn,
  isTypedArray: zn,
  isFileList: _n,
  forEach: he,
  merge: He,
  extend: Bn,
  trim: Fn,
  stripBOM: jn,
  inherits: In,
  toFlatObject: Mn,
  kindOf: Ve,
  kindOfTest: j,
  endsWith: qn,
  toArray: Hn,
  forEachEntry: $n,
  matchAll: Wn,
  isHTMLForm: Vn,
  hasOwnProperty: Ne,
  hasOwnProp: Ne,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: me,
  getSafeProp: yn,
  reduceDescriptors: Ft,
  freezeMethods: Gn,
  toObjectSet: Zn,
  toCamelCase: Jn,
  noop: Qn,
  toFiniteNumber: Yn,
  findKey: Ut,
  global: Z,
  isContextDefined: vt,
  isSpecCompliantForm: er,
  toJSONObject: tr,
  isAsyncFn: nr,
  isThenable: rr,
  setImmediate: Bt,
  asap: sr,
  isIterable: jt,
  isSafeIterable: or
}, ar = i.toObjectSet([
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
]), ir = (e) => {
  const t = {};
  let n, r, s;
  return e && e.split(`
`).forEach(function(a) {
    s = a.indexOf(":"), n = a.substring(0, s).trim().toLowerCase(), r = a.substring(s + 1).trim();
    const l = i.hasOwnProp(t, n);
    !n || l && i.hasOwnProp(ar, n) || (n === "set-cookie" ? l ? t[n].push(r) : t[n] = [r] : t[n] = l ? t[n] + ", " + r : r);
  }), t;
};
function lr(e) {
  let t = 0, n = e.length;
  for (; t < n; ) {
    const r = e.charCodeAt(t);
    if (r !== 9 && r !== 32)
      break;
    t += 1;
  }
  for (; n > t; ) {
    const r = e.charCodeAt(n - 1);
    if (r !== 9 && r !== 32)
      break;
    n -= 1;
  }
  return t === 0 && n === e.length ? e : e.slice(t, n);
}
const cr = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), ur = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Je(e, t) {
  return i.isArray(e) ? e.map((n) => Je(n, t)) : lr(String(e).replace(t, ""));
}
const dr = (e) => Je(e, cr), fr = (e) => Je(e, ur);
function It(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return i.forEach(e.toJSON(), (n, r) => {
    t[r] = fr(n);
  }), t;
}
const ut = Symbol("internals");
function fe(e) {
  return e && String(e).trim().toLowerCase();
}
function Se(e) {
  return e === !1 || e == null ? e : i.isArray(e) ? e.map(Se) : dr(String(e));
}
function mr(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const pr = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function ve(e) {
  let t = 0, n = e.length;
  for (; t < n; ) {
    const r = e.charCodeAt(t);
    if (r !== 9 && r !== 32)
      break;
    t += 1;
  }
  for (; n > t; ) {
    const r = e.charCodeAt(n - 1);
    if (r !== 9 && r !== 32)
      break;
    n -= 1;
  }
  return t === 0 && n === e.length ? e : e.slice(t, n);
}
function hr(e) {
  const t = e.length - 1;
  if (t < 1 || e.charCodeAt(0) !== 34 || e.charCodeAt(t) !== 34)
    return e;
  let n = "";
  for (let r = 1; r < t; r++) {
    const s = e.charCodeAt(r);
    if (s === 34 || s === 92 && (r += 1, r >= t))
      return e;
    n += e[r];
  }
  return n;
}
function yr(e) {
  const t = /* @__PURE__ */ Object.create(null), n = String(e);
  let r = 0, s = !1, o = !1;
  function a(l) {
    const d = ve(n.slice(r, l)), m = d.indexOf("=");
    if (m < 1)
      return;
    const u = ve(d.slice(0, m));
    if (!pr.test(u))
      return;
    const f = u.toLowerCase();
    if (f === "__proto__" || f === "constructor" || f === "prototype")
      return;
    const E = ve(d.slice(m + 1));
    t[f] = hr(E);
  }
  for (let l = 0; l < n.length; l++) {
    const d = n.charCodeAt(l);
    s ? o ? o = !1 : d === 92 ? o = !0 : d === 34 && (s = !1) : d === 34 ? s = !0 : (d === 44 || d === 59) && (a(l), r = l + 1);
  }
  return a(n.length), t;
}
const gr = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Fe(e, t, n, r, s) {
  if (i.isFunction(r))
    return r.call(this, t, n);
  if (s && (t = n), !!i.isString(t)) {
    if (i.isString(r))
      return t.indexOf(r) !== -1;
    if (i.isRegExp(r))
      return r.test(t);
  }
}
function br(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function Er(e, t) {
  const n = i.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(s, o, a) {
        return this[r].call(this, t, s, o, a);
      },
      configurable: !0
    });
  });
}
let U = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
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
      a(t, n);
    else if (i.isString(t) && (t = t.trim()) && !gr(t))
      a(ir(t), n);
    else if (i.isObject(t) && i.isSafeIterable(t)) {
      let l = /* @__PURE__ */ Object.create(null), d, m;
      for (const u of t) {
        if (!i.isArray(u))
          throw new TypeError("Object iterator must return a key-value pair");
        m = u[0], i.hasOwnProp(l, m) ? (d = l[m], l[m] = i.isArray(d) ? [...d, u[1]] : [d, u[1]]) : l[m] = u[1];
      }
      a(l, n);
    } else
      t != null && o(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = fe(t), t) {
      const r = i.findKey(this, t);
      if (r) {
        const s = this[r];
        if (!n)
          return s;
        if (n === !0)
          return mr(s);
        if (i.isFunction(n))
          return n.call(this, s, r);
        if (i.isRegExp(n))
          return n.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = fe(t), t) {
      const r = i.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || Fe(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function o(a) {
      if (a = fe(a), a) {
        const l = i.findKey(r, a);
        l && (!n || Fe(r, r[l], l, n)) && (delete r[l], s = !0);
      }
    }
    return i.isArray(t) ? t.forEach(o) : o(t), s;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length, s = !1;
    for (; r--; ) {
      const o = n[r];
      (!t || Fe(this, this[o], o, t, !0)) && (delete this[o], s = !0);
    }
    return s;
  }
  normalize(t) {
    const n = this, r = {};
    return i.forEach(this, (s, o) => {
      const a = i.findKey(r, o);
      if (a) {
        n[a] = Se(s), delete n[o];
        return;
      }
      const l = t ? br(o) : String(o).trim();
      l !== o && delete n[o], n[l] = Se(s), r[l] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = /* @__PURE__ */ Object.create(null);
    return i.forEach(this, (r, s) => {
      r != null && r !== !1 && (n[s] = t && i.isArray(r) ? r.join(", ") : r);
    }), n;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([t, n]) => t + ": " + n).join(`
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
    return yr(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((s) => r.set(s)), r;
  }
  static accessor(t) {
    const r = (this[ut] = this[ut] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(a) {
      const l = fe(a);
      r[l] || (Er(s, a), r[l] = !0);
    }
    return i.isArray(t) ? t.forEach(o) : o(t), this;
  }
};
U.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
i.reduceDescriptors(U.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    }
  };
});
i.freezeMethods(U);
const _e = "[REDACTED ****]";
function wr(e) {
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
function xr(e, t) {
  const n = new Set(t.map((o) => String(o).toLowerCase())), r = [], s = (o) => {
    if (o === null || typeof o != "object" || i.isBuffer(o)) return o;
    if (r.indexOf(o) !== -1) return;
    o instanceof U && (o = o.toJSON()), r.push(o);
    let a;
    if (i.isArray(o))
      a = [], o.forEach((l, d) => {
        const m = s(l);
        i.isUndefined(m) || (a[d] = m);
      });
    else {
      if (!i.isPlainObject(o) && wr(o))
        return r.pop(), o;
      a = /* @__PURE__ */ Object.create(null);
      for (const [l, d] of Object.entries(o)) {
        const m = n.has(l.toLowerCase()) ? _e : s(d);
        i.isUndefined(m) || (a[l] = m);
      }
    }
    return r.pop(), a;
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
function Rr(e) {
  return e.errors.map((n) => {
    try {
      return n && n.message ? dt(n.message) : dt(n);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let h = class Mt extends Error {
  static from(t, n, r, s, o, a) {
    let l = t.message;
    !l && i.isArray(t.errors) && t.errors.length && (l = Rr(t));
    const d = new Mt(l, n || t.code, r, s, o);
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
  constructor(t, n, r, s, o) {
    super(t), Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, n && (this.code = n), r && (this.config = r), s && (this.request = s), o && (this.response = o, this.status = o.status);
  }
  toJSON() {
    const t = this.config, n = t && i.hasOwnProp(t, "redact") ? t.redact : void 0, r = i.isArray(n) && n.length > 0 ? xr(t, n) : i.toJSONObject(t);
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
      config: r,
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
const Sr = null, qt = 100;
function ze(e) {
  return i.isPlainObject(e) || i.isArray(e);
}
function Ht(e) {
  return i.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Be(e, t, n) {
  return e ? e.concat(t).map(function(s, o) {
    return s = Ht(s), !n && o ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function Or(e) {
  return i.isArray(e) && !e.some(ze);
}
const Nr = i.toFlatObject(i, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function Pe(e, t, n) {
  if (!i.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData(), n = i.toFlatObject(
    n,
    {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    },
    !1,
    function(b, w) {
      return !i.isUndefined(w[b]);
    }
  );
  const r = n.metaTokens, s = n.visitor || O, o = n.dots, a = n.indexes, l = n.Blob || typeof Blob < "u" && Blob, d = n.maxDepth === void 0 ? qt : n.maxDepth, m = l && i.isSpecCompliantForm(t), u = [];
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
  function E(p) {
    if (p > d)
      throw new h(
        "Object is too deeply nested (" + p + " levels). Max depth: " + d,
        h.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function R(p, b) {
    if (d === 1 / 0)
      return JSON.stringify(p);
    const w = [];
    return JSON.stringify(p, function(D, A) {
      if (!i.isObject(A))
        return A;
      for (; w.length && w[w.length - 1] !== this; )
        w.pop();
      return w.push(A), E(b + w.length - 1), A;
    });
  }
  function O(p, b, w) {
    let N = p;
    if (i.isReactNative(t) && i.isReactNativeBlob(p))
      return t.append(Be(w, b, o), f(p)), !1;
    if (p && !w && typeof p == "object") {
      if (i.endsWith(b, "{}"))
        b = r ? b : b.slice(0, -2), p = R(p, 1);
      else if (i.isArray(p) && Or(p) || (i.isFileList(p) || i.endsWith(b, "[]")) && (N = i.toArray(p)))
        return b = Ht(b), N.forEach(function(A, $) {
          !(i.isUndefined(A) || A === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? Be([b], $, o) : a === null ? b : b + "[]",
            f(A)
          );
        }), !1;
    }
    return ze(p) ? !0 : (t.append(Be(w, b, o), f(p)), !1);
  }
  const g = Object.assign(Nr, {
    defaultVisitor: O,
    convertValue: f,
    isVisitable: ze
  });
  function y(p, b, w = 0) {
    if (!i.isUndefined(p)) {
      if (E(w), u.indexOf(p) !== -1)
        throw new Error("Circular reference detected in " + b.join("."));
      u.push(p), i.forEach(p, function(D, A) {
        (!(i.isUndefined(D) || D === null) && s.call(t, D, i.isString(A) ? A.trim() : A, b, g)) === !0 && y(D, b ? b.concat(A) : [A], w + 1);
      }), u.pop();
    }
  }
  if (!i.isObject(e))
    throw new TypeError("data must be an object");
  return y(e), t;
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
  return encodeURIComponent(e).replace(/[!'()~]|%20/g, function(r) {
    return t[r];
  });
}
function Ke(e, t) {
  this._pairs = [], e && Pe(e, this, t);
}
const zt = Ke.prototype;
zt.append = function(t, n) {
  this._pairs.push([t, n]);
};
zt.toString = function(t) {
  const n = t ? (r) => t.call(this, r, ft) : ft;
  return this._pairs.map(function(s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function _r(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function $t(e, t, n) {
  if (!t)
    return e;
  e = e || "";
  const r = i.isFunction(n) ? {
    serialize: n
  } : n, s = i.getSafeProp(r, "encode") || _r, o = i.getSafeProp(r, "serialize");
  let a;
  if (o ? a = o(t, r) : a = i.isURLSearchParams(t) ? t.toString() : new Ke(t, r).toString(s), a) {
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
  use(t, n, r) {
    return this.handlers.push({
      fulfilled: t,
      rejected: n,
      synchronous: r ? r.synchronous : !1,
      runWhen: r ? r.runWhen : null
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
    i.forEach(this.handlers, function(r) {
      r !== null && t(r);
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
}, Ar = typeof URLSearchParams < "u" ? URLSearchParams : Ke, Tr = typeof FormData < "u" ? FormData : null, Pr = typeof Blob < "u" ? Blob : null, Cr = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Ar,
    FormData: Tr,
    Blob: Pr
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Ge = typeof window < "u" && typeof document < "u", $e = typeof navigator == "object" && navigator || void 0, kr = Ge && (!$e || ["ReactNative", "NativeScript", "NS"].indexOf($e.product) < 0), Dr = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Lr = Ge && window.location.href || "http://localhost", Ur = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Ge,
  hasStandardBrowserEnv: kr,
  hasStandardBrowserWebWorkerEnv: Dr,
  navigator: $e,
  origin: Lr
}, Symbol.toStringTag, { value: "Module" })), k = {
  ...Ur,
  ...Cr
};
function vr(e, t) {
  return Pe(e, new k.classes.URLSearchParams(), {
    visitor: function(n, r, s, o) {
      return k.isNode && i.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
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
function Fr(e) {
  const t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g;
  let r;
  for (; (r = n.exec(e)) !== null; )
    Wt(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
  return t;
}
function Br(e) {
  const t = {}, n = Object.keys(e);
  let r;
  const s = n.length;
  let o;
  for (r = 0; r < s; r++)
    o = n[r], t[o] = e[o];
  return t;
}
function Vt(e) {
  function t(n, r, s, o) {
    Wt(o);
    let a = n[o++];
    if (a === "__proto__") return !0;
    const l = Number.isFinite(+a), d = o >= n.length;
    return a = !a && i.isArray(s) ? s.length : a, d ? (i.hasOwnProp(s, a) ? s[a] = i.isArray(s[a]) ? s[a].concat(r) : [s[a], r] : s[a] = r, !l) : ((!i.hasOwnProp(s, a) || !i.isObject(s[a])) && (s[a] = []), t(n, r, s[a], o) && i.isArray(s[a]) && (s[a] = Br(s[a])), !l);
  }
  if (i.isFormData(e) && i.isFunction(e.entries)) {
    const n = {};
    return i.forEachEntry(e, (r, s) => {
      t(Fr(r), s, n, 0);
    }), n;
  }
  return null;
}
const se = (e, t) => e != null && i.hasOwnProp(e, t) ? e[t] : void 0;
function jr(e, t, n) {
  if (i.isString(e))
    try {
      return (t || JSON.parse)(e), i.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(e);
}
const ye = {
  transitional: Xe,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, n) {
      const r = n.getContentType() || "", s = r.indexOf("application/json") > -1, o = i.isObject(t);
      if (o && i.isHTMLForm(t) && (t = new FormData(t)), i.isFormData(t))
        return s ? JSON.stringify(Vt(t)) : t;
      if (i.isArrayBuffer(t) || i.isBuffer(t) || i.isStream(t) || i.isFile(t) || i.isBlob(t) || i.isReadableStream(t))
        return t;
      if (i.isArrayBufferView(t))
        return t.buffer;
      if (i.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let l;
      if (o) {
        const d = se(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return vr(t, d).toString();
        if ((l = i.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const m = se(this, "env"), u = m && m.FormData;
          return Pe(
            l ? { "files[]": t } : t,
            u && new u(),
            d
          );
        }
      }
      return o || s ? (n.setContentType("application/json", !1), jr(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const n = se(this, "transitional") || ye.transitional, r = n && n.forcedJSONParsing, s = se(this, "responseType"), o = s === "json";
      if (i.isResponse(t) || i.isReadableStream(t))
        return t;
      if (t && i.isString(t) && (r && !s || o)) {
        const l = !(n && n.silentJSONParsing) && o;
        try {
          return JSON.parse(t, se(this, "parseReviver"));
        } catch (d) {
          if (l)
            throw d.name === "SyntaxError" ? h.from(d, h.ERR_BAD_RESPONSE, this, null, se(this, "response")) : d;
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
    FormData: k.classes.FormData,
    Blob: k.classes.Blob
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
  ye.headers[e] = {};
});
function je(e, t) {
  const n = this || ye, r = t || n, s = U.from(r.headers);
  let o = r.data;
  return i.forEach(e, function(l) {
    o = l.call(n, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function Jt(e) {
  return !!(e && e.__CANCEL__);
}
let ge = class extends h {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(t, n, r) {
    super(t ?? "canceled", h.ERR_CANCELED, n, r), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function Kt(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new h(
    "Request failed with status code " + n.status,
    n.status >= 400 && n.status < 500 ? h.ERR_BAD_REQUEST : h.ERR_BAD_RESPONSE,
    n.config,
    n.request,
    n
  ));
}
function Ir(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Mr(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let s = 0, o = 0, a;
  return t = t !== void 0 ? t : 1e3, function(d) {
    const m = Date.now(), u = r[o];
    a || (a = m), n[s] = d, r[s] = m;
    let f = o, E = 0;
    for (; f !== s; )
      E += n[f++], f = f % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), m - a < t)
      return;
    const R = u && m - u;
    return R ? Math.round(E * 1e3 / R) : void 0;
  };
}
function qr(e, t) {
  let n = 0, r = 1e3 / t, s, o;
  const a = (m, u = Date.now()) => {
    n = u, s = null, o && (clearTimeout(o), o = null), e(...m);
  };
  return [(...m) => {
    const u = Date.now(), f = u - n;
    f >= r ? a(m, u) : (s = m, o || (o = setTimeout(() => {
      o = null, a(s);
    }, r - f)));
  }, () => s && a(s)];
}
const Ae = (e, t, n = 3) => {
  let r = 0;
  const s = Mr(50, 250);
  return qr((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const a = o.loaded, l = o.lengthComputable ? o.total : void 0, d = Math.max(0, l != null ? Math.min(a, l) : a), m = Math.max(0, d - r), u = s(m);
    r = Math.max(r, d);
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
  }, n);
}, ht = (e, t) => {
  const n = e != null;
  return [
    (r) => t[0]({
      lengthComputable: n,
      total: e,
      loaded: r
    }),
    t[1]
  ];
}, yt = (e, t = i.asap) => (...n) => t(() => e(...n)), Hr = k.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, k.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(k.origin),
  k.navigator && /(msie|trident)/i.test(k.navigator.userAgent)
) : () => !0, zr = k.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, n, r, s, o, a) {
      if (typeof document > "u") return;
      const l = [`${e}=${encodeURIComponent(t)}`];
      i.isNumber(n) && l.push(`expires=${new Date(n).toUTCString()}`), i.isString(r) && l.push(`path=${r}`), i.isString(s) && l.push(`domain=${s}`), o === !0 && l.push("secure"), i.isString(a) && l.push(`SameSite=${a}`), document.cookie = l.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.split(";");
      for (let n = 0; n < t.length; n++) {
        const r = t[n].replace(/^\s+/, ""), s = r.indexOf("=");
        if (s !== -1 && r.slice(0, s) === e)
          try {
            return decodeURIComponent(r.slice(s + 1));
          } catch {
            return r.slice(s + 1);
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
function $r(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Wr(e, t) {
  if (!t)
    return e;
  let n = e.length;
  for (; n > 0 && e.charCodeAt(n - 1) === 47; )
    n--;
  return e.slice(0, n) + "/" + t.replace(/^\/+/, "");
}
const Vr = /^https?:(?!\/\/)/i, Jr = /[\t\n\r]/g;
function Kr(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function Xr(e) {
  return Kr(e).replace(Jr, "");
}
function Gr(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, n, r = "") => `${n}${r}${_e}`);
}
function Zr(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${_e}@`), n = t.indexOf("#"), s = (n === -1 ? t : t.slice(0, n)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${_e}`
  );
  return n === -1 ? s : `${s}#${Gr(t.slice(n + 1))}`;
}
function gt(e, t) {
  if (typeof e == "string") {
    const n = Xr(e);
    if (Vr.test(n))
      throw new h(
        `Invalid URL ${JSON.stringify(Zr(n))}: missing "//" after protocol`,
        h.ERR_INVALID_URL,
        t
      );
  }
}
function Xt(e, t, n, r) {
  gt(t, r);
  let s = !$r(t);
  return e && (s || n === !1) ? (gt(e, r), Wr(e, t)) : t;
}
const bt = (e) => e instanceof U ? { ...e } : e, Qr = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function te(e, t) {
  e = e || {}, t = t || {};
  const n = /* @__PURE__ */ Object.create(null);
  Object.defineProperty(n, "hasOwnProperty", {
    // Null-proto descriptor so a polluted Object.prototype.get cannot turn
    // this data descriptor into an accessor descriptor on the way in.
    __proto__: null,
    value: Object.prototype.hasOwnProperty,
    enumerable: !1,
    writable: !0,
    configurable: !0
  });
  function r(u, f, E, R) {
    return i.isPlainObject(u) && i.isPlainObject(f) ? i.merge.call({ caseless: R }, u, f) : i.isPlainObject(f) ? i.merge({}, f) : i.isArray(f) ? f.slice() : f;
  }
  function s(u, f, E, R) {
    if (i.isUndefined(f)) {
      if (!i.isUndefined(u))
        return r(void 0, u, E, R);
    } else return r(u, f, E, R);
  }
  function o(u, f) {
    if (!i.isUndefined(f))
      return r(void 0, f);
  }
  function a(u, f) {
    if (i.isUndefined(f)) {
      if (!i.isUndefined(u))
        return r(void 0, u);
    } else return r(void 0, f);
  }
  function l(u) {
    const f = i.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!i.isUndefined(f))
      if (i.isPlainObject(f)) {
        if (i.hasOwnProp(f, u))
          return f[u];
      } else
        return;
    const E = i.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (i.isPlainObject(E) && i.hasOwnProp(E, u))
      return E[u];
  }
  function d(u, f, E) {
    if (i.hasOwnProp(t, E))
      return r(u, f);
    if (i.hasOwnProp(e, E))
      return r(void 0, u);
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
    headers: (u, f, E) => s(bt(u), bt(f), E, !0)
  };
  return i.forEach(Qr({ ...e, ...t }), function(f) {
    if (f === "__proto__" || f === "constructor" || f === "prototype") return;
    const E = i.hasOwnProp(m, f) ? m[f] : s, R = i.hasOwnProp(e, f) ? e[f] : void 0, O = i.hasOwnProp(t, f) ? t[f] : void 0, g = E(R, O, f);
    i.isUndefined(g) && E !== d || (n[f] = g);
  }), i.hasOwnProp(t, "validateStatus") && i.isUndefined(t.validateStatus) && l("validateStatusUndefinedResolves") === !1 && (i.hasOwnProp(e, "validateStatus") ? n.validateStatus = r(void 0, e.validateStatus) : delete n.validateStatus), n;
}
const Yr = ["content-type", "content-length"];
function es(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([r, s]) => {
    Yr.includes(r.toLowerCase()) && e.set(r, s);
  });
}
const ts = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
);
function Gt(e) {
  const t = te({}, e), n = (E) => i.hasOwnProp(t, E) ? t[E] : void 0, r = n("data");
  let s = n("withXSRFToken");
  const o = n("xsrfHeaderName"), a = n("xsrfCookieName");
  let l = n("headers");
  const d = n("auth"), m = n("baseURL"), u = n("allowAbsoluteUrls"), f = n("url");
  if (t.headers = l = U.from(l), t.url = $t(
    Xt(m, f, u, t),
    n("params"),
    n("paramsSerializer")
  ), d) {
    const E = i.getSafeProp(d, "username") || "", R = i.getSafeProp(d, "password") || "";
    try {
      l.set(
        "Authorization",
        "Basic " + btoa(E + ":" + (R ? ts(R) : ""))
      );
    } catch (O) {
      throw h.from(O, h.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (i.isFormData(r) && (k.hasStandardBrowserEnv || k.hasStandardBrowserWebWorkerEnv || i.isReactNative(r) ? l.setContentType(void 0) : i.isFunction(r.getHeaders) && es(l, r.getHeaders(), n("formDataHeaderPolicy"))), k.hasStandardBrowserEnv && (i.isFunction(s) && (s = s(t)), s === !0 || s == null && Hr(t.url))) {
    const R = o && a && zr.read(a);
    R && l.set(o, R);
  }
  return t;
}
const ns = typeof XMLHttpRequest < "u", rs = ns && function(e) {
  return new Promise(function(n, r) {
    const s = Gt(e);
    let o = s.data;
    const a = U.from(s.headers).normalize();
    let { responseType: l, onUploadProgress: d, onDownloadProgress: m } = s, u, f, E, R, O;
    function g() {
      R && R(), O && O(), s.cancelToken && s.cancelToken.unsubscribe(u), s.signal && s.signal.removeEventListener("abort", u);
    }
    let y = new XMLHttpRequest();
    y.open(s.method.toUpperCase(), s.url, !0), y.timeout = s.timeout;
    function p() {
      if (!y)
        return;
      const w = U.from(
        "getAllResponseHeaders" in y && y.getAllResponseHeaders()
      ), D = {
        data: !l || l === "text" || l === "json" ? y.responseText : y.response,
        status: y.status,
        statusText: y.statusText,
        headers: w,
        config: e,
        request: y
      };
      Kt(
        function($) {
          n($), g();
        },
        function($) {
          r($), g();
        },
        D
      ), y = null;
    }
    "onloadend" in y ? y.onloadend = p : y.onreadystatechange = function() {
      !y || y.readyState !== 4 || y.status === 0 && !(y.responseURL && y.responseURL.startsWith("file:")) || setTimeout(p);
    }, y.onabort = function() {
      y && (r(new h("Request aborted", h.ECONNABORTED, e, y)), g(), y = null);
    }, y.onerror = function(N) {
      const D = N && N.message ? N.message : "Network Error", A = new h(D, h.ERR_NETWORK, e, y);
      A.event = N || null, r(A), g(), y = null;
    }, y.ontimeout = function() {
      let N = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const D = s.transitional || Xe;
      s.timeoutErrorMessage && (N = s.timeoutErrorMessage), r(
        new h(
          N,
          D.clarifyTimeoutError ? h.ETIMEDOUT : h.ECONNABORTED,
          e,
          y
        )
      ), g(), y = null;
    }, o === void 0 && a.setContentType(null), "setRequestHeader" in y && i.forEach(It(a), function(N, D) {
      y.setRequestHeader(D, N);
    }), i.isUndefined(s.withCredentials) || (y.withCredentials = !!s.withCredentials), l && l !== "json" && (y.responseType = s.responseType), m && ([E, O] = Ae(m, !0), y.addEventListener("progress", E)), d && y.upload && ([f, R] = Ae(d), y.upload.addEventListener("progress", f), y.upload.addEventListener("loadend", R)), (s.cancelToken || s.signal) && (u = (w) => {
      y && (r(!w || w.type ? new ge(null, e, y) : w), y.abort(), g(), y = null);
    }, s.cancelToken && s.cancelToken.subscribe(u), s.signal && (s.signal.aborted ? u() : s.signal.addEventListener("abort", u)));
    const b = Ir(s.url);
    if (b && !k.protocols.includes(b)) {
      r(
        new h(
          "Unsupported protocol " + b + ":",
          h.ERR_BAD_REQUEST,
          e
        )
      ), g();
      return;
    }
    y.send(o || null);
  });
}, ss = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const s = function(d) {
    if (!r) {
      r = !0, a();
      const m = d instanceof Error ? d : this.reason;
      n.abort(
        m instanceof h ? m : new ge(m instanceof Error ? m.message : m)
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
    if (!r) {
      if (d.aborted) {
        s.call(d);
        return;
      }
      d.addEventListener("abort", s, { once: !0 });
    }
  });
  const { signal: l } = n;
  return l.unsubscribe = () => i.asap(a), l;
}, os = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let r = 0, s;
  for (; r < n; )
    s = r + t, yield e.slice(r, s), r = s;
}, as = async function* (e, t) {
  for await (const n of is(e))
    yield* os(n, t);
}, is = async function* (e) {
  if (e[Symbol.asyncIterator]) {
    yield* e;
    return;
  }
  const t = e.getReader();
  try {
    for (; ; ) {
      const { done: n, value: r } = await t.read();
      if (n)
        break;
      yield r;
    }
  } finally {
    await t.cancel();
  }
}, Et = (e, t, n, r) => {
  const s = as(e, t);
  let o = 0, a, l = (d) => {
    a || (a = !0, r && r(d));
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
          if (n) {
            let E = o += f;
            n(E);
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
}, wt = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Zt = (e, t, n) => t + 2 < n && wt(e.charCodeAt(t + 1)) && wt(e.charCodeAt(t + 2)), xt = (e) => e <= 57 ? e - 48 : (e & 223) - 55, ls = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, cs = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, us = (e) => {
  const t = Math.floor(e / 4), n = e % 4;
  return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, ds = (e) => {
  const t = e.length;
  let n = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, fs = (e) => {
  const t = e.length;
  let n = 0, r = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let a = e.charCodeAt(o);
    if (a === 37 && Zt(e, o, t) && (a = xt(e.charCodeAt(o + 1)) * 16 + xt(e.charCodeAt(o + 2)), o += 2), !cs(a)) {
      if (a === 61) {
        r++;
        continue;
      }
      if (!ls(a) || r > 0) {
        s = !0;
        continue;
      }
      n++;
    }
  }
  return s || r > 2 || r > 0 && (n + r) % 4 !== 0 || n % 4 === 1 ? ds(e) : us(n);
}, ms = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const n = e.indexOf(",");
  if (n < 0) return 0;
  const r = e.slice(5, n), s = e.slice(n + 1);
  if (/;base64/i.test(r))
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
function ps(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return ms(
    t === -1 ? e : e.slice(0, t),
    fs
  );
}
const Ze = "1.19.0", Rt = 64 * 1024, { isFunction: xe } = i, hs = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
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
}, ys = (e) => {
  const t = e.indexOf("://");
  let n = e;
  return t !== -1 && (n = n.slice(t + 3)), n.includes("@") || n.includes(":");
}, gs = (e) => {
  const t = i.global !== void 0 && i.global !== null ? i.global : globalThis, { ReadableStream: n, TextEncoder: r } = t;
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
  const u = l && xe(n), f = l && (typeof r == "function" ? /* @__PURE__ */ ((p) => (b) => p.encode(b))(new r()) : async (p) => new Uint8Array(await new o(p).arrayBuffer())), E = d && u && Ot(() => {
    let p = !1;
    const b = new o(k.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return p = !0, "half";
      }
    }), w = b.headers.has("Content-Type");
    return b.body != null && b.body.cancel(), p && !w;
  }), R = m && u && Ot(() => i.isReadableStream(new a("").body)), O = {
    stream: R && ((p) => p.body)
  };
  l && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((p) => {
    !O[p] && (O[p] = (b, w) => {
      let N = b && b[p];
      if (N)
        return N.call(b);
      throw new h(
        `Response type '${p}' is not supported`,
        h.ERR_NOT_SUPPORT,
        w
      );
    });
  });
  const g = async (p) => {
    if (p == null)
      return 0;
    if (i.isBlob(p))
      return p.size;
    if (i.isSpecCompliantForm(p))
      return (await new o(k.origin, {
        method: "POST",
        body: p
      }).arrayBuffer()).byteLength;
    if (i.isArrayBufferView(p) || i.isArrayBuffer(p))
      return p.byteLength;
    if (i.isURLSearchParams(p) && (p = p + ""), i.isString(p))
      return (await f(p)).byteLength;
  }, y = async (p, b) => {
    const w = i.toFiniteNumber(p.getContentLength());
    return w ?? g(b);
  };
  return async (p) => {
    let {
      url: b,
      method: w,
      data: N,
      signal: D,
      cancelToken: A,
      timeout: $,
      onDownloadProgress: ke,
      onUploadProgress: De,
      responseType: W,
      headers: V,
      withCredentials: be = "same-origin",
      fetchOptions: Ye,
      maxContentLength: I,
      maxBodyLength: Ee
    } = Gt(p);
    const ce = i.isNumber(I) && I > -1, Le = i.isNumber(Ee) && Ee > -1, nn = (_) => i.hasOwnProp(p, _) ? p[_] : void 0;
    let et = s || fetch;
    W = W ? (W + "").toLowerCase() : "text";
    let J = ss(
      [D, A && A.toAbortSignal()],
      $
    ), C = null;
    const X = J && J.unsubscribe && (() => {
      J.unsubscribe();
    });
    let re, ue = null;
    const tt = () => new h(
      "Request body larger than maxBodyLength limit",
      h.ERR_BAD_REQUEST,
      p,
      C
    );
    try {
      let _;
      const B = nn("auth");
      if (B) {
        const x = i.getSafeProp(B, "username") || "", F = i.getSafeProp(B, "password") || "";
        _ = {
          username: x,
          password: F
        };
      }
      if (ys(b)) {
        const x = new URL(b, k.origin);
        if (!_ && (x.username || x.password)) {
          const F = St(x.username), K = St(x.password);
          _ = {
            username: F,
            password: K
          };
        }
        (x.username || x.password) && (x.username = "", x.password = "", b = x.href);
      }
      if (_ && (V.delete("authorization"), V.set(
        "Authorization",
        "Basic " + btoa(hs((_.username || "") + ":" + (_.password || "")))
      )), ce && typeof b == "string" && b.startsWith("data:") && ps(b) > I)
        throw new h(
          "maxContentLength size of " + I + " exceeded",
          h.ERR_BAD_RESPONSE,
          p,
          C
        );
      if (Le && w !== "get" && w !== "head") {
        const x = await g(N);
        if (typeof x == "number" && isFinite(x) && (re = x, x > Ee))
          throw tt();
      }
      const we = Le && (i.isReadableStream(N) || i.isStream(N)), nt = (x, F, K) => Et(
        x,
        Rt,
        (G) => {
          if (Le && G > Ee)
            throw ue = tt();
          F && F(G);
        },
        K
      );
      if (E && w !== "get" && w !== "head" && (De || we)) {
        if (re = re ?? await y(V, N), re !== 0 || we) {
          let x = new o(b, {
            method: "POST",
            body: N,
            duplex: "half"
          }), F;
          if (i.isFormData(N) && (F = x.headers.get("content-type")) && V.setContentType(F), x.body) {
            const [K, G] = De && ht(
              re,
              Ae(yt(De))
            ) || [];
            N = nt(x.body, K, G);
          }
        }
      } else if (we && !d && u && w !== "get" && w !== "head")
        N = nt(N);
      else if (we && d && !E && w !== "get" && w !== "head")
        throw new h(
          "Stream request bodies are not supported by the current fetch implementation",
          h.ERR_NOT_SUPPORT,
          p,
          C
        );
      i.isString(be) || (be = be ? "include" : "omit");
      const rn = d && "credentials" in o.prototype;
      if (i.isFormData(N)) {
        const x = V.getContentType();
        x && /^multipart\/form-data/i.test(x) && !/boundary=/i.test(x) && V.delete("content-type");
      }
      V.set("User-Agent", "axios/" + Ze, !1);
      const rt = {
        ...Ye,
        signal: J,
        method: w.toUpperCase(),
        headers: It(V.normalize()),
        body: N,
        duplex: "half",
        credentials: rn ? be : void 0
      };
      C = d && new o(b, rt);
      let M = await (d ? et(C, Ye) : et(b, rt));
      const st = U.from(M.headers);
      if (ce) {
        const x = i.toFiniteNumber(st.getContentLength());
        if (x != null && x > I)
          throw new h(
            "maxContentLength size of " + I + " exceeded",
            h.ERR_BAD_RESPONSE,
            p,
            C
          );
      }
      const Ue = R && (W === "stream" || W === "response");
      if (R && M.body && (ke || ce || Ue && X)) {
        const x = {};
        ["status", "statusText", "headers"].forEach((de) => {
          x[de] = M[de];
        });
        const F = i.toFiniteNumber(st.getContentLength()), [K, G] = ke && ht(
          F,
          Ae(yt(ke), !0)
        ) || [];
        let ot = 0;
        const sn = (de) => {
          if (ce && (ot = de, ot > I))
            throw new h(
              "maxContentLength size of " + I + " exceeded",
              h.ERR_BAD_RESPONSE,
              p,
              C
            );
          K && K(de);
        };
        M = new a(
          Et(M.body, Rt, sn, () => {
            G && G(), X && X();
          }),
          x
        );
      }
      W = W || "text";
      let q = await O[i.findKey(O, W) || "text"](
        M,
        p
      );
      if (ce && !R && !Ue) {
        let x;
        if (q != null && (typeof q.byteLength == "number" ? x = q.byteLength : typeof q.size == "number" ? x = q.size : typeof q == "string" && (x = typeof r == "function" ? new r().encode(q).byteLength : q.length)), typeof x == "number" && x > I)
          throw new h(
            "maxContentLength size of " + I + " exceeded",
            h.ERR_BAD_RESPONSE,
            p,
            C
          );
      }
      return !Ue && X && X(), await new Promise((x, F) => {
        Kt(x, F, {
          data: q,
          headers: U.from(M.headers),
          status: M.status,
          statusText: M.statusText,
          config: p,
          request: C
        });
      });
    } catch (_) {
      if (X && X(), J && J.aborted && J.reason instanceof h) {
        const B = J.reason;
        throw B.config = p, C && (B.request = C), _ !== B && Object.defineProperty(B, "cause", {
          __proto__: null,
          value: _,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), B;
      }
      if (ue)
        throw C && !ue.request && (ue.request = C), ue;
      if (_ instanceof h)
        throw C && !_.request && (_.request = C), _;
      if (_ && _.name === "TypeError" && /Load failed|fetch/i.test(_.message)) {
        const B = new h(
          "Network Error",
          h.ERR_NETWORK,
          p,
          C,
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
      throw h.from(_, _ && _.code, p, C, _ && _.response);
    }
  };
}, bs = /* @__PURE__ */ new Map(), Qt = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: s } = t, o = [r, s, n];
  let a = o.length, l = a, d, m, u = bs;
  for (; l--; )
    d = o[l], m = u.get(d), m === void 0 && u.set(d, m = l ? /* @__PURE__ */ new Map() : gs(t)), u = m;
  return m;
};
Qt();
const Qe = {
  http: Sr,
  xhr: rs,
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
const Nt = (e) => `- ${e}`, Es = (e) => i.isFunction(e) || e === null || e === !1;
function ws(e, t) {
  e = i.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, s;
  const o = {};
  for (let a = 0; a < n; a++) {
    r = e[a];
    let l;
    if (s = r, !Es(r) && (s = Qe[(l = String(r)).toLowerCase()], s === void 0))
      throw new h(`Unknown adapter '${l}'`);
    if (s && (i.isFunction(s) || (s = s.get(t))))
      break;
    o[l || "#" + a] = s;
  }
  if (!s) {
    const a = Object.entries(o).map(
      ([d, m]) => `adapter ${d} ` + (m === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let l = n ? a.length > 1 ? `since :
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
  getAdapter: ws,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Qe
};
function Ie(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new ge(null, e);
}
function Me(e) {
  return Ie(e), e.headers = U.from(e.headers), e.data = je.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Yt.getAdapter(e.adapter || ye.adapter, e)(e).then(
    function(r) {
      Ie(e), e.response = r;
      try {
        r.data = je.call(e, e.transformResponse, r);
      } finally {
        delete e.response;
      }
      return r.headers = U.from(r.headers), r;
    },
    function(r) {
      if (!Jt(r) && (Ie(e), r && r.response)) {
        e.response = r.response;
        try {
          r.response.data = je.call(
            e,
            e.transformResponse,
            r.response
          );
        } finally {
          delete e.response;
        }
        r.response.headers = U.from(r.response.headers);
      }
      return Promise.reject(r);
    }
  );
}
const Ce = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Ce[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const _t = {};
Ce.transitional = function(t, n, r) {
  function s(o, a) {
    return "[Axios v" + Ze + "] Transitional option '" + o + "'" + a + (r ? ". " + r : "");
  }
  return (o, a, l) => {
    if (t === !1)
      throw new h(
        s(a, " has been removed" + (n ? " in " + n : "")),
        h.ERR_DEPRECATED
      );
    return n && !_t[a] && (_t[a] = !0, console.warn(
      s(
        a,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(o, a, l) : !0;
  };
};
Ce.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function xs(e, t, n) {
  if (typeof e != "object" || e === null)
    throw new h("options must be an object", h.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0; ) {
    const o = r[s], a = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (a) {
      const l = e[o], d = l === void 0 || a(l, o, e);
      if (d !== !0)
        throw new h(
          "option " + o + " must be " + d,
          h.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (n !== !0)
      throw new h("Unknown option " + o, h.ERR_BAD_OPTION);
  }
}
const Oe = {
  assertOptions: xs,
  validators: Ce
}, L = Oe.validators;
let Q = class {
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
  async request(t, n) {
    try {
      return await this._request(t, n);
    } catch (r) {
      if (r instanceof Error) {
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
          if (!r.stack)
            r.stack = o;
          else if (o) {
            const a = o.indexOf(`
`), l = a === -1 ? -1 : o.indexOf(`
`, a + 1), d = l === -1 ? "" : o.slice(l + 1);
            String(r.stack).endsWith(d) || (r.stack += `
` + o);
          }
        } catch {
        }
      }
      throw r;
    }
  }
  _request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = te(this.defaults, n);
    const { transitional: r, paramsSerializer: s, headers: o } = n;
    r !== void 0 && Oe.assertOptions(
      r,
      {
        silentJSONParsing: L.transitional(L.boolean),
        forcedJSONParsing: L.transitional(L.boolean),
        clarifyTimeoutError: L.transitional(L.boolean),
        legacyInterceptorReqResOrdering: L.transitional(L.boolean),
        advertiseZstdAcceptEncoding: L.transitional(L.boolean),
        validateStatusUndefinedResolves: L.transitional(L.boolean)
      },
      !1
    ), s != null && (i.isFunction(s) ? n.paramsSerializer = {
      serialize: s
    } : Oe.assertOptions(
      s,
      {
        encode: L.function,
        serialize: L.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Oe.assertOptions(
      n,
      {
        baseUrl: L.spelling("baseURL"),
        withXsrfToken: L.spelling("withXSRFToken")
      },
      !0
    ), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let a = o && i.merge(o.common, o[n.method]);
    o && i.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (O) => {
      delete o[O];
    }), n.headers = U.concat(a, o);
    const l = [];
    let d = !0;
    this.interceptors.request.forEach(function(g) {
      if (typeof g.runWhen == "function" && g.runWhen(n) === !1)
        return;
      d = d && g.synchronous;
      const y = n.transitional || Xe;
      y && y.legacyInterceptorReqResOrdering ? l.unshift(g.fulfilled, g.rejected) : l.push(g.fulfilled, g.rejected);
    });
    const m = [];
    this.interceptors.response.forEach(function(g) {
      m.push(g.fulfilled, g.rejected);
    });
    let u, f = 0, E;
    if (!d) {
      const O = [Me.bind(this), void 0];
      for (O.unshift(...l), O.push(...m), E = O.length, u = Promise.resolve(n); f < E; )
        u = u.then(O[f++], O[f++]);
      return u;
    }
    E = l.length;
    let R = n;
    for (; f < E; ) {
      const O = l[f++], g = l[f++];
      try {
        R = O ? O(R) : R;
      } catch (y) {
        if (!g) {
          u = Promise.reject(y);
          break;
        }
        try {
          const p = g.call(this, y);
          i.isThenable(p) && (u = Promise.resolve(p).then(
            () => Me.call(this, R)
          ));
        } catch (p) {
          u = Promise.reject(p);
        }
        break;
      }
    }
    if (!u)
      try {
        u = Me.call(this, R);
      } catch (O) {
        u = Promise.reject(O);
      }
    for (f = 0, E = m.length; f < E; )
      u = u.then(m[f++], m[f++]);
    return u;
  }
  getUri(t) {
    t = te(this.defaults, t);
    const n = Xt(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return $t(n, t.params, t.paramsSerializer);
  }
};
i.forEach(["delete", "get", "head", "options"], function(t) {
  Q.prototype[t] = function(n, r) {
    return this.request(
      te(r || {}, {
        method: t,
        url: n,
        data: r && i.hasOwnProp(r, "data") ? r.data : void 0
      })
    );
  };
});
i.forEach(["post", "put", "patch", "query"], function(t) {
  function n(r) {
    return function(o, a, l) {
      return this.request(
        te(l || {}, {
          method: t,
          headers: r ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: o,
          data: a
        })
      );
    };
  }
  Q.prototype[t] = n(), t !== "query" && (Q.prototype[t + "Form"] = n(!0));
});
let Rs = class en {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function(o) {
      n = o;
    });
    const r = this;
    this.promise.then((s) => {
      if (!r._listeners) return;
      let o = r._listeners.length;
      for (; o-- > 0; )
        r._listeners[o](s);
      r._listeners = null;
    }), this.promise.then = (s) => {
      let o;
      const a = new Promise((l) => {
        r.subscribe(l), o = l;
      }).then(s);
      return a.cancel = function() {
        r.unsubscribe(o);
      }, a;
    }, t(function(o, a, l) {
      r.reason || (r.reason = new ge(o, a, l), n(r.reason));
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
    const n = this._listeners.indexOf(t);
    n !== -1 && this._listeners.splice(n, 1);
  }
  toAbortSignal() {
    const t = new AbortController(), n = (r) => {
      t.abort(r);
    };
    return this.subscribe(n), t.signal.unsubscribe = () => this.unsubscribe(n), t.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let t;
    return {
      token: new en(function(s) {
        t = s;
      }),
      cancel: t
    };
  }
};
function Ss(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function Os(e) {
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
function tn(e) {
  const t = new Q(e), n = Ct(Q.prototype.request, t);
  return i.extend(n, Q.prototype, t, { allOwnKeys: !0 }), i.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(s) {
    return tn(te(e, s));
  }, n;
}
const T = tn(ye);
T.Axios = Q;
T.CanceledError = ge;
T.CancelToken = Rs;
T.isCancel = Jt;
T.VERSION = Ze;
T.toFormData = Pe;
T.AxiosError = h;
T.Cancel = T.CanceledError;
T.all = function(t) {
  return Promise.all(t);
};
T.spread = Ss;
T.isAxiosError = Os;
T.mergeConfig = te;
T.AxiosHeaders = U;
T.formToJSON = (e) => Vt(i.isHTMLForm(e) ? new FormData(e) : e);
T.getAdapter = Yt.getAdapter;
T.HttpStatusCode = We;
T.default = T;
const {
  Axios: Hs,
  AxiosError: zs,
  CanceledError: $s,
  isCancel: Ws,
  CancelToken: Vs,
  VERSION: Js,
  all: Ks,
  Cancel: Xs,
  isAxiosError: Gs,
  spread: Zs,
  toFormData: Qs,
  AxiosHeaders: Ys,
  HttpStatusCode: eo,
  formToJSON: to,
  getAdapter: no,
  mergeConfig: ro,
  create: so
} = T, z = T.create({ baseURL: "/api" });
z.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const Ns = {
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
  "be the first to share your thoughts": "成为第一个评论的人",
  "leave a comment": "发表评论",
  name: "姓名",
  email: "邮箱",
  "your comment": "你的评论",
  "submit comment": "提交评论",
  "comment submitted and pending review": "评论已提交,等待审核",
  "password protected": "密码保护",
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
  featured: "精选"
};
function S(e, t) {
  return ((t == null ? void 0 : t.site_lang) || localStorage.getItem("mortar_site_lang") || localStorage.getItem("mortar_lang") || "en") === "zh" && Ns[e] || e;
}
function _s({ settings: e }) {
  const [t, n] = H([]), [r, s] = H(!1), [o, a] = H(null);
  ae(() => {
    z.get("/menus/location/primary").then((u) => n(u.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && z.get("/auth/me").then((u) => a(u.data)).catch(() => localStorage.removeItem("mortar_token"));
  }, []);
  function l() {
    z.post("/auth/logout").catch(() => {
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
        c.createElement("button", { onClick: () => s(!r), className: "md:hidden p-2 text-gray-600" }, r ? c.createElement(pn, { size: 20 }) : c.createElement(dn, { size: 20 }))
      ),
      r && c.createElement(
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
function As({ settings: e }) {
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
function Ts() {
  const [e, t] = H([]);
  if (ae(() => {
    z.get("/tags").then((r) => t(r.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const n = Math.max(...e.map((r) => {
    var s;
    return ((s = r._count) == null ? void 0 : s.posts) || 0;
  }), 1);
  return c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("tag cloud")),
    c.createElement(
      "div",
      { className: "flex flex-wrap gap-1.5" },
      e.map((r) => {
        var o, a, l;
        const s = 0.65 + (((o = r._count) == null ? void 0 : o.posts) || 0) / n * 0.35;
        return c.createElement(P, {
          key: r.id,
          to: "/tag/" + r.slug,
          className: "inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors",
          style: { fontSize: s + "rem" },
          title: (((a = r._count) == null ? void 0 : a.posts) || 0) + " " + S("posts")
        }, r.name + " (" + (((l = r._count) == null ? void 0 : l.posts) || 0) + ")");
      })
    )
  );
}
function Ps() {
  const [e, t] = H([]);
  return ae(() => {
    z.get("/posts?limit=5").then((n) => t(n.data.posts || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("recent posts")),
    c.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((n) => c.createElement(
        "li",
        { key: n.id },
        c.createElement(P, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title)
      ))
    )
  );
}
function Cs() {
  const [e, t] = H([]);
  return ae(() => {
    z.get("/posts/popular?limit=5").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, c.createElement(mn, { size: 14 }), S("popular posts")),
    c.createElement(
      "ul",
      { className: "space-y-2" },
      e.map(
        (n, r) => c.createElement(
          "li",
          { key: n.id, className: "flex items-start gap-2" },
          c.createElement("span", { className: "text-xs font-bold text-gray-300 mt-0.5 w-4" }, r + 1),
          c.createElement(P, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title),
          n.views > 0 && c.createElement("span", { className: "text-xs text-gray-400 ml-auto shrink-0" }, n.views + " " + S("views"))
        )
      )
    )
  );
}
function ks() {
  const [e, t] = H([]);
  if (ae(() => {
    z.get("/posts/archives").then((r) => t(r.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const n = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("archives")),
    c.createElement(
      "ul",
      { className: "space-y-1" },
      e.map((r) => {
        const [s, o] = r.month.split("-");
        return c.createElement(
          "li",
          { key: r.month },
          c.createElement(
            P,
            { to: "/archive/" + s + "/" + o, className: "text-sm text-gray-600 hover:text-primary-600" },
            n[parseInt(o) - 1] + " " + s + " (" + r.count + ")"
          )
        );
      })
    )
  );
}
function Ds() {
  const [e, t] = H(""), n = on(), r = (s) => {
    s.preventDefault(), e.trim() && n("/search?q=" + encodeURIComponent(e.trim()));
  };
  return c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("search")),
    c.createElement(
      "form",
      { onSubmit: r, className: "flex gap-2" },
      c.createElement("input", {
        type: "text",
        value: e,
        onChange: (s) => t(s.target.value),
        placeholder: S("search placeholder"),
        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      }),
      c.createElement("button", {
        type: "submit",
        className: "px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      }, c.createElement(fn, { size: 16 }))
    )
  );
}
function Ls() {
  const [e, t] = H([]);
  return ae(() => {
    z.get("/links").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : c.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    c.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, S("links")),
    c.createElement(
      "ul",
      { className: "space-y-1.5" },
      e.map(
        (n) => c.createElement(
          "li",
          { key: n.id },
          c.createElement(
            "a",
            { href: n.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600" },
            n.avatar ? c.createElement("img", { src: n.avatar, alt: "", className: "w-5 h-5 rounded-full object-cover" }) : null,
            c.createElement("span", { className: "truncate" }, n.name)
          )
        )
      )
    )
  );
}
function Us(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function vs(e, t) {
  if (!e) return;
  const n = Us(t.cdn_url);
  return n && e.startsWith("/uploads/") ? n + e : e;
}
function At(e) {
  const t = Date.now(), n = new Date(e).getTime(), r = t - n, s = Math.floor(r / 6e4);
  if (s < 1) return "just now";
  if (s < 60) return `${s}m ago`;
  const o = Math.floor(s / 60);
  if (o < 24) return `${o}h ago`;
  const a = Math.floor(o / 24);
  if (a < 7) return `${a}d ago`;
  const l = Math.floor(a / 7);
  return l < 5 ? `${l}w ago` : new Date(e).toLocaleDateString();
}
function Fs(e) {
  var R, O;
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: a, catSlug: l, isTagPage: d, categories: m } = e, u = { fontFamily: "Georgia, serif" }, [f, ...E] = n;
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
            const g = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), y = (p) => g.length === 0 || g.includes(p);
            return c.createElement(
              c.Fragment,
              null,
              y("search") && c.createElement(Ds),
              y("recent_posts") && c.createElement(Ps),
              y("popular") && c.createElement(Cs),
              y("tag_cloud") && c.createElement(Ts),
              y("archives") && c.createElement(ks),
              y("links") && c.createElement(Ls)
            );
          })(),
          c.createElement(
            "div",
            { className: "rounded-lg border-2 border-red-700 p-4" },
            c.createElement("h3", { className: "text-sm font-bold text-red-700 mb-3 uppercase tracking-wider", style: u }, S("categories", t)),
            m.length === 0 ? c.createElement("p", { className: "text-sm text-gray-500" }, S("no categories yet", t)) : c.createElement("ul", { className: "space-y-1" }, m.map((g) => {
              var y;
              return c.createElement(
                "li",
                { key: g.id },
                c.createElement(P, { to: "/category/" + g.slug, className: "text-sm " + (l === g.slug ? "text-red-700 font-medium" : "text-gray-600 hover:text-red-700") }, g.name, ((y = g._count) == null ? void 0 : y.posts) > 0 ? c.createElement("span", { className: "text-gray-400 ml-1" }, "(" + g._count.posts + ")") : null)
              );
            }))
          )
        ),
        // Main column
        c.createElement(
          "div",
          { className: "order-1 lg:order-2 lg:col-span-2" },
          n.length === 0 ? a ? c.createElement("div", { className: "text-center py-20" }, c.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, S("failed to load posts", t))) : c.createElement("div", { className: "text-center py-20" }, c.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, S("no posts yet", t))) : c.createElement(
            "div",
            { className: "space-y-10" },
            // Lead story: big card
            f && c.createElement(
              "article",
              { className: "bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200" },
              f.featured && c.createElement("img", { src: vs(f.featured, t), alt: f.title, className: "w-full h-64 object-cover", loading: "lazy" }),
              c.createElement(
                "div",
                { className: "p-6" },
                c.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-2" },
                  c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(at, { size: 12 }), At(f.publishedAt || f.createdAt)),
                  c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(it, { size: 12 }), (R = f.author) == null ? void 0 : R.username),
                  ((O = f.categories) == null ? void 0 : O[0]) && c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(un, { size: 12 }), f.categories[0].name)
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
            E.map((g) => {
              var y;
              return c.createElement(
                "article",
                { key: g.id, className: "border-l-4 border-red-700 pl-4 py-2" },
                c.createElement(
                  P,
                  { to: "/post/" + g.slug },
                  c.createElement("h3", { className: "text-lg font-bold text-gray-900 hover:text-red-700", style: u }, g.title)
                ),
                c.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mt-1" },
                  c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(at, { size: 12 }), At(g.publishedAt || g.createdAt)),
                  c.createElement("span", { className: "flex items-center gap-1" }, c.createElement(it, { size: 12 }), (y = g.author) == null ? void 0 : y.username)
                ),
                g.excerpt && c.createElement("p", { className: "text-gray-600 text-sm mt-2" }, g.excerpt)
              );
            })
          ),
          r > parseInt(t.posts_per_page || "10") && c.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-6" },
            c.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + S("previous", t)),
            c.createElement("span", { className: "text-sm text-gray-500" }, S("page", t) + " " + s + " " + S("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
            c.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, S("next", t) + " →")
          )
        )
      )
    )
  );
}
const oo = { name: "magazine", Header: _s, Footer: As, HomeLayout: Fs };
export {
  oo as default
};
