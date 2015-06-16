/**
 * @name  animate.js
 * @description  动画模块
 * @date  2015.6.5
 * @author  xiaoer
 */

var Animate = {}






Animate.linear = function(t, b, c, d) {
    //t：times,b:begin,c:change,d:duration
    return t / d * c + b;
}

Animate.init = function(params, duration, callback) {

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

/**
 * 2015.6.5
 * 创建模块
 * 2015.6.15 重写动画模块
 */