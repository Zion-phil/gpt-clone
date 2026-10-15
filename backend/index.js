import 'dotenv/config';
import express from 'express';
import cors from 'cors';  // ← Added cors MW  bc my fe port is being blocked from talking to my be port
import db from './db/db.config.js';
import errorHandler from './src/middleware/error-handler.js';import mainRouter from './src/api/main.routes.js';


const app = express();

// app.use(cors()); => i replaced this line by the code below for production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));
// req body wst yetelake data extract medereg slalebet esu demo yemiseraw be "express middleware wust bemalef nw" soexpress lay yale builtin middleware call enaregalen wc is json
app.use(express.json()); 
app.use('/api', mainRouter);

// Final middleware for error handling
app.use(errorHandler);


async function startServer() {
    try{
        const connection = await db.getConnection();
        connection.release();
        const PORT = process.env.PORT || 3877;
        app.listen(PORT, err => {
            if(err) {
                throw err;
            }
            console.log('server is running on port http://localhost:3877');
        });
    }catch (error) {
        console.error('Error startin server:', error.message);
    }
}

startServer();


// req->res ( 1 sew req ylekala then response ke back end ymelesletal. so bezi mehal or response ke server kememtatu befit gn yemiseru logic gn ale. eg- authorization, sle app'nachn eyandandun ngr log mareg lihon ychlal, validation lnsera enchlalen) enezan yeminserachewn negeroch store yemnaregew or yemintsfew middleware lay yhonal malet nw.
// req-> middleware->res

// function logger(req, res, next){
//     const url = req.url;
//     const method = req.method;
//     console.log(url, method);
//     // res.send('from logger middleware');
//     next();
// }

// app.use(logger);

// app.get('/', logger, (req, res)=>{
//     logger(req, res);
//     res.send("Hello World!");
// });

// app.get('/about', logger, (req, res)=>{

//     res.send("Hello World! from about route");
// });

// app.get('/api/chat', (req, res)=>{
//     res.send("Hello World! from chat route");
// });

// app.get('/api/conversation', (req, res)=>{
//     res.send("Hello World! from chat route2");
// });

// app.get('/', (req, res)=>{
//     res.send("Hello World");
// });


