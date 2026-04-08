export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
}

export interface PaginationData<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  can_review: boolean;
}
