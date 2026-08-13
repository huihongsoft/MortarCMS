import g, { forwardRef as Ot, createElement as Me, useState as Le, useEffect as tn } from "react";
import { Link as I } from "react-router-dom";
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
const sn = Ot(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: i,
    ...c
  }, l) => Me(
    "svg",
    {
      ref: l,
      ...rn,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: _t("lucide", s),
      ...c
    },
    [
      ...i.map(([f, u]) => Me(f, u)),
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
  const n = Ot(
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
const cn = _e("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ln = _e("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function At(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: un } = Object.prototype, { getPrototypeOf: ne } = Object, { iterator: ue, toStringTag: Tt } = Symbol, xe = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), le = (e, t) => {
  let n = e;
  const r = [];
  for (; n != null && n !== Object.prototype; ) {
    if (r.indexOf(n) !== -1)
      return !1;
    if (r.push(n), xe(n, t))
      return !0;
    n = ne(n);
  }
  return !1;
}, fn = (e, t) => e != null && le(e, t) ? e[t] : void 0, Ve = /* @__PURE__ */ ((e) => (t) => {
  const n = un.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), j = (e) => (e = e.toLowerCase(), (t) => Ve(t) === e), Ae = (e) => (t) => typeof t === e, { isArray: Z } = Array, Q = Ae("undefined");
function re(e) {
  return e !== null && !Q(e) && e.constructor !== null && !Q(e.constructor) && U(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Nt = j("ArrayBuffer");
function dn(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Nt(e.buffer), t;
}
const pn = Ae("string"), U = Ae("function"), Pt = Ae("number"), se = (e) => e !== null && typeof e == "object", hn = (e) => e === !0 || e === !1, we = (e) => {
  if (!se(e))
    return !1;
  const t = ne(e);
  return (t === null || t === Object.prototype || ne(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !le(e, Tt) && !le(e, ue);
}, mn = (e) => {
  if (!se(e) || re(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, yn = j("Date"), gn = j("File"), wn = (e) => !!(e && typeof e.uri < "u"), bn = (e) => e && typeof e.getParts < "u", En = j("Blob"), Rn = j("FileList"), xn = j("Set"), Sn = (e) => se(e) && U(e.pipe);
function On() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const ot = On(), it = typeof ot.FormData < "u" ? ot.FormData : void 0, _n = (e) => {
  if (!e) return !1;
  if (it && e instanceof it) return !0;
  const t = ne(e);
  if (!t || t === Object.prototype || !U(e.append)) return !1;
  const n = Ve(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && U(e.toString) && e.toString() === "[object FormData]";
}, An = j("URLSearchParams"), [Tn, Nn, Pn, Cn] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(j), kn = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
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
    const o = n ? Object.getOwnPropertyNames(e) : Object.keys(e), i = o.length;
    let c;
    for (r = 0; r < i; r++)
      c = o[r], t.call(null, e[c], c, e);
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
const X = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, kt = (e) => !Q(e) && e !== X;
function qe(...e) {
  const { caseless: t, skipUndefined: n } = kt(this) && this || {}, r = {}, s = (o, i) => {
    if (i === "__proto__" || i === "constructor" || i === "prototype")
      return;
    const c = t && typeof i == "string" && Ct(r, i) || i, l = xe(r, c) ? r[c] : void 0;
    we(l) && we(o) ? r[c] = qe(l, o) : we(o) ? r[c] = qe({}, o) : Z(o) ? r[c] = o.slice() : (!n || !Q(o)) && (r[c] = o);
  };
  for (let o = 0, i = e.length; o < i; o++) {
    const c = e[o];
    if (!c || re(c) || (fe(c, s), typeof c != "object" || Z(c)))
      continue;
    const l = Object.getOwnPropertySymbols(c);
    for (let f = 0; f < l.length; f++) {
      const u = l[f];
      zn.call(c, u) && s(c[u], u);
    }
  }
  return r;
}
const Dn = (e, t, n, { allOwnKeys: r } = {}) => (fe(
  t,
  (s, o) => {
    n && U(s) ? Object.defineProperty(e, o, {
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
  let s, o, i;
  const c = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0; )
      i = s[o], (!r || r(i, e, t)) && !c[i] && (t[i] = e[i], c[i] = !0);
    e = n !== !1 && ne(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, Bn = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, jn = (e) => {
  if (!e) return null;
  if (Z(e)) return e;
  let t = e.length;
  if (!Pt(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, In = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && ne(Uint8Array)), vn = (e, t) => {
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
}), { propertyIsEnumerable: zn } = Object.prototype, $n = j("RegExp"), Dt = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  fe(n, (s, o) => {
    let i;
    (i = t(s, o, e)) !== !1 && (r[o] = i || s);
  }), Object.defineProperties(e, r);
}, Vn = (e) => {
  Dt(e, (t, n) => {
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
}, Wn = (e, t) => {
  const n = {}, r = (s) => {
    s.forEach((o) => {
      n[o] = !0;
    });
  };
  return Z(e) ? r(e) : r(String(e).split(t)), n;
}, Jn = () => {
}, Kn = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Xn(e) {
  return !!(e && U(e.append) && e[Tt] === "FormData" && e[ue]);
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
        if (xn(r)) {
          s = [];
          for (const o of r) {
            const i = n(o);
            !Q(i) && s.push(i);
          }
        } else
          s = Z(r) ? [] : {}, fe(r, (o, i) => {
            const c = n(o);
            !Q(c) && (s[i] = c);
          });
        return t.delete(r), s;
      }
    }
    return r;
  };
  return n(e);
}, Zn = j("AsyncFunction"), Qn = (e) => e && (se(e) || U(e)) && U(e.then) && U(e.catch), Lt = ((e, t) => e ? setImmediate : t ? ((n, r) => (X.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === X && o === n && r.length && r.shift()();
  },
  !1
), (s) => {
  r.push(s), X.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", U(X.postMessage)), Yn = typeof queueMicrotask < "u" ? queueMicrotask.bind(X) : typeof process < "u" && process.nextTick || Lt, Ut = (e) => e != null && U(e[ue]), er = (e) => e != null && le(e, ue) && Ut(e), a = {
  isArray: Z,
  isArrayBuffer: Nt,
  isBuffer: re,
  isFormData: _n,
  isArrayBufferView: dn,
  isString: pn,
  isNumber: Pt,
  isBoolean: hn,
  isObject: se,
  isPlainObject: we,
  isEmptyObject: mn,
  isReadableStream: Tn,
  isRequest: Nn,
  isResponse: Pn,
  isHeaders: Cn,
  isUndefined: Q,
  isDate: yn,
  isFile: gn,
  isReactNativeBlob: wn,
  isReactNative: bn,
  isBlob: En,
  isRegExp: $n,
  isFunction: U,
  isStream: Sn,
  isURLSearchParams: An,
  isTypedArray: In,
  isFileList: Rn,
  forEach: fe,
  merge: qe,
  extend: Dn,
  trim: kn,
  stripBOM: Ln,
  inherits: Un,
  toFlatObject: Fn,
  kindOf: Ve,
  kindOfTest: j,
  endsWith: Bn,
  toArray: jn,
  forEachEntry: vn,
  matchAll: Mn,
  isHTMLForm: qn,
  hasOwnProperty: xe,
  hasOwnProp: xe,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: le,
  getSafeProp: fn,
  reduceDescriptors: Dt,
  freezeMethods: Vn,
  toObjectSet: Wn,
  toCamelCase: Hn,
  noop: Jn,
  toFiniteNumber: Kn,
  findKey: Ct,
  global: X,
  isContextDefined: kt,
  isSpecCompliantForm: Xn,
  toJSONObject: Gn,
  isAsyncFn: Zn,
  isThenable: Qn,
  setImmediate: Lt,
  asap: Yn,
  isIterable: Ut,
  isSafeIterable: er
}, tr = a.toObjectSet([
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
`).forEach(function(i) {
    s = i.indexOf(":"), n = i.substring(0, s).trim().toLowerCase(), r = i.substring(s + 1).trim();
    const c = a.hasOwnProp(t, n);
    !n || c && a.hasOwnProp(tr, n) || (n === "set-cookie" ? c ? t[n].push(r) : t[n] = [r] : t[n] = c ? t[n] + ", " + r : r);
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
function We(e, t) {
  return a.isArray(e) ? e.map((n) => We(n, t)) : rr(String(e).replace(t, ""));
}
const ir = (e) => We(e, sr), ar = (e) => We(e, or);
function Ft(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return a.forEach(e.toJSON(), (n, r) => {
    t[r] = ar(n);
  }), t;
}
const at = Symbol("internals");
function ce(e) {
  return e && String(e).trim().toLowerCase();
}
function be(e) {
  return e === !1 || e == null ? e : a.isArray(e) ? e.map(be) : ir(String(e));
}
function cr(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const lr = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
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
  function i(c) {
    const l = Ue(n.slice(r, c)), f = l.indexOf("=");
    if (f < 1)
      return;
    const u = Ue(l.slice(0, f));
    if (!lr.test(u))
      return;
    const p = u.toLowerCase();
    if (p === "__proto__" || p === "constructor" || p === "prototype")
      return;
    const w = Ue(l.slice(f + 1));
    t[p] = ur(w);
  }
  for (let c = 0; c < n.length; c++) {
    const l = n.charCodeAt(c);
    s ? o ? o = !1 : l === 92 ? o = !0 : l === 34 && (s = !1) : l === 34 ? s = !0 : (l === 44 || l === 59) && (i(c), r = c + 1);
  }
  return i(n.length), t;
}
const dr = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Fe(e, t, n, r, s) {
  if (a.isFunction(r))
    return r.call(this, t, n);
  if (s && (t = n), !!a.isString(t)) {
    if (a.isString(r))
      return t.indexOf(r) !== -1;
    if (a.isRegExp(r))
      return r.test(t);
  }
}
function pr(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function hr(e, t) {
  const n = a.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(s, o, i) {
        return this[r].call(this, t, s, o, i);
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
    function o(c, l, f) {
      const u = ce(l);
      if (!u)
        return;
      const p = a.findKey(s, u);
      (!p || s[p] === void 0 || f === !0 || f === void 0 && s[p] !== !1) && (s[p || l] = be(c));
    }
    const i = (c, l) => a.forEach(c, (f, u) => o(f, u, l));
    if (a.isPlainObject(t) || t instanceof this.constructor)
      i(t, n);
    else if (a.isString(t) && (t = t.trim()) && !dr(t))
      i(nr(t), n);
    else if (a.isObject(t) && a.isSafeIterable(t)) {
      let c = /* @__PURE__ */ Object.create(null), l, f;
      for (const u of t) {
        if (!a.isArray(u))
          throw new TypeError("Object iterator must return a key-value pair");
        f = u[0], a.hasOwnProp(c, f) ? (l = c[f], c[f] = a.isArray(l) ? [...l, u[1]] : [l, u[1]]) : c[f] = u[1];
      }
      i(c, n);
    } else
      t != null && o(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = ce(t), t) {
      const r = a.findKey(this, t);
      if (r) {
        const s = this[r];
        if (!n)
          return s;
        if (n === !0)
          return cr(s);
        if (a.isFunction(n))
          return n.call(this, s, r);
        if (a.isRegExp(n))
          return n.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = ce(t), t) {
      const r = a.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || Fe(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function o(i) {
      if (i = ce(i), i) {
        const c = a.findKey(r, i);
        c && (!n || Fe(r, r[c], c, n)) && (delete r[c], s = !0);
      }
    }
    return a.isArray(t) ? t.forEach(o) : o(t), s;
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
    return a.forEach(this, (s, o) => {
      const i = a.findKey(r, o);
      if (i) {
        n[i] = be(s), delete n[o];
        return;
      }
      const c = t ? pr(o) : String(o).trim();
      c !== o && delete n[o], n[c] = be(s), r[c] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = /* @__PURE__ */ Object.create(null);
    return a.forEach(this, (r, s) => {
      r != null && r !== !1 && (n[s] = t && a.isArray(r) ? r.join(", ") : r);
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
    return a.isArray(t) ? t : t == null || t === !1 ? [] : [t];
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
    const r = (this[at] = this[at] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(i) {
      const c = ce(i);
      r[c] || (hr(s, i), r[c] = !0);
    }
    return a.isArray(t) ? t.forEach(o) : o(t), this;
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
a.reduceDescriptors(L.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    }
  };
});
a.freezeMethods(L);
const Se = "[REDACTED ****]";
function mr(e) {
  if (a.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (a.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function yr(e, t) {
  const n = new Set(t.map((o) => String(o).toLowerCase())), r = [], s = (o) => {
    if (o === null || typeof o != "object" || a.isBuffer(o)) return o;
    if (r.indexOf(o) !== -1) return;
    o instanceof L && (o = o.toJSON()), r.push(o);
    let i;
    if (a.isArray(o))
      i = [], o.forEach((c, l) => {
        const f = s(c);
        a.isUndefined(f) || (i[l] = f);
      });
    else {
      if (!a.isPlainObject(o) && mr(o))
        return r.pop(), o;
      i = /* @__PURE__ */ Object.create(null);
      for (const [c, l] of Object.entries(o)) {
        const f = n.has(c.toLowerCase()) ? Se : s(l);
        a.isUndefined(f) || (i[c] = f);
      }
    }
    return r.pop(), i;
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
function gr(e) {
  return e.errors.map((n) => {
    try {
      return n && n.message ? ct(n.message) : ct(n);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let h = class Bt extends Error {
  static from(t, n, r, s, o, i) {
    let c = t.message;
    !c && a.isArray(t.errors) && t.errors.length && (c = gr(t));
    const l = new Bt(c, n || t.code, r, s, o);
    return Object.defineProperty(l, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), l.name = t.name, t.status != null && l.status == null && (l.status = t.status), i && Object.assign(l, i), l;
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
    const t = this.config, n = t && a.hasOwnProp(t, "redact") ? t.redact : void 0, r = a.isArray(n) && n.length > 0 ? yr(t, n) : a.toJSONObject(t);
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
const wr = null, jt = 100;
function He(e) {
  return a.isPlainObject(e) || a.isArray(e);
}
function It(e) {
  return a.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Be(e, t, n) {
  return e ? e.concat(t).map(function(s, o) {
    return s = It(s), !n && o ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function br(e) {
  return a.isArray(e) && !e.some(He);
}
const Er = a.toFlatObject(a, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function Te(e, t, n) {
  if (!a.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData(), n = a.toFlatObject(
    n,
    {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    },
    !1,
    function(y, b) {
      return !a.isUndefined(b[y]);
    }
  );
  const r = n.metaTokens, s = n.visitor || x, o = n.dots, i = n.indexes, c = n.Blob || typeof Blob < "u" && Blob, l = n.maxDepth === void 0 ? jt : n.maxDepth, f = c && a.isSpecCompliantForm(t), u = [];
  if (!a.isFunction(s))
    throw new TypeError("visitor must be a function");
  function p(d) {
    if (d === null) return "";
    if (a.isDate(d))
      return d.toISOString();
    if (a.isBoolean(d))
      return d.toString();
    if (!f && a.isBlob(d))
      throw new h("Blob is not supported. Use a Buffer instead.");
    if (a.isArrayBuffer(d) || a.isTypedArray(d)) {
      if (f && typeof c == "function")
        return new c([d]);
      throw new h("Blob is not supported. Use a Buffer instead.", h.ERR_NOT_SUPPORT);
    }
    return d;
  }
  function w(d) {
    if (d > l)
      throw new h(
        "Object is too deeply nested (" + d + " levels). Max depth: " + l,
        h.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function R(d, y) {
    if (l === 1 / 0)
      return JSON.stringify(d);
    const b = [];
    return JSON.stringify(d, function(k, A) {
      if (!a.isObject(A))
        return A;
      for (; b.length && b[b.length - 1] !== this; )
        b.pop();
      return b.push(A), w(y + b.length - 1), A;
    });
  }
  function x(d, y, b) {
    let S = d;
    if (a.isReactNative(t) && a.isReactNativeBlob(d))
      return t.append(Be(b, y, o), p(d)), !1;
    if (d && !b && typeof d == "object") {
      if (a.endsWith(y, "{}"))
        y = r ? y : y.slice(0, -2), d = R(d, 1);
      else if (a.isArray(d) && br(d) || (a.isFileList(d) || a.endsWith(y, "[]")) && (S = a.toArray(d)))
        return y = It(y), S.forEach(function(A, H) {
          !(a.isUndefined(A) || A === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            i === !0 ? Be([y], H, o) : i === null ? y : y + "[]",
            p(A)
          );
        }), !1;
    }
    return He(d) ? !0 : (t.append(Be(b, y, o), p(d)), !1);
  }
  const O = Object.assign(Er, {
    defaultVisitor: x,
    convertValue: p,
    isVisitable: He
  });
  function m(d, y, b = 0) {
    if (!a.isUndefined(d)) {
      if (w(b), u.indexOf(d) !== -1)
        throw new Error("Circular reference detected in " + y.join("."));
      u.push(d), a.forEach(d, function(k, A) {
        (!(a.isUndefined(k) || k === null) && s.call(t, k, a.isString(A) ? A.trim() : A, y, O)) === !0 && m(k, y ? y.concat(A) : [A], b + 1);
      }), u.pop();
    }
  }
  if (!a.isObject(e))
    throw new TypeError("data must be an object");
  return m(e), t;
}
function lt(e) {
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
  this._pairs = [], e && Te(e, this, t);
}
const vt = Je.prototype;
vt.append = function(t, n) {
  this._pairs.push([t, n]);
};
vt.toString = function(t) {
  const n = t ? (r) => t.call(this, r, lt) : lt;
  return this._pairs.map(function(s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function Rr(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function Mt(e, t, n) {
  if (!t)
    return e;
  e = e || "";
  const r = a.isFunction(n) ? {
    serialize: n
  } : n, s = a.getSafeProp(r, "encode") || Rr, o = a.getSafeProp(r, "serialize");
  let i;
  if (o ? i = o(t, r) : i = a.isURLSearchParams(t) ? t.toString() : new Je(t, r).toString(s), i) {
    const c = e.indexOf("#");
    c !== -1 && (e = e.slice(0, c)), e += (e.indexOf("?") === -1 ? "?" : "&") + i;
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
    a.forEach(this.handlers, function(r) {
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
}, xr = typeof URLSearchParams < "u" ? URLSearchParams : Je, Sr = typeof FormData < "u" ? FormData : null, Or = typeof Blob < "u" ? Blob : null, _r = {
  isBrowser: !0,
  classes: {
    URLSearchParams: xr,
    FormData: Sr,
    Blob: Or
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Xe = typeof window < "u" && typeof document < "u", ze = typeof navigator == "object" && navigator || void 0, Ar = Xe && (!ze || ["ReactNative", "NativeScript", "NS"].indexOf(ze.product) < 0), Tr = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Nr = Xe && window.location.href || "http://localhost", Pr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Xe,
  hasStandardBrowserEnv: Ar,
  hasStandardBrowserWebWorkerEnv: Tr,
  navigator: ze,
  origin: Nr
}, Symbol.toStringTag, { value: "Module" })), C = {
  ...Pr,
  ..._r
};
function Cr(e, t) {
  return Te(e, new C.classes.URLSearchParams(), {
    visitor: function(n, r, s, o) {
      return C.isNode && a.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const ft = jt;
function qt(e) {
  if (e > ft)
    throw new h(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + ft,
      h.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function kr(e) {
  const t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g;
  let r;
  for (; (r = n.exec(e)) !== null; )
    qt(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
  return t;
}
function Dr(e) {
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
    let i = n[o++];
    if (i === "__proto__") return !0;
    const c = Number.isFinite(+i), l = o >= n.length;
    return i = !i && a.isArray(s) ? s.length : i, l ? (a.hasOwnProp(s, i) ? s[i] = a.isArray(s[i]) ? s[i].concat(r) : [s[i], r] : s[i] = r, !c) : ((!a.hasOwnProp(s, i) || !a.isObject(s[i])) && (s[i] = []), t(n, r, s[i], o) && a.isArray(s[i]) && (s[i] = Dr(s[i])), !c);
  }
  if (a.isFormData(e) && a.isFunction(e.entries)) {
    const n = {};
    return a.forEachEntry(e, (r, s) => {
      t(kr(r), s, n, 0);
    }), n;
  }
  return null;
}
const te = (e, t) => e != null && a.hasOwnProp(e, t) ? e[t] : void 0;
function Lr(e, t, n) {
  if (a.isString(e))
    try {
      return (t || JSON.parse)(e), a.trim(e);
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
      const r = n.getContentType() || "", s = r.indexOf("application/json") > -1, o = a.isObject(t);
      if (o && a.isHTMLForm(t) && (t = new FormData(t)), a.isFormData(t))
        return s ? JSON.stringify(Ht(t)) : t;
      if (a.isArrayBuffer(t) || a.isBuffer(t) || a.isStream(t) || a.isFile(t) || a.isBlob(t) || a.isReadableStream(t))
        return t;
      if (a.isArrayBufferView(t))
        return t.buffer;
      if (a.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let c;
      if (o) {
        const l = te(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return Cr(t, l).toString();
        if ((c = a.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const f = te(this, "env"), u = f && f.FormData;
          return Te(
            c ? { "files[]": t } : t,
            u && new u(),
            l
          );
        }
      }
      return o || s ? (n.setContentType("application/json", !1), Lr(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const n = te(this, "transitional") || de.transitional, r = n && n.forcedJSONParsing, s = te(this, "responseType"), o = s === "json";
      if (a.isResponse(t) || a.isReadableStream(t))
        return t;
      if (t && a.isString(t) && (r && !s || o)) {
        const c = !(n && n.silentJSONParsing) && o;
        try {
          return JSON.parse(t, te(this, "parseReviver"));
        } catch (l) {
          if (c)
            throw l.name === "SyntaxError" ? h.from(l, h.ERR_BAD_RESPONSE, this, null, te(this, "response")) : l;
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
a.forEach(["delete", "get", "head", "post", "put", "patch", "query"], (e) => {
  de.headers[e] = {};
});
function je(e, t) {
  const n = this || de, r = t || n, s = L.from(r.headers);
  let o = r.data;
  return a.forEach(e, function(c) {
    o = c.call(n, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function zt(e) {
  return !!(e && e.__CANCEL__);
}
let pe = class extends h {
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
function $t(e, t, n) {
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
  let s = 0, o = 0, i;
  return t = t !== void 0 ? t : 1e3, function(l) {
    const f = Date.now(), u = r[o];
    i || (i = f), n[s] = l, r[s] = f;
    let p = o, w = 0;
    for (; p !== s; )
      w += n[p++], p = p % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), f - i < t)
      return;
    const R = u && f - u;
    return R ? Math.round(w * 1e3 / R) : void 0;
  };
}
function Br(e, t) {
  let n = 0, r = 1e3 / t, s, o;
  const i = (f, u = Date.now()) => {
    n = u, s = null, o && (clearTimeout(o), o = null), e(...f);
  };
  return [(...f) => {
    const u = Date.now(), p = u - n;
    p >= r ? i(f, u) : (s = f, o || (o = setTimeout(() => {
      o = null, i(s);
    }, r - p)));
  }, () => s && i(s)];
}
const Oe = (e, t, n = 3) => {
  let r = 0;
  const s = Fr(50, 250);
  return Br((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const i = o.loaded, c = o.lengthComputable ? o.total : void 0, l = Math.max(0, c != null ? Math.min(i, c) : i), f = Math.max(0, l - r), u = s(f);
    r = Math.max(r, l);
    const p = {
      loaded: l,
      total: c,
      progress: c ? l / c : void 0,
      bytes: f,
      rate: u || void 0,
      estimated: u && c ? (c - l) / u : void 0,
      event: o,
      lengthComputable: c != null,
      [t ? "download" : "upload"]: !0
    };
    e(p);
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
}, pt = (e, t = a.asap) => (...n) => t(() => e(...n)), jr = C.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, C.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(C.origin),
  C.navigator && /(msie|trident)/i.test(C.navigator.userAgent)
) : () => !0, Ir = C.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, n, r, s, o, i) {
      if (typeof document > "u") return;
      const c = [`${e}=${encodeURIComponent(t)}`];
      a.isNumber(n) && c.push(`expires=${new Date(n).toUTCString()}`), a.isString(r) && c.push(`path=${r}`), a.isString(s) && c.push(`domain=${s}`), o === !0 && c.push("secure"), a.isString(i) && c.push(`SameSite=${i}`), document.cookie = c.join("; ");
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
function vr(e) {
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
function zr(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function $r(e) {
  return zr(e).replace(Hr, "");
}
function Vr(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, n, r = "") => `${n}${r}${Se}`);
}
function Wr(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${Se}@`), n = t.indexOf("#"), s = (n === -1 ? t : t.slice(0, n)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${Se}`
  );
  return n === -1 ? s : `${s}#${Vr(t.slice(n + 1))}`;
}
function ht(e, t) {
  if (typeof e == "string") {
    const n = $r(e);
    if (qr.test(n))
      throw new h(
        `Invalid URL ${JSON.stringify(Wr(n))}: missing "//" after protocol`,
        h.ERR_INVALID_URL,
        t
      );
  }
}
function Vt(e, t, n, r) {
  ht(t, r);
  let s = !vr(t);
  return e && (s || n === !1) ? (ht(e, r), Mr(e, t)) : t;
}
const mt = (e) => e instanceof L ? { ...e } : e, Jr = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
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
  function r(u, p, w, R) {
    return a.isPlainObject(u) && a.isPlainObject(p) ? a.merge.call({ caseless: R }, u, p) : a.isPlainObject(p) ? a.merge({}, p) : a.isArray(p) ? p.slice() : p;
  }
  function s(u, p, w, R) {
    if (a.isUndefined(p)) {
      if (!a.isUndefined(u))
        return r(void 0, u, w, R);
    } else return r(u, p, w, R);
  }
  function o(u, p) {
    if (!a.isUndefined(p))
      return r(void 0, p);
  }
  function i(u, p) {
    if (a.isUndefined(p)) {
      if (!a.isUndefined(u))
        return r(void 0, u);
    } else return r(void 0, p);
  }
  function c(u) {
    const p = a.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!a.isUndefined(p))
      if (a.isPlainObject(p)) {
        if (a.hasOwnProp(p, u))
          return p[u];
      } else
        return;
    const w = a.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (a.isPlainObject(w) && a.hasOwnProp(w, u))
      return w[u];
  }
  function l(u, p, w) {
    if (a.hasOwnProp(t, w))
      return r(u, p);
    if (a.hasOwnProp(e, w))
      return r(void 0, u);
  }
  const f = {
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
    validateStatus: l,
    headers: (u, p, w) => s(mt(u), mt(p), w, !0)
  };
  return a.forEach(Jr({ ...e, ...t }), function(p) {
    if (p === "__proto__" || p === "constructor" || p === "prototype") return;
    const w = a.hasOwnProp(f, p) ? f[p] : s, R = a.hasOwnProp(e, p) ? e[p] : void 0, x = a.hasOwnProp(t, p) ? t[p] : void 0, O = w(R, x, p);
    a.isUndefined(O) && w !== l || (n[p] = O);
  }), a.hasOwnProp(t, "validateStatus") && a.isUndefined(t.validateStatus) && c("validateStatusUndefinedResolves") === !1 && (a.hasOwnProp(e, "validateStatus") ? n.validateStatus = r(void 0, e.validateStatus) : delete n.validateStatus), n;
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
function Wt(e) {
  const t = Y({}, e), n = (w) => a.hasOwnProp(t, w) ? t[w] : void 0, r = n("data");
  let s = n("withXSRFToken");
  const o = n("xsrfHeaderName"), i = n("xsrfCookieName");
  let c = n("headers");
  const l = n("auth"), f = n("baseURL"), u = n("allowAbsoluteUrls"), p = n("url");
  if (t.headers = c = L.from(c), t.url = Mt(
    Vt(f, p, u, t),
    n("params"),
    n("paramsSerializer")
  ), l) {
    const w = a.getSafeProp(l, "username") || "", R = a.getSafeProp(l, "password") || "";
    try {
      c.set(
        "Authorization",
        "Basic " + btoa(w + ":" + (R ? Gr(R) : ""))
      );
    } catch (x) {
      throw h.from(x, h.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (a.isFormData(r) && (C.hasStandardBrowserEnv || C.hasStandardBrowserWebWorkerEnv || a.isReactNative(r) ? c.setContentType(void 0) : a.isFunction(r.getHeaders) && Xr(c, r.getHeaders(), n("formDataHeaderPolicy"))), C.hasStandardBrowserEnv && (a.isFunction(s) && (s = s(t)), s === !0 || s == null && jr(t.url))) {
    const R = o && i && Ir.read(i);
    R && c.set(o, R);
  }
  return t;
}
const Zr = typeof XMLHttpRequest < "u", Qr = Zr && function(e) {
  return new Promise(function(n, r) {
    const s = Wt(e);
    let o = s.data;
    const i = L.from(s.headers).normalize();
    let { responseType: c, onUploadProgress: l, onDownloadProgress: f } = s, u, p, w, R, x;
    function O() {
      R && R(), x && x(), s.cancelToken && s.cancelToken.unsubscribe(u), s.signal && s.signal.removeEventListener("abort", u);
    }
    let m = new XMLHttpRequest();
    m.open(s.method.toUpperCase(), s.url, !0), m.timeout = s.timeout;
    function d() {
      if (!m)
        return;
      const b = L.from(
        "getAllResponseHeaders" in m && m.getAllResponseHeaders()
      ), k = {
        data: !c || c === "text" || c === "json" ? m.responseText : m.response,
        status: m.status,
        statusText: m.statusText,
        headers: b,
        config: e,
        request: m
      };
      $t(
        function(H) {
          n(H), O();
        },
        function(H) {
          r(H), O();
        },
        k
      ), m = null;
    }
    "onloadend" in m ? m.onloadend = d : m.onreadystatechange = function() {
      !m || m.readyState !== 4 || m.status === 0 && !(m.responseURL && m.responseURL.startsWith("file:")) || setTimeout(d);
    }, m.onabort = function() {
      m && (r(new h("Request aborted", h.ECONNABORTED, e, m)), O(), m = null);
    }, m.onerror = function(S) {
      const k = S && S.message ? S.message : "Network Error", A = new h(k, h.ERR_NETWORK, e, m);
      A.event = S || null, r(A), O(), m = null;
    }, m.ontimeout = function() {
      let S = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const k = s.transitional || Ke;
      s.timeoutErrorMessage && (S = s.timeoutErrorMessage), r(
        new h(
          S,
          k.clarifyTimeoutError ? h.ETIMEDOUT : h.ECONNABORTED,
          e,
          m
        )
      ), O(), m = null;
    }, o === void 0 && i.setContentType(null), "setRequestHeader" in m && a.forEach(Ft(i), function(S, k) {
      m.setRequestHeader(k, S);
    }), a.isUndefined(s.withCredentials) || (m.withCredentials = !!s.withCredentials), c && c !== "json" && (m.responseType = s.responseType), f && ([w, x] = Oe(f, !0), m.addEventListener("progress", w)), l && m.upload && ([p, R] = Oe(l), m.upload.addEventListener("progress", p), m.upload.addEventListener("loadend", R)), (s.cancelToken || s.signal) && (u = (b) => {
      m && (r(!b || b.type ? new pe(null, e, m) : b), m.abort(), O(), m = null);
    }, s.cancelToken && s.cancelToken.subscribe(u), s.signal && (s.signal.aborted ? u() : s.signal.addEventListener("abort", u)));
    const y = Ur(s.url);
    if (y && !C.protocols.includes(y)) {
      r(
        new h(
          "Unsupported protocol " + y + ":",
          h.ERR_BAD_REQUEST,
          e
        )
      ), O();
      return;
    }
    m.send(o || null);
  });
}, Yr = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const s = function(l) {
    if (!r) {
      r = !0, i();
      const f = l instanceof Error ? l : this.reason;
      n.abort(
        f instanceof h ? f : new pe(f instanceof Error ? f.message : f)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, s(new h(`timeout of ${t}ms exceeded`, h.ETIMEDOUT));
  }, t);
  const i = () => {
    e && (o && clearTimeout(o), o = null, e.forEach((l) => {
      l.unsubscribe ? l.unsubscribe(s) : l.removeEventListener("abort", s);
    }), e = null);
  };
  e.forEach((l) => {
    if (!r) {
      if (l.aborted) {
        s.call(l);
        return;
      }
      l.addEventListener("abort", s, { once: !0 });
    }
  });
  const { signal: c } = n;
  return c.unsubscribe = () => a.asap(i), c;
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
  let o = 0, i, c = (l) => {
    i || (i = !0, r && r(l));
  };
  return new ReadableStream(
    {
      async pull(l) {
        try {
          const { done: f, value: u } = await s.next();
          if (f) {
            c(), l.close();
            return;
          }
          let p = u.byteLength;
          if (n) {
            let w = o += p;
            n(w);
          }
          l.enqueue(new Uint8Array(u));
        } catch (f) {
          throw c(f), f;
        }
      },
      cancel(l) {
        return c(l), s.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, gt = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Jt = (e, t, n) => t + 2 < n && gt(e.charCodeAt(t + 1)) && gt(e.charCodeAt(t + 2)), wt = (e) => e <= 57 ? e - 48 : (e & 223) - 55, rs = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, ss = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, os = (e) => {
  const t = Math.floor(e / 4), n = e % 4;
  return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, is = (e) => {
  const t = e.length;
  let n = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, as = (e) => {
  const t = e.length;
  let n = 0, r = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let i = e.charCodeAt(o);
    if (i === 37 && Jt(e, o, t) && (i = wt(e.charCodeAt(o + 1)) * 16 + wt(e.charCodeAt(o + 2)), o += 2), !ss(i)) {
      if (i === 61) {
        r++;
        continue;
      }
      if (!rs(i) || r > 0) {
        s = !0;
        continue;
      }
      n++;
    }
  }
  return s || r > 2 || r > 0 && (n + r) % 4 !== 0 || n % 4 === 1 ? is(e) : os(n);
}, cs = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const n = e.indexOf(",");
  if (n < 0) return 0;
  const r = e.slice(5, n), s = e.slice(n + 1);
  if (/;base64/i.test(r))
    return t(s);
  let i = 0;
  for (let c = 0, l = s.length; c < l; c++) {
    const f = s.charCodeAt(c);
    if (f === 37 && Jt(s, c, l))
      i += 1, c += 2;
    else if (f < 128)
      i += 1;
    else if (f < 2048)
      i += 2;
    else if (f >= 55296 && f <= 56319 && c + 1 < l) {
      const u = s.charCodeAt(c + 1);
      u >= 56320 && u <= 57343 ? (i += 4, c++) : i += 3;
    } else
      i += 3;
  }
  return i;
};
function ls(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return cs(
    t === -1 ? e : e.slice(0, t),
    as
  );
}
const Ge = "1.19.0", bt = 64 * 1024, { isFunction: ge } = a, us = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), Et = (e) => {
  if (!a.isString(e))
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
}, fs = (e) => {
  const t = e.indexOf("://");
  let n = e;
  return t !== -1 && (n = n.slice(t + 3)), n.includes("@") || n.includes(":");
}, ds = (e) => {
  const t = a.global !== void 0 && a.global !== null ? a.global : globalThis, { ReadableStream: n, TextEncoder: r } = t;
  e = a.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: s, Request: o, Response: i } = e, c = s ? ge(s) : typeof fetch == "function", l = ge(o), f = ge(i);
  if (!c)
    return !1;
  const u = c && ge(n), p = c && (typeof r == "function" ? /* @__PURE__ */ ((d) => (y) => d.encode(y))(new r()) : async (d) => new Uint8Array(await new o(d).arrayBuffer())), w = l && u && Rt(() => {
    let d = !1;
    const y = new o(C.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return d = !0, "half";
      }
    }), b = y.headers.has("Content-Type");
    return y.body != null && y.body.cancel(), d && !b;
  }), R = f && u && Rt(() => a.isReadableStream(new i("").body)), x = {
    stream: R && ((d) => d.body)
  };
  c && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((d) => {
    !x[d] && (x[d] = (y, b) => {
      let S = y && y[d];
      if (S)
        return S.call(y);
      throw new h(
        `Response type '${d}' is not supported`,
        h.ERR_NOT_SUPPORT,
        b
      );
    });
  });
  const O = async (d) => {
    if (d == null)
      return 0;
    if (a.isBlob(d))
      return d.size;
    if (a.isSpecCompliantForm(d))
      return (await new o(C.origin, {
        method: "POST",
        body: d
      }).arrayBuffer()).byteLength;
    if (a.isArrayBufferView(d) || a.isArrayBuffer(d))
      return d.byteLength;
    if (a.isURLSearchParams(d) && (d = d + ""), a.isString(d))
      return (await p(d)).byteLength;
  }, m = async (d, y) => {
    const b = a.toFiniteNumber(d.getContentLength());
    return b ?? O(y);
  };
  return async (d) => {
    let {
      url: y,
      method: b,
      data: S,
      signal: k,
      cancelToken: A,
      timeout: H,
      onDownloadProgress: Pe,
      onUploadProgress: Ce,
      responseType: z,
      headers: $,
      withCredentials: he = "same-origin",
      fetchOptions: Qe,
      maxContentLength: v,
      maxBodyLength: me
    } = Wt(d);
    const oe = a.isNumber(v) && v > -1, ke = a.isNumber(me) && me > -1, Qt = (_) => a.hasOwnProp(d, _) ? d[_] : void 0;
    let Ye = s || fetch;
    z = z ? (z + "").toLowerCase() : "text";
    let V = Yr(
      [k, A && A.toAbortSignal()],
      H
    ), P = null;
    const J = V && V.unsubscribe && (() => {
      V.unsubscribe();
    });
    let ee, ie = null;
    const et = () => new h(
      "Request body larger than maxBodyLength limit",
      h.ERR_BAD_REQUEST,
      d,
      P
    );
    try {
      let _;
      const B = Qt("auth");
      if (B) {
        const E = a.getSafeProp(B, "username") || "", F = a.getSafeProp(B, "password") || "";
        _ = {
          username: E,
          password: F
        };
      }
      if (fs(y)) {
        const E = new URL(y, C.origin);
        if (!_ && (E.username || E.password)) {
          const F = Et(E.username), W = Et(E.password);
          _ = {
            username: F,
            password: W
          };
        }
        (E.username || E.password) && (E.username = "", E.password = "", y = E.href);
      }
      if (_ && ($.delete("authorization"), $.set(
        "Authorization",
        "Basic " + btoa(us((_.username || "") + ":" + (_.password || "")))
      )), oe && typeof y == "string" && y.startsWith("data:") && ls(y) > v)
        throw new h(
          "maxContentLength size of " + v + " exceeded",
          h.ERR_BAD_RESPONSE,
          d,
          P
        );
      if (ke && b !== "get" && b !== "head") {
        const E = await O(S);
        if (typeof E == "number" && isFinite(E) && (ee = E, E > me))
          throw et();
      }
      const ye = ke && (a.isReadableStream(S) || a.isStream(S)), tt = (E, F, W) => yt(
        E,
        bt,
        (K) => {
          if (ke && K > me)
            throw ie = et();
          F && F(K);
        },
        W
      );
      if (w && b !== "get" && b !== "head" && (Ce || ye)) {
        if (ee = ee ?? await m($, S), ee !== 0 || ye) {
          let E = new o(y, {
            method: "POST",
            body: S,
            duplex: "half"
          }), F;
          if (a.isFormData(S) && (F = E.headers.get("content-type")) && $.setContentType(F), E.body) {
            const [W, K] = Ce && dt(
              ee,
              Oe(pt(Ce))
            ) || [];
            S = tt(E.body, W, K);
          }
        }
      } else if (ye && !l && u && b !== "get" && b !== "head")
        S = tt(S);
      else if (ye && l && !w && b !== "get" && b !== "head")
        throw new h(
          "Stream request bodies are not supported by the current fetch implementation",
          h.ERR_NOT_SUPPORT,
          d,
          P
        );
      a.isString(he) || (he = he ? "include" : "omit");
      const Yt = l && "credentials" in o.prototype;
      if (a.isFormData(S)) {
        const E = $.getContentType();
        E && /^multipart\/form-data/i.test(E) && !/boundary=/i.test(E) && $.delete("content-type");
      }
      $.set("User-Agent", "axios/" + Ge, !1);
      const nt = {
        ...Qe,
        signal: V,
        method: b.toUpperCase(),
        headers: Ft($.normalize()),
        body: S,
        duplex: "half",
        credentials: Yt ? he : void 0
      };
      P = l && new o(y, nt);
      let M = await (l ? Ye(P, Qe) : Ye(y, nt));
      const rt = L.from(M.headers);
      if (oe) {
        const E = a.toFiniteNumber(rt.getContentLength());
        if (E != null && E > v)
          throw new h(
            "maxContentLength size of " + v + " exceeded",
            h.ERR_BAD_RESPONSE,
            d,
            P
          );
      }
      const De = R && (z === "stream" || z === "response");
      if (R && M.body && (Pe || oe || De && J)) {
        const E = {};
        ["status", "statusText", "headers"].forEach((ae) => {
          E[ae] = M[ae];
        });
        const F = a.toFiniteNumber(rt.getContentLength()), [W, K] = Pe && dt(
          F,
          Oe(pt(Pe), !0)
        ) || [];
        let st = 0;
        const en = (ae) => {
          if (oe && (st = ae, st > v))
            throw new h(
              "maxContentLength size of " + v + " exceeded",
              h.ERR_BAD_RESPONSE,
              d,
              P
            );
          W && W(ae);
        };
        M = new i(
          yt(M.body, bt, en, () => {
            K && K(), J && J();
          }),
          E
        );
      }
      z = z || "text";
      let q = await x[a.findKey(x, z) || "text"](
        M,
        d
      );
      if (oe && !R && !De) {
        let E;
        if (q != null && (typeof q.byteLength == "number" ? E = q.byteLength : typeof q.size == "number" ? E = q.size : typeof q == "string" && (E = typeof r == "function" ? new r().encode(q).byteLength : q.length)), typeof E == "number" && E > v)
          throw new h(
            "maxContentLength size of " + v + " exceeded",
            h.ERR_BAD_RESPONSE,
            d,
            P
          );
      }
      return !De && J && J(), await new Promise((E, F) => {
        $t(E, F, {
          data: q,
          headers: L.from(M.headers),
          status: M.status,
          statusText: M.statusText,
          config: d,
          request: P
        });
      });
    } catch (_) {
      if (J && J(), V && V.aborted && V.reason instanceof h) {
        const B = V.reason;
        throw B.config = d, P && (B.request = P), _ !== B && Object.defineProperty(B, "cause", {
          __proto__: null,
          value: _,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), B;
      }
      if (ie)
        throw P && !ie.request && (ie.request = P), ie;
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
}, ps = /* @__PURE__ */ new Map(), Kt = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: s } = t, o = [r, s, n];
  let i = o.length, c = i, l, f, u = ps;
  for (; c--; )
    l = o[c], f = u.get(l), f === void 0 && u.set(l, f = c ? /* @__PURE__ */ new Map() : ds(t)), u = f;
  return f;
};
Kt();
const Ze = {
  http: wr,
  xhr: Qr,
  fetch: {
    get: Kt
  }
};
a.forEach(Ze, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const xt = (e) => `- ${e}`, hs = (e) => a.isFunction(e) || e === null || e === !1;
function ms(e, t) {
  e = a.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, s;
  const o = {};
  for (let i = 0; i < n; i++) {
    r = e[i];
    let c;
    if (s = r, !hs(r) && (s = Ze[(c = String(r)).toLowerCase()], s === void 0))
      throw new h(`Unknown adapter '${c}'`);
    if (s && (a.isFunction(s) || (s = s.get(t))))
      break;
    o[c || "#" + i] = s;
  }
  if (!s) {
    const i = Object.entries(o).map(
      ([l, f]) => `adapter ${l} ` + (f === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let c = n ? i.length > 1 ? `since :
` + i.map(xt).join(`
`) : " " + xt(i[0]) : "as no adapter specified";
    throw new h(
      "There is no suitable adapter to dispatch the request " + c,
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
  getAdapter: ms,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Ze
};
function Ie(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new pe(null, e);
}
function ve(e) {
  return Ie(e), e.headers = L.from(e.headers), e.data = je.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Xt.getAdapter(e.adapter || de.adapter, e)(e).then(
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
      if (!zt(r) && (Ie(e), r && r.response)) {
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
const Ne = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Ne[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const St = {};
Ne.transitional = function(t, n, r) {
  function s(o, i) {
    return "[Axios v" + Ge + "] Transitional option '" + o + "'" + i + (r ? ". " + r : "");
  }
  return (o, i, c) => {
    if (t === !1)
      throw new h(
        s(i, " has been removed" + (n ? " in " + n : "")),
        h.ERR_DEPRECATED
      );
    return n && !St[i] && (St[i] = !0, console.warn(
      s(
        i,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(o, i, c) : !0;
  };
};
Ne.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function ys(e, t, n) {
  if (typeof e != "object" || e === null)
    throw new h("options must be an object", h.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0; ) {
    const o = r[s], i = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (i) {
      const c = e[o], l = c === void 0 || i(c, o, e);
      if (l !== !0)
        throw new h(
          "option " + o + " must be " + l,
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
  validators: Ne
}, D = Ee.validators;
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
          const i = s.stack.indexOf(`
`);
          return i === -1 ? "" : s.stack.slice(i + 1);
        })();
        try {
          if (!r.stack)
            r.stack = o;
          else if (o) {
            const i = o.indexOf(`
`), c = i === -1 ? -1 : o.indexOf(`
`, i + 1), l = c === -1 ? "" : o.slice(c + 1);
            String(r.stack).endsWith(l) || (r.stack += `
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
        silentJSONParsing: D.transitional(D.boolean),
        forcedJSONParsing: D.transitional(D.boolean),
        clarifyTimeoutError: D.transitional(D.boolean),
        legacyInterceptorReqResOrdering: D.transitional(D.boolean),
        advertiseZstdAcceptEncoding: D.transitional(D.boolean),
        validateStatusUndefinedResolves: D.transitional(D.boolean)
      },
      !1
    ), s != null && (a.isFunction(s) ? n.paramsSerializer = {
      serialize: s
    } : Ee.assertOptions(
      s,
      {
        encode: D.function,
        serialize: D.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Ee.assertOptions(
      n,
      {
        baseUrl: D.spelling("baseURL"),
        withXsrfToken: D.spelling("withXSRFToken")
      },
      !0
    ), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let i = o && a.merge(o.common, o[n.method]);
    o && a.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (x) => {
      delete o[x];
    }), n.headers = L.concat(i, o);
    const c = [];
    let l = !0;
    this.interceptors.request.forEach(function(O) {
      if (typeof O.runWhen == "function" && O.runWhen(n) === !1)
        return;
      l = l && O.synchronous;
      const m = n.transitional || Ke;
      m && m.legacyInterceptorReqResOrdering ? c.unshift(O.fulfilled, O.rejected) : c.push(O.fulfilled, O.rejected);
    });
    const f = [];
    this.interceptors.response.forEach(function(O) {
      f.push(O.fulfilled, O.rejected);
    });
    let u, p = 0, w;
    if (!l) {
      const x = [ve.bind(this), void 0];
      for (x.unshift(...c), x.push(...f), w = x.length, u = Promise.resolve(n); p < w; )
        u = u.then(x[p++], x[p++]);
      return u;
    }
    w = c.length;
    let R = n;
    for (; p < w; ) {
      const x = c[p++], O = c[p++];
      try {
        R = x ? x(R) : R;
      } catch (m) {
        if (!O) {
          u = Promise.reject(m);
          break;
        }
        try {
          const d = O.call(this, m);
          a.isThenable(d) && (u = Promise.resolve(d).then(
            () => ve.call(this, R)
          ));
        } catch (d) {
          u = Promise.reject(d);
        }
        break;
      }
    }
    if (!u)
      try {
        u = ve.call(this, R);
      } catch (x) {
        u = Promise.reject(x);
      }
    for (p = 0, w = f.length; p < w; )
      u = u.then(f[p++], f[p++]);
    return u;
  }
  getUri(t) {
    t = Y(this.defaults, t);
    const n = Vt(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return Mt(n, t.params, t.paramsSerializer);
  }
};
a.forEach(["delete", "get", "head", "options"], function(t) {
  G.prototype[t] = function(n, r) {
    return this.request(
      Y(r || {}, {
        method: t,
        url: n,
        data: r && a.hasOwnProp(r, "data") ? r.data : void 0
      })
    );
  };
});
a.forEach(["post", "put", "patch", "query"], function(t) {
  function n(r) {
    return function(o, i, c) {
      return this.request(
        Y(c || {}, {
          method: t,
          headers: r ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: o,
          data: i
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
      const i = new Promise((c) => {
        r.subscribe(c), o = c;
      }).then(s);
      return i.cancel = function() {
        r.unsubscribe(o);
      }, i;
    }, t(function(o, i, c) {
      r.reason || (r.reason = new pe(o, i, c), n(r.reason));
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
function ws(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function bs(e) {
  return a.isObject(e) && e.isAxiosError === !0;
}
const $e = {
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
Object.entries($e).forEach(([e, t]) => {
  $e[t] = e;
});
function Zt(e) {
  const t = new G(e), n = At(G.prototype.request, t);
  return a.extend(n, G.prototype, t, { allOwnKeys: !0 }), a.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(s) {
    return Zt(Y(e, s));
  }, n;
}
const T = Zt(de);
T.Axios = G;
T.CanceledError = pe;
T.CancelToken = gs;
T.isCancel = zt;
T.VERSION = Ge;
T.toFormData = Te;
T.AxiosError = h;
T.Cancel = T.CanceledError;
T.all = function(t) {
  return Promise.all(t);
};
T.spread = ws;
T.isAxiosError = bs;
T.mergeConfig = Y;
T.AxiosHeaders = L;
T.formToJSON = (e) => Ht(a.isHTMLForm(e) ? new FormData(e) : e);
T.getAdapter = Xt.getAdapter;
T.HttpStatusCode = $e;
T.default = T;
const {
  Axios: Ls,
  AxiosError: Us,
  CanceledError: Fs,
  isCancel: Bs,
  CancelToken: js,
  VERSION: Is,
  all: vs,
  Cancel: Ms,
  isAxiosError: qs,
  spread: Hs,
  toFormData: zs,
  AxiosHeaders: $s,
  HttpStatusCode: Vs,
  formToJSON: Ws,
  getAdapter: Js,
  mergeConfig: Ks,
  create: Xs
} = T, Re = T.create({ baseURL: "/api", withCredentials: !0 });
Re.interceptors.request.use((e) => {
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
  slide: "幻灯片",
  "admin login": "后台登录",
  "signing in": "登录中",
  "sign in to continue": "登录以继续访问",
  "welcome back": "欢迎回来",
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
function N(e, t) {
  if (t != null && t.translations_override)
    try {
      const s = JSON.parse(t.translations_override)[e];
      if (typeof s == "string" && s) return s;
    } catch {
    }
  return (localStorage.getItem("mortar_lang") || (t == null ? void 0 : t.site_lang) || "zh") === "zh" && Es[e] || e;
}
function Rs(e) {
  return localStorage.getItem("mortar_lang") || (e == null ? void 0 : e.site_lang) || "zh";
}
function xs({ settings: e }) {
  const [t, n] = Le([]), [r, s] = Le(!1), [o, i] = Le(null);
  tn(() => {
    Re.get("/menus/location/primary").then((l) => n(l.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && Re.get("/auth/me").then((l) => i(l.data)).catch(() => localStorage.removeItem("mortar_token"));
  }, []);
  function c() {
    Re.post("/auth/logout").catch(() => {
    }), localStorage.removeItem("mortar_token"), window.location.href = "/";
  }
  return g.createElement(
    "header",
    { className: "bg-white border-b border-gray-200" },
    g.createElement(
      "div",
      { className: "max-w-4xl mx-auto px-4 py-10" },
      g.createElement(
        I,
        { to: "/", className: "block text-center" },
        g.createElement("h1", { className: "text-4xl font-extrabold tracking-tight text-gray-900" }, e.site_title || "Mortar")
      ),
      g.createElement(
        "nav",
        { className: "hidden md:flex items-center justify-center gap-8 mt-8" },
        g.createElement(I, { to: "/", className: "text-sm uppercase tracking-widest text-gray-600 hover:text-gray-900" }, N("home", e)),
        t.filter((l) => !(l.url === "/" && (l.label.toLowerCase() === "home" || l.label === N("home", e)))).map((l) => g.createElement(I, { key: l.id, to: l.url, className: "text-sm uppercase tracking-widest text-gray-600 hover:text-gray-900" }, l.label)),
        g.createElement(I, { to: "/search", className: "text-sm uppercase tracking-widest text-gray-600 hover:text-gray-900" }, N("search", e)),
        o ? g.createElement("button", { onClick: c, className: "text-sm uppercase tracking-widest text-gray-400 hover:text-gray-600" }, N("logout")) : g.createElement(I, { to: "/login", className: "text-sm uppercase tracking-widest text-gray-600 hover:text-gray-900" }, N("sign in")),
        g.createElement("a", { href: "/admin", className: "text-sm uppercase tracking-widest text-primary-600 hover:text-primary-700" }, N("admin", e))
      ),
      g.createElement(
        "div",
        { className: "md:hidden flex justify-between items-center mt-4" },
        g.createElement("button", { onClick: () => s(!r), className: "p-2 text-gray-600", "aria-label": N("toggle menu", e), "aria-expanded": r, "aria-controls": "mobile-nav" }, r ? g.createElement(ln, { size: 20 }) : g.createElement(an, { size: 20 })),
        g.createElement("a", { href: "/admin", className: "text-xs uppercase tracking-widest text-primary-600" }, N("admin", e))
      ),
      r && g.createElement(
        "div",
        { className: "md:hidden border-t border-gray-100 mt-4 pt-4 space-y-2" },
        g.createElement(I, { to: "/", className: "block text-sm text-gray-600 py-1" }, N("home", e)),
        t.filter((l) => !(l.url === "/" && (l.label.toLowerCase() === "home" || l.label === N("home", e)))).map((l) => g.createElement(I, { key: l.id, to: l.url, className: "block text-sm text-gray-600 py-1" }, l.label)),
        o ? g.createElement("button", { onClick: c, className: "block text-sm text-gray-400 py-1" }, N("logout")) : g.createElement(I, { to: "/login", className: "block text-sm text-gray-600 py-1" }, N("sign in"))
      )
    )
  );
}
function Ss(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function Os(e, t) {
  if (!e) return;
  const n = Ss(t.cdn_url);
  return n && e.startsWith("/uploads/") ? n + e : e;
}
function _s(e) {
  const t = String(e || ""), n = t.match(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/);
  return new Date(n ? t.replace(" ", "T") + "Z" : t).getTime();
}
function As(e) {
  const t = Rs() === "zh", n = Date.now(), r = _s(e), s = n - r, o = Math.floor(s / 6e4);
  if (o < 1) return t ? "刚刚" : "just now";
  if (o < 60) return t ? o + " 分钟前" : o + "m ago";
  const i = Math.floor(o / 60);
  if (i < 24) return t ? i + " 小时前" : i + "h ago";
  const c = Math.floor(i / 24);
  if (c < 7) return t ? c + " 天前" : c + "d ago";
  const l = Math.floor(c / 7);
  return l < 5 ? t ? l + " 周前" : l + "w ago" : new Date(r).toLocaleDateString(t ? "zh-CN" : void 0);
}
function Ts(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: i, catSlug: c, isTagPage: l } = e, f = t.theme_hero_heading || "";
  return g.createElement(
    "div",
    null,
    !c && f && g.createElement(
      "div",
      { className: "max-w-4xl mx-auto px-4 pt-16" },
      g.createElement("h2", { className: "text-3xl font-extrabold tracking-tight text-gray-900" }, f),
      g.createElement("div", { className: "w-16 h-1 bg-gray-900 mt-4" })
    ),
    c && g.createElement(
      "div",
      { className: "max-w-4xl mx-auto px-4 pt-12" },
      g.createElement("h1", { className: "text-3xl font-extrabold tracking-tight text-gray-900 capitalize" }, (l ? N("tag", t) + ": " : "") + (c || "").replace(/-/g, " ")),
      g.createElement("div", { className: "w-16 h-1 bg-gray-900 mt-4" })
    ),
    g.createElement(
      "div",
      { className: "max-w-4xl mx-auto px-4 py-12" },
      n.length === 0 ? g.createElement("p", { className: "text-gray-500 text-center py-16" }, N(i ? "failed to load posts" : "no posts yet", t)) : g.createElement(
        "div",
        { className: "space-y-16" },
        n.map(
          (u) => {
            var p, w;
            return g.createElement(
              "article",
              { key: u.id },
              u.featured && g.createElement(
                I,
                { to: "/post/" + u.slug },
                g.createElement("img", { src: Os(u.featured, t), alt: u.title, className: "w-full max-h-96 object-cover mb-8", loading: "lazy" })
              ),
              g.createElement(
                "div",
                { className: "flex items-center gap-4 text-xs uppercase tracking-widest text-gray-500 mb-4" },
                g.createElement("span", { className: "flex items-center gap-1" }, g.createElement(on, { size: 12 }), As(u.publishedAt || u.createdAt)),
                g.createElement("span", { className: "flex items-center gap-1" }, g.createElement(cn, { size: 12 }), (p = u.author) == null ? void 0 : p.username),
                ((w = u.categories) == null ? void 0 : w[0]) && g.createElement("span", { className: "text-primary-600" }, u.categories[0].name)
              ),
              g.createElement(
                I,
                { to: "/post/" + u.slug },
                g.createElement("h2", { className: "text-3xl font-extrabold tracking-tight text-gray-900 hover:text-gray-600 mb-4" }, u.title)
              ),
              u.excerpt && g.createElement("p", { className: "text-gray-600 leading-relaxed text-lg mb-6" }, u.excerpt),
              g.createElement(I, { to: "/post/" + u.slug, className: "text-sm font-bold uppercase tracking-widest text-primary-600 hover:text-primary-700" }, N("read more", t), " →")
            );
          }
        )
      ),
      r > parseInt(t.posts_per_page || "10") && g.createElement(
        "div",
        { className: "flex items-center justify-center gap-4 pt-16" },
        g.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 text-sm uppercase tracking-widest hover:text-gray-600 disabled:opacity-40" }, "← " + N("previous", t)),
        g.createElement("span", { className: "text-sm text-gray-500" }, N("page", t) + " " + s + " " + N("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
        g.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 text-sm uppercase tracking-widest hover:text-gray-600 disabled:opacity-40" }, N("next", t) + " →")
      )
    )
  );
}
const Gs = { name: "twentynineteen", typography: { cap: 2, max: 24 }, Header: xs, HomeLayout: Ts };
export {
  Gs as default
};
