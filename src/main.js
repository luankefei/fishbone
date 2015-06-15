/**
 * @name  main.js
 * @description  此文件是种子模块，定义了大量私有变量，提供extend等基础api
 * @date  2015.05.07
 * @author  sunken
 */
var W3C = DOC.dispatchEvent //IE9开始支持W3C的事件模型与getComputedStyle取样式值
var html = DOC.documentElement //HTML元素
var head = DOC.head || DOC.getElementsByTagName('head')
var body = document.body
var version = 2


// 命名空间，传入css表达式或dom对象，返回一个fishbone对象
// function $(selector) {

//     return $.fn.init(selector)
// }
function $(selector) {

    return new $.fn.init(selector)
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

function query(expr) {

    var arrExp = expr.split(',')

    var nodes = DOC.querySelectorAll(expr)

    for (var i = 0; i < nodes.length; i++) {

        this[i] = nodes[i]
    }

    this.length = nodes.length

    return this
}


// 将类数组对象转成数组
// TODO: catch部分的代码是jquery源码
function makeArray(arrayLike) {

    var arr = []

    try {

        arr = Array.prototype.slice.call(arrayLike)
    
    } catch(e) {

        var i = arrayLike.length

        if (i == null || typeof arrayLike === 'string') {

            arr[0] = arrayLike
        
        } else {

            while(i) {

                arr[--i] = arrayLike[i]
            }
        }
    }

    return arr
}

// 初始化fishbone对象
// TODO: 分支较多，结构不清晰。对length和selector的赋值不统一
function init(expr) {

    // 分支1，处理空白字符串、null、undefiend函数
    if (!expr) {

        return this
    }

    // 分支2，如果传入的是dom节点
    if (expr.nodeName) {

        this[0] = expr
        this.length = 1

        return this
    }

    this.selector = expr + ''

    // 分支3，传入的是数组、节点集合
    if (expr instanceof Array || expr instanceof NodeList) {

        for (var i = 0; i < expr.length; i++) {

            this[i] = expr[i]
        }

        this.length = expr.length

        return this
    }

    // 分支4，处理选择器
    if (typeof expr === 'string') {

        expr = expr.trim()

        // 分支5，动态生成新节点
        // TODO: 暂时不支持
        if (expr.charAt(0) === '<' && expr.charAt(expr.length - 1) === '>' && expr.length >= 3) {

            return this
            
        // 分支6，调用选择器模块
        } else {

            return query.call(this, expr)
        }

    // 分支7，处理fishbone对象
    } else if (expr instanceof $) {

        return expr
    
    // 分支8，处理window对象
    } else if (expr === window){

        this[0] = window
    }

    return this
}

/*


function init(expr) {

    // 分支1，处理空白字符串、null、undefiend函数
    // if (!expr) {

    //     return this
    // }

    // 分支1，如果传入的是dom节点
    if (expr.nodeName || expr === window) {

        this[0] = expr
        this.selector = null
    
        this.length = 1

    } else if (expr === 'body') {

        this[0] = DOC
        this.selector = expr
        this.length = 1

    // 分支3，传入的是dom数组
    } else if (expr instanceof Array || expr instanceof NodeList) {

        for (var i = 0; i < expr.length; i++) {

            this[i] = expr[i]
        }

        this.length = expr.length
        this.selector = null

    // 分支4，使用选择器获取dom元素
    } else {

        // 记录选择器，方便后面使用 
        this.selector = expr

        //expr = expr.replace(' ', '')

        var arrExp = expr.split(',')
        
        if (arrExp.length === 1 && arrExp[0].charAt(0) === '#') {

            // 记录选择器，方便后面使用 
            this.selector = expr
            this[0] = DOC.querySelector(arrExp[0])
            this.length = 1

        } else {

            var nodes = DOC.querySelectorAll(expr)

            for (var i = 0; i < nodes.length; i++) {

                this[i] = nodes[i]
            }

            this.length = nodes.length
            // 将nodeList转为数组
            //this = makeArray(this)
        }
    }
    
    // 让浏览器以为是数组
    //this.splice = function() {}

    return this
}

*/

init.prototype = $.fn

mix($.fn, {

    mix: mix,
    nodes: [],
    // bonelot
    fishbone: version,
    constructor: $,
    length: 0,
    splice: function() {},

    init: init
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
 * 2015.6.5
 * 增加了makeArray函数
 * 修改了init函数，为兼容IE 8 将Object.create更换为new Object
 * 2015.6.10
 * 修改了$和init函数，调用$会返回init的实例
 * 修改了fishbone对象的结构，现在看起来更像jquery
 * 2015.6.14
 * 修改了init函数，修复bug -> 选择器使用空格分割
 */
 