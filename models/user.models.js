import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim : true,
        minlength: 5,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim:true,
        lowercase:true,

    },
    password:{
        type:String,
        required:[true, "Password is required"],
        minlength:6,
    },
    refreshAccessToken: {
        type:String,
    }
},
{
    timestamps:true
});

//if password is not modified we pass our function to next - else we hash the password 
userSchema.pre("save", async function(next){
    
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hashSync(this.password,10);
    next();
})

//create own function 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}


//create mongodb method for create refresh access token
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        //payload
        {
            _id: this._id,
            email : this.email,
            username : this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
        
    )
}

//method for generating refresh token
userSchema.methods.generateRefreshToken = async function (){
        return jwt.sign(
            {
                _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            }
        )
}



const User = mongoose.model('User', userSchema);

export default User;

