[ 'GNN', function(G) {
    var ns = this.pop();
    if (typeof G[ns] == 'undefined') G[ns] = {};

    var T = G[ns];
    var B = T.Base || {};

    ////////////////////////////////////
    // internal functions

    var toA = function(a, s, e){ return G.Array.prototype.slice.call(a,s,e); };
    var isDefined = B.isDefined || function(obj, undef){ return obj!==undef; };
    var isFun = B.isCallable || function(x){ return typeof x == 'function'; };
    var respondsTo = B.respondsTo || function(obj, name) {
        return isDefined(obj) && isFun(obj[name]);
    };
    var fmerge = B.fmerge || function(fun, a, b) {
        a = a || {}; fun = fun || function(x,y){ return y; };
        for (var p in b) b.hasOwnProperty(p) && (a[p]=fun(a[p],b[p],p)||a[p]);
        return a;
    };
    var merge = B.merge || function(a, b){ return fmerge(null, a, b); };
    var addProperty = B.addProperty || function(obj, name, d, config) {
        d = merge(merge(null, config||{}), d);
        if ('defineProperty' in Object) {
            Object.defineProperty(obj, name, d);
        } else {
            var f = { get: '__defineGetter__', set: '__defineSetter__' };
            for (var k in f) k in d && f[k] in obj && obj[f[k]](name, d[k]);
        }
        return obj;
    };
    var addProperties_ = B.addProperties || function(obj, props, config) {
        for (var k in props) addProperty(obj, k, props[k], config);
        return obj;
    };
    var addProperties = function(obj, props) {
        return addProperties_(obj, props, { configurable: true });
    };
    var addInterface = function(obj, intrfce, override) {
        var c = override ? function(){return false;} : function(k) {
            return obj[k] || ((obj.constructor||{}).prototype||{})[k];
        };
        var conf = { configurable: true, writable: true };
        for (var k in intrfce) {
            if (!intrfce[k] || c(k)) continue;
            addProperty(obj, k, merge(conf, { value: intrfce[k] }));
        }
    };

    ////////////////////////////////////
    // hash table

    var H;
    /**
        Creates a hash table.
        @class A hash table.
        @name H
        @exports H as GNN.Hash
        @param {GNN.AssocArray|object|...*} []
            If the odd number of arguments are specified,
            then the first argument must be a GNN.AssocArray or an object.
            The keys and values of the argument are copied to the hash table.
            Otherwise, the arguments must be an array.
            The <code>i</code>th element of the array is a key
            and the <code>(i+1)</code>th element of the array is the
            value associated with the <code>i</code>th key
            for every even number <code>i</code>.
        @description
            <p>Methods and property gets in <code>GNN.Hash.prototype</code>
            are also available as static methods in <code>GNN.Hash</code> with
            taking the first argument as an array. In this form, an object
            can be used as a hash.</p>
        @requires GNN.Base
        @example
new GNN.Hash({a:1, b:2, c:3});
// => Hash {a: 1, b:2, c:3}
new GNN.Hash(new GNN.AssocArray(['a', 1], ['b', 2], ['c': 3]));
// => Hash {a: 1, b:2, c:3}
new GNN.Hash('a', 1, 'b', 2, 'c', 3);
// => Hash {a: 1, b:2, c:3}
    */
    H = T.Hash = function Hash(hashLike) {
        var self = this;
        if (!(self instanceof H)) self = new H();

        if (arguments.length > 0 && arguments.length % 2 == 0) {
            hashLike = toA(arguments);
        }
        if (T.AssocArray && T.AssocArray.isAssocArray(hashLike)) {
            hashLike.forEach(function(x){ self[x[0]] = x[1]; });
        } else if (hashLike instanceof Array && hashLike.length % 2 == 0) {
            for (var i=0; i < hashLike.length; i+=2) {
                self[hashLike[i]] = hashLike[i+1];
            }
        } else {
            // clone
            fmerge(function(a, b, k){ self[k] = b; }, null, hashLike);
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
    H.methods = /** @lends H.prototype */ {
        // array-like interface
        /**
            Returns a key with which the given value is associated.
            @param {*} val
            @returns {string|undefined} A key or undefined if nothing found.
            @description
                It uses <code>===</code> to check whether the two values are
                equal.
            @example
GNN.Hash({ a:1, b:2, c:3 }).indexOf(2);
// => 'b'
        */
        indexOf: function(val) {
            var o = this;
            for (var k in o) {
                if (o.hasOwnProperty(k) && o[k] === val) return k;
            }
        },
        /**
            Returns a new hash table with all elements
            that satisfy the given condition copied.
            @param {function} fun
                The conditional function of the form
                <code>function(k, v, o){ ... }</code>
                where <code>k</code> is the key of the value,
                <code>v</code> is the value, and
                <code>o</code> is the hash table.
            @param {object} [thisp=null]
                The object to use as <code>this</code> when calling
                <code>fun</code>.
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {GNN.Hash} A new hash table.
            @example
GNN.Hash({ a:1, b:2, c:3, d:4, e:5 }).filter(function(k, v){return v%2!=0;});
// => { a:1, c:3, e:5 }
        */
        filter: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('filter: not a function');
            }
            var r = {};
            fmerge(function(ignore, val, k) {
                if (fun.call(thisp, k, val, o)) r[k] = val;
            }, null, o);
            return r;
        },
        /**
            Invokes the given function once per key-value pair.
            @param {function} fun
                The function of the form
                <code>function(k, v, o){ ... }</code>
                where <code>k</code> is the key of the value,
                <code>v</code> is the value, and
                <code>o</code> is the hash table.
            @param {object} [thisp=null]
            @throws {TypeError} If <code>fun</code> is not a function.
            @example
GNN.Hash({ a:1, b:2, c:3, d:4, e:5, f:6 }).forEach(function(k, v) {
    console.log(k+v);
});
        */
        forEach: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('forEach: not a function');
            }
            fmerge(function(ignore, val, k) {
                fun.call(thisp, k, val, o);
            }, null, o);
        },
        /**
            Tests whether all the key-value pairs satisfy the condition.
            @param {function} fun
                The conditional function of the form
                <code>function(k, v, o){ ... }</code>
                where <code>k</code> is the key of the value,
                <code>v</code> is the value, and
                <code>o</code> is the hash table.
            @param {object} [thisp=null]
                The object to use as <code>this</code> when calling
                <code>fun</code>.
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {boolean}
            @example
GNN.Hash({ a:1, b:3, c:5, d:7 }).every(function(k, v) {
    return v%2==1 && k.length==1;
}); // => true
        */
        every: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('every: not a function');
            }
            for (var k in o) {
                if (o.hasOwnProperty(k) &&
                    !fun.call(thisp, k, o[k], o)) return false;
            }
            return true;
        },
        /**
            Returns a new hash table with the results of calling
            the given function on each value of the key-value pairs.
            @param {function} fun
                The function of the form
                <code>function(k, v, o){ ... }</code>
                where <code>k</code> is the key of the value,
                <code>v</code> is the value, and
                <code>o</code> is the hash table.
            @param {object} [thisp=null]
                The object to use as <code>this</code> when calling
                <code>fun</code>.
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {GNN.Hash} A new hash table.
            @description
                It stores <code>fun(k, this[k], this)</code> to the new
                hash table at key <code>k</code> for each key <code>k</code>
                in <code>this</code>.
            @example
GNN.Hash({ a:1, b:2, c:3, d:4 }).map(function(k,v){return v*v;});
// => { a:1, b:4, c:9, d:16 }
GNN.Hash({ a:1, b:2, c:3, d:4 }).map(function(k,v,o){o[k]=0;return v+k;});
// => { a:'1a', b:'2b', c:'3c', d:'4d' }
        */
        map: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('map: not a function');
            }
            var r = {};
            fmerge(function(ignore, val, k) {
                r[k] = fun.call(thisp, k, val, o);
            }, null, o);
            return r;
        },
        /**
            Tests whether some key-value pairs satisfy the condition.
            @param {function} fun
                The conditional function of the form
                <code>function(k, v, o){ ... }</code>
                where <code>k</code> is the key of the value,
                <code>v</code> is the value, and
                <code>o</code> is the hash table.
            @param {object} [thisp=null]
                The object to use as <code>this</code> when calling
                <code>fun</code>.
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {boolean}
            @example
GNN.Hash({ a:1, b:2, c:3, d:4, e:5 }).some(function(k, v){return v%2==0;});
// => true
        */
        some: function(fun, thisp) {
            var o = this;
            if (typeof fun != "function") {
                throw new TypeError('some: not a function');
            }
            for (var k in o) {
                if (o.hasOwnProperty(k) &&
                    fun.call(thisp, k, o[k], o)) return true;
            }
            return false;
        },
        /**
            Applies the given function against an accumulator and
            each key-value pair of the hash table as to reduce it to
            a single value.
            @param {function} fun
                The conditional function of the form
                <code>function(r, k, v, o){ ... }</code>
                where <code>r</code> is the value previously returned in
                the last invocation of <code>fun</code>,
                or <code>initial</code> for the first time,
                <code>k</code> is the key of the value,
                <code>v</code> is the value, and
                <code>o</code> is the hash table.
            @param {*} initial
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {*}
            @example
GNN.Hash({ a:1, b:2, c:3, d:4 }).reduce(function(r, k, v){
    return [ r[0]+k, r[1]*v ];
}, [ '', 1 ]);
// => [ 'abcd', 24 ]
        */
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
        /**
            Merges the objects into a new hash table.
            @param {...object} objs
                Zero or more objects to be merged.
            @returns {object} A new hash table.
            @see GNN.Base.fmerge
            @see GNN.Base.merge
            @example
GNN.Hash({ a:1, b:2, c:3 }).merge({ a:3 }, { d:4, e:5, c:4 }, { f:6, e:8 });
// => { a:3, b:2, c:4, d:4, e:8, f:6 }
        */
        merge: function(objs) {
            var o = {};
            fun = function(x, y){ return y; };
            objs = [this].concat(toA(arguments));
            for (var i=0; i < objs.length; i++) {
                var other = objs[i];
                if (other == null) continue;
                for (var p in other) {
                    if (!other.hasOwnProperty(p)) continue;
                    var v = fun(o[p], other[p], p);
                    if (isDefined(v)) o[p] = v;
                }
            }
            return o;
        },
        /**
            Finds the value satisfies the given condition and
            returns a key-value pair.
            @param {function|object} fun
                If <code>fun</code> is an object,
                <code>function(k,v){return v===fun;}</code> is used as a
                conditional function.
                Otherwise, <code>fun</code> is the conditional function of
                the form
                <code>function(k, v, o){ ... }</code>
                where <code>k</code> is the key of the value,
                <code>v</code> is the value, and
                <code>o</code> is the hash table.
            @param {*} [ifnone]
            @returns {*}
                A key-value pair in an array with properties 'key' for the
                key and 'value' for the value if it is found.
                <code>ifnone</code> otherwise.
            @example
GNN.Hash({ a:1, bb:2, c:3 }).find(function(k, v){return k.length > 1;});
// => [ 'bb', 2 ]
GNN.Hash({ a:1, bb:2, c:3 }).find(function(k, v){return k.length > 1;}).key;
// => 'bb'
        */
        find: function(fun, ifnone) {
            var o = this;
            if (typeof fun != "function") {
                var obj = fun;
                fun = function(k, v){ return v === obj; };
            }
            var o = this;
            for (var k in o) {
                if (o.hasOwnProperty(k) && fun.call(null, k, o[k], o)) {
                    var r = [ k, o[k] ];
                    r.key = k; r.value = o[k];
                    return r;
                }
            }
            return ifnone;
        },
        /**
            Returns a new hash table with all the key-value pairs inverted.
            @returns {GNN.Hash} A new hash table.
            @example
GNN.Hash({ a:1, b:2, c:3 }).invert();
// => { '1': 'a', '2': 'b', '3': 'c' }
GNN.Hash({ a:[1,2], b:[2,3], c:[3,4] }).invert();
// => { '1,2': 'a', '2,3': 'b', '3,4': 'c' }
        */
        invert: function() {
            var r = {};
            H.forEach(this, function(k, v){ r[v] = k; });
            return r;
        },
        /**
            Calls the given function with passing <code>this</code> and
            returns <code>this</code>.
            @param {function} fun
            @returns {GNN.Hash} <code>this</code>
            @throws {TypeError} If <code>fun</code> is not a function.
            @example
GNN.Hash({ a:1, b:2, c:3 }).tap(function(x){console.log(x);});
// => { a:1, b:2, c:3 }
        */
        tap: function(fun) {
            if (typeof fun != "function") {
                throw new TypeError('tap: not a function');
            }
            fun.call(this, this);
            return this;
        },

        // syntactic sugars
        /**
            Returns the value of the given key.
            @param {string} key
            @param {*} [ifnone]
            @returns {*}
                The value or <code>ifnone</code> if
                there is no value for <code>key</code>.
            @throws {GNN.Hash.IndexError}
                If <code>ifnone</code> is not specified and
                the value is not found.
        */
        fetch: function(k, ifnone) {
            if (this.hasOwnProperty(k)) {
                return this[k];
            } else if (arguments.length >= 2) {
                return ifnone;
            } else {
                var msg = 'fetch: key "'+k+'" not found';
                throw new H.IndexError(msg);
            }
        },
        /**
            Insert the key-value pair into the hash table.
            @param {string} key
            @param {*} val
            @returns {GNN.Hash} <code>this</code>
        */
        store: function(k, v) {
            this[k]=v;
            return this;
        },
        /**
            Returns whether the the hash table is empty.
            @returns {boolean}
        */
        isEmpty: function(){ return H.size(this) == 0; },
        /**
            Returns a shallow copy of the hash table.
            @returns {GNN.Hash}
        */
        clone: function() {
            var obj = {};
            fmerge(function(a, b, k){ obj[k] = b; }, null, this);
            return obj;
        },
        /**
            Returns whether the given value is in the hash table.
            @param {*} val
            @returns {boolean}
            @example
GNN.Hash({ a:1, b:2, c:3 }).member(3);
// => true
        */
        member: function(v){ return H.indexOf(this, v) != null; },

        // conversions
        /**
            Returns an array whose elements are key-value pairs.
            Each key-value pair is stored in an array.
            @returns {*[][]}
        */
        toArray: function() {
            var rv = [];
            H.forEach(this, function(k, v){ rv.push([ k, v ]); });
            return rv;
        }
    };

    // properties
    H.properties = /** @lends H.prototype */ {
        /**
            Returns an array of keys.
            @type string[]
        */
        keys: { get: function() {
            var rv = [];
            H.forEach(this, function(k, v){ rv.push(k); });
            return rv;
        } },
        /**
            Returns an array of values.
            @type *[]
        */
        values: { get: function() {
            var rv = [];
            H.forEach(this, function(k, v){ rv.push(v); });
            return rv;
        } },
        /**
            Returns the size of the hash table.
            @type number
        */
        size: { get: function(){ return H.keys(this).length; } },
        /**
            Returns the size of the hash table.
            @type number
        */
        length: { get: function(){ return H.size(this); } }
    };
    H.privateProperties = {
        _isHash: { value: H }
    };
    if (respondsTo(Object, 'keys')) {
        H.properties.keys = { get: function(){ return Object.keys(this); } };
    }

    // merge methods to the prototype
    addInterface(H.prototype, H.methods);
    addProperties(H.prototype, H.properties);
    addProperties(H.prototype, H.privateProperties);

    // translate return value
    H._preserveReturnValue = [
        'map', 'filter', 'merge', 'invert', 'clone',
    ];
    var installHashWrapper = function(k) {
        if (!k) return;
        var fun = Object.prototype[k] || H.prototype[k];
        addProperty(H.prototype, k, {
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
    fmerge(function(a, fun, k) {
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            return fun.apply(thisp, args);
        };
    }, H, H.methods);
    fmerge(function(a, b, k) {
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            var r;
            if (args.length > 0 && b.set) r = b.set.apply(thisp, args);
            if (b.get) return b.get.call(thisp);
            return r;
        };
    }, H, H.properties);

    // class methods
    /**
        Returns whether the given object is a hash table.
        @param {object} hashLike
        @returns {boolean}
    */
    H.isHash = function(hashLike) {
        return (hashLike||{})._isHash === H;
    };
} ].reverse()[0](this);
