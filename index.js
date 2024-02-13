'use strict';
const express = require('express');
const cors = require('cors');
const pjson = require('./package.json');
const firebase = require('firebase/app');
require('firebase/database');
const recommendation = require('./recommendation');
const { db } = require('./firebase');

const ref = db.ref('1U2CarXeOMX2zCAUFSDnO1ndxuE3tPDYfY3EOOqH7s_M/RCHS_SY2122_2223');
const extracurricularRef = db.ref('1U2CarXeOMX2zCAUFSDnO1ndxuE3tPDYfY3EOOqH7s_M/StudentExtracurricular');
const volunteerOpportunitiesRef = db.ref('1U2CarXeOMX2zCAUFSDnO1ndxuE3tPDYfY3EOOqH7s_M/VolunteerHours');

const app = express();
app.use(express.json());
app.use(cors());

// Import recommendation functions
const { getStudentData, generateRecommendations } = require('./recommendation');

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

// add this endpoint to handle extracurricular submissions
app.post('/extracurricular', async (req, res) => {
  try {
    const extracurricularData = req.body; // assuming the extracurricular data is sent in the request body
    const { activityName, ...restData } = extracurricularData;

    // Use activityName as the key for extracurricular data
    await extracurricularRef.child(activityName).set({
      ...restData,
      activityName: activityName, // Include activityName as a separate field
    });

    console.log('Extracurricular added successfully');
    res.json({ message: 'Extracurricular added successfully' });
  } catch (error) {
    console.error('Error adding extracurricular:', error);
    res.status(500).send('Error adding extracurricular');
  }
});

// display complete data
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

// add this endpoint to handle extracurricular submissions
app.post('/data', async (req, res) => {
  try {
    const classData = req.body; // assuming the extracurricular data is sent in the request body
    const { courseInfo_courseName, ...restData } = classData;

    // Use activityName as the key for extracurricular data
    await ref.child(courseInfo_courseName).set({
      ...restData,
      courseInfo_courseName: courseInfo_courseName, // Include activityName as a separate field
    });

    console.log('Class added successfully');
    res.json({ message: 'Class added successfully' });
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).send('Error adding class');
  }
});

// display complete volunteer opportunities data
app.get('/volunteeropportunities', async (req, res) => {
  try {
    console.log('Attempting to fetch volunteer opportunities data...');
    const snapshot = await volunteerOpportunitiesRef.once('value');

    console.log('Snapshot exists:', snapshot.exists());

    if (!snapshot.exists()) {
      console.error('Volunteer opportunities data not found.');
      res.status(404).send('Volunteer opportunities data not found.');
      return;
    }

    const data = snapshot.val();
    console.log('Received data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching volunteer opportunities data:', error);
    res.status(500).send('Error fetching volunteer opportunities data');
  }
});

// add this endpoint to handle volunteer opportunities submissions
app.post('/volunteeropportunities', async (req, res) => {
  try {
    const volunteerOpportunityData = req.body; // assuming the volunteer opportunity data is sent in the request body
    const { title, ...restData } = volunteerOpportunityData;

    // Use title as the key for volunteer opportunity data
    await volunteerOpportunitiesRef.child(title).set({
      ...restData,
      title: title, // Include title as a separate field
    });

    console.log('Volunteer opportunity added successfully');
    res.json({ message: 'Volunteer opportunity added successfully' });
  } catch (error) {
    console.error('Error adding volunteer opportunity:', error);
    res.status(500).send('Error adding volunteer opportunity');
  }
});

// Add this function for course recommendations
app.post('/api/recommendations', async (req, res) => {
  try {
    const studentId = req.body.studentId; // Assuming the student ID is provided in the request body
    const studentData = await getStudentData(studentId);

    if (!studentData) {
      console.error('Student data not found.');
      res.status(404).send('Student data not found.');
      return;
    }

    // Replace this with your actual recommendation logic based on the student's data
    const recommendations = await generateRecommendations(studentData);

    console.log('Recommendations:', recommendations);
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).send('Error generating recommendations');
  }
});

// Add this endpoint to display recommended courses
app.get('/api/recommended-courses/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId; // Get studentId from the URL parameter
    const studentData = await getStudentData(studentId);

    if (!studentData) {
      console.error('Student data not found.');
      res.status(404).send('Student data not found.');
      return;
    }

    // Replace this with your actual recommendation logic based on the student's data
    const recommendations = await generateRecommendations(studentData);

    console.log('Recommendations:', recommendations);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).send('Error fetching recommendations');
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
