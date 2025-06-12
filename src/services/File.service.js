import createApiClient from "./api.service";

class FileService {
    constructor(baseUrl = "/api/file") {
        this.api = createApiClient(baseUrl);
    }

    async createFile(data) {
        return (await this.api.post("/", data)).data;
    }

    async getFileById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateFile(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteFile(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllFiles() {
        return (await this.api.get("/")).data;
    }

    async getFilesByTask(taskId) {
        return (await this.api.get(`/?task=${taskId}`)).data;
    }

    async getAllVersions(fileId) {
        return (await this.api.get(`/${fileId}/version`)).data;
    }

    async getVersion(fileId, versionId) {
        return (await this.api.get(`/${fileId}/version/${versionId}`)).data;
    }

    async addVersion(fileId, data) {
        return (await this.api.post(`/${fileId}/version`, data)).data;
    }

    async approveVersion(fileId, versionId) {
        return (await this.api.put(`/${fileId}/version/${versionId}/approve`)).data;
    }
}

export default new FileService();
