

/**
 * @name  extend.js
 * @description  此文件用来向命名空间注册api
 * @date  2015.05.12
 * @author: sunken
 */


// Fishbone对象扩展，
mix($, {

    mix: mix,
    get: Http.get,
    ajax: Http.ajax,
    jsonp: Http.jsonp,
    route: Route,
	on: Event.on,
	live: Event.live,
    
    module: Module.init,
    component: Module.component.init
    // get: function() {},

    // eq: function() {},

    // first: function() {},

    // last: function() {},

    // each: function() {},

    // clone: function() {},

    // html: function() {},

    // test: function() {},

    // valueOf: function() {

    //     return Array.prototype.slice.call(this)
    // },
})

mix($.fn, Node)
mix($.fn, {
	on: Event.on,
	live: Event.live,
	ready: Event.ready,
    css: Css.init
})

/**
 * 2015.5.12 创建extend
 */
