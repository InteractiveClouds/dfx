/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// Declaration of main modules
var express = require('express');
var errorHandler = require('errorhandler');
var passport = require('passport');
var jade = require('jade');
var fs = require('graceful-fs');
var path = require('path');
var _ = require('lodash');
var request = require('request');
var emailToSupport = require('./dfx_support_email.js');
var unzip = require('./utils/unzip.js');
var zip = require('./utils/zip.js');
var Q = require('q');
var accessTokens = require('./authRequest_mod').oAuth2AccessTokens;

// Declaration of DFX modules
var SETTINGS = require('./dfx_settings');
var queries = require('./dfx_queries');
var endpoints = require('./utils/endpoints.js');
var Log = require('./utils/log');
var log = new Log.Instance({label:'PROXY'});
var resources = require('./dfx_resources').api;
var deploy = require('./dfx_deploy');

if ( SETTINGS.studio ) {
    var db = require('./mdbw')(SETTINGS.mdbw_options);
    var applications = require('./dfx_applications');
    var screens = require('./dfx_screens');
    var screens_templates = require('./dfx_screens_templates');
    var categories = require('./dfx_screens_categories.js');
    var widgets = require('./dfx_widgets');
    var view_renderer = require('./dfx_view_renderer');
    var studio = require('./dfx_studio');
    var limits = require('./dfx_sysadmin').tenant.limits;
    var versioning = require('./dfx_tenants_versioning');
    var resourcesEndpoint = require('./dfx_resources').endpoint;
    var gc_extensions = require('./dfx_gc_extensions');
    var databases = require('./dfx_databases');
    var phoneGap = require('./dfx_phonegap_api');
    //var databaseApi = require('./dfx_database-api');
    var sys_console = require('./dfx_console');
    var compiler = require('./dfx_compiler');
    var sysadmin = require('./dfx_sysadmin');
    var sysadminUser = require('./dfx_sysadmin/sysadmin');
    var templates = require('./dfx_templates');
    var predefined_gc = require('./dfx_predefined_gc');
    var credCrypt = require('./auth/utils/credCrypt');
    var ldap = require('./ldap').init({
        db        : db,
        credCrypt : credCrypt,
        log       : new Log.Instance({label:'LDAP'}),
        tenants   : sysadmin.tenant
    });
    var updateTool = require('./updateTool');
    var version = require('../package.json').version;
    var dockerisation = require('./dockerisation');
    var bm = require('./BlueMixCloudFoundry');
    var data_dictionary = require('./dfx_data_dictionary');
}
var activator = require('./utils/activator');
var user_definition = require('./dfx_user_definition').api;
var menus = require('./dfx_menus');
var auth = require('./auth');
var gate = auth.gate;
var api = require('./api');


//_________________________Documentation start______________________________//
var storage = {};

var documentationFilePath = path.join(__dirname, '..', 'templates/static_json/editor/doc.json');
fs.readFile(documentationFilePath, 'utf8', function(err, documentation) {
    if ( err ) return log.error(
            'Can not read documentation file.' +
            '\n\tDocumentation file path is: ' + documentationFilePath +
            '\n\t           Current path is: ' + process.cwd()
    );
    storage.documentation = JSON.parse(documentation);
});
//_________________________Documentation stop______________________________//


