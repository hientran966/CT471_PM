import createApiClient from "./api.service";

class AssignmentService {
    constructor(baseUrl = "/api/phancong") {
        this.api = createApiClient(baseUrl);
    }

    async createAssignment(data) {
        return (await this.api.post("/", data)).data;
    }

    async getAssignmentById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateAssignment(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteAssignment(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllAssignments() {
        return (await this.api.get("/")).data;
    }

    async getAssignmentsByTask(task) {
        return (await this.api.get(`/task/${task}`)).data;
    }

    async getFullTransferChain(id) {
        return (await this.api.get(`/${id}/chain`)).data;
    }
}

export default new AssignmentService();
