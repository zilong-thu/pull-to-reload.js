# PullToReload.js

```
var PullToReload = require('pull-to-reload.js');

PullToReload({
  scroller: $('body'),
  onPullEnd: function(cb) {
    setTimeout(function() {
      cb && cb();
    }, 2000);
  }
})
```
