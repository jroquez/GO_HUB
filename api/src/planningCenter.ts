type PersonPreview = {
  id: string;
  firstName: string;
  lastName: string;
};

export type PlanningCenterPreview =
  | { configured: false }
  | { configured: true; ok: false; status: number }
  | { configured: true; ok: true; totalCount: number; people: PersonPreview[] };

export async function planningCenterPreview(): Promise<PlanningCenterPreview> {
  const appId = process.env.PLANNING_CENTER_APP_ID ?? "";
  const secret = process.env.PLANNING_CENTER_SECRET ?? "";
  const accessToken = process.env.PLANNING_CENTER_ACCESS_TOKEN ?? "";
  if (!accessToken && (!appId || !secret)) return { configured: false };

  const authorization = accessToken
    ? `Bearer ${accessToken}`
    : `Basic ${Buffer.from(`${appId}:${secret}`).toString("base64")}`;

  const response = await fetch(
    "https://api.planningcenteronline.com/people/v2/people?per_page=25&order=last_name",
    { headers: { Accept: "application/json", Authorization: authorization } },
  );
  if (!response.ok) return { configured: true, ok: false, status: response.status };

  const body = (await response.json()) as {
    meta?: { total_count?: number };
    data?: Array<{ id: string; attributes?: { first_name?: string; last_name?: string } }>;
  };

  return {
    configured: true,
    ok: true,
    totalCount: body.meta?.total_count ?? 0,
    people: (body.data ?? []).map((person) => ({
      id: person.id,
      firstName: person.attributes?.first_name ?? "",
      lastName: person.attributes?.last_name ?? "",
    })),
  };
}
