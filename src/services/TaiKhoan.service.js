import createApiClient from "./api.service";

class AuthService {
    constructor(baseUrl = "/api/auth") {
        this.api = createApiClient(baseUrl);
    }

    async login(email, Password) {
        return (await this.api.post("/login", { email, Password })).data;
    }

    async createAccount(data) {
        return (await this.api.post("/", data)).data;
    }

    async getAccountById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateAccount(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteAccount(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllAccounts() {
        return (await this.api.get("/")).data;
    }

    async logout() {
        return (await this.api.post("/logout")).data;
    }

    async getCurrentUser() {
        return JSON.parse(localStorage.getItem("user"));
    }
    
    async getDeactive() {
        return (await this.api.get("/deactive")).data;
    }

    async recover(id) {
        return (await this.api.put(`/deactive/${id}`)).data;
    }

    async getDepartmentAccounts(id) {
        return (await this.api.get(`/department/${id}`)).data;
    }

    async changePassword(id, oldPassword, newPassword) {
        return (await this.api.put(`/${id}/password`, { oldPassword, newPassword })).data;
    }

    async getAssignNumber(id) {
        return (await this.api.get(`/${id}/assign`)).data;
    }

    async getRole(id) {
        return (await this.api.get(`/${id}/role`)).data;
    }

    async getUserDepartment(id) {
        return (await this.api.get(`/${id}/department`)).data;
    }
}

export default new AuthService();
