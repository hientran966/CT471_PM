import createApiClient from "./api.service";

class DeptRoleService {
    constructor(baseUrl = "/api/loaiphong") {
        this.api = createApiClient(baseUrl);
    }

    async createDeptRole(data) {
        return (await this.api.post("/", data)).data;
    }

    async getDeptRoleById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateDeptRole(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteDeptRole(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllDeptRoles() {
        return (await this.api.get("/")).data;
    }
    
}

export default new DeptRoleService();
