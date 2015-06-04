
/**
 * @name  prototype.js
 * @description  对象原型扩展模块，该文件为侵入式设计
 * @date  2015.05.12
 */
String.prototype.byteLen = function(target, fix) {

    /**取得一个字符串所有字节的长度。这是一个后端过来的方法，如果将一个英文字符插
     *入数据库 char、varchar、text 类型的字段时占用一个字节，而一个中文字符插入
     *时占用两个字节，为了避免插入溢出，就需要事先判断字符串的字节长度。在前端，
     *如果我们要用户填空的文本，需要字节上的长短限制，比如发短信，也要用到此方法。
     *随着浏览器普及对二进制的操作，这方法也越来越常用。
     */
    fix = fix ? fix: 2
    var str = new Array(fix + 1).join('-')
    return target.replace(/[^\x00-\xff]/g, str).length
}

// 从数据中随机抽出一个元素
Array.prototype.random = function(target) {

    return target[Math.floor(Math.random() * target.length)]
}

// 对数据进行平坦化处理，多维数组合并为一维数组
Array.prototype.flatten = function(target) {

    var result = []

    target.forEach(function(item) {

        if (Array.isArray[item]) {

            result  = result.concat(Array.prototype.flatten(item))

        } else {

            result.push(item)
        }

        return result
    })
}

Array.prototype.min = function(target) {

    return Math.min.apply(0, target)
}

Array.prototype.max = function(target) {

    return Math.max.apply(0, target)
}

// 数组去重
Array.prototype.unique = function() {

    this.sort()
    
    var arr = ['1']

    for (var i = 1; i < this.length; i++) {
        
        if (this[i] !== arr[arr.length - 1]) {
   
            arr.push(this[i])
        }
    }

    arr.shift()

    return arr
}

// 对两个数组取并集
Array.prototype.union = function(target, array) {

    return (target.concat(array)).unique()
}

// 取数组中的第一个元素
Array.prototype.first = function() {
    return this[0]
}

// 取数组的最后一个元素
Array.prototype.last = function() {
    return this[this.length - 1]
}

// 过滤数组中的undefined、null和' '



