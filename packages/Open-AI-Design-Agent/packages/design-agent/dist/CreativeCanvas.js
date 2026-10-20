"use strict";
"use client";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = CreativeCanvas;
var _react = _interopRequireWildcard(require("react"));
var _navigation = require("next/navigation");
var _axios = _interopRequireDefault(require("axios"));
var _fi = require("react-icons/fi");
var _cg = require("react-icons/cg");
var _bi = require("react-icons/bi");
var _ri = require("react-icons/ri");
var _nextThemes = require("next-themes");
var _dynamic = _interopRequireDefault(require("next/dynamic"));
var _reactHotToast = _interopRequireWildcard(require("react-hot-toast"));
var _reactMarkdown = _interopRequireDefault(require("react-markdown"));
var _remarkGfm = _interopRequireDefault(require("remark-gfm"));
var _PlanVisualizer = _interopRequireDefault(require("./components/PlanVisualizer"));
var _link = _interopRequireDefault(require("next/link"));
var _go = require("react-icons/go");
var _vsc = require("react-icons/vsc");
var _prism = require("react-syntax-highlighter/dist/esm/styles/prism");
var _hi = require("react-icons/hi2");
var _image = _interopRequireDefault(require("next/image"));
var _excluded = ["node"],
  _excluded2 = ["node"],
  _excluded3 = ["node"],
  _excluded4 = ["node"],
  _excluded5 = ["node", "inline", "className", "children"];
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t12 in e) "default" !== _t12 && {}.hasOwnProperty.call(e, _t12) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t12)) && (i.get || i.set) ? o(f, _t12, i) : f[_t12] = e[_t12]); return f; })(e, t); } // import { useUser } from "@/context/UserContext";
var CanvasArea = (0, _dynamic["default"])(function () {
  return Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./CanvasArea"));
  });
}, {
  ssr: false
});
var SyntaxHighlighter = (0, _dynamic["default"])(function () {
  return Promise.resolve().then(function () {
    return _interopRequireWildcard(require('react-syntax-highlighter'));
  }).then(function (mod) {
    return mod.Prism;
  });
}, {
  ssr: false
});
var API = "/api/v1/creative-agent";
var GENERATION_TOOL_NAMES = new Set(["generate_image", "generate_video", "image_to_video", "edit_image", "edit_video", "enhance_image"]);
var formatTime = function formatTime(dateStr) {
  if (!dateStr) return "";
  var d = new Date(dateStr);
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};
var formatDateHeader = function formatDateHeader(dateStr) {
  if (!dateStr) return "";
  var d = new Date(dateStr);
  var now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  var yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
};
var TypingDots = function TypingDots() {
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "typing-dots py-1.5 px-1"
  }, /*#__PURE__*/_react["default"].createElement("span", null), /*#__PURE__*/_react["default"].createElement("span", null), /*#__PURE__*/_react["default"].createElement("span", null));
};
function CreativeCanvas(_ref) {
  var _activeSkill$inputs;
  var user = _ref.user,
    forcedTheme = _ref.theme,
    forcedSetTheme = _ref.setTheme,
    _ref$creditConversion = _ref.creditConversionRate,
    creditConversionRate = _ref$creditConversion === void 0 ? 200 : _ref$creditConversion,
    _ref$embedCode = _ref.embedCode,
    embedCode = _ref$embedCode === void 0 ? null : _ref$embedCode,
    _ref$isEmbed = _ref.isEmbed,
    isEmbed = _ref$isEmbed === void 0 ? false : _ref$isEmbed,
    _ref$navLinks = _ref.navLinks,
    navLinks = _ref$navLinks === void 0 ? null : _ref$navLinks,
    _ref$userBalanceLabel = _ref.userBalanceLabel,
    userBalanceLabel = _ref$userBalanceLabel === void 0 ? null : _ref$userBalanceLabel,
    onGenerationStart = _ref.onGenerationStart,
    onGenerationEnd = _ref.onGenerationEnd,
    onGenerationComplete = _ref.onGenerationComplete,
    onGenerationError = _ref.onGenerationError;
  var router = (0, _navigation.useRouter)();
  var searchParams = (0, _navigation.useSearchParams)();
  var inEmbedMode = isEmbed && !!embedCode;
  var embedStorageKey = inEmbedMode ? "muapi_agent_session_".concat(embedCode) : null;
  var notifiedGenerationEventsRef = (0, _react.useRef)(new Set());
  var generationActivityEventIdsRef = (0, _react.useRef)(new Set());
  var _useState = (0, _react.useState)(function () {
      if (typeof window === "undefined" || !embedStorageKey) return null;
      return window.localStorage.getItem(embedStorageKey) || null;
    }),
    _useState2 = _slicedToArray(_useState, 2),
    embedSessionId = _useState2[0],
    setEmbedSessionId = _useState2[1];
  var sessionId = inEmbedMode ? embedSessionId : searchParams.get("session");
  var _useState3 = (0, _react.useState)(""),
    _useState4 = _slicedToArray(_useState3, 2),
    input = _useState4[0],
    setInput = _useState4[1];
  var _useState5 = (0, _react.useState)([]),
    _useState6 = _slicedToArray(_useState5, 2),
    messages = _useState6[0],
    setMessages = _useState6[1];
  var _useState7 = (0, _react.useState)([]),
    _useState8 = _slicedToArray(_useState7, 2),
    assets = _useState8[0],
    setAssets = _useState8[1];
  var _useState9 = (0, _react.useState)([]),
    _useState0 = _slicedToArray(_useState9, 2),
    activeTasks = _useState0[0],
    setActiveTasks = _useState0[1];
  var _useState1 = (0, _react.useState)(false),
    _useState10 = _slicedToArray(_useState1, 2),
    busy = _useState10[0],
    setBusy = _useState10[1];
  var _useState11 = (0, _react.useState)(false),
    _useState12 = _slicedToArray(_useState11, 2),
    openProfile = _useState12[0],
    setOpenProfile = _useState12[1];
  var _useState13 = (0, _react.useState)(100),
    _useState14 = _slicedToArray(_useState13, 2),
    zoomLevel = _useState14[0],
    setZoomLevel = _useState14[1];
  var _useState15 = (0, _react.useState)([]),
    _useState16 = _slicedToArray(_useState15, 2),
    attachments = _useState16[0],
    setAttachments = _useState16[1];
  var _useState17 = (0, _react.useState)(false),
    _useState18 = _slicedToArray(_useState17, 2),
    uploading = _useState18[0],
    setUploading = _useState18[1];
  var _useState19 = (0, _react.useState)(0),
    _useState20 = _slicedToArray(_useState19, 2),
    uploadProgress = _useState20[0],
    setUploadProgress = _useState20[1];
  var _useState21 = (0, _react.useState)(false),
    _useState22 = _slicedToArray(_useState21, 2),
    isDragging = _useState22[0],
    setIsDragging = _useState22[1];
  var _useState23 = (0, _react.useState)([]),
    _useState24 = _slicedToArray(_useState23, 2),
    sessions = _useState24[0],
    setSessions = _useState24[1];
  var _useState25 = (0, _react.useState)("Creative Canvas"),
    _useState26 = _slicedToArray(_useState25, 2),
    currentSessionName = _useState26[0],
    setCurrentSessionName = _useState26[1];
  var _useState27 = (0, _react.useState)(false),
    _useState28 = _slicedToArray(_useState27, 2),
    isEditingName = _useState28[0],
    setIsEditingName = _useState28[1];
  var _useState29 = (0, _react.useState)(""),
    _useState30 = _slicedToArray(_useState29, 2),
    newName = _useState30[0],
    setNewName = _useState30[1];
  var _useState31 = (0, _react.useState)(false),
    _useState32 = _slicedToArray(_useState31, 2),
    showSessions = _useState32[0],
    setShowSessions = _useState32[1];
  var _useState33 = (0, _react.useState)([]),
    _useState34 = _slicedToArray(_useState33, 2),
    skills = _useState34[0],
    setSkills = _useState34[1];
  var _useState35 = (0, _react.useState)(null),
    _useState36 = _slicedToArray(_useState35, 2),
    activeSkill = _useState36[0],
    setActiveSkill = _useState36[1];
  var _useState37 = (0, _react.useState)(false),
    _useState38 = _slicedToArray(_useState37, 2),
    showSkillsMenu = _useState38[0],
    setShowSkillsMenu = _useState38[1];
  var _useState39 = (0, _react.useState)(false),
    _useState40 = _slicedToArray(_useState39, 2),
    showAssetsMenu = _useState40[0],
    setShowAssetsMenu = _useState40[1];
  var _useState41 = (0, _react.useState)(false),
    _useState42 = _slicedToArray(_useState41, 2),
    showMentionPopup = _useState42[0],
    setShowMentionPopup = _useState42[1];
  var _useState43 = (0, _react.useState)(""),
    _useState44 = _slicedToArray(_useState43, 2),
    mentionQuery = _useState44[0],
    setMentionQuery = _useState44[1];
  var _useState45 = (0, _react.useState)(0),
    _useState46 = _slicedToArray(_useState45, 2),
    mentionCursorPos = _useState46[0],
    setMentionCursorPos = _useState46[1];
  var _useState47 = (0, _react.useState)(null),
    _useState48 = _slicedToArray(_useState47, 2),
    hoveredAsset = _useState48[0],
    setHoveredAsset = _useState48[1];

  // Left Sidebar and Session Management
  var _useState49 = (0, _react.useState)(true),
    _useState50 = _slicedToArray(_useState49, 2),
    showLeftSidebar = _useState50[0],
    setShowLeftSidebar = _useState50[1];
  var _useState51 = (0, _react.useState)(null),
    _useState52 = _slicedToArray(_useState51, 2),
    editingSessionId = _useState52[0],
    setEditingSessionId = _useState52[1];
  var _useState53 = (0, _react.useState)(""),
    _useState54 = _slicedToArray(_useState53, 2),
    editingSessionName = _useState54[0],
    setEditingSessionName = _useState54[1];
  var _useState55 = (0, _react.useState)(null),
    _useState56 = _slicedToArray(_useState55, 2),
    hoveredSessionId = _useState56[0],
    setHoveredSessionId = _useState56[1];

  // Layout resizing
  var _useState57 = (0, _react.useState)(350),
    _useState58 = _slicedToArray(_useState57, 2),
    sidebarWidth = _useState58[0],
    setSidebarWidth = _useState58[1];
  var _useState59 = (0, _react.useState)(true),
    _useState60 = _slicedToArray(_useState59, 2),
    showChat = _useState60[0],
    setShowChat = _useState60[1];
  var _useState61 = (0, _react.useState)(350),
    _useState62 = _slicedToArray(_useState61, 2),
    prevWidth = _useState62[0],
    setPrevWidth = _useState62[1];
  var isResizing = (0, _react.useRef)(false);
  var handleToggleSidebar = function handleToggleSidebar() {
    if (showChat) {
      setPrevWidth(sidebarWidth);
      setSidebarWidth(0);
      setShowChat(false);
    } else {
      setSidebarWidth(prevWidth || 350);
      setShowChat(true);
    }
  };

  // Theme handling: Use props if provided, otherwise fallback to useTheme hook
  var _useTheme = (0, _nextThemes.useTheme)(),
    nextSetTheme = _useTheme.setTheme,
    nextResolvedTheme = _useTheme.resolvedTheme;
  var resolvedTheme = forcedTheme || nextResolvedTheme;
  var setTheme = forcedSetTheme || nextSetTheme;
  var _useState63 = (0, _react.useState)(false),
    _useState64 = _slicedToArray(_useState63, 2),
    mounted = _useState64[0],
    setMounted = _useState64[1];
  var canvasRef = (0, _react.useRef)(null);
  var chatEndRef = (0, _react.useRef)(null);
  var textareaRef = (0, _react.useRef)(null);
  var fileInputRef = (0, _react.useRef)(null);
  var syncedUrlsRef = (0, _react.useRef)(new Set());
  var justCreatedSessionRef = (0, _react.useRef)(false);
  var initialHandoffProcessed = (0, _react.useRef)(false);
  var getHeaders = (0, _react.useCallback)(function () {
    if (inEmbedMode) {
      return {
        "x-agent-embed-code": embedCode
      };
    }
    var token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? {
      Authorization: "Bearer ".concat(token)
    } : {};
  }, [inEmbedMode, embedCode]);

  // Persist embed session_id across page reloads so the conversation resumes.
  var setActiveEmbedSession = (0, _react.useCallback)(function (id) {
    setEmbedSessionId(id);
    if (typeof window !== "undefined" && embedStorageKey) {
      if (id) window.localStorage.setItem(embedStorageKey, id);else window.localStorage.removeItem(embedStorageKey);
    }
  }, [embedStorageKey]);

  // Initialize
  (0, _react.useEffect)(function () {
    setMounted(true);
    // In embed mode there's no concept of "switch to another session" — the
    // visitor only ever sees the one keyed by their localStorage. Skip the
    // sessions list fetch (which would also 403-on-allowed-origins or surface
    // sessions from other embeds spawned by the same owner).
    if (!inEmbedMode) fetchSessions();
    fetchSkills();
  }, []);

  // Handle initial query and skill from URL (Fallback only)
  (0, _react.useEffect)(function () {
    if (!mounted || busy || initialHandoffProcessed.current) return;
    // Embed pages never have a / handoff URL — skip.
    if (inEmbedMode) {
      initialHandoffProcessed.current = true;
      return;
    }
    var q = searchParams.get("q");
    var skillName = searchParams.get("skill");
    var a = searchParams.get("a");
    if (!q && !skillName && !a) {
      initialHandoffProcessed.current = true;
      return;
    }

    // We only process URL parameters if the session is brand new AND history has loaded as empty or default.
    // Since the Dashboard now sends the message, this useEffect will typically see the user message in history
    // and correctly skip sending q again.
    var isNewSession = messages.length === 1 && messages[0].role === "assistant";
    if (isNewSession) {
      initialHandoffProcessed.current = true;
      var initialAtts = null;
      if (a) {
        initialAtts = a.split(",").map(function (label) {
          return {
            asset_label: label,
            kind: "image"
          };
        });
      }
      if (skillName && !activeSkill) {
        var found = skills.find(function (s) {
          return s.name === skillName;
        });
        if (found) {
          setActiveSkill(found);
          if (q) {
            setTimeout(function () {
              return sendMessage(q, found, initialAtts);
            }, 10);
          }
        }
      } else if (q) {
        sendMessage(q, null, initialAtts);
      }

      // Cleanup URL once processed
      var newParams = new URLSearchParams(searchParams.toString());
      newParams["delete"]("q");
      newParams["delete"]("skill");
      newParams["delete"]("a");
      router.replace("?".concat(newParams.toString()), {
        scroll: false
      });
    } else if (messages.length > 1 || messages.length === 1 && messages[0].role === "user") {
      // If history already has messages, we consider the handoff "processed" by the backend.
      initialHandoffProcessed.current = true;
      var _newParams = new URLSearchParams(searchParams.toString());
      _newParams["delete"]("q");
      _newParams["delete"]("skill");
      _newParams["delete"]("a");
      router.replace("?".concat(_newParams.toString()), {
        scroll: false
      });
    }
  }, [mounted, busy, messages, skills.length, searchParams]);
  (0, _react.useEffect)(function () {
    if (justCreatedSessionRef.current) {
      justCreatedSessionRef.current = false;
      return;
    }
    // Clear the sync-tracking set whenever the session changes so assets from
    // the new session are always painted to canvas (prevents stale URL leakage).
    syncedUrlsRef.current.clear();
    if (sessionId) {
      loadHistory();
      loadAssets();
      // Sync name if sessions are already loaded
      var current = sessions.find(function (s) {
        return s.id === sessionId;
      });
      if (current) {
        setCurrentSessionName(current.name);
      } else {
        fetchSessions(); // Re-fetch to find the name if not in list
      }
    } else {
      setMessages([{
        role: "assistant",
        content: "Hello ".concat((user === null || user === void 0 ? void 0 : user.username) || "User", " \u2014 what shall we create today?"),
        timestamp: new Date().toISOString()
      }]);
      setAssets([]);
      setCurrentSessionName("New Session");
    }
  }, [sessionId]); // Removed sessions from deps to avoid infinite loop if fetchSessions updates sessions

  var fetchSessions = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var _yield$axios$get, data, current, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            _context.p = 0;
            _context.n = 1;
            return _axios["default"].get("".concat(API, "/sessions"), {
              headers: getHeaders()
            });
          case 1:
            _yield$axios$get = _context.v;
            data = _yield$axios$get.data;
            setSessions(data);
            if (sessionId) {
              current = data.find(function (s) {
                return s.id === sessionId;
              });
              if (current) setCurrentSessionName(current.name);
            }
            _context.n = 3;
            break;
          case 2:
            _context.p = 2;
            _t = _context.v;
          case 3:
            return _context.a(2);
        }
      }, _callee, null, [[0, 2]]);
    }));
    return function fetchSessions() {
      return _ref2.apply(this, arguments);
    };
  }();
  var fetchSkills = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var _yield$axios$get2, data, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            _context2.p = 0;
            _context2.n = 1;
            return _axios["default"].get("".concat(API, "/agent-skills"), {
              headers: getHeaders()
            });
          case 1:
            _yield$axios$get2 = _context2.v;
            data = _yield$axios$get2.data;
            setSkills(data);
            _context2.n = 3;
            break;
          case 2:
            _context2.p = 2;
            _t2 = _context2.v;
            console.error("Failed to fetch skills:", _t2);
          case 3:
            return _context2.a(2);
        }
      }, _callee2, null, [[0, 2]]);
    }));
    return function fetchSkills() {
      return _ref3.apply(this, arguments);
    };
  }();
  var processEvent = function processEvent(ev, msgIdx) {
    var _flat$asset;
    var p = ev.payload || {};

    // Canvas mutation events — apply directly to the live canvas, don't push
    // them into the chat transcript.
    if (ev.type === "canvas_op") {
      var op = p.op;
      var args = p.args || {};
      var c = canvasRef.current;
      if (!c) return;
      if (op === "move" && typeof c.moveNode === "function") {
        c.moveNode(args.asset_id, args.x, args.y);
      } else if (op === "arrange" && typeof c.arrangeNodes === "function") {
        c.arrangeNodes(args.moves || []);
      }
      return;
    }
    var flat = function () {
      switch (ev.type) {
        case "text":
          return {
            type: "text",
            content: p.content
          };
        case "info":
          return {
            type: "info",
            content: p.content
          };
        case "error":
          return {
            type: "error",
            name: p.name,
            message: p.message
          };
        case "tool_call":
          return {
            type: "tool_call",
            name: p.name,
            args: p.args
          };
        case "tool_result":
          return {
            type: "tool_result",
            name: p.name,
            result: p.result,
            asset: p.asset
          };
        case "plan_propose":
          return {
            type: "plan_propose",
            title: p.title,
            nodes: p.nodes,
            total_credits: p.total_credits
          };
        default:
          return _objectSpread({
            type: ev.type
          }, p);
      }
    }();
    if (!flat) return;
    flat.job_id = ev.job_id || p.job_id;

    // If the job has already been approved or rejected, mark approval events as handled.
    if (ev.approved !== undefined && ev.approved !== null) {
      var _flat$content, _flat$content2;
      var isApproval = flat.type === "plan_propose" || flat.type === "info" && (((_flat$content = flat.content) === null || _flat$content === void 0 ? void 0 : _flat$content.includes("approval")) || ((_flat$content2 = flat.content) === null || _flat$content2 === void 0 ? void 0 : _flat$content2.includes("confirmation")));
      if (isApproval) {
        flat.handled = true;
      }
    }
    setMessages(function (prev) {
      var _flat$content3, _flat$content4;
      var arr = _toConsumableArray(prev);
      if (msgIdx < 0 || msgIdx >= arr.length) return arr;
      var m = _objectSpread(_objectSpread({}, arr[msgIdx]), {}, {
        events: _toConsumableArray(arr[msgIdx].events || [])
      });
      if (m.events.find(function (e) {
        return e.id === ev.id;
      })) return arr;

      // Update event and mark previous ones as handled if this is a result
      m.events.push(_objectSpread(_objectSpread({}, flat), {}, {
        id: ev.id
      }));
      if (flat.type === "text") m.content = (m.content || "") + (flat.content || "");

      // If this is an info-approval pill, hide it if we already have a plan for this job
      if (flat.type === "info" && ((_flat$content3 = flat.content) !== null && _flat$content3 !== void 0 && _flat$content3.includes("approval") || (_flat$content4 = flat.content) !== null && _flat$content4 !== void 0 && _flat$content4.includes("confirmation"))) {
        var hasPlan = m.events.some(function (e) {
          return e.job_id === flat.job_id && e.type === "plan_propose";
        });
        if (hasPlan) flat.handled = true;
      }
      if (flat.type === "tool_result" || flat.type === "error") {
        m.events = m.events.map(function (e) {
          var _e$content, _e$content2;
          return e.job_id === flat.job_id && (e.type === "info" && ((_e$content = e.content) !== null && _e$content !== void 0 && _e$content.includes("approval") || (_e$content2 = e.content) !== null && _e$content2 !== void 0 && _e$content2.includes("confirmation")) || e.type === "plan_propose") ? _objectSpread(_objectSpread({}, e), {}, {
            handled: true
          }) : e;
        });
      }

      // If we just got a plan, hide any loose "Waiting for approval" pills for this job
      if (flat.type === "plan_propose") {
        m.events = m.events.map(function (e) {
          var _e$content3, _e$content4;
          return e.job_id === flat.job_id && e.type === "info" && ((_e$content3 = e.content) !== null && _e$content3 !== void 0 && _e$content3.includes("approval") || (_e$content4 = e.content) !== null && _e$content4 !== void 0 && _e$content4.includes("confirmation")) ? _objectSpread(_objectSpread({}, e), {}, {
            handled: true
          }) : e;
        });
      }
      arr[msgIdx] = m;
      return arr;
    });
    var notificationKey = ev.id || [flat.job_id, flat.type, flat.name, (_flat$asset = flat.asset) === null || _flat$asset === void 0 ? void 0 : _flat$asset.url, flat.message].filter(Boolean).join(":");
    if (ev.id && !generationActivityEventIdsRef.current.has(ev.id)) {
      if (flat.type === "tool_call" && GENERATION_TOOL_NAMES.has(flat.name)) {
        generationActivityEventIdsRef.current.add(ev.id);
        onGenerationStart === null || onGenerationStart === void 0 || onGenerationStart();
      } else if (flat.type === "error" || flat.type === "tool_result" && GENERATION_TOOL_NAMES.has(flat.name)) {
        generationActivityEventIdsRef.current.add(ev.id);
        onGenerationEnd === null || onGenerationEnd === void 0 || onGenerationEnd();
      }
    }
    if (notificationKey && !notifiedGenerationEventsRef.current.has(notificationKey)) {
      if (flat.type === "error") {
        notifiedGenerationEventsRef.current.add(notificationKey);
        onGenerationError === null || onGenerationError === void 0 || onGenerationError(flat.message || "Design Agent generation failed");
      } else if (flat.type === "tool_result" && GENERATION_TOOL_NAMES.has(flat.name)) {
        var _flat$result;
        notifiedGenerationEventsRef.current.add(notificationKey);
        if (((_flat$result = flat.result) === null || _flat$result === void 0 ? void 0 : _flat$result.ok) === false) {
          var _flat$result2;
          onGenerationError === null || onGenerationError === void 0 || onGenerationError(((_flat$result2 = flat.result) === null || _flat$result2 === void 0 ? void 0 : _flat$result2.error) || "Design Agent generation failed");
        } else {
          var _flat$asset2, _flat$result3, _flat$asset3;
          onGenerationComplete === null || onGenerationComplete === void 0 || onGenerationComplete({
            url: ((_flat$asset2 = flat.asset) === null || _flat$asset2 === void 0 ? void 0 : _flat$asset2.url) || ((_flat$result3 = flat.result) === null || _flat$result3 === void 0 ? void 0 : _flat$result3.url) || null,
            type: ((_flat$asset3 = flat.asset) === null || _flat$asset3 === void 0 ? void 0 : _flat$asset3.kind) || "design"
          });
        }
      }
    }
    if (flat.type === "tool_call" && GENERATION_TOOL_NAMES.has(flat.name)) {
      // For edit-style tools, spawn the loader at the same spot the result
      // will land at — beside the source asset (32px to its right). The
      // source stays visible throughout. Keeps the loader and the final
      // asset position in sync — no visual jump on completion.
      //
      // generate_* (no source) keeps the default centre placement.
      var x, y;
      var a = flat.args || {};
      var srcLabel = a.image || a.video || a.audio;
      if (srcLabel && typeof srcLabel === "string" && srcLabel.startsWith("asset_")) {
        try {
          var _canvasRef$current, _canvasRef$current$ge, _cs$nodes;
          var cs = (_canvasRef$current = canvasRef.current) === null || _canvasRef$current === void 0 || (_canvasRef$current$ge = _canvasRef$current.getCanvasState) === null || _canvasRef$current$ge === void 0 ? void 0 : _canvasRef$current$ge.call(_canvasRef$current);
          var srcNode = cs === null || cs === void 0 || (_cs$nodes = cs.nodes) === null || _cs$nodes === void 0 ? void 0 : _cs$nodes.find(function (n) {
            return n.asset_id === srcLabel;
          });
          if (srcNode) {
            x = srcNode.x + (srcNode.w || 200) + 32;
            y = srcNode.y;
          }
        } catch (_unused2) {}
      }
      setActiveTasks(function (prev) {
        return [].concat(_toConsumableArray(prev), [{
          taskId: "task-".concat(Date.now(), "-").concat(Math.random()),
          modelName: flat.name,
          status: "processing",
          x: x,
          y: y
        }]);
      });
    }
    if (flat.type === "tool_result" || flat.type === "error") {
      setActiveTasks(function (prev) {
        var idx = prev.findIndex(function (t) {
          return t.modelName === flat.name;
        });
        if (idx !== -1) {
          var next = _toConsumableArray(prev);
          next.splice(idx, 1);
          return next;
        }
        return prev;
      });
      if (flat.asset) {
        var _flat$result4, _canvasRef$current2, _canvasRef$current3;
        setAssets(function (pa) {
          // Use a combination of label and url for reliable identification
          var idx = pa.findIndex(function (a) {
            return flat.asset.asset_label && a.asset_label === flat.asset.asset_label || a.url === flat.asset.url;
          });
          if (idx !== -1) {
            var next = _toConsumableArray(pa);
            next[idx] = _objectSpread(_objectSpread({}, next[idx]), flat.asset);
            return next;
          }
          return [].concat(_toConsumableArray(pa), [flat.asset]);
        });

        // Side-by-side placement: when a tool result carries source_asset_id,
        // drop the new asset just to the right of the source so both stay
        // visible. Source is preserved (the user can still see / branch
        // from it). Mark the new label-url as synced so the auto-sync
        // effect doesn't also drop it at canvas centre.
        var _srcLabel = (_flat$result4 = flat.result) === null || _flat$result4 === void 0 ? void 0 : _flat$result4.source_asset_id;
        var newLabel = flat.asset.asset_label;
        var newUrl = flat.asset.url;
        var newKind = flat.asset.kind || "image";
        var place = ((_canvasRef$current2 = canvasRef.current) === null || _canvasRef$current2 === void 0 ? void 0 : _canvasRef$current2.placeNextToSource) || ((_canvasRef$current3 = canvasRef.current) === null || _canvasRef$current3 === void 0 ? void 0 : _canvasRef$current3.replaceAt);
        if (_srcLabel && newLabel && newUrl && place) {
          var _syncedUrlsRef$curren, _syncedUrlsRef$curren2;
          place(_srcLabel, newUrl, newKind, newLabel);
          (_syncedUrlsRef$curren = syncedUrlsRef.current) === null || _syncedUrlsRef$curren === void 0 || (_syncedUrlsRef$curren2 = _syncedUrlsRef$curren.add) === null || _syncedUrlsRef$curren2 === void 0 || _syncedUrlsRef$curren2.call(_syncedUrlsRef$curren, "".concat(newLabel, "-").concat(newUrl));
        }
      }
    }
  };
  var resumePolling = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(jobId, assistantIdx) {
      var cursor, POLL_INTERVAL, MAX_DEAD_AIR, lastProgress, _loop, _ret;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            cursor = 0;
            POLL_INTERVAL = 1200;
            MAX_DEAD_AIR = 6 * 60 * 1000;
            lastProgress = Date.now();
            setBusy(true);
            _loop = /*#__PURE__*/_regenerator().m(function _loop() {
              var _data$events, _yield$axios$get3, data, _t3;
              return _regenerator().w(function (_context3) {
                while (1) switch (_context3.p = _context3.n) {
                  case 0:
                    _context3.p = 0;
                    _context3.n = 1;
                    return _axios["default"].get("".concat(API, "/jobs/").concat(jobId, "/events"), {
                      params: {
                        since: cursor
                      },
                      headers: getHeaders()
                    });
                  case 1:
                    _yield$axios$get3 = _context3.v;
                    data = _yield$axios$get3.data;
                    if ((_data$events = data.events) !== null && _data$events !== void 0 && _data$events.length) {
                      data.events.forEach(function (ev) {
                        return processEvent(_objectSpread(_objectSpread({}, ev), {}, {
                          approved: data.approved
                        }), assistantIdx);
                      });
                      cursor = data.cursor || cursor;
                      lastProgress = Date.now();
                    }
                    if (!data.done) {
                      _context3.n = 2;
                      break;
                    }
                    return _context3.a(2, 0);
                  case 2:
                    if (!(Date.now() - lastProgress > MAX_DEAD_AIR)) {
                      _context3.n = 3;
                      break;
                    }
                    throw new Error("Stalled");
                  case 3:
                    _context3.n = 5;
                    break;
                  case 4:
                    _context3.p = 4;
                    _t3 = _context3.v;
                    if (!(Date.now() - lastProgress > MAX_DEAD_AIR)) {
                      _context3.n = 5;
                      break;
                    }
                    return _context3.a(2, 0);
                  case 5:
                    _context3.n = 6;
                    return new Promise(function (r) {
                      return setTimeout(r, POLL_INTERVAL);
                    });
                  case 6:
                    return _context3.a(2);
                }
              }, _loop, null, [[0, 4]]);
            });
          case 1:
            if (!true) {
              _context4.n = 4;
              break;
            }
            return _context4.d(_regeneratorValues(_loop()), 2);
          case 2:
            _ret = _context4.v;
            if (!(_ret === 0)) {
              _context4.n = 3;
              break;
            }
            return _context4.a(3, 4);
          case 3:
            _context4.n = 1;
            break;
          case 4:
            setBusy(false);
            loadAssets();
            // Persist final state
            setMessages(function (prev) {
              var next = _toConsumableArray(prev);
              _axios["default"].patch("".concat(API, "/sessions/").concat(sessionId, "/messages"), {
                messages: next
              }, {
                headers: getHeaders()
              })["catch"](function () {});
              return next;
            });
          case 5:
            return _context4.a(2);
        }
      }, _callee3);
    }));
    return function resumePolling(_x, _x2) {
      return _ref4.apply(this, arguments);
    };
  }();
  var handleJobAction = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(jobId, action) {
      var _err$response, _t4;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.p = _context5.n) {
          case 0:
            _context5.p = 0;
            _context5.n = 1;
            return _axios["default"].post("".concat(API, "/jobs/").concat(jobId, "/").concat(action), {}, {
              headers: getHeaders()
            });
          case 1:
            _reactHotToast["default"].success("Job ".concat(action, "ed"));

            // Hide the approval card in the UI
            setMessages(function (prev) {
              return prev.map(function (m) {
                return _objectSpread(_objectSpread({}, m), {}, {
                  events: (m.events || []).map(function (e) {
                    var _e$content5, _e$content6;
                    return e.job_id === jobId && (e.type === "info" && ((_e$content5 = e.content) !== null && _e$content5 !== void 0 && _e$content5.includes("approval") || (_e$content6 = e.content) !== null && _e$content6 !== void 0 && _e$content6.includes("confirmation")) || e.type === "plan_propose") ? _objectSpread(_objectSpread({}, e), {}, {
                      handled: true
                    }) : e;
                  })
                });
              });
            });
            _context5.n = 3;
            break;
          case 2:
            _context5.p = 2;
            _t4 = _context5.v;
            _reactHotToast["default"].error(((_err$response = _t4.response) === null || _err$response === void 0 || (_err$response = _err$response.data) === null || _err$response === void 0 ? void 0 : _err$response.detail) || "Failed to ".concat(action, " job"));
          case 3:
            return _context5.a(2);
        }
      }, _callee4, null, [[0, 2]]);
    }));
    return function handleJobAction(_x3, _x4) {
      return _ref5.apply(this, arguments);
    };
  }();
  var loadHistory = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
      var _yield$axios$get4, data, cleaned, _t5;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.p = _context6.n) {
          case 0:
            _context6.p = 0;
            _context6.n = 1;
            return _axios["default"].get("".concat(API, "/sessions/").concat(sessionId, "/messages"), {
              headers: getHeaders()
            });
          case 1:
            _yield$axios$get4 = _context6.v;
            data = _yield$axios$get4.data;
            if (data && data.length > 0) {
              // Cleanup: Hide approval cards that already have results or are for inactive jobs
              cleaned = data.map(function (m) {
                return _objectSpread(_objectSpread({}, m), {}, {
                  events: (m.events || []).map(function (e, idx, arr) {
                    var _e$content7, _e$content8;
                    if (e.type === "info" && ((_e$content7 = e.content) !== null && _e$content7 !== void 0 && _e$content7.includes("approval") || (_e$content8 = e.content) !== null && _e$content8 !== void 0 && _e$content8.includes("confirmation")) || e.type === "plan_propose") {
                      var hasResult = arr.slice(idx + 1).some(function (next) {
                        return next.job_id === e.job_id && (next.type === "tool_result" || next.type === "error");
                      });
                      if (hasResult) return _objectSpread(_objectSpread({}, e), {}, {
                        handled: true
                      });
                    }
                    return e;
                  })
                });
              });
              setMessages(cleaned);
              checkActiveJobs(cleaned);
            } else {
              setMessages([{
                role: "assistant",
                content: "Session ready \u2014 what shall we create?",
                timestamp: new Date().toISOString()
              }]);
            }
            _context6.n = 3;
            break;
          case 2:
            _context6.p = 2;
            _t5 = _context6.v;
            setMessages([{
              role: "assistant",
              content: "Session ready \u2014 what shall we create?",
              timestamp: new Date().toISOString()
            }]);
          case 3:
            return _context6.a(2);
        }
      }, _callee5, null, [[0, 2]]);
    }));
    return function loadHistory() {
      return _ref6.apply(this, arguments);
    };
  }();
  var checkActiveJobs = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(currentMessages) {
      var _yield$axios$get5, data, active, aIdx, _t6;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.p = _context7.n) {
          case 0:
            if (sessionId) {
              _context7.n = 1;
              break;
            }
            return _context7.a(2);
          case 1:
            _context7.p = 1;
            _context7.n = 2;
            return _axios["default"].get("".concat(API, "/sessions/").concat(sessionId, "/jobs"), {
              headers: getHeaders()
            });
          case 2:
            _yield$axios$get5 = _context7.v;
            data = _yield$axios$get5.data;
            active = data.find(function (j) {
              return (j.status === "pending" || j.status === "processing") && j.id;
            });
            if (active) {
              // If the last message is assistant but empty/no events, it might be the one for this job.
              aIdx = currentMessages.length - 1;
              if (aIdx < 0 || currentMessages[aIdx].role !== "assistant") {
                // No assistant bubble to resume into, create a new one.
                setMessages(function (prev) {
                  var next = [].concat(_toConsumableArray(prev), [{
                    role: "assistant",
                    content: "",
                    events: [],
                    timestamp: new Date().toISOString()
                  }]);
                  resumePolling(active.id, next.length - 1);
                  return next;
                });
              } else {
                resumePolling(active.id, aIdx);
              }
            }
            _context7.n = 4;
            break;
          case 3:
            _context7.p = 3;
            _t6 = _context7.v;
          case 4:
            return _context7.a(2);
        }
      }, _callee6, null, [[1, 3]]);
    }));
    return function checkActiveJobs(_x5) {
      return _ref7.apply(this, arguments);
    };
  }();
  var loadAssets = /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
      var _yield$axios$get6, data, _t7;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.p = _context8.n) {
          case 0:
            if (sessionId) {
              _context8.n = 1;
              break;
            }
            return _context8.a(2);
          case 1:
            _context8.p = 1;
            _context8.n = 2;
            return _axios["default"].get("".concat(API, "/sessions/").concat(sessionId, "/assets"), {
              headers: getHeaders()
            });
          case 2:
            _yield$axios$get6 = _context8.v;
            data = _yield$axios$get6.data;
            setAssets(data);
            _context8.n = 4;
            break;
          case 3:
            _context8.p = 3;
            _t7 = _context8.v;
          case 4:
            return _context8.a(2);
        }
      }, _callee7, null, [[1, 3]]);
    }));
    return function loadAssets() {
      return _ref8.apply(this, arguments);
    };
  }();
  (0, _react.useEffect)(function () {
    var _chatEndRef$current;
    (_chatEndRef$current = chatEndRef.current) === null || _chatEndRef$current === void 0 || _chatEndRef$current.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, busy]);
  var ensureSession = /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
      var _yield$axios$post, data;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            if (!sessionId) {
              _context9.n = 1;
              break;
            }
            return _context9.a(2, sessionId);
          case 1:
            _context9.n = 2;
            return _axios["default"].post("".concat(API, "/sessions"), {}, {
              headers: getHeaders()
            });
          case 2:
            _yield$axios$post = _context9.v;
            data = _yield$axios$post.data;
            justCreatedSessionRef.current = true;
            if (inEmbedMode) {
              setActiveEmbedSession(data.id);
            } else {
              router.replace("?session=".concat(data.id), {
                scroll: false
              });
              fetchSessions();
            }
            return _context9.a(2, data.id);
        }
      }, _callee8);
    }));
    return function ensureSession() {
      return _ref9.apply(this, arguments);
    };
  }();
  var processFile = /*#__PURE__*/function () {
    var _ref0 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(file) {
      var _file$type, _file$type2, activeSessionId, _yield$axios$get7, signData, url, fields, formData, uploadedUrl, kind, _yield$axios$post2, registered, att, _t8;
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.p = _context0.n) {
          case 0:
            if (file) {
              _context0.n = 1;
              break;
            }
            return _context0.a(2);
          case 1:
            setUploading(true);
            setUploadProgress(0);
            _context0.p = 2;
            _context0.n = 3;
            return ensureSession();
          case 3:
            activeSessionId = _context0.v;
            _context0.n = 4;
            return _axios["default"].get("/api/v1/get_upload_url", {
              params: {
                filename: file.name
              },
              headers: getHeaders()
            });
          case 4:
            _yield$axios$get7 = _context0.v;
            signData = _yield$axios$get7.data;
            url = signData.url, fields = signData.fields; // Use the proxy for the actual binary upload to maintain consistency and avoid CORS issues
            formData = new FormData();
            formData.append("x-proxy-target-url", url);
            Object.entries(fields).forEach(function (_ref1) {
              var _ref10 = _slicedToArray(_ref1, 2),
                key = _ref10[0],
                value = _ref10[1];
              formData.append(key, value);
            });
            formData.append("file", file);

            // 2. Upload via local proxy
            _context0.n = 5;
            return _axios["default"].post("/api/v1/upload-binary", formData, {
              headers: {
                "Content-Type": "multipart/form-data"
              },
              onUploadProgress: function onUploadProgress(pe) {
                setUploadProgress(Math.round(pe.loaded * 100 / pe.total));
              }
            });
          case 5:
            // 3. Final URL
            uploadedUrl = "https://cdn.muapi.ai/".concat(fields.key); // 4. Register as a real session asset so the agent can address it as asset_N.
            kind = (_file$type = file.type) !== null && _file$type !== void 0 && _file$type.startsWith("video/") ? "video" : (_file$type2 = file.type) !== null && _file$type2 !== void 0 && _file$type2.startsWith("audio/") ? "audio" : "image";
            _context0.n = 6;
            return _axios["default"].post("".concat(API, "/sessions/").concat(activeSessionId, "/assets"), {
              url: uploadedUrl,
              kind: kind,
              source_tool: "upload"
            }, {
              headers: getHeaders()
            });
          case 6:
            _yield$axios$post2 = _context0.v;
            registered = _yield$axios$post2.data;
            att = {
              asset_label: registered.asset_label,
              url: uploadedUrl,
              kind: kind
            };
            setAttachments(function (prev) {
              return [].concat(_toConsumableArray(prev), [att]);
            });
            // Reflect on the canvas immediately.
            setAssets(function (prev) {
              return [].concat(_toConsumableArray(prev), [{
                asset_label: registered.asset_label,
                url: uploadedUrl,
                kind: kind,
                source_tool: "upload",
                model: null,
                prompt: null
              }]);
            });
            _reactHotToast["default"].success("Uploaded as ".concat(registered.asset_label));
            _context0.n = 8;
            break;
          case 7:
            _context0.p = 7;
            _t8 = _context0.v;
            console.error("Upload failed", _t8);
            _reactHotToast["default"].error("Upload failed");
          case 8:
            _context0.p = 8;
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return _context0.f(8);
          case 9:
            return _context0.a(2);
        }
      }, _callee9, null, [[2, 7, 8, 9]]);
    }));
    return function processFile(_x6) {
      return _ref0.apply(this, arguments);
    };
  }();
  var handleFileUpload = function handleFileUpload(e) {
    var _e$target$files;
    processFile((_e$target$files = e.target.files) === null || _e$target$files === void 0 ? void 0 : _e$target$files[0]);
  };
  var handleDragOver = function handleDragOver(e) {
    e.preventDefault();
    if (busy || uploading) return;
    setIsDragging(true);
  };
  var handleDragLeave = function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  };
  var handleDrop = function handleDrop(e) {
    var _e$dataTransfer$files;
    e.preventDefault();
    setIsDragging(false);
    if (busy || uploading) return;
    var file = (_e$dataTransfer$files = e.dataTransfer.files) === null || _e$dataTransfer$files === void 0 ? void 0 : _e$dataTransfer$files[0];
    if (file) processFile(file);
  };
  var removeAttachment = function removeAttachment(label) {
    setAttachments(function (prev) {
      return prev.filter(function (a) {
        return a.asset_label !== label;
      });
    });
  };
  var sendMessage = /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
      var textOverride,
        skillOverride,
        attachmentsOverride,
        typed,
        currentAttachments,
        currentSkill,
        activeSessionId,
        attachmentNote,
        msg,
        msgAttachments,
        userMsg,
        updatedMessages,
        aIdx,
        canvasState,
        _canvasRef$current4,
        _canvasRef$current4$g,
        endpoint,
        payload,
        _currentSkill$inputs,
        primaryInputKey,
        enqueueRes,
        _args1 = arguments,
        _t9,
        _t0;
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.p = _context1.n) {
          case 0:
            textOverride = _args1.length > 0 && _args1[0] !== undefined ? _args1[0] : null;
            skillOverride = _args1.length > 1 && _args1[1] !== undefined ? _args1[1] : null;
            attachmentsOverride = _args1.length > 2 && _args1[2] !== undefined ? _args1[2] : null;
            typed = (typeof textOverride === 'string' ? textOverride : input).trim();
            currentAttachments = attachmentsOverride || attachments;
            if (!(!typed && currentAttachments.length === 0 || busy)) {
              _context1.n = 1;
              break;
            }
            return _context1.a(2);
          case 1:
            currentSkill = skillOverride || activeSkill;
            _context1.p = 2;
            _context1.n = 3;
            return ensureSession();
          case 3:
            activeSessionId = _context1.v;
            _context1.n = 5;
            break;
          case 4:
            _context1.p = 4;
            _t9 = _context1.v;
            _reactHotToast["default"].error("Failed to establish session");
            return _context1.a(2);
          case 5:
            // Tell the LLM about any uploaded assets so it can call edit_image / image_to_video / etc.
            // by asset_label without us having to expose URLs in the user-visible bubble.
            attachmentNote = currentAttachments.length ? "\n\n[Attached " + currentAttachments.map(function (a) {
              return "".concat(a.asset_label, " (").concat(a.kind || "image", ")");
            }).join(", ") + "]" : "";
            msg = typed + attachmentNote;
            msgAttachments = _toConsumableArray(currentAttachments);
            if (!attachmentsOverride) setAttachments([]);
            setInput("");
            if (textareaRef.current) textareaRef.current.style.height = "24px";
            userMsg = {
              role: "user",
              content: msg,
              attachments: msgAttachments,
              timestamp: new Date().toISOString(),
              skill_name: currentSkill === null || currentSkill === void 0 ? void 0 : currentSkill.name
            };
            updatedMessages = [].concat(_toConsumableArray(messages), [userMsg]);
            setMessages([].concat(_toConsumableArray(updatedMessages), [{
              role: "assistant",
              content: "",
              events: [],
              timestamp: new Date().toISOString()
            }]));
            setBusy(true);
            aIdx = updatedMessages.length;
            _context1.p = 6;
            canvasState = null;
            try {
              canvasState = ((_canvasRef$current4 = canvasRef.current) === null || _canvasRef$current4 === void 0 || (_canvasRef$current4$g = _canvasRef$current4.getCanvasState) === null || _canvasRef$current4$g === void 0 ? void 0 : _canvasRef$current4$g.call(_canvasRef$current4)) || null;
            } catch (_unused6) {}
            endpoint = "".concat(API, "/sessions/").concat(activeSessionId, "/chat");
            payload = {
              message: typed,
              model: "gpt-5-mini",
              messages_snapshot: updatedMessages,
              canvas_state: canvasState
            }; // If a skill is pinned, use the run-skill endpoint
            if (currentSkill) {
              endpoint = "".concat(API, "/sessions/").concat(activeSessionId, "/run-skill");
              // Map the user input to the first required input of the skill
              primaryInputKey = ((_currentSkill$inputs = currentSkill.inputs) === null || _currentSkill$inputs === void 0 ? void 0 : _currentSkill$inputs[0]) || "premise";
              payload = {
                skill_name: currentSkill.name,
                inputs: _defineProperty({}, primaryInputKey, typed),
                messages_snapshot: updatedMessages,
                model: "gpt-5-mini"
              };
              if (!skillOverride) setActiveSkill(null); // Clear skill after sending if not override
            }
            _context1.n = 7;
            return _axios["default"].post(endpoint, payload, {
              headers: getHeaders()
            });
          case 7:
            enqueueRes = _context1.v;
            _context1.n = 8;
            return resumePolling(enqueueRes.data.job_id, aIdx);
          case 8:
            _context1.n = 10;
            break;
          case 9:
            _context1.p = 9;
            _t0 = _context1.v;
            setMessages(function (prev) {
              var arr = _toConsumableArray(prev);
              if (aIdx >= 0) arr[aIdx] = _objectSpread(_objectSpread({}, arr[aIdx]), {}, {
                content: "\u274C ".concat(_t0.message || _t0)
              });
              return arr;
            });
          case 10:
            _context1.p = 10;
            setBusy(false);
            _context1.n = 11;
            return loadAssets();
          case 11:
            if (activeSessionId) {
              setMessages(function (prev) {
                var newMsgs = _toConsumableArray(prev);
                _axios["default"].patch("".concat(API, "/sessions/").concat(activeSessionId, "/messages"), {
                  messages: newMsgs
                }, {
                  headers: getHeaders()
                })["catch"](function () {});
                return newMsgs;
              });
            }
            return _context1.f(10);
          case 12:
            return _context1.a(2);
        }
      }, _callee0, null, [[6, 9, 10, 12], [2, 4]]);
    }));
    return function sendMessage() {
      return _ref11.apply(this, arguments);
    };
  }();
  var markdownComponents = (0, _react.useMemo)(function () {
    return {
      a: function a(_ref12) {
        var _props$href, _props$href2;
        var node = _ref12.node,
          props = _objectWithoutProperties(_ref12, _excluded);
        var isMedia = (_props$href = props.href) === null || _props$href === void 0 ? void 0 : _props$href.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i);
        var isVideo = (_props$href2 = props.href) === null || _props$href2 === void 0 ? void 0 : _props$href2.match(/\.(mp4|webm|mov)$/i);
        if (isMedia) {
          return /*#__PURE__*/_react["default"].createElement("span", {
            className: "block mt-2 mb-1"
          }, /*#__PURE__*/_react["default"].createElement("a", {
            href: props.href,
            target: "_blank",
            rel: "noreferrer",
            className: "block relative group overflow-hidden rounded border border-divider shadow-sm"
          }, /*#__PURE__*/_react["default"].createElement("img", {
            src: props.href,
            alt: "Generated Asset",
            className: "w-full h-auto object-cover transition-transform group-hover:scale-105"
          }), /*#__PURE__*/_react["default"].createElement("span", {
            className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
          })));
        }
        if (isVideo) {
          return /*#__PURE__*/_react["default"].createElement("span", {
            className: "block mt-2 mb-1"
          }, /*#__PURE__*/_react["default"].createElement("video", {
            src: props.href,
            controls: true,
            className: "w-full rounded border border-divider shadow-sm"
          }));
        }
        return /*#__PURE__*/_react["default"].createElement("a", _extends({}, props, {
          className: "text-primary hover:underline underline-offset-4 font-bold",
          target: "_blank",
          rel: "noreferrer"
        }));
      },
      div: function div(_ref13) {
        var node = _ref13.node,
          props = _objectWithoutProperties(_ref13, _excluded2);
        return /*#__PURE__*/_react["default"].createElement("div", props);
      },
      p: function p(_ref14) {
        var node = _ref14.node,
          props = _objectWithoutProperties(_ref14, _excluded3);
        return /*#__PURE__*/_react["default"].createElement("div", _extends({
          className: "mb-2 last:mb-0"
        }, props));
      },
      pre: function pre(_ref15) {
        var node = _ref15.node,
          props = _objectWithoutProperties(_ref15, _excluded4);
        return /*#__PURE__*/_react["default"].createElement("div", _extends({
          className: "my-3 overflow-x-auto rounded border border-divider"
        }, props));
      },
      code: function code(_ref16) {
        var node = _ref16.node,
          inline = _ref16.inline,
          className = _ref16.className,
          children = _ref16.children,
          props = _objectWithoutProperties(_ref16, _excluded5);
        var match = /language-(\w+)/.exec(className || '');
        return !inline && match ? /*#__PURE__*/_react["default"].createElement(SyntaxHighlighter, _extends({
          style: resolvedTheme === 'dark' ? _prism.oneDark : _prism.oneLight,
          language: match[1],
          showLineNumbers: true,
          PreTag: "div",
          className: "scrollbar-subtle !m-0 !p-3 text-[12px]"
        }, props), String(children).replace(/\n$/, '')) : /*#__PURE__*/_react["default"].createElement("code", _extends({
          className: "bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[12px] font-mono"
        }, props), children);
      }
    };
  }, [resolvedTheme]);

  // Sync assets to canvas once ref is ready — only push URLs not yet synced
  (0, _react.useEffect)(function () {
    if (!sessionId || assets.length === 0) return;
    var newAssets = assets.filter(function (a) {
      var syncKey = "".concat(a.asset_label || "no-label", "-").concat(a.url);
      return !syncedUrlsRef.current.has(syncKey);
    });
    if (newAssets.length === 0) return;
    var attempts = 0;
    var sync = function sync() {
      if (canvasRef.current) {
        newAssets.forEach(function (a) {
          var syncKey = "".concat(a.asset_label || "no-label", "-").concat(a.url);
          if (!a.url || syncedUrlsRef.current.has(syncKey)) return;
          syncedUrlsRef.current.add(syncKey);
          var kind = a.kind || (a.url.match(/\.(mp4|webm|mov)$/i) ? "video" : a.url.match(/\.(mp3|wav|ogg|m4a)$/i) ? "audio" : "image");
          var label = a.asset_label || null;
          if (kind === "image") canvasRef.current.addImage(a.url, undefined, undefined, undefined, undefined, undefined, label);else if (kind === "video") canvasRef.current.addVideo(a.url, undefined, undefined, undefined, undefined, undefined, label);else if (kind === "audio") canvasRef.current.addAudio(a.url, undefined, undefined, undefined, label);
        });
        return true;
      }
      return false;
    };
    if (!sync()) {
      var timer = setInterval(function () {
        attempts++;
        if (sync() || attempts > 20) clearInterval(timer);
      }, 500);
      return function () {
        return clearInterval(timer);
      };
    }
  }, [assets, sessionId]);
  var renameSession = /*#__PURE__*/function () {
    var _ref17 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
      var _sessions$find;
      var id,
        name,
        targetId,
        targetName,
        currentName,
        _args10 = arguments,
        _t1;
      return _regenerator().w(function (_context10) {
        while (1) switch (_context10.p = _context10.n) {
          case 0:
            id = _args10.length > 0 && _args10[0] !== undefined ? _args10[0] : null;
            name = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : null;
            targetId = id || sessionId;
            targetName = name || newName;
            currentName = id ? (_sessions$find = sessions.find(function (s) {
              return s.id === id;
            })) === null || _sessions$find === void 0 ? void 0 : _sessions$find.name : currentSessionName;
            if (!(!targetId || !targetName.trim() || targetName.trim() === currentName)) {
              _context10.n = 1;
              break;
            }
            setIsEditingName(false);
            setEditingSessionId(null);
            return _context10.a(2);
          case 1:
            _context10.p = 1;
            _context10.n = 2;
            return _axios["default"].patch("".concat(API, "/sessions/").concat(targetId), {
              name: targetName.trim()
            }, {
              headers: getHeaders()
            });
          case 2:
            if (targetId === sessionId) setCurrentSessionName(targetName.trim());
            setIsEditingName(false);
            setEditingSessionId(null);
            fetchSessions();
            _reactHotToast["default"].success("Session renamed");
            _context10.n = 4;
            break;
          case 3:
            _context10.p = 3;
            _t1 = _context10.v;
            _reactHotToast["default"].error("Failed to rename session");
            setIsEditingName(false);
            setEditingSessionId(null);
          case 4:
            return _context10.a(2);
        }
      }, _callee1, null, [[1, 3]]);
    }));
    return function renameSession() {
      return _ref17.apply(this, arguments);
    };
  }();
  var deleteSession = /*#__PURE__*/function () {
    var _ref18 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(id) {
      var _t10;
      return _regenerator().w(function (_context11) {
        while (1) switch (_context11.p = _context11.n) {
          case 0:
            if (window.confirm("Are you sure you want to delete this session?")) {
              _context11.n = 1;
              break;
            }
            return _context11.a(2);
          case 1:
            _context11.p = 1;
            _context11.n = 2;
            return _axios["default"]["delete"]("".concat(API, "/sessions/").concat(id), {
              headers: getHeaders()
            });
          case 2:
            _reactHotToast["default"].success("Session deleted");
            if (inEmbedMode) {
              if (id === sessionId) setActiveEmbedSession(null);
            } else {
              fetchSessions();
              if (id === sessionId) {
                router.push("/canvas");
              }
            }
            _context11.n = 4;
            break;
          case 3:
            _context11.p = 3;
            _t10 = _context11.v;
            _reactHotToast["default"].error("Failed to delete session");
          case 4:
            return _context11.a(2);
        }
      }, _callee10, null, [[1, 3]]);
    }));
    return function deleteSession(_x7) {
      return _ref18.apply(this, arguments);
    };
  }();
  var handleMouseMove = (0, _react.useCallback)(function (e) {
    if (!isResizing.current) return;
    var newWidth = window.innerWidth - e.clientX;
    if (newWidth > 300 && newWidth < 800) {
      setSidebarWidth(newWidth);
    }
  }, []);
  var stopResizing = (0, _react.useCallback)(function () {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, [handleMouseMove]);
  var startResizing = (0, _react.useCallback)(function (e) {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [handleMouseMove, stopResizing]);
  var selectMention = function selectMention(item, type) {
    var before = input.substring(0, mentionCursorPos);
    // mentionCursorPos is where @ is. query is after @.
    var after = input.substring(textareaRef.current.selectionStart);
    if (type === "skill") {
      setActiveSkill(item);
      setInput(before + after);
    } else {
      var insertion = "@".concat(item.asset_label);
      setInput(before + insertion + after);
    }
    setShowMentionPopup(false);
    setTimeout(function () {
      var _textareaRef$current;
      return (_textareaRef$current = textareaRef.current) === null || _textareaRef$current === void 0 ? void 0 : _textareaRef$current.focus();
    }, 10);
  };
  var copyToClipboard = /*#__PURE__*/function () {
    var _ref19 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(text) {
      var textArea, _t11;
      return _regenerator().w(function (_context12) {
        while (1) switch (_context12.p = _context12.n) {
          case 0:
            if (text) {
              _context12.n = 1;
              break;
            }
            return _context12.a(2);
          case 1:
            _context12.p = 1;
            if (!(navigator.clipboard && window.isSecureContext)) {
              _context12.n = 3;
              break;
            }
            _context12.n = 2;
            return navigator.clipboard.writeText(text);
          case 2:
            _reactHotToast["default"].success("Copied to clipboard");
            _context12.n = 4;
            break;
          case 3:
            textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand('copy');
              _reactHotToast["default"].success("Copied to clipboard");
            } catch (err) {
              _reactHotToast["default"].error("Failed to copy");
            }
            document.body.removeChild(textArea);
          case 4:
            _context12.n = 6;
            break;
          case 5:
            _context12.p = 5;
            _t11 = _context12.v;
            _reactHotToast["default"].error("Failed to copy");
          case 6:
            return _context12.a(2);
        }
      }, _callee11, null, [[1, 5]]);
    }));
    return function copyToClipboard(_x8) {
      return _ref19.apply(this, arguments);
    };
  }();
  var handleKey = function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  var filteredSkills = skills.filter(function (s) {
    return s.name.toLowerCase().includes(mentionQuery.toLowerCase());
  });
  var filteredAssets = assets.filter(function (a) {
    return (a.asset_label || "").toLowerCase().includes(mentionQuery.toLowerCase());
  });
  if (!mounted) return null;
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "h-dvh w-full text-sm flex flex-col bg-bg-page text-primary-text overflow-hidden",
    style: {
      fontFamily: "'Inter', sans-serif"
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactHotToast.Toaster, {
    position: "top-right",
    reverseOrder: false
  }), /*#__PURE__*/_react["default"].createElement("main", {
    className: "flex h-full w-full overflow-hidden"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex-shrink-0 flex flex-col bg-bg-card border-r border-divider shadow-[4px_0_12px_rgba(0,0,0,0.05)] z-20 transition-all duration-300 ".concat(showLeftSidebar || inEmbedMode ? 'overflow-hidden w-0' : 'w-64')
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "p-3 border-b border-divider flex items-center justify-between bg-bg-card/50"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2 overflow-hidden"
  }, /*#__PURE__*/_react["default"].createElement(_link["default"], {
    href: "/",
    className: "p-2 hover:bg-bg-page rounded text-secondary-text hover:text-primary transition-colors",
    title: "Go Back"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiArrowLeft, {
    size: 16
  })), /*#__PURE__*/_react["default"].createElement(_link["default"], {
    href: "/",
    className: "flex items-center flex-shrink-0 transition-transform duration-300 hover:scale-[1.02] active:scale-95",
    "aria-label": "Home"
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "font-bold text-lg"
  }, "Design Agent Studio"))), /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick() {
      return setShowLeftSidebar(!showLeftSidebar);
    },
    className: "p-1.5 rounded transition-colors ".concat(showLeftSidebar ? "bg-primary/10 text-primary" : "hover:bg-bg-card text-secondary-text hover:text-primary"),
    title: "Toggle Sessions"
  }, /*#__PURE__*/_react["default"].createElement(_vsc.VscLayoutSidebarLeftOff, {
    size: 16
  }))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex-1 overflow-y-auto scrollbar-subtle"
  }, sessions.length === 0 ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "px-4 py-8 text-center text-secondary-text italic text-[11px]"
  }, "No previous sessions") : sessions.map(function (s) {
    return /*#__PURE__*/_react["default"].createElement("div", {
      key: s.id,
      onMouseEnter: function onMouseEnter() {
        return setHoveredSessionId(s.id);
      },
      onMouseLeave: function onMouseLeave() {
        return setHoveredSessionId(null);
      },
      className: "relative w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all border-l-2 group\n                    ".concat(sessionId === s.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-bg-card-hover"),
      onClick: function onClick() {
        router.push("?session=".concat(s.id));
        setShowLeftSidebar(!showLeftSidebar);
      }
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex-1 min-w-0 pr-12"
    }, editingSessionId === s.id ? /*#__PURE__*/_react["default"].createElement("input", {
      autoFocus: true,
      className: "bg-bg-card border border-primary px-2 py-1 rounded text-xs focus:outline-none w-full",
      value: editingSessionName,
      onChange: function onChange(e) {
        return setEditingSessionName(e.target.value);
      },
      onBlur: function onBlur() {
        return renameSession(s.id, editingSessionName);
      },
      onKeyDown: function onKeyDown(e) {
        if (e.key === "Enter") renameSession(s.id, editingSessionName);
        if (e.key === "Escape") setEditingSessionId(null);
      },
      onClick: function onClick(e) {
        return e.stopPropagation();
      }
    }) : /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-2 text-[13px] font-semibold transition-colors ".concat(sessionId === s.id ? "text-primary" : "text-primary-text")
    }, /*#__PURE__*/_react["default"].createElement("span", {
      className: "truncate flex-1"
    }, s.name), /*#__PURE__*/_react["default"].createElement("span", {
      className: "flex items-center gap-1 text-[10px] text-secondary-text opacity-70"
    }, /*#__PURE__*/_react["default"].createElement(_fi.FiImage, {
      size: 10
    }), " ", s.asset_count))), hoveredSessionId === s.id && editingSessionId !== s.id && /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-0.5 animate-fade-in absolute right-2 top-1/2 -translate-y-1/2 bg-bg-card/90 backdrop-blur-sm pl-2 py-1 rounded-l shadow-[-12px_0_12px_rgba(0,0,0,0.1)]"
    }, /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick(e) {
        e.stopPropagation();
        setEditingSessionId(s.id);
        setEditingSessionName(s.name);
      },
      className: "p-1.5 hover:bg-bg-page rounded text-secondary-text hover:text-primary transition-colors",
      title: "Rename"
    }, /*#__PURE__*/_react["default"].createElement(_fi.FiEdit2, {
      size: 13
    })), /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick(e) {
        e.stopPropagation();
        deleteSession(s.id);
      },
      className: "p-1.5 hover:bg-red-500/10 rounded text-secondary-text hover:text-red-500 transition-colors",
      title: "Delete"
    }, /*#__PURE__*/_react["default"].createElement(_hi.HiOutlineTrash, {
      size: 14
    }))));
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "p-3 border-t border-divider bg-bg-page/30"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center justify-between text-[10px] text-secondary-text font-medium px-1"
  }, /*#__PURE__*/_react["default"].createElement("span", null, "Total Sessions"), /*#__PURE__*/_react["default"].createElement("span", null, sessions.length)))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex flex-col relative bg-bg-page flex-1 overflow-hidden"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex justify-between items-center z-10 p-2 border-b border-divider bg-bg-page"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "relative flex items-center gap-1"
  }, !inEmbedMode && /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick() {
      return setShowLeftSidebar(!showLeftSidebar);
    },
    className: "p-2 hover:bg-bg-card rounded transition-colors ".concat(showLeftSidebar ? "text-primary" : "hidden"),
    title: "Toggle Sessions"
  }, /*#__PURE__*/_react["default"].createElement(_vsc.VscLayoutSidebarLeftOff, {
    size: 18
  })), !inEmbedMode && /*#__PURE__*/_react["default"].createElement(_link["default"], {
    href: "/",
    className: "p-1.5 hover:bg-bg-card rounded text-secondary-text hover:text-primary transition-colors ".concat(!showLeftSidebar && "hidden"),
    title: "Go Back"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiArrowLeft, {
    size: 16
  })), inEmbedMode && /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick() {
      return setActiveEmbedSession(null);
    },
    className: "p-1.5 hover:bg-bg-card rounded text-secondary-text hover:text-primary transition-colors",
    title: "New chat"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiPlus, {
    size: 16
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2 text-primary-text p-1.5"
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "font-medium text-sm max-w-[200px] truncate"
  }, currentSessionName))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2"
  }, !inEmbedMode && /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2 h-8 border border-divider rounded bg-bg-page/30 overflow-hidden px-2"
  }, /*#__PURE__*/_react["default"].createElement("span", {
    suppressHydrationWarning: true,
    className: "font-bold text-xs flex items-center text-primary-text truncate"
  }, userBalanceLabel !== null && userBalanceLabel !== void 0 ? userBalanceLabel : "$ ".concat((user === null || user === void 0 ? void 0 : user.balance) || "0.00"))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "relative outline-none flex items-center gap-2 ".concat(inEmbedMode ? "hidden" : ""),
    tabIndex: -1,
    onBlur: function onBlur(e) {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setOpenProfile(false);
      }
    }
  }, /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick() {
      return setOpenProfile(!openProfile);
    },
    className: "w-8 h-8 rounded-full bg-primary/10 border border-primary flex items-center justify-center text-primary shadow-sm hover:bg-primary/20 transition-all overflow-hidden"
  }, user !== null && user !== void 0 && user.profile_photo ? /*#__PURE__*/_react["default"].createElement("img", {
    src: user.profile_photo,
    alt: "Profile",
    className: "w-full h-full object-cover"
  }) : /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[10px] font-bold"
  }, ((user === null || user === void 0 ? void 0 : user.username) || "U").substring(0, 2).toUpperCase())), !showChat && /*#__PURE__*/_react["default"].createElement("button", {
    onClick: handleToggleSidebar,
    className: "w-8 h-8 rounded-full rotate-270 hover:bg-bg-page hover:text-primary-text transition-all flex items-center justify-center text-secondary-text z-[60]",
    title: "Open Chat"
  }, /*#__PURE__*/_react["default"].createElement(_hi.HiOutlineArrowUpTray, {
    size: 18
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute top-full right-0 mt-2 w-64 bg-bg-card border border-divider rounded shadow-2xl z-[100] py-1 transition-all duration-200 origin-top-right ".concat(openProfile ? "opacity-100 scale-100 visible translate-y-0" : "opacity-0 scale-95 invisible translate-y-2")
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "px-4 py-3 border-b border-divider flex flex-col"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center justify-between mb-1"
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-sm font-bold text-primary-text truncate"
  }, (user === null || user === void 0 ? void 0 : user.username) || "User"), (user === null || user === void 0 ? void 0 : user.plan) === "pro" ? /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white uppercase tracking-wider"
  }, "Pro") : /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500 uppercase tracking-wider"
  }, "Bronze")), /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[11px] text-secondary-text truncate"
  }, user === null || user === void 0 ? void 0 : user.email), /*#__PURE__*/_react["default"].createElement("div", {
    className: "mt-2 text-[13px] font-bold text-primary"
  }, userBalanceLabel !== null && userBalanceLabel !== void 0 ? userBalanceLabel : "$ ".concat((user === null || user === void 0 ? void 0 : user.balance) || "0.00"), " ", /*#__PURE__*/_react["default"].createElement("span", {
    className: "font-normal text-secondary-text"
  }, "available"))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "py-1"
  }, /*#__PURE__*/_react["default"].createElement("a", {
    href: "mailto:support@opraiz.com",
    className: "w-full flex items-center gap-3 px-4 py-2 hover:bg-bg-page transition-colors text-[13px] font-semibold text-primary-text"
  }, "Support")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "h-px bg-divider w-full my-1"
  }), /*#__PURE__*/_react["default"].createElement("div", {
    className: "py-1"
  }, /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick(e) {
      e.stopPropagation();
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    },
    className: "w-full flex items-center justify-between px-4 py-2 hover:bg-bg-page transition-colors text-[13px] font-semibold text-primary-text"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-secondary-text"
  }, resolvedTheme === "dark" ? /*#__PURE__*/_react["default"].createElement(_fi.FiSun, {
    size: 15
  }) : /*#__PURE__*/_react["default"].createElement(_fi.FiMoon, {
    size: 15
  })), "Dark Mode"), /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-8 h-4 rounded-full relative transition-colors ".concat(resolvedTheme === "dark" ? "bg-primary" : "bg-bg-card-hover")
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute top-0.5 w-3 h-3 rounded-full bg-black dark:bg-white transition-all ".concat(resolvedTheme === "dark" ? "left-4.5" : "left-0.5")
  })))))))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex-1 relative overflow-hidden bg-bg-page/50 w-full"
  }, /*#__PURE__*/_react["default"].createElement(CanvasArea, {
    ref: canvasRef,
    theme: resolvedTheme,
    activeTasks: activeTasks,
    setActiveTasks: setActiveTasks,
    onZoomChange: setZoomLevel
  }), /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-bg-card border border-divider shadow-2xl px-2 py-1.5 rounded z-20"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-3 px-3"
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[10px] font-bold text-secondary-text uppercase tracking-widest"
  }, zoomLevel, "%"), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick() {
      var _canvasRef$current5;
      return (_canvasRef$current5 = canvasRef.current) === null || _canvasRef$current5 === void 0 ? void 0 : _canvasRef$current5.zoomOut();
    },
    className: "w-5 h-5 rounded border border-divider flex items-center justify-center text-secondary-text hover:text-primary-text hover:border-primary transition-all"
  }, "-"), /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick() {
      var _canvasRef$current6;
      return (_canvasRef$current6 = canvasRef.current) === null || _canvasRef$current6 === void 0 ? void 0 : _canvasRef$current6.zoomIn();
    },
    className: "w-5 h-5 rounded border border-divider flex items-center justify-center text-secondary-text hover:text-primary-text hover:border-primary transition-all"
  }, "+")))))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "h-full cursor-col-resize hover:bg-primary w-1 transition-all z-10 group relative flex items-center justify-center",
    onMouseDown: startResizing
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "z-10 w-3 h-8 rounded-full bg-bg-card border border-divider shadow-sm flex flex-col items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity translate-x-[-0.5px]"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-0.5 h-0.5 rounded-full bg-primary-text"
  }), /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-0.5 h-0.5 rounded-full bg-primary-text"
  }), /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-0.5 h-0.5 rounded-full bg-primary-text"
  }))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex-shrink-0 flex flex-col bg-bg-card border-l border-divider shadow-[-10px_0_20px_rgba(0,0,0,0.02)] z-20 transition-all duration-300 ".concat(!showChat ? 'overflow-hidden' : ''),
    style: {
      width: sidebarWidth
    }
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "p-4 flex items-center justify-between border-b border-divider bg-bg-card"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex flex-col"
  }, /*#__PURE__*/_react["default"].createElement("h2", {
    className: "font-bold text-[13px] text-primary-text uppercase tracking-widest leading-none flex items-center gap-2"
  }, /*#__PURE__*/_react["default"].createElement(_ri.RiSparklingLine, {
    className: "text-primary"
  }), " Creative Agent"), /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[10px] text-secondary-text mt-1.5"
  }, "Auto Model \u2022 Multi-tool Access")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/_react["default"].createElement(_link["default"], {
    href: "https://muapi.ai/docs/design-agent-api",
    target: "_blank",
    className: "p-1.5 hover:bg-bg-page hover:text-primary-text transition-colors rounded text-secondary-text",
    title: "API Docs"
  }, /*#__PURE__*/_react["default"].createElement(_cg.CgTerminal, {
    size: 16
  })), sessionId && /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick() {
      if (inEmbedMode) setActiveEmbedSession(null);else router.push("/canvas");
    },
    className: "p-1.5 hover:bg-bg-page hover:text-primary-text transition-colors rounded text-secondary-text",
    title: "New Session"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiPlus, {
    size: 16
  })), /*#__PURE__*/_react["default"].createElement("button", {
    onClick: handleToggleSidebar,
    className: "w-8 h-8 rounded-full transition-all flex items-center justify-center shrink-0 ".concat(showChat ? "bg-primary/10 text-primary" : "hover:bg-bg-page text-secondary-text hover:text-primary"),
    title: showChat ? "Hide Chat" : "Open Chat"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiLayout, {
    size: 16
  })))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex-1 overflow-y-auto p-4 space-y-6 scrollbar-subtle"
  }, messages.map(function (msg, idx) {
    if (!msg) return null;
    var prevMsg = idx > 0 ? messages[idx - 1] : null;
    var showDateHeader = msg.timestamp && (!prevMsg || !prevMsg.timestamp || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString());
    return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, {
      key: idx
    }, showDateHeader && msg.timestamp && /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex justify-center my-4"
    }, /*#__PURE__*/_react["default"].createElement("span", {
      className: "px-2 py-1 bg-bg-page border border-divider rounded text-[10px] font-medium text-secondary-text shadow-sm"
    }, formatDateHeader(msg.timestamp))), /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex flex-col gap-2 ".concat(msg.role === "user" ? "items-end" : "items-start", " animate-fade-in-up group")
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-2"
    }, msg.role === "assistant" && /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-1.5 text-[10px] font-medium text-secondary-text ml-1"
    }, /*#__PURE__*/_react["default"].createElement(_ri.RiRobot2Line, null), " Agent"), /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center justify-end gap-2 text-[9px] text-secondary-text"
    }, msg.timestamp && /*#__PURE__*/_react["default"].createElement("span", null, formatTime(msg.timestamp))), msg.role === "user" && msg.skill_name && /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary w-fit ml-auto"
    }, /*#__PURE__*/_react["default"].createElement(_ri.RiSparklingLine, {
      size: 10
    }), " ", msg.skill_name)), /*#__PURE__*/_react["default"].createElement("div", {
      className: "max-w-[90%] space-y-2 ".concat(msg.role === "user" ? "text-right" : "text-left")
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "relative"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "px-3 py-2 text-[13px] leading-relaxed break-words relative\n                          ".concat(msg.role === "user" ? "bg-bg-card-hover text-primary-text rounded-md rounded-tr-none shadow-sm border border-divider" : "text-primary-text bg-bg-page rounded-md rounded-tl-none shadow-sm border border-divider")
    }, msg.content ? msg.role === "assistant" ? /*#__PURE__*/_react["default"].createElement("div", {
      className: "prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/30"
    }, /*#__PURE__*/_react["default"].createElement(_reactMarkdown["default"], {
      remarkPlugins: [_remarkGfm["default"]],
      components: markdownComponents
    }, msg.content)) : /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex flex-col gap-2"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "prose dark:prose-invert max-w-none text-primary-text prose-p:leading-relaxed"
    }, /*#__PURE__*/_react["default"].createElement(_reactMarkdown["default"], {
      remarkPlugins: [_remarkGfm["default"]],
      components: markdownComponents
    }, msg.content)), msg.attachments && msg.attachments.length > 0 && /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex flex-col gap-2 mt-2 w-full"
    }, msg.attachments.map(function (att) {
      return /*#__PURE__*/_react["default"].createElement("div", {
        key: att.asset_label,
        className: "relative w-full rounded border border-white/20 overflow-hidden shadow-sm bg-black/10"
      }, att.kind === "image" && /*#__PURE__*/_react["default"].createElement("img", {
        src: att.url,
        alt: att.asset_label,
        className: "w-full max-h-64 object-contain"
      }), att.kind === "video" && /*#__PURE__*/_react["default"].createElement("video", {
        src: att.url,
        controls: true,
        className: "w-full max-h-64 object-contain"
      }), att.kind === "audio" && /*#__PURE__*/_react["default"].createElement("div", {
        className: "p-2"
      }, /*#__PURE__*/_react["default"].createElement("audio", {
        src: att.url,
        controls: true,
        className: "w-full"
      })), !["image", "video", "audio"].includes(att.kind) && /*#__PURE__*/_react["default"].createElement("div", {
        className: "w-full p-4 flex items-center justify-center text-[10px] text-white/70"
      }, att.kind, ": ", att.asset_label));
    }))) : msg.role === "assistant" && busy && /*#__PURE__*/_react["default"].createElement(TypingDots, null), (msg.events || []).filter(function (e) {
      return e && ["tool_call", "tool_result", "plan_propose", "error", "info"].includes(e.type);
    }).map(function (ev, i) {
      return /*#__PURE__*/_react["default"].createElement(EventPill, {
        key: i,
        event: _objectSpread(_objectSpread({}, ev), {}, {
          onAction: handleJobAction
        })
      });
    })), /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick() {
        return copyToClipboard(msg.content);
      },
      className: "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-bg-card border border-divider shadow-md hover:text-primary z-10\n                            ".concat(msg.role === "user" ? "right-full mr-2" : "left-full ml-2"),
      title: "Copy Message"
    }, /*#__PURE__*/_react["default"].createElement(_fi.FiCopy, {
      size: 12
    }))))));
  }), /*#__PURE__*/_react["default"].createElement("div", {
    ref: chatEndRef
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "p-2 bg-bg-card"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    className: "rounded border bg-bg-card shadow-sm flex flex-col transition-all relative\n                ".concat(isDragging ? "border-dashed border-primary bg-primary/5 ring-4 ring-primary/10" : "", "\n                ").concat(busy ? "border-primary ring-1 ring-primary/20" : "border-divider focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary")
  }, activeSkill && /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2 p-1 animate-fade-in-up"
  }, /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick() {
      return setActiveSkill(null);
    },
    className: "flex items-center gap-1.5 px-2 py-1 rounded-full bg-bg-page border border-divider text-xs hover:bg-red-500 hover:text-white transition-colors"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiX, {
    size: 12
  }), /*#__PURE__*/_react["default"].createElement("span", null, activeSkill.name))), isDragging && /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute inset-0 z-50 flex items-center justify-center bg-primary/5 backdrop-blur-[1px] pointer-events-none rounded"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "bg-primary/10 p-4 rounded-full border-2 border-primary animate-pulse"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiUpload, {
    className: "text-primary",
    size: 32
  }))), showMentionPopup && /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute bottom-full left-0 mb-2 flex items-end gap-3 z-50"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-72 bg-bg-card border border-divider rounded shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "p-2 border-b border-divider text-[10px] font-bold text-secondary-text uppercase tracking-widest bg-bg-page/50"
  }, "Mentions"), /*#__PURE__*/_react["default"].createElement("div", {
    className: "max-h-60 overflow-y-auto scrollbar-subtle py-1"
  }, filteredAssets.length > 0 && /*#__PURE__*/_react["default"].createElement("div", {
    className: "px-3 py-1.5 mt-1 text-[9px] font-bold text-green-500 uppercase opacity-60"
  }, "Assets"), /*#__PURE__*/_react["default"].createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, filteredAssets.map(function (asset) {
    return /*#__PURE__*/_react["default"].createElement("button", {
      key: asset.asset_label,
      onClick: function onClick() {
        return selectMention(asset, "asset");
      },
      className: "w-full text-left px-3 py-2 hover:bg-bg-page transition-colors flex items-center gap-2 group rounded"
    }, asset.kind === "image" && /*#__PURE__*/_react["default"].createElement("img", {
      src: asset.url,
      className: "w-7 h-7 rounded border border-divider object-cover shadow-sm"
    }), asset.kind === "video" && /*#__PURE__*/_react["default"].createElement("video", {
      src: asset.url,
      className: "w-7 h-7 rounded border border-divider object-cover shadow-sm"
    }), asset.kind === "audio" && /*#__PURE__*/_react["default"].createElement("div", {
      className: "w-7 h-7 rounded flex items-center justify-center bg-primary/5 text-primary text-[8px] font-bold uppercase tracking-tight"
    }, "Audio"), /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex flex-col"
    }, /*#__PURE__*/_react["default"].createElement("span", {
      className: "text-xs font-medium text-primary-text"
    }, asset.asset_label), /*#__PURE__*/_react["default"].createElement("span", {
      className: "text-[9px] text-secondary-text truncate max-w-[200px]"
    }, asset.kind)));
  })), filteredSkills.length > 0 && /*#__PURE__*/_react["default"].createElement("div", {
    className: "px-3 py-1.5 text-[9px] font-bold text-primary uppercase opacity-60"
  }, "Skills"), filteredSkills.map(function (skill) {
    return /*#__PURE__*/_react["default"].createElement("button", {
      key: skill.name,
      onClick: function onClick() {
        return selectMention(skill, "skill");
      },
      className: "w-full text-left px-3 py-2 hover:bg-bg-page transition-colors flex items-center gap-2 group"
    }, /*#__PURE__*/_react["default"].createElement(_ri.RiSparklingLine, {
      size: 12,
      className: "text-primary opacity-50 group-hover:opacity-100"
    }), /*#__PURE__*/_react["default"].createElement("span", {
      className: "text-xs font-medium text-primary-text"
    }, skill.name));
  }), filteredSkills.length === 0 && filteredAssets.length === 0 && /*#__PURE__*/_react["default"].createElement("div", {
    className: "px-4 py-8 text-center text-secondary-text text-xs italic opacity-50"
  }, "No matches found")))), /*#__PURE__*/_react["default"].createElement("textarea", {
    ref: textareaRef,
    value: input,
    autoFocus: true,
    onChange: function onChange(e) {
      var val = e.target.value;
      var pos = e.target.selectionStart;
      setInput(val);

      // Simple mention detection: check if last char before cursor is @ or if we are already in mention mode
      var lastAtPos = val.lastIndexOf("@", pos - 1);
      if (lastAtPos !== -1 && (lastAtPos === 0 || val[lastAtPos - 1] === " ")) {
        var query = val.substring(lastAtPos + 1, pos);
        if (!query.includes(" ")) {
          setMentionQuery(query);
          setMentionCursorPos(lastAtPos);
          setShowMentionPopup(true);
        } else {
          setShowMentionPopup(false);
        }
      } else {
        setShowMentionPopup(false);
      }
    },
    onKeyDown: handleKey,
    onInput: function onInput(e) {
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    },
    placeholder: activeSkill ? "Oh, Let us create ".concat(activeSkill.name.toLowerCase(), "s, start with your ").concat(((_activeSkill$inputs = activeSkill.inputs) === null || _activeSkill$inputs === void 0 || (_activeSkill$inputs = _activeSkill$inputs[0]) === null || _activeSkill$inputs === void 0 ? void 0 : _activeSkill$inputs.replace(/_/g, ' ')) || 'idea', "?") : "Start with an idea or mention assets using @...",
    className: "w-full bg-transparent px-3 py-3 text-[13px] resize-none focus:outline-none min-h-[50px] max-h-[120px] scrollbar-subtle",
    rows: 1,
    disabled: busy
  }), (uploading || attachments.length > 0 || input.includes("@")) && /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex flex-wrap gap-2 border-b px-3 border-divider bg-bg-page/20"
  }, attachments.map(function (att) {
    return /*#__PURE__*/_react["default"].createElement("div", {
      key: att.asset_label,
      className: "relative group flex items-center gap-2 px-2 py-1 bg-bg-card border border-divider rounded-lg shadow-sm cursor-help transition-all hover:border-primary",
      onMouseEnter: function onMouseEnter() {
        return setHoveredAsset(att);
      },
      onMouseLeave: function onMouseLeave() {
        return setHoveredAsset(null);
      }
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "w-5 h-5 rounded overflow-hidden"
    }, att.kind === "image" ? /*#__PURE__*/_react["default"].createElement("img", {
      src: att.url,
      className: "w-full h-full object-cover"
    }) : /*#__PURE__*/_react["default"].createElement(_fi.FiTerminal, {
      size: 10
    })), /*#__PURE__*/_react["default"].createElement("span", {
      className: "text-[10px] font-bold text-secondary-text"
    }, att.asset_label));
  }), assets.filter(function (a) {
    return input.includes("@".concat(a.asset_label)) && !attachments.find(function (att) {
      return att.asset_label === a.asset_label;
    });
  }).map(function (a) {
    return /*#__PURE__*/_react["default"].createElement("div", {
      key: a.asset_label,
      className: "relative group flex items-center gap-2 px-2 py-1 bg-primary/5 border border-primary rounded-lg shadow-sm cursor-help transition-all hover:border-primary",
      onMouseEnter: function onMouseEnter() {
        return setHoveredAsset(a);
      },
      onMouseLeave: function onMouseLeave() {
        return setHoveredAsset(null);
      }
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "w-5 h-5 rounded overflow-hidden bg-primary/10 flex items-center justify-center text-primary"
    }, a.kind === "image" ? /*#__PURE__*/_react["default"].createElement("img", {
      src: a.url,
      className: "w-full h-full object-cover"
    }) : a.kind === "video" ? /*#__PURE__*/_react["default"].createElement("video", {
      src: a.url,
      className: "w-full h-full object-cover"
    }) : a.kind === "audio" ? /*#__PURE__*/_react["default"].createElement("audio", {
      src: a.url,
      className: "w-full h-full object-cover"
    }) : /*#__PURE__*/_react["default"].createElement(_ri.RiSparklingLine, {
      size: 10
    })), /*#__PURE__*/_react["default"].createElement("span", {
      className: "text-[10px] font-bold text-primary"
    }, a.asset_label));
  }), uploading && /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-2 px-2 py-1 bg-bg-page border border-divider border-dashed rounded-lg"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin"
  }), /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-[10px] font-bold text-secondary-text"
  }, uploadProgress, "%"))), hoveredAsset && /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute bottom-full left-4 w-72 aspect-square bg-bg-card border border-divider rounded-md shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
  }, hoveredAsset.kind === "image" ? /*#__PURE__*/_react["default"].createElement("img", {
    src: hoveredAsset.url,
    className: "w-full h-full object-cover"
  }) : hoveredAsset.kind === "video" ? /*#__PURE__*/_react["default"].createElement("video", {
    src: hoveredAsset.url,
    className: "w-full h-full object-cover",
    autoPlay: true,
    muted: true,
    loop: true
  }) : /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-full h-full flex flex-col items-center justify-center gap-3 bg-bg-page"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiTerminal, {
    size: 32
  })), /*#__PURE__*/_react["default"].createElement("span", {
    className: "text-xs font-bold text-secondary-text uppercase tracking-widest"
  }, hoveredAsset.kind, " Preview")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-sm font-bold text-white tracking-tight"
  }, hoveredAsset.asset_label), /*#__PURE__*/_react["default"].createElement("div", {
    className: "text-[10px] text-white/70 mt-1 uppercase tracking-widest font-bold"
  }, hoveredAsset.kind, " \u2022 Creative Asset"))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "px-3 pb-2 flex items-center justify-between"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/_react["default"].createElement("input", {
    type: "file",
    className: "hidden",
    ref: fileInputRef,
    accept: "image/*,video/*,audio/*",
    onChange: handleFileUpload
  }), /*#__PURE__*/_react["default"].createElement("button", {
    type: "button",
    onClick: function onClick() {
      var _fileInputRef$current;
      return (_fileInputRef$current = fileInputRef.current) === null || _fileInputRef$current === void 0 ? void 0 : _fileInputRef$current.click();
    },
    disabled: uploading,
    className: "p-1.5 rounded hover:bg-bg-page text-secondary-text transition-all",
    title: "Upload Image"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiUpload, {
    size: 16
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "relative",
    tabIndex: -1,
    onBlur: function onBlur(e) {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setShowSkillsMenu(false);
      }
    }
  }, /*#__PURE__*/_react["default"].createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setShowSkillsMenu(!showSkillsMenu);
    },
    className: "p-1.5 rounded hover:bg-bg-page transition-all flex items-center gap-1.5\n                        ".concat(showSkillsMenu ? "bg-bg-page text-primary shadow-inner" : "text-secondary-text"),
    title: "Agent Skills"
  }, /*#__PURE__*/_react["default"].createElement(_go.GoBook, {
    size: 16
  })), showSkillsMenu && /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[320px] bg-bg-card border border-divider rounded shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "px-4 py-3 border-b border-divider flex items-center justify-between bg-bg-page/30"
  }, /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("h3", {
    className: "text-[12px] font-bold text-primary-text uppercase tracking-tight"
  }, "Expert Skills")), /*#__PURE__*/_react["default"].createElement(_link["default"], {
    href: "https://muapi.ai/docs/design-agent-api",
    target: "_blank",
    className: "text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
  }, /*#__PURE__*/_react["default"].createElement(_cg.CgTerminal, {
    size: 10
  }), "API Docs")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "max-h-80 overflow-y-auto p-1.5 scrollbar-subtle"
  }, skills.map(function (skill) {
    return /*#__PURE__*/_react["default"].createElement("button", {
      key: skill.name,
      onClick: function onClick() {
        var _textareaRef$current2;
        setActiveSkill(skill);
        setShowSkillsMenu(false);
        (_textareaRef$current2 = textareaRef.current) === null || _textareaRef$current2 === void 0 || _textareaRef$current2.focus();
      },
      className: "w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-bg-page transition-all text-left group ".concat((activeSkill === null || activeSkill === void 0 ? void 0 : activeSkill.name) === skill.name ? "bg-primary/5 border border-primary" : "border border-transparent")
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "w-8 h-8 rounded flex items-center justify-center transition-colors shadow-sm ".concat((activeSkill === null || activeSkill === void 0 ? void 0 : activeSkill.name) === skill.name ? "bg-primary text-white" : "bg-bg-page text-primary border border-divider group-hover:bg-primary group-hover:text-white")
    }, /*#__PURE__*/_react["default"].createElement(_ri.RiSparklingLine, {
      size: 16
    })), /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex-1 min-w-0"
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "font-bold capitalize text-[12px] transition-colors ".concat((activeSkill === null || activeSkill === void 0 ? void 0 : activeSkill.name) === skill.name ? "text-primary" : "text-primary-text group-hover:text-primary")
    }, skill.name), /*#__PURE__*/_react["default"].createElement("div", {
      className: "text-[10px] text-secondary-text mt-0.5 line-clamp-1 opacity-70 italic"
    }, skill.description || "Specialized workflow")));
  })), /*#__PURE__*/_react["default"].createElement("div", {
    className: "p-2.5 bg-bg-page/50 border-t border-divider text-center"
  }, /*#__PURE__*/_react["default"].createElement("button", {
    onClick: function onClick() {
      return setShowSkillsMenu(false);
    },
    className: "text-[10px] font-bold text-secondary-text hover:text-primary-text transition-colors"
  }, "Dismiss")))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "relative",
    tabIndex: -1,
    onBlur: function onBlur(e) {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setShowAssetsMenu(false);
      }
    }
  }, /*#__PURE__*/_react["default"].createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setShowAssetsMenu(!showAssetsMenu);
    },
    className: "p-1.5 rounded hover:bg-bg-page transition-all flex items-center gap-1.5\n                        ".concat(showAssetsMenu ? "bg-bg-page text-primary shadow-inner" : "text-secondary-text"),
    title: "Session Assets"
  }, /*#__PURE__*/_react["default"].createElement(_fi.FiImage, {
    size: 16
  })), showAssetsMenu && /*#__PURE__*/_react["default"].createElement("div", {
    className: "absolute bottom-full right-0 mb-2 w-72 bg-bg-card border border-divider rounded shadow-2xl z-30 animate-fade-in-up"
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "p-2 mb-2 border-b border-divider text-[10px] font-bold text-secondary-text flex items-center justify-between"
  }, /*#__PURE__*/_react["default"].createElement("span", null, "Session Assets"), /*#__PURE__*/_react["default"].createElement("span", {
    className: "opacity-50"
  }, assets.length, " items")), /*#__PURE__*/_react["default"].createElement("div", {
    className: "max-h-80 overflow-y-auto scrollbar-subtle p-2 grid grid-cols-3 gap-2"
  }, assets.length === 0 ? /*#__PURE__*/_react["default"].createElement("div", {
    className: "col-span-3 py-8 text-center text-secondary-text text-[10px] italic"
  }, "No assets generated yet") : assets.map(function (asset, i) {
    return /*#__PURE__*/_react["default"].createElement("div", {
      key: i,
      onClick: function onClick(e) {
        var _textareaRef$current3;
        e.stopPropagation();
        setInput(function (prev) {
          return prev + (prev ? " " : "") + asset.asset_label;
        });
        setShowAssetsMenu(false);
        (_textareaRef$current3 = textareaRef.current) === null || _textareaRef$current3 === void 0 || _textareaRef$current3.focus();
      },
      className: "group relative aspect-square rounded border border-divider overflow-hidden bg-bg-page/50 hover:border-primary transition-all cursor-pointer"
    }, asset.kind === "image" && /*#__PURE__*/_react["default"].createElement("img", {
      src: asset.url,
      className: "w-full h-full object-cover"
    }), asset.kind === "video" && /*#__PURE__*/_react["default"].createElement("video", {
      src: asset.url,
      className: "w-full h-full object-cover"
    }), asset.kind === "audio" && /*#__PURE__*/_react["default"].createElement("div", {
      className: "w-full h-full flex items-center justify-center bg-primary/5 text-primary text-[8px] font-bold uppercase tracking-tight"
    }, "Audio"), /*#__PURE__*/_react["default"].createElement("div", {
      className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center"
    }, /*#__PURE__*/_react["default"].createElement("span", {
      className: "text-[10px] text-white font-bold truncate w-full mb-1"
    }, asset.asset_label)));
  }))))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/_react["default"].createElement("button", {
    type: "button",
    onClick: function onClick() {
      return sendMessage();
    },
    disabled: busy || !input.trim() && attachments.length === 0,
    className: "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ml-1\n                      ".concat(busy || !input.trim() && attachments.length === 0 ? "bg-[var(--bg-card-hover)] text-[var(--text-muted)] cursor-not-allowed" : "bg-primary text-white hover:scale-105")
  }, busy ? /*#__PURE__*/_react["default"].createElement(_bi.BiLoaderAlt, {
    size: 14,
    className: "animate-spin"
  }) : /*#__PURE__*/_react["default"].createElement(_fi.FiSend, {
    size: 14
  })))))))));
}

