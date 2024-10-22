# testRedisConnection

## Request 1 (sample : modifying existing object )

```json
POST http://localhost:3001/api/testJSONFormatterFn
{
"jsFunctionString":"

function customJSONFormatter(jsonObj){

 jsonObj.insertedAt = new Date() // add new field
 jsonObj.productDetails.brandName = jsonObj.productDetails.brandName.toUpperCase() //update field
 delete jsonObj.meta //delete field

 return jsonObj;
}
",
"idField":"",
"paramsObj":{
    "meta": {
        "code": 200,
        "requestId": "bb3b40d6-44ac-4a81-b188-945fd3b4c1fb"
    },
    "productDetails": {
        "id": 1165,
        "price": 2495,
        "productDisplayName": "Nike Mean Team India Cricket Jersey",
        "brandName": "Nike",
        "gender": "Men",
        "baseColour": "Blue",
        "year": "2013"
    }
}
}
```

### Response 1

```json
{
  "data": {
    "functionResult": {
      "productDetails": {
        "id": 1165,
        "price": 2495,
        "productDisplayName": "Nike Mean Team India Cricket Jersey",
        "brandName": "NIKE",
        "gender": "Men",
        "baseColour": "Blue",
        "year": "2013"
      },
      "insertedAt": "2024-08-12T16:17:27.468Z"
    },
    "sampleKey": "1"
  },
  "error": null
}
```

## Request 2 (sample : returning new object )

```json
POST http://localhost:3001/api/testJSONFormatterFn
{
"jsFunctionString":"

function customJSONFormatter(jsonObj){

jsonObj = {
  productId: jsonObj.productDetails.id,
  productName: jsonObj.productDetails.productDisplayName,
  price: jsonObj.productDetails.price,
  insertedAt: new Date(),
}

 return jsonObj;
}
",
"idField":"",
"paramsObj":{
    "meta": {
        "code": 200,
        "requestId": "bb3b40d6-44ac-4a81-b188-945fd3b4c1fb"
    },
    "data": {
        "id": 1165,
        "price": 2495,
        "productDisplayName": "Nike Mean Team India Cricket Jersey",
        "brandName": "Nike",
        "gender": "Men",
        "baseColour": "Blue",
        "year": "2013"
    }
}
}
```

## Response 2

```json
{
  "data": {
    "functionResult": {
      "productId": 1165,
      "productName": "Nike Mean Team India Cricket Jersey",
      "price": 2495,
      "insertedAt": "2024-08-12T16:18:28.616Z"
    },
    "sampleKey": "1"
  },
  "error": null
}
```

## Request 3 (sample : error case )

```json
POST http://localhost:3001/api/testJSONFormatterFn
{
  "jsFunctionString": "

  function userFunction(jsonObj){

    jsonObj = {
        productId: jsonObj.productDetails.id,
        productName: jsonObj.productDetails.productDisplayName,
        price: jsonObj.productDetails.price,
        insertedAt: new Date(),
    }

    for (let i = 0; i < 10; i++) {
        console.log(i);
    }

    while (true) {
        break;
    }

    do {
        console.log('do while');
    } while (false);

    for (const key in jsonObj) {
        console.log(key);
    }

    for (const value of Object.values(jsonObj)) {
        console.log(value);
    }

    [1, 2, 3].forEach(num => console.log(num));

    return jsonObj;
   }
",
    "paramsObj":{
    "meta": {
        "code": 200,
        "requestId": "bb3b40d6-44ac-4a81-b188-945fd3b4c1fb"
    },
    "data": {
        "id": 1165,
        "price": 2495,
        "productDisplayName": "Nike Mean Team India Cricket Jersey",
        "brandName": "Nike",
        "gender": "Men",
        "baseColour": "Blue",
        "year": "2013"
    }
}
}
```

## Response 3

```json
{
  "data": null,
  "error": {
    "stack": "...",
    "message": "Disallowed JS constructs found :\n       console, ForStatement, WhileStatement, console, DoWhileStatement, console, ForInStatement, console, ForOfStatement, console, Array.forEach. Please remove them and try again.",
    "userMessage": "Your code contains disallowed JavaScript constructs.  For more information, refer to the errors tab."
  }
}
```

## Other sample error functions

```js
function customJSONFormatter(jsonObj) {
  if (jsonObj.productId == "P99") {
    throw new Error("Custom runtime error occurred");
  }
  return jsonObj; // mandatory return
}
```
