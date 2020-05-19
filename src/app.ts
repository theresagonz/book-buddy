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

class BookInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  authorInputElement: HTMLInputElement;
  priorityInputElement: HTMLInputElement;

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

    this.configure();
    this.attach();
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
      maxLength: 50,
    };
    const authorValidatable: Validatable = {
      value: enteredAuthor,
      required: true,
      minLength: 2,
      maxLength: 10,
    };
    const priorityValidatable: Validatable = {
      value: enteredPriority,
      required: true,
      min: 1,
      max: 10,
    };

    if (
      !validate(titleValidatable) ||
      !validate(authorValidatable) ||
      !validate(priorityValidatable)
    ) {
      const priorityEl = document.getElementById('error-message')!;
      const errorText = 'Invalid input. Please fill in all fields';
      if (priorityEl.innerText !== errorText) {
        priorityEl.appendChild(document.createTextNode(errorText));
      }
      return;
    } else {
      const element = document.getElementById('error-message')!;
      element.parentNode!.removeChild(element);
      return [enteredTitle, enteredAuthor, +enteredPriority];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.authorInputElement.value = "";
    this.priorityInputElement.value = "";
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, author, priority] = userInput;
      console.log("title, author, priority: ", title, author, priority);
      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const bookInput = new BookInput();
