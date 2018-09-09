import firebase from 'firebase'

// Initialize Firebase
const config = {
    apiKey: 'AIzaSyChHs2grC0VGLW9nxoHVlm4D25ef9JiPbA',
    authDomain: 'campfire-8e7c0.firebaseapp.com',
    databaseURL: 'https://campfire-8e7c0.firebaseio.com',
    projectId: 'campfire-8e7c0',
    storageBucket: 'campfire-8e7c0.appspot.com',
    messagingSenderId: '928027097101'
}

firebase.initializeApp(config)
const db = firebase.database()

export { db }