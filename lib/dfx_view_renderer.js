/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

 // Declaration of main modules
 var fs = require('graceful-fs');
 var path = require('path');
 //var Q = require('q');
 //var QFS = require('q-io/fs');

 var renderer = {};

 renderer.render = function(req) {
	var view_definition = req.body.view_source;

    var view_html = '';
    for (var i=0; i<view_definition.definition.default.length; i++) {
      view_html += renderer.renderComponent( view_definition.definition.default[i] );
    }

    return view_html;

 }

 renderer.renderComponent = function(component_definition) {
   	'use strict';
   	/*
      Process:
      (1) html_template -> (2) conditional_template -> (3) final_template

      Resolve Fragments (1) -> Resolve Expression like attribute values (1) -> Resolve Conditional html attributes (2) -> Resolve Component ID (2) -> Resolve attribute values (3)
   	*/


   	var m, m_exp_attr, m_cond_attr, m_attr;
   	var attributes = component_definition.attributes;
   	var html_origin = fs.readFileSync(path.join(__dirname, '..', 'gcontrols/web/'+component_definition.type+'_compile.html')).toString();
   	var json_template = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'gcontrols/web/'+component_definition.type+'.json')).toString());

   	renderer.mergeWithOverriddenAttributes(json_template, attributes);
   	attributes = json_template;
	console.log('===' + component_definition.type + '===');
	console.log(attributes);
	console.log('============');


   	/* Conditional Restructuration of Template */
   	var conditional_re = /(FRAG-IF{{)(.*?)(}})((.|\n)*?)(FRAG-ENDIF)/g;
   	var html_template = html_origin;

   	while ((m = conditional_re.exec(html_origin)) !== null) {
    	if (m.index === conditional_re.lastIndex) {
    		conditional_re.lastIndex++;
    	}
		var condition = m[0].substring( 9, m[0].indexOf('}}') );
		var replace_block = '';
		if (eval(condition)) {
		replace_block = m[0].substring( m[0].indexOf('}}')+3, m[0].indexOf('FRAG-ENDIF') );
		}
		var conditional_single_re = new RegExp('(FRAG-IF{{' + condition + ')((.|\n)*?)(FRAG-ENDIF)');
		html_template = html_template.replace(conditional_single_re, replace_block);
   	}

   	/* Expression attribute values */
   	var expession_attr_re = /(ATTR-EXP{{)(.*?)(}})(.*?)(ATTR-ENDEXP)/g;
	var expr_template = html_template;

	while ((m_exp_attr = expession_attr_re.exec(html_template)) !== null) {
		if (m_exp_attr.index === expession_attr_re.lastIndex) {
			expession_attr_re.lastIndex++;
		}
		var expression_attr_value = m_exp_attr[0].substring( 10, m_exp_attr[0].indexOf('}}') );
		try {
			var replace_exp_block_attr = eval(expression_attr_value);
			console.log('exp', expression_attr_value, '[' + replace_exp_block_attr + ']');
			//var expression_attr_single_re = new RegExp('(ATTR-EXP{{)(.*?)(' + expression_attr_value + ')("}}ATTR-ENDEXP)', 'g');
			expr_template = expr_template.substring(0, (expr_template.indexOf( expression_attr_value )) - 10) + replace_exp_block_attr + expr_template.substring( expr_template.indexOf( expression_attr_value ) + expression_attr_value .length + 13);
		} catch (errorExp) {
			console.log(errorExp);
			console.log('Compilation error evaluating expression: '+ expression_attr_value);
		}
	}

   /* Conditional attribute values */
   var conditional_attr_re = /(ATTR-IF{{)(\S*=")(.*?)(}})/g;
   var conditional_template = expr_template;
   while ((m_cond_attr = conditional_attr_re.exec(expr_template)) !== null) {
     if (m_cond_attr.index === conditional_attr_re.lastIndex) {
       conditional_attr_re.lastIndex++;
     }
     var condition_attr = m_cond_attr[0].substring( m_cond_attr[0].indexOf('"')+1, m_cond_attr[0].indexOf('}}')-1 );
	 	try {
			var condition_attr_value = eval(condition_attr);
		    var re_single_condition_attr = new RegExp('(ATTR-IF{{)(.*?)(' + condition_attr + ')("}})', 'g');
		    var replace_block_attr = (condition_attr_value=='') ? '' : m_cond_attr[2] + condition_attr_value + '"';
		    conditional_template = conditional_template.replace(re_single_condition_attr, replace_block_attr);
		} catch (errorCond) {
			console.log(errorCond);
			console.log('Compilation error evaluating condition: '+ condition_attr_value);
		}
   }

   /* Replacement Layout values */
   	if (attributes.layout) {
   		var re_layout = new RegExp('(LAYOUT-RENDERING)', 'g');
   		var layout_fragment = '';

		if (attributes.repeat_in.value != '') {
			layout_fragment += '<div ng-repeat="$dfx_item in ' + attribute.repeat_in.value + '" dfx-repeatable-panel="{{$index}}" layout="column" flex="100">';
		} else {
			layout_fragment += '<div dfx-repeatable-panel="{{$index}}" layout="column" flex="100">';
		}
	   	for (var i_row=0; i_row<attributes.layout.rows.length; i_row++) {
		   var row = attributes.layout.rows[i_row];
		   var row_style = (row.style.value=='') ? '' : 'style="' + row.style.value + '" ';
		   var row_classes = (row.classes.value=='') ? '' : row.style.value;
		   var row_dynamic = (row.dynamicClasses.value=='') ? '' : row.dynamicClasses.value;
		   console.log(row);
		   layout_fragment += '<div id="{{component_id}}_layout_0_row_' + i_row + '" layout="row" layout-wrap flex="' + row.height.value + '" ' + row_style + ' ng-class="[' +
		   		((row_classes!= '') ? row_classes + ',' : '') + ((row_dynamic!='') ? ' ' + row_dynamic : '') + ']">';
		   for (var i_col=0; i_col<row.cols.length; i_col++) {
				var col = row.cols[i_col];
			   	var col_flex_width = (col.autoWidth===true) ? '' : ' flex="' + col.width.value + '"';
			   	var col_style = (col.style.value=='') ? '' : 'style="' + col.style.value + '" ';
			   	var col_wrap = (col.orientation.value ==='row') ? '\'wrap\'' : '\'nowrap\'';
			   	var col_classes = (col.classes.value=='') ? '' : col.style.value;
			   	var col_dynamic = (col.dynamicClasses.value=='') ? '' : col.dynamicClasses.value;
			   	layout_fragment += '<div id="{{component_id}}_layout_0_row_' + i_row + '_column_' + i_col + '"' + col_flex_width + ' ng-show="' + col.display.value + '" layout="' + col.orientation.value +
			   		'" layout-wrap layout-align="' + col.halignment.value + ' ' + col.valignment.value + '" gc-container="layout_0_row_' + i_row + '_column_' + i_col + '" gc-parent="{{component_id}}" ' + col_style +
					' ng-style="{\'flex-wrap\': ' + col_wrap + ' }" ng-class="[' +
		 		   		((col_classes!= '') ? col_classes + ',' : '') + ((col_dynamic!='') ? ' ' + col_dynamic : '') + ']">';
				for (var i_child=0; i_child<component_definition.children.length; i_child++) {
					var child_element = component_definition.children[i_child];
					if (child_element.container == 'layout_0_row_' + i_row + '_column_' + i_col) {
						layout_fragment += renderer.renderComponent(child_element);
					}
				}
				layout_fragment += '</div>';
		   }
		   layout_fragment += '</div>';
	   	}
		layout_fragment += '</div>';

	   	conditional_template = conditional_template.replace( re_layout, layout_fragment );
   }

   /* Replacement of component id */
   var re_id = new RegExp('(\{\{component_id\}\})', 'g');
   conditional_template = conditional_template.replace( re_id, component_definition.id );

   /* Substitution of attribute values */
   var re = /(attributes\.)(.*?)(\.value)/g;

   var final_template = conditional_template;

   while ((m_attr = re.exec(conditional_template)) !== null) {
     if (m_attr.index === re.lastIndex) {
       re.lastIndex++;
     }
     var attribute = m_attr[0];
	 //console.log(attribute);
     try {
       var re_single_attr = new RegExp('(' + attribute + ')', 'g');
       var attribute_value = eval(attribute);
	   console.log(attribute, ' / ', attribute_value.toString());
       final_template = final_template.replace(re_single_attr, attribute_value);
   } catch(errorAttr) {
	   //console.log(errorAttr);
       //console.log('Compilation error evaluating attribute: '+ attribute);
     }
   }

   var html_fragment = '<div id="' + component_definition.id +
       '" dfx-gcc-web-base dfx-gcc-web-' + component_definition.type +
       ' gc-role="control">'+final_template+'</div>';
   return html_fragment;
 }

 renderer.mergeWithOverriddenAttributes = function (default_attributes, updated_attributes) {
    for (var updated_attribute in updated_attributes) {
        if (updated_attributes.hasOwnProperty(updated_attribute)) {
            if (updated_attribute != 'value' && updated_attribute != 'status' &&
                (default_attributes[updated_attribute] || default_attributes[updated_attribute] === ''))
            {

                if ( Array.isArray(updated_attributes[updated_attribute]) ) {
                    //mergeArrayTypeAttribute(default_attributes[updated_attribute], updated_attributes[updated_attribute]);
                    default_attributes[updated_attribute] = updated_attributes[updated_attribute];// this is an array, without 'value'
                } else {
                    if (updated_attributes[updated_attribute] !== null && typeof updated_attributes[updated_attribute] === 'object') {
                        renderer.mergeWithOverriddenAttributes(default_attributes[updated_attribute], updated_attributes[updated_attribute]);
                    }

                    if (updated_attribute) {
                        if (updated_attributes[updated_attribute] !== null && typeof updated_attributes[updated_attribute] === 'object') {
                            default_attributes[updated_attribute].status = 'overridden';
                            default_attributes[updated_attribute].value  = updated_attributes[updated_attribute].value;
                        } else {
                            default_attributes[updated_attribute] = updated_attributes[updated_attribute];//attribute is not object, ex: style = ""
                        }
                    }
                }
            }
        }
    }
 };

 module.exports = renderer;
