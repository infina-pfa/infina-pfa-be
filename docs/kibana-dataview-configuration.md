# Kibana Data View Configuration

## Essential Fields for Monitoring

Based on your application's logging structure, here are the crucial fields to display in Kibana:

### Primary Fields (Always Display)
1. **@timestamp** - When the event occurred
2. **severity** - Log level (error, warn, info, debug)
3. **message** - The actual log message
4. **error** - Exception name (if applicable)
5. **statusCode** - HTTP status code
6. **path** - API endpoint path
7. **method** - HTTP method (GET, POST, PATCH, etc.)

### Secondary Fields (Display on Expand)
1. **context** - Application context
2. **environment** - deployment environment
3. **ip** - Client IP address
4. **userAgent** - Browser/client information
5. **metadata.query.userId** - User identifier
6. **metadata.body** - Request body (for debugging)

### Fields to Hide by Default
- All `.keyword` duplicates
- `_index`, `_id`, `_version`
- `stack` - Full stack trace (too verbose for list view)
- `ignored_field_values`
- `fields` object (duplicate data)

## Steps to Configure in Kibana

### 1. Access Data View Settings
1. Navigate to **Stack Management** → **Data Views**
2. Select your index pattern: `infina-pfa-development`
3. Click on **Field Management**

### 2. Configure Field Display
For each field, you can:
- **Set as Default Column**: Add to default table view
- **Hide Field**: Remove from discover view
- **Set Format**: Apply custom formatting

### 3. Recommended Configuration

#### Default Columns (in order):
```
@timestamp | severity | message | statusCode | method | path | error
```

#### Field Settings:
```json
{
  "defaultColumns": [
    "@timestamp",
    "severity",
    "message", 
    "statusCode",
    "method",
    "path",
    "error"
  ],
  "hiddenFields": [
    "_index",
    "_id", 
    "_version",
    "_ignored",
    "_source",
    "fields.*",
    "*.keyword",
    "ignored_field_values",
    "timestamp"
  ],
  "fieldFormats": {
    "@timestamp": {
      "format": "date",
      "pattern": "MMM D, YYYY @ HH:mm:ss.SSS"
    },
    "severity": {
      "format": "color",
      "colors": {
        "error": "#FF0000",
        "warn": "#FFA500",
        "info": "#0000FF",
        "debug": "#808080"
      }
    },
    "statusCode": {
      "format": "color",
      "colors": {
        "2xx": "#00FF00",
        "3xx": "#0000FF",
        "4xx": "#FFA500",
        "5xx": "#FF0000"
      }
    }
  }
}
```

### 4. Create Custom Saved Search

1. In **Discover**:
   - Apply the filters and column configuration
   - Save as "Application Errors Overview"
   - Set as default view

2. Create additional saved searches for specific use cases:
   - **Error Monitoring**: Filter `severity: error`
   - **API Performance**: Focus on `statusCode`, `path`, `method`
   - **User Activity**: Include `metadata.query.userId`

### 5. Alternative: Use Kibana Lens for Visualization

Create a dashboard with:
1. **Error Rate Chart**: Count of `severity: error` over time
2. **Status Code Distribution**: Pie chart of statusCode ranges
3. **Top Error Messages**: Data table of most frequent errors
4. **API Endpoint Performance**: Bar chart of path + method combinations

### 6. Export/Import Configuration

Save your configuration as code:

```json
{
  "version": "8.x",
  "objects": [
    {
      "id": "infina-pfa-development-view",
      "type": "index-pattern",
      "attributes": {
        "title": "infina-pfa-development",
        "fieldFormats": {},
        "fields": {
          "@timestamp": {
            "searchable": true,
            "aggregatable": true,
            "displayPriority": 1
          },
          "severity": {
            "searchable": true,
            "aggregatable": true,
            "displayPriority": 2
          },
          "message": {
            "searchable": true,
            "aggregatable": false,
            "displayPriority": 3
          },
          "stack": {
            "searchable": true,
            "aggregatable": false,
            "displayPriority": 100,
            "defaultHidden": true
          }
        }
      }
    }
  ]
}
```

## Quick Implementation via Kibana UI

1. **Go to Discover**
2. **Click "Add field" button** (+ icon) next to Available Fields
3. **Select only these fields**:
   - @timestamp
   - severity  
   - message
   - statusCode
   - method
   - path
   - error (when present)

4. **Remove unwanted fields** by clicking the "x" on each column header

5. **Save your view**: Click "Save" → Name it "Crucial Logs View" → Set as default

This will give you a clean, focused view showing only the essential information for monitoring and debugging your application.