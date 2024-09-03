# getSampleInputForJSONFormatterFn

## Request

```json
POST http://localhost:3001/api/getSampleInputForJSONFormatterFn
{
"uploadType":"jsonFolder",
"uploadPath":"/Users/user1/Documents/data/product-data",
}
```

Note:

[sample-upload-types](./sample-upload-types.md)

## Response

```json
{
  "data": {
    "filePath": "/Users/user1/Documents/data/product-data/10000.json",
    "fileIndex": 0,
    "content": {
      "meta": {
        "code": 200,
        "requestId": "71f19976-9607-4aa7-a1b9-2c9666f0e220"
      },
      "data": {
        "id": 10000,
        "price": 649,
        "discountedPrice": 324,
        "styleType": "DEL",
        "productTypeId": 304,
        "articleNumber": "132197135028 1303",
        "visualTag": "",
        "productDisplayName": "Palm Tree Girls Sp Jace Sko White Skirts",
        "variantName": "SP JACE SKO",
        "myntraRating": 1,
        "catalogAddDate": 1418330925,
        "brandName": "Palm Tree",
        "ageGroup": "Kids-Girls",
        "gender": "Women",
        "baseColour": "White",
        "colour1": "NA",
        "colour2": "NA",
        "fashionType": "Fashion",
        "season": "Summer",
        "year": "2011",
        "usage": "Casual",
        "vat": 5.5,
        "displayCategories": "Bottomwear,Casual Wear and Clearance,Casual Wear,Sale",
        "weight": "0",
        "navigationId": 424,
        "landingPageUrl": "Skirts/Palm-Tree/Palm-Tree-Girls-Sp-Jace-Sko-White-Skirts/10000/buy"
      }
    }
  },
  "error": null
}
```
