<template>
  <a-modal
    v-model:open="open"
    title="Chi tiết tập tin"
    width="1000px"
    @cancel="open = false"
    :footer="null"
  >
    <div class="modal-container">
      <!-- Cột trái -->
      <div class="left-column">
        <!-- Lịch sử phiên bản -->
        <a-collapse accordion>
          <a-collapse-panel key="1" header="Lịch sử phiên bản">
            <a-list :data-source="versions" bordered size="small">
              <template #renderItem="{ item }">
                <a-list-item class="version-item">
                  <div>
                    <span class="version-title">Phiên bản {{ item.soPB }}</span>
                    <span class="version-date">({{ formatDate(item.ngayUpload) }})</span>
                  </div>
                  <div>
                    <a-button size="small" @click="selectVersion(item)">Xem</a-button>
                    <a
                      :href="`${backendUrl}/${item.duongDan}`"
                      target="_blank"
                      download
                      class="download-link"
                    >
                      Tải xuống
                    </a>
                  </div>
                </a-list-item>
              </template>
            </a-list>
            <a-button
              v-if="canUpdate"
              type="dashed"
              size="small"
              class="upload-button"
              @click="fileForm?.showModal()"
            >
              Tải lên phiên bản mới
            </a-button>
          </a-collapse-panel>
        </a-collapse>

        <!-- Preview -->
        <div class="preview-container">
          <template v-if="fileSrc && isImage">
            <img :src="fileSrc" alt="preview" class="preview-image" />
          </template>
          <template v-else-if="fileSrc && isPDF">
            <iframe :src="fileSrc" width="100%" height="100%" />
          </template>
          <template v-else>
            <div class="preview-empty">
              <p>Không hỗ trợ xem trước định dạng này.</p>
              <a
                v-if="fileSrc"
                :href="fileSrc"
                target="_blank"
                download
                class="download-link"
              >
                Tải xuống tập tin
              </a>
              <p v-else>Không có dữ liệu để xem trước.</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Cột phải -->
      <div class="right-column">
        <div v-if="canReview">
          <a-textarea
            v-model:value="reviewText"
            rows="5"
            :disabled="isApproved"
            placeholder="Nhận xét file..."
          />
          <div class="button-group">
            <a-button type="primary" @click="submitReview" :disabled="isApproved">Gửi đánh giá</a-button>
            <a-button @click="approveFile" :disabled="isApproved">Duyệt file</a-button>
            <a-tag v-if="isApproved" color="green" class="approved-tag">Đã duyệt</a-tag>
          </div>
        </div>
        <br>

        <!-- Danh sách đánh giá -->
        <a-collapse accordion>
          <a-collapse-panel key="2" header="Đánh giá">
            <a-list :data-source="reviews" bordered size="small">
              <template #renderItem="{ item }">
                <a-list-item>
                  <div>
                    <strong>{{ reviewUsers[item.idNguoiDang] || 'Người dùng' }}</strong>:
                    <span class="text-gray-700">{{ item.noiDung }}</span>
                    <div class="text-xs text-gray-400">{{ formatDate(item.ngayDang) }}</div>
                  </div>
                </a-list-item>
              </template>
            </a-list>

            <div v-if="reviews.length === 0"
                class="text-center text-gray-500 mt-2">
              Chưa có đánh giá nào.
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>
  </a-modal>
  <FileForm  v-if="file" ref="fileForm" @created="handleCreated" :fileId="file.id"/>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import FileService from "@/services/File.service";
import AccountService from "@/services/TaiKhoan.service";
import NotificationService from "@/services/ThongBao.service";
import FileForm from "@/components/FileForm.vue";
import dayjs from "dayjs";

// Props & Emits
const props = defineProps({
  file: Object,
  taskCreatorId: String,
});
const emit = defineEmits(["submitted", "approved", "updated"]);

// State
const open = ref(false);
const fileSrc = ref("");
const reviewText = ref("");
const versions = ref([]);
const user = ref({});
const reviews = ref([]);
const reviewUsers = ref({});
const fileForm = ref();

