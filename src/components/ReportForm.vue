<template>
  <div>
    <a-modal
      v-model:open="open"
      title="Báo cáo công việc"
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
        <a-form-item label="Mô tả" name="moTa">
          <a-input v-model:value="formState.moTa" />
        </a-form-item>

        <a-form-item name="slider" label="Tiến độ (%)">
          <a-slider v-model:value="formState.slider" :tooltipOpen="true" />
        </a-form-item>

        <a-form-item label="Đính kèm file" name="dragger">
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
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import dayjs, { Dayjs } from "dayjs";
import { reactive, ref, toRaw, onMounted, watch } from "vue";
import type { Rule } from "ant-design-vue/es/form";
import { message, Slider } from "ant-design-vue";
import { InboxOutlined } from '@ant-design/icons-vue';
import FileService from "@/services/File.service";
import AuthService from "@/services/TaiKhoan.service";
import AssignService from "@/services/PhanCong.service"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
const emit = defineEmits(["created"]);

const props = defineProps<{
  assign: {
    id: string;
    moTa: string;
    trangThai: string;
    ngayNhan?: string;
    ngayHoanTat?: string;
    idNguoiNhan: string;
    tienDoCaNhan: number;
  } | null;
  task?: string | null;
}>();

const formState = reactive({
  moTa: "",
  slider: 0,
  dragger: [],
});

const formRef = ref();
const open = ref<boolean>(false);

const rules: Record<string, Rule[]> = {
  moTa: [
    { required: true, message: "Xin nhập mô tả", trigger: "change" },
    { min: 3, max: 50, message: "Mô tả từ 3 đến 50 ký tự", trigger: "blur" },
  ],
  slider: [
    {
      validator: (_rule, value) => {
        if (!props.assign) return Promise.resolve();
        if (value < props.assign.tienDoCaNhan) {
          return Promise.reject("Tiến độ không hợp lệ");
        }
        return Promise.resolve();
      },
      trigger: "change",
    },
  ],
};

const resetForm = () => {
  formRef.value.resetFields();
  formState.slider = 0;
  formState.dragger = [];
};

const showModal = () => {
  open.value = true;
};

const handleBeforeUpload = (file) => {
  formState.dragger = [file];
  return false;
};

const handleOk = async () => {
  if (!props.assign || !props.assign.id) {
    message.error("Không có phân công hợp lệ để gửi báo cáo");
    return;
  }
  try {
    await formRef.value.validate();

    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      message.error("Không thể xác định người dùng hiện tại");
      return;
    }

    let fileId: string | null = null;

    if (formState.dragger.length > 0) {
      const file = formState.dragger[0];
      const userId = currentUser.id;
      const assignId = props.assign.id;

      fileId = await new Promise<string | null>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
          try {
            const base64 = reader.result?.toString().split(",")[1] || "";

            const filePayload = {
              tenFile: file.name,
              fileDataBase64: base64,
              idPhanCong: assignId,
              idCongViec: props.task || null,
              idNguoiTao: userId,
            };

            //Tạo file
            const res = await FileService.createFile(filePayload);

            const newFileId = res?.data?.id ?? res?.id;
            if (!newFileId) {
              throw new Error("Không nhận được id file từ server");
            }
            resolve(newFileId);
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = () => reject(new Error("Đọc file thất bại"));
        reader.readAsDataURL(file);
      });
    }

    await sendReport(fileId);
  } catch (error) {
    console.error(error);
    message.error("Gửi báo cáo thất bại");
  }
};

const sendReport = async (fileId: string | null) => {
  const currentUser = await AuthService.getCurrentUser();
  if (!currentUser || !currentUser.id) {
    message.error("Không thể xác định người dùng hiện tại");
    return;
  }

  const reportPayload = {
    moTa: formState.moTa,
    tienDoCaNhan: formState.slider,
    trangThai: formState.slider === 100 ? "Hoàn thành" : "Đang thực hiện",
    idNguoiGui: currentUser.id,
    idDinhKem: fileId,
  };

  await AssignService.report(props.assign!.id, reportPayload);
  message.success("Gửi báo cáo thành công");
  emit("created");
  open.value = false;
  resetForm();
};


watch(() => props.assign, (val) => {
  if (val) {
    formState.moTa = "";
    formState.slider = val.tienDoCaNhan || 0;
    formState.dragger = [];
  }
});

defineExpose({ showModal });
</script>
