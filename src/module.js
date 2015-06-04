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
