import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, {message: 'Email must be a valid email address'})
  email: string = '';

  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string = '';

  // @IsNotEmpty({ message: 'CAPTCHA token is required' }) // Tambahkan validasi untuk token CAPTCHA
  // captcha: string = ''; // Properti baru untuk menyimpan token CAPTCHA
}
