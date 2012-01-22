[ 'GNN', function(global) {
    var ns = this.pop();
    if (typeof global[ns] == 'undefined') global[ns] = {};
    var T = global[ns];
    var B = T.Base;

    T.Tester = function(prefix, tests, parent, callbacks) {
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
                run: function(test, testcase) {
                    try {
                        this.testcase = testcase;
                        test(this);
                        this.testcase = null;
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
                isExactly: function(obj, expected, name) {
                    this.log(obj === expected, {
                        name: name,
                        returned: obj,
                        expected: expected
                    });
                },
                ok: function(cond, name) {
                    this.is(!!cond, true, name);
                },
                isDeeply: function(obj, expected, name) {
                    this.log(B.eq(obj, expected), {
                        name: name,
                        returned: obj,
                        expected: expected
                    });
                },
                isAtLeast: function(obj, expected, name) {
                    this.log(B.covers(obj, expected), {
                        name: name,
                        returned: obj,
                        expected: expected
                    });
                },
                isDefined: function(obj, name) {
                    this.ok(B.isDefined(obj), name);
                },
                isUndefined: function(obj, name) {
                    this.ok(!B.isDefined(obj), name);
                },
                isa: function(obj, klass, name) {
                    this.ok(B.isA(obj, klass), name);
                },
                isThrown: function(fun, exc, name) {
                    var e;
                    try {
                        fun();
                    } catch (err) {
                        e=err;
                    }
                    B.isA(e, exc, name);
                },
                noThrow: function(fun, name) {
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
                    detail.name = detail.name || this.testcase;
                    if (result) passed++;
                    parent.progress(result, detail);
                },

                // utility
                pp: function(val) {
                    return B.pp(val, {object:{name:1},cyclic:{detail:1}});
                }
            };
        };

        var toA = function(a){ return (a instanceof Array) ? a : [ a ]; };

        var setup = function(w, d, parent) {
            var t = parent.t;
            d.body.appendChild(d.createTextNode(t.id));
            w.Tester = new TestHandler(parent, w.Array);
            w.GNN = { Tester: w.Tester, Base: B };

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
} ].reverse()[0](this);
