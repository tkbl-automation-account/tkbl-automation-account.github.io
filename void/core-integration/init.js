    var site_slug = site_data().site_slug;
    var server = site_data().server;
    var tkbl_integration_src = site_data().tkbl_integration_scr

    var placements_config_src = function(site_slug){
        var staging_prefix = '-staging';
        if(server == '//talkable.com'){
            staging_prefix = '';
        }
        var placements_src = "//talkable-labs.herokuapp.com/pl.js?lib=https://curebit"+ staging_prefix + ".s3.amazonaws.com/integration/clients/" + site_slug + ".min.js";
        console.log('Placements config loaded from: ' + placements_src);
        return placements_src;
    }


    include(placements_config_src(site_slug), 'placements_obj');
    document.getElementById("placements_obj").onload = function() {
        setIntegrationSrc(tkbl_integration_src);
    };
    tkbl_init();


    function include(url, id) {
            var script = document.createElement('script');
            script.src = url;
            script.id = id;
            document.getElementsByTagName('head')[0].appendChild(script);
    }

    function setIntegrationSrc(src_value){
        console.log("JS lib: " + src_value);
        include(src_value, 'tkbl_integration_script');
    }

    function tkbl_init(){
            window._talkableq = window._talkableq || [];
            _talkableq.push(['init', { site_id: site_slug, server: server, email_capture_show_timeout: 1, launch_campaigns: false}]);
    }

    function show_email_capture_offer(){
        window._talkableq.push(['show_email_capture_offer', {}]);
    }

    function triggerLoyalty(){
        authenticate_customer('', '', '')
        show_loyalty();
    }

    function show_loyalty(){
        window._talkableq.push(['show_loyalty', {}]);
    }

    function authenticate_customer(email, f_name, l_name){
        window._talkableq.push(['authenticate_customer', {
                    email: email, // Optional, pass when available. Example: 'customer@example.com'
                    first_name: f_name, // Optional, pass when available. Example: 'John'
                    last_name: l_name // Optional, pass when available. Example: 'Smith'
                    }]);
        console.log("Authenticated user: " + email);
    }

    function register_affiliate(){
        window._talkableq.push(['register_affiliate', {}]);
    }

    function triggerLoyaltyFor(email){
           window._talkableq.push(['authenticate_customer', {
                 email: email, // Optional, pass when available. Example: 'customer@example.com'
                    //     email: 'static.email2@gmail.com',
                    first_name: '', // Optional, pass when available. Example: 'John'
                    last_name: '' // Optional, pass when available. Example: 'Smith'
                    }]);
            window._talkableq.push(['show_loyalty', {}]);
            console.log("loyalty program triggered for email '"+email+"'.");
    }
