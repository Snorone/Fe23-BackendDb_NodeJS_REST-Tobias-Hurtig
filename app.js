import express from "express";
import ejs from "ejs";
import db from "./db.js"
import bodyParser from "body-parser";

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

////////////////Routing////////////////

app.get('/', async (req, res) => {
    const pageTitle = "All tables";
    const sql = 'SHOW tables';
    const [dbData] = await db.query(sql);
    console.log("DATA", dbData);
    res.render('index', {pageTitle, dbData} );
});

let currentTable = "";
app.post('/', async (req, res) => {
    console.log(req.body);
    const tableName = req.body;
    const pageTitle = `${tableName.table_name}`;
    const sql = `SELECT * FROM ${tableName.table_name}`;
    currentTable = tableName.table_name
    const [dbData] = await db.query(sql);
    console.log(dbData);
    res.render('index', {pageTitle, dbData} );
});

app.get('/getStudents', async (req, res) => {
    const sql = `SELECT * FROM students`;
    const dbData = await db.query(sql);
    res.render('index', { dbData} );
});

///// add and remove routing /////////
app.get('/removeData', async (req, res) => {
    const pageTitle = `${currentTable}` ;
    const sql = `SELECT * FROM ${currentTable}`;
    const [dbData] = await db.query(sql);
    console.log(dbData);
    res.render('removeData', {pageTitle, dbData} );
});
app.post('/removeData', async (req, res) => {
    console.log(req.body);
    const requestData = req.body;
    const pageTitle = `${currentTable}`;
    //execute delete query on a table.row
    const sqlDeleteQuery = `DELETE FROM ${currentTable} WHERE id=${requestData.id}`;
    const deleteQuery = await db.query(sqlDeleteQuery);
    console.log(deleteQuery);
    //get table data
    const sql = `SELECT * FROM ${currentTable}`;
    const [dbData] = await db.query(sql);
    //get table headers
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    console.log(dbDataHeaders);
    //show webpage to the user
    res.render('removeData', {pageTitle, dbData, dbDataHeaders} );
});

const students= "students"

app.get('/addStudent', async (req, res) => {
    const pageTitle = `${students}` ;
    const sql = `SELECT * FROM ${students}`;
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('addStudent', {pageTitle, dbData} );
});

app.post('/addStudent', async (req, res) => {
    console.log(req.body);
    const {fName, lName, town} = req.body;
    const sqlAddQuery = `INSERT INTO ${students} (fName, lName, town) values("${fName}", "${lName}", "${town}")`;
    const pageTitle = `${students}`;
    const addQuery = await db.query(sqlAddQuery);
    const sql = `SELECT * FROM ${students}`;
    const dbData = await db.query(sql);
    const sql2 = `DESCRIBE ${students}`;
    const dbDataHeaders = await db.query(sql2);
    res.render('addStudent', {pageTitle, dbData, dbDataHeaders} );
});

const course = "courses";

app.get('/addCourse', async (req, res) => {
    const pageTitle = `${course}` ;
    const sql = `SELECT * FROM ${course}`;
    const [dbData] = await db.query(sql);
    console.log(dbData);
    res.render('addCourse', {pageTitle, dbData} );
});

app.post('/addCourse', async (req, res) => {
    console.log(req.body);
        const{name, description} = req.body;
        const sqlAddQuery = `INSERT INTO ${course} (name, description) values("${name}", "${description}")`;
    
    const pageTitle = `${course}`;
    const addQuery = await db.query(sqlAddQuery);
    const sql = `SELECT * FROM ${course}`;
    const [dbData] = await db.query(sql);
    const sql2 = `DESCRIBE ${course}`;
    const dbDataHeaders = await db.query(sql2);
    res.render('addCourse', {pageTitle, dbData, dbDataHeaders} );
});

const assTable = "students_courses";

app.get('/addAssociation', async (req, res) => {
    const pageTitle = `${assTable}` ;
    const sql = `SELECT * FROM ${assTable}`;
    const [dbData] = await db.query(sql);
    console.log(dbData);
    res.render('addAssociation', {pageTitle, dbData} );
});

