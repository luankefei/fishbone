/*
 * @name  http.js
 * @description  数据请求模块，负责实现ajax、comet、websocket
 * @date  2015.05.12
 * @version  0.0.1
 */

var Http = {}

var accepts = {

    xml: 'application/xml, text/xml',
    html: 'text/html',
    text: 'text/plain',
    json: 'application/json, text/javascript',
    script: 'text/javascript, application/javascript',
    '*': ['*/'] + ['*'] //避免被压缩掉
},
defaults = {
    type: 'GET',
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    async: true
    //jsonp: 'callback'
}

// ajax获取js文件
// TODO: 这里暂时修改使用seajs的api
Http.getScript = function(url, callback) {

    seajs.use(url, callback)

    // var script = document.createElement('script')
    // var body = document.querySelector('body')

    // script.src = url
    // script.type = 'text/javascript'
    // script.onload = callback.call(this)

    // body.appendChild(script)
}

// ajax获取css文件
// TODO: 和getScript可以合并
Http.getCss = function(url, callback) {

    var link = document.createElement('link')
    var head = document.getElementsByTagName('head')[0]

    link.href = url
    link.rel = 'stylesheet'

    // IE 8兼容
    link.onload = function() {

        callback.call(this)
    }

    head.appendChild(link)
}

// ajax函数的简化版，提供更简单易用的api
Http.get = function(url, callback) {

    var param = defaults

    param.success = callback
    param.url = url

    Http.ajax(param)
}

Http.convertJsonToPostData = function(data) {

    // case 1
    if (data === undefined) {

        return null

    // case 2
    } else {

        var str = ''

        for (var k in data) {

            str = str + k + '=' + data[k] + '&'
        }   

        data = str.substring(0, str.length - 1)

        return data
    }
}

Http.ajax = function(setting, events) {

    var url = setting.url,
        type = setting.type ? setting.type.toUpperCase() : defaults.type
    
    // 将param转成post数据
    var param = Http.convertJsonToPostData(setting.param)

    var req = new XMLHttpRequest()
    
    req.open(type, url)

    // 调用beforeSend，这里面不能写异步函数
    setting.before && setting.before(req)

    req.onreadystatechange = function() {

        if (req.readyState === 4 && req.status === 200) {

            // 应该判断是否是json
            var res = req.responseText

            // 尝试将字符串转换为json对象
            try {

                res = JSON.parse(res)
            
            } catch(e) {

                //throw 'json parse error'
            }

            setting.success && setting.success(res)
        }
    }

    req.setRequestHeader('Content-type', defaults.contentType)

    // handle XMLHttpRequest level 2 event
    // 如果有传入loadStart和progress参数
    if (typeof events !== 'undefined') {

        for (var k in events) {

            req['on' + k] = events[k]
        }
    }

    req.send(param)
}

// 尽量使用CORS
Http.jsonp = function(url, funcName, callback) {

    var script = document.createElement('script')
    var body = document.querySelector('body')

    script.src = url + '?type=jsonp&callbackName=' + funcName
    script.id = 'jsonp'
    script.onload = callback

    window[funcName] = funcName

    body.appendChild(script)
}

Http.comet = function() {}

Http.socket = function() {}

Http.load = function(url) {

    var self = this

    $.ajax({

        url: url,
        type: 'get',
        success: function(d) {
            
            for (var i = 0; i < self.length; i++) {

                self.eq(i).html(d)
            }
        }
    })
}

/**
 * 2015.5.12
 * 创建http模块
 * 添加ajax、jsonp两个顶级接口。ajax支持httprequest 2.0
 * 2015.6.4
 * 修改了getScript函数，依赖了seajs
 * 2015.7.9
 * 修改了ajax函数，将data参数更名为param，去掉了最后转化json的eval，修复了post发送数据格式错误的bug
 * 增加了convertJsonToPostData函数，该函数接收一个json参数，返回一个post数据格式字符串
 * 2015.7.14
 * 增加了load函数，用于加载页面片段
 */
 
