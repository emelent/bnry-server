const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const path = require('path')
const fs = require('fs')
const faker = require('faker')

// some constants
const port = 5000
const host = '0.0.0.0'
const url = 'http://' + host + ':' + port

// enable cors middleware
const cors = (req, res, next) => {
	res.set('Access-Control-Allow-Origin', '*')
	res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

	if (req.method === 'OPTIONS') return res.sendStatus(200)
	next()
}

// attach middleware
app.use(cors)
app.use(bodyParser.json())
app.use(fileUpload())
app.use('/static', express.static('static'))

const makeImage = (_id, url, description) => ({_id, url, description})
const updateKey = 'UPDATE'
let idCount = 10
let sock
// setup a lame db
const db = {
	[1]: makeImage(1, url + '/static/images/1.jpg', 'This is an interesting item'),
	[2]: makeImage(2, url + '/static/images/2.jpg', 'This might just be a button'),
	[3]: makeImage(3, url + '/static/images/3.jpg', 'I hope this one is a boat'),
	[4]: makeImage(4, url + '/static/images/4.jpg', 'Not quite sure what this is'),
	[5]: makeImage(5, url + '/static/images/5.jpg', 'You probably expected a peach'),
	[6]: makeImage(6, url + '/static/images/6.jpg', 'It only gets better from here'),
	[7]: makeImage(7, url + '/static/images/7.jpg', 'The only way down is up?'),
	[8]: makeImage(8, url + '/static/images/8.jpg', 'Part of an old military experiment'),
	[9]: makeImage(9, url + '/static/images/9.jpg', 'It was okay when I left it'),
	[10]: makeImage(10, url + '/static/images/10.jpg', 'One for all I suppose...'),
}

// routes
app.get('/data', (req, res) => {
	const data =[]
	for(let id in db){
		data.push(db[id])
	}

	res.status(200).json(data)
})

app.post('/update/image/:id', (req, res) => {
	const id = req.params.id
	let image = db[id]
	if(!image){
		return res.status(404).json("Image not found.")
	}
	db[id].description = req.body.description
	sock.emit(updateKey, db)
	res.status(200).json(db[id])
})


app.post('/new/image', (req, res) => {
	// console.log('sock =>', sock)
	const description = req.body.description
	if(!req.files)
    	return res.status(403).json('No image file were uploaded.')

	const image = req.files.image
	idCount += 1
	const id = idCount
	const fname = path.join(__dirname, `static/images/` + id)
	image.mv(fname, (err) => {
		if (err){
			console.log(err)
			return res.status(500).json("Failed to store file")
		}
		db[id] = makeImage(id, url + '/static/images/' + id, description)
		data =[]
		for(let id in db){
			data.push(db[id])
		}
		sock.emit(updateKey, data)
		res.status(201).json("File successfully uploaded.")
	})
})

io.on('connection', (socket) => {
	sock = socket
	console.log('new client')
})

// start listening
http.listen(port,host, () => {
	console.log(`Listening on ${host}:${port}`)
})
