
/**
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

// ajax函数的简化版，提供更简单易用的api
Http.get = function(url, callback) {

    var param = defaults

    param.url = url

    Http.ajax(param, callback)
}

// 第三个参数为自定义事件，用来支持xmlhttprequest 2.0的新增事件
Http.ajax = function(param, callback, events) {

    var url = param.url
    var type = param.type ? param.type.toUpperCase() : defaults.type
    var data = param.data || null

    var req = new XMLHttpRequest()

    req.open(type, url)

    // 如果有传入loadStart和progress参数
    if (typeof events !== 'undefined') {

        for (var k in events) {

            req['on' + k] = events[k]
        }
    }

    req.onreadystatechange = function() {

        if (req.status === 200 && req.readyState === 4) {

            var res = req.responseText

            callback && callback(res)
        }
    }

    req.setRequestHeader('Content-type', defaults.contentType)
    req.send(data)
}

// 尽量使用CORS
Http.jsonp = function(url, namespace, funcName, callback) {

    var script = document.createElement('script')
    var body = document.querySelector('body')

    script.src = url + '?type=jsonp&callbackName=' + funcName
    script.id = 'jsonp'
    script.onload = callback
    
    window[funcName] = namespace.funcName

    body.appendChild(script)
}

Http.comet = function() {}

Http.socket = function() {}

/**
 * 2015.05.12 
 * 创建http模块
 * 添加ajax、jsonp两个顶级接口。ajax支持httprequest 2.0
 */



