/**
 * Sea.js 3.0.0 | seajs.org/LICENSE.md
 */
(function(global, undefined) {

    // Avoid conflicting when `sea.js` is loaded multiple times
    if (global.seajs) {
        return
    }

    var seajs = global.seajs = {
        // The current version of Sea.js being used
        version: "3.0.0"
    }

    var data = seajs.data = {}


    /**
     * util-lang.js - The minimal language enhancement
     */

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]"
        }
    }

    var isObject = isType("Object")
    var isString = isType("String")
    var isArray = Array.isArray || isType("Array")
    var isFunction = isType("Function")

    var _cid = 0

    function cid() {
        return _cid++
    }


    /**
     * util-events.js - The minimal events support
     */

    var events = data.events = {}

    // Bind event
    seajs.on = function(name, callback) {
        var list = events[name] || (events[name] = [])
        list.push(callback)
        return seajs
    }

    // Remove event. If `callback` is undefined, remove all callbacks for the
    // event. If `event` and `callback` are both undefined, remove all callbacks
    // for all events
    seajs.off = function(name, callback) {
        // Remove *all* events
        if (!(name || callback)) {
            events = data.events = {}
            return seajs
        }

        var list = events[name]
        if (list) {
            if (callback) {
                for (var i = list.length - 1; i >= 0; i--) {
                    if (list[i] === callback) {
                        list.splice(i, 1)
                    }
                }
            } else {
                delete events[name]
            }
        }

        return seajs
    }

    // Emit event, firing all bound callbacks. Callbacks receive the same
    // arguments as `emit` does, apart from the event name
    var emit = seajs.emit = function(name, data) {
        var list = events[name]

        if (list) {
            // Copy callback lists to prevent modification
            list = list.slice()

            // Execute event callbacks, use index because it's the faster.
            for (var i = 0, len = list.length; i < len; i++) {
                list[i](data)
            }
        }

        return seajs
    }

    /**
     * util-path.js - The utilities for operating path such as id, uri
     */

    var DIRNAME_RE = /[^?#]*\//

    var DOT_RE = /\/\.\//g
    var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//
    var MULTI_SLASH_RE = /([^:/])\/+\//g

    // Extract the directory portion of a path
    // dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
    // ref: http://jsperf.com/regex-vs-split/2
    function dirname(path) {
        return path.match(DIRNAME_RE)[0]
    }

    // Canonicalize a path
    // realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
    function realpath(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/")

        /*
          @author wh1100717
          a//b/c ==> a/b/c
          a///b/////c ==> a/b/c
          DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
        */
        path = path.replace(MULTI_SLASH_RE, "$1/")

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/")
        }

        return path
    }

    // Normalize an id
    // normalize("path/to/a") ==> "path/to/a.js"
    // NOTICE: substring is faster than negative slice and RegExp
    function normalize(path) {
        var last = path.length - 1
        var lastC = path.charCodeAt(last)

        // If the uri ends with `#`, just return it without '#'
        if (lastC === 35 /* "#" */ ) {
            return path.substring(0, last)
        }

        return (path.substring(last - 2) === ".js" ||
            path.indexOf("?") > 0 ||
            lastC === 47 /* "/" */ ) ? path : path + ".js"
    }


    var PATHS_RE = /^([^/:]+)(\/.+)$/
    var VARS_RE = /{([^{]+)}/g

    function parseAlias(id) {
        var alias = data.alias
        return alias && isString(alias[id]) ? alias[id] : id
    }

    function parsePaths(id) {
        var paths = data.paths
        var m

        if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
            id = paths[m[1]] + m[2]
        }

        return id
    }

    function parseVars(id) {
        var vars = data.vars

        if (vars && id.indexOf("{") > -1) {
            id = id.replace(VARS_RE, function(m, key) {
                return isString(vars[key]) ? vars[key] : m
            })
        }

        return id
    }

    function parseMap(uri) {
        var map = data.map
        var ret = uri

        if (map) {
            for (var i = 0, len = map.length; i < len; i++) {
                var rule = map[i]

                ret = isFunction(rule) ?
                    (rule(uri) || uri) :
                    uri.replace(rule[0], rule[1])

                // Only apply the first matched rule
                if (ret !== uri) break
            }
        }

        return ret
    }


    var ABSOLUTE_RE = /^\/\/.|:\//
    var ROOT_DIR_RE = /^.*?\/\/.*?\//

    function addBase(id, refUri) {
        var ret
        var first = id.charCodeAt(0)

        // Absolute
        if (ABSOLUTE_RE.test(id)) {
            ret = id
        }
        // Relative
        else if (first === 46 /* "." */ ) {
            ret = (refUri ? dirname(refUri) : data.cwd) + id
        }
        // Root
        else if (first === 47 /* "/" */ ) {
            var m = data.cwd.match(ROOT_DIR_RE)
            ret = m ? m[0] + id.substring(1) : id
        }
        // Top-level
        else {
            ret = data.base + id
        }

        // Add default protocol when uri begins with "//"
        if (ret.indexOf("//") === 0) {
            ret = location.protocol + ret
        }

        return realpath(ret)
    }

    function id2Uri(id, refUri) {
        if (!id) return ""

        id = parseAlias(id)
        id = parsePaths(id)
        id = parseAlias(id)
        id = parseVars(id)
        id = parseAlias(id)
        id = normalize(id)
        id = parseAlias(id)

        var uri = addBase(id, refUri)
        uri = parseAlias(uri)
        uri = parseMap(uri)

        return uri
    }

    // For Developers
    seajs.resolve = id2Uri;

    // Check environment
    var isWebWorker = typeof window === 'undefined' && typeof importScripts !== 'undefined' && isFunction(importScripts);

    // Ignore about:xxx and blob:xxx
    var IGNORE_LOCATION_RE = /^(about|blob):/;
    var loaderDir;
    // Sea.js's full path
    var loaderPath;
    // Location is read-only from web worker, should be ok though
    var cwd = (!location.href || IGNORE_LOCATION_RE.test(location.href)) ? '' : dirname(location.href);

    if (isWebWorker) {
        // Web worker doesn't create DOM object when loading scripts
        // Get sea.js's path by stack trace.
        var stack;
        try {
            var up = new Error();
            throw up;
        } catch (e) {
            // IE won't set Error.stack until thrown
            stack = e.stack.split('\n');
        }
        // First line is 'Error'
        stack.shift();

        var m;
        // Try match `url:row:col` from stack trace line. Known formats:
        // Chrome:  '    at http://localhost:8000/script/sea-worker-debug.js:294:25'
        // FireFox: '@http://localhost:8000/script/sea-worker-debug.js:1082:1'
        // IE11:    '   at Anonymous function (http://localhost:8000/script/sea-worker-debug.js:295:5)'
        // Don't care about older browsers since web worker is an HTML5 feature
        var TRACE_RE = /.*?((?:http|https|file)(?::\/{2}[\w]+)(?:[\/|\.]?)(?:[^\s"]*)).*?/i
            // Try match `url` (Note: in IE there will be a tailing ')')
        var URL_RE = /(.*?):\d+:\d+\)?$/;
        // Find url of from stack trace.
        // Cannot simply read the first one because sometimes we will get:
        // Error
        //  at Error (native) <- Here's your problem
        //  at http://localhost:8000/_site/dist/sea.js:2:4334 <- What we want
        //  at http://localhost:8000/_site/dist/sea.js:2:8386
        //  at http://localhost:8000/_site/tests/specs/web-worker/worker.js:3:1
        while (stack.length > 0) {
            var top = stack.shift();
            m = TRACE_RE.exec(top);
            if (m != null) {
                break;
            }
        }
        var url;
        if (m != null) {
            // Remove line number and column number
            // No need to check, can't be wrong at this point
            var url = URL_RE.exec(m[1])[1];
        }
        // Set
        loaderPath = url
            // Set loaderDir
        loaderDir = dirname(url || cwd);
        // This happens with inline worker.
        // When entrance script's location.href is a blob url,
        // cwd will not be available.
        // Fall back to loaderDir.
        if (cwd === '') {
            cwd = loaderDir;
        }
    } else {
        var doc = document
        var scripts = doc.scripts

        // Recommend to add `seajsnode` id for the `sea.js` script element
        var loaderScript = doc.getElementById("seajsnode") ||
            scripts[scripts.length - 1]

        function getScriptAbsoluteSrc(node) {
            return node.hasAttribute ? // non-IE6/7
                node.src :
                // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
                node.getAttribute("src", 4)
        }
        loaderPath = getScriptAbsoluteSrc(loaderScript)
            // When `sea.js` is inline, set loaderDir to current working directory
        loaderDir = dirname(loaderPath || cwd)
    }

    /**
     * util-request.js - The utilities for requesting script and style files
     * ref: tests/research/load-js-css/test.html
     */
    if (isWebWorker) {
        function requestFromWebWorker(url, callback, charset) {
            // Load with importScripts
            var error;
            try {
                importScripts(url);
            } catch (e) {
                error = e;
            }
            callback(error);
        }
        // For Developers
        seajs.request = requestFromWebWorker;
    } else {
        var doc = document
        var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement
        var baseElement = head.getElementsByTagName("base")[0]

        var currentlyAddingScript

        function request(url, callback, charset) {
            var node = doc.createElement("script")

            if (charset) {
                var cs = isFunction(charset) ? charset(url) : charset
                if (cs) {
                    node.charset = cs
                }
            }

            addOnload(node, callback, url)

            node.async = true
            node.src = url

            // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
            // the end of the insert execution, so use `currentlyAddingScript` to
            // hold current node, for deriving url in `define` call
            currentlyAddingScript = node

            // ref: #185 & http://dev.jquery.com/ticket/2709
            baseElement ?
                head.insertBefore(node, baseElement) :
                head.appendChild(node)

            currentlyAddingScript = null
        }

        function addOnload(node, callback, url) {
            var supportOnload = "onload" in node

            if (supportOnload) {
                node.onload = onload
                node.onerror = function() {
                    emit("error", {
                        uri: url,
                        node: node
                    })
                    onload(true)
                }
            } else {
                node.onreadystatechange = function() {
                    if (/loaded|complete/.test(node.readyState)) {
                        onload()
                    }
                }
            }

            function onload(error) {
                // Ensure only run once and handle memory leak in IE
                node.onload = node.onerror = node.onreadystatechange = null

                // Remove the script to reduce memory leak
                if (!data.debug) {
                    head.removeChild(node)
                }

                // Dereference the node
                node = null

                callback(error)
            }
        }

        // For Developers
        seajs.request = request

    }
    var interactiveScript

    function getCurrentScript() {
        if (currentlyAddingScript) {
            return currentlyAddingScript
        }

        // For IE6-9 browsers, the script onload event may not fire right
        // after the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script
        // ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === "interactive") {
            return interactiveScript
        }

        var scripts = head.getElementsByTagName("script")

        for (var i = scripts.length - 1; i >= 0; i--) {
            var script = scripts[i]
            if (script.readyState === "interactive") {
                interactiveScript = script
                return interactiveScript
            }
        }
    }

    /**
     * util-deps.js - The parser for dependencies
     * ref: tests/research/parse-dependencies/test.html
     * ref: https://github.com/seajs/searequire
     */

    function parseDependencies(s) {
        if (s.indexOf('require') == -1) {
            return []
        }
        var index = 0,
            peek, length = s.length,
            isReg = 1,
            modName = 0,
            parentheseState = 0,
            parentheseStack = [],
            res = []
        while (index < length) {
            readch()
            if (isBlank()) {} else if (isQuote()) {
                dealQuote()
                isReg = 1
            } else if (peek == '/') {
                readch()
                if (peek == '/') {
                    index = s.indexOf('\n', index)
                    if (index == -1) {
                        index = s.length
                    }
                } else if (peek == '*') {
                    index = s.indexOf('*/', index)
                    if (index == -1) {
                        index = length
                    } else {
                        index += 2
                    }
                } else if (isReg) {
                    dealReg()
                    isReg = 0
                } else {
                    index--
                    isReg = 1
                }
            } else if (isWord()) {
                dealWord()
            } else if (isNumber()) {
                dealNumber()
            } else if (peek == '(') {
                parentheseStack.push(parentheseState)
                isReg = 1
            } else if (peek == ')') {
                isReg = parentheseStack.pop()
            } else {
                isReg = peek != ']'
                modName = 0
            }
        }
        return res

        function readch() {
            peek = s.charAt(index++)
        }

        function isBlank() {
            return /\s/.test(peek)
        }

        function isQuote() {
            return peek == '"' || peek == "'"
        }

        function dealQuote() {
            var start = index
            var c = peek
            var end = s.indexOf(c, start)
            if (end == -1) {
                index = length
            } else if (s.charAt(end - 1) != '\\') {
                index = end + 1
            } else {
                while (index < length) {
                    readch()
                    if (peek == '\\') {
                        index++
                    } else if (peek == c) {
                        break
                    }
                }
            }
            if (modName) {
                res.push(s.slice(start, index - 1))
                modName = 0
            }
        }

        function dealReg() {
            index--
            while (index < length) {
                readch()
                if (peek == '\\') {
                    index++
                } else if (peek == '/') {
                    break
                } else if (peek == '[') {
                    while (index < length) {
                        readch()
                        if (peek == '\\') {
                            index++
                        } else if (peek == ']') {
                            break
                        }
                    }
                }
            }
        }

        function isWord() {
            return /[a-z_$]/i.test(peek)
        }

        function dealWord() {
            var s2 = s.slice(index - 1)
            var r = /^[\w$]+/.exec(s2)[0]
            parentheseState = {
                'if': 1,
                'for': 1,
                'while': 1,
                'with': 1
            }[r]
            isReg = {
                'break': 1,
                'case': 1,
                'continue': 1,
                'debugger': 1,
                'delete': 1,
                'do': 1,
                'else': 1,
                'false': 1,
                'if': 1,
                'in': 1,
                'instanceof': 1,
                'return': 1,
                'typeof': 1,
                'void': 1
            }[r]
            modName = /^require\s*\(\s*(['"]).+?\1\s*\)/.test(s2)
            if (modName) {
                r = /^require\s*\(\s*['"]/.exec(s2)[0]
                index += r.length - 2
            } else {
                index += /^[\w$]+(?:\s*\.\s*[\w$]+)*/.exec(s2)[0].length - 1
            }
        }

        function isNumber() {
            return /\d/.test(peek) || peek == '.' && /\d/.test(s.charAt(index))
        }

        function dealNumber() {
            var s2 = s.slice(index - 1)
            var r
            if (peek == '.') {
                r = /^\.\d+(?:E[+-]?\d*)?\s*/i.exec(s2)[0]
            } else if (/^0x[\da-f]*/i.test(s2)) {
                r = /^0x[\da-f]*\s*/i.exec(s2)[0]
            } else {
                r = /^\d+\.?\d*(?:E[+-]?\d*)?\s*/i.exec(s2)[0]
            }
            index += r.length - 1
            isReg = 0
        }
    }
    /**
     * module.js - The core of module loader
     */

    var cachedMods = seajs.cache = {}
    var anonymousMeta

    var fetchingList = {}
    var fetchedList = {}
    var callbackList = {}

    var STATUS = Module.STATUS = {
        // 1 - The `module.uri` is being fetched
        FETCHING: 1,
        // 2 - The meta data has been saved to cachedMods
        SAVED: 2,
        // 3 - The `module.dependencies` are being loaded
        LOADING: 3,
        // 4 - The module are ready to execute
        LOADED: 4,
        // 5 - The module is being executed
        EXECUTING: 5,
        // 6 - The `module.exports` is available
        EXECUTED: 6,
        // 7 - 404
        ERROR: 7
    }


    function Module(uri, deps) {
        this.uri = uri
        this.dependencies = deps || []
        this.deps = {} // Ref the dependence modules
        this.status = 0

        this._entry = []
    }

    // Resolve module.dependencies
    Module.prototype.resolve = function() {
        var mod = this
        var ids = mod.dependencies
        var uris = []

        for (var i = 0, len = ids.length; i < len; i++) {
            uris[i] = Module.resolve(ids[i], mod.uri)
        }
        return uris
    }

    Module.prototype.pass = function() {
        var mod = this

        var len = mod.dependencies.length

        for (var i = 0; i < mod._entry.length; i++) {
            var entry = mod._entry[i]
            var count = 0
            for (var j = 0; j < len; j++) {
                var m = mod.deps[mod.dependencies[j]]
                    // If the module is unload and unused in the entry, pass entry to it
                if (m.status < STATUS.LOADED && !entry.history.hasOwnProperty(m.uri)) {
                    entry.history[m.uri] = true
                    count++
                    m._entry.push(entry)
                    if (m.status === STATUS.LOADING) {
                        m.pass()
                    }
                }
            }
            // If has passed the entry to it's dependencies, modify the entry's count and del it in the module
            if (count > 0) {
                entry.remain += count - 1
                mod._entry.shift()
                i--
            }
        }
    }

    // Load module.dependencies and fire onload when all done
    Module.prototype.load = function() {
        var mod = this

        // If the module is being loaded, just wait it onload call
        if (mod.status >= STATUS.LOADING) {
            return
        }

        mod.status = STATUS.LOADING

        // Emit `load` event for plugins such as combo plugin
        var uris = mod.resolve()
        emit("load", uris)

        for (var i = 0, len = uris.length; i < len; i++) {
            mod.deps[mod.dependencies[i]] = Module.get(uris[i])
        }

        // Pass entry to it's dependencies
        mod.pass()

        // If module has entries not be passed, call onload
        if (mod._entry.length) {
            mod.onload()
            return
        }

        // Begin parallel loading
        var requestCache = {}
        var m

        for (i = 0; i < len; i++) {
            m = cachedMods[uris[i]]

            if (m.status < STATUS.FETCHING) {
                m.fetch(requestCache)
            } else if (m.status === STATUS.SAVED) {
                m.load()
            }
        }

        // Send all requests at last to avoid cache bug in IE6-9. Issues#808
        for (var requestUri in requestCache) {
            if (requestCache.hasOwnProperty(requestUri)) {
                requestCache[requestUri]()
            }
        }
    }

    // Call this method when module is loaded
    Module.prototype.onload = function() {
        var mod = this
        mod.status = STATUS.LOADED

        // When sometimes cached in IE, exec will occur before onload, make sure len is an number
        for (var i = 0, len = (mod._entry || []).length; i < len; i++) {
            var entry = mod._entry[i]
            if (--entry.remain === 0) {
                entry.callback()
            }
        }

        delete mod._entry
    }

    // Call this method when module is 404
    Module.prototype.error = function() {
        var mod = this
        mod.onload()
        mod.status = STATUS.ERROR
    }

    // Execute a module
    Module.prototype.exec = function() {
        var mod = this

        // When module is executed, DO NOT execute it again. When module
        // is being executed, just return `module.exports` too, for avoiding
        // circularly calling
        if (mod.status >= STATUS.EXECUTING) {
            return mod.exports
        }

        mod.status = STATUS.EXECUTING

        if (mod._entry && !mod._entry.length) {
            delete mod._entry
        }

        //non-cmd module has no property factory and exports
        if (!mod.hasOwnProperty('factory')) {
            mod.non = true
            return
        }

        // Create require
        var uri = mod.uri

        function require(id) {
            var m = mod.deps[id] || Module.get(require.resolve(id))
            if (m.status == STATUS.ERROR) {
                throw new Error('module was broken: ' + m.uri);
            }
            return m.exec()
        }

        require.resolve = function(id) {
            return Module.resolve(id, uri)
        }

        require.async = function(ids, callback) {
            Module.use(ids, callback, uri + "_async_" + cid())
            return require
        }

        // Exec factory
        var factory = mod.factory

        var exports = isFunction(factory) ?
            factory(require, mod.exports = {}, mod) :
            factory

        if (exports === undefined) {
            exports = mod.exports
        }

        // Reduce memory leak
        delete mod.factory

        mod.exports = exports
        mod.status = STATUS.EXECUTED

        // Emit `exec` event
        emit("exec", mod)

        return mod.exports
    }

    // Fetch a module
    Module.prototype.fetch = function(requestCache) {
        var mod = this
        var uri = mod.uri

        mod.status = STATUS.FETCHING

        // Emit `fetch` event for plugins such as combo plugin
        var emitData = {
            uri: uri
        }
        emit("fetch", emitData)
        var requestUri = emitData.requestUri || uri

        // Empty uri or a non-CMD module
        if (!requestUri || fetchedList.hasOwnProperty(requestUri)) {
            mod.load()
            return
        }

        if (fetchingList.hasOwnProperty(requestUri)) {
            callbackList[requestUri].push(mod)
            return
        }

        fetchingList[requestUri] = true
        callbackList[requestUri] = [mod]

        // Emit `request` event for plugins such as text plugin
        emit("request", emitData = {
            uri: uri,
            requestUri: requestUri,
            onRequest: onRequest,
            charset: isFunction(data.charset) ? data.charset(requestUri) || 'utf-8' : data.charset
        })

        if (!emitData.requested) {
            requestCache ?
                requestCache[emitData.requestUri] = sendRequest :
                sendRequest()
        }

        function sendRequest() {
            seajs.request(emitData.requestUri, emitData.onRequest, emitData.charset)
        }

        function onRequest(error) {
            delete fetchingList[requestUri]
            fetchedList[requestUri] = true

            // Save meta data of anonymous module
            if (anonymousMeta) {
                Module.save(uri, anonymousMeta)
                anonymousMeta = null
            }

            // Call callbacks
            var m, mods = callbackList[requestUri]
            delete callbackList[requestUri]
            while ((m = mods.shift())) {
                // When 404 occurs, the params error will be true
                if (error === true) {
                    m.error()
                } else {
                    m.load()
                }
            }
        }
    }

    // Resolve id to uri
    Module.resolve = function(id, refUri) {
        // Emit `resolve` event for plugins such as text plugin
        var emitData = {
            id: id,
            refUri: refUri
        }
        emit("resolve", emitData)

        return emitData.uri || seajs.resolve(emitData.id, refUri)
    }

    // Define a module
    Module.define = function(id, deps, factory) {
        var argsLen = arguments.length

        // define(factory)
        if (argsLen === 1) {
            factory = id
            id = undefined
        } else if (argsLen === 2) {
            factory = deps

            // define(deps, factory)
            if (isArray(id)) {
                deps = id
                id = undefined
            }
            // define(id, factory)
            else {
                deps = undefined
            }
        }

        // Parse dependencies according to the module factory code
        if (!isArray(deps) && isFunction(factory)) {
            deps = typeof parseDependencies === "undefined" ? [] : parseDependencies(factory.toString())
        }

        var meta = {
            id: id,
            uri: Module.resolve(id),
            deps: deps,
            factory: factory
        }

        // Try to derive uri in IE6-9 for anonymous modules
        if (!isWebWorker && !meta.uri && doc.attachEvent && typeof getCurrentScript !== "undefined") {
            var script = getCurrentScript()

            if (script) {
                meta.uri = script.src
            }

            // NOTE: If the id-deriving methods above is failed, then falls back
            // to use onload event to get the uri
        }

        // Emit `define` event, used in nocache plugin, seajs node version etc
        emit("define", meta)

        meta.uri ? Module.save(meta.uri, meta) :
            // Save information for "saving" work in the script onload event
            anonymousMeta = meta
    }

    // Save meta data to cachedMods
    Module.save = function(uri, meta) {
        var mod = Module.get(uri)

        // Do NOT override already saved modules
        if (mod.status < STATUS.SAVED) {
            mod.id = meta.id || uri
            mod.dependencies = meta.deps || []
            mod.factory = meta.factory
            mod.status = STATUS.SAVED

            emit("save", mod)
        }
    }

    // Get an existed module or create a new one
    Module.get = function(uri, deps) {
        return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
    }

    // Use function is equal to load a anonymous module
    Module.use = function(ids, callback, uri) {
        var mod = Module.get(uri, isArray(ids) ? ids : [ids])

        mod._entry.push(mod)
        mod.history = {}
        mod.remain = 1

        mod.callback = function() {
            var exports = []
            var uris = mod.resolve()

            for (var i = 0, len = uris.length; i < len; i++) {
                exports[i] = cachedMods[uris[i]].exec()
            }

            if (callback) {
                callback.apply(global, exports)
            }

            delete mod.callback
            delete mod.history
            delete mod.remain
            delete mod._entry
        }

        mod.load()
    }


    // Public API

    seajs.use = function(ids, callback) {
        Module.use(ids, callback, data.cwd + "_use_" + cid())
        return seajs
    }

    Module.define.cmd = {}
    global.define = Module.define


    // For Developers

    seajs.Module = Module
    data.fetchedList = fetchedList
    data.cid = cid

    seajs.require = function(id) {
        var mod = Module.get(Module.resolve(id))
        if (mod.status < STATUS.EXECUTING) {
            mod.onload()
            mod.exec()
        }
        return mod.exports
    }

    /**
     * config.js - The configuration for the loader
     */

    // The root path to use for id2uri parsing
    data.base = loaderDir

    // The loader directory
    data.dir = loaderDir

    // The loader's full path
    data.loader = loaderPath

    // The current working directory
    data.cwd = cwd

    // The charset for requesting files
    data.charset = "utf-8"

    // data.alias - An object containing shorthands of module id
    // data.paths - An object containing path shorthands in module id
    // data.vars - The {xxx} variables in module id
    // data.map - An array containing rules to map module uri
    // data.debug - Debug mode. The default value is false

    seajs.config = function(configData) {

        for (var key in configData) {
            var curr = configData[key]
            var prev = data[key]

            // Merge object config such as alias, vars
            if (prev && isObject(prev)) {
                for (var k in curr) {
                    prev[k] = curr[k]
                }
            } else {
                // Concat array config such as map
                if (isArray(prev)) {
                    curr = prev.concat(curr)
                }
                // Make sure that `data.base` is an absolute path
                else if (key === "base") {
                    // Make sure end with "/"
                    if (curr.slice(-1) !== "/") {
                        curr += "/"
                    }
                    curr = addBase(curr)
                }

                // Set config
                data[key] = curr
            }
        }

        emit("config", configData)
        return seajs
    }

})(this);
/* jshint asi:true */

/**
 * @name _intro.js
 * @description 整个框架的头
 * @date 2015.5.20
 */

'use strict'

!function(global, DOC) {

/**
 * @name  main.js
 * @description  此文件是种子模块，定义了大量私有变量，提供extend等基础api
 * @date  2015.05.07
 * @author  sunken
 */
var W3C = DOC.dispatchEvent //IE9开始支持W3C的事件模型与getComputedStyle取样式值
var html = DOC.documentElement //HTML元素
var head = DOC.head || DOC.getElementsByTagName('head')
var body = document.body
var version = 2


// 命名空间，传入css表达式或dom对象，返回一个fishbone对象
// function $(selector) {

//     return $.fn.init(selector)
// }
function $(selector) {

    return new $.fn.init(selector)
}

$.fn = $.prototype

// 糅杂，为一个对象添加更多成员
function mix(receiver, supplier) {
    var args = [].slice.call(arguments),
        i = 1,
        key, //如果最后参数是布尔，判定是否覆写同名属性
        ride = typeof args[args.length - 1] === 'boolean' ? args.pop() : true

    if (args.length === 1) { //处理$.mix(hash)的情形

        receiver = !this.window ? this : {}
        i = 0
    }

    while ((supplier = args[i++])) {
        for (key in supplier) { 
            //允许对象糅杂，用户保证都是对象
            if (Object.prototype.hasOwnProperty.call(supplier, key) && (ride || !(key in receiver))) {

                receiver[key] = supplier[key]
            }
        }
    }

    return receiver
}

function query(expr) {

    var arrExp = expr.split(',')

    var nodes = DOC.querySelectorAll(expr)

    for (var i = 0; i < nodes.length; i++) {

        this[i] = nodes[i]
    }

    this.length = nodes.length
    // 将nodeList转为数组
    //this = makeArray(this)

    /*
    // TODO: id的判断规则
    if (arrExp.length === 1 && arrExp[0].charAt(0) === '#' && arrExp[0].indexOf(' ') === -1) {

        // 记录选择器，方便后面使用 
        this.selector = expr
        this[0] = DOC.querySelector(arrExp[0])
        this.length = 1

    } else {

        var nodes = DOC.querySelectorAll(expr)

        for (var i = 0; i < nodes.length; i++) {

            this[i] = nodes[i]
        }

        this.length = nodes.length
        // 将nodeList转为数组
        //this = makeArray(this)
    }
    */

    return this
}

function create(nodeName) {

    var node = document.createElement(nodeName)

    return new $.fn.init(node)
}

var imgReady = (function() {

    var list = [],
        intervalId = null,

        // 用来执行队列
        tick = function() {
            var i = 0;
            for (; i < list.length; i++) {
                list[i].end ? list.splice(i--, 1) : list[i]()
            };
            !list.length && stop()
        },

        // 停止所有定时器队列
        stop = function() {
            clearInterval(intervalId)
            intervalId = null
        };

    return function(url, ready, load, error) {
        var onready, width, height, newWidth, newHeight,
            img = new Image()

        img.src = url

        // 如果图片被缓存，则直接返回缓存数据
        if (img.complete) {
            ready.call(img)
            load && load.call(img);
            return
        }

        width = img.width
        height = img.height

        // 加载错误后的事件
        img.onerror = function() {
            error && error.call(img)
            onready.end = true
            img = img.onload = img.onerror = null
        }

        // 图片尺寸就绪
        onready = function() {

            newWidth = img.width;
            newHeight = img.height;
            if (newWidth !== width || newHeight !== height ||
                // 如果图片已经在其他地方加载可使用面积检测
                newWidth * newHeight > 1024
            ) {
                ready.call(img);
                onready.end = true


            }
        }
        onready()

        // 完全加载完毕的事件
        img.onload = function() {
            !onready.end && onready()

            load && load.call(img)

            // IE gif动画会循环执行onload，置空onload即可
            img = img.onload = img.onerror = null
        }

        // 加入队列中定期执行
        if (!onready.end) {
            list.push(onready)
                // 无论何时只允许出现一个定时器，减少浏览器性能损耗
            if (intervalId === null) intervalId = setInterval(tick, 40)
        }
    }
})()

// 将类数组对象转成数组
// TODO: catch部分的代码是jquery源码
function makeArray(arrayLike) {

    var arr = []

    try {

        arr = Array.prototype.slice.call(arrayLike)
    
    } catch(e) {

        var i = arrayLike.length

        if (i == null || typeof arrayLike === 'string') {

            arr[0] = arrayLike
        
        } else {

            while(i) {

                arr[--i] = arrayLike[i]
            }
        }
    }

    return arr
}

// 初始化fishbone对象
// TODO: 分支较多，结构不清晰。对length和selector的赋值不统一
function init(expr) {

    // 分支1，处理空白字符串、null、undefiend函数
    if (!expr) {

        return this
    }

    // 分支2，如果传入的是dom节点
    if (expr.nodeName) {

        this[0] = expr
        this.length = 1

        return this
    }

    this.selector = expr + ''

    // 分支3，传入的是数组、节点集合
    if (expr instanceof Array || expr instanceof NodeList) {

        for (var i = 0; i < expr.length; i++) {

            this[i] = expr[i]
        }

        this.length = expr.length

        return this
    }

    // 分支4，处理选择器
    if (typeof expr === 'string') {

        expr = expr.trim()

        // 分支5，动态生成新节点
        // TODO: 暂时不支持
        if (expr.charAt(0) === '<' && expr.charAt(expr.length - 1) === '>' && expr.length >= 3) {

            return this
            
        // 分支6，调用选择器模块
        } else {

            return query.call(this, expr)
        }

    // 分支7，处理fishbone对象
    } else if (expr instanceof $) {

        return expr
    
    // 分支8，处理window对象
    } else if (expr === window){

        this[0] = expr

        this.length = 1
    }

    return this
}

/*


function init(expr) {

    // 分支1，处理空白字符串、null、undefiend函数
    // if (!expr) {

    //     return this
    // }

    // 分支1，如果传入的是dom节点
    if (expr.nodeName || expr === window) {

        this[0] = expr
        this.selector = null
    
        this.length = 1

    } else if (expr === 'body') {

        this[0] = DOC
        this.selector = expr
        this.length = 1

    // 分支3，传入的是dom数组
    } else if (expr instanceof Array || expr instanceof NodeList) {

        for (var i = 0; i < expr.length; i++) {

            this[i] = expr[i]
        }

        this.length = expr.length
        this.selector = null

    // 分支4，使用选择器获取dom元素
    } else {

        // 记录选择器，方便后面使用 
        this.selector = expr

        //expr = expr.replace(' ', '')

        var arrExp = expr.split(',')
        
        if (arrExp.length === 1 && arrExp[0].charAt(0) === '#') {

            // 记录选择器，方便后面使用 
            this.selector = expr
            this[0] = DOC.querySelector(arrExp[0])
            this.length = 1

        } else {

            var nodes = DOC.querySelectorAll(expr)

            for (var i = 0; i < nodes.length; i++) {

                this[i] = nodes[i]
            }

            this.length = nodes.length
            // 将nodeList转为数组
            //this = makeArray(this)
        }
    }
    
    // 让浏览器以为是数组
    //this.splice = function() {}

    return this
}

*/

init.prototype = $.fn

mix($.fn, {

    mix: mix,
    nodes: [],
    // bonelot
    fishbone: version,
    constructor: $,
    length: 0,
    splice: function() {},

    init: init
})

/**
 * 2015.5.11 整合了原有的module.js模块，使框架结构更清晰
 * 2015.5.12
 * 将amd模块与图表组件库统一，让出全局的define和require
 * 增加了require函数的字符串判断，允许传入字符串作为参数
 * 将require函数重命名为use，原use改为require
 * 将require函数的参数1，2改为可选
 * 2015.5.13
 * 重写了$函数，返回$.fn.init的结果，返回后的内容为dom对象与$.fn对象的并集
 * 2015.5.20
 * 更换了打包方式，移除了amd模块
 * 2015.6.5
 * 增加了makeArray函数
 * 修改了init函数，为兼容IE 8 将Object.create更换为new Object
 * 2015.6.10
 * 修改了$和init函数，调用$会返回init的实例
 * 修改了fishbone对象的结构，现在看起来更像jquery
 * 2015.6.14
 * 修改了init函数，修复bug -> 选择器使用空格分割
 * 2015.6.17
 * 增加了create方法，用来创建节点
 * 2015.6.18
 * 修改了query函数，移除了id分支
 */
 
/**
 * @description  专门抹平浏览器兼容问题
 * @name _fix.js
 * @deprecated  2015.6.4
 */

// TODO: IE 8 defineProperties
// TODO: IE 8 forEach

/**
 * @name  prototype.js
 * @description  对象原型扩展模块，该文件为侵入式设计
 * @date  2015.5.12
 * @author  sunken
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

// 取数组中的最小值
Array.prototype.min = function(target) {

    return Math.min.apply(0, target)
}

// 取数组中的最大值
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

/**
 * 2015.5.12
 * 创建模块
 */




/**
 * @name  data.js
 * @description  语言模块，补全功能
 * @date  2015.6.15
 */
//var Lang = {}


//$.parseHTMl = function() {}
 
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
 
/*
 * @name  http.js
 * @description  数据请求模块，负责实现ajax、comet、websocket
 * @date  2015.05.12
 * @version  0.0.1
 */

var Http = {}

var accepts = {

    xml: 'application/xml, text/xml',
    html: 'text/html',
    text: 'text/plain',
    json: 'application/json, text/javascript',
    script: 'text/javascript, application/javascript',
    '*': ['*/'] + ['*'] //避免被压缩掉
},
defaults = {
    type: 'GET',
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    async: true
    //jsonp: 'callback'
}

// ajax获取js文件
// TODO: 这里暂时修改使用seajs的api
Http.getScript = function(url, callback) {

    seajs.use(url, callback)

    // var script = document.createElement('script')
    // var body = document.querySelector('body')

    // script.src = url
    // script.type = 'text/javascript'
    // script.onload = callback.call(this)

    // body.appendChild(script)
}

// ajax获取css文件
// TODO: 和getScript可以合并
Http.getCss = function(url, callback) {

    var link = document.createElement('link')
    var head = document.getElementsByTagName('head')[0]

    link.href = url
    link.rel = 'stylesheet'

    // IE 8兼容
    link.onload = function() {

        callback.call(this)
    }

    head.appendChild(link)
}

// ajax函数的简化版，提供更简单易用的api
Http.get = function(url, callback) {

    var param = defaults

    param.success = callback
    param.url = url

    Http.ajax(param)
}

Http.convertJsonToPostData = function(data) {

    // case 1
    if (data === undefined) {

        return null

    // case 2
    } else {

        var str = ''

        for (var k in data) {

            str = str + k + '=' + data[k] + '&'
        }   

        data = str.substring(0, str.length - 1)

        return data
    }
}

Http.ajax = function(setting, events) {

    var url = setting.url,
        type = setting.type ? setting.type.toUpperCase() : defaults.type
    
    // 将param转成post数据
    var param = Http.convertJsonToPostData(setting.param)

    var req = new XMLHttpRequest()
    
    req.open(type, url)

    // 调用beforeSend，这里面不能写异步函数
    setting.before && setting.before(req)

    req.onreadystatechange = function() {

        if (req.readyState === 4 && req.status === 200) {

            // 应该判断是否是json
            var res = req.responseText

            // 尝试将字符串转换为json对象
            try {

                res = JSON.parse(res)
            
            } catch(e) {

                //throw 'json parse error'
            }

            setting.success && setting.success(res)
        }
    }

    req.setRequestHeader('Content-type', defaults.contentType)

    // handle XMLHttpRequest level 2 event
    // 如果有传入loadStart和progress参数
    if (typeof events !== 'undefined') {

        for (var k in events) {

            req['on' + k] = events[k]
        }
    }

    req.send(param)
}

// 尽量使用CORS
Http.jsonp = function(url, funcName, callback) {

    var script = document.createElement('script')
    var body = document.querySelector('body')

    script.src = url + '?type=jsonp&callbackName=' + funcName
    script.id = 'jsonp'
    script.onload = callback

    window[funcName] = funcName

    body.appendChild(script)
}

Http.comet = function() {}

Http.socket = function() {}

/**
 * 2015.5.12
 * 创建http模块
 * 添加ajax、jsonp两个顶级接口。ajax支持httprequest 2.0
 * 2015.6.4
 * 修改了getScript函数，依赖了seajs
 * 2015.7.9
 * 修改了ajax函数，将data参数更名为param，去掉了最后转化json的eval，修复了post发送数据格式错误的bug
 * 增加了convertJsonToPostData函数，该函数接收一个json参数，返回一个post数据格式字符串
 */
 
/**
 * @name  node.js
 * @description  dom、node模块，提供dom对象的CRUD
 * @date  2015.05.12
 * @author sunken
 */
var Node = {}

// 将node以某元素子元素的形式插入到该元素内容的最后面
Node.append = function(node) {

    //var nodes = []

    // 循环复制插入节点
    for (var i = 0; i < this.length; i++) {

        // 将fishbone对象转为dom对象
        if (node instanceof $) {

            node = node[0]
        }

        //var n = node.cloneNode(true)

        this[i].appendChild(node)
        //nodes.push(n)
    }

    return this
    //return new $.fn.init(nodes)
}

// 将节点插入目标元素
Node.appendTo = function(node) {

    for (var i = 0; i < this.length; i++) {

        $(node).append(this.eq(i))
    }

    return this
    // 返回新节点
    //return new $.fn.init(nodes)
}

// 将node以某元素子元素的形式插入到该元素内容的最前面
Node.prepend = function(node) {

    // 循环复制插入节点
    for (var i = 0; i < nodes.length; i++) {

        var n = node.cloneNode(true)

        nodes[i].insertBefore(n, nodes[i].childNodes[0])
    }

    return this
}

// 克隆节点，如果include_all为true，会克隆该元素所包含的所有子节点
Node.clone = function(include) {

    var arr = []

    for (var i = 0; i < this.length; i++) {

        arr.push(this[i].cloneNode(include))
    }

    return new $.fn.init(arr)
}

// 修改元素的innerText
Node.text = function(text) {

    if (text === undefined) {

        return this[0].textContent ? this[0].textContent : this[0].innerText

    } else {

        for (var i = 0; i < this.length; i++) {

            this[i].innerText = text
        }

        return this
    }
}

// 修改元素的innerHTML
Node.html = function(html) {

    if (html === undefined) {

        return this[0].innerHTML

    } else {

        for (var i = 0; i < this.length; i++) {

            this[i].innerHTML = html
        }

        return this
    }
}

// 移除元素
Node.remove = function() {

    for (var i = 0, length = this.length; i < length; i++) {

        this[i].parentNode.removeChild(this[i])
    }

    // TODO: 如果返回this，这个对象会包含已经删除节点对象的引用
    return null
}

Node.after = function() {}

Node.before = function() {}

// TODO: 如果this.nodes不是数组，这里会报错
Node.eq = function(index) {

    var n = null

    n = this[index]
    n = new $.fn.init(n)

    return n
}

Node.first = function() {

    return Node.eq.call(this, 0)
}

Node.last = function() {

    return Node.eq.call(this, this.length - 1)
}

// 查找子节点，参数是css 2选择器
Node.find = function(expr) {

    var nodes = []

    for (var i = 0; i < this.length; i++) {

        var result = this[i].querySelectorAll(expr)

        for (var j = 0; j < result.length; j++) {

            nodes.push(result[j])
        }
    }

    return new $.fn.init(nodes)
}

// 获取当前元素在父节点中的下标
Node.index = function() {

    var brothers = this[0].parentNode.children

    for (var i = 0; i < brothers.length; i++) {

        if (brothers[i] === this[0]) {

            return i
        }
    }
}

// 获取/设置当前节点的值
Node.val = function(value) {

    if (value === undefined) {

        return this[0].nodeName === 'INPUT' ? this[0].value : ''
    }

    for (var i = 0; i < this.length; i++) {

        if (this[i].nodeName === 'INPUT') {

            this[i].value = value
        }
    }

    return this
}

// 隐藏元素
Node.hide = function() {

    return Css.init.call(this, 'display', 'none')
}

// 显示元素
Node.show = function() {

    return Css.init.call(this, 'display', 'block')
}

// 获取元素的宽
Node.width = function() {

    return Number.parseInt(Css.init.call(this, 'width'))
}

// 获取元素的高
Node.height = function() {

    return Number.parseInt(Css.init.call(this, 'height'))
}

// 获取当前元素的父节点
Node.parent = function() {

    var nodes = []

    for (var i = 0; i < this.length; i++) {

        nodes.push(this[i].parentNode)
    }

    return new $.fn.init(nodes)
}

// 获取当前元素的下一个兄弟节点
Node.next = function() {

    var nodes = []

    for (var i = 0; i < this.length; i++) {

        var next = this[i].nextSibling

        while(next && next.nodeType !== 1) {

            next = next.nextSibling
        }

        nodes.push(next)
    }

    return new $.fn.init(nodes)
}

// 获取当前元素的上一个兄弟节点
Node.prev = function() {

    var nodes = []

    for (var i = 0; i < this.length; i++) {

        var prev = this[i].previousSibling

        while(prev && prev.nodeType !== 1) {

            prev = prev.previousSibling
        }

        nodes.push(prev)
    }

    return new $.fn.init(nodes)
}

Node.each = function() {}



// 创建一个div，包裹原有代码
Node.wrap = function() {}

// 遍历所有对象
// Node.each = function() {

// },

/**
 * 2015.5.12 创建node模块
 * 2015.5.20 增加了append、prepend、clone和html方法
 * 2015.5.21
 * 在eq中添加了try-catch处理，目前的写法并不完美，但足够使用
 * 增加了first、last和remove方法
 * 2015.6.8
 * 修改了append、prepend、clone和html方法
 * 2015.6.10
 * 修改了append，现在返回一个fishbone对象，内含新添加的dom元素
 * 2015.6.11
 * 增加了find、text方法
 * 增加了index方法
 * 增加了val方法
 * 2015.6.12
 * 增加了hide、show方法
 * 修改了hide、show方法，他们现在依赖css模块
 * 2015.6.14
 * 增加了offset、position方法
 * 2015.6.15
 * 增加了next、prev和parent方法
 * 2015.6.17
 * 增加了prepend方法，修改了append，对fishbone对象进行支持
 * 2015.7.7
 * 修改了text方法，fix bug: 火狐不支持innerText
 * 将position方法移动到css模块
 * 修改了offset方法，之前offset和margin的关系计算错误
 * 将offset方法移动到css模块
 */
 

/**
 * @name  event.js
 * @description  事件模块
 * @date  2015.5.25
 */

var Event = {}

// 声明事件，将事件保存在dom节点对象上
Event.declareEvent = function(target, type, handler) {

    // 向target添加事件之前记录在e上
    if (target.e === undefined) {

        target.e = {}
    }

    if (target.e[type] === undefined) {

        target.e[type] = []
    }

    // 记录
    target.e[type].push({

        type: type,
        handler: handler
    })
}


// 添加事件
Event.addEvent = function(target, type, handler) {

    Event.declareEvent.call(null, target, type, handler)

    if (target.addEventListener) {

        target.addEventListener(type, handler, false)

    } else {

        target.attachEvent('on' + type, function(event) {

            // jquery的坐标修复
            event.pageX = event.clientX 
                    + (DOC && DOC.scrollLeft || body && body.scrollLeft || 0) 
                    - (DOC && DOC.clientLeft || body && body.clientLeft || 0)

            event.pageY = event.clientY 
                    + (DOC && DOC.scrollTop || body && body.scrollTop || 0) 
                    - (DOC && DOC.clientTop || body && body.clientTop || 0)

            // 把处理和程序作为时间目标的方法调用
            // 传递事件对象
            return handler.call(target, event)
        })
    }
}

Event.removeEvent = function(target, type, handler) {

    // 对handler进行判断，如果不存在，按照type清除全部事件
    if (handler === undefined) {

        // 事件对象e，以type为key，每个事件类型对应一个handler数组
        var events = target.e[type]

        // ie9+
        if (target.removeEventListener) {

            // 遍历当前节点上保存的所有事件
            for (var i = 0; i < events.length; i++) {

                // 匹配同类型事件
                // 分支1，如果传入了handler
                if (events[i].type === type && events[i].handler === handler) {

                    target.removeEventListener(type, handler, false)

                    events.splice(i, 1)
                    i--
                
                // 分支2，type匹配但没有handler，全部删除
                } else if (events[i].type === type) {

                    target.removeEventListener(type, events[i].handler, false)

                    // 从数组中删除事件，并重置数组长度
                    events.splice(i, 1)
                    i--
                }
            }

        // IE 8
        // TODO: 未经过测试
        } else {

            for (var i = 0; i < events.length; i++) {

                // 分支1，如果传入了handler
                if (events[i].type === type && events[i].handler === handler) {

                    target.detachEvent('on' + type, handler)

                    events.splice(i, 1)
                    i--

                } else if (events[i].type === type) {

                    target.detachEvent('on' + type, events[i].handler)

                    events.splice(i, 1)
                    i--
                }
            }
        }

    } else {

        if (target.removeEventListener) {
            target.removeEventListener(type, handler, false)

        } else {

            target.detachEvent('on' + type, handler)
        }
    }
}

// 将事件绑定在document上，然后根据selector来判断是否执行
// TODO: 缺少ie9以下的处理，事件委托的选择器不完善
Event.live = function(type, handler) {

    var selector = this.selector

    // live的实现，模仿jquery。但内部调用queryselector来匹配对象
    document.addEventListener(type, function(e) {

        var loop = 0

        var nodes = document.querySelectorAll(selector)
        var target = e.target

        do {

            for (var i = 0; i < nodes.length; i++) {

                ++loop

                if (nodes[i] === target) {

                    console.log('live match loop: ' + loop)

                    return handler.call(target, e)
                }
            }

            target = target.parentNode

        } while (target !== document)
    })
}

// 对外暴露的事件绑定api
Event.on = function(type, handler) {

    // 根据nodeName判断单个绑定或循环绑定
    // target可能是window或document对象，判断条件从nodeName改成是否是array
    for (var i = 0; i < this.length; i++) {

        Event.addEvent(this[i], type, handler)
    }
}

// domReady
Event.ready = function(handler) {

    var eventFn = W3C ? 'DOMContentLoaded' : 'readystatechange'
    var handle = handler

    if (this[0] !== document) {

        return
    }
    
    // 如果domReady已经结束，直接执行回调
    if (DOC.readyState !== 'complete') {

        //console.log(DOC.readyState)
        if (eventFn === 'readystatechange') {

            handle = function() {

                if (DOC.readyState === 'complete') {

                    Function.call(handler)
                }
            }

        }
        
        Event.addEvent(this[0], eventFn, handle)

    } else {

        handle.call(null)
    }
}

// 关闭事件的接口
Event.off = function(type, handler) {

    for (var i = 0; i < this.length; i++) {

        Event.removeEvent(this[i], type, handler)
    }
}

/**
 * 2015.5.25
 * 创建模块
 * 添加了addEvent和removeEvent函数
 * TODO: 添加了live函数，但不完善
 * 添加了on函数，此函数将对外暴
 * 2015.5.26
 * 重写了live函数，初步测试可用，但事件通过document绑定，还有优化空间
 * 添加了ready函数
 * 2015.6.5
 * 将unbind更名为off
 * 2015.6.15
 * 修改了removeEvent，在删除事件的同时删除target.e
 * 2015.6.16
 * 修改了removeEvent，修复bug，先解除事件再删除target.e
 * 修改了removeEvent，增加了handler的存在验证分支
 * 增加了declareEvent函数，代码从addEvent中分离
 * 2015.6.26
 * 修改了removeEvent，修复bug：删除事件后没有重置i
 */

/**
 * @name module.js
 * @description 定义模块
 * @date 2015.5.26
 * @author sunken
 */
var Module = {}

// 组件类，生成基本结构
Module.Component = function() {
    
    // privite variable
    var that = this
   
    // basic properties
    this.node = null
    this.view = null

    this.controller = null
    this.model = null

    // basic mothod 
    this.init =  function(node) {

        this.node = node

        // 调用数据的初始化，之后会进入data的set，执行controller.refresh
        // TODO: callback 似乎是没用的
        this.model.init.call(this, function() {})

        return this 
    }

    return this
}

Module.component = {}

// 初始化组件
Module.component.init = function(name, handler) {
    
    var cop = new Module.Component()

    // 添加data属性
    // IE 8 兼容
    Object.defineProperties(cop, {
        
        data: {
            enumerable: true,
            configurable: true,
          
            get: function() { return this.value },
            set: function(value) { 

                this.value = value 
            
                // 数据变更时，调用view层的初始化
                this.controller.refresh(this.node)
            }
        }
    })
    
    return handler.call(this, cop)
}

/**
 * 2015.5.26
 * 使用defineProperties创建模块对象
 * 2015.5.28
 * 重写了模块
 * 2015.5.29
 * 重写了模块
 */

/**
 * @name  css.js
 * @description  css模块，改变fishbone对象的样式
 * @date  2015.5.30
 */
var Css = {}

// 判断传入setCss的值是否是变化量
Css.validateChange = function(value) {
    
    return (value[0] === '+' || value[0] === '-') && typeof value[value.length - 1] === 'number'

    /*
    if () {

        return true

    } else {

        return false
    }
    */
}

// 处理连缀写法，将css写法转为驼峰式
Css.handleSeperator = function(key) {
    // 对key处理，与value无关
    var sepIndex = key.indexOf('-')

    if (sepIndex !== -1) {
    
        key = key.replace('-', '')
        // user + N + ame
        key = key.substring(0, sepIndex) + key[sepIndex].toUpperCase() + key.substring(sepIndex + 1)
    }

    return key
}

// 处理变化量
Css.calculateChange = function(key, value) {
        
    // 这里调用的是Css.getCss
    // TODO: 如果是width，返回值会带px，返回类型需要验证 
    var oldValue = Css.getCss.call(this, key)

    // 去掉px后取整
    oldValue = Number.parseInt(oldValue.substring(0, oldValue.length - 2))
    // 去掉px后取整
    value = Number.parseInt(value.substring(0, value.length - 2))
    value = oldValue + value + 'px'

    return value
}

// 基础的设置css方法
// TODO: 没有考虑有无px等情况
Css.setCss = function(key, value) {

    // 处理变化量的情况，需要先获取，再计算
    var change = Css.validateChange(value)
   
    if (change) {

        value = Css.calculateChange.apply(this, [key, value])    
    }

    // 处理连缀写法
    key = Css.handleSeperator(key)

    for (var i = 0, length = this.length; i < length; i++) {

        this[i].style[key] = value
    }
    
    return this
}

// 基础的getCss方法
// TODO: 没有考虑驼峰、浏览器私有前缀和css优先级问题
// TODO: 仅支持连缀写法
Css.getCss = function(key) {

    var value = null
    var node = null
    
    // 只返回第一个对象的值   
    node = this[0]
    
    // IE 8 supoort, Opera
    if (!node.currentStyle) {

        value = global.getComputedStyle(node, false).getPropertyValue(key)

    } else {

        value = node.currentStyle[key]
    }

    return value
}

// 对外暴露的接口，$.fn.css
Css.init = function(key, value) {

    var returnValue = null

    if (value === undefined) {
   
        // 这里要将this向下传递
        returnValue = Css.getCss.call(this, key)
    
    } else {
    
        returnValue = Css.setCss.call(this, key, value)
    }

    return returnValue
}

// 获取当前对象的绝对位置
// position和offset不同，需要分开计算。position是相对定位框，不是body
Css.position = function() {

    var top = Number.parseInt(Css.init.call(this, 'top')),
        left = Number.parseInt(Css.init.call(this, 'left')),
        right = Number.parseInt(Css.init.call(this, 'right')),
        bottom = Number.parseInt(Css.init.call(this, 'bottom'))

    top = top + Number.parseInt(Css.init.call(this, 'margin-top'))
    left = left + Number.parseInt(Css.init.call(this, 'margin-left'))
    right = right + Number.parseInt(Css.init.call(this, 'margin-right'))
    bottom = bottom + Number.parseInt(Css.init.call(this, 'margin-bottom'))

    return {
        top: top,
        right: right,
        bottom: bottom,
        left: left
    }
}

// 获取元素的offset
Css.offset = function() {

    var offsetParent = $(this[0].offsetParent),
        offset = {
            top: offsetTop = this[0].offsetTop,
            left: this[0].offsetLeft
        },
        
        parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? {
            top: 0,
            left: 0
        } : offsetParent.offset()
    
    // offset.top += Number.parseInt(Css.init.call(this, 'margin-top'))
    // offset.left += Number.parseInt(Css.init.call(this, 'margin-left'))

    parentOffset.top += Number.parseInt(Css.init.call(offsetParent, 'border-top-width'))
    parentOffset.left += Number.parseInt(Css.init.call(offsetParent, 'border-left-width'))
    
    return {
        top: offset.top - parentOffset.top,
        left: offset.left - parentOffset.left
    }
}
/**
 * 2015.5.30
 * 创建模块
 * 添加setCss方法 
 * 添加getCss方法
 * 添加init方法，优化了setCss
 * 2015.6.1
 * 修改了getCss，将dom.style替换成global.getComputedStyle
 * 添加了validateChange函数，用来判断传入的value是否是变化量
 * 修改了setCss，增加了变化量判断流程
 * 修改了setCss，修改了变化量的处理，暂时跑通，但缺乏对百分比的支持
 * 修改了init的返回值，get应该返回value，set则返回this
 * 2015.6.10
 * 修改了getCss，在IE 8 和 Opera上使用currentStyle代替getComputedStyle
 * 2015.6.11
 * 修改了getCss，fix bug
 * 2015.7.7
 * 增加了position方法
 * 增加了offset方法
 * 重构了validateChange方法
 */
/**
 * @name  attr.js
 * @description  属性操作模块
 * @date  2015.6.2
 * @author  sunken
 */
var Attr = {}

// 获取属性
Attr.getAttr = function(name) {

    return this[0].getAttribute(name)
}

// 设置属性
Attr.setAttr = function(name, value) {

    for (var i = 0; i < this.length; i++) {

        this[i].setAttribute(name, value)
    }

    return this
}

Attr.hasAttr = function(name) {}

Attr.removeAttr = function(name) {}

Attr.init = function(name, value) {

    var returnValue = null

    if (value === undefined) {

        returnValue = Attr.getAttr.call(this, name)

    } else {

        returnValue = Attr.setAttr.call(this, name, value)
    }

    return returnValue
}

// 为dom节点的className属性追加其他name
// TODO: 急需重构
Attr.addClass = function(name) {

    var hasClass = false

    for (var i = 0; i < this.length; i++) {

        var className = this[i].className

        // 如果没有class，直接赋值
        if (!className) {

            this[i].className = name

        } else {

            className = className.split(' ')

            for (var j = 0; j < className.length; j++) {

                // 如果已经包含，不重复添加
                if (className[j] === name) {

                    hasClass = true

                    break
                }
            }

            // 如果没有重名class，进行赋值
            if (hasClass === false) {

                this[i].className = this[i].className + ' ' + name

            } else {

                // 重置hasClass
                hasClass = false
            }
        }
    }

    return this
}

Attr.removeClass = function(name) {

    for (var i = 0; i < this.length; i++) {

        var classes = this[i].className.split(' ')

        for (j = 0; j < classes.length; j++) {

            if (classes[j] === name) {

                classes.splice(j, 1)

                break
            }
        }

        this[i].className = classes.join(' ')
    }

    return this
}

// 判断dom节点是否包含class
Attr.hasClass = function(name) {

    var target = this[0]

    var classes = target.className.split(' ')

    for (var i = 0; i < classes.length; i++) {

        if (classes[i] === name) {

            return true
        }
    }

    return false
}

Attr.toggleClass = function(name) {

    for (var i = 0; i < this.length; i++) {

        var target = this[i]

        var classes = target.className.split(',')

        for (var j = 0; j < classes.length; j++) {

            if (classes[j].trim() === name) {

                classes.splice(j, 1)

                break
            
            } else if (j === classes.length) {

                classes.push(name)
            }
        }   // end for

        this[i].className = classes.join(' ')
    }   // end for

    return this
}


Attr.replaceClass = function(name, value) {

    for (var i = 0; i < this.length; i++) {

        var target = this[i]

        var classes = target.className.split(',')

        for (var j = 0; j < classes.length; j++) {

            if (classes[j].trim() === name) {

                classes[j] = value

                break
            }
        }   // end for

        this[i].className = classes.join(' ')
    }   // end for

    return this
}


/**
 * 2015.6.2
 * 创建模块
 * 增加了getAttr、setAttr和init
 * 测试通过
 * 2015.6.10
 * 增加了addClass、removeClass
 * 2015.6.14
 * 增加了hasClass
 * 2015.6.24
 * 增加了replaceClass方法
 * 增加了toogleClass方法
 */

/**
 * @name  route.js
 * @description  路由模块
 * @date  2015.5.21
 * @author  sunken
 */
var Route = {}

Route.hash = null

// 根据当前url返回hash，并处理history
Route.getHash = function() {

    var hash = window.location.hash
    var index = hash.indexOf('?')

    // TODO: 去掉hash尾部的条件，弊端是条件变化页面不会刷新
    if (index !== -1) {

        hash = hash.substring(0, index)
    }

    var history = window.history
    // 去掉url前面的#!
    hash = hash.replace('#!', '')
    // 记录hash，以便后面的set方法中调用
    Route.hash = hash

    // 将去掉#!后的url显示在地址栏中
    // TODO: 开启debug模式时不使用
    // if (W3C) {
    //     history.replaceState(null, null, hash)
    // }
    return hash
}
// 模块加载的入口
Route.load = function(routes) {

    // 路由没有匹配，跳转到otherwise
    if (routes === undefined) {
        window.location.href = Route.otherwise
    }

    // 先重置页面不需要的css
    Route.resetCss()

    // 这里要保证前面的加载完成，尤其是css完成才能加载file，类似于promise
    Route.loadCss(routes.css)
}

// 清除当前页面不需要的css、js
Route.resetCss = function() {

    var doms = $('link')

    for (var i = 0; i < doms.length; i++) {

        var type = doms.eq(i).attr('data-type')

        if (type !== 'common') {
            doms.eq(i).remove()
        }
    }
}

// 重置模块加载状态
Route.resetStatus = function() {
    Route.cssReady = false
    Route.jsReady = false
    Route.hash = null
}

// 加载页面模板代码
Route.loadTemplate = function(url) {

    Http.get(url, function(data) {
        var view = $('#fs-view')
        var hash = Route.routes[Route.hash]
        
        // 加载成功之后，将data复制到view中
        $('#fs-view').html(data)
        
        Route.loadJs(hash['js'], hash)
        Route.setTitle(hash['title'])
    })
}

// 加载js文件
Route.loadJs = function(path, hash) {

    function callback() {

        Route.jsReady = true
        // 重置模块加载状态
        Route.resetStatus()

        if (hash['callback'] !== undefined) {
            hash['callback'].call(this, hash['js'])
        }
    }

    // 如果没有声明js，直接执行回调
    if (path === undefined) {
        
        callback.call(null)
        
        return
    }

    Http.getScript(path, callback)
}

// 重置页面的标题
Route.setTitle = function(title) {

    if (title !== undefined) {
        document.title = title
    }
}

// 根据Route.routes加载css
// TODO: loadCss和loadJs的结构相似
Route.loadCss = function(arr) {

    var cssReady = 0,
        isArray = arr instanceof Array

    var callback = function() {

        cssReady += 1

        if (arr === undefined 
            || (isArray && cssReady === arr.length) 
            || !isArray) {

            var hash = Route.routes[Route.hash]
            
            Route.loadTemplate(hash['template'])
        }
    }

    // 如果没有声明css，直接执行回调
    if (arr === undefined) {

        callback.call(null)

        return
    }

    // 判断css是否是数组
    if (isArray) {

        for (var i = 0; i < arr.length; i++) {

            Http.getCss(arr[i], callback)
        }
    // 直接调用Http.getCss 
    } else {

        Http.getCss(arr, callback)
    }
}
// TODO: provider可以考虑改成类
Route.provider = function(paths) {

    var provider = this,
        routes = {}

    var hashChange = function() {

        var hash = Route.getHash()
        // 在这里分析routes，然后分别调用加载
        var routes = Route.routes[hash]

        console.log(hash)

        Route.load(routes)
    }

    this.when = function(path, route) {
        // TODO: path需要支持数组形式
        if (path instanceof Array) {

            for (var i = 0; i < path.length; i++) {
                var key = path[i]

                routes[key] = route
            }

        } else {

            routes[path] = route
        }

        return provider
    }
    
    // 路由的配置必须由otherwise结尾，该方法负责注册路由规则和激活hashchange事件
    this.otherwise = function(path) {
        // 这里使用的routes是provider的私有变量
        Route.otherwise = path

        return provider
    }

    this.scan = function() {

        Route.routes = routes
        // 激活hashChange事件
        $(window).on('hashchange', hashChange)

        // 首次访问页面的处理
        ! function() {

            hashChange.call(null)
        } ()


        /*
        // 处理url直接访问的加载情况
        // TODO: 这里的代码和hashChange中的重复
        ! function() {
            var hash = Route.getHash()
            // 在这里分析routes，然后分别调用加载
            var routes = Route.routes[hash]
            Route.load(routes)
        }()
        */
    }

    return this
}
/**
 * 2015.5.21
 * 增加了Route模块
 * 增加了hashChange事件，when和otherwise方法
 * 2015.6.2
 * 修改了hashchange
 * 2015.6.3
 * 增加了resetResource函数
 * 2015.6.8
 * 修改了getHash和when，IE 8测试通过
 * 2015.6.9
 * 修改了loadCss和loadJs，现在when函数的css和js变成了可选项
 * 修改了loadCss，在callback中重置了页面标题
 * 增加了Route.templateReady，让加载流程变成线性
 * 2015.6.11
 * resetResource更名为resetCss，不再处理js
 * 2015.6.13
 * 修改了loadJs：
 * 1. 在加载结束后会调用hash中的callback
 * 2. 取消了js的数组写法，只能保留唯一入口
 * 修改了provider，将路由激活的逻辑放到了scan中
 * 2015.6.24
 * 修改了route模块的调用方式，不再对外暴露Route对象
 * 2015.7.7
 * 调整了整个模块的格式，修改了scan，自运行直接调用hashChange
 */
/**
 * @name  animate.js
 * @description  动画模块
 * @date  2015.6.5
 * @author  xiaoer
 */

var Animate = {}



// 支持的变化属性，及默认单位
Animate.supports = {
    'width': 'px',
    'height': 'px',
    'top': 'px',
    'left': 'px',
    'right': 'px',
    'bottom': 'px',
    'opacity': ''
    // 'transform': 'deg'
}

// 动画类
function Animation(target, params, duration, callback) {

    var start = new Date()

    var step = 0,           // 当前步数
        fps = 60,           // fps
        times = null        // 循环次数

    // var duration = 1000     // 动画时间
    var frame = 13          // magic number: 15毫秒为一帧

    // duration *= 0.85

    // 过滤初始值
    var filter = Animate.paramFilter(params)
    var keys = filter.keys

    params = filter.params

    // TODO: 没有对param进行处理
    var begin = Animate.getBegins.call(target, params, keys),
        end = params,
        now = begin,
        distances = Animate.getDistance(begin, end, duration, frame)

    // 动画执行次数
    times = Math.ceil(duration / frame)

    // 记录当前动画的执行状态
    target.data('isAnimated', true)

    var stepStart = new Date()

    // 执行动画
    var wait = setInterval(function() {
        
        var currentFrame = new Date() - stepStart
        stepStart = new Date()

        // 最后一帧
        if (step === times) {

            var end = new Date() - start

            // 测试时间
            console.log('end time: ' + end)

            clearInterval(wait)

        } else {

            for (var i = 0; i < target.length; i++) {

                for (var j = 0; j < keys.length; j++) {

                    var key = keys[j]
                    var value = now[i][key] + distances[i][j]

                    // 如果是最后一步，纠正误差
                    if (step === times - 1) {

                        value = Number.parseFloat(params[key])
                    }
                
                    var unit = Animate.supports[key]

                    // 重置当前数值
                    now[i][key] = value

                    // 根据key处理value
                    // 处理特殊值
                    if (key === 'rotate') {

                        key = 'transform'
                        value = 'rotate(' + value + unit + ')'

                        // TODO: 如果加入rotate、scale等，在getBegins和getDistance里面，也要做特殊处理
                        // console.log('rotate')
                        // console.log(key)
                        // console.log(value)
                        // console.log(now[i][key])
                        // console.log(distances[i][j])
                    // 处理常规值：width、height、left、top、bottom、right
                    } else {

                        // 补上单位
                        value = value + unit    
                    }

                    target.eq(i).css(key, value)
                }
            }

            // 步数 + 1
            step = step + 1
        }

        var stepStop = new Date - stepStart

    }, frame)

    return target
}





// 当前动画的key集合
//Animate.keys = []

// 返回初始值的数组
// TODO: getBegin应该能处理一组参数，数组里面存动画对象
// TODO: 动画不精确，因为使用了float，最后一步要进行纠正，不能按照distance来走

// 计算初始值
Animate.getBegins = function(params, keys) {

    var begins = []

    // 遍历params进行遍历
    for (var i = 0; i < this.length; i++) {

        var params = {}
        var obj = this.eq(i)

        for (var j = 0; j < keys.length; j++) {

            var key = keys[j]

            params[key] = Number.parseFloat(obj.css(key))
        }

        begins.push(params)
    }

    return begins
}

// 计算步长
Animate.getDistance = function(begin, end, duration, frame) {

    var distances = []

    // begin是数组，end是值
    for (var i = 0; i < begin.length; i++) {

        var changes = []

        // begin是一个对象数组，需要遍历计算
        for (var k in begin[i]) {

            // 结束值 - 初始值 / 帧频
            changes.push((Number.parseFloat(end[k]) - begin[i][k]) / (duration / frame))
        }

        distances.push(changes)
    }

    return distances
}

// 过滤初始值
Animate.paramFilter = function(params) {

    // 过滤params，同时补全单位
    // 整理后的animate key
    var keys = []

    // 使用for in 遍历params
    for (var k in params) {

        if (Animate.supports[k] === undefined) {
            
            delete params[k]

        } else {
            keys.push(k)
        }
    }

    // Animate.keys = keys

    return {
        params: params,
        keys: keys
    }
}

// 对外暴露的接口
Animate.init = function(params, duration, callback) {

    return new Animation(this, params, duration, callback)
}



/**
 * 2015.6.5
 * 创建模块
 * 2015.6.15 重写动画模块
 * 2015.6.18 初步测试可用，与上个版本功能一致
 * 2015.6.22
 * 修改了supports，增加了opacity
 * 修改了paramFilter，fix bug：判断Animate.supports[k]应该使用undefined
 */
 


/**
 * @name  extend.js
 * @description  此文件用来向命名空间注册api
 * @date  2015.05.12
 * @author  sunken
 */

// Fishbone对象扩展，
mix($, {

    mix: mix,
    get: Http.get,
    ajax: Http.ajax,
    jsonp: Http.jsonp,
    route: Route.provider,
    create: create,
    imgReady: imgReady,
    // on: Event.on,
    // live: Event.live,
    
    module: Module.init,
    component: Module.component.init
})

mix($.fn, {
    on: Event.on,
    off: Event.off,
    live: Event.live,
    ready: Event.ready,
    css: Css.init,
    position: Css.position,
    offset: Css.offset,
    attr: Attr.init,
    addClass: Attr.addClass,
    removeClass: Attr.removeClass,
    hasClass: Attr.hasClass,
    replaceClass: Attr.replaceClass,

    val: Node.val,
    first: Node.first,
    last: Node.last,
    eq: Node.eq,
    remove: Node.remove,
    html: Node.html,
    text: Node.text,
    clone: Node.clone,
    append: Node.append,
    appendTo: Node.appendTo,
    prepend: Node.prepend,
    find: Node.find,
    index: Node.index,
    width: Node.width,
    height: Node.height,
    parent: Node.parent,
    next: Node.next,
    prev: Node.prev,
    show: Node.show,
    hide: Node.hide,

    data: Data.init,
    animate: Animate.init
})
/**
 * 2015.5.12 创建extend
 */

    
/**
 * @name  _outro.js
 * @description 框架的结尾
 * @date 2015.5.20
 */


    global.$ = global.Fishbone = $

} (window, window.document)