//document.getElementById("nav_buttons").onload = function() {
//    build_nav_buttons();
//};

function build_page() {
    build_integration_fields();

    var div = document.createElement("div");
    var text = document.createTextNode("Site with new values");
    div.appendChild(text);
    document.getElementsByTagName('body')[0].appendChild(div);

    populate_integration_values();
    build_integration_buttons();
    build_nav_buttons();
}

function build_nav_buttons() {
    var query_params = '?site=' + site_data().site_slug + '&server=' + site_data().server_default + '&launch_campaigns=' + site_data().launch_campaigns;
    addButton("Index", 'index.html' + query_params);
    addButton("SA", 'sa.html' + query_params);
    addButton("EC", 'ec.html' + query_params);
    addButton("Loyalty", 'loyalty.html' + query_params);
    addButton("Signup", 'signup.html' + query_params);
    addButton("Post Purchase", 'pp.html' + query_params);
    console.log('Navigation buttons were build');
}

function build_integration_fields() {
    build_integration_field("Site slug: ", "site-slug");
    build_integration_field("Server: ", "server");
    build_integration_field("Integration: ", "integration-src");
}

function populate_integration_values() {
    document.getElementById("site-slug").value = site_data().site_slug;
    document.getElementById("server").value = site_data().server;
    document.getElementById("integration-src").value = site_data().tkbl_integration_scr;
}

function build_integration_field(text, input_id) {
    var text2 = document.createTextNode(text);
    var input = document.createElement("input");
    var br = document.createElement("br");
    input.id = input_id
    input.disabled = 'true'
    var element = document.getElementById("site-values");
    element.appendChild(text2);
    element.appendChild(input);
    element.appendChild(br);
}

function build_integration_buttons() {
    add_integration_button('authenticate_customer', function () {authenticate_customer('')});
    add_integration_button('register_affiliate', function () {register_affiliate()});
    add_integration_button('show_loyalty', function () {show_loyalty()});
    add_integration_button('show_email_capture_offer', function () {show_email_capture_offer()});
}

function add_integration_button(name, tlkb_function) {
    const btn = document.createElement("button");
    btn.innerHTML = name;
    btn.onclick = tlkb_function;
    document.body.appendChild(btn);
}

function addButton(name, link) {
    var li = document.createElement("li");
    if (window.location.href.includes(link)) {
        li.class = 'active';
    }
    var a = document.createElement("a");
    a.href = link;
    var text = document.createTextNode(name);
    a.appendChild(text);
    li.appendChild(a);

    var element = document.getElementById("nav_buttons");
    element.appendChild(li);
}