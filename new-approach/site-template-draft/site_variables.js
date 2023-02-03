const queryParams = getUrlParams(window.location.search);

var site = queryParams.site;
var server = queryParams.server;
//var launch_campaigns = queryParams.launch_campaigns;
var custom_integration_link = queryParams.integration_link;

function getIntegrationSrc() {
    var src;
    if (custom_integration_link !== undefined) {
        src = custom_integration_link;
    }
    else{
        src = getPerClientIntegrationSrc(site);
    }
    console.log("JS lib loaded from: " + src);
    return src;
}

function getPerClientIntegrationSrc(site) {
    var staging_prefix = '-staging';
    if (server === 'prod') {
        staging_prefix = '';
    }
    var src = "https://curebit" + staging_prefix + ".s3.amazonaws.com/integration/clients/" + queryParams.site + ".min.js";
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

var site_data = function () {
    var data = {
        site_slug: site.toLowerCase(),
        server: getServer(server),
        server_name: queryParams.server,
        tkbl_integration_scr: getIntegrationSrc(),
        launch_campaigns: launch_campaigns_flag(),
    };
    return data;
}