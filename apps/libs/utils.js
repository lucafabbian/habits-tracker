window.utils = (() => {
    const serverURL = 'http://130.225.39.113:8090'
    const urlParams = new URLSearchParams(window.location.search)
    if(urlParams.has('password') && urlParams.get('password').length > 4){
        localStorage['password'] = urlParams.get('password')
    }
    if(!localStorage['password'])  localStorage['password'] = prompt('Password?')
    const password = localStorage['password']

    window.pb = new PocketBase(serverURL)
    pb.autoCancellation(false)

    return {
        serverURL,
        auth: () => pb.collection("_superusers").authWithPassword('luca.fabbian.1999@gmail.com', password),
        password,        

    }
})()


document.addEventListener('DOMContentLoaded', () => {
    const notyf = new Notyf( {})
    window.toast = {
        log: (...args) => notyf.success(args.join(' ')),
        error: (...args) => notyf.error(args.join(' ')),
        info: (...args) => notyf.open({background: '#337ab7', icon: {
            className: 'zmdi zmdi-info-outline',
            tagName: 'i', 
            color: 'white'
        }, message: args.join(' ')}),
        undo: (...args) => notyf.open({background: '#337ab7', icon: {
            className: 'zmdi zmdi-undo',
            tagName: 'i',
            color: 'white'
        }, message: args.join(' ')}),
    }
})

