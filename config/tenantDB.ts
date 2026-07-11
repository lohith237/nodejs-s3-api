import mongoose, { Connection } from "mongoose";
const tenantConnections: Record<string, Connection> = {};
const getTenantDB = async (tenant_id: string): Promise<Connection> => {
    try {
        if (tenantConnections[tenant_id]) {
            return tenantConnections[tenant_id];
        }

        const uri = `${process.env.MONGO_TENANT_BASE_URI}/${tenant_id}`;
        const connection = mongoose.createConnection(uri);

        connection.on("connected", () => {
            console.log(`Tenant DB Connected: ${tenant_id}`);
        });

        connection.on("error", (error) => {
            console.log(`Tenant DB Error (${tenant_id}):`, error);
        });

        tenantConnections[tenant_id] = connection;

        return connection;
    } catch (error) {
        console.log(`Failed to connect tenant DB (${tenant_id}):`, error);
        throw error;
    }
};

export { getTenantDB };