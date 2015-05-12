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
    var fishbone = 1

   
    var moduleMap = {}                                                  // 用于amd模块
    var fileMap = {}                                                    // 用于amd模块

    var noop = function () {}                                           // 用于amd模块

    /**
     * @description 命名空间
     * @param  {String|Function} expr  CSS表达式或函数
     * @return {Mass}
     */
    function $(expr) {

        var arrExp = expr.split(' ')
        var ele = null

        if (arrExp.length === 1 && arrExp[0].charAt(0) === '#') {

            ele = document.getElementsById(arrExp[0])

        } else {

            ele = document.querySelecotorAll(expr)
        }

        return ele
    }

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

        define: function(name, dependencies, factory) {

            console.log('define: ' + name)

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

        use: function(name) {

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

        require: function (pathArr, callback) {

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

    global.$ = $

} (window, window.document)


/**
 * 2015.5.11 整合了原有的module.js模块，使框架结构更清晰
 * 2015.5.12 
 * 将amd模块与图表组件库统一，让出全局的define和require
 */

