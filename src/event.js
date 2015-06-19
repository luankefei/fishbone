/**
 * @name  event.js
 * @description  事件模块
 * @date  2015.5.25
 */

var Event = {}

// 添加事件
Event.addEvent = function(target, type, handler) {

    // 向target添加事件之前记录在e上
    if (target.e === undefined) {

        target.e = {}
    }

    if (target.e[type] === undefined) {

        target.e[type] = []
    }

    target.e[type].push({

        type: type,
        handler: handler
    })

    if (target.addEventListener) {
        target.addEventListener(type, handler, false)

    } else {

        target.attachEvent('on' + type, function(event) {

            event.pageX = event.clientX 
                    + ( DOC && DOC.scrollLeft || body && body.scrollLeft || 0 ) 
                    - ( DOC && DOC.clientLeft || body && body.clientLeft || 0 )

            event.pageY = event.clientY 
                    + ( DOC && DOC.scrollTop || body && body.scrollTop || 0 ) 
                    - ( DOC && DOC.clientTop || body && body.clientTop || 0 )

            // 把处理和程序作为时间目标的方法调用
            // 传递事件对象
            return handler.call(target, event)
        })
    }
}

Event.removeEvent = function(target, type, handler) {

    // 对handler进行判断，如果不存在，按照type清除全部事件
    if (handler === undefined) {

        // 事件对象e，以type为key，每个事件类型对应一个handler数组
        var events = target.e[type]

        // ie9+
        if (target.removeEventListener) {

            // 遍历当前节点上保存的所有事件
            for (var i = 0; i < events.length; i++) {

                // 匹配同类型事件
                // 分支1，如果传入了handler
                if (events[i].type === type && events[i].handler === handler) {

                    target.removeEventListener(type, handler, false)

                    events.splice(i, 1)
                
                // 分支2，type匹配但没有handler，全部删除
                } else if (events[i].type === type) {

                    target.removeEventListener(type, events[i].handler, false)

                    // 从数组中删除事件，并重置数组长度
                    events.splice(i, 1)
                }
            }

        // IE 8
        // TODO: 未经过测试
        } else {

            for (var i = 0; i < events.length; i++) {

                // 分支1，如果传入了handler
                if (events[i].type === type && events[i].handler === handler) {

                    target.detachEvent('on' + type, handler)

                    events.splice(i, 1)


                } else if (events[i].type === type) {

                    target.detachEvent('on' + type, events[i].handler)

                    events.splice(i, 1)
                }
            }
        }

    } else {

        if (target.removeEventListener) {
            target.removeEventListener(type, handler, false)

        } else {

            target.detachEvent('on' + type, handler)
        }
    }
}

// 移除事件
// TODO: handler应该是可选项，如果没有传入，清除所有事件函数
// TODO: ie 9以下不兼容
/*
Event.removeEvent = function(target, type, handler) {

    // 对handler进行判断，如果不存在，按照type清除全部事件
    if (handler === undefined) {

        var events = target.e[type]

        if (target.removeEventListener) {

            for (var i = 0; i < events.length; i++) {

                if (events[i].type === type && handler) {

                    delete events[i]

                    target.removeEventListener(type, events[i].handler, false)
                }
            }

        } else {

            // IE 8
            for (var i = 0; i < events.length; i++) {

                if (events[i].type === type) {

                    delete events[i]

                    target.detachEvent('on' + type, events[i].handler)
                }
            }
        }

    } else {


        if (target.removeEventListener) {
            target.removeEventListener(type, handler, false)

        } else {

            target.detachEvent('on' + type, handler)
        }
    }
}
*/
// 将事件绑定在document上，然后根据selector来判断是否执行
// TODO: 缺少ie9以下的处理，事件委托的选择器不完善
Event.live = function(type, handler) {

    var selector = this.selector

    // live的实现，模仿jquery。但内部调用queryselector来匹配对象
    document.addEventListener(type, function(e) {

        var loop = 0

        var nodes = document.querySelectorAll(selector)
        var target = e.target

        do {

            for (var i = 0; i < nodes.length; i++) {

                ++loop

                if (nodes[i] === target) {

                    console.log('live match loop: ' + loop)

                    return handler.call(target, e)
                }
            }

            target = target.parentNode

        } while (target !== document)
    })
}

// 对外暴露的事件绑定api
Event.on = function(type, handler) {

    // 根据nodeName判断单个绑定或循环绑定
    // target可能是window或document对象，判断条件从nodeName改成是否是array
    for (var i = 0; i < this.length; i++) {

        Event.addEvent(this[i], type, handler)
    }
}

// domReady
Event.ready = function(handler) {


    var eventFn = W3C ? 'DOMContentLoaded' : 'readystatechange'
    var handle = handler

    if (this[0] !== document) {

        return
    }
    
    // 如果domReady已经结束，直接执行回调
    if (DOC.readyState !== 'complete') {

        //console.log(DOC.readyState)
        if (eventFn === 'readystatechange') {

            handle = function() {

                if (DOC.readyState === 'complete') {

                    Function.call(handler)
                }
            }

        }
        
        Event.addEvent(this[0], eventFn, handle)

    } else {

        handle.call(null)
    }
}

// 关闭事件的接口
Event.off = function(type, handler) {

    for (var i = 0; i < this.length; i++) {

        Event.removeEvent(this[i], type, handler)
    }
}

/**
 * 2015.5.25
 * 创建模块
 * 添加了addEvent和removeEvent函数
 * TODO: 添加了live函数，但不完善
 * 添加了on函数，此函数将对外暴
 * 2015.5.26
 * 重写了live函数，初步测试可用，但事件通过document绑定，还有优化空间
 * 添加了ready函数
 * 2015.6.5
 * 将unbind更名为off
 * 2015.6.15
 * 修改了removeEvent，在删除事件的同时删除target.e
 * 2015.6.16
 * 修改了removeEvent，修复bug，先解除事件再删除target.e
 * 修改了removeEvent，增加了handler的存在验证分支
 */
