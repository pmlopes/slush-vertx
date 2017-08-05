{{#if project_info.package}}package {{ project_info.package }};

{{/if}}import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.MultiMap;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer
import io.vertx.core.http.CaseInsensitiveHeaders;
import io.vertx.ext.web.client.HttpRequest;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;

import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Base64;

public class ApiClient {
    private var client: WebClient

{{#forOwn security_schemas}}{{#and (compare (get "type" .) '==' 'http') (compare (get "type" .) '==' 'basic')}}    private lateinit var {{sanitized_schema_name}}_username: String
    private lateinit var {{sanitized_schema_name}}_password: String
{{/and}}{{#or (and (compare type '==' 'http') (compare type '==' 'bearer')) (compare type '==' 'apiKey') (compare type '==' 'oauth2') (compare type '==' 'openIdConnect')}}    private lateinit var {{sanitized_schema_name}}_token: String
{{/or}}{{/forOwn}}

    private lateinit var cookieParams: MultiMap

    internal constructor(vertx: Vertx, host: String, port: Int) {
        client = WebClient.create(vertx, WebClientOptions().setDefaultHost(host).setDefaultPort(port))
        cookieParams = CaseInsensitiveHeaders()
    }

    internal constructor(client: WebClient) {
        this.client = client
        cookieParams = CaseInsensitiveHeaders()
    }

    {{#forOwn operations}}
    {{#each functions}}
    /**
     * Call {{ ../operationId }} with {{#if json}}Json body{{else if form}}form {{contentType}} body{{else if stream}}{{contentType}} stream body{{else if buffer}}{{contentType}} buffer body{{else}}empty body{{/if}}. {{#if ../description}}
     * {{description}}{{/if}}
{{#each ../parameters.path}}     * @param {{name}} Parameter {{oasParameter.name}} inside path
{{/each}}{{#each ../parameters.cookie}}     * @param {{name}} Parameter {{oasParameter.name}} inside cookie
{{/each}}{{#each ../parameters.query}}     * @param {{name}} Parameter {{oasParameter.name}} inside query
{{/each}}{{#each ../parameters.header}}     * @param {{name}} Parameter {{oasParameter.name}} inside header
{{/each}}{{#if json}}     * @param body Json object or bean that represents the body of the request
{{else if form}}     * @param form Form that represents the body of the request
{{else if stream}}     * @param stream ReadStream that represents the body of the request
{{else if buffer}}     * @param buffer Buffer that represents the body of the request
{{else}}
{{/if}}
     * @param handler The handler for the asynchronous request
     */
    fun {{name}}(
{{#each ../parameters.path}}        {{name}}: {{languageType}},
{{/each}}{{#each ../parameters.cookie}}        {{name}}: {{languageType}} ,
{{/each}}{{#each ../parameters.query}}        {{name}}: {{languageType}} ,
{{/each}}{{#each ../parameters.header}}        {{name}}: {{languageType}},
{{/each}}        {{#if empty}}handler: Handler<AsyncResult<HttpResponse<Buffer>>>{{else if json}}body: Any?, handler: Handler<AsyncResult<HttpResponse<Buffer>>>{{else if form}}form: MultiMap, handler: Handler<AsyncResult<HttpResponse<Buffer>>>{{else if stream}}stream: ReadStream<Buffer>, handler: Handler<AsyncResult<HttpResponse<Buffer>>>{{else if buffer}}buffer: Buffer, handler: Handler<AsyncResult<HttpResponse<Buffer>>>{{else}}handler: Handler<AsyncResult<HttpResponse<Buffer>>>{{/if}}) {
        // Check required params
        {{#each ../parameters.path}}if ({{name}} == null) throw RuntimeException("Missing parameter {{name}} in {{oasParameter.in}}");
        {{/each}}{{#each ../parameters.cookie}}{{#if required}}if ({{name}} == null) throw RuntimeException("Missing parameter {{name}}");
        {{/if}}{{/each}}{{#each ../parameters.query}}{{#if required}}if ({{name}} == null) throw RuntimeException("Missing parameter {{name}}");
        {{/if}}{{/each}}{{#each ../parameters.header}}{{#if required}}if ({{name}} == null) throw RuntimeException("Missing parameter {{name}}");
        {{/if}}{{/each}}

        // Generate the uri
        var uri: String = "{{../path}}"
{{#each ../parameters.path}}        uri = uri.replace("{{append (prepend oasParameter.name "{") "}"}}", this.{{renderFunctionName}}("{{oasParameter.name}}", {{name}}));
{{/each}}

        var request = client.get(uri)

        var requestCookies: MultiMap = CaseInsensitiveHeaders();
        {{#each ../parameters.cookie}}if ({{name}} != null) this.{{renderFunctionName}}("{{oasParameter.name}}", {{name}}, requestCookies);
        {{/each}}{{#each ../parameters.header}}if ({{name}} != null) this.{{renderFunctionName}}("{{oasParameter.name}}", {{name}}, request);
        {{/each}}{{#each ../parameters.query}}if ({{name}} != null) this.{{renderFunctionName}}("{{oasParameter.name}}", {{name}}, request);
        {{/each}}{{#if contentType}}this.addHeaderParam("Content-Type", "{{contentType}}", request);
        {{/if}}{{#if ../security}}{{#forOwn ../security}}this.attach{{capitalize .}}Security(request, requestCookies);
        {{/forOwn}}{{/if}}

        this.renderAndAttachCookieHeader(request, requestCookies);
        {{#if empty}}request.send(handler);{{else if json}}request.sendJson(body, handler);{{else if form}}request.sendForm(form, handler);{{else if stream}}request.sendStream(stream, handler);{{else if buffer}}request.sendBuffer(buffer, handler);{{else}}request.send(handler);{{/if}}
    }

    {{/each}}
    {{/forOwn}}

    {{#if security_schemas}}// Security requirements functions
    {{#forOwn security_schemas}}
    private fun attach{{capitalize sanitized_schema_name}}Security (request: HttpRequest<*>, cookies: MultiMap) {
        {{#and (compare type '==' 'http') (compare type '==' 'basic')}}
        this.addHeaderParam("Authorization", "Basic " + Base64.getEncoder()
            .encode((this.{{sanitized_schema_name}}_username + ":" + this.{{sanitized_schema_name}}_password).getBytes())!!, request);
        {{/and}}{{#or (and (compare type '==' 'http') (compare type '==' 'bearer')) (compare type '==' 'oauth2') (compare type '==' 'openIdConnect')}}
        this.addHeaderParam("Authorization", "Bearer " + {{sanitized_schema_name}}_token, request);
        {{/or}}{{#compare type '==' 'apiKey'}}
        {{#compare in '==' 'header'}}
        this.addHeaderParam("{{name}}", this.{{sanitized_schema_name}}_token, request);
        {{/compare}}{{#compare in '==' 'cookie'}}
        this.renderCookieParam("{{name}}", this.{{sanitized_schema_name}}_token, cookies);
        {{/compare}}{{#compare in '==' 'query'}}
        this.addQueryParam("{{name}}", this.{{sanitized_schema_name}}_token, request);
        {{/compare}}{{/compare}}
    }

    {{/forOwn}}{{/if}}{{#if security_schemas}}// Security parameters functions
    {{#forOwn security_schemas}}{{#and (compare type '==' 'http') (compare type '==' 'basic')}}
    /**
     * Set username and password for basic http security scheme {{@key}}
     */
    fun set{{capitalize sanitized_schema_name}}Params(username: String, password: String) {
        this.{{sanitized_schema_name}}_username = username;
        this.{{sanitized_schema_name}}_password = password;
    }
    {{/and}}{{#or (and (compare type '==' 'http') (compare type '==' 'bearer')) (compare type '==' 'apiKey') (compare type '==' 'oauth2') (compare type '==' 'openIdConnect')}}
    /**
     * Set access token for security scheme {{@key}}
     */
    fun set{{capitalize sanitized_schema_name}}Token(token: String) {
        this.{{sanitized_schema_name}}_token = token;
    }
    {{/or}}{{/forOwn}}{{/if}}

    // Parameters functions

    /**
     * Remove a cookie parameter from the cookie cache

     * @param paramName name of cookie parameter
     */
    fun removeCookie(paramName: String) {
        cookieParams.remove(paramName)
    }

    private fun addQueryParam(paramName: String, value: Any, request: HttpRequest<*>) {
        request.addQueryParam(paramName, value.toString())
    }

    /**
     * Add a cookie param in cookie cache

     * @param paramName name of cookie parameter
     * *
     * @param value value of cookie parameter
     */
    fun addCookieParam(paramName: String, value: Any) {
        renderCookieParam(paramName, value, cookieParams)
    }

    private fun addHeaderParam(headerName: String, value: Any, request: HttpRequest<*>) {
        request.putHeader(headerName, value.toString())
    }

    private fun renderPathParam(paramName: String, value: Any): String {
        return value.toString()
    }

    private fun renderCookieParam(paramName: String, value: Any, map: MultiMap) {
        map.remove(paramName)
        map.add(paramName, value.toString())
    }

    /**
     * Following this table to implement parameters serialization

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | style          | explode | in            | array                               | object                                 |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | matrix         | false   | path          | ;color=blue,black,brown             | ;color=R,100,G,200,B,150               |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | matrix         | true    | path          | ;color=blue;color=black;color=brown | ;R=100;G=200;B=150                     |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | label          | false   | path          | .blue.black.brown                   | .R.100.G.200.B.150                     |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | label          | true    | path          | .blue.black.brown                   | .R=100.G=200.B=150                     |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | false   | query, cookie | color=blue,black,brown              | color=R,100,G,200,B,150                |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | true    | query, cookie | color=blue&color=black&color=brown  | R=100&G=200&B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | false   | path, header  | blue,black,brown                    | R,100,G,200,B,150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | true    | path, header  | blue,black,brown                    | R=100,G=200,B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | spaceDelimited | false   | query         | blue%20black%20brown                | R%20100%20G%20200%20B%20150            |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | pipeDelimited  | false   | query         | blue|black|brown                    | R|100|G|200                            |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | deepObject     | true    | query         | n/a                                 | color[R]=100&color[G]=200&color[B]=150 |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     */

    /**
     * Render path value with matrix style exploded/not exploded

     * @param paramName
     * *
     * @param value
     * *
     * @return
     */
    private fun renderPathMatrix(paramName: String, value: Any): String {
        return ";" + paramName + "=" + value.toString()
    }

    /**
     * Render path array with matrix style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | matrix         | false   | path          | ;color=blue,black,brown             | ;color=R,100,G,200,B,150               |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathArrayMatrix(paramName: String, values: List<Any>): String {
        val serialized = values.stream().map<String> { `object` -> encode(`object`.toString()) }.collect(Collectors.toList<String>()).joinToString(",")
        return ";$paramName=$serialized"
    }

    /**
     * Render path object with matrix style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | matrix         | false   | path          | ;color=blue,black,brown             | ;color=R,100,G,200,B,150               |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathObjectMatrix(paramName: String, values: Map<String, Any>): String {
        val listToSerialize = ArrayList<String>()
        for ((key, value) in values.entrySet()) {
            listToSerialize.add(key)
            listToSerialize.add(encode(value.toString()).toString())
        }
        val serialized = listToSerialize.joinToString(",")
        return ";$paramName=$serialized"
    }

    /**
     * Render path array with matrix style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | matrix         | true    | path          | ;color=blue;color=black;color=brown | ;R=100;G=200;B=150                     |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathArrayMatrixExplode(paramName: String, values: List<Any>): String {
        return values.stream().map { `object` -> ";" + paramName + "=" + encode(`object`.toString()) }.collect(Collectors.toList<String>()).joinToString("")
    }

    /**
     * Render path object with matrix style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | matrix         | true    | path          | ;color=blue;color=black;color=brown | ;R=100;G=200;B=150                     |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathObjectMatrixExplode(paramName: String, values: Map<String, Any>): String {
        return values.entrySet().stream().map { entry -> ";" + entry.key + "=" + encode(entry.value.toString()) }.collect(Collectors.toList<String>()).joinToString("")
    }

    /**
     * Render path value with label style exploded/not exploded

     * @param paramName
     * *
     * @param value
     * *
     * @return
     */
    private fun renderPathLabel(paramName: String, value: Any): String {
        return "." + value.toString()
    }

    /**
     * Render path array with label style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | label          | false   | path          | .blue.black.brown                   | .R.100.G.200.B.150                     |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathArrayLabel(paramName: String, values: List<Any>): String {
        return "." + values.stream().map<String> { `object` -> encode(`object`.toString()) }.collect(Collectors.toList<String>()).joinToString(".")
    }

    /**
     * Render path object with label style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | label          | false   | path          | .blue.black.brown                   | .R.100.G.200.B.150                     |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathObjectLabel(paramName: String, values: Map<String, Any>): String {
        val listToSerialize = ArrayList<String>()
        for ((key, value) in values.entrySet()) {
            listToSerialize.add(key)
            listToSerialize.add(encode(value.toString()).toString())
        }
        return "." + listToSerialize.joinToString(".")
    }

    /**
     * Render path array with label style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | label          | true    | path          | .blue.black.brown                   | .R=100.G=200.B=150                     |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathArrayLabelExplode(paramName: String, values: List<Any>): String {
        return renderPathArrayLabel(paramName, values)
    }

    /**
     * Render path object with label style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | label          | true    | path          | .blue.black.brown                   | .R=100.G=200.B=150                     |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathObjectLabelExplode(paramName: String, values: Map<String, Any>): String {
        var result = ""
        for ((key, value) in values.entrySet())
            result = result + ("." + key + "=" + encode(value.toString()))
        return result
    }

    /**
     * Render path array with simple style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | false   | path, header  | blue,black,brown                    | R,100,G,200,B,150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathArraySimple(paramName: String, values: List<Any>): String {
        return values.stream().map<String> { `object` -> encode(`object`.toString()) }.collect(Collectors.toList<String>()).joinToString(",")
    }

    /**
     * Render path object with simple style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | false   | path, header  | blue,black,brown                    | R,100,G,200,B,150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathObjectSimple(paramName: String, values: Map<String, Any>): String {
        val listToSerialize = ArrayList<String>()
        for ((key, value) in values.entrySet()) {
            listToSerialize.add(key)
            listToSerialize.add(encode(value.toString()).toString())
        }
        return listToSerialize.joinToString(",")
    }

    /**
     * Render path array with simple style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | true    | path, header  | blue,black,brown                    | R=100,G=200,B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathArraySimpleExplode(paramName: String, values: List<Any>): String {
        return renderPathArraySimple(paramName, values)
    }

    /**
     * Render path object with simple style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | true    | path, header  | blue,black,brown                    | R=100,G=200,B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @return
     */
    private fun renderPathObjectSimpleExplode(paramName: String, values: Map<String, Any>): String {
        return values.entrySet().stream().map { entry -> entry.key + "=" + encode(entry.value.toString()) }.collect(Collectors.toList<String>()).joinToString(",")
    }

    /**
     * Add query array with form style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | false   | query, cookie | color=blue,black,brown              | color=R,100,G,200,B,150                |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addQueryArrayForm(paramName: String, values: List<Any>, request: HttpRequest<*>) {
        val serialized = values.stream().map { `object` -> `object`.toString() }.collect(Collectors.toList<String>()).joinToString(",")
        this.addQueryParam(paramName, serialized, request) // Encoding is done by WebClient
    }

    /**
     * Add query object with form style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | false   | query, cookie | color=blue,black,brown              | color=R,100,G,200,B,150                |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addQueryObjectForm(paramName: String, values: Map<String, Any>, request: HttpRequest<*>) {
        val listToSerialize = ArrayList<String>()
        for ((key, value) in values.entrySet()) {
            listToSerialize.add(key)
            listToSerialize.add(value.toString())
        }
        val serialized = listToSerialize.joinToString(",")
        this.addQueryParam(paramName, serialized, request) // Encoding is done by WebClient
    }

    /**
     * Add cookie array with form style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | false   | query, cookie | color=blue,black,brown              | color=R,100,G,200,B,150                |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     */
    private fun renderCookieArrayForm(paramName: String, values: List<Any>, map: MultiMap) {
        val value = values.stream().map { `object` -> `object`.toString() }.collect(Collectors.toList<String>()).joinToString(",")
        map.remove(paramName)
        map.add(paramName, value)
    }

    /**
     * Add a cookie array parameter in cookie cache

     * @param paramName name of cookie parameter
     * *
     * @param values list of values of cookie parameter
     */
    fun addCookieArrayForm(paramName: String, values: List<Any>) {
        renderCookieArrayForm(paramName, values, cookieParams)
    }

    /**
     * Add cookie object with form style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | false   | query, cookie | color=blue,black,brown              | color=R,100,G,200,B,150                |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     */
    private fun renderCookieObjectForm(paramName: String, values: Map<String, Any>, map: MultiMap) {
        val listToSerialize = ArrayList<String>()
        for ((key, value) in values.entrySet()) {
            listToSerialize.add(key)
            listToSerialize.add(value.toString())
        }
        val value = listToSerialize.joinToString(",")
        map.remove(paramName)
        map.add(paramName, value)
    }

    /**
     * Add a cookie object parameter in cookie cache

     * @param paramName name of cookie parameter
     * *
     * @param values map of values of cookie parameter
     */
    fun addCookieObjectForm(paramName: String, values: Map<String, Any>) {
        renderCookieObjectForm(paramName, values, cookieParams)
    }

    /**
     * Add query array with form style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | true    | query, cookie | color=blue&color=black&color=brown  | R=100&G=200&B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addQueryArrayFormExplode(paramName: String, values: List<Any>, request: HttpRequest<*>) {
        for (value in values)
            this.addQueryParam(paramName, value.toString(), request)
    }

    /**
     * Add query object with form style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | true    | query, cookie | color=blue&color=black&color=brown  | R=100&G=200&B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addQueryObjectFormExplode(paramName: String, values: Map<String, Any>, request: HttpRequest<*>) {
        for ((key, value) in values.entrySet())
            this.addQueryParam(key, value.toString(), request)
    }

    /**
     * Add cookie array with form style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | true    | query, cookie | color=blue&color=black&color=brown  | R=100&G=200&B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     */
    private fun renderCookieArrayFormExplode(paramName: String, values: List<Any>, map: MultiMap) {
        map.remove(paramName)
        for (value in values)
            map.add(paramName, value.toString())
    }

    fun addCookieArrayFormExplode(paramName: String, values: List<Any>) {
        renderCookieArrayFormExplode(paramName, values, cookieParams)
    }

    /**
     * Add cookie object with form style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | form           | true    | query, cookie | color=blue&color=black&color=brown  | R=100&G=200&B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     */
    private fun renderCookieObjectFormExplode(paramName: String, values: Map<String, Any>, map: MultiMap) {
        for ((key, value) in values.entrySet()) {
            map.remove(key)
            map.add(key, value.toString())
        }
    }

    fun addCookieObjectFormExplode(paramName: String, values: Map<String, Any>) {
        renderCookieObjectFormExplode(paramName, values, cookieParams)
    }

    /**
     * Add header array with simple style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | false   | path, header  | blue,black,brown                    | R,100,G,200,B,150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param headerName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addHeaderArraySimple(headerName: String, values: List<Any>, request: HttpRequest<*>) {
        val serialized = values.stream().map { `object` -> `object`.toString() }.collect(Collectors.toList<String>()).joinToString(",")
        this.addHeaderParam(headerName, serialized, request)
    }

    /**
     * Add header object with simple style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | false   | path, header  | blue,black,brown                    | R,100,G,200,B,150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param headerName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addHeaderObjectSimple(headerName: String, values: Map<String, Any>, request: HttpRequest<*>) {
        val listToSerialize = ArrayList<String>()
        for ((key, value) in values.entrySet()) {
            listToSerialize.add(key)
            listToSerialize.add(value.toString())
        }
        val serialized = listToSerialize.joinToString(",")
        this.addHeaderParam(headerName, serialized, request)
    }

    /**
     * Add header array with simple style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | true    | path, header  | blue,black,brown                    | R=100,G=200,B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param headerName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addHeaderArraySimpleExplode(headerName: String, values: List<Any>, request: HttpRequest<*>) {
        this.addHeaderArraySimple(headerName, values, request)
    }

    /**
     * Add header object with simple style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | simple         | true    | path, header  | blue,black,brown                    | R=100,G=200,B=150                      |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param headerName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addHeaderObjectSimpleExplode(headerName: String, values: Map<String, Any>, request: HttpRequest<*>) {
        val listToSerialize = ArrayList<String>()
        for ((key, value) in values.entrySet()) {
            listToSerialize.add(key + "=" + value.toString())
        }
        val serialized = listToSerialize.joinToString(",")
        this.addHeaderParam(headerName, serialized, request)
    }

    /**
     * Add query array with spaceDelimited style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | spaceDelimited | false   | query         | blue%20black%20brown                | R%20100%20G%20200%20B%20150            |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addQueryArraySpaceDelimited(paramName: String, values: List<Any>, request: HttpRequest<*>) {
        val serialized = values.stream().map { `object` -> `object`.toString() }.collect(Collectors.toList<String>()).joinToString(" ")
        this.addQueryParam(paramName, serialized, request) // Encoding is done by WebClient
    }

    /**
     * Add query object with spaceDelimited style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | spaceDelimited | false   | query         | blue%20black%20brown                | R%20100%20G%20200%20B%20150            |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addQueryObjectSpaceDelimited(paramName: String, values: Map<String, Any>, request: HttpRequest<*>) {
        val listToSerialize = ArrayList<String>()
        for ((key, value) in values.entrySet()) {
            listToSerialize.add(key)
            listToSerialize.add(value.toString())
        }
        val serialized = listToSerialize.joinToString(" ")
        this.addQueryParam(paramName, serialized, request) // Encoding is done by WebClient
    }

    /**
     * Add query array with pipeDelimited style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | pipeDelimited  | false   | query         | blue|black|brown                    | R|100|G|200                            |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addQueryArrayPipeDelimited(paramName: String, values: List<Any>, request: HttpRequest<*>) {
        val serialized = values.stream().map { `object` -> `object`.toString() }.collect(Collectors.toList<String>()).joinToString("|")
        this.addQueryParam(paramName, serialized, request) // Encoding is done by WebClient
    }

    /**
     * Add query object with pipeDelimited style and not exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | pipeDelimited  | false   | query         | blue|black|brown                    | R|100|G|200                            |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addQueryObjectPipeDelimited(paramName: String, values: Map<String, Any>, request: HttpRequest<*>) {
        val listToSerialize = ArrayList<String>()
        for ((key, value) in values.entrySet()) {
            listToSerialize.add(key)
            listToSerialize.add(value.toString())
        }
        val serialized = listToSerialize.joinToString("|")
        this.addQueryParam(paramName, serialized, request) // Encoding is done by WebClient
    }

    /**
     * Add query object with deepObject style and exploded

     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+
     * | deepObject     | true    | query         | n/a                                 | color[R]=100&color[G]=200&color[B]=150 |
     * +----------------+---------+---------------+-------------------------------------+----------------------------------------+

     * @param paramName
     * *
     * @param values
     * *
     * @param request
     */
    private fun addQueryObjectDeepObjectExplode(paramName: String, values: Map<String, Any>, request: HttpRequest<*>) {
        for ((key, value) in values.entrySet()) {
            this.addQueryParam("$paramName[$key]", value.toString(), request)
        }
    }


    private fun renderAndAttachCookieHeader(request: HttpRequest<*>, otherCookies: MultiMap?) {
        if ((otherCookies == null || otherCookies.isEmpty()) && cookieParams.isEmpty())
            return;
        val listToSerialize = ArrayList<String>()
        for ((key, value) in cookieParams.entries()) {
            if (otherCookies != null && !otherCookies.contains(key)) {
                try {
                    listToSerialize.add(encode(key).toString() + "=" + encode(value).toString())
                } catch (e1: UnsupportedEncodingException) {}
            }
        }
        if (otherCookies != null) {
            for ((key, value) in otherCookies.entries()) {
                try {
                    listToSerialize.add(encode(key).toString() + "=" + encode(value).toString())
                } catch (e1: UnsupportedEncodingException) {}
            }
        }
        request.putHeader("Cookie", listToSerialize.joinToString("; "))
    }

    // Other functions

    private fun encode(s: String): String? {
        try {
            return URLEncoder.encode(s, "UTF-8")
        } catch (e: Exception) {
            return null
        }

    }

    /**
     * Close the connection with server

     */
    fun close() {
        client!!.close()
    }

}
