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
    // constants

    var SUPERCLASS = '$superclass';
    var SUPER = '$super';
    var Super = {};

    var tag = {};

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
                if (klass.$superFactory) {
                    var $super = klass.$superFactory(self);
                    var intfce = {}; intfce[SUPER] = $super;
                    addInterface(self, intfce, true);
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
            ctor[SUPERCLASS] = klass.init[SUPERCLASS];
            addInterface(ctor.prototype, klass.members, true);
            addProperties(ctor.prototype, klass.accessors, {
                configurable: true, writable: true
            });

            // class members
            var cmembers = merge(null, klass.cmembers);
            if (!klass.config.noSuperClassMembers) {
                C.ancestors(klass.init).forEach(function(a) {
                    fmerge(function(a, b) {
                        return a || b;
                    }, cmembers, a);
                });
            }
            merge(ctor, cmembers);
            merge(klass.init, cmembers);

            // $super
            delete klass.$superFactory;
            if (klass.base && !klass.config.noSuper) {
                klass.$superFactory = Super.factory(klass.init, klass.base);
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
        C.name = function(klass) {
            return B.className(isFun(klass) ? klass.prototype : klass);
        };
    }
    C.traits = function(klass) {
        var Traits = function(){};
        if (isFun(klass)) {
            Traits.prototype = klass.prototype;
        } else {
            Traits.prototype = klass;
        }
        return new Traits();
    };
    C.inherit = function(klass, base) {
        klass.prototype = C.traits(base);
        klass[SUPERCLASS] = klass.prototype.constructor;
        klass.prototype.constructor = klass;
        return klass;
    };
    C.ancestors = function(klass) {
        var r = [];
        while (klass=klass[SUPERCLASS]) r.push(klass);
        return r;
    };

    ////////////////////////////////////
    // super

    Super.ctor = function() {
        var klass = this.constructor;
        var base = klass[SUPERCLASS];
        var r = base.apply(this, arguments);
        if (isRef(r)) return r;
        return this;
    };

    Super.factory = function(klass, base) {
        var desc = {};
        var traits = C.traits(base);
        var a = C.ancestors(klass);
        for (var i=0; i < a.length; i++) {
            var proto = a[i].prototype;
            var props = Object.getOwnPropertyNames(proto);
            for (var j=0; j < props.length; j++) {
                (function(prop, fun) {
                    if (prop in desc) return;
                    if (!isFun(fun)) return;
                    desc[prop] = function() {
                        return fun.apply(this.self, arguments);
                    };
                    addInterface(desc[prop], {
                        call: function(thisp, args) {
                            args = Array.prototype.slice.call(arguments, 1);
                            return fun.apply(thisp, args);
                        },
                        apply: function(thisp, args) {
                            return fun.apply(thisp, args);
                        }
                    }, true);
                })(props[j], traits[props[j]]);
            }
        }

        var proto = function(){};
        addInterface(proto, desc, true);

        return function(self) {
            var $super = function() {
                return Super.ctor.apply(this, arguments);
            };
            $super.self = self;
            setProto($super, proto, function(obj) {
                addInterface(obj, desc, true);
            });
            return $super;
        };
    };
} ].reverse()[0](this);
