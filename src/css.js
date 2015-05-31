
/**
 * @name css.js
 * @description css模块，改变fishbone对象的样式
 * @date 2015.5.30
 */


var Css = {}
// 基础的设置css方法
// TODO: 没有考虑如-40等变化量和有无px等情况
// TODO: 因为没有px后缀，对height的测试没有通过
Css.setCss = function(key, value) {

    // 处理变化量的情况，需要先获取，再计算
    if (value[0] === '+' || value[0] === '-') {}

    var sepIndex = key.indexOf('-')

    // 处理连缀写法
    if (sepIndex !== -1) {
    
        key = key.replace('-', '')
        // user + N + ame
        key = key.substring(0, sepIndex) + key[sepIndex].toUpperCase() + key.substring(sepIndex + 1)
    }

    console.log('test key')
    console.log(key)
    console.log(this.nodes)
    if (this.nodes.nodeName !== undefined) {
    
        this.nodes.style[key] = value
    
    } else {

        for (var i = 0, length = this.nodes.length; i < length; i++) {
        
            this.nodes[i].style[key] = value
        }
    }
}

// 基础的getCss方法
// TODO: 没有考虑驼峰、连缀写法，浏览器私有前缀和css优先级问题
Css.getCss = function(key) {

    var value = null

    if (this.nodes) {
        
        value = this.nodes.style[key]
    
    } else {

        console.log(this.nodes[0].style.height)
        value = this.nodes[0].style[key] 
    
    }

    return value
}

Css.init = function(key, value) {

    if (value === undefined) {
   
        // 这里要将this向下传递
        Css.getCss.call(this, key)
    
    } else {
    
        Css.setCss.call(this, key, value)
    }

    return this
}
/**
 * 2015.5.30
 * 创建模块
 * 添加setCss方法 
 * 添加getCss方法
 * 添加init方法，优化了setCss
 */
