var curebit = function() {
  var config = {
    testing: false,
    debug: false,
    gleam_version: '1',   // Used for just cache-busting gleam.js
    site_id: 'integration-site-version-0-5',
    server: 'https://www.curebit.com',
    version: '0.5',
    queue_check_interval: 200,
    async: false,
    url_length_limit: 2000, // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url
    current_location: window.location.href
  };

  var FROM_CUREBIT_PARAM = 'curebit_ref';
  var DEBUG_PARAM = 'curebit_debug';
  var DEBUG_COOKIE = 'debug';
  var SAMPLE_FROM_CAMPAIGN_HASH_PARAM = 'sample_from_campaign_hash';
  var CUREBIT_COOKIE_PREFIX = '_curebit_';
  var COOKIE_LIFETIME_DAYS = 365;
  var STATUS_COOKIE = "status";
  var GLEAM_TOP_DIV_ID = 'curebitGleamTop'; // Must match what is in the rails layout
  var GLEAM_URL_COOKIE = "gleam_url";
  
  var utils = {

    serialize: function(object, prefix) {
      var i, key;

      if (!object) {
        return "";
      }
      if (!prefix && !this.isObject(object)) {
        throw new Error("Url parameters should be a javascript hash");
      }
      var s = [];
      if (this.isArray(object)) {
        for (i = 0, object.length; i < object.length; ++i) {
          s.push(this.serialize(object[i], prefix + "[]"));
        }
      } else if (this.isObject(object)) {
        for (key in object) {
          if (!this.hasProperty(object, key)) continue;
          var prop = object[key];
          if (!(prop != null)) {
            continue;
          }
          if (prefix != null) {
            key = "" + prefix + "[" + key + "]";
          }
          s.push(this.serialize(prop, key));
        }
      } else {
        if (object) {
          s.push("" + (encodeURIComponent(prefix.toString())) + "=" + (encodeURIComponent(object.toString())));
        }
      }
      return s.length ? s.join("&") : "";
    },

    escapeHtml: function(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    },

    unescapeHtml: function(escapedStr) {
      var div = document.createElement('div');
      div.innerHTML = escapedStr;
      var child = div.childNodes[0];
      return child ? child.nodeValue : '';
    },

    location_parameters: function() {
      var vars = {};
      var hashes = config.current_location.slice(config.current_location.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++)
      {
        var hash = hashes[i].split('=');
        vars[hash[0]] = decodeURIComponent(hash[1]);
      }
      return vars;
    },

    location_parameter: function(name) {
      return this.location_parameters()[name];
    },

    isObject: function(object) {
      return this.getObjectType(object) == "[object Object]";
    },

    isArray: function(object) {
      return this.getObjectType(object) == "[object Array]";
    },

    getObjectType: function(object) {
      return Object.prototype.toString.call(object);
    },

    addImage: function(url) {
      if (document.images) { 
        (new Image()).src=url;
      }
    },

    ensureInitialized: function() {
      if (!window.curebit.initialized) {
        throw new Error("You need to call 'init' first")
      }
    },
    log: function(message, source) {
      // Dont want updateDebug to infinite loop
      if (typeof this.log.debugInitialized == 'undefined') {
        this.log.debugInitialized = false;
      }
      if (!this.log.debugInitialized) {
        this.log.debugInitialized = true;
        updateDebug();
      }
      if (typeof console != "undefined" && config.debug) {
        source = source || 'all-' + config.version;
        console.log(source + ' >> ' + message);
      }
    },

    buildIframe: function(url, options) {
      var attrs = {}
      attrs.style = 'border: none;';
      for (key in options) {
        if (!this.hasProperty(options, key)) continue;
        attrs[key] = options[key];
      }
      attrs.src = url;

      serialized = ""
      for (key in attrs) {
        serialized += " " + key + "=\"" + utils.escapeHtml((attrs[key] || "").toString().replace(/"/g, "'")) + "\"";
      }
      return "<iframe" + serialized + "></iframe>";
    },

    addIframe: function(url, options) {
      this.write(this.buildIframe(url, options));
    },

    write: function(content) {
      document.write(content);
    },

    addJs: function(scriptUrl) {
      utils.log('addJs: ' + scriptUrl);
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(utils.buildJs(scriptUrl), s);    
      // This doesnt always work in IE6 document.getElementsByTagName("head")[0].appendChild(curebitJs);
    }, 

    buildJs: function(scriptUrl) {
      var result = document.createElement('script');
      result.type = 'text/javascript';
      result.async = config.async;
      result.src = scriptUrl;
      return result;
    },

    namespace: function() {
      return config.server + '/public/' + encodeURIComponent(config.site_id);
    },
    
    hasProperty: function(options, key) {
      return options.hasOwnProperty(key)
    }
  };

    
  
  var curebitOfferCodePath = function() {    
    var curebit_offer_path = null;
    curebit_offer_path = utils.location_parameter(FROM_CUREBIT_PARAM);
    if (curebit_offer_path == '_clearOfferGleam') {
      clearOfferGleam('Clear from offer code path'); // Eg for different domains iframe hack
      return null;
    } else {
      return curebit_offer_path;
    }
  };

  var setCurebitCookie = function(c_name,value,exdays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    if (value == null) {
      eraseCurebitCookie(c_name);
    } else {
      utils.log('Setting cookie: ' + c_name + ' with the value of: ' + value + ' which expires on: ' + exdate.toUTCString());
      var c_value = escape(value) + ((exdays == null) ? "" : "; expires="+ exdate.toUTCString());
      document.cookie = CUREBIT_COOKIE_PREFIX + c_name + "=" + c_value + "; path=/";
    }
  };
  
  var eraseCurebitCookie = function(name) {
    utils.log('Erasing cookie: ' + name);
	  setCurebitCookie(name,"",-1);
  };
  
  var getCurebitCookie = function(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++)
    {
      x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
      x = x.replace(/^\s+|\s+$/g, "");
      if (x == CUREBIT_COOKIE_PREFIX + c_name)
      {
        return unescape(y);
      }
    }
  };
  

  /* Retrieve the offer from Curebit and cache */
  var cacheGleamUrl = function(options) {
    options = options || {};
    // Include version # from this file so sites can cache bust if they need to by upping this
    
    var url = config.server + '/' + options['offerCodePath'] + '/gleam.js?site_id=' + encodeURIComponent(config.site_id) + '&v=' + config.version + '&gleam_version=' + config.gleam_version;
    url = url.replace(/^https?:/, ""); // Zeroclipboard wont work if the protocol doesnt match
    // Sample gleams shouldnt cache themselves, just show the sample
    if (utils.location_parameter(SAMPLE_FROM_CAMPAIGN_HASH_PARAM)) {
      url += "&" + SAMPLE_FROM_CAMPAIGN_HASH_PARAM + "=" + encodeURIComponent(utils.location_parameter(SAMPLE_FROM_CAMPAIGN_HASH_PARAM));
      clearOfferGleam('Sample displayed');
      utils.addJs(url);
    } else {
      setCurebitCookie(GLEAM_URL_COOKIE, url, COOKIE_LIFETIME_DAYS);
    }
    
    utils.log('Caching gleam URL ' + url + ' for ' + COOKIE_LIFETIME_DAYS + ' days');
  };
  
  // Todo:
  // If debug is turned off while it is turned on or vice versa, the cached URL will not update the gleam file, it will still continue to debug as the gleam URL is cached.
  // log shouldn't be called in here, since log calls this method again
  var updateDebug = function() {
    if(utils.location_parameter(DEBUG_PARAM) == '0') {
      eraseCurebitCookie(DEBUG_COOKIE);
      config.debug = false;
      utils.log('Debug disabled!  Deleting debug cookie');
      return;
    }

    if(utils.location_parameter(DEBUG_PARAM) == '1') {
      utils.log('Debug param ' + DEBUG_PARAM + ' is present');
      setCurebitCookie(DEBUG_COOKIE, "true", COOKIE_LIFETIME_DAYS);
      utils.log('Debug cookie set');
    }

    if(getCurebitCookie(DEBUG_COOKIE)) {
      config.debug = true;
      utils.log('Debug logging enabled');
    }
    
  };


  var updateStatus = function(status) {
    setCurebitCookie(STATUS_COOKIE, status, COOKIE_LIFETIME_DAYS);  
  };  
  
  var removeElement = function(element) {
    if (element) {
      element.parentNode.removeChild(element);
    }    
  };
  
  // Clear out all of the cookies
  var clearOfferGleam = function(reason, alternateDomain) {
    alternateDomain = alternateDomain || null;
    if (alternateDomain != null) {
      utils.log("clearOfferGleam from alternateDomain: " + alternateDomain);
      var url = alternateDomain + '?curebit_ref=_clearOfferGleam';
      var iframe = document.createElement('iframe');
      iframe.setAttribute('src', url);
      iframe.setAttribute('id', 'curebitCookieClearIframe');
      iframe.setAttribute('width', 1); // not sure if 0 would make the browser skip it
      iframe.setAttribute('height', 1); // not sure if 0 would make the browser skip it
      //iframe.setAttribute('style', offerStyle);
      iframe.setAttribute('scrolling', "no");
      iframe.setAttribute('frameBorder', "0");
      document.body.appendChild(iframe); 
    } else {      
      // Hide it if it's being shown
      utils.log('clearOfferGleam for reason: ' + reason);
      removeElement(document.getElementById(GLEAM_TOP_DIV_ID));
      updateStatus(reason);
      eraseCurebitCookie(GLEAM_URL_COOKIE);
    }
  };
  
  var gleamExists = function() {
    return getCurebitCookie(GLEAM_URL_COOKIE) != null && getCurebitCookie(GLEAM_URL_COOKIE) != '';
  };
  
  /* 
    Show the cached offer gleam by adding the gleam script
  */
  var showOfferGleam = function() {
    utils.log('showOfferGleam');
    if (gleamExists()) {
      utils.addJs(getCurebitCookie(GLEAM_URL_COOKIE));
    }
  };


  return {
    initialized: false,
    init: function(options) {
      for (var key in options) { 
        if (!utils.hasProperty(options, key)) continue;
        config[key] = options[key]; 
      }      
      if (!config.site_id)
        throw new Error('site_id must be specified!');
      this.initialized = true;

    },


    register_affiliate: function(data) {
      utils.ensureInitialized();
      var affiliate_member = data.affiliate_member || {};
      var url_parameters = ['email', 'first_name', 'last_name'];
      for(var i = 0; i < url_parameters.length; i++) {
        var parameter = url_parameters[i];
        if (utils.location_parameter(parameter)) {
          affiliate_member[parameter] = utils.location_parameter(parameter);
        }
      }
      var parameters = {
        affiliate_member: affiliate_member.email ? affiliate_member : null,
        campaign_tags: utils.location_parameter('campaign_tags') || data.campaign_tags
      }
      var action = parameters.affiliate_member && parameters.affiliate_member.email ? 'create' : 'new'
      var create_url = utils.namespace() + '/affiliate_members/' + action + '?' + utils.serialize(parameters)
      utils.addIframe(create_url, data.iframe)
    },

    new_affiliate: function(data) {
      return this.register_affiliate(data);
    },

    register_products: function(products) {
      utils.ensureInitialized();
      for(var i = 0; i < products.length; i++) {
        var create_url = utils.namespace() + '/products/create.gif?' +
          utils.serialize(products[i], "p");
        utils.addImage(create_url)
      }
    },

    register_purchase: function(orderDetails) {
      utils.ensureInitialized();
      clearOfferGleam('Purchase registered (js api)');
      if (orderDetails.customer_email) {
        orderDetails.email = orderDetails.customer_email;
        delete orderDetails.customer_email;
      }
      var visitor_uuid = orderDetails.visitor_uuid;
      delete orderDetails.visitor_uuid;
      var campaign_tags = utils.location_parameter('campaign_tags') || orderDetails.campaign_tags;
      var items = orderDetails.items;
      var iframe = orderDetails.iframe;
      delete orderDetails.items;
      delete orderDetails.campaign_tags;
      delete orderDetails.iframe;
      var parameters = {
        v: config.version,
        p: orderDetails,
        visitor_uuid: visitor_uuid,
        campaign_tags: campaign_tags
      }
      var extension = iframe ? 'html' : 'js'
      var create_url = 
        utils.namespace() + '/purchases/create.' + extension + '?' + utils.serialize(parameters);
      if (items) {
        for(var i = 0; i < items.length; i++) {
          var item = items[i]
          var itemsParams = "&" + utils.serialize(
            { product_id: item.product_id, price: item.price, quantity: item.quantity },
            "p[i]["+i+"]"
          )
          if ((create_url + itemsParams).length < config.url_length_limit) {
            create_url += itemsParams;
          }
          // Also register the products if the vars are specified
          if (items[i].url) {
            this.register_products([{
              product_id: items[i].product_id,
              url:	items[i].url,
              image_url: items[i].image_url,
              title:	items[i].title,
              price:	items[i].price
            }]);

          }

        }
      }

      if (iframe) {
        utils.addIframe(create_url, iframe);
      } else {
        utils.addJs(create_url);
      }


    },

    gleam: function(options) {
      utils.log('gleam');

      utils.ensureInitialized();

      // if parameter from url
      var offerCodePath = curebitOfferCodePath();
      if (offerCodePath) {
        utils.log('gleam offerCodePath: ' + offerCodePath);
        cacheGleamUrl({ offerCodePath: offerCodePath });
      }
      showOfferGleam();
    },
        
    log: function(message, source) {
      log(message, source);
    },

    run: function() {
      curebit.check();
      setInterval(function() {
        curebit.check();
      }, config.queue_check_interval);
    },

    check: function() {
      if (typeof _curebitq != 'undefined') {
        var delayed_call_args;
        while(delayed_call_args = _curebitq.shift()) {
          var method = delayed_call_args.shift();
          curebit[method].apply(curebit, delayed_call_args);
        }
      }
    },



    utils: utils,
    config: config
  };
}();

curebit.run();
