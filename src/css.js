/**
 * @name  css.js
 * @description  css模块，改变fishbone对象的样式
 * @date  2015.5.30
 */
var Css = {}

// 判断传入setCss的值是否是变化量
Css.validateChange = function(value) {
    
    return (value[0] === '+' || value[0] === '-') && typeof value[value.length - 1] === 'number'

    /*
    if () {

        return true

    } else {

        return false
    }
    */
}

// 处理连缀写法，将css写法转为驼峰式
Css.handleSeperator = function(key) {
    // 对key处理，与value无关
    var sepIndex = key.indexOf('-')

    if (sepIndex !== -1) {
    
        key = key.replace('-', '')
        // user + N + ame
        key = key.substring(0, sepIndex) + key[sepIndex].toUpperCase() + key.substring(sepIndex + 1)
    }

    return key
}

// 处理变化量
Css.calculateChange = function(key, value) {
        
    // 这里调用的是Css.getCss
    // TODO: 如果是width，返回值会带px，返回类型需要验证 
    var oldValue = Css.getCss.call(this, key)

    // 去掉px后取整
    oldValue = Number.parseInt(oldValue.substring(0, oldValue.length - 2))
    // 去掉px后取整
    value = Number.parseInt(value.substring(0, value.length - 2))
    value = oldValue + value + 'px'

    return value
}

// 基础的设置css方法
// TODO: 没有考虑有无px等情况
Css.setCss = function(key, value) {

    // 处理变化量的情况，需要先获取，再计算
    var change = Css.validateChange(value)
   
    if (change) {

        value = Css.calculateChange.apply(this, [key, value])    
    }

    // 处理连缀写法
    key = Css.handleSeperator(key)

    for (var i = 0, length = this.length; i < length; i++) {

        this[i].style[key] = value
    }
    
    return this
}

// 基础的getCss方法
// TODO: 没有考虑驼峰、浏览器私有前缀和css优先级问题
// TODO: 仅支持连缀写法
Css.getCss = function(key) {

    var value = null
    var node = null
    
    // 只返回第一个对象的值   
    node = this[0]
    
    // IE 8 supoort, Opera
    if (!node.currentStyle) {

        value = global.getComputedStyle(node, false).getPropertyValue(key)

    } else {

        value = node.currentStyle[key]
    }

    return value
}

// 对外暴露的接口，$.fn.css
Css.init = function(key, value) {

    var returnValue = null

    if (value === undefined) {
   
        // 这里要将this向下传递
        returnValue = Css.getCss.call(this, key)
    
    } else {
    
        returnValue = Css.setCss.call(this, key, value)
    }

    return returnValue
}

// 获取当前对象的绝对位置
// position和offset不同，需要分开计算。position是相对定位框，不是body
Css.position = function() {

    var top = Number.parseInt(Css.init.call(this, 'top')),
        left = Number.parseInt(Css.init.call(this, 'left')),
        right = Number.parseInt(Css.init.call(this, 'right')),
        bottom = Number.parseInt(Css.init.call(this, 'bottom'))

    top = top + Number.parseInt(Css.init.call(this, 'margin-top'))
    left = left + Number.parseInt(Css.init.call(this, 'margin-left'))
    right = right + Number.parseInt(Css.init.call(this, 'margin-right'))
    bottom = bottom + Number.parseInt(Css.init.call(this, 'margin-bottom'))

    return {
        top: top,
        right: right,
        bottom: bottom,
        left: left
    }
}

// 获取元素的offset
Css.offset = function() {

    var offsetParent = $(this[0].offsetParent),
        offset = {
            top: offsetTop = this[0].offsetTop,
            left: this[0].offsetLeft
        },
        
        parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? {
            top: 0,
            left: 0
        } : offsetParent.offset()
    
    // offset.top += Number.parseInt(Css.init.call(this, 'margin-top'))
    // offset.left += Number.parseInt(Css.init.call(this, 'margin-left'))

    parentOffset.top += Number.parseInt(Css.init.call(offsetParent, 'border-top-width'))
    parentOffset.left += Number.parseInt(Css.init.call(offsetParent, 'border-left-width'))
    
    return {
        top: offset.top - parentOffset.top,
        left: offset.left - parentOffset.left
    }
}
/**
 * 2015.5.30
 * 创建模块
 * 添加setCss方法 
 * 添加getCss方法
 * 添加init方法，优化了setCss
 * 2015.6.1
 * 修改了getCss，将dom.style替换成global.getComputedStyle
 * 添加了validateChange函数，用来判断传入的value是否是变化量
 * 修改了setCss，增加了变化量判断流程
 * 修改了setCss，修改了变化量的处理，暂时跑通，但缺乏对百分比的支持
 * 修改了init的返回值，get应该返回value，set则返回this
 * 2015.6.10
 * 修改了getCss，在IE 8 和 Opera上使用currentStyle代替getComputedStyle
 * 2015.6.11
 * 修改了getCss，fix bug
 * 2015.7.7
 * 增加了position方法
 * 增加了offset方法
 * 重构了validateChange方法
 */