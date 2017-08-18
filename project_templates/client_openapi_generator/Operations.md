# Operations

{{#forOwn operations}} * [{{@key}}]({{@key}})
{{/forOwn}}

{{#forOwn operations}}## {{@key}}{{#if description}}
{{description}}{{/if}}

### Parameters

{{#each parameters.path}} * `{{name}}`: Parameter `{{oasParameter.name}}` inside path{{#if oasParameter.description}}. Description: {{oasParameter.description}}{{/if}}
{{/each}}{{#each parameters.cookie}} * `{{name}}`: Parameter `{{oasParameter.name}}` inside cookie{{#if oasParameter.description}}. Description: {{oasParameter.description}}{{/if}}
{{/each}}{{#each parameters.query}} * `{{name}}`: Parameter `{{oasParameter.name}}` inside query{{#if oasParameter.description}}. Description: {{oasParameter.description}}{{/if}}
{{/each}}{{#each parameters.header}} * `{{name}}`: Parameter `{{oasParameter.name}}` inside header{{#if oasParameter.description}}. Description: {{oasParameter.description}}{{/if}}
{{/each}}

### Functions

{{#each functions}} * `{{name}}()`: Function that sends the request with {{#if json}}Json body{{else if form}}form {{contentType}} body{{else if stream}}{{contentType}} stream body{{else if buffer}}{{contentType}} buffer body{{else}}empty body{{/if}}
{{/each}}

{{#if security}}### Security Requirements

{{#forOwn security}} * `{{@key}}` provided by `attach{{capitalize .}}Security()`;
{{/forOwn}}{{/if}}

{{/forOwn}}