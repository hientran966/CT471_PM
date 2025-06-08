<template>
  <div>
    <a-modal
      v-model:open="open"
      title="Tải File Lên"
      ok-text="Lưu"
      cancel-text="Thoát"
      @ok="handleOk"
    >
      <a-form
        :model="formState"
        layout="vertical"
        @finish="handleOk"
        :rules="rules"
        ref="formRef"
      >
      <a-upload-dragger
        :beforeUpload="handleBeforeUpload"
        :fileList="formState.dragger"
        :showUploadList="{ showRemoveIcon: true }"
        :maxCount="1"
        :multiple="false"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">Chọn hoặc kéo một file để tải lên</p>
      </a-upload-dragger>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import dayjs, { Dayjs } from "dayjs";
import { reactive, ref, toRaw, onMounted, watch } from "vue";
import type { Rule } from "ant-design-vue/es/form";
import { message } from "ant-design-vue";
import FileService from "@/services/File.service";
import AuthService from "@/services/TaiKhoan.service";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
const emit = defineEmits(["created"]);

const props = defineProps<{ taskId?: string }>();

const formState = reactive({
  dragger: [],
});

const formRef = ref();
const accounts = ref<{ id: string; tenNV: string }[]>([]);
const deptLoading = ref(false);
const open = ref<boolean>(false);

const rules: Record<string, Rule[]> = {
  moTa: [
    { required: true, message: "Xin nhập mô tả", trigger: "change" },
    { min: 3, max: 50, message: "Mô tả từ 3 đến 50 ký tự", trigger: "blur" },
  ],
};

const resetForm = () => {
  formRef.value.resetFields();
};

const showModal = () => {
  open.value = true;
};

// Chặn upload tự động
const handleBeforeUpload = (file) => {
  formState.dragger = [file]; // chỉ giữ 1 file
  return false; // Ngăn upload tự động
};

const handleOk = async () => {
  if (formState.dragger.length === 0) {
    return message.warning("Vui lòng chọn file trước khi lưu");
  }

  try {
    const file = formState.dragger[0];
    const reader = new FileReader();
    const currentUser = await AuthService.getCurrentUser();

    reader.onload = async () => {
      const base64 = reader.result?.toString().split(",")[1];

      const payload = {
        tenFile: file.name,
        fileDataBase64: base64,
        idCongViec: props.taskId,
        idNguoiTao: currentUser.id,
      };

      await FileService.createFile(payload);

      message.success("Tải file thành công");
      emit("created");
      open.value = false;
      formState.dragger = [];
    };

    reader.readAsDataURL(file);
  } catch (error) {
    console.error(error);
    message.error("Tải file lên thất bại");
  }
};

defineExpose({ showModal });
</script>
