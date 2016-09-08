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

 renderer.render = function() {
   var view_definition = {
     "properties": {},
      "definition": {
      	"default": [
      		{
      			"id": 398,
      			"type": "panel",
      			"attributes": {
      				"name": {
      					"value": "pnlPanel1",
      					"status": "overridden"
      				},
      				"flex": {
      					"value": "100",
      					"status": "overridden"
      				},
              "style": {
      					"value": "color:red",
      					"status": "overridden"
      				},
              "repeat_title": {
                "value": "false"
              },
              "repeat_in": {
                "value": ""
              },
              "onclick": {
                "value": "showMe()"
              }
      			},
      			"children": [
      				{
      					"id": 74168,
      					"type": "button",
      					"flex": "false",
      					"just_dropped": true,
      					"attributes": {
      						"name": {
      							"value": "btnButton1",
      							"status": "overridden"
      						}
      					},
      					"children": [],
      					"container": "layout_0_row_0_column_0"
      				}
      			],
      			"animation": {
      				"in": "fadeIn",
      				"out": "slideOutLeft"
      			}
      		}
      	]
      }
    };

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
     console.log(condition);
     var conditional_single_re = new RegExp('(FRAG-IF{{' + condition + ')((.|\n)*?)(FRAG-ENDIF)');
     html_template = html_template.replace(conditional_single_re, replace_block);
   }

   /* Expression attribute values */
   var expession_attr_re = /(ATTR-EXP{{)(.*?)(}})(.*?)(ATTR-ENDEXP)/g;

   while ((m_exp_attr = expession_attr_re.exec(html_template)) !== null) {
     if (m_exp_attr.index === expession_attr_re.lastIndex) {
       expession_attr_re.lastIndex++;
     }
     var expression_attr = m_exp_attr[0].substring( 10, m_exp_attr[0].indexOf('}}') );
     var replace_exp_block_attr = eval(expression_attr);
     html_template = html_template.replace(expession_attr_re, replace_exp_block_attr);
   }

   /* Conditional attribute values */
   var conditional_attr_re = /(ATTR-IF{{)(\S*=")(.*?)(}})/g;
   var conditional_template = html_template;
   while ((m_cond_attr = conditional_attr_re.exec(html_template)) !== null) {
     if (m_cond_attr.index === conditional_attr_re.lastIndex) {
       conditional_attr_re.lastIndex++;
     }
     var condition_attr = m_cond_attr[0].substring( m_cond_attr[0].indexOf('"')+1, m_cond_attr[0].indexOf('}}')-1 );
     var condition_attr_value = eval(condition_attr);
     var re_single_condition_attr = new RegExp('(ATTR-IF{{)(.*?)(' + condition_attr + ')("}})', 'g');
     var replace_block_attr = (condition_attr_value=='') ? '' : m_cond_attr[2] + condition_attr_value + '"';
     conditional_template = conditional_template.replace(re_single_condition_attr, replace_block_attr);
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
     try {
       var re_single_attr = new RegExp('(' + attribute + ')', 'g');
       var attribute_value = eval(attribute);
       console.log(attribute);
       final_template = final_template.replace(re_single_attr, attribute_value);
     } catch(e) {
       console.log('ERROR:'+attribute);
     }
   }

   /* Replacement Layout values */
   // TODO

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
