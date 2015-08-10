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

    // case 1 & 2
    if (value === undefined) {

        if (key === undefined) {

            return this[0]['d'] ? this[0]['d'] : null

        } else {

            return this[0]['d'] ? this[0]['d'][key] : null
        }

    } else {

        for (var i = 0; i < this.length; i++) {

            // 如果dom节点不存在d属性，创建
            if (!this[i]['d']) {

                this[i]['d'] = {}
            }

            this[i]['d'][key] = value
        }
    }

    // case 3
    return this
}



/**
 * 2015.6.10
 * 创建模块
 * 2015.6.15
 * 增加了init方法
 * 2015.8.10
 * 修改了Data.init，支持无参数调用
 */
 