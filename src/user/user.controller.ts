import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller('users')
export class UserController {

    constructor(private userService: UserService){

    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    getAllUsers(@Req() req: Request){
        return this.userService.getAllUsers();
    }
}
