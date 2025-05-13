const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

class ProjectService {
    constructor(client) {
        this.Project = client.db().collection("DuAn");
    }

    //Hàm này dùng để lấy dữ liệu từ payload
    extractProjectData(payload) {
        const project = {
            tenDA: payload.tenDA,
            soNgay: payload.soNgay,
            ngayBD: payload.ngayBD,
            ngayKT: payload.ngayKT,
            trangThai: payload.trangThai,
        };

        Object.keys(project).forEach((key) => {
            if (project[key] === undefined) delete project[key];
        });

        return project;
    }

    //Hàm này dùng để tạo dự án
    async create(payload) {
        const existingProject = await this.Project.findOne({ tenDA: payload.tenDA });
        if (existingProject) throw new Error("Dự án đã tồn tại");

        // Tạo đối tượng dự án
        const project = {
            _id: payload.id ?? new ObjectId(), // Tự tạo ObjectId nếu không có id trong payload
            ...this.extractProjectData(payload),
        };

        // Thêm dự án vào cơ sở dữ liệu
        const result = await this.Project.insertOne(project);
        return { _id: project._id, tenDA: project.tenDA };
    }

    //Hàm này dùng để tìm kiếm dự án
    async find(filter) {
        return await this.Project.find(filter).toArray();
    }

    //Hàm này dùng để tìm kiếm dự án theo tên
    async findByName(tenDA) {
        return await this.find({
            tenDA: { $regex: new RegExp(tenDA, "i") },
        });
    }

    //Hàm này dùng để tìm kiếm dự án theo id
    async findById(id) {
        return await this.Project.findOne({ _id: ObjectId(id) });
    }

    //Hàm này dùng để cập nhật dự án
    async update(id, payload) {
        const project = await this.findById(id);
        if (!project) throw new Error("Dự án không tồn tại");

        const updatedProject = {
            ...project,
            ...this.extractProjectData(payload),
        };

        const result = await this.Project.updateOne(
            { _id: ObjectId(id) },
            { $set: updatedProject }
        );

        return { _id: id, ...updatedProject };
    }

    //Hàm này dùng để xóa dự án
    async delete(id) {
        const result = await this.Project.deleteOne({ _id: ObjectId(id) });
        return result.deletedCount === 1;
    }

    //Hàm này dùng để xóa tất cả dự án
    async deleteAll() {
        const result = await this.Project.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ProjectService;