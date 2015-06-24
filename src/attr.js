/**
 * @name  attr.js
 * @description  属性操作模块
 * @date  2015.6.2
 * @author  sunken
 */
var Attr = {}

// 获取属性
Attr.getAttr = function(name) {

    return this[0].getAttribute(name)
}

// 设置属性
Attr.setAttr = function(name, value) {

    for (var i = 0; i < this.length; i++) {

        this[i].setAttribute(name, value)
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

    var hasClass = false

    for (var i = 0; i < this.length; i++) {

        var className = this[i].className

        // 如果没有class，直接赋值
        if (!className) {

            this[i].className = name

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

                this[i].className = this[i].className + ' ' + name

            } else {

                // 重置hasClass
                hasClass = false
            }
        }
    }

    return this
}

Attr.removeClass = function(name) {

    for (var i = 0; i < this.length; i++) {

        var classes = this[i].className.split(' ')

        for (j = 0; j < classes.length; j++) {

            if (classes[j] === name) {

                classes.splice(j, 1)

                break
            }
        }

        this[i].className = classes.join(' ')
    }

    return this
}

// 判断dom节点是否包含class
Attr.hasClass = function(name) {

    var target = this[0]

    var classes = target.className.split(' ')

    for (var i = 0; i < classes.length; i++) {

        if (classes[i] === name) {

            return true
        }
    }

    return false
}

Attr.toggleClass = function(name) {

    for (var i = 0; i < this.length; i++) {

        var target = this[i]

        var classes = target.className.split(',')

        for (var j = 0; j < classes.length; j++) {

            if (classes[j].trim() === name) {

                classes.splice(j, 1)

                break
            
            } else if (j === classes.length) {

                classes.push(name)
            }
        }   // end for

        this[i].className = classes.join(' ')
    }   // end for

    return this
}


Attr.replaceClass = function(name, value) {

    for (var i = 0; i < this.length; i++) {

        var target = this[i]

        var classes = target.className.split(',')

        for (var j = 0; j < classes.length; j++) {

            if (classes[j].trim() === name) {

                classes[j] = value

                break
            }
        }   // end for

        this[i].className = classes.join(' ')
    }   // end for

    return this
}


/**
 * 2015.6.2
 * 创建模块
 * 增加了getAttr、setAttr和init
 * 测试通过
 * 2015.6.10
 * 增加了addClass、removeClass
 * 2015.6.14
 * 增加了hasClass
 * 2015.6.24
 * 增加了replaceClass方法
 * 增加了toogleClass方法
 */
