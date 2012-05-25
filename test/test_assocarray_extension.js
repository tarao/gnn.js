var Test = (function(B, A, AA) {
    var test = {
        klass: Array,
        name: 'Array',
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
        testMethod: function(method, defs) {
            var t = Tester;
            var m = this.sig(method);
            try {
                t.ok(B.isCallable(this.klass(1, 2, 3)[method]),
                     m+' is defined');
                for (var i=0; i < defs.length; i++) {
                    if (!defs[i]) break;
                    var d = defs[i];
                    var self = this.instance.apply(this, d[0]||[1,2,3]);
                    var ppself = t.pp(self);
                    ppself = ppself.replace(/^\[(.*)\]$/, this.name+'($1)');
                    var ppargs = t.pp(d[1]).replace(/^\[(.*)\]$/, '($1)');
                    var ret = this.apply(self ,method, d[1]);
                    t.isDeeply(ret, d[2], ppself+'.'+method+ppargs);
                }
            } catch (e) {
                t.error(e, m);
            }
        }
    };

    var natives = [];
    Tester.run(function() {
        for (var k in AA.methods) natives.push(k);
        natives = A.filter(natives, function(m){return !!Array.prototype[m];});
    });

    AA.extend(Array.prototype);

    Tester.run(function(t) {
        t.ok(AA.isAssocArray(new Array()),
             'an Array is an associative array');
    });

    Tester.run(function(t) {
        var methods = [];
        for (var k in AA.methods) methods.push(k);

        var tmp = test.instance(1, 2, 3);
        var props = [];
        for (var k in tmp) props.push(k);

        t.ok(A.every(props, function(p){ return !A.member(methods, p); }),
             'methods are not enumerable');
    });

    Tester.run(function(t) {
        var tmp = test.instance(1, 2, 3);
        t.ok(A.every(natives, function(m) {
            return tmp[m] == Array.prototype[m];
        }), 'native methods are not overridden ['+natives.join(', ')+']');
    });

    return test;
})(GNN.Tester.Base, GNN.Array, GNN.AssocArray);
