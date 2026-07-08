import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "@/constants";
import { CreateResponse, GetOneResponse, ListResponse } from "@/types";
import { HttpError, DataProvider } from "@refinedev/core";

if (!BACKEND_BASE_URL)
    throw new Error("BACKEND_BASE_URL is required");

const buildHttpError = async (response: Response): Promise<HttpError> => {
    let message = 'Request failed.';

    try {
        const payload = (await response.json()) as { message?: string, error?: string }

        if (payload?.message) message = payload.message;
        if (payload?.error) message = payload.error;
    } catch {
        // Ignore errors
    }

    return {
        message,
        statusCode: response.status
    }
}

const options: CreateDataProviderOptions = {
    getList: {
        getEndpoint: ({ resource }) => resource,

        buildQueryParams: async ({ resource, pagination, filters }) => {
            const page = pagination?.currentPage ?? 1;
            const pageSize = pagination?.pageSize ?? 10;

            const params: Record<string, string | number> = { page, limit: pageSize };

            filters?.forEach((filter) => {
                const field = 'field' in filter ? filter.field : '';
                const value = String(filter.value);

                if (resource === 'subjects') {
                    if (field === 'department') params.department = value;
                    if (field === 'name' || field === 'code') params.search = value;
                }
                if (resource === 'departments') {
                    if (field === 'name' || field === 'q') params.search = value;
                }
                if (resource === 'classes') {
                    if (field === 'name') params.search = value;
                    if (field === 'subject') params.subject = value;
                    if (field === 'subjectId') params.subjectId = value;
                    if (field === 'teacher') params.teacher = value;
                }
                if (resource === 'users') {
                    if (field === 'role') params.role = value;
                    if (field === 'name' || field === 'email') params.search = value;
                }
                if (resource === 'enrollments') {
                    if (field === 'classId') params.classId = value;
                    if (field === 'studentId') params.studentId = value;
                }
            });

            return params;
        },

        mapResponse: async (response) => {
            if (!response.ok) throw await buildHttpError(response);
            const payload: ListResponse = await response.clone().json();

            return payload.data ?? [];
        },

        getTotalCount: async (response) => {
            if (!response.ok) throw await buildHttpError(response);
            const payload: ListResponse = await response.clone().json();

            return payload.pagination?.total ?? payload.data?.length ?? 0;
        }
    },
    create: {
        getEndpoint: ({ resource }) => resource,

        buildBodyParams: async ({ variables }) => variables,

        mapResponse: async (response) => {
            if (!response.ok) throw await buildHttpError(response);
            const json: CreateResponse = await response.json();

            return json.data ?? [];
        }
    },
    getOne: {
        getEndpoint: ({ resource, id }) => `${resource}/${id}`,
        mapResponse: async (response) => {
            if (!response.ok) throw await buildHttpError(response);
            const json: GetOneResponse = await response.json();

            return json.data ?? undefined;
        }
    },
    update: {
        getEndpoint: ({ resource, id }) => `${resource}/${id}`,
        buildBodyParams: async ({ variables }) => variables,
        mapResponse: async (response) => {
            if (!response.ok) throw await buildHttpError(response);
            const json = await response.json() as { data?: unknown };
            return json.data ?? [];
        }
    },
    deleteOne: {
        getEndpoint: ({ resource, id }) => `${resource}/${id}`,
        mapResponse: async (response) => {
            if (!response.ok) throw await buildHttpError(response);
            const json = await response.json() as { data?: unknown };
            return json.data ?? [];
        }
    }

}





const baseDataProvider = createDataProvider(BACKEND_BASE_URL, options, { credentials: 'include' });

const dataProvider: DataProvider = {
    ...baseDataProvider.dataProvider,
    getList: async ({ resource, pagination, filters }) => {
        const page = (pagination as any)?.current ?? (pagination as any)?.currentPage ?? 1;
        const pageSize = (pagination as any)?.pageSize ?? 10;
        
        // Remove trailing slash from base URL and leading slash from resource to prevent double slashes
        const baseUrl = BACKEND_BASE_URL.replace(/\/$/, '');
        const cleanResource = resource.replace(/^\//, '');
        const url = new URL(`${baseUrl}/${cleanResource}`);
        
        url.searchParams.append("page", String(page));
        url.searchParams.append("limit", String(pageSize));

        filters?.forEach((filter) => {
            const field = 'field' in filter ? filter.field : '';
            const value = String(filter.value);

            if (resource === 'subjects') {
                if (field === 'department') url.searchParams.append("department", value);
                if (field === 'name' || field === 'code') url.searchParams.append("search", value);
            }
            if (resource === 'departments') {
                if (field === 'name' || field === 'q') url.searchParams.append("search", value);
            }
            if (resource === 'classes') {
                if (field === 'name') url.searchParams.append("search", value);
                if (field === 'subject') url.searchParams.append("subject", value);
                if (field === 'subjectId') url.searchParams.append("subjectId", value);
                if (field === 'teacher') url.searchParams.append("teacher", value);
            }
            if (resource === 'users') {
                if (field === 'role') url.searchParams.append("role", value);
                if (field === 'name' || field === 'email') url.searchParams.append("search", value);
            }
            if (resource === 'enrollments') {
                if (field === 'classId') url.searchParams.append("classId", value);
                if (field === 'studentId') url.searchParams.append("studentId", value);
            }
        });

        // Refine provides custom fetch client, but we will just use fetch with credentials
        const response = await fetch(url.toString(), {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw await buildHttpError(response);
        }

        const payload: ListResponse = await response.json();

        return {
            data: (payload.data ?? []) as any,
            total: (payload.pagination?.total ?? payload.data?.length ?? 0) as any
        } as any;
    }
};

export { dataProvider };