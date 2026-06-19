"use client";

import type { WebsiteTemplate } from "../../lib/website-templates-types";
import styles from "./WebsiteTemplatePicker.module.css";

type WebsiteTemplatePickerProps = Readonly<{
  templates: WebsiteTemplate[];
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
  disabled?: boolean;
}>;

function formatPageName(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function templateSectionsSummary(template: WebsiteTemplate): string {
  return template.pages.map((page) => formatPageName(page.name)).join(" · ");
}

export function WebsiteTemplatePicker({
  templates,
  selectedTemplateId,
  onSelect,
  disabled = false,
}: WebsiteTemplatePickerProps) {
  if (!templates.length) {
    return null;
  }

  return (
    <div className={styles.wrap} role="radiogroup" aria-label="Website type">
      <div className={styles.grid}>
        {templates.map((template) => {
          const id = template.templateId;
          const active = selectedTemplateId === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${styles.card} ${active ? styles.cardActive : ""}`}
              onClick={() => onSelect(id)}
              disabled={disabled}
            >
              <span className={styles.label}>{template.templateName}</span>
              <span className={styles.desc}>{templateSectionsSummary(template)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
