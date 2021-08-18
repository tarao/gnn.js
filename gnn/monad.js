[ 'GNN', function(G) {
    var ns = this.pop();
    var T = G[ns];
    var B = T.Base;
    var C = T.Class;

    var toA = function(a, start, end) {
        return G.Array.prototype.slice.call(a, start, end);
    };

    var M;

    /** @ignore */
    var perform = function(args, m, rest) {
        if (B.isCallable(m) && !B.isDefined(m.monad)) {
            if (args.length < m.length) {
                // TODO: argument error
            }
            m = m.apply(this, toA(args, args.length - m.length));
        }
        if (!M.isMonad(m)) m = this.unit(m);

        rest = toA(arguments, 2);
        if (rest.length <= 0) return m

        var monad = m.monad;
        // TODO: TypeError if monad is undefined

        return monad.bind(m, function(x) {
            // TODO: match x against patternOf(m)
            //       call m.monad.fail if match failed
            return perform.apply(monad, [args.concat([x])].concat(rest));
        });
    };

    /**
        Monad interface.
        @class Undocumented
        @name M
        @exports M as GNN.Monad
    */
    M = T.Monad = C(function Monad() {
    }).member({
        run: function(m){ return m; },
        unit: function() {
            throw new TypeError('not implemented');
        },
        bind: function(m, f){ return m.bind(f); },
        fail: function(msg) {
            throw new Failure(msg);
        }
    }).accessor({
        // TODO: do we need this?
        monad: { get: function(){ return this; } }
    }).classMember({
        perform: function(args) {
            if (!(arguments.length == 1 && B.isArray(args))) {
                args = toA(arguments);
            }
            var type = M.Identity;
            if (B.className(args[0]) == 'Monad') {
                type = args.shift();
            }
            return perform.apply(type, [[]].concat(args));
        },
        run: function(args) {
            var m = M.perform.apply(null, arguments);
            return m.monad.run(m);
        },
        isMonad: function(m) {
            return B.isDefined(m.monad) && m.monad instanceof M;
        }
    });

    // exceptions
    M.Failure = function(msg) {
        this.name = 'Failure';
        this.message = msg || '';
    };
    M.Failure.prototype = new Error();
    M.Failure.prototype.constructor = M.Failure;

    // factories
    M.Proxy = C(function Proxy(obj) {
        this.obj = obj;
    }, M);

    M.make = function(defs) {
        var klass = C(function Monad(){}, M).member(defs)();
        var instance = C(function(){}).member({
            monad: klass,
            run: function(args){ return klass.run.apply(klass, arguments); },
            bind: function(f){ return klass.bind(this, f); }
        });
        return { monad: klass, instance: instance };
    };

    // Identity Monad
    M.Identity = (function(m) {
        var id = m.monad;
        id.Id = C(function Id(v){ this.value=v; }, m.instance);
        return id;
    })(M.make({
        run: function(m){ return m.value; },
        unit: function(x){ return M.Identity.Id(x); },
        bind: function(m, f){ return f(m.value); }
    }));

    // Maybe Monad
    M.Maybe = (function(m) {
        var maybe = m.monad;
        maybe.Nothing = C(function Nothing(){}, m.instance)();
        maybe.Just = C(function Just(v){ this.value=v; }, m.instance);
        return maybe;
    })(M.make({
        run: function(m){ return m.value; },
        unit: function(x){ return M.Maybe.Just(x); },
        bind: function(m, f) {
            if (m === M.Maybe.Nothing) return m;
            return f(m.value);
        },
        fail: function(){ return M.Maybe.Nothing; }
    }));

    // Error Monad
    M.Error = (function(m) {
        var err = m.monad;
        err.Left = C(function Left(v){ this.value=v; }, m.instance);
        err.Right = C(function Right(v){ this.value=v; }, m.instance);
        return err;
    })(M.make({
        raise: function(e){ return M.Error.Left(e); },
        run: function(m) {
            if (m instanceof M.Error.Left) throw m.value;
            return m.value;
        },
        unit: function(x){ return M.Error.Right(x); },
        bind: function(m, f) {
            if (m instanceof M.Error.Right) return f(m.value);
            return m;
        },
        fail: function(s){ return M.Error.Left(s); }
    }));

    // List Monad
    if (B.isDefined(T.Array)) {
        var A = T.Array;

        // TODO
        // A.Monad = new M.Proxy(A);
        // A.unit = function(){ return A.fromArray(arguments); }
        // A.addMethod('bind', function(f) {
        //     return G.Array.concat.apply(null, A.map(this, f));
        // });
        // A.addProperty('monad', { value: A.Monad });
        //   ^- this isn't nice because we don't need GNN.Array.monad(arr)
    }

    // Continuation Monad
    M.Continuation = (function(m) {
        var cont = m.monad;
        cont.F = C(function F(f){ this.func=f; }, m.instance);
        return cont;
    })(M.make({
        callcc: function(f) {
            var self = this;
            return M.Continuation.F(function(k) {
                return self.run(f.call(self, function(a) {
                    return M.Continuation.F(function(){ return k(a); });
                }), k);
            });
        },
        run: function(m, k) {
            return m.func.call(this, k || function(x){ return x; });
        },
        unit: function(x) {
            return M.Continuation.F(function(k){ return k(x); });
        },
        bind: function(m, f) {
            var self = this;
            return M.Continuation.F(function(k) {
                return m.func.call(self, function(a) {
                    return self.run(f.call(self, a), k);
                });
            });
        }
    }));

    // Deferred (maybe in a separate file)
    // possibly with ContT and ErrorT

} ].reverse()[0](this);



