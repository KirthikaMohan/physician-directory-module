define(['location_validation-lite'], function (lo) {
	var module,
		location = webmd.object(lo);

	module = {
		template: '<li{lastclass}><a href="{url}" onclick="return sl(this,\'\',\'pd-wdgt-nrby_{i}\');">{name}</a><br /><strong>{specialty}</strong><br />{distance} miles from {city}, {state}</li>',
		init: function (opts) {
			webmd.debug("=$=$= Physician Directory Bucket: Initialize", opts);
			var self = this, temp,
				defaults = {
					id: 37,
					name: 'pdbucket',
					number: 4,
					target: '.pd-bucket',
					url: '/api/directories/Service.svc/ProviderSearch'
				};
			webmd.debug("3/20/2014");
			if (!self.settings) {
				self.settings = [];
			}
			temp = $.extend(defaults, opts, true);
			self.settings[temp.name] = temp;

			self.$el = $(self.settings[temp.name].target);
			self.$el.find('.pd-footer a').attr('href', webmd.url.addLifecycleAndEnv(self.$el.find('.pd-footer a').attr('href')).replace('preview.',''));
			self.location(null, null, function () { self.get(self.settings[temp.name]); });

			// Bindings
				self.$el.find('.pd-loc-ex').on('click', function (e) {
					wmdPageLink($(this).attr('onclick').split('\'')[3]);
					$(this).siblings('fieldset').show();
				});
				self.$el.find('form').on('submit', function (e) {
					e.preventDefault();
					$(this).find('input[name=loc]').blur();
				});
				self.$el.on('location-update', function (e, data) {
					webmd.debug('REFRESH RESULTS!!!', self.settings[$(this).attr('id').replace(/[^a-zA-Z0-9]/g,'')], data);
					var temp = this;
					if (!data.run) {
						data.run = true;
						$('.pd-bucket').each(function () {
							if ($(this).attr('id') !== self.$el.attr('id')) {
								$(this).trigger('location-update', data);
							}
						});
					}
					self.location(data, $(temp).find('input[name=loc]'), function () { self.get(self.settings[$(temp).attr('id').replace(/[^a-zA-Z0-9]/g,'')]); });
				});
		},
		get: function (settings) {
			webmd.debug("=$=$= Physician Directory Bucket: Get", settings, settings.target);
			var self = this,
				url = self.addQuery(settings.url, settings).replace('preview.', '');

			webmd.debug(url);
			if (!self.loc) {
				self.location(null, null, function () { self.get(settings); });
			} else {
				$.ajax({
					url: url,
					dataType: 'json',
					success: function (data) {
						data = data.data;
						if (data && data.Providers) {
							self.results(data.Providers);
						} else {
							webmd.debug("=$=$= Physician Directory Bucket: ERROR: No Results:", data);
							self.$el.hide();
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						webmd.debug("=$=$= Physician Directory Bucket: ERROR: AJAX: Results", jqXHR, textStatus, errorThrown);
						self.$el.hide();
					}
				});
			}
		},
		addQuery: function (url, settings) {
			url = webmd.url.setParam('sd', settings.id, url);
			url = webmd.url.setParam('pagesize', settings.number, url);
			// Location
			webmd.debug(this.loc);
			if (this.loc && this.loc.city && this.loc.state && this.loc.zip) {
				url = webmd.url.setParam('city', this.loc.city, url);
				url = webmd.url.setParam('state', this.loc.state, url);
				url = webmd.url.setParam('zip', this.loc.zip, url);
			}
			return url;
		},
		results: function (results) {
			webmd.debug("=$=$= Physician Directory Bucket: Build Results", results);
			var self = this,
				ul = self.$el.find('ul'),
				li, temp, i, s = 0,
				build = function () {
					s++;
					if (self.loc && self.loc.city) {
						clearInterval(self.i);
						$.each(results, function (i) {
							temp = {
								i: (i + 1),
								name: self.fullName(this.Profile),
								specialty: this.Specialties[0].ConsumerName || this.Profile.Specialties[0].ConsumerName,
								distance: self.distance(this.Distance),
								city: self.loc.city,
								state: self.loc.state,
								lastclass: '',
								url: self.url(this.Profile)
							};
							if (temp.i === results.length) {
								temp.lastclass = ' class="last"';
							}
							li = webmd.substitute(self.template, temp);
							ul.append(li);
						});
						ul.find('li').on('click', function () {
							wmdTrack($(this).find('a').attr('onclick').split('\'')[3]);
							window.location.href = $(this).find('a').attr('href');
						});
					} else if (s > 3) {
						clearInterval(self.i);
					}
				};

			ul.html(''); // clear list
			self.i = setInterval(build, 300);
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
		url: function (profile) {
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
			url += '-overview';
			//webmd.debug(webmd.url.addLifecycleAndEnv(url).replace('preview.',''));
			return webmd.url.addLifecycleAndEnv(url).replace('preview.','');
		},
		distance: function (distance) {
			// Format distance to 2 decimal points
			return parseInt(distance * 100, 10)/100;
		},
		location: function (loc, el, callback) {
			webmd.debug("=$=$= Physician Directory Bucket: Location", loc, el);
			var self = this, url;

			if (!el) {
				if (self.$el) {
					el = self.$el.find('input[name=loc]');
				} else {
					el = $(self.settings.target).find('input[name=loc]');
				}
			}
			if (!self.locModule) {
				self.locModule = webmd.object(location);
				self.locModule.init({
					form: el.closest('form'),
					field: el,
					metric: 'pdw'
				});
			}
			if (!loc && (!self.loc || !self.loc.city || !self.loc.state || !self.loc.zip)) {
				self.getLocation(el, callback);
			} else {
				if (loc && loc.city && loc.state && loc.zip) {
					self.loc = loc;
				}
				// Set input value
				el.val(self.loc.city + ', ' + self.loc.state + ' ' + self.loc.zip);
				// Update more link
				url = el.closest('.pd-bucket').find('.pd-footer a').attr('href');
				url = webmd.url.setParam('city', self.loc.city, url);
				url = webmd.url.setParam('state', self.loc.state, url);
				url = webmd.url.setParam('zip', self.loc.zip, url);
				el.closest('.pd-bucket').find('.pd-footer a').attr('href', url);
				// Hide fieldset
				el.closest('fieldset').hide();
				if (callback) {
					callback();
				}
			}
		},
		getLocation: function (el, callback) {
			webmd.debug("=$=$= Physician Directory Bucket: Get Location", el);
			var self = this;

			//self.location({ city: 'New York', state: 'NY', zip: '10001' }, el);
			$.ajax({
				url: '/api/directories/Service.svc/location',
				dataType: 'json',
				success: function (data) {
					webmd.debug("==================== ", data);
					if (data.status === 'fail') {
						self.location({ city: 'New York', state: 'NY', zip: '10001' }, el);
					} else {
						data = data.data;
						self.location({ city: data.City, state: data.State, zip: data.Zip }, el, callback);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					webmd.debug("=$=$= Physician Directory Bucket: ERROR: AJAX: Location", jqXHR, textStatus, errorThrown);
					self.location({ city: 'New York', state: 'NY', zip: '10001' }, el, callback);
				}
			});
		}
	};
	return webmd.object(module);
});