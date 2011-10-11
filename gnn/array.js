(function(T /* top level */, B /* Base */) {
    var A;
    var toA = function(a){ return Array.prototype.slice.call(a); };
    A = T.Array = function() {
        var self = arguments.length == 1 && (arguments[0] instanceof Number) ?
                new Array(arguments[0]) : toA(arguments);
        return B.setProto(self, A.prototype, function(obj, proto) {
            B.merge(obj, proto);
            B.addProperties(obj, A.properties);
        });
    };
    var Ap = A.prototype;

    // extensions
    A.interfaces = {
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
            var len = t.length >>> 0;
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
                if (i in t) {
                    var val = t[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, t)) rv.push(val);
                }
            }
            return rv;
        },
        forEach: function(fun, thisp) {
            var o = this;
            var len = this.length >>> 0;
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
                throw TypeError('reduce: not a function ');
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
                    throw new TypeError(msg);
                }
            }
            var o = this;
            var len = o.length;
            var rv = [];
            for (var i=0; i < len; i++) {
                var x = o[i];
                var args = (x instanceof Array) ? Ap.flatten.call(x, s) : [x];
                rv.push.apply(rv, args);
            }
            return rv;
        },
        // TODO: match?

        // TODO: move to separate class
        // TODO: add toHash method
        // associative array
        assoc: function(key) {
            return Ap.find.call(this, function(x){ return x[0]===key; });
        },
        rassoc: function(key) {
            return Ap.findLast.call(this, function(x){ return x[0]===key; });
        },
        assocv: function(key){ return (Ap.assoc.call(this, key) || [])[1]; },
        rassocv: function(key){ return (Ap.rassoc.call(this, key) || [])[1]; },

        // syntactic sugars
        zip: function(objs) {
            return Ap.zmap.apply(this, [ null ].concat(toA(arguments)));
        },
        compact: function() {
            return Ap.filter.call(this, function(x){ return x!=null; });
        },
        member: function(obj){ return Ap.indexOf.call(this, obj) >= 0; },
        clone: function(){ return Array.apply(null, this); }
    };

    // additional properties
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

    // merge interfaces to the prototype
    B.fmerge(function(a, b, k) {
        if (!B.isDefined(Array.prototype[k])) return b;
    }, A.prototype, A.interfaces);
    B.addProperties(A.prototype, A.properties);
    B.setProto(A.prototype, Array.prototype);

    // translate return value
    var newArrayMethods = [
        'concat', 'slice',
        'map', 'filter',
        'zmap', 'flatten', 'zip', 'compact', 'clone',
    ];
    var installArrayWrapper = function(k) {
        var fun = Array.prototype[k] || A.prototype[k];
        A.prototype[k] = function() {
            var r = fun.apply(this, arguments);
            if (r instanceof Array && !(r instanceof A) && r !== this) {
                r = A.apply(null, r);
            }
            return r;
        };
    };
    for (var i=0; i < newArrayMethods.length; i++) {
        if (!newArrayMethods[i]) break;
        installArrayWrapper(newArrayMethods[i]);
    }

    // enable A.method(arrayLike, ...) form
    B.fmerge(function(a, b, k) {
        var fun = Array.prototype[k] || A.interfaces[k];
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            return fun.apply(thisp, args);
        };
    }, A, A.interfaces);
    B.fmerge(function(a, b, k) {
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            var r;
            if (args.length > 0 && b.set) r = b.set.apply(thisp, args);
            if (b.get) return b.get.call(thisp);
            return r;
        };
    }, A, A.properties);

    A.fromArray = function(arrayLike){ return A.apply(null, arrayLike); };

    A.extend = function(prototype) {
        B.fmerge(function(a, b, k) {
            if (!B.isDefined(a)) return b;
        }, prototype, A.interfaces);
        B.addProperties(prototype, A.properties);
        return prototype;
    };
})(GNN, GNN.Base);
