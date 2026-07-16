export interface CMSClientOptions {
  baseUrl: string;
  siteId: string;
}

export interface RouteSyncPayload {
  slug: string;
  path: string;
  type?: "static" | "dynamic";
  title?: string;
}

export class CMSClient {
  constructor(options: CMSClientOptions);

  protected _request<T = any>(path: string, method?: string, body?: any): Promise<T>;

  // --- Page Management ---
  getPage(slug: string): Promise<any>;

  // --- Services ---
  getServices(): Promise<any>;

  // --- Blog / Posts ---
  getPosts(): Promise<any>;
  getPost(postId: string): Promise<any>;

  // --- Testimonials ---
  getTestimonials(): Promise<any>;

  // --- FAQs ---
  getFaqs(pageSlug?: string | null): Promise<any>;

  // --- Team Members ---
  getTeamMembers(): Promise<any>;

  // --- Legal Pages ---
  getLegalPage(type: string): Promise<any>;

  // --- Contact Details ---
  getContactDetails(): Promise<any>;

  // --- Website Settings ---
  getSettings(): Promise<any>;

  // --- Menus & Navigation ---
  getNavigation(menuType?: string): Promise<any>;

  // --- CTA Layout ---
  getCtaConfig(): Promise<any>;

  // --- Header / Footer Builder ---
  getHeaderLayout(): Promise<any>;
  getFooterLayout(): Promise<any>;

  // --- Forms & Leads ---
  submitContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    recaptchaToken?: string;
  }): Promise<any>;

  // --- Marketing CRM & Newsletters ---
  subscribeToNewsletter(data: {
    email: string;
    name?: string | null;
    metadata?: any | null;
    listIds?: string[];
  }): Promise<any>;

  // --- Newsletter & CRM Subscribers ---
  subscribeNewsletter(data: {
    email: string;
    name?: string;
    tags?: string;
    listIds?: string[];
  }): Promise<any>;
  unsubscribeNewsletter(email: string): Promise<any>;

  // --- Visitor Tracker ---
  pingVisitor(data: {
    visitorId: string;
    pageViewed: string;
    location?: string;
    deviceInfo?: string;
    trafficSource?: string;
    duration?: number;
  }): Promise<any>;

  // --- Compliance Consent ---
  recordConsent(data: {
    visitorId: string;
    consentType: string;
    accepted: boolean;
  }): Promise<any>;
  getComplianceConfig(): Promise<any>;

  // --- Ad Management ---
  getAds(zoneSlug: string): Promise<any>;
  trackAdEvent(adId: string, type: "impression" | "click"): Promise<any>;

  // --- SEO Metadata ---
  getSeoMetadata(pageSlug: string): Promise<any>;


  // --- Centralized Global Settings & Unified Layouts ---
  getGlobalSettings(): Promise<any>;

  // --- Dynamic XML Sitemap ---
  getSitemap(): Promise<any>;

  // --- Next.js Sync Manifest ---
  syncRoutes(routes: RouteSyncPayload[], integrationKey: string): Promise<any>;

  // --- Robots.txt configuration ---
  getRobotsTxt(): Promise<string>;

  // --- Advertisement Management ---
  getAds(): Promise<any>;
  trackAd(adId: string, action: "impression" | "click"): Promise<any>;
}
export default CMSClient;
