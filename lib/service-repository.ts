import { services as fallbackServices, type Service } from "@/lib/data";
import { query } from "@/lib/db";
import type { DbService } from "@/lib/db-types";

function mapDbService(service: DbService): Service {
  return {
    slug: service.slug,
    name: service.name,
    dauerMinuten: service.duration_minutes,
    preisEuro: Number(service.price_eur),
    beschreibung: service.description
  };
}

export async function getServicesFromDatabase() {
  const result = await query<DbService>(
    `
      select
        id,
        slug,
        name,
        description,
        duration_minutes,
        price_eur,
        is_bookable,
        is_active,
        sort_order,
        created_at,
        updated_at
      from public.services
      where is_active = true
      order by sort_order asc, name asc
    `
  );

  return result.rows.map(mapDbService);
}

export async function getServicesSafe() {
  try {
    return await getServicesFromDatabase();
  } catch {
    return fallbackServices;
  }
}

export async function getServiceBySlugSafe(slug: string) {
  const services = await getServicesSafe();
  return services.find((service) => service.slug === slug);
}
