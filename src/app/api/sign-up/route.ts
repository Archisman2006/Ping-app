import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User.model";
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from "@/src/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { username, email, password } = await request.json();

        const userExists = await UserModel.findOne({
            username,
            isVerified: true
        });

        if (userExists) {
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken.'
                },
                {
                    status: 400
                }
            );
        }

        const userExistsByEmail = await UserModel.findOne({ email });
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        const hashedPassword = await bcrypt.hash(password, 10);
        if (userExistsByEmail) {
            if (userExistsByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "User already exists with this email and is verified"
                    },
                    {
                        status: 400
                    }
                );
            } else {
                userExistsByEmail.password = hashedPassword;
                userExistsByEmail.verificationCode = verifyCode;
                userExistsByEmail.verificationCodeExpiry = expiryDate;
                await userExistsByEmail.save();
            }
        } else {
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verificationCode: verifyCode,
                isVerified: false,
                verificationCodeExpiry: expiryDate,
                isAccepting: true,
                messages: []
            });
            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {
                    status: 500
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: 'User registered successfully. Please verify your email.'
            },
            {
                status: 200
            }
        );
    } catch (error: any) {
        console.error("Error registering user:", error);
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        );
    }
}