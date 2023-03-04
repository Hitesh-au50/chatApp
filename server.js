const http = require('http');
const express = require('express');
const { urlencoded } = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const User = require('./database')
const verifyToken = require('./verifyToken')


const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;


app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(__dirname + '/chatapp'))


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/chatapp/index.html", (err) => {
        if (err) {
            console.log("Error while loading landing page", err)
        }
    })
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/chatapp/login.html", (err) => {
        if (err) {
            console.log("Error while loading login page", err)
        }
    })
})

app.get('/welcome', verifyToken, (req, res) => {
    res.sendFile(__dirname + "/chatapp/welcome.html", (err) => {
        if (err) {
            console.log("Error while loading home page", err)
        }
    })
})

app.get('/chats', (req, res) => {
    res.sendFile(__dirname + "/chatapp/index2.html", (err) => {
        if (err) {
            console.log("Error while loading home page", err)
        }
    })
})

app.post('/userLogin', async (req, res) => {
    const data = req.body;
    let user_password = data.password;
    let user_email = data.email;
    const user_data = await User.findOne({ email: user_email })
    if (!user_data) {
        res.status(400);
        return res.sendFile(__dirname + '/chatapp/err.html');
    }
    let db_password = user_data.password;
    //matching password
    const isValid = await bcrypt.compare(user_password.toString(), db_password);

    //taking action for incorrect password
    if (!isValid) {
        res.status(400)
        return res.sendFile(__dirname + '/chatapp/err.html');
    }

    //generate token
    const token_to_send = jwt.sign({ id: user_data._id }, "mySecretKey", { expiresIn: '5s' })
    res.cookie('my_token', token_to_send);
    return res.redirect('/welcome')
})

app.post('/userSignup', async (req, res) => {
    const data = req.body;
    if (data.password !== data.cpassword) {
        return res.send("Incorrect Password");
    }
    let user_name = data.name;
    let user_email = data.email;
    let user_password = data.password;
    if (!user_name || !user_email || !user_password) {
        res.status(400)
        return res.send("Fields are empty")
    }
    const user_data = await User.findOne({ email: user_email })
    if (user_data) {
        res.status(400);
        return res.send("User already exists");
    }
    const salt = await bcrypt.genSalt(10)
    let hashed_password = await bcrypt.hash(user_password.toString(), salt)
    const data_to_store = new User({ name: user_name, email: user_email, password: hashed_password })
    const result = await data_to_store.save()
    res.redirect('/login')
})





/* Socket.io Setup*/

const io = require("socket.io")(server);
var users = {}

io.on("connection", (socket) => {

    socket.on("new-user-joined", (username) => {
        users[socket.id] = username;
        socket.broadcast.emit('user-connected', username);
        io.emit("user-list", users);
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit('user-disconnected', user = users[socket.id]);
        delete users[socket.id];
        io.emit("user-list", users);
    })

    socket.on('message', (data) => {
        socket.broadcast.emit("message", { user: data.user, msg: data.msg });
    })
});

//Socket.io Setup Ends/

server.listen(port, () => {
    console.log('server started at', port)
})