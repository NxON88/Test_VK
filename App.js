'use strict';

class VKapi {
    constructor(method='users.get', params={}, callback='') {
        this.method   = method;
        this.params   = params;
        this.callback = callback;

        this.createScript();
    }

    encURl(obj) {
        let params = '';
        for (let key in obj) params += `${key}=${obj[key]}&`;
        return params.replace(/\s/g, '&');
    }

    getURL() {
        return `https://api.vk.com/method/${this.method}?${this.encURl(this.params)}&callback=${this.callback}&v=5.5`;
    }

    createScript() {
        let script = document.createElement('script');
        script.src = this.getURL();
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}

const stor = (nameStorage, data) => {
    try{
        if(!localStorage.getItem(nameStorage)){
            localStorage.setItem(nameStorage, JSON.stringify(data));
        }
        return JSON.parse(localStorage.getItem(nameStorage));
    }catch(e){
        localStorage.removeItem(nameStorage);
        return { error: e };
    }
};

const createCard = (id, srcImg, text) => {
    const element = document.getElementById(id);

    const card = document.createElement('div'),
    cardName = document.createElement('div'),
    img      = document.createElement('img');

    card.className      = 'card m-1';
    cardName.className  = 'card-body';
    img.className       = 'card-img-top';

    cardName.innerHTML = text;
    img.src = srcImg;

    card.appendChild(img);
    card.appendChild(cardName);

    element.appendChild(card);
};

const createUser = data => {
    try{
        const storage = data ? stor('user', data) : stor('user');

        document.getElementById('authorization').style.display = 'none';
        document.getElementById('block-user').style.display = 'block';

        const id = storage.response[0].id,
        srcPhoto = storage.response[0].photo_200_orig,
        fullName = `${storage.response[0].first_name} ${storage.response[0].last_name}`,
        photo    = storage.response[0].photo_200_orig;

        createCard('user', srcPhoto, fullName);  
    }catch(e){
        document.getElementById('authorization').style.display = 'block';
        document.getElementById('block-user').style.display = 'none';
        // console.log(e);
    }  
};

const createFrends = data => {
    try{
        const storage = data ? stor('frends', data) : stor('frends');
        const items = storage.response.items;

        items.map((item) => {
            const srcPhoto = item.photo_200_orig,
            fullName = `${item.first_name} ${item.last_name}`;

            createCard('frends', srcPhoto, fullName);
        }); 
    }catch(e){
        // console.log(e);
    }
};

const clearStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('frends');
    localStorage.removeItem('access_token');

    document.getElementById('authorization').style.display = 'block';
    document.getElementById('block-user').style.display = 'none';

};

const start = () => {
    clearStorage();

    const accessToken = document.getElementById('access-token').value;
    
    main(accessToken);
};

const main = (accessToken) => {
    if(!localStorage.getItem('access_token')){

        const access_token = stor('access_token', accessToken);

        const USER = new VKapi('users.get', { fields: 'photo_200_orig', access_token }, 'user');
        const FRENDS = new VKapi('friends.get', { fields: 'photo_200_orig', count: 15, access_token }, 'frends');

        window.user = data => createUser(data);
        window.frends = data => createFrends(data);

    } else {
        createUser();
        createFrends();
    }
}

main();

document.getElementById('close').addEventListener('click', clearStorage);
document.getElementById('start').addEventListener('click', start);

