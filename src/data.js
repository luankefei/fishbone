/**
 * @name  data.js
 * @description  数据缓存模块
 * @date  2015.6.10
 */
var Data = {}

// var dataMap = {

//     length: 0
// }


// 从dom节点的d中读写数据
Data.init = function (key, value) {

    if (value === undefined) {

        return this[0]['d'] ? this[0]['d'][key] : null

    } else {

        for (var i = 0; i < this.length; i++) {

            // 如果dom节点不存在d属性，创建
            if (!this[i]['d']) {

                this[i]['d'] = {}
            }

            this[i]['d'][key] = value
        }
    }

    return this
}



/**
 * 2015.6.10
 * 创建模块
 * 2015.6.15
 * 增加了init方法
 */
 