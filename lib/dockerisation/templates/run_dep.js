var path = require('path');

require('dreamface')
.init({
    server_host  : '0.0.0.0',
    external_server_host : process.env.DFX_EXTERNAL_HOST || 'localhost',
    external_server_port : process.env.DFX_EXTERNAL_PORT || %%PORT%%,
    auth_conf_path : path.resolve(__dirname, './.auth.conf'),
    edition: 'deployment',
    storage: 'file',
    server_port: %%PORT%%,
    deploy_path: path.resolve(__dirname, './deploy'),
    fsdb_path: path.resolve(__dirname, './app_fsdb'),
    deploy_on_start_apps_from : path.join(__dirname, './apps')
})
.start();

