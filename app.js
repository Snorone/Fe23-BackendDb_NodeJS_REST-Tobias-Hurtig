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
    try {
        const pageTitle = "All tables";
        const sql = 'SHOW tables';
        const [dbData] = await db.query(sql);
        console.log("DATA", dbData);
        res.render('index', {pageTitle, dbData} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching tables' });
    }
});

let currentTable = "";
app.post('/', async (req, res) => {
    try {
        console.log(req.body);
        const tableName = req.body;
        const pageTitle = `${tableName.table_name}`;
        const sql = `SELECT * FROM ${tableName.table_name}`;
        currentTable = tableName.table_name;
        const [dbData] = await db.query(sql);
        console.log(dbData);
        res.render('index', {pageTitle, dbData} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching table data' });
    }
});

app.get('/getStudents', async (req, res) => {
    try {
        const sql = `SELECT * FROM students`;
        const dbData = await db.query(sql);
        res.render('index', { dbData} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching students' });
    }
});

app.get('/removeData', async (req, res) => {
    try {
        const pageTitle = `${currentTable}`;
        const sql = `SELECT * FROM ${currentTable}`;
        const [dbData] = await db.query(sql);
        console.log(dbData);
        res.render('removeData', {pageTitle, dbData} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching data for removal' });
    }
});

app.post('/removeData', async (req, res) => {
    try {
        console.log(req.body);
        const requestData = req.body;
        const pageTitle = `${currentTable}`;
        //execute delete query on a table.row
        const sqlDeleteQuery = `DELETE FROM ${currentTable} WHERE id=${requestData.id}`;
        await db.query(sqlDeleteQuery);
        //get table data
        const sql = `SELECT * FROM ${currentTable}`;
        const [dbData] = await db.query(sql);
        //get table headers
        const sql2 = `DESCRIBE ${currentTable}`;
        const dbDataHeaders = await db.query(sql2);
        console.log(dbDataHeaders);
        //show webpage to the user
        res.render('removeData', {pageTitle, dbData, dbDataHeaders} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while removing data' });
    }
});

const students = "students";

app.get('/addStudent', async (req, res) => {
    try {
        const pageTitle = `${students}`;
        const sql = `SELECT * FROM ${students}`;
        const dbData = await db.query(sql);
        console.log(dbData);
        res.render('addStudent', {pageTitle, dbData} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching students' });
    }
});

app.post('/addStudent', async (req, res) => {
    try {
        console.log(req.body);
        const { fName, lName, town } = req.body;
        const sqlAddQuery = `INSERT INTO ${students} (fName, lName, town) values("${fName}", "${lName}", "${town}")`;
        const pageTitle = `${students}`;
        await db.query(sqlAddQuery);
        const sql = `SELECT * FROM ${students}`;
        const dbData = await db.query(sql);
        const sql2 = `DESCRIBE ${students}`;
        const dbDataHeaders = await db.query(sql2);
        res.render('addStudent', {pageTitle, dbData, dbDataHeaders} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while adding a student' });
    }
});

const course = "courses";

app.get('/addCourse', async (req, res) => {
    try {
        const pageTitle = `${course}`;
        const sql = `SELECT * FROM ${course}`;
        const [dbData] = await db.query(sql);
        console.log(dbData);
        res.render('addCourse', {pageTitle, dbData} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching courses' });
    }
});

app.post('/addCourse', async (req, res) => {
    try {
        console.log(req.body);
        const { name, description } = req.body;
        const sqlAddQuery = `INSERT INTO ${course} (name, description) values("${name}", "${description}")`;
        const pageTitle = `${course}`;
        await db.query(sqlAddQuery);
        const sql = `SELECT * FROM ${course}`;
        const [dbData] = await db.query(sql);
        const sql2 = `DESCRIBE ${course}`;
        const dbDataHeaders = await db.query(sql2);
        res.render('addCourse', {pageTitle, dbData, dbDataHeaders} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while adding a course' });
    }
});

const assTable = "students_courses";

app.get('/addAssociation', async (req, res) => {
    try {
        const pageTitle = `${assTable}`;
        const sql = `SELECT * FROM ${assTable}`;
        const [dbData] = await db.query(sql);
        console.log(dbData);
        res.render('addAssociation', {pageTitle, dbData} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching associations' });
    }
});

app.post('/addAssociation', async (req, res) => {
    try {
        console.log(req.body, "Tobbe");
        const { students_id, courses_id } = req.body;
        const sqlAddQuery = 'INSERT INTO students_courses (students_id, courses_id) VALUES (?, ?)';
        const sqlParams = [students_id, courses_id];

        const pageTitle = `${assTable}`;
        await db.query(sqlAddQuery, sqlParams);

        const sql = 'SELECT * FROM students_courses';
        const [dbData] = await db.query(sql);
        const sql2 = `DESCRIBE ${assTable}`;
        const dbDataHeaders = await db.query(sql2);
        res.render('addAssociation', {pageTitle, dbData, dbDataHeaders} );
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while adding an association' });
    }
});

/////////////////API Endpoints/////////////////////

app.get('/students', async (req, res) => {
    try {
        const sql = `SELECT * FROM students`;
        const [dbData] = await db.query(sql);
        res.json(dbData);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching students' });
    }
});

app.get('/courses', async (req, res) => {
    try {
        const sql = `SELECT * FROM courses`;
        const dbData = await db.query(sql);
        console.log(dbData);
        res.json(dbData);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching courses' });
    }
});

app.get('/studentcourses', async (req, res) => {
    try {
        const sql = `SELECT * FROM students_courses`;
        const dbData = await db.query(sql);
        console.log(dbData);
        res.json(dbData);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching student courses' });
    }
});

app.get('/students/id/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const sql = `SELECT students.lName as LastName, courses.name as CourseName
                     FROM students
                     INNER JOIN students_courses ON students_courses.students_id = students.id 
                     INNER JOIN courses ON students_courses.courses_id = courses.id  
                     WHERE students.id = ${id}`;
        const [dbData] = await db.query(sql);
        console.log(dbData);
        res.json(dbData);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching student data by ID' });
    }
});

app.get('/students/fname/:fName', async (req, res) => {
    try {
        console.log(req.params.fName);
        const fName = req.params.fName;
        const sql = `SELECT students.fName, courses.name 
                     FROM students 
                     INNER JOIN students_courses ON students.id = students_courses.students_id 
                     INNER JOIN courses ON students_courses.courses_id = courses.id 
                     WHERE students.fName = ?`;
        console.log(sql);
        const [dbData] = await db.query(sql, [fName]);
        console.log(fName);
        res.json(dbData);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});

app.get('/students/lname/:lName', async (req, res) => {
    try {
        const lName = req.params.lName;
        const sql = `SELECT students.lName, courses.name 
                     FROM students 
                     INNER JOIN students_courses ON students.id = students_courses.students_id 
                     INNER JOIN courses ON students_courses.courses_id = courses.id 
                     WHERE students.lName = ?`;
        const [dbData] = await db.query(sql, [lName]);
        res.json(dbData);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});

app.get('/students/town/:town', async (req, res) => {
    try {
        const town = req.params.town;
        const sql = `SELECT students.town, courses.name 
                     FROM students 
                     INNER JOIN students_courses ON students.id = students_courses.students_id 
                     INNER JOIN courses ON students_courses.courses_id = courses.id 
                     WHERE students.town = ?`;
        const [dbData] = await db.query(sql, [town]);
        res.json(dbData);
        console.log(town, sql);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});

app.get('/courses/id/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const sql = `SELECT students.fName as firstName, students.lName as LastName, courses.name as CourseName
                     FROM students 
                     INNER JOIN students_courses ON students_courses.students_id = students.id 
                     INNER JOIN courses ON students_courses.courses_id = courses.id
                     WHERE courses.id = ?`;
        const [dbData] = await db.query(sql, [id]);
        console.log(dbData);
        res.json(dbData);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});

app.get('/courses/name/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const sql = `SELECT students.fName as firstName, students.lName as LastName, courses.name as CourseName
                     FROM students 
                     INNER JOIN students_courses ON students_courses.students_id = students.id 
                     INNER JOIN courses ON students_courses.courses_id = courses.id
                     WHERE courses.name = ?`;
        const [dbData] = await db.query(sql, [name]);
        console.log(dbData);
        res.json(dbData);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});

app.get('/courses/partofname/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const sql = `SELECT students.fName as firstName, students.lName as LastName, courses.name as CourseName
                     FROM students 
                     INNER JOIN students_courses ON students_courses.students_id = students.id 
                     INNER JOIN courses ON students_courses.courses_id = courses.id
                     WHERE courses.name LIKE ?`;
        const [dbData] = await db.query(sql, [`%${name}%`]);
        console.log(dbData);
        res.json(dbData);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});

app.get('/courses/partofdescription/:description', async (req, res) => {
    try {
        const description = req.params.description;
        const sql = `SELECT students.fName as firstName, students.lName as LastName, courses.name as CourseName
                     FROM students 
                     INNER JOIN students_courses ON students_courses.students_id = students.id 
                     INNER JOIN courses ON students_courses.courses_id = courses.id
                     WHERE courses.description LIKE ?`;
        const [dbData] = await db.query(sql, [`%${description}%`]);
        console.log(dbData);
        res.json(dbData);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data.');
    }
});

//////////////////////////////////////////////////////



app.use((err, req, res, next) => {
    console.log("SERVER ERROR: ", err);
});

//server configuration
const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});