
var build = function(params) {
    var snippet = '', tab_prefix='', i=0;
    
    if (params.markup=='Anchor') {
        snippet += 'a';
        if (params.id!='') {
            snippet += '#'+params.id;
        }
        snippet += '(href="#", ';
    } else if (params.markup=='Button') {
        snippet += 'button';
        if (params.id!='') {
            snippet += '#'+params.id;
        }
        snippet += '(';
    } else {
        snippet += 'input';
        if (params.id!='') {
            snippet += '#'+params.id;
        }
        snippet += '(type="'+params.markup+'", ';
    }
    
    snippet += 'data-theme="'+params.theme+'"';
    
    if (params.inline=='true') {
        snippet += ', data-inline="true"';
    }
    if (params.mini=='true') {
        snippet += ', data-mini="true"';
    }
    
    if (params.icon!='') {
        snippet += ', data-icon="'+params.icon+'"';
    }
    
    if (params.iconPosition!='') {
        snippet += ', data-iconpos="'+params.iconPosition+'"';
    }
    
    snippet += ")";
    
    if (params.label!='') {
        snippet += ' '+params.label;
    }
    
    if (params.verticalGroup=='true') {
        for (i=0; i<params._tabCount; i++) {
            tab_prefix += '\t';
        }
        snippet = 'div(data-role="controlgroup")\n\t' + tab_prefix + snippet;
    } else if (params.horizontalGroup=='true') {
        for (i=0; i<params._tabCount; i++) {
            tab_prefix += '\t';
        }
        snippet = 'div(data-role="controlgroup", data-type="horizontal")\n\t' + tab_prefix + snippet;
    }
    
    return snippet;
};

exports.build = build;