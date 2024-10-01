import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon2 from 'argon2';
import { JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";




@Injectable()
export class AuthService {

    constructor(private prismaService: PrismaService, private jwt: JwtService, private config: ConfigService){}


    async signin(dto: AuthDto){
        const {email, password} = dto;

        try {
           const user = await this.prismaService.user.findUnique(({where: {email}}));
           
            if(!user){
                throw new Error('User not found');
            }

            console.log(user);

            const isPasswordValid = await argon2.verify(user.hashedPassword, password);

            if(!isPasswordValid){
                throw new Error('Invalid password');
            }


            return this.signToken(user.id, user.email);

        } catch (error) {
            console.log(error);
        }


    }


    async signup(dto: AuthDto){
        const {email, password} = dto;
        const hashedPassword = await argon2.hash(password);
        const body = {email, hashedPassword}
        // this.prismaService.user.create(body)
        const user = await this.prismaService.user.create({data: body, select: {id: true, email: true}});
        return user;
    }

    async signToken(userID: number, email: string){
        const payload = {
            sub: userID,
            email
        }

        const secret = this.config.get('JWT_SECRET'); 
        return this.jwt.signAsync(payload,{expiresIn: '1h', secret: secret});
    }
}