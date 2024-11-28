//updated on 28 Nov 11:26
/**
 * @prettier
 */

(function (window, document, JSON, Object) {
  var anotherIntegration = window.talkable || window.curebit;

  var talkable = (window.talkable = (function () {
    var customerData = {};
    var UUID_KEY = 'tkbl_session';
    var UUID_DEPRECATED_KEY = 'tkbl_cvuuid';
    var UUID_SESSION_KEY = 'tkbl_session_id';
    var LOYALTY_OPTIN_KEY = 'tkbl_loyalty_optin';
    // We send something to backend
    // To track that no placements were matched
    var EMPTY_PLACEMENTS = ['0'];
    // Need to be kept in sync with the VisitorUserAgent model of the main app
    var IOS_REGEXP = /(iPad|iPhone|iPod)/i;
    var ANDROID_REGEXP = /Android/i;
    var MOBILE_PLATFORM_REGEXP =
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
    var MOBILE_DEVICE_REGEXP =
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;

    var config = {
      testing: false,
      debug: false,
      verify_integration: false,
      site_id: '',
      server: 'https://www.talkable.com',
      version: '%VERSION%',
      queue_check_interval: 200,
      async: false,
      url_length_limit: 2000, // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url
      email_capture_show_offer: true,
      email_capture_show_timeout: 10,
      integration_platform: '',
      launch_campaigns: true,
      launch_campaigns_retry_delay: 1000,
      launch_campaigns_retry_count: 10,
      launch_campaigns_spa_delay: 200,
    };

    var methods = {};
    var utils = {
      lastLoadedIframeName: [],
      gleamRewardCallback: undefined,
      placements: [],
      matchedCountries: [],
      integratedCampaignsPlacementIds: new Set(),

      define: function (name, callback) {
        if (methods[name]) {
          throw new Error('Method ' + name + ' already defined');
        }
        methods[name] = callback;
      },

      log: function (message, source) {
        if (typeof window.console !== 'undefined' && config.debug) {
          source = source || 'all-' + config.version;
          console.log(source + ' >> ' + message);
        }
      },

      isObject: function (arg) {
        return Object.prototype.toString.call(arg) === '[object Object]';
      },

      isInIframe: function () {
        return (
          window.self !== null &&
          typeof window.self !== 'undefined' &&
          window.top !== null &&
          typeof window.top !== 'undefined' &&
          window.self !== window.top
        );
      },

      serialize: function (object, prefix) {
        var i;
        var key;

        if (!object) {
          return '';
        }
        if (!prefix && !this.isObject(object)) {
          throw new Error('Url parameters should be a javascript hash');
        }
        var s = [];

        if (Array.isArray(object)) {
          for (i = 0, object.length; i < object.length; ++i) {
            s.push(this.serialize(object[i], prefix + '[]'));
          }
        } else if (this.isObject(object)) {
          for (key in object) {
            if (!this.hasProperty(object, key)) {
              continue;
            }
            var prop = object[key];

            // eslint-disable-next-line eqeqeq
            if (!(prop != null)) {
              continue;
            }
            if (prop === 0) {
              prop = prop.toString();
            }
            // eslint-disable-next-line eqeqeq
            if (prefix != null) {
              key = String(prefix) + '[' + key + ']';
            }
            var fragment = this.serialize(prop, key);

            if (fragment) {
              s.push(this.serialize(prop, key));
            }
          }
        } else {
          if (object) {
            s.push(
              String(encodeURIComponent(prefix.toString())) +
                '=' +
                encodeURIComponent(object.toString())
            );
          }
        }

        return s.length ? s.join('&') : '';
      },

      merge: function (target, src) {
        if (typeof target !== 'object') {
          return;
        }
        var dst = {};

        for (var key in target) {
          dst[key] = target[key];
        }

        for (var srcKey in src) {
          if (typeof src[srcKey] !== 'object' || !src[srcKey]) {
            dst[srcKey] = src[srcKey];
          } else {
            if (!target[srcKey]) {
              dst[srcKey] = src[srcKey];
            } else {
              dst[srcKey] = utils.merge(target[srcKey], src[srcKey]);
            }
          }
        }

        return dst;
      },

      withoutProperties: function (properties, object) {
        var result = utils.clone(object);

        for (var i = 0; i < properties.length; i++) {
          delete result[properties[i]];
        }

        return result;
      },

      clone: function (object) {
        // WARNING: this is not a deep clone!
        return utils.merge(object, {});
      },

      postmessage: {
        send: function (json, target, targetElement) {
          // some validation
          if (typeof target === 'undefined') {
            throw new Error('You must supply a target as a string');
          }

          if (typeof targetElement === 'undefined') {
            targetElement = window.parent;
          }

          targetElement.postMessage(JSON.stringify(json), target);
        },

        listen: function (callback) {
          var isOriginAllowed = function (origin) {
            if (!origin) {
              return false;
            }

            var originHostname = utils.parseHostname(origin);

            return (
              /\.talkable\.(com|local)$/.test(originHostname) ||
              utils.isIntegrationLibraryHostname(originHostname) ||
              utils.parseHostname(config.server) === originHostname
            );
          };

          var receiveMessage = function (message) {
            if (!isOriginAllowed(message.origin)) {
              utils.log('Origin is not allowed: ' + message.origin);

              return;
            }
            try {
              var o = JSON.parse(message.data);

              if (o && typeof o === 'object' && o !== null) {
                callback(o);
              }
            } catch (ex) {
              // Handle non-exception-throwing cases:
              // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
              // but... JSON.parse(null) returns 'null', and typeof null === "object",
              // so we must check for that, too.
            }
          };

          // add the listener
          if (window.addEventListener) {
            window.addEventListener('message', receiveMessage, false);
          } else {
            // IE 8
            window.attachEvent('onmessage', receiveMessage);
          }
        },
      },

      event_list: [],

      subscribe: function (event_name, iframe_name, callback) {
        if (!callback) {
          utils.log('Subscribe: callback is required');

          return;
        }

        var found = false;

        for (var i = 0; i < utils.event_list.length; i++) {
          if (
            utils.event_list[i].event_name === event_name &&
            utils.event_list[i].iframe_name === iframe_name &&
            utils.event_list[i].callback.toString() === callback.toString()
          ) {
            // override callback
            utils.event_list[i].callback = callback;
            // skip duplicates
            found = true;
            break;
          }
        }
        // add new event to list
        if (!found) {
          utils.event_list.push({
            event_name: event_name,
            iframe_name: iframe_name,
            callback: callback,
          });
        }
      },

      publish: function (name, iframe_name, data, is_global) {
        var server = config.server;
        var msg_data = {
          type: name,
          iframe_name: iframe_name,
          data: data || {},
        };

        if (typeof is_global !== 'undefined' && is_global) {
          server = '*';
        }

        if (
          utils.lastLoadedIframeName.indexOf(iframe_name) !== -1 &&
          window.frames[iframe_name]
        ) {
          utils.postmessage.send(msg_data, server, window.frames[iframe_name]);
        } else {
          this.subscribe('offer_loaded', iframe_name, function (data, iframe_data) {
            if (iframe_data.name === iframe_name) {
              utils.postmessage.send(msg_data, server, window.frames[iframe_name]);
            }
          });
        }
      },

      startListening: function () {
        utils.postmessage.listen(function (message) {
          // transmit messages between iframes
          if (message.data && message.data.transmit) {
            for (var t = 0; t < utils.lastLoadedIframeName.length; t++) {
              if (utils.lastLoadedIframeName[t] !== message.iframe_name) {
                utils.publish(
                  message.type,
                  utils.lastLoadedIframeName[t],
                  message.data,
                  true
                );
              }
            }
          }

          for (var i = 0; i < utils.event_list.length; i++) {
            // check all required parameters
            if (
              message.type !== utils.event_list[i].event_name ||
              !message.iframe_name ||
              !utils.event_list[i].callback
            ) {
              continue;
            }
            // get iframe
            var iframe =
              document.querySelector('#' + utils.event_list[i].iframe_name + ' iframe') ||
              document.querySelector(
                'iframe[name="' + utils.event_list[i].iframe_name + '"]'
              );

            // execute callback
            if (iframe && iframe.name === message.iframe_name) {
              utils.event_list[i].callback.call(talkable, message.data, iframe);
            }
          }
        });
      },

      launchCampaigns: function () {
        if (typeof talkablePlacementsConfig === 'undefined') {
          return;
        }

        var referralPlacements = utils.match_placements(
          'affiliate_member',
          talkablePlacementsConfig.placements
        );
        var nameSharingPlacements = utils.match_placements(
          'claim_by_name_popup',
          talkablePlacementsConfig.placements
        );
        var conversionPlacements = utils.match_placements(
          'email_capture_popup',
          talkablePlacementsConfig.conversion_placements
        );
        var loyaltyDashboardPlacements = utils.match_placements(
          'loyalty_dashboard',
          talkablePlacementsConfig.loyalty_placements
        );
        var loyaltyWidgetPlacements = utils.match_placements(
          'loyalty_widget',
          talkablePlacementsConfig.loyalty_placements
        );
        var showCampaignCondition =
          utils.location_parameter('tkbl_campaign_id') ||
          utils.location_parameter('campaign_tags');

        if (
          showCampaignCondition ||
          (referralPlacements.length > 0 && referralPlacements !== EMPTY_PLACEMENTS)
        ) {
          window._talkableq.push(['register_affiliate', {}]);
        }

        if (
          showCampaignCondition ||
          (conversionPlacements.length > 0 && conversionPlacements !== EMPTY_PLACEMENTS)
        ) {
          window._talkableq.push(['show_email_capture_offer', {}]);
        }

        var showLoyaltyDashboard =
          loyaltyDashboardPlacements.length > 0 &&
          loyaltyDashboardPlacements !== EMPTY_PLACEMENTS;
        var showLoyaltyWidget =
          loyaltyWidgetPlacements.length > 0 &&
          loyaltyWidgetPlacements !== EMPTY_PLACEMENTS;

        if (showCampaignCondition || showLoyaltyDashboard || showLoyaltyWidget) {
          window._talkableq.push(['show_loyalty', {}]);
        }

        var showClaimByNameCampaigns =
          nameSharingPlacements.length > 0 && nameSharingPlacements !== EMPTY_PLACEMENTS;

        if (showCampaignCondition || showClaimByNameCampaigns) {
          window._talkableq.push(['show_claim_by_name', {}]);
        }
      },

      notifyIntegrationError: function (message, dev) {
        utils.addImage(
          // In case occurred conflict
          // Taking namespace from previous version of library
          // Because it has site_id in configuration
          utils.namespace(window.talkable.config.server, window.talkable.config.site_id) +
            '/notify_integration_error.gif?' +
            utils.serialize({
              message: message,
              dev: dev,
            })
        );
      },

      isBrowserSupported: function () {
        var ua = window.navigator.userAgent;

        return (
          ua.indexOf('MSIE 6.0') === -1 &&
          ua.indexOf('MSIE 7.0') === -1 &&
          ua.indexOf('MSIE 8.0') === -1
        );
      },

      getIframeCreationExtension: function () {
        return this.isBrowserSupported() ? 'html' : 'gif';
      },

      isGenerated: function (el) {
        return el.getAttribute('data-talkable-generated') === 'true';
      },

      hasProperty: function (options, key) {
        return Object.prototype.hasOwnProperty.call(options, key);
      },

      setAttributes: function (element, attrs) {
        for (var key in attrs) {
          element.setAttribute(key, attrs[key]);
        }
      },

      location_parameter: function (name) {
        var vars = {};
        var current_location = window.location.href.split('#')[0];
        var hashes = current_location.slice(current_location.indexOf('?') + 1).split('&');

        for (var i = 0; i < hashes.length; i++) {
          var hash = hashes[i].split('=');

          if (typeof hash[1] !== 'undefined') {
            vars[hash[0]] = decodeURIComponent(hash[1]);
          }
        }

        return vars[name];
      },

      callbacks: {},

      before: function (method_name, callback) {
        utils.callbacks[method_name] = callback;
      },

      matches: function (matcher) {
        if (!matcher || matcher.blank) {
          return true;
        } else if (matcher.regexp) {
          return window.location.href.match(new RegExp(matcher.regexp));
        } else {
          if (matcher.host_pattern && matcher.host_pattern !== window.location.hostname) {
            return false;
          }

          for (var name in matcher.query_pattern) {
            if (
              window.location.search.indexOf(name + '=' + matcher.query_pattern[name]) ===
              -1
            ) {
              return false;
            }
          }

          if (matcher.path_pattern) {
            var path_pattern = matcher.path_pattern;

            if (talkablePlacementsConfig.site_url) {
              var site_url = document.createElement('a');

              site_url.href =
                (matcher.host_pattern
                  ? 'https://' + matcher.host_pattern
                  : talkablePlacementsConfig.site_url) + matcher.path_pattern;
              path_pattern = site_url.pathname.replace(/(^\/*)/g, '/');
            }

            if (path_pattern !== window.location.pathname) {
              return false;
            }
          }

          return true;
        }
      },

      device_type: function () {
        var agent = window.navigator.userAgent;

        // The logic needs to be kept in sync with VisitorUserAgent#device_type
        if (agent.match(IOS_REGEXP) || agent.match(ANDROID_REGEXP)) {
          return agent.match(MOBILE_PLATFORM_REGEXP) ||
            agent.substr(0, 4).match(MOBILE_DEVICE_REGEXP)
            ? 'mobile'
            : 'tablet';
        }

        return 'desktop';
      },

      match_custom_property_criterion: function (criterion, custom_properties) {
        if (typeof custom_properties !== 'object') {
          return criterion.operand === 'not_eq';
        }

        var custom_property = custom_properties[criterion.key];

        switch (criterion.operand) {
          case 'eq':
            return custom_property === criterion.value;
          case 'not_eq':
            return custom_property !== criterion.value;
          case 'regex':
            try {
              return new RegExp(criterion.value, 'i').test(custom_property);
            } catch (ex) {
              utils.log(ex);

              return true;
            }
          default:
            return true;
        }
      },

      match_placements: function (event_category, placements) {
        if (typeof event_category === 'undefined') {
          event_category = 'affiliate_member';
        }

        if (typeof placements === 'undefined') {
          placements = talkablePlacementsConfig.placements;
        }

        var matched = [];

        for (var i = 0; i < placements.length; i++) {
          var placement = placements[i];

          if (!placement.has_live_campaigns) {
            utils.log('Placement #' + placement.id + ' has no live campaigns');
            continue;
          }

          var placement_matched = true;
          var device_type = utils.device_type();

          if (
            (placement.event_category && placement.event_category !== event_category) ||
            (placement.device_types &&
              device_type &&
              placement.device_types.indexOf(device_type) === -1)
          ) {
            continue;
          }

          if (placement.exclusion_matchers) {
            for (
              var k = 0;
              k < placement.exclusion_matchers.length && placement_matched;
              k++
            ) {
              placement_matched = !utils.matches(placement.exclusion_matchers[k]);
            }

            if (!placement_matched) {
              continue;
            }
          }

          var custom_properties = customerData.custom_properties || {};

          for (var custom_property_key in custom_properties) {
            custom_properties[custom_property_key] = String(
              custom_properties[custom_property_key]
            );
          }

          if (placement.custom_property_criteria) {
            for (
              var l = 0;
              l < placement.custom_property_criteria.length && placement_matched;
              l++
            ) {
              var custom_property_criterion = placement.custom_property_criteria[l];

              placement_matched = utils.match_custom_property_criterion(
                custom_property_criterion,
                custom_properties
              );
            }

            if (!placement_matched) {
              continue;
            }
          }

          var matchers = placement.inclusion_matchers || [placement.inclusion_matcher];

          for (var j = 0; j < matchers.length; j++) {
            if (utils.matches(matchers[j])) {
              matched.push(placement.id);
              utils.placements.push(placement.id);
              if (matchers[j] && matchers[j].site_country_id) {
                utils.matchedCountries.push(matchers[j].site_country_id);
              }
              break;
            }
          }
        }

        if (matched.length) {
          for (var m = 0; m < matched.length; m++) {
            var key = matched[m] + ':' + event_category;

            utils.integratedCampaignsPlacementIds.add(key);
          }

          return matched;
        }

        for (var n = 0; n < placements.length; n++) {
          var matchedPlacement = placements[n];

          if (
            !utils.integratedCampaignsPlacementIds.has(
              matchedPlacement.id + ':' + event_category
            )
          ) {
            continue;
          }

          utils.removeIframesByPlacementId(matchedPlacement.id);
        }

        return EMPTY_PLACEMENTS;
      },

      matchLoyaltyPlacements: function () {
        var placementIds = utils.match_placements(
          'loyalty_dashboard',
          talkablePlacementsConfig.loyalty_placements
        );

        if (placementIds !== EMPTY_PLACEMENTS) {
          return { matchedPlacementIds: placementIds, path: '/loyalty/show' };
        }

        placementIds = utils.match_placements(
          'loyalty_widget',
          talkablePlacementsConfig.loyalty_placements
        );
        if (placementIds !== EMPTY_PLACEMENTS) {
          return { matchedPlacementIds: placementIds, path: '/loyalty/redeem_widget' };
        }

        utils.log('No campaign placements matched for loyalty');
      },

      merge_custom_properties: function (custom_properties) {
        var actualCustomProperties = utils.clone(custom_properties || {});

        customerData.custom_properties = utils.merge(
          customerData.custom_properties || {},
          actualCustomProperties
        );
      },

      ensureInitialized: function () {
        if (!window.talkable.initialized) {
          throw new Error("You need to call 'init' first");
        }
      },

      namespace: function (server, site_id) {
        return (
          (server || config.server) +
          '/public/' +
          encodeURIComponent(site_id || config.site_id)
        );
      },

      addImage: function (url) {
        utils.log('addImage: ' + url);

        if (document.images) {
          new Image().src = url;
        }
      },

      defaultIframeOptions: function (name) {
        name = name || 'talkable-offer';

        return {
          container: name,
          name: name + '-iframe',
        };
      },

      insertIframeIntoContainer: function (iframe, containerId) {
        // Sanitize containerId
        containerId = containerId.replace('#', '');
        if (!/^[A-Za-z][A-Za-z0-9\-\_:\.]*$/.test(containerId)) {
          throw new Error('Invalid containerId');
        }

        var containerEl;
        var timeoutId;
        var insertIframeIntervalId;
        var isInserted = false;

        function tryInsertIframe() {
          if (isInserted) {
            return;
          }
          containerEl = document.getElementById(containerId);

          if (containerEl) {
            containerEl.innerHTML = '';
            containerEl.appendChild(iframe);
            isInserted = true;

            var cs = document.querySelectorAll('#' + CSS.escape(containerId));

            for (var i = 1; i < cs.length; i++) {
              cs[i].remove();
            }

            clearTimeout(timeoutId);
            clearInterval(insertIframeIntervalId);
          }
        }

        tryInsertIframe();
        // Try inserting the iframe every 200ms
        insertIframeIntervalId = setInterval(tryInsertIframe, 200);

        // Stop trying after 30 seconds
        timeoutId = setTimeout(function () {
          clearInterval(insertIframeIntervalId);
          if (!isInserted) {
            utils.log('Failed to insert iframe within 30 seconds.');
          }
        }, 30000);

        this.domReady(function () {
          if (isInserted) {
            return;
          }

          containerEl = document.getElementById(containerId);
          if (containerEl) {
            containerEl.innerHTML = '';
          } else {
            containerEl = document.createElement('div');
            containerEl.setAttribute('data-talkable-generated', true);
            containerEl.setAttribute('id', containerId);

            document.body.appendChild(containerEl);
          }
          containerEl.appendChild(iframe);
          isInserted = true;

          clearTimeout(timeoutId);
          clearInterval(insertIframeIntervalId);
        });
      },

      setIntegrationCss: function (data) {
        if (!data || !data.css) {
          return;
        }
        styleTag = document.createElement('style');
        styleTag.id = data.attribute_value;
        styleTag.dataset.talkableIntegrationCss = true;
        styleTag.type = 'text/css';

        if (styleTag.styleSheet) {
          styleTag.styleSheet.cssText = data.css;
        } else {
          styleTag.appendChild(document.createTextNode(data.css));
        }

        var styleTagNode = document.getElementById(data.attribute_value);

        styleTagNode && styleTagNode.remove();

        document.body && document.body.appendChild(styleTag);
      },

      removeIframesByPlacementId: function (placementId) {
        utils.integratedCampaignsPlacementIds.delete(placementId);

        var iframes = document.querySelectorAll(
          'iframe[src*="matched_placement_ids"][src*="' + placementId + '"]'
        );
        var matchedIframes = [];

        for (var i = 0; i < iframes.length; i++) {
          var iframe = iframes[i];
          var params = new URL(decodeURIComponent(iframe.src)).searchParams;

          if (!params) {
            continue;
          }

          var iframePlacementIds = params.getAll('matched_placement_ids[]');

          if (!iframePlacementIds) {
            continue;
          }

          if (iframePlacementIds.includes(String(placementId))) {
            matchedIframes.push(iframe);
          }
        }

        for (var m = 0; m < matchedIframes.length; m++) {
          utils.removeIframe(matchedIframes[m]);
        }
      },

      removeIframe: function (iframe) {
        if (!iframe) {
          return;
        }
        // reset iframe load state

        var index = utils.lastLoadedIframeName.indexOf(iframe.name);

        if (index !== -1) {
          utils.lastLoadedIframeName.splice(index, 1);
        }

        iframe.style.display = 'none';

        // Otherwise it causes a never-ending tab window spinner in Chrome
        // Yes, the delay should be that big, otherwise it won’t fix the issue
        setTimeout(function () {
          iframe.remove();
          iframe = null;
        }, 1000);
      },

      addIframeElement: function (url, options) {
        utils.log('addIframeElement: ' + url);

        options = utils.clone(options || {});
        options.frameBorder = '0';
        options.allowTransparency = true;
        options.src = url;
        options.allow = 'camera *;microphone *;web-share';
        var container = options.container || utils.generateRandomIframeName();

        delete options.container;
        utils.addRandomIframeName(options);

        var iframe = null;
        var styleTag = null;

        iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.opacity = '0';
        this.setAttributes(iframe, options);
        this.insertIframeIntoContainer(iframe, container);

        utils.subscribe('responsive_iframe_height', iframe.name, function (data, iframe) {
          iframe.style.height = data.height + 'px';
        });

        utils.subscribe('change_offer_state', iframe.name, function (data, iframe) {
          if (
            data.campaign_appearance === 'inline' &&
            iframe.parentNode &&
            utils.isGenerated(iframe.parentNode)
          ) {
            return;
          }
          if (!data) {
            return;
          }
          if (!data.offer_state) {
            return;
          }
          if (!data.offer_state_attribute) {
            return;
          }
          if (data.width) {
            iframe.style.width = data.width;
          }
          if (data.height) {
            iframe.style.height = data.height;
          }

          if (data.integration_css) {
            utils.setIntegrationCss(data.integration_css);
          }
          currentAttribute = document.body.getAttribute(data.offer_state_attribute) || '';
          if (
            data.action === 'add' &&
            currentAttribute.indexOf(data.offer_state) === -1
          ) {
            document.body.setAttribute(
              data.offer_state_attribute,
              (data.offer_state + ' ' + currentAttribute).trim()
            );
          } else if (data.action === 'remove') {
            document.body.setAttribute(
              data.offer_state_attribute,
              currentAttribute.replace(data.offer_state, '').trim()
            );
          } else if (data.action === 'set') {
            document.body.setAttribute(data.offer_state_attribute, data.offer_state);
          }

          setTimeout(function () {
            if (document.all && !window.atob) {
              // need to update DOM to apply styles in IE <= 9
              // eslint-disable-next-line no-self-assign
              document.body.className = document.body.className;
            }
          }, 0);
        });

        utils.subscribe(
          'change_loyalty_member_state',
          iframe.name,
          function (data, iframe) {
            if (data.action === 'remove') {
              utils.deleteCookie(LOYALTY_OPTIN_KEY);
            } else if (data.action === 'set') {
              utils.setCookie(LOYALTY_OPTIN_KEY, true);
            }
          }
        );

        utils.subscribe('cookies_consent', iframe.name, function (data, iframe) {
          utils.setCookie(UUID_KEY, utils.getAllCookies());
        });

        utils.subscribe('set_location', iframe.name, function (data, iframe) {
          if (!data) {
            return;
          }
          if (utils.isInIframe()) {
            var msg_data = {
              type: 'set_location',
              iframe_name: window.name,
              data: data,
            };

            utils.postmessage.send(msg_data, '*', window.parent);
          } else if (data.href && data.href.toLowerCase().indexOf('javascript:') === -1) {
            window.location.href = data.href;
          }
        });

        utils.subscribe('scroll_to', iframe.name, function (data, iframe) {
          if (data.selector) {
            var matches = document.querySelectorAll(data.selector);

            if (matches.length > 0) {
              data.y = matches[0].offsetTop;
            }
          }
          window.scrollTo(data.x, data.y || iframe.offsetTop);
        });

        utils.subscribe('offer_close', iframe.name, function (data, iframe) {
          // reset iframe load state

          var index = utils.lastLoadedIframeName.indexOf(iframe.name);

          if (index !== -1) {
            utils.lastLoadedIframeName.splice(index, 1);
          }

          iframe.style.display = 'none';
          styleTag && styleTag.remove();
          styleTag = null;

          // Otherwise it causes a never-ending tab window spinner in Chrome
          // Yes, the delay should be that big, otherwise it won’t fix the issue
          setTimeout(function () {
            iframe.remove();
            iframe = null;
          }, 1000);
        });

        utils.subscribe('offer_loaded', iframe.name, function (data) {
          utils.lastLoadedIframeName.push(iframe.name);

          if (data.perform_snapshot) {
            utils.scrapeDOM();
          }

          if (utils.gleamRewardCallback && data.gleam_reward) {
            try {
              utils.gleamRewardCallback(data.gleam_reward);
            } catch (ex) {
              utils.log(ex);
            }
          }

          if (
            data.campaign_appearance === 'inline' &&
            iframe.parentNode &&
            utils.isGenerated(iframe.parentNode)
          ) {
            return;
          }
          if (!data.integration_css && !data.integration_css.css) {
            return;
          }
          styleTag = document.createElement('style');
          styleTag.id = data.integration_css.attribute_value;
          styleTag.dataset.talkableIntegrationCss = true;
          styleTag.type = 'text/css';

          if (styleTag.styleSheet) {
            styleTag.styleSheet.cssText = data.integration_css.css;
          } else {
            styleTag.appendChild(document.createTextNode(data.integration_css.css));
          }

          if (!document.getElementById(data.integration_css.attribute_value)) {
            document.body && document.body.appendChild(styleTag);
          }

          if (
            data.integration_css.attribute_name &&
            data.integration_css.attribute_value
          ) {
            iframe.setAttribute(
              data.integration_css.attribute_name,
              data.integration_css.attribute_value
            );
          }

          if (data.page_title) {
            iframe.setAttribute('title', data.page_title);
          }

          if (data.campaign_id) {
            utils.loadTime.campaignLoaded(data.campaign_id);
          }
        });

        return iframe;
      },

      buildJs: function (url) {
        var result = document.createElement('script');

        result.type = 'text/javascript';
        result.async = config.async;
        result.src = url;

        return result;
      },

      addJs: function (url) {
        utils.log('addJs: ' + url);
        var s = document.getElementsByTagName('script')[0];

        s.parentNode.insertBefore(utils.buildJs(url), s);
      },

      createUrl: function (path, parameters) {
        var create_url = utils.namespace() + path;
        var items = null;

        parameters = utils.merge({ v: config.version }, parameters);
        if (parameters.o && parameters.o.i) {
          items = parameters.o.i;
          delete parameters.o.i;
        }

        create_url = create_url + '?' + utils.serialize(parameters);

        if (items) {
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemsParams =
              '&' +
              utils.serialize(
                {
                  product_id: item.product_id,
                  price: item.price,
                  quantity: item.quantity,
                },
                'o[i][' + i + ']'
              );

            if ((create_url + itemsParams).length < config.url_length_limit) {
              create_url += itemsParams;
            }
          }
        }

        return create_url;
      },

      formStaticWidget: function (options, urlParameters) {
        var placement = utils.staticHtmlPlacement(urlParameters.matched_placement_ids);

        if (!placement) {
          return false;
        }

        if (
          options.iframe.container &&
          options.iframe.container === options.trigger_widget.container
        ) {
          throw new Error(
            '`trigger_widget` container should be different from `iframe` container.'
          );
        }

        if (!utils.isBrowserSupported()) {
          return false;
        }

        var iframeOptions = utils.merge(utils.defaultIframeOptions(), options.iframe);
        var popupName = iframeOptions.name + '-popup';
        var triggeredIframeOptions = { container: popupName, name: popupName };

        if (options.trigger_widget && options.trigger_widget.container) {
          iframeOptions = utils.merge(
            utils.defaultIframeOptions(),
            options.trigger_widget
          );
          triggeredIframeOptions = utils.merge(triggeredIframeOptions, options.iframe);
        }

        var iframe = utils.addIframeElement(placement.staticHtmlUrl, iframeOptions);

        utils.subscribe('static_widget_triggered', iframe.name, function () {
          urlParameters = utils.clone(urlParameters);
          urlParameters.matched_placement_ids = [placement.id];
          urlParameters.widget_enabled = 'false';
          urlParameters.cvuuid = utils.ensureUUID();
          var staticWidgetOfferUrl = utils.createUrl(
            '/affiliate_members/create',
            urlParameters
          );

          utils.addIframeElement(staticWidgetOfferUrl, triggeredIframeOptions);
        });

        return true;
      },

      staticHtmlPlacement: function (matchedPlacementIds) {
        var urls;
        var placement;
        var i = 0;
        var j = 0;
        var deviceType = this.device_type();

        for (; i < talkablePlacementsConfig.placements.length; i++) {
          placement = talkablePlacementsConfig.placements[i];

          // Old integrations do not support static widget
          if (!this.hasProperty(placement, 'appearance')) {
            return false;
          }
          if (!this.hasProperty(placement, 'static_html')) {
            return false;
          }

          if (
            matchedPlacementIds.indexOf(placement.id) !== -1 &&
            placement.appearance !== 'gleam'
          ) {
            break;
          }

          placement = null;
        }

        if (!placement) {
          return false;
        }

        for (; j < placement.static_html.length; j++) {
          urls = placement.static_html[j];

          if (this.hasProperty(urls, deviceType)) {
            return utils.merge(placement, { staticHtmlUrl: urls[deviceType] });
          }
        }

        return false;
      },

      encodeProperties: function (data, propertySuffixes) {
        if (!window.btoa) {
          return data;
        }

        var encodedData = utils.clone(data || {});

        for (var key in encodedData) {
          for (var i = 0; i < propertySuffixes.length; i++) {
            if (key.endsWith(propertySuffixes[i]) && encodedData[key]) {
              encodedData[key] = btoa(encodedData[key]);
            }
          }
        }

        return encodedData;
      },

      formIframe: function (options, url_path, url_parameters) {
        var utm_tags = [
          'utm_campaign',
          'utm_content',
          'utm_medium',
          'utm_source',
          'utm_term',
        ];

        if (
          options.iframe.container &&
          options.iframe.container === options.trigger_widget.container
        ) {
          throw new Error(
            '`trigger_widget` container should be different from `iframe` container.'
          );
        }

        url_path = url_path + '.' + utils.getIframeCreationExtension();

        url_parameters = utils.encodeProperties(url_parameters, [
          'email',
          'phone_number',
        ]);

        if (url_parameters.o) {
          url_parameters.o = utils.encodeProperties(url_parameters.o, [
            'email',
            'phone_number',
          ]);
        }

        url_parameters.cvuuid = utils.ensureUUID();

        for (var n = 0; n < utm_tags.length; n++) {
          var utm_tag_key = utm_tags[n];
          var utm_tag_value = utils.location_parameter(utm_tag_key);

          if (utm_tag_value) {
            url_parameters[utm_tag_key] = utm_tag_value;
          }
        }

        var create_url = utils.createUrl(url_path, url_parameters);

        utils.showOffer(utils.merge(options, { url: create_url }));
      },

      showOffer: function (options) {
        if (utils.isBrowserSupported()) {
          var iframe_options = utils.merge(utils.defaultIframeOptions(), options.iframe);
          var popupName = iframe_options.name + '-popup';

          var triggered_iframe_options = {
            container: popupName,
            name: popupName,
          };

          if (options.trigger_widget && options.trigger_widget.container) {
            iframe_options = utils.merge(
              utils.defaultIframeOptions(),
              options.trigger_widget
            );
            triggered_iframe_options = utils.merge(
              triggered_iframe_options,
              options.iframe
            );
          }

          var iframe = utils.addIframeElement(options.url, iframe_options);

          utils.subscribe('offer_triggered', iframe.name, function (data) {
            utils.addIframeElement(
              config.server + data.offer_share_path,
              triggered_iframe_options
            );
          });
        } else {
          utils.addImage(options.url);
        }
      },

      cleanupRegisterData: function (data) {
        delete data.campaign_tags;
        delete data.device; // deprecated parameter
        delete data.iframe;
        delete data.campaign_template; // deprecated parameter
        delete data.trigger_widget;
        delete data.tkbl_expand;
        delete data.custom_properties;
        delete data.accepted_cookies;
      },

      extractOriginData: function (data, key) {
        var result;

        if (this.hasProperty(data, key)) {
          // Support for subhashes
          result = utils.merge(data.customer || {}, data[key]);
          delete data.customer;
        } else {
          result = data;
        }

        return result;
      },

      doubleIntegrationCheck: function () {
        if (
          anotherIntegration &&
          parseInt(config.version) !== parseInt(anotherIntegration.config.version)
        ) {
          utils.notifyIntegrationError(
            'Another Talkable integration with site ID ' +
              anotherIntegration.config.site_id +
              ' and version ' +
              anotherIntegration.config.version +
              ' is present with current integration with site ID ' +
              config.site_id +
              ' and ' +
              config.version +
              ' version on ' +
              window.location.href
          );
        }
      },

      generateRandomIframeName: function (callback) {
        // only if iframe.name specified as null
        return 'talkable_integration_' + Math.random().toString(36).substring(2);
      },

      addRandomIframeName: function (params) {
        var name = this.generateRandomIframeName();

        if (params && !params.name) {
          params.name = name;
        }

        return name;
      },

      scrapeDOM: function () {
        var iframeName =
          utils.lastLoadedIframeName[utils.lastLoadedIframeName.length - 1];

        if (document.documentElement) {
          var domString;

          if (document.doctype) {
            var doctypeNode = document.doctype;
            var doctypeString =
              '<!DOCTYPE ' +
              doctypeNode.name +
              (doctypeNode.publicId ? ' PUBLIC "' + doctypeNode.publicId + '"' : '') +
              (!doctypeNode.publicId && doctypeNode.systemId ? ' SYSTEM' : '') +
              (doctypeNode.systemId ? ' "' + doctypeNode.systemId + '"' : '') +
              '>';

            domString = doctypeString;
          }

          domString += '<html>';
          domString += document.documentElement.innerHTML;
          domString += '</html>';

          this.publish('dom_capture', iframeName, {
            dom: domString,
            url: document.location.href,
          });
        }
      },

      domReady: function (callback) {
        var ready = false;

        var detach = function () {
          if (document.addEventListener) {
            document.removeEventListener('DOMContentLoaded', completed);
            window.removeEventListener('load', completed);
          } else {
            document.detachEvent('onreadystatechange', completed);
            window.detachEvent('onload', completed);
          }
        };

        var completed = function () {
          if (
            !ready &&
            (document.addEventListener ||
              event.type === 'load' ||
              document.readyState === 'complete')
          ) {
            ready = true;
            detach();
            callback();
          }
        };

        if (document.readyState === 'complete') {
          callback();
        } else if (document.addEventListener) {
          document.addEventListener('DOMContentLoaded', completed);
          window.addEventListener('load', completed);
        } else {
          document.attachEvent('onreadystatechange', completed);
          window.attachEvent('onload', completed);

          var top = false;

          try {
            // eslint-disable-next-line eqeqeq
            top = window.frameElement == null && document.documentElement;
          } catch (e) {}

          if (top && top.doScroll) {
            (function scrollCheck() {
              if (ready) {
                return;
              }

              try {
                top.doScroll('left');
              } catch (e) {
                return setTimeout(scrollCheck, 50);
              }

              ready = true;
              detach();
              callback();
            })();
          }
        }
      },

      getCookie: function (name) {
        var query = '(^|; )' + name + '=([^;]*)';

        return (document.cookie.match(query) || []).pop();
      },

      getAllCookies: function () {
        var cookie = this.getCookie(UUID_KEY) || this.getCookie(UUID_DEPRECATED_KEY);

        if (cookie) {
          this.isPermanentCookie = true;

          return cookie;
        }

        return this.getCookie(UUID_SESSION_KEY);
      },

      setCookie: function (name, value) {
        if (!name || !value) {
          return;
        }
        var date = new Date();

        date.setTime(date.getTime() + 2 * 365 * 24 * 60 * 60 * 1000); // chrome limits max-age to 400 days
        document.cookie =
          name + '=' + value + '; expires=' + date.toGMTString() + '; path=/';
      },

      setSessionCookie: function (value) {
        if (!value) {
          return;
        }
        document.cookie = UUID_SESSION_KEY + '=' + value + '; path=/';
      },

      deleteCookie: function (name) {
        document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      },

      ensureUUID: function () {
        var uuid =
          utils.location_parameter(UUID_KEY) ||
          utils.location_parameter(UUID_DEPRECATED_KEY) ||
          utils.location_parameter(UUID_SESSION_KEY);

        uuid = uuid || this.getAllCookies() || this.generateUUID();

        if (utils.location_parameter('accepted_cookies')) {
          this.isPermanentCookie = true;
        }

        // Update cookie and refresh expiration date
        if (
          (window.talkablePlacementsConfig && !talkablePlacementsConfig.gdpr_cookies) ||
          this.isPermanentCookie
        ) {
          this.setCookie(UUID_KEY, uuid);
        } else {
          this.setSessionCookie(uuid);
        }

        return uuid;
      },

      generateUUID: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0;
          var v = c === 'x' ? r : (r & 0x3) | 0x8;

          return v.toString(16);
        });
      },

      ajax: function (params) {
        var data = params.data || '';
        var httpMethod = params.method || 'GET';

        httpRequest = new XMLHttpRequest();
        httpRequest.open(httpMethod, params.url, true);
        if (httpMethod === 'POST') {
          httpRequest.setRequestHeader(
            'Content-Type',
            'application/x-www-form-urlencoded; charset=UTF-8'
          );
        }
        httpRequest.addEventListener('readystatechange', function () {
          if (httpRequest.readyState === 4) {
            return httpRequest.response;
          }
        });
        httpRequest.send(utils.serialize(data));
      },

      launchCampaignsCriteria: function () {
        return (
          config.launch_campaigns && config.site_id && typeof _talkableq !== 'undefined'
        );
      },

      isIntegrationLibraryHostname: function (value) {
        return (
          /^curebit(-(development|staging|test))?\.s3\.amazonaws\.com$/.test(value) ||
          /^(d2jjzw81hqbuqv|d3pfcpkel4p4mo|di6re4dxelnn2)\.cloudfront\.net$/.test(value)
        );
      },

      parseHostname: function (url) {
        var parser = document.createElement('a');

        parser.href = url;

        return parser.hostname;
      },

      loadTime: {
        enabled:
          window.talkablePlacementsConfig &&
          talkablePlacementsConfig.tracks_campaign_load_timings,
        sentToServer: false,
        timings: {
          l: null, // library
          s: null, // site
          c: null, // campaign
          cid: null, // campaign ID
        },

        sendToServer: function () {
          if (
            this.enabled &&
            !this.sentToServer &&
            this.timings.l &&
            this.timings.s &&
            this.timings.c &&
            this.timings.cid
          ) {
            this.sentToServer = true;

            utils.ajax({
              method: 'POST',
              url: utils.createUrl('/timings'),
              data: this.timings,
            });
          }
        },

        campaignLoaded: function (campaignId) {
          if (!this.timings.c && !this.timings.cid) {
            this.timings.c = Math.ceil(performance.now());
            this.timings.cid = campaignId;

            this.sendToServer();
          }
        },

        waitForScriptLoad: function () {
          setTimeout(function () {
            var navigationStart = performance.getEntriesByType('navigation')[0].startTime;
            var scriptResource = performance
              .getEntriesByType('resource')
              .find(function (resource) {
                return (
                  resource.initiatorType === 'script' &&
                  utils.isIntegrationLibraryHostname(utils.parseHostname(resource.name))
                );
              });

            if (
              scriptResource &&
              !utils.loadTime.timings.l &&
              !utils.loadTime.timings.s
            ) {
              utils.loadTime.timings.l = Math.ceil(
                scriptResource.responseEnd - navigationStart
              );
              utils.loadTime.timings.s = Math.ceil(
                performance.getEntriesByType('navigation')[0].duration
              );

              utils.loadTime.sendToServer();
            }
          }, 0);
        },

        startWaitingForScriptLoad: function () {
          if (!this.enabled) {
            return;
          } else if (document.readyState === 'complete') {
            this.waitForScriptLoad();
          } else {
            window.addEventListener('load', this.waitForScriptLoad);
          }
        },
      },
    };

    utils.doubleIntegrationCheck();
    utils.startListening();
    utils.loadTime.startWaitingForScriptLoad();

    methods = {
      init: function (options) {
        var platform_exception = ['magento', 'sfcc'];

        if (
          !options.launch_campaigns &&
          platform_exception.includes(options.integration_platform)
        ) {
          options.launch_campaigns = false;
        }

        for (var key in options) {
          if (!utils.hasProperty(options, key)) {
            continue;
          }
          config[key] = options[key];
        }
        if (!config.site_id) {
          throw new Error('site_id must be specified!');
        }

        utils.ensureUUID();
        talkable.initialized = true;
      },

      authenticate_customer: function (data) {
        var registerData = utils.clone(data || {});
        var customer = registerData.customer
          ? utils.clone(registerData.customer)
          : registerData;

        if (utils.isObject(customer)) {
          customerData = customer;
        }
      },

      register_affiliate: function (data) {
        utils.ensureInitialized();
        var registerData = utils.clone(data || {});

        var affiliate_member =
          registerData.customer || registerData.affiliate_member || {};
        var options = {
          iframe: registerData.iframe || {},
          trigger_widget: registerData.trigger_widget || {},
        };
        var verify_integration =
          utils.location_parameter('tkbl_verify_integration') ||
          config.verify_integration;
        var url_parameters = [
          'email',
          'first_name',
          'last_name',
          'phone_number',
          'traffic_source',
        ];

        for (var i = 0; i < url_parameters.length; i++) {
          var parameter = url_parameters[i];

          if (utils.location_parameter(parameter)) {
            affiliate_member[parameter] = utils.location_parameter(parameter);
          }
        }

        utils.merge_custom_properties(registerData.custom_properties);

        var accepted_cookies = customerData.accepted_cookies;

        if (accepted_cookies) {
          utils.isPermanentCookie = true;
          utils.ensureUUID();
        }

        delete customerData.accepted_cookies;
        var matched_placement_ids =
          registerData.matched_placement_ids ||
          utils.match_placements('affiliate_member');
        var origin_params = utils.withoutProperties(
          ['currency', 'language'],
          utils.merge(customerData, affiliate_member)
        );
        var parameters = {
          o: origin_params,
          campaign_tags:
            utils.location_parameter('campaign_tags') || registerData.campaign_tags,
          affiliate_campaign_id: utils.location_parameter('tkbl_campaign_id'),
          custom_properties: registerData.custom_properties,
          currency: registerData.currency || customerData.currency,
          language: registerData.language || customerData.language,
          integration_platform: config.integration_platform,
          tkbl_expand:
            utils.location_parameter('tkbl_expand') || registerData.expand_trigger_widget,
          matched_placement_ids: matched_placement_ids,
          matched_country_ids: registerData.matched_country_ids || utils.matchedCountries,
          ts: talkablePlacementsConfig.timestamp,
          ii: talkablePlacementsConfig.integration_id,
          vi: verify_integration,
          accepted_cookies: accepted_cookies,
        };

        // Check the blocking parameters, with them we force a request and cannot use the static widget.
        if (
          parameters.affiliate_campaign_id ||
          parameters.campaign_tags ||
          parameters.tkbl_expand
        ) {
          utils.formIframe(options, '/affiliate_members/create', parameters);
        } else {
          // Avoid query completely when no placements matched for affiliate member
          if (matched_placement_ids !== EMPTY_PLACEMENTS) {
            utils.formStaticWidget(options, parameters) ||
              utils.formIframe(options, '/affiliate_members/create', parameters);
          } else {
            utils.log(
              'No campaign placements matched. Ignoring affiliate_member origin.'
            );
          }
        }
      },

      register_purchase: function (data) {
        utils.ensureInitialized();
        var registerData = utils.clone(data || {});
        var purchase = utils.extractOriginData(registerData, 'purchase');

        if (purchase.customer_email) {
          purchase.email = purchase.customer_email;
          delete purchase.customer_email;
        }

        var items = purchase.items;

        delete purchase.items;

        var accepted_cookies = customerData.accepted_cookies;

        if (accepted_cookies) {
          utils.isPermanentCookie = true;
          utils.ensureUUID();
        }

        delete customerData.accepted_cookies;

        var options = {
          iframe: registerData.iframe || {},
          trigger_widget: registerData.trigger_widget || {},
        };
        var campaign_tags =
          utils.location_parameter('campaign_tags') || registerData.campaign_tags;
        var custom_properties = registerData.custom_properties;
        var verify_integration =
          utils.location_parameter('tkbl_verify_integration') ||
          config.verify_integration;

        utils.cleanupRegisterData(registerData);
        utils.merge_custom_properties(custom_properties);

        var origin_params = utils.withoutProperties(
          ['currency', 'language'],
          utils.merge(customerData, purchase)
        );

        var parameters = {
          o: origin_params,
          campaign_tags: campaign_tags,
          affiliate_campaign_id: utils.location_parameter('tkbl_campaign_id'),
          custom_properties: custom_properties,
          currency: registerData.currency || customerData.currency,
          language: registerData.language || customerData.language,
          integration_platform: config.integration_platform,
          matched_placement_ids: utils.match_placements('purchase'),
          matched_country_ids: registerData.matched_country_ids || utils.matchedCountries,
          ts: talkablePlacementsConfig.timestamp,
          ii: talkablePlacementsConfig.integration_id,
          vi: verify_integration,
          accepted_cookies: accepted_cookies,
        };

        if (items) {
          parameters.o.i = [];
          for (var i = 0; i < items.length; i++) {
            var item = items[i];

            parameters.o.i.push({
              product_id: item.product_id,
              price: item.price,
              quantity: item.quantity,
            });
            // Also register the products if the vars are specified
            if (item.url || item.image_url || item.title) {
              methods._register_products([
                {
                  product_id: item.product_id,
                  url: item.url,
                  image_url: item.image_url,
                  title: item.title,
                  price: item.price,
                },
              ]);
            }
          }
        }

        utils.formIframe(options, '/purchases/create', parameters);
      },

      register_event: function (data) {
        utils.ensureInitialized();
        var registerData = utils.clone(data || {});

        var options = {
          iframe: registerData.iframe || {},
          trigger_widget: registerData.trigger_widget || {},
        };
        var campaign_tags =
          utils.location_parameter('campaign_tags') || registerData.campaign_tags;
        var custom_properties = registerData.custom_properties;
        var verify_integration =
          utils.location_parameter('tkbl_verify_integration') ||
          config.verify_integration;
        var accepted_cookies = customerData.accepted_cookies;

        if (accepted_cookies) {
          utils.isPermanentCookie = true;
          utils.ensureUUID();
        }

        delete customerData.accepted_cookies;

        utils.cleanupRegisterData(registerData);

        var event = utils.extractOriginData(registerData, 'event');

        utils.merge_custom_properties(custom_properties);

        var origin_params = utils.withoutProperties(
          ['currency', 'language'],
          utils.merge(customerData, event)
        );

        var parameters = {
          o: origin_params,
          campaign_tags: campaign_tags,
          affiliate_campaign_id: utils.location_parameter('tkbl_campaign_id'),
          custom_properties: custom_properties,
          currency: registerData.currency || customerData.currency,
          language: registerData.language || customerData.language,
          integration_platform: config.integration_platform,
          matched_placement_ids: utils.match_placements(event.event_category),
          ts: talkablePlacementsConfig.timestamp,
          ii: talkablePlacementsConfig.integration_id,
          vi: verify_integration,
          accepted_cookies: accepted_cookies,
        };

        utils.formIframe(options, '/events/create', parameters);
      },

      show_email_capture_offer: function (data) {
        utils.ensureInitialized();

        var options = {
          iframe: utils.defaultIframeOptions('talkable-email-capture-offer'),
          trigger_widget: {},
        };

        var registerData = utils.clone(data || {});

        utils.merge_custom_properties(registerData.custom_properties);

        var accepted_cookies = customerData.accepted_cookies;

        if (accepted_cookies) {
          utils.isPermanentCookie = true;
          utils.ensureUUID();
        }

        delete customerData.accepted_cookies;
        var matched_placement_ids =
          registerData.matched_placement_ids ||
          utils.match_placements(
            'email_capture_popup',
            talkablePlacementsConfig.conversion_placements
          );

        var parameters = {
          traffic_source: registerData.traffic_source,
          campaign_tags: registerData.campaign_tags,
          matched_placement_ids: matched_placement_ids,
          accepted_cookies: accepted_cookies,
        };

        var showAfter = config.email_capture_show_timeout * 1000;

        setTimeout(function () {
          if (config.email_capture_show_offer) {
            if (matched_placement_ids !== EMPTY_PLACEMENTS) {
              utils.formIframe(options, '/email_capture/offers/create', parameters);
            } else {
              utils.log('No campaign placements matched.');
            }
          }
        }, showAfter);
      },

      show_loyalty: function (data) {
        utils.ensureInitialized();
        var registerData = utils.clone(data || {});

        utils.merge_custom_properties(registerData.custom_properties);

        var matchData = utils.matchLoyaltyPlacements();

        if (!matchData) {
          return;
        }

        var options = {
          iframe: utils.defaultIframeOptions('talkable-loyalty'),
          trigger_widget: {},
        };

        var urlParameters = {
          campaign_id:
            utils.location_parameter('tkbl_campaign_id') || registerData.campaign_id,
          custom_properties: customerData.custom_properties,
          customer_id: registerData.customer_id || customerData.customer_id,
          email: registerData.email || customerData.email,
          first_name: registerData.first_name || customerData.first_name,
          last_name: registerData.last_name || customerData.last_name,
          matched_placement_ids:
            registerData.matched_placement_ids || matchData.matchedPlacementIds,
          optin:
            typeof registerData.optin === 'undefined'
              ? utils.getCookie(LOYALTY_OPTIN_KEY)
              : registerData.optin,
          phone_number: registerData.phone_number || customerData.phone_number,
        };

        utils.formIframe(options, matchData.path, urlParameters);
      },

      accepted_cookies: function () {
        utils.isPermanentCookie = true;
        utils.ensureUUID();
      },

      join_loyalty: function (data) {
        utils.ensureInitialized();

        var registerData = utils.clone(data || {});

        utils.merge_custom_properties(registerData.custom_properties);

        var matchData = utils.matchLoyaltyPlacements();

        if (!matchData) {
          return;
        }

        var urlParameters = {
          campaign_id:
            utils.location_parameter('tkbl_campaign_id') || registerData.campaign_id,
          custom_properties: customerData.custom_properties,
          customer_id: registerData.customer_id || customerData.customer_id,
          email: registerData.email || customerData.email,
          first_name: registerData.first_name || customerData.first_name,
          last_name: registerData.last_name || customerData.last_name,
          matched_placement_ids:
            registerData.matched_placement_ids || matchData.matchedPlacementIds,
          optin: true,
          phone_number: registerData.phone_number || customerData.phone_number,
        };

        urlParameters = utils.encodeProperties(urlParameters, ['email', 'phone_number']);

        var url = utils.createUrl(matchData.path, urlParameters);

        utils.ajax({
          url: url,
          method: 'GET',
        });
      },

      register_loyalty_action: function (data) {
        var registerData = utils.clone(data || {});

        var actionConfigIdentifier =
          registerData.action_config_identifier || registerData.rule_identifier;

        if (typeof actionConfigIdentifier === 'undefined') {
          return;
        }

        var email = registerData.email || customerData.email;

        if (window.btoa && email) {
          email = btoa(email);
        }

        var customProperties =
          registerData.custom_properties || customerData.custom_properties || {};

        var url = utils.createUrl('/loyalty/actions');
        var params = {
          email: email,
          custom_properties: customProperties,
          action_config_identifier: actionConfigIdentifier,
          traffic_source: registerData.traffic_source,
          campaign_id:
            utils.location_parameter('tkbl_campaign_id') || registerData.campaign_id,
        };

        utils.ajax({
          url: url,
          method: 'POST',
          data: params,
        });
      },

      show_offer: function (options) {
        utils.showOffer(options);
      },

      show_claim_by_name: function (data) {
        utils.ensureInitialized();
        var registerData = utils.clone(data || {});

        var options = {
          iframe:
            registerData.iframe || utils.defaultIframeOptions('talkable-claim-by-name'),
          widget_enabled: registerData.widget_enabled || {},
          trigger_widget: registerData.trigger_widget || {},
        };

        utils.merge_custom_properties(registerData.custom_properties);

        var matchedPlacementIds =
          registerData.matched_placement_ids ||
          utils.match_placements('claim_by_name_popup');

        var urlParameters = {
          campaign_id:
            utils.location_parameter('tkbl_campaign_id') || registerData.campaign_id,
          campaign_tags:
            utils.location_parameter('campaign_tags') || registerData.campaign_tags,
          friend_email: registerData.email || customerData.email,
          language: registerData.language || customerData.language,
          matched_placement_ids: matchedPlacementIds,
          matched_country_ids: registerData.matched_country_ids || utils.matchedCountries,
          tkbl_expand:
            utils.location_parameter('tkbl_expand') || registerData.expand_trigger_widget,
        };

        utils.formIframe(options, '/claim_by_name/show', urlParameters);
      },

      gleam_reward: function (data) {
        utils.gleamRewardCallback = data.callback;
      },

      _register_products: function (products) {
        utils.ensureInitialized();
        for (var i = 0; i < products.length; i++) {
          utils.addImage(utils.createUrl('/products/create.gif', { p: products[i] }));
        }
      },

      talkable_loaded: function (callback) {
        if (typeof callback === 'function') {
          callback();
        }
      },
    };

    // backward compatibility
    methods.show_loyalty_redeem_widget = methods.show_loyalty;

    return {
      initialized: false,
      config: config,
      before: utils.before,
      define: utils.define,
      methods: methods,
      domReady: utils.domReady,
      subscribe: utils.subscribe,
      publish: utils.publish,
      scrapeDOM: utils.scrapeDOM,
      match_placements: utils.match_placements,
      device_type: utils.device_type,

      check: function () {
        if (typeof _talkableq === 'undefined' || !Array.isArray(_talkableq)) {
          return;
        }
        while (_talkableq.length > 0) {
          var action = _talkableq.shift();
          var method = action[0];
          var params = action[1];

          // apply callbacks
          if (utils.callbacks[method]) {
            params = utils.callbacks[method].call(talkable, params) || false;
          }

          if (methods[method] && params !== false) {
            methods[method].call(talkable, params);
          } else {
            utils.log(
              'Method "' + method + '" does not exist or does not have any parameters'
            );
          }
        }
      },

      run: function () {
        talkable.check();
        talkable._timer = setInterval(talkable.check, config.queue_check_interval);
        talkable._launch_campaigns_retry = setInterval(function () {
          if (utils.launchCampaignsCriteria()) {
            clearInterval(talkable._launch_campaigns_retry);
            utils.launchCampaigns();

            if (talkablePlacementsConfig.spa_placements) {
              try {
                var previousHref = document.location.href;

                setInterval(function () {
                  if (previousHref !== document.location.href) {
                    previousHref = document.location.href;
                    utils.launchCampaigns();
                  }
                }, config.launch_campaigns_spa_delay);
              } catch (ex) {
                utils.log(ex);
              }
            }
          }
        }, config.launch_campaigns_retry_delay);

        setTimeout(function () {
          clearInterval(talkable._launch_campaigns_retry);
        }, config.launch_campaigns_retry_count * config.launch_campaigns_retry_delay);
      },

      _timer: null,
      _launch_campaigns_retry: null,
    };
  })());

  // %OVERRIDES%
  _TALKABLE_PER_CLIENT_CONFIG = {
          server: "https://www.void.talkable.com",
          site_slug: "testmax-22nov2024"
      },
      window._talkableq = window._talkableq || [],
      _talkableq.unshift(["init", {
          site_id: _TALKABLE_PER_CLIENT_CONFIG.site_slug,
          server: _TALKABLE_PER_CLIENT_CONFIG.server,
          integration_platform: ""
      }]),


  talkable.run();
})(window, document, JSON, Object);