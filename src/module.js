/**
 * @name module.js
 * @description 定义模块
 * @date 2015.5.26
 */

// 框架私有的全局变量，用于记录所有模块
// var moduleMap = {}
// var Module = function() {

// 	this.view = null
// 	this.controller = null
// 	this.model = null
// }


// var dropdown = $.Module()

// dropdown.view = '<div class="dropdown"><ul>fs-replace</ul></div>'

// dropdown.model = ['男', '女']

// dropdown.controller(function(data) {

// 	var init = function(data) {

// 		var html = ''

// 		for (var i = 0, length = data.length; i < length; i++) {

// 			html += '<li>' + data[i] + '</li>'
// 		}

// 		dropdown.view.replace('fs-replace', html)	
// 	}
// })



// var dropdown = $.Module()

// dropdown.view = '<div class="dropdown"><ul>fs-replace</ul></div>'

// dropdown.controller(function(data) {

// 	var init = function(data) {

// 		var html = ''

// 		for (var i = 0, length = data.length; i < length; i++) {

// 			html += '<li>' + data[i] + '</li>'
// 		}

// 		dropdown.view.replace('fs-replace', html)	
// 	}
// })

// dropdown.model(function() {

// 	var data  = $.get(url)
// 	return data
// })

// <dropdown id="dropdown-gender" />

// $('#dropdown-gender').init()



/**
 * 一个下拉列表模块
 */
var dropdown = (function() {

	var module = {
		node: null,
		dataset: null,
		init: function(node) {

			module.node = node
				// 初始化模块	
			$.promise(module.data.init)
				.then(module.view.init(node))
				.then(module.controller.init)
		}
	}

	// view负责初始化页面模板
	module.view = {

		html: '<div><ul></ul></div>',
		init: function(node) {

			var html = ''
			var data = module.dataset

			for (var i = 0, length = data.length; i < length; i++) {

				html += '<li>' + data[i] + '</li>'
			}

			dropdown.view.replace('fs-replace', html)
			node.innerHTML = module.view.html
		}
	}

	// controller 负责注册事件和其他逻辑代码
	module.controller = {

		init: function() {
			// 绑定事件
			module.controller.registerEvent(module.node)
		},

		registerEvent: function(node) {

			// 点击时切换下拉列表的隐藏、显示 	   
			node.addEventListener('click', function() {

				var list = this.getElementsByClassName('.dropdown-list')[0]

				list.style.display = 'block'

			}, false)

		}
	}

	// data负责数据请求
	module.data = {

		init: function(callback) {

			var url = '/people'

			$.get(url, function(d) {

				module.dataset = d

				callback && callback()
			})
		}
	}

	return module
})