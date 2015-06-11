# Fishbone
类jQuery的SPA框架，支持IE 8+、Firefox、Chrome和Safari浏览器

## 阅读顺序
main.js -> node.js -> http.js -> event.js -> css.js -> attr.js -> animate.js -> route.js -> module.js -> prototype.js

## API文档

### 工具

_$  (expr)  将expr转为fishbone对象， 可接受css选择器、dom对象、dom数组等参数类型_

```javascript
$(window)      // window对象
$(document)    // document对象
$('#fs-view')  // css选择器
$(domNode)     // dom对象
$(nodes)       // dom对象数组
$($(window))   // fishbone对象
```

_$.mix (receiver, supplier)  传入两个对象，将supplier的属性/方法合并到receiver，返回receiver_

```javascript
var obj1 = { name: 'zhang san' }
var obj2 = { age: 18 }

$.mix(obj1, obj2)   // { name: 'zhangsan', age: 18 }
```

### http请求

_$.get (url, callback)  对url发送get请求，在请求成功后执行callback_

```javascript
$.get('http://www.sunken.me/user/1', function(data) {

    console.log(data)  // { id: 1,  name: 'sunken' } 
})
```

_$.ajax (params, events)  http请求的通用接口，支持HttpRequest 2.0的新事件_

```javascript
$.ajax({

    url: 'http://sunken.me/user/1'
    type: 'GET',
    data: null
    success: function(data) {

        console.log(data)  // { id: 1, name: 'sunken' }
    }
})
```

_$.jsonp  (url, funcName, callback)  通过jsonp进行跨域请求，建议尽量使用cors_

```javascript
$.jsonp('http://www.sunken.me/user/1', 'doSomething', function() {

    console.log('sueccss')
})
```

_$.on  (type, handler)  通用的事件绑定接口_

```javascript
$(document).on('click', function(e) {
    
    $(this).css('background', 'red')  // change backgroundColor
    
    e.preventDefault()
    e.stopPropagation()
})
```

_$.off  (type, handler)  通用的事件关闭接口，handler为可选。如果不传入handler，将关闭该类型所有事件_

```javascript
$(document).off('click')  // unbind click

$(document).off('click', handler)  // unbind handler
```

_$.live  (type, handler)  类jQuery的事件预绑定，为未来添加的元素绑定事件_

```javascript
$('input').live('change', function() {
    console.log('input changed')
})

var input = document.createElement('input')
document.body.appendChild(input)

input.value = 'zhang san'  // log: input changed
```

### 路由模块
_$.route 创建路由模块_

_route.provider () 返回路由模块的provider _

_provider.when ([path], route)  传入一组url，匹配成功后执行route规则_

_provider.otherwise (path) 配置404路径，并激活整个路由模块_

```javascript
var provider = $.route
        .provider()
        .when(['', '/', '/index'], {
            tempalte: '/index.html',    
            js: '/index.js',
            css: '/index.css',
            title: '首页'
        })
        .otherwise('/')
```



$.module

$.component

$.fn.on

$.fn.live

$.fn.ready

$.fn.css

$.fn.attr

$.fn.addClass

$.fn.removeClass

$.fn.hasClass

$.fn.val

$.fn.first

$.fn.last

$.fn.eq

$.fn.remove

$.fn.html

$.fn.text

$.fn.clone

$.fn.append

$.fn.prepend

$.fn.find

$.fn.animate
