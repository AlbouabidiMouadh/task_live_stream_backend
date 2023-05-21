const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");

require("dotenv").config();

const ObjectId = mongoose.Types.ObjectId;

const app = express();
const PORT = process.env.PORT || 3000;

const Post = require("./models/postSchema");
const User = require("./models/newuserSchema");
const Sponsorship = require("./models/sponsorshipSchema");
const Guide = require("./models/guidesSchema");
const LiveStream = require("./models/liveStreamSchema");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use("/public/images", express.static("images"));
app.use(express.json());

app.use(cors());

const uri =
  "mongodb+srv://test:test@cluster0.7lpzt09.mongodb.net/Users?retryWrites=true&w=majority";

mongoose
  .connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected to database");
    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

const post = new Post({
  title: "post one",
  description: "this is a description",
  likes: 15,
  allowed: true,
});

app.post("/Admin/login", async (req, res) => {
  console.log("login request made");
  const data = req.body;
  console.log(data);
  if (!data.email || !data.password)
    return (
      res
        //   .status(400)
        .send({ connected: false })
    );

  const user = await Admin.findOne({ email: data.email.toLowerCase() });

  if (!user)
    return (
      res
        //   .status(401)
        .send({ connected: false })
    );

  const isPasswordMatching = await bcrypt.compare(data.password, user.password);

  if (!isPasswordMatching)
    return (
      res
        //   .status(402)
        .send({ connected: false })
    );
  const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
    expiresIn: "2h",
  });
  user.token = token;
  res.status(200).send({
    connected: true,
    token: token,
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      id: user._id,
    },
  });
});

app.post("/signup/", async (req, res) => {
  try {
    let data = req.body;
    console.log(data);
    if (!data.firstname)
      return res.send({
        errorfield: "firstname",
        errorType: "please fill the field",
        connected: false,
      });
    if (!data.lastname)
      return res.send({
        errorfield: "lastname",
        errorType: "please fill the field",
        connected: false,
      });
    if (!data.email)
      return res.send({
        errorfield: "email",
        errorType: "please fill the field",
        connected: false,
      });
    if (!data.password)
      return res.send({
        errorfield: "password",
        errorType: "please fill the field",
        connected: false,
      });
    if (!data.location)
      return res.send({
        errorfield: "location",
        errorType: "please fill the field",
        connected: false,
      });
    if (!data.date)
      return res.send({
        errorfield: "date",
        errorType: "please fill the field",
        connected: false,
      });

    if (data.password != data.passwordConfirmation)
      return (
        res
          //   .status(401)
          .send({
            errorfield: "passwordConfirmation",
            errorType: "please enter the same password",
            connected: false,
          })
      );

    const isUserAlreadyExits = await User.findOne({ email: data.email });
    if (isUserAlreadyExits)
      return (
        res
          // .status(402)
          .send({
            errorfield: "down",
            errorType: "user existing",
            connected: false,
          })
      );

    // pass : abcd
    // salt + pass -> 5r4w5abcd ->
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const newuser = User.create({
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      location: data.location,
      date: data.date,
    });
    newuser;
    const token = jwt.sign(
      { user_id: newuser._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    newuser.token = token;
    res.status(200).send({ errorType: "none", connected: true, user: newuser });
  } catch {
    (err) => {
      console.log(err);
    };
  }
});

app.post("/login", async (req, res) => {
  console.log("login request made");
  const data = req.body;
  console.log(data);
  if (!data.email || !data.password)
    return (
      res
        //   .status(400)
        .send({ errorType: "missing data", connected: false })
    );

  const user = await User.findOne({ email: data.email.toLowerCase() });

  if (!user)
    return (
      res
        //   .status(401)
        .send({ errorType: "invalid username or password", connected: false })
    );

  const isPasswordMatching = await bcrypt.compare(data.password, user.password);

  if (!isPasswordMatching)
    return (
      res
        //   .status(402)
        .send({ errorType: "invalid username or password", connected: false })
    );
  const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
    expiresIn: "2h",
  });
  user.token = token;
  res.status(200).send({
    errorType: "none",
    connected: true,
    token: token,
    user: user._id,
  });
});

app.get("/logout", (req, res) => {
  req.session.user = null;
  res.send("you have logged out");
});

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("invalid image file!", false);
  }
};

