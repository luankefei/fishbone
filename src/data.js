/**
 * @name  data.js
 * @description  数据缓存模块
 * @date  2015.6.10
 */
var Data = {}

var dataMap = {

    length: 0
}

Data.init = function (key, value) {

    if (value === undefined) {


    } else {

        for (var i = 0; i < this.length; i++) {

            this[i][key] = value
        }
    }
}



/**
 * 2015.6.10
 * 创建模块
 */