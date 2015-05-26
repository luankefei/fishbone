/**
 * @name event.js
 * @description 事件模块
 * @date 2015.5.25
 */

var Event = {}

// 添加事件
Event.addEvent = function(target, type, handler) {
	if (target.addEventListener) {
		target.addEventListener(type, handler, false)
	
	} else {

		target.attachEvent('on' + type, function(event) {
			// 把处理和程序作为时间目标的方法调用
			// 传递事件对象
			return handler.call(target, event)
		})
	}
}

// 移除事件
// TODO: handler应该是可选项，如果没有传入，清除所有事件函数
Event.removeEvent = function(target, type, handler) {

	// 对handler进行判断，如果不存在，按照type使用dom 0方式清除事件
	if (handler === undefined) {
		
		target['on' + type] = null
	}

	if (target.removeEventListener) {
		target.removeEventListener(type, handler, false)

	} else {

		target.detechEvent('on' + type, handler)
	}
}

Event.live = function(type, handler) {
	
	var selector = this.selector
	
	// live的实现，模仿jquery。但内部调用queryselector来匹配对象
	document.addEventListener(type, function(e) {
	
		var nodes = document.querySelectorAll(selector)

		for (var i = 0; i < nodes.length; i++) {
			
			if (nodes[i] === e.target) {

				return handler.call(e.target, e)
			}
		}
	})
}

// 将事件绑定在document上，然后根据selector来判断是否执行
// TODO: 缺少ie9以下的处理，事件委托的选择器不完善
/*
Event.live = function(target, type, handler) {
	// TODO: 这里应该是传入选择器的selector
	var selector = target.getAttribute('id')

	document.addEventListener(type, function(e) {
	
		if (e.target.id = selector) {
		
			e.target.call(e.target, handler)
		}
	})
}
*/

// 对外暴露的事件绑定api
Event.on = function(type, handler) {

	var target = this.nodes

	// 根据nodeName判断单个绑定或循环绑定
	if (target.nodeName) {
		
		Event.addEvent(target, type, handler)

	} else {

		target.forEach(function(v, i, a) {
		
			Event.addEvent(v, type, handler)
		})
	}
}


/* Event.on = function(type, handler) { */

	// var selector = this.selector
	
	// // 如果选择器不存在，获取选择器链
	// if (selector === null) {
	
		// var str = ''
		
		// // 判断this.nodes是否是复数
		// if (this.nodes.length == 1) {
		// }	
	// }
/* } */

Event.unbind = function() {}


// Event.removeEvent = function(event) {
	
	// var event = event || window.event
	
	// if (event.preventDefault) {
		// event.preventDefault()
	// }

	// if (event.returnValue) {
		// event.returnValue = false	// IE
	// }

	// return false
// }




/**
 * 2015.5.25
 * 创建模块
 * 添加了addEvent和removeEvent函数
 * TODO: 添加了live函数，但不完善
 * 添加了on函数，此函数将对外暴
 * 2015.5.26
 * 重写了live函数，初步测试可用，但事件通过document绑定，还有优化空间
 */
