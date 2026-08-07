import h, { forwardRef as _t, createElement as Me, useState as ne, useEffect as We } from "react";
import { Link as B, useNavigate as nn } from "react-router-dom";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rn = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), At = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var sn = {
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
const on = _t(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: i,
    ...c
  }, u) => Me(
    "svg",
    {
      ref: u,
      ...sn,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: At("lucide", s),
      ...c
    },
    [
      ...i.map(([l, f]) => Me(l, f)),
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
const de = (e, t) => {
  const n = _t(
    ({ className: r, ...s }, o) => Me(on, {
      ref: o,
      iconNode: t,
      className: At(`lucide-${rn(e)}`, r),
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
const an = de("Calendar", [
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
const cn = de("Menu", [
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
const ln = de("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const un = de("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fn = de("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function Nt(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: dn } = Object.prototype, { getPrototypeOf: se } = Object, { iterator: pe, toStringTag: Tt } = Symbol, Oe = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), fe = (e, t) => {
  let n = e;
  const r = [];
  for (; n != null && n !== Object.prototype; ) {
    if (r.indexOf(n) !== -1)
      return !1;
    if (r.push(n), Oe(n, t))
      return !0;
    n = se(n);
  }
  return !1;
}, pn = (e, t) => e != null && fe(e, t) ? e[t] : void 0, Ve = /* @__PURE__ */ ((e) => (t) => {
  const n = dn.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), I = (e) => (e = e.toLowerCase(), (t) => Ve(t) === e), Ne = (e) => (t) => typeof t === e, { isArray: Q } = Array, Z = Ne("undefined");
function oe(e) {
  return e !== null && !Z(e) && e.constructor !== null && !Z(e.constructor) && U(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Pt = I("ArrayBuffer");
function mn(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Pt(e.buffer), t;
}
const hn = Ne("string"), U = Ne("function"), Ct = Ne("number"), ie = (e) => e !== null && typeof e == "object", yn = (e) => e === !0 || e === !1, xe = (e) => {
  if (!ie(e))
    return !1;
  const t = se(e);
  return (t === null || t === Object.prototype || se(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !fe(e, Tt) && !fe(e, pe);
}, gn = (e) => {
  if (!ie(e) || oe(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, bn = I("Date"), wn = I("File"), En = (e) => !!(e && typeof e.uri < "u"), xn = (e) => e && typeof e.getParts < "u", Rn = I("Blob"), Sn = I("FileList"), On = I("Set"), _n = (e) => ie(e) && U(e.pipe);
function An() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const it = An(), at = typeof it.FormData < "u" ? it.FormData : void 0, Nn = (e) => {
  if (!e) return !1;
  if (at && e instanceof at) return !0;
  const t = se(e);
  if (!t || t === Object.prototype || !U(e.append)) return !1;
  const n = Ve(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && U(e.toString) && e.toString() === "[object FormData]";
}, Tn = I("URLSearchParams"), [Pn, Cn, Dn, kn] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(I), Ln = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function me(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, s;
  if (typeof e != "object" && (e = [e]), Q(e))
    for (r = 0, s = e.length; r < s; r++)
      t.call(null, e[r], r, e);
  else {
    if (oe(e))
      return;
    const o = n ? Object.getOwnPropertyNames(e) : Object.keys(e), i = o.length;
    let c;
    for (r = 0; r < i; r++)
      c = o[r], t.call(null, e[c], c, e);
  }
}
function Dt(e, t) {
  if (oe(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, s;
  for (; r-- > 0; )
    if (s = n[r], t === s.toLowerCase())
      return s;
  return null;
}
const X = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, kt = (e) => !Z(e) && e !== X;
function qe(...e) {
  const { caseless: t, skipUndefined: n } = kt(this) && this || {}, r = {}, s = (o, i) => {
    if (i === "__proto__" || i === "constructor" || i === "prototype")
      return;
    const c = t && typeof i == "string" && Dt(r, i) || i, u = Oe(r, c) ? r[c] : void 0;
    xe(u) && xe(o) ? r[c] = qe(u, o) : xe(o) ? r[c] = qe({}, o) : Q(o) ? r[c] = o.slice() : (!n || !Z(o)) && (r[c] = o);
  };
  for (let o = 0, i = e.length; o < i; o++) {
    const c = e[o];
    if (!c || oe(c) || (me(c, s), typeof c != "object" || Q(c)))
      continue;
    const u = Object.getOwnPropertySymbols(c);
    for (let l = 0; l < u.length; l++) {
      const f = u[l];
      Wn.call(c, f) && s(c[f], f);
    }
  }
  return r;
}
const Un = (e, t, n, { allOwnKeys: r } = {}) => (me(
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
), e), Fn = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), Bn = (e, t, n, r) => {
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
}, jn = (e, t, n, r) => {
  let s, o, i;
  const c = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0; )
      i = s[o], (!r || r(i, e, t)) && !c[i] && (t[i] = e[i], c[i] = !0);
    e = n !== !1 && se(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, In = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, vn = (e) => {
  if (!e) return null;
  if (Q(e)) return e;
  let t = e.length;
  if (!Ct(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, Mn = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && se(Uint8Array)), qn = (e, t) => {
  const r = (e && e[pe]).call(e);
  let s;
  for (; (s = r.next()) && !s.done; ) {
    const o = s.value;
    t.call(e, o[0], o[1]);
  }
}, Hn = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, zn = I("HTMLFormElement"), $n = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(n, r, s) {
  return r.toUpperCase() + s;
}), { propertyIsEnumerable: Wn } = Object.prototype, Vn = I("RegExp"), Lt = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  me(n, (s, o) => {
    let i;
    (i = t(s, o, e)) !== !1 && (r[o] = i || s);
  }), Object.defineProperties(e, r);
}, Jn = (e) => {
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
}, Kn = (e, t) => {
  const n = {}, r = (s) => {
    s.forEach((o) => {
      n[o] = !0;
    });
  };
  return Q(e) ? r(e) : r(String(e).split(t)), n;
}, Xn = () => {
}, Gn = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Qn(e) {
  return !!(e && U(e.append) && e[Tt] === "FormData" && e[pe]);
}
const Zn = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (r) => {
    if (ie(r)) {
      if (t.has(r))
        return;
      if (oe(r))
        return r;
      if (!("toJSON" in r)) {
        t.add(r);
        let s;
        if (On(r)) {
          s = [];
          for (const o of r) {
            const i = n(o);
            !Z(i) && s.push(i);
          }
        } else
          s = Q(r) ? [] : {}, me(r, (o, i) => {
            const c = n(o);
            !Z(c) && (s[i] = c);
          });
        return t.delete(r), s;
      }
    }
    return r;
  };
  return n(e);
}, Yn = I("AsyncFunction"), er = (e) => e && (ie(e) || U(e)) && U(e.then) && U(e.catch), Ut = ((e, t) => e ? setImmediate : t ? ((n, r) => (X.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === X && o === n && r.length && r.shift()();
  },
  !1
), (s) => {
  r.push(s), X.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", U(X.postMessage)), tr = typeof queueMicrotask < "u" ? queueMicrotask.bind(X) : typeof process < "u" && process.nextTick || Ut, Ft = (e) => e != null && U(e[pe]), nr = (e) => e != null && fe(e, pe) && Ft(e), a = {
  isArray: Q,
  isArrayBuffer: Pt,
  isBuffer: oe,
  isFormData: Nn,
  isArrayBufferView: mn,
  isString: hn,
  isNumber: Ct,
  isBoolean: yn,
  isObject: ie,
  isPlainObject: xe,
  isEmptyObject: gn,
  isReadableStream: Pn,
  isRequest: Cn,
  isResponse: Dn,
  isHeaders: kn,
  isUndefined: Z,
  isDate: bn,
  isFile: wn,
  isReactNativeBlob: En,
  isReactNative: xn,
  isBlob: Rn,
  isRegExp: Vn,
  isFunction: U,
  isStream: _n,
  isURLSearchParams: Tn,
  isTypedArray: Mn,
  isFileList: Sn,
  forEach: me,
  merge: qe,
  extend: Un,
  trim: Ln,
  stripBOM: Fn,
  inherits: Bn,
  toFlatObject: jn,
  kindOf: Ve,
  kindOfTest: I,
  endsWith: In,
  toArray: vn,
  forEachEntry: qn,
  matchAll: Hn,
  isHTMLForm: zn,
  hasOwnProperty: Oe,
  hasOwnProp: Oe,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: fe,
  getSafeProp: pn,
  reduceDescriptors: Lt,
  freezeMethods: Jn,
  toObjectSet: Kn,
  toCamelCase: $n,
  noop: Xn,
  toFiniteNumber: Gn,
  findKey: Dt,
  global: X,
  isContextDefined: kt,
  isSpecCompliantForm: Qn,
  toJSONObject: Zn,
  isAsyncFn: Yn,
  isThenable: er,
  setImmediate: Ut,
  asap: tr,
  isIterable: Ft,
  isSafeIterable: nr
}, rr = a.toObjectSet([
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
]), sr = (e) => {
  const t = {};
  let n, r, s;
  return e && e.split(`
`).forEach(function(i) {
    s = i.indexOf(":"), n = i.substring(0, s).trim().toLowerCase(), r = i.substring(s + 1).trim();
    const c = a.hasOwnProp(t, n);
    !n || c && a.hasOwnProp(rr, n) || (n === "set-cookie" ? c ? t[n].push(r) : t[n] = [r] : t[n] = c ? t[n] + ", " + r : r);
  }), t;
};
function or(e) {
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
const ir = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), ar = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Je(e, t) {
  return a.isArray(e) ? e.map((n) => Je(n, t)) : or(String(e).replace(t, ""));
}
const cr = (e) => Je(e, ir), lr = (e) => Je(e, ar);
function Bt(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return a.forEach(e.toJSON(), (n, r) => {
    t[r] = lr(n);
  }), t;
}
const ct = Symbol("internals");
function ue(e) {
  return e && String(e).trim().toLowerCase();
}
function Re(e) {
  return e === !1 || e == null ? e : a.isArray(e) ? e.map(Re) : cr(String(e));
}
function ur(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const fr = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
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
function dr(e) {
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
function pr(e) {
  const t = /* @__PURE__ */ Object.create(null), n = String(e);
  let r = 0, s = !1, o = !1;
  function i(c) {
    const u = Ue(n.slice(r, c)), l = u.indexOf("=");
    if (l < 1)
      return;
    const f = Ue(u.slice(0, l));
    if (!fr.test(f))
      return;
    const p = f.toLowerCase();
    if (p === "__proto__" || p === "constructor" || p === "prototype")
      return;
    const b = Ue(u.slice(l + 1));
    t[p] = dr(b);
  }
  for (let c = 0; c < n.length; c++) {
    const u = n.charCodeAt(c);
    s ? o ? o = !1 : u === 92 ? o = !0 : u === 34 && (s = !1) : u === 34 ? s = !0 : (u === 44 || u === 59) && (i(c), r = c + 1);
  }
  return i(n.length), t;
}
const mr = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
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
function hr(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function yr(e, t) {
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
    function o(c, u, l) {
      const f = ue(u);
      if (!f)
        return;
      const p = a.findKey(s, f);
      (!p || s[p] === void 0 || l === !0 || l === void 0 && s[p] !== !1) && (s[p || u] = Re(c));
    }
    const i = (c, u) => a.forEach(c, (l, f) => o(l, f, u));
    if (a.isPlainObject(t) || t instanceof this.constructor)
      i(t, n);
    else if (a.isString(t) && (t = t.trim()) && !mr(t))
      i(sr(t), n);
    else if (a.isObject(t) && a.isSafeIterable(t)) {
      let c = /* @__PURE__ */ Object.create(null), u, l;
      for (const f of t) {
        if (!a.isArray(f))
          throw new TypeError("Object iterator must return a key-value pair");
        l = f[0], a.hasOwnProp(c, l) ? (u = c[l], c[l] = a.isArray(u) ? [...u, f[1]] : [u, f[1]]) : c[l] = f[1];
      }
      i(c, n);
    } else
      t != null && o(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = ue(t), t) {
      const r = a.findKey(this, t);
      if (r) {
        const s = this[r];
        if (!n)
          return s;
        if (n === !0)
          return ur(s);
        if (a.isFunction(n))
          return n.call(this, s, r);
        if (a.isRegExp(n))
          return n.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = ue(t), t) {
      const r = a.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || Fe(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function o(i) {
      if (i = ue(i), i) {
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
        n[i] = Re(s), delete n[o];
        return;
      }
      const c = t ? hr(o) : String(o).trim();
      c !== o && delete n[o], n[c] = Re(s), r[c] = !0;
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
    return pr(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((s) => r.set(s)), r;
  }
  static accessor(t) {
    const r = (this[ct] = this[ct] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(i) {
      const c = ue(i);
      r[c] || (yr(s, i), r[c] = !0);
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
const _e = "[REDACTED ****]";
function gr(e) {
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
function br(e, t) {
  const n = new Set(t.map((o) => String(o).toLowerCase())), r = [], s = (o) => {
    if (o === null || typeof o != "object" || a.isBuffer(o)) return o;
    if (r.indexOf(o) !== -1) return;
    o instanceof L && (o = o.toJSON()), r.push(o);
    let i;
    if (a.isArray(o))
      i = [], o.forEach((c, u) => {
        const l = s(c);
        a.isUndefined(l) || (i[u] = l);
      });
    else {
      if (!a.isPlainObject(o) && gr(o))
        return r.pop(), o;
      i = /* @__PURE__ */ Object.create(null);
      for (const [c, u] of Object.entries(o)) {
        const l = n.has(c.toLowerCase()) ? _e : s(u);
        a.isUndefined(l) || (i[c] = l);
      }
    }
    return r.pop(), i;
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
function wr(e) {
  return e.errors.map((n) => {
    try {
      return n && n.message ? lt(n.message) : lt(n);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let m = class jt extends Error {
  static from(t, n, r, s, o, i) {
    let c = t.message;
    !c && a.isArray(t.errors) && t.errors.length && (c = wr(t));
    const u = new jt(c, n || t.code, r, s, o);
    return Object.defineProperty(u, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), u.name = t.name, t.status != null && u.status == null && (u.status = t.status), i && Object.assign(u, i), u;
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
    const t = this.config, n = t && a.hasOwnProp(t, "redact") ? t.redact : void 0, r = a.isArray(n) && n.length > 0 ? br(t, n) : a.toJSONObject(t);
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
m.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
m.ERR_BAD_OPTION = "ERR_BAD_OPTION";
m.ECONNABORTED = "ECONNABORTED";
m.ETIMEDOUT = "ETIMEDOUT";
m.ECONNREFUSED = "ECONNREFUSED";
m.ERR_NETWORK = "ERR_NETWORK";
m.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
m.ERR_DEPRECATED = "ERR_DEPRECATED";
m.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
m.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
m.ERR_CANCELED = "ERR_CANCELED";
m.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
m.ERR_INVALID_URL = "ERR_INVALID_URL";
m.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const Er = null, It = 100;
function He(e) {
  return a.isPlainObject(e) || a.isArray(e);
}
function vt(e) {
  return a.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Be(e, t, n) {
  return e ? e.concat(t).map(function(s, o) {
    return s = vt(s), !n && o ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function xr(e) {
  return a.isArray(e) && !e.some(He);
}
const Rr = a.toFlatObject(a, {}, null, function(t) {
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
    function(g, w) {
      return !a.isUndefined(w[g]);
    }
  );
  const r = n.metaTokens, s = n.visitor || R, o = n.dots, i = n.indexes, c = n.Blob || typeof Blob < "u" && Blob, u = n.maxDepth === void 0 ? It : n.maxDepth, l = c && a.isSpecCompliantForm(t), f = [];
  if (!a.isFunction(s))
    throw new TypeError("visitor must be a function");
  function p(d) {
    if (d === null) return "";
    if (a.isDate(d))
      return d.toISOString();
    if (a.isBoolean(d))
      return d.toString();
    if (!l && a.isBlob(d))
      throw new m("Blob is not supported. Use a Buffer instead.");
    if (a.isArrayBuffer(d) || a.isTypedArray(d)) {
      if (l && typeof c == "function")
        return new c([d]);
      throw new m("Blob is not supported. Use a Buffer instead.", m.ERR_NOT_SUPPORT);
    }
    return d;
  }
  function b(d) {
    if (d > u)
      throw new m(
        "Object is too deeply nested (" + d + " levels). Max depth: " + u,
        m.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function x(d, g) {
    if (u === 1 / 0)
      return JSON.stringify(d);
    const w = [];
    return JSON.stringify(d, function(D, N) {
      if (!a.isObject(N))
        return N;
      for (; w.length && w[w.length - 1] !== this; )
        w.pop();
      return w.push(N), b(g + w.length - 1), N;
    });
  }
  function R(d, g, w) {
    let S = d;
    if (a.isReactNative(t) && a.isReactNativeBlob(d))
      return t.append(Be(w, g, o), p(d)), !1;
    if (d && !w && typeof d == "object") {
      if (a.endsWith(g, "{}"))
        g = r ? g : g.slice(0, -2), d = x(d, 1);
      else if (a.isArray(d) && xr(d) || (a.isFileList(d) || a.endsWith(g, "[]")) && (S = a.toArray(d)))
        return g = vt(g), S.forEach(function(N, H) {
          !(a.isUndefined(N) || N === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            i === !0 ? Be([g], H, o) : i === null ? g : g + "[]",
            p(N)
          );
        }), !1;
    }
    return He(d) ? !0 : (t.append(Be(w, g, o), p(d)), !1);
  }
  const O = Object.assign(Rr, {
    defaultVisitor: R,
    convertValue: p,
    isVisitable: He
  });
  function y(d, g, w = 0) {
    if (!a.isUndefined(d)) {
      if (b(w), f.indexOf(d) !== -1)
        throw new Error("Circular reference detected in " + g.join("."));
      f.push(d), a.forEach(d, function(D, N) {
        (!(a.isUndefined(D) || D === null) && s.call(t, D, a.isString(N) ? N.trim() : N, g, O)) === !0 && y(D, g ? g.concat(N) : [N], w + 1);
      }), f.pop();
    }
  }
  if (!a.isObject(e))
    throw new TypeError("data must be an object");
  return y(e), t;
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
  this._pairs = [], e && Te(e, this, t);
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
function Sr(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function qt(e, t, n) {
  if (!t)
    return e;
  e = e || "";
  const r = a.isFunction(n) ? {
    serialize: n
  } : n, s = a.getSafeProp(r, "encode") || Sr, o = a.getSafeProp(r, "serialize");
  let i;
  if (o ? i = o(t, r) : i = a.isURLSearchParams(t) ? t.toString() : new Ke(t, r).toString(s), i) {
    const c = e.indexOf("#");
    c !== -1 && (e = e.slice(0, c)), e += (e.indexOf("?") === -1 ? "?" : "&") + i;
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
    a.forEach(this.handlers, function(r) {
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
}, Or = typeof URLSearchParams < "u" ? URLSearchParams : Ke, _r = typeof FormData < "u" ? FormData : null, Ar = typeof Blob < "u" ? Blob : null, Nr = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Or,
    FormData: _r,
    Blob: Ar
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Ge = typeof window < "u" && typeof document < "u", ze = typeof navigator == "object" && navigator || void 0, Tr = Ge && (!ze || ["ReactNative", "NativeScript", "NS"].indexOf(ze.product) < 0), Pr = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Cr = Ge && window.location.href || "http://localhost", Dr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Ge,
  hasStandardBrowserEnv: Tr,
  hasStandardBrowserWebWorkerEnv: Pr,
  navigator: ze,
  origin: Cr
}, Symbol.toStringTag, { value: "Module" })), C = {
  ...Dr,
  ...Nr
};
function kr(e, t) {
  return Te(e, new C.classes.URLSearchParams(), {
    visitor: function(n, r, s, o) {
      return C.isNode && a.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const dt = It;
function Ht(e) {
  if (e > dt)
    throw new m(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + dt,
      m.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function Lr(e) {
  const t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g;
  let r;
  for (; (r = n.exec(e)) !== null; )
    Ht(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
  return t;
}
function Ur(e) {
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
    let i = n[o++];
    if (i === "__proto__") return !0;
    const c = Number.isFinite(+i), u = o >= n.length;
    return i = !i && a.isArray(s) ? s.length : i, u ? (a.hasOwnProp(s, i) ? s[i] = a.isArray(s[i]) ? s[i].concat(r) : [s[i], r] : s[i] = r, !c) : ((!a.hasOwnProp(s, i) || !a.isObject(s[i])) && (s[i] = []), t(n, r, s[i], o) && a.isArray(s[i]) && (s[i] = Ur(s[i])), !c);
  }
  if (a.isFormData(e) && a.isFunction(e.entries)) {
    const n = {};
    return a.forEachEntry(e, (r, s) => {
      t(Lr(r), s, n, 0);
    }), n;
  }
  return null;
}
const te = (e, t) => e != null && a.hasOwnProp(e, t) ? e[t] : void 0;
function Fr(e, t, n) {
  if (a.isString(e))
    try {
      return (t || JSON.parse)(e), a.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(e);
}
const he = {
  transitional: Xe,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, n) {
      const r = n.getContentType() || "", s = r.indexOf("application/json") > -1, o = a.isObject(t);
      if (o && a.isHTMLForm(t) && (t = new FormData(t)), a.isFormData(t))
        return s ? JSON.stringify(zt(t)) : t;
      if (a.isArrayBuffer(t) || a.isBuffer(t) || a.isStream(t) || a.isFile(t) || a.isBlob(t) || a.isReadableStream(t))
        return t;
      if (a.isArrayBufferView(t))
        return t.buffer;
      if (a.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let c;
      if (o) {
        const u = te(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return kr(t, u).toString();
        if ((c = a.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const l = te(this, "env"), f = l && l.FormData;
          return Te(
            c ? { "files[]": t } : t,
            f && new f(),
            u
          );
        }
      }
      return o || s ? (n.setContentType("application/json", !1), Fr(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const n = te(this, "transitional") || he.transitional, r = n && n.forcedJSONParsing, s = te(this, "responseType"), o = s === "json";
      if (a.isResponse(t) || a.isReadableStream(t))
        return t;
      if (t && a.isString(t) && (r && !s || o)) {
        const c = !(n && n.silentJSONParsing) && o;
        try {
          return JSON.parse(t, te(this, "parseReviver"));
        } catch (u) {
          if (c)
            throw u.name === "SyntaxError" ? m.from(u, m.ERR_BAD_RESPONSE, this, null, te(this, "response")) : u;
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
  he.headers[e] = {};
});
function je(e, t) {
  const n = this || he, r = t || n, s = L.from(r.headers);
  let o = r.data;
  return a.forEach(e, function(c) {
    o = c.call(n, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function $t(e) {
  return !!(e && e.__CANCEL__);
}
let ye = class extends m {
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
    super(t ?? "canceled", m.ERR_CANCELED, n, r), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function Wt(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new m(
    "Request failed with status code " + n.status,
    n.status >= 400 && n.status < 500 ? m.ERR_BAD_REQUEST : m.ERR_BAD_RESPONSE,
    n.config,
    n.request,
    n
  ));
}
function Br(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function jr(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let s = 0, o = 0, i;
  return t = t !== void 0 ? t : 1e3, function(u) {
    const l = Date.now(), f = r[o];
    i || (i = l), n[s] = u, r[s] = l;
    let p = o, b = 0;
    for (; p !== s; )
      b += n[p++], p = p % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), l - i < t)
      return;
    const x = f && l - f;
    return x ? Math.round(b * 1e3 / x) : void 0;
  };
}
function Ir(e, t) {
  let n = 0, r = 1e3 / t, s, o;
  const i = (l, f = Date.now()) => {
    n = f, s = null, o && (clearTimeout(o), o = null), e(...l);
  };
  return [(...l) => {
    const f = Date.now(), p = f - n;
    p >= r ? i(l, f) : (s = l, o || (o = setTimeout(() => {
      o = null, i(s);
    }, r - p)));
  }, () => s && i(s)];
}
const Ae = (e, t, n = 3) => {
  let r = 0;
  const s = jr(50, 250);
  return Ir((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const i = o.loaded, c = o.lengthComputable ? o.total : void 0, u = Math.max(0, c != null ? Math.min(i, c) : i), l = Math.max(0, u - r), f = s(l);
    r = Math.max(r, u);
    const p = {
      loaded: u,
      total: c,
      progress: c ? u / c : void 0,
      bytes: l,
      rate: f || void 0,
      estimated: f && c ? (c - u) / f : void 0,
      event: o,
      lengthComputable: c != null,
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
}, mt = (e, t = a.asap) => (...n) => t(() => e(...n)), vr = C.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, C.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(C.origin),
  C.navigator && /(msie|trident)/i.test(C.navigator.userAgent)
) : () => !0, Mr = C.hasStandardBrowserEnv ? (
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
function qr(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Hr(e, t) {
  if (!t)
    return e;
  let n = e.length;
  for (; n > 0 && e.charCodeAt(n - 1) === 47; )
    n--;
  return e.slice(0, n) + "/" + t.replace(/^\/+/, "");
}
const zr = /^https?:(?!\/\/)/i, $r = /[\t\n\r]/g;
function Wr(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function Vr(e) {
  return Wr(e).replace($r, "");
}
function Jr(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, n, r = "") => `${n}${r}${_e}`);
}
function Kr(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${_e}@`), n = t.indexOf("#"), s = (n === -1 ? t : t.slice(0, n)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${_e}`
  );
  return n === -1 ? s : `${s}#${Jr(t.slice(n + 1))}`;
}
function ht(e, t) {
  if (typeof e == "string") {
    const n = Vr(e);
    if (zr.test(n))
      throw new m(
        `Invalid URL ${JSON.stringify(Kr(n))}: missing "//" after protocol`,
        m.ERR_INVALID_URL,
        t
      );
  }
}
function Vt(e, t, n, r) {
  ht(t, r);
  let s = !qr(t);
  return e && (s || n === !1) ? (ht(e, r), Hr(e, t)) : t;
}
const yt = (e) => e instanceof L ? { ...e } : e, Xr = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
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
  function r(f, p, b, x) {
    return a.isPlainObject(f) && a.isPlainObject(p) ? a.merge.call({ caseless: x }, f, p) : a.isPlainObject(p) ? a.merge({}, p) : a.isArray(p) ? p.slice() : p;
  }
  function s(f, p, b, x) {
    if (a.isUndefined(p)) {
      if (!a.isUndefined(f))
        return r(void 0, f, b, x);
    } else return r(f, p, b, x);
  }
  function o(f, p) {
    if (!a.isUndefined(p))
      return r(void 0, p);
  }
  function i(f, p) {
    if (a.isUndefined(p)) {
      if (!a.isUndefined(f))
        return r(void 0, f);
    } else return r(void 0, p);
  }
  function c(f) {
    const p = a.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!a.isUndefined(p))
      if (a.isPlainObject(p)) {
        if (a.hasOwnProp(p, f))
          return p[f];
      } else
        return;
    const b = a.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (a.isPlainObject(b) && a.hasOwnProp(b, f))
      return b[f];
  }
  function u(f, p, b) {
    if (a.hasOwnProp(t, b))
      return r(f, p);
    if (a.hasOwnProp(e, b))
      return r(void 0, f);
  }
  const l = {
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
    validateStatus: u,
    headers: (f, p, b) => s(yt(f), yt(p), b, !0)
  };
  return a.forEach(Xr({ ...e, ...t }), function(p) {
    if (p === "__proto__" || p === "constructor" || p === "prototype") return;
    const b = a.hasOwnProp(l, p) ? l[p] : s, x = a.hasOwnProp(e, p) ? e[p] : void 0, R = a.hasOwnProp(t, p) ? t[p] : void 0, O = b(x, R, p);
    a.isUndefined(O) && b !== u || (n[p] = O);
  }), a.hasOwnProp(t, "validateStatus") && a.isUndefined(t.validateStatus) && c("validateStatusUndefinedResolves") === !1 && (a.hasOwnProp(e, "validateStatus") ? n.validateStatus = r(void 0, e.validateStatus) : delete n.validateStatus), n;
}
const Gr = ["content-type", "content-length"];
function Qr(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([r, s]) => {
    Gr.includes(r.toLowerCase()) && e.set(r, s);
  });
}
const Zr = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
);
function Jt(e) {
  const t = Y({}, e), n = (b) => a.hasOwnProp(t, b) ? t[b] : void 0, r = n("data");
  let s = n("withXSRFToken");
  const o = n("xsrfHeaderName"), i = n("xsrfCookieName");
  let c = n("headers");
  const u = n("auth"), l = n("baseURL"), f = n("allowAbsoluteUrls"), p = n("url");
  if (t.headers = c = L.from(c), t.url = qt(
    Vt(l, p, f, t),
    n("params"),
    n("paramsSerializer")
  ), u) {
    const b = a.getSafeProp(u, "username") || "", x = a.getSafeProp(u, "password") || "";
    try {
      c.set(
        "Authorization",
        "Basic " + btoa(b + ":" + (x ? Zr(x) : ""))
      );
    } catch (R) {
      throw m.from(R, m.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (a.isFormData(r) && (C.hasStandardBrowserEnv || C.hasStandardBrowserWebWorkerEnv || a.isReactNative(r) ? c.setContentType(void 0) : a.isFunction(r.getHeaders) && Qr(c, r.getHeaders(), n("formDataHeaderPolicy"))), C.hasStandardBrowserEnv && (a.isFunction(s) && (s = s(t)), s === !0 || s == null && vr(t.url))) {
    const x = o && i && Mr.read(i);
    x && c.set(o, x);
  }
  return t;
}
const Yr = typeof XMLHttpRequest < "u", es = Yr && function(e) {
  return new Promise(function(n, r) {
    const s = Jt(e);
    let o = s.data;
    const i = L.from(s.headers).normalize();
    let { responseType: c, onUploadProgress: u, onDownloadProgress: l } = s, f, p, b, x, R;
    function O() {
      x && x(), R && R(), s.cancelToken && s.cancelToken.unsubscribe(f), s.signal && s.signal.removeEventListener("abort", f);
    }
    let y = new XMLHttpRequest();
    y.open(s.method.toUpperCase(), s.url, !0), y.timeout = s.timeout;
    function d() {
      if (!y)
        return;
      const w = L.from(
        "getAllResponseHeaders" in y && y.getAllResponseHeaders()
      ), D = {
        data: !c || c === "text" || c === "json" ? y.responseText : y.response,
        status: y.status,
        statusText: y.statusText,
        headers: w,
        config: e,
        request: y
      };
      Wt(
        function(H) {
          n(H), O();
        },
        function(H) {
          r(H), O();
        },
        D
      ), y = null;
    }
    "onloadend" in y ? y.onloadend = d : y.onreadystatechange = function() {
      !y || y.readyState !== 4 || y.status === 0 && !(y.responseURL && y.responseURL.startsWith("file:")) || setTimeout(d);
    }, y.onabort = function() {
      y && (r(new m("Request aborted", m.ECONNABORTED, e, y)), O(), y = null);
    }, y.onerror = function(S) {
      const D = S && S.message ? S.message : "Network Error", N = new m(D, m.ERR_NETWORK, e, y);
      N.event = S || null, r(N), O(), y = null;
    }, y.ontimeout = function() {
      let S = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const D = s.transitional || Xe;
      s.timeoutErrorMessage && (S = s.timeoutErrorMessage), r(
        new m(
          S,
          D.clarifyTimeoutError ? m.ETIMEDOUT : m.ECONNABORTED,
          e,
          y
        )
      ), O(), y = null;
    }, o === void 0 && i.setContentType(null), "setRequestHeader" in y && a.forEach(Bt(i), function(S, D) {
      y.setRequestHeader(D, S);
    }), a.isUndefined(s.withCredentials) || (y.withCredentials = !!s.withCredentials), c && c !== "json" && (y.responseType = s.responseType), l && ([b, R] = Ae(l, !0), y.addEventListener("progress", b)), u && y.upload && ([p, x] = Ae(u), y.upload.addEventListener("progress", p), y.upload.addEventListener("loadend", x)), (s.cancelToken || s.signal) && (f = (w) => {
      y && (r(!w || w.type ? new ye(null, e, y) : w), y.abort(), O(), y = null);
    }, s.cancelToken && s.cancelToken.subscribe(f), s.signal && (s.signal.aborted ? f() : s.signal.addEventListener("abort", f)));
    const g = Br(s.url);
    if (g && !C.protocols.includes(g)) {
      r(
        new m(
          "Unsupported protocol " + g + ":",
          m.ERR_BAD_REQUEST,
          e
        )
      ), O();
      return;
    }
    y.send(o || null);
  });
}, ts = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const s = function(u) {
    if (!r) {
      r = !0, i();
      const l = u instanceof Error ? u : this.reason;
      n.abort(
        l instanceof m ? l : new ye(l instanceof Error ? l.message : l)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, s(new m(`timeout of ${t}ms exceeded`, m.ETIMEDOUT));
  }, t);
  const i = () => {
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
  const { signal: c } = n;
  return c.unsubscribe = () => a.asap(i), c;
}, ns = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let r = 0, s;
  for (; r < n; )
    s = r + t, yield e.slice(r, s), r = s;
}, rs = async function* (e, t) {
  for await (const n of ss(e))
    yield* ns(n, t);
}, ss = async function* (e) {
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
  const s = rs(e, t);
  let o = 0, i, c = (u) => {
    i || (i = !0, r && r(u));
  };
  return new ReadableStream(
    {
      async pull(u) {
        try {
          const { done: l, value: f } = await s.next();
          if (l) {
            c(), u.close();
            return;
          }
          let p = f.byteLength;
          if (n) {
            let b = o += p;
            n(b);
          }
          u.enqueue(new Uint8Array(f));
        } catch (l) {
          throw c(l), l;
        }
      },
      cancel(u) {
        return c(u), s.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, bt = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Kt = (e, t, n) => t + 2 < n && bt(e.charCodeAt(t + 1)) && bt(e.charCodeAt(t + 2)), wt = (e) => e <= 57 ? e - 48 : (e & 223) - 55, os = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, is = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, as = (e) => {
  const t = Math.floor(e / 4), n = e % 4;
  return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, cs = (e) => {
  const t = e.length;
  let n = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, ls = (e) => {
  const t = e.length;
  let n = 0, r = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let i = e.charCodeAt(o);
    if (i === 37 && Kt(e, o, t) && (i = wt(e.charCodeAt(o + 1)) * 16 + wt(e.charCodeAt(o + 2)), o += 2), !is(i)) {
      if (i === 61) {
        r++;
        continue;
      }
      if (!os(i) || r > 0) {
        s = !0;
        continue;
      }
      n++;
    }
  }
  return s || r > 2 || r > 0 && (n + r) % 4 !== 0 || n % 4 === 1 ? cs(e) : as(n);
}, us = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const n = e.indexOf(",");
  if (n < 0) return 0;
  const r = e.slice(5, n), s = e.slice(n + 1);
  if (/;base64/i.test(r))
    return t(s);
  let i = 0;
  for (let c = 0, u = s.length; c < u; c++) {
    const l = s.charCodeAt(c);
    if (l === 37 && Kt(s, c, u))
      i += 1, c += 2;
    else if (l < 128)
      i += 1;
    else if (l < 2048)
      i += 2;
    else if (l >= 55296 && l <= 56319 && c + 1 < u) {
      const f = s.charCodeAt(c + 1);
      f >= 56320 && f <= 57343 ? (i += 4, c++) : i += 3;
    } else
      i += 3;
  }
  return i;
};
function fs(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return us(
    t === -1 ? e : e.slice(0, t),
    ls
  );
}
const Qe = "1.19.0", Et = 64 * 1024, { isFunction: Ee } = a, ds = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), xt = (e) => {
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
}, ps = (e) => {
  const t = e.indexOf("://");
  let n = e;
  return t !== -1 && (n = n.slice(t + 3)), n.includes("@") || n.includes(":");
}, ms = (e) => {
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
  const { fetch: s, Request: o, Response: i } = e, c = s ? Ee(s) : typeof fetch == "function", u = Ee(o), l = Ee(i);
  if (!c)
    return !1;
  const f = c && Ee(n), p = c && (typeof r == "function" ? /* @__PURE__ */ ((d) => (g) => d.encode(g))(new r()) : async (d) => new Uint8Array(await new o(d).arrayBuffer())), b = u && f && Rt(() => {
    let d = !1;
    const g = new o(C.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return d = !0, "half";
      }
    }), w = g.headers.has("Content-Type");
    return g.body != null && g.body.cancel(), d && !w;
  }), x = l && f && Rt(() => a.isReadableStream(new i("").body)), R = {
    stream: x && ((d) => d.body)
  };
  c && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((d) => {
    !R[d] && (R[d] = (g, w) => {
      let S = g && g[d];
      if (S)
        return S.call(g);
      throw new m(
        `Response type '${d}' is not supported`,
        m.ERR_NOT_SUPPORT,
        w
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
  }, y = async (d, g) => {
    const w = a.toFiniteNumber(d.getContentLength());
    return w ?? O(g);
  };
  return async (d) => {
    let {
      url: g,
      method: w,
      data: S,
      signal: D,
      cancelToken: N,
      timeout: H,
      onDownloadProgress: Ce,
      onUploadProgress: De,
      responseType: z,
      headers: $,
      withCredentials: ge = "same-origin",
      fetchOptions: Ye,
      maxContentLength: v,
      maxBodyLength: be
    } = Jt(d);
    const ae = a.isNumber(v) && v > -1, ke = a.isNumber(be) && be > -1, Yt = (_) => a.hasOwnProp(d, _) ? d[_] : void 0;
    let et = s || fetch;
    z = z ? (z + "").toLowerCase() : "text";
    let W = ts(
      [D, N && N.toAbortSignal()],
      H
    ), P = null;
    const J = W && W.unsubscribe && (() => {
      W.unsubscribe();
    });
    let ee, ce = null;
    const tt = () => new m(
      "Request body larger than maxBodyLength limit",
      m.ERR_BAD_REQUEST,
      d,
      P
    );
    try {
      let _;
      const j = Yt("auth");
      if (j) {
        const E = a.getSafeProp(j, "username") || "", F = a.getSafeProp(j, "password") || "";
        _ = {
          username: E,
          password: F
        };
      }
      if (ps(g)) {
        const E = new URL(g, C.origin);
        if (!_ && (E.username || E.password)) {
          const F = xt(E.username), V = xt(E.password);
          _ = {
            username: F,
            password: V
          };
        }
        (E.username || E.password) && (E.username = "", E.password = "", g = E.href);
      }
      if (_ && ($.delete("authorization"), $.set(
        "Authorization",
        "Basic " + btoa(ds((_.username || "") + ":" + (_.password || "")))
      )), ae && typeof g == "string" && g.startsWith("data:") && fs(g) > v)
        throw new m(
          "maxContentLength size of " + v + " exceeded",
          m.ERR_BAD_RESPONSE,
          d,
          P
        );
      if (ke && w !== "get" && w !== "head") {
        const E = await O(S);
        if (typeof E == "number" && isFinite(E) && (ee = E, E > be))
          throw tt();
      }
      const we = ke && (a.isReadableStream(S) || a.isStream(S)), nt = (E, F, V) => gt(
        E,
        Et,
        (K) => {
          if (ke && K > be)
            throw ce = tt();
          F && F(K);
        },
        V
      );
      if (b && w !== "get" && w !== "head" && (De || we)) {
        if (ee = ee ?? await y($, S), ee !== 0 || we) {
          let E = new o(g, {
            method: "POST",
            body: S,
            duplex: "half"
          }), F;
          if (a.isFormData(S) && (F = E.headers.get("content-type")) && $.setContentType(F), E.body) {
            const [V, K] = De && pt(
              ee,
              Ae(mt(De))
            ) || [];
            S = nt(E.body, V, K);
          }
        }
      } else if (we && !u && f && w !== "get" && w !== "head")
        S = nt(S);
      else if (we && u && !b && w !== "get" && w !== "head")
        throw new m(
          "Stream request bodies are not supported by the current fetch implementation",
          m.ERR_NOT_SUPPORT,
          d,
          P
        );
      a.isString(ge) || (ge = ge ? "include" : "omit");
      const en = u && "credentials" in o.prototype;
      if (a.isFormData(S)) {
        const E = $.getContentType();
        E && /^multipart\/form-data/i.test(E) && !/boundary=/i.test(E) && $.delete("content-type");
      }
      $.set("User-Agent", "axios/" + Qe, !1);
      const rt = {
        ...Ye,
        signal: W,
        method: w.toUpperCase(),
        headers: Bt($.normalize()),
        body: S,
        duplex: "half",
        credentials: en ? ge : void 0
      };
      P = u && new o(g, rt);
      let M = await (u ? et(P, Ye) : et(g, rt));
      const st = L.from(M.headers);
      if (ae) {
        const E = a.toFiniteNumber(st.getContentLength());
        if (E != null && E > v)
          throw new m(
            "maxContentLength size of " + v + " exceeded",
            m.ERR_BAD_RESPONSE,
            d,
            P
          );
      }
      const Le = x && (z === "stream" || z === "response");
      if (x && M.body && (Ce || ae || Le && J)) {
        const E = {};
        ["status", "statusText", "headers"].forEach((le) => {
          E[le] = M[le];
        });
        const F = a.toFiniteNumber(st.getContentLength()), [V, K] = Ce && pt(
          F,
          Ae(mt(Ce), !0)
        ) || [];
        let ot = 0;
        const tn = (le) => {
          if (ae && (ot = le, ot > v))
            throw new m(
              "maxContentLength size of " + v + " exceeded",
              m.ERR_BAD_RESPONSE,
              d,
              P
            );
          V && V(le);
        };
        M = new i(
          gt(M.body, Et, tn, () => {
            K && K(), J && J();
          }),
          E
        );
      }
      z = z || "text";
      let q = await R[a.findKey(R, z) || "text"](
        M,
        d
      );
      if (ae && !x && !Le) {
        let E;
        if (q != null && (typeof q.byteLength == "number" ? E = q.byteLength : typeof q.size == "number" ? E = q.size : typeof q == "string" && (E = typeof r == "function" ? new r().encode(q).byteLength : q.length)), typeof E == "number" && E > v)
          throw new m(
            "maxContentLength size of " + v + " exceeded",
            m.ERR_BAD_RESPONSE,
            d,
            P
          );
      }
      return !Le && J && J(), await new Promise((E, F) => {
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
      if (J && J(), W && W.aborted && W.reason instanceof m) {
        const j = W.reason;
        throw j.config = d, P && (j.request = P), _ !== j && Object.defineProperty(j, "cause", {
          __proto__: null,
          value: _,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), j;
      }
      if (ce)
        throw P && !ce.request && (ce.request = P), ce;
      if (_ instanceof m)
        throw P && !_.request && (_.request = P), _;
      if (_ && _.name === "TypeError" && /Load failed|fetch/i.test(_.message)) {
        const j = new m(
          "Network Error",
          m.ERR_NETWORK,
          d,
          P,
          _ && _.response
        );
        throw Object.defineProperty(j, "cause", {
          __proto__: null,
          value: _.cause || _,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), j;
      }
      throw m.from(_, _ && _.code, d, P, _ && _.response);
    }
  };
}, hs = /* @__PURE__ */ new Map(), Xt = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: s } = t, o = [r, s, n];
  let i = o.length, c = i, u, l, f = hs;
  for (; c--; )
    u = o[c], l = f.get(u), l === void 0 && f.set(u, l = c ? /* @__PURE__ */ new Map() : ms(t)), f = l;
  return l;
};
Xt();
const Ze = {
  http: Er,
  xhr: es,
  fetch: {
    get: Xt
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
const St = (e) => `- ${e}`, ys = (e) => a.isFunction(e) || e === null || e === !1;
function gs(e, t) {
  e = a.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, s;
  const o = {};
  for (let i = 0; i < n; i++) {
    r = e[i];
    let c;
    if (s = r, !ys(r) && (s = Ze[(c = String(r)).toLowerCase()], s === void 0))
      throw new m(`Unknown adapter '${c}'`);
    if (s && (a.isFunction(s) || (s = s.get(t))))
      break;
    o[c || "#" + i] = s;
  }
  if (!s) {
    const i = Object.entries(o).map(
      ([u, l]) => `adapter ${u} ` + (l === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let c = n ? i.length > 1 ? `since :
` + i.map(St).join(`
`) : " " + St(i[0]) : "as no adapter specified";
    throw new m(
      "There is no suitable adapter to dispatch the request " + c,
      m.ERR_NOT_SUPPORT
    );
  }
  return s;
}
const Gt = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: gs,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Ze
};
function Ie(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new ye(null, e);
}
function ve(e) {
  return Ie(e), e.headers = L.from(e.headers), e.data = je.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Gt.getAdapter(e.adapter || he.adapter, e)(e).then(
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
const Pe = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Pe[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const Ot = {};
Pe.transitional = function(t, n, r) {
  function s(o, i) {
    return "[Axios v" + Qe + "] Transitional option '" + o + "'" + i + (r ? ". " + r : "");
  }
  return (o, i, c) => {
    if (t === !1)
      throw new m(
        s(i, " has been removed" + (n ? " in " + n : "")),
        m.ERR_DEPRECATED
      );
    return n && !Ot[i] && (Ot[i] = !0, console.warn(
      s(
        i,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(o, i, c) : !0;
  };
};
Pe.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function bs(e, t, n) {
  if (typeof e != "object" || e === null)
    throw new m("options must be an object", m.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0; ) {
    const o = r[s], i = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (i) {
      const c = e[o], u = c === void 0 || i(c, o, e);
      if (u !== !0)
        throw new m(
          "option " + o + " must be " + u,
          m.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (n !== !0)
      throw new m("Unknown option " + o, m.ERR_BAD_OPTION);
  }
}
const Se = {
  assertOptions: bs,
  validators: Pe
}, k = Se.validators;
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
`, i + 1), u = c === -1 ? "" : o.slice(c + 1);
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
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = Y(this.defaults, n);
    const { transitional: r, paramsSerializer: s, headers: o } = n;
    r !== void 0 && Se.assertOptions(
      r,
      {
        silentJSONParsing: k.transitional(k.boolean),
        forcedJSONParsing: k.transitional(k.boolean),
        clarifyTimeoutError: k.transitional(k.boolean),
        legacyInterceptorReqResOrdering: k.transitional(k.boolean),
        advertiseZstdAcceptEncoding: k.transitional(k.boolean),
        validateStatusUndefinedResolves: k.transitional(k.boolean)
      },
      !1
    ), s != null && (a.isFunction(s) ? n.paramsSerializer = {
      serialize: s
    } : Se.assertOptions(
      s,
      {
        encode: k.function,
        serialize: k.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Se.assertOptions(
      n,
      {
        baseUrl: k.spelling("baseURL"),
        withXsrfToken: k.spelling("withXSRFToken")
      },
      !0
    ), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let i = o && a.merge(o.common, o[n.method]);
    o && a.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (R) => {
      delete o[R];
    }), n.headers = L.concat(i, o);
    const c = [];
    let u = !0;
    this.interceptors.request.forEach(function(O) {
      if (typeof O.runWhen == "function" && O.runWhen(n) === !1)
        return;
      u = u && O.synchronous;
      const y = n.transitional || Xe;
      y && y.legacyInterceptorReqResOrdering ? c.unshift(O.fulfilled, O.rejected) : c.push(O.fulfilled, O.rejected);
    });
    const l = [];
    this.interceptors.response.forEach(function(O) {
      l.push(O.fulfilled, O.rejected);
    });
    let f, p = 0, b;
    if (!u) {
      const R = [ve.bind(this), void 0];
      for (R.unshift(...c), R.push(...l), b = R.length, f = Promise.resolve(n); p < b; )
        f = f.then(R[p++], R[p++]);
      return f;
    }
    b = c.length;
    let x = n;
    for (; p < b; ) {
      const R = c[p++], O = c[p++];
      try {
        x = R ? R(x) : x;
      } catch (y) {
        if (!O) {
          f = Promise.reject(y);
          break;
        }
        try {
          const d = O.call(this, y);
          a.isThenable(d) && (f = Promise.resolve(d).then(
            () => ve.call(this, x)
          ));
        } catch (d) {
          f = Promise.reject(d);
        }
        break;
      }
    }
    if (!f)
      try {
        f = ve.call(this, x);
      } catch (R) {
        f = Promise.reject(R);
      }
    for (p = 0, b = l.length; p < b; )
      f = f.then(l[p++], l[p++]);
    return f;
  }
  getUri(t) {
    t = Y(this.defaults, t);
    const n = Vt(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return qt(n, t.params, t.paramsSerializer);
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
let ws = class Qt {
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
      r.reason || (r.reason = new ye(o, i, c), n(r.reason));
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
      token: new Qt(function(s) {
        t = s;
      }),
      cancel: t
    };
  }
};
function Es(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function xs(e) {
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
  const t = new G(e), n = Nt(G.prototype.request, t);
  return a.extend(n, G.prototype, t, { allOwnKeys: !0 }), a.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(s) {
    return Zt(Y(e, s));
  }, n;
}
const T = Zt(he);
T.Axios = G;
T.CanceledError = ye;
T.CancelToken = ws;
T.isCancel = $t;
T.VERSION = Qe;
T.toFormData = Te;
T.AxiosError = m;
T.Cancel = T.CanceledError;
T.all = function(t) {
  return Promise.all(t);
};
T.spread = Es;
T.isAxiosError = xs;
T.mergeConfig = Y;
T.AxiosHeaders = L;
T.formToJSON = (e) => zt(a.isHTMLForm(e) ? new FormData(e) : e);
T.getAdapter = Gt.getAdapter;
T.HttpStatusCode = $e;
T.default = T;
const {
  Axios: Bs,
  AxiosError: js,
  CanceledError: Is,
  isCancel: vs,
  CancelToken: Ms,
  VERSION: qs,
  all: Hs,
  Cancel: zs,
  isAxiosError: $s,
  spread: Ws,
  toFormData: Vs,
  AxiosHeaders: Js,
  HttpStatusCode: Ks,
  formToJSON: Xs,
  getAdapter: Gs,
  mergeConfig: Qs,
  create: Zs
} = T, re = T.create({ baseURL: "/api" });
re.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const Rs = {
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
function A(e, t) {
  return ((t == null ? void 0 : t.site_lang) || localStorage.getItem("mortar_site_lang") || localStorage.getItem("mortar_lang") || "en") === "zh" && Rs[e] || e;
}
function Ss({ settings: e }) {
  const [t, n] = ne([]), [r, s] = ne(!1), [o, i] = ne(null);
  We(() => {
    re.get("/menus/location/primary").then((l) => n(l.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && re.get("/auth/me").then((l) => i(l.data)).catch(() => localStorage.removeItem("mortar_token"));
  }, []);
  function c() {
    re.post("/auth/logout").catch(() => {
    }), localStorage.removeItem("mortar_token"), window.location.href = "/";
  }
  const u = e.theme_header_image || "";
  return h.createElement(
    "header",
    { className: "bg-white" },
    u && h.createElement(
      "div",
      { className: "h-48 md:h-64 overflow-hidden" },
      h.createElement("img", { src: u, alt: "", className: "w-full h-full object-cover" })
    ),
    h.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-8 text-center" },
      h.createElement(
        B,
        { to: "/" },
        h.createElement("h1", { className: "text-3xl md:text-4xl font-normal tracking-tight text-gray-900" }, e.site_title || "Mortar")
      ),
      h.createElement("p", { className: "text-sm text-gray-500 mt-2" }, e.site_description || "")
    ),
    h.createElement(
      "nav",
      { className: "border-t border-gray-200" },
      h.createElement(
        "div",
        { className: "max-w-5xl mx-auto px-4 h-12 flex items-center justify-between" },
        h.createElement(
          "div",
          { className: "hidden md:flex items-center gap-8" },
          h.createElement(B, { to: "/", className: "text-sm text-gray-700 hover:text-gray-900" }, A("home", e)),
          t.filter((l) => !(l.url === "/" && (l.label.toLowerCase() === "home" || l.label === A("home", e)))).map((l) => h.createElement(B, { key: l.id, to: l.url, className: "text-sm text-gray-700 hover:text-gray-900" }, l.label)),
          h.createElement(B, { to: "/search", className: "text-sm text-gray-700 hover:text-gray-900" }, A("search", e))
        ),
        h.createElement(
          "div",
          { className: "hidden md:flex items-center gap-5 text-sm" },
          o ? h.createElement(
            h.Fragment,
            null,
            h.createElement("span", { className: "text-gray-600" }, o.username),
            h.createElement("button", { onClick: c, className: "text-gray-400 hover:text-gray-600" }, A("logout"))
          ) : h.createElement(B, { to: "/login", className: "text-gray-600 hover:text-gray-900" }, A("sign in")),
          h.createElement("a", { href: "/admin", className: "text-gray-900 font-medium hover:text-gray-600" }, A("admin", e))
        ),
        h.createElement("button", { onClick: () => s(!r), className: "md:hidden p-2 text-gray-600" }, r ? h.createElement(fn, { size: 20 }) : h.createElement(cn, { size: 20 }))
      ),
      r && h.createElement(
        "div",
        { className: "md:hidden border-t border-gray-100 px-4 py-3 space-y-2" },
        h.createElement(B, { to: "/", className: "block text-sm text-gray-700 py-1" }, A("home", e)),
        t.filter((l) => !(l.url === "/" && (l.label.toLowerCase() === "home" || l.label === A("home", e)))).map((l) => h.createElement(B, { key: l.id, to: l.url, className: "block text-sm text-gray-700 py-1" }, l.label)),
        o ? h.createElement("button", { onClick: c, className: "block text-sm text-gray-400 py-1" }, A("logout")) : h.createElement(B, { to: "/login", className: "block text-sm text-gray-700 py-1" }, A("sign in")),
        h.createElement("a", { href: "/admin", className: "block text-sm text-gray-900 py-1" }, A("admin", e))
      )
    )
  );
}
function Os() {
  const [e, t] = ne([]);
  if (We(() => {
    re.get("/tags").then((r) => t(r.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const n = Math.max(...e.map((r) => {
    var s;
    return ((s = r._count) == null ? void 0 : s.posts) || 0;
  }), 1);
  return h.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    h.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, A("tag cloud")),
    h.createElement(
      "div",
      { className: "flex flex-wrap gap-1.5" },
      e.map((r) => {
        var o, i, c;
        const s = 0.65 + (((o = r._count) == null ? void 0 : o.posts) || 0) / n * 0.35;
        return h.createElement(B, {
          key: r.id,
          to: "/tag/" + r.slug,
          className: "inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors",
          style: { fontSize: s + "rem" },
          title: (((i = r._count) == null ? void 0 : i.posts) || 0) + " " + A("posts")
        }, r.name + " (" + (((c = r._count) == null ? void 0 : c.posts) || 0) + ")");
      })
    )
  );
}
function _s() {
  const [e, t] = ne([]);
  return We(() => {
    re.get("/posts?limit=5").then((n) => t(n.data.posts || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : h.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    h.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, A("recent posts")),
    h.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((n) => h.createElement(
        "li",
        { key: n.id },
        h.createElement(B, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title)
      ))
    )
  );
}
function As() {
  const [e, t] = ne(""), n = nn(), r = (s) => {
    s.preventDefault(), e.trim() && n("/search?q=" + encodeURIComponent(e.trim()));
  };
  return h.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    h.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, A("search")),
    h.createElement(
      "form",
      { onSubmit: r, className: "flex gap-2" },
      h.createElement("input", {
        type: "text",
        value: e,
        onChange: (s) => t(s.target.value),
        placeholder: A("search placeholder"),
        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      }),
      h.createElement("button", {
        type: "submit",
        className: "px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      }, h.createElement(ln, { size: 16 }))
    )
  );
}
function Ns(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function Ts(e, t) {
  if (!e) return;
  const n = Ns(t.cdn_url);
  return n && e.startsWith("/uploads/") ? n + e : e;
}
function Ps(e) {
  const t = Date.now(), n = new Date(e).getTime(), r = t - n, s = Math.floor(r / 6e4);
  if (s < 1) return "just now";
  if (s < 60) return `${s}m ago`;
  const o = Math.floor(s / 60);
  if (o < 24) return `${o}h ago`;
  const i = Math.floor(o / 24);
  if (i < 7) return `${i}d ago`;
  const c = Math.floor(i / 7);
  return c < 5 ? `${c}w ago` : new Date(e).toLocaleDateString();
}
function Cs(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: i, catSlug: c, isTagPage: u } = e;
  return h.createElement(
    "div",
    null,
    c && h.createElement(
      "div",
      { className: "py-12 text-center" },
      h.createElement("h1", { className: "text-3xl font-normal text-gray-900 capitalize" }, (u ? A("tag", t) + ": " : "") + (c || "").replace(/-/g, " "))
    ),
    h.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-4 py-10" },
      h.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-3 gap-10" },
        h.createElement(
          "div",
          { className: "lg:col-span-2 space-y-10" },
          n.length === 0 ? h.createElement("p", { className: "text-gray-500 text-center py-16" }, A(i ? "failed to load posts" : "no posts yet", t)) : n.map(
            (l) => {
              var f, p;
              return h.createElement(
                "article",
                { key: l.id, className: "pb-8 border-b border-gray-200" },
                l.featured && h.createElement(
                  B,
                  { to: "/post/" + l.slug },
                  h.createElement("img", { src: Ts(l.featured, t), alt: l.title, className: "w-full h-56 object-cover mb-6", loading: "lazy" })
                ),
                h.createElement(
                  "div",
                  { className: "flex items-center gap-3 text-xs text-gray-500 mb-3" },
                  h.createElement("span", { className: "flex items-center gap-1" }, h.createElement(an, { size: 12 }), Ps(l.publishedAt || l.createdAt)),
                  h.createElement("span", { className: "flex items-center gap-1" }, h.createElement(un, { size: 12 }), (f = l.author) == null ? void 0 : f.username),
                  ((p = l.categories) == null ? void 0 : p[0]) && h.createElement("span", { className: "text-gray-400" }, l.categories[0].name)
                ),
                h.createElement(
                  B,
                  { to: "/post/" + l.slug },
                  h.createElement("h2", { className: "text-2xl font-normal text-gray-900 hover:text-gray-600 mb-3" }, l.title)
                ),
                l.excerpt && h.createElement("p", { className: "text-gray-600 text-sm leading-relaxed mb-4" }, l.excerpt),
                h.createElement(B, { to: "/post/" + l.slug, className: "text-sm font-medium text-gray-900 border-b border-gray-900 pb-0.5 hover:text-gray-600" }, A("read more", t), " →")
              );
            }
          ),
          r > parseInt(t.posts_per_page || "10") && h.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            h.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40" }, "← " + A("previous", t)),
            h.createElement("span", { className: "text-sm text-gray-400" }, A("page", t) + " " + s + " " + A("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
            h.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40" }, A("next", t) + " →")
          )
        ),
        h.createElement(
          "aside",
          { className: "space-y-6" },
          h.createElement(As),
          h.createElement(_s),
          h.createElement(Os)
        )
      )
    )
  );
}
const Ys = { name: "twentyseventeen", Header: Ss, HomeLayout: Cs };
export {
  Ys as default
};
