'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _style = require('./style');

var _style2 = _interopRequireDefault(_style);

var _pile = require('./pile');

var _pile2 = _interopRequireDefault(_pile);

function noopStyler() {
  return { style: [] };
}
function noopTransformer(prop) {
  return prop;
}

function factory(parentStyler, sheet, stylesTransformer, propsTransformer) {
  if (sheet === undefined) sheet = {};

  // Check for null or undefined and set to a noop
  if (stylesTransformer == null) {
    stylesTransformer = noopTransformer;
  }
  if (propsTransformer == null) {
    propsTransformer = noopTransformer;
  }

  var stylesAndProps = (0, _pile2['default'])(sheet);

  // Allow the user a chance to transform the styles (e.g. into a RN stylesheet)
  stylesAndProps.styles = stylesTransformer(stylesAndProps.styles);

  // Allow the user a chance to convert the props
  stylesAndProps.props = propsTransformer(stylesAndProps.props);

  // Generate the styling function for the current sheet
  var currentStyler = (0, _style2['default'])(stylesAndProps);

  // Create a new styling function that will combine together the current sheet with the parent
  var combinedStyler = mergedStyle(parentStyler, currentStyler);

  // Add the extend function for chaining
  combinedStyler.extend = function (sheet) {
    return factory(combinedStyler, sheet, stylesTransformer, propsTransformer);
  };

  return combinedStyler;
};

function mergedStyle() {
  for (var _len = arguments.length, stylers = Array(_len), _key = 0; _key < _len; _key++) {
    stylers[_key] = arguments[_key];
  }

  var cache = {};
  return function (query, toggle) {
    var inline = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    if (Array.isArray(toggle)) {
      inline = toggle;
      toggle = null;
    }

    var key = (0, _style.cacheKey)(query, toggle);
    if (!inline.length && cache[key]) {
      return cache[key];
    }

    var result = stylers.reduce(function (prevStylesAndProps, styler) {
      var currentStylesAndProps = styler(query, toggle);
      return _extends({}, prevStylesAndProps, currentStylesAndProps, {
        style: [].concat(_toConsumableArray(prevStylesAndProps.style), _toConsumableArray(currentStylesAndProps.style))
      });
    }, { style: [] });

    if (inline.length) {
      result.style = [].concat(_toConsumableArray(result.style), _toConsumableArray(inline));
    } else {
      cache[key] = result;
    }

    return result;
  };
}

exports['default'] = factory.bind(null, noopStyler);
module.exports = exports['default'];