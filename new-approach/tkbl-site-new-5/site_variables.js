const queryParams = getUrlParams(window.location.search);

var site = queryParams.site;
var server = queryParams.server;
var launch_campaigns = queryParams.launch_campaigns;
var tkbl_integration = getIntegrationSrc(site);
var custom_integration_link = queryParams.integration_link;

function getIntegrationSrc(site) {
    var staging_prefix = '-staging';
    if (server === 'prod') {
        staging_prefix = '';
    }
    var src = "https://curebit" + staging_prefix + ".s3.amazonaws.com/integration/clients/" + queryParams.site + ".min.js";
    console.log('Placements config loaded from: ' + src);
    return src;
}

function getServer(server) {

    switch (server) {
        case "void":
            return "//void.talkable.com";
            break;
        case "bastion":
            return "//bastion.talkable.com";
            break;
        case "prod":
            return "//talkable.com";

        default:
            return server
    }
}

//https://admin.void.talkable.com/sites/automation-site-562130229388
//https://admin.talkable.com/sites/automation-site-562130229388
function build_site_admin_url() {
    var sub_domain = server_name + ".";
    if(server_name === 'prod'){
        sub_domain = "";
    }
    return "https://admin." + sub_domain + "talkable.com/sites/" + site;

}

function getUrlParams(search) {
    const hashes = search.slice(search.indexOf('?') + 1).split('&')
    const params = {}
    hashes.map(hash => {
        const [key, val] = hash.split('=')
        params[key] = decodeURIComponent(val)
    })
    console.log(params)
    return params
}

var site_data = function () {
    var data = {
        site_slug: site,
        server: getServer(server),
        server_default: queryParams.server,
        tkbl_integration_scr: tkbl_integration,
        launch_campaigns: launch_campaigns,
        custom_integration_link: custom_integration_link,
        //tkbl_integration_scr:"integration.js"
    };
    return data;
}