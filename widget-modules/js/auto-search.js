define(['location_validation-lite'], function (lo) {
	var module,
		location = webmd.object(lo);

	module = {
		resultsdata: '',
		tries: 0,
		init: function (opts) {
			webmd.debug("=$=$= Physician Directory Auto Search: Initialize 6/12/2014 3:00 PM", opts);
			var self = this, temp,
				defaults = {
					id: '',
					specialist: 'Physician',
					name: 'pdsearch',
					number: 2,
					promo: '1',
					toggle: true,
					target: '.pd-search',
					template: '<div class="pd-search-rr promo-{promo}"><h5><a href="//doctor.webmd.com" onclick="return sl(this,\'\',\'{metric}_logo\');"><span class="jawsonly">WebMD Physician Directory</span></a></h5><h4>{specialist}&nbsp;in<br /><span class="location"><a class="loc">{location}</a><form name="geolocation" class="hidden"><input type="text" id="{inputid}" class="location" maxlength="255" name="loc" tabindex="2" value="{fullLocation}" autocomplete="off" placeholder="Enter Zip Code or City, State" data-key="false"><input type="submit" tabindex="3" value="" /></form></span></h4><div class="promo-results"><ul></ul><div class="promo-footer"><a href="{query}" onclick="return sl(this,\'\',\'{metric}_more\');" rel="nofollow">More {specialist}</a></div></div></div>',
					resulttemplate: '<li{addclass}><a href="{url}" onclick="return sl(this,\'\',\'{metric}_{i}\');">{name}</a><br />{city}, {state} {zip}</li>',
					metric: 'pd-wdgt-nrby',
					css: '/webmd/consumer_assets/site_images/amd_modules/pdmodules/1/auto-search.css',
					url: '/api/directories/Service.svc/ProviderSearch'
				};

			webmd.debug('!!=================================', s_topic, typeof s_topic);
			if (self.sensitiveTopic(opts.sensitiveOverride)) {
				webmd.debug("=$=$= Physician Directory Auto Search: SENSITIVE TOPIC: Abort", s_topic);
			} else {
				if (!self.settings) {
					self.settings = [];
				}
				temp = $.extend(defaults, opts, true);
				self.settings[temp.name] = temp;
				self.template = self.settings[temp.name].template;
				self.resulttemplate = self.settings[temp.name].resulttemplate;
				self.metric = self.settings[temp.name].metric;

				self.$el = $(self.settings[temp.name].target);
				self.settings[temp.name].promo = Math.floor((Math.random()*4)+1);
				self.location(null, null, function () { self.get(self.settings[temp.name]); });
			}
		},

		/* SUPPORT FUNCTIONS */
		addQuery: function (url, settings) {
			url = this.specialty(url, settings);
			url = webmd.url.setParam('pagesize', (settings.number * 3), url);
			url = webmd.url.setParam('distance', '5000', url);
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
			return url;
		},
		distance: function (distance) {
			// Format distance to 2 decimal points
			return parseInt(distance * 100, 10)/100;
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
			webmd.debug("=$=$= Physician Directory Auto Search: Get", settings, settings.target);
			var self = this,
				url = self.addQuery(settings.url, settings).replace('preview.', '');
			
			if (!self.loc) {
				self.location(null, null, function () { self.get(settings); });
			} else {
				$.ajax({
					url: url,
					dataType: 'json',
					success: function (data) {
						webmd.debug("=$=$= Physician Directory Auto Search: Results:", data);
						self.submitting = false;
						data = data.data;
						if (data && data.Providers && !reload) {
							self.render(settings, data);
						} else if (data && data.Providers) {
							self.results(self.randomProviders(settings, data.Providers));
						} else {
							webmd.debug("=$=$= Physician Directory Auto Search: ERROR: No Results:", data);
							self.$el.hide();
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						webmd.debug("=$=$= Physician Directory Auto Search: ERROR: AJAX: Results", jqXHR, textStatus, errorThrown);
						self.submitting = false;
						self.$el.hide();
					}
				});
			}
		},
		getCSS: function (url) {
			webmd.debug("=$=$= Physician Directory Auto Search: Get CSS", url);
			if (url.indexOf('http') < 0) {
				url = image_server_url + url;
			}
			webmd.load({css: url});
		},
		getLocation: function (el, callback) {
			webmd.debug("=$=$= Physician Directory Auto Search: Get Location", el);
			var self = this, data,
				defaultLoc = { city: 'New York', state: 'NY', zip: '10001', lat: '', lon: '', s: 501 };

			//self.location({ city: 'New York', state: 'NY', zip: '10001' }, el);
			$.ajax({
				url: '/api/directories/Service.svc/location',
				dataType: 'json',
				success: function (response) {
					webmd.debug("=$=$= Physician Directory Auto Search: Data", response);
					if (response.status === 'fail' || response.data.City === '' || response.data.State === '' || response.data.Zip === '') {
						self.location(defaultLoc, el, callback);
					} else {
						data = response.data;
						self.location({ city: data.City, state: data.State, zip: data.Zip, lat: data.Latitude, lon: data.Longitude, s: data.DMAId }, el, callback);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					webmd.debug("=$=$= Physician Directory Auto Search: ERROR: AJAX: Location", jqXHR, textStatus, errorThrown);
					self.location(defaultLoc, el, callback);
				}
			});
		},
		location: function (loc, el, callback) {
			webmd.debug("=$=$= Physician Directory Auto Search: Location", loc, el);
			var self = this, url;

			if (!el) {
				if (self.$el) {
					el = self.$el.find('input[name=loc]');
				} else {
					el = $(self.settings.target).find('input[name=loc]');
				}
			}
			/*if (!self.locModule) {
				self.locModule = webmd.object(location);
				self.locModule.init({
					form: el.closest('form'),
					field: el,
					metric: 'pdw'
				});
			}*/
			if ((!loc || !loc.city || !loc.state || !loc.zip) && (!self.loc || !self.loc.city || !self.loc.state || !self.loc.zip) && self.tries < 10) {
				self.tries++;
				self.getLocation(el, callback);
			} else {
				if (loc && loc.city && loc.state && loc.zip) {
					self.loc = loc;
				}
				el.val(self.loc.city + ', ' + self.loc.state + ' ' + self.loc.zip);
				if (callback) {
					callback();
				}
			}
		},
		moreQuery: function (url, settings, data) {
			webmd.debug(data.QueryData.Specialty);
			var self = this;
			url = self.addQuery(url, settings);
			url = webmd.url.deleteParam('pagesize', url);
			url = webmd.url.deleteParam('distance', url);
			url = webmd.url.deleteParam('topic', url);
			url = webmd.url.deleteParam('sc', url);
			if (data.QueryData.Specialty) {
				url = webmd.url.setParam('sd', data.QueryData.Specialty.Id, url);
				url = webmd.url.setParam('tname', data.QueryData.Specialty.ClinicalName, url);
			}
			return url;
		},
		randomProviders: function (settings, data) {
			webmd.debug("=$=$= Physician Directory Auto Search: Random Results", settings, data, data.length);
			var temp = [], n, i;
			if (data.length > settings.number) {
				for (i = 0; i < settings.number; i++) {
					n = Math.floor(Math.random() * data.length);
					//webmd.debug(n, data[n]);
					if (data[n]) {
						temp.push(data[n]);
						data.splice(n, 1);
					} else {
						i--;
					}
				}
			} else {
				temp = data;
			}
			return temp;
		},
		render: function (settings, resultdata) {
			webmd.debug("=$=$= Physician Directory Auto Search: Render Module", settings, resultdata);
			var self = this,
				results = self.randomProviders(settings, resultdata.Providers),
				data = {
					specialist: settings.specialist,
					promo: settings.promo,
					spid: settings.id,
					inputid: 'l-' + settings.name,
					location: self.titleCase(self.loc.city) + ', ' + self.loc.state.toUpperCase(),
					fullLocation: self.titleCase(self.loc.city) + ', ' + self.loc.state.toUpperCase() + ' ' + self.loc.zip,
					zip: self.loc.zip,
					metric: self.metric,
					query: self.moreQuery(webmd.url.addLifecycleAndEnv('//doctor.webmd.com/results').replace('preview.',''), settings, resultdata)
				};

			// Get CSS for module
			if (settings.css) {
				self.getCSS(settings.css);
			}

			self.$el.hide();
			if (results.length > 0) {
				if ((data.specialist === 'Physicians' || data.specialist === 'Physician') && resultdata.QueryData.Specialty !== null) {
					data.specialist = resultdata.QueryData.Specialty.PracticingName;
				}
				if (data.specialist.lastIndexOf('s') !== (data.specialist.length - 1)) {
					data.specialist += 's';
				}
				if (self.loc.city.length > 17) {
					if (self.loc.city.length < 21) {
						data.location = self.loc.city;
					} else {
						data.location = 'Your Area';
					}
				}
				if (self.sensitiveTopic()) {
					webmd.debug("=$=$= Physician Directory Auto Search: SENSITIVE TOPIC: Abort 2", s_topic);
				} else {
					self.$el.append(webmd.substitute(self.template, data));
					wmdPageLink(self.metric + '_' + settings.promo);
					self.results(results);
					// Bindings
						if (!self.locModule) {
							self.locModule = webmd.object(location);
							self.locModule.init({
								form: self.$el.find('form'),
								field: self.$el.find('form .location'),
								metric: self.metric,
								mobile: self.mobile,
								revert: function () {
									if (settings.toggle) {
										self.$el.find('.location a').removeClass('hidden');
										self.$el.find('.location form').addClass('hidden');
									}
								},
								callback: {
									error: function (msg) {
										if (self.mobile) {
											self.locModule.reset();
										}
									}
								}
							});
						}
						self.$el.find('.location a').on('click', function (e) {
							wmdPageLink(self.metric + '_lct');
							if (settings.toggle) {
								$(this).addClass('hidden');
								self.$el.find('form').removeClass('hidden');
							}
						});
						self.$el.find('.location form input[type=text]').on('blur', function (e) {
							//webmd.debug("BLUR 1");
							clearTimeout(self.locModule.t);
							self.locModule.validateField($(this).find('input[type=text]'), false, true);
							//$(this).closest('form').addClass('hidden');
							//self.$el.find('.location a').removeClass('hidden');
						});
						self.$el.find('.location form').on('submit', function (e) {
							//webmd.debug("SUBMIT");
							e.preventDefault();
							self.locModule.validateField($(this).find('input[type=text]'), false, true);
						});
						self.$el.find('.location form').on('location-update', function (e) {
							webmd.debug('================================== update location!!!!!', settings.name, this);
							var loc,
								resultUrl = self.$el.find('.promo-footer a').attr('href');
							if (!self.submitting) {
								self.submitting = true;
								if (settings.toggle) {
									$(this).addClass('hidden');
								}
								self.loc = self.locModule.loc;
								loc = self.loc.city + ', ' + self.loc.state;
								if (self.loc.city.length > 17) {
									if (self.loc.city.length < 21) {
										location = self.loc.city;
									} else {
										location = 'Your Area';
									}
								}
								self.$el.find('.location a').html(loc).removeClass('hidden');
								self.$el.find('.location input[type=text]').val(self.loc.city + ', ' + self.loc.state + ' ' + self.loc.zip);
								resultUrl = webmd.url.setParam('city', self.loc.city, resultUrl);
								resultUrl = webmd.url.setParam('state', self.loc.state, resultUrl);
								resultUrl = webmd.url.setParam('zip', self.loc.zip, resultUrl);
								self.$el.find('.promo-footer a').attr('href', resultUrl);
								// trigger reload of results
								self.get(settings, true);
							}
						});
				}
			}
		},
		results: function (results) {
			webmd.debug("=$=$= Physician Directory Search: Build Results", results);
			var self = this,
				ul = self.$el.find('.promo-results ul'),
				li, temp, i, loc, s = 0,
				build = function () {
					s++;
					if (self.loc && self.loc.city) {
						clearInterval(self.i);
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
							temp = {
								i: (i + 1),
								name: self.fullName(this.Profile),
								distance: self.distance(this.Distance),
								s: (Number(self.distance(this.Distance)) === 1) ? '' : 's',
								city: this.PracticeLocations[0].Profile.Location.City,
								state: this.PracticeLocations[0].Profile.Location.State,
								zip: this.PracticeLocations[0].Profile.Location.Zip,
								metric: self.metric,
								addclass: '',
								url: self.url(this.Profile, this.PracticeLocations[0].Profile)
							};
							if (temp.i === 1) {
								temp.addclass = ' class="first odd"';
							} else if (temp.i % 2 !== 0) {
								temp.addclass = ' class="odd"';
							}
							li = webmd.substitute(self.resulttemplate, temp);
							ul.append(li);
						});
						if (self.sensitiveTopic()) {
							webmd.debug("=$=$= Physician Directory Auto Search: SENSITIVE TOPIC: Abort 3", s_topic);
							self.$el.remove();
						} else {
							ul.find('li').on('click', function () {
								wmdTrack($(this).find('a').attr('onclick').split('\'')[3]);
								window.location.href = $(this).find('a').attr('href');
							});
							self.$el.show();
						}
					} else if (s > 3) {
						clearInterval(self.i);
					}
				};

			ul.html(''); // clear list
			self.i = setInterval(build, 300);
		},
		sensitiveTopic: function (override) {
			// Returns true if topic is sensitive unless overriden
			if (typeof ovverride !== 'undefined') {
				this.sensitiveOverride = override;
			}
			if (this.sensitiveOverride === 'true') {
				return false;
			} else {
				return (typeof s_topic !== 'undefined' && s_topic !== '' && Number(s_topic) > 6999 && Number(s_topic) < 8000);
			}
		},
		specialty: function (url, settings) {
			if (settings.id) {
				url = webmd.url.setParam('sd', settings.id, url);
			} else if (settings.condition) {
				url = webmd.url.setParam('sc', settings.condition, url);
			} else if (typeof s_topic !== 'undefined' && s_topic !== '') {
				url = webmd.url.setParam('topic', s_topic, url);
			} else {
				url = webmd.url.setParam('sd', '37', url);
			}
			return url;
		},
		titleCase: function (string) {
			// Set title case
			return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		},
		url: function (profile, location) {
			var self = this,
				url = 'http://doctor.webmd.com/doctor/';

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
			//webmd.debug(webmd.url.addLifecycleAndEnv(url).replace('preview.',''));
			return webmd.url.addLifecycleAndEnv(url).replace('preview.','');
		}
	};
	return webmd.object(module);
});
