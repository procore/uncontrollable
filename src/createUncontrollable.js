import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
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
        return this.innerRef[method](...args)
      }
    }, {})

    let component = createReactClass({

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
        let props = this.props
          , keys  = Object.keys(controlledValues);

        keys.forEach(key => {
          if (utils.getValue(nextProps, key) === undefined
           && utils.getValue(props, key) !== undefined)
           {
             this._values[key] = nextProps[utils.defaultKey(key)]
           }
          else if (utils.getValue(nextProps, utils.defaultKey(key))
           !== utils.getValue(props, utils.defaultKey(key)))
           {
             this._values[key] = nextProps[utils.defaultKey(key)];
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

        newProps = { ...props, ...newProps }

        return (
          <Component { ...newProps } ref={(ref) => this.innerRef = ref } />
        )
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
