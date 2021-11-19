# proxy-service
This is a simple http proxy service.
- Assumes http only, no other proticols supported.
- Assumes serial requests only.
- Request/Response logs are sent to stdout.
- Consider installing httpie for best experience. - https://httpie.io/
  
 ```js
 brew install httpie
 ```


### Dependencies
- Node v16.3.0
- Crypto-js: 4.1.1
- UUID: 8.3.2



### Start Proxy service
- npm start



## Terminal Examples:

## If using httpie:
GET:

```js
http_proxy=http://localhost:3000 http get http://jsonplaceholder.typicode.com/posts/1
```


POST:

```js
http_proxy=http://localhost:3000 http post http://jsonplaceholder.typicode.com/posts title='hello world' body='Does this thing work?'
```


PUT:

```js
http_proxy=http://localhost:3000 http put http://jsonplaceholder.typicode.com/posts/1  body='Of course it does.'
```


DELETE:

```js
http_proxy=http://localhost:3000 http delete http://jsonplaceholder.typicode.com/posts/2
```



## If using curl:
GET:

```js
http_proxy=http://localhost:3000 curl -i -XGET 'http://jsonplaceholder.typicode.com/posts/1'
```


POST:

```js
http_proxy=http://localhost:3000 curl -i -XPOST -d 'Does this thing work?' 'http://jsonplaceholder.typicode.com/posts'
```


PUT:

```js
http_proxy=http://localhost:3000 curl -i -XPUT -d 'Of course it does.' 'http://jsonplaceholder.typicode.com/posts/1'
```


DELETE:

```js
http_proxy=http://localhost:3000 curl -i -XDELETE 'http://jsonplaceholder.typicode.com/posts/2'
```




### Trigger "bad_message" response
```js
http_proxy=http://localhost:3000 http post http://jsonplaceholder.typicode.com/posts title='hello world' body='bad_message'
```

```js
http_proxy=http://localhost:3000 curl -i -XPOST -d 'bad_message' 'http://jsonplaceholder.typicode.com/posts'
```



### Trigger two second delay on consecutive requests.

- Send any request consecutively at least two times.



### Example of logs expected to be sent to stdout:
```
{ PROXY_REQUEST_ID: 'da90c050-72f3-454d-817a-d2d8240dabc8' } {
  REQUEST: {
    TIME_RECEIVED: 2021-11-19T04:46:11.943Z,
    SOURCE_IP: '127.0.0.1',
    METHOD: 'PUT',
    URL: 'http://jsonplaceholder.typicode.com/posts/1'
  },
  RESPONSE: {
    TIME_SENT: 2021-11-19T04:46:11.943Z,
    STATUS_CODE: 200,
    STATUS_MESSAGE: undefined,
    CONSECUTIVE_DELAY: false
  }
}
{ PROXY_REQUEST_ID: 'fbaac5e4-7c83-4ba9-92bc-cb84a3abed9a' } {
  REQUEST: {
    TIME_RECEIVED: 2021-11-19T04:48:20.928Z,
    SOURCE_IP: '127.0.0.1',
    METHOD: 'POST',
    URL: 'http://jsonplaceholder.typicode.com/posts'
  },
  RESPONSE: {
    TIME_SENT: 2021-11-19T04:48:20.928Z,
    STATUS_CODE: 401,
    STATUS_MESSAGE: 'Unauthorized',
    CONSECUTIVE_DELAY: false
  }
}
```



