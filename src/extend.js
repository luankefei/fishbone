
/**
 * @name  extend.js
 * @description  此文件用来向命名空间注册api
 * @date  2015.05.12
 * @author  sunken
 */

// Fishbone对象扩展，
mix($, {

    mix: mix,
    get: Http.get,
    ajax: Http.ajax,
    jsonp: Http.jsonp,
    route: Route.provider,
    create: create,
    imgReady: imgReady,
    loadCss: Http.getCss,
    loadJs: Http.getScript,

    module: Module.init,
    component: Module.component.init
})

mix($.fn, {
    on: Event.on,
    off: Event.off,
    live: Event.live,
    ready: Event.ready,
    drag: Event.drag,
    css: Css.init,
    position: Css.position,
    offset: Css.offset,
    attr: Attr.init,
    addClass: Attr.addClass,
    removeClass: Attr.removeClass,
    hasClass: Attr.hasClass,
    replaceClass: Attr.replaceClass,

    val: Node.val,
    first: Node.first,
    last: Node.last,
    eq: Node.eq,
    remove: Node.remove,
    html: Node.html,
    text: Node.text,
    clone: Node.clone,
    append: Node.append,
    appendTo: Node.appendTo,
    prepend: Node.prepend,
    find: Node.find,
    index: Node.index,
    width: Node.width,
    height: Node.height,
    parent: Node.parent,
    next: Node.next,
    prev: Node.prev,
    show: Node.show,
    hide: Node.hide,
    length: Node.length,

    data: Data.init,
    animate: Animate.init,
    load: Http.load
})
/**
 * 2015.5.12 创建extend
 */
