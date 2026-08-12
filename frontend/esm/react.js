// Full explicit re-export of React 18 (production CJS build)
import React from '../node_modules/react/cjs/react.production.min.js';
export default React;
export const {
  Component, PureComponent, Profiler, StrictMode, Suspense, Children, Fragment,
  createElement, cloneElement, createContext, createRef, forwardRef, isValidElement,
  lazy, memo, startTransition, useCallback, useContext, useDebugValue, useDeferredValue,
  useEffect, useId, useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo,
  useReducer, useRef, useState, useSyncExternalStore, useTransition, version,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} = React;
// JSX runtime: the app bundles are built with react/jsx-runtime as an external
// (vite rollupOptions.external), so this bundle must also provide it. The
// importmap entry "react/jsx-runtime" -> /esm-react.js resolves it at runtime.
import jsxRuntime from '../node_modules/react/cjs/react-jsx-runtime.production.min.js';
export const { jsx, jsxs, Fragment: JSXFragment, jsxDEV } = jsxRuntime;