var initialize = function(app) {

    if ( process.env.NODE_ENV === 'development' ) {
        //var databaseEnvironment = require('../tests/environment/databaseEnvironment.js'),
        //    giveTestPage = require('../tests/tools/giveTestsPage.js');
        log.warn('Server is run in DEVELOPMENT mode.');
        if ( process.env.DFX_DB_JEDI_MODE ) log.warn('DATABASE JEDI MODE is on');
        // show errors via http
        //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        app.use(errorHandler({ dumpExceptions: true, showStack: true }));
        //app.get('/tests/run', giveTestPage);
        //app.get('/tests/environment/database/:action', databaseEnvironment);
    }

    if ( SETTINGS.studio ) {

        app.post('/studio/view/render', function(req, res) {
            res.send(view_renderer.render(req));
        });

        // _______________________EMAIL START________________________________
        app.post('/studio/support-email/:action', gate.studio, emailToSupport.api);
        // _______________________EMAIL STOP__________________________________//


        //________________________Tenants Activate/Deactivate Start____________//
        app.post('/tenant/activate', activator.activate);
        app.post('/tenant/deactivate', activator.deactivate);
        app.get('/test1', function(req, res){
            setTimeout(function(){
                res.send("Done1");
            },20000);
        });

        app.get('/test2', function(req, res){
            setTimeout(function(){
                res.send("Done2");
            },40000);
        });
        //________________________Tenants Activate/Deactivate Stop_____________//

        // _______________________CONSOLE START_______________________________//
        app.get(  '/console/login',  auth.console.loginPage);
        app.post( '/console/login',  auth.console.loginVerify);
        app.get(  '/console/logout', auth.console.logout);
        app.get(  '/console',                         gate.console, sys_console.getConsole);
        app.get(  '/console/changepassword',          gate.console, sysadminUser.changeSysAdminsPasswordPage);
        app.post( '/console/changepassword',          gate.console, sysadminUser.changeSysAdminsPassword );
        app.get(  '/console/:tenantId/edit',          gate.console, sys_console.editTenant);
        app.get(  '/console/:tenantId/remove',        gate.console, sys_console.deleteTenant);
        app.post( '/console/tenant/create',           gate.console, sys_console.createTenant);
        app.post( '/console/:tenantId/generateToken', gate.console, sys_console.generateToken);
        app.post( '/console/:tenantId/removeToken',   gate.console, sys_console.removeToken);
        app.get(  '/console/repository/initialize',   gate.console, sys_console.initRepo);
        app.get(  '/console/updateversion',           gate.console, updateTool.update);
        app.get(  '/console/log/getfileslist',        gate.console, sys_console.getFilesList);
        app.get(  '/console/log',                     gate.console, function(req, res){ res.render('log') });
        // _______________________CONSOLE STOP_________________________________//

        // _______________________COMPILER START_______________________________//
        app.post('/studio/compiler/build/create/:applicationName/:platform', gate.studio, compiler.createAppBuild);
        app.post('/studio/compiler/build/remove/:applicationName/:platform', gate.studio, compiler.removeAppBuild);
        app.get('/studio/compiler/build/list/:applicationName/:platform', gate.studio, compiler.getAppBuildList);
        app.post('/studio/compiler/build/deploy/:applicationName/:platform', gate.studio, compiler.deployAppBuild);
        app.get('/studio/compiler/download/:applicationName/:applicationVersion/:buildNumber', gate.studio, compiler.downloadAppArchive);
        app.post('/studio/compiler/build/register/:applicationName/:platform', gate.studio, compiler.registerNewAppBuild);
        app.get('/studio/compiler/settings', gate.studio, compiler.getCompilerSettings);
        app.post('/studio/deployment/compile', unzip.engine);
        app.post('/studio/compiler/getlogfile/',function(req, res){
            unzip.getLogFile(req.body)
                .then(function(data){
                    res.send(data);
                })
                .fail(function(err){
                    res.status(500).send(err);
                });
        });
        //app.post('/studio/compiler/:action/:applicationName', gate.studio, compiler.api);
        //app.post('/studio/compiler/build/deployNew/:applicationName', gate.studio, compiler.deployAppBuildNew);
        // _______________________COMPILER STOP_______________________________//

        // _______________________STUDIO START________________________________//
        // :action = list, get, update, remove, create, createband or getRoles
        app.post( '/studio/users/:action',  gate.studio, sysadmin.tenant.user.api);
        // :action = get, getRights, list, rightsList, create, update or remove
        app.post( '/studio/roles/:action',  gate.studio ,sysadmin.tenant.role.api);
        app.get(  '/studio/roles/:applicationName/search',  gate.studio, sysadmin.tenant.role.searchByApp);
        app.get('/studio/tree', gate.studio, studio.tree);
        app.get('/studio/builds', gate.studio, studio.getBuilds);
        app.get('/studio/stats/main', gate.studio, studio.mainStats);
        app.get('/studio/:tenantid/login', auth.studio.loginPage);
        app.get('/studio/openidverify', auth.studioOpenId.verify);
        app.post('/studio/login', auth.studio.loginVerify);
        app.get('/studio/login', auth.studio.loginVerify);
        app.get('/studio/loginerror', auth.studio.loginerror);
        app.get('/studio/home', gate.studio, studio.home);
        app.get('/studio/home/treedata', gate.studio, studio.getTreeData);
        app.get('/studio/dashboard', gate.studio, studio.dashboard);
        app.get('/studio/templates/*?', gate.studio, templates.get);
        app.get('/studio/landing.html', gate.studio, function (req, res) {
            studio.landing(req, res, storage, version, sysadmin.tenant, dockerisation.isOFF)
        });
        app.get('/studio/index.html', gate.studio, function (req, res) {
            studio.index(req, res, storage, version, sysadmin.tenant, dockerisation.isOFF)
        });
        app.get(  '/studio/databases/:action?/:dbName?/:clName?/:id?', gate.studio, databases.action);
        app.post( '/studio/databases/:action/:dbName/:clName/:id?',    gate.studio, databases.action);
        // TODO use encription
        app.post( '/studio/auth-providers', gate.studio, function(req, res) { studio.getAuthProviders(req, res, sysadmin)});
        app.post( '/studio/db_drivers',     gate.studio, function(req, res) { studio.getDbProviders(req, res, sysadmin)});
        app.get(  '/studio/sessions',       gate.studio, function(req, res) { studio.sessions(req, res)});
        app.get(  '/studio/feedback',       gate.studio, function(req, res) { studio.feedback(req, res)});
        app.get(  '/studio/workflow',       gate.studio, function(req, res) { studio.workflow(req, res)});
        app.get(  '/studio/settings',       gate.studio, function(req, res) { studio.settings(req, res)});
        app.get(  '/studio/:what/create',   gate.studio, function(req, res) { studio.create(req, res, req.params.what)});
        app.get(  '/studio/session/getid',  gate.studio, function(req, res) { res.end("" + req.session.tenant.id + '_' + req.session.user.id)});
        app.get(  '/studio/users/:applicationName/search',  gate.studio, sysadmin.tenant.user.searchByApp);
        app.get("/studio/components/search", gate.studio, studio.searchComponents);
        //app.post('/studio/ldap/storage', gate.studio, ldap.storage);
        //app.post('/studio/ldap/search',  gate.studio, ldap.search);
        // _________________________STUDIO STOP___________________________________//

        // _________________________Data dictionary START_________________________//
        // :action = put, remove, list or get
        //app.post('/studio/data_dictionary/:action/:applicationName', gate.studio, data_dictionary.api);
        //app.get('/studio/data_dictionary/:action/:name/:applicationName', gate.studio, data_dictionary.api);
        //app.get('/studio/data_dictionary/:action/:applicationName', gate.studio, data_dictionary.api);
        //app.delete('/studio/data_dictionary/:action/:name/:applicationName', gate.studio, data_dictionary.api);
        // _________________________Data dictionary STOP__________________________//

        // _______________________APPLICATION START_______________________________//
        // :action = get, create, delete, update, recover, updateConf, copyObject, copyCategory or getUserInfo
        app.post('/studio/application/:action', gate.studio, applications.api);
        app.get('/studio/application/:action/:applicationName', gate.studio, applications.api);
        app.post('/studio/application/:action/:applicationName', gate.studio, applications.api);
        app.get('/applicationLogo', applications.getLogo);
        //app.post('/studio/application/:action', gate.studio, applications.api);
        //app.get('/studio/application/read/:applicationName', gate.studio, applications.read);
        //app.get('/studio/application/list', gate.studio, applications.getList);
        //app.get('/studio/application/count', gate.studio, applications.count);
        //app.get('/studio/application/list-with-platforms', gate.studio, applications.getListWithPlatformsAndWidgetCats);
        //app.get('/studio/application/list-with-platforms-and-query-cats', gate.studio, applications.getListWithPlatformsAndQueryCats);
        //app.get('/studio/application/menu/:applicationName/role/:role', gate.studio, applications.getApplicationMenu);
        //app.get('/studio/application/menu-data/:applicationName/role/:role', gate.studio, applications.getApplicationMenuData);
        //app.get('/studio/application/screens/:applicationName/role/:role', gate.studio, applications.getApplicationScreens);
        //app.get('/studio/application/screens-data/:applicationName/role/:role', gate.studio, applications.getApplicationScreensData);
        //app.post('/studio/application/configuration/:applicationName', gate.studio, applications.getApplicationConfiguration);
        //app.post('/studio/application/configuration/:applicationName/:action', gate.studio, applications.api);
        //app.get('/studio/application/view/:applicationName', gate.studio, applications.view);
        //app.get('/studio/application/templates', gate.studio, applications.getTemplates);
        //app.get('/studio/application/menu/:applicationName', gate.studio, applications.menu);
        //app.get('/studio/application/screens/:applicationName', gate.studio, applications.screens);
        //app.get('/studio/application/widgets-data/:applicationName', gate.studio, applications.getApplicationWidgetsData);
        //app.get('/studio/application/snapshot/:applicationName', gate.studio, applications.getApplicationSnapshot);
        //app.get('/studio/application/matrix/:applicationName', gate.studio, applications.getApplicationMatrix);
        //app.get('/studio/application/platfom/:applicationName', gate.studio, applications.getApplicationPlatform);
        // _______________________APPLICATION STOP_______________________________//

        // _________________________WIDGET START_________________________________//
        // :action = create, create-from-model, create-predefined, update, delete, saveas, recover, createCategory, updateCategory, removeCategory
        app.post('/studio/widget/:action', gate.studio, widgets.api);
        app.get('/studio/widget/category/list/:applicationName/:platform', gate.studio, widgets.getCatList);
        app.post('/studio/widget/category/:action/:nameWidgetCat?', gate.studio, widgets.api);
        app.post('/studio/widget/:action/:widgetName', gate.studio, widgets.api);
        app.post('/studio/widget/:applicationName/:action/:widgetName', gate.studio, widgets.api);
        app.get("/studio/widget/search", gate.studio, widgets.search);
        app.get("/studio/widget/search/:applicationName", gate.studio, widgets.searchByApp);
        app.get("/studio/widget/search/:applicationName/:platform", gate.studio, widgets.searchByApp);
        app.get('/studio/widget/item/:applicationName/:widgetName/:platform', gate.studio, widgets.getItem);
        app.get('/studio/widget/script/:applicationName/:widgetName/:platform', gate.studio, widgets.getScript);
        app.get('/studio/widget/editui/:applicationName/:widgetName/:platform', gate.studio, widgets.editui);
        app.get('/studio/widget/:platform/preview-auth/:applicationName/:widgetName/:platform/:device', gate.studio, widgets.previewAuth);
        app.get('/studio/widget/:platform/preview/:applicationName/:widgetName/:device', gate.studio, function(req, res){ widgets.preview(req, res, resources);});
        app.get('/studio/widget/:platform/:applicationName/:widgetName/index.html', gate.studio, function (req, res) {widgets.index(req, res, storage, version)});
        app.get('/studio/widget/:action/:applicationName/:viewName/:platform', gate.studio, widgets.api);
        app.get('/studio/widget/download/:viewName', function(req, res) {widgets.getViewArchive(req, res)});
        //app.get('/studio/widget/gc/:applicationName/:widgetName', gate.studio, widgets.getWidgetScreens);
        //app.get('/studio/widget/migrate/:widgetName', gate.studio, widgets.migrate);
        //app.get("/studio/widget/list/:platform", gate.studio, widgets.list);
        //app.get("/studio/widget/list/:platform/:search", gate.studio, widgets.listQuery);
        //app.get("/studio/widget/list/:applicationName/:platform", gate.studio, widgets.listQuery);
        //app.get("/studio/widget/list/:applicationName/:platform/:search", gate.studio, widgets.listQuery);
        //app.get('/studio/widget/view/:widgetName', gate.studio, widgets.view);
        //app.get('/studio/widget/count/:applicationName', gate.studio, widgets.countByApp);
        //app.get('/studio/widget/gc/:widgetName', gate.studio, widgets.getWidgetScreens);
        //app.get('/studio/widget/gcontrols/:wgt_platform/property/:gc_type', gate.studio, widgets.getGcontrols);
        // _________________________WIDGET STOP_________________________________//

        // _________________________SCREEN START________________________________//
        // :action = create, delete or update
        app.post('/studio/screen/:action', gate.studio, screens.api);
        app.get("/studio/screen/item/:screenName/:applicationName/:platform", gate.studio, screens.screenItem);
        app.post('/studio/screen-category/:action', gate.studio, categories.api);
        app.post('/studio/screen-category/:action/:categoryName', gate.studio, categories.api);
        app.get('/studio/screen-category/list/:applicationName/:platform', gate.studio, categories.list);
        app.get('/studio/screen/:applicationName/:platform/:screenName/index.html', gate.studio, function (req, res) {screens.index(req, res, storage, version)});
        app.get('/studio/screen/editui/:applicationName/:screenName/:platform', gate.studio, screens.editui);
        app.get('/studio/screen/preview/:applicationName/:screenName/:platform', gate.studio, screens.preview);
        //app.get('/studio/screen/list/:applicationName', gate.studio, screens.screenList);
        //app.get('/studio/screen/count/:applicationName', gate.studio, screens.countByApp);
        //app.get('/studio/screen/list/:applicationName/:search', gate.studio, screens.screenListSearch);
        //app.get("/studio/screen/search/:applicationName", gate.studio, screens.searchByApp);
        //app.get("/studio/screen/widgets/:screenName/:applicationName", gate.studio, screens.getScreenWidgetsInAppConf);
        // _________________________SCREEN STOP_________________________________//

        // _____________________SCREEN TEMPLATES START__________________________//
        // :action = create or update
        app.post('/studio/screentemplates/:action', gate.studio, screens_templates.api);
        app.get('/studio/screentemplates/list/:applicationName', gate.studio, screens_templates.list);
        app.get('/studio/screentemplates/item/:screenTemplateName/:applicationName', gate.studio, screens_templates.select);
        // _____________________SCREEN TEMPLATES STOP___________________________//

        // _________________________MENU ITEM START_____________________________//
        //app.post('/studio/menuItem/:action', gate.studio, menus.api);
        //app.get('/studio/menu/list', gate.studio, menus.getMenu);
        //app.get('/studio/menu/items/:applicationName', gate.studio, menus.getAllItems);
        //app.get('/studio/menu/count/:applicationName', gate.studio, menus.countByApp);
        //app.get('/studio/menu/search/:applicationName', gate.studio, menus.searchByApp);
        //app.get("/studio/menu/item/:itemName/:applicationName", gate.studio, menus.getMenu);
        // _________________________MENU ITEM STOP______________________________//

        // _______________________STUDIO GITHUB START___________________________//
        // :action = saveSettings, clearRepository, add, sync, get, import-all, export-all, status or ajax-status
        app.post('/studio/github/:action', gate.studio, versioning.api);
        app.get('/studio/github/:action', versioning.api);
        app.get('/studio/github/settings', gate.studio, versioning.settingsScreen);
        app.get('/studio/github/fetch-settings/:applicationName', gate.studio, versioning.getSettings);
        app.get('/studio/github/select-components', gate.studio, versioning.selectComponentsScreen);
        app.get('/studio/github/:applicationName/:action', gate.studio, versioning.api);
        // _______________________STUDIO GITHUB STOP____________________________//

        //_________________________Limits Start_________________________________//
        // :action = get, set or list
        app.get('/api/limit/:action', limits.api);
        //_________________________Limits Stop__________________________________//

        // _________________________QUERY START_________________________________//
        // :action = create, delete, deleteItem, updateItem, update, updateNew, saveas, recover, createCategory, updateCategory, removeCategory, createService, updateService, removeService, validateServiceName, validateServiceUrl or validateApiRoute
        app.post('/studio/query/:action/:queryName', gate.studio, queries.api);
        app.get('/studio/:appname/apiRoute/*', gate.studio, queries.executeApiRoute);
        app.post('/studio/:appname/apiRoute/*', gate.studio, queries.executeApiRoute);
        app.get('/studio/query/execute', gate.studio, queries.execute);
        app.post('/studio/query/execute', gate.studio, queries.execute);
        app.post('/studio/query/:action', gate.studio, queries.api);
        app.post('/studio/query/category/:action/:name?', gate.studio, queries.api);
        app.get('/studio/query/create/:applicationName', gate.studio, queries.createData);
        app.get('/studio/query/list-by-app/:applicationName', gate.studio, queries.listByApp);
        app.get('/studio/query/list-by-app-detailed/:applicationName', gate.studio, queries.listByAppDetailed);
        app.get('/studio/query/category/list/:applicationName', gate.studio, queries.listCats);
        app.get('/studio/query/dataNew/:applicationName/:queryName', gate.studio, queries.getQueryDataNew);
        //app.get('/studio/query/category/list', gate.studio, queries.listCats);
        //app.get('/studio/query/list', gate.studio, queries.list);
        //app.post('/studio/query/copy-as/:applicationName/:queryName', gate.studio, queries.copyAs);
        //app.post('/studio/query/service/:action/:name?', gate.studio, queries.api);
        //app.post('/studio/query/move/:applicationName/:action/:queryName', gate.studio, queries.api);
        //app.get("/studio/query/search", gate.studio, queries.search);
        //app.get("/studio/query/search/:applicationName", gate.studio, queries.searchByApp);
        //app.get("/studio/query/getOne/:queryName", gate.studio, queries.getOneQuery);
        //app.get("/studio/query/item/:queryName", gate.studio, queries.getItem);
        //app.get('/studio/query/getDBParams', gate.studio, queries.getDBParams);
        //app.get('/studio/query/view/:queryName', gate.studio, queries.viewQuery);
        //app.get('/studio/query/data/:queryName', gate.studio, queries.getQueryData);
        //app.get('/studio/query/data/:applicationName/:queryName', gate.studio, queries.getQueryData);
        //app.get('/studio/query/count/:applicationName', gate.studio, queries.countByApp);
        //app.get('/studio/dbdriver/:driverName/:action?/:dbName?/:clName?/:query?', gate.studio, queries.dbDriver);
        //app.get('/studio/soap/:action?', gate.studio, queries.soap);
        // _________________________QUERY STOP___________________________________//

        // _______________________STUDIO ERRORS START_____________________________
        //app.get('/studio/error401', gate.studio, function(req, res) { res.render('studio/errors/401', {})});
        //app.get('/studio/error404', gate.studio, function(req, res) { res.render('studio/errors/404', {})});
        //app.get('/studio/error403', gate.studio, function(req, res) { res.render('studio/errors/403', {})});
        //app.get('/studio/error500', gate.studio, function(req, res) { res.render('studio/errors/500', {})});
        // _________________________STUDIO ERRORS STOP____________________________//

        // _______________________STUDIO USER DEFINITION START____________________//
        app.get('/studio/metadata/user_definition/:applicationName', gate.studio, user_definition.getUserDefinition);
        app.post('/studio/metadata/user_definition/update', gate.studio, user_definition.updateUserDefinition);
        //app.get('/studio/metadata/user_definition', gate.studio, user_definition.getUserDefinition);
        //app.get('/studio/picker/user_definition', gate.studio, user_definition.getForStudio);
        // _______________________STUDIO USER DEFINITION STOP_____________________//

        // _______________________STUDIO RESOURCES START__________________________//
        app.post('/studio/resources/upload/:resource_name', gate.studio, resources.upload);
        app.post('/studio/resources/upload/:applicationName/:resource_name', gate.studio, resources.upload);
        app.post('/studio/resources/simulate_upload/:applicationName/:resource_name', gate.studio, resources.simulate_upload);
        app.get('/studio/resources/preview/:resource_name/:filename', gate.studio, resources.getTile);
        app.get('/studio/resources/preview/:applicationName/:resource_name/:filename', gate.studio, resources.getTile);
        app.post('/studio/resources', gate.studio, resourcesEndpoint);
        // _______________________STUDIO RESOURCES STOP___________________________//

        // _______________________STUDIO PREDEFINED GC TEMPLATES START____________//
        //app.post('/studio/predefined_gc/save', gate.studio, predefined_gc.api.save);
        // _______________________STUDIO PREDEFINED GC TEMPLATES STOP_____________//

        // _______________________STUDIO GC EXTENSIONS START_______________________//
        //app.get('/studio/gc_extensions/directives', gate.studio, gc_extensions.getDirectives);
        //app.get('/studio/gc_extensions/settings', gate.studio, function(req, res) { gc_extensions.settingsScreen(req, res)});
        //app.post('/studio/gc_extensions/save-settings', gate.studio, function (req, res) { gc_extensions.saveSettings(req.body, req, res)});
        // _______________________STUDIO GC EXTENSIONS STOP_______________________//

        // _______________________DOCKER START____________________________________//
        // :action = list, build, push, remove or registry
        app.post('/studio/docker/:action',  gate.studio, dockerisation.api);
        app.get( '/studio/docker/:action',  gate.studio, dockerisation.api);
        // _______________________DOCKER STOP_____________________________________//

        // _________________________EDITOR START__________________________________//
        //// Seems never used
        //app.get('/studio/editor/:docName/:formName', gate.studio, function(req, res) {
        //    fs.readFile(path.join(__dirname, '..', 'templates/studio/editor/', req.params.docName, req.params.formName), 'utf8', function(err, doc) {
        //        if (err) throw err;
        //        var fn = jade.compile(doc);
        //        var body = fn({});
        //        res.setHeader('Content-Type', 'text/html');
        //        res.setHeader('Content-Length', body.length);
        //        res.end(body);
        //    });
        //});
        //// Seems never used
        //app.post('/studio/editor/:docName/:builderName', gate.studio, function(req, res) {
        //    var editor = require('../templates/studio/editor/'+req.params.docName+'/'+req.params.builderName+'.js');
        //    return res.end(editor.build(req.body.form));
        //});
        // _________________________EDITOR STOP_________________________________//

        // _________________________DFX START___________________________________//
        //app.get('/dfx/:tenantid/:applicationName/index.html', gate.studio, function(req, res) {
        //    console.log("DFX");
        //    req.session.user = {
        //        name: req.body.username
        //    };
        //    applications.get(req.params.applicationName, req, function(app) {
        //        fs.readFile(path.join(__dirname, '..', 'templates/login.jade'), 'utf8', function(err, data) {
        //            if (err) throw err;
        //
        //            var fn = jade.compile(data);
        //            var body = fn({
        //                apptitle: app.title
        //            });
        //            res.setHeader('Content-Type', 'text/html');
        //            res.setHeader('Content-Length', body.length);
        //            res.end(body);
        //        });
        //    });
        //});
        //
        //// Screen HTTP Handler
        //app.get('/dfx/:tenantid/:appname/start.html', gate.studio, function(req, res) {
        //    screens.render('Home', req, res);
        //});
        //
        //// Widget HTTP Handler (will be replaced by websocket)
        //// Screen HTTP Handler
        //app.get('/dfx/:tenantid/:appname/widget.html', gate.studio, function(req, res) {
        //    widgets.render(req.query.wclass, req, res);
        //});
        //
        ////app.get('/dfx/:tenantid/:appname/:screen', gate.studio, function(req, res) {
        ////    var body = '';//'You are connected as ' + req.user.username + '(' + req.user.userid + ')';
        ////    res.setHeader('Content-Type', 'text/plain');
        ////    res.setHeader('Content-Length', body.length);
        ////    res.end(body);
        ////});
        //
        //app.get('/studio/_previewlogin', gate.studio, function(req, res){ res.render('widget_shared_login', {redirect:req.query.redirect}) });
        //app.post('/studio/_previewlogin', gate.studio, auth.preview.login);
        // _________________________DFX STOP___________________________________//

        // :action = getUserProfile, getApp, getApps, getByPlatform or createApp
        app.post('/studio/phonegap/:action', gate.studio, phoneGap.api);
        app.get('/studio/phonegap/:action', gate.studio, phoneGap.api);
    }

    // _______________________APP RESOURCES START_____________________________//
    app.get('/studio-assets/:assetName', resources.getStudioAssets);
    app.get('/assets/:assetName', resources.getAppAsset);
    app.get('/_shared/assets/:assetName', resources.getSharedAsset);
    // _______________________APP RESOURCES STOP______________________________//

    //// Query Client Access
    //app.get("/app/:tenantid/query/getOne/:queryName", gate.studio, function(req, res) {
    //    queries.getOne(req.params.queryName, req.params.tenantid, req, function(query) {
    //        if (!query) {
    //            return res.end("{error:'Not Found this query!'}");
    //        }
    //        if(query.settings.url == ""){
    //            return res.end("{error:'Cannot execute this query because url is empty'}");
    //        }
    //        res.setHeader("Access-Control-Allow-Origin", "*");
    //
    //        res.end(JSON.stringify({
    //            query: query
    //        }));
    //    });
    //});
    // ________________________APP START___________________________________//
    app.post('/app/login', auth.app.login);
    app.get('/app/allowGuestSession/:tenantId/:appname',deploy.dep.allowGuestSession);
    app.post('/app/logout', gate.app, auth.app.logout);
    app.post('/app/refreshtoken', gate.app, auth.app.refreshtoken);
    app.get('/app/:appname/apiRoute/*', gate.appQuery, queries.executeApiRoute);
    app.post('/app/:appname/apiRoute/*', gate.appQuery, queries.executeApiRoute);
    app.get('/app/query/execute', gate.appQuery, queries.execute );
    app.post('/app/query/execute', gate.appQuery, queries.execute );
    app.get('/app/menu/:tenantid/:appname/:menuname', gate.app, menus.getMobileMenu);
    app.get('/app/user_definition', gate.app, user_definition.get);
    // _________________________APP STOP____________________________________//

    // _______________________CUSTOM URLS START_____________________________//
    for (var i = 0; i < SETTINGS.customUrls.length; i++) {
        app[ SETTINGS.customUrls[i].request_type ]( SETTINGS.customUrls[i].url, SETTINGS.customUrls[i].callback );
    }
    // _______________________CUSTOM URLS STOP______________________________//


    if ( SETTINGS.studio ) {
        // action: get | exists | getOne | count
        //app.get(
        //    '/database/:action?/:dbName?/:clName?/:query?',
        //    function(req, res, next){console.log('\033[31m Depricated api form: \u001b[0mGET /database/:action?/:dbName?/:clName?/:query?');next()},
        //    //passport.authenticate('digest', { session: false }),
        //    passport.authenticate('basic', { session: false }),
        //    databaseApi.action
        //);
        //
        //// action: put | rm | update
        //app.post(
        //    '/database/:action',
        //    function(req, res, next){console.log('\033[31m Depricated api form: \u001b[0mPOST /database/:action');next();},
        //    //passport.authenticate('digest', { session: false }),
        //    passport.authenticate('basic', { session: false }),
        //    databaseApi.action
        //);

        // ------------------------------ DEPRECATED
        // -----------------------------------------


        // action: get | exists | getOne | count
        //app.get(
        //    '/api/database/:action?/:dbName?/:clName?/:query?',
        //    //passport.authenticate('digest', { session: false }),
        //    passport.authenticate('basic', { session: false }),
        //    databaseApi.action
        //);
        //
        //// action: put | rm | update
        //app.post(
        //    '/api/database/:action',
        //    //passport.authenticate('digest', { session: false }),
        //    passport.authenticate('basic', { session: false }),
        //    databaseApi.action
        //);
    }

    // ---------------------------------- queries
    //app.get(
    //    '/api/:appname/apiRoute/*',
    //    passport.authenticate('basic', { session: false }),
    //    /**
    //     * it calls 'query.execute',
    //     * creates a "sandbox" with fake 'res.end' for 'query.execute'
    //     * catches when 'query.execute' trying to send answer to client
    //     * (when 'query.execute' calls res.end)
    //     * if there is a 'data' parameter -- sends just it,
    //     * if not -- sends entire answer of 'query.execute'
    //     */
    //    function (req, res, next) {
    //        var fake_res = Object.create(res);
    //        var apiRoute = req.url.replace('/api/','').replace('apiRoute/','') || '';
    //        var appName = apiRoute.split('/')[0] || '';
    //            apiRoute = apiRoute.replace(appName + '/','');
    //        if (appName == '_shared') appName = "";
    //
    //        queries.getQueryByApiRoute(req, appName, apiRoute)
    //            .then(function(data){
    //                if (data) {
    //                    if (data.typerequest === 'POST') {
    //                        req.method = 'POST';
    //                        req.body = data;
    //                    } else {
    //                        req.query = data;
    //                    }
    //
    //                    fake_res.end = function ( answerOfExecute ) {
    //                        var parsedAnswer,
    //                            answer;
    //
    //                        try {
    //                            parsedAnswer = JSON.parse(answerOfExecute);
    //                            if ( parsedAnswer.hasOwnProperty('data') ) {
    //                                answer = JSON.stringify(parsedAnswer.data);
    //                            } else {
    //                                answer = answerOfExecute;
    //                            }
    //                        } catch (error) {
    //                            answer = answerOfExecute;
    //                        }
    //                        //res.setHeader('Content-Length', answer.length);
    //                        res.setHeader("Access-Control-Allow-Origin", "*");
    //                        res.end(answer);
    //                    };
    //
    //                    queries.execute(req, fake_res, next);
    //                } else {
    //                    res.status(404).send("Not found apiRoute - " + req.url + "!");
    //                }
    //            })
    //            .fail(function(e){
    //                res.status(404).send("Not found apiRoute - " + req.url + "!");
    //            })
    //    }
    //);

    app.post(
        '/api/:appname/apiRoute/*',
        passport.authenticate('basic', { session: false }),
        queries.executeApiRoute
    );

    //app.get(
    //    '/api/query/execute/:app/:query',
    //    passport.authenticate('basic', { session: false }),
    //    /**
    //     * it calls 'query.execute',
    //     * creates a "sandbox" with fake 'res.end' for 'query.execute'
    //     * catches when 'query.execute' trying to send answer to client
    //     * (when 'query.execute' calls res.end)
    //     * if there is a 'data' parameter -- sends just it,
    //     * if not -- sends entire answer of 'query.execute'
    //     */
    //        function (req, res, next) {
    //        var fake_res = Object.create(res);
    //        req.query.queryName = req.params.query;
    //        if (req.params.app != '_shared') {
    //            req.query.application = req.params.app;
    //        }
    //        req.query.tenantid = req.user.id;
    //        fake_res.end = function ( answerOfExecute ) {
    //            var parsedAnswer,
    //                answer;
    //
    //            try {
    //                parsedAnswer = JSON.parse(answerOfExecute);
    //                if ( parsedAnswer.hasOwnProperty('data') ) {
    //                    answer = JSON.stringify(parsedAnswer.data);
    //                } else {
    //                    answer = answerOfExecute;
    //                }
    //            } catch (error) {
    //                answer = answerOfExecute;
    //            }
    //            //res.setHeader('Content-Length', answer.length);
    //            res.setHeader("Access-Control-Allow-Origin", "*");
    //            res.end(answer);
    //        };
    //
    //        queries.execute(req, fake_res, next);
    //    }
    //);
    //app.post(
    //    '/api/query/execute/:app/:query',
    //    passport.authenticate('basic', { session: false }),
    //    /**
    //     * it calls 'query.execute',
    //     * creates a "sandbox" with fake 'res.end' for 'query.execute'
    //     * catches when 'query.execute' trying to send answer to client
    //     * (when 'query.execute' calls res.end)
    //     * if there is a 'data' parameter -- sends just it,
    //     * if not -- sends entire answer of 'query.execute'
    //     */
    //        function (req, res, next) {
    //        var fake_res = Object.create(res);
    //        req.body.tenantid = req.user.id;
    //        req.body.queryName = req.params.query;
    //        if(req.params.app != '_shared'){
    //            req.body.application = req.params.app;
    //        }
    //        fake_res.end = function ( answerOfExecute ) {
    //            var parsedAnswer,
    //                answer;
    //
    //            try {
    //                parsedAnswer = JSON.parse(answerOfExecute);
    //                if ( parsedAnswer.hasOwnProperty('data') ) {
    //                    answer = JSON.stringify(parsedAnswer.data);
    //                } else {
    //                    answer = answerOfExecute;
    //                }
    //            } catch (error) {
    //                answer = answerOfExecute;
    //            }
    //            //res.setHeader('Content-Length', answer.length);
    //            res.setHeader("Access-Control-Allow-Origin", "*");
    //            res.end(answer);
    //        };
    //        queries.execute(req, fake_res, next);
    //    }
    //);

    // ____________________________API START_______________________________________________________//
    if ( SETTINGS.studio ) {
        // :action = create, edit, remove, activate, deactivate, list, get, getUsers, getRoles, getUserDefinition, getAuthProviders or getDbDrivers
        app.get( '/api/tenant/:action',                   /*gate.oAuthSimpleSigned,*/ api.tenant);
        app.post( '/api/tenant/:action',                   /*gate.oAuthSimpleSigned,*/ api.tenant);
        // :action = get, getApplicationWidgets, getApplicationMenus or getApplicationConfiguration
        app.get( '/api/apps/:action',                     /*gate.oAuthSimpleSigned,*/ api.apps);
        // :action = getAll
        app.get( '/api/screens/:action',                  /*gate.oAuthSimpleSigned,*/ api.screens);
        // :action = getAll
        app.get( '/api/screens_templates/:action',        /*gate.oAuthSimpleSigned,*/ api.templates);
        // :action = getAll or getApplicationWidgets
        app.get( '/api/dataquery/:action',                /*gate.oAuthSimpleSigned,*/ api.dataquery);
        // :action = list, getAppResourceItems or deployResources
        app.get( '/api/resources/:action',                /*gate.oAuthSimpleSigned,*/ api.resources);
        // :action = create or remove
        app.get( '/api/user/:action',                     gate.oAuthSimpleSigned, api.user);
        // :action = loginBlueMix, getSpacesList, setChoosenSpace, getChoosenSpace, getOrgsList, setChoosenOrg, loginCF, getNamespace, remoteImagesList, build, logout, loginStatus or removeImage
        app.get( '/studio/bm/:action',                    gate.studio, bm.api);
        app.post('/studio/bm/:action',                    gate.studio, bm.api);
        app.post('/studio/deployment/deploy',             gate.studio, deploy.dev.send);
        app.get( '/studio/deployment/list',               gate.studio, deploy.dev.list);
        app.get( '/studio/deployment/delete/:app/:build', gate.studio, deploy.dev.delete);
        app.get( '/studio/obtainaccesstoken',             gate.studio, accessTokens.obtain);
        // :action = contents
        app.get( '/studio/samples/:action',               gate.studio, api.samples);
        app.get('/studio/build/download', function(req, res) {studio.getBuildFile(req, res)});
    }

    app.get('/api/templates/getzip', zip.getTemplatesZip);
    app.get('/api/resourcesbunch/getzip', zip.getResourcesZip);
    // :action = info or settings
    app.get('/api/server/:action',  /*gate.oAuthSimpleSigned,*/ api.server);
    app.get('/api/ping', api.ping);
    // _________________________API STOP__________________________________________________________//

    if ( !SETTINGS.studio ) {
    // _________________________DEPLOYS START_____________________________________________________//
        app.post(  '/deploys',                     /*gate.oAuthSimpleSigned,*/ deploy.dep.upload);
        app.delete('/deploys/:tenant/:app/:build', gate.oAuthSimpleSigned,     deploy.dep.delete);
        app.get(   '/deploys/:tenant',             gate.oAuthSimpleSigned,     deploy.dep.list);
   // _________________________DEPLOYS STOP_______________________________________________________//
    }
    //________________________APP AUTH START______________________________________________________//
    app.get('/app/obtainaccesstoken', gate.app, accessTokens.obtain );
    app.get('/oauth2callback', accessTokens.oauth2callback );
    //________________________APP AUTH STOP_______________________________________________________//
};

exports.initialize = initialize;
