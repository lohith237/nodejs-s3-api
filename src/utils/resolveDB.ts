import { getMasterDB } from "../../config/ConnectDB";
import { getTenantDB } from "../../config/tenantDB";
import { Connection } from "mongoose";

const resolveDB = async (tenant_id: string): Promise<Connection> => {
    return tenant_id === "master" ? getMasterDB() : await getTenantDB(tenant_id);
};

export { resolveDB };