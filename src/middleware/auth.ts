import {Request,Response,NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

// export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
//   try{
//     const token = req.headers.authorization?.split(' ')[1];

//     if(!token){
//      res.status(403).json({ message: 'No token provided' });
//      return;
//     }

//     const verify = jwt.verify(token,"mysecrettoken")as { user_id: number };
//     req.user = verify;
//     console.log(req.user);
//     next();
//   }catch(err){
//    res.status(401).json({ message: 'Not authorized' });
//   }
// }; 

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
     res.status(401).json({ message: 'Authentication required' });
     return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecrettoken');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token',error });
  }
}; 

export const isAdmin = async (req:AuthRequest, res: Response, next: NextFunction) =>{
  try {
    // if (!req.user) {
    //    res.status(403).json({ message: "Unauthorized access" });return
    // }
    const { user_id } = req.user;
    const admin = await pool.query(`SELECT * FROM users WHERE user_id = $1 AND user_role = 1`, [user_id]);

    if (admin.rows.length === 0) {
       res.status(403).json({ message: "Admin access required" });return
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Not authorized' });
  }
}