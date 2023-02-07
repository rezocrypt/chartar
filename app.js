// Including main libraries
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');
const md5 = require("md5");
const app = express();
const port = 8080;
const fs = require('fs');



// Function for adding new student
function add_student(body) {
	let filename = "files/users/" + md5(body["passport"]) + ".json"
	function cb() { }
	let content = {}
	content["name"] = body.name
	content["surname"] = body["surname"]
	content["address"] = body["address"]
	content["passport"] = body["passport"]
	content["work_status"] = body["work_status"]
	fs.writeFile(filename, JSON.stringify(content), cb)

	let new_content = JSON.parse(fs.readFileSync('data/students.json', 'utf8'));
	new_content[body["passport"]] = md5(body["passport"])
	fs.writeFileSync('data/students.json', JSON.stringify(new_content));
}


function update_student(req) {
	let content = JSON.parse(fs.readFileSync(`files/users/${req.params.id}.json`, 'utf8'));
	function cb() { }
	content["name"] = req.body.name
	content["surname"] = req.body["surname"]
	content["address"] = req.body["address"]
	content["passport"] = req.body["passport"]
	content["work_status"] = req.body["work_status"]
	fs.writeFile(`files/users/${req.params.id}.json`, JSON.stringify(content), cb)
}

// Configuring server
app.use(express.static("./public"))
app.use(fileUpload());
app.use(express.static('files'))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.get('/', (req, res) => {
	res.redirect("/home")
})
app.get('/home', (req, res) => {
	if (req.cookies["login"] != "true") {res.redirect("/login")}
	if (req.cookies["login"] == "true") {
		let content = JSON.parse(fs.readFileSync('data/students.json', 'utf8'));
		let data = []
		for (let user in content) {
			let one_data = []
			student_content = JSON.parse(fs.readFileSync(`files/users/${content[user]}.json`, 'utf8'));
			one_data["name"] = student_content["name"]
			one_data["surname"] = student_content["surname"]
			one_data["passport"] = student_content["passport"]
			one_data["id"] = md5(student_content["passport"])
			one_data["profilepicture"] = "photos/" + md5(student_content["passport"]) + ".png"
			one_data["cardpicture"] = "cards/" + md5(student_content["passport"]) + ".png"
			one_data["workinfo"] = student_content["work_status"]
			one_data["address"] = student_content["address"]

			data.push(one_data)
		}
		res.render("home.ejs", { data: data })
	}
	else {
		res.redirect("/login")
	}
})

function text_contains(containing_text, main_text) {
	let t1 = containing_text.toLowerCase()
	let t2 = main_text.toLowerCase()
	let a = t2.includes(t1)
	return a
}


app.post('/home', (req, res) => {
	if (req.cookies["login"] != "true") {res.redirect("/login")}
	let content = JSON.parse(fs.readFileSync('data/students.json', 'utf8'));
	let data = []
	for (let user in content) {
		let one_data = []
		student_content = JSON.parse(fs.readFileSync(`files/users/${content[user]}.json`, 'utf8'));
		one_data["name"] = student_content["name"]
		one_data["surname"] = student_content["surname"]
		one_data["passport"] = student_content["passport"]
		one_data["id"] = md5(student_content["passport"])
		one_data["profilepicture"] = "photos/" + md5(student_content["passport"]) + ".png"
		one_data["cardpicture"] = "cards/" + md5(student_content["passport"]) + ".png"
		one_data["workinfo"] = student_content["work_status"]
		one_data["address"] = student_content["address"]
		if (text_contains(req.body["search"],one_data["name"]) || text_contains(req.body["search"],one_data["surname"]) || text_contains(req.body["search"],one_data["passport"]) || text_contains(req.body["search"],one_data["id"]) || text_contains(req.body["search"],one_data["workinfo"]) || text_contains(req.body["search"],one_data["address"])) {
			
			data.push(one_data)
		}
	}

	res.render("home.ejs", { data: data })
})

