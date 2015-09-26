/**
 * @name  animate.js
 * @description  动画模块
 * @date  2015.6.5
 * @author  xiaoer
 */

var Animate = {}



// 支持的变化属性，及默认单位
Animate.supports = {
    'width': 'px',
    'height': 'px',
    'top': 'px',
    'left': 'px',
    'right': 'px',
    'bottom': 'px',
    'opacity': '',
    'background-position': 'px'
    // 'transform': 'deg'
}

// 动画类
function Animation(target, params, duration, callback) {

    var start = new Date()

    var step = 0,           // 当前步数
        fps = 60,           // fps
        times = null        // 循环次数

    // var duration = 1000     // 动画时间
    var frame = 13          // magic number: 15毫秒为一帧

    // duration *= 0.85

    // 过滤初始值
    var filter = Animate.paramFilter(params)
    var keys = filter.keys

    params = filter.params

    // TODO: 没有对param进行处理
    var begin = Animate.getBegins.call(target, params, keys),
        end = params,
        now = begin,
        distances = Animate.getDistance(begin, end, duration, frame)

    // 动画执行次数
    times = Math.ceil(duration / frame)

    // 记录当前动画的执行状态
    target.data('isAnimated', true)

    var stepStart = new Date()

    // 执行动画
    var wait = setInterval(function() {
        
        var currentFrame = new Date() - stepStart
        stepStart = new Date()

        // 最后一帧
        if (step === times) {

            var end = new Date() - start

            // 测试时间
            // console.log('end time: ' + end)

            clearInterval(wait)

        } else {

            for (var i = 0; i < target.length; i++) {

                for (var j = 0; j < keys.length; j++) {

                    var key = keys[j]
                    var value = null

                    // 为background-position等多值属性进行特殊处理
                    if (now[i][key] instanceof Array) {

                        value = []

                        now[i][key].forEach(function(v, index, a) {

                             value.push(now[i][key][index] + distances[i][j][index])
                        })

                    } else {

                        value = now[i][key] + distances[i][j]
                    }

                    // 如果是最后一步，纠正误差
                    if (step === times - 1) {

                        value = Number.parseFloat(params[key])
                    }
                
                    var unit = Animate.supports[key]

                    // 重置当前数值
                    now[i][key] = value

                    // 根据key处理value
                    // 处理特殊值
                    if (key === 'rotate') {

                        key = 'transform'
                        value = 'rotate(' + value + unit + ')'

                        // TODO: 如果加入rotate、scale等，在getBegins和getDistance里面，也要做特殊处理
                        // console.log('rotate')
                        // console.log(key)
                        // console.log(value)
                        // console.log(now[i][key])
                        // console.log(distances[i][j])
                    // 处理常规值：width、height、left、top、bottom、right
                    } else if (key === 'background-position') {

                        value = value[0] + 'px ' + value[1] + 'px'

                    } else {

                        // 补上单位
                        value = value + unit    
                    }

                    target.eq(i).css(key, value)
                }
            }

            // 步数 + 1
            step = step + 1
        }

        var stepStop = new Date - stepStart

    }, frame)

    return target
}





// 当前动画的key集合
//Animate.keys = []

// 返回初始值的数组
// TODO: getBegin应该能处理一组参数，数组里面存动画对象
// TODO: 动画不精确，因为使用了float，最后一步要进行纠正，不能按照distance来走

// 计算初始值
Animate.getBegins = function(params, keys) {

    var begins = []

    // 遍历params进行遍历
    for (var i = 0; i < this.length; i++) {

        var params = {}
        var obj = this.eq(i)

        for (var j = 0; j < keys.length; j++) {

            var key = keys[j]

            // 为background-position的双数值做特殊判断
            if (key === 'background-position') {

                var valueArr = obj.css(key).split(' ')

                params[key] = [Number.parseFloat(valueArr[0]), Number.parseFloat(valueArr[1])]

            } else {

                params[key] = Number.parseFloat(obj.css(key))
            }
        }

        begins.push(params)
    }

    return begins
}

// 计算步长
Animate.getDistance = function(begin, end, duration, frame) {

    var distances = []

    // begin是数组，end是值
    for (var i = 0; i < begin.length; i++) {

        var changes = []

        // begin是一个对象数组，需要遍历计算
        for (var k in begin[i]) {

            // 为begin为数组类型进行特殊处理
            if (begin[i][k] instanceof Array) {

                var tempArr = []

                end[k].split(' ').forEach(function(v, index, a) {

                    tempArr.push((Number.parseFloat(v) - begin[i][k][index]) / (duration / frame))
                })

                changes.push(tempArr)

            } else {

                // 结束值 - 初始值 / 帧频
                changes.push((Number.parseFloat(end[k]) - begin[i][k]) / (duration / frame))
            }
        }

        distances.push(changes)
    }

    return distances
}

// 过滤初始值
Animate.paramFilter = function(params) {

    // 过滤params，同时补全单位
    // 整理后的animate key
    var keys = []

    // 使用for in 遍历params
    for (var k in params) {

        if (Animate.supports[k] === undefined) {
            
            delete params[k]

        } else {

            keys.push(k)
        }
    }

    // Animate.keys = keys

    return {
        params: params,
        keys: keys
    }
}

// 对外暴露的接口
Animate.init = function(params, duration, callback) {

    return new Animation(this, params, duration, callback)
}



/**
 * 2015.6.5
 * 创建模块
 * 2015.6.15 重写动画模块
 * 2015.6.18 初步测试可用，与上个版本功能一致
 * 2015.6.22
 * 修改了supports，增加了opacity
 * 修改了paramFilter，fix bug：判断Animate.supports[k]应该使用undefined
 * 2015.9.26
 * 修改整个流程，尝试增加对多值属性支持。background-position测试通过，但不完善。
 * 没有支持center left top等值。可以将单值多值统一成数组格式，消除if分支。
 */
 
