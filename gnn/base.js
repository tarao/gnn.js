[ 'GNN' , function(G) {
    var ns = this.pop();
    if (typeof G[ns] == 'undefined') G[ns] = {};
    G[ns].Base = {};

    /**
        @name T
        @exports T as GNN
        @namespace The root of GNN Library.
    */
    var T = G[ns];
    /**
        @name B
        @exports B as GNN.Base
        @namespace The base component.
    */
    var B = T.Base;

    ////////////////////////////////////
    // namespace

    /**
        The global object.
    */
    B.global = G;

    /**
        Looks up fully qualified name <code>fqn</code>
        from <code>obj</code>.

        @param obj
            An object from which looking up.
            The global object is used when it is <code>null</code>.
        @param {string} fqn A dot separated string.
        @returns
            The object whose path from <code>obj</code>
            is <code>fqn</code>, or <code>undefined</code>
            when none is found.
        @example
var x = { a: { b: 'hoge' }, c: 1 };
GNN.Base.lookup(x, 'a.b'); // => 'hoge'
    */
    B.lookup = function(obj, fqn) {
        obj = obj || B.global;
        return fqn.split('.').reduce(function(r,n){return (r||{})[n];}, obj);
    };


    ////////////////////////////////////
    // objects properties

    /**
        Checks if the given value is not undefined.
        @param {*} obj
        @returns {boolean}
    */
    B.isDefined = function(obj) {
        return !(typeof obj == 'undefined');
    };
    /**
        Checks if the given value is a callable function.
        @param {*} obj
        @returns {boolean}
        @example
GNN.Base.isCallable(function(){}); // => true
GNN.Base.isCallable(1); // => false
    */
    B.isCallable = function(obj) {
        return typeof obj == 'function';
    };
    /**
        Checks if the given value responds to a method call.
        @param {*} obj
        @param {string} name A method name.
        @returns {boolean}
        @example
GNN.Base.respondsTo({ m: function(){} }, 'm'); // => true
GNN.Base.respondsTo({ m: {} }, 'm'); // => false
    */
    B.respondsTo = function(obj, name) {
        return B.isDefined(obj) && B.isCallable(obj[name]);
    };
    /**
        Checks if the given value is an instance of a certain class.
        @param {*} obj
        @param {string|function} klass
            A class name or class object (function).
        @returns {boolean}
        @description
            If <code>klass</code> is not a string, it simply checks
            <code>obj instanceof klass</code>.

            Otherwise, it checks in addition if the string representation of
            <code>obj</code> by <code>Object.prototype.toString</code>
            is "[object <code>klass</code>]".
        @example
GNN.Base.isA([], Array);   // => true
GNN.Base.isA([], 'Array'); // => true
GNN.Base.isA("", Object);  // => false
    */
    B.isA = function(obj, klass) {
        if (typeof klass == 'string') {
            var Klass = B.lookup(null, klass);
            if (Klass && obj instanceof Klass) return true;

            var c = Object.prototype.toString.call(obj);
            c = c.substring('[object '.length, c.length-1);
            return c == klass;
        } else {
            return obj instanceof klass;
        }
    };
    /**
        Checks if the given value is an array.
        @name B.isArray
        @function
        @param {*} obj
        @returns {boolean}
        @description
            It returns <code>true</code> even if the given value is an array
            of another <code>iframe</code>, i.e., it does something further
            than <code>obj instanceof Array</code>.
    */
    if (B.isCallable(Array.isArray)) {
        B.isArray = function(obj){ return Array.isArray(obj); };
    } else {
        B.isArray = function(obj){ return B.isA(obj, 'Array'); };
    }
    /**
        Checks if the given value is an object.
        @param {*} obj
        @returns {boolean}
    */
    B.isObject = function(obj){ return typeof obj == 'object'; };
    /**
        Checks if the given value is an object and pure ECMAScript object.
        @param {*} obj
        @returns {boolean}
    */
    B.isECMAObject = function(obj) {
        if (!B.isObject(obj)) return false;
        if (!(obj instanceof Object)) return false;
        if (obj instanceof Node) return false;
        return true;
    };
    /**
        Checks if the given value is a reference, i.e.,
        an object or a function.
        @param {*} obj
        @returns {boolean}
    */
    B.isRef = function(obj){ return B.isCallable(obj) || B.isObject(obj); };
    /**
        Returns the kind of the given value.
        @param {*} obj
        @returns {string}
            'array' for an array, 'object' for an object,
            'function' for a function and 'atom' for anything else.
        @example
GNN.Base.kindOf(null);  // => 'atom'
GNN.Base.kindOf(true);  // => 'atom'
GNN.Base.kindOf(1);     // => 'atom'
GNN.Base.kindOf("foo"); // => 'atom'
GNN.Base.kindOf({a:1}); // => 'object'
GNN.Base.kindOf([1,2]); // => 'array'
GNN.Base.kindOf(function(){}); // => 'function'
    */
    B.kindOf = function(obj) {
        if (B.isArray(obj)) {
            return 'array';
        } else if (B.isObject(obj) && obj) {
            return 'object';
        } else if (B.isCallable(obj)) {
            return 'function';
        } else {
            return 'atom';
        }
    };
    /**
        Returns the name of the given function.
        @param {function} fun
        @returns {string}
        @throws {TypeError} If <code>obj</code> is not a function.
        @description
            It returns <code>fun.name</code> if <code>name</code> property
            of the function is available. Otherwise, it extracts the name from
            the string representation of the function. It returns undefined
            if the function is anonymous.
        @see GNN.Base.className
        @example
GNN.Base.funName(function foo(){}); // => 'foo'
GNN.Base.funName(function(){}); // => undefined
    */
    B.funName = function(fun) {
        if (!B.isCallable(fun)) throw new TypeError('funName: not a function');
        if (fun.name) return fun.name;
        if (/^\s*function\s+(.+?)\s*\(/.test(fun+'')) return RegExp.$1;
    };
    /**
        Returns the class name of the given object.
        @param {object} obj A reference.
        @returns {string}
        @throws {TypeError} If <code>obj</code> is not a reference.
        @description
          The class name is the name of <code>obj.constructor</code>.
        @see GNN.Class.name
        @see GNN.Base.funName
        @example
GNN.Base.className([]); // => 'Array'
GNN.Base.className({}); // => 'Object'
GNN.Base.className(function(){}); // => 'Function'
    */
    B.className = function(obj) {
        if (!B.isRef(obj)) throw new TypeError('className: not a reference');
        if (B.isCallable(obj.constructor)) {
            return B.funName(obj.constructor) || '';
        } else {
            var c = Object.prototype.toString.call(obj);
            return c.substring('[object '.length, c.length-1);
        }
    };


    ////////////////////////////////////
    // objects equalities

    var deep = {
        Label: function() { return {
            labels: [], seen: {},
            add: function(l) { if (!this.seen[l]) {
                this.labels.push(l); this.seen[l] = true;
            } } }; },
        Seen: function(seen) { var K; return new (K=function(seen) { return {
            clone: function(){ return new K(seen.slice(0)); },
            add: function(l, r) {
                for (var i=0; i < seen.length; i++) {
                    if (seen[i][0] === l && seen[i][1] === r) return i+1;
                }
                seen.push([ l, r ]); } }; })(seen||[]); },
        refl: function(lhs, rhs) {
            if ((typeof lhs) != (typeof rhs)) {
                return false;
            } else if (lhs == null && rhs == null) {
                return true;
            } else if (lhs == null || rhs == null) {
                return false;
            } else if (lhs === rhs) {
                return true;
            } else if (B.isObject(lhs) && B.isObject(rhs)) {
                return true;
            }
            return false;
        },
        indexes: function(a, b, l) {
            var length = 0;
            if (B.isArray(a)) length = Math.max(a.length, length);
            if (B.isArray(b)) length = Math.max(b.length, length);
            for (var i=0; i < length; i++) {
                if ((i in a) || (i in b)) l.add(i);
            }
        },
        keys: function(obj, l){ for (var k in obj) l.add(k); },
        labels: function(lhs, rhs, l) {
            this.indexes(lhs, rhs, l); this.keys(lhs, l); this.keys(rhs, l);
        },
        labelsRight: function(lhs, rhs, l) {
            this.indexes(rhs, rhs, l); this.keys(rhs, l);
        },
        properties: function(labels, lhs, rhs) {
            if (!(B.isObject(lhs) && B.isObject(rhs))) return []; // leaf
            var l = new this.Label(); labels.call(this, lhs, rhs, l);

            var r = [];
            for (var i=0; i < l.labels.length; i++) {
                r.push([ lhs[l.labels[i]], rhs[l.labels[i]] ]);
            }
            return r;
        },
        sim: function(lhs, rhs, seen, axiom, transition) {
            if (!axiom.call(this, lhs, rhs)) return false;

            // detect cyclic reference
            if ((seen=seen.clone()).add(lhs, rhs)) return true;

            var states = transition.call(this, lhs, rhs);
            for (var i=0; i < states.length; i++) {
                var l = states[i][0]; var r = states[i][1];
                if (!this.sim(l, r, seen, axiom, transition)) return false;
            }
            return true;
        }
    };

    /**
        Checks if there is a simulation over the given
        labelled state transition system.
        @param {*} lhs
        @param {*} rhs
        @param {function} axiom
            A function which takes two states and returns a boolean value.
        @param {function} transition
            A function which takes two states and returns
            an array of pairs of states.
        @returns {boolean}
        @description
            <p>The labelled state transition is given by values as states and
            indexes of a return value of <code>transition</code> as labels.
            The return value of <code>transition</code> is an array of pairs
            of next states.</p>

            <p>The overall result is <code>true</code> if and only if
            <code>axiom(lhs, rhs)</code> returns <code>true</code> and
            <code>sim(x[i], y[i], axiom, transition)</code> returns
            <code>true</code> for every <code>i</code> where
            <code>transition(lhs, rhs)</code> returns
            <code>[ [ x[0], y[0] ], ..., [ x[i], y[i] ], ... ]</code>.</p>

            <p>For any states <code>x1</code> and <code>y1</code>,
            <code>sim(x1, y1, axiom, transition) = true</code> implies
            <code>sim(x2, y2, axiom, transition) = true</code> for every
            pair of states <code>x2</code>, <code>y2</code> returned by
            <code>transition(x1, y1)</code>.
            This means that there is a relation called
            <a href="http://en.wikipedia.org/wiki/Simulation_preorder">simulation</a>
            over the transition system
            and the relation is actually a
            <a href="http://en.wikipedia.org/wiki/Bisimulation">bisimulation</a>
            if <code>axiom</code> is
            symmetric.</p>

            <p>This method is useful for checking observable equivalence.</p>
        @see GNN.Base.eq
        @see GNN.Base.covers
    */
    B.sim = function(lhs, rhs, axiom, transition) {
        axiom = axiom || deep.refl;
        transition = transition || function(lhs, rhs) {
            return deep.properties(deep.labels, lhs, rhs);
        };
        return deep.sim(lhs, rhs, new deep.Seen(), axiom, transition);
    };

    /**
        Checks if the given values are observably equivalent, in other words,
        they satisfy deep equality.
        @param {*} lhs
        @param {*} rhs
        @description
            It checks equality over values of enumerable properties.
            Input values may have cyclic references.
        @see GNN.Base.covers
        @see GNN.Base.sim
        @example
var x = { a: 1, b: 2 };
GNN.Base.eq(x, { a: 1, b: 2 }); // => true

var y = { a: 1, b: 2 };
y.a = y;
var z = { a: 1, b: 2 };
z.a = z;
GNN.Base.eq(x, y); // => false
GNN.Base.eq(y, z); // => true
    */
    B.eq = function(lhs, rhs){ return B.sim(lhs, rhs); };
    /**
        Checks if the first values covers the second value, in other words,
        the first value is observably equivalent to the second value,
        if one considers only the structure of the second value.
        @param {*} lhs
        @param {*} rhs
        @description
            It checks equality over values of enumerable properties.
            Input values may have cyclic references.
        @see GNN.Base.eq
        @see GNN.Base.sim
        @example
var x = { a: 1, b: 2, c: 3 };
GNN.Base.covers(x, { a: 1, b: 2 }); // => true
GNN.Base.covers(x, { a: 1, b: 2, c: 3 }); // => true
GNN.Base.covers(x, { a: 1, b: 3 }); // => false
GNN.Base.covers(x, { a: 1, b: 2, c: 3, d: 4 }); // => false

var y = { a: 1, b: 2, c: 3, d: 4 };
y.a = y;
var z = { a: 1, b: 2 };
z.a = z;
GNN.Base.covers(y, x); // => false
GNN.Base.covers(y, z); // => true
    */
    B.covers = function(lhs, rhs) {
        return B.sim(lhs, rhs, null, function(lhs, rhs) {
            return deep.properties(deep.labelsRight, lhs, rhs);
        });
    };

    ////////////////////////////////////
    // objects traversal

    /**
        Makes a visitor for structured objects.
        @class A visitor for structured objects.
        @param {function} kindOf
            A function which takes a value and returns a kind of the value in
            a string.
        @param {object} methods
            A map from kinds of values to visitor functions for each kind.
        @see GNN.Base.pp
        @example
var visitor = new GNN.Base.Visitor(function(obj) {
    return typeof obj;
}, {
    undefined: function(){ return 0; },
    null: function(){ return 0; },
    number: function(){ return 1; },
    string: function(){ return 1; },
    function: function(){ return 1; },
    object: function(obj) {
        var n = 0;
        for (var x in obj) {
            n += this.visit(obj[x]);
        }
        return n;
    }
});
visitor.visit({ a: 1, b: [ 1, 2, { c: 3, d: 4 } ], e: 5 }); // => 6
    */
    B.Visitor = function(kindOf, methods) {
        var visitor = function(seen) { return {
            /** @lends B.Visitor.prototype */
            /**
                Determines the kind of the given value and dispatches to
                the visitor methods.
                @param {*} obj
                @returns The return value of the visitor method.
                @description
                    This method can be called recursively from inside
                    the visitor methods via <code>this.visit(obj)</code>.
                    It dispatches to 'cyclic' visitor method
                    if the cyclic reference is found.
            */
            visit: function(obj) {
                var args = [ obj ];
                var s = seen.clone(); var i = s.add(obj, obj);
                var k = kindOf(obj);
                if (i) {
                    k = 'cyclic';
                    args.push(i);
                }
                if (B.isCallable(methods[k])) {
                    return methods[k].apply(visitor(s), args);
                }
            }
        }; };
        return visitor(new deep.Seen());
    };

    var escape = function(str, q) {
        var bs = new RegExp('\\\\', 'g'); q = q || '"';
        str = str.replace(bs, '\\\\').replace(new RegExp(q, 'g'), '\\'+q);
        return str.replace(/\n/g, '\\n');
    };
    var ppStr = function(str) {
        return '"'+escape(str)+'"';
    };
    var ppFun = function(fun, args) {
        var str = fun+'';
        if (/^\[object (.*)\]$/.test(str)) {
            var body = '...';
            if (args.indent) body = 'omitted';
            return 'function ' + RegExp.$1 + '() { ' + body + ' }';
        }
        if (!args.indent) {
            str = str.replace(/^\s+/, '').replace(/\s+/g, ' ');
        }

        var i = str.indexOf('{');
        if (i >= 0 && ('detail' in args) && !args.detail) {
            str = str.substr(0, i) + '{...}';
        }
        return str;
    };
    var ppFunBody = function(fun, args) {
        var str = ppFun(fun, args);
        var i = str.indexOf('{');
        if (i < 0) return '';
        str = str.substr(i+1).replace(/^\n+/,'').replace(/;?\s*\};?\s*$/,'');
        var ls = str.split("\n");
        for (var i=0; i < ls.length; i++) ls[i] = ls[i].replace(/^    /,'');
        return ls.join("\n");
    };
    /**
       Prettify JavaScript code.
       @param {string} code
       @returns {string}
       @description
           Returns indented source code.
       @requires Firefox
       @see GNN.Base.pp
    */
    B.prettify = function(code) {
        try {
            return ppFunBody(new Function(code), { indent: true });
        } catch (e) {
            return code;
        }
    };
    /**
        Pretty prints the given value.
        @param {*} obj
            A value to be printed.
        @param {object} [args]
            Options in a hash table.
        @param {boolean} [args.prettify=false]
              Shows function bodies indented (if possible) and uses
              <code>Name({prop:val,...})</code> notation for objects
              together with <code>args.object.name=true</code>, and
              <code>cyclic(i)</code> notation for cyclic references.
        @param {boolean} [args.function.detail=true]
              Shows function bodies.
        @param {boolean} [args.object.name=true]
              Uses <code>Name {prop:val,...}</code> notation.
        @param {boolean} [args.cyclic.detail=false]
              Uses <code>&i</code> notation.
        @returns {string}
        @requires Firefox (to get function bodies to be indented with
                  <code>args.prettify=true</code>.)
        @see GNN.Base.prettify
        @example
var a1 = [1,2,3];
GNN.Base.pp(a1); // => '[1, 2, 3]'

var a2 = [1,2,3];
a2[1] = a2;
GNN.Base.pp(a2); // => '[1, ..., 3]'
GNN.Base.pp(a2,{cyclic:{detail:1}}); // => '[1, &1, 3]'
GNN.Base.pp(a2,{prettify:1}); // => '[1, cyclic(1), 3]'

var x = { a:1, b:2, c:3 };
GNN.Base.pp(x); // => '{a: 1, b: 2, c: 3}'

var SomeClass = function SomeClass(a,b){ this.a=a; this.b=b; };
var y = new SomeClass(1,2);
GNN.Base.pp(y); // => 'SomeClass {a: 1, b: 2}'
GNN.Base.pp(y,{prettify:1,object:{name:false}}); // => '{a: 1, b: 2}'
GNN.Base.pp(y,{object:{name:false}}); // => '{a: 1, b: 2}'
GNN.Base.pp(y,{prettify:1}); // => 'SomeClass({a: 1, b: 2})'
    */
    B.pp = function(obj, args) {
        args = args || {};
        var fargs = args['function'] || { indent: args.prettify };
        var fdetail = !('detail' in fargs) || fargs.detail;
        var prettify = args.prettify && fdetail;

        var objName = function(klass, x){ return x; };
        if (!('name' in (args.object||{})) || (args.object||{}).name) {
            if (prettify) {
                /** @ignore */
                objName = function(klass, x){ return klass+'('+x+')'; };
            } else {
                /** @ignore */
                objName = function(klass, x){ return klass+' '+x; };
            }
        }

        var str = new B.Visitor(B.kindOf, {
            atom: function(atom) {
                return (typeof atom == 'string') ? ppStr(atom) : atom+'';
            },
            function: function(fun){ return ppFun(fun, fargs); },
            array: function(arr) {
                var ss = [];
                for (var i=0; i < arr.length; i++) ss.push(this.visit(arr[i]));
                return '['+ss.join(', ')+']';
            },
            object: function(obj) {
                var name = function(klass, x){ return x; };
                var klass = B.className(obj);
                if (klass != 'Object') name = objName;

                if (B.isObject(obj) && !B.isECMAObject(obj)) {
                    if (B.isDefined(document) && obj instanceof Element) {
                        try {
                            var div = document.createElement('div');
                            div.appendChild(obj);
                            return div.innerHTML;
                        } catch (e) { /* ignore */ }
                    }
                    var str = '{...}';
                    if (prettify) str = 'omitted';
                    return name(klass, str);
                }

                var ss = [];
                for (var k in obj) {
                    var val = this.visit(obj[k]);
                    if (!/^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(k)) {
                        k = "'"+escape(k, "'")+"'";
                    }
                    ss.push(k + ': ' + val);
                }
                return name(klass, '{'+ss.join(', ')+'}');
            },
            cyclic: function(obj, i) {
                if (prettify) return 'cyclic('+i+')';
                if ((args.cyclic||{}).detail) return '&'+i;
                return '...';
            }
        }).visit(obj);

        if (prettify) {
            return B.prettify('return '+str).replace(/^return /,'');
        }
        return str;
    };

    ////////////////////////////////////
    // object operations

    /**
        Merges the objects by the given function.
        @param {function} fun
            A function takes two values and returns a value or undefined.
        @param {...object} objs
            Zero or more objects to be merged.
        @returns {object}
            The value whose reference is identical to the first element of
            <code>objs</code>.
        @description
            <p>For input <code>obj1, obj2, ...rest</code>,
            it merges <code>obj1</code> and <code>obj2</code>
            into <code>obj1</code> and computes
            <code>fmerge(fun, obj1, ...rest)</code> iteratively.
            In each iteration, it calls <code>fun(obj1[p], obj2[p], p)</code>
            for each enumerable property <code>p</code> in <code>obj2</code>
            and updates the property <code>p</code> of <code>obj1</code> by
            the return value of <code>fun</code> if it is not undefined.</p>

            <p>If the first element of <code>objs</code> is <code>null</code>,
            it merges rest of objects into a new object <code>{}</code>.
            If the other elements of <code>objs</code> are <code>null</code>,
            they are just skipped.</p>
        @see GNN.Base.merge
        @see GNN.Base.dmerge
        @see GNN.Hash.merge
        @example
GNN.Base.fmerge(function(x,y,k) {
    return x || y;
}, null, {a:1,b:2}, {c:3}); // => {a:1,b:2,c:3}
GNN.Base.fmerge(function(x,y,k) {
    return x || y;
}, {a:1,b:2}, {b:3}); // => {a:1,b:2}
    */
    B.fmerge = function(fun, objs) {
        var self = arguments[1];
        self = self || {}; fun = fun || function(x, y){ return y; };
        for (var i=2; i < arguments.length; i++) {
            var other = arguments[i];
            if (other == null) continue;
            for (var p in other) {
                if (!other.hasOwnProperty(p)) continue;
                var v = fun(self[p], other[p], p);
                if (B.isDefined(v)) self[p] = v;
            }
        }
        return self;
    }
    /**
        Merges the objects.
        @param {...object} objs
            Zero or more objects to be merged.
        @returns {object}
            The value whose reference is identical to the first element of
            <code>objs</code>.
        @description
            It is equivalent to
            <code>GNN.Base.fmerge(function(a,b){ return b; }, ...objs)</code>.
        @see GNN.Base.fmerge
        @see GNN.Hash.merge
        @example
GNN.Base.merge(null, {a:1,b:2}); // => {a:1,b:2}
GNN.Base.merge(null, {a:1,b:2}, {c:3}; // => {a:1,b:2,c:3}
GNN.Base.merge({a:1,b:2}, {b:3}); // => {a:1,b:3}
    */
    B.merge = function(objs) {
        var args = [ function(a,b){return b;} ];
        for (var i=0; i < arguments.length; i++) args.push(arguments[i]);
        return B.fmerge.apply(null, args);
    };
    /**
        Deeply merges the objects.
        @param {...object} objs
            Zero or more objects to be merged.
        @returns {object}
            The value whose reference is identical to the first element of
            <code>objs</code>.
        @description
            It is equivalent to
            <code>GNN.Base.fmerge(f, ...objs)</code> where <code>f(a,b)</code>
            calls <code>dmerge</code> recursively
            if both <code>a</code> and <code>b</code> are objects.
        @see GNN.Base.fmerge
        @example
GNN.Base.dmerge({a:{b:1,c:2},d:{e:3,f:4}},{a:{b:2}});
// => {a:{b:2,c:2},d:{e:3,f:4}}
    */
    B.dmerge = function(objs) {
        var args = [ function(a, b) {
            return B.isObject(a) && B.isObject(b) ? B.dmerge(a, b) : b;
        } ];
        for (var i=0; i < arguments.length; i++) args.push(arguments[i]);
        return B.fmerge.apply(null, args);
    };


    ////////////////////////////////////
    // class definition

    /**
        Set <code>__proto__</code> of the given object.
        @param {object} obj
        @param {*} proto
        @param {function} alt
        @returns {object} <code>obj</code> itself.
        @description
            Sets <code>proto</code> to <code>obj.__proto__</code> if it is
            available. Otherwise, it calls <code>alt(obj, proto)</code>.
    */
    B.setProto = function(obj, proto, alt) {
        if (obj != null && B.isDefined(obj.__proto__)) {
            obj.__proto__ = proto;
        } else if (alt) {
            alt(obj, proto);
        }
        return obj;
    };
    /**
        Defines a new property on the given object or modifies the existing
        property on the object.
        @param {object} obj
        @param {string} name
        @param {object} desc
            A descriptor for the property.
        @param {object} [config]
            An additional configuration,
            which is to be merged into <code>desc</code>.
        @see Object.defineProperty of ECMAScript 5th Edition
        @see GNN.Base.addProperties
    */
    B.addProperty = function(obj, name, desc, config) {
        desc = B.merge(null, config||{}, desc);
        if (B.isDefined(desc.get) || B.isDefined(desc.set)) {
            delete desc.writable; delete desc.value;
        }
        if ('defineProperty' in Object) {
            Object.defineProperty(obj, name, desc);
        } else {
            var func = { get: '__defineGetter__', set: '__defineSetter__' };
            for (var k in func) {
                if (k in desc && func[k] in obj) obj[func[k]](name, desc[k]);
            }
        }
        return obj;
    };
    /**
        Defines new properties on the given object or modifies the existing
        properties on the object.
        @param {object} obj
        @param {object} props
            A map from property name to its descriptor.
        @param {object} [config]
            A configuration shared by all properties.
        @see GNN.Base.addProperty
    */
    B.addProperties = function(obj, props, config) {
        for (var k in props) B.addProperty(obj, k, props[k], config);
        return obj;
    };
    /**
        Defines new properties of values on the given object or modifies
        the existing properties on the object.
        @param {object} obj
        @param {object} intrfce
            A map from property name to a value.
        @param {boolean} [override]
            Whether a property in <code>intrfce</code> overrides that of
            <code>obj</code>.
        @description
            It adds properties of values. The properties are set to be
            configurable and writable.
        @see GNN.Base.addProperty
    */
    B.addInterface = function(obj, intrfce, override) {
        var c = override ? function(){return false;} : function(k) {
            return obj[k] || ((obj.constructor||{}).prototype||{})[k];
        };
        var conf = { configurable: true, writable: true };
        for (var k in intrfce) {
            if (!intrfce[k] || c(k)) continue;
            B.addProperty(obj, k, B.merge(conf, { value: intrfce[k] }));
        }
    };
} ].reverse()[0](this);
