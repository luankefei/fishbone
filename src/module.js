/**
 * @name module.js
 * @description 定义模块
 * @date 2015.5.26
 */

var Module = {}

// 组件模块类, 参数mvc
Module.Component = function(model, view, controller) {
   
    var model = model,
        view = view,
        controller = controller,
        that = this

    // 添加模块的基础属性
    this.node = null
    this.init =  function(node) {
    
        this.node = node

        // 初始化用户定义的模块
        model.init(function() {

            view.init(node)
            controller.init(node)

            return that
        })
    }

    return this
}


Module.init = function(handler) {

    var obj = handler()
    var module = new Module.Component(obj.model, obj.view, obj.controller)

    // 添加data属性
    module = Object.defineProperties(module, {
        
        data: {
            enumerable: true,
            configurable: true,
            
            get: function() { return this.value },
            set: function(newValue) { 
                this.value = newValue 

                console.log('问题就在这')
                // 数据变更时，调用view层的初始化
                module.init(module.node)
            }
        }
    })

    return module
}

/**
 * 2015.5.26
 * 使用defineProperties创建模块对象
 */
