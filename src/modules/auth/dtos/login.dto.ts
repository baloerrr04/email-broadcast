import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, {message: 'Email must be a valid email address'})
  email: string = '';

  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string = '';
}
