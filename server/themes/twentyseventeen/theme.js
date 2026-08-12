import m, { forwardRef as _t, createElement as qe, useState as H, useEffect as de, useRef as nn } from "react";
import { Link as v, useNavigate as rn } from "react-router-dom";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sn = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), At = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var on = {
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
const an = _t(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: a,
    ...l
  }, u) => qe(
    "svg",
    {
      ref: u,
      ...on,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: At("lucide", s),
      ...l
    },
    [
      ...a.map(([c, f]) => qe(c, f)),
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
  const n = _t(
    ({ className: r, ...s }, o) => qe(an, {
      ref: o,
      iconNode: t,
      className: At(`lucide-${sn(e)}`, r),
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
const ln = ne("Calendar", [
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
const cn = ne("FileText", [
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
const un = ne("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fn = ne("Menu", [
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
const dn = ne("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pn = ne("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mn = ne("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function Nt(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: hn } = Object.prototype, { getPrototypeOf: oe } = Object, { iterator: me, toStringTag: Tt } = Symbol, _e = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), pe = (e, t) => {
  let n = e;
  const r = [];
  for (; n != null && n !== Object.prototype; ) {
    if (r.indexOf(n) !== -1)
      return !1;
    if (r.push(n), _e(n, t))
      return !0;
    n = oe(n);
  }
  return !1;
}, yn = (e, t) => e != null && pe(e, t) ? e[t] : void 0, Ve = /* @__PURE__ */ ((e) => (t) => {
  const n = hn.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), j = (e) => (e = e.toLowerCase(), (t) => Ve(t) === e), Te = (e) => (t) => typeof t === e, { isArray: Y } = Array, ee = Te("undefined");
function ae(e) {
  return e !== null && !ee(e) && e.constructor !== null && !ee(e.constructor) && U(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Pt = j("ArrayBuffer");
function gn(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Pt(e.buffer), t;
}
const bn = Te("string"), U = Te("function"), Ct = Te("number"), ie = (e) => e !== null && typeof e == "object", wn = (e) => e === !0 || e === !1, Re = (e) => {
  if (!ie(e))
    return !1;
  const t = oe(e);
  return (t === null || t === Object.prototype || oe(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !pe(e, Tt) && !pe(e, me);
}, En = (e) => {
  if (!ie(e) || ae(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, xn = j("Date"), Rn = j("File"), Sn = (e) => !!(e && typeof e.uri < "u"), On = (e) => e && typeof e.getParts < "u", _n = j("Blob"), An = j("FileList"), Nn = j("Set"), Tn = (e) => ie(e) && U(e.pipe);
function Pn() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const at = Pn(), it = typeof at.FormData < "u" ? at.FormData : void 0, Cn = (e) => {
  if (!e) return !1;
  if (it && e instanceof it) return !0;
  const t = oe(e);
  if (!t || t === Object.prototype || !U(e.append)) return !1;
  const n = Ve(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && U(e.toString) && e.toString() === "[object FormData]";
}, kn = j("URLSearchParams"), [Dn, Ln, Un, Fn] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(j), vn = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function he(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, s;
  if (typeof e != "object" && (e = [e]), Y(e))
    for (r = 0, s = e.length; r < s; r++)
      t.call(null, e[r], r, e);
  else {
    if (ae(e))
      return;
    const o = n ? Object.getOwnPropertyNames(e) : Object.keys(e), a = o.length;
    let l;
    for (r = 0; r < a; r++)
      l = o[r], t.call(null, e[l], l, e);
  }
}
function kt(e, t) {
  if (ae(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, s;
  for (; r-- > 0; )
    if (s = n[r], t === s.toLowerCase())
      return s;
  return null;
}
const Z = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Dt = (e) => !ee(e) && e !== Z;
function He(...e) {
  const { caseless: t, skipUndefined: n } = Dt(this) && this || {}, r = {}, s = (o, a) => {
    if (a === "__proto__" || a === "constructor" || a === "prototype")
      return;
    const l = t && typeof a == "string" && kt(r, a) || a, u = _e(r, l) ? r[l] : void 0;
    Re(u) && Re(o) ? r[l] = He(u, o) : Re(o) ? r[l] = He({}, o) : Y(o) ? r[l] = o.slice() : (!n || !ee(o)) && (r[l] = o);
  };
  for (let o = 0, a = e.length; o < a; o++) {
    const l = e[o];
    if (!l || ae(l) || (he(l, s), typeof l != "object" || Y(l)))
      continue;
    const u = Object.getOwnPropertySymbols(l);
    for (let c = 0; c < u.length; c++) {
      const f = u[c];
      Kn.call(l, f) && s(l[f], f);
    }
  }
  return r;
}
const Bn = (e, t, n, { allOwnKeys: r } = {}) => (he(
  t,
  (s, o) => {
    n && U(s) ? Object.defineProperty(e, o, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: Nt(s, n),
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
  if (!Ct(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, zn = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && oe(Uint8Array)), $n = (e, t) => {
  const r = (e && e[me]).call(e);
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
}), { propertyIsEnumerable: Kn } = Object.prototype, Xn = j("RegExp"), Lt = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  he(n, (s, o) => {
    let a;
    (a = t(s, o, e)) !== !1 && (r[o] = a || s);
  }), Object.defineProperties(e, r);
}, Zn = (e) => {
  Lt(e, (t, n) => {
    if (U(e) && ["arguments", "caller", "callee"].includes(n))
      return !1;
    const r = e[n];
    if (U(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, Gn = (e, t) => {
  const n = {}, r = (s) => {
    s.forEach((o) => {
      n[o] = !0;
    });
  };
  return Y(e) ? r(e) : r(String(e).split(t)), n;
}, Qn = () => {
}, Yn = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function er(e) {
  return !!(e && U(e.append) && e[Tt] === "FormData" && e[me]);
}
const tr = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (r) => {
    if (ie(r)) {
      if (t.has(r))
        return;
      if (ae(r))
        return r;
      if (!("toJSON" in r)) {
        t.add(r);
        let s;
        if (Nn(r)) {
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
}, nr = j("AsyncFunction"), rr = (e) => e && (ie(e) || U(e)) && U(e.then) && U(e.catch), Ut = ((e, t) => e ? setImmediate : t ? ((n, r) => (Z.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === Z && o === n && r.length && r.shift()();
  },
  !1
), (s) => {
  r.push(s), Z.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", U(Z.postMessage)), sr = typeof queueMicrotask < "u" ? queueMicrotask.bind(Z) : typeof process < "u" && process.nextTick || Ut, Ft = (e) => e != null && U(e[me]), or = (e) => e != null && pe(e, me) && Ft(e), i = {
  isArray: Y,
  isArrayBuffer: Pt,
  isBuffer: ae,
  isFormData: Cn,
  isArrayBufferView: gn,
  isString: bn,
  isNumber: Ct,
  isBoolean: wn,
  isObject: ie,
  isPlainObject: Re,
  isEmptyObject: En,
  isReadableStream: Dn,
  isRequest: Ln,
  isResponse: Un,
  isHeaders: Fn,
  isUndefined: ee,
  isDate: xn,
  isFile: Rn,
  isReactNativeBlob: Sn,
  isReactNative: On,
  isBlob: _n,
  isRegExp: Xn,
  isFunction: U,
  isStream: Tn,
  isURLSearchParams: kn,
  isTypedArray: zn,
  isFileList: An,
  forEach: he,
  merge: He,
  extend: Bn,
  trim: vn,
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
  hasOwnProperty: _e,
  hasOwnProp: _e,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: pe,
  getSafeProp: yn,
  reduceDescriptors: Lt,
  freezeMethods: Zn,
  toObjectSet: Gn,
  toCamelCase: Jn,
  noop: Qn,
  toFiniteNumber: Yn,
  findKey: kt,
  global: Z,
  isContextDefined: Dt,
  isSpecCompliantForm: er,
  toJSONObject: tr,
  isAsyncFn: nr,
  isThenable: rr,
  setImmediate: Ut,
  asap: sr,
  isIterable: Ft,
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
const fr = (e) => Je(e, cr), dr = (e) => Je(e, ur);
function vt(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return i.forEach(e.toJSON(), (n, r) => {
    t[r] = dr(n);
  }), t;
}
const lt = Symbol("internals");
function fe(e) {
  return e && String(e).trim().toLowerCase();
}
function Se(e) {
  return e === !1 || e == null ? e : i.isArray(e) ? e.map(Se) : fr(String(e));
}
function pr(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const mr = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function Fe(e) {
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
    const u = Fe(n.slice(r, l)), c = u.indexOf("=");
    if (c < 1)
      return;
    const f = Fe(u.slice(0, c));
    if (!mr.test(f))
      return;
    const p = f.toLowerCase();
    if (p === "__proto__" || p === "constructor" || p === "prototype")
      return;
    const y = Fe(u.slice(c + 1));
    t[p] = hr(y);
  }
  for (let l = 0; l < n.length; l++) {
    const u = n.charCodeAt(l);
    s ? o ? o = !1 : u === 92 ? o = !0 : u === 34 && (s = !1) : u === 34 ? s = !0 : (u === 44 || u === 59) && (a(l), r = l + 1);
  }
  return a(n.length), t;
}
const gr = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function ve(e, t, n, r, s) {
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
function wr(e, t) {
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
let L = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const s = this;
    function o(l, u, c) {
      const f = fe(u);
      if (!f)
        return;
      const p = i.findKey(s, f);
      (!p || s[p] === void 0 || c === !0 || c === void 0 && s[p] !== !1) && (s[p || u] = Se(l));
    }
    const a = (l, u) => i.forEach(l, (c, f) => o(c, f, u));
    if (i.isPlainObject(t) || t instanceof this.constructor)
      a(t, n);
    else if (i.isString(t) && (t = t.trim()) && !gr(t))
      a(ir(t), n);
    else if (i.isObject(t) && i.isSafeIterable(t)) {
      let l = /* @__PURE__ */ Object.create(null), u, c;
      for (const f of t) {
        if (!i.isArray(f))
          throw new TypeError("Object iterator must return a key-value pair");
        c = f[0], i.hasOwnProp(l, c) ? (u = l[c], l[c] = i.isArray(u) ? [...u, f[1]] : [u, f[1]]) : l[c] = f[1];
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
          return pr(s);
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
      return !!(r && this[r] !== void 0 && (!n || ve(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function o(a) {
      if (a = fe(a), a) {
        const l = i.findKey(r, a);
        l && (!n || ve(r, r[l], l, n)) && (delete r[l], s = !0);
      }
    }
    return i.isArray(t) ? t.forEach(o) : o(t), s;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length, s = !1;
    for (; r--; ) {
      const o = n[r];
      (!t || ve(this, this[o], o, t, !0)) && (delete this[o], s = !0);
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
    const r = (this[lt] = this[lt] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(a) {
      const l = fe(a);
      r[l] || (wr(s, a), r[l] = !0);
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
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    }
  };
});
i.freezeMethods(L);
const Ae = "[REDACTED ****]";
function Er(e) {
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
    o instanceof L && (o = o.toJSON()), r.push(o);
    let a;
    if (i.isArray(o))
      a = [], o.forEach((l, u) => {
        const c = s(l);
        i.isUndefined(c) || (a[u] = c);
      });
    else {
      if (!i.isPlainObject(o) && Er(o))
        return r.pop(), o;
      a = /* @__PURE__ */ Object.create(null);
      for (const [l, u] of Object.entries(o)) {
        const c = n.has(l.toLowerCase()) ? Ae : s(u);
        i.isUndefined(c) || (a[l] = c);
      }
    }
    return r.pop(), a;
  };
  return s(e);
}
function ct(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function Rr(e) {
  return e.errors.map((n) => {
    try {
      return n && n.message ? ct(n.message) : ct(n);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let h = class Bt extends Error {
  static from(t, n, r, s, o, a) {
    let l = t.message;
    !l && i.isArray(t.errors) && t.errors.length && (l = Rr(t));
    const u = new Bt(l, n || t.code, r, s, o);
    return Object.defineProperty(u, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), u.name = t.name, t.status != null && u.status == null && (u.status = t.status), a && Object.assign(u, a), u;
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
const Sr = null, jt = 100;
function ze(e) {
  return i.isPlainObject(e) || i.isArray(e);
}
function It(e) {
  return i.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Be(e, t, n) {
  return e ? e.concat(t).map(function(s, o) {
    return s = It(s), !n && o ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function Or(e) {
  return i.isArray(e) && !e.some(ze);
}
const _r = i.toFlatObject(i, {}, null, function(t) {
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
  const r = n.metaTokens, s = n.visitor || R, o = n.dots, a = n.indexes, l = n.Blob || typeof Blob < "u" && Blob, u = n.maxDepth === void 0 ? jt : n.maxDepth, c = l && i.isSpecCompliantForm(t), f = [];
  if (!i.isFunction(s))
    throw new TypeError("visitor must be a function");
  function p(d) {
    if (d === null) return "";
    if (i.isDate(d))
      return d.toISOString();
    if (i.isBoolean(d))
      return d.toString();
    if (!c && i.isBlob(d))
      throw new h("Blob is not supported. Use a Buffer instead.");
    if (i.isArrayBuffer(d) || i.isTypedArray(d)) {
      if (c && typeof l == "function")
        return new l([d]);
      throw new h("Blob is not supported. Use a Buffer instead.", h.ERR_NOT_SUPPORT);
    }
    return d;
  }
  function y(d) {
    if (d > u)
      throw new h(
        "Object is too deeply nested (" + d + " levels). Max depth: " + u,
        h.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function x(d, b) {
    if (u === 1 / 0)
      return JSON.stringify(d);
    const w = [];
    return JSON.stringify(d, function(k, N) {
      if (!i.isObject(N))
        return N;
      for (; w.length && w[w.length - 1] !== this; )
        w.pop();
      return w.push(N), y(b + w.length - 1), N;
    });
  }
  function R(d, b, w) {
    let O = d;
    if (i.isReactNative(t) && i.isReactNativeBlob(d))
      return t.append(Be(w, b, o), p(d)), !1;
    if (d && !w && typeof d == "object") {
      if (i.endsWith(b, "{}"))
        b = r ? b : b.slice(0, -2), d = x(d, 1);
      else if (i.isArray(d) && Or(d) || (i.isFileList(d) || i.endsWith(b, "[]")) && (O = i.toArray(d)))
        return b = It(b), O.forEach(function(N, z) {
          !(i.isUndefined(N) || N === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? Be([b], z, o) : a === null ? b : b + "[]",
            p(N)
          );
        }), !1;
    }
    return ze(d) ? !0 : (t.append(Be(w, b, o), p(d)), !1);
  }
  const S = Object.assign(_r, {
    defaultVisitor: R,
    convertValue: p,
    isVisitable: ze
  });
  function g(d, b, w = 0) {
    if (!i.isUndefined(d)) {
      if (y(w), f.indexOf(d) !== -1)
        throw new Error("Circular reference detected in " + b.join("."));
      f.push(d), i.forEach(d, function(k, N) {
        (!(i.isUndefined(k) || k === null) && s.call(t, k, i.isString(N) ? N.trim() : N, b, S)) === !0 && g(k, b ? b.concat(N) : [N], w + 1);
      }), f.pop();
    }
  }
  if (!i.isObject(e))
    throw new TypeError("data must be an object");
  return g(e), t;
}
function ut(e) {
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
const Mt = Ke.prototype;
Mt.append = function(t, n) {
  this._pairs.push([t, n]);
};
Mt.toString = function(t) {
  const n = t ? (r) => t.call(this, r, ut) : ut;
  return this._pairs.map(function(s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function Ar(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function qt(e, t, n) {
  if (!t)
    return e;
  e = e || "";
  const r = i.isFunction(n) ? {
    serialize: n
  } : n, s = i.getSafeProp(r, "encode") || Ar, o = i.getSafeProp(r, "serialize");
  let a;
  if (o ? a = o(t, r) : a = i.isURLSearchParams(t) ? t.toString() : new Ke(t, r).toString(s), a) {
    const l = e.indexOf("#");
    l !== -1 && (e = e.slice(0, l)), e += (e.indexOf("?") === -1 ? "?" : "&") + a;
  }
  return e;
}
class ft {
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
}, Nr = typeof URLSearchParams < "u" ? URLSearchParams : Ke, Tr = typeof FormData < "u" ? FormData : null, Pr = typeof Blob < "u" ? Blob : null, Cr = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Nr,
    FormData: Tr,
    Blob: Pr
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Ze = typeof window < "u" && typeof document < "u", $e = typeof navigator == "object" && navigator || void 0, kr = Ze && (!$e || ["ReactNative", "NativeScript", "NS"].indexOf($e.product) < 0), Dr = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Lr = Ze && window.location.href || "http://localhost", Ur = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Ze,
  hasStandardBrowserEnv: kr,
  hasStandardBrowserWebWorkerEnv: Dr,
  navigator: $e,
  origin: Lr
}, Symbol.toStringTag, { value: "Module" })), C = {
  ...Ur,
  ...Cr
};
function Fr(e, t) {
  return Pe(e, new C.classes.URLSearchParams(), {
    visitor: function(n, r, s, o) {
      return C.isNode && i.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const dt = jt;
function Ht(e) {
  if (e > dt)
    throw new h(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + dt,
      h.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function vr(e) {
  const t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g;
  let r;
  for (; (r = n.exec(e)) !== null; )
    Ht(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
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
function zt(e) {
  function t(n, r, s, o) {
    Ht(o);
    let a = n[o++];
    if (a === "__proto__") return !0;
    const l = Number.isFinite(+a), u = o >= n.length;
    return a = !a && i.isArray(s) ? s.length : a, u ? (i.hasOwnProp(s, a) ? s[a] = i.isArray(s[a]) ? s[a].concat(r) : [s[a], r] : s[a] = r, !l) : ((!i.hasOwnProp(s, a) || !i.isObject(s[a])) && (s[a] = []), t(n, r, s[a], o) && i.isArray(s[a]) && (s[a] = Br(s[a])), !l);
  }
  if (i.isFormData(e) && i.isFunction(e.entries)) {
    const n = {};
    return i.forEachEntry(e, (r, s) => {
      t(vr(r), s, n, 0);
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
        return s ? JSON.stringify(zt(t)) : t;
      if (i.isArrayBuffer(t) || i.isBuffer(t) || i.isStream(t) || i.isFile(t) || i.isBlob(t) || i.isReadableStream(t))
        return t;
      if (i.isArrayBufferView(t))
        return t.buffer;
      if (i.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let l;
      if (o) {
        const u = se(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return Fr(t, u).toString();
        if ((l = i.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const c = se(this, "env"), f = c && c.FormData;
          return Pe(
            l ? { "files[]": t } : t,
            f && new f(),
            u
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
        } catch (u) {
          if (l)
            throw u.name === "SyntaxError" ? h.from(u, h.ERR_BAD_RESPONSE, this, null, se(this, "response")) : u;
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
  ye.headers[e] = {};
});
function je(e, t) {
  const n = this || ye, r = t || n, s = L.from(r.headers);
  let o = r.data;
  return i.forEach(e, function(l) {
    o = l.call(n, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function $t(e) {
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
function Wt(e, t, n) {
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
  return t = t !== void 0 ? t : 1e3, function(u) {
    const c = Date.now(), f = r[o];
    a || (a = c), n[s] = u, r[s] = c;
    let p = o, y = 0;
    for (; p !== s; )
      y += n[p++], p = p % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), c - a < t)
      return;
    const x = f && c - f;
    return x ? Math.round(y * 1e3 / x) : void 0;
  };
}
function qr(e, t) {
  let n = 0, r = 1e3 / t, s, o;
  const a = (c, f = Date.now()) => {
    n = f, s = null, o && (clearTimeout(o), o = null), e(...c);
  };
  return [(...c) => {
    const f = Date.now(), p = f - n;
    p >= r ? a(c, f) : (s = c, o || (o = setTimeout(() => {
      o = null, a(s);
    }, r - p)));
  }, () => s && a(s)];
}
const Ne = (e, t, n = 3) => {
  let r = 0;
  const s = Mr(50, 250);
  return qr((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const a = o.loaded, l = o.lengthComputable ? o.total : void 0, u = Math.max(0, l != null ? Math.min(a, l) : a), c = Math.max(0, u - r), f = s(c);
    r = Math.max(r, u);
    const p = {
      loaded: u,
      total: l,
      progress: l ? u / l : void 0,
      bytes: c,
      rate: f || void 0,
      estimated: f && l ? (l - u) / f : void 0,
      event: o,
      lengthComputable: l != null,
      [t ? "download" : "upload"]: !0
    };
    e(p);
  }, n);
}, pt = (e, t) => {
  const n = e != null;
  return [
    (r) => t[0]({
      lengthComputable: n,
      total: e,
      loaded: r
    }),
    t[1]
  ];
}, mt = (e, t = i.asap) => (...n) => t(() => e(...n)), Hr = C.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, C.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(C.origin),
  C.navigator && /(msie|trident)/i.test(C.navigator.userAgent)
) : () => !0, zr = C.hasStandardBrowserEnv ? (
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
function Zr(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, n, r = "") => `${n}${r}${Ae}`);
}
function Gr(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${Ae}@`), n = t.indexOf("#"), s = (n === -1 ? t : t.slice(0, n)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${Ae}`
  );
  return n === -1 ? s : `${s}#${Zr(t.slice(n + 1))}`;
}
function ht(e, t) {
  if (typeof e == "string") {
    const n = Xr(e);
    if (Vr.test(n))
      throw new h(
        `Invalid URL ${JSON.stringify(Gr(n))}: missing "//" after protocol`,
        h.ERR_INVALID_URL,
        t
      );
  }
}
function Vt(e, t, n, r) {
  ht(t, r);
  let s = !$r(t);
  return e && (s || n === !1) ? (ht(e, r), Wr(e, t)) : t;
}
const yt = (e) => e instanceof L ? { ...e } : e, Qr = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
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
  function r(f, p, y, x) {
    return i.isPlainObject(f) && i.isPlainObject(p) ? i.merge.call({ caseless: x }, f, p) : i.isPlainObject(p) ? i.merge({}, p) : i.isArray(p) ? p.slice() : p;
  }
  function s(f, p, y, x) {
    if (i.isUndefined(p)) {
      if (!i.isUndefined(f))
        return r(void 0, f, y, x);
    } else return r(f, p, y, x);
  }
  function o(f, p) {
    if (!i.isUndefined(p))
      return r(void 0, p);
  }
  function a(f, p) {
    if (i.isUndefined(p)) {
      if (!i.isUndefined(f))
        return r(void 0, f);
    } else return r(void 0, p);
  }
  function l(f) {
    const p = i.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!i.isUndefined(p))
      if (i.isPlainObject(p)) {
        if (i.hasOwnProp(p, f))
          return p[f];
      } else
        return;
    const y = i.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (i.isPlainObject(y) && i.hasOwnProp(y, f))
      return y[f];
  }
  function u(f, p, y) {
    if (i.hasOwnProp(t, y))
      return r(f, p);
    if (i.hasOwnProp(e, y))
      return r(void 0, f);
  }
  const c = {
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
    validateStatus: u,
    headers: (f, p, y) => s(yt(f), yt(p), y, !0)
  };
  return i.forEach(Qr({ ...e, ...t }), function(p) {
    if (p === "__proto__" || p === "constructor" || p === "prototype") return;
    const y = i.hasOwnProp(c, p) ? c[p] : s, x = i.hasOwnProp(e, p) ? e[p] : void 0, R = i.hasOwnProp(t, p) ? t[p] : void 0, S = y(x, R, p);
    i.isUndefined(S) && y !== u || (n[p] = S);
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
function Jt(e) {
  const t = te({}, e), n = (y) => i.hasOwnProp(t, y) ? t[y] : void 0, r = n("data");
  let s = n("withXSRFToken");
  const o = n("xsrfHeaderName"), a = n("xsrfCookieName");
  let l = n("headers");
  const u = n("auth"), c = n("baseURL"), f = n("allowAbsoluteUrls"), p = n("url");
  if (t.headers = l = L.from(l), t.url = qt(
    Vt(c, p, f, t),
    n("params"),
    n("paramsSerializer")
  ), u) {
    const y = i.getSafeProp(u, "username") || "", x = i.getSafeProp(u, "password") || "";
    try {
      l.set(
        "Authorization",
        "Basic " + btoa(y + ":" + (x ? ts(x) : ""))
      );
    } catch (R) {
      throw h.from(R, h.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (i.isFormData(r) && (C.hasStandardBrowserEnv || C.hasStandardBrowserWebWorkerEnv || i.isReactNative(r) ? l.setContentType(void 0) : i.isFunction(r.getHeaders) && es(l, r.getHeaders(), n("formDataHeaderPolicy"))), C.hasStandardBrowserEnv && (i.isFunction(s) && (s = s(t)), s === !0 || s == null && Hr(t.url))) {
    const x = o && a && zr.read(a);
    x && l.set(o, x);
  }
  return t;
}
const ns = typeof XMLHttpRequest < "u", rs = ns && function(e) {
  return new Promise(function(n, r) {
    const s = Jt(e);
    let o = s.data;
    const a = L.from(s.headers).normalize();
    let { responseType: l, onUploadProgress: u, onDownloadProgress: c } = s, f, p, y, x, R;
    function S() {
      x && x(), R && R(), s.cancelToken && s.cancelToken.unsubscribe(f), s.signal && s.signal.removeEventListener("abort", f);
    }
    let g = new XMLHttpRequest();
    g.open(s.method.toUpperCase(), s.url, !0), g.timeout = s.timeout;
    function d() {
      if (!g)
        return;
      const w = L.from(
        "getAllResponseHeaders" in g && g.getAllResponseHeaders()
      ), k = {
        data: !l || l === "text" || l === "json" ? g.responseText : g.response,
        status: g.status,
        statusText: g.statusText,
        headers: w,
        config: e,
        request: g
      };
      Wt(
        function(z) {
          n(z), S();
        },
        function(z) {
          r(z), S();
        },
        k
      ), g = null;
    }
    "onloadend" in g ? g.onloadend = d : g.onreadystatechange = function() {
      !g || g.readyState !== 4 || g.status === 0 && !(g.responseURL && g.responseURL.startsWith("file:")) || setTimeout(d);
    }, g.onabort = function() {
      g && (r(new h("Request aborted", h.ECONNABORTED, e, g)), S(), g = null);
    }, g.onerror = function(O) {
      const k = O && O.message ? O.message : "Network Error", N = new h(k, h.ERR_NETWORK, e, g);
      N.event = O || null, r(N), S(), g = null;
    }, g.ontimeout = function() {
      let O = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const k = s.transitional || Xe;
      s.timeoutErrorMessage && (O = s.timeoutErrorMessage), r(
        new h(
          O,
          k.clarifyTimeoutError ? h.ETIMEDOUT : h.ECONNABORTED,
          e,
          g
        )
      ), S(), g = null;
    }, o === void 0 && a.setContentType(null), "setRequestHeader" in g && i.forEach(vt(a), function(O, k) {
      g.setRequestHeader(k, O);
    }), i.isUndefined(s.withCredentials) || (g.withCredentials = !!s.withCredentials), l && l !== "json" && (g.responseType = s.responseType), c && ([y, R] = Ne(c, !0), g.addEventListener("progress", y)), u && g.upload && ([p, x] = Ne(u), g.upload.addEventListener("progress", p), g.upload.addEventListener("loadend", x)), (s.cancelToken || s.signal) && (f = (w) => {
      g && (r(!w || w.type ? new ge(null, e, g) : w), g.abort(), S(), g = null);
    }, s.cancelToken && s.cancelToken.subscribe(f), s.signal && (s.signal.aborted ? f() : s.signal.addEventListener("abort", f)));
    const b = Ir(s.url);
    if (b && !C.protocols.includes(b)) {
      r(
        new h(
          "Unsupported protocol " + b + ":",
          h.ERR_BAD_REQUEST,
          e
        )
      ), S();
      return;
    }
    g.send(o || null);
  });
}, ss = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const s = function(u) {
    if (!r) {
      r = !0, a();
      const c = u instanceof Error ? u : this.reason;
      n.abort(
        c instanceof h ? c : new ge(c instanceof Error ? c.message : c)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, s(new h(`timeout of ${t}ms exceeded`, h.ETIMEDOUT));
  }, t);
  const a = () => {
    e && (o && clearTimeout(o), o = null, e.forEach((u) => {
      u.unsubscribe ? u.unsubscribe(s) : u.removeEventListener("abort", s);
    }), e = null);
  };
  e.forEach((u) => {
    if (!r) {
      if (u.aborted) {
        s.call(u);
        return;
      }
      u.addEventListener("abort", s, { once: !0 });
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
}, gt = (e, t, n, r) => {
  const s = as(e, t);
  let o = 0, a, l = (u) => {
    a || (a = !0, r && r(u));
  };
  return new ReadableStream(
    {
      async pull(u) {
        try {
          const { done: c, value: f } = await s.next();
          if (c) {
            l(), u.close();
            return;
          }
          let p = f.byteLength;
          if (n) {
            let y = o += p;
            n(y);
          }
          u.enqueue(new Uint8Array(f));
        } catch (c) {
          throw l(c), c;
        }
      },
      cancel(u) {
        return l(u), s.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, bt = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Kt = (e, t, n) => t + 2 < n && bt(e.charCodeAt(t + 1)) && bt(e.charCodeAt(t + 2)), wt = (e) => e <= 57 ? e - 48 : (e & 223) - 55, ls = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, cs = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, us = (e) => {
  const t = Math.floor(e / 4), n = e % 4;
  return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, fs = (e) => {
  const t = e.length;
  let n = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, ds = (e) => {
  const t = e.length;
  let n = 0, r = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let a = e.charCodeAt(o);
    if (a === 37 && Kt(e, o, t) && (a = wt(e.charCodeAt(o + 1)) * 16 + wt(e.charCodeAt(o + 2)), o += 2), !cs(a)) {
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
  return s || r > 2 || r > 0 && (n + r) % 4 !== 0 || n % 4 === 1 ? fs(e) : us(n);
}, ps = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const n = e.indexOf(",");
  if (n < 0) return 0;
  const r = e.slice(5, n), s = e.slice(n + 1);
  if (/;base64/i.test(r))
    return t(s);
  let a = 0;
  for (let l = 0, u = s.length; l < u; l++) {
    const c = s.charCodeAt(l);
    if (c === 37 && Kt(s, l, u))
      a += 1, l += 2;
    else if (c < 128)
      a += 1;
    else if (c < 2048)
      a += 2;
    else if (c >= 55296 && c <= 56319 && l + 1 < u) {
      const f = s.charCodeAt(l + 1);
      f >= 56320 && f <= 57343 ? (a += 4, l++) : a += 3;
    } else
      a += 3;
  }
  return a;
};
function ms(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return ps(
    t === -1 ? e : e.slice(0, t),
    ds
  );
}
const Ge = "1.19.0", Et = 64 * 1024, { isFunction: xe } = i, hs = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), xt = (e) => {
  if (!i.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, Rt = (e, ...t) => {
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
  const { fetch: s, Request: o, Response: a } = e, l = s ? xe(s) : typeof fetch == "function", u = xe(o), c = xe(a);
  if (!l)
    return !1;
  const f = l && xe(n), p = l && (typeof r == "function" ? /* @__PURE__ */ ((d) => (b) => d.encode(b))(new r()) : async (d) => new Uint8Array(await new o(d).arrayBuffer())), y = u && f && Rt(() => {
    let d = !1;
    const b = new o(C.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return d = !0, "half";
      }
    }), w = b.headers.has("Content-Type");
    return b.body != null && b.body.cancel(), d && !w;
  }), x = c && f && Rt(() => i.isReadableStream(new a("").body)), R = {
    stream: x && ((d) => d.body)
  };
  l && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((d) => {
    !R[d] && (R[d] = (b, w) => {
      let O = b && b[d];
      if (O)
        return O.call(b);
      throw new h(
        `Response type '${d}' is not supported`,
        h.ERR_NOT_SUPPORT,
        w
      );
    });
  });
  const S = async (d) => {
    if (d == null)
      return 0;
    if (i.isBlob(d))
      return d.size;
    if (i.isSpecCompliantForm(d))
      return (await new o(C.origin, {
        method: "POST",
        body: d
      }).arrayBuffer()).byteLength;
    if (i.isArrayBufferView(d) || i.isArrayBuffer(d))
      return d.byteLength;
    if (i.isURLSearchParams(d) && (d = d + ""), i.isString(d))
      return (await p(d)).byteLength;
  }, g = async (d, b) => {
    const w = i.toFiniteNumber(d.getContentLength());
    return w ?? S(b);
  };
  return async (d) => {
    let {
      url: b,
      method: w,
      data: O,
      signal: k,
      cancelToken: N,
      timeout: z,
      onDownloadProgress: ke,
      onUploadProgress: De,
      responseType: $,
      headers: W,
      withCredentials: be = "same-origin",
      fetchOptions: Ye,
      maxContentLength: I,
      maxBodyLength: we
    } = Jt(d);
    const le = i.isNumber(I) && I > -1, Le = i.isNumber(we) && we > -1, Yt = (_) => i.hasOwnProp(d, _) ? d[_] : void 0;
    let et = s || fetch;
    $ = $ ? ($ + "").toLowerCase() : "text";
    let V = ss(
      [k, N && N.toAbortSignal()],
      z
    ), P = null;
    const K = V && V.unsubscribe && (() => {
      V.unsubscribe();
    });
    let re, ce = null;
    const tt = () => new h(
      "Request body larger than maxBodyLength limit",
      h.ERR_BAD_REQUEST,
      d,
      P
    );
    try {
      let _;
      const B = Yt("auth");
      if (B) {
        const E = i.getSafeProp(B, "username") || "", F = i.getSafeProp(B, "password") || "";
        _ = {
          username: E,
          password: F
        };
      }
      if (ys(b)) {
        const E = new URL(b, C.origin);
        if (!_ && (E.username || E.password)) {
          const F = xt(E.username), J = xt(E.password);
          _ = {
            username: F,
            password: J
          };
        }
        (E.username || E.password) && (E.username = "", E.password = "", b = E.href);
      }
      if (_ && (W.delete("authorization"), W.set(
        "Authorization",
        "Basic " + btoa(hs((_.username || "") + ":" + (_.password || "")))
      )), le && typeof b == "string" && b.startsWith("data:") && ms(b) > I)
        throw new h(
          "maxContentLength size of " + I + " exceeded",
          h.ERR_BAD_RESPONSE,
          d,
          P
        );
      if (Le && w !== "get" && w !== "head") {
        const E = await S(O);
        if (typeof E == "number" && isFinite(E) && (re = E, E > we))
          throw tt();
      }
      const Ee = Le && (i.isReadableStream(O) || i.isStream(O)), nt = (E, F, J) => gt(
        E,
        Et,
        (X) => {
          if (Le && X > we)
            throw ce = tt();
          F && F(X);
        },
        J
      );
      if (y && w !== "get" && w !== "head" && (De || Ee)) {
        if (re = re ?? await g(W, O), re !== 0 || Ee) {
          let E = new o(b, {
            method: "POST",
            body: O,
            duplex: "half"
          }), F;
          if (i.isFormData(O) && (F = E.headers.get("content-type")) && W.setContentType(F), E.body) {
            const [J, X] = De && pt(
              re,
              Ne(mt(De))
            ) || [];
            O = nt(E.body, J, X);
          }
        }
      } else if (Ee && !u && f && w !== "get" && w !== "head")
        O = nt(O);
      else if (Ee && u && !y && w !== "get" && w !== "head")
        throw new h(
          "Stream request bodies are not supported by the current fetch implementation",
          h.ERR_NOT_SUPPORT,
          d,
          P
        );
      i.isString(be) || (be = be ? "include" : "omit");
      const en = u && "credentials" in o.prototype;
      if (i.isFormData(O)) {
        const E = W.getContentType();
        E && /^multipart\/form-data/i.test(E) && !/boundary=/i.test(E) && W.delete("content-type");
      }
      W.set("User-Agent", "axios/" + Ge, !1);
      const rt = {
        ...Ye,
        signal: V,
        method: w.toUpperCase(),
        headers: vt(W.normalize()),
        body: O,
        duplex: "half",
        credentials: en ? be : void 0
      };
      P = u && new o(b, rt);
      let M = await (u ? et(P, Ye) : et(b, rt));
      const st = L.from(M.headers);
      if (le) {
        const E = i.toFiniteNumber(st.getContentLength());
        if (E != null && E > I)
          throw new h(
            "maxContentLength size of " + I + " exceeded",
            h.ERR_BAD_RESPONSE,
            d,
            P
          );
      }
      const Ue = x && ($ === "stream" || $ === "response");
      if (x && M.body && (ke || le || Ue && K)) {
        const E = {};
        ["status", "statusText", "headers"].forEach((ue) => {
          E[ue] = M[ue];
        });
        const F = i.toFiniteNumber(st.getContentLength()), [J, X] = ke && pt(
          F,
          Ne(mt(ke), !0)
        ) || [];
        let ot = 0;
        const tn = (ue) => {
          if (le && (ot = ue, ot > I))
            throw new h(
              "maxContentLength size of " + I + " exceeded",
              h.ERR_BAD_RESPONSE,
              d,
              P
            );
          J && J(ue);
        };
        M = new a(
          gt(M.body, Et, tn, () => {
            X && X(), K && K();
          }),
          E
        );
      }
      $ = $ || "text";
      let q = await R[i.findKey(R, $) || "text"](
        M,
        d
      );
      if (le && !x && !Ue) {
        let E;
        if (q != null && (typeof q.byteLength == "number" ? E = q.byteLength : typeof q.size == "number" ? E = q.size : typeof q == "string" && (E = typeof r == "function" ? new r().encode(q).byteLength : q.length)), typeof E == "number" && E > I)
          throw new h(
            "maxContentLength size of " + I + " exceeded",
            h.ERR_BAD_RESPONSE,
            d,
            P
          );
      }
      return !Ue && K && K(), await new Promise((E, F) => {
        Wt(E, F, {
          data: q,
          headers: L.from(M.headers),
          status: M.status,
          statusText: M.statusText,
          config: d,
          request: P
        });
      });
    } catch (_) {
      if (K && K(), V && V.aborted && V.reason instanceof h) {
        const B = V.reason;
        throw B.config = d, P && (B.request = P), _ !== B && Object.defineProperty(B, "cause", {
          __proto__: null,
          value: _,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), B;
      }
      if (ce)
        throw P && !ce.request && (ce.request = P), ce;
      if (_ instanceof h)
        throw P && !_.request && (_.request = P), _;
      if (_ && _.name === "TypeError" && /Load failed|fetch/i.test(_.message)) {
        const B = new h(
          "Network Error",
          h.ERR_NETWORK,
          d,
          P,
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
      throw h.from(_, _ && _.code, d, P, _ && _.response);
    }
  };
}, bs = /* @__PURE__ */ new Map(), Xt = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: s } = t, o = [r, s, n];
  let a = o.length, l = a, u, c, f = bs;
  for (; l--; )
    u = o[l], c = f.get(u), c === void 0 && f.set(u, c = l ? /* @__PURE__ */ new Map() : gs(t)), f = c;
  return c;
};
Xt();
const Qe = {
  http: Sr,
  xhr: rs,
  fetch: {
    get: Xt
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
const St = (e) => `- ${e}`, ws = (e) => i.isFunction(e) || e === null || e === !1;
function Es(e, t) {
  e = i.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, s;
  const o = {};
  for (let a = 0; a < n; a++) {
    r = e[a];
    let l;
    if (s = r, !ws(r) && (s = Qe[(l = String(r)).toLowerCase()], s === void 0))
      throw new h(`Unknown adapter '${l}'`);
    if (s && (i.isFunction(s) || (s = s.get(t))))
      break;
    o[l || "#" + a] = s;
  }
  if (!s) {
    const a = Object.entries(o).map(
      ([u, c]) => `adapter ${u} ` + (c === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let l = n ? a.length > 1 ? `since :
` + a.map(St).join(`
`) : " " + St(a[0]) : "as no adapter specified";
    throw new h(
      "There is no suitable adapter to dispatch the request " + l,
      h.ERR_NOT_SUPPORT
    );
  }
  return s;
}
const Zt = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: Es,
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
  return Ie(e), e.headers = L.from(e.headers), e.data = je.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Zt.getAdapter(e.adapter || ye.adapter, e)(e).then(
    function(r) {
      Ie(e), e.response = r;
      try {
        r.data = je.call(e, e.transformResponse, r);
      } finally {
        delete e.response;
      }
      return r.headers = L.from(r.headers), r;
    },
    function(r) {
      if (!$t(r) && (Ie(e), r && r.response)) {
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
        r.response.headers = L.from(r.response.headers);
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
const Ot = {};
Ce.transitional = function(t, n, r) {
  function s(o, a) {
    return "[Axios v" + Ge + "] Transitional option '" + o + "'" + a + (r ? ". " + r : "");
  }
  return (o, a, l) => {
    if (t === !1)
      throw new h(
        s(a, " has been removed" + (n ? " in " + n : "")),
        h.ERR_DEPRECATED
      );
    return n && !Ot[a] && (Ot[a] = !0, console.warn(
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
      const l = e[o], u = l === void 0 || a(l, o, e);
      if (u !== !0)
        throw new h(
          "option " + o + " must be " + u,
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
}, D = Oe.validators;
let G = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new ft(),
      response: new ft()
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
`, a + 1), u = l === -1 ? "" : o.slice(l + 1);
            String(r.stack).endsWith(u) || (r.stack += `
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
        silentJSONParsing: D.transitional(D.boolean),
        forcedJSONParsing: D.transitional(D.boolean),
        clarifyTimeoutError: D.transitional(D.boolean),
        legacyInterceptorReqResOrdering: D.transitional(D.boolean),
        advertiseZstdAcceptEncoding: D.transitional(D.boolean),
        validateStatusUndefinedResolves: D.transitional(D.boolean)
      },
      !1
    ), s != null && (i.isFunction(s) ? n.paramsSerializer = {
      serialize: s
    } : Oe.assertOptions(
      s,
      {
        encode: D.function,
        serialize: D.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Oe.assertOptions(
      n,
      {
        baseUrl: D.spelling("baseURL"),
        withXsrfToken: D.spelling("withXSRFToken")
      },
      !0
    ), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let a = o && i.merge(o.common, o[n.method]);
    o && i.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (R) => {
      delete o[R];
    }), n.headers = L.concat(a, o);
    const l = [];
    let u = !0;
    this.interceptors.request.forEach(function(S) {
      if (typeof S.runWhen == "function" && S.runWhen(n) === !1)
        return;
      u = u && S.synchronous;
      const g = n.transitional || Xe;
      g && g.legacyInterceptorReqResOrdering ? l.unshift(S.fulfilled, S.rejected) : l.push(S.fulfilled, S.rejected);
    });
    const c = [];
    this.interceptors.response.forEach(function(S) {
      c.push(S.fulfilled, S.rejected);
    });
    let f, p = 0, y;
    if (!u) {
      const R = [Me.bind(this), void 0];
      for (R.unshift(...l), R.push(...c), y = R.length, f = Promise.resolve(n); p < y; )
        f = f.then(R[p++], R[p++]);
      return f;
    }
    y = l.length;
    let x = n;
    for (; p < y; ) {
      const R = l[p++], S = l[p++];
      try {
        x = R ? R(x) : x;
      } catch (g) {
        if (!S) {
          f = Promise.reject(g);
          break;
        }
        try {
          const d = S.call(this, g);
          i.isThenable(d) && (f = Promise.resolve(d).then(
            () => Me.call(this, x)
          ));
        } catch (d) {
          f = Promise.reject(d);
        }
        break;
      }
    }
    if (!f)
      try {
        f = Me.call(this, x);
      } catch (R) {
        f = Promise.reject(R);
      }
    for (p = 0, y = c.length; p < y; )
      f = f.then(c[p++], c[p++]);
    return f;
  }
  getUri(t) {
    t = te(this.defaults, t);
    const n = Vt(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return qt(n, t.params, t.paramsSerializer);
  }
};
i.forEach(["delete", "get", "head", "options"], function(t) {
  G.prototype[t] = function(n, r) {
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
  G.prototype[t] = n(), t !== "query" && (G.prototype[t + "Form"] = n(!0));
});
let Rs = class Gt {
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
      token: new Gt(function(s) {
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
function Qt(e) {
  const t = new G(e), n = Nt(G.prototype.request, t);
  return i.extend(n, G.prototype, t, { allOwnKeys: !0 }), i.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(s) {
    return Qt(te(e, s));
  }, n;
}
const T = Qt(ye);
T.Axios = G;
T.CanceledError = ge;
T.CancelToken = Rs;
T.isCancel = $t;
T.VERSION = Ge;
T.toFormData = Pe;
T.AxiosError = h;
T.Cancel = T.CanceledError;
T.all = function(t) {
  return Promise.all(t);
};
T.spread = Ss;
T.isAxiosError = Os;
T.mergeConfig = te;
T.AxiosHeaders = L;
T.formToJSON = (e) => zt(i.isHTMLForm(e) ? new FormData(e) : e);
T.getAdapter = Zt.getAdapter;
T.HttpStatusCode = We;
T.default = T;
const {
  Axios: qs,
  AxiosError: Hs,
  CanceledError: zs,
  isCancel: $s,
  CancelToken: Ws,
  VERSION: Vs,
  all: Js,
  Cancel: Ks,
  isAxiosError: Xs,
  spread: Zs,
  toFormData: Gs,
  AxiosHeaders: Qs,
  HttpStatusCode: Ys,
  formToJSON: eo,
  getAdapter: to,
  mergeConfig: no,
  create: ro
} = T, Q = T.create({ baseURL: "/api", withCredentials: !0 });
Q.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const _s = {
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
function A(e, t) {
  if (t != null && t.translations_override)
    try {
      const s = JSON.parse(t.translations_override)[e];
      if (typeof s == "string" && s) return s;
    } catch {
    }
  return (localStorage.getItem("mortar_lang") || (t == null ? void 0 : t.site_lang) || "en") === "zh" && _s[e] || e;
}
function As(e) {
  return localStorage.getItem("mortar_lang") || (e == null ? void 0 : e.site_lang) || "en";
}
function Ns({ settings: e }) {
  const [t, n] = H([]), [r, s] = H(!1), [o, a] = H(null);
  de(() => {
    Q.get("/menus/location/primary").then((c) => n(c.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && Q.get("/auth/me").then((c) => a(c.data)).catch(() => localStorage.removeItem("mortar_token"));
  }, []);
  function l() {
    Q.post("/auth/logout").catch(() => {
    }), localStorage.removeItem("mortar_token"), window.location.href = "/";
  }
  const u = e.theme_header_image || "";
  return m.createElement(
    "header",
    { className: "bg-white" },
    u && m.createElement(
      "div",
      { className: "h-48 md:h-64 overflow-hidden" },
      m.createElement("img", { src: u, alt: "", className: "w-full h-full object-cover" })
    ),
    m.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-8 text-center" },
      m.createElement(
        v,
        { to: "/" },
        m.createElement("h1", { className: "text-3xl md:text-4xl font-normal tracking-tight text-gray-900" }, e.site_title || "Mortar")
      ),
      m.createElement("p", { className: "text-sm text-gray-500 mt-2" }, e.site_description || "")
    ),
    m.createElement(
      "nav",
      { className: "border-t border-gray-200" },
      m.createElement(
        "div",
        { className: "max-w-5xl mx-auto px-4 h-12 flex items-center justify-between" },
        m.createElement(
          "div",
          { className: "hidden md:flex items-center gap-8" },
          m.createElement(v, { to: "/", className: "text-sm text-gray-700 hover:text-gray-900" }, A("home", e)),
          t.filter((c) => !(c.url === "/" && (c.label.toLowerCase() === "home" || c.label === A("home", e)))).map((c) => m.createElement(v, { key: c.id, to: c.url, className: "text-sm text-gray-700 hover:text-gray-900" }, c.label)),
          m.createElement(v, { to: "/search", className: "text-sm text-gray-700 hover:text-gray-900" }, A("search", e))
        ),
        m.createElement(
          "div",
          { className: "hidden md:flex items-center gap-5 text-sm" },
          o ? m.createElement(
            m.Fragment,
            null,
            m.createElement("span", { className: "text-gray-600" }, o.username),
            m.createElement("button", { onClick: l, className: "text-gray-400 hover:text-gray-600" }, A("logout"))
          ) : m.createElement(v, { to: "/login", className: "text-gray-600 hover:text-gray-900" }, A("sign in")),
          m.createElement("a", { href: "/admin", className: "text-gray-900 font-medium hover:text-gray-600" }, A("admin", e))
        ),
        m.createElement("button", { onClick: () => s(!r), className: "md:hidden p-2 text-gray-600", "aria-label": A("toggle menu", e), "aria-expanded": r, "aria-controls": "mobile-nav" }, r ? m.createElement(mn, { size: 20 }) : m.createElement(fn, { size: 20 }))
      ),
      r && m.createElement(
        "div",
        { className: "md:hidden border-t border-gray-100 px-4 py-3 space-y-2" },
        m.createElement(v, { to: "/", className: "block text-sm text-gray-700 py-1" }, A("home", e)),
        t.filter((c) => !(c.url === "/" && (c.label.toLowerCase() === "home" || c.label === A("home", e)))).map((c) => m.createElement(v, { key: c.id, to: c.url, className: "block text-sm text-gray-700 py-1" }, c.label)),
        o ? m.createElement("button", { onClick: l, className: "block text-sm text-gray-400 py-1" }, A("logout")) : m.createElement(v, { to: "/login", className: "block text-sm text-gray-700 py-1" }, A("sign in")),
        m.createElement("a", { href: "/admin", className: "block text-sm text-gray-900 py-1" }, A("admin", e))
      )
    )
  );
}
function Ts() {
  const [e, t] = H([]);
  if (de(() => {
    Q.get("/tags").then((r) => t(r.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const n = Math.max(...e.map((r) => {
    var s;
    return ((s = r._count) == null ? void 0 : s.posts) || 0;
  }), 1);
  return m.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    m.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, A("tag cloud")),
    m.createElement(
      "div",
      { className: "flex flex-wrap gap-1.5" },
      e.map((r) => {
        var o, a, l;
        const s = 0.65 + (((o = r._count) == null ? void 0 : o.posts) || 0) / n * 0.35;
        return m.createElement(v, {
          key: r.id,
          to: "/tag/" + r.slug,
          className: "inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors",
          style: { fontSize: s + "rem" },
          title: (((a = r._count) == null ? void 0 : a.posts) || 0) + " " + A("posts")
        }, r.name + " (" + (((l = r._count) == null ? void 0 : l.posts) || 0) + ")");
      })
    )
  );
}
function Ps() {
  const [e, t] = H([]);
  return de(() => {
    Q.get("/posts?limit=5").then((n) => t(n.data.posts || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : m.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    m.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, A("recent posts")),
    m.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((n) => m.createElement(
        "li",
        { key: n.id },
        m.createElement(v, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title)
      ))
    )
  );
}
function Cs() {
  const [e, t] = H(""), [n, r] = H([]), [s, o] = H(!1), [a, l] = H(!1), u = rn(), c = nn(null);
  de(() => {
    const y = e.trim();
    if (y.length < 2) {
      r([]), o(!1);
      return;
    }
    l(!0);
    const x = setTimeout(() => {
      Q.get("/posts/suggest", { params: { q: y } }).then((R) => {
        var S;
        r(((S = R.data) == null ? void 0 : S.suggestions) || []), o(!0);
      }).catch(() => {
        r([]);
      }).finally(() => l(!1));
    }, 250);
    return () => clearTimeout(x);
  }, [e]), de(() => {
    const y = (x) => {
      c.current && !c.current.contains(x.target) && o(!1);
    };
    return document.addEventListener("mousedown", y), () => document.removeEventListener("mousedown", y);
  }, []);
  const f = (y) => {
    y.preventDefault(), e.trim() && u("/search?q=" + encodeURIComponent(e.trim()));
  }, p = (y) => {
    o(!1), u("/" + y.type + "/" + y.slug);
  };
  return m.createElement(
    "div",
    { ref: c, className: "rounded-lg border border-gray-200 p-4 relative" },
    m.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, A("search")),
    m.createElement(
      "form",
      { onSubmit: f, className: "flex gap-2" },
      m.createElement("input", {
        type: "text",
        value: e,
        onChange: (y) => t(y.target.value),
        onFocus: () => {
          n.length > 0 && o(!0);
        },
        placeholder: A("search placeholder"),
        "aria-label": A("search posts"),
        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      }),
      m.createElement("button", {
        type: "submit",
        "aria-label": A("search"),
        className: "px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      }, m.createElement(dn, { size: 16 }))
    ),
    // Suggestions dropdown
    s && n.length > 0 && m.createElement(
      "div",
      { className: "absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden" },
      n.map(
        (y) => m.createElement(
          "button",
          {
            key: y.id,
            type: "button",
            onMouseDown: (x) => {
              x.preventDefault(), p(y);
            },
            className: "w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          },
          m.createElement(y.type === "page" ? un : cn, { size: 14, className: "text-gray-400 shrink-0" }),
          m.createElement("span", { className: "text-sm text-gray-800 dark:text-gray-100 truncate" }, y.title),
          m.createElement("span", { className: "ml-auto text-xs uppercase text-gray-400 shrink-0" }, y.type)
        )
      )
    ),
    s && a && n.length === 0 && m.createElement("div", { className: "absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 px-3 py-2 text-xs text-gray-400" }, A("searching") + "…")
  );
}
function ks(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function Ds(e, t) {
  if (!e) return;
  const n = ks(t.cdn_url);
  return n && e.startsWith("/uploads/") ? n + e : e;
}
function Ls(e) {
  const t = String(e || ""), n = t.match(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/);
  return new Date(n ? t.replace(" ", "T") + "Z" : t).getTime();
}
function Us(e) {
  const t = As() === "zh", n = Date.now(), r = Ls(e), s = n - r, o = Math.floor(s / 6e4);
  if (o < 1) return t ? "刚刚" : "just now";
  if (o < 60) return t ? o + " 分钟前" : o + "m ago";
  const a = Math.floor(o / 60);
  if (a < 24) return t ? a + " 小时前" : a + "h ago";
  const l = Math.floor(a / 24);
  if (l < 7) return t ? l + " 天前" : l + "d ago";
  const u = Math.floor(l / 7);
  return u < 5 ? t ? u + " 周前" : u + "w ago" : new Date(r).toLocaleDateString(t ? "zh-CN" : void 0);
}
function Fs(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: a, catSlug: l, isTagPage: u } = e;
  return m.createElement(
    "div",
    null,
    l && m.createElement(
      "div",
      { className: "py-12 text-center" },
      m.createElement("h1", { className: "text-3xl font-normal text-gray-900 capitalize" }, (u ? A("tag", t) + ": " : "") + (l || "").replace(/-/g, " "))
    ),
    m.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-10" },
      m.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-3 gap-10" },
        m.createElement(
          "div",
          { className: "lg:col-span-2 space-y-10" },
          n.length === 0 ? m.createElement("p", { className: "text-gray-500 text-center py-16" }, A(a ? "failed to load posts" : "no posts yet", t)) : n.map(
            (c) => {
              var f, p;
              return m.createElement(
                "article",
                { key: c.id, className: "pb-8 border-b border-gray-200" },
                c.featured && m.createElement(
                  v,
                  { to: "/post/" + c.slug },
                  m.createElement("img", { src: Ds(c.featured, t), alt: c.title, className: "w-full h-56 object-cover mb-6", loading: "lazy" })
                ),
                m.createElement(
                  "div",
                  { className: "flex items-center gap-3 text-xs text-gray-500 mb-3" },
                  m.createElement("span", { className: "flex items-center gap-1" }, m.createElement(ln, { size: 12 }), Us(c.publishedAt || c.createdAt)),
                  m.createElement("span", { className: "flex items-center gap-1" }, m.createElement(pn, { size: 12 }), (f = c.author) == null ? void 0 : f.username),
                  ((p = c.categories) == null ? void 0 : p[0]) && m.createElement("span", { className: "text-gray-500" }, c.categories[0].name)
                ),
                m.createElement(
                  v,
                  { to: "/post/" + c.slug },
                  m.createElement("h2", { className: "text-2xl font-normal text-gray-900 hover:text-gray-600 mb-3" }, c.title)
                ),
                c.excerpt && m.createElement("p", { className: "text-gray-600 text-sm leading-relaxed mb-4" }, c.excerpt),
                m.createElement(v, { to: "/post/" + c.slug, className: "text-sm font-medium text-gray-900 border-b border-gray-900 pb-0.5 hover:text-gray-600" }, A("read more", t), " →")
              );
            }
          ),
          r > parseInt(t.posts_per_page || "10") && m.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            m.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40" }, "← " + A("previous", t)),
            m.createElement("span", { className: "text-sm text-gray-500" }, A("page", t) + " " + s + " " + A("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
            m.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40" }, A("next", t) + " →")
          )
        ),
        m.createElement(
          "aside",
          { className: "space-y-6" },
          m.createElement(Cs),
          m.createElement(Ps),
          m.createElement(Ts)
        )
      )
    )
  );
}
const so = { name: "twentyseventeen", typography: { cap: 2, max: 24 }, Header: Ns, HomeLayout: Fs };
export {
  so as default
};
