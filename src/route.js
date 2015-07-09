/**
 * @name  route.js
 * @description  路由模块
 * @date  2015.5.21
 * @author  sunken
 */
var Route = {}

Route.hash = null

// 根据当前url返回hash，并处理history
Route.getHash = function() {

    var hash = window.location.hash
    var history = window.history
    // 去掉url前面的#!
    hash = hash.replace('#!', '')
    // 记录hash，以便后面的set方法中调用
    Route.hash = hash

    // 将去掉#!后的url显示在地址栏中
    // TODO: 开启debug模式时不使用
    // if (W3C) {
    //     history.replaceState(null, null, hash)
    // }
    return hash
}
// 模块加载的入口
Route.load = function(routes) {

    // 路由没有匹配，跳转到otherwise
    if (routes === undefined) {
        window.location.href = Route.otherwise
    }

    // 先重置页面不需要的css
    Route.resetCss()

    // 这里要保证前面的加载完成，尤其是css完成才能加载file，类似于promise
    Route.loadCss(routes.css)
}

// 清除当前页面不需要的css、js
Route.resetCss = function() {

    var doms = $('link')

    for (var i = 0; i < doms.length; i++) {

        var type = doms.eq(i).attr('data-type')

        if (type !== 'common') {
            doms.eq(i).remove()
        }
    }
}

// 重置模块加载状态
Route.resetStatus = function() {
    Route.cssReady = false
    Route.jsReady = false
    Route.hash = null
}

// 加载页面模板代码
Route.loadTemplate = function(url) {

    Http.get(url, function(data) {
        var view = $('#fs-view')
        var hash = Route.routes[Route.hash]
        
        // 加载成功之后，将data复制到view中
        $('#fs-view').html(data)
        
        Route.loadJs(hash['js'], hash)
        Route.setTitle(hash['title'])
    })
}

// 加载js文件
Route.loadJs = function(path, hash) {

    function callback() {

        Route.jsReady = true
        // 重置模块加载状态
        Route.resetStatus()

        if (hash['callback'] !== undefined) {
            hash['callback'].call(this, hash['js'])
        }
    }

    // 如果没有声明js，直接执行回调
    if (path === undefined) {
        
        callback.call(null)
        
        return
    }

    Http.getScript(path, callback)
}

// 重置页面的标题
Route.setTitle = function(title) {

    if (title !== undefined) {
        document.title = title
    }
}

// 根据Route.routes加载css
// TODO: loadCss和loadJs的结构相似
Route.loadCss = function(arr) {

    var cssReady = 0,
        isArray = arr instanceof Array

    var callback = function() {

        cssReady += 1

        if (arr === undefined 
            || (isArray && cssReady === arr.length) 
            || !isArray) {

            var hash = Route.routes[Route.hash]
            
            Route.loadTemplate(hash['template'])
        }
    }

    // 如果没有声明css，直接执行回调
    if (arr === undefined) {

        callback.call(null)

        return
    }

    // 判断css是否是数组
    if (isArray) {

        for (var i = 0; i < arr.length; i++) {

            Http.getCss(arr[i], callback)
        }
    // 直接调用Http.getCss 
    } else {

        Http.getCss(arr, callback)
    }
}
// TODO: provider可以考虑改成类
Route.provider = function(paths) {

    var provider = this,
        routes = {}

    var hashChange = function() {
        var hash = Route.getHash()
        // 在这里分析routes，然后分别调用加载
        var routes = Route.routes[hash]

        Route.load(routes)
    }

    this.when = function(path, route) {
        // TODO: path需要支持数组形式
        if (path instanceof Array) {

            for (var i = 0; i < path.length; i++) {
                var key = path[i]

                routes[key] = route
            }

        } else {

            routes[path] = route
        }

        return provider
    }
    
    // 路由的配置必须由otherwise结尾，该方法负责注册路由规则和激活hashchange事件
    this.otherwise = function(path) {
        // 这里使用的routes是provider的私有变量
        Route.otherwise = path

        return provider
    }

    this.scan = function() {

        Route.routes = routes
        // 激活hashChange事件
        $(window).on('hashchange', hashChange)

        // 首次访问页面的处理
        ! function() {

            hashChange.call(null)
        } ()


        /*
        // 处理url直接访问的加载情况
        // TODO: 这里的代码和hashChange中的重复
        ! function() {
            var hash = Route.getHash()
            // 在这里分析routes，然后分别调用加载
            var routes = Route.routes[hash]
            Route.load(routes)
        }()
        */
    }

    return this
}
/**
 * 2015.5.21
 * 增加了Route模块
 * 增加了hashChange事件，when和otherwise方法
 * 2015.6.2
 * 修改了hashchange
 * 2015.6.3
 * 增加了resetResource函数
 * 2015.6.8
 * 修改了getHash和when，IE 8测试通过
 * 2015.6.9
 * 修改了loadCss和loadJs，现在when函数的css和js变成了可选项
 * 修改了loadCss，在callback中重置了页面标题
 * 增加了Route.templateReady，让加载流程变成线性
 * 2015.6.11
 * resetResource更名为resetCss，不再处理js
 * 2015.6.13
 * 修改了loadJs：
 * 1. 在加载结束后会调用hash中的callback
 * 2. 取消了js的数组写法，只能保留唯一入口
 * 修改了provider，将路由激活的逻辑放到了scan中
 * 2015.6.24
 * 修改了route模块的调用方式，不再对外暴露Route对象
 * 2015.7.7
 * 调整了整个模块的格式，修改了scan，自运行直接调用hashChange
 */