import express from "express";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import connectDB from "./config/connectDB";
import bodyParser from "body-parser";
import cors from 'cors';
require('dotenv').config();

let app = express();
app.use(cors({origin: true}))

//dùng middleware xử lí cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.URL_REACT); // Adjust the origin accordingly
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // If you're using credentials
  
    
  
    next();
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//config app

// app.use(
//     express.urlencoded({
//         extended: true,
//     })
// );
// app.use(express.json());

viewEngine(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 6969;

app.listen(port, () => {
    console.log(` app listening on port ${port}`);
});
