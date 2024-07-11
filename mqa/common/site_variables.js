const queryParams = getUrlParams(window.location.search);

//values for case when param is not provided in URL
var default_site = "testmax-11jul2024";
var default_server = "void";

//integration values:
var site = (queryParams.site || default_site).toLowerCase();
var server_name = queryParams.server || default_server;
var launch_campaigns = queryParams.launch_campaigns;
var custom_integration_link = queryParams.integration_link || '//tkbl-automation-account.github.io/integrations/custom-div.js';


function getIntegrationSrc() {
    var src = custom_integration_link || getPerClientIntegrationSrc(site);
    console.log("JS lib loaded from: " + src);
    return src;
}

function getPerClientIntegrationSrc(site) {
    var staging_prefix = '-staging';
    if (server_name === 'prod') {
        staging_prefix = '';
    }
    var src = "https://curebit" + staging_prefix + ".s3.amazonaws.com/integration/clients/" + site + ".min.js";
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

function launch_campaigns_flag(){
    if(queryParams.launch_campaigns === undefined){
        return true;
    }
    return queryParams.launch_campaigns;
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

//https://admin.void.talkable.com/sites/automation-site-562130229388
//https://admin.talkable.com/sites/automation-site-562130229388
function build_site_admin_url() {
    var sub_domain = server_name + ".";
    if(server_name === 'prod'){
        sub_domain = "";
    }
    return "https://admin." + sub_domain + "talkable.com/sites/" + site;

}

var site_data = function () {
    var data = {
        site_slug: site,
        server: getServer(server_name),
        server_name: queryParams.server,
        tkbl_integration_scr: getIntegrationSrc(),
        launch_campaigns: launch_campaigns_flag(),
        site_admin_url: build_site_admin_url()
    };
    return data;
}