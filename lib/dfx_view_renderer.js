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
var dfx_gc_templates = require('./dfx_gc_templates');
var Q = require('q');

var renderer = {};
var app_gc_templates = {};

renderer.render = function(req, res) {
    var tenant_id = req.session.tenant.id;
    var application = req.body.application;
    var platform = req.body.platform;
    var view_definition = req.body.view_source;

    dfx_gc_templates.getAllAsObject(application, platform, tenant_id)
        .then(function(gc_templates) {
            app_gc_templates = gc_templates;
            var view_rendered = {};

            for (var card_name in view_definition.definition) {
              	var card = view_definition.definition[card_name];
              	var view_card_html = '';
                    for (var i=0; i<card.length; i++) {
                        view_card_html += renderer.renderComponent( card[i] );
                    }
              	view_rendered[card_name] = view_card_html;
            }

            res.send(view_rendered);
        });
};

renderer.renderComponent = function(component_definition) {
   	'use strict';
   	/*
     	Rendering Process
   	*/
   	var m, m_exp_attr, m_cond_attr, m_layout, m_attr, m_nonv_attr, m_static_attr;
   	var attributes = component_definition.attributes;
    var file_prefix = component_definition.type;
	if (component_definition.type == 'json') {
		file_prefix = 'gc_json';
	}
	if (component_definition.type == 'datatable') {
		file_prefix = 'table';
	}
   	var html_origin = fs.readFileSync(path.join(__dirname, '..', 'gcontrols/web/'+file_prefix+'_compile.html')).toString();
   	var json_template = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'gcontrols/web/'+file_prefix+'.json')).toString());

    mergeWithGcTemplates(attributes.template, json_template);
    mergeWithOverriddenAttributes(json_template, attributes);
   	attributes = json_template;
    console.log('===' + component_definition.type + '(' + component_definition.id + ')===');
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
		var conditional_single_re = new RegExp('(FRAG-IF\{\{' + condition + ')((.|\n)*?)(FRAG-ENDIF)');
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
			//console.log('exp', expression_attr_value, '[' + replace_exp_block_attr + ']');
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
            replace_block_attr = setBindedToScopeVarImageSrc(replace_block_attr, component_definition.type); // special case for image src

		    conditional_template = conditional_template.replace(re_single_condition_attr, replace_block_attr);
		} catch (errorCond) {
			console.log(errorCond);
			console.log('Compilation error evaluating condition: '+ condition_attr_value);
		}
   }
	/* Replacement Wizard values */
	if (component_definition.type=='wizard') {
		var re_wizard = new RegExp('(WIZARD-RENDERING)', 'g');
   		var wizard_fragment = '';

		for (var i_wiz=0; i_wiz<attributes.steps.value.length; i_wiz++) {
			var step = attributes.steps.value[i_wiz];
			wizard_fragment += '<md-tab flex="100" label="{{' + step.label + '}}" ng-disabled="' + step.disabled.value + ' || step.validDisabled.value">' +
				'<div ng-form name="stepForm' + i_wiz + '" id="form_{{component_id}}_step_' + i_wiz + '" layout="column" flex="100">' +
				'<md-content flex="100" layout="row" layout-padding style="' + step.style.value + '" ng-class="[' + ((step.classes.value!='') ? step.classes.value + ', ' : '') + step.dynamicClasses.value + ']">' +
				'<div flex="100" id="{{component_id}}_step_' + i_wiz + '" layout="column">' +
				'LAYOUT-RENDERING{{' + i_wiz + '}}' +
				'</md-content>';
			if (i_wiz < (attributes.steps.value.length-1)) {
				wizard_fragment += '<div layout="row" layout-align="end-center" class="dfx-core-gc-wizard-navbuttons">' +
					'<button ng-click="decrIndex(); ' + attributes.onPrevious.value + '; ' + attributes.previousButton.onclick.value + '; prevent($event);"' +
					' style="' + attributes.previousButton.style.value + '"' +
					' class="dfx-core-gc-wizard-prev md-altTheme-theme glyph md-raised md-primary md-button ' +
                        (attributes.previousButton.classes.value!='' ? attributes.previousButton.classes.value + ' ' : '') + '"' +
					' ng-class="' + attributes.previousButton.dynamicClasses.value + '"' +
					' ng-disabled="' + ((i_wiz===0) ? 'true' : 'false') + '">' +
					'{{' + attributes.previousButton.label.value + '}}</button>' +
					'<button ng-click="incrIndex(); ' + attributes.onNext.value + '; ' + attributes.nextButton.onclick.value  + '; prevent($event);"' +
					' style="' + attributes.nextButton.style.value + '"' +
					' class="dfx-core-gc-wizard-next md-altTheme-theme glyph md-raised md-primary md-button ' +
                        (attributes.nextButton.classes.value!='' ? attributes.nextButton.classes.value + ' ' : '') + '"' +
					' ng-class="' + attributes.nextButton.dynamicClasses.value + '"' +
					' ng-disabled="stepForm' + i_wiz + '.$invalid">' +
					'{{' + attributes.nextButton.label.value + '}}</button>' +
					'</div></div></md_tab>';
			} else {
				wizard_fragment += '</div></md_tab></md_tabs>';
                wizard_fragment += '<div layout="row" layout-align="end-center">' +
					'<div class="wizard-submit-step dfx-core-gc-wizard-navbuttons is-wizard-submit-step">' +
					'<button ng-click="decrIndex(); ' + attributes.onPrevious.value + '; ' + attributes.previousButton.onclick.value + '; prevent($event);"' +
					' style="' + attributes.previousButton.style.value + '"' +
					' class="dfx-core-gc-wizard-prev md-altTheme-theme glyph md-raised md-primary md-button ' +
                        (attributes.previousButton.classes.value!='' ? attributes.previousButton.classes.value + ' ' : '') + '"' +
					' ng-class="' + attributes.previousButton.dynamicClasses.value + '"' +
					' ng-disabled="' + ((i_wiz===0) ? 'true' : 'false') + '">' +
					'{{' + attributes.previousButton.label.value + '}}</button>' +
                    '<input type="submit" style="' + attributes.submitButton.style.value + '"' +
					' ng-click="' + attributes.submitButton.onclick.value + '"' +
					' class="dfx-core-gc-wizard-submit md-button md-altTheme-theme glyph md-raised ' +
                        (attributes.submitButton.classes.value!='' ? attributes.submitButton.classes.value + ' ' : '') + '"' +
					' ng-class="' + attributes.nextButton.dynamicClasses.value + '"' +
					' ng-disabled="form_{{component_id}}.$invalid"' +
					' value="{{' + attributes.submitButton.label.value + '}}">' +
					'</div></div>';
			}
		}

		conditional_template = conditional_template.replace( re_wizard, wizard_fragment );
	}

	/* Replacement Datatable values */
	if (component_definition.type=='datatable') {
		var re_datatable = new RegExp('(TABLECOLUMNS-RENDERING)', 'g');
   		var datatable_fragment = '';
		for (var dt_col_idx=0; dt_col_idx<attributes.columns.value.length; dt_col_idx++) {
			var col = attributes.columns.value[dt_col_idx];
			datatable_fragment += '<td width="' + col.flex + '%">';
			//if (col.renderer.name=='statictext') {
				datatable_fragment += '<span id="{{component_id}}_column_layout_{{$parent.$index}}_' + dt_col_idx + '" dfx-gcc-renderer="' + col.renderer.name + '" component-id="{{component_id}}" column-id="' + dt_col_idx + '" layout="row" row-id="{{$parent.$index}}">';
				var col_renderer_id = component_definition.id + "_renderer_{{$index}}_" + dt_col_idx;
				var col_renderer = {"id": col_renderer_id, "type": col.renderer.name, "attributes": col.renderer.attributes, "rendererId": component_definition.id};
				datatable_fragment += renderer.renderComponent(col_renderer);
				datatable_fragment += '</span>';
			//}
		}

		conditional_template = conditional_template.replace( re_datatable, datatable_fragment );
	}

	/* Replacement Layout values */
	var layout_template = conditional_template;
   	if (attributes.layout || attributes.steps) {

   		var layout_re = new RegExp('(LAYOUT-RENDERING\{\{)(.*?)(\}\})', 'g');

	   	while ((m_layout = layout_re.exec(conditional_template)) !== null) {
	    	if (m_layout.index === layout_re.lastIndex) {
	    		layout_re.lastIndex++;
	    	}
			var layout_index = eval(m_layout[2]);
			/* Layout definition */
			var layout_fragment = '';
			if (attributes.layout) {
				layout_fragment += '<div layout="column" flex="100">';
			}
			var layout_definition = (attributes.layout) ? attributes.layout : attributes.steps.value[layout_index].layout;
		   	for (var i_row=0; i_row<layout_definition.rows.length; i_row++) {
			   var row = layout_definition.rows[i_row];
			   var row_style = (row.style.value=='') ? '' : 'style="' + row.style.value + '" ';
			   var row_classes = (row.classes.value=='') ? '' : '\'' + row.classes.value + '\'';
			   var row_dynamic = (row.dynamicClasses.value=='') ? '' : '\'' + row.dynamicClasses.value + '\'';
			   console.log(row);
			   layout_fragment += '<div id="{{component_id}}_layout_0_row_' + i_row + '" layout="row" layout-wrap flex="' + ((row.height!=null) ? row.height.value : '100') + '" ' + row_style + ' ng-class="[' +
			   		((row_classes!= '') ? row_classes + ',' : '') + ((row_dynamic!='') ? ' ' + row_dynamic : '') + ']">';
			   for (var i_col=0; i_col<row.cols.length; i_col++) {
					var col = row.cols[i_col];
				   	var col_flex_width = (col.autoWidth===true) ? '' : ' flex="' + col.width.value + '"';
				   	var col_style = (col.style.value=='') ? '' : 'style="' + col.style.value + '" ';
				   	var col_wrap = (col.orientation.value ==='row') ? '\'wrap\'' : '\'nowrap\'';
				   	var col_classes = (col.classes.value=='') ? '' : '\'' + col.classes.value + '\'';
				   	var col_dynamic = (col.dynamicClasses.value=='') ? '' : '\'' + col.dynamicClasses.value + '\'';
				   	layout_fragment += '<div id="{{component_id}}_layout_0_row_' + i_row + '_column_' + i_col + '"' + col_flex_width + ' ng-show="' + ((col.display) ? col.display.value : 'true') + '" layout="' + col.orientation.value +
				   		'" layout-wrap layout-align="' + col.halignment.value + ' ' + col.valignment.value + '" gc-container="layout_0_row_' + i_row + '_column_' + i_col + '" gc-parent="{{component_id}}" ' + col_style +
						' ng-style="{\'flex-wrap\': ' + col_wrap + ' }" ng-class="[' +
			 		   		((col_classes!= '') ? col_classes + ',' : '') + ((col_dynamic!='') ? ' ' + col_dynamic : '') + ']">';
					for (var i_child=0; i_child<component_definition.children.length; i_child++) {
						var child_element = component_definition.children[i_child];
						if (child_element.container == 'layout_' + layout_index + '_row_' + i_row + '_column_' + i_col) {
							layout_fragment += renderer.renderComponent(child_element);
						}
					}
					layout_fragment += '</div>';
			   }
			   layout_fragment += '</div>';
		   	}
			layout_fragment += '</div>';

			var layout_single_re = new RegExp('(LAYOUT-RENDERING\\\{\\\{' + layout_index + '\\\}\\\})');
			layout_template = layout_template.replace(layout_single_re, layout_fragment);
	   	}
   }

   /* Replacement Tabs Layout values */
   layout_template = getTemplateWithReplacedTabsLayout(attributes, layout_template, component_definition);

   /* Replacement of component id */
   var re_id = new RegExp('(\{\{component_id\}\})', 'g');
   layout_template = layout_template.replace( re_id, component_definition.id );

   /* Substitution of attribute values */
   var re = /(attributes\.)(.*?)(\.value)/g;

   var attribute_template = layout_template;

   while ((m_attr = re.exec(layout_template)) !== null) {
     if (m_attr.index === re.lastIndex) {
       re.lastIndex++;
     }
     var attribute = m_attr[0];
	 try {
       var re_single_attr = new RegExp('(' + attribute + ')', 'g');
       var attribute_value = eval(attribute);
	   console.log(attribute, ' / ', attribute_value.toString());
       attribute_template = attribute_template.replace(re_single_attr, attribute_value);
   } catch(errorAttr) {
	   //console.log(errorAttr);
       //console.log('Compilation error evaluating attribute: '+ attribute);
     }
   }

   /* Substitution of non value attributes */
   var re_nonv = /(ATTR-NONV\{\{)(.*?)(\}\})/g;

   var nonv_attribute_template = attribute_template;

   while ((m_nonv_attr = re_nonv.exec(attribute_template)) !== null) {
    	if (m_nonv_attr.index === re_nonv.lastIndex) {
    		re_nonv.lastIndex++;
    	}
		var nonv_attribute = m_nonv_attr[0].substring( 11, m_nonv_attr[0].length-2);
		console.log('ATTR-NONV: ' + nonv_attribute )
		var nonv_attribute_value = eval( 'attributes.' + nonv_attribute );
		var re_single_nonv_attr = new RegExp('(ATTR-NONV\{\{' + nonv_attribute + '\}\})', 'g');
		nonv_attribute_template = nonv_attribute_template.replace(re_single_nonv_attr, nonv_attribute_value);
	}

   /* Substitution of static attributes */
   var re_static = /(ATTR-STATIC\{\{)(.*?)(\.value\}\})/g;

   var static_attribute_template = nonv_attribute_template;

   while ((m_static_attr = re_static.exec(nonv_attribute_template)) !== null) {
    	if (m_static_attr.index === re_static.lastIndex) {
    		re_static.lastIndex++;
    	}
		var static_attribute = m_static_attr[0].substring( 13, m_static_attr[0].length-2);
		console.log('ATTR-STATIC: ' + static_attribute )
		var re_single_static_attr = new RegExp('(ATTR-STATIC\{\{' + static_attribute + '\}\})', 'g');
		static_attribute_template = static_attribute_template.replace(re_single_static_attr, 'attributes.' + static_attribute);
	}

	/* Pretty print of the overall result */
	var re_pretty_print_spaces = /(\s\s+)/g
	static_attribute_template = static_attribute_template.replace(re_pretty_print_spaces, ' ');
	var re_pretty_print_newline = /(\n)/g
	static_attribute_template = static_attribute_template.replace(re_pretty_print_newline, '');

	var gc_layout = ((component_definition.type == 'panel' || component_definition.type == 'tabs' || component_definition.type == 'wizard') &&
		(!attributes.autoHeight ||  attributes.autoHeight.value != true)) ?
			' style="height:100%;" flex="100" layout="column" ' : ' ';

    var html_fragment = '<div id="' + component_definition.id +
       '" dfx-gcc-web-base dfx-gcc-web-' + component_definition.type +
       ' gc-role="control" ' + gc_layout + '>'+static_attribute_template+'</div>';

    return html_fragment;
}

