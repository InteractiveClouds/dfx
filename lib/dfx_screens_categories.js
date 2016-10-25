var SETTINGS  = require('./dfx_settings'),
    mdbw      = require('./mdbw')(SETTINGS.mdbw_options),
    Q         = require('q'),
    endpoints = require('./utils/endpoints'),
    jade      = require('jade'),
    fs        = require('graceful-fs'),
    path      = require('path'),
    log       = new (require('./utils/log')).Instance({label: "SCREENS_CATEGORIES"});
    sharedCatalogName = SETTINGS.sharedCatalogName;

var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var ScreenCategory = {};

var api = {
    create: function (parsed) {
        var D = Q.defer();
        ScreenCategory.createNew(parsed.screenCategoryParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve('Category has been successfully created')
        });
        return D.promise;
    },

    update: function (parsed) {
        var D = Q.defer();
        ScreenCategory.setCat(parsed.req.params.categoryName, parsed.screenCategoryParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve('Category has been successfully updated');
        });
        return D.promise;
    },


    delete: function (parsed) {
        var D = Q.defer();
        ScreenCategory.deleteCategory(parsed.req.params.categoryName, parsed.screenCategoryParameters.applicationName, parsed.screenCategoryParameters.platform, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve("Category " + parsed.screenCategoryParameters.screenCategoryName + " has been successfully deleted");
        });
        return D.promise;
    }
};

ScreenCategory.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                screenCategoryParameters: req.body,
                req:                      req
            }
        }
    },
    action: api,
    log:    log
});

ScreenCategory.list = function (req, res) {
    ScreenCategory.getAll(req.params.applicationName, req.params.platform, req, function (cats) {
        result = {"web":[],"tablet":[],"mobile":[]};
        cats.forEach(function (category) {
            result[category.platform].push(category);
        });
        res.end(JSON.stringify(result));
    });
};

ScreenCategory.getAll = function (applicationName, platform, req, callback) {
    var filter = {application: applicationName, platform: platform};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_categories', filter).then(function (docs) {
        callback(docs);
    });
};

ScreenCategory.getTenantCategories = function (req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_categories').then(function (docs) {
        callback(docs);
    });
};


ScreenCategory.createNew = function (categoryParameters, req, callback) {
    var userId = req.session.user.id;
    ScreenCategory.getNewJSON(function (json) {
        json.title       = categoryParameters.title;
        json.name        = categoryParameters.name;
        json.platform    = categoryParameters.platform;
        json.requestDate = new Date();
        json.ownerId     = categoryParameters.ownerId;
        json.application = categoryParameters.application;
        json.versioning  = {
            "status":      'added',
            "user":        userId,
            "last_action": (new Date() / 1000).toFixed()
        };
        mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_categories', {
            name:        categoryParameters.name,
            application: categoryParameters.application,
            platform:    categoryParameters.platform
        }).then(function (exists) {
            if (!exists) {
                mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_categories', json)
                    .then(function (menu_item_id) {
                        mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'trash', {
                            name:        categoryParameters.name,
                            application: categoryParameters.application,
                            platform:    categoryParameters.platform,
                            type:        'screens_categories'
                        }).then(function () {
                            callback(null, menu_item_id);
                        });
                    });
            } else {
                callback('Screens category with same name already exists', null);
            }
        });
    });
};

ScreenCategory.getNewJSON = function (callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/blanks/screen-category.json'), 'utf8', function (err_log, data) {
        callback(JSON.parse(data));
    });
};

ScreenCategory.setCat = function (currentCatName, categoryParameters, req, callback) {
    var newCatName = categoryParameters.name,
        applicationName  = categoryParameters.application,
        platform = categoryParameters.platform,
        tenantId   = req.user.tenantid;
        userId   = req.session.user.id;

    var filterGet   = {
        name:        currentCatName,
        application: applicationName,
        platform:    platform
    };
    var filterExist = {
        name:        newCatName,
        application: applicationName,
        platform:    platform
    };

    mdbw.getOne(DB_TENANTS_PREFIX + tenantId, 'screens_categories', filterGet).then(function (categories) {
        mdbw.exists(DB_TENANTS_PREFIX + tenantId, 'screens_categories', filterExist).then(function (result) {
            if (!result) {
                var status;
                (categories.versioning.status === 'committed') ? status = "modified" : status = categories.versioning.status;
                mdbw.update(DB_TENANTS_PREFIX + tenantId, 'screens_categories', filterGet, {
                    $set: {
                        name: newCatName,
                        versioning: {
                            "status":      status,
                            "user":        userId,
                            "last_action": (new Date() / 1000).toFixed()
                        }
                    }
                }).then(function (quantity_scrns) {
                    updateCategoryNameInScreens(tenantId, applicationName, platform, currentCatName, newCatName, quantity_scrns, callback);
                }).fail(function (err) {
                    log.error(err);
                });
            } else {
                callback("Current category name already exists");
            }
        });
    });
};

ScreenCategory.deleteCategory = function (screenCategoryName, applicationName, platform, req, callback) {
    var appDbName = getAppDbName(applicationName),
        userId    = req.session.user.id,
        tenantId = req.user.tenantid;
    var filter = {
        name:    screenCategoryName,
        application: applicationName,
        platform : platform
    }
            mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_categories', filter).then(function (category) {
                category.type       = "screens_categories";
                category.versioning = {
                    "status":      'deleted',
                    "user":        userId,
                    "last_action": (new Date() / 1000).toFixed()
                };
                mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'trash', category).then(function () {
                    mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_categories', filter).then(function (quantity_scrs) {
                        updateCategoryNameInScreens(tenantId, appDbName, platform, screenCategoryName, 'Default', quantity_scrs, callback);
                    });
                });
            }).fail(function (err) {
                log.error('Widget Category Deleting Error: ', err);
            });
};

var updateCategoryNameInScreens = function (tenantId, applicationName, platform, currentCatName, newCatName, quantity_wgts, callback) {
    // update this category name in all the screens
    mdbw.update(DB_TENANTS_PREFIX + tenantId, 'screens',
        {application: applicationName, category: currentCatName, platform: platform},
        {$set: {category: newCatName}}
    ).then(function (quantity_wgts) {
            callback(null, quantity_wgts);
        }).fail(function (err) {
            callback(err);
            log.error(err);
        });
};

var getAppDbName = function (applicationName) {
    return ((!applicationName) || applicationName == sharedCatalogName) ? '' : applicationName;
};

module.exports = ScreenCategory;
