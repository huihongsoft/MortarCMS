function J(a) {
  return a && a.__esModule && Object.prototype.hasOwnProperty.call(a, "default") ? a.default : a;
}
var r = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var T;
function K() {
  if (T) return r;
  T = 1;
  var a = Symbol.for("react.element"), D = Symbol.for("react.portal"), V = Symbol.for("react.fragment"), L = Symbol.for("react.strict_mode"), F = Symbol.for("react.profiler"), U = Symbol.for("react.provider"), q = Symbol.for("react.context"), A = Symbol.for("react.forward_ref"), M = Symbol.for("react.suspense"), N = Symbol.for("react.memo"), z = Symbol.for("react.lazy"), C = Symbol.iterator;
  function B(e) {
    return e === null || typeof e != "object" ? null : (e = C && e[C] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var k = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, w = Object.assign, b = {};
  function y(e, t, n) {
    this.props = e, this.context = t, this.refs = b, this.updater = n || k;
  }
  y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
    if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, e, t, "setState");
  }, y.prototype.forceUpdate = function(e) {
    this.updater.enqueueForceUpdate(this, e, "forceUpdate");
  };
  function $() {
  }
  $.prototype = y.prototype;
  function h(e, t, n) {
    this.props = e, this.context = t, this.refs = b, this.updater = n || k;
  }
  var v = h.prototype = new $();
  v.constructor = h, w(v, y.prototype), v.isPureReactComponent = !0;
  var O = Array.isArray, j = Object.prototype.hasOwnProperty, S = { current: null }, I = { key: !0, ref: !0, __self: !0, __source: !0 };
  function g(e, t, n) {
    var o, u = {}, i = null, f = null;
    if (t != null) for (o in t.ref !== void 0 && (f = t.ref), t.key !== void 0 && (i = "" + t.key), t) j.call(t, o) && !I.hasOwnProperty(o) && (u[o] = t[o]);
    var s = arguments.length - 2;
    if (s === 1) u.children = n;
    else if (1 < s) {
      for (var c = Array(s), p = 0; p < s; p++) c[p] = arguments[p + 2];
      u.children = c;
    }
    if (e && e.defaultProps) for (o in s = e.defaultProps, s) u[o] === void 0 && (u[o] = s[o]);
    return { $$typeof: a, type: e, key: i, ref: f, props: u, _owner: S.current };
  }
  function H(e, t) {
    return { $$typeof: a, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
  }
  function E(e) {
    return typeof e == "object" && e !== null && e.$$typeof === a;
  }
  function W(e) {
    var t = { "=": "=0", ":": "=2" };
    return "$" + e.replace(/[=:]/g, function(n) {
      return t[n];
    });
  }
  var P = /\/+/g;
  function R(e, t) {
    return typeof e == "object" && e !== null && e.key != null ? W("" + e.key) : t.toString(36);
  }
  function d(e, t, n, o, u) {
    var i = typeof e;
    (i === "undefined" || i === "boolean") && (e = null);
    var f = !1;
    if (e === null) f = !0;
    else switch (i) {
      case "string":
      case "number":
        f = !0;
        break;
      case "object":
        switch (e.$$typeof) {
          case a:
          case D:
            f = !0;
        }
    }
    if (f) return f = e, u = u(f), e = o === "" ? "." + R(f, 0) : o, O(u) ? (n = "", e != null && (n = e.replace(P, "$&/") + "/"), d(u, t, n, "", function(p) {
      return p;
    })) : u != null && (E(u) && (u = H(u, n + (!u.key || f && f.key === u.key ? "" : ("" + u.key).replace(P, "$&/") + "/") + e)), t.push(u)), 1;
    if (f = 0, o = o === "" ? "." : o + ":", O(e)) for (var s = 0; s < e.length; s++) {
      i = e[s];
      var c = o + R(i, s);
      f += d(i, t, n, c, u);
    }
    else if (c = B(e), typeof c == "function") for (e = c.call(e), s = 0; !(i = e.next()).done; ) i = i.value, c = o + R(i, s++), f += d(i, t, n, c, u);
    else if (i === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
    return f;
  }
  function _(e, t, n) {
    if (e == null) return e;
    var o = [], u = 0;
    return d(e, o, "", "", function(i) {
      return t.call(n, i, u++);
    }), o;
  }
  function Y(e) {
    if (e._status === -1) {
      var t = e._result;
      t = t(), t.then(function(n) {
        (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
      }, function(n) {
        (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
      }), e._status === -1 && (e._status = 0, e._result = t);
    }
    if (e._status === 1) return e._result.default;
    throw e._result;
  }
  var l = { current: null }, m = { transition: null }, G = { ReactCurrentDispatcher: l, ReactCurrentBatchConfig: m, ReactCurrentOwner: S };
  function x() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return r.Children = { map: _, forEach: function(e, t, n) {
    _(e, function() {
      t.apply(this, arguments);
    }, n);
  }, count: function(e) {
    var t = 0;
    return _(e, function() {
      t++;
    }), t;
  }, toArray: function(e) {
    return _(e, function(t) {
      return t;
    }) || [];
  }, only: function(e) {
    if (!E(e)) throw Error("React.Children.only expected to receive a single React element child.");
    return e;
  } }, r.Component = y, r.Fragment = V, r.Profiler = F, r.PureComponent = h, r.StrictMode = L, r.Suspense = M, r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = G, r.act = x, r.cloneElement = function(e, t, n) {
    if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
    var o = w({}, e.props), u = e.key, i = e.ref, f = e._owner;
    if (t != null) {
      if (t.ref !== void 0 && (i = t.ref, f = S.current), t.key !== void 0 && (u = "" + t.key), e.type && e.type.defaultProps) var s = e.type.defaultProps;
      for (c in t) j.call(t, c) && !I.hasOwnProperty(c) && (o[c] = t[c] === void 0 && s !== void 0 ? s[c] : t[c]);
    }
    var c = arguments.length - 2;
    if (c === 1) o.children = n;
    else if (1 < c) {
      s = Array(c);
      for (var p = 0; p < c; p++) s[p] = arguments[p + 2];
      o.children = s;
    }
    return { $$typeof: a, type: e.type, key: u, ref: i, props: o, _owner: f };
  }, r.createContext = function(e) {
    return e = { $$typeof: q, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: U, _context: e }, e.Consumer = e;
  }, r.createElement = g, r.createFactory = function(e) {
    var t = g.bind(null, e);
    return t.type = e, t;
  }, r.createRef = function() {
    return { current: null };
  }, r.forwardRef = function(e) {
    return { $$typeof: A, render: e };
  }, r.isValidElement = E, r.lazy = function(e) {
    return { $$typeof: z, _payload: { _status: -1, _result: e }, _init: Y };
  }, r.memo = function(e, t) {
    return { $$typeof: N, type: e, compare: t === void 0 ? null : t };
  }, r.startTransition = function(e) {
    var t = m.transition;
    m.transition = {};
    try {
      e();
    } finally {
      m.transition = t;
    }
  }, r.unstable_act = x, r.useCallback = function(e, t) {
    return l.current.useCallback(e, t);
  }, r.useContext = function(e) {
    return l.current.useContext(e);
  }, r.useDebugValue = function() {
  }, r.useDeferredValue = function(e) {
    return l.current.useDeferredValue(e);
  }, r.useEffect = function(e, t) {
    return l.current.useEffect(e, t);
  }, r.useId = function() {
    return l.current.useId();
  }, r.useImperativeHandle = function(e, t, n) {
    return l.current.useImperativeHandle(e, t, n);
  }, r.useInsertionEffect = function(e, t) {
    return l.current.useInsertionEffect(e, t);
  }, r.useLayoutEffect = function(e, t) {
    return l.current.useLayoutEffect(e, t);
  }, r.useMemo = function(e, t) {
    return l.current.useMemo(e, t);
  }, r.useReducer = function(e, t, n) {
    return l.current.useReducer(e, t, n);
  }, r.useRef = function(e) {
    return l.current.useRef(e);
  }, r.useState = function(e) {
    return l.current.useState(e);
  }, r.useSyncExternalStore = function(e, t, n) {
    return l.current.useSyncExternalStore(e, t, n);
  }, r.useTransition = function() {
    return l.current.useTransition();
  }, r.version = "18.3.1", r;
}
var Q = K();
const X = /* @__PURE__ */ J(Q), {
  Component: Z,
  PureComponent: ee,
  Profiler: te,
  StrictMode: re,
  Suspense: ne,
  Children: ue,
  Fragment: oe,
  createElement: ce,
  cloneElement: ie,
  createContext: se,
  createRef: fe,
  forwardRef: le,
  isValidElement: ae,
  lazy: pe,
  memo: ye,
  startTransition: de,
  useCallback: _e,
  useContext: me,
  useDebugValue: he,
  useDeferredValue: ve,
  useEffect: Se,
  useId: Ee,
  useImperativeHandle: Re,
  useInsertionEffect: Ce,
  useLayoutEffect: ke,
  useMemo: we,
  useReducer: be,
  useRef: $e,
  useState: Oe,
  useSyncExternalStore: je,
  useTransition: Ie,
  version: ge,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: Pe
} = X;
export {
  ue as Children,
  Z as Component,
  oe as Fragment,
  te as Profiler,
  ee as PureComponent,
  re as StrictMode,
  ne as Suspense,
  Pe as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  ie as cloneElement,
  se as createContext,
  ce as createElement,
  fe as createRef,
  X as default,
  le as forwardRef,
  ae as isValidElement,
  pe as lazy,
  ye as memo,
  de as startTransition,
  _e as useCallback,
  me as useContext,
  he as useDebugValue,
  ve as useDeferredValue,
  Se as useEffect,
  Ee as useId,
  Re as useImperativeHandle,
  Ce as useInsertionEffect,
  ke as useLayoutEffect,
  we as useMemo,
  be as useReducer,
  $e as useRef,
  Oe as useState,
  je as useSyncExternalStore,
  Ie as useTransition,
  ge as version
};
