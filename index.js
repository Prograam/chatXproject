const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const connect = require("./config/db-config"); // mongodb

const Group = require('./models/group');
const Chat = require('./models/chat');

app.set("view engine", "ejs");
app.use(express.json())
app.use(express.urlencoded({extended : true}));
// app.use("/", express.static(__dirname + "/public"));


io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
    });
    //room joined code 
    socket.on('join_room',(data) =>{
      console.log("joining a room " , data.roomid);
      socket.join(data.roomid);
    });

    // server side code 
    socket.on("new_msg", async(data) => {  
      // io.emit("msg_revd", data);
      console.log('received msg',data);
      const chat = await Chat.create({
        roomid : data.roomid,
        sender : data.sender,
        content : data.message
      });
      io.to(data.roomid).emit('msg_revd' , data);
    });
});
  
app.get("/chat/:roomid/:user", async (req, res) => {
  const group = await Group.findById(req.params.roomid)
  // console.log(group);
  //printing the chats 
  const chats = await Chat.find({
    roomid: req.params.roomid
  });
  res.render("index", {
     roomid:req.params.roomid ,
      user:req.params.user,
      groupname : group.name,
      previousmsg : chats
    });
});
app.get('/group', async(req,res) => {
      res.render('group');
});

app.post('/group', async(req, res) => {
  try {
      console.log(req.body);
      await Group.create({
          name: req.body.name
      });
      res.redirect('/group');
  } catch (err) {
      console.error("Error creating group:", err);
      res.status(500).send("Internal Server Error");
  }
});

server.listen(3000, async () => {
  console.log("server running at http://localhost:3000");
  await connect();
  console.log("DB connected ");
});
