

/**
 * @name  node.js
 * @description  dom、node模块，提供dom对象的CRUD
 * @date  2015.05.12
 */
var Node = {}


// 将node以某元素子元素的形式插入到该元素内容的最后面
Node.append = function(node) {

    if (this.nodes.length == 1) {

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
Node.clone = function(include_all) {

    if (this.nodes.nodeName) {

        return this.nodes.cloneNode(include_all)

    } else {

        var arr = []

        this.nodes.forEach(function(v) {

            arr.push(v.cloneNode(include_all))    
        })

        return arr
    }
}

// 修改元素的innerHTML
Node.html = function() {}

// 移除元素
Node.remove = function() {}

Node.empty = function() {}

Node.after = function() {}

Node.before = function() {}

Node.css = function() {}

Node.width = function() {}

Node.attr = function(key, value) {}




// get: function() {},

// eq: function() {},

// first: function() {},

// last: function() {},

// each: function() {},



// html: function() {},
   

/**
 * 2015.05.12 创建node模块
 */



