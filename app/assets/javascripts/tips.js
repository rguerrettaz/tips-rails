function afterSeen(tip){
  // make ajax call or store tip or whatever
}

var tipsConfig = {
  multi: true,
  color: 'green',
  position: 'top-right',
  style: 'throb',
  storage: 'LocalStorage'
}

;(function setup(window, tipsConfig){

  function initTips(){

    var Tips = {};
    var settableAttributes = [
      'color',
      'multi',
      'hotSpotColor',
      'position',
      'style',
      'type',
      'theme',
      'storage'
    ]
    var defaultConfig = {
      multi: false,
      color: 'blue',
      hotSpotColor: 'grey',
      position: 'top-right',
      style: 'test',
      type: 'tst',
      theme: 'test',
      storage: 'cookie'
    };
    var config;

    (function validateTipsConfig(){
      var acceptableMulti = [true, false, 'true', 'false']
      var acceptableColor = ['test']
      var acceptableHotSpotColor = ['test']
      var acceptablePosition = ['top-right', 'top-left', 'top-middle',
                                'bottom-right','bottom-left', 'bottom-middle',
                                'middle', 'left', 'right']
      var acceptableHotSpotStyle = ['throb', 'rotate', 'blink']
      var acceptableType = ['test']
      var acceptableTheme = ['test']
      var acceptableStorage = ['LocalStorage', 'localStorage', 'cookie', 'Cookie']

      // Iterates through all keys/values in @tipsConfig and checks to make sure they're
      // valid
      (function validateKeysAndValues(){

        // Extend String object with capitalize method
        String.prototype.capitalize = function() {
          return this.charAt(0).toUpperCase() + this.slice(1);
        }

        function logInvalidKeyError(key){
          console.log(key + ' is not a valid config key.')
        }

        function logInvalidValueError(attrKey, attrVal){
          console.log(attrVal + ' is not a valid value for ' + attrKey)
        }

        Object.keys(tipsConfig).forEach(function(key){
          if (settableAttributes.indexOf(key) > -1) {
            var value =  tipsConfig(key)

            if (eval('acceptable' + key.capitalize()).indexOf(tipsConfig[key]) === -1) {
              logInvalidValueError(key, value)

              // Remove the invalid key from the config hash
              tipsConfig[key] = undefined
            }
          } else logInvalidKeyError(key)
        })
      })();
    })();

    config = {
      multi:        tipsConfig.multi || defaultConfig.multi,
      color:        tipsConfig.color || defaultConfig.color,
      hotSpotColor: tipsConfig.hotSpotColor || defaultConfig.hotSpotColor,
      position:     tipsConfig.position || defaultConfig.position,
      style:        tipsConfig.style || defaultConfig.style,
      type:         tipsConfig.type || defaultConfig.type,
      theme:        tipsConfig.theme || defaultConfig.theme
    }

    function getTipElements() {
      var tipElements = [];
      // Find all data-single-tip-item elements
      document.querySelectorAll('[data-single-tip-item]').forEach(function(el){
        var val = el.dataset.singleTipItem

      })
    }

    // Public
    Tips.listOfTips = [];


    Tips.createTips = function(){
      tipElements = getTipElements();

      tips.forEach(){
        Tips.listOfTips.push(new Tip)
      }
    };

    Tips.listTips = function(){

    };

    return Tips;
  }

  function Tip () {

  }

  if(typeof(Tips) === 'undefined') window.Tips = initializeTips();
  else console.log("Tips already defined.");

})(window, tipsConfig);
