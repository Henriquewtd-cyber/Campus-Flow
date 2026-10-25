// src/lib/eventos-api.ts
// Cliente HTTP compartilhado entre o Admin e a página pública de Notícias.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Espelha o model `Event` do backend (pydantic), sem o `id`.
export type EventPayload = {
    dataInicio: string;
    dataFim: string | null;
    destaque: boolean;
    fonte: string;
    horaFim: string | null;
    horaInicio: string | null;
    link: string | null;
    local: string | null;
    subtitulo: string | null;
    textoTicker: string | null;
    ticker: boolean;
    tipo: string;
    titulo: string;
    tags: string[];
    publicos: string[];
    areas: string[];
    categorias: string[];
};

// O GET devolve list[Event]; `id` é `int | None` no backend. Não é enviado no payload.
export type EventoApi = EventPayload & { id?: number | null };

export type EventResponse = { status: string; message: string };

// Pendente extraído de e-mail (GET /validate). `id` é o do pendente, não do evento.
export type PendenteApi = {
    id: number;
    dados_brutos: { evento: Record<string, unknown> | null; eventoEncontrado: boolean } | null;
    erros_validacao: string[];
    email_id: string | null;
};

export const getPendentes = () =>
    request<PendenteApi[]>("/validate", { cache: "no-store" }, true);

export const removePendente = (id: number) =>
    request<EventResponse>(`/n8n_remove_event?event_id=${id}`, { method: "DELETE" }, true);

// Filtros aceitos por /get_eventos (EventQueryParams). Datas no formato YYYY-MM-DD.
export type EventFilters = {
    dataInicio?: string;
    dataFim?: string;
    tags?: string[];
    publicos?: string[];
    areas?: string[];
    categorias?: string[];
};

export class ApiError extends Error { }

export const errorMessage = (e: unknown): string =>
    e instanceof Error ? e.message : "Erro inesperado.";

// FastAPI devolve {detail: "texto"} ou {detail: [{msg, loc, ...}]} (422).
function errorFromBody(data: unknown, status: number): string {
    const detail = (data as { detail?: unknown } | null)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        const msgs = detail
            .map(d => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg) : ""))
            .filter(Boolean);
        if (msgs.length) return msgs.join("; ");
    }
    return `Erro ${status} ao falar com o servidor.`;
}

// Rotas protegidas (get_current_user) usam o cookie de sessão, por isso `auth = true`
// envia `credentials: "include"`. O backend precisa de CORS com allow_credentials=True
// e origens explícitas (não pode ser "*"). O GET é público e não envia cookie.
async function request<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
    const headers: Record<string, string> = {};
    if (init.body) headers["Content-Type"] = "application/json";

    let res: Response;
    try {
        res = await fetch(`${API_URL}${path}`, {
            ...init,
            headers,
            ...(auth ? { credentials: "include" as const } : {}),
        });
    } catch {
        throw new ApiError("Não foi possível conectar ao servidor.");
    }

    const data: unknown = await res.json().catch(() => null);
    if (res.status === 401 || res.status === 403) {
        throw new ApiError("Sessão expirada ou sem permissão. Faça login novamente.");
    }
    if (!res.ok) throw new ApiError(errorFromBody(data, res.status));
    return data as T;
}

// Listas vão como parâmetro repetido: ?all_areas=MAC&all_areas=MAT
export function getEventos(filters: EventFilters = {}): Promise<EventoApi[]> {
    const qs = new URLSearchParams();
    if (filters.dataInicio) qs.set("data_inicio", filters.dataInicio);
    if (filters.dataFim) qs.set("data_fim", filters.dataFim);
    filters.tags?.forEach(v => qs.append("all_tags", v));
    filters.publicos?.forEach(v => qs.append("all_publicos", v));
    filters.areas?.forEach(v => qs.append("all_areas", v));
    filters.categorias?.forEach(v => qs.append("all_categorias", v));
    const q = qs.toString();
    return request<EventoApi[]>(`/get_eventos${q ? `?${q}` : ""}`, { cache: "no-store" });
}

// Não existe GET por id no backend: busca a lista e procura o evento.
export async function getEventoById(id: number): Promise<EventoApi | null> {
    const all = await getEventos();
    return all.find(e => e.id === id) ?? null;
}

export const addEvento = (payload: EventPayload) =>
    request<EventResponse>("/add_evento", { method: "POST", body: JSON.stringify(payload) }, true);

export const updateEvento = (id: number, payload: EventPayload) =>
    request<EventResponse>(`/update_evento/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, true);

export const deleteEvento = (id: number) =>
    request<EventResponse>(`/delete_evento/${id}`, { method: "DELETE" }, true);