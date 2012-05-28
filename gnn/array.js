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
    var isArray = B.isArray || function(x){ return x instanceof G.Array; };
    var fmerge = B.fmerge || function(fun, a, b) {
        a = a || {}; fun = fun || function(x,y){ return y; };
        for (var p in b) b.hasOwnProperty(p) && (a[p]=fun(a[p],b[p],p)||a[p]);
        return a;
    };
    var merge = B.merge || function(a, b){ return fmerge(null, a, b); };
    var setProto = B.setProto || function(obj, proto, alt) {
        alt = alt || function(){};
        (obj && obj.__proto__ && (obj.__proto__ = proto)) || alt(obj, proto);
        return obj;
    };
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
    var addInterface = B.addInterface || function(obj, intrfce, override) {
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
    // extended array

    var A;
    /**
        Creates an extended array.
        @class An extended array.
        @name A
        @exports A as GNN.Array
        @param {number|...*} []
            The size or elements of array.
        @description
            It is compatible to the built-in <code>Array</code> but
            it doesn't modify <code>Array.prototype</code>.

            <p>If <code>__proto__</code> access is supported,
            <code>new GNN.Array() instanceof GNN.Array</code> is
            <code>true</code> and the complexity of the object creation
            is the same as that of the built-in <code>Array</code>.
            Otherwise, the complexity is at least O(m) where m is the number of
            methods in <code>GNN.Array.prototype</code>.</p>

            <p>Methods and property gets in <code>GNN.Array.prototype</code>
            are also available as static methods in <code>GNN.Array</code> with
            taking the first argument as an array. In this form, an array-like
            object like <code>arguments</code> can be used as an array.</p>
        @requires GNN.Base
        @see The idea of the implementation is described in "<a href="http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/">How ECMAScript 5 still does not allow to subclass an array</a>" by kangax.
        @example
new GNN.Array(1, 2, 3); // => [1, 2, 3]
new GNN.Array(1, 2, 3) instanceof Array; // => true
GNN.Base.className(new GNN.Array(1, 2, 3)); // => 'Array'

GNN.Array(1, 2, 3); // => [1, 2, 3]
GNN.Array(1, 2, 3) instanceof Array; // => true
GNN.Base.className(GNN.Array(1, 2, 3)); // => 'Array'

GNN.Array(1, 2, 3).member(3); // => true
GNN.Array(1, 2, 3).first; // => 1

GNN.Array.member([1, 2, 3], 3); // => true
GNN.Array.first([1, 2, 3]); // => 1
    */
    A = T.Array = function Array() {
        var self = arguments.length===1 && (typeof arguments[0] == 'number') ?
                new G.Array(arguments[0]) : toA(arguments);
        addInterface(self, { constructor: A }, true);
        return setProto(self, A.prototype, function(obj, proto) {
            addInterface(obj, fmerge(function(a, b, k) {
                return A.prototype[k];
            }, null, A.methods), true);
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
    A.methods = /** @lends A.prototype */ {
        // JavaScript 1.6 and 1.8 features
        /**
            Returns the first index at which the given element is found in the
            array.
            @param {*} element
                The element to find.
            @param {number} [from=0]
                The index at which to begin the search.
            @returns {number}
                The index at which <code>element</code> is found, or
                <code>-1</code> if it is not present.
            @description
                It uses <code>===</code> to check whether the two values are
                equal.
            @example
GNN.Array(1, 2, 3, 4, 1, 4).indexOf(0); // => -1
GNN.Array(1, 2, 3, 4, 1, 4).indexOf(4); // => 3
        */
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
        /**
            Returns the last index at which the given element is found in the
            array.
            @param {*} element
                The element to find.
            @param {number} [from=this.length-1]
                The index at which to begin the search.
            @returns {number}
                The index at which <code>element</code> is found, or
                <code>-1</code> if it is not present.
            @description
                It uses <code>===</code> to check whether the two values are
                equal.
            @example
GNN.Array(1, 2, 3, 4, 1, 4).indexOf(0); // => -1
GNN.Array(1, 2, 3, 4, 1, 4).indexOf(4); // => 5
        */
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
        /**
            Returns a new array with all elements
            that satisfy the given condition copied.
            @param {function} fun
                The conditional function of the form
                <code>function(v, i, a){ ... }</code>
                where <code>v</code> is the element,
                <code>i</code> is the index of the element, and
                <code>a</code> is the array.
            @param {object} [thisp=null]
                The object to use as <code>this</code> when calling
                <code>fun</code>.
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {GNN.Array} A new array.
            @example
GNN.Array(1, 2, 3, 4, 5, 6).filter(function(x){return x%2!=0;});
// =>  [1, 3, 5]
        */
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
        /**
            Invokes the given function once per element.
            @param {function} fun
                The function of the form
                <code>function(v, i, a){ ... }</code>
                where <code>v</code> is the element,
                <code>i</code> is the index of the element, and
                <code>a</code> is the array.
            @param {object} [thisp=null]
                The object to use as <code>this</code> when calling
                <code>fun</code>.
            @throws {TypeError} If <code>fun</code> is not a function.
            @example
GNN.Array(1, 2, 3, 4, 5, 6).forEach(function(x){console.log(x);});
        */
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
        /**
            Tests whether all the elements satisfy the condition.
            @param {function} fun
                The conditional function of the form
                <code>function(v, i, a){ ... }</code>
                where <code>v</code> is the element,
                <code>i</code> is the index of the element, and
                <code>a</code> is the array.
            @param {object} [thisp=null]
                The object to use as <code>this</code> when calling
                <code>fun</code>.
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {boolean}
            @example
GNN.Array(1, 2, 3, 4, 5, 6).every(function(x){return x%2==0;});
// => false
GNN.Array(2, 4, 6).every(function(x){return x%2==0;});
// => true
        */
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
        /**
            Returns a new array with the results of calling
            the given function on each element of the array.
            @param {function} fun
                The function of the form
                <code>function(v, i, a){ ... }</code>
                where <code>v</code> is the element,
                <code>i</code> is the index of the element, and
                <code>a</code> is the array.
            @param {object} [thisp=null]
                The object to use as <code>this</code> when calling
                <code>fun</code>.
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {GNN.Array} A new array.
            @description
                It stores <code>fun(this[i], i, this)</code> to the new
                array at index <code>i</code> for each index <code>i</code>
                in <code>this</code>.
            @example
GNN.Array(1, 2, 3, 4, 5, 6).map(function(x){return x*x;});
// => [1, 4, 9, 16, 25, 36]
        */
        map: function(fun, thisp) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != 'function') {
                throw new TypeError('map: not a function');
            }
            var rv = new G.Array(len);
            for (var i=0; i < len; i++) {
                if (i in o) rv[i] = fun.call(thisp, o[i], i, o);
            }
            return rv;
        },
        /**
            Tests whether some elements satisfy the condition.
            @param {function} fun
                The conditional function of the form
                <code>function(v, i, a){ ... }</code>
                where <code>v</code> is the element,
                <code>i</code> is the index of the element, and
                <code>a</code> is the array.
            @param {object} [thisp=null]
                The object to use as <code>this</code> when calling
                <code>fun</code>.
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {boolean}
            @example
GNN.Array(1, 2, 3, 4, 5, 6).some(function(x){return x%2==0;});
// => true
GNN.Array(1, 3, 5).some(function(x){return x%2==0;});
// => false
        */
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
        /**
            Applies the given function against an accumulator and
            each element of the array from left-to-right as to reduce it to
            a single value.
            @param {function} fun
                The conditional function of the form
                <code>function(r, v, i, a){ ... }</code>
                where <code>r</code> is the value previously returned in
                the last invocation of <code>fun</code>,
                or <code>initial</code> for the first time,
                <code>v</code> is the element,
                <code>i</code> is the index of the element, and
                <code>a</code> is the array.
            @param {*} initial
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {*}
            @example
GNN.Array(1, 2, 3, 4, 5, 6).reduce(function(r, x){return r+x;}, 0);
// => 21
GNN.Array(1, 2, 3, 4, 5, 6).reduce(function(r, x){return r-x;});
// => -19
        */
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
        /**
            Applies the given function against an accumulator and
            each element of the array from right-to-left as to reduce it to
            a single value.
            @param {function} fun
                The conditional function of the form
                <code>function(r, v, i, a){ ... }</code>
                where <code>r</code> is the value previously returned in
                the last invocation of <code>fun</code>,
                or <code>initial</code> for the first time,
                <code>v</code> is the element,
                <code>i</code> is the index of the element, and
                <code>a</code> is the array.
            @param {*} initial
            @throws {TypeError} If <code>fun</code> is not a function.
            @returns {*}
            @example
GNN.Array(1, 2, 3, 4, 5, 6).reduceRight(function(r, x){return r+x;}, 0);
// => 21
GNN.Array(1, 2, 3, 4, 5, 6).reduceRight(function(r, x){return r-x;});
// => -9
        */
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
        /**
            Calls the given function with passing <code>this</code> and
            returns <code>this</code>.
            @param {function} fun
            @returns {GNN.Array} <code>this</code>
            @throws {TypeError} If <code>fun</code> is not a function.
            @example
GNN.Array(1,2,3).tap(function(a) {
  console.log(a.last);
}); // => [1, 2, 3]
        */
        tap: function(fun) {
            if (typeof fun != "function") {
                throw new TypeError('tap: not a function');
            }
            fun.call(this, this);
            return this;
        },
        /**
            Zips the elements of the arrays with the given function.
            @param {function} fun
            @param {...ArrayLike} objs
            @returns {GNN.Array}
                A new array whose length is the maximum length of
                <code>this</code> and <code>objs[i]</code>.
            @description
                It returns
                <code>[ fun(this[0], objs[0][0], ..., objs[i][0], ...),
                        fun(this[1], objs[0][1], ..., objs[i][1], ...),
                        ...,
                        fun(this[n], objs[0][n], ..., objs[i][n], ...) ]</code>
                where <code>n</code> is the maximum length of
                <code>this</code> and <code>objs[i]</code>.

                <p>If <code>fun</code> is <code>null</code>,
                <code>fun = Array</code> is used; i.e., the elements of
                resulting array are also arrays, whose length is
                <code>objs.length+1</code>.</p>
            @see GNN.Array#zip
            @example
GNN.Array(1, 2).zmap(function(x, y, z){return x*y*z}, [3,4], [5,6]);
// => [15, 48]
        */
        zmap: function(fun, objs) {
            if (typeof fun != 'function') fun = G.Array;

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
        /**
            Finds the first element satisfies the given condition and
            returns the element.
            @param {function} [fun=function(x){return x===obj;}]
                The conditional function of the form
                <code>function(v, i, a){ ... }</code>
                where <code>v</code> is the element,
                <code>i</code> is the index of the element, and
                <code>a</code> is the array.
            @param {*} [ifnone]
            @returns {*}
                The element if it is found. <code>ifnone</code> otherwise.
            @see GNN.Array#findLast
            @example
GNN.Array(1, 2, 3, 4, 5, 6).find(function(x){return x%2==0;});
// => 2
        */
        find: function(fun, ifnone) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != "function") {
                var obj = fun;
                /** @ignore */
                fun = function(x){ return x === obj; };
            }
            for (var i=0; i < len; i++) {
                if (i in o && fun.call(null, o[i], i, o)) return o[i];
            }
            return ifnone;
        },
        /**
            Finds the last element satisfies the given condition and
            returns the element.
            @param {function|object} fun
                If <code>fun</code> is an object,
                <code>function(v,i){return v===fun;}</code> is used as a
                conditional function.
                Otherwise, <code>fun</code> is the conditional function of
                the form
                <code>function(v, i, a){ ... }</code>
                where <code>v</code> is the element,
                <code>i</code> is the index of the element, and
                <code>a</code> is the array.
            @param {*} [ifnone]
            @returns {*}
                The element if it is found. <code>ifnone</code> otherwise.
            @see GNN.Array#find
            @example
GNN.Array(1, 2, 3, 4, 5, 6).findLast(function(x){return x%2==0;});
// => 6
        */
        findLast: function(fun, ifnone) {
            var o = this;
            var len = o.length >>> 0;
            if (typeof fun != "function") {
                var obj = fun;
                /** @ignore */
                fun = function(x){ return x === obj; };
            }
            for (var i=len-1; 0 <= i; i--) {
                if (i in o && fun.call(null, o[i], i, o)) return o[i];
            }
            return ifnone;
        },
        /**
            Makes a new hash table grouping the elements of the array
            by keys returned by the given function.
            @param {function} fun
            @param {*} [thisp=null]
            @returns {object} A hash table.
            @throws {TypeError} If <code>fun</code> is not a function.
            @description
                It calls <code>fun(this[i], i, this)</code> for each index
                <code>i</code> and puts <code>this[i]</code> into the same
                array if <code>fun</code> returned the same value.
                Then, it returns a hash table which is a mapping from the
                return values of <code>fun</code> to the arrays.
            @example
GNN.Array(1, 2, 3, 4, 5, 6).groupBy(function(x){return x%3;});
// => {0: [ 3, 6], 1: [1, 4], 2: [2, 5]}
        */
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
        /**
            Returns a new flat array with all the elements of the array
            including those of nseted arrays.
            @returns {GNN.Array} A new array.
            @throws {GNN.Array.ArgumentError}
                If it has a cyclic reference.
            @example
GNN.Array([1, 2], [3, [4, 5]], 6).flatten();
// => [1, 2, 3, 4, 5, 6]
        */
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
                var args = isArray(x) ? A.flatten(x, s) : [x];
                rv.push.apply(rv, args);
            }
            return rv;
        },

        // syntactic sugars
        /**
            Returns the element at the given index.
            @param {number} i
            @returns {*} The <code>i</code>th element.
        */
        at: function(i){ return this[i]; },
        /**
            Returns the element at the given index.
            @param {number} i
            @param {*} [ifnone]
            @returns {*}
                The <code>i</code>th element or <code>ifnone</code> if
                <code>i</code> is out of range.
            @throws {GNN.Array.IndexError}
                If <code>ifnone</code> is not specified and
                <code>i</code> is out of range.
        */
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
        /**
            Puts the value into the array.
            @param {number} i
                The index where the value is placed.
            @param {*} val
            @returns {GNN.Array} <code>this</code>
        */
        store: function(i, val) {
            this[i] = val;
            return this;
        },
        /**
            Zips the elements of the arrays.
            @param {...ArrayLike} objs
            @returns {GNN.Array}
                A new array whose length is the maximum length of
                <code>this</code> and <code>objs[i]</code>.
            @description
                It returns
                <code>[ [this[0], objs[0][0], ..., objs[i][0], ...],
                        [this[1], objs[0][1], ..., objs[i][1], ...],
                        ...,
                        [this[n], objs[0][n], ..., objs[i][n], ...] ]</code>
                where <code>n</code> is the maximum length of
                <code>this</code> and <code>objs[i]</code>.

                <p>The elements of
                resulting array are also arrays, whose length is
                <code>objs.length+1</code>.</p>
            @see GNN.Array#zmap
            @example
GNN.Array(1, 2).zip([3,4], [5,6]);
// => [[1, 3, 5], [2, 4, 6]]
        */
        zip: function(objs) {
            return A.zmap.apply(null, [ this, null ].concat(toA(arguments)));
        },
        /**
            Returns a new array with <code>null</code> elements filtered out.
            @returns {GNN.Array} A new array.
            @example
GNN.Array(1, 2, null, 4, null).compact(); // => [1, 2, 4]
        */
        compact: function() {
            return A.filter(this, function(x){ return x!=null; });
        },
        /**
            Returns whether the given value is in the array.
            @param {*} obj
            @returns {boolean}
            @example
GNN.Array(1, 2, 3).member(3); // => true
        */
        member: function(obj){ return A.indexOf(this, obj) >= 0; },
        /**
            Returns whether the array is empty.
            @returns {boolean}
        */
        isEmpty: function(){ return this.length == 0; },
        /**
            Returns a shallow copy of the array.
            @returns {GNN.Array}
        */
        clone: function(){ return toA(this); }
    };

    var promote = function(thisp, arr) {
        if (A.isExtendedArray(arr)) return arr;
        if (!A.isExtendedArray(thisp)) return arr;
        return thisp.constructor.fromArray(arr);
    };

    // properties
    A.properties = /** @lends A.prototype */ {
        /**
            Returns or sets the first element(s) of the array.
            @type *
            @example
GNN.Array(1, 2, 3, 4).first; // => 1
GNN.Array.first([ 1, 2, 3, 4 ], 2); // => [1, 2]
        */
        first: {
            get: function(n) {
                if (typeof n == 'number') {
                    return promote(this, toA(this, 0, n));
                }
                return this[0];
            },
            set: function(v){ this[0]=v; }
        },
        /**
            Returns or sets the last element(s) of the array.
            @type *
            @example
GNN.Array(1, 2, 3, 4).last; // => 4
GNN.Array.last([ 1, 2, 3, 4 ], 2); // => [3, 4]
        */
        last: {
            get: function(n) {
                if (typeof n == 'number') {
                    var l = this.length;
                    return promote(this, toA(this, l-n, l));
                }
                return this[this.length-1];
            },
            set: function(v){ this[this.length-1]=v; }
        }
    };
    A.privateProperties = {
        _isExtendedArray: { value: A }
    };

    // merge methods to the prototype
    addInterface(A.prototype, fmerge(function(a, b, k) {
        return !G.Array.prototype[k] && b;
    }, null, A.methods));
    addProperties(A.prototype, A.properties);
    addProperties(A.prototype, A.privateProperties);
    setProto(A.prototype, G.Array.prototype);

    // translate return value
    A._preserveReturnValue = [
        'concat', 'slice',
        'map', 'filter',
        'zmap', 'flatten', 'zip', 'compact', 'clone',
    ];
    var installArrayWrapper = function(k) {
        if (!k) return;
        var fun = G.Array.prototype[k] || A.prototype[k];
        addProperty(A.prototype, k, {
            configurable: true,
            writable: true,
            value: function() {
                var r = fun.apply(this, arguments);
                if (r instanceof G.Array && r !== this) {
                    r = promote(this, r);
                }
                return r;
            }
        });
    };
    for (var i=0; i < A._preserveReturnValue.length; i++) {
        installArrayWrapper(A._preserveReturnValue[i]);
    }

    // enable A.method(arrayLike, ...) form
    fmerge(function(a, b, k) {
        var fun = G.Array.prototype[k] || A.methods[k];
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            return fun.apply(thisp, args);
        };
    }, A, A.methods);
    fmerge(function(a, b, k) {
        if (b.get) {
            return function(thisp, args) {
                return b.get.apply(thisp, toA(arguments, 1));
            };
        } else {
            return function(thisp, args) {
                var r;
                if (args.length > 0 && b.set) {
                    r = b.set.apply(thisp, toA(arguments, 1));
                }
                return r;
            };
        }
    }, A, A.properties);

    // class methods
    /**
        Returns whether the given object is an extended array.
        @param {object} arrayLike
        @returns {boolean}
    */
    A.isExtendedArray = function(arrayLike) {
        return (arrayLike||{})._isExtendedArray === A;
    };
    /**
        Returns a new extended array with all the elements of the given array.
        @param {ArrayLike} arrayLike
        @returns {GNN.Array}
    */
    A.fromArray = function(arrayLike) {
        var arr = toA(arrayLike);
        if (arr.length <= 1) {
            arr.unshift({}); // make sure that arr[0] is not a number
            arr = A.apply(null, arr);
            arr.shift();
            return arr;
        } else {
            return A.apply(null, arr);
        }
    };
    /**
        Copies members of GNN.Array.prototype to the given object.
        @param {object} prototype
        @returns {object} <code>prototype</code>
    */
    A.extend = function(prototype) {
        addInterface(prototype, A.methods);
        addProperties(prototype, A.properties);
        addProperties(prototype, A.privateProperties);
        return prototype;
    };

    ////////////////////////////////////
    // associative array

    var AA;
    /**
        Creates an associative array.
        @class An associative array.
        @augments GNN.Array
        @name AA
        @exports AA as GNN.AssocArray
        @param {number|...*} []
            The size or elements of array.
        @description
            It is compatible to the built-in <code>Array</code> but
            it doesn't modify <code>Array.prototype</code>.
        @requires GNN.Base
        @requires GNN.Array
        @description
            <p>Methods and property gets in
            <code>GNN.AssocArray.prototype</code>
            are also available as static methods in
            <code>GNN.AssocArray</code> with
            taking the first argument as an array. In this form, an array-like
            object like <code>arguments</code> can be used as an associative
            array.</p>
    */
    AA = T.AssocArray = A.Assoc = function() {
        var self = arguments.length===1 && (typeof arguments[0] == 'number') ?
                new A(arguments[0]) : A.fromArray(arguments);
        addInterface(self, { constructor: AA }, true);
        return setProto(self, AA.prototype, function(obj, proto) {
            addInterface(obj, fmerge(function(a, b, k) {
                return AA.prototype[k];
            }, null, AA.methods), true);
            addProperties(obj, AA.privateProperties);
        });
    };

    // methods
    AA.methods = /** @lends AA.prototype */ {
        /**
            Looks up the specified key.
            @param {object} key
            @returns {object[]}
                A pair of the <code>key</code> and the associated value.
            @description
                It returns the first match.
            @see GNN.AssocArray#assocv
            @see GNN.Array#find
            @example
GNN.AssocArray([ 1, 2 ], [ 3, 4 ], [ 1, 4 ]).assoc(1);
// => [ 1, 2 ]
        */
        assoc: function(key) {
            return A.find(this, function(x){ return x[0]===key; });
        },
        /**
            Looks up the specified key.
            @param {object} key
            @returns {object[]}
                A pair of the <code>key</code> and the associated value.
            @description
                It returns the last match.
            @see GNN.AssocArray#rassocv
            @see GNN.Array#findLast
            @example
GNN.AssocArray([ 1, 2 ], [ 3, 4 ], [ 1, 4 ]).rassoc(1);
// => [ 1, 4 ]
        */
        rassoc: function(key) {
            return A.findLast(this, function(x){ return x[0]===key; });
        },
        /**
            Looks up the specified key.
            @param {object} key
            @returns {object}
                The value associated with <code>key</code>.
            @description
                It returns the first match.
            @see GNN.AssocArray#assoc
            @see GNN.Array#find
            @example
GNN.AssocArray([ 1, 2 ], [ 3, 4 ], [ 1, 4 ]).assocv(1);
// => 2
        */
        assocv: function(key){ return (AA.assoc(this, key) || [])[1]; },
        /**
            Looks up the specified key.
            @param {object} key
            @returns {object}
                The value associated with <code>key</code>.
            @description
                It returns the last match.
            @see GNN.AssocArray#rassoc
            @see GNN.Array#findLast
            @example
GNN.AssocArray([ 1, 2 ], [ 3, 4 ], [ 1, 4 ]).rassocv(1);
// => 4
        */
        rassocv: function(key){ return (AA.rassoc(this, key) || [])[1]; }
    };

    // properties
    AA.privateProperties = {
        _isAssocArray: { value: AA }
    };

    // merge methods to the prototype
    addInterface(AA.prototype, AA.methods);
    addProperties(AA.prototype, AA.privateProperties);
    setProto(AA.prototype, A.prototype);

    // enable AA.method(arrayLike, ...) form
    fmerge(function(a, b, k) {
        var fun = AA.methods[k];
        return function(thisp, args) {
            args = toA(arguments); args.shift();
            return fun.apply(thisp, args);
        };
    }, AA, AA.methods);

    // class methods
    /**
        Returns whether the given object is an associative array.
        @param {object} arrayLike
        @returns {boolean}
    */
    AA.isAssocArray = function(arrayLike) {
        return (arrayLike||{})._isAssocArray === AA;
    };
    /**
        Returns an associative array of the given array.
        @param {ArrayLike} arrayLike
        @returns {GNN.AssocArray}
    */
    AA.fromArray = function(arrayLike) {
        var arr = toA(arrayLike);
        if (arr.length <= 1) {
            arr.unshift({}); // make sure that arr[0] is not a number
            arr = AA.apply(null, arr);
            arr.shift();
            return arr;
        } else {
            return AA.apply(null, arr);
        }
    };
    /**
        Copies members of GNN.AssocArray.prototype to the given object.
        @param {object} prototype
        @returns {object} <code>prototype</code>
    */
    AA.extend = function(prototype) {
        addInterface(prototype, AA.methods);
        addProperties(prototype, AA.privateProperties);
        return prototype;
    };
} ].reverse()[0](this);
