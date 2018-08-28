'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = style;
exports.cacheKey = cacheKey;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function style(sheet) {
  return function styler(query, toggle) {
    var iteration = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    if (iteration >= 10) {
      throw Error('Circular dependency in `extend`');
    }

    var selectors = selectorsFor(query, toggle);

    // Compile extensions

    var _selectors$map$filter$reduce = selectors.map(function (selector) {
      return sheet.extensions[selector];
    }).filter(function (query) {
      return query;
    }).reduce(function (props, query) {
      var nextProps = styler(query, null, iteration + 1);

      return _extends({}, props, nextProps, {
        style: [].concat(_toConsumableArray(props.style), _toConsumableArray(nextProps.style))
      });
    }, { style: [] });

    var style = _selectors$map$filter$reduce.style;

    var props = _objectWithoutProperties(_selectors$map$filter$reduce, ['style']);

    // Compile styles
    style = style.concat(selectors.map(function (selector) {
      return sheet.styles[selector];
    }).filter(function (style) {
      return style;
    }));

    // Compile props
    props = selectors.reduce(function (props, selector) {
      return !sheet.props ? props : Object.assign(props, sheet.props[selector]);
    }, props);

    props.style = style.filter(function (style) {
      return style != null;
    });

    return props;
  };
}

;

function selectorsFor(query, toggle) {
  var parts = query.split(' ');
  var selectors = parts.reduce(function (arr, selector) {
    // Add conditional selector support
    selector = conditionalSelector(selector, toggle);

    if (!selector) return arr;

    // Expand out dot notation syntax
    arr = arr.concat(dotExpander(selector));

    return arr;
  }, []);

  return selectors;
}

function cacheKey(query, toggle) {
  var inline = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

  if (Array.isArray(toggle)) {
    inline = toggle;
    toggle = null;
  }

  if (inline.length) {
    return null;
  }

  return selectorsFor(query, toggle).join(' ');
}

// If the selector is conditional, return it based on toggle
function conditionalSelector(selector, toggle) {
  var usingToggleHash = toggle != null && typeof toggle === 'object' && Object.keys(toggle).length !== 0;
  var selectorParts = selector.split('?');

  // The selector is conditional
  if (selectorParts.length > 1) {
    var toggleHashKey = selectorParts[1] || selectorParts[0];

    if (!usingToggleHash) {
      // Toggling all conditional selectors
      if (!toggle) return;
    } else {
      // Toggling based on a specific hash key
      if (!toggle[toggleHashKey]) return;
    }
  }

  return selectorParts[0];
}

// Convert from "foo.bar.baz" to ["foo", "foo.bar", "foo.bar.baz"]
function dotExpander(selector) {
  var expanded = [];
  var base = '';
  selector.split('.').forEach(function (segment) {
    var part = base ? [base, segment].join('.') : segment;
    expanded.push(part);
    base = part;
  });
  return expanded;
};