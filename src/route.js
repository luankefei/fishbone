/**
 * @name  route.js
 * @description  路由模块
 * @date  2015.5.21
 */
var Route = {}

// TODO: provider可以考虑改成类
Route.provider = function (paths) {
    
    var provider = this,
        routes = {}


    // var formatUrl = function(url) {

    //     var index = url.indexOf('#')
    //     // 截取掉#
    //     url = url.substring(index + 1)

    //     if (index === -1 || url === '' || url === '/') {
    //         url = 'index'
    //     }

    //     return url
    // }

    var hashChange = function() {

        var hash = window.location.hash
        var history = window.history

        // 去掉url前面的#!
        hash = hash.replace('#!', '')

        // 将去掉#!后的url显示在地址栏中
        history.replaceState(null, null, hash)
    }
    
    this.when = function(path, route) {

        routes[path] = route

        return provider
    }

    // 路由的配置必须由otherwise结尾，该方法负责注册路由规则和激活hashchange事件
    this.otherwise = function(path) {

        routes.otherwise = path

        Route.routes = routes

        window.addEventListener('hashchange', hashChange)
    }

    return this
}

/**
 * 2015.5.21 
 * 增加了Route模块
 * 增加了hashChange事件，when和otherwise方法
 */


