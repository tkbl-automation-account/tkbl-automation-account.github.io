//document.getElementById("nav_buttons").onload = function() {
//    build_nav_buttons();
//};

function build_page(){
         build_integration_fields();

         var div = document.createElement("div");
         div.classList.add("common");
         var text = document.createTextNode("Talkable Admin link:");
         div.appendChild(text);
         div.appendChild(document.createElement("br"));
         var siteUrl = site_data().site_admin_url;
         var a = document.createElement("a")
         var linkText = document.createTextNode(siteUrl);
         a.href = siteUrl;
         a.appendChild(linkText);
         div.appendChild(a);
         document.getElementsByTagName('body')[0].appendChild(div);

         populate_integration_values();

         build_nav_buttons();
 }

 function build_nav_buttons() {
     let query_params = '?site=' + site_data().site_slug + '&server=' + site_data().server_name + launch_campaigns_query_param();

     if(site_data().custom_js_lib) {
        query_params = query_params + "&js_lib=" + site_data().tkbl_integration_scr;
     }

     addButton("Index", 'index.html' + query_params);
     addButton("SA", 'sa.html' + query_params);
     addButton("EC", 'ec.html' + query_params);
     addButton("Claim by name", 'cn_page.html' + query_params);
     addButton("Loyalty", 'loyalty.html' + query_params);
     addButton("Signup", 'signup.html' + query_params);
     addButton("Post Purchase", 'pp.html' + query_params);
     console.log('Navigation buttons were build');
 }

 function launch_campaigns_query_param() {
     const launch_campaign_param = site_data().launch_campaigns;
     if (launch_campaign_param !== 'false') {
         return '&launch_campaigns=true';
     } else {
         return '&launch_campaigns=' + launch_campaign_param;
     }
 }

 function build_integration_fields(){
    build_integration_field("Site slug: ", "site-slug");
    build_integration_field("Server: ", "server");
    build_integration_field("Integration: ", "integration-src");
 }

 function populate_integration_values(){
       document.getElementById("site-slug").value = site_data().site_slug;
       document.getElementById("server").value = site_data().server;
       document.getElementById("integration-src").value = site_data().tkbl_integration_scr;
 }

 function build_integration_field(text, input_id){

    var key_div = document.createElement("div");
    var text = document.createTextNode(text);
    key_div.appendChild(text);
    key_div.classList.add("key");
    var input = document.createElement("input");
    input.classList.add("data_field");
    input.id = input_id
    input.disabled = 'true'
    var element = document.getElementById("site-values");

    var div = document.createElement("div");
    div.appendChild(key_div);
    div.appendChild(input);
    element.appendChild(div);
//    element.appendChild(text);
//    element.appendChild(input);
//    var br = document.createElement("br");
//    element.appendChild(br);

 }



  function addButton(name, link){
        var li = document.createElement("li"); // <p></p>
        if(window.location.href.includes(link)){
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