
function updateSum(e) {
    console.log("update received", e.record.get("goal"))

    const result = new DynamicModel({ sum: 0, })
    $app.db()
        .newQuery(`
            SELECT COALESCE(SUM(value), 0) as sum
                FROM goalUpdates
                WHERE goalUpdates.goal =  {:goal};
        `)
        .bind({ "goal":  e.record.get("goal"), })
        .one(result)

    console.log("sum", result.sum)
    const record = $app.findRecordById("goals", e.record.get("goal"))
    console.log("record", record.get("name"), Number(result.sum))
    record.set("total", Number(result.sum))
    $app.save(record);
    e.next()


}

module.exports = {
    updateSum,
}