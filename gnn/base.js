if (typeof GNN == 'undefined') GNN = {};
if (typeof GNN.Base == 'undefined') GNN.Base = {};

(function(T /* top level */, B /* Base */) {
    B.noop = function(){};
    B.global = function(){ return (function(){ return this; }).call(null); };

    ////////////////////////////////////
    // objects

    B.isDefined = function(obj) {
        return !(typeof obj == 'undefined');
    };
    B.isCallable = function(obj) {
        return typeof obj == 'function';
    };
    B.respondTo = function(obj, name) {
        return B.isDefined(obj) && B.isCallable(obj[name]);
    };
    B.fmerge = function(fun, objs) {
        var self = arguments[1];
        if (self == null) self = {};
        for (var i=2; i < arguments.length; i++) {
            var other = arguments[i];
            if (other == null) continue;
            for (var p in other) {
                var v = fun(self[p], other[p], p);
                if (B.isDefined(v)) self[p] = v;
            }
        }
        return self;
    }
    B.merge = function(objs) {
        var args = [ function(a,b){return b;} ];
        for (var i=0; i < arguments.length; i++) args.push(arguments[i]);
        return B.fmerge.apply(null, args);
    };
    B.dmerge = function(objs) {
        var args = [ function(a, b) {
            return typeof a == 'object' && typeof b == 'object' ?
                    B.dmerge(a, b) : b;
        } ];
        for (var i=0; i < arguments.length; i++) args.push(arguments[i]);
        return B.fmerge.apply(null, args);
    };


    ////////////////////////////////////
    // class definition

    B.setProto = function(obj, proto, alt) {
        if (obj != null && B.isDefined(obj.__proto__)) {
            obj.__proto__ = proto;
        } else if (alt) {
            alt(obj, proto);
        }
        return obj;
    };
    B.addProperty = function(obj, name, desc) {
        if ('defineProperty' in obj) {
            obj.defineProperty(name, desc);
        } else if ('defineProperty' in Object) {
            Object.defineProperty(obj, name, desc);
        } else {
            if ('get' in desc && '__defineGetter__' in obj) {
                obj.__defineGetter__(name, desc.get);
            }
            if ('set' in desc && '__defineSetter__' in obj) {
                obj.__defineSetter__(name, desc.set);
            }
        }
        return obj;
    };
    B.addProperties = function(obj, props) {
        for (var k in props) B.addProperty(obj, k, props[k]);
        return obj;
    };
    B.addInterface = function(target, intrfce, override) {
        var fun = override;
        if (typeof override == 'undefined') override = target;
        if (typeof override != 'function') {
            fun = function(a, b, k) { // do not override
                if (!B.isDefined(override[k])) return b;
            };
        }
        B.fmerge(function(a, b, k) {
            b = fun(a, b, k);
            if (b) {
                B.addProperty(target, k, {
                    configurable: true,
                    get: function(){ return b; }
                });
            }
        }, null, intrfce);
    };
})(GNN, GNN.Base);
