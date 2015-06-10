
/**
 * @name  node.js
 * @description  dom、node模块，提供dom对象的CRUD
 * @date  2015.05.12
 * @author sunken
 */
var Node = {}

// 将node以某元素子元素的形式插入到该元素内容的最后面
Node.append = function(node) {

    var nodes = []

    // 循环复制插入节点
    for (var i = 0; i < this.length; i++) {

        var n = node.cloneNode(true)

        this[i].appendChild(n)
        nodes.push(n)
    }

    return new $.fn.init(nodes)
}

// 将node以某元素子元素的形式插入到该元素内容的最前面
Node.prepend = function(node) {

    // 循环复制插入节点
    for (var i = 0; i < nodes.length; i++) {

        var n = node.cloneNode(true)

        nodes[i].insertBefore(n, nodes[i].childNodes[0])

    }
  
    return this
}

// 克隆节点，如果include_all为true，会克隆该元素所包含的所有子节点
Node.clone = function(include) {

    var arr = []

    for (var i = 0; i < nodes.length; i++) {

        arr.push(nodes[i].cloneNode(include))
    }


    return arr
}

// 修改元素的innerHTML
Node.html = function(html) {

    if (html !== undefined) {

        for (var i = 0; i < this.length; i++) {

            this[i].innerHTML = html
        }

        return this

    } else {

        return this.length > 1 ? this[0].innerHTML : ''
    }
}

// 移除元素
Node.remove = function() {

    for (var i = 0, length = this.length; i < length; i++) {

        this[i].parentNode.removeChild(this[i])
    }    

    // TODO: 如果返回this，这个对象会包含已经删除节点对象的引用
    return null
}

Node.after = function() {}

Node.before = function() {}

Node.width = function() {}

// TODO: 如果this.nodes不是数组，这里会报错
Node.eq = function(index) {

    var n = null

    n = this.nodes[index]
    n = $.fn.init(n)

    return n
}

Node.first = function() {

    return Node.eq.call(this, 0)
}

Node.last = function() {

    return Node.eq.call(this, this.length - 1)   
}

Node.each = function() {}
Node.show = function() {}
Node.hide = function() {}
Node.wrap = function() {}

// 遍历所有对象
// Node.each = function() {

// },

/**
 * 2015.5.12 创建node模块
 * 2015.5.20 增加了append、prepend、clone和html方法
 * 2015.5.21
 * 在eq中添加了try-catch处理，目前的写法并不完美，但足够使用
 * 增加了first、last和remove方法
 * 2015.6.8
 * 修改了append、prepend、clone和html方法
 * 2015.6.10
 * 修改了append，现在返回一个fishbone对象，内含新添加的dom元素
 */
 