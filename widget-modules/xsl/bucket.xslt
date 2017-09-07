<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output encoding="UTF-8" indent="yes" omit-xml-declaration="yes" method="xml"/>
	<!-- params -->
	<xsl:param name="image_server_url">
		<xsl:text>http://img.preview.webmd.com/dtmcms/preview</xsl:text>
	</xsl:param>
	<xsl:param name="moduletitle"/>
	<!-- properties -->
	<xsl:variable name="module_data" select="/webmd_rendition/content/wbmd_asset/webmd_module/module_data"/>
	<xsl:variable name="module_settings" select="/webmd_rendition/content/wbmd_asset/webmd_module/module_settings"/>
	<xsl:variable name="referenced_objects" select="/webmd_rendition/referenced_objects"/>
	<xsl:template match="/">
		<xsl:element name="div">
			<xsl:attribute name="id">
				<xsl:value-of select="$module_settings/title" />
			</xsl:attribute>
			<xsl:attribute name="class">
				<xsl:text>pd-bucket</xsl:text>
			</xsl:attribute>
			<!-- JavaScript -->
			<xsl:element name="script">
				<xsl:text><![CDATA[require(['pdmodules/1/bucket'], function (bucket) { var ]]></xsl:text>
				<xsl:call-template name="CleanVariable">
					<xsl:with-param name="inputValue" select="$module_settings/title" />
				</xsl:call-template>
				<xsl:text><![CDATA[ = webmd.object(bucket); ]]></xsl:text>
				<xsl:call-template name="CleanVariable">
					<xsl:with-param name="inputValue" select="$module_settings/title" />
				</xsl:call-template>
				<xsl:text><![CDATA[.init({target: '#]]></xsl:text>
				<xsl:value-of select="$module_settings/title" />
				<xsl:text><![CDATA[',name: ']]></xsl:text>
				<xsl:call-template name="CleanVariable">
					<xsl:with-param name="inputValue" select="$module_settings/title" />
				</xsl:call-template>
				<xsl:text><![CDATA[']]></xsl:text>
				<xsl:if test="string-length($module_data/links/link/action_text) &gt; 0">
					<xsl:text><![CDATA[,id: ]]></xsl:text>
					<xsl:value-of select="$module_data/links/link/action_text" />
				</xsl:if>
				<xsl:if test="string-length($module_data/descriptions/description/description_text) &gt; 0">
					<xsl:text><![CDATA[,number: ]]></xsl:text>
					<xsl:value-of select="$module_data/descriptions/description/description_text" />
				</xsl:if>
				<xsl:text><![CDATA[}); });]]></xsl:text>
			</xsl:element>
			<!-- Header -->
			<xsl:element name="div">
				<xsl:attribute name="class">
					<xsl:text>pd-header</xsl:text>
				</xsl:attribute>
				<xsl:element name="h4">
					<xsl:element name="a">
						<xsl:attribute name="href">
							<xsl:text>http://doctor.webmd.com/</xsl:text>
						</xsl:attribute>
						<xsl:attribute name="onclick">
							<xsl:call-template name="GetOnclickVal">
								<xsl:with-param name="tracking_val">
									<xsl:text>pd-wdgt-nrby_logo</xsl:text>
								</xsl:with-param>
							</xsl:call-template>
						</xsl:attribute>
						<xsl:attribute name="title">
							<xsl:text>WebMD Physician Finder</xsl:text>
						</xsl:attribute>
						<xsl:element name="span">
							<xsl:attribute name="class">
								<xsl:text>jawsonly</xsl:text>
							</xsl:attribute>
							<xsl:text>WebMD Physician Finder</xsl:text>
						</xsl:element>
					</xsl:element>
				</xsl:element>
				<xsl:element name="form">
					<xsl:attribute name="name">
						<xsl:text>pd-loc</xsl:text>
					</xsl:attribute>
					<xsl:element name="a">
						<xsl:attribute name="href">
							<xsl:text>javascript://</xsl:text>
						</xsl:attribute>
						<xsl:attribute name="onclick">
							<xsl:call-template name="GetOnclickVal">
								<xsl:with-param name="tracking_val">
									<xsl:text>pd-wdgt-nrby_lct</xsl:text>
								</xsl:with-param>
							</xsl:call-template>
						</xsl:attribute>
						<xsl:attribute name="class">
							<xsl:text>pd-loc-ex</xsl:text>
						</xsl:attribute>
						<xsl:attribute name="title">
							<xsl:text>Change Your Location</xsl:text>
						</xsl:attribute>
						<xsl:text>Change Your Location</xsl:text>
					</xsl:element>
					<xsl:element name="fieldset">
						<xsl:element name="input">
							<xsl:attribute name="type">
								<xsl:text>text</xsl:text>
							</xsl:attribute>
							<xsl:attribute name="name">
								<xsl:text>loc</xsl:text>
							</xsl:attribute>
							<xsl:attribute name="id">
								<xsl:value-of select="$module_settings/title" />
								<xsl:text>-loc</xsl:text>
							</xsl:attribute>
							<xsl:attribute name="value" />
						</xsl:element>
						<xsl:element name="input">
							<xsl:attribute name="type">
								<xsl:text>submit</xsl:text>
							</xsl:attribute>
							<xsl:attribute name="value" />
						</xsl:element>
					</xsl:element>
				</xsl:element>
			</xsl:element>
			<!-- Results -->
			<xsl:element name="div">
				<xsl:attribute name="class">
					<xsl:text>pd-results</xsl:text>
				</xsl:attribute>
				<xsl:element name="h5">
					<xsl:if test="string-length($module_data/module_title) &gt; 0"> 
						<xsl:value-of select="$module_data/module_title" />
					</xsl:if>
					<xsl:if test="string-length($module_data/module_title) = 0"> 
						<xsl:text>Physicians</xsl:text>
					</xsl:if>
					<xsl:text> in Your Area</xsl:text>
				</xsl:element>
				<xsl:element name="ul" />
			</xsl:element>
			<!-- Footer -->
			<xsl:element name="div">
				<xsl:attribute name="class">
					<xsl:text>pd-footer</xsl:text>
				</xsl:attribute>
				<xsl:element name="a">
					<xsl:attribute name="href">
						<xsl:text>http://doctor.webmd.com/results?sd=</xsl:text>
						<xsl:if test="string-length($module_data/links/link/action_text) &gt; 0"> 
							<xsl:value-of select="$module_data/links/link/action_text" />
						</xsl:if>
						<xsl:if test="string-length($module_data/links/link/action_text) = 0"> 
							<xsl:text>37</xsl:text>
						</xsl:if>
						<xsl:text>&amp;tname=</xsl:text>
						<xsl:if test="string-length($module_data/links/link/link_text) &gt; 0"> 
							<xsl:value-of select="$module_data/links/link/link_text" />
						</xsl:if>
						<xsl:if test="string-length($module_data/links/link/link_text) = 0"> 
							<xsl:text>General Practice</xsl:text>
						</xsl:if>
					</xsl:attribute>
					<xsl:attribute name="onclick">
						<xsl:call-template name="GetOnclickVal">
							<xsl:with-param name="tracking_val">
								<xsl:text>pd-wdgt-nrby_more</xsl:text>
							</xsl:with-param>
						</xsl:call-template>
					</xsl:attribute>
					<xsl:text>More </xsl:text>
					<xsl:if test="string-length($module_data/module_title) &gt; 0"> 
						<xsl:value-of select="$module_data/module_title" />
					</xsl:if>
					<xsl:if test="string-length($module_data/module_title) = 0"> 
						<xsl:text>Physicians</xsl:text>
					</xsl:if>
				</xsl:element>
			</xsl:element>
		</xsl:element>
	</xsl:template>
	<xsl:template name="GetOnclickVal">
		<xsl:param name="link_type"/>
		<xsl:param name="tracking_val"/>
		<xsl:text>return sl(this,'</xsl:text>
		<xsl:value-of select="$link_type"/>
		<xsl:text>','</xsl:text>
		<xsl:value-of select="$tracking_val"/>
		<xsl:text>');</xsl:text>
	</xsl:template>
	<xsl:template name="CleanVariable">
		<xsl:param name="inputValue" />
		<xsl:value-of select="translate($inputValue, translate($inputValue,'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789',''), '')" />
	</xsl:template>
</xsl:stylesheet>