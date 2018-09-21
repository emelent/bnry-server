# BNRY Server

Serves fresh-hot data to BNRY client

And allows for real-time sync between client and server data via
socket.io

### Routes

GET: /data
    
	returns array of image data in the form of
    {_id: 1, url: "here.jpg", description: "You know it"}

POST: /update/image/:id 
	
	with post data in  the form of 
    {description: "Whatever"}

	Updates the description of the image matching that id

POST: /new/image
	
	with multipart form data which requires a `description` field with a description of the image and an `image` field with the new image to  upload to the server


	