// Parse params from hash



// State
window.data = JSON.parse(localStorage['bookreader-data'] || JSON.stringify({
    currentBook: null,
    bookList: [],
    booksProgress: {},
}))
document.addEventListener('alpine:init', () => { 
    window.data = Alpine.reactive(data)
    Alpine.effect( () => localStorage['bookreader-data'] = JSON.stringify(window.data))
    main()
})



window.main = async() => {
    // OPEN BOOK
    await utils.auth()
    pb.collection('books').getFullList().then( l =>  data.bookList = l)
    
    if(data.currentBook !== null){
        const width = window.innerWidth;
        const height = window.innerHeight - 20;
        var book = ePub("books/montecristo.epub");
        window.rendition = book.renderTo("bookarea", {width, height, flow:"scrolled-doc"});
        rendition.display(localStorage['index1'] || undefined);
    
        rendition.on("relocated", (location) => {
            localStorage['index1'] = location.start.cfi
    
    }
        /*const iframe = document.querySelector('#bookarea iframe');
        const irect = iframe.getBoundingClientRect()
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            const isInside = rect.left + irect.left >= -20 &&
                rect.right + irect.left <= (width + 40)
    
            
            el.style.userSelect = isInside ? 'default' : 'none'
            el.style.pointerEvents = isInside ? 'default' : 'none'
            el.style.visibility = isInside ? 'visible' : 'hidden';
    
        })*/


    });
    rendition.on("rendered", () => {
        console.log("new renderrr")
    });
}

