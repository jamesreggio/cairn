'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = style;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function style(sheet) {
  return function styler(query, toggle) {
    var inline = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    if (Array.isArray(toggle)) {
      inline = toggle;
      toggle = null;
    }

    var missing = [];
    var parts = query.split(' ');
    var selectors = parts.reduce(function (arr, selector) {
      // Add conditional selector support
      selector = conditionalSelector(selector, toggle);

      if (!selector) return arr;

      // Expand out dot notation syntax
      arr = arr.concat(dotExpander(selector));

      return arr;
    }, []);

    // Compile styles
    var style = selectors.map(function (selector) {
      var style = sheet.styles[selector];
      if (!style) {
        missing.push(selector);
      }
      return style;
    }).filter(function (style) {
      return style;
    });

    // Compile props
    var props = selectors.reduce(function (props, selector) {
      if (!sheet.props) return props;

      return Object.assign(props, sheet.props[selector]);
    }, {});

    style = [].concat(_toConsumableArray(style), _toConsumableArray(inline));

    props.style = style;

    return props;
  };
}

;

// If the selector is conditional, return it based on toggle
function conditionalSelector(selector, toggle) {
  var usingToggleHash = toggle != null && typeof toggle !== 'string' && Object.keys(toggle).length !== 0;
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
module.exports = exports['default'];