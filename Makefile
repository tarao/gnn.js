JSBASEFILES=gnn/base.js gnn/tester.js
JSFILES=$(filter-out $(JSBASEFILES), $(wildcard gnn/*.js))

doc: $(JSBASEFILES) $(JSFILES)
	jsdoc -u -d=doc $(JSBASEFILES) $(JSFILES)
	touch doc
