const Joi = require('joi');
const express = require('express');
const app = express();
const courses = require('./Courses');
const students = require('./Students');

// adds middleware in the request pipeline
app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    next();
  });

// > export PORT=someport
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}....`));

app.get('/', (req, res) => {
    res.send('Student Admin - API Demo');
});

// return all courses
app.get('/v1/courses', (req, res) => {
    console.log(req.query);
    res.send(courses);
});

// return the course using the given id
app.get('/v1/courses/:id', (req,res)=>{
   const course = courses.find(c => c.id === parseInt(req.params.id));
   if(!course) return res.status(404).send('The course for the given id was not found.');
   res.send(course);
});

// add a new course and return the new object
app.post('/v1/courses', (req,res) => {
    // validate using joi - validation logic has been put into a function so that we can reuse in post and put
    const { error } = validateCourse(req.body); // result.error - object destructuring
    if(error) return res.status(400).send(error.details[0].message);
 
    const course = {
    id: courses.length + 1,
    name: req.body.name,
    code: req.body.code,
    credit: req.body.credit,
    department_code: req.body.department_code,
    semester_offered: req.body.semester_offered
    };

    courses.push(course);
    res.send(course);
});

app.put('/v1/courses/:id', (req,res) => {
    //look up the course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course for the given id was not found.');
    
    const { error } = validateCourse(req.body); // result.error - object destructuring
    if(error) return res.status(400).send(error.details[0].message);  
    
    // update the course
    course.name = req.body.name;
    course.code = req.body.code;
    course.credit = req.body.credit;
    course.department_code = req.body.department_code;
    course.semester_offered = req.semester_offered;
    res.send(course);
});

app.delete('/v1/courses/:id', (req, res) => {
    // lookup the course -- if it doesn't exist return 404
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course for the given id was not found.');
    // delete
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    // return the deleted course
    res.send(course);
})

// Sanitize input values - if values do not fit the schema return validation message
function validateCourse(course){
    const schema = {
        name: Joi.string().min(3).required(),
        code: Joi.string().max(8).required(),
        credit: Joi.number().min(2).max(4),
        department_code: Joi.string().max(4),
        semester_offered: Joi.string().valid('Summer', "Fall", "Spring"),
        //registered_students: Joi.array()
    };
    return Joi.validate(course,schema);
}

// return all students
// accepts optional parameter for filtering students by the given course id
app.get('/v1/students', (req, res) => {
    if(req.query.course_id > 0){
        const course_student_list= [];
        const course = courses.find(c => c.id === parseInt(req.query.course_id));
        if(course){
            course.registered_students.forEach(element => {
                let student = students.find(s => s.id === parseInt(element));
                course_student_list.push(student);
            });
        }
    if(course_student_list.length == 0) res.status(404).send('No students found for the specified parameters.');
    res.send(course_student_list);
    }
    res.send(students);
});

// return the student using the given id
app.get('/v1/students/:id', (req,res)=>{
    const student = students.find(s => s.id === parseInt(req.params.id));
    if(!student) return res.status(404).send('A student for the given id was not found.');
    res.send(student);
 });
 
 // return courses for the given student_id
 app.get('/v1/students/:student_id/courses', (req, res) => {
    const student_course_list = [];
     courses.forEach(course => {
       if(course.registered_students.includes(parseInt(req.params.student_id)))
                student_course_list.push(course)      
     });
    if(student_course_list.length == 0) res.status(404).send('No students found for the specified parameters.');
    res.send(student_course_list);
 });

