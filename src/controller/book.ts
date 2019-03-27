import { BaseContext } from 'koa';
import { getManager, Repository } from 'typeorm';
import { Book } from '../entity/book';
import { User } from '../entity/user';
import { validate, ValidationError } from 'class-validator';
import { BAD_REQUEST, OK, NOT_FOUND } from 'http-status';

export default class BookController {
  public static async getUsersBooks(ctx: BaseContext) {
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

  public static async createUsersBook(ctx: BaseContext) {
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
    bookToBeSaved.date = ctx.request.body.date;
    bookToBeSaved.user = userToBeAttached;

    const errors: ValidationError[] = await validate(bookToBeSaved);

    if (errors.length > 0) {
      ctx.status = BAD_REQUEST;
      ctx.body = errors;
      return;
    }

    const {id: newBookId} = await bookRepository.save(bookToBeSaved);

    const book = await bookRepository.findOne(newBookId);

    ctx.status = OK;
    ctx.body = book;
  }

  public static async deleteUsersBook(ctx: BaseContext) {
    const manager = getManager();
    const bookRepository: Repository<Book> = manager.getRepository(Book);

    const bookToDelete = await bookRepository.findOne({
      id: ctx.params.bookId,
      user: {
        id: ctx.params.userId,
      },
    });

    if (!bookToDelete) {
      ctx.status = NOT_FOUND;
      ctx.body = 'The book you trying to delete does not exist';
      return;
    }

    await bookRepository.delete(ctx.params.bookId);
  }

  public static async updateUsersBook(ctx: BaseContext) {
    const manager = getManager();
    const bookRepository: Repository<Book> = manager.getRepository(Book);

    const bookToUpdate = await bookRepository.findOne({
      id: ctx.params.bookId,
      user: {
        id: ctx.params.userId,
      },
    });

    if (!bookToUpdate) {
      ctx.status = NOT_FOUND;
      ctx.body = 'The book you trying to update does not exist';
      return;
    }

    const propsWhiteList = [
      'name',
      'description',
      'date',
    ];

    Object.entries(ctx.request.body).forEach(([key, value]) => {
      if (!propsWhiteList.includes(key)) {
        return;
      }

      bookToUpdate[key] = value;
    });

    const errors: ValidationError[] = await validate(bookToUpdate);

    if (errors.length > 0) {
      ctx.status = BAD_REQUEST;
      ctx.body = errors;
      return;
    }

    await bookRepository.save(bookToUpdate);

    const updatedBook = await bookRepository.findOne({
      id: ctx.params.bookId,
      user: {
        id: ctx.params.userId,
      },
    });

    ctx.status = OK;
    ctx.body = updatedBook;
  }
}
