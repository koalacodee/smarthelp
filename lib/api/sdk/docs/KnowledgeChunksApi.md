# KnowledgeChunksApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createKnowledgeChunk**](#createknowledgechunk) | **POST** /BASE_URL/knowledge-chunks | Create a new knowledge chunk Copy|
|[**deleteKnowledgeChunk**](#deleteknowledgechunk) | **DELETE** /BASE_URL/knowledge-chunks/{id} | Delete A Knowledge Chunk|
|[**getAllKnowledgeChunks**](#getallknowledgechunks) | **GET** /BASE_URL/knowledge-chunks | Get All Knowledge Chunks|

# **createKnowledgeChunk**
> CreateKnowledgeChunk201Response createKnowledgeChunk()



### Example

```typescript
import {
    KnowledgeChunksApi,
    Configuration,
    CreateKnowledgeChunkRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new KnowledgeChunksApi(configuration);

let createKnowledgeChunkRequest: CreateKnowledgeChunkRequest; // (optional)

const { status, data } = await apiInstance.createKnowledgeChunk(
    createKnowledgeChunkRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createKnowledgeChunkRequest** | **CreateKnowledgeChunkRequest**|  | |


### Return type

**CreateKnowledgeChunk201Response**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteKnowledgeChunk**
> DeleteKnowledgeChunk200Response deleteKnowledgeChunk()



### Example

```typescript
import {
    KnowledgeChunksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new KnowledgeChunksApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deleteKnowledgeChunk(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DeleteKnowledgeChunk200Response**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAllKnowledgeChunks**
> GetAllKnowledgeChunks200Response getAllKnowledgeChunks()



### Example

```typescript
import {
    KnowledgeChunksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new KnowledgeChunksApi(configuration);

const { status, data } = await apiInstance.getAllKnowledgeChunks();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetAllKnowledgeChunks200Response**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

