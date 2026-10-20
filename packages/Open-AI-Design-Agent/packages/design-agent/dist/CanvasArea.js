"use strict";
"use client";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _konva = _interopRequireDefault(require("konva"));
var _reactKonva = require("react-konva");
var _reactHotToast = _interopRequireDefault(require("react-hot-toast"));
var _excluded = ["zIndex"],
  _excluded2 = ["zIndex"],
  _excluded3 = ["zIndex"];
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t5 in e) "default" !== _t5 && {}.hasOwnProperty.call(e, _t5) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t5)) && (i.get || i.set) ? o(f, _t5, i) : f[_t5] = e[_t5]); return f; })(e, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
var MenuButton = function MenuButton(_ref) {
  var label = _ref.label,
    shortcut = _ref.shortcut,
    _onClick = _ref.onClick,
    theme = _ref.theme;
  return /*#__PURE__*/_react["default"].createElement("button", {
    className: "w-full text-left px-4 py-1.5 flex justify-between items-center transition-colors ".concat(theme === "dark" ? "hover:bg-bg-page" : "hover:bg-bg-page"),
    onClick: function onClick(e) {
      e.stopPropagation();
      _onClick();
    }
  }, /*#__PURE__*/_react["default"].createElement("span", null, label), shortcut && /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-xs opacity-50 font-medium"
  }, shortcut));
};
var MenuDivider = function MenuDivider(_ref2) {
  var theme = _ref2.theme;
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "h-[1px] w-full my-1 ".concat(theme === "dark" ? "bg-border-main" : "bg-border-main")
  });
};
var URLImage = function URLImage(_ref3) {
  var _shapeRef$current, _shapeRef$current2, _shapeRef$current3, _shapeRef$current4;
  var imageObj = _ref3.imageObj,
    isSelected = _ref3.isSelected,
    onSelect = _ref3.onSelect,
    onChange = _ref3.onChange,
    _onDragMove = _ref3.onDragMove,
    _onDragEnd = _ref3.onDragEnd;
  var shapeRef = (0, _react.useRef)();
  var trRef = (0, _react.useRef)();
  var zIndex = imageObj.zIndex,
    restImageObj = _objectWithoutProperties(imageObj, _excluded);
  var _useState = (0, _react.useState)({
      w: 0,
      h: 0
    }),
    _useState2 = _slicedToArray(_useState, 2),
    dims = _useState2[0],
    setDims = _useState2[1];
  var _useState3 = (0, _react.useState)({
      x: imageObj.x,
      y: imageObj.y
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    pos = _useState4[0],
    setPos = _useState4[1];
  (0, _react.useEffect)(function () {
    setPos({
      x: imageObj.x,
      y: imageObj.y
    });
  }, [imageObj.x, imageObj.y]);
  (0, _react.useEffect)(function () {
    if (isSelected && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
      var node = shapeRef.current;
      setDims({
        w: Math.round(node.width() * node.scaleX()),
        h: Math.round(node.height() * node.scaleY())
      });
    }
  }, [isSelected, imageObj.width, imageObj.height, imageObj.scaleX, imageObj.scaleY]);
  var handleTransform = function handleTransform() {
    var node = shapeRef.current;
    if (node) {
      setDims({
        w: Math.round(node.width() * node.scaleX()),
        h: Math.round(node.height() * node.scaleY())
      });
      setPos({
        x: node.x(),
        y: node.y()
      });
    }
  };
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactKonva.Image, _extends({
    opacity: imageObj.hidden ? 0 : 1,
    listening: !imageObj.hidden,
    onClick: function onClick(e) {
      if (!imageObj.locked) onSelect(e);
    },
    onTap: function onTap(e) {
      if (!imageObj.locked) onSelect(e);
    },
    ref: shapeRef
  }, restImageObj, {
    id: imageObj.id,
    name: "konva-item",
    draggable: !imageObj.locked,
    onDragMove: function onDragMove(e) {
      setPos({
        x: e.target.x(),
        y: e.target.y()
      });
      _onDragMove(e);
    },
    onDragEnd: function onDragEnd(e) {
      return _onDragEnd(e, imageObj);
    },
    onTransformEnd: function onTransformEnd(e) {
      var node = shapeRef.current;
      var scaleX = node.scaleX();
      var scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange(_objectSpread(_objectSpread({}, imageObj), {}, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation()
      }));
    }
  })), isSelected && !imageObj.locked && /*#__PURE__*/_react["default"].createElement(_reactKonva.Group, {
    x: pos.x,
    y: pos.y - 24,
    rotation: imageObj.rotation,
    scaleX: 1 / (((_shapeRef$current = shapeRef.current) === null || _shapeRef$current === void 0 || (_shapeRef$current = _shapeRef$current.getStage()) === null || _shapeRef$current === void 0 ? void 0 : _shapeRef$current.scaleX()) || 1),
    scaleY: 1 / (((_shapeRef$current2 = shapeRef.current) === null || _shapeRef$current2 === void 0 || (_shapeRef$current2 = _shapeRef$current2.getStage()) === null || _shapeRef$current2 === void 0 ? void 0 : _shapeRef$current2.scaleY()) || 1)
  }, /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    width: dims.w * (((_shapeRef$current3 = shapeRef.current) === null || _shapeRef$current3 === void 0 || (_shapeRef$current3 = _shapeRef$current3.getStage()) === null || _shapeRef$current3 === void 0 ? void 0 : _shapeRef$current3.scaleX()) || 1),
    height: 20,
    fill: "transparent"
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Text, {
    text: "Image",
    fontSize: 11,
    fontFamily: "sans-serif",
    fill: "#3898ec",
    x: 0,
    y: 5
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Text, {
    text: "".concat(dims.w, " \xD7 ").concat(dims.h),
    fontSize: 11,
    fontFamily: "sans-serif",
    fill: "#3898ec",
    align: "right",
    width: dims.w * (((_shapeRef$current4 = shapeRef.current) === null || _shapeRef$current4 === void 0 || (_shapeRef$current4 = _shapeRef$current4.getStage()) === null || _shapeRef$current4 === void 0 ? void 0 : _shapeRef$current4.scaleX()) || 1),
    x: 0,
    y: 5
  })), isSelected && !imageObj.locked && /*#__PURE__*/_react["default"].createElement(_reactKonva.Transformer, {
    ref: trRef,
    keepRatio: true,
    centeredScaling: true,
    onTransform: handleTransform,
    enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
    anchorSize: 8,
    anchorCornerRadius: 4,
    anchorStroke: "#3898ec",
    anchorFill: "white",
    borderStroke: "#3898ec",
    boundBoxFunc: function boundBoxFunc(oldBox, newBox) {
      if (newBox.width < 5 || newBox.height < 5) {
        return oldBox;
      }
      return newBox;
    }
  }));
};
var URLVideo = function URLVideo(_ref4) {
  var _shapeRef$current6, _shapeRef$current7, _shapeRef$current8;
  var videoObj = _ref4.videoObj,
    isSelected = _ref4.isSelected,
    onSelect = _ref4.onSelect,
    onChange = _ref4.onChange,
    _onDragMove2 = _ref4.onDragMove,
    _onDragEnd2 = _ref4.onDragEnd;
  var shapeRef = (0, _react.useRef)();
  var trRef = (0, _react.useRef)();
  var _useState5 = (0, _react.useState)(null),
    _useState6 = _slicedToArray(_useState5, 2),
    video = _useState6[0],
    setVideo = _useState6[1];
  (0, _react.useEffect)(function () {
    var _shapeRef$current5;
    var videoE = document.createElement("video");
    var tryLoad = function tryLoad(useCors) {
      if (useCors) videoE.crossOrigin = "anonymous";else videoE.removeAttribute("crossOrigin");
      videoE.src = videoObj.src;
      videoE.loop = true;
      videoE.muted = true;
      videoE.playsInline = true;
      videoE.play()["catch"](function () {
        // Silently catch autoplay errors
      });
    };
    videoE.onerror = function () {
      if (videoE.crossOrigin === "anonymous") {
        console.warn("Video CORS failed for", videoObj.src, "retrying without CORS");
        tryLoad(false);
      }
    };
    tryLoad(true);
    setVideo(videoE);
    var layer = (_shapeRef$current5 = shapeRef.current) === null || _shapeRef$current5 === void 0 ? void 0 : _shapeRef$current5.getLayer();
    var anim = new _konva["default"].Animation(function () {
      return true; // Force redraw for video
    }, layer);
    anim.start();
    return function () {
      anim.stop();
      videoE.pause();
      videoE.src = "";
      videoE.onerror = null;
    };
  }, [videoObj.src]);
  var zIndex = videoObj.zIndex,
    restVideoObj = _objectWithoutProperties(videoObj, _excluded2);
  var _useState7 = (0, _react.useState)({
      w: 0,
      h: 0
    }),
    _useState8 = _slicedToArray(_useState7, 2),
    dims = _useState8[0],
    setDims = _useState8[1];
  var _useState9 = (0, _react.useState)({
      x: videoObj.x,
      y: videoObj.y
    }),
    _useState0 = _slicedToArray(_useState9, 2),
    pos = _useState0[0],
    setPos = _useState0[1];
  (0, _react.useEffect)(function () {
    setPos({
      x: videoObj.x,
      y: videoObj.y
    });
  }, [videoObj.x, videoObj.y]);
  (0, _react.useEffect)(function () {
    if (isSelected && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
      var node = shapeRef.current;
      setDims({
        w: Math.round(node.width() * node.scaleX()),
        h: Math.round(node.height() * node.scaleY())
      });
    }
  }, [isSelected, videoObj.width, videoObj.height, videoObj.scaleX, videoObj.scaleY]);
  var handleTransform = function handleTransform() {
    var node = shapeRef.current;
    if (node) {
      setDims({
        w: Math.round(node.width() * node.scaleX()),
        h: Math.round(node.height() * node.scaleY())
      });
      setPos({
        x: node.x(),
        y: node.y()
      });
    }
  };
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactKonva.Image, _extends({
    opacity: videoObj.hidden ? 0 : 1,
    listening: !videoObj.hidden,
    onClick: function onClick(e) {
      if (!videoObj.locked) onSelect(e);
    },
    onTap: function onTap(e) {
      if (!videoObj.locked) onSelect(e);
    },
    ref: shapeRef,
    image: video
  }, restVideoObj, {
    id: videoObj.id,
    name: "konva-item",
    draggable: !videoObj.locked,
    onDragMove: function onDragMove(e) {
      setPos({
        x: e.target.x(),
        y: e.target.y()
      });
      _onDragMove2(e);
    },
    onDragEnd: function onDragEnd(e) {
      return _onDragEnd2(e, videoObj);
    },
    onTransformEnd: function onTransformEnd(e) {
      var node = shapeRef.current;
      var scaleX = node.scaleX();
      var scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange(_objectSpread(_objectSpread({}, videoObj), {}, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation()
      }));
    }
  })), isSelected && !videoObj.locked && /*#__PURE__*/_react["default"].createElement(_reactKonva.Group, {
    x: pos.x,
    y: pos.y - 24,
    rotation: videoObj.rotation,
    scaleX: 1 / (((_shapeRef$current6 = shapeRef.current) === null || _shapeRef$current6 === void 0 || (_shapeRef$current6 = _shapeRef$current6.getStage()) === null || _shapeRef$current6 === void 0 ? void 0 : _shapeRef$current6.scaleX()) || 1),
    scaleY: 1 / (((_shapeRef$current7 = shapeRef.current) === null || _shapeRef$current7 === void 0 || (_shapeRef$current7 = _shapeRef$current7.getStage()) === null || _shapeRef$current7 === void 0 ? void 0 : _shapeRef$current7.scaleY()) || 1)
  }, /*#__PURE__*/_react["default"].createElement(_reactKonva.Text, {
    text: "Video",
    fontSize: 11,
    fontFamily: "sans-serif",
    fill: "#3898ec",
    x: 0,
    y: 5
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Text, {
    text: "".concat(dims.w, " \xD7 ").concat(dims.h),
    fontSize: 11,
    fontFamily: "sans-serif",
    fill: "#3898ec",
    align: "right",
    width: dims.w * (((_shapeRef$current8 = shapeRef.current) === null || _shapeRef$current8 === void 0 || (_shapeRef$current8 = _shapeRef$current8.getStage()) === null || _shapeRef$current8 === void 0 ? void 0 : _shapeRef$current8.scaleX()) || 1),
    x: 0,
    y: 5
  })), isSelected && !videoObj.locked && /*#__PURE__*/_react["default"].createElement(_reactKonva.Transformer, {
    ref: trRef,
    keepRatio: true,
    centeredScaling: true,
    onTransform: handleTransform,
    enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
    anchorSize: 8,
    anchorCornerRadius: 4,
    anchorStroke: "#3898ec",
    anchorFill: "white",
    borderStroke: "#3898ec",
    boundBoxFunc: function boundBoxFunc(oldBox, newBox) {
      if (newBox.width < 5 || newBox.height < 5) {
        return oldBox;
      }
      return newBox;
    }
  }));
};
var URLAudio = function URLAudio(_ref5) {
  var audioObj = _ref5.audioObj,
    isSelected = _ref5.isSelected,
    onSelect = _ref5.onSelect,
    onChange = _ref5.onChange,
    onDragMove = _ref5.onDragMove,
    _onDragEnd3 = _ref5.onDragEnd;
  var shapeRef = (0, _react.useRef)();
  var trRef = (0, _react.useRef)();
  var _useState1 = (0, _react.useState)(false),
    _useState10 = _slicedToArray(_useState1, 2),
    playing = _useState10[0],
    setPlaying = _useState10[1];
  var _useState11 = (0, _react.useState)(0),
    _useState12 = _slicedToArray(_useState11, 2),
    progress = _useState12[0],
    setProgress = _useState12[1];
  var _useState13 = (0, _react.useState)(null),
    _useState14 = _slicedToArray(_useState13, 2),
    audio = _useState14[0],
    setAudio = _useState14[1];
  (0, _react.useEffect)(function () {
    var a = new window.Audio();
    var tryLoad = function tryLoad(useCors) {
      if (useCors) a.crossOrigin = "anonymous";else a.removeAttribute("crossOrigin");
      a.src = audioObj.src;
      a.loop = true;
      a.load();
    };
    var updateProgress = function updateProgress() {
      if (a.duration) setProgress(a.currentTime / a.duration);
    };
    a.onplay = function () {
      return setPlaying(true);
    };
    a.onpause = function () {
      return setPlaying(false);
    };
    a.onended = function () {
      return setPlaying(false);
    };
    a.ontimeupdate = updateProgress;
    a.onerror = function () {
      if (a.crossOrigin === "anonymous") {
        console.warn("Audio CORS failed for", audioObj.src, "retrying without CORS");
        tryLoad(false);
      } else {
        var error = a.error;
        var msg = "Unknown error";
        if (error) {
          if (error.code === 1) msg = "Aborted";else if (error.code === 2) msg = "Network error";else if (error.code === 3) msg = "Decode error";else if (error.code === 4) msg = "Source not supported";
        }
        console.error("Audio failed to load:", msg, audioObj.src);
      }
    };
    tryLoad(true);
    setAudio(a);
    return function () {
      a.pause();
      a.src = "";
      a.onplay = null;
      a.onpause = null;
      a.onended = null;
      a.ontimeupdate = null;
      a.onerror = null;
    };
  }, [audioObj.src]);
  var handleTogglePlay = function handleTogglePlay(e) {
    if (e && e.cancelBubble !== undefined) {
      e.cancelBubble = true;
    }
    onSelect === null || onSelect === void 0 || onSelect();
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play()["catch"](function (err) {
        console.error("Audio playback failed:", err);
        _reactHotToast["default"].error("Playback failed. Please try clicking the play button again.");
      });
    }
  };
  (0, _react.useEffect)(function () {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactKonva.Group, {
    x: audioObj.x,
    y: audioObj.y,
    ref: shapeRef,
    id: audioObj.id,
    name: "konva-item",
    draggable: !audioObj.locked,
    onClick: function onClick(e) {
      onSelect === null || onSelect === void 0 || onSelect();
      if (isSelected && !audioObj.locked) {
        handleTogglePlay(e);
      }
    },
    onTap: function onTap(e) {
      onSelect === null || onSelect === void 0 || onSelect();
      if (isSelected && !audioObj.locked) {
        handleTogglePlay(e);
      }
    },
    onDblClick: handleTogglePlay,
    onDblTap: handleTogglePlay,
    onDragMove: onDragMove,
    onDragEnd: function onDragEnd(e) {
      return _onDragEnd3(e, audioObj);
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    width: 180,
    height: 60,
    fill: playing ? "#3898ec" : "#1E1E1E",
    cornerRadius: 2,
    stroke: "#3898ec",
    strokeWidth: isSelected ? 2 : 1,
    shadowBlur: isSelected ? 10 : 5,
    shadowOpacity: 0.3
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    x: 15,
    y: 15,
    width: 15,
    height: 30,
    fill: "white",
    cornerRadius: 2
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Text, {
    x: 45,
    y: 15,
    text: audioObj.label || "Audio Asset",
    fontSize: 12,
    fontFamily: "sans-serif",
    fontStyle: "bold",
    fill: "white",
    width: 100,
    ellipsis: true
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    x: 45,
    y: 35,
    width: 120,
    height: 4,
    fill: "rgba(255,255,255,0.2)",
    cornerRadius: 2
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    x: 45,
    y: 35,
    width: Math.max(2, 120 * progress),
    height: 4,
    fill: "white",
    cornerRadius: 2
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Group, {
    x: 155,
    y: 22,
    onClick: handleTogglePlay,
    onTap: handleTogglePlay
  }, /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    x: -15,
    y: -15,
    width: 40,
    height: 40,
    fill: "transparent"
  }), playing ? /*#__PURE__*/_react["default"].createElement(_reactKonva.Group, null, /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    width: 4,
    height: 16,
    fill: "white"
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    x: 7,
    width: 4,
    height: 16,
    fill: "white"
  })) : /*#__PURE__*/_react["default"].createElement(_reactKonva.Line, {
    points: [0, 0, 14, 8, 0, 16],
    closed: true,
    fill: "white"
  }))), isSelected && !audioObj.locked && /*#__PURE__*/_react["default"].createElement(_reactKonva.Transformer, {
    ref: trRef,
    resizeEnabled: false,
    rotateEnabled: true
  }));
};
var URLText = function URLText(_ref6) {
  var textObj = _ref6.textObj,
    isSelected = _ref6.isSelected,
    onSelect = _ref6.onSelect,
    onChange = _ref6.onChange,
    onDragMove = _ref6.onDragMove,
    _onDragEnd4 = _ref6.onDragEnd,
    _onDblClick = _ref6.onDblClick;
  var shapeRef = (0, _react.useRef)();
  var trRef = (0, _react.useRef)();
  var zIndex = textObj.zIndex,
    restTextObj = _objectWithoutProperties(textObj, _excluded3);
  (0, _react.useEffect)(function () {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactKonva.Text, _extends({
    opacity: textObj.hidden ? 0 : 1,
    listening: !textObj.hidden,
    onClick: function onClick(e) {
      if (!textObj.locked) onSelect(e);
    },
    onTap: function onTap(e) {
      if (!textObj.locked) onSelect(e);
    },
    ref: shapeRef
  }, restTextObj, {
    id: textObj.id,
    name: "konva-item",
    draggable: !textObj.locked,
    onDragMove: onDragMove,
    onDragEnd: function onDragEnd(e) {
      return _onDragEnd4(e, textObj);
    },
    onDblClick: function onDblClick() {
      if (!textObj.locked) _onDblClick(textObj.id);
    },
    onDblTap: function onDblTap() {
      if (!textObj.locked) _onDblClick(textObj.id);
    },
    onTransformEnd: function onTransformEnd(e) {
      var node = shapeRef.current;
      var scaleX = node.scaleX();
      var scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange(_objectSpread(_objectSpread({}, textObj), {}, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation()
      }));
    }
  })), isSelected && !textObj.locked && /*#__PURE__*/_react["default"].createElement(_reactKonva.Transformer, {
    ref: trRef,
    boundBoxFunc: function boundBoxFunc(oldBox, newBox) {
      if (newBox.width < 5 || newBox.height < 5) return oldBox;
      return newBox;
    },
    enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"]
  }));
};
var LoaderNode = function LoaderNode(_ref7) {
  var task = _ref7.task,
    isSelected = _ref7.isSelected,
    onSelect = _ref7.onSelect,
    onChange = _ref7.onChange,
    theme = _ref7.theme;
  var shapeRef = (0, _react.useRef)();
  var trRef = (0, _react.useRef)();
  var arcRef = (0, _react.useRef)();
  (0, _react.useEffect)(function () {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  (0, _react.useEffect)(function () {
    if (arcRef.current) {
      var anim = new _konva["default"].Animation(function (frame) {
        var angleDiff = frame.timeDiff * 0.36; // roughly 360 degrees per second
        arcRef.current.rotate(angleDiff);
      }, arcRef.current.getLayer());
      anim.start();
      return function () {
        return anim.stop();
      };
    }
  }, []);
  return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactKonva.Group, {
    x: task.x || 0,
    y: task.y || 0,
    draggable: true,
    id: task.taskId,
    onClick: function onClick(e) {
      onSelect(e);
    },
    onTap: function onTap(e) {
      onSelect(e);
    },
    onDragEnd: function onDragEnd(e) {
      onChange(_objectSpread(_objectSpread({}, task), {}, {
        x: e.target.x(),
        y: e.target.y()
      }));
    },
    ref: shapeRef,
    name: "konva-item"
  }, /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    width: 240,
    height: 240,
    fill: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
    cornerRadius: 8,
    stroke: "#3898ec",
    strokeWidth: 1,
    shadowColor: theme === "dark" ? "#ffffff" : "#000000",
    shadowBlur: 10,
    shadowOpacity: 0.2,
    shadowOffsetY: 4
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Text, {
    x: 10,
    y: 45,
    text: task.status === "completed" ? "Rendering...\n\n".concat(task.modelName) : "Generating...\n\n".concat(task.modelName),
    fontSize: 14,
    fontFamily: "sans-serif",
    fontStyle: "bold",
    fill: theme === "dark" ? "#E0E0E0" : "#0F172A",
    width: 220,
    align: "center"
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Text, {
    x: 10,
    y: 110,
    text: "(Move to change spawn location)",
    fontSize: 10,
    fill: "#3898ec",
    width: 220,
    align: "center"
  }), /*#__PURE__*/_react["default"].createElement(_reactKonva.Arc, {
    ref: arcRef,
    x: 120,
    y: 170,
    cornerRadius: 10,
    innerRadius: 20,
    outerRadius: 24,
    angle: 300,
    fill: "#3898ec",
    rotation: 0
  })), isSelected && /*#__PURE__*/_react["default"].createElement(_reactKonva.Transformer, {
    ref: trRef,
    resizeEnabled: false,
    rotateEnabled: false
  }));
};
var CanvasArea = /*#__PURE__*/(0, _react.forwardRef)(function (_ref8, ref) {
  var _contextMenu$nodeId;
  var _ref8$theme = _ref8.theme,
    theme = _ref8$theme === void 0 ? "dark" : _ref8$theme,
    _ref8$colors = _ref8.colors,
    colors = _ref8$colors === void 0 ? {
      textSecondary: "text-text-sub",
      border: "border-border-main"
    } : _ref8$colors,
    _ref8$activeTasks = _ref8.activeTasks,
    activeTasks = _ref8$activeTasks === void 0 ? [] : _ref8$activeTasks,
    _ref8$setActiveTasks = _ref8.setActiveTasks,
    setActiveTasks = _ref8$setActiveTasks === void 0 ? function () {} : _ref8$setActiveTasks,
    onZoomChange = _ref8.onZoomChange;
  var _useState15 = (0, _react.useState)([]),
    _useState16 = _slicedToArray(_useState15, 2),
    images = _useState16[0],
    setImages = _useState16[1];
  var _useState17 = (0, _react.useState)([]),
    _useState18 = _slicedToArray(_useState17, 2),
    videos = _useState18[0],
    setVideos = _useState18[1];
  var _useState19 = (0, _react.useState)([]),
    _useState20 = _slicedToArray(_useState19, 2),
    audios = _useState20[0],
    setAudios = _useState20[1];
  var _useState21 = (0, _react.useState)([]),
    _useState22 = _slicedToArray(_useState21, 2),
    texts = _useState22[0],
    setTexts = _useState22[1];
  var _useState23 = (0, _react.useState)(null),
    _useState24 = _slicedToArray(_useState23, 2),
    selectedId = _useState24[0],
    setSelectedId = _useState24[1];
  var _useState25 = (0, _react.useState)({
      width: 800,
      height: 600
    }),
    _useState26 = _slicedToArray(_useState25, 2),
    canvasSize = _useState26[0],
    setCanvasSize = _useState26[1];
  var _useState27 = (0, _react.useState)(1),
    _useState28 = _slicedToArray(_useState27, 2),
    zoom = _useState28[0],
    setZoom = _useState28[1];
  var _useState29 = (0, _react.useState)(null),
    _useState30 = _slicedToArray(_useState29, 2),
    editingTextId = _useState30[0],
    setEditingTextId = _useState30[1];
  var _useState31 = (0, _react.useState)(null),
    _useState32 = _slicedToArray(_useState31, 2),
    contextMenu = _useState32[0],
    setContextMenu = _useState32[1];
  var _useState33 = (0, _react.useState)(null),
    _useState34 = _slicedToArray(_useState33, 2),
    clipboardNode = _useState34[0],
    setClipboardNode = _useState34[1];
  var _useState35 = (0, _react.useState)([]),
    _useState36 = _slicedToArray(_useState35, 2),
    guides = _useState36[0],
    setGuides = _useState36[1];
  var stageWrapperRef = (0, _react.useRef)();
  var stageRef = (0, _react.useRef)();
  var containerRef = (0, _react.useRef)();
  var updateZoom = function updateZoom(newZoom) {
    var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    if (!newZoom || isNaN(newZoom)) return;
    setZoom(newZoom);
    onZoomChange === null || onZoomChange === void 0 || onZoomChange(Math.round(newZoom * 100));
    if (stageRef.current && typeof stageRef.current.scale === "function") {
      stageRef.current.scale({
        x: newZoom,
        y: newZoom
      });
      if (pos && typeof stageRef.current.position === "function") {
        stageRef.current.position(pos);
      }
      if (typeof stageRef.current.batchDraw === "function") {
        stageRef.current.batchDraw();
      }
    }
    if (containerRef.current) {
      containerRef.current.style.backgroundSize = "".concat(32 * newZoom, "px ").concat(32 * newZoom, "px");
      if (pos) {
        containerRef.current.style.backgroundPosition = "".concat(pos.x, "px ").concat(pos.y, "px");
      }
    }
  };
  var handleZoomToFit = function handleZoomToFit() {
    if (images.length === 0 && videos.length === 0 && texts.length === 0 && audios.length === 0) {
      updateZoom(1, {
        x: 0,
        y: 0
      });
      return;
    }
    var minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    var checkItem = function checkItem(item) {
      minX = Math.min(minX, item.x);
      minY = Math.min(minY, item.y);
      maxX = Math.max(maxX, item.x + (item.width || 150));
      maxY = Math.max(maxY, item.y + (item.height || 50));
    };
    images.forEach(checkItem);
    videos.forEach(checkItem);
    audios.forEach(checkItem);
    texts.forEach(checkItem);
    var padding = 60;
    var contentWidth = maxX - minX;
    var contentHeight = maxY - minY;
    if (contentWidth <= 0 || contentHeight <= 0) {
      updateZoom(1, {
        x: 0,
        y: 0
      });
      return;
    }
    var scaleX = (canvasSize.width - padding * 2) / contentWidth;
    var scaleY = (canvasSize.height - padding * 2) / contentHeight;
    var newZoom = Math.min(5, Math.max(0.1, Math.min(scaleX, scaleY)));
    var newPos = {
      x: canvasSize.width / 2 - (minX + contentWidth / 2) * newZoom,
      y: canvasSize.height / 2 - (minY + contentHeight / 2) * newZoom
    };
    updateZoom(newZoom, newPos);
  };
  var handleExport = function handleExport(format) {
    if (!(contextMenu !== null && contextMenu !== void 0 && contextMenu.nodeId)) return;
    var id = contextMenu.nodeId;
    var node = stageRef.current.findOne("#" + id);
    if (node) {
      try {
        var dataURL = node.toDataURL({
          pixelRatio: 3,
          mimeType: format === "JPG" ? "image/jpeg" : format === "SVG" ? "image/svg+xml" : "image/png"
        });
        var link = document.createElement("a");
        link.download = "export-".concat(id, ".").concat(format.toLowerCase());
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Export failed:", err);
        _reactHotToast["default"].error("Export failed: This image might be from an external source without CORS permission.");
      }
    }
    setContextMenu(null);
  };
  var handleDownload = /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var id, item, response, blob, url, link, extension, fileName, _link, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            id = (contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.nodeId) || selectedId;
            if (id) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            item = [].concat(_toConsumableArray(images), _toConsumableArray(videos), _toConsumableArray(audios)).find(function (i) {
              return i.id === id;
            });
            if (!(item && item.src)) {
              _context.n = 7;
              break;
            }
            _context.p = 2;
            _reactHotToast["default"].loading("Preparing download...", {
              id: "download"
            });
            _context.n = 3;
            return fetch(item.src);
          case 3:
            response = _context.v;
            _context.n = 4;
            return response.blob();
          case 4:
            blob = _context.v;
            url = window.URL.createObjectURL(blob);
            link = document.createElement("a");
            link.href = url;
            extension = item.src.split("?")[0].split(".").pop() || "";
            fileName = item.label || item.assetLabel || "asset-".concat(id.substring(0, 8));
            link.download = extension ? "".concat(fileName, ".").concat(extension) : fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            _reactHotToast["default"].success("Download started", {
              id: "download"
            });
            _context.n = 6;
            break;
          case 5:
            _context.p = 5;
            _t = _context.v;
            console.error("Download failed:", _t);
            _reactHotToast["default"].error("Download failed. CORS might be blocking direct download.", {
              id: "download"
            });
            // Fallback to old method if fetch fails
            _link = document.createElement("a");
            _link.href = item.src;
            _link.target = "_blank";
            _link.download = "";
            _link.click();
          case 6:
            _context.n = 8;
            break;
          case 7:
            _reactHotToast["default"].error("Source URL not found");
          case 8:
            setContextMenu(null);
          case 9:
            return _context.a(2);
        }
      }, _callee, null, [[2, 5]]);
    }));
    return function handleDownload() {
      return _ref9.apply(this, arguments);
    };
  }();
  var handleShowAllHidden = function handleShowAllHidden() {
    setImages(function (prev) {
      return prev.map(function (i) {
        return _objectSpread(_objectSpread({}, i), {}, {
          hidden: false
        });
      });
    });
    setVideos(function (prev) {
      return prev.map(function (v) {
        return _objectSpread(_objectSpread({}, v), {}, {
          hidden: false
        });
      });
    });
    setAudios(function (prev) {
      return prev.map(function (a) {
        return _objectSpread(_objectSpread({}, a), {}, {
          hidden: false
        });
      });
    });
    setTexts(function (prev) {
      return prev.map(function (t) {
        return _objectSpread(_objectSpread({}, t), {}, {
          hidden: false
        });
      });
    });
    _reactHotToast["default"].success("All items are now visible");
    setContextMenu(null);
  };
  var handleClearCanvas = function handleClearCanvas() {
    if (window.confirm("Are you sure you want to clear the entire canvas?")) {
      setImages([]);
      setVideos([]);
      setAudios([]);
      setTexts([]);
      setSelectedId(null);
      _reactHotToast["default"].success("Canvas cleared");
    }
    setContextMenu(null);
  };
  var handleExportCanvas = function handleExportCanvas() {
    if (!stageRef.current) return;
    try {
      var dataURL = stageRef.current.toDataURL({
        pixelRatio: 2
      });
      var link = document.createElement("a");
      link.download = "canvas-export-".concat(Date.now(), ".png");
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Canvas export failed:", err);
      _reactHotToast["default"].error("Canvas export failed: One or more images on the canvas are from an external source without CORS permission.");
    }
    setContextMenu(null);
  };
  var addImage = function addImage(src, x, y, width, height, onLoaded, assetLabel) {
    if (!src) return;
    var stage = stageRef.current;
    if (!stage) {
      console.error("CanvasArea: stageRef.current is null in addImage");
      return;
    }
    var targetX = x !== undefined ? x : (-stage.x() + ((canvasSize === null || canvasSize === void 0 ? void 0 : canvasSize.width) || 800) / 2) / zoom - 100;
    var targetY = y !== undefined ? y : (-stage.y() + ((canvasSize === null || canvasSize === void 0 ? void 0 : canvasSize.height) || 600) / 2) / zoom - 100;
    var id = "img-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    var img = new window.Image();
    img.crossOrigin = "anonymous";
    var commitImage = function commitImage(loadedImg) {
      var finalWidth = width;
      var finalHeight = height;
      if (!finalWidth && !finalHeight && loadedImg.width) {
        var maxDim = 400;
        if (loadedImg.width > loadedImg.height) {
          finalWidth = maxDim;
          finalHeight = loadedImg.height / loadedImg.width * maxDim;
        } else {
          finalHeight = maxDim;
          finalWidth = loadedImg.width / loadedImg.height * maxDim;
        }
      }
      setImages(function (prev) {
        return [].concat(_toConsumableArray(prev), [{
          id: id,
          assetLabel: assetLabel || null,
          src: src,
          x: targetX,
          y: targetY,
          image: loadedImg,
          width: finalWidth / 2 || 200,
          height: finalHeight / 2 || 200,
          rotation: 0
        }]);
      });
      setSelectedId(id);
      if (typeof onLoaded === "function") onLoaded();
    };
    img.onload = function () {
      commitImage(img);
    };
    img.onerror = function () {
      if (img.crossOrigin === "anonymous") {
        img.removeAttribute("crossOrigin");
        img.src = src;
      } else {
        console.error("Failed to load image after retry:", src);
        // Add it anyway so it shows up in the layers list / has a presence
        commitImage(img);
      }
    };
    img.src = src;
  };
  var addVideo = function addVideo(src, x, y, width, height, onLoaded, assetLabel) {
    if (!src) return;
    var stage = stageRef.current;
    if (!stage) {
      console.error("CanvasArea: stageRef.current is null in addVideo");
      return;
    }
    var targetX = x !== undefined ? x : (-stage.x() + ((canvasSize === null || canvasSize === void 0 ? void 0 : canvasSize.width) || 800) / 2) / zoom - 150;
    var targetY = y !== undefined ? y : (-stage.y() + ((canvasSize === null || canvasSize === void 0 ? void 0 : canvasSize.height) || 600) / 2) / zoom - 100;
    var id = "vid-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    var _tryLoad = function tryLoad(useCors) {
      var video = document.createElement("video");
      if (useCors) video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      var settled = false;
      var commitVideo = function commitVideo(v) {
        var finalWidth = width;
        var finalHeight = height;
        var vW = v.videoWidth;
        var vH = v.videoHeight;
        if (vW && vH) {
          if (!finalWidth && !finalHeight) {
            var maxDim = 400;
            if (vW > vH) {
              finalWidth = maxDim;
              finalHeight = vH / vW * maxDim;
            } else {
              finalHeight = maxDim;
              finalWidth = vW / vH * maxDim;
            }
          }
        }
        setVideos(function (prev) {
          return [].concat(_toConsumableArray(prev), [{
            id: id,
            assetLabel: assetLabel || null,
            src: src,
            x: targetX,
            y: targetY,
            width: finalWidth / 2 || 300,
            height: finalHeight / 2 || 200,
            rotation: 0
          }]);
        });
        setSelectedId(id);
        v.play()["catch"](function () {
          var _playOnInteract = function playOnInteract() {
            v.play();
            window.removeEventListener("click", _playOnInteract);
          };
          window.addEventListener("click", _playOnInteract);
        });
        if (typeof onLoaded === "function") onLoaded();
      };
      var handleVideoReady = function handleVideoReady() {
        if (settled) return;
        settled = true;
        clearTimeout(fallbackTimer);
        commitVideo(video);
      };
      video.addEventListener("loadedmetadata", handleVideoReady, {
        once: true
      });
      video.addEventListener("canplay", handleVideoReady, {
        once: true
      });
      video.addEventListener("error", function () {
        if (settled) return;
        settled = true;
        clearTimeout(fallbackTimer);
        if (useCors) {
          console.warn("CORS issue with video, retrying without crossOrigin:", src);
          _tryLoad(false);
        } else {
          console.error("Failed to load video after retry:", src);
          commitVideo(video);
        }
      }, {
        once: true
      });
      var fallbackTimer = setTimeout(function () {
        if (settled) return;
        settled = true;
        if (useCors) _tryLoad(false);else commitVideo(video);
      }, 10000);
      video.src = src;
      video.load();
    };
    _tryLoad(true);
  };
  var addAudio = function addAudio(src, x, y, label, assetLabel) {
    console.log("audio url", src);
    if (!src) return;
    var stage = stageRef.current;
    if (!stage) {
      console.error("CanvasArea: stageRef.current is null in addAudio");
      return;
    }
    var targetX = x !== undefined ? x : (-stage.x() + ((canvasSize === null || canvasSize === void 0 ? void 0 : canvasSize.width) || 800) / 2) / zoom - 90;
    var targetY = y !== undefined ? y : (-stage.y() + ((canvasSize === null || canvasSize === void 0 ? void 0 : canvasSize.height) || 600) / 2) / zoom - 30;
    var id = "aud-".concat(Date.now());
    setAudios(function (prev) {
      return [].concat(_toConsumableArray(prev), [{
        id: id,
        assetLabel: assetLabel || null,
        src: src,
        x: targetX,
        y: targetY,
        label: label || "Audio Asset",
        rotation: 0
      }]);
    });
    setSelectedId(id);
  };
  var addNewText = function addNewText(text, x, y) {
    var stage = stageRef.current;
    var targetX = x !== undefined ? x : (-stage.x() + canvasSize.width / 2) / zoom - 50;
    var targetY = y !== undefined ? y : (-stage.y() + canvasSize.height / 2) / zoom - 12;
    var id = "txt-".concat(Date.now());
    setTexts(function (prev) {
      return [].concat(_toConsumableArray(prev), [{
        id: id,
        text: text || "Double-click to Edit",
        fontSize: 24,
        x: targetX,
        y: targetY,
        draggable: true,
        fill: theme === "dark" ? "white" : "black",
        rotation: 0
      }]);
    });
    setSelectedId(id);
  };

  // Snapshot the canvas in the shape the agent expects (see SYSTEM_PROMPT).
  // Coordinates are in canvas (pre-zoom) space, origin top-left.
  var getCanvasState = function getCanvasState() {
    var stage = stageRef.current;
    var nodes = [];
    var push = function push(n, kind) {
      if (!n.assetLabel) return; // only assets the agent knows about
      nodes.push({
        asset_id: n.assetLabel,
        kind: kind,
        x: Math.round(n.x),
        y: Math.round(n.y),
        w: Math.round(n.width || 200),
        h: Math.round(n.height || (kind === "audio" ? 60 : 200)),
        z: n.zIndex || 0,
        locked: !!n.locked
      });
    };
    images.forEach(function (n) {
      return push(n, "image");
    });
    videos.forEach(function (n) {
      return push(n, "video");
    });
    audios.forEach(function (n) {
      return push(n, "audio");
    });
    var selectedNode = [].concat(_toConsumableArray(images), _toConsumableArray(videos), _toConsumableArray(audios), _toConsumableArray(texts)).find(function (n) {
      return n.id === selectedId;
    });
    return {
      viewport: {
        w: canvasSize.width,
        h: canvasSize.height,
        zoom: zoom,
        pan: stage ? [Math.round(stage.x()), Math.round(stage.y())] : [0, 0]
      },
      selected: (selectedNode === null || selectedNode === void 0 ? void 0 : selectedNode.assetLabel) || null,
      nodes: nodes
    };
  };

  // Move a node by asset_label using functional setters so it works without
  // fresh state in the closure.
  var moveNode = function moveNode(assetLabel, x, y) {
    var patch = function patch(arr) {
      return arr.map(function (n) {
        return n.assetLabel === assetLabel ? _objectSpread(_objectSpread({}, n), {}, {
          x: x,
          y: y
        }) : n;
      });
    };
    setImages(patch);
    setVideos(patch);
    setAudios(patch);
  };

  // Place a derived asset BESIDE its source on the canvas, preserving the
  // source so the user can compare or branch from it. Layout: source stays
  // at (sx, sy); new asset lands at (sx + sw + 32, sy) with the source's
  // size as a hint. If the source isn't on canvas (URL input, etc.),
  // falls back to default centre placement.
  var placeNextToSource = function placeNextToSource(sourceLabel, newUrl, newKind, newAssetLabel) {
    var frame = null;
    var findIn = function findIn(arr) {
      return arr.find(function (n) {
        return n.assetLabel === sourceLabel;
      });
    };
    frame = findIn(images) || findIn(videos) || findIn(audios);
    if (!frame) {
      if (newKind === "video") addVideo(newUrl, undefined, undefined, undefined, undefined, undefined, newAssetLabel);else if (newKind === "audio") addAudio(newUrl, undefined, undefined, undefined, newAssetLabel);else addImage(newUrl, undefined, undefined, undefined, undefined, undefined, newAssetLabel);
      return;
    }
    var sw = frame.width || 200;
    var sh = frame.height || 200;
    var x = frame.x + sw + 32; // 32px gap to the right of source
    var y = frame.y;
    if (newKind === "video") {
      addVideo(newUrl, x, y, sw, sh, undefined, newAssetLabel);
    } else if (newKind === "audio") {
      addAudio(newUrl, x, y, undefined, newAssetLabel);
    } else {
      addImage(newUrl, x, y, sw, sh, undefined, newAssetLabel);
    }
  };

  // Apply an arrange_assets payload from the agent ([{asset_id, x, y}, ...]).
  var arrangeNodes = function arrangeNodes(moves) {
    if (!Array.isArray(moves) || moves.length === 0) return 0;
    var byLabel = new Map(moves.map(function (m) {
      return [m.asset_id, m];
    }));
    var patch = function patch(arr) {
      return arr.map(function (n) {
        var m = n.assetLabel ? byLabel.get(n.assetLabel) : null;
        return m ? _objectSpread(_objectSpread({}, n), {}, {
          x: m.x,
          y: m.y
        }) : n;
      });
    };
    setImages(patch);
    setVideos(patch);
    setAudios(patch);
    return moves.length;
  };
  (0, _react.useImperativeHandle)(ref, function () {
    return {
      addImage: addImage,
      addVideo: addVideo,
      addAudio: addAudio,
      getCanvasState: getCanvasState,
      moveNode: moveNode,
      placeNextToSource: placeNextToSource,
      // Back-compat alias — earlier code referenced replaceAt before we
      // switched to non-destructive side-by-side placement.
      replaceAt: placeNextToSource,
      arrangeNodes: arrangeNodes,
      zoomIn: function zoomIn() {
        return updateZoom(Math.min(5, zoom + 0.1));
      },
      zoomOut: function zoomOut() {
        return updateZoom(Math.max(0.1, zoom - 0.1));
      },
      resetZoom: function resetZoom() {
        return updateZoom(1);
      }
    };
  },
  // Recompute when state read by getCanvasState changes so the snapshot
  // is always current.
  [images, videos, audios, texts, selectedId, canvasSize, zoom]);

  // Global Paste & Keyboard listeners
  (0, _react.useEffect)(function () {
    var handlePasteAction = function handlePasteAction(e) {
      var _e$clipboardData;
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
      var items = (_e$clipboardData = e.clipboardData) === null || _e$clipboardData === void 0 ? void 0 : _e$clipboardData.items;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          var file = items[i].getAsFile();
          var reader = new FileReader();
          reader.onload = function (event) {
            return addImage(event.target.result);
          };
          reader.readAsDataURL(file);
        } else if (items[i].type === "text/plain") {
          e.preventDefault();
          items[i].getAsString(function (text) {
            if (text.trim()) addNewText(text);
          });
        }
      }
    };
    window.addEventListener("paste", handlePasteAction);
    return function () {
      return window.removeEventListener("paste", handlePasteAction);
    };
  }, [zoom, canvasSize]);

  // Handle tasks spawning
  (0, _react.useEffect)(function () {
    if (!activeTasks || activeTasks.length === 0) return;
    var tasksNeedingPosition = activeTasks.filter(function (t) {
      return t.x === undefined && t.y === undefined;
    });
    if (tasksNeedingPosition.length > 0) {
      setActiveTasks(function (prev) {
        var next = _toConsumableArray(prev);
        var changed = false;
        next.forEach(function (t, i) {
          if (t.x === undefined && t.y === undefined) {
            var stage = stageRef.current;
            t.x = stage ? (-stage.x() + canvasSize.width / 2) / zoom - 120 + i * 20 : 100 + i * 20;
            t.y = stage ? (-stage.y() + canvasSize.height / 2) / zoom - 60 + i * 20 : 100 + i * 20;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
    var completedUnadded = activeTasks.filter(function (t) {
      return t.status === "completed" && t.resultUrl && !t.addedToCanvas;
    });
    if (completedUnadded.length > 0) {
      completedUnadded.forEach(function (task) {
        setActiveTasks(function (prev) {
          return prev.map(function (t) {
            return t.taskId === task.taskId ? _objectSpread(_objectSpread({}, t), {}, {
              addedToCanvas: true
            }) : t;
          });
        });
        var items = task.resultUrl.rawOutputs || task.resultUrl.examples || [];
        if (items.length > 0) {
          var loadedCount = 0;
          var handleItemLoaded = function handleItemLoaded() {
            loadedCount++;
            if (loadedCount === items.length) {
              setActiveTasks(function (prev) {
                return prev.map(function (t) {
                  return t.taskId === task.taskId ? _objectSpread(_objectSpread({}, t), {}, {
                    fullyMounted: true
                  }) : t;
                });
              });
            }
          };
          items.forEach(function (output, oIndex) {
            var _output$type;
            var x = task.x !== undefined ? task.x + oIndex * 20 : 100;
            var y = task.y !== undefined ? task.y + oIndex * 20 : 100;
            var val = typeof output === "string" ? output : output.value || output.url || output.image_url;
            var type = _typeof(output) === "object" ? (_output$type = output.type) === null || _output$type === void 0 ? void 0 : _output$type.toLowerCase() : null;
            if (val) {
              if (type && type.startsWith("text")) {
                addNewText(val, x, y);
                handleItemLoaded();
              } else if (type && type.startsWith("video")) {
                addVideo(val, x, y, undefined, undefined, handleItemLoaded);
              } else if (type && type.startsWith("audio")) {
                addAudio(val, x, y, task.assetLabel);
                handleItemLoaded();
              } else {
                addImage(val, x, y, undefined, undefined, handleItemLoaded);
              }
            } else handleItemLoaded();
          });
        } else {
          setActiveTasks(function (prev) {
            return prev.map(function (t) {
              return t.taskId === task.taskId ? _objectSpread(_objectSpread({}, t), {}, {
                fullyMounted: true
              }) : t;
            });
          });
        }
      });
    }
  }, [activeTasks, zoom, canvasSize]);

  // Context Menu Helpers
  var getActiveNode = function getActiveNode(id) {
    return images.find(function (i) {
      return i.id === id;
    }) || videos.find(function (v) {
      return v.id === id;
    }) || audios.find(function (a) {
      return a.id === id;
    }) || texts.find(function (t) {
      return t.id === id;
    });
  };
  var handleCopy = function handleCopy() {
    var id = (contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.nodeId) || selectedId;
    if (id) setClipboardNode(getActiveNode(id));
    setContextMenu(null);
  };
  var handleCut = function handleCut() {
    var id = (contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.nodeId) || selectedId;
    if (id) {
      setClipboardNode(getActiveNode(id));
      setImages(images.filter(function (img) {
        return img.id !== id;
      }));
      setVideos(videos.filter(function (vid) {
        return vid.id !== id;
      }));
      setAudios(audios.filter(function (aud) {
        return aud.id !== id;
      }));
      setTexts(texts.filter(function (txt) {
        return txt.id !== id;
      }));
      if (selectedId === id) setSelectedId(null);
    }
    setContextMenu(null);
  };
  var handleDuplicate = function handleDuplicate() {
    var id = (contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.nodeId) || selectedId;
    if (id) {
      var node = getActiveNode(id);
      if (node) {
        var newNode = _objectSpread(_objectSpread({}, node), {}, {
          id: "".concat(node.id.split("-")[0], "-").concat(Date.now()),
          x: node.x + 20,
          y: node.y + 20
        });
        if (newNode.id.startsWith("img")) setImages(function (prev) {
          return [].concat(_toConsumableArray(prev), [newNode]);
        });
        if (newNode.id.startsWith("vid")) setVideos(function (prev) {
          return [].concat(_toConsumableArray(prev), [newNode]);
        });
        if (newNode.id.startsWith("aud")) setAudios(function (prev) {
          return [].concat(_toConsumableArray(prev), [newNode]);
        });
        if (newNode.id.startsWith("txt")) setTexts(function (prev) {
          return [].concat(_toConsumableArray(prev), [newNode]);
        });
      }
    }
    setContextMenu(null);
  };
  var handlePasteNode = /*#__PURE__*/function () {
    var _ref0 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var stage, pastePos, x, y, items, foundSomething, _iterator, _step, item, _iterator2, _step2, type, blob, reader, _blob, text, newNode, _t2, _t3, _t4;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            stage = stageRef.current;
            if (stage) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            pastePos = contextMenu ? contextMenu.stagePos : null;
            if (pastePos) {
              x = (pastePos.x - stage.x()) / zoom;
              y = (pastePos.y - stage.y()) / zoom;
            } else {
              x = (-stage.x() + canvasSize.width / 2) / zoom;
              y = (-stage.y() + canvasSize.height / 2) / zoom;
            }
            _context2.p = 2;
            _context2.n = 3;
            return navigator.clipboard.read();
          case 3:
            items = _context2.v;
            foundSomething = false;
            _iterator = _createForOfIteratorHelper(items);
            _context2.p = 4;
            _iterator.s();
          case 5:
            if ((_step = _iterator.n()).done) {
              _context2.n = 17;
              break;
            }
            item = _step.value;
            _iterator2 = _createForOfIteratorHelper(item.types);
            _context2.p = 6;
            _iterator2.s();
          case 7:
            if ((_step2 = _iterator2.n()).done) {
              _context2.n = 13;
              break;
            }
            type = _step2.value;
            if (!type.startsWith("image/")) {
              _context2.n = 9;
              break;
            }
            _context2.n = 8;
            return item.getType(type);
          case 8:
            blob = _context2.v;
            reader = new FileReader();
            reader.onload = function (e) {
              return addImage(e.target.result, x - 50, y - 50);
            };
            reader.readAsDataURL(blob);
            foundSomething = true;
            _context2.n = 12;
            break;
          case 9:
            if (!(type === "text/plain")) {
              _context2.n = 12;
              break;
            }
            _context2.n = 10;
            return item.getType(type);
          case 10:
            _blob = _context2.v;
            _context2.n = 11;
            return _blob.text();
          case 11:
            text = _context2.v;
            if (text.trim()) {
              addNewText(text, x, y);
              foundSomething = true;
            }
          case 12:
            _context2.n = 7;
            break;
          case 13:
            _context2.n = 15;
            break;
          case 14:
            _context2.p = 14;
            _t2 = _context2.v;
            _iterator2.e(_t2);
          case 15:
            _context2.p = 15;
            _iterator2.f();
            return _context2.f(15);
          case 16:
            _context2.n = 5;
            break;
          case 17:
            _context2.n = 19;
            break;
          case 18:
            _context2.p = 18;
            _t3 = _context2.v;
            _iterator.e(_t3);
          case 19:
            _context2.p = 19;
            _iterator.f();
            return _context2.f(19);
          case 20:
            if (!foundSomething) {
              _context2.n = 21;
              break;
            }
            setContextMenu(null);
            return _context2.a(2);
          case 21:
            _context2.n = 23;
            break;
          case 22:
            _context2.p = 22;
            _t4 = _context2.v;
          case 23:
            if (clipboardNode) {
              newNode = _objectSpread(_objectSpread({}, clipboardNode), {}, {
                id: "".concat(clipboardNode.id.split("-")[0], "-").concat(Date.now())
              });
              newNode.x = x - (newNode.width || 0) / 2;
              newNode.y = y - (newNode.height || 0) / 2;
              if (newNode.id.startsWith("img")) setImages(function (prev) {
                return [].concat(_toConsumableArray(prev), [newNode]);
              });else if (newNode.id.startsWith("vid")) setVideos(function (prev) {
                return [].concat(_toConsumableArray(prev), [newNode]);
              });else if (newNode.id.startsWith("aud")) setAudios(function (prev) {
                return [].concat(_toConsumableArray(prev), [newNode]);
              });else if (newNode.id.startsWith("txt")) setTexts(function (prev) {
                return [].concat(_toConsumableArray(prev), [newNode]);
              });
            }
            setContextMenu(null);
          case 24:
            return _context2.a(2);
        }
      }, _callee2, null, [[6, 14, 15, 16], [4, 18, 19, 20], [2, 22]]);
    }));
    return function handlePasteNode() {
      return _ref0.apply(this, arguments);
    };
  }();
  var handleZIndex = function handleZIndex(action) {
    var id = (contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.nodeId) || selectedId;
    if (!id) return;
    var allItems = [].concat(_toConsumableArray(images), _toConsumableArray(videos), _toConsumableArray(audios), _toConsumableArray(texts)).sort(function (a, b) {
      return (a.zIndex || 0) - (b.zIndex || 0);
    });
    var idxInAll = allItems.findIndex(function (i) {
      return i.id === id;
    });
    if (idxInAll === -1) return;
    var allZ = allItems.map(function (i) {
      return i.zIndex || 0;
    });
    var maxZ = Math.max.apply(Math, _toConsumableArray(allZ).concat([0]));
    var minZ = Math.min.apply(Math, _toConsumableArray(allZ).concat([0]));
    var updateItem = function updateItem(arr, setter) {
      var idx = arr.findIndex(function (i) {
        return i.id === id;
      });
      if (idx !== -1) {
        var item = _objectSpread({}, arr[idx]);
        if (action === "front") item.zIndex = maxZ + 1;else if (action === "back") item.zIndex = Math.max(0, minZ - 1);else if (action === "up") item.zIndex = idxInAll < allItems.length - 1 ? (allItems[idxInAll + 1].zIndex || 0) + 1 : maxZ + 1;else if (action === "down") item.zIndex = idxInAll > 0 ? (allItems[idxInAll - 1].zIndex || 0) - 1 : Math.max(0, minZ - 1);
        var newArr = _toConsumableArray(arr);
        newArr[idx] = item;
        setter(newArr);
      }
    };
    updateItem(images, setImages);
    updateItem(videos, setVideos);
    updateItem(audios, setAudios);
    updateItem(texts, setTexts);
    setContextMenu(null);
  };
  var handleToggleState = function handleToggleState(field) {
    var id = (contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.nodeId) || selectedId;
    if (!id) return;
    var updateItem = function updateItem(arr, setter) {
      var idx = arr.findIndex(function (i) {
        return i.id === id;
      });
      if (idx !== -1) {
        var newArr = _toConsumableArray(arr);
        newArr[idx] = _objectSpread(_objectSpread({}, newArr[idx]), {}, _defineProperty({}, field, !newArr[idx][field]));
        setter(newArr);
        if (field === "locked" && newArr[idx].locked) setSelectedId(null);
      }
    };
    updateItem(images, setImages);
    updateItem(videos, setVideos);
    updateItem(audios, setAudios);
    updateItem(texts, setTexts);
    setContextMenu(null);
  };
  var handleFlip = function handleFlip(direction) {
    var id = (contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.nodeId) || selectedId;
    if (!id) return;
    var updateItem = function updateItem(arr, setter) {
      var idx = arr.findIndex(function (i) {
        return i.id === id;
      });
      if (idx !== -1) {
        var item = _objectSpread({}, arr[idx]);
        if (direction === "horizontal") {
          item.scaleX = (item.scaleX || 1) * -1;
          item.offsetX = item.scaleX === -1 ? item.width || 0 : 0;
        } else {
          item.scaleY = (item.scaleY || 1) * -1;
          item.offsetY = item.scaleY === -1 ? item.height || 0 : 0;
        }
        var newArr = _toConsumableArray(arr);
        newArr[idx] = item;
        setter(newArr);
      }
    };
    updateItem(images, setImages);
    updateItem(videos, setVideos);
    updateItem(audios, setAudios);
    updateItem(texts, setTexts);
    setContextMenu(null);
  };
  var handleDelete = function handleDelete() {
    var id = (contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.nodeId) || selectedId;
    if (id) {
      setImages(images.filter(function (img) {
        return img.id !== id;
      }));
      setVideos(videos.filter(function (vid) {
        return vid.id !== id;
      }));
      setAudios(audios.filter(function (aud) {
        return aud.id !== id;
      }));
      setTexts(texts.filter(function (txt) {
        return txt.id !== id;
      }));
      if (selectedId === id) setSelectedId(null);
    }
    setContextMenu(null);
  };

  // Resize Observer for Stage
  (0, _react.useEffect)(function () {
    if (!stageWrapperRef.current) return;
    var resizeObserver = new ResizeObserver(function (entries) {
      var _iterator3 = _createForOfIteratorHelper(entries),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var entry = _step3.value;
          var _entry$contentRect = entry.contentRect,
            width = _entry$contentRect.width,
            height = _entry$contentRect.height;
          if (width > 0 && height > 0) {
            setCanvasSize({
              width: width,
              height: height
            });
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    });
    resizeObserver.observe(stageWrapperRef.current);
    return function () {
      return resizeObserver.disconnect();
    };
  }, []);

  // Keyboard Shortcuts
  (0, _react.useEffect)(function () {
    var handleKeyDown = function handleKeyDown(e) {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          updateZoom(Math.min(5, zoom + 0.1));
        } else if (e.key === "-") {
          e.preventDefault();
          updateZoom(Math.max(0.1, zoom - 0.1));
        } else if (e.key === "0") {
          e.preventDefault();
          updateZoom(1);
        } else if (e.key === "c") handleCopy();else if (e.key === "x") handleCut();else if (e.key === "v") handlePasteNode();else if (e.key === "d") {
          e.preventDefault();
          handleDuplicate();
        } else if (e.key === "]") {
          e.preventDefault();
          handleZIndex("up");
        } else if (e.key === "[") {
          e.preventDefault();
          handleZIndex("down");
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "]") {
        if (selectedId) handleZIndex("front");
      } else if (e.key === "[") {
        if (selectedId) handleZIndex("back");
      } else if (e.shiftKey && (e.key === "!" || e.key === "1")) {
        e.preventDefault();
        handleZoomToFit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return function () {
      return window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoom, images, videos, texts, selectedId, clipboardNode]);

  // Snapping Guides
  var getLineGuide = function getLineGuide(node) {
    var stage = node.getStage();
    var layer = node.getLayer();
    var box = node.getClientRect({
      relativeTo: layer
    });
    var result = {
      vertical: [],
      horizontal: []
    };
    var otherNodes = stage.find(".konva-item").filter(function (n) {
      return n !== node;
    });
    var GUIDELINE_OFFSET = 5 / zoom;
    otherNodes.forEach(function (otherNode) {
      var oBox = otherNode.getClientRect({
        relativeTo: layer
      });
      var nodeEdges = [{
        guide: box.x,
        offset: box.x - node.x(),
        orientation: "v"
      }, {
        guide: box.x + box.width / 2,
        offset: box.x + box.width / 2 - node.x(),
        orientation: "v"
      }, {
        guide: box.x + box.width,
        offset: box.x + box.width - node.x(),
        orientation: "v"
      }, {
        guide: box.y,
        offset: box.y - node.y(),
        orientation: "h"
      }, {
        guide: box.y + box.height / 2,
        offset: box.y + box.height / 2 - node.y(),
        orientation: "h"
      }, {
        guide: box.y + box.height,
        offset: box.y + box.height - node.y(),
        orientation: "h"
      }];
      var otherEdges = [{
        guide: oBox.x,
        orientation: "v"
      }, {
        guide: oBox.x + oBox.width / 2,
        orientation: "v"
      }, {
        guide: oBox.x + oBox.width,
        orientation: "v"
      }, {
        guide: oBox.y,
        orientation: "h"
      }, {
        guide: oBox.y + oBox.height / 2,
        orientation: "h"
      }, {
        guide: oBox.y + oBox.height,
        orientation: "h"
      }];
      nodeEdges.forEach(function (nEdge) {
        otherEdges.forEach(function (oEdge) {
          if (nEdge.orientation !== oEdge.orientation) return;
          if (Math.abs(nEdge.guide - oEdge.guide) <= GUIDELINE_OFFSET) {
            if (nEdge.orientation === "v") result.vertical.push({
              lineGuide: oEdge.guide,
              diff: oEdge.guide - nEdge.guide
            });else result.horizontal.push({
              lineGuide: oEdge.guide,
              diff: oEdge.guide - nEdge.guide
            });
          }
        });
      });
    });
    return result;
  };
  var handleDragMove = function handleDragMove(e) {
    var node = e.target;
    var guidesFound = getLineGuide(node);
    var newGuides = [];
    if (guidesFound.vertical.length > 0) {
      var g = guidesFound.vertical[0];
      node.x(node.x() + g.diff);
      newGuides.push({
        points: [g.lineGuide, -5000, g.lineGuide, 10000],
        stroke: "#3898ec",
        strokeWidth: 1 / zoom,
        dash: [4, 4]
      });
    }
    if (guidesFound.horizontal.length > 0) {
      var _g = guidesFound.horizontal[0];
      node.y(node.y() + _g.diff);
      newGuides.push({
        points: [-5000, _g.lineGuide, 10000, _g.lineGuide],
        stroke: "#3898ec",
        strokeWidth: 1 / zoom,
        dash: [4, 4]
      });
    }
    setGuides(newGuides);
  };
  var handleDragEnd = function handleDragEnd(e, item) {
    var node = e.target;
    var id = item.id;
    var update = function update(arr, setter) {
      var idx = arr.findIndex(function (i) {
        return i.id === id;
      });
      if (idx !== -1) {
        var next = _toConsumableArray(arr);
        next[idx] = _objectSpread(_objectSpread({}, next[idx]), {}, {
          x: node.x(),
          y: node.y()
        });
        setter(next);
      }
    };
    if (id.startsWith("img")) update(images, setImages);else if (id.startsWith("vid")) update(videos, setVideos);else if (id.startsWith("txt")) update(texts, setTexts);
    setGuides([]);
  };
  var handleWheel = function handleWheel(e) {
    e.evt.preventDefault();
    var stage = stageRef.current;
    if (!stage) return;
    var scaleBy = 1.05;
    var oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();
    if (!pointer) return;
    var mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    };
    var newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    var boundedScale = Math.max(0.1, Math.min(5, newScale));
    updateZoom(boundedScale, {
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale
    });
    setContextMenu(null);
  };
  var handleDrop = function handleDrop(e) {
    e.preventDefault();
    var url = e.dataTransfer.getData("text/plain");
    var files = e.dataTransfer.files;
    if (url) {
      if (url.match(/\.(mp4|webm|mov)$/i)) addVideo(url);else if (url.match(/\.(mp3|wav|ogg|m4a)$/i)) addAudio(url);else addImage(url);
    } else if (files && files.length > 0) {
      var file = files[0];
      var reader = new FileReader();
      reader.onload = function (ev) {
        if (file.type.startsWith("video/")) addVideo(ev.target.result);else if (file.type.startsWith("audio/")) addAudio(ev.target.result);else addImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "relative w-full h-full bg-bg-page overflow-hidden",
    ref: containerRef,
    onDragOver: function onDragOver(e) {
      return e.preventDefault();
    },
    onDrop: handleDrop
  }, /*#__PURE__*/_react["default"].createElement("div", {
    ref: stageWrapperRef,
    className: "absolute inset-0"
  }, /*#__PURE__*/_react["default"].createElement(_reactKonva.Stage, {
    width: canvasSize.width,
    height: canvasSize.height,
    onMouseDown: function onMouseDown(e) {
      if (e.evt.button === 2) return;
      if (e.target === e.target.getStage()) setSelectedId(null);
      setContextMenu(null);
    },
    onContextMenu: function onContextMenu(e) {
      e.evt.preventDefault();
      var stage = e.target.getStage();
      var id = e.target.id();
      setContextMenu({
        type: e.target === stage ? "canvas" : "node",
        nodeId: id,
        x: e.evt.clientX,
        y: e.evt.clientY,
        stagePos: stage.getPointerPosition()
      });
      if (id) setSelectedId(id);
    },
    onWheel: handleWheel,
    scaleX: zoom,
    scaleY: zoom,
    ref: stageRef,
    draggable: true,
    onDragMove: function onDragMove(e) {
      if (e.target === stageRef.current && containerRef.current) {
        containerRef.current.style.backgroundPosition = "".concat(e.target.x(), "px ").concat(e.target.y(), "px");
      }
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactKonva.Layer, null, /*#__PURE__*/_react["default"].createElement(_reactKonva.Rect, {
    width: 10000,
    height: 10000,
    x: -5000,
    y: -5000,
    fill: "#ffffff03",
    listening: false
  }), [].concat(_toConsumableArray(images), _toConsumableArray(videos), _toConsumableArray(audios), _toConsumableArray(texts)).sort(function (a, b) {
    return (a.zIndex || 0) - (b.zIndex || 0);
  }).map(function (item) {
    if (item.id.startsWith("img")) return /*#__PURE__*/_react["default"].createElement(URLImage, {
      key: item.id,
      imageObj: item,
      isSelected: item.id === selectedId,
      onSelect: function onSelect() {
        return setSelectedId(item.id);
      },
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      onChange: function onChange(attrs) {
        return setImages(function (prev) {
          return prev.map(function (i) {
            return i.id === item.id ? _objectSpread(_objectSpread({}, i), attrs) : i;
          });
        });
      }
    });
    if (item.id.startsWith("vid")) return /*#__PURE__*/_react["default"].createElement(URLVideo, {
      key: item.id,
      videoObj: item,
      isSelected: item.id === selectedId,
      onSelect: function onSelect() {
        return setSelectedId(item.id);
      },
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      onChange: function onChange(attrs) {
        return setVideos(function (prev) {
          return prev.map(function (v) {
            return v.id === item.id ? _objectSpread(_objectSpread({}, v), attrs) : v;
          });
        });
      }
    });
    if (item.id.startsWith("aud")) return /*#__PURE__*/_react["default"].createElement(URLAudio, {
      key: item.id,
      audioObj: item,
      isSelected: item.id === selectedId,
      onSelect: function onSelect() {
        return setSelectedId(item.id);
      },
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      onChange: function onChange(attrs) {
        return setAudios(function (prev) {
          return prev.map(function (a) {
            return a.id === item.id ? _objectSpread(_objectSpread({}, a), attrs) : a;
          });
        });
      }
    });
    if (item.id.startsWith("txt")) return /*#__PURE__*/_react["default"].createElement(URLText, {
      key: item.id,
      textObj: item,
      isSelected: item.id === selectedId,
      onSelect: function onSelect() {
        return setSelectedId(item.id);
      },
      onDblClick: setEditingTextId,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      onChange: function onChange(attrs) {
        return setTexts(function (prev) {
          return prev.map(function (t) {
            return t.id === item.id ? _objectSpread(_objectSpread({}, t), attrs) : t;
          });
        });
      }
    });
    return null;
  }), activeTasks.filter(function (t) {
    return !t.fullyMounted;
  }).map(function (task) {
    return /*#__PURE__*/_react["default"].createElement(LoaderNode, {
      key: task.taskId,
      task: task,
      isSelected: selectedId === task.taskId,
      onSelect: function onSelect() {
        return setSelectedId(task.taskId);
      },
      theme: theme,
      onChange: function onChange(attrs) {
        return setActiveTasks(function (prev) {
          return prev.map(function (t) {
            return t.taskId === task.taskId ? _objectSpread(_objectSpread({}, t), attrs) : t;
          });
        });
      }
    });
  }), guides.map(function (line, i) {
    return /*#__PURE__*/_react["default"].createElement(_reactKonva.Line, _extends({
      key: i
    }, line));
  })))), editingTextId && function () {
    var node = texts.find(function (t) {
      return t.id === editingTextId;
    });
    if (!node || !stageRef.current) return null;
    var stage = stageRef.current;
    var absX = node.x * zoom + stage.x();
    var absY = node.y * zoom + stage.y();
    return /*#__PURE__*/_react["default"].createElement("textarea", {
      autoFocus: true,
      value: node.text,
      onChange: function onChange(e) {
        return setTexts(function (prev) {
          return prev.map(function (t) {
            return t.id === editingTextId ? _objectSpread(_objectSpread({}, t), {}, {
              text: e.target.value
            }) : t;
          });
        });
      },
      onBlur: function onBlur() {
        return setEditingTextId(null);
      },
      onKeyDown: function onKeyDown(e) {
        if (e.key === "Escape" || e.key === "Enter" && !e.shiftKey) setEditingTextId(null);
      },
      className: "absolute z-50 bg-transparent border-none outline-none resize-none overflow-hidden",
      style: {
        left: absX,
        top: absY,
        width: (node.width || 200) * zoom,
        fontSize: (node.fontSize || 24) * zoom,
        color: node.fill || (theme === "dark" ? "white" : "black"),
        transform: "rotate(".concat(node.rotation || 0, "deg)")
      }
    });
  }(), contextMenu && /*#__PURE__*/_react["default"].createElement("div", {
    ref: function ref(node) {
      if (node) {
        var rect = node.getBoundingClientRect();
        if (rect.right > window.innerWidth) node.style.marginLeft = "-".concat(rect.right - window.innerWidth + 10, "px");
        if (rect.bottom > window.innerHeight) node.style.marginTop = "-".concat(rect.bottom - window.innerHeight + 10, "px");
      }
    },
    className: "fixed z-[100] w-56 rounded shadow-2xl border border-divider text-sm ".concat(theme === "dark" ? "bg-bg-card border-border-main text-text-main" : "bg-bg-card border-border-main text-text-main"),
    style: {
      top: contextMenu.y,
      left: contextMenu.x
    },
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, contextMenu.type === "node" ? /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Copy",
    shortcut: "Ctrl+C",
    onClick: handleCopy,
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Cut",
    shortcut: "Ctrl+X",
    onClick: handleCut,
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Duplicate",
    shortcut: "Ctrl+D",
    onClick: handleDuplicate,
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuDivider, {
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Bring to Front",
    shortcut: "]",
    onClick: function onClick() {
      return handleZIndex("front");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Send to Back",
    shortcut: "[",
    onClick: function onClick() {
      return handleZIndex("back");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Move Up",
    shortcut: "Ctrl+]",
    onClick: function onClick() {
      return handleZIndex("up");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Move Down",
    shortcut: "Ctrl+[",
    onClick: function onClick() {
      return handleZIndex("down");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuDivider, {
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Lock/Unlock",
    shortcut: "Ctrl+Shift+L",
    onClick: function onClick() {
      return handleToggleState("locked");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Show/Hide",
    shortcut: "Ctrl+Shift+H",
    onClick: function onClick() {
      return handleToggleState("hidden");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuDivider, {
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Flip Horizontal",
    onClick: function onClick() {
      return handleFlip("horizontal");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Flip Vertical",
    onClick: function onClick() {
      return handleFlip("vertical");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuDivider, {
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Download",
    onClick: handleDownload,
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuDivider, {
    theme: theme
  }), !(contextMenu !== null && contextMenu !== void 0 && (_contextMenu$nodeId = contextMenu.nodeId) !== null && _contextMenu$nodeId !== void 0 && _contextMenu$nodeId.startsWith("aud")) && /*#__PURE__*/_react["default"].createElement("div", {
    className: "relative group"
  }, /*#__PURE__*/_react["default"].createElement("button", {
    className: "w-full text-left px-4 py-1.5 flex justify-between items-center transition-colors ".concat(theme === "dark" ? "hover:bg-bg-page" : "hover:bg-bg-page")
  }, /*#__PURE__*/_react["default"].createElement("span", null, "Export As"), /*#__PURE__*/_react["default"].createElement("span", null, "\u203A")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute left-full bottom-0 hidden group-hover:block w-32 rounded shadow-2xl border border-divider text-sm ".concat(theme === "dark" ? "bg-bg-card border-border-main" : "bg-bg-card border-border-main")
  }, /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "PNG",
    onClick: function onClick() {
      return handleExport("PNG");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "JPG",
    onClick: function onClick() {
      return handleExport("JPG");
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "SVG",
    onClick: function onClick() {
      return handleExport("SVG");
    },
    theme: theme
  }))), /*#__PURE__*/_react["default"].createElement(MenuDivider, {
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Delete",
    shortcut: "Del",
    onClick: handleDelete,
    theme: theme
  })) : /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Paste",
    shortcut: "Ctrl+V",
    onClick: handlePasteNode,
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuDivider, {
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Zoom In",
    shortcut: "Ctrl++",
    onClick: function onClick() {
      return updateZoom(Math.min(5, zoom + 0.1));
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Zoom Out",
    shortcut: "Ctrl+-",
    onClick: function onClick() {
      return updateZoom(Math.max(0.1, zoom - 0.1));
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Zoom to Fit",
    shortcut: "Shift+1",
    onClick: handleZoomToFit,
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Reset Zoom",
    shortcut: "Ctrl+0",
    onClick: function onClick() {
      return updateZoom(1);
    },
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuDivider, {
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Export Canvas",
    onClick: handleExportCanvas,
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Show All Hidden",
    onClick: handleShowAllHidden,
    theme: theme
  }), /*#__PURE__*/_react["default"].createElement(MenuButton, {
    label: "Clear Canvas",
    onClick: handleClearCanvas,
    theme: theme
  }))));
});
CanvasArea.displayName = "CanvasArea";
var _default = exports["default"] = CanvasArea;