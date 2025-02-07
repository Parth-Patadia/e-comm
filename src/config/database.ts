import { Pool } from "pg";
import dotenv from 'dotenv'

dotenv.config();

const pool = new Pool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    port : Number(process.env.DB_PORT),
    database : process.env.DB_NAME,
    password : process.env.DB_PASSWORD,

})

pool.connect().then(()=>{
    console.log("Connected to Database..");
});

export default pool;