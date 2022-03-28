
    const queryParams = getUrlParams(window.location.search);

    var site = queryParams.site;
    var server = queryParams.server;
    var tkbl_integration = getIntegrationSrc(site)

    function getIntegrationSrc(site){
        var staging_prefix = '-staging';
        if(server == 'prod'){
            staging_prefix = '';
        }
        var src = "https://curebit" + staging_prefix + ".s3.amazonaws.com/integration/clients/" + queryParams.site + ".min.js";
        console.log('Placements config loaded from: ' + src);
        return src;
    }

    function getServer(server) {

        switch(server) {
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

    var site_data=function(){
        var data = {
            site_slug: site,
            server: getServer(server),
//            tkbl_integration_scr: tkbl_integration
            tkbl_integration_scr:"https://learn.talkable.com/pavel/one-call/lib.js"
        };
        return data;
    }