# Tips (beta)

Slack inspired onboarding tips.

Note: Tips is currently in Beta. Left, much work there is. To see a backlog of features and work currently in progress <a href='https://huboard.com/rguerrettaz/tips-rails/' target='_blank'>checkout the HuBoard.</a>

<a href="http://codepen.io/rguerrettaz/pen/eNNXKB" target='_blank'><img src="http://i.imgur.com/EQuPxuh.gif"></a>

## Installation

Add this line to your application's Gemfile:

    gem 'tips'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install tips

## Examples

* <a href="http://codepen.io/rguerrettaz/pen/LVVVzR" target='_blank'>Single Tip</a>
* <a href="http://codepen.io/rguerrettaz/pen/doorJm" target='_blank'>Single Tip, multiple pages of content</a>
* <a href="http://codepen.io/rguerrettaz/pen/KppEop" target='_blank'>Multiple Tips</a>
* <a href="http://codepen.io/rguerrettaz/pen/eNNXKB" target='_blank'>Multiple Tips, multiple pages of content</a>

## Usage

Tips uses HTML data-attributes to pass the majority of its configuration.

#### Creating a tip

Creating a tip is easy. Just add the necessary data-attributes to your target
element and call `Tips.init()`. For example, if you want to target a div on your
page you'd add the following data-attributes to the div:

```html
<div  data-tips-id='my-unique-tip-name'
      data-tips-content='{"page1Header" : "This is my header",
                          "page1Body"   : "This is the body of my tip",
                        }'
      data-tips-hot-spot-position='top-right'
      data-tips-card-position='right'
      data-tips-priority='1'
      data-tips-pages='1'>
</div>
```

Once the data attributes have been added add this line to your javascript
```javascript
Tips.init()
```

#### Creating multiple tips on a single page

Use the same data-attributes as a single tip just make sure `data-tips-id` is
unique for each tip and set the `data-tips-priority` appropriately.

```html
<div  data-tips-id='my-unique-tip-name'
      data-tips-content='{"page1Header" : "This is my header",
                          "page1Body"   : "This is the body of my tip",
                        }'
      data-tips-hot-spot-position='top-right'
      data-tips-card-position='right'
      data-tips-priority='1'
      data-tips-pages='1'>
  <button>My 1st Button</button>
</div>

<div  data-tips-id='my-unique-tip-name-number-two'
      data-tips-content='{"page1Header" : "This is my header no. 2",
                          "page1Body"   : "This is the body of my tip no. 2",
                        }'
      data-tips-hot-spot-position='top-right'
      data-tips-card-position='right'
      data-tips-priority='2'
      data-tips-pages='1'>
  <button>My 2nd Button</button>
</div>

```

Once the data attributes have been added add this line to your javascript
```javascript
Tips.init()
```

#### Creating tips with multiple pages of content

To do this just add the extra pages to `data-tips-content`
```html
<div  data-tips-id='my-unique-tip-name'
      data-tips-content='{"page1Header" : "This is my header",
                          "page1Body"   : "This is the body of my tip",
                          "page2Header" : "A second header?",
                          "page2Body"   : "Yes! If you so choose, you can have
                                          tips with multiple pages."
                        }'
      data-tips-hot-spot-position='top-right'
      data-tips-card-position='right'
      data-tips-priority='1'
      data-tips-pages='1'>
  <button>My 1st Button</button>
</div>
```

Once the data attributes have been added add this line to your javascript
```javascript
Tips.init()
```

## Attributes overview

#### data-tips-id
`data-tips-id` should be unique for each tip you have on your website.
These are used as references when we check if a user has previously seen a tip.

```
data-tips-id='some-unique-name-for-this-tip'
```

#### data-tips-content
`data-tips-content` is a JSON string representation of the content for your tip.
To allow Tips to support multiple pages of content we use keys in the form of
`page1Header` and `page1Body`. Pages should be sequential. Shit will fail
otherwise.

```
data-tips-content='{"page1Header":"The header for the first page of this tip",
                    "page1Boy":"The body for the first page of this tip",
                    "page2Header":"The header for the second page of this tip",
                    "page2Body":"The body for the second page of this tip"
                   }
```

#### data-tips-hot-spot-position
`data-tips-hot-spot-position` controls the position of the throbbing hot spot
icon in relation to the element you're targeting.


```html
<!-- Default value: 'right' -->
data-tips-hot-spot-position='bottom-left'
```

Acceptable values:
```
top-right
top-left
top
bottom-right
bottom-left
bottom
left
right
middle
```

#### data-tips-card-position
`data-tips-card-position` controls the side your tip modal will show up on.

```
<!-- Default value: 'right' -->
data-tips-card-position='left'
```

Acceptable values:
```
top
bottom
left
right
```

#### data-tips-priority
`data-tips-priority` is used when you have multiple tips on a given page.
Priority 1 will be shown first.
```
data-tips-priority='1'
```

#### data-tips-pages
`data-tips-pages` tells Tips how many pages you want on a given tip. Required
attribute. There is no default set at this point.
```
data-tips-priority='1'
```

## Storage
#### Default Storage (localStorage)
By default Tips will use `localStorage` to store which tips have been seen.
This works, however, it's sub-optimal. Using `localStorage` means tips may be
seen twice. When using localStorage the following scenarios may show tips twice:
* User opens pages in incognito mode
* User opens pages in multiple browsers
* User opens pages from multiple devices

Because the lack of persistence with `localStorage`, Tips comes with the ability
to [define your own](#custom-storage-device) `customStorageDevice`.

Here's the `defaultStorageDevice`:
```javascript
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
        tipNames.push(this.optOutKey);
        tipNames.forEach(function(key){
          localStorage.removeItem(key);
        });
      }
    };
```

#### Custom Storage Device
You can define your own custom storage device and pass it in as an argument when
you initialize with `Tips.init(myCustomStorageDevice)`. Example using `jQuery`:
```javascript
(function initTipsWithCustomStorage() {

  // Make an ajax call for a list of seen tips and if the user has opted out
  // On success, init tips with out customStorageDevice
  (function(){
    $.ajax('/tips/data', {
      method: 'GET'
    })
    .success(function(data){
      var userHasOptedOut = data.optedOut;
      var seenTips        = data.seenTips;
      var storageDevice   = {
        seenTips: seenTips,

        addTip: function(tipName){
          $.ajax('/tips/tip_seen', {
            method: 'POST',
            data: {name: tipName}
          });

          // Add tip to list of seenTips so it doesn't show again in the same
          // window session
          seenTips.push(tipName);
        },

        tipHasBeenSeen: function(tipName){
          return seenTips.indexOf(tipName) != -1;
        },

        optOut: function(){
          $.ajax('/tips/opted_out', {
            method: 'POST',
            data: {name: 'opt-out'}
          })
        },

        userHasOptedOut: function(){
          return !!userHasOptedOut;
        },
      };

      // Begin the magic
      Tips.init(storageDevice);
    })
    .fail(function(jqXHR, textStatus){
      console.log('Failure? Yes, failure with status: ' + textStatus)
    });
  })();
})();

```

Important things to note here
* You're passing an object with public methods, not a function
* You must have the following methods defined
```javascript
storageDevice.addTip()
storageDevice.tipHasBeenSeen()
storageDevice.optOut()
storageDevice.userHasOptedOut()
```

## Contributing

1. Fork it ( http://github.com/<my-github-username>/tips/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
