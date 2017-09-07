<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

	<xsl:output method="html" encoding="UTF-8" version="1.0" indent="yes" omit-xml-declaration="yes" standalone="yes" />

	<!-- GLOBAL PARAMS AND VARIABLES -->
		<xsl:param name="image_server_url">
			<xsl:text>http://img.webmd.com/dtmcms/live</xsl:text>
		</xsl:param>
		<xsl:param name="prefix">
			<xsl:text>www</xsl:text>
		</xsl:param>
		<xsl:param name="domain"></xsl:param>
		<xsl:param name="base_url">
			<xsl:text>http://</xsl:text>
			<xsl:value-of select="$prefix"></xsl:value-of>
			<xsl:text>.</xsl:text>
			<xsl:value-of select="$domain"></xsl:value-of>
		</xsl:param>
		<!-- properties --> 
		<xsl:variable name="module_data" select="/webmd_rendition/content/wbmd_asset/webmd_module/module_data" />
		<xsl:variable name="module_settings" select="/webmd_rendition/content/wbmd_asset/webmd_module/module_settings" />
		<xsl:variable name="referenced_objects" select="/webmd_rendition/referenced_objects" />

	<!-- CORE MODULE -->
		<xsl:template match="/">
			<!-- Display a "Continue Reading Below" text (in all caps) if this is an Editorial Destinations page -->
			<xsl:if test="($module_data/descriptions/description/description_text[text() = 'editorialDestination|true'])">
				<xsl:element name="div">
					<xsl:attribute name="class">
						<xsl:text>edit-dest-continue-reading</xsl:text>
					</xsl:attribute>
					<xsl:text>Continue Reading Below</xsl:text>
				</xsl:element>
			</xsl:if>
			<xsl:element name="aside">
				<xsl:attribute name="hidden" />
				<xsl:attribute name="aria-hidden">
					<xsl:text>true</xsl:text>
				</xsl:attribute>
				<xsl:attribute name="class">
					<xsl:text>module module-lhd-finder </xsl:text>
					<xsl:value-of select="$module_data/module_title" />
					<xsl:if test="not($module_data/descriptions/description/description_text[text() = 'images|true']) or not($module_data/descriptions/description/description_text)">
						<xsl:text> no-images</xsl:text>
					</xsl:if>
					<xsl:if test="string-length($module_data/body_images/body_image/source/@path) &gt; 0">
						<xsl:text> sponsored</xsl:text>
					</xsl:if>
					<xsl:if test="$module_data/descriptions/description/description_text = 'expandable'">
						<xsl:if test="not(contains($module_data/module_title,'mobile'))">
							<xsl:text> open</xsl:text>
						</xsl:if>
						<xsl:if test="contains($module_data/module_title,'mobile')">
							<xsl:text> closed</xsl:text>
						</xsl:if>
					</xsl:if>
				</xsl:attribute>
				<xsl:attribute name="id">
					<xsl:value-of select="$module_settings/title" />
				</xsl:attribute>
				<xsl:attribute name="data-metrics-module">
					<xsl:value-of select="$module_settings/title" />
				</xsl:attribute>

				<!--HEADER-->
				<xsl:element name="header">
					<xsl:attribute name="class">
						<xsl:text>module-header</xsl:text>
					</xsl:attribute>

					<!--CLOSE BUTTON-->
					<xsl:if test="$module_data/descriptions/description/description_text = 'expandable'">
						<xsl:element name="a">
							<xsl:attribute name="href">
								<xsl:text>javascript://</xsl:text>
							</xsl:attribute>
							<xsl:attribute name="class">
								<xsl:text>close-btn</xsl:text>
							</xsl:attribute>
							<xsl:text>close </xsl:text>
							<xsl:element name="i">
								<xsl:attribute name="class">
									<xsl:text>icon-close</xsl:text>
								</xsl:attribute>
							</xsl:element>
						</xsl:element>
					</xsl:if>

					<!--Title-->
					<xsl:element name="h3">
						<xsl:text>Doctors Near You</xsl:text>
					</xsl:element><!--JS Inject: {Specialists} {Who Treat} {Condition} in {City}, {ST} {Zip} -->
					
					<!--Attribution/Sponsor Logo-->
					<xsl:if test="string-length($module_data/body_images/body_image/source/@path) &gt; 0 and $module_data/module_title != 'center'">
						<xsl:element name="div">
							<xsl:attribute name="class">
								<xsl:text>sponsor-logo</xsl:text>
							</xsl:attribute>
							<xsl:element name="span">
								<xsl:attribute name="class">
									<xsl:text>sponsor-tag sponsor-prefix-text</xsl:text>
								</xsl:attribute>
								<xsl:text>From our sponsor</xsl:text>
							</xsl:element>
							<xsl:element name="div">
								<xsl:attribute name="class">
									<xsl:text>sponsor-legal-disclaimer</xsl:text>
								</xsl:attribute>
								<xsl:text>Content under this heading is from or created on behalf of the named sponsor. This content is not subject to the WebMD Editorial Policy and is not reviewed by the WebMD Editorial department for accuracy, objectivity or balance.</xsl:text>
							</xsl:element>
							<xsl:if test="$module_data/descriptions/description/description_text[contains(text(),'text|')]">
								<xsl:call-template name="AttributionLink">
									<xsl:with-param name="string" select="$module_data/descriptions/description/description_text[contains(text(),'text|')]" />
								</xsl:call-template>
							</xsl:if>
							<xsl:element name="img">
								<xsl:attribute name="src">
									<xsl:value-of select="$image_server_url" />
									<xsl:value-of select="$module_data/body_images/body_image/source/@path" />
								</xsl:attribute>
								<xsl:attribute name="alt">
									<xsl:value-of select="$module_data/body_images/body_image/source/@alt" />
								</xsl:attribute>
							</xsl:element>
						</xsl:element>
					</xsl:if>

					<xsl:if test="$module_data/descriptions/description/description_text = 'expandable'">
						<xsl:element name="span">
							<xsl:text>tap to expand</xsl:text>
						</xsl:element>
					</xsl:if>
				</xsl:element>

				<!-- RESULTS -->
				<xsl:element name="div">
					<xsl:attribute name="class">
						<xsl:text>module-content</xsl:text>
					</xsl:attribute>
					<xsl:element name="ul">
						<!--JS Inject ===========================|
						<li class="result">
							//If Photo Exists
							<img class="image" src="{provider-photo}" />
							<h4>{Title} {First Name} {MI.} {Last Name}, {Degrees}</h4>
							<p>{Specialty List}</p>
							<i class="featured">Featured</i>
	
							//If Ratings
							<div class="star-rating">
							<span class="rating overall" data-rating>
								<i>
									<a href="{provider url}" class="star" onclick="return sl(this,'nw','[$module_settings/title]_more');">
										<i class="icon-star">
										</i>
									</a>
								</i>
								<i>
									<a href="{provider url}" class="star" onclick="return sl(this,'nw','[$module_settings/title]_more');">
										<i class="icon-star">
										</i>
									</a>
								</i>
								<i>
									<a href="{provider url}" class="star" onclick="return sl(this,'nw','[$module_settings/title]_more');">
										<i class="icon-star">
										</i>
									</a>
								</i>
								<i>
									<a href="{provider url}" class="star" onclick="return sl(this,'nw','[$module_settings/title]_more');">
										<i class="icon-star">
										</i>
									</a>
								</i>
								<i>
									<a href="{provider url}" class="star" onclick="return sl(this,'nw','[$module_settings/title]_more');">
										<i class="icon-star">
										</i>
									</a>
								</i>
							</span>								
						</li>
						/END JS Inject-->
					</xsl:element>
					<!--DISCLAIMER-->
					<!--<xsl:element name="div">-->
						<!--<xsl:attribute name="class">-->
							<!--<xsl:text>legal-disclaimer</xsl:text>-->
						<!--</xsl:attribute>-->
						<!--<xsl:element name="p">-->
							<!--<xsl:text>WebMD does not endorse specific physicians.</xsl:text>-->
						<!--</xsl:element>-->
					<!--</xsl:element>-->
					
				</xsl:element>

				<!-- FOOTER -->
				<xsl:element name="footer">
					<!--FORM-->
					<xsl:if test="$module_data/links/link_bullet = 'true'">
						<xsl:element name="form">
							<xsl:attribute name="class">
								<xsl:text>pd-search-form</xsl:text>
							</xsl:attribute>
							<xsl:attribute name="action">
								<xsl:text>//doctor.webmd.com/results</xsl:text>
							</xsl:attribute>
							<!--Hidden Fields-->
							<xsl:element name="fieldset">
								<xsl:attribute name="class">
									<xsl:text>hidden-fields</xsl:text>
								</xsl:attribute>
								<xsl:element name="input">
									<xsl:attribute name="type">
										<xsl:text>hidden</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="class">
										<xsl:text>city</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="name">
										<xsl:text>city</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="value">
										<xsl:text></xsl:text>
									</xsl:attribute>
								</xsl:element>
								<xsl:element name="input">
									<xsl:attribute name="type">
										<xsl:text>hidden</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="class">
										<xsl:text>state</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="name">
										<xsl:text>state</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="value">
										<xsl:text></xsl:text>
									</xsl:attribute>
								</xsl:element>
								<xsl:element name="input">
									<xsl:attribute name="type">
										<xsl:text>hidden</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="class">
										<xsl:text>zip</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="name">
										<xsl:text>zip</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="value">
										<xsl:text></xsl:text>
									</xsl:attribute>
								</xsl:element>
								<xsl:element name="input">
									<xsl:attribute name="type">
										<xsl:text>hidden</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="class">
										<xsl:text>lat</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="name">
										<xsl:text>lat</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="value">
										<xsl:text></xsl:text>
									</xsl:attribute>
								</xsl:element>
								<xsl:element name="input">
									<xsl:attribute name="type">
										<xsl:text>hidden</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="class">
										<xsl:text>lon</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="name">
										<xsl:text>lon</xsl:text>
									</xsl:attribute>
									<xsl:attribute name="value">
										<xsl:text></xsl:text>
									</xsl:attribute>
								</xsl:element>
							</xsl:element>
							<xsl:element name="div">
								<xsl:attribute name="class">
									<xsl:text>search-form</xsl:text>
								</xsl:attribute>
								<xsl:if test="$module_data/module_title != 'banner'">
									<!--WebMD Finder Logo-->
									<xsl:call-template name="FinderLogo" />
								</xsl:if>

								<!-- Enclosure to allow display: flex -->
								<xsl:element name="div">
									<xsl:attribute name="class">
										<xsl:text>doctor-loc-ins-encl</xsl:text>
									</xsl:attribute>

									<!--Doctor-->
									<xsl:element name="fieldset">
										<xsl:attribute name="class">
											<xsl:text>ln-field</xsl:text>
										</xsl:attribute>
										<xsl:element name="label">
											<xsl:attribute name="for">
												<xsl:value-of select="$module_settings/title" />
												<xsl:text>-ln</xsl:text>
											</xsl:attribute>
											<xsl:text>Specialty/ Condition/ Procedure</xsl:text>
										</xsl:element>
										<xsl:element name="input">
											<xsl:attribute name="type">
												<xsl:text>text</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="id">
												<xsl:value-of select="$module_settings/title" />
												<xsl:text>-ln</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="class">
												<xsl:text>name</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="maxlength">
												<xsl:text>255</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="name">
												<xsl:text>ln</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="tabindex">
												<xsl:text>1</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="value">
												<xsl:text><![CDATA[]]></xsl:text>
											</xsl:attribute>
											<xsl:attribute name="autocomplete">
												<xsl:text>off</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="placeholder">
												<xsl:text>Doctors</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="data-key">
												<xsl:text>true</xsl:text>
											</xsl:attribute>
										</xsl:element>
									</xsl:element>

									<!--Location-->
									<xsl:element name="fieldset">
										<xsl:attribute name="class">
											<xsl:text>loc-field</xsl:text>
										</xsl:attribute>
										<xsl:element name="label">
											<xsl:attribute name="for">
												<xsl:value-of select="$module_settings/title" />
												<xsl:text>-loc</xsl:text>
											</xsl:attribute>
											<xsl:text>Location</xsl:text>
										</xsl:element>
										<xsl:element name="input">
											<xsl:attribute name="type">
												<xsl:text>text</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="id">
												<xsl:value-of select="$module_settings/title" />
												<xsl:text>-loc</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="class">
												<xsl:text>name</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="maxlength">
												<xsl:text>255</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="name">
												<xsl:text>loc</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="tabindex">
												<xsl:text>2</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="value">
												<xsl:text><![CDATA[]]></xsl:text>
											</xsl:attribute>
											<xsl:attribute name="autocomplete">
												<xsl:text>off</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="placeholder">
												<xsl:text>City, State</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="data-key">
												<xsl:text>true</xsl:text>
											</xsl:attribute>
										</xsl:element>
									</xsl:element>

									<!--Insurance-->
									<xsl:element name="div">
										<xsl:attribute name="class">
											<xsl:text>ins-encl</xsl:text>
										</xsl:attribute>
										<xsl:element name="fieldset">
											<xsl:attribute name="class">
												<xsl:text>ins-field</xsl:text>
											</xsl:attribute>
											<xsl:element name="label">
												<xsl:attribute name="for">
													<xsl:value-of select="$module_settings/title" />
													<xsl:text>-hp</xsl:text>
												</xsl:attribute>
												<xsl:text>Insurance</xsl:text>
											</xsl:element>
											<xsl:element name="select">
												<xsl:attribute name="id">
													<xsl:value-of select="$module_settings/title" />
													<xsl:text>-hp</xsl:text>
												</xsl:attribute>
												<xsl:attribute name="class">
													<xsl:text>hp</xsl:text>
												</xsl:attribute>
												<xsl:attribute name="name">
													<xsl:text>hp</xsl:text>
												</xsl:attribute>
												<xsl:element name="option">
													<xsl:attribute name="selected">
														<xsl:text><![CDATA[selected]]></xsl:text>
													</xsl:attribute>
													<xsl:attribute name="disabled">
														<xsl:text><![CDATA[disabled]]></xsl:text>
													</xsl:attribute>
													<xsl:attribute name="value">
														<xsl:text><![CDATA[]]></xsl:text>
													</xsl:attribute>
													<xsl:attribute name="data-default">
														<xsl:text><![CDATA[Any Insurance]]></xsl:text>
													</xsl:attribute>
													<xsl:text><![CDATA[Any Insurance]]></xsl:text>
												</xsl:element>
											</xsl:element>
										</xsl:element>

										<!-- Submit Button -->
										<xsl:element name="input">
											<xsl:attribute name="type">
												<xsl:text>submit</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="role">
												<xsl:text>button</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="class">
												<xsl:text>button</xsl:text>
											</xsl:attribute>
											<xsl:attribute name="value">
												<xsl:text>Search Doctors</xsl:text>
											</xsl:attribute>
										</xsl:element>
									</xsl:element><!--</div>-->
								</xsl:element><!--</div>-->
							</xsl:element><!--</div>-->
						</xsl:element><!--</form>-->
					</xsl:if>
					<xsl:if test="$module_data/module_title = 'banner'">
						<xsl:element name="div">
							<!--WebMD Finder Logo-->
							<xsl:call-template name="FinderLogo" />
						</xsl:element>
					</xsl:if>
				</xsl:element>
			</xsl:element>

			<!-- JavaScript -->
			<xsl:element name="script">
				<xsl:attribute name="id">
					<xsl:text>js-</xsl:text>
					<xsl:value-of select="$module_settings/title" />
				</xsl:attribute>
				<xsl:text><![CDATA[require(['pdmodules/1/finder'], ]]></xsl:text>
				<xsl:text><![CDATA[function (finder) { var ]]></xsl:text>
				<xsl:call-template name="CleanVariable">
					<xsl:with-param name="inputValue" select="$module_settings/title" />
				</xsl:call-template>
				<xsl:text><![CDATA[ = webmd.object(finder); ]]></xsl:text>
				<xsl:call-template name="CleanVariable">
					<xsl:with-param name="inputValue" select="$module_settings/title" />
				</xsl:call-template>
				<xsl:text><![CDATA[.init({"target": "#]]></xsl:text>
				<xsl:value-of select="$module_settings/title" />
				<xsl:text><![CDATA[", "type": "]]></xsl:text>
				<xsl:value-of select="$module_data/module_title" />
				<xsl:text><![CDATA[", "name": "]]></xsl:text>
				<xsl:call-template name="CleanVariable">
					<xsl:with-param name="inputValue" select="$module_settings/title" />
				</xsl:call-template>
				<xsl:text><![CDATA["]]></xsl:text>
				<xsl:if test="$module_data/links/link_bullet = 'true'">
					<xsl:text><![CDATA[, "form": true]]></xsl:text>
				</xsl:if>
				<xsl:for-each select="$module_data/descriptions/description">
					<xsl:if test="string-length(description_text) &gt; 0">
						<xsl:choose>
							<xsl:when test="description_text = 'expandable'">
								<xsl:text><![CDATA[, "expandable": true]]></xsl:text>
							</xsl:when>
							<!-- Will eventually use "sponsorId|NNNNN" string in Description field in PB to transmit sponsor ID -->
							<xsl:when test="substring-before(description_text,'|') = 'sponsorId'">
								<xsl:text><![CDATA[, "sponsorId": "]]></xsl:text>
								<xsl:value-of select="substring-after(description_text,'|')" />
								<xsl:text><![CDATA["]]></xsl:text>
							</xsl:when>
							<xsl:otherwise>
								<xsl:text><![CDATA[, "]]></xsl:text>
								<xsl:value-of select="substring-before(description_text,'|')" />
								<xsl:text><![CDATA[": "]]></xsl:text>
								<xsl:value-of select="substring-after(description_text,'|')" />
								<xsl:text><![CDATA["]]></xsl:text>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:if>
				</xsl:for-each>
				<xsl:if test="string-length($module_data/links/link/link_text) &gt; 0">
					<xsl:text><![CDATA[, "query": {]]></xsl:text>
						<xsl:for-each select="$module_data/links/link">
							<xsl:if test="position() &gt; 1">
								<xsl:text><![CDATA[, ]]></xsl:text>
							</xsl:if>
							<xsl:text><![CDATA["]]></xsl:text>
							<xsl:value-of select="link_text" />
							<xsl:text><![CDATA[": "]]></xsl:text>
							<xsl:value-of select="action_text" />
							<xsl:text><![CDATA["]]></xsl:text>
						</xsl:for-each>
					<xsl:text><![CDATA[}]]></xsl:text>
				</xsl:if>
				<!-- Will eventually deprecate this in body images to use "sponsorId|NNNNN" string in Description field in PB -->
				<xsl:if test="string-length($module_data/body_images/body_image/override_text) &gt; 0">
					<xsl:text><![CDATA[, "sponsorId": "]]></xsl:text>
					<xsl:value-of select="$module_data/body_images/body_image/override_text" />
					<xsl:text><![CDATA["]]></xsl:text>
				</xsl:if>
				<xsl:text><![CDATA[}); });]]></xsl:text>
			</xsl:element>
		</xsl:template>
	
	<!-- SUPPORT TEMPLATES -->
		<!-- Attributon Link -->
		<xsl:template name="AttributionLink">
			<xsl:param name="string" />
			<xsl:element name="a">
				<xsl:attribute name="href">
					<xsl:if test="not(contains(substring-after(substring-after($string,'|'),'|'),'javascript://'))">
						<xsl:value-of select="$base_url" />
					</xsl:if>
					<xsl:value-of select="substring-after(substring-after($string,'|'),'|')" />
				</xsl:attribute>
				<xsl:attribute name="data-module-link">
					<xsl:text>spon</xsl:text>
				</xsl:attribute>
				<xsl:value-of select="substring-before(substring-after($string,'|'),'|')" />
			</xsl:element>
		</xsl:template>
		<!-- Turn string into proper variable name -->
		<xsl:template name="CleanVariable">
			<xsl:param name="inputValue" />
			<xsl:value-of select="translate($inputValue, translate($inputValue,'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789',''), '')" />
		</xsl:template>
		<!-- Logo -->
		<xsl:template name="FinderLogo">
			<xsl:element name="span">
				<xsl:attribute name="class">
					<xsl:text>finder-logo</xsl:text>
				</xsl:attribute>
				<xsl:element name="strong">
					<xsl:text>Find a Doctor</xsl:text>
				</xsl:element>
				<xsl:text><![CDATA[ ]]></xsl:text>
				<xsl:element name="span">
					<xsl:text>from</xsl:text>
				</xsl:element>
				<xsl:text><![CDATA[ ]]></xsl:text>
				<xsl:element name="i">
					<xsl:element name="span">
						<xsl:attribute name="class">
							<xsl:text>jawsonly</xsl:text>
						</xsl:attribute>
						<xsl:text>WebMD</xsl:text>
					</xsl:element>
				</xsl:element>
				<xsl:text>Physician Directory</xsl:text>
			</xsl:element>
		</xsl:template>

</xsl:stylesheet>
