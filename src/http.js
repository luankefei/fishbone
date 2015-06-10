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
    //link.onload = callback.call(this)
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

Http.ajax = function(param, events) {

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

    // 调用beforeSend，这里面不能写异步函数
    param.beforeSend && param.beforeSend(req)

    req.onreadystatechange = function() {

        if (req.readyState === 4 && req.status === 200) {

            // 应该判断是否是json
            var res = req.responseText

            try {

                if (W3C) {

                    res = JSON.parse(res)

                } else {

                    res = eval('[' + res + ']')
                }
            
            } catch(e) {

                //throw 'json parse error'
            }

            param.success && param.success(res)
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
 * 2015.5.12
 * 创建http模块
 * 添加ajax、jsonp两个顶级接口。ajax支持httprequest 2.0
 * 2015.6.4
 * 修改了getScript函数，依赖了seajs
 */
 