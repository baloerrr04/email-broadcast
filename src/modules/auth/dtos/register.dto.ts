import { Role } from "@prisma/client";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterDTO {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string = '';
  
    @IsNotEmpty({ message: 'Password should not be empty' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string = '';

    @IsNotEmpty({ message: 'Role should not be empty' })
    role: Role = Role.USER;
}