var site_slug = site_data().site_slug;
var server = site_data().server;
var tkbl_integration_src = site_data().tkbl_integration_scr;
var launch_campaigns = site_data().launch_campaigns;
var custom_integration_link = site_data().custom_integration_link;

const placements_config_src = function (site_slug) {
    var staging_prefix = '-staging';
    if (server === '//talkable.com') {
        staging_prefix = '';
    }
    var placements_src = "//talkable-labs.herokuapp.com/pl.js?lib=https://curebit" + staging_prefix + ".s3.amazonaws.com/integration/clients/" + site_slug + ".min.js";
    console.log('Placements config loaded from: ' + placements_src);
    return placements_src;
}

include(placements_config_src(site_slug), 'placements_obj');
document.getElementById("placements_obj").onload = function () {

    if (custom_integration_link !== undefined) {
        setIntegrationSrc(custom_integration_link);
    } else {
        setIntegrationSrc(tkbl_integration_src);
    }

    if (launch_campaigns === 'true') {
        register_new()
    }
}
tkbl_init();

function tkbl_init(){
            window._talkableq = window._talkableq || [];
            _talkableq.push(['init', { site_id: site_slug, server: server, email_capture_show_timeout: 1}]);
            console.log("Tkbl init executed: window._talkableq = window._talkableq || [];\n"
            +"_talkableq.push(['init', { site_id: "+site_slug+", server: "+server+", email_capture_show_timeout: 1}]);")
    }

function register_new() {
    window._talkableq = window._talkableq || []
    _talkableq.push(["talkable_loaded", function () {
        window.talkable.before('show_loyalty', function (data) {
            data.email = localStorage.getItem('loyalty_email');
            data.optin = true;
            return data;
        });
    }]);
}

launch_campaign();

function launch_campaign() {
    if (launch_campaigns === 'false') {
        set_launch_campaigns_false();
    }
}

function set_launch_campaigns_false() {
    window._talkableq = window._talkableq || [];
    _talkableq.push(['init', {launch_campaigns: false}]);
}

function include(url, id) {
    var script = document.createElement('script');
    script.src = url;
    script.id = id;
    document.getElementsByTagName('head')[0].appendChild(script);
}

function setIntegrationSrc(src_value) {
    console.log("JS lib: " + src_value);
    include(src_value, 'tkbl_integration_script');
}

function email_capture_timeout(timeout) {
    window._talkableq = window._talkableq || [];
    _talkableq.push(['init', {email_capture_show_timeout: timeout}]);
}

function show_email_capture_offer() {
    window._talkableq.push(['show_email_capture_offer', {}]);
    console.log('Show email capture:\n' +
        'window._talkableq.push([\'show_email_capture_offer\', {}]);');
}

function show_loyalty() {
    window._talkableq.push(['show_loyalty', {}]);
    console.log('Show loyalty:\n' +
        'window._talkableq.push([\'show_loyalty\', {}]);');
}

function authenticate_customer(email) {
    window._talkableq.push(['authenticate_customer', {
        email: email,
        first_name: '',
        last_name: ''
    }]);
    console.log('Authenticated user: ' + email + '\n' +
        'window._talkableq.push([\'authenticate_customer\', {\n' +
        '       email: \'' + email + '\',\n' +
        '       first_name: \'\',\n' +
        '       last_name: \'\'\n' +
        '}]);');
}

function register_affiliate() {
    window._talkableq.push(['register_affiliate', {}]);
    console.log('Register affiliate:\n' +
        'window._talkableq.push([\'register_affiliate\', {}]);');
}

function register_loyalty(email) {
    authenticate_customer(email);
    window._talkableq.push(['show_loyalty', {
        optin: true
    }]);
    console.log('Show loyalty:\n' +
        'window._talkableq.push([\'show_loyalty\', {\n' +
        '       optin: true\n' +
        '}]);');
}

function register_loyalty_new(email) {
    localStorage.setItem('loyalty_email', email);
    window.location.reload();
}