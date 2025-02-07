import express from 'express'

import userRoute from './routes/userRoutes'
import categoryRoute from './routes/categoryRoutes'
import productRoute from './routes/productRoutes'
import addressRoute from './routes/addressRoutes'
import cartRoute from './routes/cartRoutes'
import orderRoute from './routes/orderRoutes'
import dotenv from 'dotenv'

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/auth',userRoute);
app.use('/api/category',categoryRoute);
app.use('/api/product',productRoute);
app.use('/api/address',addressRoute);
app.use('/api/cart',cartRoute);
app.use('/api/order',orderRoute);

app.listen( process.env.PORT,()=>{
    console.log("Server is running...");
})