'use strict';
const express = require("express");
const cors = require("cors");
const pjson = require('./package.json');
var firebase = require("firebase/app");
require('firebase/database');
let app = express();
app.use(express.json());
app.use(cors());

const admin = require('firebase-admin');
const serviceAccount = require('/Users/hanuhithadondapati/Desktop/CorSel-Backend/cosel-e414d-firebase-adminsdk-yj2by-18158a93e7.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cosel-e414d-default-rtdb.firebaseio.com",
});

const db = admin.database();
const ref = db.ref('1U2CarXeOMX2zCAUFSDnO1ndxuE3tPDYfY3EOOqH7s_M/RCHS_SY2122_2223');


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

//  search by course name

app.get('/search/:value', async (req, res) => {
  try {
    const searchTerm = req.params.value.toLowerCase();
    const snapshot = await ref.once('value');
    var data = snapshot.val();
    const filteredData=Object.keys(data).filter((key)=>{
      const val=data[key]
      for(const i in val){
        if (typeof val[i]=="string" && String(val[i]).toLowerCase().includes(searchTerm) ){
          console.log("True",val)
          return true
        }
      } 
      return false
    }).map((key)=>data[key])
    res.json(filteredData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/searchByField', async (req, res) => {
  try {

    const courseDif= req?.query?.courseDif?.toLowerCase()
    const courseCat=req?.query?.courseCat?.toLowerCase()
    const courseName=req?.query?.courseName?.toLowerCase()
    const snapshot = await ref.once('value');
    var data = snapshot.val();
    const filteredData=Object.keys(data).filter((key)=>{
      const val=data[key]
      const keys = ["courseDif", "courseCat", "courseInfo_courseName"]
      if((courseDif && String(val["courseDif"]).toLowerCase().includes(courseDif)) || ( courseCat && String(val["courseCat"]).toLowerCase().includes(courseCat) )|| ( courseName && String(val["courseName"]).toLowerCase().includes(courseName))){
          return true
        }
      return false
    }).map((key)=>data[key])
    res.json(filteredData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

//  filter
app.get("/filter", async (req, res) => {
  const { q } = req.query;
  const snapshot = await ref.once('value');
  const data = snapshot.val();
  res.json(data);

  const keys = ["courseDif", "courseCat", "courseInfo_courseName"];

  const search = (data) => {
    return Object.keys(data).filter((item) =>
      keys.some((key) => item[key].toLowerCase().includes(q))
    );
  };

  q ? res.json(search(ref).slice(0, 10)) : res.json(ref.slice(0, 10));
});


app.get('/', (req, res) => {
  res.json({
    name: pjson.name,
    version: pjson.version,
  })
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;