const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

class AuthService {
    constructor(client) {
        this.Auth = client.db().collection("TaiKhoan");
    }

    //Hàm này dùng để lấy dữ liệu từ payload
    extractAuthData(payload) {
        const auth = {
            email: payload.email,
            vaiTro: payload.vaiTro ?? "NhanVien",
        };

        Object.keys(auth).forEach((key) => {
            if (auth[key] === undefined) delete auth[key];
        });

        return auth;
    }

    //Hàm này dùng để tạo tài khoản        
    async create(payload) {
        const existingAuth = await this.Auth.findOne({ email: payload.email });
        if (existingAuth) throw new Error("Tài khoản đã tồn tại");

        //Băm mật khẩu
        const hashedPassword = await bcrypt.hash(payload.Password, 10);
        const auth = {
            ...this.extractAuthData(payload),
            Password: hashedPassword,
        };

        //Thêm tài khoản vào cơ sở dữ liệu
        const result = await this.Auth.insertOne(auth);
        return { _id: result.insertedId, email: auth.email, vaiTro: auth.vaiTro };
    }

    //Hàm này dùng để tìm kiếm tài khoản
    async find(filter) {
        return await this.Auth.find(filter).toArray();
    }

    //Hàm này dùng để tìm kiếm tài khoản theo tên
    async findByName(email) {
        return await this.find({
            email: { $regex: new RegExp(email, "i") },
        });
    }

    //Hàm này dùng để tìm kiếm tài khoản theo id
    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        return await this.Auth.findOne({ _id: new ObjectId(id) });
    }

    //Hàm này dùng để cập nhật tài khoản
    async update(id, payload) {
        if (!ObjectId.isValid(id)) return null;

        const filter = { _id: new ObjectId(id) };
        const update = this.extractAuthData(payload);

        if (payload.Password) {
            update.Password = await bcrypt.hash(payload.Password, 10);
        }

        return await this.Auth.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
    }

    //Hàm này dùng để xóa tài khoản
    async delete(id) {
        if (!ObjectId.isValid(id)) return null;
        return await this.Auth.findOneAndDelete({ _id: new ObjectId(id) });
    }

    //Hàm này dùng để xóa tất cả tài khoản
    async deleteAll() {
        const result = await this.Auth.deleteMany({});
        return result.deletedCount;
    }

    //Hàm này dùng để so sánh mật khẩu
    async comparePassword(inputPassword, storedPassword) {
        return await bcrypt.compare(inputPassword, storedPassword);
    }

    //Hàm này dùng để đăng nhập
    async login(email, Password) {
        const auth = await this.Auth.findOne({ email });
        if (!auth || !(await this.comparePassword(Password, auth.Password))) {
            throw new Error("Invalid credentials");
        }

        return { _id: auth._id, email: auth.email, vaiTro: auth.vaiTro };
    }
}

module.exports = AuthService;
