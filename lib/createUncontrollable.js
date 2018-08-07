'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = createUncontrollable;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createUncontrollable(mixins, set) {

  return uncontrollable;

  function uncontrollable(Component, controlledValues) {
    var methods = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var displayName = Component.displayName || Component.name || 'Component',
        basePropTypes = utils.getType(Component).propTypes,
        propTypes;

    propTypes = utils.uncontrolledPropTypes(controlledValues, basePropTypes, displayName);

    methods = utils.transform(methods, function (obj, method) {
      obj[method] = function () {
        var _innerRef;

        return (_innerRef = this.innerRef)[method].apply(_innerRef, arguments);
      };
    }, {});

    var component = (0, _createReactClass2.default)((0, _extends3.default)({

      displayName: 'Uncontrolled(' + displayName + ')',

      mixins: mixins,

      propTypes: propTypes

    }, methods, {
      componentWillMount: function componentWillMount() {
        var props = this.props,
            keys = (0, _keys2.default)(controlledValues);

        this._values = utils.transform(keys, function (values, key) {
          values[key] = props[utils.defaultKey(key)];
        }, {});
      },


      /**
       * If a prop switches from controlled to Uncontrolled
       * or if the prop's default counterpart changes
       * reset its value to the defaultValue
       */
      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var _this = this;

        var props = this.props,
            keys = (0, _keys2.default)(controlledValues);

        keys.forEach(function (key) {
          if (utils.getValue(nextProps, key) === undefined && utils.getValue(props, key) !== undefined) {
            _this._values[key] = nextProps[utils.defaultKey(key)];
          } else if (utils.getValue(nextProps, utils.defaultKey(key)) !== utils.getValue(props, utils.defaultKey(key))) {
            _this._values[key] = nextProps[utils.defaultKey(key)];
          }
        });
      },
      render: function render() {
        var _this2 = this;

        var newProps = {},
            _props = this.props,
            valueLink = _props.valueLink,
            checkedLink = _props.checkedLink,
            props = (0, _objectWithoutProperties3.default)(_props, ['valueLink', 'checkedLink']);


        utils.each(controlledValues, function (handle, propName) {
          var linkPropName = utils.getLinkName(propName),
              prop = _this2.props[propName];

          if (linkPropName && !isProp(_this2.props, propName) && isProp(_this2.props, linkPropName)) {
            prop = _this2.props[linkPropName].value;
          }

          newProps[propName] = prop !== undefined ? prop : _this2._values[propName];

          newProps[handle] = setAndNotify.bind(_this2, propName);
        });

        newProps = (0, _extends3.default)({}, props, newProps);

        return _react2.default.createElement(Component, (0, _extends3.default)({}, newProps, { ref: function ref(_ref) {
            return _this2.innerRef = _ref;
          } }));
      }
    }));

    component.ControlledComponent = Component;

    /**
     * useful when wrapping a Component and you want to control
     * everything
     */
    component.deferControlTo = function (newComponent) {
      var additions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var nextMethods = arguments[2];

      return uncontrollable(newComponent, (0, _extends3.default)({}, controlledValues, additions), nextMethods);
    };

    return component;

    function setAndNotify(propName, value) {
      var linkName = utils.getLinkName(propName),
          handler = this.props[controlledValues[propName]];

      if (linkName && isProp(this.props, linkName) && !handler) {
        handler = this.props[linkName].requestChange;
      }

      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      set(this, propName, handler, value, args);
    }

    function isProp(props, prop) {
      return props[prop] !== undefined;
    }
  }
}