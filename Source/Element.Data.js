/*
---
name: Element.Data
description: Stores data in HTML5 data properties
requires: [Core/Element, Core/JSON]
provides: [Element.Data]
script: Element.Data.js
...
*/
(function(){

  JSON.isSecure = function(string){
    //this verifies that the string is parsable JSON and not malicious (borrowed from JSON.js in MooTools, which in turn borrowed it from Crockford)
    //this version is a little more permissive, as it allows single quoted attributes because forcing the use of double quotes
    //is a pain when this stuff is used as HTML properties
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '').replace(/'[^'\\\n\r]*'/g, ''));
  };

  Element.implement({
    /*
      sets an HTML5 data property.
      arguments:
        name - (string) the data name to store; will be automatically prefixed with 'data-'.
        value - (string, number) the value to store.
    */
    setData: function(name, value){
      return this.set('data-' + name.hyphenate(), value);
    },

    getData: function(name, defaultValue){
      var value = this.get('data-' + name.hyphenate());
      if (value != undefined){
        return value;
      } else if (defaultValue != undefined){
        this.setData(name, defaultValue);
        return defaultValue;
      }
    },

    /*
      arguments:
        name - (string) the data name to store; will be automatically prefixed with 'data-'
        value - (string, array, or object) if an object or array the object will be JSON encoded; otherwise stored as provided.
    */
    setJSONData: function(name, value){
      return this.setData(name, JSON.encode(value));
    },

    /*
      retrieves a property from HTML5 data property you specify

      arguments:
        name - (retrieve) the data name to store; will be automatically prefixed with 'data-'
        strict - (boolean) if true, will set the JSON.decode's secure flag to true; otherwise the value is still tested but allows single quoted attributes.
        defaultValue - (string, array, or object) the value to set if no value is found (see storeData above)
    */
    getJSONData: function(name, strict, defaultValue){
      strict = strict === undefined ? false : strict;
      var value = this.get('data-' + name);
      if (value != undefined){
        if (value && JSON.isSecure(value)) {
          return JSON.decode(value, strict);
        } else {
          return value;
        }
      } else if (defaultValue != undefined){
        this.setJSONData(name, defaultValue);
        return defaultValue;
      }
    }

  });

})();
