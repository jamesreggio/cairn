/**
 * Combine together multiple transformers into one
 *
 * compose(
 *   transformerOne,
 *   transformerTwo,
 *   compose(
 *     transformerThree,
 *     transformerFour
 *   )
 * )
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.compose = compose;
exports.variables = variables;

function compose() {
  for (var _len = arguments.length, transformers = Array(_len), _key = 0; _key < _len; _key++) {
    transformers[_key] = arguments[_key];
  }

  if (!transformers || !transformers.length) {
    throw new Error('No transformers provided');
  }

  return function (sheet) {
    return transformers.reduce(function (result, transformer) {
      return transformer(result);
    }, sheet);
  };
}

;

/**
 * Add support for variables in the form:
 * 
 * {
 *   prop: '$variable'
 * }
 */

function variables(variables) {
  if (!variables) {
    throw new Error('No variables provided');
  }

  function getVariableValue(value) {
    var reg = /\$([\w]*)/;

    var _reg$exec = reg.exec(value);

    var _reg$exec2 = _slicedToArray(_reg$exec, 2);

    var fullMatch = _reg$exec2[0];
    var variableName = _reg$exec2[1];

    var varValue = variables[variableName];

    // Variable present, but not declared, return original
    if (varValue == null) {
      return value;
    }

    // The variable is the only thing, use the variable as the value
    if (fullMatch.length === value.length) {
      return varValue;
    }

    // There's other stringy stuff, just replace the value in the string
    return value.replace(fullMatch, varValue);
  }

  return function (styles) {
    Object.keys(styles).forEach(function (selector) {
      var attributes = styles[selector];

      Object.keys(attributes).forEach(function (attribute) {
        var value = attributes[attribute];

        // It's not a string, bail
        if (typeof value !== 'string') {
          return;
        }

        // No variables present in said string, bail
        if (value.indexOf('$') === -1) {
          return;
        }

        attributes[attribute] = getVariableValue(value);
      });
    });

    return styles;
  };
}