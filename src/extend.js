/* jshint asi:true */

/**
 * @name  extend.js
 * @description  此文件用来向命名空间注册api
 * @date  2015.05.12
 * @version  0.0.1
 */

'use strict'

!function($, fn) {

    var node = $.require('node')
    var http = $.require('http')

    // Fishbone原型扩展，针对通过$函数构造的Fishbone对象
    $.mix(fn, {

        attr: node.attr

    })



    // Fishbone对象扩展，
    $.mix($, {

        get: http.get,
        ajax: http.ajax,
        jsonp: http.jsonp,
        socket: http.socket

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

}(window.Fishbone, window.Fishbone.prototype)


/**
 * 2015.5.12 创建extend
 */
