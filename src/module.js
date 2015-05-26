/**
 * @name module.js
 * @description 定义模块
 * @date 2015.5.26
 */

// 框架私有的全局变量，用于记录所有模块
var moduleMap = {}
var Module = function() {

	this.view = null
	this.controller = null
	this.model = null
}


var dropdown = $.Module()

dropdown.view = '<div class="dropdown"><ul>fs-replace</ul></div>'
			
dropdown.model = ['男', '女']

dropdown.controller(function(data) {

	var init = function(data) {
		
		var html = ''

		for (var i = 0, length = data.length; i < length; i++) {
			
			html += '<li>' + data[i] + '</li>'
		}

		dropdown.view.replace('fs-replace', html)	
	}
})



var dropdown = $.Module()

dropdown.view = '<div class="dropdown"><ul>fs-replace</ul></div>'

dropdown.controller(function(data) {

	var init = function(data) {
		
		var html = ''

		for (var i = 0, length = data.length; i < length; i++) {
			
			html += '<li>' + data[i] + '</li>'
		}

		dropdown.view.replace('fs-replace', html)	
	}
})

dropdown.model(function() {
	
	var data  = $.get(url)
	return data
})

<dropdown id="dropdown-gender" />

$('#dropdown-gender').init()





