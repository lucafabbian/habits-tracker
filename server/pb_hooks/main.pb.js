

// Endpoint that allows superusers to query the database
routerAdd("POST", "/api/query", (e) => {
    console.log("Query received")
    if (!e.hasSuperuserAuth()) return e.json(401, { "message": "Unauthorized" })
    let {query, type, obj} = JSON.parse(JSON.stringify(e.requestInfo().body))

    if (type == 'all') {
        console.log("Query all")
        const result = arrayOf(new DynamicModel(obj))
        $app.db().newQuery(query).all(result)
        return e.json(200, { result })
    }else if(type == 'one'){
        const result = new DynamicModel(obj)
        $app.db().newQuery(query).one(result)
        return e.json(200, { result })
    }

    $app.db().newQuery(query).execute()
    e.json(200, { "message": "Query executed" })
})

