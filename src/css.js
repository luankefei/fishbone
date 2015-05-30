
/**
 * @name css.js
 * @description css模块，改变fishbone对象的样式
 * @date 2015.5.30
 */


var Css = {}

// 基础的设置css方法
// TODO: 没有考虑如-40等变化量或驼峰、连缀写法、有无px等情况
Css.setCss = function(key, value) {
    
    if (this.nodes.nodeName) {
    
        this.nodes.style[key] = value
    
    } else {
        
        for (var i = 0, length = this.nodes.length; i++) {
        
            this.nodes[i].style[key] = value
        }
    }
}

// 基础的getCss方法
// TODO: 没有考虑驼峰、连缀写法，浏览器私有前缀和css优先级问题
Css.getCss = function(key) {

    var value = null

    if (this.nodes.nodeName) {
        
        value = this.nodes.style[key]
    
    } else {
    
        value = this.nodes[0].style[key] 
    
    }

    return value
}

/**
 * 2015.5.30
 * 创建模块
 * 添加setCss方法 
 * 添加getCss方法
 */
