// State Management
class BookState {
  private listeners: any[] = [];
  private books: any[] = [];
  private static instance: BookState;

  // private constructor guarantees singleton class (only one instance of BookState)
  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new BookState();
    return this.instance;
  }

  addListener(listenerFn: Function) {
    // console.log('this.listeners', this.listeners)
    this.listeners.push(listenerFn);
  }

  addBook(title: string, author: string, priority: number) {
    const newBook = {
      id: Math.random().toString(),
      title,
      author,
      priority,
    };
    this.books.push(newBook);
    for (const listenerFn of this.listeners) {
      // use a copy of array (so array is not mutated)
      listenerFn(this.books.slice());
    }
  }
}

// global constant that can be used anywhere in file
const bookState = BookState.getInstance();

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(input: Validatable) {
  let isValid = true;
  if (input.required) {
    isValid = isValid && input.value.toString().trim().length !== 0;
  }
  if (input.minLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length >= input.minLength;
  }
  if (input.maxLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length <= input.maxLength;
  }
  if (input.min != null && typeof input.value === "number") {
    isValid = isValid && input.value >= input.min;
  }
  if (input.max != null && typeof input.value === "number") {
    isValid = isValid && input.value <= input.max;
  }
  return isValid;
}

// Decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

class BookList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  addedBooks: any[];

  constructor(private type: "to read" | "reading" | "finished") {
    this.templateElement = document.getElementById(
      "book-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.addedBooks = [];

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-books`;

    bookState.addListener((books: any[]) => {
      this.addedBooks = books;
      this.renderBooks();
    });

    this.renderContent();
    this.attach();
  }

  private renderBooks() {
    const bookElement = document.getElementById(`${this.type}-books-list`)!;
    for (const book of this.addedBooks) {
      const listItem = document.createElement("li");
      listItem.textContent = book.title;

      bookElement.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-books-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = this.type.toUpperCase();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

class BookInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  authorInputElement: HTMLInputElement;
  priorityInputElement: HTMLInputElement;
  titleErrorElement: HTMLElement;
  authorErrorElement: HTMLElement;
  priorityErrorElement: HTMLElement;

  constructor() {
    this.templateElement = document.getElementById(
      "book-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.authorInputElement = this.element.querySelector(
      "#author"
    ) as HTMLInputElement;
    this.priorityInputElement = this.element.querySelector(
      "#priority"
    ) as HTMLInputElement;

    this.titleErrorElement = this.element.querySelector(
      "#title-error"
    ) as HTMLElement;
    this.authorErrorElement = this.element.querySelector(
      "#author-error"
    ) as HTMLElement;
    this.priorityErrorElement = this.element.querySelector(
      "#priority-error"
    ) as HTMLElement;

    this.configure();
    this.attach();
  }

  private validateField(
    validatable: Validatable,
    errorElement: HTMLElement,
    errorText: string
  ): boolean {
    if (validate(validatable)) {
      if (errorElement.innerText === errorText) {
        errorElement.parentNode?.removeChild(errorElement);
      }
      return true;
    } else {
      if (errorElement?.innerText !== errorText) {
        errorElement.appendChild(document.createTextNode(errorText));
      }
      return false;
    }
  }

  // either returns a tuple or nothing
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value.trim();
    const enteredAuthor = this.authorInputElement.value.trim();
    const enteredPriority = this.priorityInputElement.value.trim();

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
      minLength: 1,
      maxLength: 100,
    };
    const authorValidatable: Validatable = {
      value: enteredAuthor,
      required: true,
      minLength: 1,
      maxLength: 100,
    };
    const priorityValidatable: Validatable = {
      value: enteredPriority,
      required: true,
      min: 1,
      max: 10,
    };

    const titleErrorText = "Please enter a title";
    const authorErrorText = "Please enter an author";
    const priorityErrorText =
      "Please enter a number between 1 (lowest) and 10 (highest)";

    let isValid = true;
    isValid = this.validateField(
      titleValidatable,
      this.titleErrorElement,
      titleErrorText
    );
    isValid = this.validateField(
      authorValidatable,
      this.authorErrorElement,
      authorErrorText
    );
    isValid = this.validateField(
      priorityValidatable,
      this.priorityErrorElement,
      priorityErrorText
    );

    if (isValid) return [enteredTitle, enteredAuthor, +enteredPriority];
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.authorInputElement.value = "";
    this.priorityInputElement.value = "";
  }

  private clearTitleError() {
    this.titleErrorElement.innerText = "";
  }
  private clearAuthorError() {
    this.authorErrorElement.innerText = "";
  }
  private clearPriorityError() {
    this.priorityErrorElement.innerText = "";
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, author, priority] = userInput;
      bookState.addBook(title, author, priority);
      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);

    this.titleInputElement.addEventListener("keypress", this.clearTitleError);
    this.authorInputElement.addEventListener("keypress", this.clearAuthorError);
    this.priorityInputElement.addEventListener(
      "keypress",
      this.clearPriorityError
    );

    this.titleInputElement.addEventListener("blur", () => this.clearTitleError);
    this.authorInputElement.addEventListener(
      "blur",
      () => this.clearAuthorError
    );
    this.priorityInputElement.addEventListener("blur", this.clearPriorityError);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const bookInput = new BookInput();
const toReadInput = new BookList("to read");
const readingInput = new BookList("reading");
const finishedInput = new BookList("finished");
