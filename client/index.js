/* eslint-disable */

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.PullToReload = factory();
}(this, function () {
  'use strict';

  // 常用文案
  var STATE_MESSAGE_MAP = {
    INIT: '上拉或点击加载更多',
    PULL: '松开加载更多',
    LOADING: '加载中...',
    NO_MORE: '没有更多啦',
  };

  // 下拉、上拉距离缩放系数
  var DISTANCE_COEFFICIENT = 0.9;
  // 触发 loading 的拉动距离（用乘以缩放系数后的值比较）
  var DISTANCE_TO_TRIGGER_LOADING = 60;  // px
  var DISTANCE_TO_TRIGGER_LOADING_UP = -30;  // px
  // 下拉或者上拉回弹动画时间, ms
  var ANIMATION_BACK_DURATION = 100;


  function PullToReload(props) {
    if (!(this instanceof PullToReload)) {
      return new PullToReload(props);
    }

    this.$scrollContainer = props.$scrollContainer;

    /**
     * 下拉时，被 transform Y方向位移的元素
     * 默认为 body
     */
    this.$pullDownEle = props.$pullDownEle || $('body');

    this.canPullDown = props.canPullDown;
    this.isLoading = false;
    this.onPullEnd = props.onPullEnd || function() {};

    this.bindTouchPull();
  }

  /**
   * @param  {DOM Element} ele
   * @param  {Number} y   [如果为 null 或者 ''，则将 Y 方向的 translate 移除]
   */
  function _doTranslateY(ele, y) {
    if (y || (y === 0)) {
      var transformVal = 'translate3d(0px, ' + y + 'px, 0px)';
      ele.style['transform'] = transformVal;
      ele.style['-webkit-transform'] = transformVal;
    } else {
      ele.style['transform'] = '';
      ele.style['-webkit-transform'] = '';
    }
  }

  /**
   * 监听手势上拉动作
   * TODO
   */
  PullToReload.prototype.bindTouchPull = function() {
    var self = this;
    var startY = 0;
    var startX = 0;
    var endY = 0;
    var endX = 0;
    var isPullEleVisible = false;
    var pullUpInitText = '';

    var canPullDown = false;

    this.$scrollContainer.on('touchstart', function(event) {
      canPullDown = self.canPullDown();

      startY = event.changedTouches[0].pageY;
      startX = event.changedTouches[0].pageX;
    });

    this.$scrollContainer.on('touchmove', function(event) {
      if ((event.changedTouches.length === 0)) {
        return true;
      }

      if (self.isLoading) {
        return true;
      }

      var fingure = event.changedTouches[0];
      var deltaY = fingure.pageY - startY;
      var deltaX = fingure.pageX - startX;
      var isY = Math.abs(deltaY) > Math.abs(deltaX);
      var isUp = (deltaY < 0) && isY;
      var isDown = (deltaY > 0) && isY;

      if (canPullDown && isDown) {
        event.preventDefault();
        var yDown = Math.round(deltaY * DISTANCE_COEFFICIENT);
        _doTranslateY(self.$pullDownEle[0], yDown);
        self.$scrollContainer[0].style.overflow = 'visible';

        if (self.$reloadLoadingIcon) {
          if (yDown > DISTANCE_TO_TRIGGER_LOADING) {
            self.$reloadLoadingIcon.addClass('loading');
          } else {
            self.$reloadLoadingIcon.removeClass('loading');
          }
        }
      }
    });

    this.$scrollContainer.on('touchend', function(event) {
      endY = event.changedTouches[0].pageY;
      endX = event.changedTouches[0].pageX;
      var deltaY = endY - startY;
      var deltaX = endX - startX;

      var isY = Math.abs(deltaY) > Math.abs(deltaX);
      if (!isY) {
        return true;
      }

      if (canPullDown) {
        var stillCanPullDownOnTouchend = self.canPullDown();
        if (stillCanPullDownOnTouchend && (Math.round(deltaY * DISTANCE_COEFFICIENT) > DISTANCE_TO_TRIGGER_LOADING)) {
          self.$pullDownEle.animate({
            transform: 'translate3d(0, ' + DISTANCE_TO_TRIGGER_LOADING + 'px, 0)'
          }, ANIMATION_BACK_DURATION, 'ease-in', function() {
            self.doLoading.call(self);
            // 因为下拉通常就是刷新页面，所以不必将 self.$scrollContainer 的 style.overflow 属性置空
          });
        } else {
          self.resetPullDown();
        }
      }
    });
  };

  PullToReload.prototype.doLoading = function() {
    var self = this;

    if (this.$pullEle) {
      this.$pullEle.find('span').text(STATE_MESSAGE_MAP.LOADING);
    }
    this.isLoading = true;
    this.onPullEnd(function onReload() {
      self.resetPullDown();
    });
  };

  PullToReload.prototype.resetPullDown = function(duration) {
    var self = this;
    duration = duration || ANIMATION_BACK_DURATION;
    self.$pullDownEle.animate({transform: 'translate3d(0,0,0)'}, duration, 'ease-in', function() {
      self.$scrollContainer.css('overflow', '');
      _doTranslateY(self.$pullDownEle[0]);
    });
  };

  return PullToReload;
}));
