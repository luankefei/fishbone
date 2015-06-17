/**
 * @name  node.js
 * @description  dom、node模块，提供dom对象的CRUD
 * @date  2015.05.12
 * @author sunken
 */
var Node = {}

// 将node以某元素子元素的形式插入到该元素内容的最后面
Node.append = function(node) {

    //var nodes = []

    // 循环复制插入节点
    for (var i = 0; i < this.length; i++) {

        // 将fishbone对象转为dom对象
        if (node instanceof $) {

            node = node[0]
        }

        //var n = node.cloneNode(true)

        this[i].appendChild(node)
        //nodes.push(n)
    }

    return this
    //return new $.fn.init(nodes)
}

// 将节点插入目标元素
Node.appendTo = function(node) {

    for (var i = 0; i < this.length; i++) {

        $(node).append(this.eq(i))
    }

    return this
    // 返回新节点
    //return new $.fn.init(nodes)
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

// 修改元素的innerText
Node.text = function(text) {

    if (text === undefined) {

        return this[0].innerText

    } else {

        for (var i = 0; i < this.length; i++) {

            this[i].innerText = text
        }

        return this
    }
}

// 修改元素的innerHTML
Node.html = function(html) {

    if (html === undefined) {

        return this[0].innerHTML

    } else {

        for (var i = 0; i < this.length; i++) {

            this[i].innerHTML = html
        }

        return this
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

// TODO: 如果this.nodes不是数组，这里会报错
Node.eq = function(index) {

    var n = null

    n = this[index]
    n = new $.fn.init(n)

    return n
}

Node.first = function() {

    return Node.eq.call(this, 0)
}

Node.last = function() {

    return Node.eq.call(this, this.length - 1)
}

// 查找子节点，参数是css 2选择器
Node.find = function(expr) {

    var nodes = []

    for (var i = 0; i < this.length; i++) {

        var result = this[i].querySelectorAll(expr)

        for (var j = 0; j < result.length; j++) {

            nodes.push(result[j])
        }
    }

    return new $.fn.init(nodes)
}

// 获取当前元素在父节点中的下标
Node.index = function() {

    var brothers = this[0].parentNode.children

    for (var i = 0; i < brothers.length; i++) {

        if (brothers[i] === this[0]) {

            return i
        }
    }
}

// 获取/设置当前节点的值
Node.val = function(value) {

    if (value === undefined) {

        return this[0].nodeName === 'INPUT' ? this[0].value : ''
    }

    for (var i = 0; i < this.length; i++) {

        if (this[i].nodeName === 'INPUT') {

            this[i].value = value
        }
    }

    return this
}

// 隐藏元素
Node.hide = function() {

    return Css.init.call(this, 'display', 'none')
}

// 显示元素
Node.show = function() {

    return Css.init.call(this, 'display', 'block')
}

// 获取元素的宽
Node.width = function() {

    return Number.parseInt(Css.init.call(this, 'width'))
}

// 获取元素的高
Node.height = function() {

    return Number.parseInt(Css.init.call(this, 'height'))
}

// 获取元素的offset
Node.offset = function() {

    var offsetParent = $(this[0].offsetParent),
        offset = {
            top: offsetTop = this[0].offsetTop,
            left: this[0].offsetLeft
        },
        
        parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? {
            top: 0,
            left: 0
        } : offsetParent.offset()
    
    offset.top -= Number.parseInt(Css.init.call(this, 'margin-top'))
    offset.left -= Number.parseInt(Css.init.call(this, 'margin-left'))

    parentOffset.top += Number.parseInt(Css.init.call(offsetParent, 'border-top-width'))
    parentOffset.left += Number.parseInt(Css.init.call(offsetParent, 'border-left-width'))
    
    return {
        top: offset.top - parentOffset.top,
        left: offset.left - parentOffset.left
    }
}

Node.position = function() {

    return {
        top: Number.parseInt(Css.init.call(this, 'top')),
        right: Number.parseInt(Css.init.call(this, 'right')),
        bottom: Number.parseInt(Css.init.call(this, 'bottom')),
        left: Number.parseInt(Css.init.call(this, 'left'))
    }
}

// 获取当前元素的父节点
Node.parent = function() {

    var nodes = []

    for (var i = 0; i < this.length; i++) {

        nodes.push(this[i].parentNode)
    }

    return new $.fn.init(nodes)
}

// 获取当前元素的下一个兄弟节点
Node.next = function() {

    var nodes = []

    for (var i = 0; i < this.length; i++) {

        var next = this[i].nextSibling

        while(next && next.nodeType !== 1) {

            next = next.nextSibling
        }

        nodes.push(next)
    }

    return new $.fn.init(nodes)
}

// 获取当前元素的上一个兄弟节点
Node.prev = function() {

    var nodes = []

    for (var i = 0; i < this.length; i++) {

        var prev = this[i].previousSibling

        while(prev && prev.nodeType !== 1) {

            prev = prev.previousSibling
        }

        nodes.push(prev)
    }

    return new $.fn.init(nodes)
}

Node.each = function() {}



// 创建一个div，包裹原有代码
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
 * 2015.6.11
 * 增加了find、text方法
 * 增加了index方法
 * 增加了val方法
 * 2015.6.12
 * 增加了hide、show方法
 * 修改了hide、show方法，他们现在依赖css模块
 * 2015.6.14
 * 增加了offset、position方法
 * 2015.6.15
 * 增加了next、prev和parent方法
 * 2015.6.17
 * 增加了prepend方法，修改了append，对fishbone对象进行支持
 */
 