// ── Event pills ────────────────────────────────────────────────────────────────
var TOOL_ICONS = {
  generate_image: "🎨",
  edit_image: "✏️",
  generate_video: "🎬",
  image_to_video: "🎥",
  edit_video: "🎞️",
  lipsync_video: "💋",
  concat_videos: "🔗",
  generate_audio: "🎵",
  enhance_image: "✨",
  upload_file: "📤",
  list_models: "📚",
  ask_user: "❓",
  propose_plan: "📋",
  list_assets: "📁",
  get_asset: "🔍",
  remaining_budget: "💰"
};
function EventPill(_ref20) {
  var event = _ref20.event;
  if (event.type === "tool_call") return /*#__PURE__*/_react["default"].createElement("div", {
    className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-primary/10 border border-primary text-primary text-[11px] mt-1 shadow-sm"
  }, /*#__PURE__*/_react["default"].createElement("span", null, TOOL_ICONS[event.name] || "🔧"), /*#__PURE__*/_react["default"].createElement("span", {
    className: "font-semibold"
  }, event.name));
  if (event.type === "tool_result") {
    var _event$result, _event$result2, _event$result3, _event$result4;
    var ok = ((_event$result = event.result) === null || _event$result === void 0 ? void 0 : _event$result.ok) !== false;
    var model = (_event$result2 = event.result) === null || _event$result2 === void 0 ? void 0 : _event$result2.model;
    if (event.name === "ask_user" && (_event$result3 = event.result) !== null && _event$result3 !== void 0 && _event$result3.ask_user) {
      var choices = event.result.choices || [];
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "px-3 py-2 rounded bg-bg-page border border-primary text-[12px] mt-1 shadow-sm"
      }, /*#__PURE__*/_react["default"].createElement("div", {
        className: "font-semibold text-primary mb-1"
      }, "\u2753 ", event.result.question), choices.length > 0 && /*#__PURE__*/_react["default"].createElement("div", {
        className: "flex flex-col gap-1 mt-1"
      }, choices.map(function (c, i) {
        return /*#__PURE__*/_react["default"].createElement("div", {
          key: i,
          className: "text-secondary-text"
        }, i + 1, ". ", c);
      })), /*#__PURE__*/_react["default"].createElement("div", {
        className: "text-[10px] text-secondary-text mt-1.5 italic"
      }, "Reply to continue."));
    }
    return /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] border mt-1 shadow-sm ".concat(ok ? "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]" : "bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error)]")
    }, ok ? /*#__PURE__*/_react["default"].createElement(_fi.FiCheck, {
      size: 11
    }) : /*#__PURE__*/_react["default"].createElement(_fi.FiX, {
      size: 11
    }), /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-2 flex-1 min-w-0"
    }, /*#__PURE__*/_react["default"].createElement("span", {
      className: "font-semibold"
    }, ok ? event.asset ? "Generated ".concat(event.asset.kind) : "Done" : "Failed"), ok && model && /*#__PURE__*/_react["default"].createElement("span", {
      className: "text-[9px] font-bold uppercase tracking-tight opacity-80"
    }, model), !ok && ((_event$result4 = event.result) === null || _event$result4 === void 0 ? void 0 : _event$result4.error) && /*#__PURE__*/_react["default"].createElement("span", {
      className: "text-[9px] opacity-70 truncate max-w-[160px]",
      title: event.result.error
    }, "\u21BA ", String(event.result.error).replace(/^\w+Error:\s*/i, "").substring(0, 60))));
  }
  if (event.type === "plan_propose") {
    if (event.handled) return null;
    return /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex flex-col gap-2"
    }, /*#__PURE__*/_react["default"].createElement(_PlanVisualizer["default"], {
      plan: event
    }), /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-2 px-2 pb-2"
    }, /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick() {
        var _event$onAction;
        return (_event$onAction = event.onAction) === null || _event$onAction === void 0 ? void 0 : _event$onAction.call(event, event.job_id, "approve");
      },
      className: "flex-1 py-2 rounded bg-primary text-white text-[12px] font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
    }, /*#__PURE__*/_react["default"].createElement(_fi.FiCheck, null), " Approve & Execute"), /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick() {
        var _event$onAction2;
        return (_event$onAction2 = event.onAction) === null || _event$onAction2 === void 0 ? void 0 : _event$onAction2.call(event, event.job_id, "reject");
      },
      className: "px-4 py-2 rounded bg-bg-card border border-divider text-secondary-text text-[12px] hover:bg-bg-page transition-all"
    }, "Cancel")));
  }
  if (event.type === "info") {
    var _event$content, _event$content2;
    // If this is an approval request, check if we should show buttons.
    // We avoid showing buttons on the info pill if there's a detailed plan_propose 
    // card already handling the approval for this job.
    var isApproval = event.needs_approval || ((_event$content = event.content) === null || _event$content === void 0 ? void 0 : _event$content.includes("Waiting for approval")) || ((_event$content2 = event.content) === null || _event$content2 === void 0 ? void 0 : _event$content2.includes("Awaiting confirmation"));

    // If it's already handled, we might want to hide it or show it as a simple label
    if (event.handled && isApproval) return null;
    return /*#__PURE__*/_react["default"].createElement("div", {
      className: "px-3 py-2 rounded border text-[11px] mt-1 shadow-sm flex items-center justify-between ".concat(isApproval ? "bg-primary/5 border-primary" : "bg-bg-page border-divider")
    }, /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-2 ".concat(isApproval ? "text-primary" : "text-secondary-text")
    }, isApproval ? /*#__PURE__*/_react["default"].createElement(_fi.FiAlertCircle, {
      size: 14,
      className: "animate-pulse"
    }) : /*#__PURE__*/_react["default"].createElement(_fi.FiTerminal, {
      size: 12,
      className: "opacity-50"
    }), /*#__PURE__*/_react["default"].createElement("span", {
      className: "flex-1"
    }, event.content)), isApproval && !event.handled && /*#__PURE__*/_react["default"].createElement("div", {
      className: "flex items-center gap-1 ml-4"
    }, /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick() {
        var _event$onAction3;
        return (_event$onAction3 = event.onAction) === null || _event$onAction3 === void 0 ? void 0 : _event$onAction3.call(event, event.job_id, "approve");
      },
      className: "px-2 py-1 rounded bg-primary text-white text-[10px] font-bold hover:brightness-110 transition-all"
    }, "Approve"), /*#__PURE__*/_react["default"].createElement("button", {
      onClick: function onClick() {
        var _event$onAction4;
        return (_event$onAction4 = event.onAction) === null || _event$onAction4 === void 0 ? void 0 : _event$onAction4.call(event, event.job_id, "reject");
      },
      className: "px-2 py-1 rounded bg-bg-card border border-divider text-secondary-text text-[10px] hover:bg-bg-page transition-all"
    }, "Reject")));
  }
  if (event.type === "error") return /*#__PURE__*/_react["default"].createElement("div", {
    className: "px-2.5 py-1.5 rounded bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error)] text-[11px] mt-1 shadow-sm"
  }, "\u274C ", event.message);
  return null;
}