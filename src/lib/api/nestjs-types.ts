/** Shapes returned by the NestJS API (http://localhost:3000). */

export type NexaRole = "USER" | "ADMIN";

export type NexaUser = {
  id: string;
  email: string;
  role: NexaRole;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type NexaBot = {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NexaWebsite = {
  id: string;
  name: string;
  domain?: string | null;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NexaAuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: NexaUser;
};
