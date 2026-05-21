import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('me/affiliations')
  addAffiliation(
    @GetUser() user: User,
    @Body() body: { programId: number; roleType: string; currentSemester?: number }
  ) {
    return this.userService.addAffiliation(user.id, body);
  }
  @Get()
  findAll(@GetUser() user: User) {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Roles('admin')
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.userService.updateRole(+id, role);
  }
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.userService.remove(+id);
  }
}