app.get('/student/:id', function (req, res) {
	if (req.cookies["login"] != "true") {res.redirect("/login")}
	let student_content = JSON.parse(fs.readFileSync(`files/users/${req.params.id}.json`, 'utf8'));
	let one_data = []
	one_data["name"] = student_content["name"]
	one_data["surname"] = student_content["surname"]
	one_data["passport"] = student_content["passport"]
	one_data["id"] = md5(student_content["passport"])
	one_data["profilepicture"] = "photos/" + md5(student_content["passport"]) + ".png"
	one_data["cardpicture"] = "cards/" + md5(student_content["passport"]) + ".png"
	one_data["workinfo"] = student_content["work_status"]
	one_data["address"] = student_content["address"]
	res.render("student.ejs", { data: one_data });
});

app.get('/edit/:id', function (req, res) {
	if (req.cookies["login"] != "true") {res.redirect("/login")}
	let student_content = JSON.parse(fs.readFileSync(`files/users/${req.params.id}.json`, 'utf8'));
	let one_data = []
	one_data["name"] = student_content["name"]
	one_data["surname"] = student_content["surname"]
	one_data["passport"] = student_content["passport"]
	one_data["id"] = md5(student_content["passport"])
	one_data["profilepicture"] = "photos/" + md5(student_content["passport"]) + ".png"
	one_data["cardpicture"] = "cards/" + md5(student_content["passport"]) + ".png"
	one_data["workinfo"] = student_content["work_status"]
	one_data["address"] = student_content["address"]
	res.render("edit.ejs", { data: one_data, error: "none" });
});

app.post('/edit/:id', function (req, res) {
	if (req.cookies["login"] != "true") {res.redirect("/login")}
	update_student(req)
	console.log(req.files);
	res.redirect("/home");
});

app.get('/remove/:id', function (req, res) {
	if (req.cookies["login"] != "true") {res.redirect("/login")}
	fs.unlinkSync(`files/users/${req.params.id}.json`)
	fs.unlinkSync(`files/photos/${req.params.id}.png`)
	fs.unlinkSync(`files/cards/${req.params.id}.png`)
	function getKeyByValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}
	let content = JSON.parse(fs.readFileSync('data/students.json', 'utf8'));
	delete content[getKeyByValue(content, req.params.id)]
	fs.writeFileSync('data/students.json', JSON.stringify(content));
	res.redirect("/home");
});

app.get('/login', (req, res) => {
	if (req.cookies["login"] == "true") {res.redirect("/home")}
	res.render("login.ejs", { error: "false" })
})


app.get('/logout', (req, res) => {
	res.cookie("login", "false")
	res.cookie("username", "")
	res.cookie("password", "")
	res.redirect("/login")
})

app.get('/admin', (req, res) => {
	if (req.cookies["login"] != "true") {res.redirect("/login")}
	res.render("admin.ejs", { data: "" })
})

app.get('/admin/add', (req, res) => {
	if (req.cookies["login"] != "true") {res.redirect("/login")}
	res.render("add_student.ejs", { error: "none" })
})

app.post('/admin/add', (req, res) => {
	if (req.cookies["login"] != "true") {res.redirect("/login")}
	function ce() { }
	add_student(req.body)
	req.files.studentcard.mv(`files/cards/${md5(req.body["passport"])}.png`, ce)
	req.files.profilepicture.mv(`files/photos/${md5(req.body["passport"])}.png`, ce)

	res.render("add_student.ejs", { error: "false" })
})


app.post('/login', (req, res) => {
	let username = req.body["username"]
	let password = req.body["password"]


	let jsondata = fs.readFileSync('data/login.json');
	let data = JSON.parse(jsondata);

	if (data["username"] == username && data["password"] == md5(password)) {
		res.cookie(`login`, `true`)
		res.cookie(`username`, username)
		res.cookie(`password`, password)
		res.redirect("/home");
	}
	else {
		res.render("login.ejs", { error: "true" })
	}
})
app.listen(port, function () { console.log("[!] website is running on http://localhost:8080"); })
