if (typeof GNN == 'undefined') GNN = {};

(function(ns) {
    ns.DeepCheck = (function() {
        var isa = function(obj, klass) {
            if (typeof klass == 'string') {
                var c = Object.prototype.toString.call(obj);
                c = c.substring('[object '.length, c.length-1);
                return c == klass;
            }
            if (obj instanceof klass) return true;
        };
        var isArray = function(obj){ return isa(obj, 'Array'); };
        return {
            pp: function(obj, hideFunBody, seen) {
                if (typeof obj == 'undefined') return 'undefined';
                if (obj === null) return 'null';

                if (typeof obj == 'object') {
                    seen = seen || [];
                    if (isArray(obj)) {
                        return this.ppArray(obj, hideFunBody, seen);
                    } else {
                        return this.ppHash(obj, hideFunBody, seen);
                    }
                } else if (typeof obj == 'function') {
                    var str = obj+'';
                    str = str.replace(/^\s+/, '').replace(/\s+/g, ' ');
                    var i = str.indexOf('{');
                    if (i >= 0 && hideFunBody) {
                        str = str.substr(0, idx) + '{...}';
                    }
                    return str;
                } else {
                    return obj+'';
                }
            },
            ppArray: function(obj, flag, seen) {
                seen = (seen || []).slice(0); // dup
                for (var i=0; i < seen.length; i++) {
                    if (seen[i] == obj) return '[...]';
                }
                seen.push(obj);

                var arr = [];
                for (var i=0; i < obj.length; i++) {
                    arr.push(this.pp(obj[i], flag, seen));
                }
                return '['+arr.join(', ')+']';
            },
            ppHash: function(obj, flag, seen) {
                seen = (seen || []).slice(0); // dup
                for (var i=0; i < seen.length; i++) {
                    if (seen[i] == obj) return '{...}';
                }
                seen.push(obj);

                var arr = [];
                for (var k in obj) {
                    arr.push(k + ': ' + this.pp(obj[k], flag, seen));
                }
                return '{'+arr.join(', ')+'}';
            },
            eq: function(lhs, rhs, seen) {
                if ((typeof obj) != (typeof expected)) return false;
                if (lhs == null && rhs == null) return true;
                if (lhs == null || rhs == null) return false;

                if (lhs == rhs) {
                    return true;
                } else if (isArray(lhs) && isArray(rhs)) {
                    return this.eqArray(lhs, rhs, seen || []);
                } else if (isArray(lhs) || isArray(rhs)) {
                    return false;
                } else if (typeof lhs == 'object') {
                    return this.eqHash(lhs, rhs, seen || []);
                }

                return false;
            },
            eqArray: function(lhs, rhs, seen) {
                if (lhs == rhs) return true;

                seen = (seen || []).slice(0); // dup
                for (var i=0; i < seen.length; i++) {
                    if (seen[i][0] == lhs) return seen[i][1] == rhs;
                }
                seen.push([ lhs, rhs ]);

                if (lhs.length != rhs.length) return false;
                for (var i=0; i < lhs.length; i++) {
                    if (!this.eq(lhs[i], rhs[i], seen)) return false;
                }
                return true;
            },
            eqHash: function(lhs, rhs, seen) {
                if (lhs == rhs) return true;

                seen = (seen || []).slice(0); // dup
                for (var i=0; i < seen.length; i++) {
                    if (seen[i][0] == lhs) return seen[i][1] == rhs;
                }
                seen.push([ lhs, rhs ]);

                var keys = {};
                for (var k in lhs) keys[k]=true;
                for (var k in rhs) keys[k]=true;

                for (var k in keys) {
                    if (!this.eq(lhs[k], rhs[k], seen)) return false;
                }
                return true;
            }
        };
    })();

    ns.Tester = function(prefix, tests, parent, callbacks) {
        var current = 0;
        callbacks = callbacks||{};
        callbacks.begin = callbacks.begin || function(){};
        callbacks.end = callbacks.end || function(){};
        callbacks.progress = callbacks.progress || function(){};

        var TestHandler = function(parent, Array) {
            var total = 0;
            var passed = 0;
            var startTime = new Date().getTime();

            return {
                name: parent.t.name,
                wait: null,
                run: function(test) {
                    try {
                        test(this);
                    } catch (e) {
                        this.error(e);
                    }
                },
                finish: function() {
                    parent.finished({
                        time: new Date().getTime() - startTime,
                        total: total,
                        passed: passed,
                        failed: total - passed
                    });
                },
                loaded: function(){ if (!this.wait) this.finish(); },

                // assertions
                error: function(msg, name) {
                    msg = msg || '';
                    if (typeof msg != 'string') {
                        msg = [
                            msg+'', msg.lineNumber, msg.fileName
                        ].join(', ');
                    }
                    this.log(false, { name: name, message: msg });
                },
                is: function(obj, expected, name) {
                    this.log(obj == expected, {
                        name: name,
                        returned: obj,
                        expected: expected
                    });
                },
                ok: function(cond, name) {
                    this.is(!!cond, true, name);
                },
                isDeeply: function(obj, expected, name) {
                    this.log(ns.DeepCheck.eq(obj, expected), {
                        name: name,
                        returned: obj,
                        expected: expected
                    });
                },
                isUndefined: function(obj, name) {
                    this.ok(typeof obj == 'undefined', name);
                },
                isa: function(obj, klass, name) {
                    this.ok(obj instanceof klass, name);
                },
                isThrown: function(fun, exc, name) {
                    var e;
                    try {
                        fun();
                    } catch (err) {
                        e=err;
                    }
                    this.isa(e, exc, name);
                },
                nothrow: function(fun, name) {
                    try {
                        fun();
                    } catch (e) {
                        t.error(e, name);
                        return;
                    }
                    this.ok(true, name);
                },

                // callback to the parent
                log: function(result, detail) {
                    total++;
                    if (result) passed++;
                    parent.progress(result, detail);
                },

                // utility
                pp: function(val){ return ns.DeepCheck.pp(val); }
            };
        };

        var toA = function(a){ return (a instanceof Array) ? a : [ a ]; };

        var setup = function(w, d, parent) {
            var t = parent.t;
            d.body.appendChild(d.createTextNode(t.id));
            w.Tester = new TestHandler(parent, w.Array);
            w.GNN = { Tester: w.Tester };

            var head = d.getElementsByTagName('head')[0];
            var load = function(path, callback, error) {
                var script = d.createElement('script');
                script.src = path + '?' + encodeURI(new Date()+'');
                script.type = 'text/javascript';
                if (script.addEventListener) {
                    script.onload = callback;
                    script.onerror = error;
                } else {
                    script.onreadystatechange = function(e) {
                        switch (e.srcElement.readyState || '') {
                        case 'loaded':
                        case 'complete':
                            callback();
                            break;
                        }
                    };
                }
                head.appendChild(script);
            };

            var src = [ 'include', 'run' ];
            var files = [];
            for (var i=0; i < src.length; i++) {
                var s = src[i];
                var f = toA(t[s]);
                for (var j=0; j < f.length; j++) {
                    var file = [ prefix[s], f[j] ].join('/');
                    files.push(file);
                }
            }

            if (typeof console == 'undefined') console={log:function(){}};
            var finish = function(){ w.Tester.loaded(); };
            var loadFrom = function(i) {
                if (i < files.length) {
                    load(files[i], function() {
                        console.log('loaded '+files[i]);
                        loadFrom(i+1);
                    }, function() {
                        console.log('load failed '+files[i]);
                        w.Tester.error('failed to load "'+files[i]+'"');
                        finish();
                    });
                } else {
                    finish();
                }
            };
            loadFrom(0);
        };

        var self = {
            t: null,
            progress: function(passed, detail) {
                callbacks.progress(this.t, passed, detail);
            },
            finished: function(summary) {
                if (this.t == null) alert('hoge');
                callbacks.end(this.t, summary);
                this.t = null;
                this.next();
            },
            next: function() {
                setTimeout(function() {
                    if (current < tests.length) {
                        self.t = tests[current++];
                        if (self.t == null) self.next();
                        callbacks.begin(self.t);

                        var iframe = document.createElement('iframe');
                        var div = document.createElement('div');
                        parent.appendChild(div);
                        div.appendChild(iframe);

                        var wnd = iframe.contentWindow;
                        var doc = wnd.document;
                        doc.open();
                        doc.writeln('<head></head>');
                        doc.writeln('<body></body>');
                        setup(wnd, doc, self);
                        doc.close();
                    }
                }, 0);
            }
        };

        self.next();
        return self;
    };
})(GNN);
