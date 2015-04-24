;(function setup(window){

  function initTips(){
    function Validation(config, settableAttrs, acceptableValues) {

      function logInvalidKeyError(key){
        console.log(key + ' is not a valid config key.')
      }

      function logInvalidValueError(attrKey, attrVal){
        console.log(attrVal + ' is not a valid value for ' + attrKey)
      }

      Object.keys(config).forEach(function(key){
        if (settableAttrs.indexOf(key) > -1) {
          var value =  config[key]

          if (acceptableValues[key].indexOf(config[key]) === -1) {
            logInvalidValueError(key, value)

            // Remove the invalid key from the config hash
            config[key] = undefined
          }
        } else logInvalidKeyError(key)
      })
    }

    //
    //
    // STORAGE DEVICE
    //
    //
    var tipsCustomStorageDevice;
    var storageDevice;
    var defaultStorageDevice = {
      optOutKey: 'tips-opted-out',

      addTip: function(tipName){
        localStorage.setItem(tipName, true);
      },

      tipHasBeenSeen: function(tipName){
        return !!localStorage.getItem(tipName);
      },

      optOut: function(){
        localStorage.setItem(this.optOutKey, true);
      },

      userHasOptedOut: function(){
        return !!localStorage.getItem(this.optOutKey);
      },

      removeAll: function(tipNames){
        tipNames.push(this.optOutKey)
        tipNames.forEach(function(key){
          localStorage.removeItem(key)
        })
      }
    };

    if (tipsCustomStorageDevice == undefined) storageDevice = defaultStorageDevice;
    else storageDevice = tipsCustomStorageDevice();

    //
    //
    // TIPS
    //
    //
    var Tips = {
      list: [],

      userOptedOut: function(){ return storageDevice.userHasOptedOut() },

      reset: function(){ storageDevice.removeAll(this.tipNames()) },

      tipNames: function(){
        var names = [];
        this.list.forEach( function(tip){ names.push(tip.name) } )
        return names
      },

      showNextTip: function(){
        // Guard clause
        if (this.userOptedOut()) return
        var unseen = Tips.unseen()
        if (unseen.length != 0) unseen[0].hotSpot.show()
      },

      unseen: function() {
        var unseen = [];
        this.list.forEach(function(tip){
          if (!tip.hasBeenSeen()) unseen.push(tip)
        })
        return unseen
      }
    }

    //
    //
    // TIP
    //
    //
    function Tip(el) {
      this.name = 'tips:' + el.getAttribute('data-tips-name');
      this.priority = el.getAttribute('data-tips-priority') || 1;
      this.pages = el.getAttribute('data-tips-pages') || 1;
      this.tipNode = el;
      this.height = 246;
      this.width = 485;
      this.hotspotPosition = el.getAttribute('data-tips-hot-spot-position') || 'right';
      this.cardPosition = el.getAttribute('data-tips-card-position') || 'right';
      this.tipCard = new TipCard(el, this);
      this.hotSpot = new HotSpot(this);
    }

    Tip.prototype.hasBeenSeen = function() {
      //Look in storage device for tip seen
      return !!storageDevice.tipHasBeenSeen(this.name)
    }

    //
    //
    // HOT SPOT
    //
    //
    function HotSpot(tip) {
      var hotSpot = {};
      var hotSpotSpecs = {
        width: 56,
        height: 56,
        middle: 56/2
      };

      hotSpot.tipCard = tip.tipCard;
      hotSpot.tip = tip;
      hotSpot.position = tip.hotspotPosition;
      hotSpot.tipNode = tip.tipNode;
      hotSpot.tipName = tip.name;
      hotSpot.hotSpotNode = createHotSpotNode();

      hotSpot.show = function(){
        this.hotSpotNode.style.display = '';
      }

      hotSpot.hide = function(){
        this.hotSpotNode.style.display = 'none';
      }

      // Private functions

      function createHotSpotNode(){
        var bounds = hotSpot.tipNode.getBoundingClientRect();
        var hotSpotNode = document.createElement('div');
        var offsetLeft = calcualteHotSpotOffsetLeft(bounds);
        var offsetTop  = calculateHotSpotOffsetTop(bounds);

        hotSpotNode.className = 'tips-throbber';
        hotSpotNode.style.position = 'absolute';
        hotSpotNode.style.top = offsetTop + 'px';
        hotSpotNode.style.left = offsetLeft + 'px';
        hotSpotNode.style.display = 'none';

        addHotSpotListener(hotSpotNode);

        document.body.appendChild(hotSpotNode);

        return hotSpotNode
      }

      function calculateHotSpotOffsetTop(bounds) {
        var topPxLength     = 0;
        var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
                          (document.documentElement ||
                          document.body.parentNode || document.body).scrollTop;
        var topPositions    = ['top-left', 'top', 'top-right'];
        var bottomPositions = ['bottom-left', 'bottom', 'bottom-right'];
        var middlePositions = ['middle', 'left', 'right'];

        if (topPositions.indexOf(hotSpot.position) !== -1) {
          topPxLength = bounds.top - hotSpotSpecs.middle + scrollTop;
        } else if (bottomPositions.indexOf(hotSpot.position) !== -1) {
          topPxLength = bounds.top + bounds.height - hotSpotSpecs.middle +
                        scrollTop;
        } else if (middlePositions.indexOf(hotSpot.position) !== -1) {
          topPxLength = bounds.top + bounds.height/2 - hotSpotSpecs.middle +
                        scrollTop;
        } else { console.log(hotSpot.position + ' is an invalid position hotSpot position') };

        return topPxLength;
      }

      function calcualteHotSpotOffsetLeft(bounds) {
        var leftPositions   = ['top-left', 'left', 'bottom-left'];
        var rightPositions  = ['top-right', 'right', 'bottom-right'];
        var middlePositions = ['middle', 'top', 'bottom'];
        var scrollLeft = (window.pageXOffset !== undefined) ?
                          window.pageXOffset : (document.documentElement ||
                                                document.body.parentNode ||
                                                document.body).scrollLeft;

        if (leftPositions.indexOf(hotSpot.position) !== -1) {
          return bounds.left - hotSpotSpecs.middle + scrollLeft;
        } else if (rightPositions.indexOf(hotSpot.position) !== -1) {
          return bounds.left + bounds.width - hotSpotSpecs.middle + scrollLeft;
        } else if (middlePositions.indexOf(hotSpot.position) !== -1) {
          return bounds.left + bounds.width/2 - hotSpotSpecs.middle + scrollLeft;
        } else { console.log(hotSpot.position + ' is an invalid hotSpot position') };
      }

      function addHotSpotListener(hotSpotNode){
        hotSpotNode.addEventListener('click', function(){
          storeThatTipHasBeenSeen();
          showTipCard();
          hotSpot.hide();
        })
      }

      function storeThatTipHasBeenSeen(){
        storageDevice.addTip(hotSpot.tipName);
      }

      function showTipCard(){
        hotSpot.tipCard.show();
      }

      return hotSpot
    }

    //
    //
    // TIP CARD
    //
    //
    function TipCard(tipNode, tip) {
      var tipCard = {};
      tipCard.tip = tip;
      tipCard.tipNode = tipNode;
      tipCard.content = JSON.parse(tipNode.getAttribute('data-tips-content'));
      tipCard.position = tip.cardPosition;
      tipCard.cardNode = createCardNode();
      tipCard.scritNode = createScritNode();

      tipCard.show = function(){
        this.cardNode.style.display = '';
        this.scritNode.style.display = '';

        // Highlight the tip node
        // For z-index to work the tipNode must have a positon in the following:
        // ['absolute', 'relative', 'fixed']
        this.tipNode.style.zIndex = 9999;
      };

      tipCard.hide = function(){
        this.cardNode.style.display = 'none';
        this.scritNode.style.display = 'none';
        this.tipNode.style.zIndex = 0;
        Tips.showNextTip();
      }

      // Private functions

      function createCardNode(){
        var bounds = tipCard.tipNode.getBoundingClientRect();
        var cardNode = document.createElement('div');
        cardNode.className = 'tips-card tips-card-' + tipCard.position;
        cardNode.appendChild(createContent());
        cardNode.appendChild(createOptOut())
        cardNode.style.display = 'none';
        cardNode.style.position = 'absolute';
        cardNode.style.width = tip.width + 'px';
        cardNode.style.left = calculateOffsetLeft(bounds, cardNode);
        cardNode.style.top = calculateOffsetTop(bounds, cardNode);
        cardNode.style.zIndex = 9999;

        document.body.appendChild(cardNode);
        return cardNode;
      }

      function createContent(){
        var pageCount = tip.pages
        var content = document.createElement('div')
        content.className = 'tips-content-wrapper'

        for(var i = 1; i <= pageCount; i++){
          var lastPage = false;

          if(i == pageCount) lastPage = true;

          content.appendChild(createPage(i, lastPage))
        }

        return content
      }

      function createPage(pageNumber, lastPage){
        var page = document.createElement('div')

        if (pageNumber === 1) {
          page.className = 'tips-content-page-' + pageNumber +
                            ' tips-last-page-' + lastPage + ' tips-active-tip' +
                            ' tips-page';
        } else {
          page.className = 'tips-content-page-' + pageNumber +
                            ' tips-last-page-' + lastPage + ' tips-page';
        }

        page.innerHTML = headerHtml(pageNumber) + bodyHtml(pageNumber);
        page.zIndex = 100 - pageNumber;

        if (pageNumber !== 1) page.style.display = 'none';

        page.appendChild(createNavigation(lastPage, pageNumber))

        return page
      }

      function headerHtml(pageNumber) {
        return  '<h2>' + tipCard.content['page' + pageNumber + 'Header'] +
                '</h2>'
      }

      function bodyHtml(pageNumber) {
        return  '<p>' + tipCard.content['page' + pageNumber + 'Body'] +
                '</p>'
      }

      function createNavigation(lastPage, pageNumber) {
        var wrapper = document.createElement('div')
        wrapper.className = 'tips-navigation-wrapper'

        if (tip.pages > 1) {
          wrapper.appendChild(createNavigationalDots(pageNumber))
        }

        if (lastPage) { wrapper.appendChild(createDoneButton()) }
        else { wrapper.appendChild(createNextButton()) }

        return wrapper
      }

      function createNextButton(){
        var wrapper = document.createElement('div');
        wrapper.className = 'tips-btn-wrapper'
        var btn = document.createElement('button');
        btn.className = 'tips-btn tips-next-btn tips-green';
        btn.textContent = 'Next';
        addNextButtonListener(btn);
        wrapper.appendChild(btn)

        return wrapper
      }

      function addNextButtonListener(btn){
        btn.addEventListener('click', function(e){
          e.preventDefault();

          // TODO: traversing DOM seems nasty, must be better way
          removeClass(this.parentNode.parentNode.parentNode, 'tips-active-tip')
          this.parentNode.parentNode.parentNode.style.display = 'none';

          this.parentNode.parentNode.parentNode.nextSibling.style.display = '';
          addClass(this.parentNode.parentNode.parentNode.nextSibling, 'tips-active-tip')
        })
      }

      function createDoneButton() {
        var wrapper = document.createElement('div');
        wrapper.className = 'tips-btn-wrapper';
        var btn = document.createElement('button')
        btn.className = 'tips-btn tips-done-btn tips-red';
        btn.textContent = 'Done';
        addDoneButtonListener(btn);
        wrapper.appendChild(btn)

        return wrapper
      }

      function addDoneButtonListener(btn){
        btn.addEventListener('click', function(){
          tipCard.hide();
        })
      }

      function createNavigationalDots(pageNumber){
        var dots = document.createElement('div');
        dots.className = 'tips-navigational-dots-wrapper'

        for(var i = 1; i <= tip.pages; i++){
          dots.appendChild(createDot(pageNumber, i))
        }

        return dots;
      }

      function createDot(parentPageNumber, pageNumber){
        // var dot = document.createElement('div');
        var dotClass = 'tips-navigational-dot';
        var activeDotClass = 'tips-active-dot';
        var dot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('data-tips-page-number', pageNumber);

        if(parentPageNumber == pageNumber) dot.setAttribute('class', dotClass + ' ' + activeDotClass)
        else dot.setAttribute('class', dotClass)

        dot.setAttribute('height', '6');
        dot.setAttribute('width' ,'6');

        circle.setAttribute('cx', '3');
        circle.setAttribute('cy', '3');
        circle.setAttribute('r', '3');
        circle.setAttribute('fill', 'red');

        dot.appendChild(circle);

        addDotListener(dot)

        return dot;
      }

      function addDotListener(dot){
        dot.addEventListener('click', function(){
          hideActiveDotsCard(dot);
          showClickedDotsCard(dot);
        })
      }

      function hideActiveDotsCard(dot) {
        // TODO: YUCK!!!!! Safari doesn't support .closest
        // Surely there must be a cleaner/safer way to find this el
        dot.parentNode.parentNode.parentNode.style.display = 'none';
      }

      function showClickedDotsCard(dot) {
        var pageNumber = dot.getAttribute('data-tips-page-number')

        // TODO: find cleaner way to find parent el
        var pageToShow = dot.parentNode.parentNode.parentNode.parentNode
                            .getElementsByClassName('tips-content-page-' +
                                                    pageNumber)[0];
        pageToShow.style.display = '';
      }


      function createOptOut() {
        var optOutWrapper = document.createElement('span');
        var optOutLink = document.createElement('a');
        optOutWrapper.className = 'tips-opt-out';
        optOutWrapper.textContent = 'Seen this before?'
        optOutLink.className = 'tips-opt-out-link'
        optOutLink.textContent = ' Opt out of these tips.'
        optOutLink.setAttribute('href', '#')
        optOutWrapper.appendChild(optOutLink)
        addOptOutListener(optOutLink)
        return optOutWrapper
      }

      function addOptOutListener(optOutLink) {
        optOutLink.addEventListener('click', function(e){
          e.preventDefault();
          storageDevice.optOut();
          tipCard.hide();
        })
      };

      // TODO: A tipCard should know the optimal location for its speech
      // bubble point based on the window boundaries. For now it the speech
      // bubble point will always be centered on the tipNode
      function calculateOffsetLeft(bounds, cardNode){
        // length of speech box tip
        var pointerLength = 15;
        var scrollLeft = (window.pageXOffset !== undefined) ?
                          window.pageXOffset : (document.documentElement ||
                                                document.body.parentNode ||
                                                document.body).scrollLeft;
        if(tipCard.position === 'right'){
          return bounds.left + bounds.width + pointerLength +
                  scrollLeft + 'px';
        } else if(tipCard.position === 'left'){
          return  bounds.left - cardNode.style.width.replace('px', '')/1 -
                  pointerLength + scrollLeft + 'px';
        } else if (['top', 'bottom'].indexOf(tipCard.position) !== -1){
          return bounds.left - cardNode.style.width.replace('px', '')/2 +
                  bounds.width/2 + scrollLeft + 'px';
        } else {
          console.log(tipCard.position + ' is an invalid tipCard position.')

          // Same position as right as it's the default position, for now
          return bounds.left + bounds.width + scrollLeft + 'px';
        }
      };

      function calculateOffsetTop(bounds, cardNode){
        var pointerLength = 15;
        var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
                          (document.documentElement ||
                          document.body.parentNode || document.body).scrollTop;

        if(['right', 'left'].indexOf(tipCard.position) !== -1){
          return  bounds.top + bounds.height/2 - tip.height/2 + scrollTop + 'px';
        } else if(tipCard.position === 'top'){
          return bounds.top - tip.height - pointerLength + scrollTop + 'px';
        } else if(tipCard.position === 'bottom'){
          return  bounds.top + bounds.height + pointerLength + scrollTop + 'px';
        } else {
          // Same position as right as it's the default position, for now
          return  bounds.top - bounds.height/2 +
                  tip.height/2 + scrollTop + 'px';
        }
      };

      function createScritNode(){
        var scritNode = document.createElement('div')
        scritNode.className = 'shadow';
        scritNode.style.height = '100%';
        scritNode.style.width = '100%';
        scritNode.style.zIndex = 9998;
        scritNode.style.backgroundColor = 'rgb(95, 95, 95)';
        scritNode.style.opacity = '0.5';
        scritNode.style.position = 'fixed';
        scritNode.style.left = '0px';
        scritNode.style.top = '0px';
        scritNode.style.display = 'none';

        addScritNodeListener(scritNode);

        document.body.appendChild(scritNode)
        return scritNode
      }

      function addScritNodeListener(scritNode){
        scritNode.addEventListener('click',function(){
          tipCard.hide();
        })
      }

      return tipCard;
    }

    // Helper functions

    function addClass(node, className) {
      node.className = node.className + ' ' + className;
    }

    function removeClass(node, className) {
      node.className = node.className.replace(className, '')
    }

    // Extend String object with capitalize method
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }

    function createTips(){
      var tipNodes = document.querySelectorAll('[data-tips-single-item]');

      for(i = 0; i < tipNodes.length; ++i) {
        var tip = new Tip(tipNodes[i])
        Tips.list.push(tip)
      }
    };

    // Sort list to make TipCard showing easier
    function sortTipsList(list){
      Tips.list.sort(function(a,b) {return a.priority - b.priority})
    }

    createTips();
    sortTipsList();
    Tips.showNextTip();

    return Tips;
  }

  if(typeof(Tips) === 'undefined') window.Tips = initTips();
  else console.log('Tips already defined.');

  window.Tips.reset()

})(window);
