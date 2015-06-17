/**
 * @name  animate.js
 * @description  动画模块
 * @date  2015.6.5
 * @author  xiaoer
 */
var Animate = {}

// 返回初始值的数组
//

Animate.getBegin = function(key) {

    var begins = []

    for (var i = 0; i < this.length; i++) {

        var value = Number.parseFloat(this.eq(i).css(key))

        begins.push(value)
    }

    return begins
}

// 计算步长
Animate.getDistance = function(begin, end, duration, frame) {

    var distances = []

    // begin是数组，end是值
    for (var i = 0; i < begin.length; i++) {

        var value = (end - begin[i]) / (duration / frame)

        distances.push(value)
    }

    return distances
}

// 对外暴露的接口
Animate.init = function(params, duration, callback) {

    var start = new Date()

    var target = this

    var step = 0,           // 当前步数
        fps = 60,           // fps
        times = null        // 循环次数

    var duration = 1000     // 动画时间
    var frame = 15          // magic number: 15毫秒为一帧

    // TODO: 没有对param进行处理
    var begin = Animate.getBegin.call(this, 'height'),
        end = Number.parseFloat(params.height),
        now = begin,
        distances = Animate.getDistance(begin, end, duration, frame)

    times = Math.ceil(duration / frame)

    var wait = setInterval(function() {

        if (step === times) {

            var end = new Date() - start

            // 测试时间
            alert(end)

            clearInterval(wait)

            console.log('end')

        } else {

            for (var i = 0; i < target.length; i++) {

                // TODO: 没有使用param
                var height = now[i] + distances[i]

                now[i] = height
                height = height + 'px'

                target.eq(i).css('height', height)
            }

            // 步数 + 1
            step = step + 1
        }

    }, frame)
}






/*

Animate.linear = function(t, b, c, d) {
    //t：times,b:begin,c:change,d:duration
    return t / d * c + b;
}

Animate.init = function(params, duration, callback) {

    var sss = new Date()

    var ele = this;

    //clearInterval(ele.timer)
    var oChange = {}
    var oBegin = {}
        // 单位
    var unit = {}
    for (var attr in params) {

        var begin = Number.parseFloat(ele.css(attr))
        unit[attr] = ele.css(attr).slice(begin.toString().length)
        var change = params[attr] - begin;
        oChange[attr] = change;
        oBegin[attr] = begin;
    }
    var times = 0;
    var interval = 13;

    function step() {
        times += interval;
        if (times < duration) {
            for (var attr in params) {
                var change = oChange[attr];
                var begin = oBegin[attr];
                var val = Animate.linear(times, begin, change, duration) + unit[attr];
                ele.css(attr, val)
                    // setTimeout(step,interval)
            }
        } else {
            for (var attr in params) {
                ele.css(attr, params[attr] + unit[attr])
            }

            alert(new Date - sss)

            clearInterval(ele.timer);
            ele.timer = null;
            if (typeof callback == "function") {
                callback.call(ele);
            }
        }
    }

    ele.timer = window.setInterval(step, interval);

    return this;
}
*/

/**
 * 2015.6.5
 * 创建模块
 * 2015.6.15 重写动画模块
 */
 