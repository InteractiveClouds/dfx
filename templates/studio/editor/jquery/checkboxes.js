
var build = function(params) {
    var snippet = '';
    
	snippet += 'input';
    if (params.id!='') {
        snippet += '#'+params.id;
  	 }
    snippet += '('
    
    if (params.name!='') {
        snippet += 'name="'+params.name+'", ';
    }        
    
    snippet += 'type="checkbox"';
    
    snippet += ")";
    
    if (params.label!='') {
        snippet += ' '+params.label;
    }
    
    return snippet;
};

exports.build = build;