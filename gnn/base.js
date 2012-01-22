[ 'GNN' , function(global) {
    var ns = this.pop();
    global[ns] = { Base: {} };

    var T = global[ns];
    var B = T.Base;

    ////////////////////////////////////
    // namespace

    B.global = global;
    B.lookup = function(obj, fqn) {
        obj = obj || B.global;
        return fqn.split('.').reduce(function(r,n){return (r||{})[n];}, obj);
    };


    ////////////////////////////////////
    // objects properties

    B.isDefined = function(obj) {
        return !(typeof obj == 'undefined');
    };
    B.isCallable = function(obj) {
        return typeof obj == 'function';
    };
    B.respondTo = function(obj, name) {
        return B.isDefined(obj) && B.isCallable(obj[name]);
    };
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
    B.isArray = function(obj) {
        if (B.isCallable(Array.isArray)) {
            return Array.isArray(obj);
        } else {
            return B.isA(obj, 'Array');
        }
    };
    B.isObject = function(obj){ return typeof obj == 'object'; };
    B.isRef = function(obj){ return B.isCallable(obj) || B.isObject(obj); };
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
    B.funName = function(fun) {
        if (!B.isCallable(fun)) throw new TypeError('funName: not a function');
        if (fun.name) return fun.name;
        if (/^\s*function\s+(.+?)\s*\(/.test(fun+'')) return RegExp.$1;
    };
    B.className = function(obj) {
        if (!B.isRef(obj)) throw new TypeError('className: not a reference');
        return B.funName(obj.constructor) || '';
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

    // check if there is a simulation over given labelled state transition
    // [default value]
    //   state: object
    //   label: property of the object
    //   transition: reference to another object
    // the default behaviour is actually a bisimulation
    B.sim = function(lhs, rhs, axiom, transition) {
        axiom = axiom || deep.refl;
        transition = transition || function(lhs, rhs) {
            return deep.properties(deep.labels, lhs, rhs);
        };
        return deep.sim(lhs, rhs, new deep.Seen(), axiom, transition);
    };

    B.eq = function(lhs, rhs){ return B.sim(lhs, rhs); };
    B.covers = function(lhs, rhs) {
        return B.sim(lhs, rhs, null, function(lhs, rhs) {
            return deep.properties(deep.labelsRight, lhs, rhs);
        });
    };

    ////////////////////////////////////
    // objects traversal

    B.Visitor = function(kindOf, methods) {
        var visitor = function(seen) { return {
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
    B.prettify = function(code) {
        try {
            return ppFunBody(new Function(code), { indent: true });
        } catch (e) {
            return code;
        }
    };
    B.pp = function(obj, args) {
        args = args || {};
        var fargs = args['function'] || { indent: args.prettify };
        var fdetail = !('detail' in fargs) || fargs.detail;
        var prettify = args.prettify && fdetail;

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
                var name = function(x){ return x; };
                if ((args.object||{}).name) {
                    var klass = B.className(obj);
                    if (klass == 'Object') {
                        // ommit
                    } else if (prettify) {
                        name = function(x){ return klass+'('+x+')'; };
                    } else {
                        name = function(x){ return klass+' '+x; };
                    }
                }
                var ss = [];
                for (var k in obj) {
                    var val = this.visit(obj[k]);
                    if (!/^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(k)) {
                        k = "'"+escape(k, "'")+"'";
                    }
                    ss.push(k + ': ' + val);
                }
                return name('{'+ss.join(', ')+'}');
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
            return B.isObject(a) && B.isObject(b) ? B.dmerge(a, b) : b;
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
    B.addProperty = function(obj, name, desc, config) {
        desc = B.merge(desc, config||{});
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
    B.addProperties = function(obj, props, config) {
        for (var k in props) B.addProperty(obj, k, props[k], config);
        return obj;
    };
    B.addInterface = function(target, intrfce, override) {
        var fun = override;
        if (!B.isDefined(override)) override = target;
        if (!B.isCallable(override)) {
            fun = function(a, b, k) { // do not override
                if (!B.isDefined(override[k])) return b;
            };
        }
        B.fmerge(function(a, b, k) {
            b = fun(a, b, k);
            if (b) {
                B.addProperty(target, k, {
                    configurable: true,
                    writable: true,
                    value: b
                });
            }
        }, null, intrfce);
    };
} ].reverse()[0](this);
