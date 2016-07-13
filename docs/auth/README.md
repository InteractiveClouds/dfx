1. There is a System Administrator who can access `console` realm
1. The default username and password for System Administrator is set in **lib/dfx_settings.js** (`sys`, `admin` for now). The credentials will be set after "initializing cloud repository".
1. System Administrator must change the password after the first login ( there is an auto redirect ).
1. There is settings for passwords strength separately for users and System Administrator, at  **lib/dfx_settings.js**. System Administrator and users can not set password weaker than the setting.
1. Sessions are used for `console` realm now instead of basic authentication.
1. Sysadmin can 'Change password' and 'Logout' at any time (there is two buttons for it at the bottom of the `console` page).
1. There is two default roles inside a new tenants: `developer` and `admin` (no difference between them at the moment)
1. There is list of roles who can access `studio` realm at the **lib/dfx_settings.js**, if a user has no such role he can not login to the `studio`.
1. System Administrator must set a password for the tenant admin (user with role `admin`, and login `admin` will be created inside the tenant), when creating a `tenant` 
1. The tenant admin ( `admin` user ) can not be edited ( except password changing ) and removed.
