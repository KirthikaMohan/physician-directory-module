define(['location_validation-lite'], function (lo) {
	var module,
		location = webmd.object(lo);

	module = {
		template: '<div class="pd-search-rr promo-{promo}"><h5><a href="//doctor.webmd.com" onclick="return sl(this,\'\',\'pd-wdgt-nrby_logo\');"><span class="jawsonly">WebMD Physician Directory</span></a></h5><h4>Find a {specialist} in <span class="location">{location}</span></h4><form id="pd-rr" action="//doctor.webmd.com/results" method="get"><input type="hidden" id="city" name="city" value="{city}" /><input type="hidden" id="state" name="state" value="{state}" /><input type="hidden" id="zip" name="zip" value="{zip}" /><input type="hidden" id="lat" name="lat" value="{lat}" /><input type="hidden" id="lon" name="lon" value="{lon}" /><input type="hidden" id="tname" name="tname" value="General Practice" /><fieldset><select id="sd" name="sd"><option value="3" data-tname="Allergy &amp; Immunology">Asthma &amp; Allergy Specialist</option><option value="5" data-tname="Anesthesiology">Anesthesiologist</option><option value="12" data-tname="Cardiology">Cardiologist</option><option value="1031" data-tname="Chiropractor">Chiropractor</option><option value="25" data-tname="Dermatology">Dermatologist</option><option value="67" data-tname="Otolaryngology">Ear, Nose and Throat Doctor</option><option value="30" data-tname="Emergency Medicine">Emergency Medicine</option><option value="29" data-tname="Endocrinology, Diabetes &amp; Metabolism">Endocrinologist</option><option value="31" data-tname="Family Medicine">Family Physician</option><option value="34" data-tname="Gastroenterology">Gastroenterologist</option><option value="37" data-tname="General Practice" selected="selected">General Practicioner</option><option value="99" data-tname="Surgery">General Surgery</option><option value="35" data-tname="Internal Medicine - Geriatrics">Geriatrician</option><option value="40" data-tname="Hematology/Oncology">Hematologist/Oncologist</option><option value="43" data-tname="Infectious Disease">Infectious Disease Specialist</option><option value="44" data-tname="Internal Medicine">Internist</option><option value="52" data-tname="Neurology">Neurologist</option><option value="61" data-tname="Obstetrics &amp; Gynecology">Obstetrician &amp; Gynecologist</option><option value="65" data-tname="Ophthalmology">Ophthalmologist</option><option value="66" data-tname="Orthopaedic Surgery">Orthopaedic Surgeon</option><option value="1169" data-tname="Pain Management">Pain Management Doctor</option><option value="69" data-tname="Pediatrics">Pediatrician</option><option value="91" data-tname="Plastic Surgery">Plastic Surgeon</option><option value="81" data-tname="Physical Medicine &amp; Rehabilitation">Physical Therapist</option><option value="94" data-tname="Psychiatry">Psychiatrist</option><option value="72" data-tname="Pulmonary Disease">Pulmonologist</option><option value="97" data-tname="Radiation Oncology">Radiation Oncologist</option><option value="1193" data-tname="Radiology">Radiologist</option><option value="96" data-tname="Rheumatology">Rheumatologist</option><option value="165" data-tname="Sleep Medicine">Sleep Specialist</option><option value="101" data-tname="Sports Medicine">Sports Medicine Physician</option><option value="103" data-tname="Urology">Urologist</option></select><button type="submit" class="webmd-btn webmd-btn-pr webmd-btn-xs">Go</button></fieldset></form></div>',
		metric: 'pd-wdgt-nrby',
		tries: 0,
		init: function (opts) {
			webmd.debug("=$=$= Physician Directory Search: Initialize 2/2/2016 - sprint-26", opts);
			var self = this, temp,
				defaults = {
					id: '',
					specialist: 'Physician',
					name: 'pdsearch',
					number: 3,
					promo: '1',
					target: '.pd-search',
					url: '/api/directories/Service.svc/ProviderSearch'
				};

			if (!self.settings) {
				self.settings = [];
			}
			temp = $.extend(defaults, opts, true);
			self.settings[temp.name] = temp;

			self.$el = $(self.settings[temp.name].target);
			self.settings[temp.name].promo = Math.floor((Math.random()*4)+1);
			self.metric += '_' + self.settings[temp.name].promo;
			self.location(null, null, function () { self.render(self.settings[temp.name]); });
		},
		render: function (settings) {
			webmd.debug("=$=$= Physician Directory Search: Render Module", settings);
			var self = this,
				data = {
					specialist: settings.specialist,
					promo: settings.promo,
					spid: settings.id,
					location: self.titleCase(self.loc.city) + ', ' + self.loc.state.toUpperCase(),
					city: self.loc.city,
					state: self.loc.state,
					zip: self.loc.zip,
					lat: '', //self.loc.lat, TEMP until api is fixed
					lon: '' //self.loc.lon TEMP until api is fixed
				};
			if (data.city.length > 17) {
				if (data.city.length < 21) {
					data.location = self.loc.city;
				} else {
					data.location = 'Your Area';
				}
			}
			self.$el.append(webmd.substitute(self.template, data));
			//self.initTypeahead(settings);
			// Bindings
				self.$el.find('[name=sd]').on('change', function (e) {
					self.$el.find('[name=tname]').val($(this).find('[value=' + $(this).val() + ']').data('tname'));
				});
				self.$el.find('form').on('submit', function (e) {
					wmdTrack(self.metric);
					return self.validateDoctorForm($(this), e);
				});
		},
		titleCase: function (string) {
			return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		},
		validateDoctorForm: function (form, e) {
			webmd.debug("=/=/= PhysicianDirectory: Validate Doctor Form", form);
			var self = this;

			if (form.find('[name=zip]').val() !== '' || (form.find('[name=city]').val() !== '' && form.find('[name=state]').val() !== '')) {
				if (self.mobile && !form.find('.modify').is(':visible')) {
					self.setForm(self.dom.cookie.form);
				}
				return true;
			} else {
				if (location.loc.city !== '' && location.loc.state !== '' && location.loc.zip !== '') {
					form.find('[name=city]').val(location.loc.city);
					form.find('[name=state]').val(location.loc.state);
					form.find('[name=zip]').val(location.loc.zip);
				}
				if (form.find('[name=zip]').val() !== '' || (form.find('[name=city]').val() !== '' && form.find('[name=state]').val() !== '')) {
					return true;
				} else {
					self.dom.geoSrch.on('location-update', function () {
						form.submit();
					});
					location.validateField(self.dom.geoSrch);
					return false;
				}
			}
			// catch-all in case something goes wrong, should never get here
			return false;
		},
		location: function (loc, el, callback) {
			webmd.debug("=$=$= Physician Directory Search: Location", loc, el);
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
		getLocation: function (el, callback) {
			webmd.debug("=$=$= Physician Directory Search: Get Location", el);
			var self = this, data,
				defaultLoc = { city: 'New York', state: 'NY', zip: '10001', lat: '', lon: '', s: 501 };

			//self.location({ city: 'New York', state: 'NY', zip: '10001' }, el);
			$.ajax({
				url: '/api/directories/Service.svc/location',
				dataType: 'json',
				success: function (response) {
					webmd.debug(response);
					if (response.status === 'fail' || response.data.City === '' || response.data.State === '' || response.data.Zip === '') {
						self.location(defaultLoc, el, callback);
					} else {
						data = response.data;
						self.location({ city: data.City, state: data.State, zip: data.Zip, lat: data.Latitude, lon: data.Longitude, s: data.DMAId }, el, callback);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					webmd.debug("=$=$= Physician Directory Search: ERROR: AJAX: Location", jqXHR, textStatus, errorThrown);
					self.location(defaultLoc, el, callback);
				}
			});
		}
	};
	return webmd.object(module);
});