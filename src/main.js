/**
 * @name  main.js
 * @description  此文件是种子模块，定义了大量私有变量，提供extend等基础api
 * @date  2015.05.07
 * @author  sunken
 */
var W3C = DOC.dispatchEvent // IE9开始支持W3C的事件模型与getComputedStyle取样式值
var html = DOC.documentElement // HTML元素
var head = DOC.head || DOC.getElementsByTagName('head')
var body = document.body
var version = 2


// 命名空间，传入css表达式或dom对象，返回一个fishbone对象
function $(selector) {
  return new $.fn.init(selector)
}

$.fn = $.prototype

// 糅杂，为一个对象添加更多成员
function mix(receiver, supplier) {
  var args = [].slice.call(arguments),
    i = 1,
    key, // 如果最后参数是布尔，判定是否覆写同名属性
    ride = typeof args[args.length - 1] === 'boolean' ? args.pop() : true

  if (args.length === 1) { // 处理$.mix(hash)的情形
    receiver = !this.window ? this : {}
    i = 0
  }

  while ((supplier = args[i++])) {
    for (key in supplier) {
      // 允许对象糅杂，用户保证都是对象
      if (Object.prototype.hasOwnProperty.call(supplier, key) && (ride || !(key in receiver))) {
        receiver[key] = supplier[key]
      }
    }
  }

  return receiver
}

function query(expr) {
  var arrExp = expr.split(',')
  var nodes = DOC.querySelectorAll(expr)

  for (var i = 0; i < nodes.length; i++) {
    this[i] = nodes[i]
  }

  this.length = nodes.length

  return this
}

function create(nodeName) {
  var node = document.createElement(nodeName)

  return new $.fn.init(node)
}

var imgReady = (function() {
  var list = [],
      intervalId = null,

      // 用来执行队列
      tick = function() {
        var i = 0;
        for (; i < list.length; i++) {
            list[i].end ? list.splice(i--, 1) : list[i]()
        };
        !list.length && stop()
      },

      // 停止所有定时器队列
      stop = function() {
        clearInterval(intervalId)
        intervalId = null
      };

  return function(url, ready, load, error) {
    var onready, width, height, newWidth, newHeight,
        img = new Image()

    img.src = url

    // 如果图片被缓存，则直接返回缓存数据
    if (img.complete) {
        ready.call(img)
        load && load.call(img);
        return
    }

    width = img.width
    height = img.height

    // 加载错误后的事件
    img.onerror = function() {
        error && error.call(img)
        onready.end = true
        img = img.onload = img.onerror = null
    }

    // 图片尺寸就绪
    onready = function() {
      newWidth = img.width;
      newHeight = img.height;
      if (
        newWidth !== width
        || newHeight !== height
        // 如果图片已经在其他地方加载可使用面积检测
        || newWidth * newHeight > 1024
      ) {
        ready.call(img);
        onready.end = true
      }
    }

    onready()

    // 完全加载完毕的事件
    img.onload = function() {
      !onready.end && onready()
      load && load.call(img)

      // IE gif动画会循环执行onload，置空onload即可
      img = img.onload = img.onerror = null
    }

    // 加入队列中定期执行
    if (!onready.end) {
      list.push(onready)

      // 无论何时只允许出现一个定时器，减少浏览器性能损耗
      if (intervalId === null) {
        intervalId = setInterval(tick, 40)
      }
    }
  }
})()

// 将类数组对象转成数组
// TODO: catch部分的代码是jquery源码
function makeArray(arrayLike) {
  var arr = []

  try {
    arr = Array.prototype.slice.call(arrayLike)

  } catch(e) {
    var i = arrayLike.length

    if (i == null || typeof arrayLike === 'string') {
        arr[0] = arrayLike

    } else {
      while(i) {
          arr[--i] = arrayLike[i]
      }
    }
  }

  return arr
}

// 初始化fishbone对象
// TODO: 分支较多，结构不清晰。对length和selector的赋值不统一
function init(expr) {
  // 分支1，处理空白字符串、null、undefiend函数
  if (!expr) {
    return this
  }

  // 分支2，如果传入的是dom节点
  if (expr.nodeName) {
    this[0] = expr
    this.length = 1

    return this
  }

  this.selector = expr + ''

  // 分支3，传入的是数组、节点集合
  if (expr instanceof Array || expr instanceof NodeList) {
    for (var i = 0; i < expr.length; i++) {
      this[i] = expr[i]
    }

    this.length = expr.length

    return this
  }

  // 分支4，处理选择器
  if (typeof expr === 'string') {
    expr = expr.trim()

    // 分支5，动态生成新节点
    // TODO: 暂时不支持
    if (expr.charAt(0) === '<' && expr.charAt(expr.length - 1) === '>' && expr.length >= 3) {
      return this

    // 分支6，调用选择器模块
    } else {
      return query.call(this, expr)
    }

  // 分支7，处理fishbone对象
  } else if (expr instanceof $) {
    return expr

  // 分支8，处理window对象
  } else if (expr === window){
    this[0] = expr
    this.length = 1
  }

  return this
}


init.prototype = $.fn

mix($.fn, {
  mix: mix,
  nodes: [],
  // bonelot
  fishbone: version,
  constructor: $,
  length: 0,
  splice: function() {},
  init: init
})

/**
 * 2015.5.11 整合了原有的module.js模块，使框架结构更清晰
 * 2015.5.12
 * 将amd模块与图表组件库统一，让出全局的define和require
 * 增加了require函数的字符串判断，允许传入字符串作为参数
 * 将require函数重命名为use，原use改为require
 * 将require函数的参数1，2改为可选
 * 2015.5.13
 * 重写了$函数，返回$.fn.init的结果，返回后的内容为dom对象与$.fn对象的并集
 * 2015.5.20
 * 更换了打包方式，移除了amd模块
 * 2015.6.5
 * 增加了makeArray函数
 * 修改了init函数，为兼容IE 8 将Object.create更换为new Object
 * 2015.6.10
 * 修改了$和init函数，调用$会返回init的实例
 * 修改了fishbone对象的结构，现在看起来更像jquery
 * 2015.6.14
 * 修改了init函数，修复bug -> 选择器使用空格分割
 * 2015.6.17
 * 增加了create方法，用来创建节点
 * 2015.6.18
 * 修改了query函数，移除了id分支
 */
