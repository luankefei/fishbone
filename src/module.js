/**
 * @name module.js
 * @description 定义模块
 * @date 2015.5.26
 */

var Module = {}

Module.init = function(handler) {
    
    var module = handler()
    
    // 添加模块的基础属性
    mix(module, {
        node: null,
        init: function(node) {

            module.node = node

            module.model.init(function() {

                module.view.init(node)
                module.controller.init()
            })
        }
    })

    // 添加data属性
    module = Object.defineProperties(module, {
        
        data: {
            enumerable: true,
            configurable: true,
            
            get: function() { return this.value },
            set: function(newValue) { 
                this.value = newValue 

                // 数据变更时，调用view层的初始化
                module.view.init(module.node)
            }
        }
    })

    return module
}

/**
 * 2015.5.26
 * 使用defineProperties创建模块对象
 */
