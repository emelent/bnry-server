
const express = require('express')

const port = 5000
const host = '0.0.0.0'
const url = 'http://' + host + ':' + port
const app = express()

// enable cors middleware
const cors = (req, res, next) => {
	res.set('Access-Control-Allow-Origin', '*')
	res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

	if (req.method === 'OPTIONS') return res.sendStatus(200)
	next()
}

// attach middleware
// app.use(cors)
app.use('/static', express.static('static'))

const makeImage = (_id, url, description) => ({_id, url, description})

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

app.post('/update/image/:id', () => {})

// start listening
app.listen(port, host, () => {
	console.log(`Listening on ${host}:${port}`)
})
