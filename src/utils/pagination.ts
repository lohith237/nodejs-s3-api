import { Model, PopulateOptions, SortOrder } from "mongoose";
import { PaginateOptions,PaginateResult } from "../types";

function buildSearchQuery(search: string, fields: string[]): Record<string, any> | null {
    if (!search) return null;
    const regex = { $regex: search, $options: "i" };
    return {
        $or: fields.map((field) => ({ [field]: regex })),
    };
}
async function paginateAndSearch<T>(
    model: Model<T>,
    {
        page = 1,
        pageSize = 10,
        search = "",
        searchFields = [],
        filter = {},
        sort = { _id: -1 },
        baseUrl = "",
        originalQuery = {},
        populate = [],
    }: PaginateOptions
): Promise<PaginateResult<T>> {
    const searchQuery = buildSearchQuery(search, searchFields);
    const finalQuery = searchQuery ? { ...filter, ...searchQuery } : filter;
    let query = model
        .find(finalQuery)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort(sort);
    if (populate && populate.length > 0) {
        populate.forEach((p) => {
            query = query.populate(p) as typeof query;
            if (p.match && Object.keys(p.match).length > 0) {
                query = query.where(p.path).ne(null) as typeof query;
            }
        });
    }
    const [total, results] = await Promise.all([
        model.countDocuments(finalQuery),
        query.exec(),
    ]);
    const totalPages = Math.ceil(total / pageSize);

    function buildUrl(pageNum: number): string {
        const stringified: Record<string, string> = Object.fromEntries(
            Object.entries(originalQuery).map(([k, v]) => [k, String(v)])
        );
        const queryParams: Record<string, string> = {
            ...stringified,
            page: String(pageNum),
            page_size: String(pageSize),
        };

        const queryString = new URLSearchParams(queryParams).toString();
        return `${baseUrl}?${queryString}`;
    }

    const next = page < totalPages ? buildUrl(page + 1) : null;
    const previous = page > 1 ? buildUrl(page - 1) : null;

    return {
        total,
        totalPages,
        page,
        pageSize,
        next,
        previous,
        results: results as T[],
    };
}

export { paginateAndSearch, buildSearchQuery };