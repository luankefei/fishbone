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
var W3C = DOC.dispatchEvent //IE9开始支持W3C的事件模型与getComputedStyle取样式值
var html = DOC.documentElement //HTML元素
var head = DOC.head || DOC.getElementsByTagName('head')
var version = 1

// 命名空间，传入css表达式或dom对象，返回一个fishbone对象
function $(selector) {

    return $.fn.init(selector)
}

$.fn = $.prototype

// 糅杂，为一个对象添加更多成员
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
            this.selector = null

        } else {

            // 记录选择器，方便后面使用	
            this.selector = expr

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
        obj.selector = this.selector

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
 * @name event.js
 * @description 事件模块
 * @date 2015.5.25
 */

var Event = {}

// 添加事件
Event.addEvent = function(target, type, handler) {
    if (target.addEventListener) {
        target.addEventListener(type, handler, false)

    } else {

        target.attachEvent('on' + type, function(event) {
            // 把处理和程序作为时间目标的方法调用
            // 传递事件对象
            return handler.call(target, event)
        })
    }
}

// 移除事件
// TODO: handler应该是可选项，如果没有传入，清除所有事件函数
Event.removeEvent = function(target, type, handler) {

    // 对handler进行判断，如果不存在，按照type使用dom 0方式清除事件
    if (handler === undefined) {

        target['on' + type] = null
    }

    if (target.removeEventListener) {
        target.removeEventListener(type, handler, false)

    } else {

        target.detechEvent('on' + type, handler)
    }
}

Event.live = function(type, handler) {

    var selector = this.selector

    // live的实现，模仿jquery。但内部调用queryselector来匹配对象
    document.addEventListener(type, function(e) {

        var nodes = document.querySelectorAll(selector)

        for (var i = 0; i < nodes.length; i++) {

            if (nodes[i] === e.target) {

                return handler.call(e.target, e)
            }
        }
    })
}


// 将事件绑定在document上，然后根据selector来判断是否执行
// TODO: 缺少ie9以下的处理，事件委托的选择器不完善
/*
Event.live = function(target, type, handler) {
    // TODO: 这里应该是传入选择器的selector
    var selector = target.getAttribute('id')

    document.addEventListener(type, function(e) {
    
        if (e.target.id = selector) {
        
            e.target.call(e.target, handler)
        }
    })
}
*/

// 对外暴露的事件绑定api
Event.on = function(type, handler) {

    var target = this.nodes

    // 根据nodeName判断单个绑定或循环绑定
    if (target.nodeName) {

        Event.addEvent(target, type, handler)

    } else {

        target.forEach(function(v, i, a) {

            Event.addEvent(v, type, handler)
        })
    }
}

// domReady
Event.ready = function(handler) {

    var eventFn = W3C ? 'DOMContentLoaded' : 'readystatechange'
    var handle = null

    if (this.nodes !== document) {
        return
    }

    if (eventFn === 'readystatechange') {

        handle = function() {

            if (DOC.readyState === 'complete') {

                Function.call(handler)
            }
        }
    } else {

        Event.addEvent(this.nodes, eventFn, handle, false)
    }
}

/* Event.on = function(type, handler) { */

// var selector = this.selector

// // 如果选择器不存在，获取选择器链
// if (selector === null) {

// var str = ''

// // 判断this.nodes是否是复数
// if (this.nodes.length == 1) {
// }    
// }
/* } */

Event.unbind = function() {}


// Event.removeEvent = function(event) {

// var event = event || window.event

// if (event.preventDefault) {
// event.preventDefault()
// }

// if (event.returnValue) {
// event.returnValue = false    // IE
// }

// return false
// }



/**
 * 2015.5.25
 * 创建模块
 * 添加了addEvent和removeEvent函数
 * TODO: 添加了live函数，但不完善
 * 添加了on函数，此函数将对外暴
 * 2015.5.26
 * 重写了live函数，初步测试可用，但事件通过document绑定，还有优化空间
 * 添加了ready函数
 */

/**
 * @name module.js
 * @description 定义模块
 * @date 2015.5.26
 */

var Module = {}

// 组件类，生成基本结构
Module.Component = function() {
    
    // privite variable
    var that = this
   
    // basic properties
    this.node = null
    this.view = null

    this.controller = null
    this.model = null

    // basic mothod 
    this.init =  function(node) {
     
        this.node = node

        // 调用数据的初始化，之后会进入data的set，执行controller.refresh
        // TODO: callback 似乎是没用的
        this.model.init.call(this, function() {})

        return this 
    }

    return this
}

Module.component = {}

// 初始化组件
Module.component.init = function(name, handler) {
    
    var cop = new Module.Component()

    // 添加data属性
    cop = Object.defineProperties(cop, {
        
        data: {
            enumerable: true,
            configurable: true,
          
            get: function() { return this.value },
            set: function(value) { 

                this.value = value 
            
                // 数据变更时，调用view层的初始化
                this.controller.refresh(this.node)
            }
        }
    })
    
    return handler.call(this, cop)
}

/**
 * 2015.5.26
 * 使用defineProperties创建模块对象
 * 2015.5.28
 * 重写了模块
 * 2015.5.29
 * 重写了模块
 */


/**
 * @name css.js
 * @description css模块，改变fishbone对象的样式
 * @date 2015.5.30
 */


var Css = {}
// 基础的设置css方法
// TODO: 没有考虑如-40等变化量和有无px等情况
// TODO: 因为没有px后缀，对height的测试没有通过
Css.setCss = function(key, value) {

    // 处理变化量的情况，需要先获取，再计算
    if (value[0] === '+' || value[0] === '-') {}

    var sepIndex = key.indexOf('-')

    // 处理连缀写法
    if (sepIndex !== -1) {
    
        key = key.replace('-', '')
        // user + N + ame
        key = key.substring(0, sepIndex) + key[sepIndex].toUpperCase() + key.substring(sepIndex + 1)
    }

    console.log('test key')
    console.log(key)
    console.log(this.nodes)
    if (this.nodes.nodeName !== undefined) {
    
        this.nodes.style[key] = value
    
    } else {

        for (var i = 0, length = this.nodes.length; i < length; i++) {
        
            this.nodes[i].style[key] = value
        }
    }
}

// 基础的getCss方法
// TODO: 没有考虑驼峰、连缀写法，浏览器私有前缀和css优先级问题
Css.getCss = function(key) {

    var value = null

    if (this.nodes) {
        
        value = this.nodes.style[key]
    
    } else {

        console.log(this.nodes[0].style.height)
        value = this.nodes[0].style[key] 
    
    }

    return value
}

Css.init = function(key, value) {

    if (value === undefined) {
   
        // 这里要将this向下传递
        Css.getCss.call(this, key)
    
    } else {
    
        Css.setCss.call(this, key, value)
    }

    return this
}
/**
 * 2015.5.30
 * 创建模块
 * 添加setCss方法 
 * 添加getCss方法
 * 添加init方法，优化了setCss
 */



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

    
/**
 * @name  _outro.js
 * @description 框架的结尾
 * @date 2015.5.20
 */


    global.$ = global.Fishbone = $

} (window, window.document)