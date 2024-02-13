const admin = require('firebase-admin');
const serviceAccount = require('C:\\Users\\sujay\\Downloads\\cosel-e414d-firebase-adminsdk-yj2by-4358d4774d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://cosel-e414d-default-rtdb.firebaseio.com',
});

const firestore = admin.firestore();
const db = admin.database();

module.exports = { firestore, db };
