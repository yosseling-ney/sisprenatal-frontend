import http from "../lib/http";

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error: string | null;
}

export interface GoogleStatus {
  connected: boolean;
  email?: string | null;
  expires_at?: string | null;
}

const ROUTE = `integrations/google`;

const handleResponse = <T,>(response: ApiResponse<T>) => {
  if (!response.ok) {
    throw new Error(response.error ?? "Error desconocido");
  }
  return response.data;
};

export const getGoogleStatus = async (): Promise<GoogleStatus> => {
  const { data } = await http.get<ApiResponse<GoogleStatus>>(`${ROUTE}/status`);
  return handleResponse(data);
};

export const startGoogleOAuth = async (redirect_uri?: string) => {
  const { data } = await http.post<ApiResponse<{ auth_url: string }>>(
    `${ROUTE}/oauth/start`,
    redirect_uri ? { redirect_uri } : {}
  );
  return handleResponse(data);
};

export const disconnectGoogle = async () => {
  const { data } = await http.delete<ApiResponse<{ disconnected: boolean }>>(`${ROUTE}/connect`);
  return handleResponse(data);
};

export interface GoogleCalendarItem {
  id: string;
  summary: string;
}

export const listCalendars = async (): Promise<{ items: GoogleCalendarItem[] }> => {
  const { data } = await http.get<ApiResponse<{ items: any[] }>>(`${ROUTE}/calendars`);
  const payload = handleResponse(data);
  const items = (payload.items || []).map((it: any) => ({ id: it.id, summary: it.summary })) as GoogleCalendarItem[];
  return { items };
};

export const getDefaultCalendar = async (): Promise<{ calendar_id: string | null }> => {
  const { data } = await http.get<ApiResponse<{ calendar_id: string | null }>>(`${ROUTE}/calendar`);
  return handleResponse(data);
};

export const setDefaultCalendar = async (calendar_id: string) => {
  const { data } = await http.post<ApiResponse<{ calendar_id: string }>>(`${ROUTE}/calendar`, { calendar_id });
  return handleResponse(data);
};

export interface ImportParams {
  calendar_id?: string;
  start?: string; // ISO
  end?: string;   // ISO
  updatedMin?: string; // ISO
  create_missing?: boolean;
}

export const importFromGoogle = async (params: ImportParams) => {
  const { data } = await http.post<ApiResponse<{ inserted: number; updated: number; skipped: number }>>(
    `${ROUTE}/import`,
    params
  );
  return handleResponse(data);
};
