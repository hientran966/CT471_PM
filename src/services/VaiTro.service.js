import createApiClient from "./api.service";

class RoleService {
    constructor(baseUrl = "/api/vaitro") {
        this.api = createApiClient(baseUrl);
    }

    async createRole(data) {
        return (await this.api.post("/", data)).data;
    }

    async getRoleById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateRole(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteRole(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllRoles() {
        return (await this.api.get("/")).data;
    }
    
}

export default new RoleService();
