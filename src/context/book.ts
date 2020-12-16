import {
  Ref, ref, provide, inject, computed, ComputedRef,
} from '@vue/composition-api';
import { useAsyncCreator } from './common';

export type Book = { id: string; title: string; count: number };

export type BookContext = {
  book: Ref<Book>;
  books: Ref<Book[]>;
  setBook: (book: Book) => void;
  setBooks: (books: Book[]) => void;
  setBookCount: (value: number) => void;
  setBookTitle: (value: string) => void;
  getBooks: (key: string) => Promise<void>;
  loading: Ref<boolean>;
  error: Error | Ref<null>;
  countPlusOne: ComputedRef<number>;
};

export const bookSymbol = Symbol('Symbol for book');

// a mock function to get remote data
async function getRemoteBooks(key: string) {
  console.log(key);
  // real usage:
  // return GET<Book[]>('');

  return new Promise<Book[]>((res, rej) => {
    setTimeout(
      () => (Math.random() > 0.6
        ? res([
          { id: '1', title: 'Harry Potter 1', count: 20 },
          { id: '2', title: 'Harry Potter 2', count: 10 },
        ])
        : rej(new Error('bad luck!'))),
      1000,
    );
  });
}

export function useBookProvider() {
  const book = ref<Book>({ id: '1', title: 'Harry Potter', count: 0 });
  const books = ref<Book[]>([]);
  const loading = ref(false);
  const error = ref(null);

  function setBook(newBook: Book) {
    book.value = newBook;
  }
  function setBooks(newBooks: Book[]) {
    books.value = newBooks;
  }
  function setBookCount(value: number) {
    book.value.count = value;
  }

  const countPlusOne = computed(() => book.value.count + 1);

  function setBookTitle(value: string) {
    book.value.title = value;
  }
  async function getBooks(key: string) {
    const useAsync = useAsyncCreator(loading, error);
    const { data } = await useAsync<Book[]>(() => getRemoteBooks(key));
    setBooks(data.value || []);
  }

  provide<BookContext>(bookSymbol, {
    book,
    books,
    setBook,
    setBooks,
    setBookCount,
    setBookTitle,
    getBooks,
    loading,
    error,
    countPlusOne,
  });
}

export function useBookInject() {
  const bookStore = inject<BookContext>(bookSymbol);
  if (!bookStore) {
    throw new Error('Please useBookProvider before useBookInject!');
  }
  return bookStore;
}