app.post('/addAssociation', async (req, res) => {
    console.log(req.body, "Tobbe");
        const{students_id, courses_id} = req.body;
        const sqlAddQuery = `INSERT INTO "${assTable}" ("id", "students_id", "courses_id") values("${students_id}", "${courses_id}")`;    

        
    const pageTitle = `${assTable}`;
    const addQuery = await db.query(sqlAddQuery);
    const sql = `SELECT * FROM ${assTable}`;
    const [dbData] = await db.query(sql);
    const sql2 = `DESCRIBE ${assTable}`;
    const dbDataHeaders = await db.query(sql2);
    res.render('addAssociation', {pageTitle, dbData, dbDataHeaders} );
});


/////////////////API Endpoints/////////////////////

app.get(`/students`, async (req, res) => {
       const sql = `SELECT * FROM students`;
    const [dbData] = await db.query(sql);
    res.json(dbData);
});

app.get('/courses', async (req, res) => {
    const sql = `SELECT * FROM courses`;
    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});

app.get('/studentcourses', async (req, res) => {
    const sql = `SELECT * FROM students_courses`;
    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});

app.get('/students/id/:id', async (req, res) => {
    const id = req.params.id
    const sql = `SELECT students.lName as LastName, courses.name  as CourseName
    FROM students
    INNER JOIN students_courses ON students_courses.students_id = students.id 
    INNER JOIN courses ON students_courses.courses_id = courses.id  where students.id = ${id};
    `;
    const [dbData] = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});

app.get(`/students/fname/:fName`, async (req, res) => {
    console.log(req.params.fName);
    const fName = req.params.fName
    const sql = `SELECT students.fName, courses.name 
    FROM students 
    INNER JOIN students_courses ON students.id = students_courses.students_id 
    INNER JOIN courses ON students_courses.courses_id = courses.id 
    WHERE students.fName = ?`;
    console.log(sql);
    const [dbData] = await db.query(sql, [fName]);
    console.log(fName);
    res.json(dbData);
});


app.get(`/students/lname/:lName`, async (req, res) => {
    const lName = req.params.lName
    const sql = `SELECT students.lName, courses.name 
    FROM students 
    INNER JOIN students_courses ON students.id = students_courses.students_id 
    INNER JOIN courses ON students_courses.courses_id = courses.id 
    WHERE students.lName = ?`;
    const [dbData] = await db.query(sql, [lName]);
    res.json(dbData);
});

app.get(`/students/town/:town`, async (req, res) => {
    const town = req.params.town
    const sql = `SELECT students.town, courses.name 
    FROM students 
    INNER JOIN students_courses ON students.id = students_courses.students_id 
    INNER JOIN courses ON students_courses.courses_id = courses.id 
    WHERE students.town = ?`;
    
    const [dbData] = await db.query(sql, [town]);
    res.json(dbData);
    console.log(town, sql);
});


app.get('/courses/id/:id', async (req, res) => {
    const id = req.params.id
    const sql = `SELECT  students.fName as firstName, students.lName as LastName, courses.name  as CourseName
    FROM students 
    INNER JOIN students_courses ON students_courses.students_id = students.id 
    INNER JOIN courses ON students_courses.courses_id = courses.id
    WHERE courses.id = ${id};
    `;
    const [dbData] = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});

app.get('/courses/name/:name', async (req, res) => {
    const name = req.params.name
    const sql = `SELECT students.fName as firstName, students.lName as LastName, courses.name  as CourseName
    FROM students 
    INNER JOIN students_courses ON students_courses.students_id = students.id 
    INNER JOIN courses ON students_courses.courses_id = courses.id
    WHERE courses.name = "${name}";
    `;
    const [dbData] = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});


app.get('/courses/partofname/:name', async (req, res) => {
    const name = req.params.name
    const sql = `SELECT students.fName as firstName, students.lName as LastName, courses.name  as CourseName
    FROM students 
    INNER JOIN students_courses ON students_courses.students_id = students.id 
    INNER JOIN courses ON students_courses.courses_id = courses.id
    WHERE courses.name LIKE "%${name}%";
    `;
    const [dbData] = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});

app.get('/courses/partofdescription/:description', async (req, res) => {
    const description = req.params.description
    const sql = `SELECT students.fName as firstName, students.lName as LastName, courses.name  as CourseName
    FROM students 
    INNER JOIN students_courses ON students_courses.students_id = students.id 
    INNER JOIN courses ON students_courses.courses_id = courses.id
    WHERE courses.description LIKE "%${description}%";
    `;
    const [dbData] = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});


app.use((err, req, res, next) => {
    console.log("SERVER ERROR: ", err);
});

//server configuration
const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});