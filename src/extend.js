

/**
 * @name  extend.js
 * @description  此文件用来向命名空间注册api
 * @date  2015.05.12
 */


// Fishbone对象扩展，
mix($, {

    mix: mix,
    get: Http.get,
    ajax: Http.ajax,
    jsonp: Http.jsonp,
    route: Route

    
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


/**
 * 2015.5.12 创建extend
 */
