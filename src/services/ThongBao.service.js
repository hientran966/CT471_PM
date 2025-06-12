import createApiClient from "./api.service";

class NotificationService {
    constructor(baseUrl = "/api/thongbao") {
        this.api = createApiClient(baseUrl);
    }

    async createNotification(data) {
        return (await this.api.post("/", data)).data;
    }

    async getNotificationById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateNotification(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteNotification(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllNotifications() {
        return (await this.api.get("/")).data;
    }

    async getByTask(taskId) {
        return (await this.api.get(`/task/${taskId}`)).data;
    }

    async getByAccount(accountId) {
        return (await this.api.get(`/account/${accountId}`)).data;
    }

    async getByProject(projectId) {
        return (await this.api.get(`/project/${projectId}`)).data;
    }

    async getByAssignment(assignmentId) {
        return (await this.api.get(`/assignment/${assignmentId}`)).data;
    }

    async getByComment(commentId) {
        return (await this.api.get(`/comment/${commentId}`)).data;
    }

    async getByVersion(versionId) {
        return (await this.api.get(`/version/${versionId}`)).data;
    }
}

export default new NotificationService();
