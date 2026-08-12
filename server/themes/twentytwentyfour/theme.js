import d, { forwardRef as St, createElement as Me, useState as Le, useEffect as tn } from "react";
import { Link as P } from "react-router-dom";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nn = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), _t = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var rn = {
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
const sn = St(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: a,
    ...l
  }, c) => Me(
    "svg",
    {
      ref: c,
      ...rn,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: _t("lucide", s),
      ...l
    },
    [
      ...a.map(([p, u]) => Me(p, u)),
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
const _e = (e, t) => {
  const n = St(
    ({ className: r, ...s }, o) => Me(sn, {
      ref: o,
      iconNode: t,
      className: _t(`lucide-${nn(e)}`, r),
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
const on = _e("Calendar", [
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
const an = _e("Menu", [
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
const ln = _e("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cn = _e("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function At(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: un } = Object.prototype, { getPrototypeOf: ne } = Object, { iterator: ue, toStringTag: Nt } = Symbol, Re = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), ce = (e, t) => {
  let n = e;
  const r = [];
  for (; n != null && n !== Object.prototype; ) {
    if (r.indexOf(n) !== -1)
      return !1;
    if (r.push(n), Re(n, t))
      return !0;
    n = ne(n);
  }
  return !1;
}, fn = (e, t) => e != null && ce(e, t) ? e[t] : void 0, We = /* @__PURE__ */ ((e) => (t) => {
  const n = un.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), j = (e) => (e = e.toLowerCase(), (t) => We(t) === e), Ae = (e) => (t) => typeof t === e, { isArray: Z } = Array, Q = Ae("undefined");
function re(e) {
  return e !== null && !Q(e) && e.constructor !== null && !Q(e.constructor) && F(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Tt = j("ArrayBuffer");
function dn(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Tt(e.buffer), t;
}
const mn = Ae("string"), F = Ae("function"), Pt = Ae("number"), se = (e) => e !== null && typeof e == "object", pn = (e) => e === !0 || e === !1, be = (e) => {
  if (!se(e))
    return !1;
  const t = ne(e);
  return (t === null || t === Object.prototype || ne(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !ce(e, Nt) && !ce(e, ue);
}, hn = (e) => {
  if (!se(e) || re(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, yn = j("Date"), gn = j("File"), bn = (e) => !!(e && typeof e.uri < "u"), wn = (e) => e && typeof e.getParts < "u", En = j("Blob"), xn = j("FileList"), Rn = j("Set"), On = (e) => se(e) && F(e.pipe);
function Sn() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const ot = Sn(), at = typeof ot.FormData < "u" ? ot.FormData : void 0, _n = (e) => {
  if (!e) return !1;
  if (at && e instanceof at) return !0;
  const t = ne(e);
  if (!t || t === Object.prototype || !F(e.append)) return !1;
  const n = We(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && F(e.toString) && e.toString() === "[object FormData]";
}, An = j("URLSearchParams"), [Nn, Tn, Pn, Cn] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(j), Dn = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function fe(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, s;
  if (typeof e != "object" && (e = [e]), Z(e))
    for (r = 0, s = e.length; r < s; r++)
      t.call(null, e[r], r, e);
  else {
    if (re(e))
      return;
    const o = n ? Object.getOwnPropertyNames(e) : Object.keys(e), a = o.length;
    let l;
    for (r = 0; r < a; r++)
      l = o[r], t.call(null, e[l], l, e);
  }
}
function Ct(e, t) {
  if (re(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, s;
  for (; r-- > 0; )
    if (s = n[r], t === s.toLowerCase())
      return s;
  return null;
}
const X = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Dt = (e) => !Q(e) && e !== X;
function qe(...e) {
  const { caseless: t, skipUndefined: n } = Dt(this) && this || {}, r = {}, s = (o, a) => {
    if (a === "__proto__" || a === "constructor" || a === "prototype")
      return;
    const l = t && typeof a == "string" && Ct(r, a) || a, c = Re(r, l) ? r[l] : void 0;
    be(c) && be(o) ? r[l] = qe(c, o) : be(o) ? r[l] = qe({}, o) : Z(o) ? r[l] = o.slice() : (!n || !Q(o)) && (r[l] = o);
  };
  for (let o = 0, a = e.length; o < a; o++) {
    const l = e[o];
    if (!l || re(l) || (fe(l, s), typeof l != "object" || Z(l)))
      continue;
    const c = Object.getOwnPropertySymbols(l);
    for (let p = 0; p < c.length; p++) {
      const u = c[p];
      $n.call(l, u) && s(l[u], u);
    }
  }
  return r;
}
const kn = (e, t, n, { allOwnKeys: r } = {}) => (fe(
  t,
  (s, o) => {
    n && F(s) ? Object.defineProperty(e, o, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: At(s, n),
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
), e), Ln = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), Un = (e, t, n, r) => {
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
}, Fn = (e, t, n, r) => {
  let s, o, a;
  const l = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0; )
      a = s[o], (!r || r(a, e, t)) && !l[a] && (t[a] = e[a], l[a] = !0);
    e = n !== !1 && ne(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, Bn = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, vn = (e) => {
  if (!e) return null;
  if (Z(e)) return e;
  let t = e.length;
  if (!Pt(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, jn = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && ne(Uint8Array)), In = (e, t) => {
  const r = (e && e[ue]).call(e);
  let s;
  for (; (s = r.next()) && !s.done; ) {
    const o = s.value;
    t.call(e, o[0], o[1]);
  }
}, Mn = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, qn = j("HTMLFormElement"), Hn = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(n, r, s) {
  return r.toUpperCase() + s;
}), { propertyIsEnumerable: $n } = Object.prototype, zn = j("RegExp"), kt = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  fe(n, (s, o) => {
    let a;
    (a = t(s, o, e)) !== !1 && (r[o] = a || s);
  }), Object.defineProperties(e, r);
}, Wn = (e) => {
  kt(e, (t, n) => {
    if (F(e) && ["arguments", "caller", "callee"].includes(n))
      return !1;
    const r = e[n];
    if (F(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, Vn = (e, t) => {
  const n = {}, r = (s) => {
    s.forEach((o) => {
      n[o] = !0;
    });
  };
  return Z(e) ? r(e) : r(String(e).split(t)), n;
}, Jn = () => {
}, Kn = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Xn(e) {
  return !!(e && F(e.append) && e[Nt] === "FormData" && e[ue]);
}
const Gn = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (r) => {
    if (se(r)) {
      if (t.has(r))
        return;
      if (re(r))
        return r;
      if (!("toJSON" in r)) {
        t.add(r);
        let s;
        if (Rn(r)) {
          s = [];
          for (const o of r) {
            const a = n(o);
            !Q(a) && s.push(a);
          }
        } else
          s = Z(r) ? [] : {}, fe(r, (o, a) => {
            const l = n(o);
            !Q(l) && (s[a] = l);
          });
        return t.delete(r), s;
      }
    }
    return r;
  };
  return n(e);
}, Zn = j("AsyncFunction"), Qn = (e) => e && (se(e) || F(e)) && F(e.then) && F(e.catch), Lt = ((e, t) => e ? setImmediate : t ? ((n, r) => (X.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === X && o === n && r.length && r.shift()();
  },
  !1
), (s) => {
  r.push(s), X.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", F(X.postMessage)), Yn = typeof queueMicrotask < "u" ? queueMicrotask.bind(X) : typeof process < "u" && process.nextTick || Lt, Ut = (e) => e != null && F(e[ue]), er = (e) => e != null && ce(e, ue) && Ut(e), i = {
  isArray: Z,
  isArrayBuffer: Tt,
  isBuffer: re,
  isFormData: _n,
  isArrayBufferView: dn,
  isString: mn,
  isNumber: Pt,
  isBoolean: pn,
  isObject: se,
  isPlainObject: be,
  isEmptyObject: hn,
  isReadableStream: Nn,
  isRequest: Tn,
  isResponse: Pn,
  isHeaders: Cn,
  isUndefined: Q,
  isDate: yn,
  isFile: gn,
  isReactNativeBlob: bn,
  isReactNative: wn,
  isBlob: En,
  isRegExp: zn,
  isFunction: F,
  isStream: On,
  isURLSearchParams: An,
  isTypedArray: jn,
  isFileList: xn,
  forEach: fe,
  merge: qe,
  extend: kn,
  trim: Dn,
  stripBOM: Ln,
  inherits: Un,
  toFlatObject: Fn,
  kindOf: We,
  kindOfTest: j,
  endsWith: Bn,
  toArray: vn,
  forEachEntry: In,
  matchAll: Mn,
  isHTMLForm: qn,
  hasOwnProperty: Re,
  hasOwnProp: Re,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: ce,
  getSafeProp: fn,
  reduceDescriptors: kt,
  freezeMethods: Wn,
  toObjectSet: Vn,
  toCamelCase: Hn,
  noop: Jn,
  toFiniteNumber: Kn,
  findKey: Ct,
  global: X,
  isContextDefined: Dt,
  isSpecCompliantForm: Xn,
  toJSONObject: Gn,
  isAsyncFn: Zn,
  isThenable: Qn,
  setImmediate: Lt,
  asap: Yn,
  isIterable: Ut,
  isSafeIterable: er
}, tr = i.toObjectSet([
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
]), nr = (e) => {
  const t = {};
  let n, r, s;
  return e && e.split(`
`).forEach(function(a) {
    s = a.indexOf(":"), n = a.substring(0, s).trim().toLowerCase(), r = a.substring(s + 1).trim();
    const l = i.hasOwnProp(t, n);
    !n || l && i.hasOwnProp(tr, n) || (n === "set-cookie" ? l ? t[n].push(r) : t[n] = [r] : t[n] = l ? t[n] + ", " + r : r);
  }), t;
};
function rr(e) {
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
const sr = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), or = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Ve(e, t) {
  return i.isArray(e) ? e.map((n) => Ve(n, t)) : rr(String(e).replace(t, ""));
}
const ar = (e) => Ve(e, sr), ir = (e) => Ve(e, or);
function Ft(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return i.forEach(e.toJSON(), (n, r) => {
    t[r] = ir(n);
  }), t;
}
const it = Symbol("internals");
function le(e) {
  return e && String(e).trim().toLowerCase();
}
function we(e) {
  return e === !1 || e == null ? e : i.isArray(e) ? e.map(we) : ar(String(e));
}
function lr(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const cr = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function Ue(e) {
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
function ur(e) {
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
function fr(e) {
  const t = /* @__PURE__ */ Object.create(null), n = String(e);
  let r = 0, s = !1, o = !1;
  function a(l) {
    const c = Ue(n.slice(r, l)), p = c.indexOf("=");
    if (p < 1)
      return;
    const u = Ue(c.slice(0, p));
    if (!cr.test(u))
      return;
    const f = u.toLowerCase();
    if (f === "__proto__" || f === "constructor" || f === "prototype")
      return;
    const b = Ue(c.slice(p + 1));
    t[f] = ur(b);
  }
  for (let l = 0; l < n.length; l++) {
    const c = n.charCodeAt(l);
    s ? o ? o = !1 : c === 92 ? o = !0 : c === 34 && (s = !1) : c === 34 ? s = !0 : (c === 44 || c === 59) && (a(l), r = l + 1);
  }
  return a(n.length), t;
}
const dr = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
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
function mr(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function pr(e, t) {
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
    function o(l, c, p) {
      const u = le(c);
      if (!u)
        return;
      const f = i.findKey(s, u);
      (!f || s[f] === void 0 || p === !0 || p === void 0 && s[f] !== !1) && (s[f || c] = we(l));
    }
    const a = (l, c) => i.forEach(l, (p, u) => o(p, u, c));
    if (i.isPlainObject(t) || t instanceof this.constructor)
      a(t, n);
    else if (i.isString(t) && (t = t.trim()) && !dr(t))
      a(nr(t), n);
    else if (i.isObject(t) && i.isSafeIterable(t)) {
      let l = /* @__PURE__ */ Object.create(null), c, p;
      for (const u of t) {
        if (!i.isArray(u))
          throw new TypeError("Object iterator must return a key-value pair");
        p = u[0], i.hasOwnProp(l, p) ? (c = l[p], l[p] = i.isArray(c) ? [...c, u[1]] : [c, u[1]]) : l[p] = u[1];
      }
      a(l, n);
    } else
      t != null && o(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = le(t), t) {
      const r = i.findKey(this, t);
      if (r) {
        const s = this[r];
        if (!n)
          return s;
        if (n === !0)
          return lr(s);
        if (i.isFunction(n))
          return n.call(this, s, r);
        if (i.isRegExp(n))
          return n.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = le(t), t) {
      const r = i.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || Fe(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function o(a) {
      if (a = le(a), a) {
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
        n[a] = we(s), delete n[o];
        return;
      }
      const l = t ? mr(o) : String(o).trim();
      l !== o && delete n[o], n[l] = we(s), r[l] = !0;
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
    return fr(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((s) => r.set(s)), r;
  }
  static accessor(t) {
    const r = (this[it] = this[it] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(a) {
      const l = le(a);
      r[l] || (pr(s, a), r[l] = !0);
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
const Oe = "[REDACTED ****]";
function hr(e) {
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
function yr(e, t) {
  const n = new Set(t.map((o) => String(o).toLowerCase())), r = [], s = (o) => {
    if (o === null || typeof o != "object" || i.isBuffer(o)) return o;
    if (r.indexOf(o) !== -1) return;
    o instanceof U && (o = o.toJSON()), r.push(o);
    let a;
    if (i.isArray(o))
      a = [], o.forEach((l, c) => {
        const p = s(l);
        i.isUndefined(p) || (a[c] = p);
      });
    else {
      if (!i.isPlainObject(o) && hr(o))
        return r.pop(), o;
      a = /* @__PURE__ */ Object.create(null);
      for (const [l, c] of Object.entries(o)) {
        const p = n.has(l.toLowerCase()) ? Oe : s(c);
        i.isUndefined(p) || (a[l] = p);
      }
    }
    return r.pop(), a;
  };
  return s(e);
}
function lt(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function gr(e) {
  return e.errors.map((n) => {
    try {
      return n && n.message ? lt(n.message) : lt(n);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let h = class Bt extends Error {
  static from(t, n, r, s, o, a) {
    let l = t.message;
    !l && i.isArray(t.errors) && t.errors.length && (l = gr(t));
    const c = new Bt(l, n || t.code, r, s, o);
    return Object.defineProperty(c, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), c.name = t.name, t.status != null && c.status == null && (c.status = t.status), a && Object.assign(c, a), c;
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
    const t = this.config, n = t && i.hasOwnProp(t, "redact") ? t.redact : void 0, r = i.isArray(n) && n.length > 0 ? yr(t, n) : i.toJSONObject(t);
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
const br = null, vt = 100;
function He(e) {
  return i.isPlainObject(e) || i.isArray(e);
}
function jt(e) {
  return i.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Be(e, t, n) {
  return e ? e.concat(t).map(function(s, o) {
    return s = jt(s), !n && o ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function wr(e) {
  return i.isArray(e) && !e.some(He);
}
const Er = i.toFlatObject(i, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function Ne(e, t, n) {
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
    function(g, w) {
      return !i.isUndefined(w[g]);
    }
  );
  const r = n.metaTokens, s = n.visitor || O, o = n.dots, a = n.indexes, l = n.Blob || typeof Blob < "u" && Blob, c = n.maxDepth === void 0 ? vt : n.maxDepth, p = l && i.isSpecCompliantForm(t), u = [];
  if (!i.isFunction(s))
    throw new TypeError("visitor must be a function");
  function f(m) {
    if (m === null) return "";
    if (i.isDate(m))
      return m.toISOString();
    if (i.isBoolean(m))
      return m.toString();
    if (!p && i.isBlob(m))
      throw new h("Blob is not supported. Use a Buffer instead.");
    if (i.isArrayBuffer(m) || i.isTypedArray(m)) {
      if (p && typeof l == "function")
        return new l([m]);
      throw new h("Blob is not supported. Use a Buffer instead.", h.ERR_NOT_SUPPORT);
    }
    return m;
  }
  function b(m) {
    if (m > c)
      throw new h(
        "Object is too deeply nested (" + m + " levels). Max depth: " + c,
        h.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function x(m, g) {
    if (c === 1 / 0)
      return JSON.stringify(m);
    const w = [];
    return JSON.stringify(m, function(k, N) {
      if (!i.isObject(N))
        return N;
      for (; w.length && w[w.length - 1] !== this; )
        w.pop();
      return w.push(N), b(g + w.length - 1), N;
    });
  }
  function O(m, g, w) {
    let S = m;
    if (i.isReactNative(t) && i.isReactNativeBlob(m))
      return t.append(Be(w, g, o), f(m)), !1;
    if (m && !w && typeof m == "object") {
      if (i.endsWith(g, "{}"))
        g = r ? g : g.slice(0, -2), m = x(m, 1);
      else if (i.isArray(m) && wr(m) || (i.isFileList(m) || i.endsWith(g, "[]")) && (S = i.toArray(m)))
        return g = jt(g), S.forEach(function(N, H) {
          !(i.isUndefined(N) || N === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            a === !0 ? Be([g], H, o) : a === null ? g : g + "[]",
            f(N)
          );
        }), !1;
    }
    return He(m) ? !0 : (t.append(Be(w, g, o), f(m)), !1);
  }
  const _ = Object.assign(Er, {
    defaultVisitor: O,
    convertValue: f,
    isVisitable: He
  });
  function y(m, g, w = 0) {
    if (!i.isUndefined(m)) {
      if (b(w), u.indexOf(m) !== -1)
        throw new Error("Circular reference detected in " + g.join("."));
      u.push(m), i.forEach(m, function(k, N) {
        (!(i.isUndefined(k) || k === null) && s.call(t, k, i.isString(N) ? N.trim() : N, g, _)) === !0 && y(k, g ? g.concat(N) : [N], w + 1);
      }), u.pop();
    }
  }
  if (!i.isObject(e))
    throw new TypeError("data must be an object");
  return y(e), t;
}
function ct(e) {
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
function Je(e, t) {
  this._pairs = [], e && Ne(e, this, t);
}
const It = Je.prototype;
It.append = function(t, n) {
  this._pairs.push([t, n]);
};
It.toString = function(t) {
  const n = t ? (r) => t.call(this, r, ct) : ct;
  return this._pairs.map(function(s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function xr(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function Mt(e, t, n) {
  if (!t)
    return e;
  e = e || "";
  const r = i.isFunction(n) ? {
    serialize: n
  } : n, s = i.getSafeProp(r, "encode") || xr, o = i.getSafeProp(r, "serialize");
  let a;
  if (o ? a = o(t, r) : a = i.isURLSearchParams(t) ? t.toString() : new Je(t, r).toString(s), a) {
    const l = e.indexOf("#");
    l !== -1 && (e = e.slice(0, l)), e += (e.indexOf("?") === -1 ? "?" : "&") + a;
  }
  return e;
}
class ut {
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
const Ke = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, Rr = typeof URLSearchParams < "u" ? URLSearchParams : Je, Or = typeof FormData < "u" ? FormData : null, Sr = typeof Blob < "u" ? Blob : null, _r = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Rr,
    FormData: Or,
    Blob: Sr
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Xe = typeof window < "u" && typeof document < "u", $e = typeof navigator == "object" && navigator || void 0, Ar = Xe && (!$e || ["ReactNative", "NativeScript", "NS"].indexOf($e.product) < 0), Nr = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Tr = Xe && window.location.href || "http://localhost", Pr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Xe,
  hasStandardBrowserEnv: Ar,
  hasStandardBrowserWebWorkerEnv: Nr,
  navigator: $e,
  origin: Tr
}, Symbol.toStringTag, { value: "Module" })), D = {
  ...Pr,
  ..._r
};
function Cr(e, t) {
  return Ne(e, new D.classes.URLSearchParams(), {
    visitor: function(n, r, s, o) {
      return D.isNode && i.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const ft = vt;
function qt(e) {
  if (e > ft)
    throw new h(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + ft,
      h.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function Dr(e) {
  const t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g;
  let r;
  for (; (r = n.exec(e)) !== null; )
    qt(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
  return t;
}
function kr(e) {
  const t = {}, n = Object.keys(e);
  let r;
  const s = n.length;
  let o;
  for (r = 0; r < s; r++)
    o = n[r], t[o] = e[o];
  return t;
}
function Ht(e) {
  function t(n, r, s, o) {
    qt(o);
    let a = n[o++];
    if (a === "__proto__") return !0;
    const l = Number.isFinite(+a), c = o >= n.length;
    return a = !a && i.isArray(s) ? s.length : a, c ? (i.hasOwnProp(s, a) ? s[a] = i.isArray(s[a]) ? s[a].concat(r) : [s[a], r] : s[a] = r, !l) : ((!i.hasOwnProp(s, a) || !i.isObject(s[a])) && (s[a] = []), t(n, r, s[a], o) && i.isArray(s[a]) && (s[a] = kr(s[a])), !l);
  }
  if (i.isFormData(e) && i.isFunction(e.entries)) {
    const n = {};
    return i.forEachEntry(e, (r, s) => {
      t(Dr(r), s, n, 0);
    }), n;
  }
  return null;
}
const te = (e, t) => e != null && i.hasOwnProp(e, t) ? e[t] : void 0;
function Lr(e, t, n) {
  if (i.isString(e))
    try {
      return (t || JSON.parse)(e), i.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(e);
}
const de = {
  transitional: Ke,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, n) {
      const r = n.getContentType() || "", s = r.indexOf("application/json") > -1, o = i.isObject(t);
      if (o && i.isHTMLForm(t) && (t = new FormData(t)), i.isFormData(t))
        return s ? JSON.stringify(Ht(t)) : t;
      if (i.isArrayBuffer(t) || i.isBuffer(t) || i.isStream(t) || i.isFile(t) || i.isBlob(t) || i.isReadableStream(t))
        return t;
      if (i.isArrayBufferView(t))
        return t.buffer;
      if (i.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let l;
      if (o) {
        const c = te(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return Cr(t, c).toString();
        if ((l = i.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const p = te(this, "env"), u = p && p.FormData;
          return Ne(
            l ? { "files[]": t } : t,
            u && new u(),
            c
          );
        }
      }
      return o || s ? (n.setContentType("application/json", !1), Lr(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const n = te(this, "transitional") || de.transitional, r = n && n.forcedJSONParsing, s = te(this, "responseType"), o = s === "json";
      if (i.isResponse(t) || i.isReadableStream(t))
        return t;
      if (t && i.isString(t) && (r && !s || o)) {
        const l = !(n && n.silentJSONParsing) && o;
        try {
          return JSON.parse(t, te(this, "parseReviver"));
        } catch (c) {
          if (l)
            throw c.name === "SyntaxError" ? h.from(c, h.ERR_BAD_RESPONSE, this, null, te(this, "response")) : c;
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
    FormData: D.classes.FormData,
    Blob: D.classes.Blob
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
  de.headers[e] = {};
});
function ve(e, t) {
  const n = this || de, r = t || n, s = U.from(r.headers);
  let o = r.data;
  return i.forEach(e, function(l) {
    o = l.call(n, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function $t(e) {
  return !!(e && e.__CANCEL__);
}
let me = class extends h {
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
function zt(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new h(
    "Request failed with status code " + n.status,
    n.status >= 400 && n.status < 500 ? h.ERR_BAD_REQUEST : h.ERR_BAD_RESPONSE,
    n.config,
    n.request,
    n
  ));
}
function Ur(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Fr(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let s = 0, o = 0, a;
  return t = t !== void 0 ? t : 1e3, function(c) {
    const p = Date.now(), u = r[o];
    a || (a = p), n[s] = c, r[s] = p;
    let f = o, b = 0;
    for (; f !== s; )
      b += n[f++], f = f % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), p - a < t)
      return;
    const x = u && p - u;
    return x ? Math.round(b * 1e3 / x) : void 0;
  };
}
function Br(e, t) {
  let n = 0, r = 1e3 / t, s, o;
  const a = (p, u = Date.now()) => {
    n = u, s = null, o && (clearTimeout(o), o = null), e(...p);
  };
  return [(...p) => {
    const u = Date.now(), f = u - n;
    f >= r ? a(p, u) : (s = p, o || (o = setTimeout(() => {
      o = null, a(s);
    }, r - f)));
  }, () => s && a(s)];
}
const Se = (e, t, n = 3) => {
  let r = 0;
  const s = Fr(50, 250);
  return Br((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const a = o.loaded, l = o.lengthComputable ? o.total : void 0, c = Math.max(0, l != null ? Math.min(a, l) : a), p = Math.max(0, c - r), u = s(p);
    r = Math.max(r, c);
    const f = {
      loaded: c,
      total: l,
      progress: l ? c / l : void 0,
      bytes: p,
      rate: u || void 0,
      estimated: u && l ? (l - c) / u : void 0,
      event: o,
      lengthComputable: l != null,
      [t ? "download" : "upload"]: !0
    };
    e(f);
  }, n);
}, dt = (e, t) => {
  const n = e != null;
  return [
    (r) => t[0]({
      lengthComputable: n,
      total: e,
      loaded: r
    }),
    t[1]
  ];
}, mt = (e, t = i.asap) => (...n) => t(() => e(...n)), vr = D.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, D.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(D.origin),
  D.navigator && /(msie|trident)/i.test(D.navigator.userAgent)
) : () => !0, jr = D.hasStandardBrowserEnv ? (
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
function Ir(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Mr(e, t) {
  if (!t)
    return e;
  let n = e.length;
  for (; n > 0 && e.charCodeAt(n - 1) === 47; )
    n--;
  return e.slice(0, n) + "/" + t.replace(/^\/+/, "");
}
const qr = /^https?:(?!\/\/)/i, Hr = /[\t\n\r]/g;
function $r(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function zr(e) {
  return $r(e).replace(Hr, "");
}
function Wr(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, n, r = "") => `${n}${r}${Oe}`);
}
function Vr(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${Oe}@`), n = t.indexOf("#"), s = (n === -1 ? t : t.slice(0, n)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${Oe}`
  );
  return n === -1 ? s : `${s}#${Wr(t.slice(n + 1))}`;
}
function pt(e, t) {
  if (typeof e == "string") {
    const n = zr(e);
    if (qr.test(n))
      throw new h(
        `Invalid URL ${JSON.stringify(Vr(n))}: missing "//" after protocol`,
        h.ERR_INVALID_URL,
        t
      );
  }
}
function Wt(e, t, n, r) {
  pt(t, r);
  let s = !Ir(t);
  return e && (s || n === !1) ? (pt(e, r), Mr(e, t)) : t;
}
const ht = (e) => e instanceof U ? { ...e } : e, Jr = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function Y(e, t) {
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
  function r(u, f, b, x) {
    return i.isPlainObject(u) && i.isPlainObject(f) ? i.merge.call({ caseless: x }, u, f) : i.isPlainObject(f) ? i.merge({}, f) : i.isArray(f) ? f.slice() : f;
  }
  function s(u, f, b, x) {
    if (i.isUndefined(f)) {
      if (!i.isUndefined(u))
        return r(void 0, u, b, x);
    } else return r(u, f, b, x);
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
    const b = i.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (i.isPlainObject(b) && i.hasOwnProp(b, u))
      return b[u];
  }
  function c(u, f, b) {
    if (i.hasOwnProp(t, b))
      return r(u, f);
    if (i.hasOwnProp(e, b))
      return r(void 0, u);
  }
  const p = {
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
    validateStatus: c,
    headers: (u, f, b) => s(ht(u), ht(f), b, !0)
  };
  return i.forEach(Jr({ ...e, ...t }), function(f) {
    if (f === "__proto__" || f === "constructor" || f === "prototype") return;
    const b = i.hasOwnProp(p, f) ? p[f] : s, x = i.hasOwnProp(e, f) ? e[f] : void 0, O = i.hasOwnProp(t, f) ? t[f] : void 0, _ = b(x, O, f);
    i.isUndefined(_) && b !== c || (n[f] = _);
  }), i.hasOwnProp(t, "validateStatus") && i.isUndefined(t.validateStatus) && l("validateStatusUndefinedResolves") === !1 && (i.hasOwnProp(e, "validateStatus") ? n.validateStatus = r(void 0, e.validateStatus) : delete n.validateStatus), n;
}
const Kr = ["content-type", "content-length"];
function Xr(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([r, s]) => {
    Kr.includes(r.toLowerCase()) && e.set(r, s);
  });
}
const Gr = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
);
function Vt(e) {
  const t = Y({}, e), n = (b) => i.hasOwnProp(t, b) ? t[b] : void 0, r = n("data");
  let s = n("withXSRFToken");
  const o = n("xsrfHeaderName"), a = n("xsrfCookieName");
  let l = n("headers");
  const c = n("auth"), p = n("baseURL"), u = n("allowAbsoluteUrls"), f = n("url");
  if (t.headers = l = U.from(l), t.url = Mt(
    Wt(p, f, u, t),
    n("params"),
    n("paramsSerializer")
  ), c) {
    const b = i.getSafeProp(c, "username") || "", x = i.getSafeProp(c, "password") || "";
    try {
      l.set(
        "Authorization",
        "Basic " + btoa(b + ":" + (x ? Gr(x) : ""))
      );
    } catch (O) {
      throw h.from(O, h.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (i.isFormData(r) && (D.hasStandardBrowserEnv || D.hasStandardBrowserWebWorkerEnv || i.isReactNative(r) ? l.setContentType(void 0) : i.isFunction(r.getHeaders) && Xr(l, r.getHeaders(), n("formDataHeaderPolicy"))), D.hasStandardBrowserEnv && (i.isFunction(s) && (s = s(t)), s === !0 || s == null && vr(t.url))) {
    const x = o && a && jr.read(a);
    x && l.set(o, x);
  }
  return t;
}
const Zr = typeof XMLHttpRequest < "u", Qr = Zr && function(e) {
  return new Promise(function(n, r) {
    const s = Vt(e);
    let o = s.data;
    const a = U.from(s.headers).normalize();
    let { responseType: l, onUploadProgress: c, onDownloadProgress: p } = s, u, f, b, x, O;
    function _() {
      x && x(), O && O(), s.cancelToken && s.cancelToken.unsubscribe(u), s.signal && s.signal.removeEventListener("abort", u);
    }
    let y = new XMLHttpRequest();
    y.open(s.method.toUpperCase(), s.url, !0), y.timeout = s.timeout;
    function m() {
      if (!y)
        return;
      const w = U.from(
        "getAllResponseHeaders" in y && y.getAllResponseHeaders()
      ), k = {
        data: !l || l === "text" || l === "json" ? y.responseText : y.response,
        status: y.status,
        statusText: y.statusText,
        headers: w,
        config: e,
        request: y
      };
      zt(
        function(H) {
          n(H), _();
        },
        function(H) {
          r(H), _();
        },
        k
      ), y = null;
    }
    "onloadend" in y ? y.onloadend = m : y.onreadystatechange = function() {
      !y || y.readyState !== 4 || y.status === 0 && !(y.responseURL && y.responseURL.startsWith("file:")) || setTimeout(m);
    }, y.onabort = function() {
      y && (r(new h("Request aborted", h.ECONNABORTED, e, y)), _(), y = null);
    }, y.onerror = function(S) {
      const k = S && S.message ? S.message : "Network Error", N = new h(k, h.ERR_NETWORK, e, y);
      N.event = S || null, r(N), _(), y = null;
    }, y.ontimeout = function() {
      let S = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const k = s.transitional || Ke;
      s.timeoutErrorMessage && (S = s.timeoutErrorMessage), r(
        new h(
          S,
          k.clarifyTimeoutError ? h.ETIMEDOUT : h.ECONNABORTED,
          e,
          y
        )
      ), _(), y = null;
    }, o === void 0 && a.setContentType(null), "setRequestHeader" in y && i.forEach(Ft(a), function(S, k) {
      y.setRequestHeader(k, S);
    }), i.isUndefined(s.withCredentials) || (y.withCredentials = !!s.withCredentials), l && l !== "json" && (y.responseType = s.responseType), p && ([b, O] = Se(p, !0), y.addEventListener("progress", b)), c && y.upload && ([f, x] = Se(c), y.upload.addEventListener("progress", f), y.upload.addEventListener("loadend", x)), (s.cancelToken || s.signal) && (u = (w) => {
      y && (r(!w || w.type ? new me(null, e, y) : w), y.abort(), _(), y = null);
    }, s.cancelToken && s.cancelToken.subscribe(u), s.signal && (s.signal.aborted ? u() : s.signal.addEventListener("abort", u)));
    const g = Ur(s.url);
    if (g && !D.protocols.includes(g)) {
      r(
        new h(
          "Unsupported protocol " + g + ":",
          h.ERR_BAD_REQUEST,
          e
        )
      ), _();
      return;
    }
    y.send(o || null);
  });
}, Yr = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const s = function(c) {
    if (!r) {
      r = !0, a();
      const p = c instanceof Error ? c : this.reason;
      n.abort(
        p instanceof h ? p : new me(p instanceof Error ? p.message : p)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, s(new h(`timeout of ${t}ms exceeded`, h.ETIMEDOUT));
  }, t);
  const a = () => {
    e && (o && clearTimeout(o), o = null, e.forEach((c) => {
      c.unsubscribe ? c.unsubscribe(s) : c.removeEventListener("abort", s);
    }), e = null);
  };
  e.forEach((c) => {
    if (!r) {
      if (c.aborted) {
        s.call(c);
        return;
      }
      c.addEventListener("abort", s, { once: !0 });
    }
  });
  const { signal: l } = n;
  return l.unsubscribe = () => i.asap(a), l;
}, es = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let r = 0, s;
  for (; r < n; )
    s = r + t, yield e.slice(r, s), r = s;
}, ts = async function* (e, t) {
  for await (const n of ns(e))
    yield* es(n, t);
}, ns = async function* (e) {
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
}, yt = (e, t, n, r) => {
  const s = ts(e, t);
  let o = 0, a, l = (c) => {
    a || (a = !0, r && r(c));
  };
  return new ReadableStream(
    {
      async pull(c) {
        try {
          const { done: p, value: u } = await s.next();
          if (p) {
            l(), c.close();
            return;
          }
          let f = u.byteLength;
          if (n) {
            let b = o += f;
            n(b);
          }
          c.enqueue(new Uint8Array(u));
        } catch (p) {
          throw l(p), p;
        }
      },
      cancel(c) {
        return l(c), s.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, gt = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Jt = (e, t, n) => t + 2 < n && gt(e.charCodeAt(t + 1)) && gt(e.charCodeAt(t + 2)), bt = (e) => e <= 57 ? e - 48 : (e & 223) - 55, rs = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, ss = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, os = (e) => {
  const t = Math.floor(e / 4), n = e % 4;
  return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, as = (e) => {
  const t = e.length;
  let n = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, is = (e) => {
  const t = e.length;
  let n = 0, r = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let a = e.charCodeAt(o);
    if (a === 37 && Jt(e, o, t) && (a = bt(e.charCodeAt(o + 1)) * 16 + bt(e.charCodeAt(o + 2)), o += 2), !ss(a)) {
      if (a === 61) {
        r++;
        continue;
      }
      if (!rs(a) || r > 0) {
        s = !0;
        continue;
      }
      n++;
    }
  }
  return s || r > 2 || r > 0 && (n + r) % 4 !== 0 || n % 4 === 1 ? as(e) : os(n);
}, ls = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const n = e.indexOf(",");
  if (n < 0) return 0;
  const r = e.slice(5, n), s = e.slice(n + 1);
  if (/;base64/i.test(r))
    return t(s);
  let a = 0;
  for (let l = 0, c = s.length; l < c; l++) {
    const p = s.charCodeAt(l);
    if (p === 37 && Jt(s, l, c))
      a += 1, l += 2;
    else if (p < 128)
      a += 1;
    else if (p < 2048)
      a += 2;
    else if (p >= 55296 && p <= 56319 && l + 1 < c) {
      const u = s.charCodeAt(l + 1);
      u >= 56320 && u <= 57343 ? (a += 4, l++) : a += 3;
    } else
      a += 3;
  }
  return a;
};
function cs(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return ls(
    t === -1 ? e : e.slice(0, t),
    is
  );
}
const Ge = "1.19.0", wt = 64 * 1024, { isFunction: ge } = i, us = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), Et = (e) => {
  if (!i.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, xt = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, fs = (e) => {
  const t = e.indexOf("://");
  let n = e;
  return t !== -1 && (n = n.slice(t + 3)), n.includes("@") || n.includes(":");
}, ds = (e) => {
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
  const { fetch: s, Request: o, Response: a } = e, l = s ? ge(s) : typeof fetch == "function", c = ge(o), p = ge(a);
  if (!l)
    return !1;
  const u = l && ge(n), f = l && (typeof r == "function" ? /* @__PURE__ */ ((m) => (g) => m.encode(g))(new r()) : async (m) => new Uint8Array(await new o(m).arrayBuffer())), b = c && u && xt(() => {
    let m = !1;
    const g = new o(D.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return m = !0, "half";
      }
    }), w = g.headers.has("Content-Type");
    return g.body != null && g.body.cancel(), m && !w;
  }), x = p && u && xt(() => i.isReadableStream(new a("").body)), O = {
    stream: x && ((m) => m.body)
  };
  l && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((m) => {
    !O[m] && (O[m] = (g, w) => {
      let S = g && g[m];
      if (S)
        return S.call(g);
      throw new h(
        `Response type '${m}' is not supported`,
        h.ERR_NOT_SUPPORT,
        w
      );
    });
  });
  const _ = async (m) => {
    if (m == null)
      return 0;
    if (i.isBlob(m))
      return m.size;
    if (i.isSpecCompliantForm(m))
      return (await new o(D.origin, {
        method: "POST",
        body: m
      }).arrayBuffer()).byteLength;
    if (i.isArrayBufferView(m) || i.isArrayBuffer(m))
      return m.byteLength;
    if (i.isURLSearchParams(m) && (m = m + ""), i.isString(m))
      return (await f(m)).byteLength;
  }, y = async (m, g) => {
    const w = i.toFiniteNumber(m.getContentLength());
    return w ?? _(g);
  };
  return async (m) => {
    let {
      url: g,
      method: w,
      data: S,
      signal: k,
      cancelToken: N,
      timeout: H,
      onDownloadProgress: Pe,
      onUploadProgress: Ce,
      responseType: $,
      headers: z,
      withCredentials: pe = "same-origin",
      fetchOptions: Qe,
      maxContentLength: I,
      maxBodyLength: he
    } = Vt(m);
    const oe = i.isNumber(I) && I > -1, De = i.isNumber(he) && he > -1, Qt = (A) => i.hasOwnProp(m, A) ? m[A] : void 0;
    let Ye = s || fetch;
    $ = $ ? ($ + "").toLowerCase() : "text";
    let W = Yr(
      [k, N && N.toAbortSignal()],
      H
    ), C = null;
    const J = W && W.unsubscribe && (() => {
      W.unsubscribe();
    });
    let ee, ae = null;
    const et = () => new h(
      "Request body larger than maxBodyLength limit",
      h.ERR_BAD_REQUEST,
      m,
      C
    );
    try {
      let A;
      const v = Qt("auth");
      if (v) {
        const E = i.getSafeProp(v, "username") || "", B = i.getSafeProp(v, "password") || "";
        A = {
          username: E,
          password: B
        };
      }
      if (fs(g)) {
        const E = new URL(g, D.origin);
        if (!A && (E.username || E.password)) {
          const B = Et(E.username), V = Et(E.password);
          A = {
            username: B,
            password: V
          };
        }
        (E.username || E.password) && (E.username = "", E.password = "", g = E.href);
      }
      if (A && (z.delete("authorization"), z.set(
        "Authorization",
        "Basic " + btoa(us((A.username || "") + ":" + (A.password || "")))
      )), oe && typeof g == "string" && g.startsWith("data:") && cs(g) > I)
        throw new h(
          "maxContentLength size of " + I + " exceeded",
          h.ERR_BAD_RESPONSE,
          m,
          C
        );
      if (De && w !== "get" && w !== "head") {
        const E = await _(S);
        if (typeof E == "number" && isFinite(E) && (ee = E, E > he))
          throw et();
      }
      const ye = De && (i.isReadableStream(S) || i.isStream(S)), tt = (E, B, V) => yt(
        E,
        wt,
        (K) => {
          if (De && K > he)
            throw ae = et();
          B && B(K);
        },
        V
      );
      if (b && w !== "get" && w !== "head" && (Ce || ye)) {
        if (ee = ee ?? await y(z, S), ee !== 0 || ye) {
          let E = new o(g, {
            method: "POST",
            body: S,
            duplex: "half"
          }), B;
          if (i.isFormData(S) && (B = E.headers.get("content-type")) && z.setContentType(B), E.body) {
            const [V, K] = Ce && dt(
              ee,
              Se(mt(Ce))
            ) || [];
            S = tt(E.body, V, K);
          }
        }
      } else if (ye && !c && u && w !== "get" && w !== "head")
        S = tt(S);
      else if (ye && c && !b && w !== "get" && w !== "head")
        throw new h(
          "Stream request bodies are not supported by the current fetch implementation",
          h.ERR_NOT_SUPPORT,
          m,
          C
        );
      i.isString(pe) || (pe = pe ? "include" : "omit");
      const Yt = c && "credentials" in o.prototype;
      if (i.isFormData(S)) {
        const E = z.getContentType();
        E && /^multipart\/form-data/i.test(E) && !/boundary=/i.test(E) && z.delete("content-type");
      }
      z.set("User-Agent", "axios/" + Ge, !1);
      const nt = {
        ...Qe,
        signal: W,
        method: w.toUpperCase(),
        headers: Ft(z.normalize()),
        body: S,
        duplex: "half",
        credentials: Yt ? pe : void 0
      };
      C = c && new o(g, nt);
      let M = await (c ? Ye(C, Qe) : Ye(g, nt));
      const rt = U.from(M.headers);
      if (oe) {
        const E = i.toFiniteNumber(rt.getContentLength());
        if (E != null && E > I)
          throw new h(
            "maxContentLength size of " + I + " exceeded",
            h.ERR_BAD_RESPONSE,
            m,
            C
          );
      }
      const ke = x && ($ === "stream" || $ === "response");
      if (x && M.body && (Pe || oe || ke && J)) {
        const E = {};
        ["status", "statusText", "headers"].forEach((ie) => {
          E[ie] = M[ie];
        });
        const B = i.toFiniteNumber(rt.getContentLength()), [V, K] = Pe && dt(
          B,
          Se(mt(Pe), !0)
        ) || [];
        let st = 0;
        const en = (ie) => {
          if (oe && (st = ie, st > I))
            throw new h(
              "maxContentLength size of " + I + " exceeded",
              h.ERR_BAD_RESPONSE,
              m,
              C
            );
          V && V(ie);
        };
        M = new a(
          yt(M.body, wt, en, () => {
            K && K(), J && J();
          }),
          E
        );
      }
      $ = $ || "text";
      let q = await O[i.findKey(O, $) || "text"](
        M,
        m
      );
      if (oe && !x && !ke) {
        let E;
        if (q != null && (typeof q.byteLength == "number" ? E = q.byteLength : typeof q.size == "number" ? E = q.size : typeof q == "string" && (E = typeof r == "function" ? new r().encode(q).byteLength : q.length)), typeof E == "number" && E > I)
          throw new h(
            "maxContentLength size of " + I + " exceeded",
            h.ERR_BAD_RESPONSE,
            m,
            C
          );
      }
      return !ke && J && J(), await new Promise((E, B) => {
        zt(E, B, {
          data: q,
          headers: U.from(M.headers),
          status: M.status,
          statusText: M.statusText,
          config: m,
          request: C
        });
      });
    } catch (A) {
      if (J && J(), W && W.aborted && W.reason instanceof h) {
        const v = W.reason;
        throw v.config = m, C && (v.request = C), A !== v && Object.defineProperty(v, "cause", {
          __proto__: null,
          value: A,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), v;
      }
      if (ae)
        throw C && !ae.request && (ae.request = C), ae;
      if (A instanceof h)
        throw C && !A.request && (A.request = C), A;
      if (A && A.name === "TypeError" && /Load failed|fetch/i.test(A.message)) {
        const v = new h(
          "Network Error",
          h.ERR_NETWORK,
          m,
          C,
          A && A.response
        );
        throw Object.defineProperty(v, "cause", {
          __proto__: null,
          value: A.cause || A,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), v;
      }
      throw h.from(A, A && A.code, m, C, A && A.response);
    }
  };
}, ms = /* @__PURE__ */ new Map(), Kt = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: s } = t, o = [r, s, n];
  let a = o.length, l = a, c, p, u = ms;
  for (; l--; )
    c = o[l], p = u.get(c), p === void 0 && u.set(c, p = l ? /* @__PURE__ */ new Map() : ds(t)), u = p;
  return p;
};
Kt();
const Ze = {
  http: br,
  xhr: Qr,
  fetch: {
    get: Kt
  }
};
i.forEach(Ze, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const Rt = (e) => `- ${e}`, ps = (e) => i.isFunction(e) || e === null || e === !1;
function hs(e, t) {
  e = i.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, s;
  const o = {};
  for (let a = 0; a < n; a++) {
    r = e[a];
    let l;
    if (s = r, !ps(r) && (s = Ze[(l = String(r)).toLowerCase()], s === void 0))
      throw new h(`Unknown adapter '${l}'`);
    if (s && (i.isFunction(s) || (s = s.get(t))))
      break;
    o[l || "#" + a] = s;
  }
  if (!s) {
    const a = Object.entries(o).map(
      ([c, p]) => `adapter ${c} ` + (p === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let l = n ? a.length > 1 ? `since :
` + a.map(Rt).join(`
`) : " " + Rt(a[0]) : "as no adapter specified";
    throw new h(
      "There is no suitable adapter to dispatch the request " + l,
      h.ERR_NOT_SUPPORT
    );
  }
  return s;
}
const Xt = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: hs,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Ze
};
function je(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new me(null, e);
}
function Ie(e) {
  return je(e), e.headers = U.from(e.headers), e.data = ve.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Xt.getAdapter(e.adapter || de.adapter, e)(e).then(
    function(r) {
      je(e), e.response = r;
      try {
        r.data = ve.call(e, e.transformResponse, r);
      } finally {
        delete e.response;
      }
      return r.headers = U.from(r.headers), r;
    },
    function(r) {
      if (!$t(r) && (je(e), r && r.response)) {
        e.response = r.response;
        try {
          r.response.data = ve.call(
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
const Te = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Te[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const Ot = {};
Te.transitional = function(t, n, r) {
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
Te.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function ys(e, t, n) {
  if (typeof e != "object" || e === null)
    throw new h("options must be an object", h.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0; ) {
    const o = r[s], a = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (a) {
      const l = e[o], c = l === void 0 || a(l, o, e);
      if (c !== !0)
        throw new h(
          "option " + o + " must be " + c,
          h.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (n !== !0)
      throw new h("Unknown option " + o, h.ERR_BAD_OPTION);
  }
}
const Ee = {
  assertOptions: ys,
  validators: Te
}, L = Ee.validators;
let G = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new ut(),
      response: new ut()
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
`, a + 1), c = l === -1 ? "" : o.slice(l + 1);
            String(r.stack).endsWith(c) || (r.stack += `
` + o);
          }
        } catch {
        }
      }
      throw r;
    }
  }
  _request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = Y(this.defaults, n);
    const { transitional: r, paramsSerializer: s, headers: o } = n;
    r !== void 0 && Ee.assertOptions(
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
    } : Ee.assertOptions(
      s,
      {
        encode: L.function,
        serialize: L.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Ee.assertOptions(
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
    let c = !0;
    this.interceptors.request.forEach(function(_) {
      if (typeof _.runWhen == "function" && _.runWhen(n) === !1)
        return;
      c = c && _.synchronous;
      const y = n.transitional || Ke;
      y && y.legacyInterceptorReqResOrdering ? l.unshift(_.fulfilled, _.rejected) : l.push(_.fulfilled, _.rejected);
    });
    const p = [];
    this.interceptors.response.forEach(function(_) {
      p.push(_.fulfilled, _.rejected);
    });
    let u, f = 0, b;
    if (!c) {
      const O = [Ie.bind(this), void 0];
      for (O.unshift(...l), O.push(...p), b = O.length, u = Promise.resolve(n); f < b; )
        u = u.then(O[f++], O[f++]);
      return u;
    }
    b = l.length;
    let x = n;
    for (; f < b; ) {
      const O = l[f++], _ = l[f++];
      try {
        x = O ? O(x) : x;
      } catch (y) {
        if (!_) {
          u = Promise.reject(y);
          break;
        }
        try {
          const m = _.call(this, y);
          i.isThenable(m) && (u = Promise.resolve(m).then(
            () => Ie.call(this, x)
          ));
        } catch (m) {
          u = Promise.reject(m);
        }
        break;
      }
    }
    if (!u)
      try {
        u = Ie.call(this, x);
      } catch (O) {
        u = Promise.reject(O);
      }
    for (f = 0, b = p.length; f < b; )
      u = u.then(p[f++], p[f++]);
    return u;
  }
  getUri(t) {
    t = Y(this.defaults, t);
    const n = Wt(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return Mt(n, t.params, t.paramsSerializer);
  }
};
i.forEach(["delete", "get", "head", "options"], function(t) {
  G.prototype[t] = function(n, r) {
    return this.request(
      Y(r || {}, {
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
        Y(l || {}, {
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
let gs = class Gt {
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
      r.reason || (r.reason = new me(o, a, l), n(r.reason));
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
function bs(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function ws(e) {
  return i.isObject(e) && e.isAxiosError === !0;
}
const ze = {
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
Object.entries(ze).forEach(([e, t]) => {
  ze[t] = e;
});
function Zt(e) {
  const t = new G(e), n = At(G.prototype.request, t);
  return i.extend(n, G.prototype, t, { allOwnKeys: !0 }), i.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(s) {
    return Zt(Y(e, s));
  }, n;
}
const T = Zt(de);
T.Axios = G;
T.CanceledError = me;
T.CancelToken = gs;
T.isCancel = $t;
T.VERSION = Ge;
T.toFormData = Ne;
T.AxiosError = h;
T.Cancel = T.CanceledError;
T.all = function(t) {
  return Promise.all(t);
};
T.spread = bs;
T.isAxiosError = ws;
T.mergeConfig = Y;
T.AxiosHeaders = U;
T.formToJSON = (e) => Ht(i.isHTMLForm(e) ? new FormData(e) : e);
T.getAdapter = Xt.getAdapter;
T.HttpStatusCode = ze;
T.default = T;
const {
  Axios: ks,
  AxiosError: Ls,
  CanceledError: Us,
  isCancel: Fs,
  CancelToken: Bs,
  VERSION: vs,
  all: js,
  Cancel: Is,
  isAxiosError: Ms,
  spread: qs,
  toFormData: Hs,
  AxiosHeaders: $s,
  HttpStatusCode: zs,
  formToJSON: Ws,
  getAdapter: Vs,
  mergeConfig: Js,
  create: Ks
} = T, xe = T.create({ baseURL: "/api", withCredentials: !0 });
xe.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const Es = {
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
function R(e, t) {
  if (t != null && t.translations_override)
    try {
      const s = JSON.parse(t.translations_override)[e];
      if (typeof s == "string" && s) return s;
    } catch {
    }
  return (localStorage.getItem("mortar_lang") || (t == null ? void 0 : t.site_lang) || "en") === "zh" && Es[e] || e;
}
function xs({ settings: e }) {
  const [t, n] = Le([]), [r, s] = Le(!1), [o, a] = Le(null);
  tn(() => {
    xe.get("/menus/location/primary").then((c) => n(c.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && xe.get("/auth/me").then((c) => a(c.data)).catch(() => localStorage.removeItem("mortar_token"));
  }, []);
  function l() {
    xe.post("/auth/logout").catch(() => {
    }), localStorage.removeItem("mortar_token"), window.location.href = "/";
  }
  return d.createElement(
    "header",
    { className: "bg-white border-b border-gray-100" },
    d.createElement(
      "div",
      { className: "max-w-6xl mx-auto px-6 h-20 flex items-center justify-between" },
      d.createElement(P, { to: "/", className: "text-2xl font-bold tracking-tight text-gray-900" }, e.site_title || "Mortar"),
      d.createElement(
        "div",
        { className: "hidden md:flex items-center gap-8" },
        d.createElement(P, { to: "/", className: "text-sm text-gray-600 hover:text-gray-900" }, R("home", e)),
        t.filter((c) => !(c.url === "/" && (c.label.toLowerCase() === "home" || c.label === R("home", e)))).map((c) => d.createElement(P, { key: c.id, to: c.url, className: "text-sm text-gray-600 hover:text-gray-900" }, c.label)),
        d.createElement(
          "div",
          { className: "flex items-center gap-5" },
          o ? d.createElement(
            d.Fragment,
            null,
            d.createElement("span", { className: "text-sm text-gray-600" }, o.username),
            d.createElement("button", { onClick: l, className: "text-sm text-gray-400 hover:text-gray-600" }, R("logout"))
          ) : d.createElement(
            d.Fragment,
            null,
            d.createElement(P, { to: "/login", className: "text-sm text-gray-600 hover:text-gray-900" }, R("sign in")),
            d.createElement(P, { to: "/register", className: "text-sm text-gray-600 hover:text-gray-900" }, R("register", e))
          ),
          d.createElement("a", { href: "/admin", className: "px-4 py-1.5 bg-gray-900 text-white text-xs rounded-full hover:bg-gray-700" }, R("admin", e))
        )
      ),
      d.createElement("button", { onClick: () => s(!r), className: "md:hidden p-2 text-gray-600", "aria-label": R("toggle menu", e), "aria-expanded": r, "aria-controls": "mobile-nav" }, r ? d.createElement(cn, { size: 20 }) : d.createElement(an, { size: 20 }))
    ),
    r && d.createElement(
      "div",
      { className: "md:hidden border-t border-gray-100 px-6 py-4 space-y-3" },
      d.createElement(P, { to: "/", className: "block text-sm text-gray-600" }, R("home", e)),
      t.filter((c) => !(c.url === "/" && (c.label.toLowerCase() === "home" || c.label === R("home", e)))).map((c) => d.createElement(P, { key: c.id, to: c.url, className: "block text-sm text-gray-600" }, c.label)),
      o ? d.createElement("button", { onClick: l, className: "block text-sm text-gray-400" }, R("logout")) : d.createElement(P, { to: "/login", className: "block text-sm text-gray-600" }, R("sign in")),
      d.createElement(P, { to: "/register", className: "block text-sm text-gray-600" }, R("register", e)),
      d.createElement("a", { href: "/admin", className: "block text-sm text-gray-900 font-medium" }, R("admin", e))
    )
  );
}
function Rs({ settings: e }) {
  const t = e.theme_footer_about || "";
  return d.createElement(
    "footer",
    { className: "bg-white border-t border-gray-100 mt-24" },
    d.createElement(
      "div",
      { className: "max-w-6xl mx-auto px-6 py-16" },
      (t || e.site_description) && d.createElement(
        "div",
        { className: "max-w-2xl mb-12" },
        d.createElement("h3", { className: "text-2xl font-semibold tracking-tight text-gray-900 mb-3" }, R("about", e)),
        d.createElement("p", { className: "text-gray-600 leading-relaxed" }, t || e.site_description)
      ),
      d.createElement(
        "div",
        { className: "grid grid-cols-2 md:grid-cols-4 gap-8 mb-12" },
        d.createElement(
          "div",
          null,
          d.createElement("p", { className: "text-sm font-medium text-gray-900 mb-3" }, R("navigate", e)),
          d.createElement(
            "ul",
            { className: "space-y-2" },
            d.createElement("li", null, d.createElement(P, { to: "/", className: "text-sm text-gray-500 hover:text-gray-900" }, R("home", e))),
            d.createElement("li", null, d.createElement(P, { to: "/search", className: "text-sm text-gray-500 hover:text-gray-900" }, R("search", e))),
            d.createElement("li", null, d.createElement("a", { href: "/api/feed/rss", className: "text-sm text-gray-500 hover:text-gray-900" }, R("rss feed", e)))
          )
        ),
        d.createElement(
          "div",
          null,
          d.createElement("p", { className: "text-sm font-medium text-gray-900 mb-3" }, R("pages", e)),
          d.createElement(
            "ul",
            { className: "space-y-2" },
            d.createElement("li", null, d.createElement(P, { to: "/page/about", className: "text-sm text-gray-500 hover:text-gray-900" }, R("about", e))),
            d.createElement("li", null, d.createElement(P, { to: "/archive/2026/8", className: "text-sm text-gray-500 hover:text-gray-900" }, R("archives", e)))
          )
        ),
        d.createElement(
          "div",
          null,
          d.createElement("p", { className: "text-sm font-medium text-gray-900 mb-3" }, R("categories", e)),
          d.createElement(
            "ul",
            { className: "space-y-2" },
            d.createElement("li", null, d.createElement(P, { to: "/category/technology", className: "text-sm text-gray-500 hover:text-gray-900" }, "Technology")),
            d.createElement("li", null, d.createElement(P, { to: "/category/uncategorized", className: "text-sm text-gray-500 hover:text-gray-900" }, "Uncategorized"))
          )
        ),
        d.createElement(
          "div",
          null,
          d.createElement("p", { className: "text-sm font-medium text-gray-900 mb-3" }, R("links", e)),
          d.createElement(
            "ul",
            { className: "space-y-2" },
            d.createElement("li", null, d.createElement("a", { href: "/admin", className: "text-sm text-gray-500 hover:text-gray-900" }, R("admin", e))),
            d.createElement("li", null, d.createElement(P, { to: "/register", className: "text-sm text-gray-500 hover:text-gray-900" }, R("register", e)))
          )
        )
      ),
      d.createElement("p", { className: "text-sm text-gray-400 border-t border-gray-100 pt-8" }, "© " + (/* @__PURE__ */ new Date()).getFullYear() + " " + (e.site_title || "Mortar") + " · " + R("powered by", e) + " Mortar")
    )
  );
}
function Os(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function Ss(e, t) {
  if (!e) return;
  const n = Os(t.cdn_url);
  return n && e.startsWith("/uploads/") ? n + e : e;
}
function _s(e) {
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
function As(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: a, catSlug: l, isTagPage: c } = e, p = (t.theme_show_hero || "1") !== "0", u = t.theme_hero_title || "";
  return d.createElement(
    "div",
    null,
    // Hero (TT4 style: big statement)
    p && !l && d.createElement(
      "section",
      { className: "py-20 md:py-28 text-center px-6" },
      d.createElement(
        "h1",
        { className: "text-4xl md:text-6xl font-bold tracking-tight text-gray-900 max-w-3xl mx-auto leading-tight" },
        u || t.site_title || "Welcome"
      ),
      t.site_description && d.createElement("p", { className: "text-lg text-gray-500 mt-6 max-w-2xl mx-auto" }, t.site_description)
    ),
    l && d.createElement(
      "div",
      { className: "py-14 text-center" },
      d.createElement("h1", { className: "text-3xl font-bold tracking-tight text-gray-900 capitalize" }, (c ? R("tag", t) + ": " : "") + (l || "").replace(/-/g, " "))
    ),
    // Posts: spacious grid (2 columns per TT4 default)
    d.createElement(
      "div",
      { className: "max-w-6xl mx-auto px-6 pb-24" },
      n.length === 0 ? a ? d.createElement("p", { className: "text-gray-500 text-center py-20" }, R("failed to load posts", t)) : d.createElement("p", { className: "text-gray-500 text-center py-20" }, R("no posts yet", t)) : d.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16" },
        n.map(
          (f) => {
            var b, x;
            return d.createElement(
              "article",
              { key: f.id, className: "flex flex-col" },
              f.featured && d.createElement(
                P,
                { to: "/post/" + f.slug },
                d.createElement("img", { src: Ss(f.featured, t), alt: f.title, className: "w-full aspect-[16/10] object-cover rounded-lg mb-5", loading: "lazy" })
              ),
              d.createElement(
                "div",
                { className: "flex items-center gap-3 text-xs text-gray-400 mb-2" },
                d.createElement("span", { className: "flex items-center gap-1" }, d.createElement(on, { size: 12 }), _s(f.publishedAt || f.createdAt)),
                d.createElement("span", { className: "flex items-center gap-1" }, d.createElement(ln, { size: 12 }), (b = f.author) == null ? void 0 : b.username),
                ((x = f.categories) == null ? void 0 : x[0]) && d.createElement("span", { className: "text-gray-300" }, "/", f.categories[0].name)
              ),
              d.createElement(
                P,
                { to: "/post/" + f.slug },
                d.createElement("h2", { className: "text-2xl font-semibold tracking-tight text-gray-900 hover:text-gray-600 mb-2" }, f.title)
              ),
              f.excerpt && d.createElement("p", { className: "text-gray-500 text-sm leading-relaxed flex-1" }, f.excerpt),
              d.createElement(
                P,
                { to: "/post/" + f.slug, className: "inline-flex items-center gap-1 mt-3 text-sm font-medium text-gray-900 border-b border-gray-900 pb-0.5 w-fit hover:text-gray-600" },
                R("read more", t),
                d.createElement("span", null, "→")
              )
            );
          }
        )
      ),
      r > parseInt(t.posts_per_page || "10") && d.createElement(
        "div",
        { className: "flex items-center justify-center gap-4 pt-16" },
        d.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-5 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40" }, "← " + R("previous", t)),
        d.createElement("span", { className: "text-sm text-gray-400" }, R("page", t) + " " + s + " " + R("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
        d.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-5 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40" }, R("next", t) + " →")
      )
    )
  );
}
const Xs = { name: "twentytwentyfour", typography: { cap: 2, max: 24 }, Header: xs, Footer: Rs, HomeLayout: As };
export {
  Xs as default
};
