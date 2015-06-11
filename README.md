# Fishbone
类jQuery的SPA框架，支持IE 8+、Firefox、Chrome和Safari浏览器

## 阅读顺序
main.js -> node.js -> http.js -> event.js -> css.js -> attr.js -> animate.js -> route.js -> module.js -> prototype.js

## API文档
_$.mix(receiver, supplier)   传入两个对象，将对象2的属性/方法合并到对象1，返回对象1_

```javascript
var obj1 = { name: 'zhang san' }
var obj2 = { age: 18 }

$.mix(obj1, obj2)   // obj1 { name: 'zhangsan', age: 18 }
```

$.get

$.ajax

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
