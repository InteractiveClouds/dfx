/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web tree */
var gc_web_tree = {
    "label": "Tree",
    "category": "default",
    "createDefinition": function( component_id, container_id ) {
        return {
            id: component_id,
            type: "tree",
            attributes: {
                "name": { "value": "fldtree" },
                "modelCollection": { "value": "" },
                "treeControl": { "value": "" },
                "initSelection": { "value": "" },
                "icons":
                {
                    "iconLeaf": "fa fa-file",
                    "iconExpand": "fa fa-plus",
                    "iconCollapse": "fa fa-minus"
                },
                "display": { "value": "" },
                "classes": { "value": "" },
                "style": { "value": "" },
                "onSelect": { "value": "" }
            },
            /*
            attributes: {
                "name": { "value": "fldtree" },
                "modelCollection": { "value": "" },
                "model": { "value": "" },
                "useTreeModel": { "value": true },
                "modelFields":
                {
                    "labelName": "label",
                    "childrenName": "children"
                },
                "display": { "value": "" },
                "classes": { "value": "tree" },
                "style": { "value": "" },
                "onSelect": { "value": "" }
            },
            */
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component, already_dropped ) {
        if (!component.attributes) {
            component.attributes = {
                "name": { "value": "fldtree" },
                "modelCollection": { "value": "" },
                "treeControl": { "value": "" },
                "initSelection": { "value": "" },
                "icons":
                {
                    "iconLeaf": "fa fa-file",
                    "iconExpand": "fa fa-plus",
                    "iconCollapse": "fa fa-minus"
                },
                "display": { "value": "" },
                "classes": { "value": "" },
                "style": { "value": "" },
                "onSelect": { "value": "" }
            };
        }
        var instance_id = component.id;
        var drag_icon_id = 'drag_icon_' + instance_id;
        var tree_id = 'tree_' + instance_id;
        var module_name = 'dfx_tree_module_' + instance_id;
        var controller_name = 'dfx_tree_controller_' + instance_id;

        var fragment_js = '<script type="text/javascript">'
            + 'angular.element(document).ready(function() {'
            + 'var ' + module_name + ' = angular.module("' + module_name + '", ["dfx.utils"]);' // dynamic way
            + module_name + '.controller("' + controller_name + '", function($scope) {'
            + '$scope.tree_data = ['
            + '{'
            + '"label": "First Level",'
            + '"children": ['
            + '{'
               + '"label": "Second Level1",'
            + '},{'
               + '"label": "Second Level2",'
            + '},{'
               + '"label": "Second Level3",'
            + '}]'
            + '}];'
            + 'console.log($scope.tree_data);'
            + '});';
        if(already_dropped) {
            fragment_js += 'angular.bootstrap(document.getElementById("' + instance_id + '"), ["' + module_name + '"]);' // dynamic way
            fragment_js += 'angular.element(document.getElementById("' + drag_icon_id + '")).remove();' // remove chart icon visible when dragging
            fragment_js += 'angular.element(document.getElementById("' + tree_id + '")).css("display","block")';
        }
        fragment_js += '});</script>';

        var classes = component.attributes.classes.value ? component.attributes.classes.value : '';
        var style = component.attributes.style.value ? component.attributes.style.value : '';
        var fragment_html = '<div id="' + component.id + '" gc-role="control" gc-type="tree" class="dfx_visual_editor_draggable dfx_visual_editor_gc_draggable" style="width:250px" ng-controller="' + controller_name + '">'
            + '<img id="' + drag_icon_id + '" src="/studio/images/vb/dfx_drag_web_tree.png" />'
            + '<div id="' + tree_id + '" class="'+(component.attributes.classes.value != "" ? component.attributes.classes.value : '')+'" style="display:none;'+(component.attributes.style.value != "" ? component.attributes.style.value : 'width:250px;')+'">'
            + '<abn-tree tree-data="tree_data" initial-selection = "First Level" expand-level = "2"></abn-tree>'
            + '</div>'
            + '</div>';
        var component_instance = {
            "id": instance_id,
            "fragment": fragment_html + fragment_js
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        var id = gc_component_definition.id,
            name = gc_component_definition.attributes.name.value,
            modelCollection = gc_component_definition.attributes.modelCollection ? gc_component_definition.attributes.modelCollection.value : "",
            treeControl = gc_component_definition.attributes.treeControl ? gc_component_definition.attributes.treeControl.value : "",
            initSelection = gc_component_definition.attributes.initSelection ? gc_component_definition.attributes.initSelection.value : "",
            iconLeaf =  gc_component_definition.attributes.icons ? gc_component_definition.attributes.icons.iconLeaf : "fa fa-file",
            iconExpand =  gc_component_definition.attributes.icons ? gc_component_definition.attributes.icons.iconExpand : "fa fa-plus",
            iconCollapse =  gc_component_definition.attributes.icons ? gc_component_definition.attributes.icons.iconCollapse : "fa fa-minus",
            //model = gc_component_definition.attributes.model ? gc_component_definition.attributes.model.value : "",
            display = gc_component_definition.attributes.display ? gc_component_definition.attributes.display.value : "",
            nstyle = gc_component_definition.attributes.style ? gc_component_definition.attributes.style.value : "",
            classes = gc_component_definition.attributes.classes ? gc_component_definition.attributes.classes.value : "",
            n_onSelect = gc_component_definition.attributes.onSelect ? gc_component_definition.attributes.onSelect.value : "";
            //labelName = gc_component_definition.attributes.modelFields ? gc_component_definition.attributes.modelFields.labelName : 'label',
            //childrenName = gc_component_definition.attributes.modelFields ? gc_component_definition.attributes.modelFields.childrenName : 'children'

        $( '#gc_tree_attr_id').val( id );
        $( '#gc_tree_attr_name').val( name );
        $( '#gc_tree_attr_modelCollection').val( modelCollection );
        $( '#gc_tree_attr_treeControl').val( treeControl );
        $( '#gc_tree_attr_initSelection').val(initSelection);
        $( '#gc_tree_attr_iconLeaf').val(iconLeaf);
        $( '#gc_tree_attr_iconExpand').val(iconExpand);
        $( '#gc_tree_attr_iconCollapse').val(iconCollapse);
        //$( '#gc_tree_attr_model').val( model );
        //$( '#gc_tree_attr_treeButtons').val(JSON.stringify(gc_component_definition.attributes.treeButtons));
        $( '#gc_tree_attr_display').val( display );
        $( '#gc_tree_attr_style').val( nstyle );
        $( '#gc_tree_attr_classes').val( classes );
        $( '#gc_tree_attr_onSelect').val( n_onSelect );
        /*
        if(gc_component_definition.attributes.useTreeModel.value){
            $('#gc_tree_attr_useMR').attr('checked','checked');
        } else {
            $('#gc_tree_attr_useSR').attr('checked','checked');
        }
        */
        //$( '#gc_tree_attr_labelName').val( labelName );
        //$( '#gc_tree_attr_childrenName').val( childrenName );

    },
    "savePropertyPanel": function() {
        var id = $( '#gc_tree_attr_id').val(),
            name = $( '#gc_tree_attr_name').val(),
            modelCollection = $( '#gc_tree_attr_modelCollection').val(),
            treeControl = $( '#gc_tree_attr_treeControl').val(),
            initSelection = $( '#gc_tree_attr_initSelection').val(),
            iconLeaf =  $( '#gc_tree_attr_iconLeaf').val(),
            iconExpand =  $( '#gc_tree_attr_iconExpand').val(),
            iconCollapse =  $( '#gc_tree_attr_iconCollapse').val(),
            //model = $( '#gc_tree_attr_model').val(),
            //useTreeModel = $('#gc_tree_attr_useMR').is(':checked'),
            display = $( '#gc_tree_attr_display').val(),
            nstyle = $( '#gc_tree_attr_style').val(),
            classes = $( '#gc_tree_attr_classes').val(),
            n_onSelect = $( '#gc_tree_attr_onSelect').val(),
            el = $('#'+id);
            //labelName = $( '#gc_tree_attr_labelName').val(),
            //childrenName = $( '#gc_tree_attr_childrenName').val(),
            //treeButtons = $( '#gc_tree_attr_treeButtons').val(),
            //elIsChange = $('#gc_tree_attr_changetree'),
            //el = $('#'+id),
            //fragment_html = '';

        if(n_onSelect){
            n_onSelect = n_onSelect.replace(/\(.*?\)/g, "");
        }

        var attributes = {
            "name": { "value": name },
            "modelCollection": { "value": modelCollection },
            "treeControl": { "value": treeControl },
            "initSelection": { "value": initSelection },
            "icons":
            {
                "iconLeaf": iconLeaf,
                "iconExpand": iconExpand,
                "iconCollapse": iconCollapse
            },
            "display": { "value": display },
            "style": { "value": nstyle },
            "classes": { "value": classes },
            "onSelect": { "value": n_onSelect }
        };
        $('#tree_' + id)
        .attr({'style': nstyle, 'class': classes});

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.updateSelectedBox(el);
    }
}