const uploads = multer({ storage, fileFilter });

app.post("/upload-picture", uploads.single("profile"), (req, res) => {
  const file = req.file;
  console.log(file);
  fs.rename(file.path, `./public/pictures/${file.originalname}.jpg`, () => {
    console.log("done");
  });
  res.send("done");
});

app.post("/create-guide", (req, res) => {
  console.log(req.body);
  Guide.create({
    title: req.body.title,
    description: req.body.description,
    likes: 0,
    image: req.body.image,
    approved: false,
    createdBy: "Admin",
  })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post("/create-post", (req, res) => {
  console.log("request create post made");
  console.log(req.body);
  Post.create({
    title: req.body.title,
    description: req.body.description,
    likes: 0,
    image: req.body.image,
    createdBy: req.body.createdBy,
    approved: false,
  })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/all-posts", (req, res) => {
  console.log("happened");
  Post.find()
    .then((result) => {
      res.send(result);
      console.log(result);
    })
    .catch((err) => console.log(err));
});

app.get("/post/:id", auth, async (req, res) => {
  const onePost = await Post.findOne({ _id: req.params.id });
  try {
    res.send(onePost);
  } catch (err) {
    console.log(err);
  }
});

app.delete("/users/:id", (req, res) => {
  console.log("request made");
  User.findOne(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send(user);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.put("/users/:id", (req, res) => {
  User.findOneAndUpdate({ _id: req.params.id }, { approved: true })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.delete("/post/:id", async (req, res) => {
  console.log("request delete post");
  const post = await Post.findOneAndRemove({ _id: req.params.id });
  try {
    res.send(post);
    console.log("deleted");
  } catch (err) {
    console.log(err);
  }
});

app.put("/post/:id", (req, res) => {
  console.log("request put post");
  Post.findOneAndUpdate({ _id: req.params.id }, { approved: true })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/all-sponsorships", (req, res) => {
  Sponsorship.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put("/sponsorship/:id", (req, res) => {
  Sponsorship.findOneAndUpdate({ _id: req.params.id }, { approved: true })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.delete("/sponsorship/:id", async (req, res) => {
  console.log("request delete sponsorship");
  const sponsorship = await Sponsorship.findOneAndRemove({
    _id: req.params.id,
  });
  try {
    res.send(sponsorship);
    console.log("deleted");
  } catch (err) {
    console.log(err);
  }
});

app.get("/all-guides", (req, res) => {
  Guide.find()
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put("/guide/:id", (req, res) => {
  Guide.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.delete("/guide/:id", async (req, res) => {
  console.log("request delete guide");
  const guide = await Guide.findOneAndRemove({ _id: req.params.id });
  try {
    res.send(guide);
    console.log("deleted");
  } catch (err) {
    console.log(err);
  }
});

app.put("/user/:id", (req, res) => {
  const user = req.body.user;
  const info = {};
  if (user.firstName != null) info = { ...info, firstName: user.firstName };
  if (user.lastName != null) info = { ...info, lastName: user.lastName };
  if (user.email != null) info = { ...info, email: user.email };
  if (user.bio != null) info = { ...info, bio: user.bio };

  console.log("update user information request started");
  User.findOneAndUpdate({ _id: req.params.id }, info)
    .then((response) => {
      console.log("response done");
      res.send(response);
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
});

// app.get("/user/:id", async (req, res) => {
//   const user = await User.findOne({ _id: req.params.id });
//   try {
//     res.send(user);
//     console.log("user sent");
//   } catch (err) {
//     console.log(err);
//   }
// });
app.get("/user/:id", (req, res) => {
  User.findOne({ _id: req.params.id }).then((response) => {
    res.send(response);
  });
});

app.get("/posts/:id", async (req, res) => {
  const posts = await Post.find();
  try {
    const filtredPosts = posts.filter((item) => {
      return item.createdBy == req.params.id;
    });
    res.send(filtredPosts);
    console.log("posts sent");
  } catch (err) {
    console.log(err);
  }
});

app.post("/create-livestream", (req, res) => {
  LiveStream.create(req.body)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/all-livestreams", (req, res) => {
  LiveStream.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put("/livestream/:id", (req, res) => {
  LiveStream.findOneAndUpdate({ _id: req.params.id }, { finished: true })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});
