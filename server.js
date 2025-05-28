import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import errorHandler from "./middleware/errorHandleJson.middleware.js"



//configure the dotev
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000;


//middle ware
app.use(express.json())
app.use(cookieParser())
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

//mongodb connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(()=> console.log("mongodb connected"))
  .catch((err)=> console.log("There is some kind of error", err))

//health routes
app.get('/', (req, res)=>{
    res.send('Blog app is running');
});

// app.use((req, res) => {
//   res.status(200).json({ success: true, message: 'Todo API is running' });
// });

// app.use(errorHandler);
app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT}`);
});
