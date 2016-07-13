/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS = require('../lib/dfx_settings'),
    mdbw = require('../lib/mdbw')(SETTINGS.mdbw_options),
    async = require('async'),
     _ = require('underscore');
var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

 mdbw.get("dreamface_sysdb", 'tenants')
        .then(function (docs) {
        	if (!_.isEmpty(docs)) {
                async.each(docs, function(data,callback){
                	///
                	mdbw.native(DB_TENANTS_PREFIX + data.id)
					    .then(function(db){
					        db.createIndex(
					            'applications',
					            {name:1},
					            {unique:true},
					            function(err, indexName) {
					                if (err) {
					                	console.log("Can't insert index on DB - "+DB_TENANTS_PREFIX + data.id+" collection applications. Need to delete records with the same names manually.");

					                }else{
					                	console.log("Index on DB - "+DB_TENANTS_PREFIX + data.id+" collection - applications was successfully created");
					                }
							        db.createIndex(
							            'dataqueries',
							            {name:1},
							            {unique:true},
							            function(err, indexName) {
							                if (err) {
							                	console.log("Can't insert index on DB - "+DB_TENANTS_PREFIX + data.id+" collection dataqueries. Need to delete records with the same names manually.");
							                }else{
							                	console.log("Index on DB - "+DB_TENANTS_PREFIX + data.id+" collection - dataqueries was successfully created");
							                }
										 db.createIndex(
								            'datawidgets',
								            {name:1},
								            {unique:true},
								            function(err, indexName) {
								                if (err) {
								                	console.log("Can't insert index on DB - "+DB_TENANTS_PREFIX + data.id+" collection datawidgets. Need to delete records with the same names manually.");
								                }else{
								                    console.log("Index on DB - "+DB_TENANTS_PREFIX + data.id+" collection - datawidgets was successfully created");
								                }
								                     callback();
								            }
								        );
							            }
							        );
					            }
					        );
					    });
                	///
                },function() {
			        console.log("Patch was successfully executed");
			        process.exit();
			    });
        	}        	
        });


