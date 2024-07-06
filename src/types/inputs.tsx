export interface Dropdown {
  label: string;
  panel: string;
}

export interface ButtonData {
  label: string;
  panel: string;
  multi: boolean;
  dropdowns: Dropdown[];
}
