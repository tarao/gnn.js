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
    var isObject = B.isObject || function(x){ return typeof x == 'object'; };
    var isRef = B.isRef || function(x){ return isFun(x) || isObject(x); };
    var fmerge = B.fmerge || function(fun, a, b) {
        a = a || {}; fun = fun || function(x,y){ return y; };
        for (var p in b) {
            if (!b.hasOwnProperty(p)) continue;
            var v = fun(a[p], b[p], p);
            if (isDefined(v)) a[p] = v;
        }
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
        if (isDefined(d.get) || isDefined(d.set)) {
            delete d.writable; delete d.value;
        }
        if ('defineProperty' in Object) {
            Object.defineProperty(obj, name, d);
        } else {
            var f = { get: '__defineGetter__', set: '__defineSetter__' };
            for (var k in f) k in d && f[k] in obj && obj[f[k]](name, d[k]);
        }
        return obj;
    };
    var addValue = function(obj, name, val, config) {
        config = merge({ configurable: true }, config||{});
        addProperty(obj, name, { value: val }, config);
    };
    var addProperties = B.addProperties || function(obj, props, config) {
        for (var k in props) addProperty(obj, k, props[k], config);
        return obj;
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
    if (Object.getOwnPropertyDescriptor) {
        var getPropertyDesc = function(obj, prop) {
            return Object.getOwnPropertyDescriptor(obj, prop);
        };
    } else {
        var getPropertyDesc = function() {
            return {};
        };
    }

    ////////////////////////////////////
    // constants

    var SUPERCLASS = '$superclass';
    var SUPER = '$super';
    var CLASS = '$class';
    var Super = { INTERNAL: '$_', USE_PROXY: true };
    var tag = {};

    var getCallSiteClass = function(func) {
        return func && func.caller && func.caller[CLASS];
    };
    var setCallSiteClass = function(func, klass) {
        if (isFun(func) && !func[CLASS]) addValue(func, CLASS, klass);
    };

    ////////////////////////////////////
    // class factory

    var C;
    /**
        Creates a class.
        @class A class factory.
        @name C
        @exports C as GNN.Class
        @param {function} [init]
        @param {GNN.Class|function} [base]
            A class or a constructor.
        @description
            It is a wrapper to define classes.
            The return value is a function, which can be used as a
            constructor in a <code>new</code> expression (and it safely
            creates an instance if you forget to write "<code>new</code>").

            <p>The semantics is almost the same
            as a style in which fields are initalized in the constructor by
            <code>this.x = ...</code>, instance methods are defined in
            the constructor's <code>prototype</code>, and class methods are
            added as properties of the constructor.</p>

            <p>With a base class, it supports super method calls inside the
            instance. <code>this.$super(...)</code> is a super initializer call
            and <code>this.$super.foo(...)</code> is a super method call of
            a method named "foo".</p>
        @example
var Foo = GNN.Class(function FooClass(a, b) {
    this.a=a; this.b=b;
}).member({
    sum: function(){ return this.a + this.b; },
    prod: function(){ return this.a * this.b; }
}).classMember({
    foo: function(){ return 'foo'; },
    bar: function(){ return 'bar'; }
});

var Bar = GNN.Class(function BarClass(a, b, c) {
    this.$super(a, b); this.c=c;
}, Foo).member({
    sum: function(){ return this.$super.sum() + this.c; }
}).classMember({
    foo: function(){ return 'baz'; }
});

Foo.foo(); // => 'foo'
Foo.bar(); // => 'bar'
var foo = new Foo(1, 2);
GNN.Base.className(foo); // => FooClass
foo instanceof Foo; // => true
foo.sum(); // => 3
foo.prod(); // => 2

Bar.foo(); // => 'baz'
Foo.bar(); // => 'bar'
var bar = new Bar(10, 20, 30);
GNN.Base.className(bar); // => BarClass
bar instanceof Bar; // => true
bar instanceof Foo; // => true
bar.sum(); // => 60
bar.prod(); // => 200;
    */
    C = T.Class = function Class(init, base) {
        var klass = { members: {}, accessors: {},  cmembers: {}, config: {} };

        if (isObject(init)) {
            var cmembers = init;
            init = cmembers.initialize;
            if ('initialize' in cmembers) delete cmembers.initialize;
            merge(klass.cmembers, cmembers);
        }
        init = init || function Object(){};
        klass.init = init;

        if (isObject(base)) {
            var config = base;
            base = config.base || config.inherit;
            klass.config = config;
        }
        klass.base = base;

        var ctor = function(t) {
            if (t !== tag) {
                var self = (this instanceof ctor) ? this : new ctor(tag);
                if (klass.Super) { // make $super
                    addProperty(self, SUPER, new klass.Super(self));
                }
                var r = klass.init.apply(self, arguments);
                if (isRef(r)) return r;
                return self;
            }
        };

        var update = function(args) {
            if (args) { for (var p in args) klass[p] = args[p]; }

            if (!isFun(klass.init)) {
                throw new TypeError('initializer must be a function');
            }

            // inheritance
            if (klass.base) C.inherit(klass.init, klass.base);
            ctor.prototype = klass.init.prototype;
            addValue(ctor, SUPERCLASS, C.superclass(klass.init));
            addInterface(ctor.prototype, klass.members, true);
            addProperties(ctor.prototype, klass.accessors, {
                configurable: true, writable: true
            });

            // class members
            var cmembers = merge(null, klass.cmembers);
            if (!klass.config.noSuperClassMembers) {
                C.ancestors(klass.init).forEach(function(a) {
                    fmerge(function(a, b, k) {
                        return a || b;
                    }, cmembers, a);
                });
            }
            merge(ctor, cmembers);
            merge(klass.init, cmembers);

            // $super
            delete klass.Super;
            if (klass.base && !klass.config.noSuper) {
                // put class to each function
                var proto = ctor.prototype;
                toA(Object.getOwnPropertyNames(proto)).forEach(function(p) {
                    var desc = getPropertyDesc(proto, p);
                    var funs = [];
                    if (desc.get || desc.set) {
                        funs.push(desc.get, desc.set);
                    } else {
                        try {
                            funs.push(proto[p]);
                        } catch (e) { /* ignore */ }
                    }
                    funs.forEach(function(f){ setCallSiteClass(f, ctor); });
                });
                setCallSiteClass(klass.init, ctor);

                // function to make $super for each instance
                klass.Super = Super.factory(klass.init);
            }

            return ctor;
        };

        var def = /** @lends C.prototype */ {
            /**
                Sets initializer.
                @param {function} init
                @returns {GNN.Class} this
                @example
var Foo = GNN.Class().initializer(function(a, b) {
    this.a=a; this.b=b;
}).member({
    sum: function(){ return this.a + this.b; },
    prod: function(){ return this.a * this.b; }
});
            */
            initializer: function(init){ return update({ init: init }); },
            /**
                Sets base class.
                @param {GNN.Class|function} base
                    A class or a constructor.
                @returns {GNN.Class} this
                @example
var Bar = GNN.Class(function(a, b, c) {
    this.$super(a, b); this.c=c;
}).inherits(Foo).member({
    sum: function(){ return this.$super.sum() + this.c; },
});
            */
            inherits: function(base){ return update({ base: base }); },
            config: function(config){ return update({ config: config }) },
            /**
                Sets instance methods and properties.
                @param {object|string} members
                    A hash table of property names and values or
                    a name of a property.
                @param {*} [rest]
                    If <code>members</code> specifies a name of a property,
                    then <code>rest</code> specifies a value of the property.
                @returns {GNN.Class} this
                @example
var Bar = GNN.Class(function(a, b, c) {
    this.$super(a, b); this.c=c;
}, Foo).member('sum', function(){ return this.$super.sum() + this.c; });
            */
            member: function(members, rest) {
                if (typeof members == 'string' && isDefined(rest)) {
                    var m = members; members = {}; members[m] = rest;
                }
                members = merge(klass.members, members||{});
                return update({ members: members || {} });
            },
            /**
                Sets instance properties.
                @param {object|string} members
                   A hash table of property names and values or
                   a name of a property. See <code>rest</code> for the form
                   of values of the hash table.
               @param {*} [rest]
                   If <code>members</code> specifies a name of a property,
                   then <code>rest</code> specifies property description of
                   the property.
               @returns {GNN.Class} this
               @see Object.defineProperty
            */
            accessor: function(members, rest) {
                if (typeof members == 'string' && isDefined(rest)) {
                    var m = members; members = {}; members[m] = rest;
                }
                members = merge(klass.accessors, members||{});
                return update({ accessors: members || {} });
            },
            /**
                Sets class methods and properties.
                @param {object|string} members
                    A hash table of property names and values or
                    a name of a property.
                @param {*} [rest]
                    If <code>members</code> specifies a name of a property,
                    then <code>rest</code> specifies a value of the property.
                @returns {GNN.Class} this
            */
            classMember: function(members, rest) {
                if (typeof members == 'string' && isDefined(rest)) {
                    var m = members; members = {}; members[m] = rest;
                }
                members = merge(klass.cmembers, members||{});
                return update({ cmembers: members });
            }
        };
        merge(ctor, def);

        return update();
    };

    ////////////////////////////////////
    // class hierarchy

    if (isDefined(B.className)) {
        /**
            Returns the name of the given class (or function).
            @param {GNN.Class|function|object} klass
            @returns {string}
            @see GNN.Base.className
        */
        C.className = function(klass) {
            return B.className(isFun(klass) ? klass.prototype : klass);
        };
    }
    if (Object.getPrototypeOf) {
        /**
            Returns <code>__proto__</code> of the given object.
            @param {object} obj
            @returns {object}
            @see GNN.Base.setProto
        */
        C.proto = function(obj) {
            return Object.getPrototypeOf(obj);
        };
    } else {
        C.proto = function(obj) {
            return obj.__proto__;
        };
    }
    /**
        Returns a superclass of the given class (or function).
        @param {GNN.Class|function} klass
        @returns {function}
    */
    C.superclass = function(klass) {
        var sp = klass[SUPERCLASS];
        if (sp) return sp;

        var proto = C.proto(klass.prototype);
        return proto && proto.constructor;
    };
    /**
        Returns ancestors of the given class (or function).
        @param {GNN.Class|function} klass
            A class or a function whose inheritance hierarchy is made
            by <a href="#.inherit"><code>GNN.Class.inherit</code></a>.
        @returns {function[]}
    */
    C.ancestors = function(klass) {
        var r = [];
        while (klass=C.superclass(klass)) r.push(klass);
        return r;
    };
    /**
        Returns a new object which has an object of the given class
        (function) as its <code>__proto__</code>.
        @description
            Intuitively, it returns an object which has all traits of
            the given class but nothing else.
        @param {function|object} klass
            If <code>klass</code> is an object, then it is used as
            <code>__proto__</code> of the new object.
        @returns {object}
    */
    C.traits = function(klass) {
        var Traits = function(){};
        if (isFun(klass)) {
            Traits.prototype = klass.prototype;
        } else {
            Traits.prototype = klass;
        }
        return new Traits();
    };
    /**
        Sets the given class (function) as a base class.
        @param {function} klass
        @param {function|object} base
            If <code>klass</code> is an object, then it is used as
            <code>__proto__</code> of <code>prototype</code> of the returned
            class.
        @returns {function}
        @see GNN.Class.traits
    */
    C.inherit = function(klass, base) {
        klass.prototype = C.traits(base);
        addValue(klass, SUPERCLASS, klass.prototype.constructor);
        klass.prototype.constructor = klass;
        return klass;
    };

    ////////////////////////////////////
    // $super

    Super.factory = function(klass) {
        var INTERNAL = Super.INTERNAL;
        var USE_PROXY = Super.USE_PROXY && (typeof Proxy != 'undefined');

        // function to look up property descriptor in the class hierarchy
        var lookup = function(klass, prop) {
            // We need to look up superclasses one by one because we
            // don't have a function to get property descripter with
            // looking up the prototype chain. Otherwise, only thing
            // we can do is to get the property directly by
            // klass.prototype[prop] but this isn't good since it
            // invokes getter function of prop, which needs receiver
            // binding.
            for (; klass; klass = C.superclass(klass)) {
                var proto = (klass||{}).prototype;
                var d = proto && getPropertyDesc(proto, prop);
                if (d) return { desc: d, proto: proto };
            }
        };

        var makeCallApply = function(fun) {
            return { call: function(thisp) {
                return fun.apply(thisp, toA(arguments, 1));
            }, apply: function(thisp, args) {
                return fun.apply(thisp, args);
            } };
        };

        // proxy handler
        var handler = function(self) {
            return { get: function(rcvr, name) {
                rcvr = self || this;
                if (name === 'call' || name === 'apply') {
                    return makeCallApply(rcvr)[name];
                }
                var r = lookup(rcvr[INTERNAL].klass, name);
                if (!r) return;
                if (isFun(r.desc.get)) {
                    return r.desc.get.call(rcvr[INTERNAL].self);
                } else if (isFun(r.proto[name])) {
                    var fun = r.proto[name];
                    var bind = function() {
                        return fun.apply(rcvr[INTERNAL].self, arguments);
                    };
                    addInterface(bind, makeCallApply(fun), true);
                    return bind;
                } else {
                    return r.proto[name];
                }
            }, set: function(rcvr, name, val) {
                rcvr = self || this;
                var r = lookup(rcvr[INTERNAL].klass, name);
                if (!r) return false;
                if (isFun(r.desc.set)) {
                    r.desc.set.call(rcvr[INTERNAL].self, val);
                    return true;
                } else if (r.desc.writable) {
                    r.proto[name] = val;
                    return true;
                } else {
                    return false;
                }
            }, has: function(name) {
                return !!lookup((self||this)[INTERNAL].klass, name);
            } };
        };

        var desc = {};
        var proto;

        if (!USE_PROXY) {
            handler = handler(null);

            // collect all properties
            var props = [];
            [klass].concat(C.ancestors(klass)).forEach(function(a) {
                var proto = a.prototype;
                props = props.concat(toA(Object.getOwnPropertyNames(proto)));
            });

            // make property descriptors
            props.forEach(function(p) {
                desc[p] = { get: function() {
                    return handler.get.call(this, this, p);
                }, set: function(val) {
                    return handler.set.call(this, this, p, val);
                } };
            });

            proto = function(){}; // this must be a function or otherwise
                                  // $super cannot be .call
            addProperties(proto, desc);
        }

        return function(self) {
            /**
                Accessor to the constructor and properties of superclass.
                @name GNN.Class#$super
                @type function
                @description
                    Inside a method of an instance of a class defined by
                    <code>GNN.Class</code>,
                    <code>this.$super</code> refers to the constructor
                    of the superclass and <code>this.$super.method</code>
                    refers to a method named <code>method</code> in the
                    superclass(es).
                    <code>this.$super</code> is not accessible from outside
                    the method.

                    <p>Methods in which <code>this.$super</code> is used must
                    be added to the class via
                    <a href="#member"><code>member</code></a> or
                    <a href="#accessor"><code>accessor</code></a>.
                    This because we need to know static type information of
                    <code>this.$super</code> and this is done by binding
                    class information to the method.</p>

                    <p>Methods added to a superclass after the call of
                    <a href="#inherits">inherits</a> method on the subclass
                    are normally inaccessible via
                    <code>this.$super.method</code> in a method of the
                    subclass. <code>this.$super</code> is designed to lift
                    this restriction if Proxy API of ECMAScript Harmony is
                    available.</p>
                @see GNN.Class
            */
            var getSuper = function() {
                // We prepare ctor and proxies every time this.$super
                // is called since we want ctor[INTERNAL].klass to be
                // local to this.$super call. Otherwise, binding
                // $super and calling another this.$super may
                // override ctor[INTERNAL].klass of the first $super.
                var $super;
                var ctor = function() {
                    klass = ctor[INTERNAL].klass;
                    var r = klass.apply(this, arguments);
                    if (isRef(r)) return r;
                    return this;
                };
                addProperty(ctor, INTERNAL, { value: {} });
                ctor[INTERNAL].self = self;

                var callerClass = getCallSiteClass(getSuper);
                if (callerClass) {
                    ctor[INTERNAL].klass = C.superclass(callerClass);
                } else {
                    var msg = SUPER+' is called in illegal context';
                    throw new TypeError(msg);
                }

                if (USE_PROXY) {
                    $super = Proxy.createFunction(handler(ctor), ctor);
                } else {
                    $super = ctor;
                    setProto($super, proto, function(obj) {
                        addProperties(obj, desc);
                    });
                }

                return $super;
            };
            return { get: getSuper };
        };
    };
} ].reverse()[0](this);
