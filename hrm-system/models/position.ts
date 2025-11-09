import { Grade } from "./enums";

export interface Position {
  id: string;
  name: string;
  grade: Grade;
  description?: string | null;
}

