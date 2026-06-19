/** Gallery list views opened from the dashboard (distinct URLs per hub). */
export const dashboardWebsiteHub = "/dashboard/websites";
export const dashboardBotHub = "/dashboard/bots";
export const dashboardIntegrationHub = "/dashboard/integrations";

export function dashboardBotDetail(botId: string): string {
  return `/dashboard/bots/${encodeURIComponent(botId)}`;
}

export function chatbotTestingHref(botId: string, backHref: string): string {
  const params = new URLSearchParams({
    botId,
    back: backHref,
  });
  return `/chatbot-testing?${params.toString()}`;
}

/** Same entry paths as Innovate tiles — roots redirect to each builder’s create flow. */
export const innovateWebsiteEntry = "/website-builder";
export const innovateChatbotEntry = "/chatbot-builder";
export const innovateIntegrationEntry = "/integration-manager";
