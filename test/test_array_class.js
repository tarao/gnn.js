var Test = (function(B, A) {
    var test = {
        klass: A,
        name: 'GNN.Array',
        delim: '.',
        sig: function(m){ return this.name+this.delim+m; },
        instance: function(){ return Array.apply(null, arguments); },
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
                    var self = this.instance.apply(this, d[0]||[1,2,3]);
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

                    if (A._preserveReturnValue.indexOf(method) >= 0) {
                        t.ok(!A.isExtendedArray(ret) && !(ret instanceof A),
                             m+' does not return a '+this.name+' but Array');
                    }
                }
            } catch (e) {
                t.error(e, m);
            }
        }
    };

    Tester.run(function(t) {
        t.isDeeply(A.fromArray([ 1, 2, 3 ]), [ 1, 2, 3 ]);
        t.ok(A.isExtendedArray(A.fromArray([ 1, 2, 3 ])));
        t.isDeeply(A.fromArray([ 1 ]), [ 1 ]);
        t.ok(A.isExtendedArray(A.fromArray([ 1 ])));
        t.isDeeply(A.fromArray([]), []);
        t.ok(A.isExtendedArray(A.fromArray([])));
    }, 'GNN.Array.fromArray');

    Tester.run(function(t) {
        t.ok(A.isExtendedArray(new A()),
             'a '+test.name+' is an exteded array');
        t.ok(!A.isExtendedArray(new Array()) && !(new Array() instanceof A),
             'an Array is not an exteded array');
    });

    return test;
})(GNN.Tester.Base, GNN.Array);
