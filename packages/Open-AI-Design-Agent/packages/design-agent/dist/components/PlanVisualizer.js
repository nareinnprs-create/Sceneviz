"use strict";
"use client";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = PlanVisualizer;
var _react = _interopRequireDefault(require("react"));
var _fi = require("react-icons/fi");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Renders a DAG (Directed Acyclic Graph) of plan nodes.
 * Groups nodes by their topological layers for a clean horizontal flow.
 */
function PlanVisualizer(_ref) {
  var plan = _ref.plan,
    _ref$theme = _ref.theme,
    theme = _ref$theme === void 0 ? "dark" : _ref$theme;
  if (!plan || !plan.nodes) return null;

  // Simple topological grouping by dependencies
  var layers = [];
  var processed = new Set();
  var remaining = _toConsumableArray(plan.nodes);
  while (remaining.length > 0) {
    var layer = remaining.filter(function (n) {
      return !n.depends || n.depends.length === 0 || n.depends.every(function (d) {
        return processed.has(d);
      });
    });
    if (layer.length === 0) break; // cycle or missing dep
    layers.push(layer);
    layer.forEach(function (n) {
      return processed.add(n.id);
    });
    remaining = remaining.filter(function (n) {
      return !processed.has(n.id);
    });
  }
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "mt-4 mb-4 p-4 rounded border shadow-xl bg-bg-page/50 backdrop-blur-sm ".concat(theme === "dark" ? "border-divider shadow-black/40" : "border-divider shadow-slate-200")
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center justify-between mb-6"
  }, /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("h3", {
    className: "text-[13px] font-bold text-primary flex items-center gap-2 uppercase tracking-widest"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiZap, {
    className: "animate-pulse"
  }), " Proposed Execution Plan"), /*#__PURE__*/_react["default"].createElement("p", {
    className: "text-[11px] text-secondary-text mt-1 italic"
  }, "\u201C", plan.title, "\u201D")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-[12px] font-bold text-primary-text"
  }, plan.total_credits, " ", /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[10px] text-secondary-text font-normal"
  }, "credits")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-[10px] text-secondary-text uppercase tracking-tight"
  }, plan.nodes.length, " steps"))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "relative overflow-x-auto scrollbar-hide pb-4"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-start gap-12 min-w-max px-4"
  }, layers.map(function (layer, lIdx) {
    return /*#__PURE__*/_react["default"].createElement("div", {
      key: lIdx,
      className: "flex flex-col gap-6 justify-center min-h-[200px]"
    }, layer.map(function (node) {
      return /*#__PURE__*/_react["default"].createElement("div", {
        key: node.id,
        id: "plan-node-".concat(node.id),
        className: "w-48 p-3 rounded bg-bg-card border border-divider shadow-sm hover:border-primary/50 transition-all group relative z-10"
      }, /*#__PURE__*/_react["default"].createElement("div", {
        className: "flex items-center justify-between mb-2"
      }, /*#__PURE__*/_react["default"].createElement("span", {
        className: "text-[10px] font-bold text-primary opacity-70"
      }, "#", node.id), /*#__PURE__*/_react["default"].createElement("span", {
        className: "text-[10px] font-bold text-secondary-text bg-bg-page px-1.5 py-0.5 rounded border border-divider"
      }, node.est_credits || 0, " cr")), /*#__PURE__*/_react["default"].createElement("div", {
        className: "text-[12px] font-bold text-primary-text truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all"
      }, node.tool.replace(/_/g, " ")), /*#__PURE__*/_react["default"].createElement("div", {
        className: "text-[11px] text-secondary-text mt-1.5 leading-tight line-clamp-2 italic"
      }, node.label || "Processing asset..."), lIdx < layers.length - 1 && /*#__PURE__*/_react["default"].createElement("div", {
        className: "absolute top-1/2 -right-12 w-12 h-px bg-gradient-to-r from-divider to-transparent"
      }));
    }));
  }))), plan.notes && plan.notes.length > 0 && /*#__PURE__*/_react["default"].createElement("div", {
    className: "mt-4 pt-4 border-t border-divider"
  }, plan.notes.map(function (note, i) {
    return /*#__PURE__*/_react["default"].createElement("div", {
      key: i,
      className: "text-[10px] text-secondary-text flex items-center gap-2"
    }, /*#__PURE__*/_react["default"].createElement("span", {
      className: "w-1 h-1 rounded-full bg-primary"
    }), " ", note);
  })));
}