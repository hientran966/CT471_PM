import createApiClient from "./api.service";

class CalendarService {
    constructor(baseUrl = "/api/lich") {
        this.api = createApiClient(baseUrl);
    }

    async createCalendar(data) {
        return (await this.api.post("/", data)).data;
    }

    async getCalendarById(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateCalendar(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async deleteCalendar(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    async getAllCalendars() {
        return (await this.api.get("/")).data;
    }
    
    async getNgayBuById(id) {
        return (await this.api.get(`/ngaybu/${id}`)).data;
    }
}

export default new CalendarService();
