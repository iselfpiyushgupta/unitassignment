const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const UserModel=require('./models/user');
const db=require('./config/config').get(process.env.NODE_ENV);
const { signupValidation, loginValidation } = require('./middlewares/auth.js');
const ensureAuthenticated = require('./middlewares/AuthValidation.js');

const app=express();
// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose
  .connect(db.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log(error);
  });


// adding new user (sign-up route)
 app.post('/api/users/signup',signupValidation, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409)
                .json({ message: 'User is already exist, you can login', success: false });
        }
        const userModel = new UserModel({ name, email, password });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201)
            .json({
                message: "Signup successfully",
                success: true
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server errror",
                success: false
            })
    }
});


// login user
app.post('/api/users/login',loginValidation, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Auth failed email or password is wrong';
        if (!user) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(200)
            .json({
                message: "Login Success",
                success: true,
                jwtToken,
                email,
                name: user.name
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server errror",
                success: false
            })
    }
});

//logout user
 app.get('/api/users/logout',function(req,res){
        req.user.deleteToken(req.token,(err,user)=>{
            if(err) return res.status(400).send(err);
            res.sendStatus(200);
        });

    }); 

// get logged in user
app.get('/api/users/me', ensureAuthenticated, (req, res) => {
    console.log('---- logged in user detail ---', req.user);
    res.status(200).json([
        res.json({
            email: req.user.email,
            name: req.user.name,
            
})
    ])
})
app.get('/api/random-joke', async (req, res) => {
    try {
        const response = await axios.get('https://api.chucknorris.io/jokes/random');
        res.json({ joke: response.data.value });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch joke' });
    }
});

app.get('/',function(req,res){
    res.status(200).send(`Welcome to signup , login api`);
});

// listening port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});