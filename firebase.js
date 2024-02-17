const admin = require('firebase-admin');
const serviceAccount = require('/Users/jeremyhuang/CorSel-Backend/cosel-e414d-firebase-adminsdk-yj2by-18158a93e7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://cosel-e414d-default-rtdb.firebaseio.com',
});

const firestore = admin.firestore();
const db = admin.database();

module.exports = { firestore, db };
