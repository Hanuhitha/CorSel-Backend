const { db } = require('./index');

// Function to fetch student data
async function getStudentData(studentId) {
  try {
    const studentRef = db.collection('users').doc(studentId); // Assuming 'users' is the collection name
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

// Function to generate course recommendations
async function generateRecommendations(studentId) {
  try {
    // Fetch student data including the finalized schedule
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
        courseName: courseData.courseInfo_courseName,
        courseId: courseSnapshot.key, // Using the key as the courseId
        courseCategory: courseData.courseCategory,
      });
    });

    // Identify the categories of courses the student is missing
    const missingCategories = identifyMissingCategories(finalizedSchedule, allCourses);

    // Recommend courses from missing categories
    const recommendedCourses = await getRecommendedCoursesByCategories(missingCategories, allCourses);

    return recommendedCourses;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

// Helper function to identify missing course categories
function identifyMissingCategories(finalizedSchedule, allCourses) {
  const scheduledCourses = finalizedSchedule.map(courseId => allCourses.find(course => course.courseId === courseId));
  const scheduledCategories = new Set(scheduledCourses.map(course => course.courseCategory));
  const allCategories = new Set(allCourses.map(course => course.courseCategory));

  // Identify missing categories
  const missingCategories = [...allCategories].filter(category => !scheduledCategories.has(category));

  return missingCategories;
}

// Helper function to get recommended courses based on missing categories
async function getRecommendedCoursesByCategories(missingCategories, allCourses) {
  try {
    const recommendedCourses = [];

    // Filter courses based on missing categories
    for (const category of missingCategories) {
      const categoryCourses = allCourses.filter(course => course.courseCategory === category);

      // Add a course from each category to the recommendations (you can customize this logic)
      if (categoryCourses.length > 0) {
        recommendedCourses.push(categoryCourses[0]);
      }
    }

    return recommendedCourses;
  } catch (error) {
    console.error('Error fetching recommended courses:', error);
    return [];
  }
}

module.exports = {
  getStudentData,
  generateRecommendations,
};
