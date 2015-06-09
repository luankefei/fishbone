/*
 * @name  main.js
 * @description  此文件是种子模块，定义了大量私有变量，提供extend等基础api
 * @date  2015.05.07
 * @version  0.0.2
 * @author  sunken
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
                this.nodes = makeArray(this.nodes)
            }
        }

        //var obj = Object.create($.fn)
        var obj = new Object($.fn)
        
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
 * 2015.6.5
 * 增加了makeArray函数
 * 修改了init函数，为兼容IE 8 将Object.create更换为new Object
 */
 