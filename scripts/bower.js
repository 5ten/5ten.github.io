/*!
 * jQuery Smooth Scroll - v1.5.5 - 2015-02-19
 * https://github.com/kswedberg/jquery-smooth-scroll
 * Copyright (c) 2015 Karl Swedberg
 * Licensed MIT (https://github.com/kswedberg/jquery-smooth-scroll/blob/master/LICENSE-MIT)
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {

  var version = '1.5.5',
      optionOverrides = {},
      defaults = {
        exclude: [],
        excludeWithin:[],
        offset: 0,

        // one of 'top' or 'left'
        direction: 'top',

        // jQuery set of elements you wish to scroll (for $.smoothScroll).
        //  if null (default), $('html, body').firstScrollable() is used.
        scrollElement: null,

        // only use if you want to override default behavior
        scrollTarget: null,

        // fn(opts) function to be called before scrolling occurs.
        // `this` is the element(s) being scrolled
        beforeScroll: function() {},

        // fn(opts) function to be called after scrolling occurs.
        // `this` is the triggering element
        afterScroll: function() {},
        easing: 'swing',
        speed: 400,

        // coefficient for "auto" speed
        autoCoefficient: 2,

        // $.fn.smoothScroll only: whether to prevent the default click action
        preventDefault: true
      },

      getScrollable = function(opts) {
        var scrollable = [],
            scrolled = false,
            dir = opts.dir && opts.dir === 'left' ? 'scrollLeft' : 'scrollTop';

        this.each(function() {

          if (this === document || this === window) { return; }
          var el = $(this);
          if ( el[dir]() > 0 ) {
            scrollable.push(this);
          } else {
            // if scroll(Top|Left) === 0, nudge the element 1px and see if it moves
            el[dir](1);
            scrolled = el[dir]() > 0;
            if ( scrolled ) {
              scrollable.push(this);
            }
            // then put it back, of course
            el[dir](0);
          }
        });

        // If no scrollable elements, fall back to <body>,
        // if it's in the jQuery collection
        // (doing this because Safari sets scrollTop async,
        // so can't set it to 1 and immediately get the value.)
        if (!scrollable.length) {
          this.each(function() {
            if (this.nodeName === 'BODY') {
              scrollable = [this];
            }
          });
        }

        // Use the first scrollable element if we're calling firstScrollable()
        if ( opts.el === 'first' && scrollable.length > 1 ) {
          scrollable = [ scrollable[0] ];
        }

        return scrollable;
      };

  $.fn.extend({
    scrollable: function(dir) {
      var scrl = getScrollable.call(this, {dir: dir});
      return this.pushStack(scrl);
    },
    firstScrollable: function(dir) {
      var scrl = getScrollable.call(this, {el: 'first', dir: dir});
      return this.pushStack(scrl);
    },

    smoothScroll: function(options, extra) {
      options = options || {};

      if ( options === 'options' ) {
        if ( !extra ) {
          return this.first().data('ssOpts');
        }
        return this.each(function() {
          var $this = $(this),
              opts = $.extend($this.data('ssOpts') || {}, extra);

          $(this).data('ssOpts', opts);
        });
      }

      var opts = $.extend({}, $.fn.smoothScroll.defaults, options),
          locationPath = $.smoothScroll.filterPath(location.pathname);

      this
      .unbind('click.smoothscroll')
      .bind('click.smoothscroll', function(event) {
        var link = this,
            $link = $(this),
            thisOpts = $.extend({}, opts, $link.data('ssOpts') || {}),
            exclude = opts.exclude,
            excludeWithin = thisOpts.excludeWithin,
            elCounter = 0, ewlCounter = 0,
            include = true,
            clickOpts = {},
            hostMatch = ((location.hostname === link.hostname) || !link.hostname),
            pathMatch = thisOpts.scrollTarget || ( $.smoothScroll.filterPath(link.pathname) === locationPath ),
            thisHash = escapeSelector(link.hash);

        if ( !thisOpts.scrollTarget && (!hostMatch || !pathMatch || !thisHash) ) {
          include = false;
        } else {
          while (include && elCounter < exclude.length) {
            if ($link.is(escapeSelector(exclude[elCounter++]))) {
              include = false;
            }
          }
          while ( include && ewlCounter < excludeWithin.length ) {
            if ($link.closest(excludeWithin[ewlCounter++]).length) {
              include = false;
            }
          }
        }

        if ( include ) {

          if ( thisOpts.preventDefault ) {
            event.preventDefault();
          }

          $.extend( clickOpts, thisOpts, {
            scrollTarget: thisOpts.scrollTarget || thisHash,
            link: link
          });

          $.smoothScroll( clickOpts );
        }
      });

      return this;
    }
  });

  $.smoothScroll = function(options, px) {
    if ( options === 'options' && typeof px === 'object' ) {
      return $.extend(optionOverrides, px);
    }
    var opts, $scroller, scrollTargetOffset, speed, delta,
        scrollerOffset = 0,
        offPos = 'offset',
        scrollDir = 'scrollTop',
        aniProps = {},
        aniOpts = {};

    if (typeof options === 'number') {
      opts = $.extend({link: null}, $.fn.smoothScroll.defaults, optionOverrides);
      scrollTargetOffset = options;
    } else {
      opts = $.extend({link: null}, $.fn.smoothScroll.defaults, options || {}, optionOverrides);
      if (opts.scrollElement) {
        offPos = 'position';
        if (opts.scrollElement.css('position') === 'static') {
          opts.scrollElement.css('position', 'relative');
        }
      }
    }

    scrollDir = opts.direction === 'left' ? 'scrollLeft' : scrollDir;

    if ( opts.scrollElement ) {
      $scroller = opts.scrollElement;
      if ( !(/^(?:HTML|BODY)$/).test($scroller[0].nodeName) ) {
        scrollerOffset = $scroller[scrollDir]();
      }
    } else {
      $scroller = $('html, body').firstScrollable(opts.direction);
    }

    // beforeScroll callback function must fire before calculating offset
    opts.beforeScroll.call($scroller, opts);

    scrollTargetOffset = (typeof options === 'number') ? options :
                          px ||
                          ( $(opts.scrollTarget)[offPos]() &&
                          $(opts.scrollTarget)[offPos]()[opts.direction] ) ||
                          0;

    aniProps[scrollDir] = scrollTargetOffset + scrollerOffset + opts.offset;
    speed = opts.speed;

    // automatically calculate the speed of the scroll based on distance / coefficient
    if (speed === 'auto') {

      // $scroller.scrollTop() is position before scroll, aniProps[scrollDir] is position after
      // When delta is greater, speed will be greater.
      delta = aniProps[scrollDir] - $scroller.scrollTop();
      if(delta < 0) {
        delta *= -1;
      }

      // Divide the delta by the coefficient
      speed = delta / opts.autoCoefficient;
    }

    aniOpts = {
      duration: speed,
      easing: opts.easing,
      complete: function() {
        opts.afterScroll.call(opts.link, opts);
      }
    };

    if (opts.step) {
      aniOpts.step = opts.step;
    }

    if ($scroller.length) {
      $scroller.stop().animate(aniProps, aniOpts);
    } else {
      opts.afterScroll.call(opts.link, opts);
    }
  };

  $.smoothScroll.version = version;
  $.smoothScroll.filterPath = function(string) {
    string = string || '';
    return string
      .replace(/^\//,'')
      .replace(/(?:index|default).[a-zA-Z]{3,4}$/,'')
      .replace(/\/$/,'');
  };

  // default options
  $.fn.smoothScroll.defaults = defaults;

  function escapeSelector (str) {
    return str.replace(/(:|\.|\/)/g,'\\$1');
  }

}));


/*!
Waypoints - 3.1.1
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(n){if(!n)throw new Error("No options passed to Waypoint constructor");if(!n.element)throw new Error("No element option passed to Waypoint constructor");if(!n.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,n),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=n.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var n in i)e.push(i[n]);for(var o=0,r=e.length;r>o;o++)e[o][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=o.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,n[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,n={},o=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete n[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,o.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||o.isTouch)&&(e.didScroll=!0,o.requestAnimationFrame(t))})},e.prototype.handleResize=function(){o.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var n=e[i],o=n.newScroll>n.oldScroll,r=o?n.forward:n.backward;for(var s in this.waypoints[i]){var l=this.waypoints[i][s],a=n.oldScroll<l.triggerPoint,h=n.newScroll>=l.triggerPoint,p=a&&h,u=!a&&!h;(p||u)&&(l.queueTrigger(r),t[l.group.id]=l.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?o.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?o.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var n=0,o=t.length;o>n;n++)t[n].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=this.adapter.offset(),n={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var o in t){var r=t[o];for(var s in this.waypoints[o]){var l,a,h,p,u,c=this.waypoints[o][s],f=c.options.offset,d=c.triggerPoint,y=0,g=null==d;c.element!==c.element.window&&(y=c.adapter.offset()[r.offsetProp]),"function"==typeof f?f=f.apply(c):"string"==typeof f&&(f=parseFloat(f),c.options.offset.indexOf("%")>-1&&(f=Math.ceil(r.contextDimension*f/100))),l=r.contextScroll-r.contextOffset,c.triggerPoint=y+l-f,a=d<r.oldScroll,h=c.triggerPoint>=r.oldScroll,p=a&&h,u=!a&&!h,!g&&p?(c.queueTrigger(r.backward),n[c.group.id]=c.group):!g&&u?(c.queueTrigger(r.forward),n[c.group.id]=c.group):g&&r.oldScroll>=c.triggerPoint&&(c.queueTrigger(r.forward),n[c.group.id]=c.group)}}for(var w in n)n[w].flushTriggers();return this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in n)n[t].refresh()},e.findByElement=function(t){return n[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},o.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},o.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),n[this.axis][this.name]=this}var n={vertical:{},horizontal:{}},o=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var n=this.triggerQueues[i],o="up"===i||"left"===i;n.sort(o?e:t);for(var r=0,s=n.length;s>r;r+=1){var l=n[r];(l.options.continuous||r===n.length-1)&&l.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=o.Adapter.inArray(e,this.waypoints),n=i===this.waypoints.length-1;return n?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=o.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=o.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return n[t.axis][t.name]||new i(t)},o.Group=i}(),function(){"use strict";function t(t){return t===t.window}function e(e){return t(e)?e:e.defaultView}function i(t){this.element=t,this.handlers={}}var n=window.Waypoint;i.prototype.innerHeight=function(){var e=t(this.element);return e?this.element.innerHeight:this.element.clientHeight},i.prototype.innerWidth=function(){var e=t(this.element);return e?this.element.innerWidth:this.element.clientWidth},i.prototype.off=function(t,e){function i(t,e,i){for(var n=0,o=e.length-1;o>n;n++){var r=e[n];i&&i!==r||t.removeEventListener(r)}}var n=t.split("."),o=n[0],r=n[1],s=this.element;if(r&&this.handlers[r]&&o)i(s,this.handlers[r][o],e),this.handlers[r][o]=[];else if(o)for(var l in this.handlers)i(s,this.handlers[l][o]||[],e),this.handlers[l][o]=[];else if(r&&this.handlers[r]){for(var a in this.handlers[r])i(s,this.handlers[r][a],e);this.handlers[r]={}}},i.prototype.offset=function(){if(!this.element.ownerDocument)return null;var t=this.element.ownerDocument.documentElement,i=e(this.element.ownerDocument),n={top:0,left:0};return this.element.getBoundingClientRect&&(n=this.element.getBoundingClientRect()),{top:n.top+i.pageYOffset-t.clientTop,left:n.left+i.pageXOffset-t.clientLeft}},i.prototype.on=function(t,e){var i=t.split("."),n=i[0],o=i[1]||"__default",r=this.handlers[o]=this.handlers[o]||{},s=r[n]=r[n]||[];s.push(e),this.element.addEventListener(n,e)},i.prototype.outerHeight=function(e){var i,n=this.innerHeight();return e&&!t(this.element)&&(i=window.getComputedStyle(this.element),n+=parseInt(i.marginTop,10),n+=parseInt(i.marginBottom,10)),n},i.prototype.outerWidth=function(e){var i,n=this.innerWidth();return e&&!t(this.element)&&(i=window.getComputedStyle(this.element),n+=parseInt(i.marginLeft,10),n+=parseInt(i.marginRight,10)),n},i.prototype.scrollLeft=function(){var t=e(this.element);return t?t.pageXOffset:this.element.scrollLeft},i.prototype.scrollTop=function(){var t=e(this.element);return t?t.pageYOffset:this.element.scrollTop},i.extend=function(){function t(t,e){if("object"==typeof t&&"object"==typeof e)for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i]);return t}for(var e=Array.prototype.slice.call(arguments),i=1,n=e.length;n>i;i++)t(e[0],e[i]);return e[0]},i.inArray=function(t,e,i){return null==e?-1:e.indexOf(t,i)},i.isEmptyObject=function(t){for(var e in t)return!1;return!0},n.adapters.push({name:"noframework",Adapter:i}),n.Adapter=i}();