AccountService.getCurrentUser().then((data) => {
  user.value = data;
});

const backendUrl = "http://localhost:3000";

// File extension và loại
const ext = computed(() => props.file?.tenFile?.split(".").pop()?.toLowerCase() || "");
const isImage = computed(() => ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext.value));
const isPDF = computed(() => ext.value === "pdf");

const canReview = computed(() => props.file && user.value.id === props.taskCreatorId);
const canUpdate = computed(() => props.file && user.value.id === props.file.idNguoiTao);

const selectedVersion = computed(() =>
  versions.value.find(v => `${backendUrl}/${v.duongDan}` === fileSrc.value)
);

const isApproved = computed(() => selectedVersion.value?.trangThai === "Đã duyệt");

// Theo dõi file props để hiển thị modal và load dữ liệu
watch(
  () => props.file,
  async (file) => {
    if (!file) return;
    open.value = true;
    reviewText.value = "";
    versions.value = [];

    try {
      const result = await FileService.getAllVersions(file.id);
      versions.value = result;
      if (result.length) {
        const latest = result[result.length - 1];
        fileSrc.value = `${backendUrl}/${latest.duongDan}`;
        await loadReviews(latest.id); 
      }
    } catch {
      fileSrc.value = "";
      reviews.value = [];
    }
  },
  { immediate: true }
);

const loadReviews = async (idPhienBan) => {
  try {
    const res = await NotificationService.getByVersion(idPhienBan);
    const data = Array.isArray(res) ? res : res.data || [];
    reviews.value = data;

    const uniqueIds = [...new Set(data.map(r => r.idNguoiDang))];

    for (const id of uniqueIds) {
      if (!reviewUsers.value[id]) {
        try {
          const res = await AccountService.getAccountById(id);
          const userInfo = res?.data || res;
          reviewUsers.value[id] = userInfo?.tenNV || "Người dùng";
        } catch (err) {
          console.error(`Không thể tải thông tin người dùng với id=${id}`, err);
          reviewUsers.value[id] = "Người dùng";
        }
      }
    }
  } catch (err) {
    console.error("Lỗi tải đánh giá:", err);
    reviews.value = [];
  }
};

// Hành động
const submitReview = () => {
  const selected = versions.value.find(v => `${backendUrl}/${v.duongDan}` === fileSrc.value);
  if (selected) {
    emit("submitted", {
      idFile: selected.id,
      review: reviewText.value,
      idNguoiDang: user.value.id,
    });
  }
  open.value = false;
};

const approveFile = () => {
  const selected = versions.value.find(v => `${backendUrl}/${v.duongDan}` === fileSrc.value);
  if (selected) {
    emit("approved", { idFile: selected.id });
  }
  open.value = false;
};

const handleCreated = () => {
  emit("updated");
  open.value = false;
};

const selectVersion = (item) => {
  fileSrc.value = `${backendUrl}/${item.duongDan}`;
  loadReviews(item.id);
};

// Định dạng ngày
const formatDate = (dateStr) => {
  return dayjs(dateStr).format("DD/MM/YYYY HH:mm");
};

defineExpose({ showModal: () => (open.value = true) });
</script>

<style scoped>
.modal-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.left-column, .right-column {
  width: 50%;
  display: flex;
  flex-direction: column;
}

.preview-container {
  margin-top: 20px;
  height: 350px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-empty {
  text-align: center;
  color: #888;
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-title {
  font-weight: 500;
}

.version-date {
  margin-left: 8px;
  color: #888;
  font-size: 12px;
}

.download-link {
  margin-left: 8px;
  font-size: 12px;
  color: #1890ff;
  text-decoration: underline;
}

.upload-button {
  margin-top: 20px;
  margin-left: 16px;
}

.button-group {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.approved-tag {
  margin-left: 10px;
}

.review-list {
  margin-top: 20px;
}

</style>