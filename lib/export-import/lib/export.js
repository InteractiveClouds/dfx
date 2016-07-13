const
    path        = require('path'),
    Q           = require('q'),
    QFS         = require('q-io/fs'),
    SETTINGS    = require('../../dfx_settings'),
    mdb         = require('../../mdbw')(SETTINGS.mdbw_options),
    tmpDirTool  = require('../../utils/tempdir'),
    templator   = require('../../utils/simpleTemplator'),
    Fdb         = require('../../fileStorage/mdbwLikeWithDbAndCl').Instance,
    copyDbItems = require('./copyDbItems'),
    codeVersion = require('../../../package.json').version,
    credCrypt   = require('../../auth/utils/credCrypt'),
    zipper      = require('./zipper'),
    manifest    = templator.compileFile(
            path.join(__dirname, '..', 'templates', 'manifest')
        );

module.exports = function ( tenant, whereToWrite ) {

    return tmpDirTool.exec(function(wrkDir){

        const
            DB_TARGET_DIR = path.join(wrkDir, 'db'),
            RESOURSES_TARGET_DIR = path.join(wrkDir, 'resources'),
            RESOURSES_SOURCE_DIR = path.join(
                    SETTINGS.resources_development_path,
                    tenant
                ),
            BUILDS_SOURCE_DIR = path.join(
                    SETTINGS.app_build_path,
                    tenant
                ),
            BUILDS_TARGET_DIR = path.join(wrkDir, 'builds'),
            undefined;

        return Q.all([
            QFS.makeDirectory(DB_TARGET_DIR),
            QFS.makeDirectory(RESOURSES_TARGET_DIR),
            QFS.makeDirectory(BUILDS_TARGET_DIR)
        ])
        .then(function(){
            const fdb = new Fdb({
                path        : DB_TARGET_DIR,
                uniqueField : '_id'
            });

            return Q.all([
                QFS.write(
                    path.join(wrkDir, 'manifest.json'),
                    manifest({
                        "codeVersion"  : codeVersion,
                        "server-uuid"  : SETTINGS.serverinfo['server-uuid'],
                        "creationDate" : (new Date).toISOString(),
                        "tenantId"     : tenant
                    })
                ),
                copyDbItems({
                    tenant  : tenant,
                    source  : mdb,
                    target  : fdb,
                    decrypt : function (data) { return credCrypt.decrypt(data) },
                    encrypt : function (data) { return Q(data) }
                }),
                QFS.copyTree(RESOURSES_SOURCE_DIR, RESOURSES_TARGET_DIR),
                QFS.copyTree(BUILDS_SOURCE_DIR, BUILDS_TARGET_DIR)
            ]);
        })
        .then(function(){
            return zipper.packDir(wrkDir, whereToWrite);
        });
    });
};
