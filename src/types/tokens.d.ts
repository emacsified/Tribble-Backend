export interface RequestToken {
  tokenType: "jwt";
  userId: string;
  role: string;
}

export interface RefreshToken {
  tokenType: "refresh";
  userId: string;
  role: string;
}
