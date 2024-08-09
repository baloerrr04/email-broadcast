import { IsString, Length, IsNotEmpty  } from "class-validator";

export class AppPasswordDTO {
    @IsString()
    @IsNotEmpty()
    @Length(16, 16,{message: "Password must be 16 characters"})
    public appPassword!: string;
}