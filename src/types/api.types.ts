export type Identifier = string;

export type GeneratedWebsite = {
  id: Identifier;
  name: string;
  previewUrl?: string;
  status: "draft" | "published";
};

export type Chatbot = {
  id: Identifier;
  name: string;
  status: "training" | "active";
};

export type Integration = {
  id: Identifier;
  websiteId: Identifier;
  chatbotId: Identifier;
  status: "pending" | "connected";
};
