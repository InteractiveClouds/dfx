staffRoles : {
    admin : {
        'accessRealm::studio' : true

        'manageCustomUsers'     : true,  // create, remove, update, list
        'manageStaffUsers'      : false, // create, remove, update, list
        'listCustomUsers'       : true,
        'listStaffUsers'        : true,

        'executeAnyDataqueries' : true,
        // + 'executeDataquery::<dataqueryName>'

        'assignAnyStaffRoles'        : true,
        'assignStaffRole::admin'     : true,
        'assignStaffRole::developer' : true,

        'manageCustomRoles'   : true, // create, remove, update, list
        'assignAnyCustomRole' : true,

        'assignRight::accessRealm'           : true, // only what he has
        'assignRight::manageCustomUsers'     : true,
        'assignRight::manageStaffUsers'      : false,
        'assignRight::listCustomUsers'       : true,
        'assignRight::listStaffUsers'        : true,
        'assignRight::changeOwnPassword'     : true,
        'assignRight::executeAnyDataqueries' : true,
        'assignRight::executeDataquery'      : true,
        'assignRight::manageCustomRoles'     : true,
        'assignRight::assignAnyStaffRoles'   : true,
        'assignRight::assignStaffRole'       : true,
        'assignRight::assignAnyCustomRole'   : true,
        'assignRight::assignCustomRole'      : true
    },

    developer : {
        'accessRealm::studio' : true

        'listCustomUsers' : true,
        'listStaffUsers'  : true,

        'executeAnyDataqueries' : true,

        'manageCustomRoles'   : true,
        'assignAnyCustomRole' : true,

        'assignRight::executeDataquery' : true,
    }
}
