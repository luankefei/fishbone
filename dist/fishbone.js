/* jshint asi:true */

/**
 * @name _intro.js
 * @description 整个框架的头
 * @date 2015.5.20
 */

'use strict'

!function(global, DOC) {



/**
 * @name  main.js
 * @description  此文件是种子模块，定义了大量私有变量，提供extend等基础api
 * @date  2015.05.07
 * @version  0.0.2
 */
var W3C = DOC.dispatchEvent                                         //IE9开始支持W3C的事件模型与getComputedStyle取样式值
var html = DOC.documentElement                                      //HTML元素
var head = DOC.head || DOC.getElementsByTagName('head')
var version = 1

/**
 * @description 命名空间
 * @param  {String|Function} expr  CSS表达式或函数
 * @return {Mass}
 */
function $(selector) {

    return $.fn.init(selector)
}

$.fn = $.prototype

/**
 * 糅杂，为一个对象添加更多成员
 * @param {Object} receiver 接受者
 * @param {Object} supplier 提供者
 * @return  {Object} 目标对象
 * @api public
 */
function mix(receiver, supplier) {

    var args = [].slice.call(arguments),
            i = 1,
            key, //如果最后参数是布尔，判定是否覆写同名属性
            ride = typeof args[args.length - 1] === 'boolean' ? args.pop() : true

    if (args.length === 1) { //处理$.mix(hash)的情形

        receiver = !this.window ? this : {}
        i = 0
    }

    while ((supplier = args[i++])) {
        for (key in supplier) { //允许对象糅杂，用户保证都是对象
            if (Object.prototype.hasOwnProperty.call(supplier, key) && (ride || !(key in receiver))) {
                receiver[key] = supplier[key]
            }
        }
    }

    return receiver
}

mix($.fn, {

    mix: mix,
    nodes: [],
    // bonelot
    fishbone: version,
    constructor: $,
    length: 0,

    // 传入的expr可能是dom对象
    init: function(expr) {

        // 如果传入的是dom节点
        if (expr.nodeName) {

            this.nodes = expr

        } else {

            var arrExp = expr.split(' ')

            if (arrExp.length === 1 && arrExp[0].charAt(0) === '#') {

                this.nodes = DOC.querySelector(arrExp[0])

            } else {

                this.nodes = DOC.querySelectorAll(expr)
                // 将nodeList转为数组
                this.nodes = Array.prototype.slice.call(this.nodes)
            }
        }

        var obj = Object.create($.fn)

        obj.nodes = this.nodes

        return obj
    }
})


/**
 * 2015.5.11 整合了原有的module.js模块，使框架结构更清晰
 * 2015.5.12 
 * 将amd模块与图表组件库统一，让出全局的define和require
 * 增加了require函数的字符串判断，允许传入字符串作为参数
 * 将require函数重命名为use，原use改为require
 * 将require函数的参数1，2改为可选
 * 2015.5.13
 * 重写了$函数，返回$.fn.init的结果，返回后的内容为dom对象与$.fn对象的并集
 * 2015.5.20
 * 更换了打包方式，移除了amd模块
 */



/**
 * @name  prototype.js
 * @description  对象原型扩展模块，该文件为侵入式设计
 * @date  2015.05.12
 */
String.prototype.byteLen = function(target, fix) {

    /**取得一个字符串所有字节的长度。这是一个后端过来的方法，如果将一个英文字符插
     *入数据库 char、varchar、text 类型的字段时占用一个字节，而一个中文字符插入
     *时占用两个字节，为了避免插入溢出，就需要事先判断字符串的字节长度。在前端，
     *如果我们要用户填空的文本，需要字节上的长短限制，比如发短信，也要用到此方法。
     *随着浏览器普及对二进制的操作，这方法也越来越常用。
     */
    fix = fix ? fix: 2
    var str = new Array(fix + 1).join('-')
    return target.replace(/[^\x00-\xff]/g, str).length
}

// 从数据中随机抽出一个元素
Array.prototype.random = function(target) {

    return target[Math.floor(Math.random() * target.length)]

}

// 对数据进行平坦化处理，多维数组合并为一维数组
Array.prototype.flatten = function(target) {

    var result = []

    target.forEach(function(item) {

        if (Array.isArray[item]) {

            result  = result.concat(Array.prototype.flatten(item))

        } else {

            result.push(item)
        }

        return result
    })
}

Array.prototype.min = function(target) {

    return Math.min.apply(0, target)
}

Array.prototype.max = function(target) {

    return Math.max.apply(0, target)
}

// 数组去重
Array.prototype.unique = function() {

    this.sort()
    
    var arr = ['1']

    for (var i = 1; i < this.length; i++) {
        
        if (this[i] !== arr[arr.length - 1]) {
   
            arr.push(this[i])
        }
    }

    arr.shift()

    return arr
}

// 对两个数组取并集
Array.prototype.union = function(target, array) {

    return (target.concat(array)).unique()
}

// 取数组中的第一个元素
Array.prototype.first = function() {
    return this[0]
}

// 取数组的最后一个元素
Array.prototype.last = function() {
    return this[this.length - 1]
}

// 过滤数组中的undefined、null和' '





/**
 * @name  http.js
 * @description  数据请求模块，负责实现ajax、comet、websocket
 * @date  2015.05.12
 * @version  0.0.1
 */
var Http = {}

var accepts = {
    xml: 'application/xml, text/xml',
    html: 'text/html',
    text: 'text/plain',
    json: 'application/json, text/javascript',
    script: 'text/javascript, application/javascript',
    '*': ['*/'] + ['*'] //避免被压缩掉
},
defaults = {
    type: 'GET',
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    async: true
    //jsonp: 'callback'
}

// ajax函数的简化版，提供更简单易用的api
Http.get = function(url, callback) {

    var param = defaults

    param.url = url

    Http.ajax(param, callback)
}

// 第三个参数为自定义事件，用来支持xmlhttprequest 2.0的新增事件
Http.ajax = function(param, callback, events) {

    var url = param.url
    var type = param.type ? param.type.toUpperCase() : defaults.type
    var data = param.data || null

    var req = new XMLHttpRequest()

    req.open(type, url)

    // 如果有传入loadStart和progress参数
    if (typeof events !== 'undefined') {

        for (var k in events) {

            req['on' + k] = events[k]
        }
    }

    req.onreadystatechange = function() {

        if (req.status === 200 && req.readyState === 4) {

            var res = req.responseText

            callback && callback(res)
        }
    }

    req.setRequestHeader('Content-type', defaults.contentType)
    req.send(data)
}

// 尽量使用CORS
Http.jsonp = function(url, namespace, funcName, callback) {

    var script = document.createElement('script')
    var body = document.querySelector('body')

    script.src = url + '?type=jsonp&callbackName=' + funcName
    script.id = 'jsonp'
    script.onload = callback
    
    window[funcName] = namespace.funcName

    body.appendChild(script)
}

Http.comet = function() {}

Http.socket = function() {}

/**
 * 2015.05.12 
 * 创建http模块
 * 添加ajax、jsonp两个顶级接口。ajax支持httprequest 2.0
 */




/**
 * @name  node.js
 * @description  dom、node模块，提供dom对象的CRUD
 * @date  2015.05.12
 */
var Node = {}

// 将node以某元素子元素的形式插入到该元素内容的最后面
Node.append = function(node) {

    if (this.nodes.length === 1) {

        this.nodes.appendChild(node)

    } else {

        // 循环复制插入节点
        this.nodes.forEach(function(value) {

            var n = node.cloneNode(true)

            value.appendChild(n)
        })            
    }

    return this
}

// 将node以某元素子元素的形式插入到该元素内容的最前面
Node.prepend = function(node) {

    if (this.nodes.nodeName) {

        this.nodes.insertBefore(node, this.nodes.childNodes[0])

    } else {

        // 循环复制插入节点
        this.nodes.forEach(function(v) {

            var n = node.cloneNode(true)

            v.insertBefore(n, v.childNodes[0])
        })            
    }

    return this
}

// 克隆节点，如果include_all为true，会克隆该元素所包含的所有子节点
Node.clone = function(include) {

    if (this.nodes.nodeName) {

        return this.nodes.cloneNode(include)

    } else {

        var arr = []

        this.nodes.forEach(function(v) {

            arr.push(v.cloneNode(include))    
        })

        return arr
    }
}

// 修改元素的innerHTML
Node.html = function(html) {

    var nodes = this.nodes

    if (html !== undefined) {

        if (nodes.nodeName) {

            nodes.innerHTML = html            

        } else {

            nodes.forEach(function(v, i, a) {

                v.innerHTML = html
            })
        }

        return this


    } else {

        return nodes.nodeName ? nodes.innerHTML : ''
    }
}

// 移除元素
Node.remove = function() {

    var nodes = this.nodes

    if (nodes instanceof Array) {

        for (var i = 0, length = nodes.length; i < length; i++) {

            var node = nodes[i]

            node.parentNode.removeChild(node)
        }

    } else {

        nodes.parentNode.removeChild(nodes)
    }

    // TODO: 如果返回this，这个对象会包含已经删除节点对象的引用
    return null
}

// 清空元素的内容
Node.empty = function() {}

Node.after = function() {}

Node.before = function() {}

Node.css = function() {}

Node.width = function() {}

Node.attr = function(key, value) {}

// TODO: 如果this.nodes不是数组，这里会报错
Node.eq = function(index) {

    var n = null

    try {

        n = this.nodes[index]

        n = $.fn.init(n)

    } catch(e) {

        console.error('$.fn.eq只能用于复数节点集合')
    }

    return n
}

Node.first = function() {

    return Node.eq.call(this, 0)
}

Node.last = function() {

    return Node.eq.call(this, this.nodes.length - 1)   
}



// each: function() {},

/**
 * 2015.5.12 创建node模块
 * 2015.5.20 增加了append、prepend、clone和html方法
 * 2015.5.21
 * 在eq中添加了try-catch处理，目前的写法并不完美，但足够使用
 * 增加了first、last和remove方法
 */




/**
 * @name  route.js
 * @description  路由模块
 * @date  2015.5.21
 */
var Route = {}

// TODO: provider可以考虑改成类
Route.provider = function (paths) {
    
    var provider = this,
        routes = {}


    // var formatUrl = function(url) {

    //     var index = url.indexOf('#')
    //     // 截取掉#
    //     url = url.substring(index + 1)

    //     if (index === -1 || url === '' || url === '/') {
    //         url = 'index'
    //     }

    //     return url
    // }

    var hashChange = function() {

        var hash = window.location.hash
        var history = window.history

        // 去掉url前面的#!
        hash = hash.replace('#!', '')

        // 将去掉#!后的url显示在地址栏中
        history.replaceState(null, null, hash)
    }
    
    this.when = function(path, route) {

        routes[path] = route

        return provider
    }

    // 路由的配置必须由otherwise结尾，该方法负责注册路由规则和激活hashchange事件
    this.otherwise = function(path) {

        routes.otherwise = path

        Route.routes = routes

        window.addEventListener('hashchange', hashChange)
    }

    return this
}

/**
 * 2015.5.21 
 * 增加了Route模块
 * 增加了hashChange事件，when和otherwise方法
 */





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

    
/**
 * @name  _outro.js
 * @description 框架的结尾
 * @date 2015.5.20
 */


    global.$ = global.Fishbone = $

} (window, window.document)