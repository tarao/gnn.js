[ 'GNN' , function(G) {
    var ns = this.pop();
    if (typeof G[ns] == 'undefined') G[ns] = {};
    G[ns].Base = {};

    var T = G[ns];
    var B = T.Base || {};

    ////////////////////////////////////
    // functional

    var F;
    /**
        Functional
        @class Undocumented
        @name F
        @exports F as GNN.Fun
    */
    F = T.Fun = function(){};

    F.noop = function(){};
    F.id = function(x){ return x; };
    F.nth = function(n){ return function(){ return arguments[n]; }; };
    F.fst = B.nth(0);
    F.snd = B.nth(1);
    F.bind = function(fn, self, args) {
    };
    F.curry = function(fn, args) {
    };
    F.compose = function(fns) {
        var list = [];
        for (var i=0; i < arguments.length; i++) {
            var f = arguments[i];
            if (B.isCallable(f)) list.push(f);
        }
        if (list.length == 0) {
            throw new TypeError('compose(): no function specified');
        }
        return function() {
            var args = arguments;
            for (var i=list.length-1; 0 <= i; i--) {
                args = [ list[i].apply(null, args) ];
            }
            return args[0];
        };
    };
    F.operator = {
    };
    F.comparator = {
    };
} ].reverse()[0](this);
