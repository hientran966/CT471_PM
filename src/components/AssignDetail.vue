<template>
  <a-card style="width: 100%;" >
    <template #title>
      <strong>{{ assign.moTa }}</strong>
    </template>
    <template #extra>
      <a href="#">Xem</a>
    </template>
    <div style="display: flex; align-items: center; gap: 8px;">
      <template v-for="(user, idx) in participants" :key="idx">
        <a-avatar
        :src="user.avatar"
        :style="!user.avatar ? { backgroundColor: '#1890ff' } : undefined"
        >
        <template v-if="!user.avatar">{{ user.name?.charAt(0) || '?' }}</template>
        </a-avatar>
        <span
        v-if="idx < participants.length - 1"
        style="margin: 0 4px; font-size: 18px; color: #aaa;"
        >
        →
        </span>
      </template>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <p style="margin-bottom: 0;"><strong>Ngày nhận:</strong> {{ assign.ngayNhan ? dayjs(assign.ngayNhan).format("DD/MM/YYYY") : "" }}</p>
      <p v-if="assign.ngayHoanTat" style="margin-bottom: 0;"><strong>Ngày hoàn tất:</strong> {{ dayjs(assign.ngayHoanTat).format("DD/MM/YYYY") }}</p>
    </div>
    <p><strong>Trạng thái:</strong> {{ assign.trangThai }}</p>
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AccountService from "@/services/TaiKhoan.service";
import AssignService from "@/services/PhanCong.service";
import dayjs from "dayjs";

const props = defineProps<{
  assign: {
    id: string,
    moTa: string,
    trangThai: string,
    ngayNhan?: string,
    ngayHoanTat?: string,
    idNguoiNhan: string
  }
}>();



const participants = ref<{ name: string, avatar?: string }[]>([]);

onMounted(async () => {
  try {
    // Lấy toàn bộ lịch sử chuyển giao
    let currentId = props.assign.id;
    const assignmentIds = [currentId];
    const allTransfers = await AssignService.getFullTransferChain(props.assign.id);

    // Duyệt ngược qua các chuyển giao để lấy chuỗi phân công
    while (true) {
      // Tìm bản ghi chuyển giao có idSau = currentId
      const found = Array.isArray(allTransfers)
        ? allTransfers.find(item => item.idSau === currentId)
        : null;
      if (found && found.idTruoc) {
        assignmentIds.unshift(found.idTruoc); // Thêm vào đầu mảng
        currentId = found.idTruoc;
      } else {
        break;
      }
    }

    // Lấy thông tin người nhận của từng phân công
    const users = await Promise.all(
      assignmentIds.map(async (id) => {
        const assign = await AssignService.getAssignmentById(id);
        if (assign && assign.idNguoiNhan) {
          const user = await AccountService.getAccountById(assign.idNguoiNhan);
          return {
            name: user?.tenNV || "Không rõ",
            avatar: `/api/auth/avatar/${assign.idNguoiNhan}`
          };
        }
        return null;
      })
    );
    // Loại bỏ null và trùng lặp theo id avatar
    participants.value = users.filter(Boolean).filter(
      (v, i, a) => a.findIndex(t => t.avatar === v.avatar) === i
    );
  } catch (err) {
    participants.value = [];
  }
});
</script>