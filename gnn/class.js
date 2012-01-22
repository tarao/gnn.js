[ 'GNN', function(global) {
    var ns = this.pop();
    var T = global[ns];
    var B = T.Base;

    var SUPERCLASS = '$superclass';
    var SUPER = '$super';
    var Super = {};

    var tag = {};

    var C;
    C = T.Class = function Class(init, base) {
        var klass = { members: {}, cmembers: {}, config: {} };

        if (B.isObject(init)) {
            var cmembers = init;
            init = cmembers.initialize;
            if ('initialize' in cmembers) delete cmembers.initialize;
            B.merge(klass.cmembers, cmembers);
        }
        init = init || function Object(){};
        klass.init = init;

        if (B.isObject(base)) {
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
                    B.addInterface(self, intfce, {});
                }
                var r = klass.init.apply(self, arguments);
                if (B.isRef(r)) return r;
                return self;
            }
        };

        var update = function(args) {
            if (args) { for (var p in args) klass[p] = args[p]; }

            if (!B.isCallable(klass.init)) {
                throw new TypeError('initializer must be a function');
            }

            // inheritance
            if (klass.base) C.inherit(klass.init, klass.base);
            ctor.prototype = klass.init.prototype;
            ctor[SUPERCLASS] = klass.init[SUPERCLASS];
            B.addInterface(ctor.prototype, klass.members, {});

            // class members
            var cmembers = B.merge(null, klass.cmembers);
            if (!klass.config.noSuperClassMembers) {
                var a = C.ancestors(klass.init);
                B.fmerge.apply(null, [ function(a,b) {
                    return a || b;
                }, cmembers ].concat(a));
            }
            B.merge(ctor, cmembers);
            B.merge(klass.init, cmembers);

            // $super
            delete klass.$superFactory;
            if (klass.base && !klass.config.noSuper) {
                klass.$superFactory = Super.factory(klass.init, klass.base);
            }

            return ctor;
        };

        var def = {
            initializer: function(init){ return update({ init: init }); },
            inherits: function(base){ return update({ base: base }); },
            config: function(config){ return update({ config: config }) },
            member: function(members, rest) {
                if (typeof members == 'string' && B.isDefined(rest)) {
                    var m = members; members = {}; members[m] = rest;
                }
                members = B.merge(klass.members, members||{});
                return update({ members: members || {} });
            },
            classMember: function(members, rest) {
                if (typeof members == 'string' && B.isDefined(rest)) {
                    var m = members; members = {}; members[m] = rest;
                }
                members = B.merge(klass.cmembers, members||{});
                return update({ cmembers: members });
            }
        };
        B.merge(ctor, def);

        return update();
    };

    C.name = function(klass) {
        return B.className(B.isCallable(klass) ? klass.prototype : klass);
    };
    C.traits = function(klass) {
        var Traits = function(){};
        if (B.isCallable(klass)) {
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

    Super.ctor = function() {
        var klass = this.constructor;
        var base = klass[SUPERCLASS];
        var r = base.apply(this, arguments);
        if (B.isRef(r)) return r;
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
                    if (!B.isCallable(fun)) return;
                    desc[prop] = function() {
                        return fun.apply(this.self, arguments);
                    };
                    B.addInterface(desc[prop], {
                        call: function(thisp, args) {
                            args = Array.prototype.slice.call(arguments, 1);
                            return fun.apply(thisp, args);
                        },
                        apply: function(thisp, args) {
                            return fun.apply(thisp, args);
                        }
                    }, {});
                })(props[j], traits[props[j]]);
            }
        }

        var proto = function(){};
        B.addInterface(proto, desc, {});

        return function(self) {
            var $super = function() {
                return Super.ctor.apply(this, arguments);
            };
            $super.self = self;
            B.setProto($super, proto, function(obj) {
                B.addInterface(obj, desc, {});
            });
            return $super;
        };
    };
} ].reverse()[0](this);
