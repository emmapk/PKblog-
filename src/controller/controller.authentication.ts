import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../database/userschema';
import sendEmail from '../controller/nodeMailer';

dotenv.config();

const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/jentamakeri';
const jwtSecret = process.env.JWT_SECRET || 'pk_jwt_secret';

// Connect to MongoDB
mongoose.connect(dbUri)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const authenticate = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }

  if (!user.isEmailConfirmed) {
    throw new Error('Email not confirmed');
  }

  return user._id;
};

export const getAuth = async (req: Request, res: Response) => {
  try {
    return res.status(200).render('auth/register');
  } catch (error) {
    console.error('Error rendering registration page:', error);
    res.status(500).json({ message: 'Failed to render registration page' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, password, email, address, description, image } = req.body;
 
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("dashboard/404",{message: 'Email already exists. Please use a different email.'});
    }

    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    };
    const isValid = validateEmail(email);
    if (!isValid) {
      return res.status(400).json({ message: 'Email is invalid' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const verificationToken = jwt.sign({ email }, jwtSecret, { expiresIn: '24h' });

    const newUser = new User({
      name,
      password: hashPassword,
      email,
      address,
      description,
      image,
      verificationToken,
      isEmailConfirmed: false,
    });

    await newUser.save();

    const subject = 'Confirm your email';
    const baseURL = process.env.BASE_URL || 'http://localhost:9992';
    const verificationURL = `${baseURL}/auth/confirmation/${verificationToken}`;

    const text = `Please click on the following link to confirm your email: ${verificationURL}`;
    await sendEmail(email, subject, text);

    return res.status(200).render('auth/login');
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Failed to register user' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, jwtSecret) as { email: string };
    const user = await User.findOne({ email: decoded.email, verificationToken: token });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register again.' });
    }

    user.isEmailConfirmed = true;
    user.verificationToken = null;
    await user.save();

    return res.status(200).render('dashboard/confirmation-success');
  } catch (error) {
    console.error('Error confirming email:', error);
    res.status(500).json({ message: 'Failed to verify email' });
  }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    try {
      const userId:string = await authenticate(email, password);
  
      if (!userId) {
        return res.status(200).render("auth/login")
      }
  
     
      const token:string = jwt.sign({ userId }, jwtSecret, { expiresIn: "5h" });

  
      const db = mongoose.connection;
      const collection = db.collection('users');
      const data = await collection.find().toArray();
  
     
      return res.status(200).render('dashboard/profile', { data, token });
    } catch (error) {
      console.error('Error during login:', error);
  
      
      if (error.message === 'Email not confirmed') {
        return res.status(403).render("dashboard/404", { message: 'Please confirm your email to log in' });
      }
  
      return res.status(500).json({ message: 'Failed to authenticate user' });
    }
  };
  

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, email, address, description, image } = req.body;

        const id = req.params.body

        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const updatedData = { name, email, address, description, image };

        const user = await User.findByIdAndUpdate(id, updatedData, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).render("dashboard/update", { user });

        return res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Failed to update user' });
    }
};

  
  

process.on('SIGINT', async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
})
  export default {
    getAuth,
    register,
    login,
    verifyEmail,
    updateUser
  };
