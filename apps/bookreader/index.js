// Parse params from hash



// State
window.data = {
    openList: false,
    isBookReady: false,
}
window.store = {
    currentBook: null,
    bookList: [],
    booksProgress: {},
    booksLocation: {},
    booksTotal: {},
    ...JSON.parse(localStorage['bookreader-store'] || '{}')
}

document.addEventListener('alpine:init', () => { 
    window.data = Alpine.reactive(data)
    window.store = Alpine.reactive(store)
    Alpine.effect( () => localStorage['bookreader-store'] = JSON.stringify(window.store))
    main()
})


window.perc = () => {
    if(
        !data.isBookReady ||
        store.currentBook == null || 
        !store.booksTotal[store.currentBook.title] ||
        !store.booksProgress[store.currentBook.title]
    ) return ''

    const total = store.booksTotal[store.currentBook.title]
    const loc = book.locations.locationFromCfi(store.booksProgress[store.currentBook.title])
    const p = book.locations.percentageFromCfi(store.booksProgress[store.currentBook.title])
    console.log(loc)

    return `${loc}/${total} - ${(p * 100).toFixed(2)}%`
}

window.main = async() => {
    // OPEN BOOK
    await utils.auth()
    pb.collection('books').getFullList().then( l =>  store.bookList = l)
    
    if(store.currentBook != null){
        const width = window.innerWidth;
        const height = window.innerHeight - 25;
        window.book = ePub( `${utils.serverURL}/api/files/${store.currentBook.collectionId}/${store.currentBook.id}/${store.currentBook.epub}`);

        window.rendition = book.renderTo("bookarea", {width, height, flow:"scrolled-doc", stylesheet: '/book.css'});
        await rendition.display(store.booksProgress[store.currentBook.title] || undefined);
        
        // cache paginations
        book.locations._locations = store.booksLocation[store.currentBook.title] || []
        book.locations.total = store.booksTotal[store.currentBook.title] || 0
        console.log(book.locations._locations)
        if(book.locations._locations.length == 0) {
            console.log("generating")
            window.book.locations.generate(2500).then( () => {
                store.booksLocation[store.currentBook.title] = book.locations._locations
                store.booksTotal[store.currentBook.title] = book.locations.total
            })
        }
        

        rendition.on("relocated", (location) => {
            const {cfi} = location.start
            store.booksProgress[store.currentBook.title] = cfi
            //data.percentage = window.book.locations.percentageFromCfi(cfi);
            console.log(cfi, window.book.locations.percentageFromCfi(cfi))

        })
        data.isBookReady = true
    };
}

