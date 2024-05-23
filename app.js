//in dev run nodemon with for instant reload
//add requiered library 
//const express =  require('express'); //must be installed with npm
import express from "express";
//const ejs = require('ejs'); //must be installed with npm
import ejs from "ejs";
//const db = require('./db.js'); // Import the database module
import db from "./db.js"
//const bodyParser = require('body-parser');//must be installed with npm
import bodyParser from "body-parser";


//create variable representing express
const app = express();

//set public folder for static web pages
app.use(express.static('public'));

//set dynamic web pages, set views and engine
app.set('view engine', 'ejs');

// Set up body parser middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
// Use body-parser middleware to send JSON data
app.use(bodyParser.json());


////////////////Routing

app.get('/', async (req, res) => {
    const pageTitle = "All tables";
    const sql = 'SHOW tables';
    const [dbData] = await db.query(sql);
    console.log("DATA", dbData);
    res.render('index', {pageTitle, dbData} );
});

// app.get('/students', async (req, res) => {
//     const pageTitle = "Dynamic webpage";
//     const sql = 'select * from students';
//     const [dbData] = await db.query(sql);
//     console.log("DATA", dbData);
//     //res.render('test', {pageTitle, dbData});
//     res.render('index', {pageTitle, dbData} );
// });

let currentTable = "students";
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

// app.post('/addData', async (req, res) => {
//     console.log(req.body);
//     const tableName = req.body;
//     const pageTitle = `${tableName.table_name}`;
//     const sql = `SELECT * FROM ${tableName.table_name}`;
//     currentTable = tableName.table_name
//     const [dbData] = await db.query(sql);
//     console.log(dbData);
//     res.render('index', {pageTitle, dbData} );
// });

app.get('/students', async (req, res) => {
    let sql = "";
    const {id} = req.query;
    console.log(id);
    if(id){
        sql = `SELECT * FROM students WHERE id = ${id}`;
    }else{
        sql = `SELECT * FROM students`;
    }
    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});



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
    const pageTitle = "Dynamic webpage";
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
    // if(currentTable ==="students"){
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
    console.log(addQuery);
    //get table data
    const sql = `SELECT * FROM ${students}`;
    const dbData = await db.query(sql);
    //get table headers
    const sql2 = `DESCRIBE ${students}`;
    const dbDataHeaders = await db.query(sql2);
    console.log(dbDataHeaders);
    //show webpage to the user
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
    console.log(addQuery);
    //get table data
    const sql = `SELECT * FROM ${course}`;
    const [dbData] = await db.query(sql);
    //get table headers
    const sql2 = `DESCRIBE ${course}`;
    const dbDataHeaders = await db.query(sql2);
    console.log(dbDataHeaders);
    //show webpage to the user
    res.render('addCourse', {pageTitle, dbData, dbDataHeaders} );
});


app.use((err, req, res, next) => {
    console.log("SERVER ERROR: ", err);
});

//server configuration
const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});