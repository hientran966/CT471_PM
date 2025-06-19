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
import { InboxOutlined } from '@ant-design/icons-vue';
import { message } from "ant-design-vue";
import FileService from "@/services/File.service";
import AuthService from "@/services/TaiKhoan.service";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
const emit = defineEmits(["created"]);

const props = defineProps<{
  taskId?: string;
  fileId?: string;
  projectId?: string;
}>();

const formState = reactive({
  dragger: [],
});

const formRef = ref();
const open = ref<boolean>(false);
const currentFileId = ref(null);

const showModal = (fileId = null) => {
  currentFileId.value = props.fileId || fileId;
  open.value = true;
};

const resetForm = () => {
  formRef.value.resetFields();
};

const handleBeforeUpload = (file) => {
  formState.dragger = [file];
  return false;
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
        fileDataBase64: base64 ?? null,
        idCongViec: props.fileId ? null : props.taskId ?? null,
        idDuAn: props.fileId ? null : props.projectId ?? null,
        idNguoiTao: currentUser?.id ?? null,
      };

      if (currentFileId.value) {
        await FileService.addVersion(currentFileId.value, payload);
        message.success("Tải phiên bản mới thành công");
      } else {
        await FileService.createFile(payload);
        message.success("Tải file thành công");
      }

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

watch(open, (val) => {
  if (!val) {
    formState.dragger = [];
    resetForm();
  }
});

defineExpose({ showModal });
</script>
