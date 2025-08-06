export interface FullNameProps {
  firstName: string;
  lastName: string;
}

export class FullName {
  private readonly firstName: string;
  private readonly lastName: string;

  constructor(props: FullNameProps) {
    this.validateFirstName(props.firstName);
    this.validateLastName(props.lastName);

    this.firstName = props.firstName.trim();
    this.lastName = props.lastName.trim();
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  equals(other: FullName): boolean {
    return (
      this.firstName === other.firstName && this.lastName === other.lastName
    );
  }

  private validateFirstName(firstName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name cannot be empty');
    }
    if (firstName.trim().length > 50) {
      throw new Error('First name cannot exceed 50 characters');
    }
  }

  private validateLastName(lastName: string): void {
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty');
    }
    if (lastName.trim().length > 50) {
      throw new Error('Last name cannot exceed 50 characters');
    }
  }
}