var mergeWithGcTemplates = function (component_template, component_default_attributes) {
    if (component_template && component_template.value !== 'default') {
        var gc_template = app_gc_templates[component_template.value];
        var template_definition = gc_template.attributes;
        var parent_template = template_definition.template && template_definition.template.value !== 'default' ? template_definition.template.value : '';

        if (parent_template) {
            mergeWithGcTemplates(template_definition.template, component_default_attributes);
        }
        mergeWithOverriddenAttributes(component_default_attributes, template_definition, false);
    }
};

var mergeWithOverriddenAttributes = function (default_attributes, updated_attributes, is_default_template) {
    for (var updated_attribute in updated_attributes) {
        if (updated_attributes.hasOwnProperty(updated_attribute)) {
            if (updated_attribute != 'value' && updated_attribute != 'status' &&
                (default_attributes[updated_attribute] || default_attributes[updated_attribute] === ''))
            {
                if ( Array.isArray(updated_attributes[updated_attribute]) ) {
                    default_attributes[updated_attribute] = updated_attributes[updated_attribute];// this is an array, without 'value'
                } else {
                    if (updated_attributes[updated_attribute] !== null && typeof updated_attributes[updated_attribute] === 'object') {
                        mergeWithOverriddenAttributes(default_attributes[updated_attribute], updated_attributes[updated_attribute], is_default_template);
                    }

                    if (updated_attribute) {
                        if (updated_attributes[updated_attribute] !== null && typeof updated_attributes[updated_attribute] === 'object') {
                            if (is_default_template) default_attributes[updated_attribute].status = 'overridden';
                            default_attributes[updated_attribute].value  = updated_attributes[updated_attribute].value;
                            if (updated_attributes[updated_attribute].hasOwnProperty('locked')) {
                                default_attributes[updated_attribute].locked = updated_attributes[updated_attribute].locked;
                            }
                        } else {
                            default_attributes[updated_attribute] = updated_attributes[updated_attribute];//attribute is not object, ex: style = ""
                        }
                    }
                }
            }
        }
    }
};

