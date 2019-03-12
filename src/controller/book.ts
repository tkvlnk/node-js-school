import { BaseContext } from 'koa';
import { getManager, Repository } from 'typeorm';
import { Book } from '../entity/book';
import { User } from '../entity/user';
import { validate, ValidationError } from 'class-validator';
import { BAD_REQUEST, OK, NOT_FOUND } from 'http-status';

export default class BookController {
  public static async getUserBooks(ctx) {
    const manager = getManager();

    const bookRepository: Repository<Book> = manager.getRepository(Book);

    const books: Book[] = await bookRepository.find({
      user: {
        id: ctx.params.userId
      }
    });

    ctx.status = OK;
    ctx.body = books;
  }

  public static async createBook(ctx: BaseContext) {
    const manager = getManager();

    const userRepository: Repository<User> = manager.getRepository(User);
    const bookRepository: Repository<Book> = manager.getRepository(Book);

    const userToBeAttached = await userRepository.findOne(ctx.params.userId);

    if (!userToBeAttached) {
      ctx.status = NOT_FOUND;
      ctx.body = `Cannot find user to create book`;
      return;
    }

    const bookToBeSaved: Book = new Book();
    bookToBeSaved.name = ctx.request.body.name;
    bookToBeSaved.description = ctx.request.body.description;
    bookToBeSaved.user = userToBeAttached;

    const errors: ValidationError[] = await validate(bookToBeSaved);

    if (errors.length > 0) {
      ctx.status = BAD_REQUEST;
      ctx.body = errors;
      return;
    }

    const { user, ...book } = await bookRepository.save(bookToBeSaved);
    ctx.status = OK;
    ctx.body = book;
  }
}
