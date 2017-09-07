define(
	function () {
		var module = {
				/* Examples:
					"abco_demo": {
						"image": "/webmd/consumer_assets/site_images/logos/webmd/web/logo_your-brand_89x32.png",
						"brandText": "Your Brand - abco_mhhou16",
						"linkUrl": "http://www.cnn.com",
						"linkText": "Sponsored by"
					},
					// CUSTOM LINKS
					// Text Link, no image
					"abco_demo": {
						"brandText": "Your Brand - Provspnsraje1",
						"linkUrl": "http://www.cnn.com",
						"linkText": "Custom Appointments 1",
						"customLink": "true"
					},
					// Linked Image, no text
					"abco_demo": {
						"image": "/webmd/consumer_assets/site_images/logos/webmd/web/logo_your-brand_89x32.png",
						"brandText": "Your Brand - 0527Sponsor",
						"linkUrl": "http://www.cnn.com",
						"customLink": "true"
					},
					// Linked image and text
					"abco_demo": {
						"image": "/webmd/consumer_assets/site_images/logos/webmd/web/logo_your-brand_89x32.png",
						"brandText": "Your Brand - Provraj123",
						"linkUrl": "http://www.cnn.com",
						"linkText": "Custom Appointments 2",
						"customLink": "true"
					},
					// Text only, no link
					"abco_demo": {
						"brandText": "Your Brand - provspon",
						"linkText": "Custom Appointments 3",
						"customLink": "true"
					},
					// Image only, no link
					"abco_demo": {
						"image": "/webmd/consumer_assets/site_images/logos/webmd/web/logo_your-brand_89x32.png",
						"brandText": "Your Brand - xxxyyy",
						"customLink": "true"
					},
					// Image and text, no link
					"abco_demo": {
						"image": "/webmd/consumer_assets/site_images/logos/webmd/web/logo_your-brand_89x32.png",
						"brandText": "Your Brand - prov1",
						"linkText": "Custom Appointments 5",
						"customLink": "true"
					}
				*/

				/* Custom Link */
				"abco-demo": {
					"image": "/webmd/consumer_assets/site_images/logos/webmd/web/logo_your-brand_89x32.png",
					"brandText": "Your Brand",
					"linkText": "",
					"linkUrl": "http://www.cnn.com/{npi}?zip={zip}",
					"customLink": "true"
				},
				"Rajesh123": {
					"image": "",
					"brandText": "Your Brand",
					"linkText": "YourBrandText",
					"linkUrl": "http://www.yahoo.com/{npi}?zip={zip}",
					"customLink": "true"
				},

				/* Adtest16 for ABCo ad server testing */ 
				"abco-adtest16": {
					"image": "/webmd/consumer_assets/site_images/logos/webmd/web/logo_your-brand_89x32.png",
					"brandText": "Your Brand",
					"linkText": "",
					"linkUrl": "javascript://"
				},

				/* ABCo Campaigns */
				"abco-uncch16": {
					"image": "/webmd/consumer_assets/site_images/logos/client/unc_health_care/lhd-site_logo_unc-health-care_122x46.png",
					"brandText": "UNC Health Care",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"abco-tjuphil16": {
					"image": "/webmd/consumer_assets/site_images/logos/client/jefferson_health/lhd-site_logo_jefferson-health_230x39.jpeg",
					"brandText": "Jefferson Health",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"abco-abiphil16": {
					"image": "/webmd/consumer_assets/site_images/logos/client/jefferson_health/lhd-site_logo_abington_230x59.png",
					"brandText": "Abington Jefferson Health",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"abco-mhhou16": {
					"image": "/webmd/consumer_assets/site_images/logos/client/memorial_hermann/lhd-site_logo_memorial-hermann_148x43.png",
					"brandText": "Memorial Hermann",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"abco-uconn16": {
					"image": "/webmd/consumer_assets/site_images/logos/client/uconn/lhd-site_logo_uconn_230x46.png",
					"brandText": "UCONN Health",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"abco-bswhite16": {
					"image": "/webmd/consumer_assets/site_images/logos/client/bsw/lhd-site_logo_bsw_230x41.png",
					"brandText": "Baylor Scott & White Health",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"schcal16": {
					"image": "/webmd/consumer_assets/site_images/logos/client/stanford_childrens_health/lhd-site_logo_stanford-childrens-health_230x49.png",
					"brandText": "Stanford Children's Health",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"abco-nwstn16": {
					"image": "/webmd/consumer_assets/site_images/logos/client/northwestern_medicine/lhd-site_logo_northwestern-medicine_230x46.gif",
					"brandText": "Northwestern Medicine",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"abco-fromil17": {
					"image": "/webmd/consumer_assets/site_images/logos/client/froedtert_hospital/lhd-site_logo_froedtert_189x46.png",
					"brandText": "Froedtert Hospital",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"abco-centden17": {
					"image": "/webmd/consumer_assets/site_images/logos/client/centura_health/lhd-site_logo_centura-health_243x37.png",
					"brandText": "Centura Health",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"abco-digphx17": {
					"image": "/webmd/consumer_assets/site_images/logos/client/dignity_health/lhd-site_logo_dignity-health_243x57.png",
					"brandText": "Dignity Health",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-cohca-onco": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/cityofhope/CityofHope-Logo-150x40.png",
					"brandText": "City of Hope",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-hssnyc-ortho": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/hss/HSS-logo-165x60.png",
					"brandText": "Hospital for Special Surgery",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-hssnyc-foot": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/hss/HSS-logo-165x60.png",
					"brandText": "Hospital for Special Surgery",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-hssnyc-hand": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/hss/HSS-logo-165x60.png",
					"brandText": "Hospital for Special Surgery",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-hssnyc-joint": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/hss/HSS-logo-165x60.png",
					"brandText": "Hospital for Special Surgery",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-hssnyc-spine": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/hss/HSS-logo-165x60.png",
					"brandText": "Hospital for Special Surgery",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-hssnyc-sports": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/hss/HSS-logo-165x60.png",
					"brandText": "Hospital for Special Surgery",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-stansf-cardio": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/stanford/stanford_logo_128x128.png",
					"brandText": "Stanford Health Care",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-stansf-obgyn": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/stanford/stanford_logo_128x128.png",
					"brandText": "Stanford Health Care",
					"linkText": "",
					"linkUrl": "javascript://"
				},
				"cf-stansf-primary": {
					"image": "/webmd/consumer_assets/site_images/logos/client/carefinder/stanford/stanford_logo_128x128.png",
					"brandText": "Stanford Health Care",
					"linkText": "",
					"linkUrl": "javascript://"
				}
			};
			
		return webmd.object(module);
	}
);