var setBindedToScopeVarImageSrc = function(replace_block_attr, comp_type) {
    if (comp_type == 'image' && replace_block_attr && replace_block_attr.indexOf('ng-src') == 0) {
        var ng_src_value = replace_block_attr.substring('ng-src="'.length, replace_block_attr.length-1);
        if (ng_src_value.indexOf("'") == -1) {
            return 'ng-src="{{' + ng_src_value + '}}"'; // if image src value is scope variable, make one way binding
        }
    }
    return replace_block_attr;
};

var getTemplateWithReplacedTabsLayout = function(attributes, conditional_template, component_definition) {
    if (component_definition.type !== 'tabs') return conditional_template;

	var re_layout = new RegExp('(LAYOUT-RENDERING-TABS)', 'g'),
        layout_fragment = '';

    for (var i_tabs = 0; i_tabs < attributes.tabs.value.length; i_tabs++) {
        var tab_value = attributes.tabs.value[i_tabs];

        var tab_classes = (tab_value.classes.value == '') ? '' : '\'' + tab_value.classes.value + '\'';
        var tab_dynamic = (tab_value.dynamicClasses.value == '') ? '' : '\'' + tab_value.dynamicClasses.value + '\'';

        layout_fragment += '<md-tab label="' + tab_value.label + '" ng-disabled="' + tab_value.disabled.value + '">';
        layout_fragment += '<md-content flex="100" layout="row" layout-padding style="height:100%;' + tab_value.style.value +
            '" ng-class="[' + ((tab_classes!= '') ? tab_classes + ',' : '') + ((tab_dynamic!='') ? ' ' + tab_dynamic : '') + ']">';
        layout_fragment += '<div id="{{component_id}}_tab_' + i_tabs + '" layout="column" flex="100">';

        for (var i_row = 0; i_row < tab_value.layout.rows.length; i_row++) {
            var row = tab_value.layout.rows[i_row];
            var row_height = row.height ? row.height.value : '100';

            var row_flex_value = (!attributes.autoHeight || attributes.autoHeight.value != true) ? row_height : 'none';

            layout_fragment += '<div id="{{component_id}}_layout_' + i_tabs + '_row_' + i_row + '" layout="row" layout-wrap ' +
                'flex="' + row_flex_value + '">';

            for (var i_col = 0; i_col < row.cols.length; i_col++) {
                var col = row.cols[i_col];

                var col_flex_width = ' flex="' + col.width.value + '" ';
                var col_style = ' style="overflow:auto;padding:1px;' + col.style.value + '" ';
                var col_wrap = (col.orientation.value ==='row') ? '\'wrap\'' : '\'nowrap\'';

                var col_classes = (col.classes.value=='') ? '' : '\'' + col.classes.value + '\'';
                var col_dynamic = (col.dynamicClasses.value=='') ? '' : '\'' + col.dynamicClasses.value + '\'';

                layout_fragment += '<div id="{{component_id}}_layout_' + i_tabs + '_row_' + i_row + '_column_' + i_col + '"' +
                    col_flex_width +
                    ' gc-container="layout_' + i_tabs + '_row_' + i_row + '_column_' + i_col + '"' +
                    ' gc-parent="{{component_id}}"' +
                    col_style +
                    ' ng-style="{\'flex-wrap\': ' + col_wrap + ' }"' +
                    '" layout="' + col.orientation.value + '"' +
                    ' layout-align="' + col.halignment.value + ' ' + col.valignment.value + '"' +
                    ' class="ui-placeholder dfx_visual_editor_droppable"' +
                    '" ng-class="[' + ((col_classes!= '') ? col_classes + ',' : '') + ((col_dynamic!='') ? ' ' + col_dynamic : '') + ']">';

                for (var i_child = 0; i_child < component_definition.children.length; i_child++) {
                    var child_element = component_definition.children[i_child];
                    if (child_element.container == 'layout_' + i_tabs + '_row_' + i_row + '_column_' + i_col) {
                        layout_fragment += renderer.renderComponent(child_element);
                    }
                }

                layout_fragment += '</div>';
            }

            layout_fragment += '</div>';
        }

        layout_fragment += '</div>';
        layout_fragment += '</md-content>';
        layout_fragment += '</md-tab>';
    }

    return conditional_template.replace( re_layout, layout_fragment );
};

module.exports = renderer;
