var Test = (function(B, H) {
    var test = {
        klass: H,
        name: 'GNN.Hash',
        delim: '.',
        sig: function(m){ return this.name+this.delim+m; },
        instance: function(obj){ return obj; },
        call: function(self, m, args) {
            args = Array.prototype.slice.call(arguments);
            args = args.slice(2);
            return this.apply(self, m, args);
        },
        apply: function(self, m, args) {
            return this.klass[m].apply(null, [self].concat(args));
        },
        testMethod: function(method, defs, atleast) {
            var t = Tester;
            var m = this.sig(method);
            try {
                t.ok(B.isCallable(this.klass[method]), m+' is defined');
                for (var i=0; i < defs.length; i++) {
                    if (!defs[i]) break;
                    var d = defs[i];
                    var self = this.instance(d[0]);
                    var ppargs = t.pp([self].concat(d[1]));
                    ppargs = ppargs.replace(/^\[(.*)\]$/, '($1)');
                    var ret = this.apply(self, method, d[1]);
                    if (typeof d[2] == 'function') {
                        var desc = '('+t.pp(d[2])+')';
                        desc += '('+this.name+'.'+method+ppargs+')';
                        t.ok(d[2](ret), desc);
                    } else if (atleast){
                        t.isAtLeast(ret, d[2], this.name+'.'+method+ppargs);
                    } else {
                        t.isDeeply(ret, d[2], this.name+'.'+method+ppargs);
                    }

                    if (H._preserveReturnValue.indexOf(method) >= 0) {
                        t.ok(!H.isHash(ret) && ret instanceof Object,
                             m+' does not return a '+this.name+' but Object');
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
        t.ok(!H.isHash(new Object()) && !(new Object instanceof H),
             'an Object is not a Hash');
    });


    Tester.run(function(t) {
        t.isDeeply(H('a', 1, 'b', 2, 'c', 3), { a:1, b:2, c:3 },
                   'construct from arguments');
        t.isDeeply(H([ 'a', 1, 'b', 2, 'c', 3 ]), { a:1, b:2, c:3 },
                   'construct from an Array');
    });

    return test;
})(GNN.Base, GNN.Hash);
