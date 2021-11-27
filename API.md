# API
The app provides a REST API for accessing the results.

## GET courses
https://stats.ftek.se/courses/

Parameters:

- `search` = `{searchString}` where `searchString` is an URI encoded string
- `sort` = `{sortKey}_{asc|desc}` where `sortKey`=`courseCode` | `courseName` | `programShort` | `passRate` | `totalPass` | `totalFail` | `averageGrade`
- `items` = `{itemsPerPage}` where `itemsPerPage` is an integer
- `page` = `{page}` where `page` is an integer

Example:

[https://ftek.se/stats/courses?sort=averageGrade_desc&search=Linj%C3%A4r%20algebra&page=1&items=25](https://ftek.se/stats/courses?sort=averageGrade_desc&search=Linj%C3%A4r%20algebra&page=1&items=25)

Response:
```json
{
    "courses": [
        {
            "totalPass": 19,
            "totalFail": 21,
            "averageGrade": 3.1052631578947367,
            "courseCode": "TMV165",
            "courseName": "Linjär algebra",
            "programShort": "TKMAS",
            "programLong": "MASKINTEKNIK, CIVILINGENJÖR",
            "total": 40,
            "passRate": 0.475
        },
        {
            "totalPass": 1,
            "totalFail": 7,
            "averageGrade": 3,
            "courseCode": "TMV185",
            "courseName": "Linjär algebra TD",
            "programShort": "TKDES",
            "programLong": "TEKNISK DESIGN, CIVILINGENJÖR",
            "total": 8,
            "passRate": 0.125
        },
        {
            "totalPass": 2,
            "totalFail": 4,
            "averageGrade": 3,
            "courseCode": "TMA315",
            "courseName": "Linjär algebra och flervariabelanalys",
            "programShort": "TIEKA",
            "programLong": "INDUSTRIELL EKONOMI",
            "total": 6,
            "passRate": 0.3333333333333333
        },
        {
            "totalPass": 2,
            "totalFail": 0,
            "averageGrade": 3,
            "courseCode": "TMV020",
            "courseName": "Linjär algebra och analys i flera variabler, fortsättningskurs",
            "programShort": "TMASA",
            "programLong": "MASKINTEKNIK",
            "total": 2,
            "passRate": 1
        },
        {
            "totalPass": 1,
            "totalFail": 0,
            "averageGrade": 3,
            "courseCode": "TMV015",
            "courseName": "Linjär algebra och analys i flera variabler",
            "programShort": "TMASA",
            "programLong": "MASKINTEKNIK",
            "total": 1,
            "passRate": 1
        }
    ],
    "metadata": [
        {
            "count": 30
        }
    ]
}
```



## GET course info
https://stats.ftek.se/courses/{course-code}

Example:

https://stats.ftek.se/courses/TMA970

Response:
```json
{
    "3": 791,
    "4": 317,
    "5": 127,
    "totalPass": 1235,
    "averageGrade": 3.4623481781376517,
    "U": 1194,
    "G": 0,
    "TG": 0,
    "_id": "5c30e4893de27e65c607455c",
    "updatedAt": "2021-11-26T09:10:06.044Z",
    "courseCode": "TMA970",
    "courseName": "Inledande matematisk analys",
    "programShort": "TKTFY",
    "programLong": "TEKNISK FYSIK, CIVILINGENJÖR",
    "VG": 0,
    "total": 2429,
    "passRate": 0.5084396871140388
}
```

## GET results (of a course)
https://stats.ftek.se/results/{course-code}

Example:

https://stats.ftek.se/results/FFM521


Response (partial):
```json
[
    {
        "3": 23,
        "4": 9,
        "5": 0,
        "resultId": "Unknown",
        "U": 15,
        "G": 26,
        "TG": 0,
        "VG": 0,
        "_id": "5c30e48c3de27e65c6087396",
        "updatedAt": "2021-11-26T09:10:00.150Z",
        "date": "2017-08-24",
        "type": "Projekt"
    },
    {
        "3": 39,
        "4": 17,
        "5": 7,
        "resultId": "0196",
        "U": 63,
        "G": 0,
        "TG": 0,
        "VG": 0,
        "_id": "5c30e48c3de27e65c60880b7",
        "updatedAt": "2021-11-26T09:10:00.455Z",
        "date": "2017-06-02",
        "type": "Tentamen"
    }
]
```

## GET latest database update
https://stats.ftek.se/results/

Response:
```json
{
    "updatedAt": "2021-11-26T09:10:13.556Z",
    "courseCode": "EEN030"
}