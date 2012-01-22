[ 'GNN', function(global) {
    var ns = this.pop();
    var T = global[ns];
    var B = T.Base;

    var toA = function(a){ return Array.prototype.slice.call(a); };
    var addProperties = function(obj, props) {
        B.addProperties(obj, props, { configurable: true });
    };

    ////////////////////////////////////
    // hash table

    var H;
    H = T.Hash = function Hash(hashLike) {
        if (arguments.length > 0 && arguments.length % 2 == 0) {
            hashLike = toA(arguments);
        }
        if (T.AssocArray && T.AssocArray.isAssocArray(hashLike)) {
            var hash = {};
            hashLike.forEach(function(x){ hash[x[0]] = x[1]; });
            hashLike = hash;
        } else if (hashLike instanceof Array && hashLike.length % 2 == 0) {
            var hash = {};
            for (var i=0; i < hashLike.length; i+=2) {
                hash[hashLike[i]] = hashLike[i+1];
            }
            hashLike = hash;
        }

        var self = hashLike || this;
        if (!(self instanceof H)) {
            return B.setProto(self, H.prototype, function(obj, proto) {
                B.addInterface(obj, H.methods, function(a, b, k) {
                    return H.prototype[k];
                });
                addProperties(obj, H.properties);
                addProperties(obj, H.privateProperties);
            });
        }
        return self;
    };

    // exceptions
    H.IndexError = function(msg) {
        this.name = 'IndexError';
        this.message = msg || '';
    };
    H.IndexError.prototype = new Error();
    H.IndexError.prototype.constructor = H.IndexError;

    // methods
    H.methods = {
        // array-like interface
        indexOf: function(val) {
            var o = this;
            for (var k in o) {
                if (o[k] === val) return k;
            }
        },
        filter: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('filter: not a function');
            }
            return B.fmerge(function(ignore, val, k) {
                if (fun.call(thisp, k, val, o)) return val;
            }, null, o);
        },
        forEach: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('forEach: not a function');
            }
            B.fmerge(function(ignore, val, k) {
                fun.call(thisp, k, val, o);
            }, null, o);
        },
        every: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('every: not a function');
            }
            for (var k in o) {
                if (!fun.call(thisp, k, o[k], o)) return false;
            }
            return true;
        },
        map: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('map: not a function');
            }
            return B.fmerge(function(ignore, val, k) {
                return fun.call(thisp, k, val, o);
            }, null, o);
        },
        some: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('some: not a function');
            }
            for (var k in o) {
                if (fun.call(thisp, k, o[k], o)) return true;
            }
            return false;
        },
        reduce: function(fun, initial) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('reduce: not a function');
            }
            var r = initial;
            H.forEach(o, function(k, val) {
                r = fun.call(null, r, k, val, o);
            });
            return r;
        },

        // more extensions
        merge: function(objs) {
            return B.merge.apply(null, [this].concat(toA(arguments)));
        },
        find: function(fun, ifnone) {
            var o = this;
            if (typeof fun != "function") {
                var obj = fun;
                fun = function(k, v){ return v === obj; };
            }
            var o = this;
            for (var k in o) {
                if (fun.call(null, k, o[k], o)) {
                    var r = [ k, o[k] ];
                    r.key = k; r.value = o[k];
                    return r;
                }
            }
            return ifnone;
        },
        invert: function() {
            var r = {};
            H.forEach(this, function(k, v){ r[v] = k; });
            return r;
        },
        tap: function(fun) {
            if (typeof fun != "function") {
                throw new TypeError('tap: not a function');
            }
            fun.call(this, this);
            return this;
        },

        // syntactic sugars
        fetch: function(k, ifnone) {
            if (k in this) {
                return this[k];
            } else if (arguments.length >= 2) {
                return ifnone;
            } else {
                var msg = 'fetch: key "'+k+'" not found';
                throw new H.IndexError(msg);
            }
        },
        store: function(k, v) {
            this[k]=v;
            return this;
        },
        isEmpty: function(){ return H.size(this) == 0; },
        clone: function(){ return H.merge({}, this); },
        member: function(k){ return H.indexOf(this, k) != null; },

        // conversions
        toArray: function() {
            var rv = [];
            H.forEach(this, function(k, v){ rv.push([ k, v ]); });
            return rv;
        }
    };

    // properties
    H.properties = {
        keys: { get: function() {
            var rv = [];
            H.forEach(this, function(k, v){ rv.push(k); });
            return rv;
        } },
        values: { get: function() {
            var rv = [];
            H.forEach(this, function(k, v){ rv.push(v); });
            return rv;
        } },
        size: { get: function(){ return H.keys(this).length; } },
        length: { get: function(){ return H.size(this); } }
    };
    H.privateProperties = {
        _isHash: { value: H }
    };

    // merge methods to the prototype
    B.addInterface(H.prototype, H.methods);
    addProperties(H.prototype, H.properties);
    addProperties(H.prototype, H.privateProperties);

    // translate return value
    H._preserveReturnValue = [
        'map', 'filter', 'merge', 'invert', 'clone',
    ];
    var installHashWrapper = function(k) {
        if (!k) return;
        var fun = Object.prototype[k] || H.prototype[k];
        B.addProperty(H.prototype, k, {
            configurable: true,
            writable: true,
            value: function() {
                var r = fun.apply(this, arguments);
                if (!(r instanceof H) && r !== this) {
                    r = H.call(null, r);
                }
                return r;
            }
        });
    };
    for (var i=0; i < H._preserveReturnValue.length; i++) {
        installHashWrapper(H._preserveReturnValue[i]);
    }

    // enable H.method(obj, ...) form
    B.fmerge(function(a, fun, k) {
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            return fun.apply(thisp, args);
        };
    }, H, H.methods);
    B.fmerge(function(a, b, k) {
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            var r;
            if (args.length > 0 && b.set) r = b.set.apply(thisp, args);
            if (b.get) return b.get.call(thisp);
            return r;
        };
    }, H, H.properties);

    // class methods
    H.isHash = function(hashLike) {
        return (hashLike||{})._isHash == H;
    };
} ].reverse()[0](this);
