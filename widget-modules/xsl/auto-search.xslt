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
				<xsl:text>pd-search</xsl:text>
			</xsl:attribute>
			<!-- JavaScript -->
			<xsl:element name="script">
				<xsl:text><![CDATA[require(['pdmodules/1/search'], ]]></xsl:text>
				<xsl:text><![CDATA[function (search) { var ]]></xsl:text>
				<xsl:call-template name="CleanVariable">
					<xsl:with-param name="inputValue" select="$module_settings/title" />
				</xsl:call-template>
				<xsl:text><![CDATA[ = webmd.object(search); ]]></xsl:text>
				<xsl:call-template name="CleanVariable">
					<xsl:with-param name="inputValue" select="$module_settings/title" />
				</xsl:call-template>
				<xsl:text><![CDATA[.init({target: '#]]></xsl:text>
				<xsl:value-of select="$module_settings/title" />
				<xsl:text><![CDATA[', name: ']]></xsl:text>
				<xsl:call-template name="CleanVariable">
					<xsl:with-param name="inputValue" select="$module_settings/title" />
				</xsl:call-template>
				<xsl:text><![CDATA[']]></xsl:text>
				<xsl:if test="string-length($module_data/links/link/action_text) &gt; 0">
					<xsl:text><![CDATA[, id: ]]></xsl:text>
					<xsl:value-of select="$module_data/links/link/action_text" />
				</xsl:if>
				<xsl:if test="string-length($module_data/links/link/link_bullet) = 'true'">
					<xsl:text><![CDATA[, sensitiveOverride: ]]></xsl:text>
					<xsl:value-of select="$module_data/links/link/link_bullet" />
				</xsl:if>
				<xsl:if test="string-length($module_data/descriptions/description/description_text) &gt; 0">
					<xsl:text><![CDATA[, number: ]]></xsl:text>
					<xsl:value-of select="$module_data/descriptions/description/description_text" />
				</xsl:if>
				<xsl:if test="string-length($module_data/module_title) &gt; 0">
					<xsl:text><![CDATA[, specialist: ']]></xsl:text>
					<xsl:value-of select="$module_data/module_title" />
					<xsl:text><![CDATA[']]></xsl:text>
				</xsl:if>
				<xsl:text><![CDATA[}); });]]></xsl:text>
			</xsl:element>
		</xsl:element>
	</xsl:template>
	<xsl:template name="CleanVariable">
		<xsl:param name="inputValue" />
		<xsl:value-of select="translate($inputValue, translate($inputValue,'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789',''), '')" />
	</xsl:template>
</xsl:stylesheet>