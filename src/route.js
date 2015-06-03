/*
 * @name  route.js
 * @description  路由模块
 * @date  2015.5.21
 */
var Route = {}

Route.cssReady = false
Route.jsReady = false
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
    history.replaceState(null, null, hash)

    console.log('hash')
    console.log(hash)
    console.log(hash.length)
    console.log(encodeURI(hash))
    console.log(hash == '' || hash == '/' || hash == 'index' || hash == ' ')


    return hash
}

// 模块加载的入口
Route.load = function(routes) {

    // 先充值页面不需要的css和js
    Route.resetResource()

    // 这里要保证前面的加载完成，尤其是css完成才能加载file，类似于promise
    Route.loadCss(routes.css)
}

// 清除当前页面不需要的css、js
Route.resetResource = function() {

    var doms = $('link, script')

    for (var i = 0; i < doms.nodes.length; i++) {

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

// 添加data属性
Object.defineProperties(Route, {
        
    cssReady: {
        enumerable: true,
        configurable: true,
      
        get: function() { return this.value },
        set: function(value) { 

            this.value = value

            if (value === true) {

                // 加载js和file
                Route.loadJs(Route.routes[Route.hash]['js'])
                Route.loadTempalte(Route.routes[Route.hash]['template'])
            }            
        }
    }
})

// 加载页面模板代码
Route.loadTempalte = function(url) {

    Http.get(url, function(data) {

        // 加载成功之后，将data复制到view中
        $('#fs-view').html(data)
    })
}

// 加载js文件
Route.loadJs = function(arr) {

    var jsReady = 0

    var callback = function() {

        jsReady += 1

        if (jsReady === arr.length) {

            Route.jsReady = true
        }
    }

    for (var i = 0; i < arr.length; i++) {

        Http.getScript(arr[i], callback)
    }
}

// 根据Route.routes加载css
Route.loadCss = function(arr) {

    var cssReady = 0

    var callback = function() {

        cssReady += 1

        if (cssReady === arr.length) {

            // TODO: 在route模块中需要一些全局属性来标记完成
            // TODO: 加载依然是观察者
            Route.cssReady = true
        }
    }

    for (var i = 0; i < arr.length; i++) {

        Http.getCss(arr[i], callback)
    }
}

// Route.resetCss = function() {}
// Route.resetJs = function() {}

// TODO: provider可以考虑改成类
Route.provider = function(paths) {

    var provider = this,
        routes = {}

    var hashChange = function() {

        console.log('hashChange 的加载')

        var hash = Route.getHash()

        // 在这里分析routes，然后分别调用加载
        var routes = Route.routes[hash]

        Route.load(routes)
    }

    this.when = function(path, route) {

        // TODO: path需要支持数组形式
        if (path instanceof Array) {

            path.forEach(function(v, i, a) {

                routes[v] = route
            })
        
        } else {

            routes[path] = route    
        }

        return provider
    }

    // 路由的配置必须由otherwise结尾，该方法负责注册路由规则和激活hashchange事件
    this.otherwise = function(path) {

        // 这里使用的routes是provider的私有变量
        routes.otherwise = path

        Route.routes = routes

        // 激活hashChange事件
        window.addEventListener('hashchange', hashChange)

        // 重置模块加载状态
        Route.resetStatus()


        // 处理url直接访问的加载情况
        // TODO: 这里的代码和hashChange中的重复
        ! function() {

            console.log('! function 的加载')

            var hash = Route.getHash()


            console.log('! function 的 hash')
            console.log(hash)

            console.log(Route.routes)

            // 在这里分析routes，然后分别调用加载
            var routes = Route.routes[hash]

            console.log('! function 的 routes')
            console.log(routes)

            Route.load(routes)

        }()
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
 */
 
