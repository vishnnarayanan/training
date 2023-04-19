import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getUsers() {
    return [{ msg: 'email' }];
  }

  @Get('comments')
  getUsersComments() {
    return [{ mail: 'email', comment: 'this is a comment' }];
  }

  @Get('comment')
  getUsersComment() {
    return { mail: 'email', comment: 'this is a comment' };
  }

  @Get('key')
  getKey() {
    return null;
  }
}
