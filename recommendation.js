const admin = require('firebase-admin');
const { firestore, db } = require('./firebase');

// Function to fetch student data from Firestore
async function getStudentData(studentId) {
  try {
    const studentRef = firestore.collection('users').doc(studentId);
    const snapshot = await studentRef.get();

    if (!snapshot.exists) {
      console.error('Student not found.');
      return null;
    }

    return snapshot.data();
  } catch (error) {
    console.error('Error fetching student data:', error);
    return null;
  }
}

// Helper function to identify missing course categories
function identifyMissingCategories(finalizedSchedule, allCourses) {
    try {
      const scheduledCourses = finalizedSchedule.map(courseId => {
        const course = allCourses.find(course => course && course.courseInfo_courseNumber === courseId);
        return course ? course.courseCat : null; // Use 'courseCat' for course category
      });
  
      const scheduledCategories = new Set(scheduledCourses.filter(category => category !== null));
      const allCategories = new Set(allCourses.map(course => course ? course.courseCat : null));
  
      // Identify missing categories
      const missingCategories = [...allCategories].filter(category => !scheduledCategories.has(category));

      console.log(missingCategories)
      return missingCategories;
    } catch (error) {
      console.error('Error identifying missing categories:', error);
      return [];
    }
  }

  // Helper function to get recommended courses based on missing categories
async function getRecommendedCoursesByCategories(missingCategories, allCourses, studentSchedule, maxCoursesPerCategory = 10) {
    try {
      const recommendedCourses = [];
  
      // Iterate through missing categories
      for (const category of missingCategories) {
        const categoryCourses = allCourses.filter(course => 
          course.courseCat === category && !studentSchedule.includes(course.courseInfo_courseNumber)
        );
  
        // Add up to maxCoursesPerCategory courses from the category to the recommendations
        recommendedCourses.push(...categoryCourses.slice(0, maxCoursesPerCategory));
      }
  
      return recommendedCourses;
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      return [];
    }
}

// Modify generateRecommendations function
async function generateRecommendations(studentId) {
    try {
      // Fetch student data from Firestore
      const studentData = await getStudentData(studentId);
  
      if (!studentData) {
        console.error('Student data not found.');
        return [];
      }
  
      const { finalizedSchedule } = studentData;
  
      // Fetch the complete list of courses from the Realtime Database
      const coursesRef = db.ref('1U2CarXeOMX2zCAUFSDnO1ndxuE3tPDYfY3EOOqH7s_M/RCHS_SY2122_2223');
      const coursesSnapshot = await coursesRef.once('value');
  
      const allCourses = [];
      coursesSnapshot.forEach((courseSnapshot) => {
        const courseData = courseSnapshot.val();
        allCourses.push({
          CourseDifficulty: courseData.CourseDifficulty,
          CourseSem: courseData.CourseSem,
          Credits: courseData.Credits,
          cal_name: courseData.cal_name,
          courseCat: courseData.courseCat,
          courseDif: courseData.courseDif,
          courseInfo_courseName: courseData.courseInfo_courseName,
          courseInfo_courseNumber: courseData.courseInfo_courseNumber,
          courseYear: courseData.courseYear,
          max_capacity: courseData.max_capacity,
          sch_name: courseData.sch_name,
          sectionInfo_sectionNumber: courseData.sectionInfo_sectionNumber,
          sectionInfo_teacherDisplay: courseData.sectionInfo_teacherDisplay,
        });
      });
  
      // Identify the categories of courses the student is missing
      const missingCategories = identifyMissingCategories(finalizedSchedule, allCourses);
  
      // Recommend up to 10 courses per missing category, excluding those already in the schedule
      const recommendedCourses = await getRecommendedCoursesByCategories(
        missingCategories, 
        allCourses,
        finalizedSchedule,
        10
      );
      
      return recommendedCourses;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
}

module.exports = {
  generateRecommendations,
};
