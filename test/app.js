var runTests = function(result, frames) {
    var prefix = {
        include: '../gnn',
        run:   '.'
    };
    var tests = [
        { id: 'GNN.Tester',
          include: [],
          run: 'test_tester.js'
        },
        { id: 'GNN.Base',
          include: 'base.js',
          run: 'test_base.js'
        },
        { id: 'GNN.Array.method',
          include: [ 'base.js', 'array.js' ],
          run: [ 'test_array_class.js',
                 'test_array.js',
                 'test_array_property_func.js' ]
        },
        { id: 'GNN.Array#method',
          include: [ 'base.js', 'array.js' ],
          run: [ 'test_array_instance.js',
                 'test_array.js',
                 'test_array_property.js' ]
        },
        { id: 'Array.prototype extension',
          include: [ 'base.js', 'array.js' ],
          run: [ 'test_array_extension.js',
                 'test_array.js',
                 'test_array_property.js' ]
        },
    ];

    result = document.getElementById(result);
    frames = document.getElementById(frames);

    var log = {
        parent: document.getElementById('log'),
        initial: document.getElementById('log_test_runner')
    };

    log.initial.appendChild(document.createTextNode('done'));

    var table = document.createElement('table');
    table.className = 'summary';
    var tr = document.createElement('tr');
    table.appendChild(tr);
    var labels = [ 'Test', 'Passed' ];
    for (var i=0; i < labels.length; i++) {
        var th = document.createElement('th');
        th.appendChild(document.createTextNode(labels[i]));
        tr.appendChild(th);
    }
    result.appendChild(table);

    var showDetails = function(parent, details) {
        var testcase = document.createElement('dl');
        testcase.className = 'testcase';
        for (var i=0; i < details.length; i++) {
            var d = details[i];
            var label = document.createElement('dt');
            label.className = d.passed ? 'passed' : 'failed';
            label.appendChild(document.createTextNode('#'+i+' '+(d.name||'')));
            testcase.appendChild(label);

            var result = document.createElement('dd');
            result.className = d.passed ? 'passed' : 'failed';

            if (d.message) {
                result.appendChild(document.createTextNode(d.message));
            } else {
                var table = document.createElement('table');
                var labels = [ 'returned', 'expected' ];
                for (var j=0; j < labels.length; j++) {
                    var tr = document.createElement('tr');
                    var th = document.createElement('th');
                    th.appendChild(document.createTextNode(labels[j]));
                    var td = document.createElement('td');
                    var val = GNN.DeepCheck.pp(d[labels[j]]);
                    td.appendChild(document.createTextNode(val));
                    tr.appendChild(th);
                    tr.appendChild(td);
                    table.appendChild(tr);
                }
                result.appendChild(table);
            }
            testcase.appendChild(result);
        }
        parent.appendChild(testcase);
    };
    var details = {};

    new GNN.Tester(prefix, tests, frames, {
        begin: function(t) {
            var src = t.run;
            if (!(src instanceof Array)) src = [ src ];

            var li = document.createElement('li');
            var logMsg = 'Running test suite "' + t.id + '"';
            logMsg = [ logMsg, '[' + src.join(', ') + ']...' ].join(' ');
            li.appendChild(document.createTextNode(logMsg));
            log.parent.appendChild(li);
            log[t.id] = { li: li, msg: logMsg };
        },
        progress: function(t, passed, detail) {
            var o = passed ? '.' : '!';
            log[t.id].li.appendChild(document.createTextNode(o));

            detail.passed = passed;
            if (!details[t.id]) details[t.id] = [];
            details[t.id].push(detail);
        },
        end: function(t, summary) {
            var li = log[t.id].li;
            while (li.firstChild) li.removeChild(li.firstChild);
            var msg = log[t.id].msg + 'done';
            li.appendChild(document.createTextNode(msg));
            summary.name = t.id;
            summary.score = summary.passed + '/' + summary.total;


            var tr1 = document.createElement('tr');
            var tr2 = document.createElement('tr');


            var props = [ 'name', 'score' ];
            for (var i=0; i < props.length; i++) {
                var td = document.createElement('td');
                td.className = props[i];

                var text = document.createTextNode(summary[props[i]]+'');
                if (props[i] == 'name') {
                    var a = document.createElement('a');
                    a.href = '.'; a.appendChild(text);
                    var callback = function(e) {
                        if (e.stopPropagation) {
                            e.stopPropagation();
                            e.preventDefault();
                        } else {
                            e.cancelBubble = true;
                            e.returnValue = false;
                        }
                        var disp = tr2.style.display;
                        tr2.style.display = (disp=='none') ? '' : 'none';
                    };
                    if (a.addEventListener) {
                        a.addEventListener('click', callback, false);
                    } else if (a.attachEvent) {
                        a.attachEvent('onclick', callback);
                    }
                    text = a;
                }

                td.appendChild(text);
                tr1.appendChild(td);
            }
            var passed = (summary.passed == summary.total);
            tr1.className = passed ? 'passed' : 'failed';

            tr2.className = 'detail';
            tr2.style.display = 'none';
            var detail = document.createElement('td');
            detail.setAttribute('colspan', 2);
            tr2.appendChild(detail);
            showDetails(detail, details[t.id])

            table.appendChild(tr1);
            table.appendChild(tr2);
        }
    });
};
