const { db } = require('./index');

// Function to fetch student data
async function getStudentData(studentId) {
  try {
    const studentRef = db.collection('students').doc(studentId);
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
async function generateRecommendations(studentData) {
  // Example logic: Recommend courses based on the student's interests, past courses, etc.
  // For simplicity, let's assume a content-based filtering approach here
  const interests = studentData.interests || [];
  const pastCourses = studentData.courses || [];

  // Your recommendation logic here based on interests, pastCourses, etc.
  // For now, let's recommend courses that match the student's interests
  const recommendedCourses = await getRecommendedCoursesByInterests(interests);

  return recommendedCourses;
}

async function getRecommendedCoursesByInterests(interests) {
  try {
    // Fetch courses from the database that match the student's interests
    const coursesRef = db.collection('courses');
    const snapshot = await coursesRef.where('courseCategory', 'in', interests).get();

    const recommendedCourses = [];

    snapshot.forEach((doc) => {
      const courseData = doc.data();
      recommendedCourses.push({
        courseName: courseData.courseInfo_courseName,
        courseId: doc.id,
      });
    });

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
