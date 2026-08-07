// Full explicit re-export of ReactDOM (production CJS build)
import ReactDOM from '../node_modules/react-dom/cjs/react-dom.production.min.js';
export default ReactDOM;
export const {
  render, hydrate, flushSync, createPortal, findDOMNode, unmountComponentAtNode,
  createRoot, hydrateRoot,
} = ReactDOM;
