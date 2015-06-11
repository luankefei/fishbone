# Fishbone
类jQuery的SPA框架，支持IE 8+、Firefox、Chrome和Safari浏览器

## 阅读顺序
main.js -> node.js -> http.js -> event.js -> css.js -> attr.js -> animate.js -> route.js -> module.js -> prototype.js

## API文档

### 工具
_$.mix (receiver, supplier)  传入两个对象，将supplier的属性/方法合并到receiver，返回receiver

```javascript
var obj1 = { name: 'zhang san' }
var obj2 = { age: 18 }

$.mix(obj1, obj2)   // { name: 'zhangsan', age: 18 }
```

### http请求

_$.get (url, callback)  对url发送get请求，在请求成功后执行callback_

```javascript
$.get('/www.sunken.me/user/1', function(data) {

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

$.jsonp

$.route

$.on

$.off

$.live

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