var A = GNN.Array;
var ArrayMonad = GNN.Class(function List() {
}, GNN.Monad).member({
    unit: function(args) {
        return A.fromArray(arguments);
    },
    bind: function(arr, f) {
        return Array.concat.apply(null, A.map(arr, f));
    }
})();

GNN.Base.addProperty(A.prototype, 'monad', {
    configurable: true, writable: true,
    value: ArrayMonad
});


var a = A(1,2,3,4);
console.debug(ArrayMonad.bind(
    ArrayMonad.bind(a, function(x) {
        return ArrayMonad.unit(x, x);
    }),
    function(x, i) {
        return ArrayMonad.unit(i, x*x);
    }));

console.debug(GNN.Monad.perform(function() {
    return a;   }, function(x) {
    return x+x; }, function(x, y) {
    return y*y;
}));

console.debug(GNN.Monad.perform(
    a,
    function(x){ return this.unit(x+x); },
    function(x, y){ console.log(x); return this.unit(y*y); }
));

console.debug(GNN.Monad.perform(
    GNN.Monad.Identity.unit([1, 2, 3]),
    function(x){ return this.unit(x[1]+3); }
));
console.debug(GNN.Monad.run(
    GNN.Monad.Identity.unit([1, 2, 3]),
    function(x){ return this.unit(x[1]+3); }
));

console.debug(GNN.Monad.perform(
    GNN.Monad.Maybe.unit([1, 2, 3]),
    function(x){ return this.unit(x[0]); },
    function(x){ return this.unit(x+3); }
));
console.debug(GNN.Monad.run(
    GNN.Monad.Maybe.unit([1, 2, 3]),
    function(x){ return this.unit(x[0]); },
    function(x){ return this.unit(x+3); }
));

console.debug(GNN.Monad.perform(
    GNN.Monad.Maybe.unit([1, 2, 3]),
    function(x){ return this.Nothing; },
    function(x){ return this.unit(x+3); }
));
console.debug(GNN.Monad.run(
    GNN.Monad.Maybe.unit([1, 2, 3]),
    function(x){ return this.Nothing; },
    function(x){ return this.unit(x+3); }
));

console.debug(GNN.Monad.run(GNN.Monad.Maybe, function() {
    return 1;   }, function(x) {
    return x+x; }, function(y) {
    return y+3;
}));

console.debug(GNN.Monad.perform(
    GNN.Monad.Error.unit([1, 2, 3]),
    function(x){ return this.unit(x[0]+5); },
    function(x){ return this.unit(x+5); }
));
console.debug(GNN.Monad.perform(
    GNN.Monad.Error.unit("hoge"),
    function(x){ return x+5; },
    function(x){ return x+"foo"; }
));

console.debug(GNN.Monad.perform(
    GNN.Monad.Error.unit([1, 2, 3]),
    function(x){ return this.raise("fail"); },
    function(x){ return this.unit(x+5); }
));

var func = function(n) {
    return GNN.Monad.run(
        GNN.Monad.Continuation.callcc(function(exit1) {
            if (n < 10) return exit1(n+'');
            var ns = ((n>>1)+'').split('');
            return GNN.Monad.perform(
                GNN.Monad.Continuation.callcc(function(exit2) {
                    if (ns.length < 3) return exit2(ns.length);
                    if (ns.length < 5) return exit2(n);
                    if (ns.length < 7) {
                        ns = ns.reverse();
                        while (ns[0]=='0') ns.shift();
                        return exit1(ns.join(''));
                    }
                    return this.unit('overflow');
                }),
                function(nn){ return "(ns = " + ns + ") "+nn; }
            );
        }),
        function(str){ return 'Answer: ' + str; }
    );
};

console.debug(func(5));
// Answer: 5

console.debug(func(120));
// Answer: (ns = 6,0) 2

console.debug(func(199));
// Answer: (ns = 9,9) 2

console.debug(func(3000));
// Answer: (ns = 1,5,0,0) 3000

console.debug(func(52323));
// Answer: 16162

console.debug(func(2000000));
// Answer: (ns = 1,0,0,0,0,0,0) overflow

/*
var f = function(k) {
  setTimeout(function() {
    k([1, 2, 3]);
  }, 0);
};

var backpatch = function(f) {
  var k = function(){};
  var self = {
    set: function(kk){ self.k=kk; },
    k: function(){}
  };
  f(function(){ self.k.apply(null, arguments); });
  return self;
};

backpatch(f).set(function(val){ console.debug(val); });

*/
