'use strict';
const express = require('express');
const cors = require('cors');
const pjson = require('./package.json');
const firebase = require('firebase/app');
require('firebase/database');

const admin = require('firebase-admin');
//add your own serviceaccount path
const serviceAccount = require('C:\\Users\\sujay\\Downloads\\cosel-e414d-firebase-adminsdk-yj2by-4358d4774d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://cosel-e414d-default-rtdb.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('1U2CarXeOMX2zCAUFSDnO1ndxuE3tPDYfY3EOOqH7s_M/RCHS_SY2122_2223');
const extracurricularRef = db.ref('1U2CarXeOMX2zCAUFSDnO1ndxuE3tPDYfY3EOOqH7s_M/StudentExtracurricular');

const app = express();
app.use(express.json());
app.use(cors());

// display complete extracurricular data
app.get('/extracurricular', async (req, res) => {
  try {
    console.log('Attempting to fetch extracurricular data...');
    const snapshot = await extracurricularRef.once('value');

    console.log('Snapshot exists:', snapshot.exists());

    if (!snapshot.exists()) {
      console.error('Extracurricular data not found.');
      res.status(404).send('Extracurricular data not found.');
      return;
    }

    const data = snapshot.val();
    console.log('Received data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching extracurricular data:', error);
    res.status(500).send('Error fetching extracurricular data');
  }
});

//  display complete data
app.get('/data', async (req, res) => {
  try {

    const snapshot = await ref.once('value');
    const data = snapshot.val();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/get/:id', async (req, res) => {
  try {
    const id = req.params.id.toLowerCase();
    const snapshot = await ref.once('value');
    const data = snapshot.val();
    res.json(data[id]);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// filter
// search and filter
app.get('/filter', async (req, res) => {
  const { q } = req.query;
  try {
    const snapshot = await ref.once('value');
    const data = snapshot.val();

    const keys = ['courseDif', 'courseCat', 'courseInfo_courseName'];

    const search = (data) => {
      return Object.keys(data).filter((item) =>
        keys.some((key) => item[key].toLowerCase().includes(q))
      );
    };

    q ? res.json(search(ref).slice(0, 10)) : res.json(ref.slice(0, 10));
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/', (req, res) => {
  res.json({
    name: pjson.name,
    version: pjson.version,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
