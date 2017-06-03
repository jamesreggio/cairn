'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libFactory = require('./lib/factory');

var _libFactory2 = _interopRequireDefault(_libFactory);

var _libTransformers = require('./lib/transformers');

var _libStyle = require('./lib/style');

var _libStyle2 = _interopRequireDefault(_libStyle);

var _libPile = require('./lib/pile');

var _libPile2 = _interopRequireDefault(_libPile);

_libFactory2['default'].style = _libStyle2['default'];
_libFactory2['default'].pile = _libPile2['default'];
_libFactory2['default'].compose = _libTransformers.compose;
_libFactory2['default'].variables = _libTransformers.variables;

exports['default'] = _libFactory2['default'];
module.exports = exports['default'];