/**
 * Extended array without modifying Array.prototype.
 * The idea is taken from http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/ .
 *   - Prototype chain injection if __proto__ is supported
 *   - Direct property injection otherwise (slower)
 **/

[ 'GNN', function(global) {
    var ns = this.pop();
    var T = global[ns];
    var B = T.Base;

    var toA = function(a){ return Array.prototype.slice.call(a); };
    var addProperties = function(obj, props) {
        B.addProperties(obj, props, { configurable: true });
    };

    ////////////////////////////////////
    // extended array

    var A;
    A = T.Array = function Array() {
        var self = arguments.length===1 && (typeof arguments[0] == 'number') ?
                new Array(arguments[0]) : toA(arguments);
        return B.setProto(self, A.prototype, function(obj, proto) {
            B.addInterface(obj, A.methods, function(a, b, k) {
                return A.prototype[k];
            });
            addProperties(obj, A.properties);
            addProperties(obj, A.privateProperties);
        });
    };

    // exceptions
    A.ArgumentError = function(msg) {
        this.name = 'ArgumentError';
        this.message = msg || '';
    };
    A.ArgumentError.prototype = new Error();
    A.ArgumentError.prototype.constructor = A.ArgumentError;
    A.IndexError = function(msg) {
        this.name = 'IndexError';
        this.message = msg || '';
    };
    A.IndexError.prototype = new Error();
    A.IndexError.prototype.constructor = A.IndexError;

    // methods
    A.methods = {
        // JavaScript 1.6 and 1.8 features
        indexOf: function(elt, from) {
            var o = this;
            var len = o.length >>> 0;
            if (len === 0) return -1;
            var n = 0;
            if (typeof from != 'undefined') {
                n = Number(from);
                if (n !== n) {
                    n = 0;
                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) return -1;
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            if (from < 0) from += len;
            for (; k < len; k++) {
                if (k in o && o[k] === elt) return k;
            }
            return -1;
        },
        lastIndexOf: function(elt, from) {
            var o = this;
            var len = o.length >>> 0;
            if (len === 0) return -1;
            var n = len;
            if (typeof from != 'undefined') {
                n = Number(from);
                if (n !== n) {
                    n = 0;
                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            var k = n >= 0 ? Math.min(n, len-1) : len - Math.abs(n);
            for (; k >= 0; k--) {
                if (k in o && o[k] === elt) return k;
            }
            return -1;
        },
        filter: function(fun, thisp) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != "function") {
                throw new TypeError('filter: not a function');
            }
            var rv = [];
            for (var i=0; i < len; i++) {
                if (i in o) {
                    var val = o[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, o)) rv.push(val);
                }
            }
            return rv;
        },
        forEach: function(fun, thisp) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != 'function') {
                throw new TypeError('forEach: not a function');
            }
            for (var i=0; i < len; i++) {
                if (i in o) fun.call(thisp, o[i], i, o);
            }
        },
        every: function(fun, thisp) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != 'function') {
                throw new TypeError('every: not a function');
            }
            for (var i=0; i < len; i++) {
                if (i in o && !fun.call(thisp, o[i], i, o)) return false;
            }
            return true;
        },
        map: function(fun, thisp) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != 'function') {
                throw new TypeError('map: not a function');
            }
            var rv = new Array(len);
            for (var i=0; i < len; i++) {
                if (i in o) rv[i] = fun.call(thisp, o[i], i, o);
            }
            return rv;
        },
        some: function(fun, thisp) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != "function") {
                throw new TypeError('some: not a function');
            }
            for (var i=0; i < len; i++) {
                if (i in o && fun.call(thisp, o[i], i, o)) return true;
            }
            return false;
        },
        reduce: function(fun, initial) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != 'function') {
                throw new TypeError('reduce: not a function ');
            }
            var i = 0;
            var prev;
            var rv;
            if (typeof initial != 'undefined') {
                rv = initial;
            } else {
                do {
                    if (i in o) {
                        rv = o[i++];
                        break;
                    }
                    if (++i >= len) {
                        throw new TypeError('reduce: empty array');
                    }
                } while (true);
            }
            for (; i < len; i++) {
                if (i in o) rv = fun.call(null, rv, o[i], i, o);
            }
            return rv;
        },
        reduceRight: function(fun, initial) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != "function") {
                throw new TypeError('reduceRight: not a function');
            }
            var i = len - 1;
            var rv;
            if (typeof initial != 'undefined') {
                rv = initial;
            } else {
                do {
                    if (i in o) {
                        rv = o[i--];
                        break;
                    }
                    if (--i < 0) {
                        throw new TypeError('reduceRight: empty array');
                    }
                } while (true);
            }
            for (; i >= 0; i--) {
                if (i in o) rv = fun.call(null, rv, o[i], i, o);
            }
            return rv;
        },

        // more extensions
        tap: function(fun) {
            if (typeof fun != "function") {
                throw new TypeError('tap: not a function');
            }
            fun.call(this, this);
            return this;
        },
        zmap: function(fun, objs) {
            if (typeof fun != 'function') fun = Array;

            objs = toA(arguments);
            objs[0] = this;
            var alen = objs.length;
            var length = 0;
            for (var j=0; j < alen; j++) {
                var l = objs[j].length;
                if (length < l) length = l;
            }

            var rv = [];
            for (var i = 0; i < length; i++) {
                var args = [];
                for (var j=0; j < alen; j++) {
                    args.push(objs[j][i]);
                }
                rv.push(fun.apply(null, args));
            }
            return rv;
        },
        find: function(fun, ifnone) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != "function") {
                var obj = fun;
                fun = function(x){ return x === obj; };
            }
            for (var i=0; i < len; i++) {
                if (i in o && fun.call(null, o[i], i, o)) return o[i];
            }
            return ifnone;
        },
        findLast: function(fun, ifnone) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != "function") {
                var obj = fun;
                fun = function(x){ return x === obj; };
            }
            for (var i=len-1; 0 <= i; i--) {
                if (i in o && fun.call(null, o[i], i, o)) return o[i];
            }
            return ifnone;
        },
        groupBy: function(fun, thisp) {
            if (typeof fun != "function") {
                throw new TypeError('groupBy: not a function');
            }
            var o = this;
            var len = o.length;
            var rv = {};
            for (var i=0; i < len; i++) {
                var k = fun.call(thisp, o[i], i, o);
                if (!rv[k]) rv[k] = [];
                rv[k].push(o[i]);
            }
            return rv;
        },
        flatten: function() {
            var s = toA(arguments[0] || []); //dup
            for (var i=0; i < s.length; i++) {
                if (s[i] == this) {
                    var msg = 'flatten: tried to flatten a recursive array';
                    throw new A.ArgumentError(msg);
                }
            }
            s.push(this);

            var o = this;
            var len = o.length;
            var rv = [];
            for (var i=0; i < len; i++) {
                var x = o[i];
                var args = (x instanceof Array) ? A.flatten(x, s) : [x];
                rv.push.apply(rv, args);
            }
            return rv;
        },

        // syntactic sugars
        at: function(i){ return this[i]; },
        fetch: function(i, ifnone) {
            if (i in this) {
                return this[i];
            } else if (arguments.length >= 2) {
                return ifnone;
            } else {
                var msg = 'fetch: index '+i+'out of range';
                throw new A.IndexError(msg);
            }
        },
        store: function(i, val) {
            this[i] = val;
            return this;
        },
        zip: function(objs) {
            return A.zmap.apply(null, [ this, null ].concat(toA(arguments)));
        },
        compact: function() {
            return A.filter(this, function(x){ return x!=null; });
        },
        member: function(obj){ return A.indexOf(this, obj) >= 0; },
        isEmpty: function(){ return this.length == 0; },
        clone: function(){ return Array.apply(null, this); }
    };

    // properties
    A.properties = {
        first: {
            get: function(){ return this[0]; },
            set: function(v){ this[0]=v; }
        },
        last: {
            get: function(){ return this[this.length-1]; },
            set: function(v){ this[this.length-1]=v; }
        }
    };
    A.privateProperties = {
        _isExtendedArray: { value: A }
    };

    // merge methods to the prototype
    B.addInterface(A.prototype, A.methods, Array.prototype);
    addProperties(A.prototype, A.properties);
    addProperties(A.prototype, A.privateProperties);
    B.setProto(A.prototype, Array.prototype);

    // translate return value
    A._preserveReturnValue = [
        'concat', 'slice',
        'map', 'filter',
        'zmap', 'flatten', 'zip', 'compact', 'clone',
    ];
    var installArrayWrapper = function(k) {
        if (!k) return;
        var fun = Array.prototype[k] || A.prototype[k];
        B.addProperty(A.prototype, k, {
            configurable: true,
            writable: true,
            value: function() {
                var r = fun.apply(this, arguments);
                if (r instanceof Array && !(r instanceof A) && r !== this) {
                    r = A.apply(null, r);
                }
                return r;
            }
        });
    };
    for (var i=0; i < A._preserveReturnValue.length; i++) {
        installArrayWrapper(A._preserveReturnValue[i]);
    }

    // enable A.method(arrayLike, ...) form
    B.fmerge(function(a, b, k) {
        var fun = Array.prototype[k] || A.methods[k];
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            return fun.apply(thisp, args);
        };
    }, A, A.methods);
    B.fmerge(function(a, b, k) {
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            var r;
            if (args.length > 0 && b.set) r = b.set.apply(thisp, args);
            if (b.get) return b.get.call(thisp);
            return r;
        };
    }, A, A.properties);

    // class methods
    A.isExtendedArray = function(arrayLike) {
        return (arrayLike||{})._isExtendedArray == A;
    };
    A.fromArray = function(arrayLike){ return A.apply(null, arrayLike); };
    A.extend = function(prototype) {
        B.addInterface(prototype, A.methods);
        addProperties(prototype, A.properties);
        addProperties(prototype, A.privateProperties);
        return prototype;
    };

    ////////////////////////////////////
    // associative array

    var AA;
    AA = T.AssocArray = A.Assoc = function() {
        var self = arguments.length===1 && (typeof arguments[0] == 'number') ?
                new A(arguments[0]) : A.fromArray(arguments);
        return B.setProto(self, AA.prototype, function(obj, proto) {
            B.addInterface(obj, AA.methods);
            addProperties(obj, AA.privateProperties);
        });
    };

    // methods
    AA.methods = {
        assoc: function(key) {
            return A.find(this, function(x){ return x[0]===key; });
        },
        rassoc: function(key) {
            return A.findLast(this, function(x){ return x[0]===key; });
        },
        assocv: function(key){ return (AA.assoc(this, key) || [])[1]; },
        rassocv: function(key){ return (AA.rassoc(this, key) || [])[1]; },
        toHash: function(){ /* TODO */ }
    };

    // properties
    AA.privateProperties = {
        _isAssocArray: { value: AA }
    };

    // merge methods to the prototype
    B.addInterface(AA.prototype, AA.methods);
    addProperties(AA.prototype, AA.privateProperties);
    B.setProto(AA.prototype, A.prototype);

    // enable AA.method(arrayLike, ...) form
    B.fmerge(function(a, b, k) {
        var fun = AA.methods[k];
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            return fun.apply(thisp, args);
        };
    }, AA, AA.methods);

    // class methods
    AA.isAssocArray = function(arrayLike) {
        return !!(arrayLike||{})._isAssocArray;
    };
    AA.fromArray = function(arrayLike){ return AA.apply(null, arrayLike); };
    AA.extend = function(prototype) {
        B.addInterface(prototype, AA.methods);
        addProperties(prototype, AA.privateProperties);
        return prototype;
    };
} ].reverse()[0](this);
