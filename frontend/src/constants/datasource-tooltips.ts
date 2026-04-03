


export const datasourceTooltips = {

  dialog: {
    header: "Datasources connect to external trace storage systems (Tempo, Jaeger, ClickHouse, Custom API) to retrieve and display your observability data. Configure connection details, authentication, and query settings for your trace storage backend."
  },


  form: {
    name: "A descriptive name for this datasource (e.g., 'Production Tempo', 'Staging Jaeger'). This name appears in datasource lists and helps identify the connection.",
    description: "Optional description explaining the purpose of this datasource and which environment or system it connects to. Helps team members understand when and how this datasource is used.",


    queryLanguage: {
      tempo: "Uses TraceQL query language for searching traces. TraceQL is a query language designed specifically for querying trace data.",
      clickhouse: "Simple query syntax: attribute = \"value\", attribute EXISTS, AND/OR operators. Example: session.id = \"453\" OR user.id = \"123\". Searches span and resource attributes.",
      customApi: "Use the query language you defined in your backend. The query will be sent to your Custom API endpoint as specified in the datasource configuration."
    },


    clickhouse: {
      host: "The hostname or IP address of your ClickHouse server. Examples: 'localhost', 'clickhouse.example.com', '192.168.1.100'. This is the server where your trace data is stored.",
      port: "The port number for connecting to ClickHouse. Default is 8123 for HTTP connections. Ensure the port is open and accessible from your application. Valid range: 1-65535.",
      database: "The name of the ClickHouse database containing your trace data. Examples: 'default', 'traces', 'observability'. The database must exist in your ClickHouse instance before traces can be stored.",
      protocol: "The protocol used to connect to ClickHouse:\n\n**HTTP:** Standard HTTP connection (default). Use for local development or internal networks.\n\n**HTTPS:** Secure HTTP connection with TLS encryption. Use for production environments or when connecting over public networks.",
      tableName: "The name of the ClickHouse table containing your trace data. Examples: 'traces', 'otel_traces', 'spans'. The table must exist in the specified database and follow the expected schema for trace data.",
      authentication: "Optional authentication credentials for ClickHouse. Leave empty if your ClickHouse instance doesn't require authentication. For production environments, authentication is recommended for security.",
      username: "The username for authenticating with ClickHouse. Leave empty if authentication is not required. The user must have read permissions for the specified database and table.",
      password: "The password for authenticating with ClickHouse. Leave empty if no password is required. Passwords are stored securely and transmitted over encrypted connections when using HTTPS.",
      urlAlternative: "Optional: Use a complete ClickHouse connection URL instead of individual configuration fields. Format: 'http://host:port/database?table=tableName' or 'https://username:password@host:port/database?table=tableName'.\n\nThis provides backward compatibility with URL-based configurations. If provided, it takes precedence over individual field values."
    },


    customApi: {
      baseUrl: "The base URL of your Custom API (e.g., 'https://api.example.com'). This is the root URL where all endpoint paths will be appended. Must include protocol (http:// or https://). Trailing slashes are automatically removed.",
      endpoints: {
        search: "The API endpoint path for searching traces. Examples: '/api/traces/search', 'api/traces/search'. This endpoint will receive query parameters like start, end, limit, q (if searchByQuery enabled), attributes (if searchByAttributes enabled), filterByAttributeExists, minDuration, maxDuration, serviceName, and operationName.",
        searchByTraceId: "The API endpoint path for fetching a trace by ID. Must include the {traceId} placeholder which will be replaced with the actual trace ID. Examples: '/api/traces/{traceId}', 'api/traces/{traceId}'. This endpoint will receive query parameters: start (ISO 8601) and end (ISO 8601).",
        attributeNames: "The API endpoint path for retrieving available attribute names. Required if 'Get Attribute Names' capability is enabled. Examples: '/api/attributes', 'api/attributes'. This endpoint should return an array of attribute name strings or an object with an 'attributeNames' property.",
        attributeValues: "The API endpoint path for retrieving values for a specific attribute. Must include the {attributeName} placeholder which will be replaced with the actual attribute name. Required if 'Get Attribute Values' capability is enabled. Examples: '/api/attributes/{attributeName}/values'. This endpoint should return an array of value strings or an object with a 'values' property."
      },
      capabilities: {
        searchByQuery: "Enable this if your API supports text-based search queries. When enabled, the 'q' query parameter will be sent to the search endpoint. Default: enabled. Your API should handle this parameter to perform full-text search on trace data.",
        searchByAttributes: "Enable this if your API supports searching by attribute key-value pairs. When enabled, attributes will be sent in logfmt format (e.g., 'key1=value1 key2=value2') to the search endpoint via the 'attributes' query parameter. Default: disabled.",
        filterByAttributeExists: "Enable this if your API supports filtering traces that have specific attributes present (regardless of value). When enabled, a 'filterByAttributeExists' query parameter will be sent as a comma-separated list of attribute names. Default: disabled.",
        getAttributeNames: "Enable this if your API provides an endpoint to list all available attribute names. When enabled, requires the Attribute Names endpoint to be configured. This capability enables the attribute selector UI to dynamically load available attributes. Default: disabled.",
        getAttributeValues: "Enable this if your API provides an endpoint to list all values for a specific attribute. When enabled, requires the Attribute Values endpoint to be configured (must include {attributeName} placeholder). This capability enables the attribute value selector UI to dynamically load available values. Default: disabled."
      },
      authentication: {
        type: "Select the authentication method your Custom API requires:\n\n**Header:** Send a custom header with authentication value (e.g., 'X-API-Key: your-key'). Requires header name and value.\n\n**Bearer:** Send standard Bearer token authentication in the Authorization header as 'Authorization: Bearer {token}'. Requires token value.\n\n**Basic:** Send HTTP Basic authentication with username and password encoded in the Authorization header. Requires username and password.",
        headerName: "The name of the HTTP header to send the authentication value in. Examples: 'X-API-Key', 'Authorization', 'Api-Key', 'X-Auth-Token'. This header will be sent with every request to your Custom API.",
        value: "The authentication value to send. For Header type, this will be sent as the value of the specified header. For Bearer type, this will be sent as 'Bearer {value}' in the Authorization header. Stored securely.",
        username: "The username for HTTP Basic authentication. This will be combined with the password and base64-encoded in the Authorization header as 'Authorization: Basic {encoded-credentials}'. Stored securely.",
        password: "The password for HTTP Basic authentication. This will be combined with the username and base64-encoded in the Authorization header. Stored securely and transmitted over encrypted connections."
      },
      headers: "Optional custom HTTP headers to send with every request to your Custom API. Format: 'Header-Name: value' (one per line). Examples:\n\n'X-Custom-Header: value1'\n'X-Another-Header: value2'\n\nThese headers are merged with authentication headers and default headers (Content-Type: application/json)."
    },

    tempoJaegerAuth: "Optional authentication for Tempo and Jaeger datasources. Configure Basic Authentication (username/password) or Bearer Token authentication if your Tempo/Jaeger instance requires authentication. Credentials are stored securely and encrypted."
  }
} as const;
export type DatasourceTooltips = typeof datasourceTooltips;