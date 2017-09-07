define(['location_validation-lite', 'type_ahead', 'pdmodules/1/finder-sponsorship'], function (lo, ta, fs) {
	'use strict';
	var module;
	var location = webmd.object(lo);
	var typeahead = webmd.object(ta);
	var sponsorship = webmd.object(fs);
	var lhdOTTclass = window.lhdOTTclass;
	var s_md = window.s_md;
	var s_topic = window.s_topic;
	var wmdPageLink = window.wmdPageLink;
	var wmdTrack = window.wmdTrack;
	var webmdLoad = function (method, options) {
		return $.xLazyLoader(method,options);
	};
	var timerIdSponsorDisclaimer = undefined;

	webmd.debug("=$=$= Physician Directory Care Finder: Loaded 06/23/2017 11:43 AM");
	// Remove Blank Layout Test CSS that messes with the fonts we want
	if (window.top !== window || typeof adservingsbx !== 'undefined' || typeof webmd.m.adservingsbx !== 'undefined') {
		$('link[rel="stylesheet"][href*="091e9c5e805e6284"]').prop('disabled', true);
		$('link[rel="stylesheet"][href*="091e9c5e805e6284"]').remove();
		webmd.debug("Load Responsive!");
		webmdLoad({
			css: image_server_url + '/webmd/PageBuilder_Assets/CSS_static/Responsive_Layout_CSS/Runtime/1_column_layout_responsive.css'
		});
	}

	// Redirect for when inside an iframe
		if (typeof lhdOTTclass === 'undefined') {
			if (typeof window.top.lhdOTTclass !== 'undefined') {
				lhdOTTclass = window.top.lhdOTTclass;
			} else {
				lhdOTTclass = '';
			}
		}
		if (typeof s_md === 'undefined') {
			if (typeof window.top.s_md !== 'undefined') {
				s_md = window.top.s_md;
			}
		}
		if (typeof s_topic === 'undefined') {
			if (typeof window.top.s_topic !== 'undefined') {
				s_topic = window.top.s_topic;
			}
		}
		if (typeof wmdPageLink === 'undefined') {
			wmdPageLink = function (module, contextData) {
				// Call tracking function from parent window
				if (window.top !== window) {
					return window.top.wmdPageLink(module, contextData);
				}
			};
		}
		if (typeof wmdTrack === 'undefined') {
			wmdTrack = function (module) {
				// Call tracking function from parent window
				if (window.top !== window) {
					return window.top.wmdTrack(module);
				}
			};
		}

	module = {
		resultsdata: '',
		tries: 0,
		validParams: ['hp', 'ln', 'sd', 'cond', 'proc', 'tname', 'city', 'state', 'zip', 'lat', 'lon', 'cf'],
		mobile: $('html').hasClass('ua_type_mobile'),
		responsive: $('html').hasClass('responsive'),
		cookieId: 'pdInfo',
		modules: {},
		inIframe: window.top !== window,
		cfModuleName: '',
		init: function (opts) {
			var _this = this;
			var temp;
			var siteCSS = false;
			var defaults = {
					form: false,
					name: 'carefinder',
					number: 3,
					query: {},
					resultTemplate: '<li class="result" data-provid="{id}" data-sponid="{sponid}">{photo}<div class="result-content"><div class="provider-info"><h4><a href="{url}" target="_top" data-metrics-link="rs{i}"><strong>{name}</strong><span>&nbsp;&gt;</span></a></h4><p class="specialties">{specialties}</p>{featured}{rating}<p class="address"><strong>{location}</strong><br />{address}<br />{address2}{city}, {state} {zip}</p></div><div class="connection-links"><p class="telephone"><a href="tel:{number}" data-metrics-link="ph{i}" class="phone">{phone}</a></p>{book}</div></div></li>',
					resultPhotoTemplate: '<div class="photo-tags"><img class="image" src="{photo}" alt="{alt}" />{featured}</div>',
					resultApptTemplate: '<p class="book-appt" data-metrics-module="pd-appt"><a href="{url}" class="button {type}" data-metrics-link="bk{i}" {targetAttr}>Book Online</a></p>',
					resultRatingTemplate: '<div class="star-rating"><span class="rating overall" data-rating="{rating}"><i{selected1}><a class="star" href="javascript://"><i class="icon-star" /></a></i><i{selected2}><a class="star" href="javascript://"><i class="icon-star" />{half2}</a></i><i{selected3}><a class="star" href="javascript://"><i class="icon-star" />{half3}</a></i><i{selected4}><a class="star" href="javascript://"><i class="icon-star" />{half4}</a></i><i{selected5}><a class="star" href="javascript://"><i class="icon-star" />{half5}</a></i></span></div>',
					resultSponsorTemplate: '<div class="sponsor-logo"><span class="sponsor-prefix-text">From our sponsor</span> <div class="sponsor-legal-disclaimer">Content under this heading is from or created on behalf of the named sponsor. This content is not subject to the WebMD Editorial Policy and is not reviewed by the WebMD Editorial department for accuracy, objectivity or balance.</div> <a href="{url}" data-metrics-link="spon" target="_blank">{linkText}</a>{imageTmpl}</div>',
					specialist: 'Doctor',
					ratings: 'false', /* Value from PB module description */
					images: 'false', /* Value from PB module description */
					target: '.pd-search',
					editorialDestination: 'false', /* Value from PB module description */
					url: '/api/directories/Service.svc/ProviderSearch?retfacet=false&so=random',
					lhdResultsUrl: webmd.url.addLifecycleAndEnv('//doctor.webmd.com/results?')
				};

			if (_this.sensitiveTopic(opts.sponsorId)) {
				webmd.debug("=$=$= Physician Directory Care Finder: Initialize: SENSITIVE TOPIC: Abort, remove module", opts.name, s_topic);
				$(opts.target).remove();
			} else if ((typeof webmd.url.getParam('show') !== 'undefined' && webmd.url.getParam('show').length > 0 && opts.type.indexOf(webmd.url.getParam('show')) < 0) || (typeof webmd.url.getParam('module') !== 'undefined' && webmd.url.getParam('module').length > 0 && webmd.url.getParam('module').indexOf(opts.name) < 0)) {
				webmd.debug("=$=$= Physician Directory Care Finder: Initialize: TEMPORARILY DISABLED", opts.name);
			} else {
				webmd.debug("=$=$= Physician Directory Care Finder: Initialize: LOAD", opts.name);//, opts);
				
				if (!_this.settings) {
					_this.settings = [];
				}
				temp = $.extend(defaults, opts, true);
				_this.cfModuleName = temp.name;
				_this.settings[temp.name] = temp;
				_this.resultTemplate = _this.settings[temp.name].resultTemplate;
				_this.resultPhotoTemplate = _this.settings[temp.name].resultPhotoTemplate;
				_this.resultApptTemplate = _this.settings[temp.name].resultApptTemplate;
				_this.resultRatingTemplate = _this.settings[temp.name].resultRatingTemplate;
				_this.resultSponsorTemplate = _this.settings[temp.name].resultSponsorTemplate;
				_this.metric = _this.settings[temp.name].target.replace('#', '');

				_this.settings[temp.name].$el = $(_this.settings[temp.name].target);
				_this.settings[temp.name].sponsored = _this.settings[temp.name].$el.hasClass('sponsored');
				if (_this.settings[temp.name].$el.hasClass('responsive')) {
					_this.responsive = true;
				}
				
				_this.location(null, null, function () { _this.get(_this.settings[temp.name]); }, _this.settings[temp.name]);
				
				if (!_this.mobile && !_this.responsive) {
					webmd.debug("Check for SITE CSS");
					$(document.styleSheets).each(function (i, sheet) {
						if (sheet.href && sheet.href.indexOf('/Site/WebMD_') > -1) {
							siteCSS = true;
						}
					});
					if (!siteCSS) {
						webmdLoad({
							css: image_server_url + '/webmd/PageBuilder_Assets/CSS_static/Site/WebMD_091e9c5e8004a224.css'
						});
					}
				}
				if (_this.responsive || _this.settings[temp.name].type === 'responsive') {
					webmd.debug("Check for Responsive CSS");
					$(document.styleSheets).each(function (i, sheet) {
						if (sheet.href && sheet.href.indexOf('/Responsive_Layout_CSS/') > -1) {
							siteCSS = true;
						}
					});
					if (!siteCSS) {
						webmd.debug("Load Responsive!");
						webmdLoad({
							css: image_server_url + '/webmd/PageBuilder_Assets/CSS_static/Responsive_Layout_CSS/Runtime/1_column_layout_responsive.css'
						});
					}
				}
				
				/* If the module is loading in Editorial Destinations, add a special class to the body element to override styles. */
				if (_this.settings[temp.name].editorialDestination === 'true') {
					$('body').addClass('editorial-destination-iframe');
				}
				
				// Form action for environment
				if (_this.settings[temp.name].form) {
					_this.settings[temp.name].$el.find('form').attr('action', webmd.url.addLifecycleAndEnv(_this.settings[temp.name].$el.find('form').attr('action')));
				}
				
				// OTT Test Restriction
				if (_this.settings[temp.name].sponsorId !== 'abco-tjuphil16' && _this.settings[temp.name].sponsorId !== 'abco-abiphil16' && _this.settings[temp.name].sponsorId !== 'abco-mhhou16') {
					lhdOTTclass = null;
				}
			}
		},

		/* SUPPORT FUNCTIONS */
		addQuery: function (url, settings) {
			url = webmd.url.setParam('pagesize', settings.number, url);
			url = webmd.url.setParam('distance', '250', url);
			// Location
			if (this.loc) {
				if (this.loc.state && this.loc.city) {
					url = webmd.url.setParam('city', this.loc.city, url);
					url = webmd.url.setParam('state', this.loc.state, url);
				}
				if (this.loc.zip) {
					url = webmd.url.setParam('zip', this.loc.zip, url);
				}
			}
			url = this.addOptionalQuery(url, settings);
			return url;
		},
		addOptionalQuery: function (url, settings) {
			var bypassTopic = false;
			var key = 'lspg';

			if (settings.query.sd === '0') {
				bypassTopic = true;
			}
			$.each(settings.query, function (key, value) {
				if (value !== '0') {
					url = webmd.url.setParam(key, value, url);
				} else {
					settings.query[key] = null;
				}
			});
			if (!settings.query.sd && !settings.query.cond && !settings.query.proc && !settings.noDefaultSpecialty) {
				if (typeof s_topic !== 'undefined' && s_topic !== '' && !bypassTopic) {
					url = webmd.url.setParam('topic', s_topic, url);
				} else {
					url = webmd.url.setParam('sd', '37', url);
				}
			}
			if (settings.sponsorId) {
				if (settings.spg === 'true') {
					key = 'spg';
				}
				url = webmd.url.setParam(key, settings.sponsorId, url);
			}
			return url;
		},
		adjustSizes: function (settings, clear) {
			var _this = this;
			var $el1 = settings.$el.find('header h3');
			var $el2 = settings.$el.find('header .sponsor-logo');
			var $el3 = settings.$el.find('header .sponsor-logo');
			var temp;
			var temp2;
			var width;
			var columns = false;

			if (!(settings.type === 'mobile' && !settings.sponsored)) {
				if (!clear) {
					switch (settings.type) {
						case 'banner':
							//webmd.debug("BANNER");
							break;
						case 'center':
							//webmd.debug("CENTER");
							break;
						case 'footer':
							//webmd.debug("FOOTER");
							if (!settings.sponsored) {
								$el2 = settings.$el.find('header .finder-logo');
							}
							break;
						case 'right':
							//webmd.debug("RIGHT");
							$el2 = settings.$el.find('header .finder-logo');
							break;
						case 'mobile':
							//webmd.debug("MOBILE");
							if (!settings.$el.hasClass('closed')) {
								$el2 = settings.$el.find('header .finder-logo');
							} else {
								$el2 = settings.$el.find('header .sponsor-logo');
							}
							break;
					}
				} else {
					$el1.css('padding-top', '0');
					$el1.css('height', 'auto');
					$el2.css('padding-top', '0');
					$el2.css('height', 'auto');
				}
				
				// Mobile Expandable
				if (settings.type === 'mobile' && settings.expandable) {
					$el1 = settings.$el.find('header .sponsor-logo');
					$el2 = settings.$el.find('header > span');
					if ($el1.outerHeight() > $el2.height()) {
						temp = ($el1.outerHeight() - $el2.height()) / 2;
						if ($el2.height() < ($el1.outerHeight() - temp)) {
							$el2.css('padding-top', temp + 'px');
							$el2.css('height', ($el1.outerHeight() - temp) + 'px');
						}
					}
				}
				// Widths
				if (settings.type === 'right' || settings.type === 'mobile') {
					$el3.find('a').css('width', 'auto');
					if ($el3.find('a').css('margin-right')) {
						temp2 = Number($el3.find('a').css('margin-right').replace('px', '')) + Number($el3.find('a').css('margin-left').replace('px', ''));
					} else {
						temp2 = 0;
					}
					if ($el3.find('a').css('padding-right')) {
						temp2 += Number($el3.find('a').css('padding-right').replace('px', '')) + Number($el3.find('a').css('padding-left').replace('px', ''));
					} else {
						temp2 += 0;
					}
					if ($el3.find('img').css('margin-right')) {
						temp2 += Number($el3.find('img').css('margin-right').replace('px', '')) + Number($el3.find('img').css('margin-left').replace('px', ''));
					} else {
						temp2 += 0;
					}
					if (($el3.find('a').outerWidth() + $el3.find('img').outerWidth() > $el3.outerWidth())) {
						if (temp2 < 1) {
							temp2 = 2;
						}
						temp = $el3.innerWidth() - $el3.find('img').outerWidth() - (temp2 * 2);
						$el3.find('a').css('width', temp + 'px');
					}
				}
			}
			// Resi iframe
			if (_this.inIframe && ((typeof webmd.m !== 'undefined' && typeof webmd.m.adservingsbx !== 'undefined') || typeof adservingsbx !== 'undefined')) {
				if (typeof webmd.m.adservingsbx !== 'undefined') {
					webmd.m.adservingsbx.setAdIframeSize();
				} else if (typeof adservingsbx !== 'undefined') {
					adservingsbx.setAdIframeSize();
				}
			}
			// Resize images and featured tags
			// _this.resizeImages(settings);
		},
		bindings: function (settings, resultdata) {
			//webmd.debug("=$=$= Physician Directory Care Finder: Bindings", settings.name, settings.$el, settings);
			var _this = this;
			var temp;
			var loc;
			var year = Number(new Date().getFullYear()) + 10;
			var cookie = webmd.cookie.getJson(_this.cookieId, { scramble: true });
			var specialtyOptions;
			var conditionOptions;
			var procedureOptions;
			var placeholder = false;
			var url = '//' + webmd.url.getHostname().replace('doctor', 'www');
			var open = (settings.type === 'mobile') ? false : true;
			var legalDiv = '<div id="legal-overlay" class="legal-overlay" data-metrics-module="pd-appt">' +
								'<div class="legal-content core">' +
									'<h3 class="abc">Appointments Provided by HealthPost*</h3>' +
									'<div class="ipad-iframe-scroller">' +
										'<iframe src="{url}" class="appointments" width="685" height="500"></iframe>' +
									'</div>' +
									'<div class="legal">' +
										'<p class="abc"><em>*By selecting an appointment time above you are leaving the WebMD site and going to HealthPost, a third-party. HealthPost is solely responsible for this service.</em></p>' +
									'</div>' +
								'</div>' +
								'<div class="legal-content mobile">' +
									'<h3>Online Appointments*</h3>' +
									'<p>Book an Appointment with a Doctor Online Today</p>' +
									'<ul>' +
										'<li>Quick and easy process</li>' +
										'<li>No need to wait on hold for an appointment</li>' +
									'</ul>' +
									'<p class="continue"><a href="{url}" title="Continue" class="button orange-btn" data-metrics-module="sub">Continue</a></p>' +
									'<div class="legal">' +
										'<p class="abc"><em>*Online appointments for this doctor are managed by HealthPost, a third party. By clicking on continue, you will be taken to a screen managed by HealthPost. HealthPost is solely responsible for this service.</em></p>' +
									'</div>' +
								'</div>' +
							'</div>';
			var collapseAd = function (item, settings) {
					settings.$el.find('.module-content').slideUp('fast', function () {
						open = false;
						if (settings.type === 'mobile') {
							$(temp).find('header h3, header h1').text('Find ' + $(temp).find('header h3, header h1').text());
						}
						settings.$el.addClass('closed').removeClass('open');
						_this.adjustSizes(settings, true);
						_this.resizeIFrame(settings);
						if (window.matchMedia('(min-width: 40em)').matches) {
							$(this).show().css('overflow', 'visible');
						}
						$('.module-lhd-finder').css('overflow', 'auto');
					});
					$(item).remove();
				};
			$(window).on('resize.responsive', function () {
				setTimeout(function () { _this.adjustSizes(settings); }, 500);
			});
			// Expandable
			if (settings.expandable) {
				settings.$el.find('.close-btn').on('click', function (e) {
					collapseAd(this, settings);
				});
				settings.$el.on('click', function (e) {
					temp = this;
					if (!open) {
						if (settings.type === 'mobile') {
							$(temp).find('header h3, header h1').text($(temp).find('header h3, header h1').text().replace('Find ', ''));
						}
						$(temp).find('.module-content').slideDown('fast', function () {
							$(temp).addClass('open').removeClass('closed');
							open = true;
							_this.adjustSizes(settings);
							_this.resizeIFrame(settings);
							settings.$el.find('.module-content').css('overflow', 'visible');
						});
						if ($(temp).find('.close-btn').length < 1) {
							$(temp).find('header').prepend('<a href="javascript://" class="close-btn">close <i class="icon-close" /></a>');
							$(temp).find('.close-btn').on('click', function (e) {
								collapseAd(this, settings);
							});
						}
					}
				});
			}
			// Form-related
			if (settings.form) {
				// Insurance Dropdown
					_this.getInsurance(_this.loc, settings);
				// Submit
					_this.populateForm(settings, null, resultdata);
					settings.$el.find('form').off('submit').on('submit', function (e) {
						if (_this.locModule[settings.name].validateField($(this).find(settings.target + '-loc'), false, true)) {
							if (settings.$el.find('[name = "tname"]').val() !== settings.$el.find('[name = "ln"]').val()) {
								settings.$el.find('[name="sd"], [name="cond"], [name="proc"], [name="tname"]').remove();
							}
							settings.$el.find(':input').each(function () {
								if ($(this).val().length > 0 && this.name !== 'loc') {
									if (this.name === 'tname') {
										placeholder = true;
									}
									if (this.name === 'ln' && placeholder) {
										$(this).val('');
									}
								}
							});
							webmd.debug("=v=v= Go to results");
							wmdTrack(_this.metric + '_sub');
							return true;
						} else {
							return false;
						}
					});
				// Location Field
					settings.$el.find('form ' + settings.target + '-loc').on('blur', function (e) {
						clearTimeout(_this.locModule[settings.name].t);
						//_this.locModule[settings.name].validateField($(this), false, true);
					});
					settings.$el.find('form').off('location-update').on('location-update', function (e) {
						webmd.debug('=$=$= Physician Directory Care Finder: Event: location-update', settings.name, _this.locModule[settings.name].submitting, _this.locModule);
						if (!_this.locModule[settings.name].submitting) {
							_this.locModule[settings.name].submitting = true;
							if (_this.locModule[settings.name].loc.lat.length > 0) {
								_this.loc = _this.locModule[settings.name].loc;
							}
							loc = _this.loc.city + ', ' + _this.loc.state;
							if (_this.loc.city.length > 17) {
								if (_this.loc.city.length < 21) {
									location = _this.loc.city;
								} else {
									location = 'Your Area';
								}
							}
							settings.$el.find(settings.target + '-loc').val(_this.loc.city + ', ' + _this.loc.state + ' ' + _this.loc.zip);
							/* Update hidden fields */
							settings.$el.find('input[name="city"]').val(_this.loc.city);
							settings.$el.find('input[name="state"]').val(_this.loc.state);
							settings.$el.find('input[name="zip"]').val(_this.loc.zip);
							settings.$el.find('input[name="lat"]').val(_this.loc.lat);
							settings.$el.find('input[name="lon"]').val(_this.loc.lon);
							_this.adjustSizes(settings, true);
						} else {
							_this.locModule[settings.name].submitting = false;
						}
					});
					if (settings.form) {
						_this.locationField(settings);
						_this.locModule[settings.name].update(_this.loc);
					}
				// Type-ahead
					if (this.inIframe) {
						settings.$el.find('form').attr('target', '_top');
						settings.$el.find('form').css({ 'overflow': 'visible' });
					}
					settings.$el.find('form ' + settings.target + '-ln').on('blur', function (e) {
						if ($(this).val().length < 1) {
							settings.$el.find('[name="sd"], [name="cond"], [name="proc"], [name="tname"]').remove();
						}
					});
					// Specialties
					specialtyOptions = {
						baseurl: url,
						selector: settings.target + '-ln',
						name: 'specialty',
						params: {
							s: 20,
							sz: 10
						}
					};
					_this.spec_typeahead = webmd.object(typeahead);
					_this.spec_typeahead.init(specialtyOptions);
					// Conditions
					conditionOptions = {
						baseurl: url,
						selector: settings.target + '-ln',
						name: 'condition',
						params: {
							s: 19,
							sz: 10
						}
					};
					_this.cond_typeahead = webmd.object(typeahead);
					_this.cond_typeahead.init(conditionOptions);
					// Procedures
					procedureOptions = {
						baseurl: url,
						selector: settings.target + '-ln',
						name: 'procedure',
						params: {
							s: 18,
							sz: 10
						}
					};
					_this.proc_typeahead = webmd.object(typeahead);
					_this.proc_typeahead.init(procedureOptions);

					settings.$el.find(settings.target + '-ln').on('results-returned', function (e, type, query, data) {
						var q;
						if (!_this.ta) {
							_this.ta = {};
						}
						_this.ta[type] = data;
						if (query  && _this.ta.specialty && _this.ta.condition && _this.ta.procedure) {
							if (query.split('-')[0] === location.loc.state.toLowerCase() && query.split('-')[1] === location.loc.city.toLowerCase()) {
								q = query.replace(query.split('-')[0] + '-' + query.split('-')[1] + '-', '');
							} else {
								q = query;
							}
							_this.renderTypeAhead(settings, q, _this.ta);
						}
					});
					settings.$el.find(settings.target + '-ln').on('clear-type-ahead', function (e) {
						$('#physiciantypeahead').slideUp('fast');
					});
			}
			// For Links contextData
			settings.$el.find('a:not(.close-btn)').off().on('click', function (e) {
				webmd.debug("=$=$= Physician Directory Care Finder: Set Cookie", cookie);
				cookie.icd = _this.getSponIds(settings, _this.metric);
				webmd.cookie.setJson(_this.cookieId, cookie, { scramble: true, domain: webmd.url.getSLD(), expires: new Date("January 1, " + year + " 00:00:00") });
			});
			// Appointment Overlay
			settings.$el.find('.book-appt .abc').off().on('click', function (e) {
				e.preventDefault();
				wmdPageLink(webmd.metrics._getMetricsValue($(this)), { contextData : { 'wb.icd' :  _this.getSponIds(settings, _this.metric) }, prop16: s_md.prop16 });
				var overlay = (_this.inIframe) ? window.top.webmd.overlay : webmd.overlay;
				var url = this.href;
				var opts = {
						'html': webmd.substitute(legalDiv, { url: url }),
						'width': _this.mobile ? '90%' : 702,
						'innerHeight': 605,
						'onComplete': function() {
							// bind continue
							$('#legal-overlay .continue a').on('click', function() {
								overlay.close();
							});
						},
						'onLoad': function() {
							$('#webmdHoverClose').html('X');
						}
					};

				//webmd.debug(opts);
				overlay.open(opts);
			});
			
			/* Pass ICD for Non-ABCo appointment buttons - Note that we are not using data-metrics-type="ad-hoc" on the appointment link since we are already calling wmdPageLink() */
			settings.$el.find('.book-appt .non-abco').off().on('click', function (e) {
				e.stopPropagation(); // Prevent global scripts data-metrics from picking up the event and possibly double-logging the Omniture call.
				wmdPageLink(webmd.metrics._getMetricsValue($(this)), { contextData : { 'wb.icd' :  _this.getSponIds(settings, _this.metric) }, prop42: _this.getSponIds(settings, _this.metric) });
			});
			
			
			// Phone Number Link
			settings.$el.find('.phone').off().on('click', function (e) {
				wmdPageLink(webmd.metrics._getMetricsValue($(this)), { contextData : { 'wb.icd' :  _this.getSponIds(settings, _this.metric) }, prop16: s_md.prop16 });
			});
			
			/* Display and hide mini-tooltip */
			settings.$el.find('.sponsor-prefix-text').off().on('click', function (e) {
				var $sponsorLegalDisclaimer = $('.sponsor-legal-disclaimer');
				
				if ($sponsorLegalDisclaimer.hasClass('visible')) {
					clearTimeout(timerIdSponsorDisclaimer);
					timerIdSponsorDisclaimer = undefined;  // Reset timer ID
					$sponsorLegalDisclaimer.removeClass('visible');
				} else {
					$sponsorLegalDisclaimer.addClass('visible');
					
					/* Remove mini-tooltip after 3 seconds */
					timerIdSponsorDisclaimer = setTimeout(function() { $sponsorLegalDisclaimer.removeClass('visible'); }, 3000);
				}
			});
		},
		bookAppointmentLink: function (settings, profile, i) {
			//profile.AppointmentProviderUrl = "http://www.webmd.com";
			var _this = this;
			var link = '';
			var valid = false;
			var temp = {
					type: '',
					url: '',
					targetAttr: '',
					metric: _this.metric,
					i: i,
					onclick: ''
				};
			var abcoRegex = new RegExp('webmd.healthpost.com', 'i');
			
			if (profile.AppointmentProviderUrl && profile.AppointmentProviderUrl.length > 0 && profile.AppointmentProviderUrl.indexOf('docasap') < 0) {
				temp.url = profile.AppointmentProviderUrl;
				
				/*
				 * If the provider is referred from ABCo, its AppointmentProviderUrl property will always have webmd.healthpost.com in its URL.
				 * If this is an ABCo-based provider, add 'abc' class to the link.  In the bindings() function, the code will add event listener on this class
				 * to trigger overlay.  If this is NOT an ABCo provider, leave that class out and use the target="_top" attribute to allow the user to jump directly
				 * to the provider's URL.
				 */
				if (abcoRegex.test(temp.url)) {
					temp.type = 'abc';
				} else {
					temp.targetAttr = 'target="_blank"';
					/* If it is a non-ABCo provider, the appointment link goes directly to the external site.  This is an ad-hoc call. */
					temp.type = 'non-abco';
				}
				
				link = webmd.substitute(_this.resultApptTemplate, temp);
			}
			
			/*if (profile.Profile.Services) {
				$(profile.Profile.Services).each(function () {
					if (this.Forms[0] === 'AppointmentRequest') {
						temp.url = 'https://connect.webmd.com/c/messages/showdialog?id=' + profile.Profile.Id + '&name=AppointmentRequest';
						temp.type = 'connect';
						valid = true;
						temp.onclick = ' data-metrics-link="bk' + temp.i + '"';
					}
				});
			}*/
			
			return link;
		},
		formatPhone: function (string) {
			var phoneNumber = '';

			if (string && typeof string !== 'string') {
				if (typeof string === 'object') {
					string = string[0];
				}
				string = string.toString();
			}
			if (string && string.length > 0) {
				phoneNumber = string.replace(/\D/g, '');

				if (phoneNumber.length === 10) {
					phoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
				} else if (phoneNumber.length === 7) {
					phoneNumber = phoneNumber.replace(/(\d{3})(\d{4})/, "$1-$2");
				} else if (phoneNumber.length > 10) {
					phoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3 x");
				}
			}
			return phoneNumber;
		},
		fullName: function (profile) {
			var fullName = '';
			// First
			if (profile.FirstName.length > 0) {
				fullName += profile.FirstName + ' ';
			}
			// Middle Initial
			if (profile.MiddleName.length > 0) {
				fullName += profile.MiddleName + '. ';
			}
			// Last
			if (profile.LastName.length > 0) {
				fullName += profile.LastName;
			}
			// Degree
			$.each(profile.Degrees, function () {
				fullName += ', ' + this;
			});
			return fullName;
		},
		get: function (settings, reload) {
			webmd.debug("=$=$= Physician Directory Care Finder: Get", settings.name, settings, settings.target);
			var _this = this;
			var url = _this.addQuery(settings.url, settings).replace('preview.', '');

			if (!_this.loc) {
				_this.location(null, null, function () { _this.get(settings); }, settings);
			} else {
				$.ajax({
					url: url,
					dataType: 'json',
					success: function (data) {
						webmd.debug("=$=$= Physician Directory Care Finder: Results:", settings.name, data);
						//_this.submitting = false;
						data = data.data;
						if (data && data.Providers && !reload) {
							_this.render(settings, data);
							
							/* If module is Editorial Destinations, render the link to LHD */
							if (settings.editorialDestination === 'true') {
								_this.buildLhdLink(settings, data.QueryData);
							}
						} else if (data && data.Providers) {
							//_this.results(settings, _this.randomProviders(settings, data.Providers));
						} else {
							settings.$el.hide();
							if (window.frameElement) {
								$(window.frameElement).add(window.parent.frameElement).css({
									'display': 'none'
								});
							}
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						webmd.debug("=$=$= Physician Directory Care Finder: ERROR: AJAX: Results", jqXHR, textStatus, errorThrown);
						//_this.submitting = false;
						settings.$el.hide();
					}
				});
			}
		},
		getInsurance: function(loc, settings) {
			webmd.debug("=$=$= Physician Directory Care Finder: Get Insurance List", settings.name, loc);
			var _this = this;
			var url;
			var insuranceApi = '/api/directories/Service.svc/insurance?city={city}&state={state}&zip={zip}';
			var $insurance = $('.hp');
			var template = '<option id="{id}" value="{value}">{name}</option>';


			if (loc.zip || (loc.city && loc.state)) {
				//webmd.debug(webmd.substitute(insuranceApi, { city: loc.city || '', state: loc.state || '', zip: loc.zip || '' }));
				$.ajax({
					url: webmd.substitute(insuranceApi, { city: loc.city || '', state: loc.state || '', zip: loc.zip || '' }),
					dataType: 'json',
					success: function (data) {
						webmd.debug("=$=$= Physician Directory Care Finder: Insurance", data);
						if (data.status === 'ok') {
							data = data.data;
							var cleanData = function (data) {
										var temp = [];
										$.each(data, function (i, item) {
											if (this.ID !== '') {
												temp.push(this);
											}
										});
										return temp;
									},
								healthplanCollection = cleanData(data),
								addOptions = function (collection, el) {
										var cl = el.attr('class');

										$(el).each(function () {
											var temp = $(this);

											temp.removeAttr('disabled');
											temp.find('option').removeAttr('disabled').attr('selected', 'selected');
											// Add non-selected
											$.each(collection, function (i, item) {
												var _val = $(webmd.substitute(template, { id: cl + '-' + item.Id, cl: cl, value: item.Id, name: item.Name }));
												temp.append(_val);
											});
										});
									};

							if ($insurance.length > 0) {
								$insurance.find('option[id]').remove();
								if (healthplanCollection.length > 0) {
									addOptions(healthplanCollection, $insurance);
								} else {
									$insurance.attr('disabled', 'disabled').closest('fieldset').hide();
								}
							}
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						webmd.debug("=/=/= PhysicianDirectory: ERROR: AJAX:", jqXHR, textStatus, errorThrown);
					}
				});
			}
		},
		getLocation: function (el, callback, settings) {
			webmd.debug("=$=$= Physician Directory Care Finder: Get Location", settings.name, el);
			var _this = this, data;
			var defaultLoc = { city: 'New York', state: 'NY', zip: '10001', lat: '', lon: '', s: 501 };
			
			/* TODO: Stop this recursion and replace failure scenario with default location. */
			//_this.location({ city: 'New York', state: 'NY', zip: '10001' }, el);
			$.ajax({
				url: '/api/directories/Service.svc/location',
				dataType: 'json',
				success: function (response) {
					webmd.debug("=$=$= Physician Directory Care Finder: Data", response);
					if (response.status === 'fail' || response.data.City === '' || response.data.State === '' || response.data.Zip === '') {
						_this.location(defaultLoc, el, callback);
					} else {
						data = response.data;
						_this.location({ city: data.City, state: data.State, zip: data.Zip, lat: data.Latitude, lon: data.Longitude, s: data.DMAId }, el, callback, settings);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					webmd.debug("=$=$= Physician Directory Care Finder: ERROR: AJAX: Location", jqXHR, textStatus, errorThrown);
					_this.location(defaultLoc, el, callback, settings);
				}
			});
		},
		getProvIds: function (settings) {
			var _this = this;
			var temp = null;
			if (settings.$el.find('.result[data-provid]').length > 0) {
				temp = 'pd_';
				settings.$el.find('.result[data-provid]').each(function (i, item) {
					if (i > 0) {
						temp += '_';
					}
					temp += $(item).data('provid');
				});
			}
			return temp;
		},
		getSponIds: function (settings, moduleid) {
			var _this = this;
			var temp = null;
			if (settings.$el.find('.result[data-provid]:not(:hidden)').length > 0) {
				temp = moduleid + '_';
				settings.$el.find('.result[data-provid]:not(:hidden)').each(function (i, item) {
					if (i > 0) {
						temp += ':';
					}
					temp += $(item).data('provid');
					if ($(item).data('sponid')) {
						temp += '-';
						temp += $(item).data('sponid');
					}
				});
			}
			return temp;
		},
		headerText: function (settings, data) {
			var _this = this;
			var header = '';

			if (settings.header) {
				header = webmd.substitute(settings.header, data);
			} else {
				data.specialist = _this.setSpecialist(settings, data);
				if (_this.loc.city.length > 17) {
					if (_this.loc.city.length < 21) {
						data.location = _this.loc.city;
					} else {
						data.location = 'Your Area';
					}
				} else {
					data.location = _this.titleCase(_this.loc.city) + ', ' + _this.loc.state.toUpperCase();
				}
				data.location = data.location.replace(/ /g, '\u00a0');

				// Banner
				if (settings.type === 'banner' || (settings.type === 'mobile' && settings.expandable)) {
					header += 'Find ';
				}
				// Specialty
				header += data.specialist;
				// Condition
				if (data.Conditions && data.Conditions.length > 0) {
					header += ' Who Treat ' + data.Conditions[0].Condition.Name;
				}
				// Procedure
				if (data.Procedures && data.Procedures.length > 0) {
					if (data.Conditions) {
						header += ' and';
					} else {
						header += ' Who';
					}
					header += ' Perform ' + data.Procedures[0].Procedure.Name;
				}
				// Location
				header += ' Near ' + data.location;
			}
			return header;
		},
		/**
		 * Build the default link to Physician Directory Finder.  This is
		 * almost equivalent to the default parameters on the search form for Care Finder.
		 * Specifically for Editorial Destinations
		 * @param settings LHD Care Finder settings object
		 * @param queryData Query data used in the provider service.
		 */
		buildLhdLink: function (settings, queryData) {
			webmd.debug('=$=$= Physician Directory Care Finder: buildLhdLink', settings, queryData);
			var _this = this;
			var data;
			var workingUrl = settings.lhdResultsUrl;
			var locObj = { city: 'New York', state: 'NY', zip: '10001', lat: '', lon: '', s: 501 };

			/* Add location query param to settings.lhdResultsUrl. Call last due to Ajax dependency. */
			$.ajax({
				url: '/api/directories/Service.svc/location',
				dataType: 'json'
			}).done(function(response) {
				webmd.debug('=$=$= Physician Directory Care Finder: Ajax response received.', response);
				if (response.status === 'fail' || response.data.City === '' || response.data.State === '' || response.data.Zip === '') {
					webmd.debug('=$=$= Physician Directory Care Finder: Ajax response received but contained no data.  Using default location data.', response);
					workingUrl = setLocInUrl(workingUrl);
					workingUrl = setOtherPartsOfUrl(workingUrl, queryData);
					renderLhdLink(workingUrl);
				} else {
					webmd.debug('=$=$= Physician Directory Care Finder: Ajax response received with relevant data.', response);
					data = response.data;
					locObj = { city: data.City, state: data.State, zip: data.Zip, lat: data.Latitude, lon: data.Longitude, s: data.DMAId };
					workingUrl = setLocInUrl(workingUrl);
					workingUrl = setOtherPartsOfUrl(workingUrl, queryData);
					renderLhdLink(workingUrl);
				}
			}).fail(function (jqXHR, textStatus, errorThrown) {
				webmd.debug('=$=$= Physician Directory Care Finder: ERROR: Ajax call for location data failed.  Using default location data', jqXHR, textStatus, errorThrown);
				workingUrl = setLocInUrl(workingUrl);
				workingUrl = setOtherPartsOfUrl(workingUrl, queryData);
				renderLhdLink(workingUrl);
			});

			/* Inner function to set the url string */
			function setLocInUrl (url) {
				url = webmd.url.setParam('state', locObj.state, url);
				url = webmd.url.setParam('city', locObj.city, url);
				url = webmd.url.setParam('zip', locObj.zip, url);
				url = webmd.url.setParam('lat', locObj.lat, url);
				url = webmd.url.setParam('lon', locObj.lon, url);
				
				return url;
			}
			
			/**
			  * Inner function to setting other parts of URL.
			  * Obtaining the location is critical for the rest of the query parameters to
			  * function and produce a valid url for the link.
			  * @param url Built-up URL string
			  * @param queryData Object literal containing query sent to provider search.  Used to populate specialty data for link to LHD.
			  */
			function setOtherPartsOfUrl (url, queryData) {
				/* Add specialty (tname) query param to settings.lhdResultsUrl */
				url = _this.buildTnameQueryParam(settings, url, queryData);
				
				/* Add specialty (sd) query param to settings.lhdResultsUrl.
				 * Note: sd is more important than tname.  Tname by itself doesn't seem to do anything.
				 */
				url = _this.buildSdQueryParam(settings, url, queryData);
				
				/* Add insurance param to settings.lhdResultsUrl */
				url = _this.buildInsuranceParam(settings, url);
				
				/* Add cf param to settings.lhdResultsUrl */
				url = _this.buildCfParam(settings, url);
				
				return url;
			}
			
			function renderLhdLink(url) {
				/* Append to DOM */
				$('.module.module-lhd-finder.editorial-destination').append('<div data-metrics-module="' + _this.metric +'"><a href="' + url + '" class="cf-find-docs" target="_top" data-metrics-link="sub">Find More Doctors</a><span class="cf-find-docs-arrow"></span></div>');
			}
		},
		/**
		 * Append the specialty parameter (tname) to the URL to LHD.
		 * These parameters come from the web form.  When submitted, these values go to the LHD application.
		 * Note: tname and ln query parameters cannot both be in the URL.
		 * Call this function only after the provider results have returned.
		 * @param settings LHD Care Finder settings object
		 * @param url URL that will be given the query parameters
		 * @param queryData Query data used in the provider service.
		 */
		buildSdQueryParam: function (settings, url, queryData) {
			webmd.debug('=$=$= Physician Directory Care Finder: buildSdQueryParam', settings, url, queryData);
			
			/* Some searches, especially for ad-driven ones, the query ends up with no speciality info (null).  If so, don't add the parameter. */
			if (queryData.Specialty !== null) {
				url = webmd.url.setParam('sd', queryData.Specialty.Id, url);
			}
			
			return url;
		},
		/**
		 * Append the specialty parameter (tname) to the URL to LHD.
		 * These parameters come from the web form.  When submitted, these values go to the LHD application.
		 * Note: tname and ln query parameters cannot both be in the URL.
		 * Call this function only after the provider results have returned.
		 * @param settings LHD Care Finder settings object
		 * @param url URL that will be given the query parameters
		 * @param queryData Query data used in the provider service.
		 */
		buildTnameQueryParam: function (settings, url, queryData) {
			webmd.debug('=$=$= Physician Directory Care Finder: buildTnameQueryParam', settings, url, queryData);
			
			/* Some searches, especially for ad-driven ones, the query ends up with no speciality info (null).  If so, don't add the parameter. */
			if (queryData.Specialty !== null) {
				url = webmd.url.setParam('tname', queryData.Specialty.ClinicalName, url);
			}
			
			return url;
		},
		/**
		 * Append the 'carefinder' (?) parameter (cf) to the URL to LHD.
		 * These parameters come from the web form.  When submitted, these values go to the LHD application.
		 * @param settings LHD Care Finder settings object
		 * @param url URL that will be given the query parameters
		 */
		buildCfParam: function (settings, url) {
			webmd.debug('=$=$= Physician Directory Care Finder: buildCfParam', settings, url);
			
			url = webmd.url.setParam('cf', 'true', url);
			
			return url;
		},
		/**
		 * Append the default insurance parameter (hp) to the URL to LHD.
		 * By default, this is an empty string since the default value of the search form was "Any Insurance"
		 * @param settings LHD Care Finder settings object
		 * @param url URL that will be given the query parameters
		 */
		buildInsuranceParam: function (settings, url) {
			webmd.debug('=$=$= Physician Directory Care Finder: buildInsuranceParam', settings, url);
			
			url = webmd.url.setParam('hp', '', url);
			
			return url;
		},
		/**
		 * Append the city, state, and zip query parameters to the URL to the URL to LHD.
		 * @param settings LHD Care Finder settings object
		 * @param url URL that will be given the query parameters
		 */
		buildLocationParam: function (settings, url) {
			webmd.debug('=$=$= Physician Directory Care Finder: buildLocationParam', settings, url);
			
			var _this = this;
			var data = '';
			
		},
		location: function (loc, el, callback, settings) {
			webmd.debug("=$=$= Physician Directory Care Finder: Location", settings.name, loc, el, callback, settings);
			var _this = this;
			var url;

			if (!el) {
				if (settings.$el) {
					el = settings.$el.find('input[name=loc]');
				} else {
					el = $(settings.target).find('input[name=loc]');
				}
			}
			if ((!loc || !loc.city || !loc.state || !loc.zip) && (!_this.loc || !_this.loc.city || !_this.loc.state || !_this.loc.zip) && _this.tries < 10) {
				_this.tries++;
				_this.getLocation(el, callback, settings);
			} else {
				if (loc && loc.city && loc.state && loc.zip) {
					_this.loc = loc;
				}
				el.val(_this.loc.city + ', ' + _this.loc.state + ' ' + _this.loc.zip);
				if (callback) {
					callback();
				}
			}
		},
		locationField: function (settings) {
			var _this = this;
			var locationSettings = {
					form: settings.$el.find('form'),
					field: settings.$el.find('form ' + settings.target + '-loc'),
					metric: _this.metric,
					mobile: _this.mobile,
					callback: {
						error: function (msg) {
							if (_this.mobile) {
								_this.locModule[settings.name].reset();
							}
						}
					}
				};

			if (_this.inIframe) {
				locationSettings.vertical = true;
			}

			if (!_this.locModule) {
				_this.locModule = {};
			}
			if (!_this.locModule[settings.name]) {
				_this.locModule[settings.name] = webmd.object(location);
				_this.locModule[settings.name].init(locationSettings);
			}
		},
		photo: function (settings, profile) {
			var _this = this;
			var photo = '';
			var temp;

			if (settings.images === 'true') {
				temp = {
					alt: this.fullName(profile),
					featured: ''
				};
				if (profile.Photo) {
					temp.photo = profile.Photo + '?resize=70px:*';
				} else if (profile.C_Photo) {
					temp.photo = profile.C_Photo + '?resize=70px:*';
				} else {
					switch (profile.Gender) {
						case 'M':
							temp.photo = image_server_url + '/webmd/consumer_assets/site_images/physician_directory/images/male.png?resize=70px:*';
							break;
						case 'F':
							temp.photo = image_server_url + '/webmd/consumer_assets/site_images/physician_directory/images/female.png?resize=70px:*';
							break;
						default:
							temp.photo = image_server_url + '/webmd/consumer_assets/site_images/physician_directory/images/unisex.png?resize=70px:*';
					}
				}
				if (profile.Featured) {
					temp.featured = '<em class="featured">Featured</em>';
				}

				photo = webmd.substitute(_this.resultPhotoTemplate, temp);
			}
			return photo;
		},
		populateForm: function (settings, el, resultdata) {
			webmd.debug("=$=$= Physician Directory Care Finder: Populate Form", settings.name, el, settings, resultdata);
			var _this = this;
			var query = settings.query;
			var validParams = _this.validParams;

			if (!query.cf) {
				query.cf = true;
			}
			if (typeof resultdata !== 'undefined') {
				/* If the PageBuilder module doesn't set */
				if (typeof query.sd === 'undefined' && typeof resultdata.QueryData.Specialty !== 'undefined' && resultdata.QueryData.Specialty !== null) {
					query.sd = resultdata.QueryData.Specialty.Id;
				} else if (typeof query.cond === 'undefined' && resultdata.QueryData.Conditions && resultdata.QueryData.Conditions.length > 0) {
					query.cond = resultdata.QueryData.Conditions[0].Condition.Id;
				} else if (typeof query.proc === 'undefined' && resultdata.QueryData.Procedures && resultdata.QueryData.Procedures.length > 0) {
					query.proc = resultdata.QueryData.Procedures[0].Procedure.Id;
				}
			}
			if (typeof el !== 'undefined' && el !== null) {
				query = webmd.url.getParams(el.attr('href'));
				if (query.sd) {
					query.sd = query.sd[0];
				}
				if (query.cond) {
					query.cond = query.cond[0];
				}
				if (query.proc) {
					query.proc = query.proc[0];
				}
				query.tname = query.tname[0];
			}
			query = $.extend(query, _this.loc, true);
			settings.$el.find('[name="sd"], [name="cond"], [name="proc"], [name="tname"]').remove();
			$.each(query, function (key, value) {
				if ($.inArray(key, validParams) > -1) {
					if (typeof query.tname === 'undefined' && resultdata && value) {
						if (key === 'sd') {
							if (resultdata.QueryData.Specialty && webmd.object.exists('QueryData.Specialty.ClinicalName', resultdata)) {
								query.tname = resultdata.QueryData.Specialty.ClinicalName;
							}
							if (typeof query.cond !== 'undefined') {
								query.cond = null;
							}
							if (typeof query.proc !== 'undefined') {
								query.proc = null;
							}
							settings.$el.find('[name="cond"]').remove();
							settings.$el.find('[name="proc"]').remove();
						} else if (key === 'cond') {
							query.tname = resultdata.QueryData.Conditions[0].Condition.Name;
							if (typeof query.proc !== 'undefined') {
								query.proc = null;
							}
							settings.$el.find('[name="sd"]').remove();
							settings.$el.find('[name="proc"]').remove();
						} else if (key === 'proc') {
							query.tname = resultdata.QueryData.Procedures[0].Procedure.Name;
							settings.$el.find('[name="sd"]').remove();
							settings.$el.find('[name="cond"]').remove();
						}
					}

					/* If the hidden field is not there, put it back in the DOM. */
					if (settings.$el.find('[name="' + key + '"]').length < 1 && value) {
						settings.$el.find('form').prepend('<input type="hidden" name="' + key + '" class="' + key + '" value="' + value + '" />');
					} else {
						settings.$el.find('[name="' + key + '"]').val(value);
					}
				}
			});
			
			if (query.tname === 'General Practice') {
				query.tname = '';
			}
			if (query.tname) {
				settings.$el.find('[name="ln"]').val(query.tname);
			}
		},
		rating: function (settings, profile) {
			var _this = this;
			var rating = '';
			var temp;

			if (settings.ratings === 'true' && profile.Ratings) {
				temp = {
						rating: Number(profile.Ratings.Criteria1),
						selected1: '',
						selected2: '',
						half2: '',
						selected3: '',
						half3: '',
						selected4: '',
						half4: '',
						selected5: '',
						half5: ''
					};

				// First Star
				if (temp.rating > 0) {
					temp.selected1 = ' class="selected"';
				}
				// Second Star
				if (temp.rating > 1.24 && temp.rating < 1.75) {
					temp.selected2 = ' class="selected half"';
					temp.half2 = '<i class="icon-halfstar" />';
				} else if (temp.rating > 1.74) {
					temp.selected2 = ' class="selected"';
				}
				// Third Star
				if (temp.rating > 2.24 && temp.rating < 2.75) {
					temp.selected3 = ' class="selected half"';
					temp.half3 = '<i class="icon-halfstar" />';
				} else if (temp.rating > 2.74) {
					temp.selected3 = ' class="selected"';
				}
				// Fourth Star
				if (temp.rating > 3.24 && temp.rating < 3.75) {
					temp.selected4 = ' class="selected half"';
					temp.half4 = '<i class="icon-halfstar" />';
				} else if (temp.rating > 3.74) {
					temp.selected4 = ' class="selected"';
				}
				// Fifth Star
				if (temp.rating > 4.24 && temp.rating < 4.75) {
					temp.selected5 = ' class="selected half"';
					temp.half5 = '<i class="icon-halfstar" />';
				} else if (temp.rating > 4.74) {
					temp.selected5 = ' class="selected"';
				}
				rating = webmd.substitute(_this.resultRatingTemplate, temp);
			}
			return rating;
		},
		render: function (settings, resultdata) {
			webmd.debug("=$=$= Physician Directory Care Finder: Render Module", settings.name, settings.$el, resultdata, settings);
			var _this = this;
			var results = resultdata.Providers;
			var data = {
					specialist: settings.specialist,
					inputid: 'l-' + settings.name,
					fullLocation: _this.titleCase(_this.loc.city) + ', ' + _this.loc.state.toUpperCase() + ' ' + _this.loc.zip,
					zip: _this.loc.zip,
					metric: _this.metric
				};

			if (results.length > 0) {
				if (_this.sensitiveTopic()) {
					webmd.debug("=$=$= Physician Directory Care Finder: SENSITIVE TOPIC: Abort 2", s_topic);
				} else {
					settings.$el.find('header h3, header h1').text(_this.headerText(settings, resultdata.QueryData));
					_this.results(settings, results);
					//_this.bindings(settings, resultdata);
					settings.$el.show({
						complete: function () {
							var i;
							var s = 0;
							var setup = function () {
									_this.bindings(settings, resultdata);
									// _this.resizeImages(settings);
									if (s > 3) {
										clearInterval(i);
									} else {
										s++;
									}
								};

							i = setInterval(setup, 300);

							if (window.matchMedia('(min-width: 40em)').matches) {
								$('.module-lhd-finder').css('overflow', 'visible');
							}

							// Class for OTT
							if (typeof lhdOTTclass !== 'undefined' && lhdOTTclass !== null && lhdOTTclass.length > 0) {
								settings.$el.addClass(lhdOTTclass);
								switch (lhdOTTclass) {
									case 'ott-a':
										s_md.prop16 = 'crfndr-b';
										break;
									default:
										break;
								}
							} else if (lhdOTTclass !== null) {
								s_md.prop16 = 'crfndr-ctl';
							}
						}
					});
				}
			} else {
				webmd.debug("=$=$= Physician Directory Care Finder: ERROR: No Results:", data, window.frameElement);
				settings.$el.hide();
				if (window.frameElement) {
					$(window.frameElement).add(window.parent.frameElement).css({
						'display': 'none'
					});
				}
				settings.$el.hide();
			}
		},
		renderTypeAhead: function (settings, query, data) {
			webmd.debug("=$=$= Physician Directory Care Finder: Render Type-Ahead", settings.name, query, data);
			var _this = this;
			var temp;
			var num;
			var sli;
			var cli;
			var pli;
			var loc = '';
			var noRes = 0;
			var resCnts = [];
			var totalRes = 0;
			var el = $(settings.target + '-ln');
			var width = Number(el.closest('fieldset input[name="ln"]').outerWidth());
			var div = $('<div id="physiciantypeahead" class="typeahead specialty condition procedure" />');
			var sul = $('<ul id="specialty_list" class="specialty" data-metrics-module="' + _this.metric + '-sp-ta" />');
			var cul = $('<ul id="condition_list" class="condition" data-metrics-module="' + _this.metric + '-cd-ta" />');
			var pul = $('<ul id="procedure_list" class="procedure" data-metrics-module="' + _this.metric + '-pr-ta" />');
			var templates = {
					core: {
						specialty: '<li><a href="/results?city=' + _this.loc.city + '&state=' + _this.loc.state + '&zip=' + _this.loc.zip + '&lat=' + _this.loc.lat + '&lon=' + _this.loc.lon + '&sd={spcid}&tname={tname}" data-metrics-link="{i}" data-spcid="{spcid}">{spc}</a></li>',
						condition: '<li><a href="/results?city=' + _this.loc.city + '&state=' + _this.loc.state + '&zip=' + _this.loc.zip + '&lat=' + _this.loc.lat + '&lon=' + _this.loc.lon + '&cond={cndid}&tname={tname}" data-metrics-link="{h}" data-cndid="{cndid}">{cond}</a></li>',
						procedure: '<li><a href="/results?city=' + _this.loc.city + '&state=' + _this.loc.state + '&zip=' + _this.loc.zip + '&lat=' + _this.loc.lat + '&lon=' + _this.loc.lon + '&proc={prcid}&tname={tname}" data-metrics-link="{g}" data-prcid="{prcid}">{proc}</a></li>'
					},
					mobile: {
						specialty: '<li><a href="/results?city=' + _this.loc.city + '&state=' + _this.loc.state + '&zip=' + _this.loc.zip + '&lat=' + _this.loc.lat + '&lon=' + _this.loc.lon + '&sd={spcid}&tname={tname}" data-metrics-link="{i}" data-spcid="{spcid}">{spc}</a></li>',
						condition: '<li><a href="/results?city=' + _this.loc.city + '&state=' + _this.loc.state + '&zip=' + _this.loc.zip + '&lat=' + _this.loc.lat + '&lon=' + _this.loc.lon + '&cond={cndid}&tname={tname}" data-metrics-link="{h}" data-cndid="{cndid}">{cond}</a></li>',
						procedure: '<li><a href="/results?city=' + _this.loc.city + '&state=' + _this.loc.state + '&zip=' + _this.loc.zip + '&lat=' + _this.loc.lat + '&lon=' + _this.loc.lon + '&proc={prcid}&tname={tname}" data-metrics-link="{g}" data-prcid="{prcid}">{proc}</a></li>'
					}
				};
			var highlight = function (string) {
					var start;
					var end;
					var temp;
					var substrings = [];
					var newstring = '';
					var applyTag = function (temp, q) {
							var start;
							var end;
							start = temp.toLowerCase().indexOf(q.toLowerCase());
							end = start + q.length;
							if ((start === 0 || start === 1) && temp.toString().indexOf('<strong>') < 0) {
								return temp.substring(0, start) + '<strong>' + temp.substring(start, end) + '</strong>' + temp.substring(end);
							} else {
								return temp;
							}
						};
					$(string.split(' ')).each(function () {
						temp = this;
						$(query.replace(/[^a-zA-Z0-9 \-\'\/]/g,' ').split(' ')).each(function () {
							if (this.length > 0) {
								temp = applyTag(temp, this.toString());
							}
							if (this.indexOf('\'\/') > -1) {
								$(this.toString().replace(/[^a-zA-Z0-9]/g,' ').split(' ')).each(function () {
									if (this.length > 0) {
										temp = applyTag(temp, this.toString());
									}
								});
							}
						});
						//webmd.debug(temp.toString());
						substrings.push(temp);
					});
					$.each(substrings, function (i) {
						newstring += this;
						if (i < (substrings.length - 1)) {
							newstring += ' ';
						}
					});
					return newstring;
				};

			if (_this.mobile) {
				temp = templates.mobile;
			} else {
				temp = templates.core;
			}
			
			$.each(data, function (k) {
				if ($(this).length > 0) {
					totalRes += $(this).length;
					resCnts.push($(this).length);
				}
			});

			// Trim number of typeahead results shown
			switch (resCnts.length) {
				case 4:
					num = 2;
					break;
				case 3:
					num = 3;
					break;
				case 2:
					num = 5;
					break;
				default:
					num = 10;
					break;
			}
			if (totalRes < 11) {
				num = 10;
			}
			
			// Clear results
			_this.ta = {};

			$(data.specialty).each(function (i) {
				if (i < num) {
					this.spc = this.text;
					this.spcid = this.id;
					this.addClass = '';
					this.i = (i + 1);
					this.tname = encodeURI(this.spc).replace('&', '%26').replace('/', '%2F');
					this.spc = highlight(this.spc);
					sli = webmd.substitute(temp.specialty, this);
					sul.append(sli);
				}
			});

			$(data.condition).each(function (h) {
				if (h < num) {
					this.cond = this.text;
					this.cndid = this.id;
					this.addClass =  '';
					this.h = (h + 1);
					this.tname = encodeURI(this.cond).replace('&', '%26').replace('/', '%2F');
					this.cond = highlight(this.cond);
					cli = webmd.substitute(temp.condition, this);
					cul.append(cli);
				}
			});

			$(data.procedure).each(function (g) {
				if (g < num) {
					this.proc = this.text;
					this.prcid = this.id;
					this.addClass = '';
					this.g = (g + 1);
					this.tname = encodeURI(this.proc).replace('&', '%26').replace('/', '%2F');
					this.proc = highlight(this.proc);
					pli = webmd.substitute(temp.procedure, this);
					pul.append(pli);
				}
			});

			//build div
			if (data.specialty && data.specialty.length > 0) {
				div.append('<h3 class="specialty">Specialties:</h3>');
				div.append(sul);
			}
			if (data.condition && data.condition.length > 0) {
				div.append('<h3 class="condition">Conditions:</h3>');
				div.append(cul);
			}
			if (data.procedure && data.procedure.length > 0) {
				div.append('<h3 class="procedure">Procedures:</h3>');
				div.append(pul);
			}

			if ($('form #physiciantypeahead').length > 0) {
				//update content
				$('form #physiciantypeahead').html(div.html());
			} else {
				$('.module-lhd-finder').css('overflow', 'visible');
				//insert content
				div.css({
					display: 'none',
					width: width + 'px',
				});
				if (_this.inIframe) {
					div.addClass('vertical');
					div.css({
						bottom: Number(el.closest('form').outerHeight() - el.position().top) + 'px',
						left: el.position().left + 'px'
					});
				} else {
					div.css({
						top: Number(el.position().top + el.outerHeight()) + 'px',
						left: el.position().left + 'px'
					});
				}
				el.after(div);
				if ($('html').hasClass('thin') && settings.type === 'footer') {
					el.closest('form').find('label:nth-of-type(2)').css('width', '10%');
				}
			}

			$('form #physiciantypeahead .specialty a, form #physiciantypeahead .condition a, form #physiciantypeahead .procedure a').on('click', function (e) {
				e.preventDefault();
				_this.populateForm(settings, $(this));
				//_this.followTypeahead($(this));
			});

			if (data.specialty && data.specialty.length < 1) {
				$('form #physiciantypeahead').find('.specialty').hide();
				noRes++;
			} else {
				$('form #physiciantypeahead').find('.specialty').show();
			}
			if (data.condition && data.condition.length < 1) {
				$('form #physiciantypeahead').find('.condition').hide();
				noRes++;
			} else {
				$('form #physiciantypeahead').find('.condition').show();
			}
			if (data.procedure && data.procedure.length < 1) {
				$('form #physiciantypeahead').find('.procedure').hide();
				noRes++;
			} else {
				$('form #physiciantypeahead').find('.procedure').show();
			}
			if ($('form #physiciantypeahead:hidden').length > 0 && $('form #physiciantypeahead').find('li').length > 0) {
				// show div
				$('form #physiciantypeahead').slideDown('fast');
			} else if ($('form #physiciantypeahead').find('li').length < 1) {
				el.trigger('clear-type-ahead');
			}
			el.trigger('results-rendered');
		},
		resizeIFrame: function (settings) {
			if (window.frameElement) {
				if (settings.type === 'banner') {
					settings.$el.css({
						'margin': '0'
					});
				}
				$(window.frameElement).add(window.parent.frameElement).css({
					'height': Number(settings.$el.outerHeight() + 1),
					'width': '100%',
					'margin': '0'
				});
			}
		},
		resizeImages: function (settings) {
			var _this = this;
			var $div;
			var collapseHeight = function (img) {
					var $temp;
					var adjustment;

					if ($(img).closest('div').find('.featured').length > 0) {
						$temp = $(img).closest('div').find('.featured');
						adjustment = $temp.height() + Number($temp.css('margin-top').replace(/\D/g, '')) + Number($temp.css('margin-bottom').replace(/\D/g, ''));
						//$(img).closest('div').find('.featured').width($(img).closest('div').width());
					} else {
						adjustment = 0;
					}
					$(img).closest('div').height(($(img).height() + adjustment));
				};

			if (!settings.count) {
				settings.count = 0;
			}
			if (settings.$el.find('img.image').length < 1 && settings.count < 10) {
				settings.count++;
				setTimeout(function () { _this.resizeImages(settings); _this.adjustSizes(settings, true); }, 500);
			} else {
				if (!settings.count) {
					settings.count = 0;
				}
				settings.$el.find('img.image').each(function (i, img) {
					$div = $(img).closest('div');
					if ($(img).width() > 0 && $(img).height() > 0 && $div.width() > 0 && $div.height() > 0) { // If the image is loaded
						if ($div.width() < Number($div.css('max-width').replace(/\D/g, ''))) {
							$div.width(Number($div.css('max-width').replace(/\D/g, '')));
						}
						if ($div.height() < Number($div.css('max-height').replace(/\D/g, ''))) {
							$div.height(Number($div.css('max-height').replace(/\D/g, '')));
						}
						if ($(img).width() !== $div.width() || $(img).height() !== $div.height()) {
							if ($(img).width() > $(img).height() || $(img).width() === $(img).height()) { // Landscape or Square
								$(img).width($div.width());
								if ($(img).width() > $(img).height()) {
									collapseHeight(img);
								}
							} else if ($(img).width() < $(img).height()) { // Portrait
								$(img).height($div.height());
							}
						} else if ($(img).height() < $div.height()) { // Landscape
							collapseHeight(img);
						}
					} else if (_this.count < 10) {
						_this.count++;
						setTimeout(function () { _this.resizeImages(); _this.adjustSizes(settings, true); }, 500);
						return false;
					}
				});
			}
		},
		results: function (settings, results) {
			webmd.debug("=$=$= Physician Directory Search: Build Results", settings.name, settings, results);
			var _this = this;
			var ul = settings.$el.find('.module-content ul');
			var li;
			var temp;
			var i;
			var loc;
			var s = 0;
			var build = function () {
					var sponsorTmpl = '';
					var sponsorIdentified = false; /* In the original code, the sponsor ID is passed with each provider to serve as an image sponsorship. We now only need to find one occurrence for the whole campaign. */
					
					s++;
					if (_this.loc && _this.loc.city) {
						clearInterval(_this.i);
						$.each(results, function (i) {
							if (this.PracticeLocations) {
								loc = this.PracticeLocations[0].Profile.Location;
							} else if (this.Practices) {
								loc = this.Practices[0].Location;
							} else {
								loc = {
									City: '',
									State: '',
									Zip: ''
								};
							}
							//webmd.debug(this);
							temp = {
								photo: _this.photo(settings, this.Profile),
								id: this.Profile.IntId,
								sponid: this.Profile.SponsorID || '',
								name: _this.fullName(this.Profile),
								specialties: _this.specialties(this.Specialties),
								featured: (this.Profile.Featured && settings.images !== 'true' && !settings.sponsored) ? '<em class="featured">Featured</em>' : '',
								rating: _this.rating(settings, this.Profile),
								location: this.PracticeLocations[0].Profile.PracticeName || '',
								address: this.PracticeLocations[0].Profile.Location.Addr1,
								address2: this.PracticeLocations[0].Profile.Location.Addr2,
								city: this.PracticeLocations[0].Profile.Location.City,
								state: this.PracticeLocations[0].Profile.Location.State,
								zip: this.PracticeLocations[0].Profile.Location.Zip,
								number: this.PracticeLocations[0].Profile.Phone[0].replace(/\D/g, ''),
								phone: (settings.editorialDestination === 'true') ? 'Call' : _this.formatPhone(this.PracticeLocations[0].Profile.Phone),
								book: _this.bookAppointmentLink(settings, this, (i + 1)),
								i: (i + 1),
								metric: _this.metric,
								url: _this.url(this.Profile, this.PracticeLocations[0].Profile)
							};
							if (temp.address2.length > 0) {
								temp.address2 += '<br />';
							}
							li = webmd.substitute(_this.resultTemplate, temp);
							ul.append(li);
							
							/* We only need to find the sponsor once */
							if ((this.Profile.SponsorID === _this.settings[_this.cfModuleName].sponsorId) && (sponsorIdentified === false)) {
								sponsorTmpl = _this.sponsorship(settings, this, _this.i);
								sponsorIdentified = true;
							}
						});
						
						/* The sponsorship text/logo from finder-sponsorship used to be associated with each provider.
						 * But now, that text/logo is moved to occupy the same spot as the PageBuilder implementation of the sponsor logo.
						 * Because the sponsorship ID is checked per provider, there is no way to do this out of the loop yet.
						 * * So, after the loop above we move the sponsorship to the correct place, just like the PageBuilder implementation.
						 * TODO: Rewrite sponsorship() function to allow the sponsorship to exist independently of the provider profile. Need to verify if provider search API guarantees that given an ABCo campaign with lpsg query param, the returned providers are actually part of that campaign.  Provider service may need modification.
						 */
						$('.module-lhd-finder .module-header').append(sponsorTmpl);
						
						if (_this.sensitiveTopic()) {
							webmd.debug("=$=$= Physician Directory Care Finder: SENSITIVE TOPIC: Abort 3", s_topic);
							settings.$el.remove();
						} else {
							settings.$el.show(1, function () {
								_this.resizeIFrame(settings);
								_this.adjustSizes(settings);
								if (typeof s_md !== 'undefined') {
									wmdPageLink(_this.metric + '-imp', { contextData : {
										'wb.pddoc':  _this.getProvIds(settings),
										'wb.icd' :  _this.getSponIds(settings, _this.metric + '-imp')
									}, prop16: s_md.prop16 });
								} else {
									webmd.debug("=$=$= Physician Directory Care Finder: ERROR: No Provider id metrics");
								}
								$(this).removeAttr('hidden').attr('aria-hidden', 'false');
							});
						}
					} else if (s > 3) {
						clearInterval(_this.i);
					}
				};

			ul.html(''); // clear list
			_this.i = setInterval(build, 300);
		},
		sensitiveTopic: function (override) {
			// Returns true if topic is sensitive unless overriden
			if (typeof override !== 'undefined') {
				this.sensitiveOverride = override;
			}
			if (typeof this.sensitiveOverride !== 'undefined' && this.sensitiveOverride.length > 0) {
				return false;
			} else {
				return (typeof s_topic !== 'undefined' && s_topic !== '' && Number(s_topic) > 6999 && Number(s_topic) < 8000);
			}
		},
		setSpecialist: function (settings, data) {
			var specialist = settings.specialist;

			if ((specialist === 'Doctors' || specialist === 'Doctor') && data.Specialty !== null && data.Specialty.PracticingName !== 'General Practitioner') {
				specialist = data.Specialty.PracticingName;
				if (typeof settings.query.tname === 'undefined') {
					settings.query.tname = data.Specialty.ClinicalName;
				}
			}
			if (specialist.lastIndexOf('s') !== (specialist.length - 1)) {
				specialist += 's';
			}
			return specialist;
		},
		specialties: function (array) {
			var list = '';

			$(array).each(function (i, value) {
				//webmd.debug(i, value);
				if (i > 0) {
					list += ', ';
				}
				list += value.Name;
			});

			return list;
		},
		sponsorship: function (settings, profile, i) {
			var _this = this;
			var attribution = '';
			var valid = false;
			var data;
			var preImageTmpl = '<img src="{image}" alt="{brandText}">';  // Basic template for image
			var temp = {
					url: '',
					image: '',
					metric: _this.metric,
					i: i,
					imageTmpl: ''
				};
				
			if (!settings.sponsored && profile.Profile.SponsorID && sponsorship[profile.Profile.SponsorID] && !sponsorship[profile.Profile.SponsorID].customLink) {
				data = sponsorship[profile.Profile.SponsorID];
				temp = $.extend(temp, data, true);
				temp.url = data.linkUrl; // Assuming always an external URL for a provider
				if (sponsorship[profile.Profile.SponsorID].image !== '') {
					// If there is a sponsor logo, add img element to final template.  Otherwise, do not add it.
					temp.image = image_server_url + data.image;
					temp.imageTmpl = webmd.substitute(preImageTmpl, temp);
				} else {
					temp.imageTmpl = '';
				}
				
				attribution = webmd.substitute(_this.resultSponsorTemplate, temp);
			}
			
			return attribution;
		},
		titleCase: function (string) {
			// Set title case
			return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		},
		url: function (profile, location) {
			var _this = this;
			var url = 'http://doctor.webmd.com/doctor/';

			// first
			if (profile.FirstName.length > 0) {
				url += profile.FirstName.replace(/[^a-zA-Z0-9\-]/g,'').toLowerCase();
			}
			// -last
			if (profile.LastName.length > 0) {
				url += '-' + profile.LastName.replace(/[^a-zA-Z0-9\-]/g,'').toLowerCase();
			}
			// -degree
			if (profile.Degrees.length > 0 && profile.Degrees[0].length > 0) {
				url += '-' + profile.Degrees[0].toLowerCase();
			}
			// -id
			if (profile.Id.length > 0) {
				url += '-' + profile.Id.toLowerCase();
			}
			url += '-overview?lid=' + location.IntId;

			return webmd.url.addLifecycleAndEnv(url);
		}
	};
	return webmd.object(module);
});
