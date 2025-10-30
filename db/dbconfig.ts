import mongoose from "mongoose";

export async function connectDB() {
  try {
    mongoose.connect(process.env.MONGODB_URI! )
    const connection = mongoose.connection;

    connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    })

    connection.on('error', (error) => {
      console.log('MongoDB connection error:', error);
      process.exit(1); 
    })


    
  } catch (error) {
    console.log("something went wrong in connecting to DB",error);
    
  }
}
