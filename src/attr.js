/**
 * @name  attr.js
 * @description  属性操作模块
 * @date  2015.6.2
 * @author  sunken
 */
var Attr = {}

// 获取属性
Attr.getAttr = function(name) {

    return this.nodes.nodeName ? this.nodes.getAttribute(name) : this.nodes[0].getAttribute(name)
}

// 设置属性
Attr.setAttr = function(name, value) {

    if (this.nodes.nodeName) {

        this.nodes.setAttribute(name, value)

    } else {

        for (var i = 0; i < this.nodes.length; i++) {

            this.nodes[i].setAttribute(name, value)
        }
    }

    return this
}

Attr.hasAttr = function(name) {}

Attr.removeAttr = function(name) {}

Attr.init = function(name, value) {

    var returnValue = null

    if (value === undefined) {

        returnValue = Attr.getAttr.call(this, name)

    } else {

        returnValue = Attr.setAttr.call(this, name, value)
    }

    return returnValue
}

// 为dom节点的className属性追加其他name
// TODO: 急需重构
Attr.addClass = function(name) {

    var nodes = this.nodes,
        hasClass = false

    if (nodes instanceof Array) {

        for (var i = 0; i < nodes.length; i++) {

            var className = nodes[i].className

            // 如果没有class，直接赋值
            if (!className) {

                nodes[i].className = name

            } else {

                className = className.split(' ')


                for (var j = 0; j < className.length; j++) {

                    // 如果已经包含，不重复添加
                    if (className[j] === name) {

                        hasClass = true

                        break
                    }
                }

                // 如果没有重名class，进行赋值
                if (hasClass === false) {

                    nodes[i].className = nodes[i].className + ' ' + name

                } else {

                    // 重置hasClass
                    hasClass = false
                }
            }
        }


    } else {

        var className = nodes.className

        // 如果没有class，直接赋值
        if (!className) {

            nodes.className = name

        } else {

            className = className.split(' ')


            for (var i = 0; i < className.length; i++) {

                // 如果已经包含，不重复添加
                if (className[i] === name) {

                    hasClass = true

                    break
                }
            }

            // 如果没有重名class，进行赋值
            if (hasClass === false) {

                nodes.className = nodes.className + ' ' + name

            } else {

                // 重置hasClass
                hasClass = false
            }
        }  
    }

    return this
}

Attr.removeClass = function(name) {

    var nodes = this.nodes

    if (nodes.nodeName) {

        var className = nodes.className.split(' ')

        for (i = 0; i < className.length; i++) {

            if (className[i] === name) {

                className.splice(i, 1)

                break
            }
        }
        
        nodes.className = className.join(' ')

    } else {

        for (var i = 0; i < nodes.length; i++) {

            var className = nodes[i].className.split(' ')

            for (j = 0; j < className.length; j++) {

                if (className[j] === name) {

                    className.splice(j, 1)

                    break
                }
            }

            nodes[i].className = className.join(' ')
        }
    }
}



Attr.toggleClass = function() {}


Attr.replaceClass = function() {}

// 获取表单元素的value
Attr.val = function() {


}

/**
 * 2015.6.2
 * 创建模块
 * 增加了getAttr、setAttr和init
 * 测试通过
 * 2015.6.10
 * 增加了addClass、removeClass
 */
 