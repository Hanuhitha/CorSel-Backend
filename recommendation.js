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



function separateClassesByYear(finalizedSchedule, allCourses) {
  try {
      // Map finalized schedule to course years
      const scheduledCourses = finalizedSchedule.map(courseId => {
          const course = allCourses.find(course => course && course.courseInfo_courseNumber === courseId);
          return course ? course : null; // Use 'courseYear' for course year
      });

      // Initialize arrays for each year
      const year1 = [];
      const year2 = [];
      const year3 = [];
      const year4 = [];

      // Loop through each course in allCourses
      for (const course of scheduledCourses) {
          // Assuming courseYear property determines the year of the class
          switch (course.courseYear) {
              case 1:
                  year1.push(course);
                  break;
              case 2:
                  year2.push(course);
                  break;
              case 3:
                  year3.push(course);
                  break;
              case 4:
                  year4.push(course);
                  break;
              default:
                  // Handle if course year is not specified or falls outside the expected range
                  console.warn(`Course ${course.courseInfo_courseName} has an invalid year: ${course.courseYear}`);
                  break;
          }
      }

      return { year1, year2, year3, year4 };
  } catch (error) {
      console.error('Error separating classes by year:', error);
      return { year1: [], year2: [], year3: [], year4: [] };
  }
}



function fillYearWithCategory(yearCourses, allCourses, year, classCat) {
  try {
      // Check if there is a class already in yearCourses
      const hasClass = yearCourses.some(course => course.courseCat === classCat);

      // If there is no class, find one in allCourses with courseYear equal to year
      if (!hasClass) {
          const specificClass = allCourses.find(course => course.courseCat === classCat && course.courseYear === year);
          
          // If a class is found, add it to yearCourses
          if (specificClass) {
              yearCourses.push(specificClass);
              console.log(`Added ${specificClass.courseInfo_courseName} class to year ${year} courses`);
          } else {
              console.warn(`No ${classCat} class found for year ${year}`);
          }
      }

      return yearCourses;
  } catch (error) {
      console.error(`Error filling year with ${classCat} class:`, error);
      return yearCourses;
  }
}


function fillYearWithClasses(yearCourses, allCourses, year) {
  fillYearWithCategory(yearCourses, allCourses, year, 'Math');
  fillYearWithCategory(yearCourses, allCourses, year, 'English');
  fillYearWithCategory(yearCourses, allCourses, year, 'Social Studies');
  fillYearWithCategory(yearCourses, allCourses, year, 'Science');
  fillYearWithCategory(yearCourses, allCourses, year, 'Foreign Language');
  fillYearWithCategory(yearCourses, allCourses, year, 'Art');
  fillYearWithCategory(yearCourses, allCourses, year, 'Misc');
  return yearCourses;
}


async function autofillCourses(studentId) {
  try {
    // Fetch student data from Firestore

    res.status(500).send('Error fetching autofillbvhgf');

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



    const { year1, year2, year3, year4 } = separateClassesByYear(finalizedSchedule, allCourses);

    fillYearWithClasses(year1, allCourses, 1);
    fillYearWithClasses(year2, allCourses, 2);
    fillYearWithClasses(year3, allCourses, 3);
    fillYearWithClasses(year4, allCourses, 4);

    const allYears = [...year1, ...year2, ...year3, ...year4];

    const courseIDs = allYears.map(course => course.courseInfo_courseNumber);

    return courseIDs;

  } catch (error) {
    console.error('Error autofilling classes:', error);
    return [];
  }
}


module.exports = {
  generateRecommendations,
  autofillCourses,
};
