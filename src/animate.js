/**
 * @name animate.js
 * @description 动画模块
 * @date 2015.6.5
 */


var Animate = {}

var Easing = {
    //当前时间*变化量/持续时间+初始值
    zfLinear: function(t, b, c, d) {
        return c * t / d + b;
    },
    Quad: { //二次方的缓动（t^2）；
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOut: function(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    },
    Cubic: { //三次方的缓动（t^3）
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
    },
    Quart: { //四次方的缓动（t^4）；
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOut: function(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
    },
    Quint: { //5次方的缓动（t^5）；
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        }
    },
    Sine: { //正弦曲线的缓动（sin(t)）
        easeIn: function(t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOut: function(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOut: function(t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
    },
    Expo: { //指数曲线的缓动（2^t）；
        easeIn: function(t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOut: function(t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    Circ: { //圆形曲线的缓动（sqrt(1-t^2)）；
        easeIn: function(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOut: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        }
    },
    Elastic: { //指数衰减的正弦曲线缓动；
        easeIn: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },
        easeInOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        }
    },
    Back: { //超过范围的三次方缓动（(s+1)*t^3 - s*t^2）；
        easeIn: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
    },
    zfBounce: { //指数衰减的反弹缓动。
        easeIn: function(t, b, c, d) {
            return c - Easing.zfBounce.easeOut(d - t, 0, c, d) + b;
        },
        easeOut: function(t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        easeInOut: function(t, b, c, d) {
            if (t < d / 2) return Easing.zfBounce.easeIn(t * 2, 0, c, d) * .5 + b;
            else return Easing.zfBounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    }
};

Animate.getCss=function(ele,attr){
	if(ele.currentStyle){
		return parseFloat(ele.currentStyle[attr]);
	}else{
		return parseFloat(getComputedStyle(ele,null)[attr]);
	}
}

Animate.setCss=function(ele,attr,value){
	switch(attr){
		case "width":
		case "height":
		case "left":
		case "top":
		case "margin":
		case "marginLeft":
		case "marginTop":
		case "marginRight":
		case "marginBottom":
		case "borderLeftWidth":
		case "borderTopWidth":
		case "borderRadius":
		
			ele.style[attr]=value+"px";
			break;
		case "opacity":
			ele.style.opacity=value;
			ele.style.filter="alpha(opacity="+value*100+")";
			break;
		case "float":
			ele.style.cssFloat=value;//IE的
			ele.style.styleFloat=value;//非IE的
			break;
		default:
			ele.style[attr]=value;
	}
}

Animate.linear = function(t, b, c, d) {
    //t：times,b:begin,c:change,d:duration
    return t / d * c + b;

}

Animate.init = function(params, duration, easing, callback) {

    // // 这是fishbone对象
    // console.log(this)
    //     // 这是fishbone对象里面的dom数组
    // console.log(this.nodes)



    var fn = Easing.Quart.easeInOut; //默认的效果就是这个：减速 0
    //fn=effect;
    if (typeof effect == "number") {
        switch (effect) {
            case 0:
                fn = Easing.Quart.easeInOut;
                break;
            case 1:
                fn = Easing.zfLinear;
                break;
            case 2:
                fn = Easing.Back.easeOut;
                break;
            case 3:
                fn = Easing.Elastic.easeOut;
                break;
            case 4:
                fn = Easing.zfBounce.easeOut;
                break;

        }
    } else if (typeof effect == "function") {
        //如果第四个参数是一个函数，则将当成回调函数
        fnCallback = effect;
    }

    var ele = this.nodes;
    // console.log(ele[0])
    // console.log(ele[0].nodeName)

    clearInterval(ele.timer);
    var oChange = {};
    var oBegin = {};
    for (var attr in params) {
        var begin =Animate.getCss(ele,attr);
        // console.log(begin)
        // console.log(params[attr])
        var change = params[attr] - begin;
        oChange[attr] = change;
        oBegin[attr] = begin;
    }
    // console.log(oChange)
    var times = 0;
    var interval = 13;

    function step() {
        times += interval;
        if (times < duration) {
            for (var attr in params) {
                var change = oChange[attr];
                var begin = oBegin[attr];
                var val = Animate.linear(times, begin, change, duration);
                // console.log(val)
               Animate.setCss(ele,attr,val);
            }
        } else {
            for (var attr in params) {
                 Animate.setCss(ele,attr,params[attr]);
            }
            clearInterval(ele.timer);
            ele.timer = null;
            if (typeof fnCallback == "function") {
                fnCallback.call(ele);
            }
        }
    }


    ele.timer = window.setInterval(step, interval);
    console.log(ele.timer)

    return this;

}







/**
 * 2015.6.5
 * 创建模块
 */
