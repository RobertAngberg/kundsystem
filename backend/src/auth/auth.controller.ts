import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('profile')
  createProfile(@Body() createProfileDto: CreateProfileDto) {
    return this.authService.createProfile(createProfileDto);
  }

  @Get('profile/:id')
  findProfile(@Param('id') id: string) {
    return this.authService.findProfile(id);
  }

  @Get('profiles')
  findAllProfiles() {
    return this.authService.findAllProfiles();
  }

  @Put('profile/:id')
  updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(id, updateProfileDto);
  }

  @Delete('profile/:id')
  deleteProfile(@Param('id') id: string) {
    return this.authService.deleteProfile(id);
  }
}
