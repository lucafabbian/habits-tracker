// STATE
window.data = {
    tab: 'goals',
    dialogs: [],
    goals: [],
    actions: [],
}


// TABS
window.tabs = [
    ['goals'],
    ['food'],
    ['rules'],
    ['book'],
]
const updateTabFromHash = () => {
    const newTab = window.location.hash.substring(1);
    if (newTab && tabs.some(tab => tab[0] === newTab)) data.tab = newTab;
}
window.addEventListener('hashchange', updateTabFromHash);
updateTabFromHash();


// UTILS
window.signed = (n) => n < 0 ? n : '+' + n


// QUERY AND STATE INTERACTION

window.query = async (query, obj = undefined, type = undefined) => {
    type = obj === undefined ? "execute" : "all"
    const jsonBody = { query, obj, type }
    const result = await pb.send('/api/query', {method: "POST", body: jsonBody})
    //console.log("Query result:", result)
    if(type == "all" || type == "one") return result.result
}

const updateGoals = async() => data.goals = await query(`
SELECT g.*, COALESCE(SUM(CASE WHEN DATE(gu.updated) = date('now') THEN gu.value ELSE 0 END), 0) AS dailyTotal,
SUM(CASE WHEN gu.updated >= date('now', 'localtime', 'start of month')  THEN  gu.value ELSE 0 END) AS monthlyTotal

FROM goalTypes g  
LEFT JOIN goalUpdates gu ON gu.goal = g.id  
GROUP BY g.id; 
`, {id: '', name: '', icon: '', buttons: '', description: '',
    dailyTotal: 0, monthlyTotal: 0}, )


const chartData = async() => {
    const q = await query(`
        WITH RECURSIVE dates(day) AS (
            -- Generate dates starting 6 days ago (so today + the 6 previous days = 7 days)
            SELECT date('now', '-6 days')
            UNION ALL
            SELECT date(day, '+1 day')
            FROM dates
            WHERE day < date('now')
        )
        SELECT 
            d.day,
            COALESCE(SUM(gu.value), 0) AS dailyTotal
        FROM dates d
        LEFT JOIN goalUpdates gu ON DATE(gu.updated) = d.day
        GROUP BY d.day
        ORDER BY d.day;
        `, {day: '', dailyTotal: 0})

    return {
        labels: q.map(r => r.day),
        datasets: [
            {
                name: "Points", type: "line",
                values: q.map(r => r.dailyTotal)
            }
        ]
    }

}


// MAIN
const main = async() => {

    // AUTH AND RETRIEVE STATE
    await utils.auth()
    updateGoals();
    chartData().then(cd => {
        const ctx = document.getElementById('chart').getContext('2d');
        window.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: cd.labels,
                datasets: cd.datasets.map(ds => ({
                    label: ds.name,    // using ds.name from chartData (e.g., "Points")
                    data: ds.values,   // using ds.values
                    borderColor: '#7cd6fd', // customize as needed
                    backgroundColor: 'transparent'
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    });
      

    // ACTIONS
    window.onPlusClick = async (goal, value = 10) => {
        if(value > 0) toast.log(goal.name, signed(value))
        else toast.error(goal.name, signed(value))

        const r = await pb.collection('goalUpdates').create({goal: goal.id, value})
        data.actions.push(["goalUpdate", {...r, goalName: goal.name}])
    }

    window.onUndoClick = async () => {
        const removed = window.data.actions.pop();
        if (!removed) return window.toast.error("Nothing to undo.");
        const [type, payload] = removed;
        switch (type) {
            case "goalUpdate":
                await pb.collection('goalUpdates').delete(payload.id);
                window.toast.undo("Undid goal", payload.goalName, signed(payload.value));
                break;
            default:
                window.toast.error("Unknown action type.");
                break;
        }
    }

    window.onEditClick = async () => {
        data.dialogs.push(['edit'])
    }

    // SUBSCRIPTIONS
    pb.collection('goalUpdates').subscribe('*', () => {
        chartData().then(cd => {
            window.chart.data.labels = cd.labels;
            window.chart.data.datasets.forEach((dataset, index) => {
                const ds = cd.datasets[index];
                dataset.data = ds.values;
            });
            window.chart.update();
        });
        updateGoals();
    })




}


document.addEventListener('alpine:init', () => { 
    window.data = Alpine.reactive(data)
    main()
})
