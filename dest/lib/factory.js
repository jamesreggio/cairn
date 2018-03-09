'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _style2 = require('./style');

var _style3 = _interopRequireDefault(_style2);

var _pile = require('./pile');

var _pile2 = _interopRequireDefault(_pile);

var noopPile = { styles: {}, props: {}, extensions: {} };
function noopTransformer(prop) {
  return prop;
}

function factory(parentPile, sheet, stylesTransformer, propsTransformer) {
  if (sheet === undefined) sheet = {};

  if (stylesTransformer == null) {
    stylesTransformer = noopTransformer;
  }
  if (propsTransformer == null) {
    propsTransformer = noopTransformer;
  }

  var thisPile = (0, _pile2['default'])(sheet);
  thisPile.styles = stylesTransformer(thisPile.styles);
  thisPile.props = propsTransformer(thisPile.props);

  var combinedPiles = mergePiles(parentPile, thisPile);
  var styler = withCache((0, _style3['default'])(combinedPiles));
  styler.extend = function (sheet) {
    return factory(combinedPiles, sheet, stylesTransformer, propsTransformer);
  };

  return styler;
};

function mergePiles(parent, child) {
  function warnKeys(a, b, type) {
    Object.keys(b[type]).forEach(function (key) {
      if (key in a[type]) {
        console.warn('Overriding key ' + key + ' in ' + type);
      }
    });
  }

  warnKeys(parent, child, 'styles');
  warnKeys(parent, child, 'props');
  warnKeys(parent, child, 'extensions');

  return {
    styles: _extends({}, parent.styles, child.styles),
    props: _extends({}, parent.props, child.props),
    extensions: _extends({}, parent.extensions, child.extensions)
  };
}

function mergeInline(result, inline) {
  if (Array.isArray(inline)) {
    return inline.reduce(function (result, item) {
      return mergeInline(result, item);
    }, result);
  }

  if (inline != null && typeof inline === 'object') {
    var _style = inline.style;

    var rest = _objectWithoutProperties(inline, ['style']);

    if (_style) {
      return _extends({}, result, rest, {
        style: [].concat(_toConsumableArray(result.style), [_style])
      });
    }
  }

  return _extends({}, result, {
    style: [].concat(_toConsumableArray(result.style), [inline])
  });
}

function withCache(styler) {
  var cache = {};
  return function (query, toggle) {
    var inline = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    if (Array.isArray(toggle)) {
      inline = toggle;
      toggle = null;
    }

    var key = (0, _style2.cacheKey)(query, toggle, inline);
    if (cache[key]) {
      return cache[key];
    }

    var result = styler(query, toggle);

    if (inline.length) {
      result = mergeInline(result, inline);
    }

    if (key) {
      cache[key] = result;
    }

    return result;
  };
}

exports['default'] = factory.bind(null, noopPile);
module.exports = exports['default'];