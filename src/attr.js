
/**
 * @name attr.js
 * @description 属性操作模块
 * @date 2015.6.2
 */
var Attr = {}

// 获取属性
Attr.getAttr = function(key) {

    return this.nodes.nodeName ? this.nodes.getAttribute(key) : this.nodes[0].getAttribute(key)
}

// 设置属性
Attr.setAttr = function(key, value) {
    
    if (this.nodes.nodeName) {

        this.nodes.setAttribute(key, value)

    } else {
   
        for (var i = 0; i < this.nodes.length; i++) {

            this.nodes[i].setAttribute(key, value)
        } 
    }

    return this
}

Attr.init = function(key, value) {
   
    var returnValue = null

    if (value === undefined) {
    
        returnValue = Attr.getAttr.call(this, key)

    } else {

        returnValue = Attr.setAttr.call(this, key, value)
    }

    return returnValue
}

/**
 * 2015.6.2
 * 创建模块
 * 增加了getAttr、setAttr和init
 * 测试通过
 */