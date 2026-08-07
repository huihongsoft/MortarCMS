import a, { forwardRef as Xr, createElement as On, useState as Oe, useEffect as Ve } from "react";
import { Link as F, useNavigate as Va } from "react-router-dom";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ja = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Yr = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Xa = {
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
const Ya = Xr(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: l,
    ...c
  }, m) => On(
    "svg",
    {
      ref: m,
      ...Xa,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: Yr("lucide", s),
      ...c
    },
    [
      ...l.map(([f, d]) => On(f, d)),
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
const be = (e, t) => {
  const n = Xr(
    ({ className: r, ...s }, o) => On(Ya, {
      ref: o,
      iconNode: t,
      className: Yr(`lucide-${Ja(e)}`, r),
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
const Kr = be("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Je = be("Calendar", [
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
const Ka = be("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yt = be("Folder", [
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
const Za = be("House", [
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
const Qa = be("Link2", [
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
const es = be("Menu", [
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
const In = be("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zr = be("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ts = be("Tag", [
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
const ns = be("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kt = be("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rs = be("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function Qr(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: as } = Object.prototype, { getPrototypeOf: it } = Object, { iterator: Nt, toStringTag: ea } = Symbol, Vt = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), wt = (e, t) => {
  let n = e;
  const r = [];
  for (; n != null && n !== Object.prototype; ) {
    if (r.indexOf(n) !== -1)
      return !1;
    if (r.push(n), Vt(n, t))
      return !0;
    n = it(n);
  }
  return !1;
}, ss = (e, t) => e != null && wt(e, t) ? e[t] : void 0, Mn = /* @__PURE__ */ ((e) => (t) => {
  const n = as.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), xe = (e) => (e = e.toLowerCase(), (t) => Mn(t) === e), Zt = (e) => (t) => typeof t === e, { isArray: $e } = Array, We = Zt("undefined");
function lt(e) {
  return e !== null && !We(e) && e.constructor !== null && !We(e.constructor) && ge(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const ta = xe("ArrayBuffer");
function os(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && ta(e.buffer), t;
}
const is = Zt("string"), ge = Zt("function"), na = Zt("number"), ct = (e) => e !== null && typeof e == "object", ls = (e) => e === !0 || e === !1, qt = (e) => {
  if (!ct(e))
    return !1;
  const t = it(e);
  return (t === null || t === Object.prototype || it(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !wt(e, ea) && !wt(e, Nt);
}, cs = (e) => {
  if (!ct(e) || lt(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, us = xe("Date"), ms = xe("File"), fs = (e) => !!(e && typeof e.uri < "u"), ds = (e) => e && typeof e.getParts < "u", ps = xe("Blob"), hs = xe("FileList"), gs = xe("Set"), ys = (e) => ct(e) && ge(e.pipe);
function Es() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const pr = Es(), hr = typeof pr.FormData < "u" ? pr.FormData : void 0, bs = (e) => {
  if (!e) return !1;
  if (hr && e instanceof hr) return !0;
  const t = it(e);
  if (!t || t === Object.prototype || !ge(e.append)) return !1;
  const n = Mn(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && ge(e.toString) && e.toString() === "[object FormData]";
}, xs = xe("URLSearchParams"), [ws, _s, Ns, Ts] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(xe), As = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Tt(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, s;
  if (typeof e != "object" && (e = [e]), $e(e))
    for (r = 0, s = e.length; r < s; r++)
      t.call(null, e[r], r, e);
  else {
    if (lt(e))
      return;
    const o = n ? Object.getOwnPropertyNames(e) : Object.keys(e), l = o.length;
    let c;
    for (r = 0; r < l; r++)
      c = o[r], t.call(null, e[c], c, e);
  }
}
function ra(e, t) {
  if (lt(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, s;
  for (; r-- > 0; )
    if (s = n[r], t === s.toLowerCase())
      return s;
  return null;
}
const je = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, aa = (e) => !We(e) && e !== je;
function vn(...e) {
  const { caseless: t, skipUndefined: n } = aa(this) && this || {}, r = {}, s = (o, l) => {
    if (l === "__proto__" || l === "constructor" || l === "prototype")
      return;
    const c = t && typeof l == "string" && ra(r, l) || l, m = Vt(r, c) ? r[c] : void 0;
    qt(m) && qt(o) ? r[c] = vn(m, o) : qt(o) ? r[c] = vn({}, o) : $e(o) ? r[c] = o.slice() : (!n || !We(o)) && (r[c] = o);
  };
  for (let o = 0, l = e.length; o < l; o++) {
    const c = e[o];
    if (!c || lt(c) || (Tt(c, s), typeof c != "object" || $e(c)))
      continue;
    const m = Object.getOwnPropertySymbols(c);
    for (let f = 0; f < m.length; f++) {
      const d = m[f];
      Us.call(c, d) && s(c[d], d);
    }
  }
  return r;
}
const Ss = (e, t, n, { allOwnKeys: r } = {}) => (Tt(
  t,
  (s, o) => {
    n && ge(s) ? Object.defineProperty(e, o, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: Qr(s, n),
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
), e), Rs = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), Os = (e, t, n, r) => {
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
}, vs = (e, t, n, r) => {
  let s, o, l;
  const c = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0; )
      l = s[o], (!r || r(l, e, t)) && !c[l] && (t[l] = e[l], c[l] = !0);
    e = n !== !1 && it(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, Cs = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, ks = (e) => {
  if (!e) return null;
  if ($e(e)) return e;
  let t = e.length;
  if (!na(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, Ds = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && it(Uint8Array)), Ps = (e, t) => {
  const r = (e && e[Nt]).call(e);
  let s;
  for (; (s = r.next()) && !s.done; ) {
    const o = s.value;
    t.call(e, o[0], o[1]);
  }
}, Ls = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, Is = xe("HTMLFormElement"), Ms = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(n, r, s) {
  return r.toUpperCase() + s;
}), { propertyIsEnumerable: Us } = Object.prototype, Fs = xe("RegExp"), sa = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  Tt(n, (s, o) => {
    let l;
    (l = t(s, o, e)) !== !1 && (r[o] = l || s);
  }), Object.defineProperties(e, r);
}, zs = (e) => {
  sa(e, (t, n) => {
    if (ge(e) && ["arguments", "caller", "callee"].includes(n))
      return !1;
    const r = e[n];
    if (ge(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, Bs = (e, t) => {
  const n = {}, r = (s) => {
    s.forEach((o) => {
      n[o] = !0;
    });
  };
  return $e(e) ? r(e) : r(String(e).split(t)), n;
}, Hs = () => {
}, js = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function qs(e) {
  return !!(e && ge(e.append) && e[ea] === "FormData" && e[Nt]);
}
const $s = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (r) => {
    if (ct(r)) {
      if (t.has(r))
        return;
      if (lt(r))
        return r;
      if (!("toJSON" in r)) {
        t.add(r);
        let s;
        if (gs(r)) {
          s = [];
          for (const o of r) {
            const l = n(o);
            !We(l) && s.push(l);
          }
        } else
          s = $e(r) ? [] : {}, Tt(r, (o, l) => {
            const c = n(o);
            !We(c) && (s[l] = c);
          });
        return t.delete(r), s;
      }
    }
    return r;
  };
  return n(e);
}, Ws = xe("AsyncFunction"), Gs = (e) => e && (ct(e) || ge(e)) && ge(e.then) && ge(e.catch), oa = ((e, t) => e ? setImmediate : t ? ((n, r) => (je.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === je && o === n && r.length && r.shift()();
  },
  !1
), (s) => {
  r.push(s), je.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", ge(je.postMessage)), Vs = typeof queueMicrotask < "u" ? queueMicrotask.bind(je) : typeof process < "u" && process.nextTick || oa, ia = (e) => e != null && ge(e[Nt]), Js = (e) => e != null && wt(e, Nt) && ia(e), u = {
  isArray: $e,
  isArrayBuffer: ta,
  isBuffer: lt,
  isFormData: bs,
  isArrayBufferView: os,
  isString: is,
  isNumber: na,
  isBoolean: ls,
  isObject: ct,
  isPlainObject: qt,
  isEmptyObject: cs,
  isReadableStream: ws,
  isRequest: _s,
  isResponse: Ns,
  isHeaders: Ts,
  isUndefined: We,
  isDate: us,
  isFile: ms,
  isReactNativeBlob: fs,
  isReactNative: ds,
  isBlob: ps,
  isRegExp: Fs,
  isFunction: ge,
  isStream: ys,
  isURLSearchParams: xs,
  isTypedArray: Ds,
  isFileList: hs,
  forEach: Tt,
  merge: vn,
  extend: Ss,
  trim: As,
  stripBOM: Rs,
  inherits: Os,
  toFlatObject: vs,
  kindOf: Mn,
  kindOfTest: xe,
  endsWith: Cs,
  toArray: ks,
  forEachEntry: Ps,
  matchAll: Ls,
  isHTMLForm: Is,
  hasOwnProperty: Vt,
  hasOwnProp: Vt,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: wt,
  getSafeProp: ss,
  reduceDescriptors: sa,
  freezeMethods: zs,
  toObjectSet: Bs,
  toCamelCase: Ms,
  noop: Hs,
  toFiniteNumber: js,
  findKey: ra,
  global: je,
  isContextDefined: aa,
  isSpecCompliantForm: qs,
  toJSONObject: $s,
  isAsyncFn: Ws,
  isThenable: Gs,
  setImmediate: oa,
  asap: Vs,
  isIterable: ia,
  isSafeIterable: Js
}, Xs = u.toObjectSet([
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
]), Ys = (e) => {
  const t = {};
  let n, r, s;
  return e && e.split(`
`).forEach(function(l) {
    s = l.indexOf(":"), n = l.substring(0, s).trim().toLowerCase(), r = l.substring(s + 1).trim();
    const c = u.hasOwnProp(t, n);
    !n || c && u.hasOwnProp(Xs, n) || (n === "set-cookie" ? c ? t[n].push(r) : t[n] = [r] : t[n] = c ? t[n] + ", " + r : r);
  }), t;
};
function Ks(e) {
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
const Zs = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), Qs = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Un(e, t) {
  return u.isArray(e) ? e.map((n) => Un(n, t)) : Ks(String(e).replace(t, ""));
}
const eo = (e) => Un(e, Zs), to = (e) => Un(e, Qs);
function la(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return u.forEach(e.toJSON(), (n, r) => {
    t[r] = to(n);
  }), t;
}
const gr = Symbol("internals");
function yt(e) {
  return e && String(e).trim().toLowerCase();
}
function $t(e) {
  return e === !1 || e == null ? e : u.isArray(e) ? e.map($t) : eo(String(e));
}
function no(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const ro = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function yn(e) {
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
function ao(e) {
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
function so(e) {
  const t = /* @__PURE__ */ Object.create(null), n = String(e);
  let r = 0, s = !1, o = !1;
  function l(c) {
    const m = yn(n.slice(r, c)), f = m.indexOf("=");
    if (f < 1)
      return;
    const d = yn(m.slice(0, f));
    if (!ro.test(d))
      return;
    const y = d.toLowerCase();
    if (y === "__proto__" || y === "constructor" || y === "prototype")
      return;
    const O = yn(m.slice(f + 1));
    t[y] = ao(O);
  }
  for (let c = 0; c < n.length; c++) {
    const m = n.charCodeAt(c);
    s ? o ? o = !1 : m === 92 ? o = !0 : m === 34 && (s = !1) : m === 34 ? s = !0 : (m === 44 || m === 59) && (l(c), r = c + 1);
  }
  return l(n.length), t;
}
const oo = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function En(e, t, n, r, s) {
  if (u.isFunction(r))
    return r.call(this, t, n);
  if (s && (t = n), !!u.isString(t)) {
    if (u.isString(r))
      return t.indexOf(r) !== -1;
    if (u.isRegExp(r))
      return r.test(t);
  }
}
function io(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function lo(e, t) {
  const n = u.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(s, o, l) {
        return this[r].call(this, t, s, o, l);
      },
      configurable: !0
    });
  });
}
let me = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const s = this;
    function o(c, m, f) {
      const d = yt(m);
      if (!d)
        return;
      const y = u.findKey(s, d);
      (!y || s[y] === void 0 || f === !0 || f === void 0 && s[y] !== !1) && (s[y || m] = $t(c));
    }
    const l = (c, m) => u.forEach(c, (f, d) => o(f, d, m));
    if (u.isPlainObject(t) || t instanceof this.constructor)
      l(t, n);
    else if (u.isString(t) && (t = t.trim()) && !oo(t))
      l(Ys(t), n);
    else if (u.isObject(t) && u.isSafeIterable(t)) {
      let c = /* @__PURE__ */ Object.create(null), m, f;
      for (const d of t) {
        if (!u.isArray(d))
          throw new TypeError("Object iterator must return a key-value pair");
        f = d[0], u.hasOwnProp(c, f) ? (m = c[f], c[f] = u.isArray(m) ? [...m, d[1]] : [m, d[1]]) : c[f] = d[1];
      }
      l(c, n);
    } else
      t != null && o(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = yt(t), t) {
      const r = u.findKey(this, t);
      if (r) {
        const s = this[r];
        if (!n)
          return s;
        if (n === !0)
          return no(s);
        if (u.isFunction(n))
          return n.call(this, s, r);
        if (u.isRegExp(n))
          return n.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = yt(t), t) {
      const r = u.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || En(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function o(l) {
      if (l = yt(l), l) {
        const c = u.findKey(r, l);
        c && (!n || En(r, r[c], c, n)) && (delete r[c], s = !0);
      }
    }
    return u.isArray(t) ? t.forEach(o) : o(t), s;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length, s = !1;
    for (; r--; ) {
      const o = n[r];
      (!t || En(this, this[o], o, t, !0)) && (delete this[o], s = !0);
    }
    return s;
  }
  normalize(t) {
    const n = this, r = {};
    return u.forEach(this, (s, o) => {
      const l = u.findKey(r, o);
      if (l) {
        n[l] = $t(s), delete n[o];
        return;
      }
      const c = t ? io(o) : String(o).trim();
      c !== o && delete n[o], n[c] = $t(s), r[c] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = /* @__PURE__ */ Object.create(null);
    return u.forEach(this, (r, s) => {
      r != null && r !== !1 && (n[s] = t && u.isArray(r) ? r.join(", ") : r);
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
    return u.isArray(t) ? t : t == null || t === !1 ? [] : [t];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static parseParameters(t) {
    return so(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((s) => r.set(s)), r;
  }
  static accessor(t) {
    const r = (this[gr] = this[gr] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(l) {
      const c = yt(l);
      r[c] || (lo(s, l), r[c] = !0);
    }
    return u.isArray(t) ? t.forEach(o) : o(t), this;
  }
};
me.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
u.reduceDescriptors(me.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    }
  };
});
u.freezeMethods(me);
const Jt = "[REDACTED ****]";
function co(e) {
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
function uo(e, t) {
  const n = new Set(t.map((o) => String(o).toLowerCase())), r = [], s = (o) => {
    if (o === null || typeof o != "object" || u.isBuffer(o)) return o;
    if (r.indexOf(o) !== -1) return;
    o instanceof me && (o = o.toJSON()), r.push(o);
    let l;
    if (u.isArray(o))
      l = [], o.forEach((c, m) => {
        const f = s(c);
        u.isUndefined(f) || (l[m] = f);
      });
    else {
      if (!u.isPlainObject(o) && co(o))
        return r.pop(), o;
      l = /* @__PURE__ */ Object.create(null);
      for (const [c, m] of Object.entries(o)) {
        const f = n.has(c.toLowerCase()) ? Jt : s(m);
        u.isUndefined(f) || (l[c] = f);
      }
    }
    return r.pop(), l;
  };
  return s(e);
}
function yr(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function mo(e) {
  return e.errors.map((n) => {
    try {
      return n && n.message ? yr(n.message) : yr(n);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let R = class ca extends Error {
  static from(t, n, r, s, o, l) {
    let c = t.message;
    !c && u.isArray(t.errors) && t.errors.length && (c = mo(t));
    const m = new ca(c, n || t.code, r, s, o);
    return Object.defineProperty(m, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), m.name = t.name, t.status != null && m.status == null && (m.status = t.status), l && Object.assign(m, l), m;
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
    const t = this.config, n = t && u.hasOwnProp(t, "redact") ? t.redact : void 0, r = u.isArray(n) && n.length > 0 ? uo(t, n) : u.toJSONObject(t);
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
R.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
R.ERR_BAD_OPTION = "ERR_BAD_OPTION";
R.ECONNABORTED = "ECONNABORTED";
R.ETIMEDOUT = "ETIMEDOUT";
R.ECONNREFUSED = "ECONNREFUSED";
R.ERR_NETWORK = "ERR_NETWORK";
R.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
R.ERR_DEPRECATED = "ERR_DEPRECATED";
R.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
R.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
R.ERR_CANCELED = "ERR_CANCELED";
R.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
R.ERR_INVALID_URL = "ERR_INVALID_URL";
R.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const fo = null, ua = 100;
function Cn(e) {
  return u.isPlainObject(e) || u.isArray(e);
}
function ma(e) {
  return u.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function bn(e, t, n) {
  return e ? e.concat(t).map(function(s, o) {
    return s = ma(s), !n && o ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function po(e) {
  return u.isArray(e) && !e.some(Cn);
}
const ho = u.toFlatObject(u, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function Qt(e, t, n) {
  if (!u.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData(), n = u.toFlatObject(
    n,
    {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    },
    !1,
    function(P, I) {
      return !u.isUndefined(I[P]);
    }
  );
  const r = n.metaTokens, s = n.visitor || H, o = n.dots, l = n.indexes, c = n.Blob || typeof Blob < "u" && Blob, m = n.maxDepth === void 0 ? ua : n.maxDepth, f = c && u.isSpecCompliantForm(t), d = [];
  if (!u.isFunction(s))
    throw new TypeError("visitor must be a function");
  function y(b) {
    if (b === null) return "";
    if (u.isDate(b))
      return b.toISOString();
    if (u.isBoolean(b))
      return b.toString();
    if (!f && u.isBlob(b))
      throw new R("Blob is not supported. Use a Buffer instead.");
    if (u.isArrayBuffer(b) || u.isTypedArray(b)) {
      if (f && typeof c == "function")
        return new c([b]);
      throw new R("Blob is not supported. Use a Buffer instead.", R.ERR_NOT_SUPPORT);
    }
    return b;
  }
  function O(b) {
    if (b > m)
      throw new R(
        "Object is too deeply nested (" + b + " levels). Max depth: " + m,
        R.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function U(b, P) {
    if (m === 1 / 0)
      return JSON.stringify(b);
    const I = [];
    return JSON.stringify(b, function(h, S) {
      if (!u.isObject(S))
        return S;
      for (; I.length && I[I.length - 1] !== this; )
        I.pop();
      return I.push(S), O(P + I.length - 1), S;
    });
  }
  function H(b, P, I) {
    let M = b;
    if (u.isReactNative(t) && u.isReactNativeBlob(b))
      return t.append(bn(I, P, o), y(b)), !1;
    if (b && !I && typeof b == "object") {
      if (u.endsWith(P, "{}"))
        P = r ? P : P.slice(0, -2), b = U(b, 1);
      else if (u.isArray(b) && po(b) || (u.isFileList(b) || u.endsWith(P, "[]")) && (M = u.toArray(b)))
        return P = ma(P), M.forEach(function(S, g) {
          !(u.isUndefined(S) || S === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            l === !0 ? bn([P], g, o) : l === null ? P : P + "[]",
            y(S)
          );
        }), !1;
    }
    return Cn(b) ? !0 : (t.append(bn(I, P, o), y(b)), !1);
  }
  const D = Object.assign(ho, {
    defaultVisitor: H,
    convertValue: y,
    isVisitable: Cn
  });
  function v(b, P, I = 0) {
    if (!u.isUndefined(b)) {
      if (O(I), d.indexOf(b) !== -1)
        throw new Error("Circular reference detected in " + P.join("."));
      d.push(b), u.forEach(b, function(h, S) {
        (!(u.isUndefined(h) || h === null) && s.call(t, h, u.isString(S) ? S.trim() : S, P, D)) === !0 && v(h, P ? P.concat(S) : [S], I + 1);
      }), d.pop();
    }
  }
  if (!u.isObject(e))
    throw new TypeError("data must be an object");
  return v(e), t;
}
function Er(e) {
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
function Fn(e, t) {
  this._pairs = [], e && Qt(e, this, t);
}
const fa = Fn.prototype;
fa.append = function(t, n) {
  this._pairs.push([t, n]);
};
fa.toString = function(t) {
  const n = t ? (r) => t.call(this, r, Er) : Er;
  return this._pairs.map(function(s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function go(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function da(e, t, n) {
  if (!t)
    return e;
  e = e || "";
  const r = u.isFunction(n) ? {
    serialize: n
  } : n, s = u.getSafeProp(r, "encode") || go, o = u.getSafeProp(r, "serialize");
  let l;
  if (o ? l = o(t, r) : l = u.isURLSearchParams(t) ? t.toString() : new Fn(t, r).toString(s), l) {
    const c = e.indexOf("#");
    c !== -1 && (e = e.slice(0, c)), e += (e.indexOf("?") === -1 ? "?" : "&") + l;
  }
  return e;
}
class br {
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
    u.forEach(this.handlers, function(r) {
      r !== null && t(r);
    });
  }
}
const zn = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, yo = typeof URLSearchParams < "u" ? URLSearchParams : Fn, Eo = typeof FormData < "u" ? FormData : null, bo = typeof Blob < "u" ? Blob : null, xo = {
  isBrowser: !0,
  classes: {
    URLSearchParams: yo,
    FormData: Eo,
    Blob: bo
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Bn = typeof window < "u" && typeof document < "u", kn = typeof navigator == "object" && navigator || void 0, wo = Bn && (!kn || ["ReactNative", "NativeScript", "NS"].indexOf(kn.product) < 0), _o = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", No = Bn && window.location.href || "http://localhost", To = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Bn,
  hasStandardBrowserEnv: wo,
  hasStandardBrowserWebWorkerEnv: _o,
  navigator: kn,
  origin: No
}, Symbol.toStringTag, { value: "Module" })), se = {
  ...To,
  ...xo
};
function Ao(e, t) {
  return Qt(e, new se.classes.URLSearchParams(), {
    visitor: function(n, r, s, o) {
      return se.isNode && u.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const xr = ua;
function pa(e) {
  if (e > xr)
    throw new R(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + xr,
      R.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function So(e) {
  const t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g;
  let r;
  for (; (r = n.exec(e)) !== null; )
    pa(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
  return t;
}
function Ro(e) {
  const t = {}, n = Object.keys(e);
  let r;
  const s = n.length;
  let o;
  for (r = 0; r < s; r++)
    o = n[r], t[o] = e[o];
  return t;
}
function ha(e) {
  function t(n, r, s, o) {
    pa(o);
    let l = n[o++];
    if (l === "__proto__") return !0;
    const c = Number.isFinite(+l), m = o >= n.length;
    return l = !l && u.isArray(s) ? s.length : l, m ? (u.hasOwnProp(s, l) ? s[l] = u.isArray(s[l]) ? s[l].concat(r) : [s[l], r] : s[l] = r, !c) : ((!u.hasOwnProp(s, l) || !u.isObject(s[l])) && (s[l] = []), t(n, r, s[l], o) && u.isArray(s[l]) && (s[l] = Ro(s[l])), !c);
  }
  if (u.isFormData(e) && u.isFunction(e.entries)) {
    const n = {};
    return u.forEachEntry(e, (r, s) => {
      t(So(r), s, n, 0);
    }), n;
  }
  return null;
}
const rt = (e, t) => e != null && u.hasOwnProp(e, t) ? e[t] : void 0;
function Oo(e, t, n) {
  if (u.isString(e))
    try {
      return (t || JSON.parse)(e), u.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(e);
}
const At = {
  transitional: zn,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, n) {
      const r = n.getContentType() || "", s = r.indexOf("application/json") > -1, o = u.isObject(t);
      if (o && u.isHTMLForm(t) && (t = new FormData(t)), u.isFormData(t))
        return s ? JSON.stringify(ha(t)) : t;
      if (u.isArrayBuffer(t) || u.isBuffer(t) || u.isStream(t) || u.isFile(t) || u.isBlob(t) || u.isReadableStream(t))
        return t;
      if (u.isArrayBufferView(t))
        return t.buffer;
      if (u.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let c;
      if (o) {
        const m = rt(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return Ao(t, m).toString();
        if ((c = u.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const f = rt(this, "env"), d = f && f.FormData;
          return Qt(
            c ? { "files[]": t } : t,
            d && new d(),
            m
          );
        }
      }
      return o || s ? (n.setContentType("application/json", !1), Oo(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const n = rt(this, "transitional") || At.transitional, r = n && n.forcedJSONParsing, s = rt(this, "responseType"), o = s === "json";
      if (u.isResponse(t) || u.isReadableStream(t))
        return t;
      if (t && u.isString(t) && (r && !s || o)) {
        const c = !(n && n.silentJSONParsing) && o;
        try {
          return JSON.parse(t, rt(this, "parseReviver"));
        } catch (m) {
          if (c)
            throw m.name === "SyntaxError" ? R.from(m, R.ERR_BAD_RESPONSE, this, null, rt(this, "response")) : m;
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
    FormData: se.classes.FormData,
    Blob: se.classes.Blob
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
  At.headers[e] = {};
});
function xn(e, t) {
  const n = this || At, r = t || n, s = me.from(r.headers);
  let o = r.data;
  return u.forEach(e, function(c) {
    o = c.call(n, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function ga(e) {
  return !!(e && e.__CANCEL__);
}
let St = class extends R {
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
    super(t ?? "canceled", R.ERR_CANCELED, n, r), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function ya(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new R(
    "Request failed with status code " + n.status,
    n.status >= 400 && n.status < 500 ? R.ERR_BAD_REQUEST : R.ERR_BAD_RESPONSE,
    n.config,
    n.request,
    n
  ));
}
function vo(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Co(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let s = 0, o = 0, l;
  return t = t !== void 0 ? t : 1e3, function(m) {
    const f = Date.now(), d = r[o];
    l || (l = f), n[s] = m, r[s] = f;
    let y = o, O = 0;
    for (; y !== s; )
      O += n[y++], y = y % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), f - l < t)
      return;
    const U = d && f - d;
    return U ? Math.round(O * 1e3 / U) : void 0;
  };
}
function ko(e, t) {
  let n = 0, r = 1e3 / t, s, o;
  const l = (f, d = Date.now()) => {
    n = d, s = null, o && (clearTimeout(o), o = null), e(...f);
  };
  return [(...f) => {
    const d = Date.now(), y = d - n;
    y >= r ? l(f, d) : (s = f, o || (o = setTimeout(() => {
      o = null, l(s);
    }, r - y)));
  }, () => s && l(s)];
}
const Xt = (e, t, n = 3) => {
  let r = 0;
  const s = Co(50, 250);
  return ko((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const l = o.loaded, c = o.lengthComputable ? o.total : void 0, m = Math.max(0, c != null ? Math.min(l, c) : l), f = Math.max(0, m - r), d = s(f);
    r = Math.max(r, m);
    const y = {
      loaded: m,
      total: c,
      progress: c ? m / c : void 0,
      bytes: f,
      rate: d || void 0,
      estimated: d && c ? (c - m) / d : void 0,
      event: o,
      lengthComputable: c != null,
      [t ? "download" : "upload"]: !0
    };
    e(y);
  }, n);
}, wr = (e, t) => {
  const n = e != null;
  return [
    (r) => t[0]({
      lengthComputable: n,
      total: e,
      loaded: r
    }),
    t[1]
  ];
}, _r = (e, t = u.asap) => (...n) => t(() => e(...n)), Do = se.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, se.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(se.origin),
  se.navigator && /(msie|trident)/i.test(se.navigator.userAgent)
) : () => !0, Po = se.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, n, r, s, o, l) {
      if (typeof document > "u") return;
      const c = [`${e}=${encodeURIComponent(t)}`];
      u.isNumber(n) && c.push(`expires=${new Date(n).toUTCString()}`), u.isString(r) && c.push(`path=${r}`), u.isString(s) && c.push(`domain=${s}`), o === !0 && c.push("secure"), u.isString(l) && c.push(`SameSite=${l}`), document.cookie = c.join("; ");
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
function Lo(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Io(e, t) {
  if (!t)
    return e;
  let n = e.length;
  for (; n > 0 && e.charCodeAt(n - 1) === 47; )
    n--;
  return e.slice(0, n) + "/" + t.replace(/^\/+/, "");
}
const Mo = /^https?:(?!\/\/)/i, Uo = /[\t\n\r]/g;
function Fo(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function zo(e) {
  return Fo(e).replace(Uo, "");
}
function Bo(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, n, r = "") => `${n}${r}${Jt}`);
}
function Ho(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${Jt}@`), n = t.indexOf("#"), s = (n === -1 ? t : t.slice(0, n)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${Jt}`
  );
  return n === -1 ? s : `${s}#${Bo(t.slice(n + 1))}`;
}
function Nr(e, t) {
  if (typeof e == "string") {
    const n = zo(e);
    if (Mo.test(n))
      throw new R(
        `Invalid URL ${JSON.stringify(Ho(n))}: missing "//" after protocol`,
        R.ERR_INVALID_URL,
        t
      );
  }
}
function Ea(e, t, n, r) {
  Nr(t, r);
  let s = !Lo(t);
  return e && (s || n === !1) ? (Nr(e, r), Io(e, t)) : t;
}
const Tr = (e) => e instanceof me ? { ...e } : e, jo = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function Ge(e, t) {
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
  function r(d, y, O, U) {
    return u.isPlainObject(d) && u.isPlainObject(y) ? u.merge.call({ caseless: U }, d, y) : u.isPlainObject(y) ? u.merge({}, y) : u.isArray(y) ? y.slice() : y;
  }
  function s(d, y, O, U) {
    if (u.isUndefined(y)) {
      if (!u.isUndefined(d))
        return r(void 0, d, O, U);
    } else return r(d, y, O, U);
  }
  function o(d, y) {
    if (!u.isUndefined(y))
      return r(void 0, y);
  }
  function l(d, y) {
    if (u.isUndefined(y)) {
      if (!u.isUndefined(d))
        return r(void 0, d);
    } else return r(void 0, y);
  }
  function c(d) {
    const y = u.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!u.isUndefined(y))
      if (u.isPlainObject(y)) {
        if (u.hasOwnProp(y, d))
          return y[d];
      } else
        return;
    const O = u.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (u.isPlainObject(O) && u.hasOwnProp(O, d))
      return O[d];
  }
  function m(d, y, O) {
    if (u.hasOwnProp(t, O))
      return r(d, y);
    if (u.hasOwnProp(e, O))
      return r(void 0, d);
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
    validateStatus: m,
    headers: (d, y, O) => s(Tr(d), Tr(y), O, !0)
  };
  return u.forEach(jo({ ...e, ...t }), function(y) {
    if (y === "__proto__" || y === "constructor" || y === "prototype") return;
    const O = u.hasOwnProp(f, y) ? f[y] : s, U = u.hasOwnProp(e, y) ? e[y] : void 0, H = u.hasOwnProp(t, y) ? t[y] : void 0, D = O(U, H, y);
    u.isUndefined(D) && O !== m || (n[y] = D);
  }), u.hasOwnProp(t, "validateStatus") && u.isUndefined(t.validateStatus) && c("validateStatusUndefinedResolves") === !1 && (u.hasOwnProp(e, "validateStatus") ? n.validateStatus = r(void 0, e.validateStatus) : delete n.validateStatus), n;
}
const qo = ["content-type", "content-length"];
function $o(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([r, s]) => {
    qo.includes(r.toLowerCase()) && e.set(r, s);
  });
}
const Wo = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
);
function ba(e) {
  const t = Ge({}, e), n = (O) => u.hasOwnProp(t, O) ? t[O] : void 0, r = n("data");
  let s = n("withXSRFToken");
  const o = n("xsrfHeaderName"), l = n("xsrfCookieName");
  let c = n("headers");
  const m = n("auth"), f = n("baseURL"), d = n("allowAbsoluteUrls"), y = n("url");
  if (t.headers = c = me.from(c), t.url = da(
    Ea(f, y, d, t),
    n("params"),
    n("paramsSerializer")
  ), m) {
    const O = u.getSafeProp(m, "username") || "", U = u.getSafeProp(m, "password") || "";
    try {
      c.set(
        "Authorization",
        "Basic " + btoa(O + ":" + (U ? Wo(U) : ""))
      );
    } catch (H) {
      throw R.from(H, R.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (u.isFormData(r) && (se.hasStandardBrowserEnv || se.hasStandardBrowserWebWorkerEnv || u.isReactNative(r) ? c.setContentType(void 0) : u.isFunction(r.getHeaders) && $o(c, r.getHeaders(), n("formDataHeaderPolicy"))), se.hasStandardBrowserEnv && (u.isFunction(s) && (s = s(t)), s === !0 || s == null && Do(t.url))) {
    const U = o && l && Po.read(l);
    U && c.set(o, U);
  }
  return t;
}
const Go = typeof XMLHttpRequest < "u", Vo = Go && function(e) {
  return new Promise(function(n, r) {
    const s = ba(e);
    let o = s.data;
    const l = me.from(s.headers).normalize();
    let { responseType: c, onUploadProgress: m, onDownloadProgress: f } = s, d, y, O, U, H;
    function D() {
      U && U(), H && H(), s.cancelToken && s.cancelToken.unsubscribe(d), s.signal && s.signal.removeEventListener("abort", d);
    }
    let v = new XMLHttpRequest();
    v.open(s.method.toUpperCase(), s.url, !0), v.timeout = s.timeout;
    function b() {
      if (!v)
        return;
      const I = me.from(
        "getAllResponseHeaders" in v && v.getAllResponseHeaders()
      ), h = {
        data: !c || c === "text" || c === "json" ? v.responseText : v.response,
        status: v.status,
        statusText: v.statusText,
        headers: I,
        config: e,
        request: v
      };
      ya(
        function(g) {
          n(g), D();
        },
        function(g) {
          r(g), D();
        },
        h
      ), v = null;
    }
    "onloadend" in v ? v.onloadend = b : v.onreadystatechange = function() {
      !v || v.readyState !== 4 || v.status === 0 && !(v.responseURL && v.responseURL.startsWith("file:")) || setTimeout(b);
    }, v.onabort = function() {
      v && (r(new R("Request aborted", R.ECONNABORTED, e, v)), D(), v = null);
    }, v.onerror = function(M) {
      const h = M && M.message ? M.message : "Network Error", S = new R(h, R.ERR_NETWORK, e, v);
      S.event = M || null, r(S), D(), v = null;
    }, v.ontimeout = function() {
      let M = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const h = s.transitional || zn;
      s.timeoutErrorMessage && (M = s.timeoutErrorMessage), r(
        new R(
          M,
          h.clarifyTimeoutError ? R.ETIMEDOUT : R.ECONNABORTED,
          e,
          v
        )
      ), D(), v = null;
    }, o === void 0 && l.setContentType(null), "setRequestHeader" in v && u.forEach(la(l), function(M, h) {
      v.setRequestHeader(h, M);
    }), u.isUndefined(s.withCredentials) || (v.withCredentials = !!s.withCredentials), c && c !== "json" && (v.responseType = s.responseType), f && ([O, H] = Xt(f, !0), v.addEventListener("progress", O)), m && v.upload && ([y, U] = Xt(m), v.upload.addEventListener("progress", y), v.upload.addEventListener("loadend", U)), (s.cancelToken || s.signal) && (d = (I) => {
      v && (r(!I || I.type ? new St(null, e, v) : I), v.abort(), D(), v = null);
    }, s.cancelToken && s.cancelToken.subscribe(d), s.signal && (s.signal.aborted ? d() : s.signal.addEventListener("abort", d)));
    const P = vo(s.url);
    if (P && !se.protocols.includes(P)) {
      r(
        new R(
          "Unsupported protocol " + P + ":",
          R.ERR_BAD_REQUEST,
          e
        )
      ), D();
      return;
    }
    v.send(o || null);
  });
}, Jo = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const s = function(m) {
    if (!r) {
      r = !0, l();
      const f = m instanceof Error ? m : this.reason;
      n.abort(
        f instanceof R ? f : new St(f instanceof Error ? f.message : f)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, s(new R(`timeout of ${t}ms exceeded`, R.ETIMEDOUT));
  }, t);
  const l = () => {
    e && (o && clearTimeout(o), o = null, e.forEach((m) => {
      m.unsubscribe ? m.unsubscribe(s) : m.removeEventListener("abort", s);
    }), e = null);
  };
  e.forEach((m) => {
    if (!r) {
      if (m.aborted) {
        s.call(m);
        return;
      }
      m.addEventListener("abort", s, { once: !0 });
    }
  });
  const { signal: c } = n;
  return c.unsubscribe = () => u.asap(l), c;
}, Xo = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let r = 0, s;
  for (; r < n; )
    s = r + t, yield e.slice(r, s), r = s;
}, Yo = async function* (e, t) {
  for await (const n of Ko(e))
    yield* Xo(n, t);
}, Ko = async function* (e) {
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
}, Ar = (e, t, n, r) => {
  const s = Yo(e, t);
  let o = 0, l, c = (m) => {
    l || (l = !0, r && r(m));
  };
  return new ReadableStream(
    {
      async pull(m) {
        try {
          const { done: f, value: d } = await s.next();
          if (f) {
            c(), m.close();
            return;
          }
          let y = d.byteLength;
          if (n) {
            let O = o += y;
            n(O);
          }
          m.enqueue(new Uint8Array(d));
        } catch (f) {
          throw c(f), f;
        }
      },
      cancel(m) {
        return c(m), s.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, Sr = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, xa = (e, t, n) => t + 2 < n && Sr(e.charCodeAt(t + 1)) && Sr(e.charCodeAt(t + 2)), Rr = (e) => e <= 57 ? e - 48 : (e & 223) - 55, Zo = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, Qo = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, ei = (e) => {
  const t = Math.floor(e / 4), n = e % 4;
  return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, ti = (e) => {
  const t = e.length;
  let n = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, ni = (e) => {
  const t = e.length;
  let n = 0, r = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let l = e.charCodeAt(o);
    if (l === 37 && xa(e, o, t) && (l = Rr(e.charCodeAt(o + 1)) * 16 + Rr(e.charCodeAt(o + 2)), o += 2), !Qo(l)) {
      if (l === 61) {
        r++;
        continue;
      }
      if (!Zo(l) || r > 0) {
        s = !0;
        continue;
      }
      n++;
    }
  }
  return s || r > 2 || r > 0 && (n + r) % 4 !== 0 || n % 4 === 1 ? ti(e) : ei(n);
}, ri = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const n = e.indexOf(",");
  if (n < 0) return 0;
  const r = e.slice(5, n), s = e.slice(n + 1);
  if (/;base64/i.test(r))
    return t(s);
  let l = 0;
  for (let c = 0, m = s.length; c < m; c++) {
    const f = s.charCodeAt(c);
    if (f === 37 && xa(s, c, m))
      l += 1, c += 2;
    else if (f < 128)
      l += 1;
    else if (f < 2048)
      l += 2;
    else if (f >= 55296 && f <= 56319 && c + 1 < m) {
      const d = s.charCodeAt(c + 1);
      d >= 56320 && d <= 57343 ? (l += 4, c++) : l += 3;
    } else
      l += 3;
  }
  return l;
};
function ai(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return ri(
    t === -1 ? e : e.slice(0, t),
    ni
  );
}
const Hn = "1.19.0", Or = 64 * 1024, { isFunction: Ht } = u, si = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), vr = (e) => {
  if (!u.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, Cr = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, oi = (e) => {
  const t = e.indexOf("://");
  let n = e;
  return t !== -1 && (n = n.slice(t + 3)), n.includes("@") || n.includes(":");
}, ii = (e) => {
  const t = u.global !== void 0 && u.global !== null ? u.global : globalThis, { ReadableStream: n, TextEncoder: r } = t;
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
  const { fetch: s, Request: o, Response: l } = e, c = s ? Ht(s) : typeof fetch == "function", m = Ht(o), f = Ht(l);
  if (!c)
    return !1;
  const d = c && Ht(n), y = c && (typeof r == "function" ? /* @__PURE__ */ ((b) => (P) => b.encode(P))(new r()) : async (b) => new Uint8Array(await new o(b).arrayBuffer())), O = m && d && Cr(() => {
    let b = !1;
    const P = new o(se.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return b = !0, "half";
      }
    }), I = P.headers.has("Content-Type");
    return P.body != null && P.body.cancel(), b && !I;
  }), U = f && d && Cr(() => u.isReadableStream(new l("").body)), H = {
    stream: U && ((b) => b.body)
  };
  c && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((b) => {
    !H[b] && (H[b] = (P, I) => {
      let M = P && P[b];
      if (M)
        return M.call(P);
      throw new R(
        `Response type '${b}' is not supported`,
        R.ERR_NOT_SUPPORT,
        I
      );
    });
  });
  const D = async (b) => {
    if (b == null)
      return 0;
    if (u.isBlob(b))
      return b.size;
    if (u.isSpecCompliantForm(b))
      return (await new o(se.origin, {
        method: "POST",
        body: b
      }).arrayBuffer()).byteLength;
    if (u.isArrayBufferView(b) || u.isArrayBuffer(b))
      return b.byteLength;
    if (u.isURLSearchParams(b) && (b = b + ""), u.isString(b))
      return (await y(b)).byteLength;
  }, v = async (b, P) => {
    const I = u.toFiniteNumber(b.getContentLength());
    return I ?? D(P);
  };
  return async (b) => {
    let {
      url: P,
      method: I,
      data: M,
      signal: h,
      cancelToken: S,
      timeout: g,
      onDownloadProgress: B,
      onUploadProgress: G,
      responseType: V,
      headers: J,
      withCredentials: N = "same-origin",
      fetchOptions: _,
      maxContentLength: w,
      maxBodyLength: T
    } = ba(b);
    const Ne = u.isNumber(w) && w > -1, Ue = u.isNumber(T) && T > -1, Rt = (W) => u.hasOwnProp(b, W) ? b[W] : void 0;
    let Ot = s || fetch;
    V = V ? (V + "").toLowerCase() : "text";
    let Te = Jo(
      [h, S && S.toAbortSignal()],
      g
    ), te = null;
    const $ = Te && Te.unsubscribe && (() => {
      Te.unsubscribe();
    });
    let Ce, Fe = null;
    const vt = () => new R(
      "Request body larger than maxBodyLength limit",
      R.ERR_BAD_REQUEST,
      b,
      te
    );
    try {
      let W;
      const de = Rt("auth");
      if (de) {
        const C = u.getSafeProp(de, "username") || "", ne = u.getSafeProp(de, "password") || "";
        W = {
          username: C,
          password: ne
        };
      }
      if (oi(P)) {
        const C = new URL(P, se.origin);
        if (!W && (C.username || C.password)) {
          const ne = vr(C.username), we = vr(C.password);
          W = {
            username: ne,
            password: we
          };
        }
        (C.username || C.password) && (C.username = "", C.password = "", P = C.href);
      }
      if (W && (J.delete("authorization"), J.set(
        "Authorization",
        "Basic " + btoa(si((W.username || "") + ":" + (W.password || "")))
      )), Ne && typeof P == "string" && P.startsWith("data:") && ai(P) > w)
        throw new R(
          "maxContentLength size of " + w + " exceeded",
          R.ERR_BAD_RESPONSE,
          b,
          te
        );
      if (Ue && I !== "get" && I !== "head") {
        const C = await D(M);
        if (typeof C == "number" && isFinite(C) && (Ce = C, C > T))
          throw vt();
      }
      const Ye = Ue && (u.isReadableStream(M) || u.isStream(M)), ut = (C, ne, we) => Ar(
        C,
        Or,
        (le) => {
          if (Ue && le > T)
            throw Fe = vt();
          ne && ne(le);
        },
        we
      );
      if (O && I !== "get" && I !== "head" && (G || Ye)) {
        if (Ce = Ce ?? await v(J, M), Ce !== 0 || Ye) {
          let C = new o(P, {
            method: "POST",
            body: M,
            duplex: "half"
          }), ne;
          if (u.isFormData(M) && (ne = C.headers.get("content-type")) && J.setContentType(ne), C.body) {
            const [we, le] = G && wr(
              Ce,
              Xt(_r(G))
            ) || [];
            M = ut(C.body, we, le);
          }
        }
      } else if (Ye && !m && d && I !== "get" && I !== "head")
        M = ut(M);
      else if (Ye && m && !O && I !== "get" && I !== "head")
        throw new R(
          "Stream request bodies are not supported by the current fetch implementation",
          R.ERR_NOT_SUPPORT,
          b,
          te
        );
      u.isString(N) || (N = N ? "include" : "omit");
      const nn = m && "credentials" in o.prototype;
      if (u.isFormData(M)) {
        const C = J.getContentType();
        C && /^multipart\/form-data/i.test(C) && !/boundary=/i.test(C) && J.delete("content-type");
      }
      J.set("User-Agent", "axios/" + Hn, !1);
      const mt = {
        ..._,
        signal: Te,
        method: I.toUpperCase(),
        headers: la(J.normalize()),
        body: M,
        duplex: "half",
        credentials: nn ? N : void 0
      };
      te = m && new o(P, mt);
      let j = await (m ? Ot(te, _) : Ot(P, mt));
      const Ke = me.from(j.headers);
      if (Ne) {
        const C = u.toFiniteNumber(Ke.getContentLength());
        if (C != null && C > w)
          throw new R(
            "maxContentLength size of " + w + " exceeded",
            R.ERR_BAD_RESPONSE,
            b,
            te
          );
      }
      const X = U && (V === "stream" || V === "response");
      if (U && j.body && (B || Ne || X && $)) {
        const C = {};
        ["status", "statusText", "headers"].forEach((ke) => {
          C[ke] = j[ke];
        });
        const ne = u.toFiniteNumber(Ke.getContentLength()), [we, le] = B && wr(
          ne,
          Xt(_r(B), !0)
        ) || [];
        let ft = 0;
        const dt = (ke) => {
          if (Ne && (ft = ke, ft > w))
            throw new R(
              "maxContentLength size of " + w + " exceeded",
              R.ERR_BAD_RESPONSE,
              b,
              te
            );
          we && we(ke);
        };
        j = new l(
          Ar(j.body, Or, dt, () => {
            le && le(), $ && $();
          }),
          C
        );
      }
      V = V || "text";
      let ye = await H[u.findKey(H, V) || "text"](
        j,
        b
      );
      if (Ne && !U && !X) {
        let C;
        if (ye != null && (typeof ye.byteLength == "number" ? C = ye.byteLength : typeof ye.size == "number" ? C = ye.size : typeof ye == "string" && (C = typeof r == "function" ? new r().encode(ye).byteLength : ye.length)), typeof C == "number" && C > w)
          throw new R(
            "maxContentLength size of " + w + " exceeded",
            R.ERR_BAD_RESPONSE,
            b,
            te
          );
      }
      return !X && $ && $(), await new Promise((C, ne) => {
        ya(C, ne, {
          data: ye,
          headers: me.from(j.headers),
          status: j.status,
          statusText: j.statusText,
          config: b,
          request: te
        });
      });
    } catch (W) {
      if ($ && $(), Te && Te.aborted && Te.reason instanceof R) {
        const de = Te.reason;
        throw de.config = b, te && (de.request = te), W !== de && Object.defineProperty(de, "cause", {
          __proto__: null,
          value: W,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), de;
      }
      if (Fe)
        throw te && !Fe.request && (Fe.request = te), Fe;
      if (W instanceof R)
        throw te && !W.request && (W.request = te), W;
      if (W && W.name === "TypeError" && /Load failed|fetch/i.test(W.message)) {
        const de = new R(
          "Network Error",
          R.ERR_NETWORK,
          b,
          te,
          W && W.response
        );
        throw Object.defineProperty(de, "cause", {
          __proto__: null,
          value: W.cause || W,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), de;
      }
      throw R.from(W, W && W.code, b, te, W && W.response);
    }
  };
}, li = /* @__PURE__ */ new Map(), wa = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: s } = t, o = [r, s, n];
  let l = o.length, c = l, m, f, d = li;
  for (; c--; )
    m = o[c], f = d.get(m), f === void 0 && d.set(m, f = c ? /* @__PURE__ */ new Map() : ii(t)), d = f;
  return f;
};
wa();
const jn = {
  http: fo,
  xhr: Vo,
  fetch: {
    get: wa
  }
};
u.forEach(jn, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const kr = (e) => `- ${e}`, ci = (e) => u.isFunction(e) || e === null || e === !1;
function ui(e, t) {
  e = u.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, s;
  const o = {};
  for (let l = 0; l < n; l++) {
    r = e[l];
    let c;
    if (s = r, !ci(r) && (s = jn[(c = String(r)).toLowerCase()], s === void 0))
      throw new R(`Unknown adapter '${c}'`);
    if (s && (u.isFunction(s) || (s = s.get(t))))
      break;
    o[c || "#" + l] = s;
  }
  if (!s) {
    const l = Object.entries(o).map(
      ([m, f]) => `adapter ${m} ` + (f === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let c = n ? l.length > 1 ? `since :
` + l.map(kr).join(`
`) : " " + kr(l[0]) : "as no adapter specified";
    throw new R(
      "There is no suitable adapter to dispatch the request " + c,
      R.ERR_NOT_SUPPORT
    );
  }
  return s;
}
const _a = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: ui,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: jn
};
function wn(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new St(null, e);
}
function _n(e) {
  return wn(e), e.headers = me.from(e.headers), e.data = xn.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), _a.getAdapter(e.adapter || At.adapter, e)(e).then(
    function(r) {
      wn(e), e.response = r;
      try {
        r.data = xn.call(e, e.transformResponse, r);
      } finally {
        delete e.response;
      }
      return r.headers = me.from(r.headers), r;
    },
    function(r) {
      if (!ga(r) && (wn(e), r && r.response)) {
        e.response = r.response;
        try {
          r.response.data = xn.call(
            e,
            e.transformResponse,
            r.response
          );
        } finally {
          delete e.response;
        }
        r.response.headers = me.from(r.response.headers);
      }
      return Promise.reject(r);
    }
  );
}
const en = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  en[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const Dr = {};
en.transitional = function(t, n, r) {
  function s(o, l) {
    return "[Axios v" + Hn + "] Transitional option '" + o + "'" + l + (r ? ". " + r : "");
  }
  return (o, l, c) => {
    if (t === !1)
      throw new R(
        s(l, " has been removed" + (n ? " in " + n : "")),
        R.ERR_DEPRECATED
      );
    return n && !Dr[l] && (Dr[l] = !0, console.warn(
      s(
        l,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(o, l, c) : !0;
  };
};
en.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function mi(e, t, n) {
  if (typeof e != "object" || e === null)
    throw new R("options must be an object", R.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0; ) {
    const o = r[s], l = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (l) {
      const c = e[o], m = c === void 0 || l(c, o, e);
      if (m !== !0)
        throw new R(
          "option " + o + " must be " + m,
          R.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (n !== !0)
      throw new R("Unknown option " + o, R.ERR_BAD_OPTION);
  }
}
const Wt = {
  assertOptions: mi,
  validators: en
}, ce = Wt.validators;
let qe = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new br(),
      response: new br()
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
          const l = s.stack.indexOf(`
`);
          return l === -1 ? "" : s.stack.slice(l + 1);
        })();
        try {
          if (!r.stack)
            r.stack = o;
          else if (o) {
            const l = o.indexOf(`
`), c = l === -1 ? -1 : o.indexOf(`
`, l + 1), m = c === -1 ? "" : o.slice(c + 1);
            String(r.stack).endsWith(m) || (r.stack += `
` + o);
          }
        } catch {
        }
      }
      throw r;
    }
  }
  _request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = Ge(this.defaults, n);
    const { transitional: r, paramsSerializer: s, headers: o } = n;
    r !== void 0 && Wt.assertOptions(
      r,
      {
        silentJSONParsing: ce.transitional(ce.boolean),
        forcedJSONParsing: ce.transitional(ce.boolean),
        clarifyTimeoutError: ce.transitional(ce.boolean),
        legacyInterceptorReqResOrdering: ce.transitional(ce.boolean),
        advertiseZstdAcceptEncoding: ce.transitional(ce.boolean),
        validateStatusUndefinedResolves: ce.transitional(ce.boolean)
      },
      !1
    ), s != null && (u.isFunction(s) ? n.paramsSerializer = {
      serialize: s
    } : Wt.assertOptions(
      s,
      {
        encode: ce.function,
        serialize: ce.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Wt.assertOptions(
      n,
      {
        baseUrl: ce.spelling("baseURL"),
        withXsrfToken: ce.spelling("withXSRFToken")
      },
      !0
    ), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let l = o && u.merge(o.common, o[n.method]);
    o && u.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (H) => {
      delete o[H];
    }), n.headers = me.concat(l, o);
    const c = [];
    let m = !0;
    this.interceptors.request.forEach(function(D) {
      if (typeof D.runWhen == "function" && D.runWhen(n) === !1)
        return;
      m = m && D.synchronous;
      const v = n.transitional || zn;
      v && v.legacyInterceptorReqResOrdering ? c.unshift(D.fulfilled, D.rejected) : c.push(D.fulfilled, D.rejected);
    });
    const f = [];
    this.interceptors.response.forEach(function(D) {
      f.push(D.fulfilled, D.rejected);
    });
    let d, y = 0, O;
    if (!m) {
      const H = [_n.bind(this), void 0];
      for (H.unshift(...c), H.push(...f), O = H.length, d = Promise.resolve(n); y < O; )
        d = d.then(H[y++], H[y++]);
      return d;
    }
    O = c.length;
    let U = n;
    for (; y < O; ) {
      const H = c[y++], D = c[y++];
      try {
        U = H ? H(U) : U;
      } catch (v) {
        if (!D) {
          d = Promise.reject(v);
          break;
        }
        try {
          const b = D.call(this, v);
          u.isThenable(b) && (d = Promise.resolve(b).then(
            () => _n.call(this, U)
          ));
        } catch (b) {
          d = Promise.reject(b);
        }
        break;
      }
    }
    if (!d)
      try {
        d = _n.call(this, U);
      } catch (H) {
        d = Promise.reject(H);
      }
    for (y = 0, O = f.length; y < O; )
      d = d.then(f[y++], f[y++]);
    return d;
  }
  getUri(t) {
    t = Ge(this.defaults, t);
    const n = Ea(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return da(n, t.params, t.paramsSerializer);
  }
};
u.forEach(["delete", "get", "head", "options"], function(t) {
  qe.prototype[t] = function(n, r) {
    return this.request(
      Ge(r || {}, {
        method: t,
        url: n,
        data: r && u.hasOwnProp(r, "data") ? r.data : void 0
      })
    );
  };
});
u.forEach(["post", "put", "patch", "query"], function(t) {
  function n(r) {
    return function(o, l, c) {
      return this.request(
        Ge(c || {}, {
          method: t,
          headers: r ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: o,
          data: l
        })
      );
    };
  }
  qe.prototype[t] = n(), t !== "query" && (qe.prototype[t + "Form"] = n(!0));
});
let fi = class Na {
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
      const l = new Promise((c) => {
        r.subscribe(c), o = c;
      }).then(s);
      return l.cancel = function() {
        r.unsubscribe(o);
      }, l;
    }, t(function(o, l, c) {
      r.reason || (r.reason = new St(o, l, c), n(r.reason));
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
      token: new Na(function(s) {
        t = s;
      }),
      cancel: t
    };
  }
};
function di(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function pi(e) {
  return u.isObject(e) && e.isAxiosError === !0;
}
const Dn = {
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
Object.entries(Dn).forEach(([e, t]) => {
  Dn[t] = e;
});
function Ta(e) {
  const t = new qe(e), n = Qr(qe.prototype.request, t);
  return u.extend(n, qe.prototype, t, { allOwnKeys: !0 }), u.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(s) {
    return Ta(Ge(e, s));
  }, n;
}
const Q = Ta(At);
Q.Axios = qe;
Q.CanceledError = St;
Q.CancelToken = fi;
Q.isCancel = ga;
Q.VERSION = Hn;
Q.toFormData = Qt;
Q.AxiosError = R;
Q.Cancel = Q.CanceledError;
Q.all = function(t) {
  return Promise.all(t);
};
Q.spread = di;
Q.isAxiosError = pi;
Q.mergeConfig = Ge;
Q.AxiosHeaders = me;
Q.formToJSON = (e) => ha(u.isHTMLForm(e) ? new FormData(e) : e);
Q.getAdapter = _a.getAdapter;
Q.HttpStatusCode = Dn;
Q.default = Q;
const {
  Axios: Tl,
  AxiosError: Al,
  CanceledError: Sl,
  isCancel: Rl,
  CancelToken: Ol,
  VERSION: vl,
  all: Cl,
  Cancel: kl,
  isAxiosError: Dl,
  spread: Pl,
  toFormData: Ll,
  AxiosHeaders: Il,
  HttpStatusCode: Ml,
  formToJSON: Ul,
  getAdapter: Fl,
  mergeConfig: zl,
  create: Bl
} = Q, ve = Q.create({ baseURL: "/api" });
ve.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const hi = {
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
function E(e, t) {
  return ((t == null ? void 0 : t.site_lang) || localStorage.getItem("mortar_site_lang") || localStorage.getItem("mortar_lang") || "en") === "zh" && hi[e] || e;
}
function gi({ settings: e }) {
  const [t, n] = Oe([]), [r, s] = Oe(!1), [o, l] = Oe(null);
  Ve(() => {
    ve.get("/menus/location/primary").then((m) => n(m.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && ve.get("/auth/me").then((m) => l(m.data)).catch(() => localStorage.removeItem("mortar_token"));
  }, []);
  function c() {
    ve.post("/auth/logout").catch(() => {
    }), localStorage.removeItem("mortar_token"), window.location.href = "/";
  }
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
        a.createElement(F, { to: "/", className: "text-sm text-gray-600 hover:text-gray-900" }, E("home", e)),
        t.filter((m) => !(m.url === "/" && (m.label.toLowerCase() === "home" || m.label === E("home", e)))).map((m) => a.createElement(F, { key: m.id, to: m.url, className: "text-sm text-gray-600 hover:text-gray-900" }, m.label)),
        o ? a.createElement(
          "div",
          { className: "flex items-center gap-2" },
          a.createElement("span", { className: "text-sm text-gray-600" }, o.username),
          a.createElement("button", { onClick: c, className: "text-sm text-gray-400 hover:text-gray-600" }, E("logout"))
        ) : a.createElement(
          a.Fragment,
          null,
          a.createElement(F, { to: "/login", className: "text-sm text-gray-600 hover:text-gray-900" }, E("sign in")),
          a.createElement(F, { to: "/register", className: "text-sm text-gray-600 hover:text-gray-900" }, E("register", e))
        ),
        a.createElement("a", { href: "/admin", className: "text-sm text-primary-600 hover:text-primary-700 font-medium" }, E("admin", e))
      ),
      a.createElement(
        "div",
        { className: "flex items-center gap-3 md:hidden" },
        a.createElement("button", { onClick: () => s(!r), className: "p-2 text-gray-600" }, r ? a.createElement(rs, { size: 20 }) : a.createElement(es, { size: 20 }))
      )
    ),
    r && a.createElement(
      "div",
      { className: "md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2" },
      a.createElement(F, { to: "/", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, E("home", e)),
      t.filter((m) => !(m.url === "/" && (m.label.toLowerCase() === "home" || m.label === E("home", e)))).map((m) => a.createElement(F, { key: m.id, to: m.url, className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, m.label)),
      o ? a.createElement(
        a.Fragment,
        null,
        a.createElement("span", { className: "block text-sm text-gray-600 py-1" }, o.username),
        a.createElement("button", { onClick: c, className: "block text-sm text-gray-400 py-1" }, E("logout"))
      ) : a.createElement(F, { to: "/login", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, E("sign in")),
      a.createElement(F, { to: "/register", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, E("register", e)),
      a.createElement("a", { href: "/admin", className: "block text-sm text-primary-600 font-medium py-1" }, E("admin", e))
    )
  );
}
function yi({ settings: e }) {
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
            a.createElement("li", null, a.createElement(F, { to: "/", className: "text-sm text-gray-500 hover:text-gray-700" }, E("home", e))),
            a.createElement("li", null, a.createElement(F, { to: "/search", className: "text-sm text-gray-500 hover:text-gray-700" }, E("search", e))),
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
            a.createElement("li", null, a.createElement(F, { to: "/page/about", className: "text-sm text-gray-500 hover:text-gray-700" }, E("about", e))),
            a.createElement("li", null, a.createElement(F, { to: "/page/privacy-policy", className: "text-sm text-gray-500 hover:text-gray-700" }, E("privacy policy", e)))
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
        { className: "text-center pt-6 border-t border-gray-200" },
        a.createElement(
          "p",
          { className: "text-sm text-gray-500" },
          "© " + (/* @__PURE__ */ new Date()).getFullYear() + " " + (e.site_title || "Mortar CMS") + ". " + E("powered by", e) + " Mortar. ",
          a.createElement("a", { href: "/api/feed/rss", className: "text-primary-600 hover:text-primary-700", target: "_blank" }, E("rss feed", e))
        )
      )
    )
  );
}
function qn() {
  const [e, t] = Oe([]);
  if (Ve(() => {
    ve.get("/tags").then((r) => t(r.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const n = Math.max(...e.map((r) => {
    var s;
    return ((s = r._count) == null ? void 0 : s.posts) || 0;
  }), 1);
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("tag cloud")),
    a.createElement(
      "div",
      { className: "flex flex-wrap gap-1.5" },
      e.map((r) => {
        var o, l, c;
        const s = 0.65 + (((o = r._count) == null ? void 0 : o.posts) || 0) / n * 0.35;
        return a.createElement(F, {
          key: r.id,
          to: "/tag/" + r.slug,
          className: "inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors",
          style: { fontSize: s + "rem" },
          title: (((l = r._count) == null ? void 0 : l.posts) || 0) + " " + E("posts")
        }, r.name + " (" + (((c = r._count) == null ? void 0 : c.posts) || 0) + ")");
      })
    )
  );
}
function $n() {
  const [e, t] = Oe([]);
  return Ve(() => {
    ve.get("/posts?limit=5").then((n) => t(n.data.posts || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("recent posts")),
    a.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((n) => a.createElement(
        "li",
        { key: n.id },
        a.createElement(F, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title)
      ))
    )
  );
}
function Wn() {
  const [e, t] = Oe([]);
  return Ve(() => {
    ve.get("/posts/popular?limit=5").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, a.createElement(ns, { size: 14 }), E("popular posts")),
    a.createElement(
      "ul",
      { className: "space-y-2" },
      e.map(
        (n, r) => a.createElement(
          "li",
          { key: n.id, className: "flex items-start gap-2" },
          a.createElement("span", { className: "text-xs font-bold text-gray-300 mt-0.5 w-4" }, r + 1),
          a.createElement(F, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title),
          n.views > 0 && a.createElement("span", { className: "text-xs text-gray-400 ml-auto shrink-0" }, n.views + " " + E("views"))
        )
      )
    )
  );
}
function Gn() {
  const [e, t] = Oe([]);
  if (Ve(() => {
    ve.get("/posts/archives").then((r) => t(r.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const n = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("archives")),
    a.createElement(
      "ul",
      { className: "space-y-1" },
      e.map((r) => {
        const [s, o] = r.month.split("-");
        return a.createElement(
          "li",
          { key: r.month },
          a.createElement(
            F,
            { to: "/archive/" + s + "/" + o, className: "text-sm text-gray-600 hover:text-primary-600" },
            n[parseInt(o) - 1] + " " + s + " (" + r.count + ")"
          )
        );
      })
    )
  );
}
function Vn() {
  const [e, t] = Oe(""), n = Va(), r = (s) => {
    s.preventDefault(), e.trim() && n("/search?q=" + encodeURIComponent(e.trim()));
  };
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("search")),
    a.createElement(
      "form",
      { onSubmit: r, className: "flex gap-2" },
      a.createElement("input", {
        type: "text",
        value: e,
        onChange: (s) => t(s.target.value),
        placeholder: E("search placeholder"),
        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      }),
      a.createElement("button", {
        type: "submit",
        className: "px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      }, a.createElement(Zr, { size: 16 }))
    )
  );
}
function Jn() {
  const [e, t] = Oe([]);
  return Ve(() => {
    ve.get("/links").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("links")),
    a.createElement(
      "ul",
      { className: "space-y-1.5" },
      e.map(
        (n) => a.createElement(
          "li",
          { key: n.id },
          a.createElement(
            "a",
            { href: n.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600" },
            n.avatar ? a.createElement("img", { src: n.avatar, alt: "", className: "w-5 h-5 rounded-full object-cover" }) : null,
            a.createElement("span", { className: "truncate" }, n.name)
          )
        )
      )
    )
  );
}
function Aa(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function _t(e, t) {
  if (!e) return;
  const n = Aa(t.cdn_url);
  return n && e.startsWith("/uploads/") ? n + e : e;
}
function Ei(e, t) {
  let n = e;
  const r = Aa(t.cdn_url);
  return r && (n = n.replace(/(src|href)="\/uploads\//g, '$1="' + r + "/uploads/")), n.replace(/<img(?![^>]*loading=)[^>]*>/g, (s) => s.replace(/<img/, '<img loading="lazy"'));
}
function Xe(e) {
  const t = Date.now(), n = new Date(e).getTime(), r = t - n, s = Math.floor(r / 6e4);
  if (s < 1) return "just now";
  if (s < 60) return `${s}m ago`;
  const o = Math.floor(s / 60);
  if (o < 24) return `${o}h ago`;
  const l = Math.floor(o / 24);
  if (l < 7) return `${l}d ago`;
  const c = Math.floor(l / 7);
  return c < 5 ? `${c}w ago` : new Date(e).toLocaleDateString();
}
function tn(e) {
  const t = (e || "").replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(t / 200)) + " min read";
}
function bi(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function xi(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: l, catSlug: c, isTagPage: m, categories: f } = e;
  return a.createElement(
    "div",
    null,
    c && a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-12 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, (m ? E("tag", t) + ": " : "") + (c || "").replace(/-/g, " "))
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
          n.length === 0 ? l ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-8" },
            n.map((d) => {
              var y, O, U;
              return a.createElement(
                "article",
                { key: d.id, className: "pb-8 border-b border-gray-100 last:border-0" },
                d.featured && a.createElement("img", { src: _t(d.featured, t), alt: d.title, className: "w-full h-48 object-cover rounded-lg mb-4", loading: "lazy" }),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-3" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(d.publishedAt || d.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 12 }), a.createElement(F, { to: "/author/" + (((y = d.author) == null ? void 0 : y.username) || ""), className: "hover:text-primary-600" }, (O = d.author) == null ? void 0 : O.username)),
                  ((U = d.categories) == null ? void 0 : U[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Yt, { size: 12 }), d.categories[0].name)
                ),
                a.createElement(
                  F,
                  { to: "/post/" + d.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-2" }, d.format && d.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, bi(d.format), d.format.charAt(0).toUpperCase() + d.format.slice(1)) : null, d.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + E("featured", t)) : null, d.title)
                ),
                d.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, d.excerpt),
                a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, tn(d.content)),
                d.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, a.createElement(In, { size: 12 }), "" + d.commentCount),
                a.createElement(F, { to: "/post/" + d.slug, className: "inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700" }, E("read more", t))
              );
            })
          ),
          r > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + E("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, E("page", t) + " " + s + " " + E("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, E("next", t) + " →")
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
            })(), y = (O) => d.length === 0 || d.includes(O);
            return a.createElement(
              a.Fragment,
              null,
              y("search") && a.createElement(Vn),
              y("recent_posts") && a.createElement($n),
              y("popular") && a.createElement(Wn),
              y("tag_cloud") && a.createElement(qn),
              y("archives") && a.createElement(Gn),
              y("links") && a.createElement(Jn)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("categories", t)),
            f.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, E("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, f.map((d) => {
              var y;
              return a.createElement(
                "li",
                { key: d.id },
                a.createElement(F, { to: "/category/" + d.slug, className: "text-sm " + (c === d.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, d.name, ((y = d._count) == null ? void 0 : y.posts) > 0 ? a.createElement("span", { className: "text-gray-400 ml-1" }, "(" + d._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
function wi(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function _i(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: l, catSlug: c, categories: m } = e;
  return a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-10 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, (c || "").replace(/-/g, " ")),
      a.createElement("p", { className: "text-sm text-gray-500 mt-2" }, r + " " + E("posts", t))
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
          n.length === 0 ? l ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-8" },
            n.map((f) => {
              var d, y, O;
              return a.createElement(
                "article",
                { key: f.id, className: "pb-8 border-b border-gray-100 last:border-0" },
                f.featured && a.createElement("img", { src: _t(f.featured, t), alt: f.title, className: "w-full h-48 object-cover rounded-lg mb-4", loading: "lazy" }),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-3" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(f.publishedAt || f.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 12 }), a.createElement(F, { to: "/author/" + (((d = f.author) == null ? void 0 : d.username) || ""), className: "hover:text-primary-600" }, (y = f.author) == null ? void 0 : y.username)),
                  ((O = f.categories) == null ? void 0 : O[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Yt, { size: 12 }), f.categories[0].name)
                ),
                a.createElement(
                  F,
                  { to: "/post/" + f.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-2" }, f.format && f.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, wi(f.format), f.format.charAt(0).toUpperCase() + f.format.slice(1)) : null, f.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + E("featured", t)) : null, f.title)
                ),
                f.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, f.excerpt),
                a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, tn(f.content)),
                f.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, a.createElement(In, { size: 12 }), "" + f.commentCount),
                a.createElement(F, { to: "/post/" + f.slug, className: "inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700" }, E("read more", t))
              );
            })
          ),
          r > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + E("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, E("page", t) + " " + s + " " + E("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, E("next", t) + " →")
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
            })(), d = (y) => f.length === 0 || f.includes(y);
            return a.createElement(
              a.Fragment,
              null,
              d("search") && a.createElement(Vn),
              d("recent_posts") && a.createElement($n),
              d("popular") && a.createElement(Wn),
              d("tag_cloud") && a.createElement(qn),
              d("archives") && a.createElement(Gn),
              d("links") && a.createElement(Jn)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("categories", t)),
            m.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, E("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, m.map((f) => {
              var d;
              return a.createElement(
                "li",
                { key: f.id },
                a.createElement(F, { to: "/category/" + f.slug, className: "text-sm " + (c === f.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, f.name, ((d = f._count) == null ? void 0 : d.posts) > 0 ? a.createElement("span", { className: "text-gray-400 ml-1" }, "(" + f._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
function Ni(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function Ti(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: l, catSlug: c, categories: m } = e;
  return a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-10 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, E("tag", t) + ": " + (c || "").replace(/-/g, " ")),
      a.createElement("p", { className: "text-sm text-gray-500 mt-2" }, r + " " + E("posts", t))
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
          n.length === 0 ? l ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, E("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-8" },
            n.map((f) => {
              var d, y, O;
              return a.createElement(
                "article",
                { key: f.id, className: "pb-8 border-b border-gray-100 last:border-0" },
                f.featured && a.createElement("img", { src: _t(f.featured, t), alt: f.title, className: "w-full h-48 object-cover rounded-lg mb-4", loading: "lazy" }),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-3" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(f.publishedAt || f.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 12 }), a.createElement(F, { to: "/author/" + (((d = f.author) == null ? void 0 : d.username) || ""), className: "hover:text-primary-600" }, (y = f.author) == null ? void 0 : y.username)),
                  ((O = f.categories) == null ? void 0 : O[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Yt, { size: 12 }), f.categories[0].name)
                ),
                a.createElement(
                  F,
                  { to: "/post/" + f.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-2" }, f.format && f.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, Ni(f.format), f.format.charAt(0).toUpperCase() + f.format.slice(1)) : null, f.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + E("featured", t)) : null, f.title)
                ),
                f.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, f.excerpt),
                a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, tn(f.content)),
                f.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, a.createElement(In, { size: 12 }), "" + f.commentCount),
                a.createElement(F, { to: "/post/" + f.slug, className: "inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700" }, E("read more", t))
              );
            })
          ),
          r > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + E("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, E("page", t) + " " + s + " " + E("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, E("next", t) + " →")
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
            })(), d = (y) => f.length === 0 || f.includes(y);
            return a.createElement(
              a.Fragment,
              null,
              d("search") && a.createElement(Vn),
              d("recent_posts") && a.createElement($n),
              d("popular") && a.createElement(Wn),
              d("tag_cloud") && a.createElement(qn),
              d("archives") && a.createElement(Gn),
              d("links") && a.createElement(Jn)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("categories", t)),
            m.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, E("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, m.map((f) => {
              var d;
              return a.createElement(
                "li",
                { key: f.id },
                a.createElement(F, { to: "/category/" + f.slug, className: "text-sm " + (c === f.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, f.name, ((d = f._count) == null ? void 0 : d.posts) > 0 ? a.createElement("span", { className: "text-gray-400 ml-1" }, "(" + f._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
const Ai = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function Si(e) {
  const { data: t, year: n, month: r } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(F, { to: "/", className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6" }, a.createElement(Kr, { size: 14 }), E("back")),
    a.createElement("h1", { className: "text-2xl font-bold text-gray-900 mb-6" }, Ai[parseInt(r || "1") - 1] + " " + n),
    a.createElement("p", { className: "text-sm text-gray-500 mb-6" }, t.total + " " + E("posts")),
    t.posts.length === 0 ? a.createElement("p", { className: "text-gray-500" }, E("no posts in this month")) : a.createElement(
      "div",
      { className: "space-y-6" },
      t.posts.map((s) => a.createElement(
        "article",
        { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
        a.createElement(F, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, s.title)),
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
function Ri(e, t) {
  return !t || !e ? e : e.split(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi")).map(
    (r, s) => r.toLowerCase() === t.toLowerCase() ? a.createElement("mark", { key: s, className: "bg-yellow-200 rounded px-0.5" }, r) : r
  );
}
function Oi(e) {
  const { query: t, posts: n, loading: r } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement("h1", { className: "text-2xl font-bold text-gray-900 mb-2" }, E("search results")),
    a.createElement("p", { className: "text-sm text-gray-500 mb-6" }, t ? E("showing results for") + ' "' + t + '"' : E("enter a search term")),
    r ? a.createElement("p", { className: "text-gray-500" }, E("searching")) : n.length === 0 ? a.createElement(
      "div",
      { className: "text-center py-12" },
      a.createElement(Zr, { size: 48, className: "mx-auto text-gray-300 mb-4" }),
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no results for") + ' "' + t + '"'),
      a.createElement("p", { className: "text-sm text-gray-500 mb-4" }, E("try different keywords")),
      a.createElement(F, { to: "/", className: "text-primary-600 text-sm" }, "← " + E("browse all posts"))
    ) : a.createElement(
      "div",
      { className: "space-y-6" },
      n.map((s) => {
        var o;
        return a.createElement(
          "article",
          { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
          a.createElement(F, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, s.title)),
          a.createElement(
            "div",
            { className: "flex items-center gap-3 text-xs text-gray-500 mb-2" },
            a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(s.publishedAt || s.createdAt)),
            a.createElement("span", null, E("written by") + " " + (((o = s.author) == null ? void 0 : o.username) || "Unknown"))
          ),
          s.excerpt && a.createElement("p", { className: "text-sm text-gray-600" }, Ri(s.excerpt, t))
        );
      })
    )
  );
}
function vi(e) {
  const { username: t, posts: n, loading: r } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(F, { to: "/", className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6" }, a.createElement(Kr, { size: 14 }), E("back")),
    a.createElement(
      "div",
      { className: "flex items-center gap-3 mb-8" },
      a.createElement("div", { className: "w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-bold" }, (t || "?")[0].toUpperCase()),
      a.createElement(
        "div",
        null,
        a.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, t),
        a.createElement("p", { className: "text-sm text-gray-500" }, n.length + " " + E("posts"))
      )
    ),
    r ? a.createElement("p", { className: "text-gray-500" }, E("loading")) : n.length === 0 ? a.createElement("p", { className: "text-gray-500" }, E("no posts yet")) : a.createElement(
      "div",
      { className: "space-y-6" },
      n.map((s) => {
        var o;
        return a.createElement(
          "article",
          { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
          a.createElement(F, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, s.title)),
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
function Sa({ items: e }) {
  return a.createElement(
    "nav",
    { className: "flex items-center gap-1 text-sm text-gray-500 mb-6", "aria-label": "Breadcrumb" },
    a.createElement(F, { to: "/", className: "hover:text-gray-700 flex items-center gap-1" }, a.createElement(Za, { size: 14 })),
    e.map((t, n) => a.createElement(
      a.Fragment,
      { key: n },
      a.createElement(Ka, { size: 12, className: "text-gray-300" }),
      n === e.length - 1 || !t.to ? a.createElement("span", { className: "text-gray-900 font-medium" }, t.label) : a.createElement(F, { to: t.to, className: "hover:text-gray-700" }, t.label)
    ))
  );
}
function Ci({ postId: e, slug: t }) {
  const [n, r] = Oe([]);
  return Ve(() => {
    e && ve.get("/posts/" + e + "/related").then((s) => r(s.data)).catch(() => {
    });
  }, [e]), n.length === 0 ? a.createElement("p", { className: "text-sm text-gray-400" }, E("no related posts")) : a.createElement(
    "div",
    { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
    n.map((s) => a.createElement(
      F,
      { key: s.id, to: "/post/" + s.slug, className: "group block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all" },
      a.createElement("h4", { className: "text-sm font-medium text-gray-900 group-hover:text-primary-600 mb-1" }, s.title),
      a.createElement("p", { className: "text-xs text-gray-500 line-clamp-2" }, s.excerpt || "")
    ))
  );
}
function ki({ title: e, url: t, siteUrl: n }) {
  const r = (n || window.location.origin) + t, s = encodeURIComponent(r), o = encodeURIComponent(e);
  async function l() {
    try {
      await navigator.clipboard.writeText(r), alert(E("link copied to clipboard"));
    } catch {
      window.prompt(E("copy link"), r);
    }
  }
  const c = (m) => a.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" }, a.createElement("path", { d: m }));
  return a.createElement(
    "div",
    { className: "flex items-center gap-2" },
    a.createElement("span", { className: "text-xs text-gray-400 mr-1" }, E("share") + ":"),
    a.createElement("a", { href: "https://twitter.com/intent/tweet?url=" + s + "&text=" + o, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors", title: "Twitter" }, c("M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z")),
    a.createElement("a", { href: "https://www.facebook.com/sharer/sharer.php?u=" + s, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors", title: "Facebook" }, c("M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z")),
    a.createElement("a", { href: "https://www.linkedin.com/sharing/share-offsite/?url=" + s, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", title: "LinkedIn" }, c("M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.9-2.2 4.18 0 4.95 2.75 4.95 6.32V24h-4v-8.6c0-2.05-.04-4.7-2.86-4.7-2.86 0-3.3 2.24-3.3 4.55V24h-4V8z")),
    a.createElement("button", { onClick: l, className: "p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors", title: E("copy link") }, a.createElement(Qa, { size: 14 }))
  );
}
function Di(e) {
  return e.replace(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/g,
    '<div class="aspect-video my-4"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen class="w-full h-full rounded-lg"></iframe></div>'
  ).replace(
    /(?:https?:\/\/)?twitter\.com\/(\w+)\/status\/(\d+)/g,
    '<blockquote class="twitter-tweet my-4"><a href="https://twitter.com/$1/status/$2"></a></blockquote>'
  );
}
function Pi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Gt = { exports: {} }, Li = Gt.exports, Pr;
function Ii() {
  return Pr || (Pr = 1, (function(e) {
    (function(t) {
      function n(h, S) {
        var g = (h & 65535) + (S & 65535), B = (h >> 16) + (S >> 16) + (g >> 16);
        return B << 16 | g & 65535;
      }
      function r(h, S) {
        return h << S | h >>> 32 - S;
      }
      function s(h, S, g, B, G, V) {
        return n(r(n(n(S, h), n(B, V)), G), g);
      }
      function o(h, S, g, B, G, V, J) {
        return s(S & g | ~S & B, h, S, G, V, J);
      }
      function l(h, S, g, B, G, V, J) {
        return s(S & B | g & ~B, h, S, G, V, J);
      }
      function c(h, S, g, B, G, V, J) {
        return s(S ^ g ^ B, h, S, G, V, J);
      }
      function m(h, S, g, B, G, V, J) {
        return s(g ^ (S | ~B), h, S, G, V, J);
      }
      function f(h, S) {
        h[S >> 5] |= 128 << S % 32, h[(S + 64 >>> 9 << 4) + 14] = S;
        var g, B, G, V, J, N = 1732584193, _ = -271733879, w = -1732584194, T = 271733878;
        for (g = 0; g < h.length; g += 16)
          B = N, G = _, V = w, J = T, N = o(N, _, w, T, h[g], 7, -680876936), T = o(T, N, _, w, h[g + 1], 12, -389564586), w = o(w, T, N, _, h[g + 2], 17, 606105819), _ = o(_, w, T, N, h[g + 3], 22, -1044525330), N = o(N, _, w, T, h[g + 4], 7, -176418897), T = o(T, N, _, w, h[g + 5], 12, 1200080426), w = o(w, T, N, _, h[g + 6], 17, -1473231341), _ = o(_, w, T, N, h[g + 7], 22, -45705983), N = o(N, _, w, T, h[g + 8], 7, 1770035416), T = o(T, N, _, w, h[g + 9], 12, -1958414417), w = o(w, T, N, _, h[g + 10], 17, -42063), _ = o(_, w, T, N, h[g + 11], 22, -1990404162), N = o(N, _, w, T, h[g + 12], 7, 1804603682), T = o(T, N, _, w, h[g + 13], 12, -40341101), w = o(w, T, N, _, h[g + 14], 17, -1502002290), _ = o(_, w, T, N, h[g + 15], 22, 1236535329), N = l(N, _, w, T, h[g + 1], 5, -165796510), T = l(T, N, _, w, h[g + 6], 9, -1069501632), w = l(w, T, N, _, h[g + 11], 14, 643717713), _ = l(_, w, T, N, h[g], 20, -373897302), N = l(N, _, w, T, h[g + 5], 5, -701558691), T = l(T, N, _, w, h[g + 10], 9, 38016083), w = l(w, T, N, _, h[g + 15], 14, -660478335), _ = l(_, w, T, N, h[g + 4], 20, -405537848), N = l(N, _, w, T, h[g + 9], 5, 568446438), T = l(T, N, _, w, h[g + 14], 9, -1019803690), w = l(w, T, N, _, h[g + 3], 14, -187363961), _ = l(_, w, T, N, h[g + 8], 20, 1163531501), N = l(N, _, w, T, h[g + 13], 5, -1444681467), T = l(T, N, _, w, h[g + 2], 9, -51403784), w = l(w, T, N, _, h[g + 7], 14, 1735328473), _ = l(_, w, T, N, h[g + 12], 20, -1926607734), N = c(N, _, w, T, h[g + 5], 4, -378558), T = c(T, N, _, w, h[g + 8], 11, -2022574463), w = c(w, T, N, _, h[g + 11], 16, 1839030562), _ = c(_, w, T, N, h[g + 14], 23, -35309556), N = c(N, _, w, T, h[g + 1], 4, -1530992060), T = c(T, N, _, w, h[g + 4], 11, 1272893353), w = c(w, T, N, _, h[g + 7], 16, -155497632), _ = c(_, w, T, N, h[g + 10], 23, -1094730640), N = c(N, _, w, T, h[g + 13], 4, 681279174), T = c(T, N, _, w, h[g], 11, -358537222), w = c(w, T, N, _, h[g + 3], 16, -722521979), _ = c(_, w, T, N, h[g + 6], 23, 76029189), N = c(N, _, w, T, h[g + 9], 4, -640364487), T = c(T, N, _, w, h[g + 12], 11, -421815835), w = c(w, T, N, _, h[g + 15], 16, 530742520), _ = c(_, w, T, N, h[g + 2], 23, -995338651), N = m(N, _, w, T, h[g], 6, -198630844), T = m(T, N, _, w, h[g + 7], 10, 1126891415), w = m(w, T, N, _, h[g + 14], 15, -1416354905), _ = m(_, w, T, N, h[g + 5], 21, -57434055), N = m(N, _, w, T, h[g + 12], 6, 1700485571), T = m(T, N, _, w, h[g + 3], 10, -1894986606), w = m(w, T, N, _, h[g + 10], 15, -1051523), _ = m(_, w, T, N, h[g + 1], 21, -2054922799), N = m(N, _, w, T, h[g + 8], 6, 1873313359), T = m(T, N, _, w, h[g + 15], 10, -30611744), w = m(w, T, N, _, h[g + 6], 15, -1560198380), _ = m(_, w, T, N, h[g + 13], 21, 1309151649), N = m(N, _, w, T, h[g + 4], 6, -145523070), T = m(T, N, _, w, h[g + 11], 10, -1120210379), w = m(w, T, N, _, h[g + 2], 15, 718787259), _ = m(_, w, T, N, h[g + 9], 21, -343485551), N = n(N, B), _ = n(_, G), w = n(w, V), T = n(T, J);
        return [N, _, w, T];
      }
      function d(h) {
        var S, g = "", B = h.length * 32;
        for (S = 0; S < B; S += 8)
          g += String.fromCharCode(h[S >> 5] >>> S % 32 & 255);
        return g;
      }
      function y(h) {
        var S, g = [];
        for (g[(h.length >> 2) - 1] = void 0, S = 0; S < g.length; S += 1)
          g[S] = 0;
        var B = h.length * 8;
        for (S = 0; S < B; S += 8)
          g[S >> 5] |= (h.charCodeAt(S / 8) & 255) << S % 32;
        return g;
      }
      function O(h) {
        return d(f(y(h), h.length * 8));
      }
      function U(h, S) {
        var g, B = y(h), G = [], V = [], J;
        for (G[15] = V[15] = void 0, B.length > 16 && (B = f(B, h.length * 8)), g = 0; g < 16; g += 1)
          G[g] = B[g] ^ 909522486, V[g] = B[g] ^ 1549556828;
        return J = f(G.concat(y(S)), 512 + S.length * 8), d(f(V.concat(J), 640));
      }
      function H(h) {
        var S = "0123456789abcdef", g = "", B, G;
        for (G = 0; G < h.length; G += 1)
          B = h.charCodeAt(G), g += S.charAt(B >>> 4 & 15) + S.charAt(B & 15);
        return g;
      }
      function D(h) {
        return unescape(encodeURIComponent(h));
      }
      function v(h) {
        return O(D(h));
      }
      function b(h) {
        return H(v(h));
      }
      function P(h, S) {
        return U(D(h), D(S));
      }
      function I(h, S) {
        return H(P(h, S));
      }
      function M(h, S, g) {
        return S ? g ? P(S, h) : I(S, h) : g ? v(h) : b(h);
      }
      e.exports ? e.exports = M : t.md5 = M;
    })(Li);
  })(Gt)), Gt.exports;
}
var Mi = Ii();
const Ui = /* @__PURE__ */ Pi(Mi);
function Fi(e, t = 80) {
  return "https://www.gravatar.com/avatar/" + Ui(e.trim().toLowerCase()) + "?s=" + t + "&d=mp";
}
/*! @license DOMPurify 3.4.13 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.13/LICENSE */
function Lr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function zi(e) {
  if (Array.isArray(e)) return e;
}
function Bi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, s, o, l, c = [], m = !0, f = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(m = (r = o.call(n)).done) && (c.push(r.value), c.length !== t); m = !0) ;
    } catch (d) {
      f = !0, s = d;
    } finally {
      try {
        if (!m && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (f) throw s;
      }
    }
    return c;
  }
}
function Hi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ji(e, t) {
  return zi(e) || Bi(e, t) || qi(e, t) || Hi();
}
function qi(e, t) {
  if (e) {
    if (typeof e == "string") return Lr(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lr(e, t) : void 0;
  }
}
const Ra = Object.entries, Ir = Object.setPrototypeOf, $i = Object.isFrozen, Wi = Object.getPrototypeOf, Gi = Object.getOwnPropertyDescriptor;
let oe = Object.freeze, ie = Object.seal, ot = Object.create, Oa = typeof Reflect < "u" && Reflect, Pn = Oa.apply, Ln = Oa.construct;
oe || (oe = function(t) {
  return t;
});
ie || (ie = function(t) {
  return t;
});
Pn || (Pn = function(t, n) {
  for (var r = arguments.length, s = new Array(r > 2 ? r - 2 : 0), o = 2; o < r; o++)
    s[o - 2] = arguments[o];
  return t.apply(n, s);
});
Ln || (Ln = function(t) {
  for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), s = 1; s < n; s++)
    r[s - 1] = arguments[s];
  return new t(...r);
});
const at = ee(Array.prototype.forEach), Vi = ee(Array.prototype.lastIndexOf), Mr = ee(Array.prototype.pop), st = ee(Array.prototype.push), Ji = ee(Array.prototype.splice), Me = Array.isArray, xt = ee(String.prototype.toLowerCase), Nn = ee(String.prototype.toString), Ur = ee(String.prototype.match), Et = ee(String.prototype.replace), Fr = ee(String.prototype.indexOf), Xi = ee(String.prototype.trim), Yi = ee(Number.prototype.toString), Ki = ee(Boolean.prototype.toString), zr = typeof BigInt > "u" ? null : ee(BigInt.prototype.toString), Br = typeof Symbol > "u" ? null : ee(Symbol.prototype.toString), ae = ee(Object.prototype.hasOwnProperty), bt = ee(Object.prototype.toString), re = ee(RegExp.prototype.test), He = Zi(TypeError);
function ee(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), s = 1; s < n; s++)
      r[s - 1] = arguments[s];
    return Pn(e, t, r);
  };
}
function Zi(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
      n[r] = arguments[r];
    return Ln(e, n);
  };
}
function q(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : xt;
  if (Ir && Ir(e, null), !Me(t))
    return e;
  let r = t.length;
  for (; r--; ) {
    let s = t[r];
    if (typeof s == "string") {
      const o = n(s);
      o !== s && ($i(t) || (t[r] = o), s = o);
    }
    e[s] = !0;
  }
  return e;
}
function Qi(e) {
  for (let t = 0; t < e.length; t++)
    ae(e, t) || (e[t] = null);
  return e;
}
function ue(e) {
  const t = ot(null);
  for (const r of Ra(e)) {
    var n = ji(r, 2);
    const s = n[0], o = n[1];
    ae(e, s) && (Me(o) ? t[s] = Qi(o) : o && typeof o == "object" && o.constructor === Object ? t[s] = ue(o) : t[s] = o);
  }
  return t;
}
function el(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return Yi(e);
    case "boolean":
      return Ki(e);
    case "bigint":
      return zr ? zr(e) : "0";
    case "symbol":
      return Br ? Br(e) : "Symbol()";
    case "undefined":
      return bt(e);
    case "function":
    case "object": {
      if (e === null)
        return bt(e);
      const t = e, n = _e(t, "toString");
      if (typeof n == "function") {
        const r = n(t);
        return typeof r == "string" ? r : bt(r);
      }
      return bt(e);
    }
    default:
      return bt(e);
  }
}
function _e(e, t) {
  for (; e !== null; ) {
    const r = Gi(e, t);
    if (r) {
      if (r.get)
        return ee(r.get);
      if (typeof r.value == "function")
        return ee(r.value);
    }
    e = Wi(e);
  }
  function n() {
    return null;
  }
  return n;
}
function tl(e) {
  try {
    return re(e, ""), !0;
  } catch {
    return !1;
  }
}
const Hr = oe(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Tn = oe(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), An = oe(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), nl = oe(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Sn = oe(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), rl = oe(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), jr = oe(["#text"]), qr = oe(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), Rn = oe(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), $r = oe(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), jt = oe(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), al = ie(/{{[\w\W]*|^[\w\W]*}}/g), sl = ie(/<%[\w\W]*|^[\w\W]*%>/g), ol = ie(/\${[\w\W]*/g), il = ie(/^data-[\-\w.\u00B7-\uFFFF]+$/), ll = ie(/^aria-[\-\w]+$/), Wr = ie(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), cl = ie(/^(?:\w+script|data):/i), ul = ie(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), ml = ie(/^html$/i), fl = ie(/^[a-z][.\w]*(-[.\w]+)+$/i), Gr = ie(/<[/\w!]/g), Vr = ie(/<[/\w]/g), dl = ie(/<\/no(script|embed|frames)/i), pl = ie(/\/>/i), Ee = {
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
}, hl = function() {
  return typeof window > "u" ? null : window;
}, gl = function(t, n) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let r = null;
  const s = "data-tt-policy-suffix";
  n && n.hasAttribute(s) && (r = n.getAttribute(s));
  const o = "dompurify" + (r ? "#" + r : "");
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
}, Jr = function() {
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
}, Ie = function(t, n, r, s) {
  return ae(t, n) && Me(t[n]) ? q(s.base ? ue(s.base) : {}, t[n], s.transform) : r;
};
function va() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : hl();
  const t = (A) => va(A);
  if (t.version = "3.4.13", t.removed = [], !e || !e.document || e.document.nodeType !== Ee.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const r = n, s = r.currentScript;
  e.DocumentFragment;
  const o = e.HTMLTemplateElement, l = e.Node, c = e.Element, m = e.NodeFilter, f = e.NamedNodeMap;
  f === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const d = e.DOMParser, y = e.trustedTypes, O = c.prototype, U = _e(O, "cloneNode"), H = _e(O, "remove"), D = _e(O, "nextSibling"), v = _e(O, "childNodes"), b = _e(O, "parentNode"), P = _e(O, "shadowRoot"), I = _e(O, "attributes"), M = l && l.prototype ? _e(l.prototype, "nodeType") : null, h = l && l.prototype ? _e(l.prototype, "nodeName") : null, S = l && l.prototype ? _e(l.prototype, "ownerDocument") : null;
  if (typeof o == "function") {
    const A = n.createElement("template");
    A.content && A.content.ownerDocument && (n = A.content.ownerDocument);
  }
  let g, B = "", G, V = !1, J = 0;
  const N = function() {
    if (J > 0)
      throw He('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, _ = function(i) {
    N(), J++;
    try {
      return g.createHTML(i);
    } finally {
      J--;
    }
  }, w = function(i) {
    N(), J++;
    try {
      return g.createScriptURL(i);
    } finally {
      J--;
    }
  }, T = function() {
    return V || (G = gl(y, s), V = !0), G;
  }, Ne = n, Ue = Ne.implementation, Rt = Ne.createNodeIterator, Ot = Ne.createDocumentFragment, Te = Ne.getElementsByTagName, te = r.importNode;
  let $ = Jr();
  t.isSupported = typeof Ra == "function" && typeof b == "function" && Ue && Ue.createHTMLDocument !== void 0;
  const Ce = al, Fe = sl, vt = ol, W = il, de = ll, Ye = cl, ut = ul, nn = fl;
  let mt = Wr, j = null;
  const Ke = q({}, [...Hr, ...Tn, ...An, ...Sn, ...jr]);
  let X = null;
  const ye = q({}, [...qr, ...Rn, ...$r, ...jt]);
  let C = Object.seal(ot(null, {
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
  })), ne = null, we = null;
  const le = Object.seal(ot(null, {
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
  let ft = !0, dt = !0, ke = !1, Xn = !0, De = !1, Pe = !0, ze = !1, rn = !1, Ct = null, kt = null, an = !1, Ze = !1, Dt = !1, Pt = !1, Yn = !0, Kn = !1;
  const Zn = "user-content-";
  let sn = !0, Lt = !1, Qe = {}, Ae = null;
  const on = q({}, [
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
  let Qn = null;
  const er = q({}, ["audio", "video", "img", "source", "image", "track"]);
  let ln = null;
  const tr = q({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), It = "http://www.w3.org/1998/Math/MathML", Mt = "http://www.w3.org/2000/svg", Se = "http://www.w3.org/1999/xhtml";
  let et = Se, cn = !1, un = null;
  const ka = q({}, [It, Mt, Se], Nn), nr = oe(["mi", "mo", "mn", "ms", "mtext"]);
  let mn = q({}, nr);
  const rr = oe(["annotation-xml"]);
  let fn = q({}, rr);
  const Da = q({}, ["title", "style", "font", "a", "script"]);
  let pt = null;
  const Pa = ["application/xhtml+xml", "text/html"], La = "text/html";
  let K = null, tt = null;
  const Ia = n.createElement("form"), ar = function(i) {
    return i instanceof RegExp || i instanceof Function;
  }, dn = function() {
    let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (tt && tt === i)
      return;
    (!i || typeof i != "object") && (i = {}), i = ue(i), pt = // eslint-disable-next-line unicorn/prefer-includes
    Pa.indexOf(i.PARSER_MEDIA_TYPE) === -1 ? La : i.PARSER_MEDIA_TYPE, K = pt === "application/xhtml+xml" ? Nn : xt, j = Ie(i, "ALLOWED_TAGS", Ke, {
      transform: K
    }), X = Ie(i, "ALLOWED_ATTR", ye, {
      transform: K
    }), un = Ie(i, "ALLOWED_NAMESPACES", ka, {
      transform: Nn
    }), ln = Ie(i, "ADD_URI_SAFE_ATTR", tr, {
      transform: K,
      base: tr
    }), Qn = Ie(i, "ADD_DATA_URI_TAGS", er, {
      transform: K,
      base: er
    }), Ae = Ie(i, "FORBID_CONTENTS", on, {
      transform: K
    }), ne = Ie(i, "FORBID_TAGS", ue({}), {
      transform: K
    }), we = Ie(i, "FORBID_ATTR", ue({}), {
      transform: K
    }), Qe = ae(i, "USE_PROFILES") ? i.USE_PROFILES && typeof i.USE_PROFILES == "object" ? ue(i.USE_PROFILES) : i.USE_PROFILES : !1, ft = i.ALLOW_ARIA_ATTR !== !1, dt = i.ALLOW_DATA_ATTR !== !1, ke = i.ALLOW_UNKNOWN_PROTOCOLS || !1, Xn = i.ALLOW_SELF_CLOSE_IN_ATTR !== !1, De = i.SAFE_FOR_TEMPLATES || !1, Pe = i.SAFE_FOR_XML !== !1, ze = i.WHOLE_DOCUMENT || !1, Ze = i.RETURN_DOM || !1, Dt = i.RETURN_DOM_FRAGMENT || !1, Pt = i.RETURN_TRUSTED_TYPE || !1, an = i.FORCE_BODY || !1, Yn = i.SANITIZE_DOM !== !1, Kn = i.SANITIZE_NAMED_PROPS || !1, sn = i.KEEP_CONTENT !== !1, Lt = i.IN_PLACE || !1, mt = tl(i.ALLOWED_URI_REGEXP) ? i.ALLOWED_URI_REGEXP : Wr, et = typeof i.NAMESPACE == "string" ? i.NAMESPACE : Se, mn = ae(i, "MATHML_TEXT_INTEGRATION_POINTS") && i.MATHML_TEXT_INTEGRATION_POINTS && typeof i.MATHML_TEXT_INTEGRATION_POINTS == "object" ? ue(i.MATHML_TEXT_INTEGRATION_POINTS) : q({}, nr), fn = ae(i, "HTML_INTEGRATION_POINTS") && i.HTML_INTEGRATION_POINTS && typeof i.HTML_INTEGRATION_POINTS == "object" ? ue(i.HTML_INTEGRATION_POINTS) : q({}, rr);
    const p = ae(i, "CUSTOM_ELEMENT_HANDLING") && i.CUSTOM_ELEMENT_HANDLING && typeof i.CUSTOM_ELEMENT_HANDLING == "object" ? ue(i.CUSTOM_ELEMENT_HANDLING) : ot(null);
    if (C = ot(null), ae(p, "tagNameCheck") && ar(p.tagNameCheck) && (C.tagNameCheck = p.tagNameCheck), ae(p, "attributeNameCheck") && ar(p.attributeNameCheck) && (C.attributeNameCheck = p.attributeNameCheck), ae(p, "allowCustomizedBuiltInElements") && typeof p.allowCustomizedBuiltInElements == "boolean" && (C.allowCustomizedBuiltInElements = p.allowCustomizedBuiltInElements), ie(C), De && (dt = !1), Dt && (Ze = !0), Qe && (j = q({}, jr), X = ot(null), Qe.html === !0 && (q(j, Hr), q(X, qr)), Qe.svg === !0 && (q(j, Tn), q(X, Rn), q(X, jt)), Qe.svgFilters === !0 && (q(j, An), q(X, Rn), q(X, jt)), Qe.mathMl === !0 && (q(j, Sn), q(X, $r), q(X, jt))), le.tagCheck = null, le.attributeCheck = null, ae(i, "ADD_TAGS") && (typeof i.ADD_TAGS == "function" ? le.tagCheck = i.ADD_TAGS : Me(i.ADD_TAGS) && (j === Ke && (j = ue(j)), q(j, i.ADD_TAGS, K))), ae(i, "ADD_ATTR") && (typeof i.ADD_ATTR == "function" ? le.attributeCheck = i.ADD_ATTR : Me(i.ADD_ATTR) && (X === ye && (X = ue(X)), q(X, i.ADD_ATTR, K))), ae(i, "ADD_URI_SAFE_ATTR") && Me(i.ADD_URI_SAFE_ATTR) && q(ln, i.ADD_URI_SAFE_ATTR, K), ae(i, "FORBID_CONTENTS") && Me(i.FORBID_CONTENTS) && (Ae === on && (Ae = ue(Ae)), q(Ae, i.FORBID_CONTENTS, K)), ae(i, "ADD_FORBID_CONTENTS") && Me(i.ADD_FORBID_CONTENTS) && (Ae === on && (Ae = ue(Ae)), q(Ae, i.ADD_FORBID_CONTENTS, K)), sn && (j["#text"] = !0), ze && q(j, ["html", "head", "body"]), j.table && (q(j, ["tbody"]), delete ne.tbody), i.TRUSTED_TYPES_POLICY) {
      if (typeof i.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw He('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof i.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw He('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const x = g;
      g = i.TRUSTED_TYPES_POLICY;
      try {
        B = _("");
      } catch (k) {
        throw g = x, k;
      }
    } else i.TRUSTED_TYPES_POLICY === null ? (g = void 0, B = "") : (g === void 0 && (g = T()), g && typeof B == "string" && (B = _("")));
    oe && oe(i), tt = i;
  }, sr = q({}, [...Tn, ...An, ...nl]), or = q({}, [...Sn, ...rl]), Ma = function(i, p, x) {
    return p.namespaceURI === Se ? i === "svg" : p.namespaceURI === It ? i === "svg" && (x === "annotation-xml" || mn[x]) : !!sr[i];
  }, Ua = function(i, p, x) {
    return p.namespaceURI === Se ? i === "math" : p.namespaceURI === Mt ? i === "math" && fn[x] : !!or[i];
  }, Fa = function(i, p, x) {
    return p.namespaceURI === Mt && !fn[x] || p.namespaceURI === It && !mn[x] ? !1 : !or[i] && (Da[i] || !sr[i]);
  }, za = function(i) {
    let p = b(i);
    (!p || !p.tagName) && (p = {
      namespaceURI: et,
      tagName: "template"
    });
    const x = xt(i.tagName), k = xt(p.tagName);
    return un[i.namespaceURI] ? i.namespaceURI === Mt ? Ma(x, p, k) : i.namespaceURI === It ? Ua(x, p, k) : i.namespaceURI === Se ? Fa(x, p, k) : !!(pt === "application/xhtml+xml" && un[i.namespaceURI]) : !1;
  }, Le = function(i) {
    st(t.removed, {
      element: i
    });
    try {
      b(i).removeChild(i);
    } catch {
      if (H(i), !b(i))
        throw He("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, Ut = function(i) {
    ht(i);
    const p = v(i);
    if (p) {
      const k = [];
      at(p, (L) => {
        st(k, L);
      }), at(k, (L) => {
        try {
          H(L);
        } catch {
        }
      });
    }
    const x = I(i);
    if (x)
      for (let k = x.length - 1; k >= 0; --k) {
        const L = x[k], z = L && L.name;
        if (typeof z == "string")
          try {
            i.removeAttribute(z);
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
      if (Ze || Dt)
        try {
          Le(p);
        } catch {
        }
      else
        try {
          p.setAttribute(i, "");
        } catch {
        }
  }, Ba = function(i) {
    const p = I(i);
    if (p)
      for (let x = p.length - 1; x >= 0; --x) {
        const k = p[x], L = k && k.name;
        if (!(typeof L != "string" || X[K(L)]))
          try {
            i.removeAttribute(L);
          } catch {
          }
      }
  }, ht = function(i) {
    const p = [i];
    for (; p.length > 0; ) {
      const x = p.pop();
      (M ? M(x) : x.nodeType) === Ee.element && Ba(x);
      const L = v(x);
      if (L)
        for (let z = L.length - 1; z >= 0; --z)
          p.push(L[z]);
    }
  }, Ha = function(i) {
    if (!Pe)
      return;
    const p = [i];
    for (; p.length > 0; ) {
      const x = p.pop(), k = M ? M(x) : x.nodeType;
      if (k === Ee.processingInstruction || k === Ee.comment && re(Vr, x.data)) {
        try {
          H(x);
        } catch {
        }
        continue;
      }
      if (k === Ee.element) {
        const z = x, Y = K(h ? h(x) : x.nodeName);
        try {
          z.hasAttribute && z.hasAttribute("patchsrc") && z.removeAttribute("patchsrc"), z.hasAttribute && z.hasAttribute("for") && Y !== "label" && Y !== "output" && z.removeAttribute("for");
        } catch {
        }
      }
      const L = v(x);
      if (L)
        for (let z = L.length - 1; z >= 0; --z)
          p.push(L[z]);
    }
  }, ir = function(i) {
    let p = null, x = null;
    if (an)
      i = "<remove></remove>" + i;
    else {
      const z = Ur(i, /^[\r\n\t ]+/);
      x = z && z[0];
    }
    pt === "application/xhtml+xml" && et === Se && (i = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + i + "</body></html>");
    const k = g ? _(i) : i;
    if (et === Se)
      try {
        p = new d().parseFromString(k, pt);
      } catch {
      }
    if (!p || !p.documentElement) {
      p = Ue.createDocument(et, "template", null);
      try {
        p.documentElement.innerHTML = cn ? B : k;
      } catch {
      }
    }
    const L = p.body || p.documentElement;
    return i && x && L.insertBefore(n.createTextNode(x), L.childNodes[0] || null), et === Se ? Te.call(p, ze ? "html" : "body")[0] : ze ? p.documentElement : L;
  }, lr = function(i) {
    const p = S ? S(i) : i.ownerDocument;
    return Rt.call(
      p || i,
      i,
      // eslint-disable-next-line no-bitwise
      m.SHOW_ELEMENT | m.SHOW_COMMENT | m.SHOW_TEXT | m.SHOW_PROCESSING_INSTRUCTION | m.SHOW_CDATA_SECTION,
      null
    );
  }, Ft = function(i) {
    return i = Et(i, Ce, " "), i = Et(i, Fe, " "), i = Et(i, vt, " "), i;
  }, pn = function(i) {
    var p;
    i.normalize();
    const x = S ? S(i) : i.ownerDocument, k = Rt.call(
      x || i,
      i,
      // eslint-disable-next-line no-bitwise
      m.SHOW_TEXT | m.SHOW_COMMENT | m.SHOW_CDATA_SECTION | m.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let L = k.nextNode();
    for (; L; )
      L.data = Ft(L.data), L = k.nextNode();
    const z = (p = i.querySelectorAll) === null || p === void 0 ? void 0 : p.call(i, "template");
    z && at(z, (Y) => {
      nt(Y.content) && pn(Y.content);
    });
  }, zt = function(i) {
    const p = h ? h(i) : null;
    return typeof p != "string" || K(p) !== "form" ? !1 : typeof i.nodeName != "string" || typeof i.textContent != "string" || typeof i.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    i.attributes !== I(i) || typeof i.removeAttribute != "function" || typeof i.setAttribute != "function" || typeof i.namespaceURI != "string" || typeof i.insertBefore != "function" || typeof i.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    i.nodeType !== M(i) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
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
    i.childNodes !== v(i);
  }, nt = function(i) {
    if (!M || typeof i != "object" || i === null)
      return !1;
    try {
      return M(i) === Ee.documentFragment;
    } catch {
      return !1;
    }
  }, gt = function(i) {
    if (!M || typeof i != "object" || i === null)
      return !1;
    try {
      return typeof M(i) == "number";
    } catch {
      return !1;
    }
  };
  function Re(A, i, p) {
    A.length !== 0 && at(A, (x) => {
      x.call(t, i, p, tt);
    });
  }
  const ja = function(i, p) {
    return !!(Pe && i.hasChildNodes() && !gt(i.firstElementChild) && re(Gr, i.textContent) && re(Gr, i.innerHTML) || Pe && i.namespaceURI === Se && p === "style" && gt(i.firstElementChild) || i.nodeType === Ee.processingInstruction || Pe && i.nodeType === Ee.comment && re(Vr, i.data));
  }, qa = function(i, p, x) {
    if (!ne[p] && fr(p) && (C.tagNameCheck instanceof RegExp && re(C.tagNameCheck, p) || C.tagNameCheck instanceof Function && C.tagNameCheck(p)))
      return !1;
    if (sn && !Ae[p]) {
      const k = b(i), L = v(i);
      if (L && k) {
        const z = L.length;
        for (let Y = z - 1; Y >= 0; --Y) {
          const Z = i === x ? U(L[Y], !0) : L[Y];
          k.insertBefore(Z, D(i));
        }
      }
    }
    return Le(i), !0;
  }, cr = function(i, p, x, k) {
    return i.length === 0 ? p : p === x || p === k ? ue(p) : p;
  }, ur = function(i, p) {
    if (Re($.beforeSanitizeElements, i, null), i !== p && b(i) === null)
      return Lt && ht(i), !0;
    if (zt(i))
      return Le(i), !0;
    const x = K(h ? h(i) : i.nodeName);
    if (j = cr($.uponSanitizeElement, j, Ke, Ct), Re($.uponSanitizeElement, i, {
      tagName: x,
      allowedTags: j
    }), i !== p && b(i) === null)
      return Lt && ht(i), !0;
    if (ja(i, x))
      return Le(i), !0;
    if (ne[x] || !(le.tagCheck instanceof Function && le.tagCheck(x)) && !j[x]) {
      const L = qa(i, x, p);
      return L === !1 && Re($.afterSanitizeElements, i, null), L;
    }
    if ((M ? M(i) : i.nodeType) === Ee.element && !za(i) || (x === "noscript" || x === "noembed" || x === "noframes") && re(dl, i.innerHTML))
      return Le(i), !0;
    if (De && i.nodeType === Ee.text) {
      const L = Ft(i.textContent);
      i.textContent !== L && (st(t.removed, {
        element: i.cloneNode()
      }), i.textContent = L);
    }
    return Re($.afterSanitizeElements, i, null), !1;
  }, mr = function(i, p, x) {
    if (we[p] || Pe && p === "patchsrc" || Pe && p === "for" && i !== "label" && i !== "output" || Yn && (p === "id" || p === "name") && (x in n || x in Ia))
      return !1;
    const k = X[p] || le.attributeCheck instanceof Function && le.attributeCheck(p, i);
    if (!(dt && re(W, p))) {
      if (!(ft && re(de, p))) {
        if (k) {
          if (!ln[p]) {
            if (!re(mt, Et(x, ut, ""))) {
              if (!((p === "src" || p === "xlink:href" || p === "href") && i !== "script" && Fr(x, "data:") === 0 && Qn[i])) {
                if (!(ke && !re(Ye, Et(x, ut, "")))) {
                  if (x)
                    return !1;
                }
              }
            }
          }
        } else if (
          // First condition does a very basic check if a) it's basically a valid custom element tagname AND
          // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
          // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
          !(fr(i) && (C.tagNameCheck instanceof RegExp && re(C.tagNameCheck, i) || C.tagNameCheck instanceof Function && C.tagNameCheck(i)) && (C.attributeNameCheck instanceof RegExp && re(C.attributeNameCheck, p) || C.attributeNameCheck instanceof Function && C.attributeNameCheck(p, i)) || // Alternative, second condition checks if it's an `is`-attribute, AND
          // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
          p === "is" && C.allowCustomizedBuiltInElements && (C.tagNameCheck instanceof RegExp && re(C.tagNameCheck, x) || C.tagNameCheck instanceof Function && C.tagNameCheck(x)))
        ) return !1;
      }
    }
    return !0;
  }, $a = q({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), fr = function(i) {
    return !$a[xt(i)] && re(nn, i);
  }, Wa = function(i, p, x, k) {
    if (g && typeof y == "object" && typeof y.getAttributeType == "function" && !x)
      switch (y.getAttributeType(i, p)) {
        case "TrustedHTML":
          return _(k);
        case "TrustedScriptURL":
          return w(k);
      }
    return k;
  }, Ga = function(i, p, x, k) {
    try {
      x ? i.setAttributeNS(x, p, k) : i.setAttribute(p, k), zt(i) ? Le(i) : Mr(t.removed);
    } catch {
      Be(p, i);
    }
  }, dr = function(i) {
    Re($.beforeSanitizeAttributes, i, null);
    const p = i.attributes;
    if (!p || zt(i))
      return;
    X = cr($.uponSanitizeAttribute, X, ye, kt);
    const x = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: X,
      forceKeepAttr: void 0
    };
    let k = p.length;
    const L = K(i.nodeName);
    for (; k--; ) {
      const z = p[k], Y = z.name, Z = z.namespaceURI, pe = z.value, he = K(Y), gn = pe;
      let fe = Y === "value" ? gn : Xi(gn);
      if (x.attrName = he, x.attrValue = fe, x.keepAttr = !0, x.forceKeepAttr = void 0, Re($.uponSanitizeAttribute, i, x), fe = x.attrValue, Kn && (he === "id" || he === "name") && Fr(fe, Zn) !== 0 && (Be(Y, i), fe = Zn + fe), Pe && re(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, fe)) {
        Be(Y, i);
        continue;
      }
      if (he === "attributename" && Ur(fe, "href")) {
        Be(Y, i);
        continue;
      }
      if (!x.forceKeepAttr) {
        if (!x.keepAttr) {
          Be(Y, i);
          continue;
        }
        if (!Xn && re(pl, fe)) {
          Be(Y, i);
          continue;
        }
        if (De && (fe = Ft(fe)), !mr(L, he, fe)) {
          Be(Y, i);
          continue;
        }
        fe = Wa(L, he, Z, fe), fe !== gn && Ga(i, Y, Z, fe);
      }
    }
    Re($.afterSanitizeAttributes, i, null);
  }, Bt = function(i) {
    let p = null;
    const x = lr(i);
    for (Re($.beforeSanitizeShadowDOM, i, null); p = x.nextNode(); )
      if (Re($.uponSanitizeShadowNode, p, null), ur(p, i), dr(p), nt(p.content) && Bt(p.content), (M ? M(p) : p.nodeType) === Ee.element) {
        const L = P(p);
        nt(L) && (hn(L), Bt(L));
      }
    Re($.afterSanitizeShadowDOM, i, null);
  }, hn = function(i) {
    const p = [{
      node: i,
      shadow: null
    }];
    for (; p.length > 0; ) {
      const x = p.pop();
      if (x.shadow) {
        Bt(x.shadow);
        continue;
      }
      const k = x.node, z = (M ? M(k) : k.nodeType) === Ee.element, Y = v(k);
      if (Y)
        for (let Z = Y.length - 1; Z >= 0; --Z)
          p.push({
            node: Y[Z],
            shadow: null
          });
      if (z) {
        const Z = h ? h(k) : null;
        if (typeof Z == "string" && K(Z) === "template") {
          const pe = k.content;
          nt(pe) && p.push({
            node: pe,
            shadow: null
          });
        }
      }
      if (z) {
        const Z = P(k);
        nt(Z) && p.push({
          node: null,
          shadow: Z
        }, {
          node: Z,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(A) {
    let i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, p = null, x = null, k = null, L = null;
    if (cn = !A, cn && (A = "<!-->"), typeof A != "string" && !gt(A) && (A = el(A), typeof A != "string"))
      throw He("dirty is not a string, aborting");
    if (!t.isSupported)
      return A;
    rn ? (j = Ct, X = kt) : dn(i), ($.uponSanitizeElement.length > 0 || $.uponSanitizeAttribute.length > 0) && (j = ue(j)), $.uponSanitizeAttribute.length > 0 && (X = ue(X)), t.removed = [];
    const z = Lt && typeof A != "string" && gt(A);
    if (z) {
      Ha(A);
      const pe = h ? h(A) : A.nodeName;
      if (typeof pe == "string") {
        const he = K(pe);
        if (!j[he] || ne[he])
          throw Ut(A), He("root node is forbidden and cannot be sanitized in-place");
      }
      if (zt(A))
        throw Ut(A), He("root node is clobbered and cannot be sanitized in-place");
      try {
        hn(A);
      } catch (he) {
        throw Ut(A), he;
      }
    } else if (gt(A))
      p = ir("<!---->"), x = p.ownerDocument.importNode(A, !0), x.nodeType === Ee.element && x.nodeName === "BODY" || x.nodeName === "HTML" ? p = x : p.appendChild(x), hn(x);
    else {
      if (!Ze && !De && !ze && // eslint-disable-next-line unicorn/prefer-includes
      A.indexOf("<") === -1)
        return g && Pt ? _(A) : A;
      if (p = ir(A), !p)
        return Ze ? null : Pt ? B : "";
    }
    p && an && Le(p.firstChild);
    const Y = z ? A : p;
    try {
      const pe = lr(Y);
      for (; k = pe.nextNode(); )
        ur(k, Y), dr(k), nt(k.content) && Bt(k.content);
    } catch (pe) {
      throw z && (Ut(A), at(t.removed, (he) => {
        he.element && ht(he.element);
      })), pe;
    }
    if (z)
      return at(t.removed, (pe) => {
        pe.element && ht(pe.element);
      }), De && pn(A), A;
    if (Ze) {
      if (De && pn(p), Dt)
        for (L = Ot.call(p.ownerDocument); p.firstChild; )
          L.appendChild(p.firstChild);
      else
        L = p;
      return (X.shadowroot || X.shadowrootmode) && (L = te.call(r, L, !0)), L;
    }
    let Z = ze ? p.outerHTML : p.innerHTML;
    return ze && j["!doctype"] && p.ownerDocument && p.ownerDocument.doctype && p.ownerDocument.doctype.name && re(ml, p.ownerDocument.doctype.name) && (Z = "<!DOCTYPE " + p.ownerDocument.doctype.name + `>
` + Z), De && (Z = Ft(Z)), g && Pt ? _(Z) : Z;
  }, t.setConfig = function() {
    let A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    dn(A), rn = !0, Ct = j, kt = X;
  }, t.clearConfig = function() {
    tt = null, rn = !1, Ct = null, kt = null, g = G, B = "";
  }, t.isValidAttribute = function(A, i, p) {
    tt || dn({});
    const x = K(A), k = K(i);
    return mr(x, k, p);
  }, t.addHook = function(A, i) {
    typeof i == "function" && ae($, A) && st($[A], i);
  }, t.removeHook = function(A, i) {
    if (ae($, A)) {
      if (i !== void 0) {
        const p = Vi($[A], i);
        return p === -1 ? void 0 : Ji($[A], p, 1)[0];
      }
      return Mr($[A]);
    }
  }, t.removeHooks = function(A) {
    ae($, A) && ($[A] = []);
  }, t.removeAllHooks = function() {
    $ = Jr();
  }, t;
}
var Ca = va();
function yl(e) {
  var f, d, y, O, U, H;
  const { settings: t, post: n, comments: r, submitted: s, commentForm: o, submitComment: l, setCommentForm: c, slug: m } = e;
  return a.createElement(
    "article",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(Sa, { items: [{ label: E("blog", t), to: "/" }, { label: n.title || E("post", t) }] }),
    a.createElement(
      "header",
      { className: "mb-8" },
      a.createElement(
        "h1",
        { className: "text-3xl font-bold text-gray-900 mb-4" },
        n.format && n.format !== "standard" ? a.createElement("span", { className: "block text-xs font-normal text-gray-400 mb-1 uppercase tracking-wider" }, n.format) : null,
        n.title
      ),
      a.createElement(
        "div",
        { className: "flex flex-wrap items-center gap-4 text-sm text-gray-500" },
        a.createElement("span", { className: "text-xs text-gray-400" }, tn(n.content || "") + " · " + (n.content || "").replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length + " " + E("words", t)),
        a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 14 }), Xe(n.publishedAt || n.createdAt)),
        a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 14 }), (f = n.author) == null ? void 0 : f.username),
        ((d = n.categories) == null ? void 0 : d.length) > 0 && a.createElement(
          "span",
          { className: "flex items-center gap-1" },
          a.createElement(Yt, { size: 14 }),
          n.categories.map((D) => a.createElement(F, { key: D.categoryId, to: "/category/" + D.slug, className: "hover:text-primary-600" }, D.name))
        ),
        ((y = n.tags) == null ? void 0 : y.length) > 0 && a.createElement(
          "span",
          { className: "flex items-center gap-1 flex-wrap" },
          a.createElement(ts, { size: 14 }),
          n.tags.map((D) => a.createElement(F, { key: D.tagId, to: "/tag/" + D.slug, className: "px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 hover:bg-primary-100 hover:text-primary-700" }, D.name))
        )
      )
    ),
    n.featured && a.createElement("img", { src: _t(n.featured, t), alt: n.title, className: "w-full max-h-96 object-cover rounded-lg mb-8", loading: "lazy", srcSet: n.srcset ? Object.entries(n.srcset).map(([D, v]) => _t(v, t) + " " + D + "w").join(", ") : void 0 }),
    a.createElement("div", { className: "prose prose-gray max-w-none mb-12", dangerouslySetInnerHTML: { __html: Ei(Di(Ca.sanitize(n.content)), t) } }),
    (n == null ? void 0 : n.author) && a.createElement(
      "div",
      { className: "flex items-start gap-4 mt-12 pt-6 border-t border-gray-200" },
      a.createElement("img", { src: Fi(((O = n.author) == null ? void 0 : O.email) || ""), alt: "", className: "w-12 h-12 rounded-full" }),
      a.createElement(
        "div",
        null,
        a.createElement("p", { className: "font-medium text-gray-900" }, (U = n.author) == null ? void 0 : U.username),
        a.createElement("p", { className: "text-sm text-gray-500 mt-1" }, ((H = n.author) == null ? void 0 : H.bio) || E("author", t))
      )
    ),
    a.createElement(
      "div",
      { className: "flex justify-between items-center mt-12 pt-6 border-t border-gray-200" },
      a.createElement(F, { to: "/", className: "text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1" }, "← " + E("all posts", t)),
      a.createElement(
        "div",
        { className: "flex gap-3 items-center" },
        a.createElement(ki, { title: n.title, url: "/post/" + n.slug, siteUrl: t.site_url }),
        a.createElement("a", { href: "#comments", className: "text-sm text-gray-500 hover:text-primary-600" }, E("comments", t) + " ↓"),
        a.createElement(F, { to: "/search", className: "text-sm text-gray-500 hover:text-primary-600" }, E("search", t) + " →")
      )
    ),
    a.createElement(
      "section",
      { className: "border-t border-gray-200 pt-8 mt-12" },
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, E("related posts", t)),
      m && a.createElement(Ci, { postId: n == null ? void 0 : n.id, slug: m })
    ),
    a.createElement(
      "section",
      { className: "border-t border-gray-200 pt-8" },
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, E("comments", t)),
      r.length === 0 && !s && a.createElement(
        "div",
        { className: "text-center py-4" },
        a.createElement("p", { className: "text-sm text-gray-400" }, E("no comments yet", t) + ". " + E("be the first to share your thoughts", t) + "!")
      ),
      r.map((D) => {
        var v;
        return a.createElement(
          "div",
          { key: D.id, className: "mb-4 pb-4 border-b border-gray-100 last:border-0" },
          a.createElement(
            "div",
            { className: "flex items-center gap-2 mb-1" },
            a.createElement("span", { className: "font-medium text-sm" }, D.author),
            a.createElement("span", { className: "text-xs text-gray-400" }, new Date(D.createdAt).toLocaleDateString())
          ),
          a.createElement("p", { className: "text-sm text-gray-700" }, D.content),
          (v = D.children) == null ? void 0 : v.map((b) => a.createElement(
            "div",
            { key: b.id, className: "ml-6 mt-3 pl-4 border-l-2 border-gray-100" },
            a.createElement(
              "div",
              { className: "flex items-center gap-2 mb-1" },
              a.createElement("span", { className: "font-medium text-sm" }, b.author),
              a.createElement("span", { className: "text-xs text-gray-400" }, new Date(b.createdAt).toLocaleDateString())
            ),
            a.createElement("p", { className: "text-sm text-gray-700" }, b.content)
          ))
        );
      }),
      s && a.createElement("p", { className: "text-sm text-green-600 mb-4" }, E("comment submitted and pending review", t)),
      a.createElement(
        "form",
        { onSubmit: l, className: "space-y-3 mt-6" },
        a.createElement("h4", { className: "text-sm font-semibold text-gray-900" }, E("leave a comment", t)),
        a.createElement("input", { type: "text", name: "website_url", style: { position: "absolute", left: "-9999px" }, tabIndex: -1, autoComplete: "off" }),
        a.createElement(
          "div",
          { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
          a.createElement("input", { value: o.author, onChange: (D) => c({ ...o, author: D.target.value }), placeholder: E("name", t), className: "input-field" }),
          a.createElement("input", { value: o.email, onChange: (D) => c({ ...o, email: D.target.value }), placeholder: E("email", t), type: "email", className: "input-field" })
        ),
        a.createElement("textarea", { value: o.content, onChange: (D) => c({ ...o, content: D.target.value }), placeholder: E("your comment", t) + "...", className: "input-field", rows: 3, required: !0 }),
        a.createElement("button", { type: "submit", className: "btn-primary" }, E("submit comment", t))
      )
    )
  );
}
function El(e) {
  const { settings: t, page: n } = e;
  return n ? a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(Sa, { items: [{ label: E("home", t), to: "/" }, { label: n.title }] }),
    a.createElement("h1", { className: "text-3xl font-bold text-gray-900 my-6" }, n.title),
    a.createElement("div", { className: "prose prose-gray max-w-none", dangerouslySetInnerHTML: { __html: Ca.sanitize(n.content || "") } }),
    n.parent && a.createElement(F, { to: "/page/" + n.parent.slug, className: "inline-block mt-8 text-sm text-gray-500 hover:text-primary-600" }, "← " + n.parent.title)
  ) : null;
}
const Hl = { name: "default", Header: gi, Footer: yi, HomeLayout: xi, CategoryLayout: _i, TagLayout: Ti, ArchiveLayout: Si, SearchLayout: Oi, AuthorLayout: vi, PostLayout: yl, PageLayout: El };
export {
  Hl as default
};
