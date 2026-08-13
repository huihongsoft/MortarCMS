import s, { useState as Q, useEffect as we, forwardRef as Br, createElement as Tn, useRef as vn } from "react";
import { Link as D, useNavigate as Go } from "react-router-dom";
function Hr(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: Jo } = Object.prototype, { getPrototypeOf: st } = Object, { iterator: xt, toStringTag: jr } = Symbol, Wt = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), Et = (e, t) => {
  let n = e;
  const r = [];
  for (; n != null && n !== Object.prototype; ) {
    if (r.indexOf(n) !== -1)
      return !1;
    if (r.push(n), Wt(n, t))
      return !0;
    n = st(n);
  }
  return !1;
}, Xo = (e, t) => e != null && Et(e, t) ? e[t] : void 0, Cn = /* @__PURE__ */ ((e) => (t) => {
  const n = Jo.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), ge = (e) => (e = e.toLowerCase(), (t) => Cn(t) === e), Gt = (e) => (t) => typeof t === e, { isArray: We } = Array, $e = Gt("undefined");
function at(e) {
  return e !== null && !$e(e) && e.constructor !== null && !$e(e.constructor) && me(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const qr = ge("ArrayBuffer");
function Yo(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && qr(e.buffer), t;
}
const Ko = Gt("string"), me = Gt("function"), Wr = Gt("number"), it = (e) => e !== null && typeof e == "object", Zo = (e) => e === !0 || e === !1, Ht = (e) => {
  if (!it(e))
    return !1;
  const t = st(e);
  return (t === null || t === Object.prototype || st(t) === null) && // Treat any genuine (non-Object.prototype-polluted) Symbol.toStringTag or
  // Symbol.iterator as evidence the value is a tagged/iterable type rather
  // than a plain object, while ignoring keys injected onto Object.prototype.
  !Et(e, jr) && !Et(e, xt);
}, Qo = (e) => {
  if (!it(e) || at(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, es = ge("Date"), ts = ge("File"), ns = (e) => !!(e && typeof e.uri < "u"), rs = (e) => e && typeof e.getParts < "u", os = ge("Blob"), ss = ge("FileList"), as = ge("Set"), is = (e) => it(e) && me(e.pipe);
function ls() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const ar = ls(), ir = typeof ar.FormData < "u" ? ar.FormData : void 0, cs = (e) => {
  if (!e) return !1;
  if (ir && e instanceof ir) return !0;
  const t = st(e);
  if (!t || t === Object.prototype || !me(e.append)) return !1;
  const n = Cn(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && me(e.toString) && e.toString() === "[object FormData]";
}, us = ge("URLSearchParams"), [ms, fs, ds, ps] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(ge), hs = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function wt(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, o;
  if (typeof e != "object" && (e = [e]), We(e))
    for (r = 0, o = e.length; r < o; r++)
      t.call(null, e[r], r, e);
  else {
    if (at(e))
      return;
    const a = n ? Object.getOwnPropertyNames(e) : Object.keys(e), l = a.length;
    let c;
    for (r = 0; r < l; r++)
      c = a[r], t.call(null, e[c], c, e);
  }
}
function $r(e, t) {
  if (at(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, o;
  for (; r-- > 0; )
    if (o = n[r], t === o.toLowerCase())
      return o;
  return null;
}
const je = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Vr = (e) => !$e(e) && e !== je;
function Nn(...e) {
  const { caseless: t, skipUndefined: n } = Vr(this) && this || {}, r = {}, o = (a, l) => {
    if (l === "__proto__" || l === "constructor" || l === "prototype")
      return;
    const c = t && typeof l == "string" && $r(r, l) || l, m = Wt(r, c) ? r[c] : void 0;
    Ht(m) && Ht(a) ? r[c] = Nn(m, a) : Ht(a) ? r[c] = Nn({}, a) : We(a) ? r[c] = a.slice() : (!n || !$e(a)) && (r[c] = a);
  };
  for (let a = 0, l = e.length; a < l; a++) {
    const c = e[a];
    if (!c || at(c) || (wt(c, o), typeof c != "object" || We(c)))
      continue;
    const m = Object.getOwnPropertySymbols(c);
    for (let h = 0; h < m.length; h++) {
      const d = m[h];
      Rs.call(c, d) && o(c[d], d);
    }
  }
  return r;
}
const gs = (e, t, n, { allOwnKeys: r } = {}) => (wt(
  t,
  (o, a) => {
    n && me(o) ? Object.defineProperty(e, a, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: Hr(o, n),
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : Object.defineProperty(e, a, {
      __proto__: null,
      value: o,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  },
  { allOwnKeys: r }
), e), ys = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), bs = (e, t, n, r) => {
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
}, Es = (e, t, n, r) => {
  let o, a, l;
  const c = {};
  if (t = t || {}, e == null) return t;
  do {
    for (o = Object.getOwnPropertyNames(e), a = o.length; a-- > 0; )
      l = o[a], (!r || r(l, e, t)) && !c[l] && (t[l] = e[l], c[l] = !0);
    e = n !== !1 && st(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, xs = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, ws = (e) => {
  if (!e) return null;
  if (We(e)) return e;
  let t = e.length;
  if (!Wr(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, _s = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && st(Uint8Array)), Ts = (e, t) => {
  const r = (e && e[xt]).call(e);
  let o;
  for (; (o = r.next()) && !o.done; ) {
    const a = o.value;
    t.call(e, a[0], a[1]);
  }
}, Ns = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, Ss = ge("HTMLFormElement"), As = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(n, r, o) {
  return r.toUpperCase() + o;
}), { propertyIsEnumerable: Rs } = Object.prototype, Os = ge("RegExp"), Gr = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  wt(n, (o, a) => {
    let l;
    (l = t(o, a, e)) !== !1 && (r[a] = l || o);
  }), Object.defineProperties(e, r);
}, ks = (e) => {
  Gr(e, (t, n) => {
    if (me(e) && ["arguments", "caller", "callee"].includes(n))
      return !1;
    const r = e[n];
    if (me(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, vs = (e, t) => {
  const n = {}, r = (o) => {
    o.forEach((a) => {
      n[a] = !0;
    });
  };
  return We(e) ? r(e) : r(String(e).split(t)), n;
}, Cs = () => {
}, Ls = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Ds(e) {
  return !!(e && me(e.append) && e[jr] === "FormData" && e[xt]);
}
const Ps = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (r) => {
    if (it(r)) {
      if (t.has(r))
        return;
      if (at(r))
        return r;
      if (!("toJSON" in r)) {
        t.add(r);
        let o;
        if (as(r)) {
          o = [];
          for (const a of r) {
            const l = n(a);
            !$e(l) && o.push(l);
          }
        } else
          o = We(r) ? [] : {}, wt(r, (a, l) => {
            const c = n(a);
            !$e(c) && (o[l] = c);
          });
        return t.delete(r), o;
      }
    }
    return r;
  };
  return n(e);
}, Is = ge("AsyncFunction"), Ms = (e) => e && (it(e) || me(e)) && me(e.then) && me(e.catch), Jr = ((e, t) => e ? setImmediate : t ? ((n, r) => (je.addEventListener(
  "message",
  ({ source: o, data: a }) => {
    o === je && a === n && r.length && r.shift()();
  },
  !1
), (o) => {
  r.push(o), je.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", me(je.postMessage)), Us = typeof queueMicrotask < "u" ? queueMicrotask.bind(je) : typeof process < "u" && process.nextTick || Jr, Xr = (e) => e != null && me(e[xt]), Fs = (e) => e != null && Et(e, xt) && Xr(e), u = {
  isArray: We,
  isArrayBuffer: qr,
  isBuffer: at,
  isFormData: cs,
  isArrayBufferView: Yo,
  isString: Ko,
  isNumber: Wr,
  isBoolean: Zo,
  isObject: it,
  isPlainObject: Ht,
  isEmptyObject: Qo,
  isReadableStream: ms,
  isRequest: fs,
  isResponse: ds,
  isHeaders: ps,
  isUndefined: $e,
  isDate: es,
  isFile: ts,
  isReactNativeBlob: ns,
  isReactNative: rs,
  isBlob: os,
  isRegExp: Os,
  isFunction: me,
  isStream: is,
  isURLSearchParams: us,
  isTypedArray: _s,
  isFileList: ss,
  forEach: wt,
  merge: Nn,
  extend: gs,
  trim: hs,
  stripBOM: ys,
  inherits: bs,
  toFlatObject: Es,
  kindOf: Cn,
  kindOfTest: ge,
  endsWith: xs,
  toArray: ws,
  forEachEntry: Ts,
  matchAll: Ns,
  isHTMLForm: Ss,
  hasOwnProperty: Wt,
  hasOwnProp: Wt,
  // an alias to avoid ESLint no-prototype-builtins detection
  hasOwnInPrototypeChain: Et,
  getSafeProp: Xo,
  reduceDescriptors: Gr,
  freezeMethods: ks,
  toObjectSet: vs,
  toCamelCase: As,
  noop: Cs,
  toFiniteNumber: Ls,
  findKey: $r,
  global: je,
  isContextDefined: Vr,
  isSpecCompliantForm: Ds,
  toJSONObject: Ps,
  isAsyncFn: Is,
  isThenable: Ms,
  setImmediate: Jr,
  asap: Us,
  isIterable: Xr,
  isSafeIterable: Fs
}, zs = u.toObjectSet([
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
]), Bs = (e) => {
  const t = {};
  let n, r, o;
  return e && e.split(`
`).forEach(function(l) {
    o = l.indexOf(":"), n = l.substring(0, o).trim().toLowerCase(), r = l.substring(o + 1).trim();
    const c = u.hasOwnProp(t, n);
    !n || c && u.hasOwnProp(zs, n) || (n === "set-cookie" ? c ? t[n].push(r) : t[n] = [r] : t[n] = c ? t[n] + ", " + r : r);
  }), t;
};
function Hs(e) {
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
const js = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), qs = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Ln(e, t) {
  return u.isArray(e) ? e.map((n) => Ln(n, t)) : Hs(String(e).replace(t, ""));
}
const Ws = (e) => Ln(e, js), $s = (e) => Ln(e, qs);
function Yr(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return u.forEach(e.toJSON(), (n, r) => {
    t[r] = $s(n);
  }), t;
}
const lr = Symbol("internals");
function ht(e) {
  return e && String(e).trim().toLowerCase();
}
function jt(e) {
  return e === !1 || e == null ? e : u.isArray(e) ? e.map(jt) : Ws(String(e));
}
function Vs(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const Gs = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function fn(e) {
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
function Js(e) {
  const t = e.length - 1;
  if (t < 1 || e.charCodeAt(0) !== 34 || e.charCodeAt(t) !== 34)
    return e;
  let n = "";
  for (let r = 1; r < t; r++) {
    const o = e.charCodeAt(r);
    if (o === 34 || o === 92 && (r += 1, r >= t))
      return e;
    n += e[r];
  }
  return n;
}
function Xs(e) {
  const t = /* @__PURE__ */ Object.create(null), n = String(e);
  let r = 0, o = !1, a = !1;
  function l(c) {
    const m = fn(n.slice(r, c)), h = m.indexOf("=");
    if (h < 1)
      return;
    const d = fn(m.slice(0, h));
    if (!Gs.test(d))
      return;
    const p = d.toLowerCase();
    if (p === "__proto__" || p === "constructor" || p === "prototype")
      return;
    const g = fn(m.slice(h + 1));
    t[p] = Js(g);
  }
  for (let c = 0; c < n.length; c++) {
    const m = n.charCodeAt(c);
    o ? a ? a = !1 : m === 92 ? a = !0 : m === 34 && (o = !1) : m === 34 ? o = !0 : (m === 44 || m === 59) && (l(c), r = c + 1);
  }
  return l(n.length), t;
}
const Ys = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function dn(e, t, n, r, o) {
  if (u.isFunction(r))
    return r.call(this, t, n);
  if (o && (t = n), !!u.isString(t)) {
    if (u.isString(r))
      return t.indexOf(r) !== -1;
    if (u.isRegExp(r))
      return r.test(t);
  }
}
function Ks(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function Zs(e, t) {
  const n = u.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(o, a, l) {
        return this[r].call(this, t, o, a, l);
      },
      configurable: !0
    });
  });
}
let se = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const o = this;
    function a(c, m, h) {
      const d = ht(m);
      if (!d)
        return;
      const p = u.findKey(o, d);
      (!p || o[p] === void 0 || h === !0 || h === void 0 && o[p] !== !1) && (o[p || m] = jt(c));
    }
    const l = (c, m) => u.forEach(c, (h, d) => a(h, d, m));
    if (u.isPlainObject(t) || t instanceof this.constructor)
      l(t, n);
    else if (u.isString(t) && (t = t.trim()) && !Ys(t))
      l(Bs(t), n);
    else if (u.isObject(t) && u.isSafeIterable(t)) {
      let c = /* @__PURE__ */ Object.create(null), m, h;
      for (const d of t) {
        if (!u.isArray(d))
          throw new TypeError("Object iterator must return a key-value pair");
        h = d[0], u.hasOwnProp(c, h) ? (m = c[h], c[h] = u.isArray(m) ? [...m, d[1]] : [m, d[1]]) : c[h] = d[1];
      }
      l(c, n);
    } else
      t != null && a(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = ht(t), t) {
      const r = u.findKey(this, t);
      if (r) {
        const o = this[r];
        if (!n)
          return o;
        if (n === !0)
          return Vs(o);
        if (u.isFunction(n))
          return n.call(this, o, r);
        if (u.isRegExp(n))
          return n.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = ht(t), t) {
      const r = u.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || dn(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let o = !1;
    function a(l) {
      if (l = ht(l), l) {
        const c = u.findKey(r, l);
        c && (!n || dn(r, r[c], c, n)) && (delete r[c], o = !0);
      }
    }
    return u.isArray(t) ? t.forEach(a) : a(t), o;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length, o = !1;
    for (; r--; ) {
      const a = n[r];
      (!t || dn(this, this[a], a, t, !0)) && (delete this[a], o = !0);
    }
    return o;
  }
  normalize(t) {
    const n = this, r = {};
    return u.forEach(this, (o, a) => {
      const l = u.findKey(r, a);
      if (l) {
        n[l] = jt(o), delete n[a];
        return;
      }
      const c = t ? Ks(a) : String(a).trim();
      c !== a && delete n[a], n[c] = jt(o), r[c] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = /* @__PURE__ */ Object.create(null);
    return u.forEach(this, (r, o) => {
      r != null && r !== !1 && (n[o] = t && u.isArray(r) ? r.join(", ") : r);
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
    return Xs(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((o) => r.set(o)), r;
  }
  static accessor(t) {
    const r = (this[lr] = this[lr] = {
      accessors: {}
    }).accessors, o = this.prototype;
    function a(l) {
      const c = ht(l);
      r[c] || (Zs(o, l), r[c] = !0);
    }
    return u.isArray(t) ? t.forEach(a) : a(t), this;
  }
};
se.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
u.reduceDescriptors(se.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    }
  };
});
u.freezeMethods(se);
const $t = "[REDACTED ****]";
function Qs(e) {
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
function ea(e, t) {
  const n = new Set(t.map((a) => String(a).toLowerCase())), r = [], o = (a) => {
    if (a === null || typeof a != "object" || u.isBuffer(a)) return a;
    if (r.indexOf(a) !== -1) return;
    a instanceof se && (a = a.toJSON()), r.push(a);
    let l;
    if (u.isArray(a))
      l = [], a.forEach((c, m) => {
        const h = o(c);
        u.isUndefined(h) || (l[m] = h);
      });
    else {
      if (!u.isPlainObject(a) && Qs(a))
        return r.pop(), a;
      l = /* @__PURE__ */ Object.create(null);
      for (const [c, m] of Object.entries(a)) {
        const h = n.has(c.toLowerCase()) ? $t : o(m);
        u.isUndefined(h) || (l[c] = h);
      }
    }
    return r.pop(), l;
  };
  return o(e);
}
function cr(e) {
  try {
    return String(e);
  } catch {
    return "";
  }
}
function ta(e) {
  return e.errors.map((n) => {
    try {
      return n && n.message ? cr(n.message) : cr(n);
    } catch {
      return "";
    }
  }).filter(Boolean).join("; ") || e.name || "AggregateError";
}
let w = class Kr extends Error {
  static from(t, n, r, o, a, l) {
    let c = t.message;
    !c && u.isArray(t.errors) && t.errors.length && (c = ta(t));
    const m = new Kr(c, n || t.code, r, o, a);
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
  constructor(t, n, r, o, a) {
    super(t), Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, n && (this.code = n), r && (this.config = r), o && (this.request = o), a && (this.response = a, this.status = a.status);
  }
  toJSON() {
    const t = this.config, n = t && u.hasOwnProp(t, "redact") ? t.redact : void 0, r = u.isArray(n) && n.length > 0 ? ea(t, n) : u.toJSONObject(t);
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
w.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
w.ERR_BAD_OPTION = "ERR_BAD_OPTION";
w.ECONNABORTED = "ECONNABORTED";
w.ETIMEDOUT = "ETIMEDOUT";
w.ECONNREFUSED = "ECONNREFUSED";
w.ERR_NETWORK = "ERR_NETWORK";
w.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
w.ERR_DEPRECATED = "ERR_DEPRECATED";
w.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
w.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
w.ERR_CANCELED = "ERR_CANCELED";
w.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
w.ERR_INVALID_URL = "ERR_INVALID_URL";
w.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
const na = null, Zr = 100;
function Sn(e) {
  return u.isPlainObject(e) || u.isArray(e);
}
function Qr(e) {
  return u.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function pn(e, t, n) {
  return e ? e.concat(t).map(function(o, a) {
    return o = Qr(o), !n && a ? "[" + o + "]" : o;
  }).join(n ? "." : "") : t;
}
function ra(e) {
  return u.isArray(e) && !e.some(Sn);
}
const oa = u.toFlatObject(u, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function Jt(e, t, n) {
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
    function(O, N) {
      return !u.isUndefined(N[O]);
    }
  );
  const r = n.metaTokens, o = n.visitor || v, a = n.dots, l = n.indexes, c = n.Blob || typeof Blob < "u" && Blob, m = n.maxDepth === void 0 ? Zr : n.maxDepth, h = c && u.isSpecCompliantForm(t), d = [];
  if (!u.isFunction(o))
    throw new TypeError("visitor must be a function");
  function p(y) {
    if (y === null) return "";
    if (u.isDate(y))
      return y.toISOString();
    if (u.isBoolean(y))
      return y.toString();
    if (!h && u.isBlob(y))
      throw new w("Blob is not supported. Use a Buffer instead.");
    if (u.isArrayBuffer(y) || u.isTypedArray(y)) {
      if (h && typeof c == "function")
        return new c([y]);
      throw new w("Blob is not supported. Use a Buffer instead.", w.ERR_NOT_SUPPORT);
    }
    return y;
  }
  function g(y) {
    if (y > m)
      throw new w(
        "Object is too deeply nested (" + y + " levels). Max depth: " + m,
        w.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
  }
  function _(y, O) {
    if (m === 1 / 0)
      return JSON.stringify(y);
    const N = [];
    return JSON.stringify(y, function(F, U) {
      if (!u.isObject(U))
        return U;
      for (; N.length && N[N.length - 1] !== this; )
        N.pop();
      return N.push(U), g(O + N.length - 1), U;
    });
  }
  function v(y, O, N) {
    let R = y;
    if (u.isReactNative(t) && u.isReactNativeBlob(y))
      return t.append(pn(N, O, a), p(y)), !1;
    if (y && !N && typeof y == "object") {
      if (u.endsWith(O, "{}"))
        O = r ? O : O.slice(0, -2), y = _(y, 1);
      else if (u.isArray(y) && ra(y) || (u.isFileList(y) || u.endsWith(O, "[]")) && (R = u.toArray(y)))
        return O = Qr(O), R.forEach(function(U, j) {
          !(u.isUndefined(U) || U === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            l === !0 ? pn([O], j, a) : l === null ? O : O + "[]",
            p(U)
          );
        }), !1;
    }
    return Sn(y) ? !0 : (t.append(pn(N, O, a), p(y)), !1);
  }
  const L = Object.assign(oa, {
    defaultVisitor: v,
    convertValue: p,
    isVisitable: Sn
  });
  function T(y, O, N = 0) {
    if (!u.isUndefined(y)) {
      if (g(N), d.indexOf(y) !== -1)
        throw new Error("Circular reference detected in " + O.join("."));
      d.push(y), u.forEach(y, function(F, U) {
        (!(u.isUndefined(F) || F === null) && o.call(t, F, u.isString(U) ? U.trim() : U, O, L)) === !0 && T(F, O ? O.concat(U) : [U], N + 1);
      }), d.pop();
    }
  }
  if (!u.isObject(e))
    throw new TypeError("data must be an object");
  return T(e), t;
}
function ur(e) {
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
function Dn(e, t) {
  this._pairs = [], e && Jt(e, this, t);
}
const eo = Dn.prototype;
eo.append = function(t, n) {
  this._pairs.push([t, n]);
};
eo.toString = function(t) {
  const n = t ? (r) => t.call(this, r, ur) : ur;
  return this._pairs.map(function(o) {
    return n(o[0]) + "=" + n(o[1]);
  }, "").join("&");
};
function sa(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function to(e, t, n) {
  if (!t)
    return e;
  e = e || "";
  const r = u.isFunction(n) ? {
    serialize: n
  } : n, o = u.getSafeProp(r, "encode") || sa, a = u.getSafeProp(r, "serialize");
  let l;
  if (a ? l = a(t, r) : l = u.isURLSearchParams(t) ? t.toString() : new Dn(t, r).toString(o), l) {
    const c = e.indexOf("#");
    c !== -1 && (e = e.slice(0, c)), e += (e.indexOf("?") === -1 ? "?" : "&") + l;
  }
  return e;
}
class mr {
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
const Pn = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0,
  advertiseZstdAcceptEncoding: !1,
  validateStatusUndefinedResolves: !0
}, aa = typeof URLSearchParams < "u" ? URLSearchParams : Dn, ia = typeof FormData < "u" ? FormData : null, la = typeof Blob < "u" ? Blob : null, ca = {
  isBrowser: !0,
  classes: {
    URLSearchParams: aa,
    FormData: ia,
    Blob: la
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, In = typeof window < "u" && typeof document < "u", An = typeof navigator == "object" && navigator || void 0, ua = In && (!An || ["ReactNative", "NativeScript", "NS"].indexOf(An.product) < 0), ma = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", fa = In && window.location.href || "http://localhost", da = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: In,
  hasStandardBrowserEnv: ua,
  hasStandardBrowserWebWorkerEnv: ma,
  navigator: An,
  origin: fa
}, Symbol.toStringTag, { value: "Module" })), Z = {
  ...da,
  ...ca
};
function pa(e, t) {
  return Jt(e, new Z.classes.URLSearchParams(), {
    visitor: function(n, r, o, a) {
      return Z.isNode && u.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : a.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
const fr = Zr;
function no(e) {
  if (e > fr)
    throw new w(
      "FormData field is too deeply nested (" + e + " levels). Max depth: " + fr,
      w.ERR_FORM_DATA_DEPTH_EXCEEDED
    );
}
function ha(e) {
  const t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g;
  let r;
  for (; (r = n.exec(e)) !== null; )
    no(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
  return t;
}
function ga(e) {
  const t = {}, n = Object.keys(e);
  let r;
  const o = n.length;
  let a;
  for (r = 0; r < o; r++)
    a = n[r], t[a] = e[a];
  return t;
}
function ro(e) {
  function t(n, r, o, a) {
    no(a);
    let l = n[a++];
    if (l === "__proto__") return !0;
    const c = Number.isFinite(+l), m = a >= n.length;
    return l = !l && u.isArray(o) ? o.length : l, m ? (u.hasOwnProp(o, l) ? o[l] = u.isArray(o[l]) ? o[l].concat(r) : [o[l], r] : o[l] = r, !c) : ((!u.hasOwnProp(o, l) || !u.isObject(o[l])) && (o[l] = []), t(n, r, o[l], a) && u.isArray(o[l]) && (o[l] = ga(o[l])), !c);
  }
  if (u.isFormData(e) && u.isFunction(e.entries)) {
    const n = {};
    return u.forEachEntry(e, (r, o) => {
      t(ha(r), o, n, 0);
    }), n;
  }
  return null;
}
const tt = (e, t) => e != null && u.hasOwnProp(e, t) ? e[t] : void 0;
function ya(e, t, n) {
  if (u.isString(e))
    try {
      return (t || JSON.parse)(e), u.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(e);
}
const _t = {
  transitional: Pn,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, n) {
      const r = n.getContentType() || "", o = r.indexOf("application/json") > -1, a = u.isObject(t);
      if (a && u.isHTMLForm(t) && (t = new FormData(t)), u.isFormData(t))
        return o ? JSON.stringify(ro(t)) : t;
      if (u.isArrayBuffer(t) || u.isBuffer(t) || u.isStream(t) || u.isFile(t) || u.isBlob(t) || u.isReadableStream(t))
        return t;
      if (u.isArrayBufferView(t))
        return t.buffer;
      if (u.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let c;
      if (a) {
        const m = tt(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return pa(t, m).toString();
        if ((c = u.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const h = tt(this, "env"), d = h && h.FormData;
          return Jt(
            c ? { "files[]": t } : t,
            d && new d(),
            m
          );
        }
      }
      return a || o ? (n.setContentType("application/json", !1), ya(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const n = tt(this, "transitional") || _t.transitional, r = n && n.forcedJSONParsing, o = tt(this, "responseType"), a = o === "json";
      if (u.isResponse(t) || u.isReadableStream(t))
        return t;
      if (t && u.isString(t) && (r && !o || a)) {
        const c = !(n && n.silentJSONParsing) && a;
        try {
          return JSON.parse(t, tt(this, "parseReviver"));
        } catch (m) {
          if (c)
            throw m.name === "SyntaxError" ? w.from(m, w.ERR_BAD_RESPONSE, this, null, tt(this, "response")) : m;
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
    FormData: Z.classes.FormData,
    Blob: Z.classes.Blob
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
  _t.headers[e] = {};
});
function hn(e, t) {
  const n = this || _t, r = t || n, o = se.from(r.headers);
  let a = r.data;
  return u.forEach(e, function(c) {
    a = c.call(n, a, o.normalize(), t ? t.status : void 0);
  }), o.normalize(), a;
}
function oo(e) {
  return !!(e && e.__CANCEL__);
}
let Tt = class extends w {
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
    super(t ?? "canceled", w.ERR_CANCELED, n, r), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function so(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new w(
    "Request failed with status code " + n.status,
    n.status >= 400 && n.status < 500 ? w.ERR_BAD_REQUEST : w.ERR_BAD_RESPONSE,
    n.config,
    n.request,
    n
  ));
}
function ba(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
function Ea(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let o = 0, a = 0, l;
  return t = t !== void 0 ? t : 1e3, function(m) {
    const h = Date.now(), d = r[a];
    l || (l = h), n[o] = m, r[o] = h;
    let p = a, g = 0;
    for (; p !== o; )
      g += n[p++], p = p % e;
    if (o = (o + 1) % e, o === a && (a = (a + 1) % e), h - l < t)
      return;
    const _ = d && h - d;
    return _ ? Math.round(g * 1e3 / _) : void 0;
  };
}
function xa(e, t) {
  let n = 0, r = 1e3 / t, o, a;
  const l = (h, d = Date.now()) => {
    n = d, o = null, a && (clearTimeout(a), a = null), e(...h);
  };
  return [(...h) => {
    const d = Date.now(), p = d - n;
    p >= r ? l(h, d) : (o = h, a || (a = setTimeout(() => {
      a = null, l(o);
    }, r - p)));
  }, () => o && l(o)];
}
const Vt = (e, t, n = 3) => {
  let r = 0;
  const o = Ea(50, 250);
  return xa((a) => {
    if (!a || typeof a.loaded != "number")
      return;
    const l = a.loaded, c = a.lengthComputable ? a.total : void 0, m = Math.max(0, c != null ? Math.min(l, c) : l), h = Math.max(0, m - r), d = o(h);
    r = Math.max(r, m);
    const p = {
      loaded: m,
      total: c,
      progress: c ? m / c : void 0,
      bytes: h,
      rate: d || void 0,
      estimated: d && c ? (c - m) / d : void 0,
      event: a,
      lengthComputable: c != null,
      [t ? "download" : "upload"]: !0
    };
    e(p);
  }, n);
}, dr = (e, t) => {
  const n = e != null;
  return [
    (r) => t[0]({
      lengthComputable: n,
      total: e,
      loaded: r
    }),
    t[1]
  ];
}, pr = (e, t = u.asap) => (...n) => t(() => e(...n)), wa = Z.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, Z.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(Z.origin),
  Z.navigator && /(msie|trident)/i.test(Z.navigator.userAgent)
) : () => !0, _a = Z.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, n, r, o, a, l) {
      if (typeof document > "u") return;
      const c = [`${e}=${encodeURIComponent(t)}`];
      u.isNumber(n) && c.push(`expires=${new Date(n).toUTCString()}`), u.isString(r) && c.push(`path=${r}`), u.isString(o) && c.push(`domain=${o}`), a === !0 && c.push("secure"), u.isString(l) && c.push(`SameSite=${l}`), document.cookie = c.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.split(";");
      for (let n = 0; n < t.length; n++) {
        const r = t[n].replace(/^\s+/, ""), o = r.indexOf("=");
        if (o !== -1 && r.slice(0, o) === e)
          try {
            return decodeURIComponent(r.slice(o + 1));
          } catch {
            return r.slice(o + 1);
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
function Ta(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function Na(e, t) {
  if (!t)
    return e;
  let n = e.length;
  for (; n > 0 && e.charCodeAt(n - 1) === 47; )
    n--;
  return e.slice(0, n) + "/" + t.replace(/^\/+/, "");
}
const Sa = /^https?:(?!\/\/)/i, Aa = /[\t\n\r]/g;
function Ra(e) {
  let t = 0;
  for (; t < e.length && e.charCodeAt(t) <= 32; )
    t++;
  return e.slice(t);
}
function Oa(e) {
  return Ra(e).replace(Aa, "");
}
function ka(e) {
  return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (t, n, r = "") => `${n}${r}${$t}`);
}
function va(e) {
  const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${$t}@`), n = t.indexOf("#"), o = (n === -1 ? t : t.slice(0, n)).replace(
    /([?&][^=&#]*=)[^&#]*/g,
    `$1${$t}`
  );
  return n === -1 ? o : `${o}#${ka(t.slice(n + 1))}`;
}
function hr(e, t) {
  if (typeof e == "string") {
    const n = Oa(e);
    if (Sa.test(n))
      throw new w(
        `Invalid URL ${JSON.stringify(va(n))}: missing "//" after protocol`,
        w.ERR_INVALID_URL,
        t
      );
  }
}
function ao(e, t, n, r) {
  hr(t, r);
  let o = !Ta(t);
  return e && (o || n === !1) ? (hr(e, r), Na(e, t)) : t;
}
const gr = (e) => e instanceof se ? { ...e } : e, Ca = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(
  Object.getOwnPropertySymbols(e).filter(
    (t) => Object.getOwnPropertyDescriptor(e, t).enumerable
  )
) : Object.keys(e);
function Ve(e, t) {
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
  function r(d, p, g, _) {
    return u.isPlainObject(d) && u.isPlainObject(p) ? u.merge.call({ caseless: _ }, d, p) : u.isPlainObject(p) ? u.merge({}, p) : u.isArray(p) ? p.slice() : p;
  }
  function o(d, p, g, _) {
    if (u.isUndefined(p)) {
      if (!u.isUndefined(d))
        return r(void 0, d, g, _);
    } else return r(d, p, g, _);
  }
  function a(d, p) {
    if (!u.isUndefined(p))
      return r(void 0, p);
  }
  function l(d, p) {
    if (u.isUndefined(p)) {
      if (!u.isUndefined(d))
        return r(void 0, d);
    } else return r(void 0, p);
  }
  function c(d) {
    const p = u.hasOwnProp(t, "transitional") ? t.transitional : void 0;
    if (!u.isUndefined(p))
      if (u.isPlainObject(p)) {
        if (u.hasOwnProp(p, d))
          return p[d];
      } else
        return;
    const g = u.hasOwnProp(e, "transitional") ? e.transitional : void 0;
    if (u.isPlainObject(g) && u.hasOwnProp(g, d))
      return g[d];
  }
  function m(d, p, g) {
    if (u.hasOwnProp(t, g))
      return r(d, p);
    if (u.hasOwnProp(e, g))
      return r(void 0, d);
  }
  const h = {
    url: a,
    method: a,
    data: a,
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
    headers: (d, p, g) => o(gr(d), gr(p), g, !0)
  };
  return u.forEach(Ca({ ...e, ...t }), function(p) {
    if (p === "__proto__" || p === "constructor" || p === "prototype") return;
    const g = u.hasOwnProp(h, p) ? h[p] : o, _ = u.hasOwnProp(e, p) ? e[p] : void 0, v = u.hasOwnProp(t, p) ? t[p] : void 0, L = g(_, v, p);
    u.isUndefined(L) && g !== m || (n[p] = L);
  }), u.hasOwnProp(t, "validateStatus") && u.isUndefined(t.validateStatus) && c("validateStatusUndefinedResolves") === !1 && (u.hasOwnProp(e, "validateStatus") ? n.validateStatus = r(void 0, e.validateStatus) : delete n.validateStatus), n;
}
const La = ["content-type", "content-length"];
function Da(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t || {}).forEach(([r, o]) => {
    La.includes(r.toLowerCase()) && e.set(r, o);
  });
}
const Pa = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
);
function io(e) {
  const t = Ve({}, e), n = (g) => u.hasOwnProp(t, g) ? t[g] : void 0, r = n("data");
  let o = n("withXSRFToken");
  const a = n("xsrfHeaderName"), l = n("xsrfCookieName");
  let c = n("headers");
  const m = n("auth"), h = n("baseURL"), d = n("allowAbsoluteUrls"), p = n("url");
  if (t.headers = c = se.from(c), t.url = to(
    ao(h, p, d, t),
    n("params"),
    n("paramsSerializer")
  ), m) {
    const g = u.getSafeProp(m, "username") || "", _ = u.getSafeProp(m, "password") || "";
    try {
      c.set(
        "Authorization",
        "Basic " + btoa(g + ":" + (_ ? Pa(_) : ""))
      );
    } catch (v) {
      throw w.from(v, w.ERR_BAD_OPTION_VALUE, e);
    }
  }
  if (u.isFormData(r) && (Z.hasStandardBrowserEnv || Z.hasStandardBrowserWebWorkerEnv || u.isReactNative(r) ? c.setContentType(void 0) : u.isFunction(r.getHeaders) && Da(c, r.getHeaders(), n("formDataHeaderPolicy"))), Z.hasStandardBrowserEnv && (u.isFunction(o) && (o = o(t)), o === !0 || o == null && wa(t.url))) {
    const _ = a && l && _a.read(l);
    _ && c.set(a, _);
  }
  return t;
}
const Ia = typeof XMLHttpRequest < "u", Ma = Ia && function(e) {
  return new Promise(function(n, r) {
    const o = io(e);
    let a = o.data;
    const l = se.from(o.headers).normalize();
    let { responseType: c, onUploadProgress: m, onDownloadProgress: h } = o, d, p, g, _, v;
    function L() {
      _ && _(), v && v(), o.cancelToken && o.cancelToken.unsubscribe(d), o.signal && o.signal.removeEventListener("abort", d);
    }
    let T = new XMLHttpRequest();
    T.open(o.method.toUpperCase(), o.url, !0), T.timeout = o.timeout;
    function y() {
      if (!T)
        return;
      const N = se.from(
        "getAllResponseHeaders" in T && T.getAllResponseHeaders()
      ), F = {
        data: !c || c === "text" || c === "json" ? T.responseText : T.response,
        status: T.status,
        statusText: T.statusText,
        headers: N,
        config: e,
        request: T
      };
      so(
        function(j) {
          n(j), L();
        },
        function(j) {
          r(j), L();
        },
        F
      ), T = null;
    }
    "onloadend" in T ? T.onloadend = y : T.onreadystatechange = function() {
      !T || T.readyState !== 4 || T.status === 0 && !(T.responseURL && T.responseURL.startsWith("file:")) || setTimeout(y);
    }, T.onabort = function() {
      T && (r(new w("Request aborted", w.ECONNABORTED, e, T)), L(), T = null);
    }, T.onerror = function(R) {
      const F = R && R.message ? R.message : "Network Error", U = new w(F, w.ERR_NETWORK, e, T);
      U.event = R || null, r(U), L(), T = null;
    }, T.ontimeout = function() {
      let R = o.timeout ? "timeout of " + o.timeout + "ms exceeded" : "timeout exceeded";
      const F = o.transitional || Pn;
      o.timeoutErrorMessage && (R = o.timeoutErrorMessage), r(
        new w(
          R,
          F.clarifyTimeoutError ? w.ETIMEDOUT : w.ECONNABORTED,
          e,
          T
        )
      ), L(), T = null;
    }, a === void 0 && l.setContentType(null), "setRequestHeader" in T && u.forEach(Yr(l), function(R, F) {
      T.setRequestHeader(F, R);
    }), u.isUndefined(o.withCredentials) || (T.withCredentials = !!o.withCredentials), c && c !== "json" && (T.responseType = o.responseType), h && ([g, v] = Vt(h, !0), T.addEventListener("progress", g)), m && T.upload && ([p, _] = Vt(m), T.upload.addEventListener("progress", p), T.upload.addEventListener("loadend", _)), (o.cancelToken || o.signal) && (d = (N) => {
      T && (r(!N || N.type ? new Tt(null, e, T) : N), T.abort(), L(), T = null);
    }, o.cancelToken && o.cancelToken.subscribe(d), o.signal && (o.signal.aborted ? d() : o.signal.addEventListener("abort", d)));
    const O = ba(o.url);
    if (O && !Z.protocols.includes(O)) {
      r(
        new w(
          "Unsupported protocol " + O + ":",
          w.ERR_BAD_REQUEST,
          e
        )
      ), L();
      return;
    }
    T.send(a || null);
  });
}, Ua = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const o = function(m) {
    if (!r) {
      r = !0, l();
      const h = m instanceof Error ? m : this.reason;
      n.abort(
        h instanceof w ? h : new Tt(h instanceof Error ? h.message : h)
      );
    }
  };
  let a = t && setTimeout(() => {
    a = null, o(new w(`timeout of ${t}ms exceeded`, w.ETIMEDOUT));
  }, t);
  const l = () => {
    e && (a && clearTimeout(a), a = null, e.forEach((m) => {
      m.unsubscribe ? m.unsubscribe(o) : m.removeEventListener("abort", o);
    }), e = null);
  };
  e.forEach((m) => {
    if (!r) {
      if (m.aborted) {
        o.call(m);
        return;
      }
      m.addEventListener("abort", o, { once: !0 });
    }
  });
  const { signal: c } = n;
  return c.unsubscribe = () => u.asap(l), c;
}, Fa = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let r = 0, o;
  for (; r < n; )
    o = r + t, yield e.slice(r, o), r = o;
}, za = async function* (e, t) {
  for await (const n of Ba(e))
    yield* Fa(n, t);
}, Ba = async function* (e) {
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
}, yr = (e, t, n, r) => {
  const o = za(e, t);
  let a = 0, l, c = (m) => {
    l || (l = !0, r && r(m));
  };
  return new ReadableStream(
    {
      async pull(m) {
        try {
          const { done: h, value: d } = await o.next();
          if (h) {
            c(), m.close();
            return;
          }
          let p = d.byteLength;
          if (n) {
            let g = a += p;
            n(g);
          }
          m.enqueue(new Uint8Array(d));
        } catch (h) {
          throw c(h), h;
        }
      },
      cancel(m) {
        return c(m), o.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, br = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, lo = (e, t, n) => t + 2 < n && br(e.charCodeAt(t + 1)) && br(e.charCodeAt(t + 2)), Er = (e) => e <= 57 ? e - 48 : (e & 223) - 55, Ha = (e) => e >= 65 && e <= 90 || // A-Z
e >= 97 && e <= 122 || // a-z
e >= 48 && e <= 57 || // 0-9
e === 43 || // +
e === 47 || // /
e === 45 || // - (base64url)
e === 95, ja = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, qa = (e) => {
  const t = Math.floor(e / 4), n = e % 4;
  return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, Wa = (e) => {
  const t = e.length;
  let n = 0;
  return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, $a = (e) => {
  const t = e.length;
  let n = 0, r = 0, o = !1;
  for (let a = 0; a < t; a++) {
    let l = e.charCodeAt(a);
    if (l === 37 && lo(e, a, t) && (l = Er(e.charCodeAt(a + 1)) * 16 + Er(e.charCodeAt(a + 2)), a += 2), !ja(l)) {
      if (l === 61) {
        r++;
        continue;
      }
      if (!Ha(l) || r > 0) {
        o = !0;
        continue;
      }
      n++;
    }
  }
  return o || r > 2 || r > 0 && (n + r) % 4 !== 0 || n % 4 === 1 ? Wa(e) : qa(n);
}, Va = (e, t) => {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const n = e.indexOf(",");
  if (n < 0) return 0;
  const r = e.slice(5, n), o = e.slice(n + 1);
  if (/;base64/i.test(r))
    return t(o);
  let l = 0;
  for (let c = 0, m = o.length; c < m; c++) {
    const h = o.charCodeAt(c);
    if (h === 37 && lo(o, c, m))
      l += 1, c += 2;
    else if (h < 128)
      l += 1;
    else if (h < 2048)
      l += 2;
    else if (h >= 55296 && h <= 56319 && c + 1 < m) {
      const d = o.charCodeAt(c + 1);
      d >= 56320 && d <= 57343 ? (l += 4, c++) : l += 3;
    } else
      l += 3;
  }
  return l;
};
function Ga(e) {
  const t = typeof e == "string" ? e.indexOf("#") : -1;
  return Va(
    t === -1 ? e : e.slice(0, t),
    $a
  );
}
const Mn = "1.19.0", xr = 64 * 1024, { isFunction: zt } = u, Ja = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), wr = (e) => {
  if (!u.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, _r = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, Xa = (e) => {
  const t = e.indexOf("://");
  let n = e;
  return t !== -1 && (n = n.slice(t + 3)), n.includes("@") || n.includes(":");
}, Ya = (e) => {
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
  const { fetch: o, Request: a, Response: l } = e, c = o ? zt(o) : typeof fetch == "function", m = zt(a), h = zt(l);
  if (!c)
    return !1;
  const d = c && zt(n), p = c && (typeof r == "function" ? /* @__PURE__ */ ((y) => (O) => y.encode(O))(new r()) : async (y) => new Uint8Array(await new a(y).arrayBuffer())), g = m && d && _r(() => {
    let y = !1;
    const O = new a(Z.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return y = !0, "half";
      }
    }), N = O.headers.has("Content-Type");
    return O.body != null && O.body.cancel(), y && !N;
  }), _ = h && d && _r(() => u.isReadableStream(new l("").body)), v = {
    stream: _ && ((y) => y.body)
  };
  c && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((y) => {
    !v[y] && (v[y] = (O, N) => {
      let R = O && O[y];
      if (R)
        return R.call(O);
      throw new w(
        `Response type '${y}' is not supported`,
        w.ERR_NOT_SUPPORT,
        N
      );
    });
  });
  const L = async (y) => {
    if (y == null)
      return 0;
    if (u.isBlob(y))
      return y.size;
    if (u.isSpecCompliantForm(y))
      return (await new a(Z.origin, {
        method: "POST",
        body: y
      }).arrayBuffer()).byteLength;
    if (u.isArrayBufferView(y) || u.isArrayBuffer(y))
      return y.byteLength;
    if (u.isURLSearchParams(y) && (y = y + ""), u.isString(y))
      return (await p(y)).byteLength;
  }, T = async (y, O) => {
    const N = u.toFiniteNumber(y.getContentLength());
    return N ?? L(O);
  };
  return async (y) => {
    let {
      url: O,
      method: N,
      data: R,
      signal: F,
      cancelToken: U,
      timeout: j,
      onDownloadProgress: ye,
      onUploadProgress: Ie,
      responseType: be,
      headers: ie,
      withCredentials: Me = "same-origin",
      fetchOptions: Re,
      maxContentLength: pe,
      maxBodyLength: Ge
    } = io(y);
    const _e = u.isNumber(pe) && pe > -1, Ue = u.isNumber(Ge) && Ge > -1, St = (z) => u.hasOwnProp(y, z) ? y[z] : void 0;
    let At = o || fetch;
    be = be ? (be + "").toLowerCase() : "text";
    let Te = Ua(
      [F, U && U.toAbortSignal()],
      j
    ), G = null;
    const M = Te && Te.unsubscribe && (() => {
      Te.unsubscribe();
    });
    let Oe, Fe = null;
    const Rt = () => new w(
      "Request body larger than maxBodyLength limit",
      w.ERR_BAD_REQUEST,
      y,
      G
    );
    try {
      let z;
      const le = St("auth");
      if (le) {
        const S = u.getSafeProp(le, "username") || "", J = u.getSafeProp(le, "password") || "";
        z = {
          username: S,
          password: J
        };
      }
      if (Xa(O)) {
        const S = new URL(O, Z.origin);
        if (!z && (S.username || S.password)) {
          const J = wr(S.username), Ee = wr(S.password);
          z = {
            username: J,
            password: Ee
          };
        }
        (S.username || S.password) && (S.username = "", S.password = "", O = S.href);
      }
      if (z && (ie.delete("authorization"), ie.set(
        "Authorization",
        "Basic " + btoa(Ja((z.username || "") + ":" + (z.password || "")))
      )), _e && typeof O == "string" && O.startsWith("data:") && Ga(O) > pe)
        throw new w(
          "maxContentLength size of " + pe + " exceeded",
          w.ERR_BAD_RESPONSE,
          y,
          G
        );
      if (Ue && N !== "get" && N !== "head") {
        const S = await L(R);
        if (typeof S == "number" && isFinite(S) && (Oe = S, S > Ge))
          throw Rt();
      }
      const Je = Ue && (u.isReadableStream(R) || u.isStream(R)), lt = (S, J, Ee) => yr(
        S,
        xr,
        (ne) => {
          if (Ue && ne > Ge)
            throw Fe = Rt();
          J && J(ne);
        },
        Ee
      );
      if (g && N !== "get" && N !== "head" && (Ie || Je)) {
        if (Oe = Oe ?? await T(ie, R), Oe !== 0 || Je) {
          let S = new a(O, {
            method: "POST",
            body: R,
            duplex: "half"
          }), J;
          if (u.isFormData(R) && (J = S.headers.get("content-type")) && ie.setContentType(J), S.body) {
            const [Ee, ne] = Ie && dr(
              Oe,
              Vt(pr(Ie))
            ) || [];
            R = lt(S.body, Ee, ne);
          }
        }
      } else if (Je && !m && d && N !== "get" && N !== "head")
        R = lt(R);
      else if (Je && m && !g && N !== "get" && N !== "head")
        throw new w(
          "Stream request bodies are not supported by the current fetch implementation",
          w.ERR_NOT_SUPPORT,
          y,
          G
        );
      u.isString(Me) || (Me = Me ? "include" : "omit");
      const Kt = m && "credentials" in a.prototype;
      if (u.isFormData(R)) {
        const S = ie.getContentType();
        S && /^multipart\/form-data/i.test(S) && !/boundary=/i.test(S) && ie.delete("content-type");
      }
      ie.set("User-Agent", "axios/" + Mn, !1);
      const ct = {
        ...Re,
        signal: Te,
        method: N.toUpperCase(),
        headers: Yr(ie.normalize()),
        body: R,
        duplex: "half",
        credentials: Kt ? Me : void 0
      };
      G = m && new a(O, ct);
      let P = await (m ? At(G, Re) : At(O, ct));
      const Xe = se.from(P.headers);
      if (_e) {
        const S = u.toFiniteNumber(Xe.getContentLength());
        if (S != null && S > pe)
          throw new w(
            "maxContentLength size of " + pe + " exceeded",
            w.ERR_BAD_RESPONSE,
            y,
            G
          );
      }
      const B = _ && (be === "stream" || be === "response");
      if (_ && P.body && (ye || _e || B && M)) {
        const S = {};
        ["status", "statusText", "headers"].forEach((ke) => {
          S[ke] = P[ke];
        });
        const J = u.toFiniteNumber(Xe.getContentLength()), [Ee, ne] = ye && dr(
          J,
          Vt(pr(ye), !0)
        ) || [];
        let ut = 0;
        const mt = (ke) => {
          if (_e && (ut = ke, ut > pe))
            throw new w(
              "maxContentLength size of " + pe + " exceeded",
              w.ERR_BAD_RESPONSE,
              y,
              G
            );
          Ee && Ee(ke);
        };
        P = new l(
          yr(P.body, xr, mt, () => {
            ne && ne(), M && M();
          }),
          S
        );
      }
      be = be || "text";
      let fe = await v[u.findKey(v, be) || "text"](
        P,
        y
      );
      if (_e && !_ && !B) {
        let S;
        if (fe != null && (typeof fe.byteLength == "number" ? S = fe.byteLength : typeof fe.size == "number" ? S = fe.size : typeof fe == "string" && (S = typeof r == "function" ? new r().encode(fe).byteLength : fe.length)), typeof S == "number" && S > pe)
          throw new w(
            "maxContentLength size of " + pe + " exceeded",
            w.ERR_BAD_RESPONSE,
            y,
            G
          );
      }
      return !B && M && M(), await new Promise((S, J) => {
        so(S, J, {
          data: fe,
          headers: se.from(P.headers),
          status: P.status,
          statusText: P.statusText,
          config: y,
          request: G
        });
      });
    } catch (z) {
      if (M && M(), Te && Te.aborted && Te.reason instanceof w) {
        const le = Te.reason;
        throw le.config = y, G && (le.request = G), z !== le && Object.defineProperty(le, "cause", {
          __proto__: null,
          value: z,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), le;
      }
      if (Fe)
        throw G && !Fe.request && (Fe.request = G), Fe;
      if (z instanceof w)
        throw G && !z.request && (z.request = G), z;
      if (z && z.name === "TypeError" && /Load failed|fetch/i.test(z.message)) {
        const le = new w(
          "Network Error",
          w.ERR_NETWORK,
          y,
          G,
          z && z.response
        );
        throw Object.defineProperty(le, "cause", {
          __proto__: null,
          value: z.cause || z,
          writable: !0,
          enumerable: !1,
          configurable: !0
        }), le;
      }
      throw w.from(z, z && z.code, y, G, z && z.response);
    }
  };
}, Ka = /* @__PURE__ */ new Map(), co = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: o } = t, a = [r, o, n];
  let l = a.length, c = l, m, h, d = Ka;
  for (; c--; )
    m = a[c], h = d.get(m), h === void 0 && d.set(m, h = c ? /* @__PURE__ */ new Map() : Ya(t)), d = h;
  return h;
};
co();
const Un = {
  http: na,
  xhr: Ma,
  fetch: {
    get: co
  }
};
u.forEach(Un, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const Tr = (e) => `- ${e}`, Za = (e) => u.isFunction(e) || e === null || e === !1;
function Qa(e, t) {
  e = u.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, o;
  const a = {};
  for (let l = 0; l < n; l++) {
    r = e[l];
    let c;
    if (o = r, !Za(r) && (o = Un[(c = String(r)).toLowerCase()], o === void 0))
      throw new w(`Unknown adapter '${c}'`);
    if (o && (u.isFunction(o) || (o = o.get(t))))
      break;
    a[c || "#" + l] = o;
  }
  if (!o) {
    const l = Object.entries(a).map(
      ([m, h]) => `adapter ${m} ` + (h === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let c = n ? l.length > 1 ? `since :
` + l.map(Tr).join(`
`) : " " + Tr(l[0]) : "as no adapter specified";
    throw new w(
      "There is no suitable adapter to dispatch the request " + c,
      w.ERR_NOT_SUPPORT
    );
  }
  return o;
}
const uo = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: Qa,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Un
};
function gn(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new Tt(null, e);
}
function yn(e) {
  return gn(e), e.headers = se.from(e.headers), e.data = hn.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), uo.getAdapter(e.adapter || _t.adapter, e)(e).then(
    function(r) {
      gn(e), e.response = r;
      try {
        r.data = hn.call(e, e.transformResponse, r);
      } finally {
        delete e.response;
      }
      return r.headers = se.from(r.headers), r;
    },
    function(r) {
      if (!oo(r) && (gn(e), r && r.response)) {
        e.response = r.response;
        try {
          r.response.data = hn.call(
            e,
            e.transformResponse,
            r.response
          );
        } finally {
          delete e.response;
        }
        r.response.headers = se.from(r.response.headers);
      }
      return Promise.reject(r);
    }
  );
}
const Xt = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Xt[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const Nr = {};
Xt.transitional = function(t, n, r) {
  function o(a, l) {
    return "[Axios v" + Mn + "] Transitional option '" + a + "'" + l + (r ? ". " + r : "");
  }
  return (a, l, c) => {
    if (t === !1)
      throw new w(
        o(l, " has been removed" + (n ? " in " + n : "")),
        w.ERR_DEPRECATED
      );
    return n && !Nr[l] && (Nr[l] = !0, console.warn(
      o(
        l,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(a, l, c) : !0;
  };
};
Xt.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function ei(e, t, n) {
  if (typeof e != "object" || e === null)
    throw new w("options must be an object", w.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let o = r.length;
  for (; o-- > 0; ) {
    const a = r[o], l = Object.prototype.hasOwnProperty.call(t, a) ? t[a] : void 0;
    if (l) {
      const c = e[a], m = c === void 0 || l(c, a, e);
      if (m !== !0)
        throw new w(
          "option " + a + " must be " + m,
          w.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (n !== !0)
      throw new w("Unknown option " + a, w.ERR_BAD_OPTION);
  }
}
const qt = {
  assertOptions: ei,
  validators: Xt
}, re = qt.validators;
let qe = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new mr(),
      response: new mr()
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
        let o = {};
        Error.captureStackTrace ? Error.captureStackTrace(o) : o = new Error();
        const a = (() => {
          if (!o.stack)
            return "";
          const l = o.stack.indexOf(`
`);
          return l === -1 ? "" : o.stack.slice(l + 1);
        })();
        try {
          if (!r.stack)
            r.stack = a;
          else if (a) {
            const l = a.indexOf(`
`), c = l === -1 ? -1 : a.indexOf(`
`, l + 1), m = c === -1 ? "" : a.slice(c + 1);
            String(r.stack).endsWith(m) || (r.stack += `
` + a);
          }
        } catch {
        }
      }
      throw r;
    }
  }
  _request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = Ve(this.defaults, n);
    const { transitional: r, paramsSerializer: o, headers: a } = n;
    r !== void 0 && qt.assertOptions(
      r,
      {
        silentJSONParsing: re.transitional(re.boolean),
        forcedJSONParsing: re.transitional(re.boolean),
        clarifyTimeoutError: re.transitional(re.boolean),
        legacyInterceptorReqResOrdering: re.transitional(re.boolean),
        advertiseZstdAcceptEncoding: re.transitional(re.boolean),
        validateStatusUndefinedResolves: re.transitional(re.boolean)
      },
      !1
    ), o != null && (u.isFunction(o) ? n.paramsSerializer = {
      serialize: o
    } : qt.assertOptions(
      o,
      {
        encode: re.function,
        serialize: re.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), qt.assertOptions(
      n,
      {
        baseUrl: re.spelling("baseURL"),
        withXsrfToken: re.spelling("withXSRFToken")
      },
      !0
    ), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let l = a && u.merge(a.common, a[n.method]);
    a && u.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (v) => {
      delete a[v];
    }), n.headers = se.concat(l, a);
    const c = [];
    let m = !0;
    this.interceptors.request.forEach(function(L) {
      if (typeof L.runWhen == "function" && L.runWhen(n) === !1)
        return;
      m = m && L.synchronous;
      const T = n.transitional || Pn;
      T && T.legacyInterceptorReqResOrdering ? c.unshift(L.fulfilled, L.rejected) : c.push(L.fulfilled, L.rejected);
    });
    const h = [];
    this.interceptors.response.forEach(function(L) {
      h.push(L.fulfilled, L.rejected);
    });
    let d, p = 0, g;
    if (!m) {
      const v = [yn.bind(this), void 0];
      for (v.unshift(...c), v.push(...h), g = v.length, d = Promise.resolve(n); p < g; )
        d = d.then(v[p++], v[p++]);
      return d;
    }
    g = c.length;
    let _ = n;
    for (; p < g; ) {
      const v = c[p++], L = c[p++];
      try {
        _ = v ? v(_) : _;
      } catch (T) {
        if (!L) {
          d = Promise.reject(T);
          break;
        }
        try {
          const y = L.call(this, T);
          u.isThenable(y) && (d = Promise.resolve(y).then(
            () => yn.call(this, _)
          ));
        } catch (y) {
          d = Promise.reject(y);
        }
        break;
      }
    }
    if (!d)
      try {
        d = yn.call(this, _);
      } catch (v) {
        d = Promise.reject(v);
      }
    for (p = 0, g = h.length; p < g; )
      d = d.then(h[p++], h[p++]);
    return d;
  }
  getUri(t) {
    t = Ve(this.defaults, t);
    const n = ao(t.baseURL, t.url, t.allowAbsoluteUrls, t);
    return to(n, t.params, t.paramsSerializer);
  }
};
u.forEach(["delete", "get", "head", "options"], function(t) {
  qe.prototype[t] = function(n, r) {
    return this.request(
      Ve(r || {}, {
        method: t,
        url: n,
        data: r && u.hasOwnProp(r, "data") ? r.data : void 0
      })
    );
  };
});
u.forEach(["post", "put", "patch", "query"], function(t) {
  function n(r) {
    return function(a, l, c) {
      return this.request(
        Ve(c || {}, {
          method: t,
          headers: r ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: a,
          data: l
        })
      );
    };
  }
  qe.prototype[t] = n(), t !== "query" && (qe.prototype[t + "Form"] = n(!0));
});
let ti = class mo {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function(a) {
      n = a;
    });
    const r = this;
    this.promise.then((o) => {
      if (!r._listeners) return;
      let a = r._listeners.length;
      for (; a-- > 0; )
        r._listeners[a](o);
      r._listeners = null;
    }), this.promise.then = (o) => {
      let a;
      const l = new Promise((c) => {
        r.subscribe(c), a = c;
      }).then(o);
      return l.cancel = function() {
        r.unsubscribe(a);
      }, l;
    }, t(function(a, l, c) {
      r.reason || (r.reason = new Tt(a, l, c), n(r.reason));
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
      token: new mo(function(o) {
        t = o;
      }),
      cancel: t
    };
  }
};
function ni(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function ri(e) {
  return u.isObject(e) && e.isAxiosError === !0;
}
const Rn = {
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
Object.entries(Rn).forEach(([e, t]) => {
  Rn[t] = e;
});
function fo(e) {
  const t = new qe(e), n = Hr(qe.prototype.request, t);
  return u.extend(n, qe.prototype, t, { allOwnKeys: !0 }), u.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(o) {
    return fo(Ve(e, o));
  }, n;
}
const $ = fo(_t);
$.Axios = qe;
$.CanceledError = Tt;
$.CancelToken = ti;
$.isCancel = oo;
$.VERSION = Mn;
$.toFormData = Jt;
$.AxiosError = w;
$.Cancel = $.CanceledError;
$.all = function(t) {
  return Promise.all(t);
};
$.spread = ni;
$.isAxiosError = ri;
$.mergeConfig = Ve;
$.AxiosHeaders = se;
$.formToJSON = (e) => ro(u.isHTMLForm(e) ? new FormData(e) : e);
$.getAdapter = uo.getAdapter;
$.HttpStatusCode = Rn;
$.default = $;
const {
  Axios: vl,
  AxiosError: Cl,
  CanceledError: Ll,
  isCancel: Dl,
  CancelToken: Pl,
  VERSION: Il,
  all: Ml,
  Cancel: Ul,
  isAxiosError: Fl,
  spread: zl,
  toFormData: Bl,
  AxiosHeaders: Hl,
  HttpStatusCode: jl,
  formToJSON: ql,
  getAdapter: Wl,
  mergeConfig: $l,
  create: Vl
} = $, he = $.create({ baseURL: "/api", withCredentials: !0 });
he.interceptors.request.use((e) => {
  const t = localStorage.getItem("mortar_token");
  return t && (e.headers.Authorization = "Bearer " + t), e;
});
const oi = {
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
function E(e, t) {
  if (t != null && t.translations_override)
    try {
      const o = JSON.parse(t.translations_override)[e];
      if (typeof o == "string" && o) return o;
    } catch {
    }
  return (localStorage.getItem("mortar_lang") || (t == null ? void 0 : t.site_lang) || "zh") === "zh" && oi[e] || e;
}
function po(e) {
  return localStorage.getItem("mortar_lang") || (e == null ? void 0 : e.site_lang) || "zh";
}
function si({ settings: e }) {
  const [t, n] = Q([]), [r, o] = Q(!1), [a, l] = Q(null), [c, m] = Q(!1);
  we(() => {
    he.get("/menus/location/primary").then((_) => n(_.data.items || [])).catch(() => {
    }), localStorage.getItem("mortar_token") && he.get("/auth/me").then((_) => l(_.data)).catch(() => localStorage.removeItem("mortar_token"));
    const g = () => m(window.scrollY > 8);
    return window.addEventListener("scroll", g, { passive: !0 }), () => window.removeEventListener("scroll", g);
  }, []);
  function h() {
    he.post("/auth/logout").catch(() => {
    }), localStorage.removeItem("mortar_token"), window.location.href = "/";
  }
  const d = (g) => t.filter((_) => (_.parentId || null) === g && !(_.url === "/" && (_.label.toLowerCase() === "home" || _.label === E("home", e)))), p = (g) => {
    const _ = d(g.id);
    return _.length === 0 ? s.createElement(D, { key: g.id, to: g.url, className: "text-sm text-gray-600 hover:text-gray-900 transition-colors" }, g.label) : s.createElement(
      "div",
      { key: g.id, className: "relative group" },
      s.createElement(D, { to: g.url, className: "text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 transition-colors" }, g.label, s.createElement("span", { className: "text-xs" }, "▾")),
      s.createElement(
        "div",
        { className: "absolute left-0 top-full pt-2 hidden group-hover:block z-50" },
        s.createElement(
          "div",
          { className: "bg-white/95 backdrop-blur border border-gray-100 rounded-xl shadow-xl shadow-gray-900/5 py-1.5 min-w-[170px]" },
          _.map((v) => s.createElement(D, { key: v.id, to: v.url, className: "block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900" }, v.label))
        )
      )
    );
  };
  return s.createElement(
    "header",
    {
      className: "sticky top-0 z-40 transition-all duration-300 " + (c ? "bg-white/80 backdrop-blur-xl border-b border-gray-900/[0.06] shadow-sm shadow-gray-900/[0.03]" : "bg-transparent border-b border-transparent")
    },
    s.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-6 h-16 flex items-center justify-between" },
      s.createElement(
        D,
        { to: "/", className: "flex items-center gap-2 group" },
        s.createElement("span", { className: "w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110" }),
        s.createElement("span", { className: "text-lg font-semibold tracking-tight text-gray-900" }, e.site_title || "Mortar")
      ),
      s.createElement(
        "nav",
        { className: "hidden md:flex items-center gap-8" },
        d(null).map(p),
        a ? s.createElement(
          "div",
          { className: "flex items-center gap-4" },
          s.createElement("span", { className: "text-sm text-gray-600" }, a.username),
          s.createElement("button", { onClick: h, className: "text-sm text-gray-400 hover:text-gray-700 transition-colors" }, E("logout", e))
        ) : s.createElement(
          s.Fragment,
          null,
          e.frontend_show_login !== "0" && s.createElement(D, { to: "/login", className: "text-sm text-gray-600 hover:text-gray-900 transition-colors" }, E("sign in", e))
        ),
        e.frontend_show_login !== "0" && s.createElement(D, { to: "/admin", className: "px-4 py-2 rounded-full text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors" }, E("admin", e))
      ),
      s.createElement("button", {
        onClick: () => o(!r),
        className: "md:hidden p-2 -mr-2 text-gray-600",
        "aria-label": E("toggle menu", e),
        "aria-expanded": r
      }, s.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" }, r ? s.createElement("path", { d: "M6 6l12 12M18 6L6 18" }) : s.createElement("path", { d: "M4 7h16M4 12h16M4 17h16" })))
    ),
    r && s.createElement(
      "div",
      { className: "md:hidden border-t border-gray-100 bg-white/95 backdrop-blur px-6 py-4 space-y-1" },
      s.createElement(D, { to: "/", className: "block text-sm text-gray-700 py-2", onClick: () => o(!1) }, E("home", e)),
      (() => {
        const g = [], _ = (v, L) => {
          t.filter((T) => (T.parentId || null) === v && !(T.url === "/" && (T.label.toLowerCase() === "home" || T.label === E("home", e)))).forEach((T) => {
            g.push(s.createElement(D, { key: T.id, to: T.url, className: "block text-sm text-gray-700 py-2", style: { paddingLeft: 8 + L * 14 }, onClick: () => o(!1) }, T.label)), _(T.id, L + 1);
          });
        };
        return _(null, 0), g;
      })(),
      a ? s.createElement("button", { onClick: h, className: "block text-sm text-gray-500 py-2" }, E("logout", e)) : e.frontend_show_login !== "0" && s.createElement(D, { to: "/login", className: "block text-sm text-gray-700 py-2", onClick: () => o(!1) }, E("sign in", e)),
      e.frontend_show_login !== "0" && s.createElement(D, { to: "/admin", className: "block text-sm font-medium text-gray-900 py-2", onClick: () => o(!1) }, E("admin", e))
    )
  );
}
function ai({ settings: e }) {
  const t = (/* @__PURE__ */ new Date()).getFullYear();
  return s.createElement(
    "footer",
    { className: "border-t border-gray-900/[0.06] mt-24" },
    s.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6" },
      s.createElement(
        "div",
        { className: "flex items-center gap-2" },
        s.createElement("span", { className: "w-4 h-4 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600" }),
        s.createElement("span", { className: "text-sm font-semibold text-gray-900 tracking-tight" }, e.site_title || "Mortar")
      ),
      s.createElement(
        "nav",
        { className: "flex items-center gap-6 text-sm text-gray-500" },
        s.createElement(D, { to: "/", className: "hover:text-gray-900 transition-colors" }, E("home", e)),
        e.privacy_policy_slug && s.createElement(D, { to: "/page/" + e.privacy_policy_slug, className: "hover:text-gray-900 transition-colors" }, E("privacy policy", e)),
        s.createElement(D, { to: "/api/feed/rss", className: "hover:text-gray-900 transition-colors", target: "_blank", rel: "noopener" }, "RSS")
      ),
      s.createElement("p", { className: "text-xs text-gray-400" }, "© " + t + " " + (e.site_title || "Mortar"))
    )
  );
}
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ii = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), ho = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var li = {
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
const ci = Br(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: o = "",
    children: a,
    iconNode: l,
    ...c
  }, m) => Tn(
    "svg",
    {
      ref: m,
      ...li,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: ho("lucide", o),
      ...c
    },
    [
      ...l.map(([h, d]) => Tn(h, d)),
      ...Array.isArray(a) ? a : [a]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const K = (e, t) => {
  const n = Br(
    ({ className: r, ...o }, a) => Tn(ci, {
      ref: a,
      iconNode: t,
      className: ho(`lucide-${ii(e)}`, r),
      ...o
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
const ui = K("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yt = K("Calendar", [
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
const go = K("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mi = K("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fi = K("Clock", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const di = K("FileText", [
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
const pi = K("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const hi = K("Files", [
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
const yo = K("Folder", [
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
const gi = K("House", [
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
const yi = K("Link2", [
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
const bi = K("List", [
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
const bo = K("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ei = K("Rss", [
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
const Eo = K("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xi = K("Tag", [
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
const wi = K("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fn = K("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
function _i() {
  const [e, t] = Q([]);
  if (we(() => {
    he.get("/tags").then((r) => t(r.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const n = Math.max(...e.map((r) => {
    var o;
    return ((o = r._count) == null ? void 0 : o.posts) || 0;
  }), 1);
  return s.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("tag cloud")),
    s.createElement(
      "div",
      { className: "flex flex-wrap gap-1.5" },
      e.map((r) => {
        var a, l, c, m;
        const o = 0.65 + (((a = r._count) == null ? void 0 : a.posts) || 0) / n * 0.35;
        return r.slug ? s.createElement(D, {
          key: r.id,
          to: "/tag/" + r.slug,
          className: "inline-block px-2 py-0.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-700 transition-colors",
          style: { fontSize: o + "rem" },
          title: (((c = r._count) == null ? void 0 : c.posts) || 0) + " " + E("posts")
        }, r.name + " (" + (((m = r._count) == null ? void 0 : m.posts) || 0) + ")") : s.createElement("span", { key: r.id, className: "inline-block px-2 py-0.5 bg-gray-100 rounded-full text-gray-600", style: { fontSize: o + "rem" } }, r.name + " (" + (((l = r._count) == null ? void 0 : l.posts) || 0) + ")");
      })
    )
  );
}
function Ti() {
  const [e, t] = Q([]);
  return we(() => {
    he.get("/posts?limit=5").then((n) => t(n.data.posts || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : s.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("recent posts")),
    s.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((n) => s.createElement(
        "li",
        { key: n.id },
        s.createElement(D, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title)
      ))
    )
  );
}
function Ni() {
  const [e, t] = Q([]);
  return we(() => {
    he.get("/posts/popular?limit=5").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : s.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, s.createElement(wi, { size: 14 }), E("popular posts")),
    s.createElement(
      "ul",
      { className: "space-y-2" },
      e.map(
        (n, r) => s.createElement(
          "li",
          { key: n.id, className: "flex items-start gap-2" },
          s.createElement("span", { className: "text-xs font-bold text-gray-300 mt-0.5 w-4" }, r + 1),
          s.createElement(D, { to: "/post/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600 line-clamp-1" }, n.title),
          n.views > 0 && s.createElement("span", { className: "text-xs text-gray-400 ml-auto shrink-0" }, n.views + " " + E("views"))
        )
      )
    )
  );
}
function Si() {
  const [e, t] = Q([]);
  if (we(() => {
    he.get("/posts/archives").then((r) => t(r.data)).catch(() => {
    });
  }, []), e.length === 0) return null;
  const n = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return s.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("archives")),
    s.createElement(
      "ul",
      { className: "space-y-1" },
      e.map((r) => {
        const [o, a] = r.month.split("-");
        return s.createElement(
          "li",
          { key: r.month },
          s.createElement(
            D,
            { to: "/archive/" + o + "/" + a, className: "text-sm text-gray-600 hover:text-primary-600" },
            n[parseInt(a) - 1] + " " + o + " (" + r.count + ")"
          )
        );
      })
    )
  );
}
function Ai() {
  const [e, t] = Q(""), [n, r] = Q([]), [o, a] = Q(!1), [l, c] = Q(!1), m = Go(), h = vn(null);
  we(() => {
    const g = e.trim();
    if (g.length < 2) {
      r([]), a(!1);
      return;
    }
    c(!0);
    const _ = setTimeout(() => {
      he.get("/posts/suggest", { params: { q: g } }).then((v) => {
        var L;
        r(((L = v.data) == null ? void 0 : L.suggestions) || []), a(!0);
      }).catch(() => {
        r([]);
      }).finally(() => c(!1));
    }, 250);
    return () => clearTimeout(_);
  }, [e]), we(() => {
    const g = (_) => {
      h.current && !h.current.contains(_.target) && a(!1);
    };
    return document.addEventListener("mousedown", g), () => document.removeEventListener("mousedown", g);
  }, []);
  const d = (g) => {
    g.preventDefault(), e.trim() && m("/search?q=" + encodeURIComponent(e.trim()));
  }, p = (g) => {
    a(!1), m("/" + g.type + "/" + g.slug);
  };
  return s.createElement(
    "div",
    { ref: h, className: "rounded-lg border border-gray-200 p-4 relative" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("search")),
    s.createElement(
      "form",
      { onSubmit: d, className: "flex gap-2" },
      s.createElement("input", {
        type: "text",
        value: e,
        onChange: (g) => t(g.target.value),
        onFocus: () => {
          n.length > 0 && a(!0);
        },
        placeholder: E("search placeholder"),
        "aria-label": E("search posts"),
        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      }),
      s.createElement("button", {
        type: "submit",
        "aria-label": E("search"),
        className: "px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      }, s.createElement(Eo, { size: 16 }))
    ),
    // Suggestions dropdown
    o && n.length > 0 && s.createElement(
      "div",
      { className: "absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden" },
      n.map(
        (g) => s.createElement(
          "button",
          {
            key: g.id,
            type: "button",
            onMouseDown: (_) => {
              _.preventDefault(), p(g);
            },
            className: "w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          },
          s.createElement(g.type === "page" ? pi : di, { size: 14, className: "text-gray-400 shrink-0" }),
          s.createElement("span", { className: "text-sm text-gray-800 dark:text-gray-100 truncate" }, g.title),
          s.createElement("span", { className: "ml-auto text-xs uppercase text-gray-400 shrink-0" }, g.type)
        )
      )
    ),
    o && l && n.length === 0 && s.createElement("div", { className: "absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 px-3 py-2 text-xs text-gray-400" }, E("searching") + "…")
  );
}
function Ri() {
  const [e, t] = Q([]);
  return we(() => {
    he.get("/links").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : s.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("links")),
    s.createElement(
      "ul",
      { className: "space-y-1.5" },
      e.map(
        (n) => s.createElement(
          "li",
          { key: n.id },
          s.createElement(
            "a",
            { href: n.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600" },
            n.avatar ? s.createElement("img", { src: n.avatar, alt: "", className: "w-5 h-5 rounded-full object-cover" }) : null,
            s.createElement("span", { className: "truncate" }, n.name)
          )
        )
      )
    )
  );
}
function Oi() {
  const [e, t] = Q([]);
  return we(() => {
    he.get("/comments/recent?limit=5").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : s.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, s.createElement(bo, { size: 14, className: "text-gray-400" }), E("recent comments")),
    s.createElement(
      "ul",
      { className: "space-y-2" },
      e.map((n) => s.createElement(
        "li",
        { key: n.id, className: "text-xs text-gray-600 leading-snug" },
        s.createElement("span", { className: "font-medium text-gray-800" }, n.author || E("anonymous")),
        " " + E("on") + " ",
        s.createElement(D, { to: "/post/" + n.postSlug + "#comments", className: "text-primary-600 hover:underline" }, n.postTitle),
        s.createElement("p", { className: "text-gray-500 mt-0.5 line-clamp-2" }, n.content)
      ))
    )
  );
}
function ki() {
  const e = /* @__PURE__ */ new Date(), t = e.getFullYear(), n = e.getMonth(), r = new Date(t, n, 1).getDay(), o = new Date(t, n + 1, 0).getDate(), a = e.getDate(), l = ["日", "一", "二", "三", "四", "五", "六"], c = [];
  for (let m = 0; m < r; m++) c.push(s.createElement("div", { key: "b" + m }));
  for (let m = 1; m <= o; m++)
    c.push(s.createElement(D, {
      key: m,
      to: "/archive/" + t + "/" + String(n + 1).padStart(2, "0"),
      className: "flex items-center justify-center h-7 text-xs rounded " + (m === a ? "bg-primary-600 text-white font-medium" : "text-gray-600 hover:bg-gray-100"),
      title: E("view monthly archive")
    }, m));
  return s.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, s.createElement(Yt, { size: 14, className: "text-gray-400" }), E("calendar")),
    s.createElement(
      "div",
      { className: "grid grid-cols-7 gap-0.5 text-center" },
      l.map((m, h) => s.createElement("div", { key: h, className: "text-[10px] text-gray-400 py-1" }, m)),
      c
    )
  );
}
function vi() {
  const [e, t] = Q([]);
  return we(() => {
    he.get("/pages/public").then((n) => t(n.data || [])).catch(() => {
    });
  }, []), e.length === 0 ? null : s.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5" }, s.createElement(hi, { size: 14, className: "text-gray-400" }), E("pages")),
    s.createElement(
      "ul",
      { className: "space-y-1.5" },
      e.map((n) => s.createElement(
        "li",
        { key: n.id },
        s.createElement(D, { to: "/page/" + n.slug, className: "text-sm text-gray-600 hover:text-primary-600" }, n.title)
      ))
    )
  );
}
function Ci() {
  return s.createElement(
    "div",
    { className: "rounded-lg border border-gray-200 p-4" },
    s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, E("subscribe")),
    s.createElement("a", {
      href: "/api/feed/rss",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
    }, s.createElement(Ei, { size: 16 }), E("rss feed")),
    s.createElement("p", { className: "text-xs text-gray-500 mt-2" }, E("get the latest posts in your feed reader"))
  );
}
function xo(e) {
  return !e || /[\"'<>\s]/.test(e) || !/^https?:\/\/[\w.-]+(\/\S*)?$/.test(e) ? null : e.replace(/\/$/, "");
}
function zn(e, t) {
  if (!e) return;
  const n = xo(t.cdn_url);
  return n && e.startsWith("/uploads/") ? n + e : e;
}
function wo(e, t) {
  let n = e;
  const r = xo(t.cdn_url);
  return r && (n = n.replace(/(src|href|data-src|poster)="\/uploads\//g, '$1="' + r + "/uploads/")), n.replace(/<img(?![^>]*loading=)[^>]*>/g, (o) => o.replace(/<img/, '<img loading="lazy"'));
}
function Li(e) {
  const t = String(e || ""), n = t.match(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/);
  return new Date(n ? t.replace(" ", "T") + "Z" : t).getTime();
}
function Bn(e) {
  const t = po() === "zh", n = Date.now(), r = Li(e), o = n - r, a = Math.floor(o / 6e4);
  if (a < 1) return t ? "刚刚" : "just now";
  if (a < 60) return t ? a + " 分钟前" : a + "m ago";
  const l = Math.floor(a / 60);
  if (l < 24) return t ? l + " 小时前" : l + "h ago";
  const c = Math.floor(l / 24);
  if (c < 7) return t ? c + " 天前" : c + "d ago";
  const m = Math.floor(c / 7);
  return m < 5 ? t ? m + " 周前" : m + "w ago" : new Date(r).toLocaleDateString(t ? "zh-CN" : void 0);
}
function _o(e) {
  const t = po() === "zh", n = (e || "").replace(/<[^>]*>/g, ""), r = (n.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length, o = n.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, " ").split(/\s+/).filter(Boolean).length, a = Math.max(1, Math.ceil((r + o) / 200));
  return t ? a + " 分钟阅读" : a + " min read";
}
function Di() {
  const [e, t] = s.useState(Date.now());
  return s.useEffect(() => {
    const n = setInterval(() => t(Date.now()), 6e4);
    return () => clearInterval(n);
  }, []), e;
}
function Pi(e) {
  Di();
  const { settings: t, posts: n, total: r, page: o, setPage: a, loadError: l, catSlug: c, isTagPage: m, categories: h } = e;
  return s.createElement(
    "div",
    null,
    c && s.createElement(
      "div",
      { className: "py-16 text-center" },
      s.createElement("p", { className: "text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-3" }, E(m ? "tag" : "category", t)),
      s.createElement("h1", { className: "text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 capitalize" }, (c || "").replace(/-/g, " "))
    ),
    s.createElement(
      "div",
      { className: "max-w-5xl mx-auto px-6 py-16" },
      s.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-3 gap-16" + (t.theme_sidebar_position === "left" ? " [direction:rtl] [&>*]:[direction:ltr]" : "") },
        s.createElement(
          "div",
          { className: "lg:col-span-2" },
          n.length === 0 ? l ? s.createElement("div", { className: "text-center py-24" }, s.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("failed to load posts", t)), s.createElement("p", { className: "text-sm text-gray-500" }, E("please try again later", t))) : s.createElement("div", { className: "text-center py-24" }, s.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no posts yet", t)), s.createElement("p", { className: "text-sm text-gray-500" }, E("check back later for new content", t))) : s.createElement(
            "div",
            null,
            n.map((d, p) => {
              var g, _, v;
              return s.createElement(
                "article",
                { key: d.id, className: "pb-12 " + (p > 0 ? "pt-12 border-t border-gray-900/[0.06]" : "") },
                d.featured && s.createElement(
                  D,
                  { to: "/post/" + d.slug, className: "block overflow-hidden rounded-2xl mb-8" },
                  s.createElement("img", { src: zn(d.featured, t), alt: d.title, className: "w-full aspect-[16/9] object-cover transition-transform duration-500 hover:scale-[1.02]", loading: "lazy", decoding: "async" })
                ),
                s.createElement(
                  D,
                  { to: "/post/" + d.slug },
                  s.createElement("h2", { className: "text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors mb-4" }, d.title)
                ),
                s.createElement(
                  "div",
                  { className: "flex items-center gap-4 text-xs text-gray-500 mb-4" },
                  s.createElement("span", { className: "flex items-center gap-1.5" }, s.createElement(Yt, { size: 13 }), Bn(d.publishedAt || d.createdAt)),
                  s.createElement("span", { className: "flex items-center gap-1.5" }, s.createElement(Fn, { size: 13 }), s.createElement(D, { to: "/author/" + (((g = d.author) == null ? void 0 : g.username) || ""), className: "hover:text-gray-900 transition-colors" }, (_ = d.author) == null ? void 0 : _.username)),
                  ((v = d.categories) == null ? void 0 : v[0]) && s.createElement("span", { className: "flex items-center gap-1.5" }, s.createElement(yo, { size: 13 }), d.categories[0].name)
                ),
                d.excerpt && s.createElement("p", { className: "text-gray-600 leading-relaxed mb-6" }, d.excerpt),
                s.createElement(
                  "div",
                  { className: "flex items-center justify-between" },
                  s.createElement("span", { className: "text-xs text-gray-400" }, _o(d.content)),
                  s.createElement(D, { to: "/post/" + d.slug, className: "inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors" }, E("read more", t), s.createElement("span", null, "→"))
                )
              );
            }),
            r > parseInt(t.posts_per_page || "10") && s.createElement(
              "div",
              { className: "flex items-center justify-center gap-4 pt-12" },
              s.createElement("button", { onClick: () => a(Math.max(1, o - 1)), disabled: o === 1, className: "px-5 py-2.5 rounded-full border border-gray-200 text-sm hover:border-gray-400 disabled:opacity-40 transition-colors" }, "← " + E("previous", t)),
              s.createElement("span", { className: "text-sm text-gray-500" }, E("page", t) + " " + o + " " + E("of", t) + " " + Math.ceil(r / parseInt(t.posts_per_page || "10"))),
              s.createElement("button", { onClick: () => a(o + 1), disabled: o * parseInt(t.posts_per_page || "10") >= r, className: "px-5 py-2.5 rounded-full border border-gray-200 text-sm hover:border-gray-400 disabled:opacity-40 transition-colors" }, E("next", t) + " →")
            )
          )
        ),
        s.createElement(
          "aside",
          { className: "space-y-10" },
          (() => {
            var _;
            const d = (() => {
              try {
                return JSON.parse(t.widgets_active || "[]");
              } catch {
                return [];
              }
            })(), p = (() => {
              try {
                return JSON.parse(t.widgets_config || "{}");
              } catch {
                return {};
              }
            })(), g = (v) => d.length === 0 || d.includes(v);
            return s.createElement(
              s.Fragment,
              null,
              g("search") && s.createElement(Ai),
              g("recent_posts") && s.createElement(Ti),
              g("popular") && s.createElement(Ni),
              g("tag_cloud") && s.createElement(_i),
              g("archives") && s.createElement(Si),
              g("links") && s.createElement(Ri),
              g("recent_comments") && s.createElement(Oi),
              g("calendar") && s.createElement(ki),
              g("pages") && s.createElement(vi),
              g("rss") && s.createElement(Ci),
              g("html") && ((_ = p.html) == null ? void 0 : _.html) && s.createElement(
                "div",
                null,
                p.html.title && s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" }, p.html.title),
                s.createElement("div", { className: "text-sm text-gray-600", dangerouslySetInnerHTML: { __html: p.html.html } })
              )
            );
          })(),
          s.createElement(
            "div",
            { className: "rounded-lg border border-gray-200 p-4" },
            s.createElement("h3", { className: "text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider" }, E("categories", t)),
            h.length === 0 ? s.createElement("p", { className: "text-sm text-gray-500" }, E("no categories yet", t)) : s.createElement("ul", { className: "space-y-2.5" }, h.map((d) => {
              var p;
              return s.createElement(
                "li",
                { key: d.id },
                s.createElement(
                  D,
                  { to: "/category/" + d.slug, className: "text-sm flex items-center justify-between group" },
                  s.createElement("span", { className: "text-gray-600 group-hover:text-gray-900 transition-colors" }, d.name),
                  ((p = d._count) == null ? void 0 : p.posts) > 0 && s.createElement("span", { className: "text-xs text-gray-400" }, d._count.posts)
                )
              );
            }))
          )
        )
      )
    )
  );
}
function Ii() {
  const [e, t] = s.useState(Date.now());
  return s.useEffect(() => {
    const n = setInterval(() => t(Date.now()), 6e4);
    return () => clearInterval(n);
  }, []), e;
}
function Nt(e) {
  Ii();
  const { settings: t, posts: n, page: r, total: o, setPage: a, loadError: l } = e, c = parseInt(t.posts_per_page || "10");
  return l ? s.createElement(
    "div",
    { className: "text-center py-24" },
    s.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("failed to load posts", t)),
    s.createElement("p", { className: "text-sm text-gray-500" }, E("please try again later", t))
  ) : n.length === 0 ? s.createElement(
    "div",
    { className: "text-center py-24" },
    s.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no posts yet", t))
  ) : s.createElement(
    "div",
    null,
    n.map((m, h) => {
      var d, p, g;
      return s.createElement(
        "article",
        { key: m.id, className: "pb-12 " + (h > 0 ? "pt-12 border-t border-gray-900/[0.06]" : "") },
        m.featured && s.createElement(
          D,
          { to: "/post/" + m.slug, className: "block overflow-hidden rounded-2xl mb-8" },
          s.createElement("img", { src: zn(m.featured, t), alt: m.title, className: "w-full aspect-[16/9] object-cover transition-transform duration-500 hover:scale-[1.02]", loading: "lazy", decoding: "async" })
        ),
        s.createElement(
          D,
          { to: "/post/" + m.slug },
          s.createElement("h2", { className: "text-2xl font-bold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors mb-4" }, m.title)
        ),
        s.createElement(
          "div",
          { className: "flex items-center gap-4 text-xs text-gray-500 mb-4" },
          s.createElement("span", { className: "flex items-center gap-1.5" }, s.createElement(Yt, { size: 13 }), Bn(m.publishedAt || m.createdAt)),
          s.createElement("span", { className: "flex items-center gap-1.5" }, s.createElement(Fn, { size: 13 }), s.createElement(D, { to: "/author/" + (((d = m.author) == null ? void 0 : d.username) || ""), className: "hover:text-gray-900 transition-colors" }, (p = m.author) == null ? void 0 : p.username)),
          ((g = m.categories) == null ? void 0 : g[0]) && s.createElement("span", { className: "flex items-center gap-1.5" }, s.createElement(yo, { size: 13 }), m.categories[0].name)
        ),
        m.excerpt && s.createElement("p", { className: "text-gray-600 leading-relaxed" }, m.excerpt),
        s.createElement("div", { className: "mt-5" }, s.createElement(D, { to: "/post/" + m.slug, className: "inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors" }, E("read more", t), s.createElement("span", null, "→")))
      );
    }),
    o > c && s.createElement(
      "div",
      { className: "flex items-center justify-center gap-4 pt-12" },
      s.createElement("button", { onClick: () => a(Math.max(1, r - 1)), disabled: r === 1, className: "px-5 py-2.5 rounded-full border border-gray-200 text-sm hover:border-gray-400 disabled:opacity-40 transition-colors" }, "← " + E("previous", t)),
      s.createElement("span", { className: "text-sm text-gray-500" }, E("page", t) + " " + r + " " + E("of", t) + " " + Math.ceil(o / c)),
      s.createElement("button", { onClick: () => a(r + 1), disabled: r * c >= o, className: "px-5 py-2.5 rounded-full border border-gray-200 text-sm hover:border-gray-400 disabled:opacity-40 transition-colors" }, E("next", t) + " →")
    )
  );
}
function To(e) {
  const { kicker: t, title: n } = e;
  return s.createElement(
    "div",
    { className: "py-16 text-center" },
    t && s.createElement("p", { className: "text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-3" }, t),
    s.createElement("h1", { className: "text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 capitalize" }, n)
  );
}
function Mi(e) {
  const { settings: t, catSlug: n } = e;
  return s.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-6 pb-4" },
    s.createElement(To, { kicker: E("category", t), title: (n || "").replace(/-/g, " ") }),
    s.createElement(Nt, e)
  );
}
function Ui(e) {
  const { settings: t, catSlug: n } = e;
  return s.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-6 pb-4" },
    s.createElement(To, { kicker: E("tag", t), title: (n || "").replace(/-/g, " ") }),
    s.createElement(Nt, e)
  );
}
function Fi(e) {
  const { settings: t, year: n, month: r } = e;
  return s.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-6 pb-4" },
    s.createElement(
      "div",
      { className: "py-16 text-center" },
      s.createElement("p", { className: "text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-3" }, E("archive", t)),
      s.createElement("h1", { className: "text-4xl sm:text-5xl font-bold tracking-tight text-gray-900" }, n + (r ? " / " + r : ""))
    ),
    s.createElement(Nt, e)
  );
}
function zi(e) {
  const { settings: t, query: n, error: r } = e;
  return s.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-6 pb-4" },
    s.createElement(
      "div",
      { className: "py-16 text-center" },
      s.createElement("p", { className: "text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-3" }, E("search", t)),
      s.createElement("h1", { className: "text-4xl font-bold tracking-tight text-gray-900" }, n ? E("results for", t) + ' "' + n + '"' : E("search", t))
    ),
    r ? s.createElement("div", { className: "text-center py-16" }, s.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("search failed", t))) : s.createElement(
      s.Fragment,
      null,
      e.loading ? s.createElement("p", { className: "text-gray-500 text-center py-16" }, E("searching", t)) : e.posts.length === 0 ? s.createElement(
        "div",
        { className: "text-center py-16" },
        s.createElement(Eo, { size: 40, className: "mx-auto text-gray-300 mb-4" }),
        s.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("no results for", t) + ' "' + n + '"'),
        s.createElement(D, { to: "/", className: "text-indigo-600 text-sm" }, "← " + E("browse all posts", t))
      ) : s.createElement(Nt, e)
    )
  );
}
function Bi(e) {
  const { settings: t, username: n, error: r } = e;
  return s.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-6 pb-4" },
    s.createElement(D, { to: "/", className: "inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mt-14 transition-colors" }, s.createElement(ui, { size: 15 }), E("back", t)),
    s.createElement(
      "div",
      { className: "py-10" },
      s.createElement(
        "div",
        { className: "flex items-center gap-4" },
        s.createElement("div", { className: "w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold" }, (n || "?")[0].toUpperCase()),
        s.createElement(
          "div",
          null,
          s.createElement("h1", { className: "text-3xl font-bold tracking-tight text-gray-900" }, n),
          s.createElement("p", { className: "text-sm text-gray-500 mt-1" }, e.posts.length + " " + E("posts", t))
        )
      )
    ),
    r ? s.createElement("p", { className: "text-gray-500" }, E("author not found", t)) : s.createElement(Nt, e)
  );
}
function No({ items: e }) {
  return s.createElement(
    "nav",
    { className: "flex items-center gap-1 text-sm text-gray-500 mb-6", "aria-label": "Breadcrumb" },
    s.createElement(D, { to: "/", className: "hover:text-gray-700 flex items-center gap-1" }, s.createElement(gi, { size: 14 })),
    e.map((t, n) => s.createElement(
      s.Fragment,
      { key: n },
      s.createElement(mi, { size: 12, className: "text-gray-300" }),
      n === e.length - 1 || !t.to ? s.createElement("span", { className: "text-gray-900 font-medium" }, t.label) : s.createElement(D, { to: t.to, className: "hover:text-gray-700" }, t.label)
    ))
  );
}
function Hi({ title: e, url: t, siteUrl: n }) {
  const r = (n || window.location.origin) + t, o = encodeURIComponent(r), a = encodeURIComponent(e);
  async function l() {
    try {
      await navigator.clipboard.writeText(r), alert(E("link copied to clipboard"));
    } catch {
      window.prompt(E("copy link"), r);
    }
  }
  const c = (m) => s.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" }, s.createElement("path", { d: m }));
  return s.createElement(
    "div",
    { className: "flex items-center gap-2" },
    s.createElement("span", { className: "text-xs text-gray-400 mr-1" }, E("share") + ":"),
    s.createElement("a", { href: "https://twitter.com/intent/tweet?url=" + o + "&text=" + a, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors", title: "Twitter" }, c("M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z")),
    s.createElement("a", { href: "https://www.facebook.com/sharer/sharer.php?u=" + o, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors", title: "Facebook" }, c("M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z")),
    s.createElement("a", { href: "https://www.linkedin.com/sharing/share-offsite/?url=" + o, target: "_blank", rel: "noopener", className: "p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", title: "LinkedIn" }, c("M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.9-2.2 4.18 0 4.95 2.75 4.95 6.32V24h-4v-8.6c0-2.05-.04-4.7-2.86-4.7-2.86 0-3.3 2.24-3.3 4.55V24h-4V8z")),
    s.createElement("button", { onClick: l, className: "p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors", title: E("copy link") }, s.createElement(yi, { size: 14 }))
  );
}
function ji(e) {
  return e.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "").slice(0, 80);
}
function qi({ containerRef: e, settings: t }) {
  const [n, r] = Q([]), [o, a] = Q(!0);
  if (we(() => {
    const c = e.current;
    if (!c) return;
    const m = c.querySelectorAll("h2, h3"), h = [], d = /* @__PURE__ */ new Set();
    m.forEach((p) => {
      const g = (p.textContent || "").trim();
      if (!g) return;
      let _ = p.id || ji(g);
      _ || (_ = "sec-" + h.length), d.has(_) && (_ = _ + "-" + h.length), d.add(_), p.id = _, h.push({ id: _, text: g, level: p.tagName === "H2" ? 2 : 3 });
    }), r(h);
  }, [e]), n.length < 3) return null;
  const l = (c) => {
    const m = document.getElementById(c);
    m && m.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return s.createElement(
    "div",
    { className: "mb-8 rounded-xl border border-gray-100 bg-gray-50/70 overflow-hidden" },
    s.createElement(
      "button",
      {
        onClick: () => a(!o),
        className: "w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100/80 transition-colors"
      },
      s.createElement(bi, { size: 15, className: "text-gray-400" }),
      E("table of contents", t || {}),
      s.createElement("span", { className: "ml-auto text-gray-400 text-xs" }, o ? "▲" : "▼")
    ),
    o && s.createElement(
      "nav",
      { className: "px-2 pb-2 max-h-64 overflow-y-auto" },
      n.map(
        (c) => s.createElement("button", {
          key: c.id,
          onClick: () => l(c.id),
          className: "w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 transition-colors " + (c.level === 3 ? "pl-7 text-gray-500" : "text-gray-800 font-medium")
        }, c.text)
      )
    )
  );
}
function So(e) {
  return e.replace(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/g,
    '<div class="aspect-video my-4"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen class="w-full h-full rounded-lg"></iframe></div>'
  ).replace(
    /(?:https?:\/\/)?twitter\.com\/(\w+)\/status\/(\d+)/g,
    '<blockquote class="twitter-tweet my-4"><a href="https://twitter.com/$1/status/$2"></a></blockquote>'
  );
}
function Ao(e) {
  return String(e || "").replace(/@import[^;]+;?/gi, "").replace(/expression\([^)]*\)/gi, "").replace(/behavior\s*:[^;}]+;?/gi, "").replace(/url\(\s*(javascript|data):/gi, "url(");
}
/*! @license DOMPurify 3.4.13 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.13/LICENSE */
function Sr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Wi(e) {
  if (Array.isArray(e)) return e;
}
function $i(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, c = [], m = !0, h = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(m = (r = a.call(n)).done) && (c.push(r.value), c.length !== t); m = !0) ;
    } catch (d) {
      h = !0, o = d;
    } finally {
      try {
        if (!m && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (h) throw o;
      }
    }
    return c;
  }
}
function Vi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Gi(e, t) {
  return Wi(e) || $i(e, t) || Ji(e, t) || Vi();
}
function Ji(e, t) {
  if (e) {
    if (typeof e == "string") return Sr(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Sr(e, t) : void 0;
  }
}
const Ro = Object.entries, Ar = Object.setPrototypeOf, Xi = Object.isFrozen, Yi = Object.getPrototypeOf, Ki = Object.getOwnPropertyDescriptor;
let ee = Object.freeze, te = Object.seal, ot = Object.create, Oo = typeof Reflect < "u" && Reflect, On = Oo.apply, kn = Oo.construct;
ee || (ee = function(t) {
  return t;
});
te || (te = function(t) {
  return t;
});
On || (On = function(t, n) {
  for (var r = arguments.length, o = new Array(r > 2 ? r - 2 : 0), a = 2; a < r; a++)
    o[a - 2] = arguments[a];
  return t.apply(n, o);
});
kn || (kn = function(t) {
  for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
    r[o - 1] = arguments[o];
  return new t(...r);
});
const nt = V(Array.prototype.forEach), Zi = V(Array.prototype.lastIndexOf), Rr = V(Array.prototype.pop), rt = V(Array.prototype.push), Qi = V(Array.prototype.splice), Pe = Array.isArray, bt = V(String.prototype.toLowerCase), bn = V(String.prototype.toString), Or = V(String.prototype.match), gt = V(String.prototype.replace), kr = V(String.prototype.indexOf), el = V(String.prototype.trim), tl = V(Number.prototype.toString), nl = V(Boolean.prototype.toString), vr = typeof BigInt > "u" ? null : V(BigInt.prototype.toString), Cr = typeof Symbol > "u" ? null : V(Symbol.prototype.toString), Y = V(Object.prototype.hasOwnProperty), yt = V(Object.prototype.toString), X = V(RegExp.prototype.test), He = rl(TypeError);
function V(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
      r[o - 1] = arguments[o];
    return On(e, t, r);
  };
}
function rl(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
      n[r] = arguments[r];
    return kn(e, n);
  };
}
function I(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : bt;
  if (Ar && Ar(e, null), !Pe(t))
    return e;
  let r = t.length;
  for (; r--; ) {
    let o = t[r];
    if (typeof o == "string") {
      const a = n(o);
      a !== o && (Xi(t) || (t[r] = a), o = a);
    }
    e[o] = !0;
  }
  return e;
}
function ol(e) {
  for (let t = 0; t < e.length; t++)
    Y(e, t) || (e[t] = null);
  return e;
}
function oe(e) {
  const t = ot(null);
  for (const r of Ro(e)) {
    var n = Gi(r, 2);
    const o = n[0], a = n[1];
    Y(e, o) && (Pe(a) ? t[o] = ol(a) : a && typeof a == "object" && a.constructor === Object ? t[o] = oe(a) : t[o] = a);
  }
  return t;
}
function sl(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return tl(e);
    case "boolean":
      return nl(e);
    case "bigint":
      return vr ? vr(e) : "0";
    case "symbol":
      return Cr ? Cr(e) : "Symbol()";
    case "undefined":
      return yt(e);
    case "function":
    case "object": {
      if (e === null)
        return yt(e);
      const t = e, n = xe(t, "toString");
      if (typeof n == "function") {
        const r = n(t);
        return typeof r == "string" ? r : yt(r);
      }
      return yt(e);
    }
    default:
      return yt(e);
  }
}
function xe(e, t) {
  for (; e !== null; ) {
    const r = Ki(e, t);
    if (r) {
      if (r.get)
        return V(r.get);
      if (typeof r.value == "function")
        return V(r.value);
    }
    e = Yi(e);
  }
  function n() {
    return null;
  }
  return n;
}
function al(e) {
  try {
    return X(e, ""), !0;
  } catch {
    return !1;
  }
}
const Lr = ee(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), En = ee(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), xn = ee(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), il = ee(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), wn = ee(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), ll = ee(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Dr = ee(["#text"]), Pr = ee(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), _n = ee(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dominant-baseline", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-orientation", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Ir = ee(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), Bt = ee(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), cl = te(/{{[\w\W]*|^[\w\W]*}}/g), ul = te(/<%[\w\W]*|^[\w\W]*%>/g), ml = te(/\${[\w\W]*/g), fl = te(/^data-[\-\w.\u00B7-\uFFFF]+$/), dl = te(/^aria-[\-\w]+$/), Mr = te(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), pl = te(/^(?:\w+script|data):/i), hl = te(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), gl = te(/^html$/i), yl = te(/^[a-z][.\w]*(-[.\w]+)+$/i), Ur = te(/<[/\w!]/g), Fr = te(/<[/\w]/g), bl = te(/<\/no(script|embed|frames)/i), El = te(/\/>/i), de = {
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
}, xl = function() {
  return typeof window > "u" ? null : window;
}, wl = function(t, n) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let r = null;
  const o = "data-tt-policy-suffix";
  n && n.hasAttribute(o) && (r = n.getAttribute(o));
  const a = "dompurify" + (r ? "#" + r : "");
  try {
    return t.createPolicy(a, {
      createHTML(l) {
        return l;
      },
      createScriptURL(l) {
        return l;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + a + " could not be created."), null;
  }
}, zr = function() {
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
}, De = function(t, n, r, o) {
  return Y(t, n) && Pe(t[n]) ? I(o.base ? oe(o.base) : {}, t[n], o.transform) : r;
};
function ko() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : xl();
  const t = (x) => ko(x);
  if (t.version = "3.4.13", t.removed = [], !e || !e.document || e.document.nodeType !== de.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const r = n, o = r.currentScript;
  e.DocumentFragment;
  const a = e.HTMLTemplateElement, l = e.Node, c = e.Element, m = e.NodeFilter, h = e.NamedNodeMap;
  h === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const d = e.DOMParser, p = e.trustedTypes, g = c.prototype, _ = xe(g, "cloneNode"), v = xe(g, "remove"), L = xe(g, "nextSibling"), T = xe(g, "childNodes"), y = xe(g, "parentNode"), O = xe(g, "shadowRoot"), N = xe(g, "attributes"), R = l && l.prototype ? xe(l.prototype, "nodeType") : null, F = l && l.prototype ? xe(l.prototype, "nodeName") : null, U = l && l.prototype ? xe(l.prototype, "ownerDocument") : null;
  if (typeof a == "function") {
    const x = n.createElement("template");
    x.content && x.content.ownerDocument && (n = x.content.ownerDocument);
  }
  let j, ye = "", Ie, be = !1, ie = 0;
  const Me = function() {
    if (ie > 0)
      throw He('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, Re = function(i) {
    Me(), ie++;
    try {
      return j.createHTML(i);
    } finally {
      ie--;
    }
  }, pe = function(i) {
    Me(), ie++;
    try {
      return j.createScriptURL(i);
    } finally {
      ie--;
    }
  }, Ge = function() {
    return be || (Ie = wl(p, o), be = !0), Ie;
  }, _e = n, Ue = _e.implementation, St = _e.createNodeIterator, At = _e.createDocumentFragment, Te = _e.getElementsByTagName, G = r.importNode;
  let M = zr();
  t.isSupported = typeof Ro == "function" && typeof y == "function" && Ue && Ue.createHTMLDocument !== void 0;
  const Oe = cl, Fe = ul, Rt = ml, z = fl, le = dl, Je = pl, lt = hl, Kt = yl;
  let ct = Mr, P = null;
  const Xe = I({}, [...Lr, ...En, ...xn, ...wn, ...Dr]);
  let B = null;
  const fe = I({}, [...Pr, ..._n, ...Ir, ...Bt]);
  let S = Object.seal(ot(null, {
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
  })), J = null, Ee = null;
  const ne = Object.seal(ot(null, {
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
  let ut = !0, mt = !0, ke = !1, Hn = !0, ve = !1, Ce = !0, ze = !1, Zt = !1, Ot = null, kt = null, Qt = !1, Ye = !1, vt = !1, Ct = !1, jn = !0, qn = !1;
  const Wn = "user-content-";
  let en = !0, Lt = !1, Ke = {}, Ne = null;
  const tn = I({}, [
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
  let $n = null;
  const Vn = I({}, ["audio", "video", "img", "source", "image", "track"]);
  let nn = null;
  const Gn = I({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Dt = "http://www.w3.org/1998/Math/MathML", Pt = "http://www.w3.org/2000/svg", Se = "http://www.w3.org/1999/xhtml";
  let Ze = Se, rn = !1, on = null;
  const Co = I({}, [Dt, Pt, Se], bn), Jn = ee(["mi", "mo", "mn", "ms", "mtext"]);
  let sn = I({}, Jn);
  const Xn = ee(["annotation-xml"]);
  let an = I({}, Xn);
  const Lo = I({}, ["title", "style", "font", "a", "script"]);
  let ft = null;
  const Do = ["application/xhtml+xml", "text/html"], Po = "text/html";
  let q = null, Qe = null;
  const Io = n.createElement("form"), Yn = function(i) {
    return i instanceof RegExp || i instanceof Function;
  }, ln = function() {
    let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (Qe && Qe === i)
      return;
    (!i || typeof i != "object") && (i = {}), i = oe(i), ft = // eslint-disable-next-line unicorn/prefer-includes
    Do.indexOf(i.PARSER_MEDIA_TYPE) === -1 ? Po : i.PARSER_MEDIA_TYPE, q = ft === "application/xhtml+xml" ? bn : bt, P = De(i, "ALLOWED_TAGS", Xe, {
      transform: q
    }), B = De(i, "ALLOWED_ATTR", fe, {
      transform: q
    }), on = De(i, "ALLOWED_NAMESPACES", Co, {
      transform: bn
    }), nn = De(i, "ADD_URI_SAFE_ATTR", Gn, {
      transform: q,
      base: Gn
    }), $n = De(i, "ADD_DATA_URI_TAGS", Vn, {
      transform: q,
      base: Vn
    }), Ne = De(i, "FORBID_CONTENTS", tn, {
      transform: q
    }), J = De(i, "FORBID_TAGS", oe({}), {
      transform: q
    }), Ee = De(i, "FORBID_ATTR", oe({}), {
      transform: q
    }), Ke = Y(i, "USE_PROFILES") ? i.USE_PROFILES && typeof i.USE_PROFILES == "object" ? oe(i.USE_PROFILES) : i.USE_PROFILES : !1, ut = i.ALLOW_ARIA_ATTR !== !1, mt = i.ALLOW_DATA_ATTR !== !1, ke = i.ALLOW_UNKNOWN_PROTOCOLS || !1, Hn = i.ALLOW_SELF_CLOSE_IN_ATTR !== !1, ve = i.SAFE_FOR_TEMPLATES || !1, Ce = i.SAFE_FOR_XML !== !1, ze = i.WHOLE_DOCUMENT || !1, Ye = i.RETURN_DOM || !1, vt = i.RETURN_DOM_FRAGMENT || !1, Ct = i.RETURN_TRUSTED_TYPE || !1, Qt = i.FORCE_BODY || !1, jn = i.SANITIZE_DOM !== !1, qn = i.SANITIZE_NAMED_PROPS || !1, en = i.KEEP_CONTENT !== !1, Lt = i.IN_PLACE || !1, ct = al(i.ALLOWED_URI_REGEXP) ? i.ALLOWED_URI_REGEXP : Mr, Ze = typeof i.NAMESPACE == "string" ? i.NAMESPACE : Se, sn = Y(i, "MATHML_TEXT_INTEGRATION_POINTS") && i.MATHML_TEXT_INTEGRATION_POINTS && typeof i.MATHML_TEXT_INTEGRATION_POINTS == "object" ? oe(i.MATHML_TEXT_INTEGRATION_POINTS) : I({}, Jn), an = Y(i, "HTML_INTEGRATION_POINTS") && i.HTML_INTEGRATION_POINTS && typeof i.HTML_INTEGRATION_POINTS == "object" ? oe(i.HTML_INTEGRATION_POINTS) : I({}, Xn);
    const f = Y(i, "CUSTOM_ELEMENT_HANDLING") && i.CUSTOM_ELEMENT_HANDLING && typeof i.CUSTOM_ELEMENT_HANDLING == "object" ? oe(i.CUSTOM_ELEMENT_HANDLING) : ot(null);
    if (S = ot(null), Y(f, "tagNameCheck") && Yn(f.tagNameCheck) && (S.tagNameCheck = f.tagNameCheck), Y(f, "attributeNameCheck") && Yn(f.attributeNameCheck) && (S.attributeNameCheck = f.attributeNameCheck), Y(f, "allowCustomizedBuiltInElements") && typeof f.allowCustomizedBuiltInElements == "boolean" && (S.allowCustomizedBuiltInElements = f.allowCustomizedBuiltInElements), te(S), ve && (mt = !1), vt && (Ye = !0), Ke && (P = I({}, Dr), B = ot(null), Ke.html === !0 && (I(P, Lr), I(B, Pr)), Ke.svg === !0 && (I(P, En), I(B, _n), I(B, Bt)), Ke.svgFilters === !0 && (I(P, xn), I(B, _n), I(B, Bt)), Ke.mathMl === !0 && (I(P, wn), I(B, Ir), I(B, Bt))), ne.tagCheck = null, ne.attributeCheck = null, Y(i, "ADD_TAGS") && (typeof i.ADD_TAGS == "function" ? ne.tagCheck = i.ADD_TAGS : Pe(i.ADD_TAGS) && (P === Xe && (P = oe(P)), I(P, i.ADD_TAGS, q))), Y(i, "ADD_ATTR") && (typeof i.ADD_ATTR == "function" ? ne.attributeCheck = i.ADD_ATTR : Pe(i.ADD_ATTR) && (B === fe && (B = oe(B)), I(B, i.ADD_ATTR, q))), Y(i, "ADD_URI_SAFE_ATTR") && Pe(i.ADD_URI_SAFE_ATTR) && I(nn, i.ADD_URI_SAFE_ATTR, q), Y(i, "FORBID_CONTENTS") && Pe(i.FORBID_CONTENTS) && (Ne === tn && (Ne = oe(Ne)), I(Ne, i.FORBID_CONTENTS, q)), Y(i, "ADD_FORBID_CONTENTS") && Pe(i.ADD_FORBID_CONTENTS) && (Ne === tn && (Ne = oe(Ne)), I(Ne, i.ADD_FORBID_CONTENTS, q)), en && (P["#text"] = !0), ze && I(P, ["html", "head", "body"]), P.table && (I(P, ["tbody"]), delete J.tbody), i.TRUSTED_TYPES_POLICY) {
      if (typeof i.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw He('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof i.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw He('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const b = j;
      j = i.TRUSTED_TYPES_POLICY;
      try {
        ye = Re("");
      } catch (A) {
        throw j = b, A;
      }
    } else i.TRUSTED_TYPES_POLICY === null ? (j = void 0, ye = "") : (j === void 0 && (j = Ge()), j && typeof ye == "string" && (ye = Re("")));
    ee && ee(i), Qe = i;
  }, Kn = I({}, [...En, ...xn, ...il]), Zn = I({}, [...wn, ...ll]), Mo = function(i, f, b) {
    return f.namespaceURI === Se ? i === "svg" : f.namespaceURI === Dt ? i === "svg" && (b === "annotation-xml" || sn[b]) : !!Kn[i];
  }, Uo = function(i, f, b) {
    return f.namespaceURI === Se ? i === "math" : f.namespaceURI === Pt ? i === "math" && an[b] : !!Zn[i];
  }, Fo = function(i, f, b) {
    return f.namespaceURI === Pt && !an[b] || f.namespaceURI === Dt && !sn[b] ? !1 : !Zn[i] && (Lo[i] || !Kn[i]);
  }, zo = function(i) {
    let f = y(i);
    (!f || !f.tagName) && (f = {
      namespaceURI: Ze,
      tagName: "template"
    });
    const b = bt(i.tagName), A = bt(f.tagName);
    return on[i.namespaceURI] ? i.namespaceURI === Pt ? Mo(b, f, A) : i.namespaceURI === Dt ? Uo(b, f, A) : i.namespaceURI === Se ? Fo(b, f, A) : !!(ft === "application/xhtml+xml" && on[i.namespaceURI]) : !1;
  }, Le = function(i) {
    rt(t.removed, {
      element: i
    });
    try {
      y(i).removeChild(i);
    } catch {
      if (v(i), !y(i))
        throw He("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, It = function(i) {
    dt(i);
    const f = T(i);
    if (f) {
      const A = [];
      nt(f, (k) => {
        rt(A, k);
      }), nt(A, (k) => {
        try {
          v(k);
        } catch {
        }
      });
    }
    const b = N(i);
    if (b)
      for (let A = b.length - 1; A >= 0; --A) {
        const k = b[A], C = k && k.name;
        if (typeof C == "string")
          try {
            i.removeAttribute(C);
          } catch {
          }
      }
  }, Be = function(i, f) {
    try {
      rt(t.removed, {
        attribute: f.getAttributeNode(i),
        from: f
      });
    } catch {
      rt(t.removed, {
        attribute: null,
        from: f
      });
    }
    if (f.removeAttribute(i), i === "is")
      if (Ye || vt)
        try {
          Le(f);
        } catch {
        }
      else
        try {
          f.setAttribute(i, "");
        } catch {
        }
  }, Bo = function(i) {
    const f = N(i);
    if (f)
      for (let b = f.length - 1; b >= 0; --b) {
        const A = f[b], k = A && A.name;
        if (!(typeof k != "string" || B[q(k)]))
          try {
            i.removeAttribute(k);
          } catch {
          }
      }
  }, dt = function(i) {
    const f = [i];
    for (; f.length > 0; ) {
      const b = f.pop();
      (R ? R(b) : b.nodeType) === de.element && Bo(b);
      const k = T(b);
      if (k)
        for (let C = k.length - 1; C >= 0; --C)
          f.push(k[C]);
    }
  }, Ho = function(i) {
    if (!Ce)
      return;
    const f = [i];
    for (; f.length > 0; ) {
      const b = f.pop(), A = R ? R(b) : b.nodeType;
      if (A === de.processingInstruction || A === de.comment && X(Fr, b.data)) {
        try {
          v(b);
        } catch {
        }
        continue;
      }
      if (A === de.element) {
        const C = b, H = q(F ? F(b) : b.nodeName);
        try {
          C.hasAttribute && C.hasAttribute("patchsrc") && C.removeAttribute("patchsrc"), C.hasAttribute && C.hasAttribute("for") && H !== "label" && H !== "output" && C.removeAttribute("for");
        } catch {
        }
      }
      const k = T(b);
      if (k)
        for (let C = k.length - 1; C >= 0; --C)
          f.push(k[C]);
    }
  }, Qn = function(i) {
    let f = null, b = null;
    if (Qt)
      i = "<remove></remove>" + i;
    else {
      const C = Or(i, /^[\r\n\t ]+/);
      b = C && C[0];
    }
    ft === "application/xhtml+xml" && Ze === Se && (i = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + i + "</body></html>");
    const A = j ? Re(i) : i;
    if (Ze === Se)
      try {
        f = new d().parseFromString(A, ft);
      } catch {
      }
    if (!f || !f.documentElement) {
      f = Ue.createDocument(Ze, "template", null);
      try {
        f.documentElement.innerHTML = rn ? ye : A;
      } catch {
      }
    }
    const k = f.body || f.documentElement;
    return i && b && k.insertBefore(n.createTextNode(b), k.childNodes[0] || null), Ze === Se ? Te.call(f, ze ? "html" : "body")[0] : ze ? f.documentElement : k;
  }, er = function(i) {
    const f = U ? U(i) : i.ownerDocument;
    return St.call(
      f || i,
      i,
      // eslint-disable-next-line no-bitwise
      m.SHOW_ELEMENT | m.SHOW_COMMENT | m.SHOW_TEXT | m.SHOW_PROCESSING_INSTRUCTION | m.SHOW_CDATA_SECTION,
      null
    );
  }, Mt = function(i) {
    return i = gt(i, Oe, " "), i = gt(i, Fe, " "), i = gt(i, Rt, " "), i;
  }, cn = function(i) {
    var f;
    i.normalize();
    const b = U ? U(i) : i.ownerDocument, A = St.call(
      b || i,
      i,
      // eslint-disable-next-line no-bitwise
      m.SHOW_TEXT | m.SHOW_COMMENT | m.SHOW_CDATA_SECTION | m.SHOW_PROCESSING_INSTRUCTION,
      null
    );
    let k = A.nextNode();
    for (; k; )
      k.data = Mt(k.data), k = A.nextNode();
    const C = (f = i.querySelectorAll) === null || f === void 0 ? void 0 : f.call(i, "template");
    C && nt(C, (H) => {
      et(H.content) && cn(H.content);
    });
  }, Ut = function(i) {
    const f = F ? F(i) : null;
    return typeof f != "string" || q(f) !== "form" ? !1 : typeof i.nodeName != "string" || typeof i.textContent != "string" || typeof i.removeChild != "function" || // Realm-safe NamedNodeMap detection: equality against the cached
    // prototype getter. Clobbered .attributes (e.g. <input name="attributes">)
    // makes the direct read diverge from the cached read; a clean form
    // (same-realm OR foreign-realm) has both reads pointing at the same
    // canonical NamedNodeMap.
    i.attributes !== N(i) || typeof i.removeAttribute != "function" || typeof i.setAttribute != "function" || typeof i.namespaceURI != "string" || typeof i.insertBefore != "function" || typeof i.hasChildNodes != "function" || // NodeType clobbering probe. Cached Node.prototype.nodeType getter
    // returns the integer 1 for any Element regardless of realm; direct
    // read on a clobbered form (e.g. <input name="nodeType">) returns
    // the named child element. Cheap addition — nodeType is read from
    // an internal slot, no serialization cost — and removes a residual
    // clobbering surface used by several mXSS / PI / comment branches
    // in _sanitizeElements that compare currentNode.nodeType directly.
    i.nodeType !== R(i) || // HTMLFormElement has [LegacyOverrideBuiltIns]: a descendant named
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
    i.childNodes !== T(i);
  }, et = function(i) {
    if (!R || typeof i != "object" || i === null)
      return !1;
    try {
      return R(i) === de.documentFragment;
    } catch {
      return !1;
    }
  }, pt = function(i) {
    if (!R || typeof i != "object" || i === null)
      return !1;
    try {
      return typeof R(i) == "number";
    } catch {
      return !1;
    }
  };
  function Ae(x, i, f) {
    x.length !== 0 && nt(x, (b) => {
      b.call(t, i, f, Qe);
    });
  }
  const jo = function(i, f) {
    return !!(Ce && i.hasChildNodes() && !pt(i.firstElementChild) && X(Ur, i.textContent) && X(Ur, i.innerHTML) || Ce && i.namespaceURI === Se && f === "style" && pt(i.firstElementChild) || i.nodeType === de.processingInstruction || Ce && i.nodeType === de.comment && X(Fr, i.data));
  }, qo = function(i, f, b) {
    if (!J[f] && or(f) && (S.tagNameCheck instanceof RegExp && X(S.tagNameCheck, f) || S.tagNameCheck instanceof Function && S.tagNameCheck(f)))
      return !1;
    if (en && !Ne[f]) {
      const A = y(i), k = T(i);
      if (k && A) {
        const C = k.length;
        for (let H = C - 1; H >= 0; --H) {
          const W = i === b ? _(k[H], !0) : k[H];
          A.insertBefore(W, L(i));
        }
      }
    }
    return Le(i), !0;
  }, tr = function(i, f, b, A) {
    return i.length === 0 ? f : f === b || f === A ? oe(f) : f;
  }, nr = function(i, f) {
    if (Ae(M.beforeSanitizeElements, i, null), i !== f && y(i) === null)
      return Lt && dt(i), !0;
    if (Ut(i))
      return Le(i), !0;
    const b = q(F ? F(i) : i.nodeName);
    if (P = tr(M.uponSanitizeElement, P, Xe, Ot), Ae(M.uponSanitizeElement, i, {
      tagName: b,
      allowedTags: P
    }), i !== f && y(i) === null)
      return Lt && dt(i), !0;
    if (jo(i, b))
      return Le(i), !0;
    if (J[b] || !(ne.tagCheck instanceof Function && ne.tagCheck(b)) && !P[b]) {
      const k = qo(i, b, f);
      return k === !1 && Ae(M.afterSanitizeElements, i, null), k;
    }
    if ((R ? R(i) : i.nodeType) === de.element && !zo(i) || (b === "noscript" || b === "noembed" || b === "noframes") && X(bl, i.innerHTML))
      return Le(i), !0;
    if (ve && i.nodeType === de.text) {
      const k = Mt(i.textContent);
      i.textContent !== k && (rt(t.removed, {
        element: i.cloneNode()
      }), i.textContent = k);
    }
    return Ae(M.afterSanitizeElements, i, null), !1;
  }, rr = function(i, f, b) {
    if (Ee[f] || Ce && f === "patchsrc" || Ce && f === "for" && i !== "label" && i !== "output" || jn && (f === "id" || f === "name") && (b in n || b in Io))
      return !1;
    const A = B[f] || ne.attributeCheck instanceof Function && ne.attributeCheck(f, i);
    if (!(mt && X(z, f))) {
      if (!(ut && X(le, f))) {
        if (A) {
          if (!nn[f]) {
            if (!X(ct, gt(b, lt, ""))) {
              if (!((f === "src" || f === "xlink:href" || f === "href") && i !== "script" && kr(b, "data:") === 0 && $n[i])) {
                if (!(ke && !X(Je, gt(b, lt, "")))) {
                  if (b)
                    return !1;
                }
              }
            }
          }
        } else if (
          // First condition does a very basic check if a) it's basically a valid custom element tagname AND
          // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
          // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
          !(or(i) && (S.tagNameCheck instanceof RegExp && X(S.tagNameCheck, i) || S.tagNameCheck instanceof Function && S.tagNameCheck(i)) && (S.attributeNameCheck instanceof RegExp && X(S.attributeNameCheck, f) || S.attributeNameCheck instanceof Function && S.attributeNameCheck(f, i)) || // Alternative, second condition checks if it's an `is`-attribute, AND
          // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
          f === "is" && S.allowCustomizedBuiltInElements && (S.tagNameCheck instanceof RegExp && X(S.tagNameCheck, b) || S.tagNameCheck instanceof Function && S.tagNameCheck(b)))
        ) return !1;
      }
    }
    return !0;
  }, Wo = I({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), or = function(i) {
    return !Wo[bt(i)] && X(Kt, i);
  }, $o = function(i, f, b, A) {
    if (j && typeof p == "object" && typeof p.getAttributeType == "function" && !b)
      switch (p.getAttributeType(i, f)) {
        case "TrustedHTML":
          return Re(A);
        case "TrustedScriptURL":
          return pe(A);
      }
    return A;
  }, Vo = function(i, f, b, A) {
    try {
      b ? i.setAttributeNS(b, f, A) : i.setAttribute(f, A), Ut(i) ? Le(i) : Rr(t.removed);
    } catch {
      Be(f, i);
    }
  }, sr = function(i) {
    Ae(M.beforeSanitizeAttributes, i, null);
    const f = i.attributes;
    if (!f || Ut(i))
      return;
    B = tr(M.uponSanitizeAttribute, B, fe, kt);
    const b = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: B,
      forceKeepAttr: void 0
    };
    let A = f.length;
    const k = q(i.nodeName);
    for (; A--; ) {
      const C = f[A], H = C.name, W = C.namespaceURI, ce = C.value, ue = q(H), mn = ce;
      let ae = H === "value" ? mn : el(mn);
      if (b.attrName = ue, b.attrValue = ae, b.keepAttr = !0, b.forceKeepAttr = void 0, Ae(M.uponSanitizeAttribute, i, b), ae = b.attrValue, qn && (ue === "id" || ue === "name") && kr(ae, Wn) !== 0 && (Be(H, i), ae = Wn + ae), Ce && X(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, ae)) {
        Be(H, i);
        continue;
      }
      if (ue === "attributename" && Or(ae, "href")) {
        Be(H, i);
        continue;
      }
      if (!b.forceKeepAttr) {
        if (!b.keepAttr) {
          Be(H, i);
          continue;
        }
        if (!Hn && X(El, ae)) {
          Be(H, i);
          continue;
        }
        if (ve && (ae = Mt(ae)), !rr(k, ue, ae)) {
          Be(H, i);
          continue;
        }
        ae = $o(k, ue, W, ae), ae !== mn && Vo(i, H, W, ae);
      }
    }
    Ae(M.afterSanitizeAttributes, i, null);
  }, Ft = function(i) {
    let f = null;
    const b = er(i);
    for (Ae(M.beforeSanitizeShadowDOM, i, null); f = b.nextNode(); )
      if (Ae(M.uponSanitizeShadowNode, f, null), nr(f, i), sr(f), et(f.content) && Ft(f.content), (R ? R(f) : f.nodeType) === de.element) {
        const k = O(f);
        et(k) && (un(k), Ft(k));
      }
    Ae(M.afterSanitizeShadowDOM, i, null);
  }, un = function(i) {
    const f = [{
      node: i,
      shadow: null
    }];
    for (; f.length > 0; ) {
      const b = f.pop();
      if (b.shadow) {
        Ft(b.shadow);
        continue;
      }
      const A = b.node, C = (R ? R(A) : A.nodeType) === de.element, H = T(A);
      if (H)
        for (let W = H.length - 1; W >= 0; --W)
          f.push({
            node: H[W],
            shadow: null
          });
      if (C) {
        const W = F ? F(A) : null;
        if (typeof W == "string" && q(W) === "template") {
          const ce = A.content;
          et(ce) && f.push({
            node: ce,
            shadow: null
          });
        }
      }
      if (C) {
        const W = O(A);
        et(W) && f.push({
          node: null,
          shadow: W
        }, {
          node: W,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(x) {
    let i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, f = null, b = null, A = null, k = null;
    if (rn = !x, rn && (x = "<!-->"), typeof x != "string" && !pt(x) && (x = sl(x), typeof x != "string"))
      throw He("dirty is not a string, aborting");
    if (!t.isSupported)
      return x;
    Zt ? (P = Ot, B = kt) : ln(i), (M.uponSanitizeElement.length > 0 || M.uponSanitizeAttribute.length > 0) && (P = oe(P)), M.uponSanitizeAttribute.length > 0 && (B = oe(B)), t.removed = [];
    const C = Lt && typeof x != "string" && pt(x);
    if (C) {
      Ho(x);
      const ce = F ? F(x) : x.nodeName;
      if (typeof ce == "string") {
        const ue = q(ce);
        if (!P[ue] || J[ue])
          throw It(x), He("root node is forbidden and cannot be sanitized in-place");
      }
      if (Ut(x))
        throw It(x), He("root node is clobbered and cannot be sanitized in-place");
      try {
        un(x);
      } catch (ue) {
        throw It(x), ue;
      }
    } else if (pt(x))
      f = Qn("<!---->"), b = f.ownerDocument.importNode(x, !0), b.nodeType === de.element && b.nodeName === "BODY" || b.nodeName === "HTML" ? f = b : f.appendChild(b), un(b);
    else {
      if (!Ye && !ve && !ze && // eslint-disable-next-line unicorn/prefer-includes
      x.indexOf("<") === -1)
        return j && Ct ? Re(x) : x;
      if (f = Qn(x), !f)
        return Ye ? null : Ct ? ye : "";
    }
    f && Qt && Le(f.firstChild);
    const H = C ? x : f;
    try {
      const ce = er(H);
      for (; A = ce.nextNode(); )
        nr(A, H), sr(A), et(A.content) && Ft(A.content);
    } catch (ce) {
      throw C && (It(x), nt(t.removed, (ue) => {
        ue.element && dt(ue.element);
      })), ce;
    }
    if (C)
      return nt(t.removed, (ce) => {
        ce.element && dt(ce.element);
      }), ve && cn(x), x;
    if (Ye) {
      if (ve && cn(f), vt)
        for (k = At.call(f.ownerDocument); f.firstChild; )
          k.appendChild(f.firstChild);
      else
        k = f;
      return (B.shadowroot || B.shadowrootmode) && (k = G.call(r, k, !0)), k;
    }
    let W = ze ? f.outerHTML : f.innerHTML;
    return ze && P["!doctype"] && f.ownerDocument && f.ownerDocument.doctype && f.ownerDocument.doctype.name && X(gl, f.ownerDocument.doctype.name) && (W = "<!DOCTYPE " + f.ownerDocument.doctype.name + `>
` + W), ve && (W = Mt(W)), j && Ct ? Re(W) : W;
  }, t.setConfig = function() {
    let x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ln(x), Zt = !0, Ot = P, kt = B;
  }, t.clearConfig = function() {
    Qe = null, Zt = !1, Ot = null, kt = null, j = Ie, ye = "";
  }, t.isValidAttribute = function(x, i, f) {
    Qe || ln({});
    const b = q(x), A = q(i);
    return rr(b, A, f);
  }, t.addHook = function(x, i) {
    typeof i == "function" && Y(M, x) && rt(M[x], i);
  }, t.removeHook = function(x, i) {
    if (Y(M, x)) {
      if (i !== void 0) {
        const f = Zi(M[x], i);
        return f === -1 ? void 0 : Qi(M[x], f, 1)[0];
      }
      return Rr(M[x]);
    }
  }, t.removeHooks = function(x) {
    Y(M, x) && (M[x] = []);
  }, t.removeAllHooks = function() {
    M = zr();
  }, t;
}
var vo = ko();
function _l() {
  const [e, t] = s.useState(Date.now());
  return s.useEffect(() => {
    const n = setInterval(() => t(Date.now()), 6e4);
    return () => clearInterval(n);
  }, []), e;
}
function Tl(e) {
  var y, O;
  _l();
  const { settings: t, post: n, comments: r, submitted: o, commentForm: a, submitComment: l, setCommentForm: c, commentError: m, slug: h } = e, d = vn(null), p = n.author, g = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-sm transition-shadow", _ = n.content || "", v = r.map((N) => s.createElement(
    "div",
    { key: N.id, className: "py-6 border-b border-gray-100 last:border-0" },
    s.createElement(
      "div",
      { className: "flex items-center gap-3 mb-2" },
      s.createElement("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm font-medium" }, (N.author || "?")[0].toUpperCase()),
      s.createElement(
        "div",
        null,
        s.createElement("p", { className: "font-medium text-sm text-gray-900" }, N.author),
        s.createElement("p", { className: "text-xs text-gray-500" }, new Date(N.createdAt).toLocaleDateString())
      )
    ),
    s.createElement("p", { className: "text-sm text-gray-600 leading-relaxed" }, N.content),
    N.children && N.children.map((R) => s.createElement(
      "div",
      { key: R.id, className: "ml-10 mt-4 p-4 rounded-xl bg-gray-50/70" },
      s.createElement("p", { className: "font-medium text-sm text-gray-900 mb-1" }, R.author),
      s.createElement("p", { className: "text-sm text-gray-600" }, R.content)
    ))
  )), L = s.createElement(
    "form",
    { onSubmit: l, noValidate: !0, className: "space-y-4 mt-8 p-8 rounded-2xl bg-gray-50/70 border border-gray-100" },
    s.createElement("h4", { className: "text-base font-semibold text-gray-900" }, E("leave a comment", t)),
    m && s.createElement("div", { role: "alert", className: "p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg" }, m),
    s.createElement("input", { type: "text", name: "website_url", style: { position: "absolute", left: "-9999px" }, tabIndex: -1, autoComplete: "off" }),
    s.createElement(
      "div",
      { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
      s.createElement("input", { value: a.author, onChange: (N) => c({ ...a, author: N.target.value }), placeholder: E("name", t), "aria-label": E("name", t), className: g, autoComplete: "name" }),
      s.createElement("input", { value: a.email, onChange: (N) => c({ ...a, email: N.target.value }), placeholder: E("email", t), type: "email", "aria-label": E("email", t), className: g, autoComplete: "email" })
    ),
    s.createElement("textarea", { value: a.content, onChange: (N) => c({ ...a, content: N.target.value }), placeholder: E("your comment", t) + "...", "aria-label": E("your comment", t), className: g, rows: 4, required: !0 }),
    s.createElement("button", { type: "submit", className: "w-full py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 shadow-lg shadow-indigo-500/20", style: { background: "var(--primary-color, #6366f1)" } }, E("submit comment", t))
  ), T = (N) => {
    let R = 0;
    const F = (N || "").trim().toLowerCase();
    for (let U = 0; U < F.length; U++) R = (R << 5) - R + F.charCodeAt(U) | 0;
    return "https://www.gravatar.com/avatar/" + Math.abs(R).toString(16) + "?d=identicon&s=96";
  };
  return s.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-6 py-14" },
    s.createElement(No, { items: [{ label: E("blog", t), to: "/" }, { label: n.title || E("post", t) }] }),
    s.createElement(D, { to: "/", className: "inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-10 transition-colors" }, s.createElement(go, { size: 15 }), E("back to home", t)),
    s.createElement(
      "article",
      null,
      n.format && n.format !== "standard" && s.createElement("span", { className: "inline-block text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-4" }, n.format),
      s.createElement("h1", { className: "text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-6" }, n.title),
      s.createElement(
        "div",
        { className: "flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 py-5 border-y border-gray-900/[0.06] mb-10" },
        s.createElement("span", { className: "flex items-center gap-2" }, s.createElement(Fn, { size: 15 }), s.createElement(D, { to: "/author/" + ((p == null ? void 0 : p.username) || ""), className: "font-medium text-gray-700 hover:text-gray-900 transition-colors" }, p == null ? void 0 : p.username)),
        s.createElement("span", { className: "flex items-center gap-2" }, s.createElement(Yt, { size: 15 }), Bn(n.publishedAt || n.createdAt)),
        s.createElement("span", { className: "flex items-center gap-2" }, s.createElement(fi, { size: 15 }), _o(_)),
        n.commentCount > 0 && s.createElement("span", { className: "flex items-center gap-2" }, s.createElement(bo, { size: 15 }), n.commentCount)
      ),
      n.featured && s.createElement("img", { src: zn(n.featured, t), alt: n.title, className: "w-full rounded-2xl mb-10 shadow-xl shadow-gray-900/5", loading: "eager", fetchPriority: "high", decoding: "async" }),
      ((y = n.meta) == null ? void 0 : y._visual_css) && s.createElement("style", { dangerouslySetInnerHTML: { __html: Ao(n.meta._visual_css) } }),
      s.createElement(qi, { containerRef: d, settings: t }),
      s.createElement("div", { ref: d, className: "prose prose-gray prose-lg max-w-none mb-14", dangerouslySetInnerHTML: { __html: wo(So(vo.sanitize(_)), t) } }),
      ((O = n.tags) == null ? void 0 : O.length) > 0 && s.createElement(
        "div",
        { className: "flex flex-wrap items-center gap-2 mb-12" },
        s.createElement(xi, { size: 15, className: "text-gray-400" }),
        n.tags.map((N) => N.slug ? s.createElement(D, { key: N.tagId, to: "/tag/" + N.slug, className: "px-3.5 py-1.5 rounded-full text-xs bg-gray-50 border border-gray-100 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors" }, N.name) : null)
      ),
      p && s.createElement(
        "div",
        { className: "flex items-center gap-4 p-6 rounded-2xl bg-gray-50/70 border border-gray-100 mb-12" },
        s.createElement("img", { src: T((p == null ? void 0 : p.email) || ""), alt: "", className: "w-12 h-12 rounded-full" }),
        s.createElement(
          "div",
          null,
          s.createElement(D, { to: "/author/" + p.username, className: "font-semibold text-gray-900 hover:text-indigo-600 transition-colors" }, p.username),
          p.bio && s.createElement("p", { className: "text-sm text-gray-500 mt-1" }, p.bio)
        )
      ),
      t.theme_show_share_buttons !== "0" && s.createElement(Hi, { title: n.title, url: "/post/" + n.slug, siteUrl: t.site_url })
    ),
    s.createElement(
      "section",
      { className: "mt-4" },
      s.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, E("comments", t), n.commentCount > 0 ? " (" + n.commentCount + ")" : ""),
      v.length > 0 && s.createElement("div", null, v),
      o ? s.createElement("p", { className: "text-sm text-green-600 mt-6" }, E("comment submitted for moderation", t)) : L
    )
  );
}
function Nl(e) {
  var h;
  const { settings: t, page: n, submitted: r, commentForm: o, setCommentForm: a, submitComment: l, commentError: c } = e, m = vn(null);
  return s.createElement(
    "div",
    { className: "max-w-3xl mx-auto px-6 py-14" },
    s.createElement(No, { items: [{ label: E("blog", t), to: "/" }, { label: n.title || E("page", t) }] }),
    s.createElement(D, { to: "/", className: "inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-10 transition-colors" }, s.createElement(go, { size: 15 }), E("back to home", t)),
    s.createElement("h1", { className: "text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-8" }, n.title),
    ((h = n.meta) == null ? void 0 : h._visual_css) && s.createElement("style", { dangerouslySetInnerHTML: { __html: Ao(n.meta._visual_css) } }),
    s.createElement("div", { ref: m, className: "prose prose-gray prose-lg max-w-none", dangerouslySetInnerHTML: { __html: wo(So(vo.sanitize(n.content || "")), t) } })
  );
}
const Gl = {
  name: "aurora",
  typography: { cap: 1, max: 36 },
  Header: si,
  Footer: ai,
  HomeLayout: Pi,
  CategoryLayout: Mi,
  TagLayout: Ui,
  ArchiveLayout: Fi,
  SearchLayout: zi,
  AuthorLayout: Bi,
  PostLayout: Tl,
  PageLayout: Nl
};
export {
  Gl as default
};
