const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const path = require('path')

// some constants
const port = process.env.PORT || 5000
const endpoint = (port !== 5000)? 'https://bnry-server.herokuapp.com': 'http://0.0.0.0:5000'

const updateKey = 'UPDATE'

// object representing the database
const db = {
	[1]: {
		_id:1, 
		url: endpoint + '/static/images/1.jpg',
		description: 'This is an interesting item'
	},
	[2]: {
		_id:2, 
		url: endpoint + '/static/images/2.jpg',
		description: 'This might just be a button'
	},
	[3]: {
		_id:3, 
		url: endpoint + '/static/images/3.jpg',
		description: 'I hope this one is a boat'
	},
	[4]: {
		_id:4, 
		url: endpoint + '/static/images/4.jpg',
		description: 'Not quite sure what this is'
	},
	[5]: {
		_id:5, 
		url: endpoint + '/static/images/5.jpg',
		description: 'You probably expected a peach'
	},
	[6]: {
		_id:6, 
		url: endpoint + '/static/images/6.jpg',
		description: 'It only gets better from here'
	},
	[7]: {
		_id:7, 
		url: endpoint + '/static/images/7.jpg',
		description: 'The only way down is up?'
	},
	[8]: {
		_id:8, 
		url: endpoint + '/static/images/8.jpg',
		description: 'Part of an old military experiment'
	},
	[9]: {
		_id:9, 
		url: endpoint + '/static/images/9.jpg',
		description: 'It was okay when I left it'
	},
	[10]: {
		_id:10,
		url:  endpoint + '/static/images/10.jpg',
		description: 'One for all I suppose...'
	},
}

const getAllEntries = () => {
	const entries = []
	for(let key in db)
		entries.push(db[key])
	return entries
}

// some globs
let entryCount = Object.keys(db).length 
let ioSock

// cors middleware
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


// routes
app.all('/', (req, res) => { // return db image entries
	const data =[]
	for(let id in db){
		data.push(db[id])
	}

	res.status(200).json(data)
})

app.post('/update/image/:id', (req, res) => { // update image description
	const id = req.params.id
	const image = db[id]
	if(!image){
		return res.status(404).json("Image not found.")
	}
	
	// update image description
	db[id].description = req.body.description
	ioSock.emit(updateKey, getAllEntries())
	res.status(200).json(db[id])
})


app.post('/new/image', (req, res) => { // upload a new image
	if(!req.files)
	return res.status(403).json('No image file were uploaded.')
	
	entryCount += 1
	const image = req.files.image
	const id = entryCount
	const fname = path.join(__dirname, `static/images/` + id)

	// store file on server
	image.mv(fname, (err) => {
		if (err){
			console.log(err)
			return res.status(500).json("Failed to store file")
		}
		// add image to db
		db[id] = {_id: id, url: endpoint + '/static/images/' + id, description: req.body.description}

		// send updated data to clients
		ioSock.emit(updateKey, getAllEntries())
		res.status(201).json("File successfully uploaded.")
	})
})

// setup socket io
io.on('connection', (socket) => {
	ioSock = socket
})

// start listening
http.listen(port, () => {
	console.log(`Listening on ${endpoint}`)
})
