var Test = (function(B, H) {
    var test = {
        klass: H,
        name: 'GNN.Hash',
        delim: '#',
        sig: function(m){ return this.name+this.delim+m; },
        instance: function(){ return this.klass.apply(null, arguments); },
        call: function(self, m, args) {
            args = Array.prototype.slice.call(arguments);
            args = args.slice(2);
            return this.apply(self, m, args);
        },
        apply: function(self, m, args) {
            return self[m].apply(self, args);
        },
        testMethod: function(method, defs, atleast) {
            var t = Tester;
            var m = this.sig(method);
            try {
                t.ok(B.isCallable(this.klass({ a: 1, b: 2})[method]),
                     m+' is defined');
                for (var i=0; i < defs.length; i++) {
                    if (!defs[i]) break;
                    var d = defs[i];
                    var self = this.instance(d[0]);
                    var ppself = t.pp(self);
                    ppself = ppself.replace(/^\[(.*)\]$/, this.name+'($1)');
                    var ppargs = t.pp(d[1]).replace(/^\[(.*)\]$/, '($1)');
                    var ret = this.apply(self, method, d[1]);
                    if (typeof d[2] == 'function') {
                        var desc = '('+t.pp(d[2])+')';
                        desc += '('+ppself+'.'+method+ppargs+')';
                        t.ok(d[2](ret), desc);
                    } else if (atleast){
                        t.isAtLeast(ret, d[2], ppself+'.'+method+ppargs);
                    } else {
                        t.isDeeply(ret, d[2], ppself+'.'+method+ppargs);
                    }

                    if (H._preserveReturnValue.indexOf(method) >= 0) {
                        // we can't do (ret instanceof H) here
                        // because ret is extended by copying methods
                        // to a new instace of ordinary Object (in IE)
                        t.ok(H.isHash(ret),
                             m+' returns a '+this.name);
                    }
                }
            } catch (e) {
                t.error(e, m);
            }
        }
    };

    Tester.run(function(t) {
        t.ok(H.isHash(new H()) && new H() instanceof H,
             'a '+test.name+' is a Hash');
        t.ok(!H.isHash(new Object()) && !(new Object() instanceof H),
             'an Object is not a Hash');
    });

    Tester.run(function(t) {
        var methods = [];
        for (var k in H.methods) methods.push(k);

        var tmp = test.instance({ a:1, b:2, c:3 });
        var props = [];
        for (var k in tmp) props.push(k);

        var b = true;
        for (var i=0; i < props.length; i++) {
            b = b && methods.indexOf(props[i]) < 0;
        }
        t.ok(b, 'methods are not enumerable');
    });

    Tester.run(function(t) {
        t.isDeeply(new H('a', 1, 'b', 2, 'c', 3), { a:1, b:2, c:3 },
                   'construct from arguments');
        t.isDeeply(new H([ 'a', 1, 'b', 2, 'c', 3 ]), { a:1, b:2, c:3 },
                   'construct from an Array');
    });

    return test;
})(GNN.Base, GNN.Hash);
