import { serviceRepository } from "@/repositories/service.repository";
import { BaseService } from "@/core/service";

function formatServiceFromDb(service) {
  if (!service) return service;
  
  let faqs = [];
  let includes = [];
  
  if (service.faqs) {
    try {
      const parsed = typeof service.faqs === 'string' ? JSON.parse(service.faqs) : service.faqs;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        faqs = parsed.faqs || [];
        includes = parsed.includes || [];
      } else if (Array.isArray(parsed)) {
        faqs = parsed;
      }
    } catch (e) {
      console.error("Failed to parse faqs JSON:", e);
    }
  }

  return {
    ...service,
    faqs,
    includes
  };
}

function formatServiceToDb(data) {
  const { faqs = [], includes = [], featuredImageId, siteId, ...rest } = data;
  
  // Package both faqs and includes into the faqs JSON column
  const dbFaqs = {
    faqs,
    includes
  };

  const payload = {
    ...rest,
    faqs: dbFaqs
  };

  // Convert featuredImageId to Prisma relation format to bypass client cache out-of-sync issues
  if (featuredImageId !== undefined) {
    if (featuredImageId) {
      payload.featuredImage = { connect: { id: featuredImageId } };
    } else {
      payload.featuredImage = { disconnect: true };
    }
  }

  return payload;
}

export class ServiceService extends BaseService {
  constructor() {
    super(serviceRepository);
  }

  async getServices(siteId) {
    const list = await this.getList(siteId, {
      orderBy: { sortOrder: "asc" },
      include: { featuredImage: true },
    });
    return list.map(formatServiceFromDb);
  }

  async getById(siteId, id, options = {}) {
    const record = await super.getById(siteId, id, options);
    return formatServiceFromDb(record);
  }

  async create(siteId, data, userId = null, options = {}) {
    const dbPayload = formatServiceToDb(data);
    const created = await super.create(siteId, dbPayload, userId, options);
    return formatServiceFromDb(created);
  }

  async update(siteId, id, data, userId = null, options = {}) {
    const dbPayload = formatServiceToDb(data);
    const updated = await super.update(siteId, id, dbPayload, userId, options);
    return formatServiceFromDb(updated);
  }
}

export const serviceService = new ServiceService();
