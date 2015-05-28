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
        controller = controller
    // 添加模块的基础属性
    this.node = null
    this.init =  function(node) {

        this.node = node

        console.log('----')
        console.log(this)
        // 初始化用户定义的模块
        model.init.call(this, function() {
        
            view.init(node)
            controller.init(node)
        })
        
        return this 
    }
    
    // 数据变更后的刷新操作
    this.refresh = function(node) {
        
        view.init.call(this, node)
        controller.init(node)
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
                // 数据变更时，调用view层的初始化
                module.refresh(module.node)
            }
        }
    })

    return module
}

/**
 * 2015.5.26
 * 使用defineProperties创建模块对象
 * 2015.5.28
 * 
 */
