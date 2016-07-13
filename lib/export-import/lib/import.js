const
    path        = require('path'),
    Q           = require('q'),
    QFS         = require('q-io/fs'),
    semver      = require('semver'),
    SETTINGS    = require('../../dfx_settings'),
    log         = new (require('../../utils/log')).Instance({label: 'IMPORT'}),
    mdb         = require('../../mdbw')(SETTINGS.mdbw_options),
    tmpDirTool  = require('../../utils/tempdir'),
    Fdb         = require('../../fileStorage/mdbwLikeWithDbAndCl').Instance,
    copyDbItems = require('./copyDbItems'),
    codeVersion = require('../../../package.json').version,
    credCrypt   = require('../../auth/utils/credCrypt'),
    roles       = require('../../dfx_sysadmin').tenant.role,
    zipper      = require('./zipper');

module.exports = function ( pathToArchive ) {

    return tmpDirTool.exec(function(wrkDir){

        return zipper.unpackDir(pathToArchive, wrkDir)
        .then(function(){
            const manifest = validateManifest(path.join(wrkDir, 'manifest.json'));

            if ( manifest instanceof Error ) return Q.reject(error);

            return mdb.exists('dreamface_sysdb', 'tenants', {id : manifest.tenantId})
            .then(function(exists){
                if ( exists ) return Q.reject('tenant exists.');

                const
                    tenant = manifest.tenantId,
                    DB_SOURCE_DIR = path.join(wrkDir, 'db'),
                    RESOURSES_SOURCE_DIR = path.join(wrkDir, 'resources'),
                    RESOURSES_TARGET_DIR = path.join(
                            SETTINGS.resources_development_path,
                            tenant
                        ),
                    BUILDS_TARGET_DIR = path.join(
                            SETTINGS.app_build_path,
                            tenant
                        ),
                    BUILDS_SOURCE_DIR = path.join(wrkDir, 'builds'),
                    fdb = new Fdb({
                        path        : DB_SOURCE_DIR,
                        uniqueField : '_id'
                    });

                var dbVersionIsActual; // promise

                if ( semver.gt(codeVersion, manifest.codeVersion) ) {
                    dbVersionIsActual = actualizeDbVersion({
                        actualVersion : codeVersion,
                        fdb           : fdb,
                        log           : log,
                        manifest      : manifest,
                        SETTINGS      : SETTINGS
                    });
                } else {
                    dbVersionIsActual = Q(true);
                }



                return Q.when(dbVersionIsActual, function(){
                    return Q.all([
                        QFS.makeDirectory(RESOURSES_TARGET_DIR),
                        QFS.makeDirectory(BUILDS_TARGET_DIR),
                        Q.delay(3000).then(function(){
                            return copyDbItems({
                                tenant  : tenant,
                                source  : fdb,
                                target  : mdb,
                                encrypt : function (data) {
                                    return credCrypt.encrypt(data)
                                },
                                decrypt : function (data) {
                                    return Q(data)
                                }
                            })
                        }),
                    ])
                })
                .then(function(){
                    return Q.all([
                        QFS.copyTree(RESOURSES_SOURCE_DIR, RESOURSES_TARGET_DIR),
                        QFS.copyTree(BUILDS_SOURCE_DIR, BUILDS_TARGET_DIR),
                        roles.rebuildCache()
                    ]);
                });
            })
        });
    });
};

function validateManifest ( pathToManifest ) {
    const ERROR_PREFIX = '[manifest.json] ';

    var m;

    try { m = require(pathToManifest) }
    catch ( error ) {
        return new Error(ERROR_PREFIX + 'can not require. ' + error.toString())
    }

    if ( !m.tenantId ) return new Error(
        ERROR_PREFIX + 'wrong format. no "tenantId" was found'
    );

    if ( !m.codeVersion || (semver.valid(m.codeVersion) === null) ) {
        return new Error(
            ERROR_PREFIX + 'wrong format. "codeVersion" is invalid'
        );
    }

    return m;
}


const
    dbPatchesManager = require('db-patch-manager'),
    pathToPatches    = path.join(__dirname, '../../../patches');

function actualizeDbVersion ( o ) {

    return new dbPatchesManager({
        actualVersion : o.actualVersion,
        db            : o.fdb,
        getDbVersion  : function(db){
            return Q(o.manifest.codeVersion)
        },
        setDbVersion  : function(version, db){
            return Q(true);
        },
        pathToPatches : pathToPatches,
        log : o.log
    })
    .apply({
        SETTINGS : o.SETTINGS
    });
}
