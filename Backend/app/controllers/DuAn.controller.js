const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const ProjectService = require("../services/DuAn.service");

//Tạo dự án
exports.create = async (req, res, next) => {
    if (!req.body.tenDA) {
        return next(new ApiError(400, "Name can not be empty"));
    }

    try {
        const projectService = new ProjectService(MongoDB.client);
        const document = await projectService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "An error occurred while creating the project")
        );
    }
}

//Lấy tất cả dự án
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const projectService = new ProjectService(MongoDB.client);
        const { tenDA } = req.query;
        if (tenDA) {
            documents = await projectService.findByName(tenDA);
        } else {
            documents = await projectService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "An error occurred while retrieving the projects")
        );
    }

    return res.send(documents);
};

//Lấy dự án theo id
exports.findOne = async (req, res, next) => {
    try {
        const projectService = new ProjectService(MongoDB.client);
        const document = await projectService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Project not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving project with id=${req.params.id}`
            )
        );
    }
};

//Cập nhật dự án
exports.update = async (req, res, next) => {
    if (!req.body) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const projectService = new ProjectService(MongoDB.client);
        const document = await projectService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Project not found"));
        }
        return res.send({ message: "Project was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error updating project with id=${req.params.id}`
            )
        );
    }
};

//Xóa dự án
exports.delete = async (req, res, next) => {
    try {
        const projectService = new ProjectService(MongoDB.client);
        const document = await projectService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Project not found"));
        }
        return res.send({ message: "Project was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete project with id=${req.params.id}`
            )
        );
    }
};

//Xóa tất cả dự án
exports.deleteAll = async (_req, res, next) => {
    try {
        const projectService = new ProjectService(MongoDB.client);
        const deletedCount = await projectService.deleteAll();
        return res.send({
            message: `${deletedCount} projects were deleted successfully`
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all projects")
        );
    }
};