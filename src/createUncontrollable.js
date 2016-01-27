import React from 'react';
import * as utils from './utils';

export default function createUncontrollable(mixins, set){

  return uncontrollable;

  function uncontrollable(Component, controlledValues, methods = []) {
    var displayName = Component.displayName || Component.name || 'Component'
      , basePropTypes = utils.getType(Component).propTypes
      , propTypes;

    propTypes = utils.uncontrolledPropTypes(controlledValues, basePropTypes, displayName)

    methods = utils.transform(methods, (obj, method) => {
      obj[method] = function(...args){
        return this.refs.inner[method](...args)
      }
    }, {})

    let component = React.createClass({

      displayName: `Uncontrolled(${displayName})`,

      mixins,

      propTypes,

      ...methods,

      componentWillMount() {
        var props = this.props
          , keys  = Object.keys(controlledValues);

        this._values = utils.transform(keys, function(values, key){
          values[key] = props[utils.defaultKey(key)]
        }, {})
      },

      /**
       * If a prop switches from controlled to Uncontrolled
       * or if the prop's default counterpart changes
       * reset its value to the defaultValue
       */
      componentWillReceiveProps(nextProps){
        console.warn('createUncontrollable::componentWillReceiveProps');
        console.warn('GARBAGE');
        let props = this.props
          , keys  = Object.keys(controlledValues);

        let defaultValueChanged = key => {
          return utils.getValue(nextProps, utils.defaultKey(key))
            !== utils.getValue(props, utils.defaultKey(key));
        }

        let clobberWithDefaultValue = key => {
          const value = nextProps[utils.defaultKey(key)];

          console.warn(`setting ${key} to ${value}`);
          this._values[key] = nextProps[utils.defaultKey(key)];
        }

        keys.forEach(key => {
          console.warn('props');
          console.warn(key, utils.getValue(props, key));
          console.warn(utils.defaultKey(key), props[utils.defaultKey(key)]);
          console.warn('nextProps');
          console.warn(key, utils.getValue(nextProps, key));
          console.warn(utils.defaultKey(key), nextProps[utils.defaultKey(key)]);
          console.warn('');

          if (utils.getValue(nextProps, key) === undefined
           && utils.getValue(props, key) !== undefined)
           {
             clobberWithDefaultValue(key);
           }
          else if (utils.getValue(nextProps, key) === undefined
            && defaultValueChanged(key))
           {
             clobberWithDefaultValue(key);
           }
        })
      },

      render() {
        var newProps = {}
          , {
            valueLink
          , checkedLink
          , ...props} = this.props;

        utils.each(controlledValues, (handle, propName) => {
          var linkPropName = utils.getLinkName(propName)
            , prop = this.props[propName];

          if (linkPropName && !isProp(this.props, propName) && isProp(this.props, linkPropName) ) {
            prop = this.props[linkPropName].value
          }

          newProps[propName] = prop !== undefined
            ? prop : this._values[propName]

          newProps[handle] = setAndNotify.bind(this, propName)
        })

        newProps = { ...props, ...newProps, ref: 'inner' }

        return React.createElement(Component, newProps);
      }

    })

    component.ControlledComponent = Component

    /**
     * useful when wrapping a Component and you want to control
     * everything
     */
    component.deferControlTo = (newComponent, additions = {}, nextMethods) => {
      return uncontrollable(newComponent, { ...controlledValues, ...additions }, nextMethods)
    }

    return component

    function setAndNotify(propName, value, ...args){
      var linkName = utils.getLinkName(propName)
        , handler    = this.props[controlledValues[propName]];

      if ( linkName && isProp(this.props, linkName) && !handler ) {
        handler = this.props[linkName].requestChange
      }

      set(this, propName, handler, value, args)
    }

    function isProp(props, prop){
      return props[prop] !== undefined;
    }
  }
}
