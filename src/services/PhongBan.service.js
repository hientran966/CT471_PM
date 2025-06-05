import createApiClient from "./api.service";

class DepartmentService {
    constructor(baseUrl = "/api/phongban") {
        this.api = createApiClient(baseUrl);
    }

    async createDepartment(data) {
        return (await this.api.post("/", data)).data;
    }

    async getDepartmentById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateDepartment(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteDepartment(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllDepartments() {
        return (await this.api.get("/")).data;
    }
    
}

export default new DepartmentService();
