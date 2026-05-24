export type WebsiteTemplatePage = {
  key: string;
  name: string;
};

export type WebsiteTemplate = {
  id: string;
  templateId: string;
  templateName: string;
  pages: WebsiteTemplatePage[];
  createdAt?: string;
};

export type WebsiteTemplatesPayload = {
  templates: WebsiteTemplate[];
};
