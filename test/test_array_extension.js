var Test = (function(B, A) {
    A.extend(Array.prototype);

    return {
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
                    t.isDeeply(this.apply(self ,method, d[1]), d[2],
                               ppself+'.'+method+ppargs);
                }
            } catch (e) {
                t.error(e+'', m);
            }
        }
    };
})(GNN.Base, GNN.Array);
