/* jshint asi:true */

/**
 * @name  main.js
 * @description  此文件是种子模块，描述整体结构，提供extend等基础api
 * @date  2015.05.07
 * @version  0.0.2
 */

'use strict'

!function(global, DOC) {

    var W3C = DOC.dispatchEvent                                         //IE9开始支持W3C的事件模型与getComputedStyle取样式值
    var html = DOC.documentElement                                      //HTML元素
    var head = DOC.head || DOC.getElementsByTagName('head')
    var hasOwn = Object.prototype.hasOwnProperty
    var version = 1

   
    var moduleMap = []                                                  // 用于amd模块
    var fileMap = {}                                                    // 用于amd模块

    var noop = function () {}                                           // 用于amd模块

    /**
     * @description 命名空间
     * @param  {String|Function} expr  CSS表达式或函数
     * @return {Mass}
     */
    function $(selector) {

        return $.fn.init(selector)
    }

    $.fn = $.prototype

    mix($.fn, {

        nodes: [],
        fishbone: version,
        constructor: $,
        length: 0,

        init: function(expr) {

            var arrExp = expr.split(' ')
            var ele = null

            if (arrExp.length === 1 && arrExp[0].charAt(0) === '#') {

                this.nodes = document.querySelector(arrExp[0])

            } else {

                this.nodes = document.querySelectorAll(expr)
            }

            var obj = Object.create($.fn)

            obj.nodes = this.nodes

            return obj
        }
    })


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
                if (hasOwn.call(supplier, key) && (ride || !(key in receiver))) {
                    receiver[key] = supplier[key]
                }
            }
        }

        return receiver
    }

    mix($, {

        mix: mix,
        
        /**
         * 定义模块
         * @param  {[string, optional]} name
         * @param  {[array, optional]} dependencies
         * @param  {[function]} factory
         * @return {[object]}
         */
        define: function(name, dependencies, factory) {

            var args = arguments

            if (args.length < 3) {

                if (args.length == 1) {

                    factory = name

                } else {

                    factory = dependencies
                    dependencies = name
                }

                // 生成名字
                name = 'Anonymous' + moduleMap.length 
                        + '.' 
                        + Math.random()
            }

            if (!moduleMap[name]) {

                var module = {
                    name: name,
                    dependencies: dependencies,
                    factory: factory
                };

                moduleMap[name] = module
            }

            return moduleMap[name]
        },

        // TODO: require暂时只能根据name查找，不能加载匿名模块，也就是不能异步引入模块文件
        require: function(name) {

            var module = moduleMap[name]

            if (!module.entity) {

                var args = []

                for (var i = 0; i < module.dependencies.length; i++) {
                    
                    if (moduleMap[module.dependencies[i]].entity) {

                        args.push(moduleMap[module.dependencies[i]].entity)

                    } else {

                        args.push(this.use(module.dependencies[i]))
                    }
                }

                module.entity = module.factory.apply(noop, args)
            }

            return module.entity
        },

        use: function (pathArr, callback) {

            // 如果传入的是字符串，自动转为数组
            if (typeof pathArr === 'string') {

                pathArr = new Array(pathArr)
            }

            for (var i = 0; i < pathArr.length; i++) {

                var path = pathArr[i]

                if (!fileMap[path]) {

                    var head = document.getElementsByTagName('head')[0]
                    var node = document.createElement('script')

                    node.type = 'text/javascript'
                    node.async = 'true'
                    node.src = path + '.js'

                    node.onload = function () {
                        fileMap[path] = true
                        head.removeChild(node)
                        checkAllFiles()
                    }

                    head.appendChild(node)
                }
            }

            function checkAllFiles() {

                var allLoaded = true

                for (var i = 0; i < pathArr.length; i++) {

                    if (!fileMap[pathArr[i]]) {

                        allLoaded = false

                        break
                    }
                }

                if (allLoaded) {

                    callback()
                }
            }
        }
    })

    global.$ = global.Fishbone = $


    // global.require = $.require
    // global.define = $.define

} (window, window.document)


/**
 * 2015.5.11 整合了原有的module.js模块，使框架结构更清晰
 * 2015.5.12 
 * 将amd模块与图表组件库统一，让出全局的define和require
 * 增加了require函数的字符串判断，允许传入字符串作为参数
 * 将require函数重命名为use，原use改为require
 * 将require函数的参数1，2改为可选
 * 2015.5.13
 * 重写了$函数，返回$.fn.init的结果，返回后的内容为dom对象与$.fn对象的并集
 */

