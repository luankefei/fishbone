
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
})


mix($.fn, Node)
mix($.fn, {
	on: Event.on,
	live: Event.live,
	ready: Event.ready,
    css: Css.init,
    attr: Attr.init,
    first: Node.first,
    last: Node.last,
    eq: Node.eq,
    remove: Node.remove,
    html: Node.html,
    clone: Node.clone,
    append: Node.append,
    prepend: Node.prepend,
    animate: Animate.init
})
/**
 * 2015.5.12 创建extend
 */
