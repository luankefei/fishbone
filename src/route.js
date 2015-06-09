/*
 * @name  route.js
 * @description  路由模块
 * @date  2015.5.21
 * @author  sunken
 */
var Route = {}


// Route.cssReady = false
// Route.jsReady = false
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

    if (routes === undefined) {

        return
    }

    // 先充值页面不需要的css和js
    Route.resetResource()

    // 这里要保证前面的加载完成，尤其是css完成才能加载file，类似于promise
    Route.loadCss(routes.css)
}

// 清除当前页面不需要的css、js
Route.resetResource = function() {
    
    var doms = $('link, script')

    // var scripts = document.getElementsByTagName('script')
    // var links = document.getElementsByTagName('link')

    // for (var i = 0; i < scripts.length; i++) {

    //     var type = scripts[i].getAttribute('data-type')
    //     var src = scripts[i].getAttribute('src')

    //     if (typeof src === 'string' && type !== 'common') {

    //         console.log(scripts[i])

    //         scripts[i].remove()
    //     }
    // }

    // for (var i = 0; i < links.length; i++) {

    //     var type = links[i].getAttribute('data-type')

    //     if (type !== 'common') {

    //         links[i].remove()
    //     }
    // }

    // TODO: 应该判断dom标签是否带有href或src属性，否则视为页面内部代码，不清除
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
// IE8 Dom only
// if (W3C) {
if (W3C) {

    Object.defineProperties(Route, {
        
        cssReady: {
            enumerable: true,
            configurable: true,
          
            get: function() { return this.cssReadyValue },
            set: function(value) { 

                this.cssReadyValue = value

                if (value === true) {

                    var hash = Route.routes[Route.hash]

                    Route.loadTempalte(hash['template'])
                }
            }
        },

        templateReady: {

            enumerable: true,
            configurable: true,
          
            get: function() { return this.templateReady },
            set: function(value) { 

                //console.log('templateReady')

                this.templateReadyValue = value

                if (value === true) {

                    var hash = Route.routes[Route.hash]

                    Route.loadJs(hash['js'])
                }
            }   // end setter
        }   // end jsReady
    })  // end defineProperties
}

// } else {

//     // IE 8 兼容
//     // propertychange也只能对dom对象使用
//     Event.addEvent(Route, 'propertychange', function(e) {
        
//         if (Route['cssReady'] === true) {

//             // 加载js和file
//             Route.loadJs(Route.routes[Route.hash]['js'])
//             Route.loadTempalte(Route.routes[Route.hash]['template'])
//         }
//     })
// }

// 加载页面模板代码
Route.loadTempalte = function(url) {

    Http.get(url, function(data) {

        // 加载成功之后，将data复制到view中
        $('#fs-view').html(data)

        console.log('load template')

        if (W3C) {

            Route.templateReady = true

        } else {

            var hash = Route.routes[Route.hash]

            Route.loadJs(hash['js'])
            Route.setTitle(hash['title'])
        }
    })
}

// 加载js文件
Route.loadJs = function(arr) {

    var jsReady = 0

    var callback = function() {

        jsReady += 1

        if (arr === undefined || jsReady === arr.length) {

            if (W3C) {

                Route.jsReady = true
            }
        }
    }

    // 如果没有声明js，直接执行回调
    if (arr === undefined) {

        callback.call(null)

        return
    }

    for (var i = 0; i < arr.length; i++) {

        Http.getScript(arr[i], callback)
    }
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

    var cssReady = 0

    var callback = function() {

        cssReady += 1

        if (arr === undefined || cssReady === arr.length) {

            if (W3C) {

                Route.cssReady = true

            } else {

                var hash = Route.routes[Route.hash]


                Route.loadTempalte(hash['template'])
            }
        }
    }

    // 如果没有声明css，直接执行回调
    if (arr === undefined) {

        callback.call(null)

        return
    }

    for (var i = 0; i < arr.length; i++) {

        Http.getCss(arr[i], callback)
    }
}

// TODO: provider可以考虑改成类
Route.provider = function(paths) {

    var provider = this,
        routes = {}

    var hashChange = function() {

        console.log('hashchange')

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

            // path.forEach(function(v, i, a) {

            //     routes[v] = route
            // })
        
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
        $(window).on('hashchange', hashChange)

        // 重置模块加载状态
        Route.resetStatus()

        // 处理url直接访问的加载情况
        // TODO: 这里的代码和hashChange中的重复
        ! function() {

            var hash = Route.getHash()

            // 在这里分析routes，然后分别调用加载
            var routes = Route.routes[hash]

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
 * 2015.6.8
 * 修改了getHash和when，IE 8测试通过
 * 2015.6.9
 * 修改了loadCss和loadJs，现在when函数的css和js变成了可选项
 * 修改了loadCss，在callback中重置了页面标题
 * 增加了Route.templateReady，让加载流程变成线性
 */
