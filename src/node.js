/**
 * @name  node.js
 * @description  dom、node模块，提供dom对象的CRUD
 * @date  2015.05.12
 */
var Node = {}

// 将node以某元素子元素的形式插入到该元素内容的最后面
Node.append = function(node) {

    if (this.nodes.length === 1) {

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
Node.clone = function(include) {

    if (this.nodes.nodeName) {

        return this.nodes.cloneNode(include)

    } else {

        var arr = []

        this.nodes.forEach(function(v) {

            arr.push(v.cloneNode(include))    
        })

        return arr
    }
}

// 修改元素的innerHTML
Node.html = function(html) {

    var nodes = this.nodes

    if (html !== undefined) {

        if (nodes.nodeName) {

            nodes.innerHTML = html            

        } else {

            nodes.forEach(function(v, i, a) {

                v.innerHTML = html
            })
        }

        return this


    } else {

        return nodes.nodeName ? nodes.innerHTML : ''
    }
}

// 移除元素
Node.remove = function() {

    var nodes = this.nodes

    if (nodes instanceof Array) {

        for (var i = 0, length = nodes.length; i < length; i++) {

            var node = nodes[i]

            node.parentNode.removeChild(node)
        }

    } else {

        nodes.parentNode.removeChild(nodes)
    }

    // TODO: 如果返回this，这个对象会包含已经删除节点对象的引用
    return null
}

// 清空元素的内容
Node.empty = function() {}

Node.after = function() {}

Node.before = function() {}

Node.css = function() {}

Node.width = function() {}

Node.attr = function(key, value) {}

// TODO: 如果this.nodes不是数组，这里会报错
Node.eq = function(index) {

    var n = null

    try {

        n = this.nodes[index]

        n = $.fn.init(n)

    } catch(e) {

        console.error('$.fn.eq只能用于复数节点集合')
    }

    return n
}

Node.first = function() {

    return Node.eq.call(this, 0)
}

Node.last = function() {

    return Node.eq.call(this, this.nodes.length - 1)   
}



// each: function() {},

/**
 * 2015.5.12 创建node模块
 * 2015.5.20 增加了append、prepend、clone和html方法
 * 2015.5.21
 * 在eq中添加了try-catch处理，目前的写法并不完美，但足够使用
 * 增加了first、last和remove方法
 */



