import a, { forwardRef as Yr, createElement as vn, useState as Oe, useEffect as Ve } from "react";
import { Link as M, useNavigate as Xa } from "react-router-dom";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ya = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Kr = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Ka = {
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
const Za = Yr(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: l,
    ...c
  }, f) => vn(
    "svg",
    {
      ref: f,
      ...Ka,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: Kr("lucide", s),
      ...c
    },
    [
      ...l.map(([d, m]) => vn(d, m)),
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
  const n = Yr(
    ({ className: r, ...s }, o) => vn(Za, {
      ref: o,
      iconNode: t,
      className: Kr(`lucide-${Ya(e)}`, r),
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
const Zr = de("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Je = de("Calendar", [
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
const Qr = de("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Qa = de("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const es = de("Clock", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kt = de("Folder", [
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
const ts = de("House", [
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
const ns = de("Link2", [
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
const rs = de("Menu", [
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
const Zt = de("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ea = de("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const as = de("Tag", [
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
const ss = de("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mn = de("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const os = de("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function ta(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: is } = Object.prototype, { getPrototypeOf: it } = Object, { iterator: Nt, toStringTag: na } = Symbol, Jt = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), wt = (e, t) => {
  let n = e;
  const r = [];
  for (; n != null && n !== Object.prototype; ) {
    if (r.indexOf(n) !== -1)
      return !1;
    if (r.push(n), Jt(n, t))
      return !0;
    n = it(n);
  }
  return !1;
}, ls = (e, t) => e != null && wt(e, t) ? e[t] : void 0, Un = /* @__PURE__ */ ((e) => (t) => {
  const n = is.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), xe = (e) => (e = e.toLowerCase(), (t) => Un(t) === e), Qt = (e) => (t) => typeof t === e, { isArray: $e } = Array, We = Qt("undefined");
function lt(e) {
  return e !== null && !We(e) && e.constructor !== null && !We(e.constructor) && ye(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const ra = xe("ArrayBuffer");
function cs(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && ra(e.buffer), t;
}
const us = Qt("string"), ye = Qt("function"), aa = Qt("number"), ct = (e) => e !== null && typeof e == "object", ms = (e) => e === !0 || e === !1, $t = (e) => {
  if (!ct(e))
    return !1;
  const t = it(e);
  return (t === null || t === Object.prototype || it(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !wt(e, na) && !wt(e, Nt);
}, fs = (e) => {
  if (!ct(e) || lt(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, ds = xe("Date"), ps = xe("File"), hs = (e) => !!(e && typeof e.uri < "u"), gs = (e) => e && typeof e.getParts < "u", ys = xe("Blob"), Es = xe("FileList"), bs = xe("Set"), xs = (e) => ct(e) && ye(e.pipe);
function ws() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const hr = ws(), gr = typeof hr.FormData < "u" ? hr.FormData : void 0, _s = (e) => {
  if (!e) return !1;
  if (gr && e instanceof gr) return !0;
  const t = it(e);
  if (!t || t === Object.prototype || !ye(e.append)) return !1;
  const n = Un(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && ye(e.toString) && e.toString() === "[object FormData]";
}, Ns = xe("URLSearchParams"), [Ts, As, Ss, Rs] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(xe), Os = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
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
function sa(e, t) {
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
const je = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, oa = (e) => !We(e) && e !== je;
function Cn(...e) {
  const { caseless: t, skipUndefined: n } = oa(this) && this || {}, r = {}, s = (o, l) => {
    if (l === "__proto__" || l === "constructor" || l === "prototype")
      return;
    const c = t && typeof l == "string" && sa(r, l) || l, f = Jt(r, c) ? r[c] : void 0;
    $t(f) && $t(o) ? r[c] = Cn(f, o) : $t(o) ? r[c] = Cn({}, o) : $e(o) ? r[c] = o.slice() : (!n || !We(o)) && (r[c] = o);
  };
  for (let o = 0, l = e.length; o < l; o++) {
    const c = e[o];
    if (!c || lt(c) || (Tt(c, s), typeof c != "object" || $e(c)))
      continue;
    const f = Object.getOwnPropertySymbols(c);
    for (let d = 0; d < f.length; d++) {
      const m = f[d];
      Bs.call(c, m) && s(c[m], m);
    }
  }
  return r;
}
const vs = (e, t, n, { allOwnKeys: r } = {}) => (Tt(
  t,
  (s, o) => {
    n && ye(s) ? Object.defineProperty(e, o, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: ta(s, n),
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
), e), Cs = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), ks = (e, t, n, r) => {
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
}, Ds = (e, t, n, r) => {
  let s, o, l;
  const c = {};
  if (t = t || {}, e == null) return t;
  do {
    for (s = Object.getOwnPropertyNames(e), o = s.length; o-- > 0; )
      l = s[o], (!r || r(l, e, t)) && !c[l] && (t[l] = e[l], c[l] = !0);
    e = n !== !1 && it(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, Ps = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, Ls = (e) => {
  if (!e) return null;
  if ($e(e)) return e;
  let t = e.length;
  if (!aa(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, Is = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && it(Uint8Array)), Ms = (e, t) => {
  const r = (e && e[Nt]).call(e);
  let s;
  for (; (s = r.next()) && !s.done; ) {
    const o = s.value;
    t.call(e, o[0], o[1]);
  }
}, Us = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, Fs = xe("HTMLFormElement"), zs = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(n, r, s) {
  return r.toUpperCase() + s;
}), { propertyIsEnumerable: Bs } = Object.prototype, Hs = xe("RegExp"), ia = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  Tt(n, (s, o) => {
    let l;
    (l = t(s, o, e)) !== !1 && (r[o] = l || s);
  }), Object.defineProperties(e, r);
}, js = (e) => {
  ia(e, (t, n) => {
    if (ye(e) && ["arguments", "caller", "callee"].includes(n))
      return !1;
    const r = e[n];
    if (ye(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, qs = (e, t) => {
  const n = {}, r = (s) => {
    s.forEach((o) => {
      n[o] = !0;
    });
  };
  return $e(e) ? r(e) : r(String(e).split(t)), n;
}, $s = () => {
}, Ws = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Gs(e) {
  return !!(e && ye(e.append) && e[na] === "FormData" && e[Nt]);
}
const Vs = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (r) => {
    if (ct(r)) {
      if (t.has(r))
        return;
      if (lt(r))
        return r;
      if (!("toJSON" in r)) {
        t.add(r);
        let s;
        if (bs(r)) {
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
}, Js = xe("AsyncFunction"), Xs = (e) => e && (ct(e) || ye(e)) && ye(e.then) && ye(e.catch), la = ((e, t) => e ? setImmediate : t ? ((n, r) => (je.addEventListener(
  "message",
  ({ source: s, data: o }) => {
    s === je && o === n && r.length && r.shift()();
  },
  !1
), (s) => {
  r.push(s), je.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", ye(je.postMessage)), Ys = typeof queueMicrotask < "u" ? queueMicrotask.bind(je) : typeof process < "u" && process.nextTick || la, ca = (e) => e != null && ye(e[Nt]), Ks = (e) => e != null && wt(e, Nt) && ca(e), u = {
  isArray: $e,
  isArrayBuffer: ra,
  isBuffer: lt,
  isFormData: _s,
  isArrayBufferView: cs,
  isString: us,
  isNumber: aa,
  isBoolean: ms,
  isObject: ct,
  isPlainObject: $t,
  isEmptyObject: fs,
  isReadableStream: Ts,
  isRequest: As,
  isResponse: Ss,
  isHeaders: Rs,
  isUndefined: We,
  isDate: ds,
  isFile: ps,
  isReactNativeBlob: hs,
  isReactNative: gs,
  isBlob: ys,
  isRegExp: Hs,
  isFunction: ye,
  isStream: xs,
  isURLSearchParams: Ns,
  isTypedArray: Is,
  isFileList: Es,
  forEach: Tt,
  merge: Cn,
  extend: vs,
  trim: Os,
  stripBOM: Cs,
  inherits: ks,
  toFlatObject: Ds,
  kindOf: Un,
  kindOfTest: xe,
  endsWith: Ps,
  toArray: Ls,
  forEachEntry: Ms,
  matchAll: Us,
  isHTMLForm: Fs,
  hasOwnProperty: Jt,
  hasOwnProp: Jt,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: wt,
  getSafeProp: ls,
  reduceDescriptors: ia,
  freezeMethods: js,
  toObjectSet: qs,
  toCamelCase: zs,
  noop: $s,
  toFiniteNumber: Ws,
  findKey: sa,
  global: je,
  isContextDefined: oa,
  isSpecCompliantForm: Gs,
  toJSONObject: Vs,
  isAsyncFn: Js,
  isThenable: Xs,
  setImmediate: la,
  asap: Ys,
  isIterable: ca,
  isSafeIterable: Ks
}, Zs = u.toObjectSet([
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
]), Qs = (e) => {
  const t = {};
  let n, r, s;
  return e && e.split(`
`).forEach(function(l) {
    s = l.indexOf(":"), n = l.substring(0, s).trim().toLowerCase(), r = l.substring(s + 1).trim();
    const c = u.hasOwnProp(t, n);
    !n || c && u.hasOwnProp(Zs, n) || (n === "set-cookie" ? c ? t[n].push(r) : t[n] = [r] : t[n] = c ? t[n] + ", " + r : r);
  }), t;
};
function eo(e) {
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
const to = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), no = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Fn(e, t) {
  return u.isArray(e) ? e.map((n) => Fn(n, t)) : eo(String(e).replace(t, ""));
}
const ro = (e) => Fn(e, to), ao = (e) => Fn(e, no);
function ua(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return u.forEach(e.toJSON(), (n, r) => {
    t[r] = ao(n);
  }), t;
}
const yr = Symbol("internals");
function yt(e) {
  return e && String(e).trim().toLowerCase();
}
function Wt(e) {
  return e === !1 || e == null ? e : u.isArray(e) ? e.map(Wt) : ro(String(e));
}
function so(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const oo = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function En(e) {
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
function io(e) {
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
function lo(e) {
  const t = /* @__PURE__ */ Object.create(null), n = String(e);
  let r = 0, s = !1, o = !1;
  function l(c) {
    const f = En(n.slice(r, c)), d = f.indexOf("=");
    if (d < 1)
      return;
    const m = En(f.slice(0, d));
    if (!oo.test(m))
      return;
    const E = m.toLowerCase();
    if (E === "__proto__" || E === "constructor" || E === "prototype")
      return;
    const O = En(f.slice(d + 1));
    t[E] = io(O);
  }
  for (let c = 0; c < n.length; c++) {
    const f = n.charCodeAt(c);
    s ? o ? o = !1 : f === 92 ? o = !0 : f === 34 && (s = !1) : f === 34 ? s = !0 : (f === 44 || f === 59) && (l(c), r = c + 1);
  }
  return l(n.length), t;
}
const co = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function bn(e, t, n, r, s) {
  if (u.isFunction(r))
    return r.call(this, t, n);
  if (s && (t = n), !!u.isString(t)) {
    if (u.isString(r))
      return t.indexOf(r) !== -1;
    if (u.isRegExp(r))
      return r.test(t);
  }
}
function uo(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function mo(e, t) {
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
    function o(c, f, d) {
      const m = yt(f);
      if (!m)
        return;
      const E = u.findKey(s, m);
      (!E || s[E] === void 0 || d === !0 || d === void 0 && s[E] !== !1) && (s[E || f] = Wt(c));
    }
    const l = (c, f) => u.forEach(c, (d, m) => o(d, m, f));
    if (u.isPlainObject(t) || t instanceof this.constructor)
      l(t, n);
    else if (u.isString(t) && (t = t.trim()) && !co(t))
      l(Qs(t), n);
    else if (u.isObject(t) && u.isSafeIterable(t)) {
      let c = /* @__PURE__ */ Object.create(null), f, d;
      for (const m of t) {
        if (!u.isArray(m))
          throw new TypeError("Object iterator must return a key-value pair");
        d = m[0], u.hasOwnProp(c, d) ? (f = c[d], c[d] = u.isArray(f) ? [...f, m[1]] : [f, m[1]]) : c[d] = m[1];
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
          return so(s);
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
      return !!(r && this[r] !== void 0 && (!n || bn(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function o(l) {
      if (l = yt(l), l) {
        const c = u.findKey(r, l);
        c && (!n || bn(r, r[c], c, n)) && (delete r[c], s = !0);
      }
    }
    return u.isArray(t) ? t.forEach(o) : o(t), s;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length, s = !1;
    for (; r--; ) {
      const o = n[r];
      (!t || bn(this, this[o], o, t, !0)) && (delete this[o], s = !0);
    }
    return s;
  }
  normalize(t) {
    const n = this, r = {};
    return u.forEach(this, (s, o) => {
      const l = u.findKey(r, o);
      if (l) {
        n[l] = Wt(s), delete n[o];
        return;
      }
      const c = t ? uo(o) : String(o).trim();
      c !== o && delete n[o], n[c] = Wt(s), r[c] = !0;
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
    return lo(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((s) => r.set(s)), r;
  }
  static accessor(t) {
    const r = (this[yr] = this[yr] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function o(l) {
      const c = yt(l);
      r[c] || (mo(s, l), r[c] = !0);
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
const Xt = "[REDACTED ****]";
function fo(e) {
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
function po(e, t) {
  const n = new Set(t.map((o) => String(o).toLowerCase())), r = [], s = (o) => {
    if (o === null || typeof o != "object" || u.isBuffer(o)) return o;
    if (r.indexOf(o) !== -1) return;
    o instanceof me && (o = o.toJSON()), r.push(o);
    let l;
    if (u.isArray(o))
      l = [], o.forEach((c, f) => {
        const d = s(c);
        u.isUndefined(d) || (l[f] = d);
      });
    else {
      if (!u.isPlainObject(o) && fo(o))
        return r.pop(), o;
      l = /* @__PURE__ */ Object.create(null);
      for (const [c, f] of Object.entries(o)) {
        const d = n.has(c.toLowerCase()) ? Xt : s(f);
        u.isUndefined(d) || (l[c] = d);
      }
    }
    return r.pop(), l;
  };
  return s(e);
}
function Er(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function ho(e) {
  return e.errors.map((n) => {
    try {
      return n && n.message ? Er(n.message) : Er(n);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let R = class ma extends Error {
  static from(t, n, r, s, o, l) {
    let c = t.message;
    !c && u.isArray(t.errors) && t.errors.length && (c = ho(t));
    const f = new ma(c, n || t.code, r, s, o);
    return Object.defineProperty(f, "cause", {
      __proto__: null,
      value: t,
      writable: !0,
      enumerable: !1,
      configurable: !0
    }), f.name = t.name, t.status != null && f.status == null && (f.status = t.status), l && Object.assign(f, l), f;
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
    const t = this.config, n = t && u.hasOwnProp(t, "redact") ? t.redact : void 0, r = u.isArray(n) && n.length > 0 ? po(t, n) : u.toJSONObject(t);
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
const go = null, fa = 100;
function kn(e) {
  return u.isPlainObject(e) || u.isArray(e);
}
function da(e) {
  return u.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function xn(e, t, n) {
  return e ? e.concat(t).map(function(s, o) {
    return s = da(s), !n && o ? "[" + s + "]" : s;
  }).join(n ? "." : "") : t;
}
function yo(e) {
  return u.isArray(e) && !e.some(kn);
}
const Eo = u.toFlatObject(u, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function en(e, t, n) {
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
    function(k, L) {
      return !u.isUndefined(L[k]);
    }
  );
  const r = n.metaTokens, s = n.visitor || B, o = n.dots, l = n.indexes, c = n.Blob || typeof Blob < "u" && Blob, f = n.maxDepth === void 0 ? fa : n.maxDepth, d = c && u.isSpecCompliantForm(t), m = [];
  if (!u.isFunction(s))
    throw new TypeError("visitor must be a function");
  function E(y) {
    if (y === null) return "";
    if (u.isDate(y))
      return y.toISOString();
    if (u.isBoolean(y))
      return y.toString();
    if (!d && u.isBlob(y))
      throw new R("Blob is not supported. Use a Buffer instead.");
    if (u.isArrayBuffer(y) || u.isTypedArray(y)) {
      if (d && typeof c == "function")
        return new c([y]);
      throw new R("Blob is not supported. Use a Buffer instead.", R.ERR_NOT_SUPPORT);
    }
    return y;
  }
  function O(y) {
    if (y > f)
      throw new R(
        "Object is too deeply nested (" + y + " levels). Max depth: " + f,
        R.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function U(y, k) {
    if (f === 1 / 0)
      return JSON.stringify(y);
    const L = [];
    return JSON.stringify(y, function(h, S) {
      if (!u.isObject(S))
        return S;
      for (; L.length && L[L.length - 1] !== this; )
        L.pop();
      return L.push(S), O(k + L.length - 1), S;
    });
  }
  function B(y, k, L) {
    let I = y;
    if (u.isReactNative(t) && u.isReactNativeBlob(y))
      return t.append(xn(L, k, o), E(y)), !1;
    if (y && !L && typeof y == "object") {
      if (u.endsWith(k, "{}"))
        k = r ? k : k.slice(0, -2), y = U(y, 1);
      else if (u.isArray(y) && yo(y) || (u.isFileList(y) || u.endsWith(k, "[]")) && (I = u.toArray(y)))
        return k = da(k), I.forEach(function(S, g) {
          !(u.isUndefined(S) || S === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            l === !0 ? xn([k], g, o) : l === null ? k : k + "[]",
            E(S)
          );
        }), !1;
    }
    return kn(y) ? !0 : (t.append(xn(L, k, o), E(y)), !1);
  }
  const H = Object.assign(Eo, {
    defaultVisitor: B,
    convertValue: E,
    isVisitable: kn
  });
  function v(y, k, L = 0) {
    if (!u.isUndefined(y)) {
      if (O(L), m.indexOf(y) !== -1)
        throw new Error("Circular reference detected in " + k.join("."));
      m.push(y), u.forEach(y, function(h, S) {
        (!(u.isUndefined(h) || h === null) && s.call(t, h, u.isString(S) ? S.trim() : S, k, H)) === !0 && v(h, k ? k.concat(S) : [S], L + 1);
      }), m.pop();
    }
  }
  if (!u.isObject(e))
    throw new TypeError("data must be an object");
  return v(e), t;
}
function br(e) {
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
function zn(e, t) {
  this._pairs = [], e && en(e, this, t);
}
const pa = zn.prototype;
pa.append = function(t, n) {
  this._pairs.push([t, n]);
};
pa.toString = function(t) {
  const n = t ? (r) => t.call(this, r, br) : br;
  return this._pairs.map(function(s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function bo(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function ha(e, t, n) {
  if (!t)
    return e;
  e = e || "";
  const r = u.isFunction(n) ? {
    serialize: n
  } : n, s = u.getSafeProp(r, "encode") || bo, o = u.getSafeProp(r, "serialize");
  let l;
  if (o ? l = o(t, r) : l = u.isURLSearchParams(t) ? t.toString() : new zn(t, r).toString(s), l) {
    const c = e.indexOf("#");
    c !== -1 && (e = e.slice(0, c)), e += (e.indexOf("?") === -1 ? "?" : "&") + l;
  }
  return e;
}
class xr {
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
const Bn = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, xo = typeof URLSearchParams < "u" ? URLSearchParams : zn, wo = typeof FormData < "u" ? FormData : null, _o = typeof Blob < "u" ? Blob : null, No = {
  isBrowser: !0,
  classes: {
    URLSearchParams: xo,
    FormData: wo,
    Blob: _o
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Hn = typeof window < "u" && typeof document < "u", Dn = typeof navigator == "object" && navigator || void 0, To = Hn && (!Dn || ["ReactNative", "NativeScript", "NS"].indexOf(Dn.product) < 0), Ao = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", So = Hn && window.location.href || "http://localhost", Ro = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Hn,
  hasStandardBrowserEnv: To,
  hasStandardBrowserWebWorkerEnv: Ao,
  navigator: Dn,
  origin: So
}, Symbol.toStringTag, { value: "Module" })), se = {
  ...Ro,
  ...No
};
function Oo(e, t) {
  return en(e, new se.classes.URLSearchParams(), {
    visitor: function(n, r, s, o) {
      return se.isNode && u.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : o.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const wr = fa;
function ga(e) {
  if (e > wr)
    throw new R(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + wr,
      R.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function vo(e) {
  const t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g;
  let r;
  for (; (r = n.exec(e)) !== null; )
    ga(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
  return t;
}
function Co(e) {
  const t = {}, n = Object.keys(e);
  let r;
  const s = n.length;
  let o;
  for (r = 0; r < s; r++)
    o = n[r], t[o] = e[o];
  return t;
}
function ya(e) {
  function t(n, r, s, o) {
    ga(o);
    let l = n[o++];
    if (l === "__proto__") return !0;
    const c = Number.isFinite(+l), f = o >= n.length;
    return l = !l && u.isArray(s) ? s.length : l, f ? (u.hasOwnProp(s, l) ? s[l] = u.isArray(s[l]) ? s[l].concat(r) : [s[l], r] : s[l] = r, !c) : ((!u.hasOwnProp(s, l) || !u.isObject(s[l])) && (s[l] = []), t(n, r, s[l], o) && u.isArray(s[l]) && (s[l] = Co(s[l])), !c);
  }
  if (u.isFormData(e) && u.isFunction(e.entries)) {
    const n = {};
    return u.forEachEntry(e, (r, s) => {
      t(vo(r), s, n, 0);
    }), n;
  }
  return null;
}
const rt = (e, t) => e != null && u.hasOwnProp(e, t) ? e[t] : void 0;
function ko(e, t, n) {
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
  transitional: Bn,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, n) {
      const r = n.getContentType() || "", s = r.indexOf("application/json") > -1, o = u.isObject(t);
      if (o && u.isHTMLForm(t) && (t = new FormData(t)), u.isFormData(t))
        return s ? JSON.stringify(ya(t)) : t;
      if (u.isArrayBuffer(t) || u.isBuffer(t) || u.isStream(t) || u.isFile(t) || u.isBlob(t) || u.isReadableStream(t))
        return t;
      if (u.isArrayBufferView(t))
        return t.buffer;
      if (u.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let c;
      if (o) {
        const f = rt(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return Oo(t, f).toString();
        if ((c = u.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const d = rt(this, "env"), m = d && d.FormData;
          return en(
            c ? { "files[]": t } : t,
            m && new m(),
            f
          );
        }
      }
      return o || s ? (n.setContentType("application/json", !1), ko(t)) : t;
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
        } catch (f) {
          if (c)
            throw f.name === "SyntaxError" ? R.from(f, R.ERR_BAD_RESPONSE, this, null, rt(this, "response")) : f;
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
function wn(e, t) {
  const n = this || At, r = t || n, s = me.from(r.headers);
  let o = r.data;
  return u.forEach(e, function(c) {
    o = c.call(n, o, s.normalize(), t ? t.status : void 0);
  }), s.normalize(), o;
}
function Ea(e) {
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
function ba(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new R(
    "Request failed with status code " + n.status,
    n.status >= 400 && n.status < 500 ? R.ERR_BAD_REQUEST : R.ERR_BAD_RESPONSE,
    n.config,
    n.request,
    n
  ));
}
function Do(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Po(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let s = 0, o = 0, l;
  return t = t !== void 0 ? t : 1e3, function(f) {
    const d = Date.now(), m = r[o];
    l || (l = d), n[s] = f, r[s] = d;
    let E = o, O = 0;
    for (; E !== s; )
      O += n[E++], E = E % e;
    if (s = (s + 1) % e, s === o && (o = (o + 1) % e), d - l < t)
      return;
    const U = m && d - m;
    return U ? Math.round(O * 1e3 / U) : void 0;
  };
}
function Lo(e, t) {
  let n = 0, r = 1e3 / t, s, o;
  const l = (d, m = Date.now()) => {
    n = m, s = null, o && (clearTimeout(o), o = null), e(...d);
  };
  return [(...d) => {
    const m = Date.now(), E = m - n;
    E >= r ? l(d, m) : (s = d, o || (o = setTimeout(() => {
      o = null, l(s);
    }, r - E)));
  }, () => s && l(s)];
}
const Yt = (e, t, n = 3) => {
  let r = 0;
  const s = Po(50, 250);
  return Lo((o) => {
    if (!o || typeof o.loaded != "number")
      return;
    const l = o.loaded, c = o.lengthComputable ? o.total : void 0, f = Math.max(0, c != null ? Math.min(l, c) : l), d = Math.max(0, f - r), m = s(d);
    r = Math.max(r, f);
    const E = {
      loaded: f,
      total: c,
      progress: c ? f / c : void 0,
      bytes: d,
      rate: m || void 0,
      estimated: m && c ? (c - f) / m : void 0,
      event: o,
      lengthComputable: c != null,
      [t ? "download" : "upload"]: !0
    };
    e(E);
  }, n);
}, _r = (e, t) => {
  const n = e != null;
  return [
    (r) => t[0]({
      lengthComputable: n,
      total: e,
      loaded: r
    }),
    t[1]
  ];
}, Nr = (e, t = u.asap) => (...n) => t(() => e(...n)), Io = se.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, se.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(se.origin),
  se.navigator && /(msie|trident)/i.test(se.navigator.userAgent)
) : () => !0, Mo = se.hasStandardBrowserEnv ? (
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
function Uo(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Fo(e, t) {
  if (!t)
    return e;
  let n = e.length;
  for (; n > 0 && e.charCodeAt(n - 1) === 47; )
    n--;
  return e.slice(0, n) + "/" + t.replace(/^\/+/, "");
}
const zo = /^https?:(?!\/\/)/i, Bo = /[\t\n\r]/g;
function Ho(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function jo(e) {
  return Ho(e).replace(Bo, "");
}
function qo(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, n, r = "") => `${n}${r}${Xt}`);
}
function $o(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${Xt}@`), n = t.indexOf("#"), s = (n === -1 ? t : t.slice(0, n)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${Xt}`
  );
  return n === -1 ? s : `${s}#${qo(t.slice(n + 1))}`;
}
function Tr(e, t) {
  if (typeof e == "string") {
    const n = jo(e);
    if (zo.test(n))
      throw new R(
        `Invalid URL ${JSON.stringify($o(n))}: missing "//" after protocol`,
        R.ERR_INVALID_URL,
        t
      );
  }
}
function xa(e, t, n, r) {
  Tr(t, r);
  let s = !Uo(t);
  return e && (s || n === !1) ? (Tr(e, r), Fo(e, t)) : t;
}
const Ar = (e) => e instanceof me ? { ...e } : e, Wo = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
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
  function r(m, E, O, U) {
    return u.isPlainObject(m) && u.isPlainObject(E) ? u.merge.call({ caseless: U }, m, E) : u.isPlainObject(E) ? u.merge({}, E) : u.isArray(E) ? E.slice() : E;
  }
  function s(m, E, O, U) {
    if (u.isUndefined(E)) {
      if (!u.isUndefined(m))
        return r(void 0, m, O, U);
    } else return r(m, E, O, U);
  }
  function o(m, E) {
    if (!u.isUndefined(E))
      return r(void 0, E);
  }
  function l(m, E) {
    if (u.isUndefined(E)) {
      if (!u.isUndefined(m))
        return r(void 0, m);
    } else return r(void 0, E);
  }
  function c(m) {
    const E = u.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!u.isUndefined(E))
      if (u.isPlainObject(E)) {
        if (u.hasOwnProp(E, m))
          return E[m];
      } else
        return;
    const O = u.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (u.isPlainObject(O) && u.hasOwnProp(O, m))
      return O[m];
  }
  function f(m, E, O) {
    if (u.hasOwnProp(t, O))
      return r(m, E);
    if (u.hasOwnProp(e, O))
      return r(void 0, m);
  }
  const d = {
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
    validateStatus: f,
    headers: (m, E, O) => s(Ar(m), Ar(E), O, !0)
  };
  return u.forEach(Wo({ ...e, ...t }), function(E) {
    if (E === "__proto__" || E === "constructor" || E === "prototype") return;
    const O = u.hasOwnProp(d, E) ? d[E] : s, U = u.hasOwnProp(e, E) ? e[E] : void 0, B = u.hasOwnProp(t, E) ? t[E] : void 0, H = O(U, B, E);
    u.isUndefined(H) && O !== f || (n[E] = H);
  }), u.hasOwnProp(t, "validateStatus") && u.isUndefined(t.validateStatus) && c("validateStatusUndefinedResolves") === !1 && (u.hasOwnProp(e, "validateStatus") ? n.validateStatus = r(void 0, e.validateStatus) : delete n.validateStatus), n;
}
const Go = ["content-type", "content-length"];
function Vo(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([r, s]) => {
    Go.includes(r.toLowerCase()) && e.set(r, s);
  });
}
const Jo = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
);
function wa(e) {
  const t = Ge({}, e), n = (O) => u.hasOwnProp(t, O) ? t[O] : void 0, r = n("data");
  let s = n("withXSRFToken");
  const o = n("xsrfHeaderName"), l = n("xsrfCookieName");
  let c = n("headers");
  const f = n("auth"), d = n("baseURL"), m = n("allowAbsoluteUrls"), E = n("url");
  if (t.headers = c = me.from(c), t.url = ha(
    xa(d, E, m, t),
    n("params"),
    n("paramsSerializer")
  ), f) {
    const O = u.getSafeProp(f, "username") || "", U = u.getSafeProp(f, "password") || "";
    try {
      c.set(
        "Authorization",
        "Basic " + btoa(O + ":" + (U ? Jo(U) : ""))
      );
    } catch (B) {
      throw R.from(B, R.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (u.isFormData(r) && (se.hasStandardBrowserEnv || se.hasStandardBrowserWebWorkerEnv || u.isReactNative(r) ? c.setContentType(void 0) : u.isFunction(r.getHeaders) && Vo(c, r.getHeaders(), n("formDataHeaderPolicy"))), se.hasStandardBrowserEnv && (u.isFunction(s) && (s = s(t)), s === !0 || s == null && Io(t.url))) {
    const U = o && l && Mo.read(l);
    U && c.set(o, U);
  }
  return t;
}
const Xo = typeof XMLHttpRequest < "u", Yo = Xo && function(e) {
  return new Promise(function(n, r) {
    const s = wa(e);
    let o = s.data;
    const l = me.from(s.headers).normalize();
    let { responseType: c, onUploadProgress: f, onDownloadProgress: d } = s, m, E, O, U, B;
    function H() {
      U && U(), B && B(), s.cancelToken && s.cancelToken.unsubscribe(m), s.signal && s.signal.removeEventListener("abort", m);
    }
    let v = new XMLHttpRequest();
    v.open(s.method.toUpperCase(), s.url, !0), v.timeout = s.timeout;
    function y() {
      if (!v)
        return;
      const L = me.from(
        "getAllResponseHeaders" in v && v.getAllResponseHeaders()
      ), h = {
        data: !c || c === "text" || c === "json" ? v.responseText : v.response,
        status: v.status,
        statusText: v.statusText,
        headers: L,
        config: e,
        request: v
      };
      ba(
        function(g) {
          n(g), H();
        },
        function(g) {
          r(g), H();
        },
        h
      ), v = null;
    }
    "onloadend" in v ? v.onloadend = y : v.onreadystatechange = function() {
      !v || v.readyState !== 4 || v.status === 0 && !(v.responseURL && v.responseURL.startsWith("file:")) || setTimeout(y);
    }, v.onabort = function() {
      v && (r(new R("Request aborted", R.ECONNABORTED, e, v)), H(), v = null);
    }, v.onerror = function(I) {
      const h = I && I.message ? I.message : "Network Error", S = new R(h, R.ERR_NETWORK, e, v);
      S.event = I || null, r(S), H(), v = null;
    }, v.ontimeout = function() {
      let I = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const h = s.transitional || Bn;
      s.timeoutErrorMessage && (I = s.timeoutErrorMessage), r(
        new R(
          I,
          h.clarifyTimeoutError ? R.ETIMEDOUT : R.ECONNABORTED,
          e,
          v
        )
      ), H(), v = null;
    }, o === void 0 && l.setContentType(null), "setRequestHeader" in v && u.forEach(ua(l), function(I, h) {
      v.setRequestHeader(h, I);
    }), u.isUndefined(s.withCredentials) || (v.withCredentials = !!s.withCredentials), c && c !== "json" && (v.responseType = s.responseType), d && ([O, B] = Yt(d, !0), v.addEventListener("progress", O)), f && v.upload && ([E, U] = Yt(f), v.upload.addEventListener("progress", E), v.upload.addEventListener("loadend", U)), (s.cancelToken || s.signal) && (m = (L) => {
      v && (r(!L || L.type ? new St(null, e, v) : L), v.abort(), H(), v = null);
    }, s.cancelToken && s.cancelToken.subscribe(m), s.signal && (s.signal.aborted ? m() : s.signal.addEventListener("abort", m)));
    const k = Do(s.url);
    if (k && !se.protocols.includes(k)) {
      r(
        new R(
          "Unsupported protocol " + k + ":",
          R.ERR_BAD_REQUEST,
          e
        )
      ), H();
      return;
    }
    v.send(o || null);
  });
}, Ko = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const s = function(f) {
    if (!r) {
      r = !0, l();
      const d = f instanceof Error ? f : this.reason;
      n.abort(
        d instanceof R ? d : new St(d instanceof Error ? d.message : d)
      );
    }
  };
  let o = t && setTimeout(() => {
    o = null, s(new R(`timeout of ${t}ms exceeded`, R.ETIMEDOUT));
  }, t);
  const l = () => {
    e && (o && clearTimeout(o), o = null, e.forEach((f) => {
      f.unsubscribe ? f.unsubscribe(s) : f.removeEventListener("abort", s);
    }), e = null);
  };
  e.forEach((f) => {
    if (!r) {
      if (f.aborted) {
        s.call(f);
        return;
      }
      f.addEventListener("abort", s, { once: !0 });
    }
  });
  const { signal: c } = n;
  return c.unsubscribe = () => u.asap(l), c;
}, Zo = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let r = 0, s;
  for (; r < n; )
    s = r + t, yield e.slice(r, s), r = s;
}, Qo = async function* (e, t) {
  for await (const n of ei(e))
    yield* Zo(n, t);
}, ei = async function* (e) {
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
}, Sr = (e, t, n, r) => {
  const s = Qo(e, t);
  let o = 0, l, c = (f) => {
    l || (l = !0, r && r(f));
  };
  return new ReadableStream(
    {
      async pull(f) {
        try {
          const { done: d, value: m } = await s.next();
          if (d) {
            c(), f.close();
            return;
          }
          let E = m.byteLength;
          if (n) {
            let O = o += E;
            n(O);
          }
          f.enqueue(new Uint8Array(m));
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
}, Rr = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, _a = (e, t, n) => t + 2 < n && Rr(e.charCodeAt(t + 1)) && Rr(e.charCodeAt(t + 2)), Or = (e) => e <= 57 ? e - 48 : (e & 223) - 55, ti = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, ni = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, ri = (e) => {
  const t = Math.floor(e / 4), n = e % 4;
  return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, ai = (e) => {
  const t = e.length;
  let n = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, si = (e) => {
  const t = e.length;
  let n = 0, r = 0, s = !1;
  for (let o = 0; o < t; o++) {
    let l = e.charCodeAt(o);
    if (l === 37 && _a(e, o, t) && (l = Or(e.charCodeAt(o + 1)) * 16 + Or(e.charCodeAt(o + 2)), o += 2), !ni(l)) {
      if (l === 61) {
        r++;
        continue;
      }
      if (!ti(l) || r > 0) {
        s = !0;
        continue;
      }
      n++;
    }
  }
  return s || r > 2 || r > 0 && (n + r) % 4 !== 0 || n % 4 === 1 ? ai(e) : ri(n);
}, oi = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const n = e.indexOf(",");
  if (n < 0) return 0;
  const r = e.slice(5, n), s = e.slice(n + 1);
  if (/;base64/i.test(r))
    return t(s);
  let l = 0;
  for (let c = 0, f = s.length; c < f; c++) {
    const d = s.charCodeAt(c);
    if (d === 37 && _a(s, c, f))
      l += 1, c += 2;
    else if (d < 128)
      l += 1;
    else if (d < 2048)
      l += 2;
    else if (d >= 55296 && d <= 56319 && c + 1 < f) {
      const m = s.charCodeAt(c + 1);
      m >= 56320 && m <= 57343 ? (l += 4, c++) : l += 3;
    } else
      l += 3;
  }
  return l;
};
function ii(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return oi(
    t === -1 ? e : e.slice(0, t),
    si
  );
}
const jn = "1.19.0", vr = 64 * 1024, { isFunction: Ht } = u, li = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), Cr = (e) => {
  if (!u.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, kr = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, ci = (e) => {
  const t = e.indexOf("://");
  let n = e;
  return t !== -1 && (n = n.slice(t + 3)), n.includes("@") || n.includes(":");
}, ui = (e) => {
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
  const { fetch: s, Request: o, Response: l } = e, c = s ? Ht(s) : typeof fetch == "function", f = Ht(o), d = Ht(l);
  if (!c)
    return !1;
  const m = c && Ht(n), E = c && (typeof r == "function" ? /* @__PURE__ */ ((y) => (k) => y.encode(k))(new r()) : async (y) => new Uint8Array(await new o(y).arrayBuffer())), O = f && m && kr(() => {
    let y = !1;
    const k = new o(se.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return y = !0, "half";
      }
    }), L = k.headers.has("Content-Type");
    return k.body != null && k.body.cancel(), y && !L;
  }), U = d && m && kr(() => u.isReadableStream(new l("").body)), B = {
    stream: U && ((y) => y.body)
  };
  c && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((y) => {
    !B[y] && (B[y] = (k, L) => {
      let I = k && k[y];
      if (I)
        return I.call(k);
      throw new R(
        `Response type '${y}' is not supported`,
        R.ERR_NOT_SUPPORT,
        L
      );
    });
  });
  const H = async (y) => {
    if (y == null)
      return 0;
    if (u.isBlob(y))
      return y.size;
    if (u.isSpecCompliantForm(y))
      return (await new o(se.origin, {
        method: "POST",
        body: y
      }).arrayBuffer()).byteLength;
    if (u.isArrayBufferView(y) || u.isArrayBuffer(y))
      return y.byteLength;
    if (u.isURLSearchParams(y) && (y = y + ""), u.isString(y))
      return (await E(y)).byteLength;
  }, v = async (y, k) => {
    const L = u.toFiniteNumber(y.getContentLength());
    return L ?? H(k);
  };
  return async (y) => {
    let {
      url: k,
      method: L,
      data: I,
      signal: h,
      cancelToken: S,
      timeout: g,
      onDownloadProgress: z,
      onUploadProgress: G,
      responseType: V,
      headers: J,
      withCredentials: N = "same-origin",
      fetchOptions: _,
      maxContentLength: w,
      maxBodyLength: T
    } = wa(y);
    const Ne = u.isNumber(w) && w > -1, Ue = u.isNumber(T) && T > -1, Rt = (W) => u.hasOwnProp(y, W) ? y[W] : void 0;
    let Ot = s || fetch;
    V = V ? (V + "").toLowerCase() : "text";
    let Te = Ko(
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
      y,
      te
    );
    try {
      let W;
      const pe = Rt("auth");
      if (pe) {
        const C = u.getSafeProp(pe, "username") || "", ne = u.getSafeProp(pe, "password") || "";
        W = {
          username: C,
          password: ne
        };
      }
      if (ci(k)) {
        const C = new URL(k, se.origin);
        if (!W && (C.username || C.password)) {
          const ne = Cr(C.username), we = Cr(C.password);
          W = {
            username: ne,
            password: we
          };
        }
        (C.username || C.password) && (C.username = "", C.password = "", k = C.href);
      }
      if (W && (J.delete("authorization"), J.set(
        "Authorization",
        "Basic " + btoa(li((W.username || "") + ":" + (W.password || "")))
      )), Ne && typeof k == "string" && k.startsWith("data:") && ii(k) > w)
        throw new R(
          "maxContentLength size of " + w + " exceeded",
          R.ERR_BAD_RESPONSE,
          y,
          te
        );
      if (Ue && L !== "get" && L !== "head") {
        const C = await H(I);
        if (typeof C == "number" && isFinite(C) && (Ce = C, C > T))
          throw vt();
      }
      const Ye = Ue && (u.isReadableStream(I) || u.isStream(I)), ut = (C, ne, we) => Sr(
        C,
        vr,
        (le) => {
          if (Ue && le > T)
            throw Fe = vt();
          ne && ne(le);
        },
        we
      );
      if (O && L !== "get" && L !== "head" && (G || Ye)) {
        if (Ce = Ce ?? await v(J, I), Ce !== 0 || Ye) {
          let C = new o(k, {
            method: "POST",
            body: I,
            duplex: "half"
          }), ne;
          if (u.isFormData(I) && (ne = C.headers.get("content-type")) && J.setContentType(ne), C.body) {
            const [we, le] = G && _r(
              Ce,
              Yt(Nr(G))
            ) || [];
            I = ut(C.body, we, le);
          }
        }
      } else if (Ye && !f && m && L !== "get" && L !== "head")
        I = ut(I);
      else if (Ye && f && !O && L !== "get" && L !== "head")
        throw new R(
          "Stream request bodies are not supported by the current fetch implementation",
          R.ERR_NOT_SUPPORT,
          y,
          te
        );
      u.isString(N) || (N = N ? "include" : "omit");
      const rn = f && "credentials" in o.prototype;
      if (u.isFormData(I)) {
        const C = J.getContentType();
        C && /^multipart\/form-data/i.test(C) && !/boundary=/i.test(C) && J.delete("content-type");
      }
      J.set("User-Agent", "axios/" + jn, !1);
      const mt = {
        ..._,
        signal: Te,
        method: L.toUpperCase(),
        headers: ua(J.normalize()),
        body: I,
        duplex: "half",
        credentials: rn ? N : void 0
      };
      te = f && new o(k, mt);
      let j = await (f ? Ot(te, _) : Ot(k, mt));
      const Ke = me.from(j.headers);
      if (Ne) {
        const C = u.toFiniteNumber(Ke.getContentLength());
        if (C != null && C > w)
          throw new R(
            "maxContentLength size of " + w + " exceeded",
            R.ERR_BAD_RESPONSE,
            y,
            te
          );
      }
      const X = U && (V === "stream" || V === "response");
      if (U && j.body && (z || Ne || X && $)) {
        const C = {};
        ["status", "statusText", "headers"].forEach((ke) => {
          C[ke] = j[ke];
        });
        const ne = u.toFiniteNumber(Ke.getContentLength()), [we, le] = z && _r(
          ne,
          Yt(Nr(z), !0)
        ) || [];
        let ft = 0;
        const dt = (ke) => {
          if (Ne && (ft = ke, ft > w))
            throw new R(
              "maxContentLength size of " + w + " exceeded",
              R.ERR_BAD_RESPONSE,
              y,
              te
            );
          we && we(ke);
        };
        j = new l(
          Sr(j.body, vr, dt, () => {
            le && le(), $ && $();
          }),
          C
        );
      }
      V = V || "text";
      let Ee = await B[u.findKey(B, V) || "text"](
        j,
        y
      );
      if (Ne && !U && !X) {
        let C;
        if (Ee != null && (typeof Ee.byteLength == "number" ? C = Ee.byteLength : typeof Ee.size == "number" ? C = Ee.size : typeof Ee == "string" && (C = typeof r == "function" ? new r().encode(Ee).byteLength : Ee.length)), typeof C == "number" && C > w)
          throw new R(
            "maxContentLength size of " + w + " exceeded",
            R.ERR_BAD_RESPONSE,
            y,
            te
          );
      }
      return !X && $ && $(), await new Promise((C, ne) => {
        ba(C, ne, {
          data: Ee,
          headers: me.from(j.headers),
          status: j.status,
          statusText: j.statusText,
          config: y,
          request: te
        });
      });
    } catch (W) {
      if ($ && $(), Te && Te.aborted && Te.reason instanceof R) {
        const pe = Te.reason;
        throw pe.config = y, te && (pe.request = te), W !== pe && Object.defineProperty(pe, "cause", {
          __proto__: null,
          value: W,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), pe;
      }
      if (Fe)
        throw te && !Fe.request && (Fe.request = te), Fe;
      if (W instanceof R)
        throw te && !W.request && (W.request = te), W;
      if (W && W.name === "TypeError" && /Load failed|fetch/i.test(W.message)) {
        const pe = new R(
          "Network Error",
          R.ERR_NETWORK,
          y,
          te,
          W && W.response
        );
        throw Object.defineProperty(pe, "cause", {
          __proto__: null,
          value: W.cause || W,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), pe;
      }
      throw R.from(W, W && W.code, y, te, W && W.response);
    }
  };
}, mi = /* @__PURE__ */ new Map(), Na = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: s } = t, o = [r, s, n];
  let l = o.length, c = l, f, d, m = mi;
  for (; c--; )
    f = o[c], d = m.get(f), d === void 0 && m.set(f, d = c ? /* @__PURE__ */ new Map() : ui(t)), m = d;
  return d;
};
Na();
const qn = {
  http: go,
  xhr: Yo,
  fetch: {
    get: Na
  }
};
u.forEach(qn, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const Dr = (e) => `- ${e}`, fi = (e) => u.isFunction(e) || e === null || e === !1;
function di(e, t) {
  e = u.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, s;
  const o = {};
  for (let l = 0; l < n; l++) {
    r = e[l];
    let c;
    if (s = r, !fi(r) && (s = qn[(c = String(r)).toLowerCase()], s === void 0))
      throw new R(`Unknown adapter '${c}'`);
    if (s && (u.isFunction(s) || (s = s.get(t))))
      break;
    o[c || "#" + l] = s;
  }
  if (!s) {
    const l = Object.entries(o).map(
      ([f, d]) => `adapter ${f} ` + (d === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let c = n ? l.length > 1 ? `since :
` + l.map(Dr).join(`
`) : " " + Dr(l[0]) : "as no adapter specified";
    throw new R(
      "There is no suitable adapter to dispatch the request " + c,
      R.ERR_NOT_SUPPORT
    );
  }
  return s;
}
const Ta = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: di,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: qn
};
function _n(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new St(null, e);
}
function Nn(e) {
  return _n(e), e.headers = me.from(e.headers), e.data = wn.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Ta.getAdapter(e.adapter || At.adapter, e)(e).then(
    function(r) {
      _n(e), e.response = r;
      try {
        r.data = wn.call(e, e.transformResponse, r);
      } finally {
        delete e.response;
      }
      return r.headers = me.from(r.headers), r;
    },
    function(r) {
      if (!Ea(r) && (_n(e), r && r.response)) {
        e.response = r.response;
        try {
          r.response.data = wn.call(
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
const tn = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  tn[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const Pr = {};
tn.transitional = function(t, n, r) {
  function s(o, l) {
    return "[Axios v" + jn + "] Transitional option '" + o + "'" + l + (r ? ". " + r : "");
  }
  return (o, l, c) => {
    if (t === !1)
      throw new R(
        s(l, " has been removed" + (n ? " in " + n : "")),
        R.ERR_DEPRECATED
      );
    return n && !Pr[l] && (Pr[l] = !0, console.warn(
      s(
        l,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(o, l, c) : !0;
  };
};
tn.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function pi(e, t, n) {
  if (typeof e != "object" || e === null)
    throw new R("options must be an object", R.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0; ) {
    const o = r[s], l = Object.prototype.hasOwnProperty.call(t, o) ? t[o] : void 0;
    if (l) {
      const c = e[o], f = c === void 0 || l(c, o, e);
      if (f !== !0)
        throw new R(
          "option " + o + " must be " + f,
          R.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (n !== !0)
      throw new R("Unknown option " + o, R.ERR_BAD_OPTION);
  }
}
const Gt = {
  assertOptions: pi,
  validators: tn
}, ce = Gt.validators;
let qe = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new xr(),
      response: new xr()
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
`, l + 1), f = c === -1 ? "" : o.slice(c + 1);
            String(r.stack).endsWith(f) || (r.stack += `
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
    r !== void 0 && Gt.assertOptions(
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
    } : Gt.assertOptions(
      s,
      {
        encode: ce.function,
        serialize: ce.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Gt.assertOptions(
      n,
      {
        baseUrl: ce.spelling("baseURL"),
        withXsrfToken: ce.spelling("withXSRFToken")
      },
      !0
    ), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let l = o && u.merge(o.common, o[n.method]);
    o && u.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (B) => {
      delete o[B];
    }), n.headers = me.concat(l, o);
    const c = [];
    let f = !0;
    this.interceptors.request.forEach(function(H) {
      if (typeof H.runWhen == "function" && H.runWhen(n) === !1)
        return;
      f = f && H.synchronous;
      const v = n.transitional || Bn;
      v && v.legacyInterceptorReqResOrdering ? c.unshift(H.fulfilled, H.rejected) : c.push(H.fulfilled, H.rejected);
    });
    const d = [];
    this.interceptors.response.forEach(function(H) {
      d.push(H.fulfilled, H.rejected);
    });
    let m, E = 0, O;
    if (!f) {
      const B = [Nn.bind(this), void 0];
      for (B.unshift(...c), B.push(...d), O = B.length, m = Promise.resolve(n); E < O; )
        m = m.then(B[E++], B[E++]);
      return m;
    }
    O = c.length;
    let U = n;
    for (; E < O; ) {
      const B = c[E++], H = c[E++];
      try {
        U = B ? B(U) : U;
      } catch (v) {
        if (!H) {
          m = Promise.reject(v);
          break;
        }
        try {
          const y = H.call(this, v);
          u.isThenable(y) && (m = Promise.resolve(y).then(
            () => Nn.call(this, U)
          ));
        } catch (y) {
          m = Promise.reject(y);
        }
        break;
      }
    }
    if (!m)
      try {
        m = Nn.call(this, U);
      } catch (B) {
        m = Promise.reject(B);
      }
    for (E = 0, O = d.length; E < O; )
      m = m.then(d[E++], d[E++]);
    return m;
  }
  getUri(t) {
    t = Ge(this.defaults, t);
    const n = xa(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return ha(n, t.params, t.paramsSerializer);
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
let hi = class Aa {
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
      token: new Aa(function(s) {
        t = s;
      }),
      cancel: t
    };
  }
};
function gi(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function yi(e) {
  return u.isObject(e) && e.isAxiosError === !0;
}
const Pn = {
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
Object.entries(Pn).forEach(([e, t]) => {
  Pn[t] = e;
});
function Sa(e) {
  const t = new qe(e), n = ta(qe.prototype.request, t);
  return u.extend(n, qe.prototype, t, { allOwnKeys: !0 }), u.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(s) {
    return Sa(Ge(e, s));
  }, n;
}
const Q = Sa(At);
Q.Axios = qe;
Q.CanceledError = St;
Q.CancelToken = hi;
Q.isCancel = Ea;
Q.VERSION = jn;
Q.toFormData = en;
Q.AxiosError = R;
Q.Cancel = Q.CanceledError;
Q.all = function(t) {
  return Promise.all(t);
};
Q.spread = gi;
Q.isAxiosError = yi;
Q.mergeConfig = Ge;
Q.AxiosHeaders = me;
Q.formToJSON = (e) => ya(u.isHTMLForm(e) ? new FormData(e) : e);
Q.getAdapter = Ta.getAdapter;
Q.HttpStatusCode = Pn;
Q.default = Q;
const {
  Axios: Sl,
  AxiosError: Rl,
  CanceledError: Ol,
  isCancel: vl,
  CancelToken: Cl,
  VERSION: kl,
  all: Dl,
  Cancel: Pl,
  isAxiosError: Ll,
  spread: Il,
  toFormData: Ml,
  AxiosHeaders: Ul,
  HttpStatusCode: Fl,
  formToJSON: zl,
  getAdapter: Bl,
  mergeConfig: Hl,
  create: jl
} = Q, ve = Q.create({ baseURL: "/api" });
ve.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const Ei = {
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
function b(e, t) {
  return ((t == null ? void 0 : t.site_lang) || localStorage.getItem("mortar_site_lang") || localStorage.getItem("mortar_lang") || "en") === "zh" && Ei[e] || e;
}
function bi({ settings: e }) {
  const [t, n] = Oe([]), [r, s] = Oe(!1), [o, l] = Oe(null);
  Ve(() => {
    ve.get("/menus/location/primary").then((f) => n(f.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && ve.get("/auth/me").then((f) => l(f.data)).catch(() => localStorage.removeItem("mortar_token"));
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
      a.createElement(M, { to: "/", className: "text-xl font-bold text-gray-900 tracking-tight" }, e.site_title || "Mortar"),
      a.createElement(
        "div",
        { className: "hidden md:flex items-center gap-6" },
        a.createElement(M, { to: "/", className: "text-sm text-gray-600 hover:text-gray-900" }, b("home", e)),
        t.filter((f) => !(f.url === "/" && (f.label.toLowerCase() === "home" || f.label === b("home", e)))).map((f) => a.createElement(M, { key: f.id, to: f.url, className: "text-sm text-gray-600 hover:text-gray-900" }, f.label)),
        o ? a.createElement(
          "div",
          { className: "flex items-center gap-2" },
          a.createElement("span", { className: "text-sm text-gray-600" }, o.username),
          a.createElement("button", { onClick: c, className: "text-sm text-gray-400 hover:text-gray-600" }, b("logout"))
        ) : a.createElement(
          a.Fragment,
          null,
          a.createElement(M, { to: "/login", className: "text-sm text-gray-600 hover:text-gray-900" }, b("sign in")),
          a.createElement(M, { to: "/register", className: "text-sm text-gray-600 hover:text-gray-900" }, b("register", e))
        ),
        a.createElement("a", { href: "/admin", className: "text-sm text-primary-600 hover:text-primary-700 font-medium" }, b("admin", e))
      ),
      a.createElement(
        "div",
        { className: "flex items-center gap-3 md:hidden" },
        a.createElement("button", { onClick: () => s(!r), className: "p-2 text-gray-600" }, r ? a.createElement(os, { size: 20 }) : a.createElement(rs, { size: 20 }))
      )
    ),
    r && a.createElement(
      "div",
      { className: "md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2" },
      a.createElement(M, { to: "/", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, b("home", e)),
      t.filter((f) => !(f.url === "/" && (f.label.toLowerCase() === "home" || f.label === b("home", e)))).map((f) => a.createElement(M, { key: f.id, to: f.url, className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, f.label)),
      o ? a.createElement(
        a.Fragment,
        null,
        a.createElement("span", { className: "block text-sm text-gray-600 py-1" }, o.username),
        a.createElement("button", { onClick: c, className: "block text-sm text-gray-400 py-1" }, b("logout"))
      ) : a.createElement(M, { to: "/login", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, b("sign in")),
      a.createElement(M, { to: "/register", className: "block text-sm text-gray-600 py-1", onClick: () => s(!1) }, b("register", e)),
      a.createElement("a", { href: "/admin", className: "block text-sm text-primary-600 font-medium py-1" }, b("admin", e))
    )
  );
}
function xi({ settings: e }) {
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
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, b("navigate", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement(M, { to: "/", className: "text-sm text-gray-500 hover:text-gray-700" }, b("home", e))),
            a.createElement("li", null, a.createElement(M, { to: "/search", className: "text-sm text-gray-500 hover:text-gray-700" }, b("search", e))),
            a.createElement("li", null, a.createElement("a", { href: "/api/feed/rss", className: "text-sm text-gray-500 hover:text-gray-700" }, b("rss feed", e)))
          )
        ),
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, b("about", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement(M, { to: "/page/about", className: "text-sm text-gray-500 hover:text-gray-700" }, b("about", e))),
            a.createElement("li", null, a.createElement(M, { to: "/page/privacy-policy", className: "text-sm text-gray-500 hover:text-gray-700" }, b("privacy policy", e)))
          )
        ),
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, b("admin", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement("a", { href: "/admin", className: "text-sm text-gray-500 hover:text-gray-700" }, b("dashboard", e))),
            a.createElement("li", null, a.createElement("a", { href: "/admin#/posts", className: "text-sm text-gray-500 hover:text-gray-700" }, b("posts", e)))
          )
        ),
        a.createElement(
          "div",
          null,
          a.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-3" }, b("connect", e)),
          a.createElement(
            "ul",
            { className: "space-y-1" },
            a.createElement("li", null, a.createElement("a", { href: "/api/feed/rss", target: "_blank", className: "text-sm text-gray-500 hover:text-gray-700" }, b("rss feed", e))),
            a.createElement("li", null, a.createElement("a", { href: "/api/sitemap.xml", target: "_blank", className: "text-sm text-gray-500 hover:text-gray-700" }, b("sitemap", e)))
          )
        )
      ),
      a.createElement(
        "div",
        { className: "text-center pt-6 border-t border-gray-200" },
        a.createElement(
          "p",
          { className: "text-sm text-gray-500" },
          "© " + (/* @__PURE__ */ new Date()).getFullYear() + " " + (e.site_title || "Mortar CMS") + ". " + b("powered by", e) + " Mortar. ",
          a.createElement("a", { href: "/api/feed/rss", className: "text-primary-600 hover:text-primary-700", target: "_blank" }, b("rss feed", e))
        )
      )
    )
  );
}
function $n() {
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
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, b("tag cloud")),
    a.createElement(
      "div",
      { className: "flex flex-wrap gap-1.5" },
      e.map((r) => {
        var o, l, c;
        const s = 0.65 + (((o = r._count) == null ? void 0 : o.posts) || 0) / n * 0.35;
        return a.createElement(M, {
          key: r.id,
          to: "/tag/" + r.slug,
          className: "inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors",
          style: { fontSize: s + "rem" },
          title: (((l = r._count) == null ? void 0 : l.posts) || 0) + " " + b("posts")
        }, r.name + " (" + (((c = r._count) == null ? void 0 : c.posts) || 0) + ")");
      })
    )
  );
}
function Wn() {
  const [e, t] = Oe([]);
  return Ve(() => {
    ve.get("/posts?limit=5").then((n) => t(n.data.posts || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, b("recent posts")),
    a.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((n) => a.createElement(
        "li",
        { key: n.id },
        a.createElement(M, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title)
      ))
    )
  );
}
function Gn() {
  const [e, t] = Oe([]);
  return Ve(() => {
    ve.get("/posts/popular?limit=5").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, a.createElement(ss, { size: 14 }), b("popular posts")),
    a.createElement(
      "ul",
      { className: "space-y-2" },
      e.map(
        (n, r) => a.createElement(
          "li",
          { key: n.id, className: "flex items-start gap-2" },
          a.createElement("span", { className: "text-xs font-bold text-gray-300 mt-0.5 w-4" }, r + 1),
          a.createElement(M, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title),
          n.views > 0 && a.createElement("span", { className: "text-xs text-gray-400 ml-auto shrink-0" }, n.views + " " + b("views"))
        )
      )
    )
  );
}
function Vn() {
  const [e, t] = Oe([]);
  if (Ve(() => {
    ve.get("/posts/archives").then((r) => t(r.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const n = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, b("archives")),
    a.createElement(
      "ul",
      { className: "space-y-1" },
      e.map((r) => {
        const [s, o] = r.month.split("-");
        return a.createElement(
          "li",
          { key: r.month },
          a.createElement(
            M,
            { to: "/archive/" + s + "/" + o, className: "text-sm text-gray-600 hover:text-primary-600" },
            n[parseInt(o) - 1] + " " + s + " (" + r.count + ")"
          )
        );
      })
    )
  );
}
function Jn() {
  const [e, t] = Oe(""), n = Xa(), r = (s) => {
    s.preventDefault(), e.trim() && n("/search?q=" + encodeURIComponent(e.trim()));
  };
  return a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, b("search")),
    a.createElement(
      "form",
      { onSubmit: r, className: "flex gap-2" },
      a.createElement("input", {
        type: "text",
        value: e,
        onChange: (s) => t(s.target.value),
        placeholder: b("search placeholder"),
        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      }),
      a.createElement("button", {
        type: "submit",
        className: "px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      }, a.createElement(ea, { size: 16 }))
    )
  );
}
function Xn() {
  const [e, t] = Oe([]);
  return Ve(() => {
    ve.get("/links").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : a.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, b("links")),
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
function Ra(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function _t(e, t) {
  if (!e) return;
  const n = Ra(t.cdn_url);
  return n && e.startsWith("/uploads/") ? n + e : e;
}
function wi(e, t) {
  let n = e;
  const r = Ra(t.cdn_url);
  return r && (n = n.replace(/(src|href|data-src|poster)="\/uploads\//g, '$1="' + r + "/uploads/")), n.replace(/<img(?![^>]*loading=)[^>]*>/g, (s) => s.replace(/<img/, '<img loading="lazy"'));
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
function nn(e) {
  const t = (e || "").replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(t / 200)) + " min read";
}
function _i(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function Ni(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: l, catSlug: c, isTagPage: f, categories: d } = e;
  return a.createElement(
    "div",
    null,
    c && a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-12 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, (f ? b("tag", t) + ": " : "") + (c || "").replace(/-/g, " "))
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
          n.length === 0 ? l ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, b("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, b("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, b("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, b("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-8" },
            n.map((m) => {
              var E, O, U;
              return a.createElement(
                "article",
                { key: m.id, className: "pb-8 border-b border-gray-100 last:border-0" },
                m.featured && a.createElement("img", { src: _t(m.featured, t), alt: m.title, className: "w-full h-48 object-cover rounded-lg mb-4", loading: "lazy" }),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-3" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(m.publishedAt || m.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Mn, { size: 12 }), a.createElement(M, { to: "/author/" + (((E = m.author) == null ? void 0 : E.username) || ""), className: "hover:text-primary-600" }, (O = m.author) == null ? void 0 : O.username)),
                  ((U = m.categories) == null ? void 0 : U[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 12 }), m.categories[0].name)
                ),
                a.createElement(
                  M,
                  { to: "/post/" + m.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-2" }, m.format && m.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, _i(m.format), m.format.charAt(0).toUpperCase() + m.format.slice(1)) : null, m.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + b("featured", t)) : null, m.title)
                ),
                m.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, m.excerpt),
                a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, nn(m.content)),
                m.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, a.createElement(Zt, { size: 12 }), "" + m.commentCount),
                a.createElement(M, { to: "/post/" + m.slug, className: "inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700" }, b("read more", t))
              );
            })
          ),
          r > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + b("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, b("page", t) + " " + s + " " + b("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, b("next", t) + " →")
          )
        ),
        a.createElement(
          "aside",
          { className: "space-y-6" },
          (() => {
            const m = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), E = (O) => m.length === 0 || m.includes(O);
            return a.createElement(
              a.Fragment,
              null,
              E("search") && a.createElement(Jn),
              E("recent_posts") && a.createElement(Wn),
              E("popular") && a.createElement(Gn),
              E("tag_cloud") && a.createElement($n),
              E("archives") && a.createElement(Vn),
              E("links") && a.createElement(Xn)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, b("categories", t)),
            d.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, b("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, d.map((m) => {
              var E;
              return a.createElement(
                "li",
                { key: m.id },
                a.createElement(M, { to: "/category/" + m.slug, className: "text-sm " + (c === m.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, m.name, ((E = m._count) == null ? void 0 : E.posts) > 0 ? a.createElement("span", { className: "text-gray-400 ml-1" }, "(" + m._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
function Ti(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function Ai(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: l, catSlug: c, categories: f } = e;
  return a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-10 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, (c || "").replace(/-/g, " ")),
      a.createElement("p", { className: "text-sm text-gray-500 mt-2" }, r + " " + b("posts", t))
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
          n.length === 0 ? l ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, b("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, b("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, b("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, b("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-8" },
            n.map((d) => {
              var m, E, O;
              return a.createElement(
                "article",
                { key: d.id, className: "pb-8 border-b border-gray-100 last:border-0" },
                d.featured && a.createElement("img", { src: _t(d.featured, t), alt: d.title, className: "w-full h-48 object-cover rounded-lg mb-4", loading: "lazy" }),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-3" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(d.publishedAt || d.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Mn, { size: 12 }), a.createElement(M, { to: "/author/" + (((m = d.author) == null ? void 0 : m.username) || ""), className: "hover:text-primary-600" }, (E = d.author) == null ? void 0 : E.username)),
                  ((O = d.categories) == null ? void 0 : O[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 12 }), d.categories[0].name)
                ),
                a.createElement(
                  M,
                  { to: "/post/" + d.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-2" }, d.format && d.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, Ti(d.format), d.format.charAt(0).toUpperCase() + d.format.slice(1)) : null, d.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + b("featured", t)) : null, d.title)
                ),
                d.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, d.excerpt),
                a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, nn(d.content)),
                d.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, a.createElement(Zt, { size: 12 }), "" + d.commentCount),
                a.createElement(M, { to: "/post/" + d.slug, className: "inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700" }, b("read more", t))
              );
            })
          ),
          r > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + b("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, b("page", t) + " " + s + " " + b("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, b("next", t) + " →")
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
            })(), m = (E) => d.length === 0 || d.includes(E);
            return a.createElement(
              a.Fragment,
              null,
              m("search") && a.createElement(Jn),
              m("recent_posts") && a.createElement(Wn),
              m("popular") && a.createElement(Gn),
              m("tag_cloud") && a.createElement($n),
              m("archives") && a.createElement(Vn),
              m("links") && a.createElement(Xn)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, b("categories", t)),
            f.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, b("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, f.map((d) => {
              var m;
              return a.createElement(
                "li",
                { key: d.id },
                a.createElement(M, { to: "/category/" + d.slug, className: "text-sm " + (c === d.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, d.name, ((m = d._count) == null ? void 0 : m.posts) > 0 ? a.createElement("span", { className: "text-gray-400 ml-1" }, "(" + d._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
function Si(e) {
  return { gallery: "🖼", video: "🎬", audio: "🎵", quote: "💬", link: "🔗" }[e] || "";
}
function Ri(e) {
  const { settings: t, posts: n, total: r, page: s, setPage: o, loadError: l, catSlug: c, categories: f } = e;
  return a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      { className: "bg-gray-50 border-b border-gray-200 py-10 text-center" },
      a.createElement("h1", { className: "text-3xl font-bold text-gray-900 capitalize" }, b("tag", t) + ": " + (c || "").replace(/-/g, " ")),
      a.createElement("p", { className: "text-sm text-gray-500 mt-2" }, r + " " + b("posts", t))
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
          n.length === 0 ? l ? a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "⚠️"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, b("failed to load posts", t)), a.createElement("p", { className: "text-sm text-gray-500" }, b("please try again later", t))) : a.createElement("div", { className: "text-center py-20" }, a.createElement("div", { className: "text-6xl mb-4" }, "📝"), a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, b("no posts yet", t)), a.createElement("p", { className: "text-sm text-gray-500" }, b("check back later for new content", t))) : a.createElement(
            "div",
            { className: "space-y-8" },
            n.map((d) => {
              var m, E, O;
              return a.createElement(
                "article",
                { key: d.id, className: "pb-8 border-b border-gray-100 last:border-0" },
                d.featured && a.createElement("img", { src: _t(d.featured, t), alt: d.title, className: "w-full h-48 object-cover rounded-lg mb-4", loading: "lazy" }),
                a.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-3" },
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(d.publishedAt || d.createdAt)),
                  a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Mn, { size: 12 }), a.createElement(M, { to: "/author/" + (((m = d.author) == null ? void 0 : m.username) || ""), className: "hover:text-primary-600" }, (E = d.author) == null ? void 0 : E.username)),
                  ((O = d.categories) == null ? void 0 : O[0]) && a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Kt, { size: 12 }), d.categories[0].name)
                ),
                a.createElement(
                  M,
                  { to: "/post/" + d.slug },
                  a.createElement("h2", { className: "text-xl font-bold text-gray-900 hover:text-primary-600 mb-2" }, d.format && d.format !== "standard" ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded" }, Si(d.format), d.format.charAt(0).toUpperCase() + d.format.slice(1)) : null, d.sticky ? a.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle" }, "★ " + b("featured", t)) : null, d.title)
                ),
                d.excerpt && a.createElement("p", { className: "text-gray-600 text-sm leading-relaxed" }, d.excerpt),
                a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, nn(d.content)),
                d.commentCount > 0 && a.createElement("span", { className: "inline-flex items-center gap-1 text-xs text-gray-400" }, a.createElement(Zt, { size: 12 }), "" + d.commentCount),
                a.createElement(M, { to: "/post/" + d.slug, className: "inline-block mt-3 text-sm font-medium text-primary-600 hover:text-primary-700" }, b("read more", t))
              );
            })
          ),
          r > parseInt(t.posts_per_page || "10") && a.createElement(
            "div",
            { className: "flex items-center justify-center gap-4 pt-4" },
            a.createElement("button", { onClick: () => o(Math.max(1, s - 1)), disabled: s === 1, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, "← " + b("previous", t)),
            a.createElement("span", { className: "text-sm text-gray-500" }, b("page", t) + " " + s + " " + b("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
            a.createElement("button", { onClick: () => o(s + 1), disabled: s * parseInt(t.posts_per_page || "10") >= r, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50" }, b("next", t) + " →")
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
            })(), m = (E) => d.length === 0 || d.includes(E);
            return a.createElement(
              a.Fragment,
              null,
              m("search") && a.createElement(Jn),
              m("recent_posts") && a.createElement(Wn),
              m("popular") && a.createElement(Gn),
              m("tag_cloud") && a.createElement($n),
              m("archives") && a.createElement(Vn),
              m("links") && a.createElement(Xn)
            );
          })(),
          a.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            a.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, b("categories", t)),
            f.length === 0 ? a.createElement("p", { className: "text-sm text-gray-500" }, b("no categories yet", t)) : a.createElement("ul", { className: "space-y-1" }, f.map((d) => {
              var m;
              return a.createElement(
                "li",
                { key: d.id },
                a.createElement(M, { to: "/category/" + d.slug, className: "text-sm " + (c === d.slug ? "text-primary-600 font-medium" : "text-gray-600 hover:text-primary-600") }, d.name, ((m = d._count) == null ? void 0 : m.posts) > 0 ? a.createElement("span", { className: "text-gray-400 ml-1" }, "(" + d._count.posts + ")") : null)
              );
            }))
          )
        )
      )
    )
  );
}
const Oi = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function vi(e) {
  const { data: t, year: n, month: r } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(M, { to: "/", className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6" }, a.createElement(Zr, { size: 14 }), b("back")),
    a.createElement("h1", { className: "text-2xl font-bold text-gray-900 mb-6" }, Oi[parseInt(r || "1") - 1] + " " + n),
    a.createElement("p", { className: "text-sm text-gray-500 mb-6" }, t.total + " " + b("posts")),
    t.posts.length === 0 ? a.createElement("p", { className: "text-gray-500" }, b("no posts in this month")) : a.createElement(
      "div",
      { className: "space-y-6" },
      t.posts.map((s) => a.createElement(
        "article",
        { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
        a.createElement(M, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, s.title)),
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
function Ci(e, t) {
  return !t || !e ? e : e.split(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi")).map(
    (r, s) => r.toLowerCase() === t.toLowerCase() ? a.createElement("mark", { key: s, className: "bg-yellow-200 rounded px-0.5" }, r) : r
  );
}
function ki(e) {
  const { query: t, posts: n, loading: r } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement("h1", { className: "text-2xl font-bold text-gray-900 mb-2" }, b("search results")),
    a.createElement("p", { className: "text-sm text-gray-500 mb-6" }, t ? b("showing results for") + ' "' + t + '"' : b("enter a search term")),
    r ? a.createElement("p", { className: "text-gray-500" }, b("searching")) : n.length === 0 ? a.createElement(
      "div",
      { className: "text-center py-12" },
      a.createElement(ea, { size: 48, className: "mx-auto text-gray-300 mb-4" }),
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, b("no results for") + ' "' + t + '"'),
      a.createElement("p", { className: "text-sm text-gray-500 mb-4" }, b("try different keywords")),
      a.createElement(M, { to: "/", className: "text-primary-600 text-sm" }, "← " + b("browse all posts"))
    ) : a.createElement(
      "div",
      { className: "space-y-6" },
      n.map((s) => {
        var o;
        return a.createElement(
          "article",
          { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
          a.createElement(M, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, s.title)),
          a.createElement(
            "div",
            { className: "flex items-center gap-3 text-xs text-gray-500 mb-2" },
            a.createElement("span", { className: "flex items-center gap-1" }, a.createElement(Je, { size: 12 }), Xe(s.publishedAt || s.createdAt)),
            a.createElement("span", null, b("written by") + " " + (((o = s.author) == null ? void 0 : o.username) || "Unknown"))
          ),
          s.excerpt && a.createElement("p", { className: "text-sm text-gray-600" }, Ci(s.excerpt, t))
        );
      })
    )
  );
}
function Di(e) {
  const { username: t, posts: n, loading: r } = e;
  return a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(M, { to: "/", className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6" }, a.createElement(Zr, { size: 14 }), b("back")),
    a.createElement(
      "div",
      { className: "flex items-center gap-3 mb-8" },
      a.createElement("div", { className: "w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-bold" }, (t || "?")[0].toUpperCase()),
      a.createElement(
        "div",
        null,
        a.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, t),
        a.createElement("p", { className: "text-sm text-gray-500" }, n.length + " " + b("posts"))
      )
    ),
    r ? a.createElement("p", { className: "text-gray-500" }, b("loading")) : n.length === 0 ? a.createElement("p", { className: "text-gray-500" }, b("no posts yet")) : a.createElement(
      "div",
      { className: "space-y-6" },
      n.map((s) => {
        var o;
        return a.createElement(
          "article",
          { key: s.id, className: "pb-6 border-b border-gray-100 last:border-0" },
          a.createElement(M, { to: "/post/" + s.slug }, a.createElement("h2", { className: "text-lg font-bold text-gray-900 hover:text-primary-600 mb-2" }, s.title)),
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
function Oa({ items: e }) {
  return a.createElement(
    "nav",
    { className: "flex items-center gap-1 text-sm text-gray-500 mb-6", "aria-label": "Breadcrumb" },
    a.createElement(M, { to: "/", className: "hover:text-gray-700 flex items-center gap-1" }, a.createElement(ts, { size: 14 })),
    e.map((t, n) => a.createElement(
      a.Fragment,
      { key: n },
      a.createElement(Qa, { size: 12, className: "text-gray-300" }),
      n === e.length - 1 || !t.to ? a.createElement("span", { className: "text-gray-900 font-medium" }, t.label) : a.createElement(M, { to: t.to, className: "hover:text-gray-700" }, t.label)
    ))
  );
}
function Pi({ postId: e, slug: t }) {
  const [n, r] = Oe([]);
  return Ve(() => {
    e && ve.get("/posts/" + e + "/related").then((s) => r(s.data)).catch(() => {
    });
  }, [e]), n.length === 0 ? a.createElement("p", { className: "text-sm text-gray-400" }, b("no related posts")) : a.createElement(
    "div",
    { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
    n.map((s) => a.createElement(
      M,
      { key: s.id, to: "/post/" + s.slug, className: "group block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all" },
      a.createElement("h4", { className: "text-sm font-medium text-gray-900 group-hover:text-primary-600 mb-1" }, s.title),
      a.createElement("p", { className: "text-xs text-gray-500 line-clamp-2" }, s.excerpt || "")
    ))
  );
}
function Li({ title: e, url: t, siteUrl: n }) {
  const r = (n || window.location.origin) + t, s = encodeURIComponent(r), o = encodeURIComponent(e);
  async function l() {
    try {
      await navigator.clipboard.writeText(r), alert(b("link copied to clipboard"));
    } catch {
      window.prompt(b("copy link"), r);
    }
  }
  const c = (f) => a.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" }, a.createElement("path", { d: f }));
  return a.createElement(
    "div",
    { className: "flex items-center gap-2" },
    a.createElement("span", { className: "text-xs text-gray-400 mr-1" }, b("share") + ":"),
    a.createElement("a", { href: "https://twitter.com/intent/tweet?url=" + s + "&text=" + o, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors", title: "Twitter" }, c("M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z")),
    a.createElement("a", { href: "https://www.facebook.com/sharer/sharer.php?u=" + s, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors", title: "Facebook" }, c("M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z")),
    a.createElement("a", { href: "https://www.linkedin.com/sharing/share-offsite/?url=" + s, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", title: "LinkedIn" }, c("M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.9-2.2 4.18 0 4.95 2.75 4.95 6.32V24h-4v-8.6c0-2.05-.04-4.7-2.86-4.7-2.86 0-3.3 2.24-3.3 4.55V24h-4V8z")),
    a.createElement("button", { onClick: l, className: "p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors", title: b("copy link") }, a.createElement(ns, { size: 14 }))
  );
}
function Ii(e) {
  return e.replace(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/g,
    '<div class="aspect-video my-4"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen class="w-full h-full rounded-lg"></iframe></div>'
  ).replace(
    /(?:https?:\/\/)?twitter\.com\/(\w+)\/status\/(\d+)/g,
    '<blockquote class="twitter-tweet my-4"><a href="https://twitter.com/$1/status/$2"></a></blockquote>'
  );
}
function Mi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Vt = { exports: {} }, Ui = Vt.exports, Lr;
function Fi() {
  return Lr || (Lr = 1, (function(e) {
    (function(t) {
      function n(h, S) {
        var g = (h & 65535) + (S & 65535), z = (h >> 16) + (S >> 16) + (g >> 16);
        return z << 16 | g & 65535;
      }
      function r(h, S) {
        return h << S | h >>> 32 - S;
      }
      function s(h, S, g, z, G, V) {
        return n(r(n(n(S, h), n(z, V)), G), g);
      }
      function o(h, S, g, z, G, V, J) {
        return s(S & g | ~S & z, h, S, G, V, J);
      }
      function l(h, S, g, z, G, V, J) {
        return s(S & z | g & ~z, h, S, G, V, J);
      }
      function c(h, S, g, z, G, V, J) {
        return s(S ^ g ^ z, h, S, G, V, J);
      }
      function f(h, S, g, z, G, V, J) {
        return s(g ^ (S | ~z), h, S, G, V, J);
      }
      function d(h, S) {
        h[S >> 5] |= 128 << S % 32, h[(S + 64 >>> 9 << 4) + 14] = S;
        var g, z, G, V, J, N = 1732584193, _ = -271733879, w = -1732584194, T = 271733878;
        for (g = 0; g < h.length; g += 16)
          z = N, G = _, V = w, J = T, N = o(N, _, w, T, h[g], 7, -680876936), T = o(T, N, _, w, h[g + 1], 12, -389564586), w = o(w, T, N, _, h[g + 2], 17, 606105819), _ = o(_, w, T, N, h[g + 3], 22, -1044525330), N = o(N, _, w, T, h[g + 4], 7, -176418897), T = o(T, N, _, w, h[g + 5], 12, 1200080426), w = o(w, T, N, _, h[g + 6], 17, -1473231341), _ = o(_, w, T, N, h[g + 7], 22, -45705983), N = o(N, _, w, T, h[g + 8], 7, 1770035416), T = o(T, N, _, w, h[g + 9], 12, -1958414417), w = o(w, T, N, _, h[g + 10], 17, -42063), _ = o(_, w, T, N, h[g + 11], 22, -1990404162), N = o(N, _, w, T, h[g + 12], 7, 1804603682), T = o(T, N, _, w, h[g + 13], 12, -40341101), w = o(w, T, N, _, h[g + 14], 17, -1502002290), _ = o(_, w, T, N, h[g + 15], 22, 1236535329), N = l(N, _, w, T, h[g + 1], 5, -165796510), T = l(T, N, _, w, h[g + 6], 9, -1069501632), w = l(w, T, N, _, h[g + 11], 14, 643717713), _ = l(_, w, T, N, h[g], 20, -373897302), N = l(N, _, w, T, h[g + 5], 5, -701558691), T = l(T, N, _, w, h[g + 10], 9, 38016083), w = l(w, T, N, _, h[g + 15], 14, -660478335), _ = l(_, w, T, N, h[g + 4], 20, -405537848), N = l(N, _, w, T, h[g + 9], 5, 568446438), T = l(T, N, _, w, h[g + 14], 9, -1019803690), w = l(w, T, N, _, h[g + 3], 14, -187363961), _ = l(_, w, T, N, h[g + 8], 20, 1163531501), N = l(N, _, w, T, h[g + 13], 5, -1444681467), T = l(T, N, _, w, h[g + 2], 9, -51403784), w = l(w, T, N, _, h[g + 7], 14, 1735328473), _ = l(_, w, T, N, h[g + 12], 20, -1926607734), N = c(N, _, w, T, h[g + 5], 4, -378558), T = c(T, N, _, w, h[g + 8], 11, -2022574463), w = c(w, T, N, _, h[g + 11], 16, 1839030562), _ = c(_, w, T, N, h[g + 14], 23, -35309556), N = c(N, _, w, T, h[g + 1], 4, -1530992060), T = c(T, N, _, w, h[g + 4], 11, 1272893353), w = c(w, T, N, _, h[g + 7], 16, -155497632), _ = c(_, w, T, N, h[g + 10], 23, -1094730640), N = c(N, _, w, T, h[g + 13], 4, 681279174), T = c(T, N, _, w, h[g], 11, -358537222), w = c(w, T, N, _, h[g + 3], 16, -722521979), _ = c(_, w, T, N, h[g + 6], 23, 76029189), N = c(N, _, w, T, h[g + 9], 4, -640364487), T = c(T, N, _, w, h[g + 12], 11, -421815835), w = c(w, T, N, _, h[g + 15], 16, 530742520), _ = c(_, w, T, N, h[g + 2], 23, -995338651), N = f(N, _, w, T, h[g], 6, -198630844), T = f(T, N, _, w, h[g + 7], 10, 1126891415), w = f(w, T, N, _, h[g + 14], 15, -1416354905), _ = f(_, w, T, N, h[g + 5], 21, -57434055), N = f(N, _, w, T, h[g + 12], 6, 1700485571), T = f(T, N, _, w, h[g + 3], 10, -1894986606), w = f(w, T, N, _, h[g + 10], 15, -1051523), _ = f(_, w, T, N, h[g + 1], 21, -2054922799), N = f(N, _, w, T, h[g + 8], 6, 1873313359), T = f(T, N, _, w, h[g + 15], 10, -30611744), w = f(w, T, N, _, h[g + 6], 15, -1560198380), _ = f(_, w, T, N, h[g + 13], 21, 1309151649), N = f(N, _, w, T, h[g + 4], 6, -145523070), T = f(T, N, _, w, h[g + 11], 10, -1120210379), w = f(w, T, N, _, h[g + 2], 15, 718787259), _ = f(_, w, T, N, h[g + 9], 21, -343485551), N = n(N, z), _ = n(_, G), w = n(w, V), T = n(T, J);
        return [N, _, w, T];
      }
      function m(h) {
        var S, g = "", z = h.length * 32;
        for (S = 0; S < z; S += 8)
          g += String.fromCharCode(h[S >> 5] >>> S % 32 & 255);
        return g;
      }
      function E(h) {
        var S, g = [];
        for (g[(h.length >> 2) - 1] = void 0, S = 0; S < g.length; S += 1)
          g[S] = 0;
        var z = h.length * 8;
        for (S = 0; S < z; S += 8)
          g[S >> 5] |= (h.charCodeAt(S / 8) & 255) << S % 32;
        return g;
      }
      function O(h) {
        return m(d(E(h), h.length * 8));
      }
      function U(h, S) {
        var g, z = E(h), G = [], V = [], J;
        for (G[15] = V[15] = void 0, z.length > 16 && (z = d(z, h.length * 8)), g = 0; g < 16; g += 1)
          G[g] = z[g] ^ 909522486, V[g] = z[g] ^ 1549556828;
        return J = d(G.concat(E(S)), 512 + S.length * 8), m(d(V.concat(J), 640));
      }
      function B(h) {
        var S = "0123456789abcdef", g = "", z, G;
        for (G = 0; G < h.length; G += 1)
          z = h.charCodeAt(G), g += S.charAt(z >>> 4 & 15) + S.charAt(z & 15);
        return g;
      }
      function H(h) {
        return unescape(encodeURIComponent(h));
      }
      function v(h) {
        return O(H(h));
      }
      function y(h) {
        return B(v(h));
      }
      function k(h, S) {
        return U(H(h), H(S));
      }
      function L(h, S) {
        return B(k(h, S));
      }
      function I(h, S, g) {
        return S ? g ? k(S, h) : L(S, h) : g ? v(h) : y(h);
      }
      e.exports ? e.exports = I : t.md5 = I;
    })(Ui);
  })(Vt)), Vt.exports;
}
var zi = Fi();
const Bi = /* @__PURE__ */ Mi(zi);
function jt(e, t = 80) {
  return "https://www.gravatar.com/avatar/" + Bi(e.trim().toLowerCase()) + "?s=" + t + "&d=mp";
}
/*! @license DOMPurify 3.4.13 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.13/LICENSE */
function Ir(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Hi(e) {
  if (Array.isArray(e)) return e;
}
function ji(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, s, o, l, c = [], f = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(f = (r = o.call(n)).done) && (c.push(r.value), c.length !== t); f = !0) ;
    } catch (m) {
      d = !0, s = m;
    } finally {
      try {
        if (!f && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (d) throw s;
      }
    }
    return c;
  }
}
function qi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $i(e, t) {
  return Hi(e) || ji(e, t) || Wi(e, t) || qi();
}
function Wi(e, t) {
  if (e) {
    if (typeof e == "string") return Ir(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ir(e, t) : void 0;
  }
}
const va = Object.entries, Mr = Object.setPrototypeOf, Gi = Object.isFrozen, Vi = Object.getPrototypeOf, Ji = Object.getOwnPropertyDescriptor;
let oe = Object.freeze, ie = Object.seal, ot = Object.create, Ca = typeof Reflect < "u" && Reflect, Ln = Ca.apply, In = Ca.construct;
oe || (oe = function(t) {
  return t;
});
ie || (ie = function(t) {
  return t;
});
Ln || (Ln = function(t, n) {
  for (var r = arguments.length, s = new Array(r > 2 ? r - 2 : 0), o = 2; o < r; o++)
    s[o - 2] = arguments[o];
  return t.apply(n, s);
});
In || (In = function(t) {
  for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), s = 1; s < n; s++)
    r[s - 1] = arguments[s];
  return new t(...r);
});
const at = ee(Array.prototype.forEach), Xi = ee(Array.prototype.lastIndexOf), Ur = ee(Array.prototype.pop), st = ee(Array.prototype.push), Yi = ee(Array.prototype.splice), Me = Array.isArray, xt = ee(String.prototype.toLowerCase), Tn = ee(String.prototype.toString), Fr = ee(String.prototype.match), Et = ee(String.prototype.replace), zr = ee(String.prototype.indexOf), Ki = ee(String.prototype.trim), Zi = ee(Number.prototype.toString), Qi = ee(Boolean.prototype.toString), Br = typeof BigInt > "u" ? null : ee(BigInt.prototype.toString), Hr = typeof Symbol > "u" ? null : ee(Symbol.prototype.toString), ae = ee(Object.prototype.hasOwnProperty), bt = ee(Object.prototype.toString), re = ee(RegExp.prototype.test), He = el(TypeError);
function ee(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), s = 1; s < n; s++)
      r[s - 1] = arguments[s];
    return Ln(e, t, r);
  };
}
function el(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
      n[r] = arguments[r];
    return In(e, n);
  };
}
function q(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : xt;
  if (Mr && Mr(e, null), !Me(t))
    return e;
  let r = t.length;
  for (; r--; ) {
    let s = t[r];
    if (typeof s == "string") {
      const o = n(s);
      o !== s && (Gi(t) || (t[r] = o), s = o);
    }
    e[s] = !0;
  }
  return e;
}
function tl(e) {
  for (let t = 0; t < e.length; t++)
    ae(e, t) || (e[t] = null);
  return e;
}
function ue(e) {
  const t = ot(null);
  for (const r of va(e)) {
    var n = $i(r, 2);
    const s = n[0], o = n[1];
    ae(e, s) && (Me(o) ? t[s] = tl(o) : o && typeof o == "object" && o.constructor === Object ? t[s] = ue(o) : t[s] = o);
  }
  return t;
}
function nl(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return Zi(e);
    case "boolean":
      return Qi(e);
    case "bigint":
      return Br ? Br(e) : "0";
    case "symbol":
      return Hr ? Hr(e) : "Symbol()";
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
    const r = Ji(e, t);
    if (r) {
      if (r.get)
        return ee(r.get);
      if (typeof r.value == "function")
        return ee(r.value);
    }
    e = Vi(e);
  }
  function n() {
    return null;
  }
  return n;
}
function rl(e) {
  try {
    return re(e, ""), !0;
  } catch {
    return !1;
  }
}
const jr = oe(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), An = oe(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Sn = oe(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), al = oe(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Rn = oe(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), sl = oe(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), qr = oe(["#text"]), $r = oe(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), On = oe(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Wr = oe(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), qt = oe(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), ol = ie(/{{[\w\W]*|^[\w\W]*}}/g), il = ie(/<%[\w\W]*|^[\w\W]*%>/g), ll = ie(/\${[\w\W]*/g), cl = ie(/^data-[\-\w.\u00B7-\uFFFF]+$/), ul = ie(/^aria-[\-\w]+$/), Gr = ie(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), ml = ie(/^(?:\w+script|data):/i), fl = ie(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), dl = ie(/^html$/i), pl = ie(/^[a-z][.\w]*(-[.\w]+)+$/i), Vr = ie(/<[/\w!]/g), Jr = ie(/<[/\w]/g), hl = ie(/<\/no(script|embed|frames)/i), gl = ie(/\/>/i), be = {
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
}, yl = function() {
  return typeof window > "u" ? null : window;
}, El = function(t, n) {
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
}, Xr = function() {
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
function ka() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : yl();
  const t = (A) => ka(A);
  if (t.version = "3.4.13", t.removed = [], !e || !e.document || e.document.nodeType !== be.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const r = n, s = r.currentScript;
  e.DocumentFragment;
  const o = e.HTMLTemplateElement, l = e.Node, c = e.Element, f = e.NodeFilter, d = e.NamedNodeMap;
  d === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const m = e.DOMParser, E = e.trustedTypes, O = c.prototype, U = _e(O, "cloneNode"), B = _e(O, "remove"), H = _e(O, "nextSibling"), v = _e(O, "childNodes"), y = _e(O, "parentNode"), k = _e(O, "shadowRoot"), L = _e(O, "attributes"), I = l && l.prototype ? _e(l.prototype, "nodeType") : null, h = l && l.prototype ? _e(l.prototype, "nodeName") : null, S = l && l.prototype ? _e(l.prototype, "ownerDocument") : null;
  if (typeof o == "function") {
    const A = n.createElement("template");
    A.content && A.content.ownerDocument && (n = A.content.ownerDocument);
  }
  let g, z = "", G, V = !1, J = 0;
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
    return V || (G = El(E, s), V = !0), G;
  }, Ne = n, Ue = Ne.implementation, Rt = Ne.createNodeIterator, Ot = Ne.createDocumentFragment, Te = Ne.getElementsByTagName, te = r.importNode;
  let $ = Xr();
  t.isSupported = typeof va == "function" && typeof y == "function" && Ue && Ue.createHTMLDocument !== void 0;
  const Ce = ol, Fe = il, vt = ll, W = cl, pe = ul, Ye = ml, ut = fl, rn = pl;
  let mt = Gr, j = null;
  const Ke = q({}, [...jr, ...An, ...Sn, ...Rn, ...qr]);
  let X = null;
  const Ee = q({}, [...$r, ...On, ...Wr, ...qt]);
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
  let ft = !0, dt = !0, ke = !1, Yn = !0, De = !1, Pe = !0, ze = !1, an = !1, Ct = null, kt = null, sn = !1, Ze = !1, Dt = !1, Pt = !1, Kn = !0, Zn = !1;
  const Qn = "user-content-";
  let on = !0, Lt = !1, Qe = {}, Ae = null;
  const ln = q({}, [
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
  let er = null;
  const tr = q({}, ["audio", "video", "img", "source", "image", "track"]);
  let cn = null;
  const nr = q({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), It = "http://www.w3.org/1998/Math/MathML", Mt = "http://www.w3.org/2000/svg", Se = "http://www.w3.org/1999/xhtml";
  let et = Se, un = !1, mn = null;
  const Pa = q({}, [It, Mt, Se], Tn), rr = oe(["mi", "mo", "mn", "ms", "mtext"]);
  let fn = q({}, rr);
  const ar = oe(["annotation-xml"]);
  let dn = q({}, ar);
  const La = q({}, ["title", "style", "font", "a", "script"]);
  let pt = null;
  const Ia = ["application/xhtml+xml", "text/html"], Ma = "text/html";
  let K = null, tt = null;
  const Ua = n.createElement("form"), sr = function(i) {
    return i instanceof RegExp || i instanceof Function;
  }, pn = function() {
    let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (tt && tt === i)
      return;
    (!i || typeof i != "object") && (i = {}), i = ue(i), pt = // eslint-disable-next-line unicorn/prefer-includes
    Ia.indexOf(i.PARSER_MEDIA_TYPE) === -1 ? Ma : i.PARSER_MEDIA_TYPE, K = pt === "application/xhtml+xml" ? Tn : xt, j = Ie(i, "ALLOWED_TAGS", Ke, {
      transform: K
    }), X = Ie(i, "ALLOWED_ATTR", Ee, {
      transform: K
    }), mn = Ie(i, "ALLOWED_NAMESPACES", Pa, {
      transform: Tn
    }), cn = Ie(i, "ADD_URI_SAFE_ATTR", nr, {
      transform: K,
      base: nr
    }), er = Ie(i, "ADD_DATA_URI_TAGS", tr, {
      transform: K,
      base: tr
    }), Ae = Ie(i, "FORBID_CONTENTS", ln, {
      transform: K
    }), ne = Ie(i, "FORBID_TAGS", ue({}), {
      transform: K
    }), we = Ie(i, "FORBID_ATTR", ue({}), {
      transform: K
    }), Qe = ae(i, "USE_PROFILES") ? i.USE_PROFILES && typeof i.USE_PROFILES == "object" ? ue(i.USE_PROFILES) : i.USE_PROFILES : !1, ft = i.ALLOW_ARIA_ATTR !== !1, dt = i.ALLOW_DATA_ATTR !== !1, ke = i.ALLOW_UNKNOWN_PROTOCOLS || !1, Yn = i.ALLOW_SELF_CLOSE_IN_ATTR !== !1, De = i.SAFE_FOR_TEMPLATES || !1, Pe = i.SAFE_FOR_XML !== !1, ze = i.WHOLE_DOCUMENT || !1, Ze = i.RETURN_DOM || !1, Dt = i.RETURN_DOM_FRAGMENT || !1, Pt = i.RETURN_TRUSTED_TYPE || !1, sn = i.FORCE_BODY || !1, Kn = i.SANITIZE_DOM !== !1, Zn = i.SANITIZE_NAMED_PROPS || !1, on = i.KEEP_CONTENT !== !1, Lt = i.IN_PLACE || !1, mt = rl(i.ALLOWED_URI_REGEXP) ? i.ALLOWED_URI_REGEXP : Gr, et = typeof i.NAMESPACE == "string" ? i.NAMESPACE : Se, fn = ae(i, "MATHML_TEXT_INTEGRATION_POINTS") && i.MATHML_TEXT_INTEGRATION_POINTS && typeof i.MATHML_TEXT_INTEGRATION_POINTS == "object" ? ue(i.MATHML_TEXT_INTEGRATION_POINTS) : q({}, rr), dn = ae(i, "HTML_INTEGRATION_POINTS") && i.HTML_INTEGRATION_POINTS && typeof i.HTML_INTEGRATION_POINTS == "object" ? ue(i.HTML_INTEGRATION_POINTS) : q({}, ar);
    const p = ae(i, "CUSTOM_ELEMENT_HANDLING") && i.CUSTOM_ELEMENT_HANDLING && typeof i.CUSTOM_ELEMENT_HANDLING == "object" ? ue(i.CUSTOM_ELEMENT_HANDLING) : ot(null);
    if (C = ot(null), ae(p, "tagNameCheck") && sr(p.tagNameCheck) && (C.tagNameCheck = p.tagNameCheck), ae(p, "attributeNameCheck") && sr(p.attributeNameCheck) && (C.attributeNameCheck = p.attributeNameCheck), ae(p, "allowCustomizedBuiltInElements") && typeof p.allowCustomizedBuiltInElements == "boolean" && (C.allowCustomizedBuiltInElements = p.allowCustomizedBuiltInElements), ie(C), De && (dt = !1), Dt && (Ze = !0), Qe && (j = q({}, qr), X = ot(null), Qe.html === !0 && (q(j, jr), q(X, $r)), Qe.svg === !0 && (q(j, An), q(X, On), q(X, qt)), Qe.svgFilters === !0 && (q(j, Sn), q(X, On), q(X, qt)), Qe.mathMl === !0 && (q(j, Rn), q(X, Wr), q(X, qt))), le.tagCheck = null, le.attributeCheck = null, ae(i, "ADD_TAGS") && (typeof i.ADD_TAGS == "function" ? le.tagCheck = i.ADD_TAGS : Me(i.ADD_TAGS) && (j === Ke && (j = ue(j)), q(j, i.ADD_TAGS, K))), ae(i, "ADD_ATTR") && (typeof i.ADD_ATTR == "function" ? le.attributeCheck = i.ADD_ATTR : Me(i.ADD_ATTR) && (X === Ee && (X = ue(X)), q(X, i.ADD_ATTR, K))), ae(i, "ADD_URI_SAFE_ATTR") && Me(i.ADD_URI_SAFE_ATTR) && q(cn, i.ADD_URI_SAFE_ATTR, K), ae(i, "FORBID_CONTENTS") && Me(i.FORBID_CONTENTS) && (Ae === ln && (Ae = ue(Ae)), q(Ae, i.FORBID_CONTENTS, K)), ae(i, "ADD_FORBID_CONTENTS") && Me(i.ADD_FORBID_CONTENTS) && (Ae === ln && (Ae = ue(Ae)), q(Ae, i.ADD_FORBID_CONTENTS, K)), on && (j["#text"] = !0), ze && q(j, ["html", "head", "body"]), j.table && (q(j, ["tbody"]), delete ne.tbody), i.TRUSTED_TYPES_POLICY) {
      if (typeof i.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw He('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof i.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw He('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const x = g;
      g = i.TRUSTED_TYPES_POLICY;
      try {
        z = _("");
      } catch (D) {
        throw g = x, D;
      }
    } else i.TRUSTED_TYPES_POLICY === null ? (g = void 0, z = "") : (g === void 0 && (g = T()), g && typeof z == "string" && (z = _("")));
    oe && oe(i), tt = i;
  }, or = q({}, [...An, ...Sn, ...al]), ir = q({}, [...Rn, ...sl]), Fa = function(i, p, x) {
    return p.namespaceURI === Se ? i === "svg" : p.namespaceURI === It ? i === "svg" && (x === "annotation-xml" || fn[x]) : !!or[i];
  }, za = function(i, p, x) {
    return p.namespaceURI === Se ? i === "math" : p.namespaceURI === Mt ? i === "math" && dn[x] : !!ir[i];
  }, Ba = function(i, p, x) {
    return p.namespaceURI === Mt && !dn[x] || p.namespaceURI === It && !fn[x] ? !1 : !ir[i] && (La[i] || !or[i]);
  }, Ha = function(i) {
    let p = y(i);
    (!p || !p.tagName) && (p = {
      namespaceURI: et,
      tagName: "template"
    });
    const x = xt(i.tagName), D = xt(p.tagName);
    return mn[i.namespaceURI] ? i.namespaceURI === Mt ? Fa(x, p, D) : i.namespaceURI === It ? za(x, p, D) : i.namespaceURI === Se ? Ba(x, p, D) : !!(pt === "application/xhtml+xml" && mn[i.namespaceURI]) : !1;
  }, Le = function(i) {
    st(t.removed, {
      element: i
    });
    try {
      y(i).removeChild(i);
    } catch {
      if (B(i), !y(i))
        throw He("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, Ut = function(i) {
    ht(i);
    const p = v(i);
    if (p) {
      const D = [];
      at(p, (P) => {
        st(D, P);
      }), at(D, (P) => {
        try {
          B(P);
        } catch {
        }
      });
    }
    const x = L(i);
    if (x)
      for (let D = x.length - 1; D >= 0; --D) {
        const P = x[D], F = P && P.name;
        if (typeof F == "string")
          try {
            i.removeAttribute(F);
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
  }, ja = function(i) {
    const p = L(i);
    if (p)
      for (let x = p.length - 1; x >= 0; --x) {
        const D = p[x], P = D && D.name;
        if (!(typeof P != "string" || X[K(P)]))
          try {
            i.removeAttribute(P);
          } catch {
          }
      }
  }, ht = function(i) {
    const p = [i];
    for (; p.length > 0; ) {
      const x = p.pop();
      (I ? I(x) : x.nodeType) === be.element && ja(x);
      const P = v(x);
      if (P)
        for (let F = P.length - 1; F >= 0; --F)
          p.push(P[F]);
    }
  }, qa = function(i) {
    if (!Pe)
      return;
    const p = [i];
    for (; p.length > 0; ) {
      const x = p.pop(), D = I ? I(x) : x.nodeType;
      if (D === be.processingInstruction || D === be.comment && re(Jr, x.data)) {
        try {
          B(x);
        } catch {
        }
        continue;
      }
      if (D === be.element) {
        const F = x, Y = K(h ? h(x) : x.nodeName);
        try {
          F.hasAttribute && F.hasAttribute("patchsrc") && F.removeAttribute("patchsrc"), F.hasAttribute && F.hasAttribute("for") && Y !== "label" && Y !== "output" && F.removeAttribute("for");
        } catch {
        }
      }
      const P = v(x);
      if (P)
        for (let F = P.length - 1; F >= 0; --F)
          p.push(P[F]);
    }
  }, lr = function(i) {
    let p = null, x = null;
    if (sn)
      i = "<remove></remove>" + i;
    else {
      const F = Fr(i, /^[\r\n\t ]+/);
      x = F && F[0];
    }
    pt === "application/xhtml+xml" && et === Se && (i = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + i + "</body></html>");
    const D = g ? _(i) : i;
    if (et === Se)
      try {
        p = new m().parseFromString(D, pt);
      } catch {
      }
    if (!p || !p.documentElement) {
      p = Ue.createDocument(et, "template", null);
      try {
        p.documentElement.innerHTML = un ? z : D;
      } catch {
      }
    }
    const P = p.body || p.documentElement;
    return i && x && P.insertBefore(n.createTextNode(x), P.childNodes[0] || null), et === Se ? Te.call(p, ze ? "html" : "body")[0] : ze ? p.documentElement : P;
  }, cr = function(i) {
    const p = S ? S(i) : i.ownerDocument;
    return Rt.call(
      p || i,
      i,
      // eslint-disable-next-line no-bitwise
      f.SHOW_ELEMENT | f.SHOW_COMMENT | f.SHOW_TEXT | f.SHOW_PROCESSING_INSTRUCTION | f.SHOW_CDATA_SECTION,
      null
    );
  }, Ft = function(i) {
    return i = Et(i, Ce, " "), i = Et(i, Fe, " "), i = Et(i, vt, " "), i;
  }, hn = function(i) {
    var p;
    i.normalize();
    const x = S ? S(i) : i.ownerDocument, D = Rt.call(
      x || i,
      i,
      // eslint-disable-next-line no-bitwise
      f.SHOW_TEXT | f.SHOW_COMMENT | f.SHOW_CDATA_SECTION | f.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let P = D.nextNode();
    for (; P; )
      P.data = Ft(P.data), P = D.nextNode();
    const F = (p = i.querySelectorAll) === null || p === void 0 ? void 0 : p.call(i, "template");
    F && at(F, (Y) => {
      nt(Y.content) && hn(Y.content);
    });
  }, zt = function(i) {
    const p = h ? h(i) : null;
    return typeof p != "string" || K(p) !== "form" ? !1 : typeof i.nodeName != "string" || typeof i.textContent != "string" || typeof i.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    i.attributes !== L(i) || typeof i.removeAttribute != "function" || typeof i.setAttribute != "function" || typeof i.namespaceURI != "string" || typeof i.insertBefore != "function" || typeof i.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    i.nodeType !== I(i) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
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
    if (!I || typeof i != "object" || i === null)
      return !1;
    try {
      return I(i) === be.documentFragment;
    } catch {
      return !1;
    }
  }, gt = function(i) {
    if (!I || typeof i != "object" || i === null)
      return !1;
    try {
      return typeof I(i) == "number";
    } catch {
      return !1;
    }
  };
  function Re(A, i, p) {
    A.length !== 0 && at(A, (x) => {
      x.call(t, i, p, tt);
    });
  }
  const $a = function(i, p) {
    return !!(Pe && i.hasChildNodes() && !gt(i.firstElementChild) && re(Vr, i.textContent) && re(Vr, i.innerHTML) || Pe && i.namespaceURI === Se && p === "style" && gt(i.firstElementChild) || i.nodeType === be.processingInstruction || Pe && i.nodeType === be.comment && re(Jr, i.data));
  }, Wa = function(i, p, x) {
    if (!ne[p] && dr(p) && (C.tagNameCheck instanceof RegExp && re(C.tagNameCheck, p) || C.tagNameCheck instanceof Function && C.tagNameCheck(p)))
      return !1;
    if (on && !Ae[p]) {
      const D = y(i), P = v(i);
      if (P && D) {
        const F = P.length;
        for (let Y = F - 1; Y >= 0; --Y) {
          const Z = i === x ? U(P[Y], !0) : P[Y];
          D.insertBefore(Z, H(i));
        }
      }
    }
    return Le(i), !0;
  }, ur = function(i, p, x, D) {
    return i.length === 0 ? p : p === x || p === D ? ue(p) : p;
  }, mr = function(i, p) {
    if (Re($.beforeSanitizeElements, i, null), i !== p && y(i) === null)
      return Lt && ht(i), !0;
    if (zt(i))
      return Le(i), !0;
    const x = K(h ? h(i) : i.nodeName);
    if (j = ur($.uponSanitizeElement, j, Ke, Ct), Re($.uponSanitizeElement, i, {
      tagName: x,
      allowedTags: j
    }), i !== p && y(i) === null)
      return Lt && ht(i), !0;
    if ($a(i, x))
      return Le(i), !0;
    if (ne[x] || !(le.tagCheck instanceof Function && le.tagCheck(x)) && !j[x]) {
      const P = Wa(i, x, p);
      return P === !1 && Re($.afterSanitizeElements, i, null), P;
    }
    if ((I ? I(i) : i.nodeType) === be.element && !Ha(i) || (x === "noscript" || x === "noembed" || x === "noframes") && re(hl, i.innerHTML))
      return Le(i), !0;
    if (De && i.nodeType === be.text) {
      const P = Ft(i.textContent);
      i.textContent !== P && (st(t.removed, {
        element: i.cloneNode()
      }), i.textContent = P);
    }
    return Re($.afterSanitizeElements, i, null), !1;
  }, fr = function(i, p, x) {
    if (we[p] || Pe && p === "patchsrc" || Pe && p === "for" && i !== "label" && i !== "output" || Kn && (p === "id" || p === "name") && (x in n || x in Ua))
      return !1;
    const D = X[p] || le.attributeCheck instanceof Function && le.attributeCheck(p, i);
    if (!(dt && re(W, p))) {
      if (!(ft && re(pe, p))) {
        if (D) {
          if (!cn[p]) {
            if (!re(mt, Et(x, ut, ""))) {
              if (!((p === "src" || p === "xlink:href" || p === "href") && i !== "script" && zr(x, "data:") === 0 && er[i])) {
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
          !(dr(i) && (C.tagNameCheck instanceof RegExp && re(C.tagNameCheck, i) || C.tagNameCheck instanceof Function && C.tagNameCheck(i)) && (C.attributeNameCheck instanceof RegExp && re(C.attributeNameCheck, p) || C.attributeNameCheck instanceof Function && C.attributeNameCheck(p, i)) || // Alternative, second condition checks if it's an `is`-attribute, AND
          // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
          p === "is" && C.allowCustomizedBuiltInElements && (C.tagNameCheck instanceof RegExp && re(C.tagNameCheck, x) || C.tagNameCheck instanceof Function && C.tagNameCheck(x)))
        ) return !1;
      }
    }
    return !0;
  }, Ga = q({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), dr = function(i) {
    return !Ga[xt(i)] && re(rn, i);
  }, Va = function(i, p, x, D) {
    if (g && typeof E == "object" && typeof E.getAttributeType == "function" && !x)
      switch (E.getAttributeType(i, p)) {
        case "TrustedHTML":
          return _(D);
        case "TrustedScriptURL":
          return w(D);
      }
    return D;
  }, Ja = function(i, p, x, D) {
    try {
      x ? i.setAttributeNS(x, p, D) : i.setAttribute(p, D), zt(i) ? Le(i) : Ur(t.removed);
    } catch {
      Be(p, i);
    }
  }, pr = function(i) {
    Re($.beforeSanitizeAttributes, i, null);
    const p = i.attributes;
    if (!p || zt(i))
      return;
    X = ur($.uponSanitizeAttribute, X, Ee, kt);
    const x = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: X,
      forceKeepAttr: void 0
    };
    let D = p.length;
    const P = K(i.nodeName);
    for (; D--; ) {
      const F = p[D], Y = F.name, Z = F.namespaceURI, he = F.value, ge = K(Y), yn = he;
      let fe = Y === "value" ? yn : Ki(yn);
      if (x.attrName = ge, x.attrValue = fe, x.keepAttr = !0, x.forceKeepAttr = void 0, Re($.uponSanitizeAttribute, i, x), fe = x.attrValue, Zn && (ge === "id" || ge === "name") && zr(fe, Qn) !== 0 && (Be(Y, i), fe = Qn + fe), Pe && re(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, fe)) {
        Be(Y, i);
        continue;
      }
      if (ge === "attributename" && Fr(fe, "href")) {
        Be(Y, i);
        continue;
      }
      if (!x.forceKeepAttr) {
        if (!x.keepAttr) {
          Be(Y, i);
          continue;
        }
        if (!Yn && re(gl, fe)) {
          Be(Y, i);
          continue;
        }
        if (De && (fe = Ft(fe)), !fr(P, ge, fe)) {
          Be(Y, i);
          continue;
        }
        fe = Va(P, ge, Z, fe), fe !== yn && Ja(i, Y, Z, fe);
      }
    }
    Re($.afterSanitizeAttributes, i, null);
  }, Bt = function(i) {
    let p = null;
    const x = cr(i);
    for (Re($.beforeSanitizeShadowDOM, i, null); p = x.nextNode(); )
      if (Re($.uponSanitizeShadowNode, p, null), mr(p, i), pr(p), nt(p.content) && Bt(p.content), (I ? I(p) : p.nodeType) === be.element) {
        const P = k(p);
        nt(P) && (gn(P), Bt(P));
      }
    Re($.afterSanitizeShadowDOM, i, null);
  }, gn = function(i) {
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
      const D = x.node, F = (I ? I(D) : D.nodeType) === be.element, Y = v(D);
      if (Y)
        for (let Z = Y.length - 1; Z >= 0; --Z)
          p.push({
            node: Y[Z],
            shadow: null
          });
      if (F) {
        const Z = h ? h(D) : null;
        if (typeof Z == "string" && K(Z) === "template") {
          const he = D.content;
          nt(he) && p.push({
            node: he,
            shadow: null
          });
        }
      }
      if (F) {
        const Z = k(D);
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
    let i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, p = null, x = null, D = null, P = null;
    if (un = !A, un && (A = "<!-->"), typeof A != "string" && !gt(A) && (A = nl(A), typeof A != "string"))
      throw He("dirty is not a string, aborting");
    if (!t.isSupported)
      return A;
    an ? (j = Ct, X = kt) : pn(i), ($.uponSanitizeElement.length > 0 || $.uponSanitizeAttribute.length > 0) && (j = ue(j)), $.uponSanitizeAttribute.length > 0 && (X = ue(X)), t.removed = [];
    const F = Lt && typeof A != "string" && gt(A);
    if (F) {
      qa(A);
      const he = h ? h(A) : A.nodeName;
      if (typeof he == "string") {
        const ge = K(he);
        if (!j[ge] || ne[ge])
          throw Ut(A), He("root node is forbidden and cannot be sanitized in-place");
      }
      if (zt(A))
        throw Ut(A), He("root node is clobbered and cannot be sanitized in-place");
      try {
        gn(A);
      } catch (ge) {
        throw Ut(A), ge;
      }
    } else if (gt(A))
      p = lr("<!---->"), x = p.ownerDocument.importNode(A, !0), x.nodeType === be.element && x.nodeName === "BODY" || x.nodeName === "HTML" ? p = x : p.appendChild(x), gn(x);
    else {
      if (!Ze && !De && !ze && // eslint-disable-next-line unicorn/prefer-includes
      A.indexOf("<") === -1)
        return g && Pt ? _(A) : A;
      if (p = lr(A), !p)
        return Ze ? null : Pt ? z : "";
    }
    p && sn && Le(p.firstChild);
    const Y = F ? A : p;
    try {
      const he = cr(Y);
      for (; D = he.nextNode(); )
        mr(D, Y), pr(D), nt(D.content) && Bt(D.content);
    } catch (he) {
      throw F && (Ut(A), at(t.removed, (ge) => {
        ge.element && ht(ge.element);
      })), he;
    }
    if (F)
      return at(t.removed, (he) => {
        he.element && ht(he.element);
      }), De && hn(A), A;
    if (Ze) {
      if (De && hn(p), Dt)
        for (P = Ot.call(p.ownerDocument); p.firstChild; )
          P.appendChild(p.firstChild);
      else
        P = p;
      return (X.shadowroot || X.shadowrootmode) && (P = te.call(r, P, !0)), P;
    }
    let Z = ze ? p.outerHTML : p.innerHTML;
    return ze && j["!doctype"] && p.ownerDocument && p.ownerDocument.doctype && p.ownerDocument.doctype.name && re(dl, p.ownerDocument.doctype.name) && (Z = "<!DOCTYPE " + p.ownerDocument.doctype.name + `>
` + Z), De && (Z = Ft(Z)), g && Pt ? _(Z) : Z;
  }, t.setConfig = function() {
    let A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    pn(A), an = !0, Ct = j, kt = X;
  }, t.clearConfig = function() {
    tt = null, an = !1, Ct = null, kt = null, g = G, z = "";
  }, t.isValidAttribute = function(A, i, p) {
    tt || pn({});
    const x = K(A), D = K(i);
    return fr(x, D, p);
  }, t.addHook = function(A, i) {
    typeof i == "function" && ae($, A) && st($[A], i);
  }, t.removeHook = function(A, i) {
    if (ae($, A)) {
      if (i !== void 0) {
        const p = Xi($[A], i);
        return p === -1 ? void 0 : Yi($[A], p, 1)[0];
      }
      return Ur($[A]);
    }
  }, t.removeHooks = function(A) {
    ae($, A) && ($[A] = []);
  }, t.removeAllHooks = function() {
    $ = Xr();
  }, t;
}
var Da = ka();
function bl(e) {
  var B, H, v;
  const { settings: t, post: n, comments: r, submitted: s, commentForm: o, submitComment: l, setCommentForm: c, slug: f } = e, d = (B = n.categories) == null ? void 0 : B[0], m = n.author, E = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 bg-white", O = r.map((y) => a.createElement(
    "div",
    { key: y.id, className: "mb-5 p-5 rounded-2xl border border-gray-100" },
    a.createElement(
      "div",
      { className: "flex items-center gap-2.5 mb-2" },
      a.createElement("img", { src: jt(y.email || ""), alt: "", className: "w-8 h-8 rounded-full" }),
      a.createElement(
        "div",
        null,
        a.createElement("p", { className: "font-medium text-sm text-gray-900" }, y.author),
        a.createElement("p", { className: "text-xs text-gray-400" }, new Date(y.createdAt).toLocaleDateString())
      )
    ),
    a.createElement("p", { className: "text-sm text-gray-700 leading-relaxed" }, y.content),
    (y.children || []).map((k) => a.createElement(
      "div",
      { key: k.id, className: "ml-8 mt-3 pl-4 border-l-2 border-gray-100" },
      a.createElement(
        "div",
        { className: "flex items-center gap-2 mb-1" },
        a.createElement("img", { src: jt(k.email || ""), alt: "", className: "w-6 h-6 rounded-full" }),
        a.createElement("span", { className: "font-medium text-sm text-gray-800" }, k.author)
      ),
      a.createElement("p", { className: "text-sm text-gray-600" }, k.content)
    ))
  )), U = a.createElement(
    "form",
    { onSubmit: l, className: "space-y-3 mt-6 p-6 rounded-2xl bg-gray-50" },
    a.createElement("h4", { className: "text-sm font-semibold text-gray-900" }, b("leave a comment", t)),
    a.createElement("input", { type: "text", name: "website_url", style: { position: "absolute", left: "-9999px" }, tabIndex: -1, autoComplete: "off" }),
    a.createElement(
      "div",
      { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
      a.createElement("input", { value: o.author, onChange: (y) => c({ ...o, author: y.target.value }), placeholder: b("name", t), className: E }),
      a.createElement("input", { value: o.email, onChange: (y) => c({ ...o, email: y.target.value }), placeholder: b("email", t), type: "email", className: E })
    ),
    a.createElement("textarea", { value: o.content, onChange: (y) => c({ ...o, content: y.target.value }), placeholder: b("your comment", t) + "...", className: E, rows: 3, required: !0 }),
    a.createElement("button", { type: "submit", className: "w-full py-2.5 rounded-xl text-white text-sm font-medium transition-colors", style: { background: "var(--primary-color, #2563eb)" } }, b("submit comment", t))
  );
  return a.createElement(
    "article",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(Oa, { items: [{ label: b("blog", t), to: "/" }, { label: n.title || b("post", t) }] }),
    // Header: category chip + title + meta
    a.createElement(
      "header",
      { className: "mb-8" },
      d && a.createElement(M, {
        to: "/category/" + d.slug,
        className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4",
        style: { background: "color-mix(in srgb, var(--primary-color, #2563eb) 10%, transparent)", color: "var(--primary-color, #2563eb)" }
      }, a.createElement(Kt, { size: 11 }), d.name),
      a.createElement(
        "h1",
        { className: "text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-4" },
        n.format && n.format !== "standard" ? a.createElement("span", { className: "block text-xs font-normal text-gray-400 mb-1 uppercase tracking-wider" }, n.format) : null,
        n.title
      ),
      a.createElement(
        "div",
        { className: "flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 border-y border-gray-100 py-3" },
        a.createElement(
          "span",
          { className: "flex items-center gap-1.5" },
          a.createElement("img", { src: jt((m == null ? void 0 : m.email) || ""), alt: "", className: "w-6 h-6 rounded-full" }),
          a.createElement(M, { to: "/author/" + ((m == null ? void 0 : m.username) || ""), className: "font-medium text-gray-700 hover:text-primary-600" }, m == null ? void 0 : m.username)
        ),
        a.createElement("span", { className: "flex items-center gap-1.5" }, a.createElement(Je, { size: 14 }), Xe(n.publishedAt || n.createdAt)),
        a.createElement("span", { className: "flex items-center gap-1.5" }, a.createElement(es, { size: 14 }), nn(n.content || "")),
        n.commentCount > 0 && a.createElement("span", { className: "flex items-center gap-1.5" }, a.createElement(Zt, { size: 14 }), n.commentCount)
      )
    ),
    // Featured image
    n.featured && a.createElement(
      "div",
      { className: "mb-10" },
      a.createElement("img", {
        src: _t(n.featured, t),
        alt: n.title,
        className: "w-full max-h-96 object-cover rounded-2xl shadow-lg",
        loading: "lazy",
        srcSet: n.srcset ? Object.entries(n.srcset).map(([y, k]) => _t(k, t) + " " + y + "w").join(", ") : void 0
      })
    ),
    // Content
    ((H = n.meta) == null ? void 0 : H._visual_css) && a.createElement("style", { dangerouslySetInnerHTML: { __html: n.meta._visual_css } }),
    a.createElement("div", { className: "prose prose-gray prose-lg max-w-none mb-12", dangerouslySetInnerHTML: { __html: wi(Ii(Da.sanitize(n.content)), t) } }),
    // Tags
    ((v = n.tags) == null ? void 0 : v.length) > 0 && a.createElement(
      "div",
      { className: "flex flex-wrap items-center gap-2 mb-10" },
      a.createElement(as, { size: 15, className: "text-gray-400" }),
      n.tags.map((y) => a.createElement(M, { key: y.tagId, to: "/tag/" + y.slug, className: "px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" }, y.name))
    ),
    // Share + back row
    a.createElement(
      "div",
      { className: "flex items-center justify-between py-6 border-t border-gray-100 mb-10" },
      a.createElement(M, { to: "/", className: "text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1" }, a.createElement(Qr, { size: 15 }), b("all posts", t)),
      a.createElement(Li, { title: n.title, url: "/post/" + n.slug, siteUrl: t.site_url })
    ),
    // Author box
    m && a.createElement(
      "div",
      { className: "flex items-start gap-4 p-6 rounded-2xl bg-gray-50 mb-10" },
      a.createElement("img", { src: jt((m == null ? void 0 : m.email) || ""), alt: "", className: "w-14 h-14 rounded-full flex-shrink-0" }),
      a.createElement(
        "div",
        null,
        a.createElement("p", { className: "text-xs text-gray-400 mb-0.5" }, b("written by", t)),
        a.createElement(M, { to: "/author/" + m.username, className: "font-semibold text-gray-900 hover:text-primary-600" }, m.username),
        m.bio && a.createElement("p", { className: "text-sm text-gray-600 mt-1.5 leading-relaxed" }, m.bio)
      )
    ),
    // Related posts
    a.createElement(
      "section",
      { className: "mb-12" },
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, b("related posts", t)),
      f && a.createElement(Pi, { postId: n == null ? void 0 : n.id, slug: f })
    ),
    // Comments
    a.createElement(
      "section",
      { className: "border-t border-gray-100 pt-8" },
      a.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-5" }, b("comments", t) + (r.length ? " (" + r.length + ")" : "")),
      r.length === 0 && !s && a.createElement(
        "div",
        { className: "text-center py-6 rounded-2xl bg-gray-50 mb-6" },
        a.createElement("p", { className: "text-sm text-gray-400" }, b("no comments yet", t) + ". " + b("be the first to share your thoughts", t) + "!")
      ),
      O,
      s && a.createElement("p", { className: "text-sm text-green-600 mb-4" }, b("comment submitted and pending review", t)),
      U
    )
  );
}
function xl(e) {
  var r;
  const { settings: t, page: n } = e;
  return n ? a.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-4 py-8" },
    a.createElement(Oa, { items: [{ label: b("home", t), to: "/" }, { label: n.title }] }),
    a.createElement("h1", { className: "text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight my-8" }, n.title),
    ((r = n.meta) == null ? void 0 : r._visual_css) && a.createElement("style", { dangerouslySetInnerHTML: { __html: n.meta._visual_css } }),
    a.createElement("div", { className: "prose prose-gray prose-lg max-w-none", dangerouslySetInnerHTML: { __html: Da.sanitize(n.content || "") } }),
    n.parent && a.createElement(
      M,
      { to: "/page/" + n.parent.slug, className: "inline-flex items-center gap-1 mt-10 text-sm text-gray-500 hover:text-primary-600" },
      a.createElement(Qr, { size: 15 }),
      n.parent.title
    )
  ) : null;
}
const ql = { name: "default", Header: bi, Footer: xi, HomeLayout: Ni, CategoryLayout: Ai, TagLayout: Ri, ArchiveLayout: vi, SearchLayout: ki, AuthorLayout: Di, PostLayout: bl, PageLayout: xl };
export {
  ql as default
};
