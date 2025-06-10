<template>
  <a-modal
    v-model:visible="visible"
    title="Chi tiết tập tin"
    width="900px"
    @cancel="visible = false"
    :footer="null"
  >
    <div class="flex gap-6">
      <div class="w-1/2 pr-2 border-r">
        <!-- Preview -->
        <div class="w-full h-96 flex items-center justify-center bg-white border rounded-lg mb-4">
          <template v-if="fileSrc && isImage">
            <img
              :src="fileSrc"
              alt="preview"
              class="max-w-full max-h-full object-contain"
              style="width: 100%; height: 100%;"
            />
          </template>
          <template v-else-if="fileSrc && isPDF">
            <iframe :src="fileSrc" width="100%" height="600px" />
          </template>
          <template v-else>
            <div class="text-gray-600 text-center">
              <p>Không hỗ trợ xem trước định dạng này.</p>
              <a
                v-if="fileSrc"
                :href="fileSrc"
                target="_blank"
                download
                class="text-blue-600 hover:underline"
              >
                Tải xuống tập tin
              </a>
              <p v-else>Không có dữ liệu để xem trước.</p>
            </div>
          </template>
        </div>

        <!-- Lịch sử phiên bản -->
        <div>
          <h3 class="font-semibold mb-2">Lịch sử phiên bản</h3>
          <a-list :data-source="versions" bordered size="small">
            <template #renderItem="{ item }">
              <a-list-item class="flex justify-between items-center">
                <div>
                  <span class="font-medium">Phiên bản {{ item.soPB }}</span>
                  <span class="text-gray-500 ml-2 text-sm">({{ formatDate(item.ngayUpload) }})</span>
                </div>
                <div>
                  <a-button size="small" @click="selectVersion(item)">Xem</a-button>
                  <a
                    :href="`${backendUrl}/${item.duongDan}`"
                    target="_blank"
                    download
                    class="ml-2 text-blue-500 hover:underline text-sm"
                  >Tải xuống</a>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
      <br>

      <!-- Đánh giá -->
      <div class="w-1/2 pr-2 border-r">
        <a-textarea v-model:value="reviewText" rows="5" placeholder="Nhận xét file..." />
        <a-space class="mt-4 flex gap-2">
          <a-button type="primary" @click="submitReview">Gửi đánh giá</a-button>
          <a-button @click="approveFile">Duyệt file</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import FileService from "@/services/File.service";
import dayjs from "dayjs";

// Props & Emits
const props = defineProps({
  file: Object,
});
const emit = defineEmits(["submitted", "approved"]);

// State
const visible = ref(false);
const fileSrc = ref("");
const reviewText = ref("");
const versions = ref([]);

const backendUrl = "http://localhost:3000";

// File extension và loại
const ext = computed(() => props.file?.tenFile?.split(".").pop()?.toLowerCase() || "");
const isImage = computed(() => ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext.value));
const isPDF = computed(() => ext.value === "pdf");

// Theo dõi file props để hiển thị modal và load dữ liệu
watch(
  () => props.file,
  async (file) => {
    if (!file) return;
    visible.value = true;
    reviewText.value = "";
    versions.value = [];

    try {
      const result = await FileService.getAllVersions(file.id);
      versions.value = result;
      if (result.length) {
        const latest = result[result.length - 1];
        fileSrc.value = `${backendUrl}/${latest.duongDan}`;
      }
    } catch {
      fileSrc.value = "";
    }
  },
  { immediate: true }
);

// Hành động
const submitReview = () => {
  emit("submitted", { idFile: props.file.id, review: reviewText.value });
  visible.value = false;
};

const approveFile = () => {
  emit("approved", { idFile: props.file.id });
  visible.value = false;
};

const selectVersion = (item) => {
  fileSrc.value = `${backendUrl}/${item.duongDan}`;
};

// Định dạng ngày
const formatDate = (dateStr) => {
  return dayjs(dateStr).format("DD/MM/YYYY HH:mm");
};

// Cho phép hiển thị modal từ ngoài
defineExpose({ showModal: () => (visible.value = true) });
</script>
