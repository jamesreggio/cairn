'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = pile;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function pile(prefix, sheet) {
  var flattened = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var props = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  if (!sheet) {
    sheet = prefix;
    prefix = '';
  }

  Object.keys(sheet).forEach(function (className) {
    var styles = {};

    Object.keys(sheet[className]).forEach(function (attribute) {
      var value = sheet[className][attribute];
      if (attribute === 'props') {
        if (!isValidProps(value)) {
          throw new Error('Invalid `props` definition');
        }

        props[makeName(prefix, className)] = value;
      } else if (isNestedElement(attribute, value)) {
        pile(makeName(prefix, className), _defineProperty({}, attribute, value), flattened, props);
      } else {
        styles[attribute] = value;
      }
    });

    if (Object.keys(styles).length > 0) {
      flattened[makeName(prefix, className)] = styles;
    }
  });

  return { styles: flattened, props: props };
}

;

// The property names which can be styled via an object in RN
var STYLE_RESERVED_WORDS = ['shadowOffset', 'textShadowOffset', 'props'];

// Disallowed words in props definition
var PROPS_RESERVED_WORDS = ['styles'];

function isNestedElement(attribute, value) {
  return STYLE_RESERVED_WORDS.indexOf(attribute) === -1 && value != null && !Array.isArray(value) && typeof value === 'object';
};

function isValidProps(props) {
  return Object.keys(props).reduce(function (cur, prop) {
    return cur && PROPS_RESERVED_WORDS.indexOf(prop) === -1;
  }, true);
};

function makeName() {
  for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
    names[_key] = arguments[_key];
  }

  return names.filter(function (name) {
    return name;
  }).join('.');
}
module.exports = exports['default'];